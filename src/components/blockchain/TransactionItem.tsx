import { Link } from 'react-router-dom'
import { formatHash } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, FileText, CheckCircle } from 'lucide-react'
import type { Transaction } from '@/types/blockchain.types'
import { formatEther } from 'viem'
import { useEffect, useState } from 'react'
import { abiService } from '@/services/abiService'
import AddressLink from './AddressLink'

interface TransactionItemProps {
  transaction: Transaction
  compact?: boolean
}

export default function TransactionItem({ transaction, compact = false }: TransactionItemProps) {
  const [decodedMethod, setDecodedMethod] = useState<string | null>(null)
  const value = formatEther(transaction.value)
  const timeSince = transaction.timestamp 
    ? Date.now() / 1000 - Number(transaction.timestamp)
    : 0
  const timeAgo = timeSince < 60 
    ? `${Math.floor(timeSince)}s ago`
    : timeSince < 3600 
    ? `${Math.floor(timeSince / 60)}m ago`
    : `${Math.floor(timeSince / 3600)}h ago`

  // Decode transaction method
  useEffect(() => {
    const decodeMethod = async () => {
      if (transaction.to && transaction.input && transaction.input !== '0x') {
        const result = await abiService.decodeFunctionCall(transaction.to, transaction.input)
        if (result) {
          setDecodedMethod(result.functionName)
        }
      }
    }
    decodeMethod()
  }, [transaction])

  const methodName = decodedMethod || abiService.getMethodSignature(transaction.input || '')

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded">
            <FileText className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/tx/${transaction.hash}`}
                className="text-blue-600 hover:text-blue-800 font-mono text-sm"
              >
                {formatHash(transaction.hash, 6)}
              </Link>
              {transaction.timestamp && (
                <span className="text-xs text-gray-500">{timeAgo}</span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
              <span>From</span>
              <AddressLink address={transaction.from} truncate={4} showBadge={false} className="text-blue-600 hover:text-blue-800 text-xs" />
              <ArrowRight className="h-3 w-3" />
              <span>To</span>
              {transaction.to ? (
                <AddressLink address={transaction.to} truncate={4} showBadge={false} className="text-blue-600 hover:text-blue-800 text-xs" />
              ) : (
                <span className="italic">Contract Creation</span>
              )}
              {transaction.input && transaction.input !== '0x' && (
                <Badge 
                  variant={decodedMethod ? "success" : "secondary"} 
                  className="ml-2 text-xs h-5 px-1.5"
                >
                  {methodName}
                  {decodedMethod && (
                    <CheckCircle className="ml-0.5 h-2.5 w-2.5" />
                  )}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {parseFloat(value) > 0 ? `${parseFloat(value).toFixed(4)} ETH` : '0 ETH'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Transaction</span>
              <Link 
                to={`/tx/${transaction.hash}`}
                className="font-mono text-blue-600 hover:text-blue-800"
              >
                {formatHash(transaction.hash)}
              </Link>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-gray-500">From</span>
              <AddressLink address={transaction.from} showBadge={false} />
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">To</span>
              {transaction.to ? (
                <AddressLink address={transaction.to} showBadge={false} />
              ) : (
                <span className="text-sm italic text-gray-500">Contract Creation</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold">
            {parseFloat(value) > 0 ? `${parseFloat(value).toFixed(4)} ETH` : '0 ETH'}
          </div>
          {transaction.blockNumber && (
            <div className="text-sm text-gray-500">
              Block{' '}
              <Link 
                to={`/block/${transaction.blockNumber}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {transaction.blockNumber.toString()}
              </Link>
            </div>
          )}
          <div className="text-sm text-gray-500">
            Gas: {transaction.gas.toString()}
          </div>
          {transaction.input && transaction.input !== '0x' && (
            <Badge 
              variant={decodedMethod ? "success" : "secondary"} 
              className="mt-1 text-xs"
            >
              {methodName}
              {decodedMethod && (
                <CheckCircle className="ml-1 h-3 w-3 inline" />
              )}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}