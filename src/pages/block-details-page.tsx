import { useParams, Link } from 'react-router-dom'
import { Blocks, ArrowLeft, ArrowRight, CheckCircle, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useBlock } from '@/hooks/use-blocks'
import { truncateAddress, formatTimestamp, formatHash } from '@/lib/utils'
import { formatEther } from 'viem'
import TransactionItem from '@/components/blockchain/transaction-item'
import { CopyButton } from '@/components/common/copy-button'
import { LoadingState } from '@/components/common/loading-state'
import { ErrorState } from '@/components/common/error-state'
import { EmptyState } from '@/components/common/empty-state'

export default function BlockDetailsPage() {
  const { blockNumber } = useParams<{ blockNumber: string }>()
  const { data: block, isLoading, error } = useBlock(blockNumber || '0')

  if (isLoading) {
    return (
      <div className="min-h-[400px]">
        <LoadingState variant="card" count={2} />
      </div>
    )
  }

  if (error || !block) {
    return (
      <ErrorState
        error={error || "Block not found"}
        title="Block Not Found"
        description={`Block #${blockNumber} could not be found`}
        retry={() => window.location.reload()}
        action={
          <Link to="/blocks">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blocks
            </Button>
          </Link>
        }
      />
    )
  }

  const gasUsedPercentage = block.gasLimit > 0n
    ? (Number(block.gasUsed) / Number(block.gasLimit) * 100).toFixed(2)
    : '0'

  const blockReward = formatEther(BigInt(2e18)) // Standard 2 ETH block reward

  return (
    <div className="space-y-6">
      {/* Page Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Blocks className="h-8 w-8" />
            Block #{block.number.toString()}
          </h1>
          <p className="text-gray-500 mt-2">
            {formatTimestamp(block.timestamp)}
          </p>
        </div>
        
        {/* Block Navigation */}
        <div className="flex items-center gap-2">
          <Link to={`/block/${Number(block.number) - 1}`}>
            <Button variant="outline" size="sm" disabled={block.number === 0n}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-sm text-gray-500">Block Navigation</span>
          <Link to={`/block/${Number(block.number) + 1}`}>
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Block Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Block Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Block Height:</label>
                <p className="font-mono font-medium">{block.number.toString()}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Timestamp:</label>
                <p className="font-medium">{formatTimestamp(block.timestamp)}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Transactions:</label>
                <p className="font-medium">{block.transactions.length} transactions</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Mined by:</label>
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/address/${block.miner}`}
                    className="text-blue-600 hover:text-blue-800 font-mono"
                  >
                    {truncateAddress(block.miner, 8)}
                  </Link>
                  <CopyButton
                    value={block.miner}
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Block Reward:</label>
                <p className="font-medium">{blockReward} ETH</p>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Gas Used:</label>
                <div>
                  <p className="font-mono font-medium">{block.gasUsed.toString()}</p>
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all"
                        style={{ width: `${gasUsedPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{gasUsedPercentage}% of gas limit</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Gas Limit:</label>
                <p className="font-mono font-medium">{block.gasLimit.toString()}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Base Fee Per Gas:</label>
                <p className="font-mono font-medium">
                  {block.baseFeePerGas 
                    ? `${(Number(block.baseFeePerGas) / 1e9).toFixed(4)} Gwei`
                    : 'N/A'
                  }
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Total Difficulty:</label>
                <p className="font-mono font-medium">
                  {block.totalDifficulty?.toString() ?? 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Size:</label>
                <p className="font-mono font-medium">
                  {block.size ? `${block.size.toString()} bytes` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Hashes Section */}
          <div className="mt-6 pt-6 border-t space-y-4">
            <div>
              <label className="text-sm text-gray-500">Hash:</label>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm break-all">{block.hash}</p>
                <CopyButton
                  value={block.hash}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-500">Parent Hash:</label>
              <div className="flex items-center gap-2">
                <Link 
                  to={`/block/${Number(block.number) - 1}`}
                  className="text-blue-600 hover:text-blue-800 font-mono text-sm break-all"
                >
                  {block.parentHash}
                </Link>
                <CopyButton
                  value={block.parentHash}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                />
              </div>
            </div>
            
            {block.stateRoot && (
              <div>
                <label className="text-sm text-gray-500">State Root:</label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all">{block.stateRoot}</p>
                  <CopyButton
                    value={block.stateRoot}
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 flex-shrink-0"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions in Block */}
      {block.transactions && block.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Transactions ({block.transactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div>
              {block.transactions.map((tx: any) => (
                <TransactionItem 
                  key={tx.hash}
                  transaction={{
                    ...tx,
                    blockNumber: block.number,
                    blockHash: block.hash,
                    timestamp: block.timestamp
                  }}
                  compact
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for No Transactions */}
      {(!block.transactions || block.transactions.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Activity}
              title="No transactions in this block"
              description="This block contains no transactions"
              variant="compact"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}