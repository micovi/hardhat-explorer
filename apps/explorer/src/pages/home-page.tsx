import { Blocks, TrendingUp, Zap, Users } from 'lucide-react'
import { useBlockchainStats } from '@/hooks/use-blockchain'
import StatsCard from '@/components/blockchain/stats-card'
import LatestBlocks from '@/components/blockchain/latest-blocks'
import LatestTransactions from '@/components/blockchain/latest-transactions'
import { CloudCTA } from '@/components/common/cloud-cta'
import { SponsorCTA } from '@/components/sponsors'
import { featureFlags } from '@/config/features.config'


export default function HomePage() {
  const { data: stats } = useBlockchainStats()

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">evmscan.org</h1>
        <p className="text-gray-500 mt-2">
          Monitor your local EVM blockchain in real-time
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

      {/* Cloud CTA - Only show if enabled */}
      {featureFlags.cloudCTA.enabled && featureFlags.cloudCTA.showHomepage && (
        <CloudCTA />
      )}

      {/* Latest Blocks and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatestBlocks count={5} />
        <LatestTransactions count={5} />
      </div>

      {/* Minimal Sponsor CTA - Only show if enabled */}
      {featureFlags.sponsors.enabled && featureFlags.sponsors.showHomepage && (
        <SponsorCTA />
      )}
    </div>
  )
}