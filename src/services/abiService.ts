import { decodeFunctionData, decodeEventLog, type Abi, type Log } from 'viem'
import { dbService } from './dbService'

class ABIService {
  private abiCache: Map<string, Abi> = new Map()
  private nameCache: Map<string, string> = new Map()

  async loadAllAbis() {
    try {
      const storedAbis = await dbService.getAllAbis()
      storedAbis.forEach(item => {
        this.abiCache.set(item.address.toLowerCase(), item.abi)
        if (item.contractName) {
          this.nameCache.set(item.address.toLowerCase(), item.contractName)
        }
      })
    } catch (error) {
      console.error('Failed to load ABIs:', error)
    }
  }

  async getAbi(address: string): Promise<Abi | null> {
    const normalizedAddress = address.toLowerCase()
    
    // Check cache first
    if (this.abiCache.has(normalizedAddress)) {
      return this.abiCache.get(normalizedAddress)!
    }

    // Load from DB
    try {
      const stored = await dbService.getAbi(normalizedAddress)
      if (stored) {
        this.abiCache.set(normalizedAddress, stored.abi)
        if (stored.contractName) {
          this.nameCache.set(normalizedAddress, stored.contractName)
        }
        return stored.abi
      }
    } catch (error) {
      console.error('Failed to get ABI:', error)
    }

    return null
  }

  async getContractName(address: string): Promise<string | null> {
    const normalizedAddress = address.toLowerCase()
    
    // Check cache first
    if (this.nameCache.has(normalizedAddress)) {
      return this.nameCache.get(normalizedAddress)!
    }

    // Load from DB
    try {
      const stored = await dbService.getAbi(normalizedAddress)
      if (stored && stored.contractName) {
        this.nameCache.set(normalizedAddress, stored.contractName)
        return stored.contractName
      }
    } catch (error) {
      console.error('Failed to get contract name:', error)
    }

    return null
  }

  async decodeFunctionCall(
    to: string | null | undefined,
    input: string
  ): Promise<{ functionName: string; args: any } | null> {
    if (!to || !input || input === '0x' || input.length < 10) {
      return null
    }

    const abi = await this.getAbi(to)
    if (!abi) {
      return null
    }

    try {
      const decoded = decodeFunctionData({
        abi,
        data: input as `0x${string}`
      })
      
      return {
        functionName: decoded.functionName,
        args: decoded.args
      }
    } catch (error) {
      // Decoding failed - ABI might not match
      return null
    }
  }

  async decodeEvent(
    address: string,
    log: Log
  ): Promise<{ eventName: string; args: any } | null> {
    const abi = await this.getAbi(address)
    if (!abi) {
      return null
    }

    try {
      const decoded = decodeEventLog({
        abi,
        data: log.data as `0x${string}`,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]]
      })
      
      return {
        eventName: decoded.eventName,
        args: decoded.args
      }
    } catch (error) {
      // Decoding failed - ABI might not match
      return null
    }
  }

  getMethodSignature(input: string): string {
    if (!input || input === '0x' || input.length < 10) {
      return 'Transfer'
    }

    const methodId = input.slice(0, 10).toLowerCase()
    
    // Common method signatures
    const methodMap: Record<string, string> = {
      '0xa9059cbb': 'transfer',
      '0x23b872dd': 'transferFrom',
      '0x095ea7b3': 'approve',
      '0x70a08231': 'balanceOf',
      '0x18160ddd': 'totalSupply',
      '0x40c10f19': 'mint',
      '0x42966c68': 'burn',
      '0xa0712d68': 'mint',
      '0x2e1a7d4d': 'withdraw',
      '0xd0e30db0': 'deposit',
      '0x3ccfd60b': 'withdraw',
      '0x06fdde03': 'name',
      '0x95d89b41': 'symbol',
      '0x313ce567': 'decimals',
    }

    return methodMap[methodId] || 'Contract Call'
  }
}

export const abiService = new ABIService()

// Load ABIs on initialization
abiService.loadAllAbis()