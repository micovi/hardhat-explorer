import type { Sponsor, SponsorshipConfig } from '@/types/sponsor.types'

export const sponsorshipConfig: SponsorshipConfig = {
  enabled: true,
  apiUrl: 'https://api.evmscan.io/sponsors', // Future API endpoint
  fallbackToStatic: true,
  rotationInterval: 5000, // 5 seconds for rotating displays
  showAmounts: false,
  tiers: [
    {
      tier: 'platinum',
      displayName: 'Platinum Sponsor',
      color: 'text-slate-900',
      bgColor: 'bg-gradient-to-r from-slate-200 to-slate-300',
      borderColor: 'border-slate-400',
      minAmount: 5000,
      maxLogos: 2,
      benefits: [
        'Premium placement on all pages',
        'Large logo display',
        'Featured case study',
        'Social media shoutouts',
        'Custom integration showcase'
      ],
      priority: 1
    },
    {
      tier: 'gold',
      displayName: 'Gold Sponsor',
      color: 'text-yellow-700',
      bgColor: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
      borderColor: 'border-yellow-400',
      minAmount: 2500,
      maxLogos: 4,
      benefits: [
        'Homepage placement',
        'Medium logo display',
        'Monthly social mention',
        'Documentation credits'
      ],
      priority: 2
    },
    {
      tier: 'silver',
      displayName: 'Silver Sponsor',
      color: 'text-gray-700',
      bgColor: 'bg-gradient-to-r from-gray-100 to-gray-200',
      borderColor: 'border-gray-400',
      minAmount: 1000,
      maxLogos: 6,
      benefits: [
        'Footer placement',
        'Small logo display',
        'Sponsors page listing'
      ],
      priority: 3
    },
    {
      tier: 'bronze',
      displayName: 'Bronze Sponsor',
      color: 'text-orange-700',
      bgColor: 'bg-gradient-to-r from-orange-100 to-orange-200',
      borderColor: 'border-orange-400',
      minAmount: 500,
      maxLogos: 8,
      benefits: [
        'Sponsors page listing',
        'Logo in rotation'
      ],
      priority: 4
    },
    {
      tier: 'supporter',
      displayName: 'Community Supporter',
      color: 'text-purple-700',
      bgColor: 'bg-gradient-to-r from-purple-100 to-purple-200',
      borderColor: 'border-purple-400',
      minAmount: 100,
      benefits: [
        'Name listing',
        'Discord role',
        'Early access'
      ],
      priority: 5
    }
  ]
}

// Static sponsor data (fallback or demo)
export const staticSponsors: Sponsor[] = [
  {
    id: 'sponsor-1',
    name: 'Ethereum Foundation',
    logo: 'https://ethereum.org/static/ethereum-logo-b775e3a1e4cbfcc4ff610d8d1b5a060d/31987/foundation-logo.png',
    website: 'https://ethereum.org',
    tier: 'platinum',
    description: 'Supporting open-source blockchain development',
    tagline: 'Building the future of decentralized applications',
    featured: true,
    socialLinks: {
      twitter: 'https://twitter.com/ethereum',
      github: 'https://github.com/ethereum'
    }
  },
  {
    id: 'sponsor-2',
    name: 'OpenZeppelin',
    logo: 'https://www.openzeppelin.com/hubfs/oz-iso-color-logo.svg',
    website: 'https://openzeppelin.com',
    tier: 'gold',
    description: 'The standard for secure blockchain applications',
    tagline: 'Security audits and smart contract libraries',
    socialLinks: {
      twitter: 'https://twitter.com/OpenZeppelin',
      github: 'https://github.com/OpenZeppelin'
    }
  },
  {
    id: 'sponsor-3',
    name: 'Chainlink',
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    website: 'https://chain.link',
    tier: 'gold',
    description: 'Decentralized oracle networks',
    tagline: 'Connecting smart contracts with real-world data'
  },
  {
    id: 'sponsor-4',
    name: 'Alchemy',
    logo: 'https://www.alchemy.com/images/alchemy-logo.svg',
    website: 'https://alchemy.com',
    tier: 'silver',
    description: 'Web3 development platform',
    tagline: 'Build and scale your dApp'
  },
  {
    id: 'sponsor-5',
    name: 'Hardhat',
    logo: 'https://hardhat.org/hardhat-logo.svg',
    website: 'https://hardhat.org',
    tier: 'silver',
    description: 'Ethereum development environment',
    tagline: 'Professional development for Ethereum'
  },
  {
    id: 'sponsor-6',
    name: 'WalletConnect',
    logo: 'https://walletconnect.com/static/logo.svg',
    website: 'https://walletconnect.com',
    tier: 'bronze',
    description: 'Open protocol for connecting wallets'
  },
  {
    id: 'sponsor-7',
    name: 'Tenderly',
    logo: 'https://tenderly.co/logos/tenderly-logo.svg',
    website: 'https://tenderly.co',
    tier: 'bronze',
    description: 'Smart contract monitoring and debugging'
  }
]

// Helper function to get sponsors by tier
export function getSponsorsByTier(tier: SponsorTier, sponsors: Sponsor[] = staticSponsors): Sponsor[] {
  return sponsors.filter(sponsor => sponsor.tier === tier)
}

// Helper function to get featured sponsors
export function getFeaturedSponsors(sponsors: Sponsor[] = staticSponsors): Sponsor[] {
  return sponsors.filter(sponsor => sponsor.featured)
}

// Helper function to get tier configuration
export function getTierConfig(tier: SponsorTier) {
  return sponsorshipConfig.tiers.find(t => t.tier === tier)
}