import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit3, Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Send, ExternalLink, ToggleLeft, ToggleRight, Wallet, Check, Copy } from 'lucide-react'
import { createWalletClient, http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hardhat } from 'viem/chains'
import { dbService } from '@/services/dbService'
import { getPublicClient } from '@/lib/viem-client'
import type { Abi, AbiFunction } from 'viem'
import { formatEther, parseEther } from 'viem'
import { Link } from 'react-router-dom'

interface ContractWriteFunctionsProps {
  address: string
}

interface TransactionResult {
  hash: string
  status: 'pending' | 'success' | 'failed'
  error?: string
}

// Hardhat default test accounts
const HARDHAT_ACCOUNTS = [
  { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', label: 'Account #0 (10000 ETH)' },
  { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', label: 'Account #1 (10000 ETH)' },
  { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', label: 'Account #2 (10000 ETH)' },
  { address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6', label: 'Account #3 (10000 ETH)' },
  { address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a', label: 'Account #4 (10000 ETH)' },
]

export default function ContractWriteFunctions({ address }: ContractWriteFunctionsProps) {
  const [abi, setAbi] = useState<Abi | null>(null)
  const [writeFunctions, setWriteFunctions] = useState<AbiFunction[]>([])
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({})
  const [ethValues, setEthValues] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, TransactionResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedAccount, setSelectedAccount] = useState(HARDHAT_ACCOUNTS[0])
  const [ethMode, setEthMode] = useState<Record<string, boolean>>({})
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)

  useEffect(() => {
    loadContractABI()
  }, [address])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.account-selector')) {
        setAccountDropdownOpen(false)
      }
    }
    
    if (accountDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [accountDropdownOpen])

  const loadContractABI = async () => {
    try {
      const storedAbi = await dbService.getAbi(address)
      if (storedAbi) {
        setAbi(storedAbi.abi)
        
        // Filter for write functions
        const writes = storedAbi.abi.filter(
          (item): item is AbiFunction => 
            item.type === 'function' && 
            (item.stateMutability === 'nonpayable' || item.stateMutability === 'payable')
        )
        setWriteFunctions(writes)
      }
    } catch (error) {
      console.error('Failed to load ABI:', error)
    }
  }

  const handleInputChange = (functionName: string, inputName: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [functionName]: {
        ...prev[functionName],
        [inputName]: value
      }
    }))
  }

  const toggleEthMode = (key: string) => {
    setEthMode(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getInputValue = (functionName: string, inputName: string, inputType: string) => {
    const value = inputs[functionName]?.[inputName || ''] || ''
    const key = `${functionName}-${inputName}`
    
    // If in ETH mode and it's a uint256, convert for display
    if (ethMode[key] && inputType === 'uint256' && value) {
      try {
        const weiValue = BigInt(value)
        return formatEther(weiValue)
      } catch {
        return value
      }
    }
    return value
  }

  const handleInputChangeWithConversion = (functionName: string, inputName: string, value: string, inputType: string) => {
    const key = `${functionName}-${inputName}`
    
    // If in ETH mode and it's a uint256, convert to wei for storage
    if (ethMode[key] && inputType === 'uint256') {
      try {
        if (!value || value === '0') {
          handleInputChange(functionName, inputName, '0')
        } else {
          const weiValue = parseEther(value)
          handleInputChange(functionName, inputName, weiValue.toString())
        }
      } catch {
        // If conversion fails, store as-is (might be partial input)
        handleInputChange(functionName, inputName, value)
      }
    } else {
      handleInputChange(functionName, inputName, value)
    }
  }

  const handleEthValueChange = (functionName: string, value: string) => {
    setEthValues(prev => ({
      ...prev,
      [functionName]: value
    }))
  }

  const callFunction = async (func: AbiFunction) => {
    if (!abi) return

    const functionName = func.name
    setLoading(prev => ({ ...prev, [functionName]: true }))
    setResults(prev => ({ ...prev, [functionName]: { hash: '', status: 'pending' } }))
    
    try {
      // Create wallet client with selected account
      const account = privateKeyToAccount(selectedAccount.privateKey as `0x${string}`)
      const walletClient = createWalletClient({
        account,
        chain: hardhat,
        transport: http('http://127.0.0.1:8545')
      })

      // Prepare arguments
      const args: any[] = []
      if (func.inputs && func.inputs.length > 0) {
        for (const input of func.inputs) {
          const value = inputs[functionName]?.[input.name || '']
          if (!value && input.type !== 'bool') {
            throw new Error(`Missing input: ${input.name}`)
          }
          
          // Convert based on type
          if (input.type === 'bool') {
            args.push(value === 'true' || value === '1')
          } else if (input.type.includes('int')) {
            args.push(BigInt(value || 0))
          } else if (input.type === 'address') {
            args.push(value as `0x${string}`)
          } else if (input.type.includes('[]')) {
            // Handle arrays
            args.push(value ? value.split(',').map(v => v.trim()) : [])
          } else if (input.type === 'bytes' || input.type.startsWith('bytes')) {
            args.push(value as `0x${string}`)
          } else {
            args.push(value)
          }
        }
      }

      // Prepare transaction
      const txArgs: any = {
        address: address as `0x${string}`,
        abi: abi,
        functionName: functionName,
        args: args,
        account,
      }

      // Add ETH value if function is payable
      if (func.stateMutability === 'payable' && ethValues[functionName]) {
        txArgs.value = parseEther(ethValues[functionName])
      }

      // Simulate first to check if it will succeed
      const publicClient = getPublicClient()
      const { request } = await publicClient.simulateContract(txArgs)
      
      // Execute transaction
      const hash = await walletClient.writeContract(request)

      setResults(prev => ({
        ...prev,
        [functionName]: {
          hash,
          status: 'pending'
        }
      }))

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      setResults(prev => ({
        ...prev,
        [functionName]: {
          hash,
          status: receipt.status === 'success' ? 'success' : 'failed'
        }
      }))
    } catch (error: any) {
      console.error(`Error calling ${functionName}:`, error)
      setResults(prev => ({
        ...prev,
        [functionName]: {
          hash: '',
          status: 'failed',
          error: error.message || 'Failed to execute transaction'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [functionName]: false }))
    }
  }

  const toggleExpanded = (functionName: string) => {
    setExpanded(prev => ({ ...prev, [functionName]: !prev[functionName] }))
  }

  if (!abi || writeFunctions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            No write functions available or contract not verified
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Account Selector - Modern Design */}
      <div className="relative account-selector">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Connected Account</span>
          <Badge variant="outline" className="text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
            Hardhat Network
          </Badge>
        </div>
        
        {/* Current Account Display */}
        <button
          onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
          className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-all border border-gray-200 hover:border-gray-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow">
                <Wallet className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {selectedAccount.address.slice(0, 6)}...{selectedAccount.address.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(selectedAccount.address)
                    }}
                    className="h-5 w-5 p-0 hover:bg-gray-200"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-xs text-gray-500">{selectedAccount.label}</span>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
              accountDropdownOpen ? 'rotate-180' : ''
            }`} />
          </div>
        </button>

        {/* Account Dropdown */}
        {accountDropdownOpen && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="p-2">
              {HARDHAT_ACCOUNTS.map((account) => (
                <button
                  key={account.address}
                  onClick={() => {
                    setSelectedAccount(account)
                    setAccountDropdownOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-md transition-all ${
                    account.address === selectedAccount.address
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${
                        account.address === selectedAccount.address
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}>
                        <Wallet className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-gray-900">
                          {account.address.slice(0, 8)}...{account.address.slice(-6)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.label}
                        </div>
                      </div>
                    </div>
                    {account.address === selectedAccount.address && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Write Functions */}
      <div className="space-y-3">
        {writeFunctions.map((func) => (
          <Card key={func.name} className="overflow-hidden">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{func.name}</span>
                  {func.stateMutability === 'payable' && (
                    <Badge variant="secondary" className="text-xs">payable</Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    ({func.inputs?.map(i => i.type).join(', ') || 'no params'})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(func.name)}
                  className="h-7 px-2"
                >
                  {expanded[func.name] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            {expanded[func.name] && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Payable value input */}
                  {func.stateMutability === 'payable' && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <Label className="text-sm min-w-[100px]">ETH Value</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        value={ethValues[func.name] || ''}
                        onChange={(e) => handleEthValueChange(func.name, e.target.value)}
                        className="h-8 text-sm"
                      />
                      <span className="text-sm text-gray-500">ETH</span>
                    </div>
                  )}

                  {/* Function inputs */}
                  {func.inputs && func.inputs.length > 0 && (
                    <div className="space-y-2">
                      {func.inputs.map((input, index) => {
                        const key = `${func.name}-${input.name || index}`
                        const isUint256 = input.type === 'uint256'
                        const inEthMode = ethMode[key]
                        
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <Label className="text-sm min-w-[100px]">
                              {input.name || `param${index}`}
                            </Label>
                            <div className="flex-1 flex items-center gap-2">
                              <Input
                                placeholder={inEthMode ? 'ETH amount' : input.type}
                                value={getInputValue(func.name, input.name || '', input.type)}
                                onChange={(e) => 
                                  handleInputChangeWithConversion(func.name, input.name || '', e.target.value, input.type)
                                }
                                className="h-8 text-sm"
                              />
                              {isUint256 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleEthMode(key)}
                                  className="h-8 px-2"
                                  title={inEthMode ? "Switch to wei" : "Switch to ETH"}
                                  type="button"
                                >
                                  {inEthMode ? (
                                    <><ToggleRight className="h-4 w-4 text-blue-600" /> ETH</>
                                  ) : (
                                    <><ToggleLeft className="h-4 w-4" /> wei</>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Execute Button */}
                  <Button
                    onClick={() => callFunction(func)}
                    disabled={loading[func.name]}
                    className="w-full h-9"
                    variant="default"
                  >
                    {loading[func.name] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Write
                      </>
                    )}
                  </Button>

                  {/* Transaction Result */}
                  {results[func.name] && (
                    <div className="mt-3">
                      {results[func.name].error ? (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {results[func.name].error}
                          </AlertDescription>
                        </Alert>
                      ) : results[func.name].hash && (
                        <Alert className={
                          results[func.name].status === 'success' 
                            ? "bg-green-50 border-green-200" 
                            : results[func.name].status === 'pending'
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-red-50 border-red-200"
                        }>
                          {results[func.name].status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : results[func.name].status === 'pending' ? (
                            <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                {results[func.name].status === 'success' && 'Transaction successful!'}
                                {results[func.name].status === 'pending' && 'Transaction pending...'}
                                {results[func.name].status === 'failed' && 'Transaction failed'}
                              </div>
                              <Link
                                to={`/tx/${results[func.name].hash}`}
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                              >
                                View TX
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Warning */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm text-yellow-800">
          <strong>Local Development Only:</strong> This uses Hardhat's pre-funded test accounts. 
          For production, integrate a proper wallet connection.
        </AlertDescription>
      </Alert>
    </div>
  )
}