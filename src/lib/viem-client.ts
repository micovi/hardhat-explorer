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

// Hardhat local chain configuration
const hardhatChain: Chain = {
  ...localhost,
  id: 31337, // Hardhat default chain ID
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || 'http://localhost:8545'],
      webSocket: [import.meta.env.VITE_WS_URL || 'ws://localhost:8545'],
    },
    public: {
      http: [import.meta.env.VITE_RPC_URL || 'http://localhost:8545'],
      webSocket: [import.meta.env.VITE_WS_URL || 'ws://localhost:8545'],
    },
  },
}

// Create public client for reading blockchain data
let publicClient: PublicClient | null = null

export const getPublicClient = (): PublicClient => {
  if (!publicClient) {
    const rpcUrl = import.meta.env.VITE_RPC_URL || 'http://localhost:8545'
    
    publicClient = createPublicClient({
      chain: hardhatChain,
      transport: http(rpcUrl, {
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
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8545'
    
    try {
      wsClient = createPublicClient({
        chain: hardhatChain,
        transport: webSocket(wsUrl, {
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

// Create wallet client for writing transactions (for Hardhat test accounts)
export const getWalletClient = async (): Promise<WalletClient | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.warn('No wallet detected')
    return null
  }
  
  const walletClient = createWalletClient({
    chain: hardhatChain,
    transport: custom(window.ethereum),
  })
  
  return walletClient
}

// Check if connected to Hardhat
export const checkHardhatConnection = async (): Promise<boolean> => {
  const client = getPublicClient()
  
  try {
    const chainId = await client.getChainId()
    return chainId === 31337
  } catch (error) {
    console.error('Failed to connect to Hardhat node:', error)
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