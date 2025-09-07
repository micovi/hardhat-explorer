import { Github, Heart } from 'lucide-react'
import { CloudCTA } from '@/components/common/cloud-cta'
import { SponsorBanner, SponsorCTA } from '@/components/sponsors'
import { featureFlags } from '@/config/features.config'

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      {/* Sponsor Banner - Only show if enabled */}
      {featureFlags.sponsors.enabled && featureFlags.sponsors.showBanner && (
        <SponsorBanner className="border-b" />
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Cloud CTA - Compact version - Only show if enabled */}
        {featureFlags.cloudCTA.enabled && featureFlags.cloudCTA.showFooter && (
          <CloudCTA variant="compact" />
        )}
        
        {/* Minimal Sponsor CTA - Show as fallback if sponsors enabled but no banner */}
        {featureFlags.sponsors.enabled && !featureFlags.sponsors.showBanner && (
          <SponsorCTA variant="compact" />
        )}
        
        {/* Footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 evmscan.org - Open source blockchain explorer for local EVM development
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://docs.evmscan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/evmscan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>for developers</span>
          </div>
        </div>
      </div>
    </footer>
  )
}