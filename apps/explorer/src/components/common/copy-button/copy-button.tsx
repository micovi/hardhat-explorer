import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CopyButtonProps {
  value: string
  label?: string
  successLabel?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  className?: string
  iconOnly?: boolean
  onCopy?: () => void
}

export function CopyButton({
  value,
  label = "Copy to clipboard",
  successLabel = "Copied!",
  size = 'icon',
  variant = 'ghost',
  className,
  iconOnly = true,
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const buttonContent = (
    <>
      {copied ? (
        <Check className={cn("h-4 w-4", !iconOnly && "mr-2")} />
      ) : (
        <Copy className={cn("h-4 w-4", !iconOnly && "mr-2")} />
      )}
      {!iconOnly && (copied ? successLabel : label)}
    </>
  )

  if (iconOnly) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleCopy}
              className={cn(
                "transition-all",
                copied && "text-green-600",
                className
              )}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? successLabel : label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "transition-all",
        copied && "text-green-600",
        className
      )}
    >
      {buttonContent}
    </Button>
  )
}