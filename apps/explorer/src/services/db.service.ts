// Database service facade - uses storage factory to select appropriate provider

import { getStorageProvider } from './storage/storage.factory'
import type { MetricData, ABIData, ContractData } from './storage/storage.interface'

class DatabaseService {
  private get provider() {
    return getStorageProvider()
  }

  // Metrics operations
  async saveMetric(key: string, value: any): Promise<void> {
    return this.provider.saveMetric(key, value)
  }

  async loadMetric<T = any>(key: string): Promise<T | null> {
    return this.provider.loadMetric<T>(key)
  }

  // ABI operations
  async saveABI(address: string, abi: any[], name?: string): Promise<void> {
    return this.provider.saveABI(address, abi, name)
  }

  async loadABI(address: string): Promise<any[] | null> {
    return this.provider.loadABI(address)
  }

  async getAbiData(address: string): Promise<ABIData | null> {
    return this.provider.getAbiData(address)
  }

  // Alias methods for backward compatibility
  async getAbi(address: string): Promise<any[] | null> {
    return this.provider.getAbi(address)
  }

  async saveAbi(address: string, abi: any[], name?: string): Promise<void> {
    return this.provider.saveAbi(address, abi, name)
  }

  async getAllVerifiedContracts(): Promise<ABIData[]> {
    return this.provider.getAllVerifiedContracts()
  }

  // Contract source code operations
  async saveContract(address: string, contractData: Partial<ContractData>): Promise<void> {
    return this.provider.saveContract(address, contractData)
  }

  async loadContract(address: string): Promise<ContractData | null> {
    return this.provider.loadContract(address)
  }

  // Clear all data
  async clearAll(): Promise<void> {
    return this.provider.clearAll()
  }
}

// Export singleton instance
export const dbService = new DatabaseService()

// Export types
export type { MetricData, ABIData, ContractData }