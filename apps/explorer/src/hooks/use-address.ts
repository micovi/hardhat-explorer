import { useQuery } from '@tanstack/react-query'
import { getPublicClient } from '@/lib/viem-client'

import type { Transaction } from '@/types/blockchain.types'

interface AddressData {
  address: string
  balance: bigint
  transactionCount: number
  code: string | null
  isContract: boolean
}

interface AddressTransactions {
  sent: Transaction[]
  received: Transaction[]
  total: number
}

export function useAddress(address: string) {
  return useQuery({
    queryKey: ['address', address],
    queryFn: async () => {
      const client = getPublicClient()
      
      // Get basic address info
      const [balance, code, transactionCount] = await Promise.all([
        client.getBalance({ address: address as `0x${string}` }),
        client.getCode({ address: address as `0x${string}` }),
        client.getTransactionCount({ address: address as `0x${string}` })
      ])
      
      const addressData: AddressData = {
        address,
        balance,
        transactionCount,
        code: code || null,
        isContract: !!code && code !== '0x'
      }
      
      return addressData
    },
    enabled: !!address && address.startsWith('0x'),
    refetchInterval: 10000
  })
}

export function useAddressTransactions(address: string, page: number = 1, pageSize: number = 25) {
  return useQuery({
    queryKey: ['addressTransactions', address, page, pageSize],
    queryFn: async () => {
      const client = getPublicClient()
      
      // Get latest block number
      const latestBlockNumber = await client.getBlockNumber()
      
      // Scan recent blocks for transactions involving this address
      const sent: Transaction[] = []
      const received: Transaction[] = []
      const blocksToScan = 100 // Scan last 100 blocks
      
      for (let i = 0; i < blocksToScan && latestBlockNumber - BigInt(i) >= 0n; i++) {
        const block = await client.getBlock({
          blockNumber: latestBlockNumber - BigInt(i),
          includeTransactions: true
        })
        
        if (block.transactions && block.transactions.length > 0) {
          for (const tx of block.transactions) {
            if (typeof tx === 'object' && tx !== null) {
              const txWithBlockData = {
                ...tx,
                blockNumber: block.number,
                blockHash: block.hash,
                timestamp: block.timestamp,
                baseFeePerGas: block.baseFeePerGas
              } as Transaction
              
              // Check if address is sender
              if (tx.from?.toLowerCase() === address.toLowerCase()) {
                sent.push(txWithBlockData)
              }
              
              // Check if address is receiver
              if (tx.to?.toLowerCase() === address.toLowerCase()) {
                received.push(txWithBlockData)
              }
            }
          }
        }
      }
      
      // Combine and sort by block number
      const allTransactions = [...sent, ...received]
      allTransactions.sort((a, b) => {
        if (!a.blockNumber || !b.blockNumber) return 0
        return Number(b.blockNumber) - Number(a.blockNumber)
      })
      
      // Remove duplicates (same tx can be in both sent and received)
      const uniqueTransactions = allTransactions.filter(
        (tx, index, self) =>
          index === self.findIndex((t) => t.hash === tx.hash)
      )
      
      // Paginate
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedTransactions = uniqueTransactions.slice(startIndex, endIndex)
      
      return {
        sent,
        received,
        transactions: paginatedTransactions,
        total: uniqueTransactions.length,
        pagination: {
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(uniqueTransactions.length / pageSize),
          totalTransactions: uniqueTransactions.length,
          hasNextPage: page < Math.ceil(uniqueTransactions.length / pageSize),
          hasPrevPage: page > 1
        }
      }
    },
    enabled: !!address && address.startsWith('0x'),
    refetchInterval: 10000
  })
}

export function useAddressTokens(address: string) {
  return useQuery({
    queryKey: ['addressTokens', address],
    queryFn: async () => {
      // This would require indexing ERC20/ERC721 events
      // For now, return empty array
      // In a real implementation, you'd scan for Transfer events
      // where the address is involved
      return {
        erc20: [],
        erc721: [],
        erc1155: []
      }
    },
    enabled: !!address && address.startsWith('0x')
  })
}