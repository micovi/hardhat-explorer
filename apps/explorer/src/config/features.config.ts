// Feature flags configuration
// These are determined at build time based on the build variant
import { FEATURES } from './features'

export const featureFlags = {
  // Enable/disable sponsor displays
  sponsors: {
    enabled: FEATURES.showSponsors,
    showBanner: FEATURES.showSponsors,
    showHomepage: FEATURES.showSponsors,
  },
  
  // Enable/disable cloud CTA displays
  cloudCTA: {
    enabled: FEATURES.showCloudCTA,
    showBanner: FEATURES.showCloudCTA,
    showHomepage: FEATURES.showCloudCTA,
    showFooter: FEATURES.showCloudCTA,
    url: FEATURES.cloudUrl,
    tagline: FEATURES.cloudTagline,
    description: FEATURES.cloudDescription,
  },
  
  // Global toggle for all promotional content
  promotions: {
    enabled: FEATURES.showPromotions,
  }
}

// Helper functions
export const isSponsorsEnabled = () => 
  featureFlags.promotions.enabled && featureFlags.sponsors.enabled

export const isCloudCTAEnabled = () => 
  featureFlags.promotions.enabled && featureFlags.cloudCTA.enabled