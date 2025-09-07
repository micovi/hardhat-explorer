import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { SponsorCTA } from '@/components/sponsors'
import { featureFlags } from '@/config/features.config'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/og.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* 404 Error */}
          <div>
            <h1 className="text-9xl font-bold text-white/90 animate-pulse">404</h1>
            <p className="text-2xl font-semibold text-white/80 mt-4">
              Page Not Found
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to exploring the blockchain.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link to="/">
              <Button size="lg" className="gap-2">
                <Home className="h-5 w-5" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Link to="/blocks">
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Search className="h-5 w-5" />
                Browse Blocks
              </Button>
            </Link>

            <Button 
              size="lg" 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="gap-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Button>
          </div>

          {/* Minimal Sponsor CTA - Only show if enabled */}
          {featureFlags.sponsors.enabled && (
            <div className="pt-8 flex justify-center">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
                <SponsorCTA variant="inline" />
              </div>
            </div>
          )}

          {/* Additional Help Text */}
          <div className="pt-12 text-sm text-gray-400">
            <p>Lost? Try these popular pages:</p>
            <div className="flex flex-wrap gap-4 justify-center mt-3">
              <Link to="/txs" className="hover:text-white transition-colors">
                Transactions
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/addresses" className="hover:text-white transition-colors">
                Addresses
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/contracts" className="hover:text-white transition-colors">
                Contracts
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/tokens" className="hover:text-white transition-colors">
                Tokens
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}