import { useState } from 'react'
import { ExternalLink, Zap, Globe, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

export function OnlineDemoBanner() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,1) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-4 h-4 border border-gray-300 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-6 h-6 bg-gray-200 rounded opacity-10 breathe"></div>
      <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-gray-300 rounded-full opacity-15 bounce-subtle"></div>
      
      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Demo Available</span>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Try it online, right now
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect to your local node instantly through our hosted explorer. 
            No installation needed — just make sure your node is running on port 8545.
          </p>
        </div>

        {/* Main Demo Card */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`
            bg-white rounded-2xl border-2 p-12 shadow-xl transition-all duration-500 hover-lift
            ${isHovered ? 'border-gray-900 shadow-2xl' : 'border-gray-200'}
          `}>
            {/* Connection indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-mono text-gray-700">local.evmscan.org</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isHovered ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isHovered ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} style={{ animationDelay: '100ms' }}></div>
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isHovered ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} style={{ animationDelay: '200ms' }}></div>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <Zap className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-mono text-gray-700">localhost:8545</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Instant blockchain explorer for your local node
              </h3>
              
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our hosted demo automatically connects to your local Ethereum node. 
                Perfect for testing smart contracts, monitoring transactions, and debugging your dApps.
              </p>

              {/* Features list */}
              <div className="grid md:grid-cols-3 gap-6 my-8">
                {[
                  { label: 'No Installation', icon: '✨' },
                  { label: 'Real-time Updates', icon: '⚡' },
                  { label: 'Full Explorer Features', icon: '🔍' }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-center gap-2 text-gray-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg group/btn hover-lift relative overflow-hidden"
                  asChild
                >
                  <a 
                    href="https://local.evmscan.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <span className="relative z-10 flex items-center">
                      Open Online Explorer
                      <ExternalLink className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                    </span>
                    <div className="absolute inset-0 shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  </a>
                </Button>
              </div>

              {/* Requirements note */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      Requirements
                    </p>
                    <p className="text-sm text-blue-700">
                      Make sure your local node is running on <code className="font-mono bg-blue-100 px-1 rounded">http://localhost:8545</code> and CORS is enabled for browser access.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated border gradient on hover */}
            {isHovered && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 opacity-20 shimmer"></div>
              </div>
            )}
          </div>

          {/* Decorative badges */}
          <div className={`
            absolute -top-3 -right-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-full transition-all duration-300
            ${isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}
          `}>
            LIVE
          </div>
        </div>

        {/* Bottom section with alternative */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
            <div className="w-16 h-px bg-gray-200"></div>
            <span>or install locally</span>
            <div className="w-16 h-px bg-gray-200"></div>
          </div>
          
          <div className="bg-gray-900 text-white rounded-lg px-6 py-3 font-mono text-sm max-w-md mx-auto hover-lift group cursor-pointer relative overflow-hidden inline-block">
            <div className="relative z-10">
              <span className="text-blue-400 group-hover:text-blue-300 transition-colors">$</span>
              <span className="group-hover:text-gray-100 transition-colors"> npx evmscan init && npx evmscan start</span>
            </div>
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>
    </section>
  )
}