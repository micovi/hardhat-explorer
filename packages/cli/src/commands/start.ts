import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import detectPort from 'detect-port';
import prompts from 'prompts';
import type { EvmscanConfig, StartOptions, RuntimeConfig, PromptsResponse } from '../types';
import { SQLiteService } from '../db/sqlite.service';
import { createStorageRoutes } from '../api/storage.routes';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function start(options: StartOptions): Promise<void> {
  // Load configuration
  let config: Partial<EvmscanConfig> = {};
  const configPath = options.config ? resolve(options.config) : resolve('./evmscan.config.json');
  
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf-8'));
      console.log(chalk.gray(`📁 Loaded config from ${basename(configPath)}`));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Failed to load config file, using defaults'));
    }
  }
  
  // Merge options with config (CLI options take precedence)
  const rpcUrl = options.rpc || config.rpc?.url || 'http://localhost:8545';
  const port = parseInt(options.port || config.server?.port?.toString() || '3000');
  const shouldOpen = options.open !== false && (options.open || config.server?.open !== false);
  
  // Check if port is available
  const availablePort = await detectPort(port);
  let finalPort = port;
  
  if (availablePort !== port) {
    console.log(chalk.yellow(`⚠️  Port ${port} is in use`));
    const { useAvailable } = await prompts({
      type: 'confirm',
      name: 'useAvailable',
      message: `Use port ${availablePort} instead?`,
      initial: true
    }) as PromptsResponse;
    
    if (!useAvailable) {
      process.exit(0);
    }
    finalPort = availablePort;
  }
  
  // Initialize SQLite database
  const evmscanDir = resolve('./.evmscan');
  if (!existsSync(evmscanDir)) {
    mkdirSync(evmscanDir, { recursive: true });
    mkdirSync(join(evmscanDir, 'logs'), { recursive: true });
    mkdirSync(join(evmscanDir, 'cache'), { recursive: true });
  }
  
  const dbPath = join(evmscanDir, 'storage.db');
  const sqliteService = new SQLiteService(dbPath, true); // Always fresh start
  
  // Create Hono app
  const app = new Hono();
  
  // Enable CORS
  app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type']
  }));
  
  // Mount storage API routes
  const storageApp = createStorageRoutes(sqliteService);
  app.route('/api/storage', storageApp);
  
  // Runtime configuration endpoint
  app.get('/runtime-config.js', async (c) => {
    const runtimeConfig: RuntimeConfig = {
      RPC_URL: rpcUrl,
      WS_URL: rpcUrl.replace('http://', 'ws://').replace('https://', 'wss://'),
      CHAIN_ID: config.chain?.id || 31337,
      CHAIN_NAME: config.chain?.name || 'Localhost',
    };
    
    const jsContent = `window.EVMSCAN_CONFIG = ${JSON.stringify(runtimeConfig)};`;
    
    return new Response(jsContent, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  });
  
  // RPC Proxy handler for Hono
  app.all('/rpc/*', async (c) => {
    try {
      const method = c.req.method;
      const body = method !== 'GET' ? await c.req.raw.arrayBuffer() : undefined;
      const headers = c.req.raw.headers;
      
      if (options.debug) {
        console.log(chalk.gray(`[RPC] ${method} ${c.req.url}`));
      }
      
      // Forward request to RPC endpoint
      const targetUrl = c.req.url.replace('/rpc', rpcUrl);
      
      const response = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': headers.get('Content-Type') || 'application/json',
          'User-Agent': headers.get('User-Agent') || 'evmscan-cli',
        },
        body: body ? new Uint8Array(body) : undefined,
      });
      
      // Return response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      
    } catch (error) {
      console.error(chalk.red('❌ RPC Proxy Error:'), (error as Error).message);
      return c.json({ error: 'RPC endpoint unavailable' }, 502);
    }
  });
  
  // Health check endpoint
  app.get('/health', async (c) => {
    return c.json({ 
      status: 'ok', 
      timestamp: Date.now(),
      rpcUrl,
      chainId: config.chain?.id || 31337
    });
  });
  
  // Get dist path
  const distPath = join(__dirname, '../../dist');
  
  // Serve static files
  app.use('/*', serveStatic({
    root: distPath,
  }));
  
  // SPA fallback - serve index.html for all unmatched routes
  app.get('*', async (c) => {
    const indexPath = join(distPath, 'index.html');
    let html = readFileSync(indexPath, 'utf-8');
    
    // Inject runtime config script
    const configScript = `<script src="/runtime-config.js"></script>`;
    html = html.replace('</head>', `${configScript}\n</head>`);
    
    return c.html(html);
  });
  
  // Start server
  const spinner = ora('Starting explorer server').start();
  
  const server = serve({
    fetch: app.fetch,
    port: finalPort,
  });
  
  spinner.succeed('Explorer server started');
  
  const url = `http://localhost:${finalPort}`;
  
  console.log('\n' + chalk.green('🚀 evmscan.org is running!\n'));
  console.log(chalk.gray('  Local:          ') + chalk.cyan(url));
  console.log(chalk.gray('  RPC Endpoint:   ') + chalk.cyan(rpcUrl));
  console.log(chalk.gray('  Network:        ') + chalk.cyan(config.chain?.name || 'Unknown'));
  console.log(chalk.gray('  Chain ID:       ') + chalk.cyan(config.chain?.id || 'Unknown'));
  console.log(chalk.gray('  Runtime:        ') + chalk.cyan(`Hono on ${process.versions.bun ? `Bun ${process.versions.bun}` : `Node ${process.version}`}`));
  
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
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n👋 Shutting down explorer...'));
    server.close(() => {
      sqliteService.close();
      console.log(chalk.green('✅ Explorer stopped\n'));
      process.exit(0);
    });
  });
  
  process.on('SIGTERM', () => {
    server.close(() => {
      sqliteService.close();
      process.exit(0);
    });
  });
}