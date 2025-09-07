import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import ora from 'ora';
import type { EvmscanConfig, InitOptions, PromptsResponse } from '../types';

const defaultConfig: EvmscanConfig = {
  // Network settings
  rpc: {
    url: 'http://localhost:8545',
    ws: 'ws://localhost:8545',
    timeout: 30000
  },
  
  // Server settings
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  
  // Chain settings
  chain: {
    id: 31337,
    name: 'Localhost',
    currency: 'ETH'
  },
  
  // UI settings
  ui: {
    theme: 'light',
    title: 'Local Blockchain Explorer',
    logo: null
  },
  
  // Advanced settings
  advanced: {
    cacheEnabled: true,
    cacheTTL: 5000,
    maxBlocksPerPage: 25,
    maxTransactionsPerPage: 25,
    enableWebsocket: true
  }
};

export async function init(options: InitOptions): Promise<void> {
  const configPath = resolve('./evmscan.config.json');
  
  // Check if config already exists
  if (existsSync(configPath) && !options.force) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'Configuration file already exists. Overwrite?',
      initial: false
    }) as PromptsResponse;
    
    if (!overwrite) {
      console.log(chalk.yellow('⚠️  Configuration unchanged'));
      return;
    }
  }
  
  let config: EvmscanConfig = { ...defaultConfig };
  
  if (!options.quiet) {
    console.log(chalk.blue('\n🔧 Let\'s configure your blockchain explorer\n'));
    
    const responses = await prompts([
      {
        type: 'text',
        name: 'rpcUrl',
        message: 'RPC endpoint URL',
        initial: defaultConfig.rpc.url,
        validate: (value: string) => {
          try {
            new URL(value);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      },
      {
        type: 'number',
        name: 'port',
        message: 'Server port',
        initial: defaultConfig.server.port,
        validate: (value: number) => value > 0 && value < 65536 ? true : 'Please enter a valid port number'
      },
      {
        type: 'number',
        name: 'chainId',
        message: 'Chain ID',
        initial: defaultConfig.chain.id
      },
      {
        type: 'text',
        name: 'chainName',
        message: 'Chain name',
        initial: defaultConfig.chain.name
      },
      {
        type: 'confirm',
        name: 'openBrowser',
        message: 'Open browser automatically?',
        initial: defaultConfig.server.open
      },
      {
        type: 'confirm',
        name: 'enableWebsocket',
        message: 'Enable WebSocket connection for real-time updates?',
        initial: defaultConfig.advanced.enableWebsocket
      }
    ]) as PromptsResponse;
    
    // Apply responses to config
    if (responses.rpcUrl) {
      config.rpc.url = responses.rpcUrl;
      // Auto-generate WebSocket URL if HTTP URL is provided
      if (responses.rpcUrl.startsWith('http://')) {
        config.rpc.ws = responses.rpcUrl.replace('http://', 'ws://');
      } else if (responses.rpcUrl.startsWith('https://')) {
        config.rpc.ws = responses.rpcUrl.replace('https://', 'wss://');
      }
    }
    
    if (responses.port !== undefined) config.server.port = responses.port;
    if (responses.chainId !== undefined) config.chain.id = responses.chainId;
    if (responses.chainName) config.chain.name = responses.chainName;
    if (typeof responses.openBrowser !== 'undefined') config.server.open = responses.openBrowser;
    if (typeof responses.enableWebsocket !== 'undefined') config.advanced.enableWebsocket = responses.enableWebsocket;
  }
  
  // Create .evmscan directory structure
  const evmscanDir = resolve('./.evmscan');
  const logsDir = join(evmscanDir, 'logs');
  const cacheDir = join(evmscanDir, 'cache');
  
  if (!existsSync(evmscanDir)) {
    mkdirSync(evmscanDir, { recursive: true });
    mkdirSync(logsDir, { recursive: true });
    mkdirSync(cacheDir, { recursive: true });
  }
  
  // Save configuration
  const spinner = ora('Creating configuration and data directory').start();
  
  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // Create .gitignore for the .evmscan directory if it doesn't exist
    const gitignorePath = resolve('./.gitignore');
    const evmscanGitignore = '\n# evmscan.org local data\n.evmscan/\n';
    
    if (existsSync(gitignorePath)) {
      const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
      if (!gitignoreContent.includes('.evmscan')) {
        writeFileSync(gitignorePath, gitignoreContent + evmscanGitignore);
      }
    } else {
      writeFileSync(gitignorePath, evmscanGitignore);
    }
    
    spinner.succeed('Configuration saved to evmscan.config.json');
    console.log(chalk.gray('📁 Created .evmscan directory for local data'));
    
    console.log(chalk.green('\n✅ Setup complete!\n'));
    console.log(chalk.gray('To start the explorer, run:'));
    console.log(chalk.cyan('  evmscan start\n'));
    
  } catch (error) {
    spinner.fail('Failed to create configuration');
    console.error(chalk.red('Error:'), (error as Error).message);
    process.exit(1);
  }
}