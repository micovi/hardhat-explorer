import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, FileX } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DataTableColumn<TData> {
  accessorKey: keyof TData | string
  header: string | React.ReactNode
  cell?: (item: TData) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[]
  data: TData[] | undefined
  loading?: boolean
  error?: Error | string | null
  emptyMessage?: string
  emptyDescription?: string
  emptyIcon?: React.ElementType
  className?: string
  rowClassName?: string | ((item: TData, index: number) => string)
  skeletonRows?: number
  onRowClick?: (item: TData) => void
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = "No data found",
  emptyDescription = "There is no data to display at the moment.",
  emptyIcon: EmptyIcon = FileX,
  className,
  rowClassName,
  skeletonRows = 5,
  onRowClick,
}: DataTableProps<TData>) {
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const getCellValue = (item: TData, column: DataTableColumn<TData>): React.ReactNode => {
    if (column.cell) {
      return column.cell(item)
    }
    const value = getNestedValue(item, column.accessorKey as string)
    return value ?? '-'
  }

  const getRowClassName = (item: TData, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(item, index)
    }
    return rowClassName || ''
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-sm font-medium text-destructive">Error loading data</p>
          <p className="text-sm text-muted-foreground mt-1">
            {typeof error === 'string' ? error : error.message}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn("rounded-lg border bg-card", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <EmptyIcon className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground mt-1">{emptyDescription}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-muted/50",
                getRowClassName(item, rowIndex)
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {getCellValue(item, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}