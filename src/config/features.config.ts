// Feature flags configuration
// These can be overridden by environment variables

export const featureFlags = {
  // Enable/disable sponsor displays
  sponsors: {
    enabled: import.meta.env.VITE_ENABLE_SPONSORS === 'true' || false,
    showBanner: import.meta.env.VITE_SHOW_SPONSOR_BANNER === 'true' || false,
    showHomepage: import.meta.env.VITE_SHOW_SPONSOR_HOMEPAGE === 'true' || false,
  },
  
  // Enable/disable cloud CTA displays
  cloudCTA: {
    enabled: import.meta.env.VITE_ENABLE_CLOUD_CTA === 'true' || false,
    showBanner: import.meta.env.VITE_SHOW_CLOUD_BANNER === 'true' || false,
    showHomepage: import.meta.env.VITE_SHOW_CLOUD_HOMEPAGE === 'true' || false,
    showFooter: import.meta.env.VITE_SHOW_CLOUD_FOOTER === 'true' || false,
  },
  
  // Global toggle for all promotional content
  promotions: {
    enabled: import.meta.env.VITE_ENABLE_PROMOTIONS !== 'false', // Default to true
  }
}

// Helper functions
export const isSponsorsEnabled = () => 
  featureFlags.promotions.enabled && featureFlags.sponsors.enabled

export const isCloudCTAEnabled = () => 
  featureFlags.promotions.enabled && featureFlags.cloudCTA.enabled