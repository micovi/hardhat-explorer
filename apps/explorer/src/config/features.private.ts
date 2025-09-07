export const FEATURES = {
  showCloudCTA: false,
  showSponsors: false,
  showPromotions: false,
  cloudUrl: '',
  cloudTagline: '',
  cloudDescription: '',
} as const;

export type Features = typeof FEATURES;