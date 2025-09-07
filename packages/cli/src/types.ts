export interface EvmscanConfig {
  rpc: {
    url: string;
    ws: string;
    timeout: number;
  };
  server: {
    port: number;
    host: string;
    open: boolean;
  };
  chain: {
    id: number;
    name: string;
    currency: string;
  };
  ui: {
    theme: 'light' | 'dark';
    title: string;
    logo: string | null;
  };
  advanced: {
    cacheEnabled: boolean;
    cacheTTL: number;
    maxBlocksPerPage: number;
    maxTransactionsPerPage: number;
    enableWebsocket: boolean;
  };
}

export interface InitOptions {
  force?: boolean;
  quiet?: boolean;
}

export interface StartOptions {
  port?: string;
  rpc?: string;
  config?: string;
  open?: boolean;
  debug?: boolean;
}

export interface ConfigOptions {
  config?: string;
}

export interface RuntimeConfig {
  RPC_URL: string;
  WS_URL: string;
  CHAIN_ID: number;
  CHAIN_NAME: string;
}

export interface PromptsResponse {
  rpcUrl?: string;
  port?: number;
  chainId?: number;
  chainName?: string;
  openBrowser?: boolean;
  enableWebsocket?: boolean;
  useAvailable?: boolean;
  overwrite?: boolean;
}