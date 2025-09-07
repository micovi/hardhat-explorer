import { useSponsors } from '@/hooks/use-sponsors'
import { getTierConfig } from '@/config/sponsors.config'
import { cn } from '@/lib/utils'
import { Heart, Sparkles } from 'lucide-react'
import type { SponsorTier } from '@/types/sponsor.types'

interface SponsorBannerProps {
  tier?: SponsorTier
  className?: string
  showLabel?: boolean
  animated?: boolean
}

export function SponsorBanner({ 
  tier, 
  className, 
  showLabel = true,
  animated = true 
}: SponsorBannerProps) {
  const { sponsors, loading } = useSponsors()
  
  const filteredSponsors = tier 
    ? sponsors.filter(s => s.tier === tier)
    : sponsors.filter(s => s.tier === 'platinum' || s.tier === 'gold')

  if (loading || filteredSponsors.length === 0) return null

  const tierConfig = tier ? getTierConfig(tier) : null

  return (
    <div className={cn("bg-gradient-to-r from-gray-50 to-white border-y", className)}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {showLabel && (
            <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span className="font-medium">Sponsored by</span>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            <div className={cn(
              "flex items-center gap-8",
              animated && "animate-scroll"
            )}>
              {/* Duplicate for seamless scroll */}
              {[...filteredSponsors, ...filteredSponsors].map((sponsor, index) => (
                <a
                  key={`${sponsor.id}-${index}`}
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                  title={sponsor.name}
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>

          {tierConfig && (
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
              tierConfig.bgColor,
              tierConfig.color
            )}>
              {tierConfig.displayName}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}