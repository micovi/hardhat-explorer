import { useSearchParams, useNavigate } from 'react-router-dom'
import { Blocks } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/common/data-table'
import type { DataTableColumn } from '@/components/common/data-table'
import { DataTablePagination } from '@/components/common/data-table'
import { useBlocks } from '@/hooks/use-blocks'
import { truncateAddress, formatTimestamp } from '@/lib/utils'
import { Link } from 'react-router-dom'
import type { Block } from '@/types/blockchain.types'

export default function BlockListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentPage = Number(searchParams.get('page') || 1)
  const pageSize = 25

  const { data, isLoading, error } = useBlocks({
    page: currentPage,
    pageSize
  })

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() })
  }

  const columns: DataTableColumn<Block>[] = [
    {
      accessorKey: 'number',
      header: 'Block',
      cell: (block) => (
        <Link 
          to={`/block/${block.number}`}
          className="text-blue-600 hover:text-blue-800 font-mono"
          onClick={(e) => e.stopPropagation()}
        >
          {block.number.toString()}
        </Link>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: 'Age',
      cell: (block) => {
        const age = Date.now() / 1000 - Number(block.timestamp)
        const ageFormatted = age < 60 
          ? `${Math.floor(age)}s ago`
          : age < 3600 
          ? `${Math.floor(age / 60)}m ago`
          : age < 86400
          ? `${Math.floor(age / 3600)}h ago`
          : `${Math.floor(age / 86400)}d ago`
        
        return (
          <span title={formatTimestamp(block.timestamp)}>
            {ageFormatted}
          </span>
        )
      },
    },
    {
      accessorKey: 'transactions',
      header: 'Txn Count',
      cell: (block) => block.transactions.length,
    },
    {
      accessorKey: 'miner',
      header: 'Miner',
      cell: (block) => (
        <Link 
          to={`/address/${block.miner}`}
          className="text-blue-600 hover:text-blue-800 font-mono text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {truncateAddress(block.miner, 6)}
        </Link>
      ),
    },
    {
      accessorKey: 'gasUsed',
      header: 'Gas Used',
      cell: (block) => {
        const gasUsedPercentage = block.gasLimit > 0n
          ? (Number(block.gasUsed) / Number(block.gasLimit) * 100).toFixed(2)
          : '0'
        
        return (
          <div>
            <div className="font-mono text-sm">{block.gasUsed.toString()}</div>
            <div className="text-xs text-gray-500">({gasUsedPercentage}%)</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'gasLimit',
      header: 'Gas Limit',
      cell: (block) => (
        <span className="font-mono text-sm">{block.gasLimit.toString()}</span>
      ),
    },
    {
      accessorKey: 'baseFeePerGas',
      header: 'Base Fee',
      cell: (block) => (
        <span className="font-mono text-sm">
          {block.baseFeePerGas 
            ? `${(Number(block.baseFeePerGas) / 1e9).toFixed(2)} Gwei`
            : 'N/A'
          }
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Blocks className="h-8 w-8" />
          Blocks
        </h1>
        <p className="text-gray-500 mt-2">
          Browse all blocks on the local EVM network
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
          <DataTable
            columns={columns}
            data={data?.blocks}
            loading={isLoading}
            error={error}
            emptyMessage="No blocks found"
            emptyDescription="No blocks have been mined yet on this network."
            emptyIcon={Blocks}
            onRowClick={(block) => navigate(`/block/${block.number}`)}
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
                Showing blocks {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, data.pagination.totalBlocks)} of{' '}
                {data.pagination.totalBlocks.toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}