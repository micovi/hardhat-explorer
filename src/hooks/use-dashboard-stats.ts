import { useQuery } from '@tanstack/react-query'
import { getPublicClient } from '@/lib/viem-client'
import { formatGwei } from 'viem'
import { useState, useEffect } from 'react'

interface BlockStats {
  number: bigint
  timestamp: bigint
  transactions: number
  gasUsed: bigint
  gasLimit: bigint
}

interface DashboardStats {
  totalBlocks: number
  totalTransactions: number
  averageBlockTime: number
  averageGasPrice: number
  networkUtilization: number
  activityData: {
    label: string
    blocks: number
    transactions: number
    timestamp: number
  }[]
  gasPriceData: {
    current: number
    average: number
    low: number
    high: number
    trend: 'up' | 'down' | 'stable'
    history: { time: string; value: number }[]
  }
  blockTimeData: number[]
}

// Store historical data in memory
let historicalBlocks: BlockStats[] = []
let gasPriceHistory: { time: string; value: number }[] = []

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const client = getPublicClient()
      const latestBlock = await client.getBlock({ includeTransactions: true })
      
      // Collect last 10 blocks for statistics
      const blockPromises = []
      const startBlock = Number(latestBlock.number) > 10 ? Number(latestBlock.number) - 9 : 1
      
      for (let i = startBlock; i <= Number(latestBlock.number); i++) {
        blockPromises.push(client.getBlock({ 
          blockNumber: BigInt(i),
          includeTransactions: true 
        }))
      }
      
      const blocks = await Promise.all(blockPromises)
      
      // Process blocks
      const blockStats: BlockStats[] = blocks.map(block => ({
        number: block.number,
        timestamp: block.timestamp,
        transactions: block.transactions.length,
        gasUsed: block.gasUsed,
        gasLimit: block.gasLimit
      }))
      
      // Update historical data (keep last 20 blocks)
      historicalBlocks = [...historicalBlocks, ...blockStats]
        .filter((block, index, arr) => 
          arr.findIndex(b => b.number === block.number) === index
        )
        .slice(-20)
      
      // Calculate statistics
      const totalTransactions = historicalBlocks.reduce((sum, block) => sum + block.transactions, 0)
      
      // Calculate average block time
      const blockTimes: number[] = []
      for (let i = 1; i < historicalBlocks.length; i++) {
        const timeDiff = Number(historicalBlocks[i].timestamp - historicalBlocks[i - 1].timestamp)
        blockTimes.push(timeDiff)
      }
      const averageBlockTime = blockTimes.length > 0 
        ? blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length
        : 0
      
      // Get current gas price
      const gasPrice = await client.getGasPrice()
      const currentGasPrice = Number(formatGwei(gasPrice))
      
      // Update gas price history (keep last 10)
      const now = new Date()
      gasPriceHistory.push({
        time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
        value: currentGasPrice
      })
      gasPriceHistory = gasPriceHistory.slice(-10)
      
      // Calculate gas statistics
      const gasPrices = gasPriceHistory.map(g => g.value)
      const avgGasPrice = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length
      const minGasPrice = Math.min(...gasPrices)
      const maxGasPrice = Math.max(...gasPrices)
      
      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (gasPriceHistory.length > 1) {
        const recent = gasPriceHistory.slice(-3).map(g => g.value)
        const older = gasPriceHistory.slice(-6, -3).map(g => g.value)
        if (older.length > 0) {
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
          if (recentAvg > olderAvg * 1.05) trend = 'up'
          else if (recentAvg < olderAvg * 0.95) trend = 'down'
        }
      }
      
      // Calculate network utilization
      const avgGasUsed = historicalBlocks.reduce((sum, block) => 
        sum + Number(block.gasUsed), 0) / historicalBlocks.length
      const avgGasLimit = historicalBlocks.reduce((sum, block) => 
        sum + Number(block.gasLimit), 0) / historicalBlocks.length
      const networkUtilization = avgGasLimit > 0 ? (avgGasUsed / avgGasLimit) * 100 : 0
      
      // Prepare activity data for chart (last 7 blocks)
      const activityData = historicalBlocks.slice(-7).map(block => ({
        label: `#${block.number.toString().slice(-3)}`,
        blocks: 1,
        transactions: block.transactions,
        timestamp: Number(block.timestamp)
      }))
      
      return {
        totalBlocks: historicalBlocks.length,
        totalTransactions,
        averageBlockTime,
        averageGasPrice: avgGasPrice,
        networkUtilization,
        activityData,
        gasPriceData: {
          current: currentGasPrice,
          average: Number(avgGasPrice.toFixed(2)),
          low: Number(minGasPrice.toFixed(2)),
          high: Number(maxGasPrice.toFixed(2)),
          trend,
          history: gasPriceHistory
        },
        blockTimeData: blockTimes
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })
  
  useEffect(() => {
    if (data) {
      setStats(data)
    }
  }, [data])
  
  return { data: stats, isLoading, error }
}