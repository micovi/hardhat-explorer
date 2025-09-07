import { Heart, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SponsorCTAProps {
  variant?: 'default' | 'compact' | 'inline'
  className?: string
}

export function SponsorCTA({ variant = 'default', className }: SponsorCTAProps) {
  if (variant === 'inline') {
    return (
      <div className={cn("inline-flex items-center gap-2 text-sm", className)}>
        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
        <span className="text-gray-600">Support this project</span>
        <a
          href="https://github.com/sponsors/evmscan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Become a sponsor →
        </a>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center justify-between p-3 rounded-lg bg-gray-50 border", className)}>
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span className="text-sm text-gray-700">Love evmscan.org?</span>
        </div>
        <a
          href="https://github.com/sponsors/evmscan"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline">
            Sponsor Us
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </a>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("text-center p-6 rounded-lg border bg-gradient-to-r from-gray-50 to-white", className)}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-red-50">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Support Open Source</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Help us maintain and improve evmscan.org for the entire blockchain community
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <a
            href="https://github.com/sponsors/evmscan"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2">
              <Heart className="h-4 w-4" />
              Become a Sponsor
            </Button>
          </a>
          
          <a
            href="https://github.com/evmscan/explorer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              Star on GitHub
            </Button>
          </a>
        </div>

        <p className="text-xs text-gray-500">
          Your sponsorship directly supports development and hosting costs
        </p>
      </div>
    </div>
  )
}