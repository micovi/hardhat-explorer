import { Link } from 'react-router-dom'
import { formatTimestamp, truncateAddress } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Blocks } from 'lucide-react'
import type { Block } from '@/types/blockchain.types'

interface BlockItemProps {
  block: Block
  compact?: boolean
}

export default function BlockItem({ block, compact = false }: BlockItemProps) {
  const timeSince = Date.now() / 1000 - Number(block.timestamp)
  const timeAgo = timeSince < 60 
    ? `${Math.floor(timeSince)}s ago`
    : timeSince < 3600 
    ? `${Math.floor(timeSince / 60)}m ago`
    : `${Math.floor(timeSince / 3600)}h ago`

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded">
            <Blocks className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <Link 
              to={`/block/${block.number}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {block.number.toString()}
            </Link>
            <div className="text-xs text-gray-500">{timeAgo}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm">
            Miner{' '}
            <Link 
              to={`/address/${block.miner}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {truncateAddress(block.miner)}
            </Link>
          </div>
          <div className="text-xs text-gray-500">
            {block.transactions.length} txns
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Blocks className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Block</span>
              <Link 
                to={`/block/${block.number}`}
                className="text-lg font-semibold text-blue-600 hover:text-blue-800"
              >
                {block.number.toString()}
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              {formatTimestamp(block.timestamp)}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div>
            <span className="text-gray-500 text-sm">Miner: </span>
            <Link 
              to={`/address/${block.miner}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {truncateAddress(block.miner, 6)}
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            {block.transactions.length} transactions
          </div>
          <div className="text-sm text-gray-500">
            Gas Used: {block.gasUsed.toString()}
          </div>
        </div>
      </div>
    </Card>
  )
}