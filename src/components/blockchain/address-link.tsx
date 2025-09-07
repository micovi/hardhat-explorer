import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { truncateAddress } from '@/lib/utils'
import { abiService } from '@/services/abi.service'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface AddressLinkProps {
  address: string
  truncate?: number
  showBadge?: boolean
  className?: string
}

export default function AddressLink({ 
  address, 
  truncate = 6, 
  showBadge = true,
  className = "text-blue-600 hover:text-blue-800" 
}: AddressLinkProps) {
  const [contractName, setContractName] = useState<string | null>(null)

  useEffect(() => {
    const loadName = async () => {
      const name = await abiService.getContractName(address)
      setContractName(name)
    }
    loadName()
  }, [address])

  const displayText = contractName || truncateAddress(address, truncate)

  return (
    <div className="inline-flex items-center gap-1">
      <Link 
        to={`/address/${address}`}
        className={`${className} ${contractName ? 'font-medium' : 'font-mono text-sm'}`}
        title={address}
      >
        {displayText}
      </Link>
      {contractName && showBadge && (
        <Badge variant="success" className="h-4 px-1 text-xs">
          <CheckCircle className="h-2.5 w-2.5" />
        </Badge>
      )}
    </div>
  )
}