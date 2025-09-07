import { useSponsors } from '@/hooks/use-sponsors'
import { getTierConfig } from '@/config/sponsors.config'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ExternalLink, Heart } from 'lucide-react'

interface SponsorGridProps {
  maxSponsors?: number
  className?: string
  showTiers?: boolean
}

export function SponsorGrid({ 
  maxSponsors = 8, 
  className,
  showTiers = true 
}: SponsorGridProps) {
  const { sponsors, loading } = useSponsors()

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-video bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const displaySponsors = sponsors.slice(0, maxSponsors)

  if (displaySponsors.length === 0) return null

  // Group sponsors by tier
  const sponsorsByTier = displaySponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) acc[sponsor.tier] = []
    acc[sponsor.tier].push(sponsor)
    return acc
  }, {} as Record<string, typeof displaySponsors>)

  const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'supporter']

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            Our Sponsors
          </h3>
          <a 
            href="https://github.com/sponsors/evmscan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Become a sponsor
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="space-y-6">
          {tierOrder.map(tier => {
            const tierSponsors = sponsorsByTier[tier]
            if (!tierSponsors || tierSponsors.length === 0) return null

            const tierConfig = getTierConfig(tier as any)
            if (!tierConfig) return null

            return (
              <div key={tier} className="space-y-3">
                {showTiers && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        tierConfig.bgColor,
                        tierConfig.color,
                        tierConfig.borderColor
                      )}
                    >
                      {tierConfig.displayName}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      ${tierConfig.minAmount}+ / month
                    </span>
                  </div>
                )}

                <div className={cn(
                  "grid gap-4",
                  tier === 'platinum' && "grid-cols-1 md:grid-cols-2",
                  tier === 'gold' && "grid-cols-2 md:grid-cols-3",
                  tier === 'silver' && "grid-cols-3 md:grid-cols-4",
                  (tier === 'bronze' || tier === 'supporter') && "grid-cols-4 md:grid-cols-5"
                )}>
                  {tierSponsors.map(sponsor => (
                    <a
                      key={sponsor.id}
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group relative rounded-lg border bg-white p-4 transition-all hover:shadow-md",
                        tier === 'platinum' && "p-6",
                        tier === 'gold' && "p-5"
                      )}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className={cn(
                            "object-contain transition-transform group-hover:scale-105",
                            tier === 'platinum' && "h-16 w-auto",
                            tier === 'gold' && "h-12 w-auto",
                            tier === 'silver' && "h-10 w-auto",
                            (tier === 'bronze' || tier === 'supporter') && "h-8 w-auto"
                          )}
                        />
                        {(tier === 'platinum' || tier === 'gold') && (
                          <div className="text-center">
                            <p className="text-sm font-medium">{sponsor.name}</p>
                            {sponsor.tagline && (
                              <p className="text-xs text-gray-500 mt-1">
                                {sponsor.tagline}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {sponsor.featured && (
                        <Badge 
                          className="absolute -top-2 -right-2 text-xs"
                          variant="default"
                        >
                          Featured
                        </Badge>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-sm text-gray-600">
            Your sponsorship helps us maintain and improve evmscan.org for the community
          </p>
        </div>
      </div>
    </Card>
  )
}