import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import detectPort from 'detect-port';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function start(options) {
  // Load configuration
  let config = {};
  const configPath = options.config ? path.resolve(options.config) : path.resolve('./evmscan.config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log(chalk.gray(`📁 Loaded config from ${path.basename(configPath)}`));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Failed to load config file, using defaults'));
    }
  }
  
  // Merge options with config (CLI options take precedence)
  const rpcUrl = options.rpc || config.rpc?.url || 'http://localhost:8545';
  const port = parseInt(options.port || config.server?.port || 3000);
  const shouldOpen = options.open !== false && (options.open || config.server?.open !== false);
  
  // Check if port is available
  const availablePort = await detectPort(port);
  if (availablePort !== port) {
    console.log(chalk.yellow(`⚠️  Port ${port} is in use`));
    const { useAvailable } = await prompts({
      type: 'confirm',
      name: 'useAvailable',
      message: `Use port ${availablePort} instead?`,
      initial: true
    });
    
    if (!useAvailable) {
      process.exit(0);
    }
  }
  
  const finalPort = availablePort;
  
  // Create Express app
  const app = express();
  
  // Enable CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
  // Runtime configuration endpoint
  app.get('/runtime-config.js', (req, res) => {
    const runtimeConfig = {
      RPC_URL: rpcUrl,
      WS_URL: rpcUrl.replace('http://', 'ws://').replace('https://', 'wss://'),
      CHAIN_ID: config.chain?.id || 31337,
      CHAIN_NAME: config.chain?.name || 'Localhost',
      ENABLE_PROMOTIONS: config.features?.promotions || false,
      ENABLE_SPONSORS: config.features?.sponsors || false,
      ENABLE_CLOUD_CTA: config.features?.cloudCTA || false,
    };
    
    res.type('application/javascript');
    res.send(`window.EVMSCAN_CONFIG = ${JSON.stringify(runtimeConfig)};`);
  });
  
  // Proxy API requests to RPC endpoint
  app.use('/rpc', createProxyMiddleware({
    target: rpcUrl,
    changeOrigin: true,
    pathRewrite: { '^/rpc': '' },
    onError: (err, req, res) => {
      console.error(chalk.red('❌ RPC Proxy Error:'), err.message);
      res.status(502).json({ error: 'RPC endpoint unavailable' });
    },
    onProxyReq: (proxyReq, req, res) => {
      if (options.debug) {
        console.log(chalk.gray(`[RPC] ${req.method} ${req.url}`));
      }
    }
  }));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', rpcUrl, version: '1.0.0' });
  });
  
  // Serve static files from dist directory
  const distPath = path.join(__dirname, '../../dist');
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error(chalk.red('\n❌ Built application not found'));
    console.log(chalk.gray('   The application needs to be built first.'));
    console.log(chalk.gray('   If you\'re developing, run this from the main project:'));
    console.log(chalk.cyan('   npm run build:cli\n'));
    process.exit(1);
  }
  
  // Inject runtime config into index.html
  app.get('/', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');
    
    // Inject runtime config script before closing head tag
    const configScript = `<script src="/runtime-config.js"></script>`;
    html = html.replace('</head>', `${configScript}\n</head>`);
    
    res.send(html);
  });
  
  // Serve static files
  app.use(express.static(distPath));
  
  // SPA fallback - serve index.html for all routes
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');
    
    // Inject runtime config script
    const configScript = `<script src="/runtime-config.js"></script>`;
    html = html.replace('</head>', `${configScript}\n</head>`);
    
    res.send(html);
  });
  
  // Start server
  const spinner = ora('Starting explorer server').start();
  
  const server = app.listen(finalPort, () => {
    spinner.succeed('Explorer server started');
    
    const url = `http://localhost:${finalPort}`;
    
    console.log('\n' + chalk.green('🚀 evmscan.org is running!\n'));
    console.log(chalk.gray('  Local:          ') + chalk.cyan(url));
    console.log(chalk.gray('  RPC Endpoint:   ') + chalk.cyan(rpcUrl));
    console.log(chalk.gray('  Network:        ') + chalk.cyan(config.chain?.name || 'Unknown'));
    console.log(chalk.gray('  Chain ID:       ') + chalk.cyan(config.chain?.id || 'Unknown'));
    
    console.log('\n' + chalk.gray('  Press CTRL+C to stop\n'));
    
    // Open browser
    if (shouldOpen) {
      setTimeout(() => {
        open(url).catch(() => {
          console.log(chalk.yellow('⚠️  Could not open browser automatically'));
          console.log(chalk.gray(`   Please open ${chalk.cyan(url)} manually`));
        });
      }, 1000);
    }
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n👋 Shutting down explorer...'));
    server.close(() => {
      console.log(chalk.green('✅ Explorer stopped\n'));
      process.exit(0);
    });
  });
  
  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit(0);
    });
  });
}