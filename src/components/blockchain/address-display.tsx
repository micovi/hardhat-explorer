import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { abiService } from '@/services/abi.service'
import { truncateAddress } from '@/lib/utils'

interface AddressDisplayProps {
  address: string
  truncate?: number
  showLink?: boolean
  className?: string
}

export default function AddressDisplay({ 
  address, 
  truncate = 6,
  showLink = true,
  className = "font-mono text-sm"
}: AddressDisplayProps) {
  const [contractName, setContractName] = useState<string | null>(null)

  useEffect(() => {
    const loadName = async () => {
      const name = await abiService.getContractName(address)
      setContractName(name)
    }
    loadName()
  }, [address])

  const displayText = contractName 
    ? `${truncateAddress(address, truncate)} (${contractName})`
    : truncateAddress(address, truncate)

  if (!showLink) {
    return <span className={className} title={address}>{displayText}</span>
  }

  return (
    <Link 
      to={`/address/${address}`}
      className={`${className} text-blue-600 hover:text-blue-800`}
      title={address}
    >
      {displayText}
    </Link>
  )
}