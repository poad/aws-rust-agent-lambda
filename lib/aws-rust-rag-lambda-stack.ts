import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { RustFunction } from 'cargo-lambda-cdk';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

export class AwsRustRagLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const functionName = 'aws-rust-rag-lambda-example';
    const logGroup = new logs.LogGroup(this, 'LambdaFunctionLogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_DAY,
    });

    const fn = new RustFunction(this, 'Rust function', {
      functionName,
      manifestPath: './lambda/',
      architecture: lambda.Architecture.ARM_64,
      environment: {
        RUST_BACKTRACE: '1',
      },
      timeout: cdk.Duration.minutes(1),
      role: new iam.Role(this, 'LambdaFunctionExecutionRole', {
        roleName: `${functionName}-execution-role`,
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaExecute'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('CloudFrontReadOnlyAccess'),
        ],
        inlinePolicies: {
          'bedrock-policy': new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'bedrock:InvokeModel*',
                  'logs:PutLogEvents',
                ],
                resources: ['*'],
              }),
            ],
          }),
        },
      }),
      logGroup,
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: lambda.ApplicationLogLevel.DEBUG,
    });

    new lambda.FunctionUrl(this, 'FunctionUrl', {
      function: fn,
      authType: lambda.FunctionUrlAuthType.NONE,
    });
  }
}
