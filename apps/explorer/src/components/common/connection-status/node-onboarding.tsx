import { useState, useEffect } from 'react'
import { Terminal, Zap, HardDrive, ArrowRight, RefreshCw, ExternalLink, CheckCircle, AlertCircle, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NodeOnboardingProps {
  onRetry: () => void
  error?: Error | null
}

export function NodeOnboarding({ onRetry, error }: NodeOnboardingProps) {
  const [activeFramework, setActiveFramework] = useState<'hardhat' | 'anvil' | 'ganache'>('hardhat')
  const [isRetrying, setIsRetrying] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const frameworks = {
    hardhat: {
      name: 'Hardhat',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      command: 'npx hardhat node',
      port: '8545',
      description: 'The most popular Ethereum development framework',
      features: ['Built-in console', 'Mainnet forking', 'Mining modes'],
      icon: '⛑️'
    },
    anvil: {
      name: 'Anvil (Foundry)',
      color: 'text-blue-500', 
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      command: 'anvil',
      port: '8545',
      description: 'Lightning-fast local Ethereum node by Foundry',
      features: ['Ultra fast', 'Fork mode', 'Time travel'],
      icon: '🔨'
    },
    ganache: {
      name: 'Ganache',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50', 
      borderColor: 'border-purple-200',
      command: 'ganache --host 0.0.0.0',
      port: '8545',
      description: 'Truffle\'s personal blockchain for Ethereum',
      features: ['GUI available', 'Workspace saving', 'Advanced mining'],
      icon: '🍫'
    }
  }

  const handleCopyCommand = async (command: string) => {
    await navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onRetry()
    setIsRetrying(false)
  }

  // Animated terminal typing effect
  const [terminalText, setTerminalText] = useState('')
  const fullText = frameworks[activeFramework].command

  useEffect(() => {
    setTerminalText('')
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTerminalText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [activeFramework, fullText])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl mb-6 relative">
            <HardDrive className="h-10 w-10 text-white" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">!</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            No Local Node Detected
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            evmscan needs to connect to your local Ethereum node to explore your blockchain.
            Start your development node to continue.
          </p>
        </div>

        {/* Framework selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {Object.entries(frameworks).map(([key, framework]) => (
              <button
                key={key}
                onClick={() => setActiveFramework(key as typeof activeFramework)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  activeFramework === key
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <span className="mr-2">{framework.icon}</span>
                {framework.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main instruction card */}
        <Card className={cn(
          "p-8 mb-6 border-2 transition-all duration-300",
          frameworks[activeFramework].borderColor,
          frameworks[activeFramework].bgColor
        )}>
          <div className="space-y-6">
            {/* Step 1: Install/Setup */}
            <div className="flex gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                frameworks[activeFramework].bgColor,
                "border-2",
                frameworks[activeFramework].borderColor
              )}>
                <span className={cn("font-bold", frameworks[activeFramework].color)}>1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Start your {frameworks[activeFramework].name} node
                </h3>
                <div className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">$</span>
                      <span className="text-gray-300">{terminalText}</span>
                      <span className="animate-pulse">_</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyCommand(frameworks[activeFramework].command)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                    >
                      {copiedCommand === frameworks[activeFramework].command ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Code className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {frameworks[activeFramework].description}
                </p>
              </div>
            </div>

            {/* Step 2: Verify */}
            <div className="flex gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                frameworks[activeFramework].bgColor,
                "border-2",
                frameworks[activeFramework].borderColor
              )}>
                <span className={cn("font-bold", frameworks[activeFramework].color)}>2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Verify it's running on port {frameworks[activeFramework].port}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                    <Terminal className="h-4 w-4 text-gray-500" />
                    <code className="text-sm">http://localhost:{frameworks[activeFramework].port}</code>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                    <Zap className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">evmscan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-gray-700">Features:</span>
                {frameworks[activeFramework].features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <CheckCircle className={cn("h-4 w-4", frameworks[activeFramework].color)} />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Connection status and retry */}
        <Card className="p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Connection Status</p>
                <p className="text-sm text-gray-500">
                  {error ? `Failed to connect: ${error.message}` : 'Waiting for node at localhost:8545'}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
              {isRetrying ? 'Connecting...' : 'Retry Connection'}
            </Button>
          </div>
        </Card>

        {/* Help section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Need help? Check out our guides for setting up your development environment
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="https://hardhat.org/tutorial/setting-up-the-environment" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Hardhat Setup
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://book.getfoundry.sh/anvil/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Anvil Docs
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/evmscan/evmscan" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="fixed top-10 right-10 w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="fixed bottom-10 left-10 w-48 h-48 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  )
}