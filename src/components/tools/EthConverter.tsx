import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowUpDown, Copy, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatEther, parseEther, formatGwei, parseGwei } from 'viem'

export default function EthConverter() {
  const [ethValue, setEthValue] = useState('')
  const [weiValue, setWeiValue] = useState('')
  const [gweiValue, setGweiValue] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleEthChange = (value: string) => {
    setEthValue(value)
    if (!value || value === '0') {
      setWeiValue('0')
      setGweiValue('0')
      return
    }
    
    try {
      const wei = parseEther(value)
      setWeiValue(wei.toString())
      setGweiValue(formatGwei(wei))
    } catch {
      // Invalid input, keep as is
    }
  }

  const handleWeiChange = (value: string) => {
    setWeiValue(value)
    if (!value || value === '0') {
      setEthValue('0')
      setGweiValue('0')
      return
    }
    
    try {
      const wei = BigInt(value)
      setEthValue(formatEther(wei))
      setGweiValue(formatGwei(wei))
    } catch {
      // Invalid input, keep as is
    }
  }

  const handleGweiChange = (value: string) => {
    setGweiValue(value)
    if (!value || value === '0') {
      setEthValue('0')
      setWeiValue('0')
      return
    }
    
    try {
      const wei = parseGwei(value)
      setWeiValue(wei.toString())
      setEthValue(formatEther(wei))
    } catch {
      // Invalid input, keep as is
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          ETH Unit Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ETH Input */}
        <div>
          <Label htmlFor="eth">Ether (ETH)</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="eth"
              type="text"
              placeholder="0.0"
              value={ethValue}
              onChange={(e) => handleEthChange(e.target.value)}
              className="font-mono"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(ethValue, 'eth')}
              disabled={!ethValue || ethValue === '0'}
            >
              {copiedField === 'eth' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Gwei Input */}
        <div>
          <Label htmlFor="gwei">Gwei</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="gwei"
              type="text"
              placeholder="0"
              value={gweiValue}
              onChange={(e) => handleGweiChange(e.target.value)}
              className="font-mono"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(gweiValue, 'gwei')}
              disabled={!gweiValue || gweiValue === '0'}
            >
              {copiedField === 'gwei' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Wei Input */}
        <div>
          <Label htmlFor="wei">Wei</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="wei"
              type="text"
              placeholder="0"
              value={weiValue}
              onChange={(e) => handleWeiChange(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(weiValue, 'wei')}
              disabled={!weiValue || weiValue === '0'}
            >
              {copiedField === 'wei' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Conversion Reference */}
        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p>1 ETH = 1,000,000,000 Gwei</p>
          <p>1 ETH = 1,000,000,000,000,000,000 Wei</p>
          <p>1 Gwei = 1,000,000,000 Wei</p>
        </div>
      </CardContent>
    </Card>
  )
}