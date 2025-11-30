use rig::client::{CompletionClient, ProviderClient};
use rig::completion::Prompt;
use rig_bedrock::{client::Client};

pub(crate) async fn handle(message: &str) -> Result<String, crate::Error> {
    let agent = Client::from_env()
        .agent("us.amazon.nova-micro-v1:0")
        .preamble("Be precise and concise.")
        .temperature(0.5)
        .build();

    // Stream the response and print chunks as they arrive
    let response = agent.prompt(message).await?;
    return Ok(response);
}
