import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2 } from 'lucide-react'
import TransactionItem from './TransactionItem'
import { useLatestTransactions } from '@/hooks/useBlockchain'

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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Failed to load transactions
          </div>
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
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        )}
      </CardContent>
    </Card>
  )
}