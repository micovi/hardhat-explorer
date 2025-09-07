#!/usr/bin/env bun

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { init } from './commands/init';
import { start } from './commands/start';
import { version } from './commands/version';
import type { InitOptions, StartOptions, ConfigOptions } from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

// ASCII Art Banner
const banner = `
${chalk.blue('╔═══════════════════════════════════════╗')}
${chalk.blue('║')}       ${chalk.cyan.bold('EVMSCAN.ORG')} Explorer        ${chalk.blue('║')}
${chalk.blue('║')}   ${chalk.gray('Local EVM Blockchain Explorer')}    ${chalk.blue('║')}
${chalk.blue('╚═══════════════════════════════════════╝')}
`;

program
  .name('evmscan')
  .description('Local EVM blockchain explorer - instant setup, zero configuration')
  .version(packageJson.version)
  .addHelpText('before', banner);

// Init command - creates configuration file
program
  .command('init')
  .description('Initialize evmscan configuration')
  .option('-f, --force', 'Overwrite existing configuration')
  .option('-q, --quiet', 'Skip interactive prompts and use defaults')
  .action(async (options: InitOptions) => {
    await init(options);
  });

// Start command - runs the explorer
program
  .command('start')
  .description('Start the blockchain explorer')
  .option('-p, --port <port>', 'Port to run the explorer on', '3000')
  .option('-r, --rpc <url>', 'RPC endpoint URL', 'http://localhost:8545')
  .option('-c, --config <path>', 'Path to config file', './evmscan.config.json')
  .option('-o, --open', 'Open browser automatically', true)
  .option('--no-open', 'Do not open browser automatically')
  .option('-d, --debug', 'Enable debug mode')
  .action(async (options: StartOptions) => {
    await start(options);
  });

// Run command - alias for start
program
  .command('run')
  .description('Alias for "start" command')
  .option('-p, --port <port>', 'Port to run the explorer on', '3000')
  .option('-r, --rpc <url>', 'RPC endpoint URL', 'http://localhost:8545')
  .option('-c, --config <path>', 'Path to config file', './evmscan.config.json')
  .option('-o, --open', 'Open browser automatically', true)
  .option('--no-open', 'Do not open browser automatically')
  .option('-d, --debug', 'Enable debug mode')
  .action(async (options: StartOptions) => {
    await start(options);
  });

// Version command - shows version info
program
  .command('version')
  .description('Show version information')
  .action(() => {
    version();
  });

// Config command - shows current configuration
program
  .command('config')
  .description('Show current configuration')
  .option('-c, --config <path>', 'Path to config file', './evmscan.config.json')
  .action((options: ConfigOptions) => {
    const configPath = resolve(options.config || './evmscan.config.json');
    
    if (!existsSync(configPath)) {
      console.log(chalk.yellow('⚠️  No configuration file found'));
      console.log(chalk.gray(`   Run ${chalk.cyan('evmscan init')} to create one`));
      return;
    }

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    console.log(chalk.blue('\n📋 Current Configuration:\n'));
    console.log(JSON.stringify(config, null, 2));
  });

// Quick start (no command) - runs with defaults
program
  .argument('[rpc-url]', 'RPC endpoint URL')
  .action(async (rpcUrl?: string) => {
    if (!rpcUrl) {
      // If no argument provided, show help
      program.help();
      return;
    }

    // Quick start with provided RPC URL
    console.log(banner);
    console.log(chalk.green('⚡ Quick start mode\n'));
    
    await start({
      port: '3000',
      rpc: rpcUrl,
      open: true,
      config: undefined
    });
  });

// Error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error: any) {
  if (error.code === 'commander.unknownCommand') {
    console.log(chalk.red('\n❌ Unknown command'));
    console.log(chalk.gray(`   Run ${chalk.cyan('evmscan --help')} to see available commands\n`));
  } else if (error.code === 'commander.help') {
    // Help was displayed, exit gracefully
    process.exit(0);
  } else {
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason: any) => {
  console.error(chalk.red('\n❌ Unhandled Rejection:'), reason);
  process.exit(1);
});