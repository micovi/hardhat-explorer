import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export type LoadingStateVariant = 'card' | 'table' | 'list' | 'text' | 'spinner' | 'custom'

export interface LoadingStateProps {
  variant?: LoadingStateVariant
  count?: number
  className?: string
  message?: string
  showSpinner?: boolean
  children?: React.ReactNode
}

export function LoadingState({
  variant = 'spinner',
  count = 1,
  className,
  message = "Loading...",
  showSpinner = true,
  children,
}: LoadingStateProps) {
  if (variant === 'custom' && children) {
    return <>{children}</>
  }

  if (variant === 'spinner') {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8", className)}>
        {showSpinner && (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        )}
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Table header */}
        <div className="flex gap-4 pb-2 border-b">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        {/* Table rows */}
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex gap-4 py-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn("", className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-3 w-24 ml-auto" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    )
  }

  return null
}