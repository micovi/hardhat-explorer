import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Pickaxe, 
  Clock, 
  RotateCcw, 
  Camera, 
  Undo2,
  Wallet,
  Settings,
  Play,
  AlertCircle,
  Loader2
} from 'lucide-react'

import { parseEther } from 'viem'
import { toast } from 'sonner'

export default function DeveloperTools() {
  const [loading, setLoading] = useState<string | null>(null)
  const [blockCount, setBlockCount] = useState('1')
  const [timeIncrease, setTimeIncrease] = useState('3600')
  const [snapshotId, setSnapshotId] = useState<string | null>(null)
  const [targetAddress, setTargetAddress] = useState('')
  const [ethAmount, setEthAmount] = useState('100')

  const executeAction = async (action: string, fn: () => Promise<any>) => {
    setLoading(action)
    try {
      const result = await fn()
      toast.success(`${action} successful`, {
        description: result?.message || 'Operation completed'
      })
      return result
    } catch (error: any) {
      toast.error(`${action} failed`, {
        description: error?.message || 'Unknown error'
      })
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  const mineBlocks = async () => {
    await executeAction('Mine blocks', async () => {
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'hardhat_mine',
          params: [blockCount ? `0x${parseInt(blockCount).toString(16)}` : '0x1'],
          id: 1
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      return { message: `Mined ${blockCount} block(s)` }
    })
  }

  const increaseTime = async () => {
    await executeAction('Advance time', async () => {
      const seconds = parseInt(timeIncrease)
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [seconds],
          id: 1
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      
      // Mine a block to apply the time change
      await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'evm_mine',
          params: [],
          id: 2
        })
      })
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return { message: `Advanced time by ${hours}h ${minutes}m` }
    })
  }

  const resetNetwork = async () => {
    await executeAction('Reset network', async () => {
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'hardhat_reset',
          params: [],
          id: 1
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      setSnapshotId(null)
      return { message: 'Network reset to initial state' }
    })
  }

  const takeSnapshot = async () => {
    await executeAction('Take snapshot', async () => {
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'evm_snapshot',
          params: [],
          id: 1
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      setSnapshotId(data.result)
      return { message: `Snapshot created: ${data.result}` }
    })
  }

  const revertSnapshot = async () => {
    if (!snapshotId) {
      toast.error('No snapshot available')
      return
    }
    
    await executeAction('Revert snapshot', async () => {
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'evm_revert',
          params: [snapshotId],
          id: 1
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      setSnapshotId(null)
      return { message: 'Reverted to snapshot' }
    })
  }

  const setBalance = async () => {
    if (!targetAddress || !ethAmount) {
      toast.error('Please provide address and amount')
      return
    }
    
    await executeAction('Set balance', async () => {
      const weiAmount = parseEther(ethAmount)
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'hardhat_setBalance',
          params: [targetAddress, `0x${weiAmount.toString(16)}`],
          id: 1
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      return { message: `Set balance of ${targetAddress.slice(0, 10)}... to ${ethAmount} ETH` }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Developer Tools
        </h2>
        <Badge variant="outline">Hardhat Network</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Mine Blocks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pickaxe className="h-4 w-4" />
              Mine Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="blocks" className="text-xs">Number of blocks</Label>
                <Input
                  id="blocks"
                  type="number"
                  value={blockCount}
                  onChange={(e) => setBlockCount(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="h-8 mt-1"
                />
              </div>
              <Button 
                onClick={mineBlocks} 
                className="w-full h-8"
                disabled={loading === 'Mine blocks'}
              >
                {loading === 'Mine blocks' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Mine
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advance Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Advance Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="time" className="text-xs">Seconds to advance</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    id="time"
                    type="number"
                    value={timeIncrease}
                    onChange={(e) => setTimeIncrease(e.target.value)}
                    placeholder="3600"
                    min="1"
                    className="h-8"
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTimeIncrease('3600')}
                    className="h-6 text-xs flex-1"
                  >
                    1h
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTimeIncrease('86400')}
                    className="h-6 text-xs flex-1"
                  >
                    1d
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTimeIncrease('604800')}
                    className="h-6 text-xs flex-1"
                  >
                    1w
                  </Button>
                </div>
              </div>
              <Button 
                onClick={increaseTime} 
                className="w-full h-8"
                disabled={loading === 'Advance time'}
              >
                {loading === 'Advance time' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Advance
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Snapshot/Revert */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {snapshotId && (
                <div className="text-xs bg-gray-50 rounded p-2">
                  <span className="text-gray-500">ID:</span> {snapshotId}
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={takeSnapshot} 
                  className="flex-1 h-8"
                  variant="outline"
                  disabled={loading === 'Take snapshot'}
                >
                  {loading === 'Take snapshot' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Take
                    </>
                  )}
                </Button>
                <Button 
                  onClick={revertSnapshot} 
                  className="flex-1 h-8"
                  variant="outline"
                  disabled={!snapshotId || loading === 'Revert snapshot'}
                >
                  {loading === 'Revert snapshot' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Undo2 className="h-4 w-4 mr-2" />
                      Revert
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Snapshots save the entire state of the blockchain
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Set Balance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Set Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="address" className="text-xs">Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="0x..."
                  className="h-8 mt-1 font-mono text-xs"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-xs">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="100"
                  className="h-8 mt-1"
                />
              </div>
              <Button 
                onClick={setBalance} 
                className="w-full h-8"
                disabled={loading === 'Set balance'}
              >
                {loading === 'Set balance' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Set
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reset Network */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs">
                  This will reset the entire network to its initial state
                </AlertDescription>
              </Alert>
              <Button 
                onClick={resetNetwork} 
                className="w-full h-8"
                variant="destructive"
                disabled={loading === 'Reset network'}
              >
                {loading === 'Reset network' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}