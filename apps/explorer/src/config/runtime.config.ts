// Runtime configuration that can be injected by the CLI without rebuilding
interface RuntimeConfig {
  RPC_URL?: string;
  WS_URL?: string;
  CHAIN_ID?: number;
  CHAIN_NAME?: string;
}

// Check for runtime configuration injected by CLI
const getRuntimeConfig = (): RuntimeConfig => {
  if (typeof window !== 'undefined' && (window as any).EVMSCAN_CONFIG) {
    return (window as any).EVMSCAN_CONFIG;
  }
  return {};
};

const runtimeConfig = getRuntimeConfig();

// Export configuration with runtime values taking precedence over env vars
export const config = {
  rpc: {
    url: runtimeConfig.RPC_URL || import.meta.env.VITE_RPC_URL || 'http://localhost:8545',
    ws: runtimeConfig.WS_URL || import.meta.env.VITE_WS_URL || 'ws://localhost:8545',
  },
  chain: {
    id: runtimeConfig.CHAIN_ID || parseInt(import.meta.env.VITE_CHAIN_ID || '31337'),
    name: runtimeConfig.CHAIN_NAME || import.meta.env.VITE_CHAIN_NAME || 'Localhost',
  }
};

// Helper to check if running via CLI
export const isRunningViaCLI = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).EVMSCAN_CONFIG;
};

// Export individual values for convenience
export const RPC_URL = config.rpc.url;
export const WS_URL = config.rpc.ws;
export const CHAIN_ID = config.chain.id;
export const CHAIN_NAME = config.chain.name;