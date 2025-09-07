import { useRotatingSponsors } from '@/hooks/use-sponsors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getTierConfig } from '@/config/sponsors.config'
import { cn } from '@/lib/utils'
import { Heart, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { SponsorTier } from '@/types/sponsor.types'

interface SponsorSidebarProps {
  tier?: SponsorTier
  className?: string
  title?: string
  compact?: boolean
}

export function SponsorSidebar({ 
  tier,
  className,
  title = "Sponsors",
  compact = false
}: SponsorSidebarProps) {
  const { sponsors, currentIndex } = useRotatingSponsors(tier, 8000)
  const [manualIndex, setManualIndex] = useState<number | null>(null)
  
  const displayIndex = manualIndex !== null ? manualIndex : currentIndex
  const currentSponsor = sponsors[displayIndex]

  if (!currentSponsor) return null

  const tierConfig = getTierConfig(currentSponsor.tier)

  const handlePrevious = () => {
    const newIndex = displayIndex > 0 ? displayIndex - 1 : sponsors.length - 1
    setManualIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex = displayIndex < sponsors.length - 1 ? displayIndex + 1 : 0
    setManualIndex(newIndex)
  }

  if (compact) {
    return (
      <div className={cn("rounded-lg border bg-gradient-to-br from-white to-gray-50 p-4", className)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              Sponsored
            </span>
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
            href={currentSponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="flex items-center gap-3">
              <img
                src={currentSponsor.logo}
                alt={currentSponsor.name}
                className="h-10 w-10 object-contain rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                  {currentSponsor.name}
                </p>
                {currentSponsor.tagline && (
                  <p className="text-xs text-gray-500 truncate">
                    {currentSponsor.tagline}
                  </p>
                )}
              </div>
              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-600" />
            </div>
          </a>

          {sponsors.length > 1 && (
            <div className="flex items-center justify-center gap-1">
              {sponsors.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualIndex(idx)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    idx === displayIndex 
                      ? "bg-blue-600 w-4" 
                      : "bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={`Go to sponsor ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            {title}
          </span>
          <span className="text-xs text-gray-500">
            {displayIndex + 1} / {sponsors.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Sponsor Logo and Info */}
          <a
            href={currentSponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="aspect-video bg-gray-50 rounded-lg p-4 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <img
                src={currentSponsor.logo}
                alt={currentSponsor.name}
                className="max-h-20 w-auto object-contain"
              />
            </div>
          </a>

          {/* Sponsor Details */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{currentSponsor.name}</h4>
                {tierConfig && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs mt-1",
                      tierConfig.bgColor,
                      tierConfig.color,
                      tierConfig.borderColor
                    )}
                  >
                    {tierConfig.displayName}
                  </Badge>
                )}
              </div>
            </div>
            
            {currentSponsor.description && (
              <p className="text-sm text-gray-600">
                {currentSponsor.description}
              </p>
            )}

            <a
              href={currentSponsor.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="w-full gap-1">
                Visit Website
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>

        {/* Navigation */}
        {sponsors.length > 1 && (
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevious}
              className="h-7 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {sponsors.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualIndex(idx)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    idx === displayIndex 
                      ? "bg-blue-600 w-3" 
                      : "bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={`Go to sponsor ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleNext}
              className="h-7 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="text-center pt-3 border-t">
          <a 
            href="https://github.com/sponsors/evmscan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Become a sponsor →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}