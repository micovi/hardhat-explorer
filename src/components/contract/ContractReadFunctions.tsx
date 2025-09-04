import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PlayCircle, Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Copy, ToggleLeft, ToggleRight } from 'lucide-react'
import { getPublicClient } from '@/lib/viem-client'
import { dbService } from '@/services/dbService'
import { abiService } from '@/services/abiService'
import type { Abi, AbiFunction } from 'viem'
import { formatEther, formatUnits, parseEther } from 'viem'
import { Link } from 'react-router-dom'

interface ContractReadFunctionsProps {
  address: string
}

interface FunctionResult {
  functionName: string
  result: any
  formatted?: string
  error?: string
}

export default function ContractReadFunctions({ address }: ContractReadFunctionsProps) {
  const [abi, setAbi] = useState<Abi | null>(null)
  const [readFunctions, setReadFunctions] = useState<AbiFunction[]>([])
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({})
  const [results, setResults] = useState<Record<string, FunctionResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [ethMode, setEthMode] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadContractABI()
  }, [address])

  const loadContractABI = async () => {
    try {
      const storedAbi = await dbService.getAbi(address)
      if (storedAbi) {
        setAbi(storedAbi.abi)
        
        // Filter for read functions (view or pure)
        const reads = storedAbi.abi.filter(
          (item): item is AbiFunction => 
            item.type === 'function' && 
            (item.stateMutability === 'view' || item.stateMutability === 'pure')
        )
        setReadFunctions(reads)
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

  const callFunction = async (func: AbiFunction) => {
    if (!abi) return

    const functionName = func.name
    setLoading(prev => ({ ...prev, [functionName]: true }))
    
    try {
      const client = getPublicClient()
      
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
          } else {
            args.push(value)
          }
        }
      }

      const result = await client.readContract({
        address: address as `0x${string}`,
        abi: abi,
        functionName: functionName,
        args: args
      })

      const formatted = await formatResult(result, func.outputs?.[0]?.type)
      setResults(prev => ({
        ...prev,
        [functionName]: {
          functionName,
          result,
          formatted
        }
      }))
    } catch (error: any) {
      console.error(`Error calling ${functionName}:`, error)
      setResults(prev => ({
        ...prev,
        [functionName]: {
          functionName,
          error: error.message || 'Failed to call function'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [functionName]: false }))
    }
  }

  const formatResult = async (result: any, type?: string): Promise<string> => {
    if (result === undefined || result === null) return 'null'
    
    // Handle addresses - check if they're contracts with names
    if (type === 'address' && typeof result === 'string') {
      const name = await abiService.getContractName(result)
      return name ? `${result} (${name})` : result
    }
    
    // Handle address arrays
    if (type === 'address[]' && Array.isArray(result)) {
      const formatted = await Promise.all(
        result.map(async (addr: string) => {
          const name = await abiService.getContractName(addr)
          return name ? `${addr} (${name})` : addr
        })
      )
      return JSON.stringify(formatted, null, 2)
    }
    
    // Handle different return types
    if (typeof result === 'bigint') {
      // Check if it might be a token amount (18 decimals is common)
      if (type?.includes('uint') && result > 1000000000000000000n) {
        return `${result.toString()} (${formatEther(result)} ETH)`
      }
      return result.toString()
    }
    
    if (typeof result === 'boolean') {
      return result ? 'true' : 'false'
    }
    
    if (Array.isArray(result)) {
      return JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2)
    }
    
    if (typeof result === 'object') {
      // Check for address fields in objects
      const formatted: any = {}
      for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
          const name = await abiService.getContractName(value)
          formatted[key] = name ? `${value} (${name})` : value
        } else if (typeof value === 'bigint') {
          formatted[key] = value.toString()
        } else {
          formatted[key] = value
        }
      }
      return JSON.stringify(formatted, null, 2)
    }
    
    return String(result)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const toggleExpanded = (functionName: string) => {
    setExpanded(prev => ({ ...prev, [functionName]: !prev[functionName] }))
  }

  if (!abi || readFunctions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            No read functions available or contract not verified
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group functions by whether they have inputs
  const noInputFunctions = readFunctions.filter(f => !f.inputs || f.inputs.length === 0)
  const withInputFunctions = readFunctions.filter(f => f.inputs && f.inputs.length > 0)

  return (
    <div className="space-y-6">
      {/* Functions without inputs - compact view */}
      {noInputFunctions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Read Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {noInputFunctions.map((func) => (
                <div key={func.name} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{func.name}</span>
                        {func.outputs && func.outputs.length > 0 && (
                          <span className="text-xs text-gray-500">
                            → {func.outputs.map(o => o.type).join(', ')}
                          </span>
                        )}
                      </div>
                      
                      {results[func.name] && !results[func.name].error && (
                        <div className="mt-2 text-sm">
                          {results[func.name].formatted && results[func.name].formatted!.includes('\n') ? (
                            <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(func.name)}
                                className="h-6 px-2 text-xs"
                              >
                                {expanded[func.name] ? (
                                  <><ChevronUp className="h-3 w-3 mr-1" /> Hide</>  
                                ) : (
                                  <><ChevronDown className="h-3 w-3 mr-1" /> Show</>  
                                )}
                              </Button>
                              {expanded[func.name] && (
                                <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                  {results[func.name].formatted}
                                </pre>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-green-600">
                                {results[func.name].formatted}
                              </span>
                              {results[func.name].formatted && results[func.name].formatted!.length > 20 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(results[func.name].formatted || '', func.name)}
                                  className="h-5 w-5 p-0"
                                >
                                  {copiedField === func.name ? (
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {results[func.name]?.error && (
                        <div className="mt-2 text-sm text-red-600">
                          {results[func.name].error}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => callFunction(func)}
                      disabled={loading[func.name]}
                      size="sm"
                      variant="outline"
                    >
                      {loading[func.name] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Functions with inputs - expandable cards */}
      {withInputFunctions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Functions with Parameters</h3>
          {withInputFunctions.map((func) => (
            <Card key={func.name} className="overflow-hidden">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{func.name}</span>
                    <span className="text-xs text-gray-500">
                      ({func.inputs?.map(i => i.type).join(', ')}) → {func.outputs?.map(o => o.type).join(', ')}
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
                    {/* Inputs */}
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

                    {/* Query Button */}
                    <Button
                      onClick={() => callFunction(func)}
                      disabled={loading[func.name]}
                      className="w-full h-8"
                      variant="secondary"
                    >
                      {loading[func.name] ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Querying...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-3 w-3" />
                          Query
                        </>
                      )}
                    </Button>

                    {/* Results */}
                    {results[func.name] && (
                      <div className="mt-3">
                        {results[func.name].error ? (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              {results[func.name].error}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="text-sm">
                              <strong className="text-green-800">Result:</strong>
                              <pre className="mt-1 font-mono text-xs whitespace-pre-wrap break-all">
                                {results[func.name].formatted}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}