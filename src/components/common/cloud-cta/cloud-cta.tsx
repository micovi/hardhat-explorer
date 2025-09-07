import { ArrowRight, Cloud, GitBranch, Zap, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface CloudCTAProps {
  variant?: 'default' | 'compact' | 'banner'
  className?: string
}

export function CloudCTA({ variant = 'default', className }: CloudCTAProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-4", className)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cloud className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">Upgrade to evmscan.io</p>
              <p className="text-xs text-gray-600">CI/CD for smart contracts</p>
            </div>
          </div>
          <a 
            href="https://evmscan.io?utm_source=local-explorer&utm_medium=cta&utm_campaign=compact"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="gap-1">
              Get Started
              <ArrowRight className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={cn("bg-gradient-to-r from-blue-600 to-indigo-600 text-white", className)}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <p className="text-sm font-medium">
                <span className="font-bold">evmscan.io:</span> Auto-deploy explorers for every branch with built-in snapshots & traces
              </p>
            </div>
            <a 
              href="https://evmscan.io?utm_source=local-explorer&utm_medium=cta&utm_campaign=banner"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="secondary" className="gap-1">
                Start Free
                <ArrowRight className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Default variant - full feature showcase
  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 via-white to-indigo-50", className)}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-100 opacity-50 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-indigo-100 opacity-50 blur-2xl" />
      
      <div className="relative p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Ship Smart Contracts Like Modern Apps
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  evmscan.io - The Vercel + Tenderly for blockchain development
                </p>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <GitBranch className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Branch Deployments</p>
                  <p className="text-xs text-gray-600">Auto-spin explorers for every PR</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Instant Snapshots</p>
                  <p className="text-xs text-gray-600">Time-travel debugging built-in</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Transaction Traces</p>
                  <p className="text-xs text-gray-600">Deep insights into every call</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">CI/CD Pipeline</p>
                  <p className="text-xs text-gray-600">Automated testing & deployment</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <a 
                href="https://evmscan.io?utm_source=local-explorer&utm_medium=cta&utm_campaign=default"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2">
                  <Cloud className="h-4 w-4" />
                  Deploy to evmscan.io
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Free tier available
                </Badge>
                <Badge variant="outline">
                  No credit card required
                </Badge>
              </div>
            </div>
          </div>

          {/* Right side - Code snippet or illustration */}
          <div className="hidden lg:block">
            <div className="rounded-lg bg-gray-900 p-4 text-xs font-mono">
              <div className="space-y-2">
                <div className="text-gray-400"># Deploy with one command</div>
                <div>
                  <span className="text-green-400">$</span>
                  <span className="text-white ml-2">evmscan deploy</span>
                </div>
                <div className="text-gray-500">
                  ✓ Explorer deployed to:
                </div>
                <div className="text-blue-400 ml-2">
                  https://my-project.evmscan.io
                </div>
                <div className="text-gray-500">
                  ✓ Branch preview ready
                </div>
                <div className="text-gray-500">
                  ✓ Snapshots enabled
                </div>
                <div className="text-gray-500">
                  ✓ Traces configured
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            🚀 Join thousands of developers building the future of Web3 with professional-grade tools
          </p>
        </div>
      </div>
    </div>
  )
}

export default CloudCTA