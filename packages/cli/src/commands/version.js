import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function version() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')
  );
  
  console.log('\n' + chalk.blue('evmscan.org'));
  console.log(chalk.gray('Version:     ') + chalk.cyan(packageJson.version));
  console.log(chalk.gray('Node:        ') + chalk.cyan(process.version));
  console.log(chalk.gray('Platform:    ') + chalk.cyan(process.platform));
  console.log(chalk.gray('Architecture:') + chalk.cyan(process.arch));
  console.log(chalk.gray('Homepage:    ') + chalk.cyan('https://evmscan.org'));
  console.log(chalk.gray('Repository:  ') + chalk.cyan('https://github.com/evmscan/explorer'));
  console.log();
}