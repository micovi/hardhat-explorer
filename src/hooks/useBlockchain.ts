import { useQuery } from '@tanstack/react-query'
import { getPublicClient } from '@/lib/viem-client'
import type { Block, Transaction } from '@/types/blockchain.types'

export function useLatestBlocks(count = 10) {
  return useQuery({
    queryKey: ['latestBlocks', count],
    queryFn: async () => {
      const client = getPublicClient()
      const latestBlockNumber = await client.getBlockNumber()
      
      const blocks: Block[] = []
      for (let i = 0; i < count; i++) {
        const blockNumber = latestBlockNumber - BigInt(i)
        if (blockNumber < 0n) break
        
        const block = await client.getBlock({
          blockNumber,
          includeTransactions: false
        })
        blocks.push(block as Block)
      }
      
      return blocks
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}

export function useLatestTransactions(count = 10) {
  return useQuery({
    queryKey: ['latestTransactions', count],
    queryFn: async () => {
      const client = getPublicClient()
      const latestBlock = await client.getBlock({
        blockTag: 'latest',
        includeTransactions: true
      })
      
      // Get transactions from latest blocks
      let transactions: Transaction[] = []
      let currentBlockNumber = latestBlock.number
      
      while (transactions.length < count && currentBlockNumber > 0n) {
        const block = await client.getBlock({
          blockNumber: currentBlockNumber,
          includeTransactions: true
        })
        
        if (block.transactions && block.transactions.length > 0) {
          // Add block metadata to each transaction
          const blockTxs = block.transactions.map(tx => ({
            ...tx,
            blockNumber: block.number,
            blockHash: block.hash,
            timestamp: block.timestamp
          })) as Transaction[]
          
          transactions = [...transactions, ...blockTxs]
        }
        
        currentBlockNumber--
      }
      
      return transactions.slice(0, count)
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}

export function useBlockchainStats() {
  return useQuery({
    queryKey: ['blockchainStats'],
    queryFn: async () => {
      const client = getPublicClient()
      const [latestBlock, gasPrice, chainId] = await Promise.all([
        client.getBlock({ blockTag: 'latest' }),
        client.getGasPrice(),
        client.getChainId()
      ])
      
      return {
        latestBlockNumber: latestBlock.number,
        latestBlockHash: latestBlock.hash,
        gasPrice,
        chainId,
        timestamp: latestBlock.timestamp,
        transactionCount: latestBlock.transactions.length
      }
    },
    refetchInterval: 3000, // Refetch every 3 seconds
  })
}