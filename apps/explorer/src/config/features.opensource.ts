export const FEATURES = {
  showCloudCTA: true,
  showSponsors: true,
  showPromotions: true,
  cloudUrl: 'https://evmscan.io',
  cloudTagline: 'Need a hosted solution? Try evmscan.io cloud',
  cloudDescription: 'Get enterprise-grade blockchain exploration with zero setup. Real-time data, advanced analytics, and team collaboration.',
} as const;

export type Features = typeof FEATURES;