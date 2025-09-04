import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calculator, X, Copy, CheckCircle, ArrowUpDown } from 'lucide-react'
import { formatEther, parseEther, formatGwei, parseGwei } from 'viem'

export default function FloatingConverter() {
  const [isOpen, setIsOpen] = useState(false)
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

  const clear = () => {
    setEthValue('')
    setWeiValue('')
    setGweiValue('')
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Toggle ETH Converter"
      >
        <Calculator className="h-6 w-6" />
      </button>

      {/* Converter Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <Card className="w-[320px] shadow-xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  ETH Converter
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="h-7 px-2 text-xs"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* ETH Input */}
              <div>
                <Label className="text-xs">Ether (ETH)</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    type="text"
                    placeholder="0.0"
                    value={ethValue}
                    onChange={(e) => handleEthChange(e.target.value)}
                    className="h-8 text-sm font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ethValue, 'eth')}
                    disabled={!ethValue || ethValue === '0'}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'eth' ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Gwei Input */}
              <div>
                <Label className="text-xs">Gwei</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    type="text"
                    placeholder="0"
                    value={gweiValue}
                    onChange={(e) => handleGweiChange(e.target.value)}
                    className="h-8 text-sm font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(gweiValue, 'gwei')}
                    disabled={!gweiValue || gweiValue === '0'}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'gwei' ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Wei Input */}
              <div>
                <Label className="text-xs">Wei</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    type="text"
                    placeholder="0"
                    value={weiValue}
                    onChange={(e) => handleWeiChange(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(weiValue, 'wei')}
                    disabled={!weiValue || weiValue === '0'}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'wei' ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Reference */}
              <div className="text-xs text-gray-500 pt-2 border-t space-y-0.5">
                <p>1 ETH = 10<sup>9</sup> Gwei = 10<sup>18</sup> Wei</p>
                <p>1 Gwei = 10<sup>9</sup> Wei</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}