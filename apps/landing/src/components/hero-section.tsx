import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from './ui/button'

export function HeroSection() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText('bunx evmscan init && bunx evmscan start')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      {/* Abstract background graphics */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="chain-graphic top-10 left-10">
          <div className="chain-node top-0 left-0"></div>
          <div className="chain-node top-8 left-12"></div>
          <div className="chain-node top-16 left-6"></div>
          <div className="chain-connection top-1 left-1 w-12 rotate-45"></div>
          <div className="chain-connection top-9 left-7 w-8 -rotate-12"></div>
        </div>
        <div className="chain-graphic bottom-16 right-16 rotate-180">
          <div className="chain-node top-0 left-0"></div>
          <div className="chain-node top-8 left-12"></div>
          <div className="chain-node top-16 left-6"></div>
          <div className="chain-connection top-1 left-1 w-12 rotate-45"></div>
          <div className="chain-connection top-9 left-7 w-8 -rotate-12"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">evmscan</h1>
          <div className="gradient-separator w-32 mx-auto"></div>
        </div>

        {/* Main headline */}
        <h2 className="hero-text text-gray-900 mb-8 max-w-4xl mx-auto">
          Etherscan for your{' '}
          <span className="text-gray-600">local node</span>
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Modern blockchain explorer for local EVM development. 
          Zero configuration, instant setup, open source.
        </p>

        {/* Install command */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="code-install group cursor-pointer" onClick={handleCopy}>
            <code className="text-green-600">
              bunx evmscan init && bunx evmscan start
            </code>
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 h-auto transition-colors ${
                copied ? 'copy-success' : ''
              }`}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Click to copy • Works with npm, yarn, pnpm, or bun
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg font-semibold"
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-3 text-lg"
          >
            View Demo
          </Button>
        </div>

        {/* Quick stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0s</div>
            <div className="text-sm text-gray-500">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">OSS</div>
            <div className="text-sm text-gray-500">Open Source</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">Local</div>
            <div className="text-sm text-gray-500">No External APIs</div>
          </div>
        </div>
      </div>
    </section>
  )
}