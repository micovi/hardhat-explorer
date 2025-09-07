import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  error?: Error | string | null
  title?: string
  description?: string
  retry?: () => void
  retryLabel?: string
  variant?: 'default' | 'destructive' | 'inline'
  className?: string
  showDetails?: boolean
}

export function ErrorState({
  error,
  title = "Something went wrong",
  description,
  retry,
  retryLabel = "Try again",
  variant = 'default',
  className,
  showDetails = process.env.NODE_ENV === 'development',
}: ErrorStateProps) {
  const errorMessage = description || (typeof error === 'string' 
    ? error 
    : error?.message || "An unexpected error occurred")

  const errorDetails = error instanceof Error ? error.stack : null

  if (variant === 'inline') {
    return (
      <Alert variant="destructive" className={cn("", className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-2">
            <p>{errorMessage}</p>
            {retry && (
              <Button
                variant="outline"
                size="sm"
                onClick={retry}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                {retryLabel}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (variant === 'destructive') {
    return (
      <div className={cn("rounded-lg border border-destructive/50 bg-destructive/10 p-6", className)}>
        <div className="flex flex-col items-center text-center">
          <XCircle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {errorMessage}
          </p>
          {retry && (
            <Button onClick={retry} variant="default" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </Button>
          )}
          {showDetails && errorDetails && (
            <details className="mt-4 w-full max-w-2xl">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Show error details
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded text-xs text-left overflow-auto max-h-48">
                {errorDetails}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  // Default variant - centered card style
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center max-w-md">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {errorMessage}
        </p>
        {retry && (
          <Button onClick={retry} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryLabel}
          </Button>
        )}
        {showDetails && errorDetails && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground text-center">
              Show error details
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-48">
              {errorDetails}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}