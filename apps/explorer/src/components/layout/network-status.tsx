import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { checkHardhatConnection } from '@/lib/viem-client'
import { cn } from '@/lib/utils'

export default function NetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true)
      try {
        const connected = await checkHardhatConnection()
        setIsConnected(connected)
      } catch (error) {
        console.error('Failed to check network connection:', error)
        setIsConnected(false)
      } finally {
        setIsChecking(false)
      }
    }

    // Initial check
    checkConnection()

    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isChecking && isConnected === null) {
    return null // Don't show anything on initial load
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center py-2 text-sm font-medium transition-all',
        isConnected
          ? 'bg-green-50 text-green-800'
          : 'bg-red-50 text-red-800'
      )}
    >
      <div className="flex items-center space-x-2">
        {isChecking ? (
          <AlertCircle className="h-4 w-4 animate-pulse" />
        ) : isConnected ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <span>
          {isChecking
            ? 'Checking connection...'
            : isConnected
            ? 'Connected to Local EVM Node (localhost:8545)'
            : 'Not connected to EVM Node - Please start your local node'}
        </span>
      </div>
    </div>
  )
}