import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight } from 'lucide-react'
import TransactionItem from './transaction-item'
import { useLatestTransactions } from '@/hooks/use-blockchain'
import { LoadingState } from '@/components/common/loading-state'
import { ErrorState } from '@/components/common/error-state'
import { EmptyState } from '@/components/common/empty-state'

interface LatestTransactionsProps {
  count?: number
}

export default function LatestTransactions({ count = 5 }: LatestTransactionsProps) {
  const { data: transactions, isLoading, error } = useLatestTransactions(count)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Latest Transactions</span>
        </CardTitle>
        <Link to="/txs">
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
        ) : transactions && transactions.length > 0 ? (
          <div>
            {transactions.map((transaction) => (
              <TransactionItem 
                key={transaction.hash} 
                transaction={transaction} 
                compact 
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={FileText}
            title="No transactions found"
            description="No transactions have been sent yet"
            variant="compact"
          />
        )}
      </CardContent>
    </Card>
  )
}