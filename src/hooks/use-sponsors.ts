import { useState, useEffect } from 'react'
import type { Sponsor, SponsorTier } from '@/types/sponsor.types'
import sponsorService from '@/services/sponsor.service'
import { sponsorshipConfig } from '@/config/sponsors.config'

export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>(sponsorService.getSponsors())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSponsors = async () => {
      setLoading(true)
      try {
        const data = await sponsorService.fetchSponsors()
        setSponsors(data)
      } finally {
        setLoading(false)
      }
    }

    fetchSponsors()
  }, [])

  return { sponsors, loading }
}

export function useSponsorsByTier(tier: SponsorTier) {
  const { sponsors, loading } = useSponsors()
  const filteredSponsors = sponsors.filter(s => s.tier === tier)
  
  return { sponsors: filteredSponsors, loading }
}

export function useFeaturedSponsors() {
  const { sponsors, loading } = useSponsors()
  const featuredSponsors = sponsors.filter(s => s.featured)
  
  return { sponsors: featuredSponsors, loading }
}

export function useRotatingSponsors(tier?: SponsorTier, interval?: number) {
  const { sponsors } = useSponsors()
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const filteredSponsors = tier 
    ? sponsors.filter(s => s.tier === tier)
    : sponsors

  useEffect(() => {
    if (filteredSponsors.length <= 1) return

    const rotationInterval = interval || sponsorshipConfig.rotationInterval || 5000
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredSponsors.length)
    }, rotationInterval)

    return () => clearInterval(timer)
  }, [filteredSponsors.length, interval])

  const currentSponsor = filteredSponsors[currentIndex] || null

  return { 
    sponsor: currentSponsor, 
    sponsors: filteredSponsors,
    currentIndex 
  }
}

export function useRandomSponsor(tier?: SponsorTier) {
  const { sponsors } = useSponsors()
  const [randomSponsor, setRandomSponsor] = useState<Sponsor | null>(null)

  useEffect(() => {
    const pool = tier 
      ? sponsors.filter(s => s.tier === tier)
      : sponsors
    
    if (pool.length > 0) {
      const random = pool[Math.floor(Math.random() * pool.length)]
      setRandomSponsor(random)
    }
  }, [sponsors, tier])

  return randomSponsor
}