import { Activity, Blocks, TrendingUp, Zap, Clock, Users } from 'lucide-react'
import { useBlockchainStats } from '@/hooks/useBlockchain'
import StatsCard from '@/components/blockchain/StatsCard'
import LatestBlocks from '@/components/blockchain/LatestBlocks'
import LatestTransactions from '@/components/blockchain/LatestTransactions'
import { formatEther } from 'viem'

export default function HomePage() {
  const { data: stats } = useBlockchainStats()

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">Hardhat Block Explorer</h1>
        <p className="text-gray-500 mt-2">
          Monitor your local Hardhat blockchain in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Latest Block"
          value={stats?.latestBlockNumber?.toString() ?? '---'}
          subtitle="Current block height"
          icon={Blocks}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        <StatsCard
          title="Gas Price"
          value={stats?.gasPrice ? `${(Number(stats.gasPrice) / 1e9).toFixed(2)} Gwei` : '---'}
          subtitle="Current gas price"
          icon={Zap}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />

        <StatsCard
          title="Total Accounts"
          value={stats?.accounts ?? 0}
          subtitle="With balance"
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />

        <StatsCard
          title="Network"
          value="Active"
          subtitle={`Chain ID: ${stats?.chainId ?? '31337'}`}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
      </div>

      {/* Latest Blocks and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatestBlocks count={5} />
        <LatestTransactions count={5} />
      </div>
    </div>
  )
}