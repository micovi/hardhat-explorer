import { 
  createPublicClient, 
  createWalletClient,
  custom,
  http,
  webSocket,
  type PublicClient,
  type WalletClient,
  type Chain,
} from 'viem'
import { localhost } from 'viem/chains'
import { config } from '@/config/runtime.config'

// Local EVM chain configuration
const localChain: Chain = {
  ...localhost,
  id: config.chain.id,
  name: config.chain.name,
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [config.rpc.url],
      webSocket: [config.rpc.ws],
    },
    public: {
      http: [config.rpc.url],
      webSocket: [config.rpc.ws],
    },
  },
}

// Create public client for reading blockchain data
let publicClient: PublicClient | null = null

export const getPublicClient = (): PublicClient => {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: localChain,
      transport: http(config.rpc.url, {
        batch: true,
        retryCount: 3,
        retryDelay: 1000,
      }),
    })
  }
  
  return publicClient
}

// Create WebSocket client for real-time updates
let wsClient: PublicClient | null = null

export const getWebSocketClient = (): PublicClient | null => {
  if (!wsClient) {
    try {
      wsClient = createPublicClient({
        chain: localChain,
        transport: webSocket(config.rpc.ws, {
          reconnect: true,
          retryCount: 5,
        }),
      })
    } catch (error) {
      console.warn('Failed to initialize WebSocket client:', error)
      return null
    }
  }
  
  return wsClient
}

// Create wallet client for writing transactions
export const getWalletClient = async (): Promise<WalletClient | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.warn('No wallet detected')
    return null
  }
  
  const walletClient = createWalletClient({
    chain: localChain,
    transport: custom(window.ethereum),
  })
  
  return walletClient
}

// Check if connected to local EVM node
export const checkHardhatConnection = async (): Promise<boolean> => {
  const client = getPublicClient()
  const expectedChainId = config.chain.id
  
  try {
    const chainId = await client.getChainId()
    return chainId === expectedChainId
  } catch (error) {
    console.error('Failed to connect to EVM node:', error)
    return false
  }
}

// Format utilities (re-exported from viem for convenience)
export {
  formatEther,
  formatGwei,
  formatUnits,
  parseEther,
  parseGwei,
  parseUnits,
} from 'viem'

// Type exports
export type { PublicClient, WalletClient, Chain }