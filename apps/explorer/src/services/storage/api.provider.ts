// API storage provider implementation for SQLite backend

import type { StorageProvider, MetricData, ABIData, ContractData } from './storage.interface'

export class ApiProvider implements StorageProvider {
  private baseUrl: string = '/api/storage'

  private async fetchJson(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Metrics operations
  async saveMetric(key: string, value: any): Promise<void> {
    await this.fetchJson(`${this.baseUrl}/metrics/${key}`, {
      method: 'POST',
      body: JSON.stringify({ data: value }),
    })
  }

  async loadMetric<T = any>(key: string): Promise<T | null> {
    try {
      const result = await this.fetchJson(`${this.baseUrl}/metrics/${key}`)
      return result?.data || null
    } catch (error) {
      console.error('Error loading metric:', error)
      return null
    }
  }

  // ABI operations
  async saveABI(address: string, abi: any[], name?: string): Promise<void> {
    await this.fetchJson(`${this.baseUrl}/abis/${address.toLowerCase()}`, {
      method: 'POST',
      body: JSON.stringify({ abi, name }),
    })
  }

  async loadABI(address: string): Promise<any[] | null> {
    try {
      const result = await this.fetchJson(`${this.baseUrl}/abis/${address.toLowerCase()}`)
      return result?.abi || null
    } catch (error) {
      console.error('Error loading ABI:', error)
      return null
    }
  }

  async getAbiData(address: string): Promise<ABIData | null> {
    try {
      const result = await this.fetchJson(`${this.baseUrl}/abis/${address.toLowerCase()}`)
      return result || null
    } catch (error) {
      console.error('Error loading ABI data:', error)
      return null
    }
  }

  // Alias methods for backward compatibility
  async getAbi(address: string): Promise<any[] | null> {
    return this.loadABI(address)
  }

  async saveAbi(address: string, abi: any[], name?: string): Promise<void> {
    return this.saveABI(address, abi, name)
  }

  async getAllVerifiedContracts(): Promise<ABIData[]> {
    try {
      const result = await this.fetchJson(`${this.baseUrl}/contracts/verified`)
      return result || []
    } catch (error) {
      console.error('Error accessing verified contracts:', error)
      return []
    }
  }

  // Contract source code operations
  async saveContract(address: string, contractData: Partial<ContractData>): Promise<void> {
    await this.fetchJson(`${this.baseUrl}/contracts/${address.toLowerCase()}`, {
      method: 'POST',
      body: JSON.stringify(contractData),
    })
  }

  async loadContract(address: string): Promise<ContractData | null> {
    try {
      const result = await this.fetchJson(`${this.baseUrl}/contracts/${address.toLowerCase()}`)
      return result || null
    } catch (error) {
      console.error('Error loading contract:', error)
      return null
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.fetchJson(`${this.baseUrl}/clear`, {
      method: 'POST',
    })
    console.log('Database cleared successfully via API')
  }
}