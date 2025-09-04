import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FileText, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AddressLink from '@/components/blockchain/AddressLink'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useTransactions } from '@/hooks/useTransactions'
import { truncateAddress, formatHash } from '@/lib/utils'
import { formatEther, formatGwei } from 'viem'
import { abiService } from '@/services/abiService'
import type { Transaction } from '@/types/blockchain.types'

export default function TransactionListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Number(searchParams.get('page') || 1)
  const pageSize = 25
  const [decodedMethods, setDecodedMethods] = useState<Record<string, string>>({})
  const [abiDecodedMethods, setAbiDecodedMethods] = useState<Set<string>>(new Set())

  const { data, isLoading, error } = useTransactions({
    page: currentPage,
    pageSize
  })

  // Decode transaction methods using ABIs
  useEffect(() => {
    const decodeMethods = async () => {
      if (!data?.transactions) return
      
      const decoded: Record<string, string> = {}
      const abiDecoded = new Set<string>()
      
      for (const tx of data.transactions) {
        if (tx.to && tx.input && tx.input !== '0x') {
          const result = await abiService.decodeFunctionCall(tx.to, tx.input)
          if (result) {
            decoded[tx.hash] = result.functionName
            abiDecoded.add(tx.hash)
          } else {
            // Fall back to method signature
            decoded[tx.hash] = abiService.getMethodSignature(tx.input)
          }
        } else {
          decoded[tx.hash] = 'Transfer'
        }
      }
      
      setDecodedMethods(decoded)
      setAbiDecodedMethods(abiDecoded)
    }
    
    decodeMethods()
  }, [data])

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() })
  }

  const getMethodName = (tx: Transaction): string => {
    // First check if we have decoded data from ABI
    if (decodedMethods[tx.hash]) {
      return decodedMethods[tx.hash]
    }
    // Fall back to signature detection
    return abiService.getMethodSignature(tx.input || '')
  }

  const renderPaginationItems = () => {
    if (!data?.pagination) return null
    
    const { currentPage, totalPages } = data.pagination
    const items = []
    
    if (totalPages <= 1) return null
    
    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )
    
    // Show ellipsis if current page is far from start
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return items
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Transactions
        </h1>
        <p className="text-gray-500 mt-2">
          Browse all transactions on the Hardhat network
        </p>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions
            {data?.pagination && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({data.pagination.totalTransactions.toLocaleString()} found in last 100 blocks)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Failed to load transactions
            </div>
          ) : data?.transactions && data.transactions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Txn Hash</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead></TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Txn Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((tx) => {
                    const age = tx.timestamp 
                      ? Date.now() / 1000 - Number(tx.timestamp)
                      : 0
                    const ageFormatted = age < 60 
                      ? `${Math.floor(age)}s ago`
                      : age < 3600 
                      ? `${Math.floor(age / 60)}m ago`
                      : age < 86400
                      ? `${Math.floor(age / 3600)}h ago`
                      : `${Math.floor(age / 86400)}d ago`
                    
                    const value = formatEther(tx.value)
                    const gasPrice = tx.gasPrice || tx.maxFeePerGas || 0n
                    const gasFee = gasPrice && tx.gas 
                      ? formatEther(gasPrice * tx.gas)
                      : '0'
                    
                    const method = getMethodName(tx)
                    
                    // For now, assume all transactions succeed
                    // In real app, you'd check receipt.status
                    const status = 'success'
                    
                    return (
                      <TableRow key={tx.hash}>
                        <TableCell>
                          <Link 
                            to={`/tx/${tx.hash}`}
                            className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                          >
                            {formatHash(tx.hash, 8)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={abiDecodedMethods.has(tx.hash) ? "success" : "secondary"} 
                            className="font-mono text-xs flex items-center gap-1 w-fit"
                          >
                            {method}
                            {abiDecodedMethods.has(tx.hash) && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tx.blockNumber && (
                            <Link 
                              to={`/block/${tx.blockNumber}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {tx.blockNumber.toString()}
                            </Link>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {ageFormatted}
                        </TableCell>
                        <TableCell>
                          <AddressLink address={tx.from} />
                        </TableCell>
                        <TableCell>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </TableCell>
                        <TableCell>
                          {tx.to ? (
                            <AddressLink address={tx.to} />
                          ) : (
                            <Badge variant="warning">Contract Creation</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {parseFloat(value) > 0 ? `${parseFloat(value).toFixed(4)} ETH` : '0 ETH'}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-500">
                          {parseFloat(gasFee).toFixed(6)}
                        </TableCell>
                        <TableCell>
                          {status === 'success' ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {data.pagination && data.pagination.totalPages > 1 && (
                <div className="p-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {renderPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === data.pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  {/* Page info */}
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Showing transactions {((currentPage - 1) * pageSize) + 1} to{' '}
                    {Math.min(currentPage * pageSize, data.pagination.totalTransactions)} of{' '}
                    {data.pagination.totalTransactions.toLocaleString()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No transactions found in recent blocks
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}