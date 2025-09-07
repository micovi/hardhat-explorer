import { useQuery } from '@tanstack/react-query'
import { getPublicClient } from '@/lib/viem-client'
import type { Block } from '@/types/blockchain.types'

interface UseBlocksParams {
  page?: number
  pageSize?: number
}

export function useBlocks({ page = 1, pageSize = 10 }: UseBlocksParams = {}) {
  return useQuery({
    queryKey: ['blocks', page, pageSize],
    queryFn: async () => {
      const client = getPublicClient()
      const latestBlockNumber = await client.getBlockNumber()
      
      // Calculate block range for the current page
      const startBlock = latestBlockNumber - BigInt((page - 1) * pageSize)
      const endBlock = startBlock - BigInt(pageSize - 1)
      
      const blocks: Block[] = []
      
      for (let i = startBlock; i >= endBlock && i >= 0n; i--) {
        const block = await client.getBlock({
          blockNumber: i,
          includeTransactions: false
        })
        blocks.push(block as Block)
      }
      
      // Calculate total pages (approximate, as new blocks are being mined)
      const totalBlocks = Number(latestBlockNumber) + 1
      const totalPages = Math.ceil(totalBlocks / pageSize)
      
      return {
        blocks,
        pagination: {
          currentPage: page,
          pageSize,
          totalPages,
          totalBlocks,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}

export function useBlock(blockNumberOrHash: string | bigint) {
  return useQuery({
    queryKey: ['block', blockNumberOrHash],
    queryFn: async () => {
      const client = getPublicClient()
      
      // Determine if it's a block number or hash
      const isHash = typeof blockNumberOrHash === 'string' && blockNumberOrHash.startsWith('0x') && blockNumberOrHash.length === 66
      
      const block = await client.getBlock({
        blockNumber: !isHash ? BigInt(blockNumberOrHash) : undefined,
        blockHash: isHash ? blockNumberOrHash as `0x${string}` : undefined,
        includeTransactions: true
      })
      
      return block
    },
    enabled: !!blockNumberOrHash,
  })
}