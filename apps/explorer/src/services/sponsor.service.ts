import type { Sponsor, SponsorTier } from '@/types/sponsor.types'
import { sponsorshipConfig, staticSponsors, getSponsorsByTier } from '@/config/sponsors.config'

class SponsorService {
  private sponsors: Sponsor[] = []
  private lastFetch: number = 0
  private fetchInterval = 3600000 // 1 hour cache
  private isLoading = false

  constructor() {
    // Initialize with static sponsors
    this.sponsors = staticSponsors
    // Attempt to fetch fresh data
    this.fetchSponsors()
  }

  async fetchSponsors(): Promise<Sponsor[]> {
    if (!sponsorshipConfig.enabled) {
      return this.sponsors
    }

    // Check cache
    const now = Date.now()
    if (this.isLoading || (now - this.lastFetch < this.fetchInterval && this.sponsors.length > 0)) {
      return this.sponsors
    }

    this.isLoading = true

    try {
      if (sponsorshipConfig.apiUrl) {
        const response = await fetch(sponsorshipConfig.apiUrl)
        if (response.ok) {
          const data = await response.json()
          this.sponsors = data.sponsors || []
          this.lastFetch = now
          this.saveToLocalStorage(this.sponsors)
        }
      }
    } catch (error) {
      console.error('Failed to fetch sponsors:', error)
      // Try to load from localStorage
      const cached = this.loadFromLocalStorage()
      if (cached.length > 0) {
        this.sponsors = cached
      } else if (sponsorshipConfig.fallbackToStatic) {
        this.sponsors = staticSponsors
      }
    } finally {
      this.isLoading = false
    }

    return this.sponsors
  }

  private saveToLocalStorage(sponsors: Sponsor[]): void {
    try {
      localStorage.setItem('evmscan_sponsors', JSON.stringify({
        sponsors,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Failed to save sponsors to localStorage:', error)
    }
  }

  private loadFromLocalStorage(): Sponsor[] {
    try {
      const stored = localStorage.getItem('evmscan_sponsors')
      if (stored) {
        const data = JSON.parse(stored)
        // Check if data is not too old (7 days)
        if (Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return data.sponsors
        }
      }
    } catch (error) {
      console.error('Failed to load sponsors from localStorage:', error)
    }
    return []
  }

  getSponsors(): Sponsor[] {
    return this.sponsors
  }

  getSponsorsByTier(tier: SponsorTier): Sponsor[] {
    return getSponsorsByTier(tier, this.sponsors)
  }

  getFeaturedSponsors(): Sponsor[] {
    return this.sponsors.filter(s => s.featured)
  }

  getTopSponsors(limit: number = 6): Sponsor[] {
    const tierPriority: Record<SponsorTier, number> = {
      platinum: 1,
      gold: 2,
      silver: 3,
      bronze: 4,
      supporter: 5
    }

    return [...this.sponsors]
      .sort((a, b) => {
        // First sort by featured
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        // Then by tier
        return tierPriority[a.tier] - tierPriority[b.tier]
      })
      .slice(0, limit)
  }

  getRandomSponsor(tier?: SponsorTier): Sponsor | null {
    const pool = tier ? this.getSponsorsByTier(tier) : this.sponsors
    if (pool.length === 0) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // Get sponsors for rotation display
  getRotatingSponsors(tier?: SponsorTier): Sponsor[] {
    const pool = tier ? this.getSponsorsByTier(tier) : this.sponsors
    // Shuffle array for rotation
    return [...pool].sort(() => Math.random() - 0.5)
  }

  // Check if a sponsor is currently active
  isSponsorActive(sponsor: Sponsor): boolean {
    const now = new Date()
    if (sponsor.startDate && new Date(sponsor.startDate) > now) return false
    if (sponsor.endDate && new Date(sponsor.endDate) < now) return false
    return true
  }

  // Get only active sponsors
  getActiveSponsors(): Sponsor[] {
    return this.sponsors.filter(s => this.isSponsorActive(s))
  }
}

// Export singleton instance
export const sponsorService = new SponsorService()

// Export for React hooks
export default sponsorService