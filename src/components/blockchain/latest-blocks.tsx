import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Blocks, ArrowRight } from 'lucide-react'
import BlockItem from './block-item'
import { useLatestBlocks } from '@/hooks/use-blockchain'
import { LoadingState } from '@/components/common/loading-state'
import { ErrorState } from '@/components/common/error-state'
import { EmptyState } from '@/components/common/empty-state'

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
          <LoadingState variant="list" count={count} />
        ) : error ? (
          <ErrorState 
            error={error}
            variant="inline"
            className="m-4"
          />
        ) : blocks && blocks.length > 0 ? (
          <div>
            {blocks.map((block) => (
              <BlockItem key={block.hash} block={block} compact />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Blocks}
            title="No blocks found"
            description="No blocks have been mined yet"
            variant="compact"
          />
        )}
      </CardContent>
    </Card>
  )
}