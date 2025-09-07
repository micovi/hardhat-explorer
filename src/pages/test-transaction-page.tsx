import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicClient } from '@/lib/viem-client'

export default function TestTransactionPage() {
  const [hash, setHash] = useState('0x770ffd44133e760547f6a98509bfa8e21545271feec25e0c1e01d3aac5887d8b')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testFetch = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('[TEST PAGE] Starting test with hash:', hash)
      const client = getPublicClient()
      
      // Test 1: Get chain ID
      const chainId = await client.getChainId()
      console.log('[TEST PAGE] Chain ID:', chainId)
      
      // Test 2: Get latest block
      const latestBlock = await client.getBlockNumber()
      console.log('[TEST PAGE] Latest block:', latestBlock)
      
      // Test 3: Try to fetch the transaction
      const tx = await client.getTransaction({
        hash: hash as `0x${string}`
      })
      console.log('[TEST PAGE] Transaction result:', tx)
      
      // Test 4: Try to get receipt
      let receipt = null
      if (tx) {
        try {
          receipt = await client.getTransactionReceipt({
            hash: hash as `0x${string}`
          })
          console.log('[TEST PAGE] Receipt:', receipt)
        } catch (e) {
          console.log('[TEST PAGE] No receipt yet:', e)
        }
      }
      
      setResult({
        chainId,
        latestBlock: latestBlock.toString(),
        transaction: tx,
        receipt
      })
    } catch (err: any) {
      console.error('[TEST PAGE] Error:', err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Enter transaction hash"
                className="font-mono text-sm"
              />
              <Button onClick={testFetch} disabled={loading}>
                {loading ? 'Testing...' : 'Test Fetch'}
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 font-semibold">Error:</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <p className="text-green-800 font-semibold">Connection Successful!</p>
                  <p className="text-sm">Chain ID: {result.chainId}</p>
                  <p className="text-sm">Latest Block: {result.latestBlock}</p>
                </div>
                
                {result.transaction ? (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <p className="text-blue-800 font-semibold">Transaction Found!</p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>Hash: {result.transaction.hash}</p>
                      <p>From: {result.transaction.from}</p>
                      <p>To: {result.transaction.to || 'Contract Creation'}</p>
                      <p>Block: {result.transaction.blockNumber?.toString()}</p>
                      <p>Value: {result.transaction.value?.toString()} wei</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-yellow-800 font-semibold">Transaction Not Found</p>
                    <p className="text-sm text-yellow-600">
                      The transaction hash does not exist in the blockchain.
                      Make sure the transaction has been mined.
                    </p>
                  </div>
                )}
                
                {result.receipt && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-4">
                    <p className="text-purple-800 font-semibold">Receipt Found!</p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>Status: {result.receipt.status === 'success' ? '✅ Success' : '❌ Failed'}</p>
                      <p>Gas Used: {result.receipt.gasUsed?.toString()}</p>
                      <p>Logs: {result.receipt.logs?.length || 0} events</p>
                    </div>
                  </div>
                )}
                
                <details className="bg-gray-50 rounded p-4">
                  <summary className="cursor-pointer font-semibold">Raw Data</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(result, (key, value) =>
                      typeof value === 'bigint' ? value.toString() : value
                    , 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}