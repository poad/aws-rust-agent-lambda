import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import { configs as jsConfigs } from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import cdkPlugin from 'eslint-plugin-awscdk';
import { configs, parser } from 'typescript-eslint';
import { importX, createNodeResolver } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      '**/*.d.ts',
      '**/*.js',
      'node_modules/**/*',
      'out',
      'dist',
      'cdk.out',
      '.output',
      'lambda',
    ],
  },
  {
    files: ['**/*.{ts,tsx}', '*.js'],
    plugins: {
      'import-x': importX,
      '@stylistic': stylistic,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: {
          allowDefaultProject: ['eslint.config.ts'],
        },
      },
    },
    extends: [
      'import-x/flat/recommended',
      cdkPlugin.configs.recommended,
      jsConfigs.recommended,
      configs.strict,
      configs.stylistic,
    ],
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
        createNodeResolver(),
      ],
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quotes': ['error', 'single'],

      'import-x/order': [
        'error',
        {
          'groups': [
            // Imports of builtins are first
            'builtin',
            // Then sibling and parent imports. They can be mingled together
            ['sibling', 'parent'],
            // Then index file imports
            'index',
            // Then any arcane TypeScript imports
            'object',
            // Then the omitted imports: internal, external, type, unknown
          ],
        },
      ],
    },
  },
);
