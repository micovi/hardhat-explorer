import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Pickaxe, 
  Clock, 
  RotateCcw, 
  Camera, 
  Undo2,
  Wallet,
  Settings,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  Save,
  FolderOpen,
  Trash2,
  Network,
  History
} from 'lucide-react'
import { getPublicClient } from '@/lib/viem-client'
import { parseEther } from 'viem'
import { toast } from 'sonner'

interface Snapshot {
  id: string
  name: string
  blockNumber: number
  timestamp: Date
  description?: string
}

export default function NetworkPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [blockCount, setBlockCount] = useState('1')
  const [timeIncrease, setTimeIncrease] = useState('3600')
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [snapshotName, setSnapshotName] = useState('')
  const [snapshotDescription, setSnapshotDescription] = useState('')
  const [targetAddress, setTargetAddress] = useState('')
  const [ethAmount, setEthAmount] = useState('100')
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  
  // Network configuration states
  const [autoMining, setAutoMining] = useState(true)
  const [blockTime, setBlockTime] = useState('0')
  const [networkConfig, setNetworkConfig] = useState<{
    automine: boolean
    blockTime: number
    miningInterval?: number
  }>({ automine: true, blockTime: 0 })

  useEffect(() => {
    // Load saved snapshots from localStorage
    const saved = localStorage.getItem('hardhat-snapshots')
    if (saved) {
      setSnapshots(JSON.parse(saved))
    }
    
    // Get current block
    fetchCurrentBlock()
  }, [])

  const fetchCurrentBlock = async () => {
    try {
      const client = getPublicClient()
      const block = await client.getBlockNumber()
      setCurrentBlock(Number(block))
    } catch (error) {
      console.error('Failed to fetch block:', error)
    }
  }

  const saveSnapshotsToStorage = (snaps: Snapshot[]) => {
    localStorage.setItem('hardhat-snapshots', JSON.stringify(snaps))
    setSnapshots(snaps)
  }

  const executeAction = async (action: string, fn: () => Promise<any>) => {
    setLoading(action)
    try {
      const result = await fn()
      toast.success(`${action} successful`, {
        description: result?.message || 'Operation completed'
      })
      fetchCurrentBlock() // Refresh block number
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
      
      // Clear all snapshots since network was reset
      saveSnapshotsToStorage([])
      return { message: 'Network reset to initial state' }
    })
  }

  const takeSnapshot = async () => {
    if (!snapshotName) {
      toast.error('Please enter a snapshot name')
      return
    }

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
      
      const newSnapshot: Snapshot = {
        id: data.result,
        name: snapshotName,
        blockNumber: currentBlock,
        timestamp: new Date(),
        description: snapshotDescription
      }
      
      saveSnapshotsToStorage([...snapshots, newSnapshot])
      setSnapshotName('')
      setSnapshotDescription('')
      
      return { message: `Snapshot "${snapshotName}" created` }
    })
  }

  const revertSnapshot = async (snapshot: Snapshot) => {
    await executeAction('Revert snapshot', async () => {
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'evm_revert',
          params: [snapshot.id],
          id: 1
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      
      // Remove this snapshot and all snapshots after it
      const index = snapshots.findIndex(s => s.id === snapshot.id)
      if (index >= 0) {
        saveSnapshotsToStorage(snapshots.slice(0, index))
      }
      
      return { message: `Reverted to snapshot "${snapshot.name}"` }
    })
  }

  const deleteSnapshot = (snapshot: Snapshot) => {
    const filtered = snapshots.filter(s => s.id !== snapshot.id)
    saveSnapshotsToStorage(filtered)
    toast.info(`Snapshot "${snapshot.name}" removed from list`)
  }

  // Network configuration functions
  const toggleAutoMining = async (enabled: boolean) => {
    await executeAction(`${enabled ? 'Enable' : 'Disable'} auto-mining`, async () => {
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'evm_setAutomine',
          params: [enabled],
          id: 1
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      setAutoMining(enabled)
      setNetworkConfig(prev => ({ ...prev, automine: enabled }))
      return { message: `Auto-mining ${enabled ? 'enabled' : 'disabled'}` }
    })
  }

  const setMiningInterval = async () => {
    const interval = parseInt(blockTime)
    if (isNaN(interval) || interval < 0) {
      toast.error('Please enter a valid interval in seconds')
      return
    }

    await executeAction('Set mining interval', async () => {
      // First disable automine if setting an interval
      if (interval > 0) {
        await fetch('http://127.0.0.1:8545', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'evm_setAutomine',
            params: [false],
            id: 1
          })
        })
      }

      // Set the interval
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'evm_setIntervalMining',
          params: [interval * 1000], // Convert to milliseconds
          id: 2
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      
      setNetworkConfig(prev => ({ 
        ...prev, 
        automine: interval === 0, 
        blockTime: interval,
        miningInterval: interval 
      }))
      
      if (interval === 0) {
        setAutoMining(true)
        return { message: 'Returned to auto-mining (instant blocks)' }
      } else {
        setAutoMining(false)
        return { message: `Mining interval set to ${interval} second${interval !== 1 ? 's' : ''}` }
      }
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Network className="h-8 w-8" />
          Network Tools
        </h1>
        <p className="text-gray-500 mt-2">
          Hardhat network control and developer utilities
        </p>
      </div>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Block</p>
              <p className="text-xl font-bold">#{currentBlock}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Chain ID</p>
              <p className="text-xl font-bold">31337</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Network</p>
              <p className="text-xl font-bold">Hardhat</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant="success" className="mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Network Config</TabsTrigger>
          <TabsTrigger value="controls">Block Controls</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        {/* Network Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Mining Configuration
              </CardTitle>
              <CardDescription>
                Control how blocks are mined on the Hardhat network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-mining Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-mining</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      When enabled, blocks are mined instantly when transactions are sent
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={autoMining ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAutoMining(true)}
                      disabled={loading === 'Enable auto-mining' || autoMining}
                    >
                      {loading === 'Enable auto-mining' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>On</>
                      )}
                    </Button>
                    <Button
                      variant={!autoMining ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAutoMining(false)}
                      disabled={loading === 'Disable auto-mining' || !autoMining}
                    >
                      {loading === 'Disable auto-mining' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>Off</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-base">Block Time Interval</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Set a fixed interval for mining blocks (in seconds). Use 0 for instant mining.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={blockTime}
                      onChange={(e) => setBlockTime(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="flex-1"
                    />
                    <Button 
                      onClick={setMiningInterval}
                      disabled={loading === 'Set mining interval'}
                    >
                      {loading === 'Set mining interval' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>Set Interval</>
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBlockTime('0')}
                      className="flex-1"
                    >
                      Instant
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBlockTime('1')}
                      className="flex-1"
                    >
                      1 sec
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBlockTime('5')}
                      className="flex-1"
                    >
                      5 sec
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBlockTime('10')}
                      className="flex-1"
                    >
                      10 sec
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current Configuration Display */}
              <div className="border-t pt-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Current Configuration</AlertTitle>
                  <AlertDescription className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={networkConfig.automine ? "success" : "secondary"}>
                        {networkConfig.automine ? 'Auto-mining ON' : 'Auto-mining OFF'}
                      </Badge>
                      {networkConfig.miningInterval && networkConfig.miningInterval > 0 && (
                        <Badge variant="outline">
                          Interval: {networkConfig.miningInterval}s
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {networkConfig.automine 
                        ? "Blocks are mined instantly when transactions are sent"
                        : networkConfig.miningInterval && networkConfig.miningInterval > 0
                        ? `Blocks are mined every ${networkConfig.miningInterval} second${networkConfig.miningInterval !== 1 ? 's' : ''}`
                        : "Manual mining only - use 'Mine Blocks' to create new blocks"
                      }
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Block Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mine Blocks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pickaxe className="h-5 w-5" />
                  Mine Blocks
                </CardTitle>
                <CardDescription>
                  Instantly mine new blocks to progress the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="blocks">Number of blocks</Label>
                    <Input
                      id="blocks"
                      type="number"
                      value={blockCount}
                      onChange={(e) => setBlockCount(e.target.value)}
                      placeholder="1"
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={mineBlocks} 
                    className="w-full"
                    disabled={loading === 'Mine blocks'}
                  >
                    {loading === 'Mine blocks' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Mine Blocks
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advance Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Travel
                </CardTitle>
                <CardDescription>
                  Jump forward in time for testing time-dependent contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="time">Seconds to advance</Label>
                    <Input
                      id="time"
                      type="number"
                      value={timeIncrease}
                      onChange={(e) => setTimeIncrease(e.target.value)}
                      placeholder="3600"
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTimeIncrease('3600')}
                    >
                      1h
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTimeIncrease('86400')}
                    >
                      1d
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTimeIncrease('604800')}
                    >
                      1w
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTimeIncrease('2592000')}
                    >
                      30d
                    </Button>
                  </div>
                  <Button 
                    onClick={increaseTime} 
                    className="w-full"
                    disabled={loading === 'Advance time'}
                  >
                    {loading === 'Advance time' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Advance Time
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reset Network */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Reset Network
                </CardTitle>
                <CardDescription>
                  Reset the entire network to its initial state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This will reset all blockchain data including contracts, transactions, and balances to the initial state.
                    All snapshots will be cleared.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={resetNetwork} 
                  variant="destructive"
                  className="w-full"
                  disabled={loading === 'Reset network'}
                >
                  {loading === 'Reset network' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Network
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Snapshots Tab */}
        <TabsContent value="snapshots" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How Snapshots Work</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p>Snapshots save the complete state of the blockchain at a specific point:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All deployed contracts and their storage</li>
                <li>All account balances</li>
                <li>All transaction history up to that point</li>
                <li>Current block number and timestamp</li>
              </ul>
              <p className="mt-2">
                You can revert to any snapshot to restore the exact state. Note that reverting to a snapshot 
                will invalidate all snapshots taken after it.
              </p>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Create Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Create Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="snapshot-name">Name *</Label>
                    <Input
                      id="snapshot-name"
                      value={snapshotName}
                      onChange={(e) => setSnapshotName(e.target.value)}
                      placeholder="e.g., Before token deployment"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="snapshot-desc">Description (optional)</Label>
                    <Input
                      id="snapshot-desc"
                      value={snapshotDescription}
                      onChange={(e) => setSnapshotDescription(e.target.value)}
                      placeholder="e.g., Clean state with initial accounts"
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={takeSnapshot} 
                    className="w-full"
                    disabled={loading === 'Take snapshot' || !snapshotName}
                  >
                    {loading === 'Take snapshot' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Snapshot
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Snapshots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Saved Snapshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {snapshots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No snapshots saved</p>
                    <p className="text-sm mt-1">Create a snapshot to save the current state</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {snapshots.map((snapshot) => (
                      <div 
                        key={snapshot.id} 
                        className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{snapshot.name}</p>
                            {snapshot.description && (
                              <p className="text-sm text-gray-500">{snapshot.description}</p>
                            )}
                            <div className="flex gap-4 text-xs text-gray-400 mt-1">
                              <span>Block #{snapshot.blockNumber}</span>
                              <span>{new Date(snapshot.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => revertSnapshot(snapshot)}
                              disabled={loading === 'Revert snapshot'}
                            >
                              <Undo2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSnapshot(snapshot)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Set Account Balance
              </CardTitle>
              <CardDescription>
                Instantly set any address's ETH balance for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    placeholder="0x..."
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (ETH)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="amount"
                      type="number"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      placeholder="100"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEthAmount('100')}
                      >
                        100
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEthAmount('1000')}
                      >
                        1K
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEthAmount('10000')}
                      >
                        10K
                      </Button>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={setBalance} 
                  className="w-full"
                  disabled={loading === 'Set balance'}
                >
                  {loading === 'Set balance' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Set Balance
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}