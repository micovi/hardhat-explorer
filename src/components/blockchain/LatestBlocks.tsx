import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Blocks, ArrowRight, Loader2 } from 'lucide-react'
import BlockItem from './BlockItem'
import { useLatestBlocks } from '@/hooks/useBlockchain'

interface LatestBlocksProps {
  count?: number
}

export default function LatestBlocks({ count = 5 }: LatestBlocksProps) {
  const { data: blocks, isLoading, error } = useLatestBlocks(count)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Blocks className="h-5 w-5" />
          <span>Latest Blocks</span>
        </CardTitle>
        <Link to="/blocks">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Failed to load blocks
          </div>
        ) : blocks && blocks.length > 0 ? (
          <div>
            {blocks.map((block) => (
              <BlockItem key={block.hash} block={block} compact />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No blocks found
          </div>
        )}
      </CardContent>
    </Card>
  )
}