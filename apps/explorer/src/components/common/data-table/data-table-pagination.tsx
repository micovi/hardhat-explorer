import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

export interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showEllipsis?: boolean
  siblingCount?: number
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showEllipsis = true,
  siblingCount = 1,
}: DataTablePaginationProps) {
  const generatePaginationItems = () => {
    const items: (number | 'ellipsis')[] = []
    const leftSibling = Math.max(currentPage - siblingCount, 1)
    const rightSibling = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftEllipsis = leftSibling > 2
    const shouldShowRightEllipsis = rightSibling < totalPages - 1

    // First page
    items.push(1)

    // Left ellipsis
    if (shouldShowLeftEllipsis && showEllipsis) {
      items.push('ellipsis')
    } else if (leftSibling > 2) {
      // Add page 2 if no ellipsis but gap exists
      items.push(2)
    }

    // Sibling pages
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(i)
      }
    }

    // Right ellipsis
    if (shouldShowRightEllipsis && showEllipsis) {
      items.push('ellipsis')
    } else if (rightSibling < totalPages - 1) {
      // Add second to last page if no ellipsis but gap exists
      items.push(totalPages - 1)
    }

    // Last page
    if (totalPages > 1) {
      items.push(totalPages)
    }

    return items
  }

  if (totalPages <= 1) {
    return null
  }

  const paginationItems = generatePaginationItems()

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={cn(
              currentPage === 1 && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>

        {paginationItems.map((item, index) => (
          <PaginationItem key={index}>
            {item === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(item)}
                isActive={currentPage === item}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={cn(
              currentPage === totalPages && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}