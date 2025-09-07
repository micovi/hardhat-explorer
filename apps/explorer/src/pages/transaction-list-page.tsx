import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FileText, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/common/data-table'
import type { DataTableColumn } from '@/components/common/data-table'
import { DataTablePagination } from '@/components/common/data-table'
import AddressLink from '@/components/blockchain/address-link'
import { useTransactions } from '@/hooks/use-transactions'
import { formatHash } from '@/lib/utils'
import { formatEther, formatGwei } from 'viem'
import { abiService } from '@/services/abi.service'
import type { Transaction } from '@/types/blockchain.types'

export default function TransactionListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentPage = Number(searchParams.get('page') || 1)
  const pageSize = 25
  const [decodedMethods, setDecodedMethods] = useState<Record<string, string>>({})

  const { data, isLoading, error } = useTransactions({
    page: currentPage,
    pageSize
  })

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() })
  }

  // Decode transaction methods
  useEffect(() => {
    const decodeTransactions = async () => {
      if (!data?.transactions) return

      const newDecodedMethods: Record<string, string> = {}
      
      for (const tx of data.transactions) {
        if (tx.to && tx.input && tx.input !== '0x' && tx.input.length >= 10) {
          try {
            const methodName = await abiService.getMethodName(tx.to, tx.input)
            if (methodName) {
              newDecodedMethods[tx.hash] = methodName
            }
          } catch (err) {
            // Silent fail for decoding errors
          }
        }
      }

      setDecodedMethods(prev => ({ ...prev, ...newDecodedMethods }))
    }

    decodeTransactions()
  }, [data?.transactions])

  const getMethodDisplay = (tx: Transaction): string => {
    // Check if we have a decoded method from ABI
    if (decodedMethods[tx.hash]) {
      return decodedMethods[tx.hash]
    }

    // Simple transfer
    if (tx.input === '0x' || !tx.input || tx.input === '0x0') {
      return 'Transfer'
    }

    // Contract deployment
    if (!tx.to) {
      return 'Contract Creation'
    }

    // Try to identify common method signatures
    const methodSig = tx.input.slice(0, 10)
    const commonMethods: Record<string, string> = {
      '0xa9059cbb': 'transfer',
      '0x23b872dd': 'transferFrom',
      '0x095ea7b3': 'approve',
      '0x70a08231': 'balanceOf',
      '0x18160ddd': 'totalSupply',
      '0x313ce567': 'decimals',
      '0x06fdde03': 'name',
      '0x95d89b41': 'symbol',
      '0xa0712d68': 'mint',
      '0x40c10f19': 'mint',
      '0x42966c68': 'burn'
    }

    return commonMethods[methodSig] || 'Contract Call'
  }

  const columns: DataTableColumn<Transaction>[] = [
    {
      accessorKey: 'hash',
      header: 'Transaction Hash',
      cell: (tx) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <a
            href={`/tx/${tx.hash}`}
            className="text-blue-600 hover:text-blue-800 font-mono text-sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigate(`/tx/${tx.hash}`)
            }}
          >
            {formatHash(tx.hash)}
          </a>
        </div>
      )
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: (tx) => {
        const method = getMethodDisplay(tx)
        const isContractCreation = !tx.to
        
        return (
          <Badge 
            variant={isContractCreation ? "secondary" : "outline"}
            className="font-mono text-xs"
          >
            {method}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'blockNumber',
      header: 'Block',
      cell: (tx) => (
        <a
          href={`/block/${tx.blockNumber}`}
          className="text-blue-600 hover:text-blue-800 font-mono"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigate(`/block/${tx.blockNumber}`)
          }}
        >
          {tx.blockNumber?.toString() || 'Pending'}
        </a>
      )
    },
    {
      accessorKey: 'from',
      header: 'From',
      cell: (tx) => <AddressLink address={tx.from} truncate={6} />
    },
    {
      accessorKey: 'to',
      header: 'To',
      cell: (tx) => tx.to ? (
        <AddressLink address={tx.to} truncate={6} />
      ) : (
        <Badge variant="secondary" className="text-xs">
          Contract Creation
        </Badge>
      )
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: (tx) => {
        const value = Number(formatEther(tx.value))
        return (
          <span className="font-mono text-sm">
            {value > 0 ? `${value.toFixed(4)} ETH` : '0 ETH'}
          </span>
        )
      }
    },
    {
      accessorKey: 'gasPrice',
      header: 'Gas Fee',
      cell: (tx) => {
        const gasPrice = tx.gasPrice || 0n
        const gasUsed = tx.gas || 0n
        const gasFee = gasPrice * gasUsed
        
        return (
          <div className="text-right">
            <div className="font-mono text-sm">
              {Number(formatEther(gasFee)).toFixed(6)} ETH
            </div>
            <div className="text-xs text-gray-500">
              {Number(formatGwei(gasPrice)).toFixed(2)} Gwei
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (tx) => {
        // For our purposes, we'll assume all mined transactions are successful
        // In a real implementation, you'd check the receipt status
        const isSuccess = tx.blockNumber !== null
        
        return isSuccess ? (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        ) : (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      }
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Transactions
        </h1>
        <p className="text-gray-500 mt-2">
          Browse all transactions on the local EVM network
        </p>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions
            {data?.pagination && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({data.pagination.totalTransactions.toLocaleString()} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data?.transactions}
            loading={isLoading}
            error={error}
            emptyMessage="No transactions found"
            emptyDescription="No transactions have been sent on this network yet."
            emptyIcon={FileText}
            onRowClick={(tx) => navigate(`/tx/${tx.hash}`)}
            skeletonRows={10}
          />
          
          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="p-4 border-t">
              <DataTablePagination
                currentPage={currentPage}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
              />
              
              {/* Page info */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Showing transactions {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, data.pagination.totalTransactions)} of{' '}
                {data.pagination.totalTransactions.toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}