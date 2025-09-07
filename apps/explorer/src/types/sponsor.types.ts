export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'supporter'

export interface Sponsor {
  id: string
  name: string
  logo: string
  website: string
  tier: SponsorTier
  description?: string
  tagline?: string
  featured?: boolean
  startDate?: string
  endDate?: string
  monthlyAmount?: number
  socialLinks?: {
    twitter?: string
    github?: string
    discord?: string
  }
  perks?: string[]
}

export interface SponsorTierConfig {
  tier: SponsorTier
  displayName: string
  color: string
  bgColor: string
  borderColor: string
  minAmount: number
  maxLogos?: number
  benefits: string[]
  priority: number
}

export interface SponsorshipConfig {
  enabled: boolean
  apiUrl?: string
  fallbackToStatic: boolean
  rotationInterval?: number
  showAmounts?: boolean
  tiers: SponsorTierConfig[]
}