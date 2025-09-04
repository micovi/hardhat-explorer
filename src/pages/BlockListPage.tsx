import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Blocks, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useBlocks } from '@/hooks/useBlocks'
import { truncateAddress, formatTimestamp } from '@/lib/utils'
import { formatEther } from 'viem'

export default function BlockListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Number(searchParams.get('page') || 1)
  const pageSize = 25

  const { data, isLoading, error } = useBlocks({
    page: currentPage,
    pageSize
  })

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() })
  }

  const renderPaginationItems = () => {
    if (!data?.pagination) return null
    
    const { currentPage, totalPages } = data.pagination
    const items = []
    
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
          <Blocks className="h-8 w-8" />
          Blocks
        </h1>
        <p className="text-gray-500 mt-2">
          Browse all blocks on the Hardhat network
        </p>
      </div>

      {/* Blocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Blocks
            {data?.pagination && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({data.pagination.totalBlocks.toLocaleString()} total)
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
              Failed to load blocks
            </div>
          ) : data?.blocks && data.blocks.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Txn Count</TableHead>
                    <TableHead>Miner</TableHead>
                    <TableHead>Gas Used</TableHead>
                    <TableHead>Gas Limit</TableHead>
                    <TableHead>Base Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.blocks.map((block) => {
                    const age = Date.now() / 1000 - Number(block.timestamp)
                    const ageFormatted = age < 60 
                      ? `${Math.floor(age)}s ago`
                      : age < 3600 
                      ? `${Math.floor(age / 60)}m ago`
                      : age < 86400
                      ? `${Math.floor(age / 3600)}h ago`
                      : `${Math.floor(age / 86400)}d ago`
                    
                    const gasUsedPercentage = block.gasLimit > 0n
                      ? (Number(block.gasUsed) / Number(block.gasLimit) * 100).toFixed(2)
                      : '0'
                    
                    return (
                      <TableRow key={block.hash}>
                        <TableCell>
                          <Link 
                            to={`/block/${block.number}`}
                            className="text-blue-600 hover:text-blue-800 font-mono"
                          >
                            {block.number.toString()}
                          </Link>
                        </TableCell>
                        <TableCell title={formatTimestamp(block.timestamp)}>
                          {ageFormatted}
                        </TableCell>
                        <TableCell>{block.transactions.length}</TableCell>
                        <TableCell>
                          <Link 
                            to={`/address/${block.miner}`}
                            className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                          >
                            {truncateAddress(block.miner, 6)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-mono text-sm">{block.gasUsed.toString()}</div>
                            <div className="text-xs text-gray-500">({gasUsedPercentage}%)</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {block.gasLimit.toString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {block.baseFeePerGas 
                            ? `${(Number(block.baseFeePerGas) / 1e9).toFixed(2)} Gwei`
                            : 'N/A'
                          }
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
                    Showing blocks {((currentPage - 1) * pageSize) + 1} to{' '}
                    {Math.min(currentPage * pageSize, data.pagination.totalBlocks)} of{' '}
                    {data.pagination.totalBlocks.toLocaleString()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No blocks found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}