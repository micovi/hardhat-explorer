import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function version(): void {
  const packageJsonPath = join(__dirname, '../../package.json');
  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, 'utf-8')
  );
  
  console.log('\n' + chalk.blue('evmscan.org'));
  console.log(chalk.gray('Version:     ') + chalk.cyan(packageJson.version));
  console.log(chalk.gray('Runtime:     ') + chalk.cyan(process.versions.bun ? `Bun ${process.versions.bun}` : `Node ${process.version}`));
  console.log(chalk.gray('Platform:    ') + chalk.cyan(process.platform));
  console.log(chalk.gray('Architecture:') + chalk.cyan(process.arch));
  console.log(chalk.gray('Homepage:    ') + chalk.cyan('https://evmscan.org'));
  console.log(chalk.gray('Repository:  ') + chalk.cyan('https://github.com/evmscan/explorer'));
  console.log();
}