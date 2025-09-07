import { useRandomSponsor } from '@/hooks/use-sponsors'
import { getTierConfig } from '@/config/sponsors.config'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Sparkles, ExternalLink } from 'lucide-react'
import type { SponsorTier } from '@/types/sponsor.types'

interface SponsorSpotlightProps {
  tier?: SponsorTier
  className?: string
  variant?: 'inline' | 'card' | 'minimal'
}

export function SponsorSpotlight({ 
  tier = 'platinum',
  className,
  variant = 'inline'
}: SponsorSpotlightProps) {
  const sponsor = useRandomSponsor(tier)

  if (!sponsor) return null

  const tierConfig = getTierConfig(sponsor.tier)

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-gray-600", className)}>
        <span>Sponsored by</span>
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
        >
          {sponsor.name}
        </a>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "rounded-lg border p-4 bg-gradient-to-br",
        tierConfig?.bgColor || "from-gray-50 to-white",
        className
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-600">Featured Sponsor</span>
          </div>
          {tierConfig && (
            <Badge 
              variant="outline" 
              className={cn("text-xs", tierConfig.color)}
            >
              {tierConfig.tier}
            </Badge>
          )}
        </div>

        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="flex items-center gap-4">
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="h-12 w-12 object-contain rounded"
            />
            <div className="flex-1">
              <p className="font-medium group-hover:text-blue-600 transition-colors">
                {sponsor.name}
              </p>
              {sponsor.tagline && (
                <p className="text-xs text-gray-500">
                  {sponsor.tagline}
                </p>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
          </div>
        </a>
      </div>
    )
  }

  // Default inline variant
  return (
    <div className={cn(
      "inline-flex items-center gap-3 px-4 py-2 rounded-lg",
      "bg-gradient-to-r from-gray-50 to-white border",
      className
    )}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        <span className="text-sm text-gray-600">Sponsored by</span>
      </div>
      
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 group"
      >
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className="h-6 w-auto object-contain"
        />
        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {sponsor.name}
        </span>
        <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-600" />
      </a>

      {tierConfig && sponsor.tier === 'platinum' && (
        <Badge 
          variant="outline" 
          className={cn("text-xs ml-2", tierConfig.color)}
        >
          {tierConfig.displayName}
        </Badge>
      )}
    </div>
  )
}