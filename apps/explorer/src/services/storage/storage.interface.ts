// Storage provider interface for abstraction between IndexedDB and API storage

export interface MetricData {
  id: string
  data: any
  timestamp: number
}

export interface ABIData {
  address: string
  abi: any[]
  name?: string
  verified: boolean
  timestamp: number
}

export interface ContractData {
  address: string
  sourceCode?: string
  compiler?: string
  optimization?: boolean
  runs?: number
  timestamp: number
}

export interface StorageProvider {
  // Metrics operations
  saveMetric(key: string, value: any): Promise<void>
  loadMetric<T = any>(key: string): Promise<T | null>
  
  // ABI operations
  saveABI(address: string, abi: any[], name?: string): Promise<void>
  loadABI(address: string): Promise<any[] | null>
  getAbiData(address: string): Promise<ABIData | null>
  getAllVerifiedContracts(): Promise<ABIData[]>
  
  // Backward compatibility aliases
  getAbi(address: string): Promise<any[] | null>
  saveAbi(address: string, abi: any[], name?: string): Promise<void>
  
  // Contract source code operations
  saveContract(address: string, contractData: Partial<ContractData>): Promise<void>
  loadContract(address: string): Promise<ContractData | null>
  
  // Utility operations
  clearAll(): Promise<void>
}