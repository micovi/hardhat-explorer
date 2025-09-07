import { useState, useEffect, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { checkHardhatConnection, getPublicClient } from '@/lib/viem-client'
import { NodeOnboarding } from './node-onboarding'
import { Loader2 } from 'lucide-react'

interface ConnectionWrapperProps {
  children: ReactNode
}

export function ConnectionWrapper({ children }: ConnectionWrapperProps) {
  const [hasInitialConnection, setHasInitialConnection] = useState(false)

  // Check connection status
  const { 
    data: isConnected, 
    error,
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['nodeConnection'],
    queryFn: async () => {
      try {
        const client = getPublicClient()
        // Try to get the chain ID as a connection test
        const chainId = await client.getChainId()
        
        // Also check if we can get the latest block
        const latestBlock = await client.getBlockNumber()
        
        if (chainId && latestBlock !== undefined) {
          setHasInitialConnection(true)
          return true
        }
        return false
      } catch (err) {
        console.error('Connection check failed:', err)
        throw err
      }
    },
    retry: 3,
    retryDelay: 1000,
    refetchInterval: hasInitialConnection ? 10000 : 2000, // Check more frequently if not connected
    refetchIntervalInBackground: true,
  })

  // Initial loading state
  if (isLoading && !hasInitialConnection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4 relative">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Looking for your local development node...
            </h2>
            <p className="text-gray-600 mb-6">
              evmscan is trying to connect to your local Ethereum node at
              <code className="mx-2 px-2 py-1 bg-gray-100 rounded text-sm font-mono">localhost:8545</code>
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">No node detected yet</h3>
                <p className="text-sm text-gray-600">
                  Make sure you have started your local development node. If you're developing smart contracts, you need to run one of these:
                </p>
              </div>
            </div>

            <div className="space-y-3 ml-5">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-lg">⛑️</span>
                <div className="flex-1">
                  <code className="text-sm font-mono text-gray-800">npx hardhat node</code>
                  <p className="text-xs text-gray-600 mt-1">For Hardhat projects</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-lg">🔨</span>
                <div className="flex-1">
                  <code className="text-sm font-mono text-gray-800">anvil</code>
                  <p className="text-xs text-gray-600 mt-1">For Foundry projects</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-lg">🍫</span>
                <div className="flex-1">
                  <code className="text-sm font-mono text-gray-800">ganache --host 0.0.0.0</code>
                  <p className="text-xs text-gray-600 mt-1">For Truffle projects</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Checking for connection every 2 seconds...
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Once your node is running, evmscan will automatically connect
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="fixed top-10 right-10 w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="fixed bottom-10 left-10 w-48 h-48 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full opacity-10 blur-3xl"></div>
      </div>
    )
  }

  // Show onboarding if not connected
  if (!isConnected && !isLoading) {
    return (
      <NodeOnboarding 
        onRetry={() => refetch()} 
        error={error as Error}
      />
    )
  }

  // Show children when connected
  return <>{children}</>
}