#!/usr/bin/env bun

import { existsSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const cliDir = __dirname;
const distDir = join(cliDir, 'dist');

async function build(): Promise<void> {
  console.log(chalk.blue('\n🔨 Building evmscan CLI package with Bun\n'));
  
  // Step 1: Clean previous build
  const cleanSpinner = ora('Cleaning previous build').start();
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
  }
  cleanSpinner.succeed('Cleaned previous build');
  
  // Step 2: Check if explorer dist exists, if not build it
  const explorerDist = join(rootDir, 'apps/explorer/dist');
  
  if (!existsSync(explorerDist)) {
    const buildSpinner = ora('Building main application').start();
    try {
      execSync('bun run build:explorer', { 
        cwd: rootDir,
        stdio: 'pipe' 
      });
      buildSpinner.succeed('Built main application');
    } catch (error) {
      buildSpinner.fail('Failed to build main application');
      console.error(chalk.red((error as Error).message));
      console.log(chalk.yellow('\nTip: You can build the explorer manually with:'));
      console.log(chalk.cyan('  cd apps/explorer && bun run build\n'));
      process.exit(1);
    }
  } else {
    console.log(chalk.green('  ✓ Using existing explorer build'));
  }
  
  // Step 3: Copy dist to CLI package
  const copySpinner = ora('Copying distribution files').start();
  const sourceDist = join(rootDir, 'apps/explorer/dist');
  
  if (!existsSync(sourceDist)) {
    copySpinner.fail('Distribution files not found');
    console.error(chalk.red('Please build the main application first'));
    process.exit(1);
  }
  
  // Create dist directory in CLI package
  mkdirSync(distDir, { recursive: true });
  
  // Copy all files from main dist to CLI dist
  copyDirectory(sourceDist, distDir);
  copySpinner.succeed('Copied distribution files');
  
  // Step 4: Build TypeScript files
  const tsSpinner = ora('Building TypeScript files').start();
  try {
    // Use Bun to build TypeScript files
    const result = await Bun.build({
      entrypoints: [
        join(cliDir, 'src/cli.ts'),
      ],
      outdir: join(distDir, 'cli'),
      target: 'bun',
      format: 'esm',
      splitting: false,
      sourcemap: 'external',
      minify: false,
      external: ['commander', 'chalk', 'ora', 'prompts', 'hono', '@hono/node-server', 'open', 'detect-port', 'better-sqlite3'],
    });

    if (!result.success) {
      throw new Error('TypeScript build failed');
    }
    
    tsSpinner.succeed('Built TypeScript files');
  } catch (error) {
    tsSpinner.fail('Failed to build TypeScript');
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
  
  // Step 5: Create entry point wrapper
  const entrySpinner = ora('Creating entry point').start();
  const entryContent = `#!/usr/bin/env bun
import './cli/cli.js';
`;
  writeFileSync(join(distDir, 'index.js'), entryContent);
  entrySpinner.succeed('Created entry point');
  
  // Step 6: Update package.json for distribution
  const packageSpinner = ora('Preparing package for publishing').start();
  
  // Read the CLI package.json
  const packageJsonPath = join(cliDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  
  // Create a production package.json
  const prodPackageJson = {
    ...packageJson,
    bin: {
      evmscan: './dist/index.js'
    },
    main: './dist/index.js',
    files: [
      'dist'
    ],
    scripts: {
      start: 'bun run dist/index.js'
    },
    // Remove devDependencies for production
    devDependencies: undefined
  };
  
  // Write production package.json to dist
  writeFileSync(
    join(distDir, 'package.json'), 
    JSON.stringify(prodPackageJson, null, 2)
  );
  packageSpinner.succeed('Package prepared for publishing');
  
  // Step 7: Create README if it doesn't exist
  const readmePath = join(cliDir, 'README.md');
  if (!existsSync(readmePath)) {
    const readmeContent = `# evmscan CLI

Local EVM blockchain explorer - instant setup, zero configuration.

## Installation

\`\`\`bash
# Run directly with npx/bunx (recommended)
bunx evmscan init
bunx evmscan start

# Or install globally with Bun
bun add -g evmscan
evmscan init
evmscan start
\`\`\`

## Quick Start

\`\`\`bash
# Initialize configuration
bunx evmscan init

# Start the explorer
bunx evmscan start

# Start with custom RPC
bunx evmscan start --rpc https://mainnet.infura.io/v3/YOUR_KEY

# Start on different port
bunx evmscan start --port 4000
\`\`\`

## Commands

- \`evmscan init\` - Initialize configuration file
- \`evmscan start\` - Start the explorer server
- \`evmscan config\` - Show current configuration
- \`evmscan version\` - Show version information

## Configuration

The \`evmscan.config.json\` file supports:

- RPC endpoint configuration
- Server port and host settings
- Chain ID and name customization
- Feature flags for promotions, sponsors, etc.
- UI theming options

## Runtime

This CLI is optimized for Bun runtime but also works with Node.js.

## License

MIT

## Learn More

Visit [evmscan.org](https://evmscan.org) for documentation and updates.
`;
    writeFileSync(readmePath, readmeContent);
    console.log(chalk.green('  ✓ Created README.md'));
  }
  
  console.log(chalk.green('\n✅ Build complete!\n'));
  console.log(chalk.gray('The package is ready for publishing:'));
  console.log(chalk.cyan('  cd packages/cli && bun publish\n'));
  console.log(chalk.gray('Or test locally:'));
  console.log(chalk.cyan('  cd packages/cli && bun link'));
  console.log(chalk.cyan('  evmscan start\n'));
}

function copyDirectory(source: string, target: string): void {
  const files = readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = join(source, file);
    const targetPath = join(target, file);
    
    if (statSync(sourcePath).isDirectory()) {
      mkdirSync(targetPath, { recursive: true });
      copyDirectory(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  });
}

// Run build
build().catch((error: Error) => {
  console.error(chalk.red('\n❌ Build failed:'), error);
  process.exit(1);
});