import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Loader2, CheckCircle, AlertCircle, Code, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { dbService } from '@/services/db.service'
import { getPublicClient } from '@/lib/viem-client'
import type { Abi } from 'viem'

export default function VerifyContractPage() {
  const { address } = useParams<{ address: string }>()
  const navigate = useNavigate()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // ABI verification
  const [abiInput, setAbiInput] = useState('')
  const [contractName, setContractName] = useState('')

  useEffect(() => {
    checkIfVerified()
  }, [address])

  const checkIfVerified = async () => {
    if (!address) return
    
    setIsChecking(true)
    try {
      const storedAbi = await dbService.getAbi(address)
      setIsVerified(!!storedAbi)
      if (storedAbi) {
        setContractName(storedAbi.contractName || '')
      }
    } catch (err) {
      console.error('Error checking verification status:', err)
    } finally {
      setIsChecking(false)
    }
  }

  const verifyWithAbi = async () => {
    if (!address || !abiInput) {
      setError('Please provide an ABI')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Parse and validate ABI
      let abi: Abi
      try {
        abi = JSON.parse(abiInput)
        if (!Array.isArray(abi)) {
          throw new Error('ABI must be an array')
        }
      } catch (parseError) {
        throw new Error('Invalid ABI format. Please provide a valid JSON array.')
      }

      // Check if address is a contract
      const client = getPublicClient()
      const code = await client.getCode({ address: address as `0x${string}` })
      
      if (!code || code === '0x') {
        throw new Error('Address is not a contract')
      }

      // Save ABI to IndexedDB
      await dbService.saveAbi(address, abi, contractName || 'Unknown Contract')
      
      setSuccess(true)
      setIsVerified(true)
      
      // Redirect to address page after 2 seconds
      setTimeout(() => {
        navigate(`/address/${address}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAbiFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setAbiInput(content)
    }
    reader.readAsText(file)
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Contract Verification
        </h1>
        <p className="text-gray-500 mt-2">
          Verify and publish your contract source code and ABI
        </p>
      </div>

      {/* Address Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-gray-500" />
            <code className="font-mono text-sm">{address}</code>
            {isVerified && (
              <div className="ml-auto flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Status Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Contract verified successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ABI Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Contract ABI Verification</CardTitle>
          <CardDescription>
            Upload your contract's ABI to enable transaction decoding and contract interaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contractName">Contract Name (optional)</Label>
                <Input
                  id="contractName"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="e.g., MyToken"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="abi">Contract ABI</Label>
                <Textarea
                  id="abi"
                  value={abiInput}
                  onChange={(e) => setAbiInput(e.target.value)}
                  placeholder="Paste your contract ABI here (JSON format)"
                  className="mt-1 font-mono text-xs h-64"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('abi-file')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload ABI File
                </Button>
                <input
                  id="abi-file"
                  type="file"
                  accept=".json"
                  onChange={handleAbiFileUpload}
                  className="hidden"
                />
                
                <Button
                  onClick={verifyWithAbi}
                  disabled={isLoading || !abiInput}
                  className="ml-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify with ABI'
                  )}
                </Button>
              </div>

          <div className="text-sm text-gray-500">
            <p>✓ Instant verification</p>
            <p>✓ Enables decoded transactions and events</p>
            <p>✓ Allows contract interaction (read/write functions)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
