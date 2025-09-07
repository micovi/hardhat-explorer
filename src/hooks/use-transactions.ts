import { useQuery } from '@tanstack/react-query'
import { getPublicClient } from '@/lib/viem-client'
import type { Transaction } from '@/types/blockchain.types'

interface UseTransactionsParams {
  page?: number
  pageSize?: number
}

export function useTransactions({ page = 1, pageSize = 25 }: UseTransactionsParams = {}) {
  return useQuery({
    queryKey: ['transactions', page, pageSize],
    queryFn: async () => {
      const client = getPublicClient()
      const latestBlock = await client.getBlock({
        blockTag: 'latest',
        includeTransactions: true
      })
      
      // Collect transactions from recent blocks
      let allTransactions: Transaction[] = []
      let currentBlockNumber = latestBlock.number
      const blocksToScan = 100 // Scan last 100 blocks for transactions
      
      for (let i = 0; i < blocksToScan && currentBlockNumber >= 0n; i++) {
        const block = await client.getBlock({
          blockNumber: currentBlockNumber,
          includeTransactions: true
        })
        
        if (block.transactions && block.transactions.length > 0) {
          const blockTxs = block.transactions.map(tx => ({
            ...tx,
            blockNumber: block.number,
            blockHash: block.hash,
            timestamp: block.timestamp,
            baseFeePerGas: block.baseFeePerGas
          })) as Transaction[]
          
          allTransactions = [...allTransactions, ...blockTxs]
        }
        
        currentBlockNumber--
      }
      
      // Sort by block number (newest first)
      allTransactions.sort((a, b) => {
        if (!a.blockNumber || !b.blockNumber) return 0
        return Number(b.blockNumber) - Number(a.blockNumber)
      })
      
      // Paginate
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedTransactions = allTransactions.slice(startIndex, endIndex)
      
      const totalTransactions = allTransactions.length
      const totalPages = Math.ceil(totalTransactions / pageSize)
      
      return {
        transactions: paginatedTransactions,
        pagination: {
          currentPage: page,
          pageSize,
          totalPages,
          totalTransactions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: async () => {
      console.log('Fetching transaction with hash:', hash)
      const client = getPublicClient()
      
      try {
        // Get transaction
        const transaction = await client.getTransaction({
          hash: hash as `0x${string}`
        })
        
        console.log('Transaction data:', transaction)
        
        if (!transaction) {
          console.error('Transaction not found for hash:', hash)
          throw new Error('Transaction not found')
        }
        
        // Get transaction receipt for status and gas used
        let receipt = null
        try {
          receipt = await client.getTransactionReceipt({
            hash: hash as `0x${string}`
          })
          console.log('Transaction receipt:', receipt)
        } catch (receiptError) {
          console.warn('Could not fetch receipt:', receiptError)
          // Receipt might not exist for pending transactions
        }
        
        // Get block for timestamp
        const block = transaction.blockNumber ? await client.getBlock({
          blockNumber: transaction.blockNumber
        }) : null
        
        console.log('Block data:', block)
        
        // Merge all data
        const mergedData = {
          ...transaction,
          // Override with receipt data where available
          blockNumber: receipt?.blockNumber || transaction.blockNumber,
          blockHash: receipt?.blockHash || transaction.blockHash,
          transactionIndex: receipt?.transactionIndex || transaction.transactionIndex,
          from: receipt?.from || transaction.from,
          to: receipt?.to || transaction.to,
          gasUsed: receipt?.gasUsed,
          cumulativeGasUsed: receipt?.cumulativeGasUsed,
          effectiveGasPrice: receipt?.effectiveGasPrice,
          status: receipt?.status,
          logsBloom: receipt?.logsBloom,
          logs: receipt?.logs || [],
          contractAddress: receipt?.contractAddress,
          root: receipt?.root,
          // Add block data
          timestamp: block?.timestamp,
          baseFeePerGas: block?.baseFeePerGas
        }
        
        console.log('Merged transaction data:', mergedData)
        return mergedData
      } catch (error) {
        console.error('Error fetching transaction:', error)
        console.error('Failed hash:', hash)
        throw error
      }
    },
    enabled: !!hash && hash.startsWith('0x'),
    retry: 2,
  })
}