// IndexedDB service for caching ABIs and blockchain data

const DB_NAME = 'BlockExplorerDB'
const DB_VERSION = 1

const STORES = {
  METRICS: 'metrics',
  ABIS: 'abis',
  CONTRACTS: 'contracts',
} as const

type StoreNames = typeof STORES[keyof typeof STORES]

interface MetricData {
  id: string
  data: any
  timestamp: number
}

interface ABIData {
  address: string
  abi: any[]
  name?: string
  verified: boolean
  timestamp: number
}

interface ContractData {
  address: string
  sourceCode?: string
  compiler?: string
  optimization?: boolean
  runs?: number
  timestamp: number
}

class DatabaseService {
  private db: IDBDatabase | null = null

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.METRICS)) {
          db.createObjectStore(STORES.METRICS, { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains(STORES.ABIS)) {
          const abiStore = db.createObjectStore(STORES.ABIS, { keyPath: 'address' })
          abiStore.createIndex('verified', 'verified', { unique: false })
        }
        
        if (!db.objectStoreNames.contains(STORES.CONTRACTS)) {
          db.createObjectStore(STORES.CONTRACTS, { keyPath: 'address' })
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }
      
      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }
    })
  }

  private async getDb(): Promise<IDBDatabase> {
    if (!this.db) {
      this.db = await this.openDatabase()
    }
    return this.db
  }

  // Metrics operations
  async saveMetric(key: string, value: any): Promise<void> {
    const db = await this.getDb()
    const transaction = db.transaction(STORES.METRICS, 'readwrite')
    const store = transaction.objectStore(STORES.METRICS)
    
    const data: MetricData = {
      id: key,
      data: value,
      timestamp: Date.now(),
    }
    
    store.put(data)
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('Failed to save metric'))
    })
  }

  async loadMetric<T = any>(key: string): Promise<T | null> {
    const db = await this.getDb()
    const transaction = db.transaction(STORES.METRICS, 'readonly')
    const store = transaction.objectStore(STORES.METRICS)
    const request = store.get(key)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result as MetricData | undefined
        resolve(result?.data || null)
      }
      request.onerror = () => reject(new Error('Failed to load metric'))
    })
  }

  // ABI operations
  async saveABI(address: string, abi: any[], name?: string): Promise<void> {
    const db = await this.getDb()
    const transaction = db.transaction(STORES.ABIS, 'readwrite')
    const store = transaction.objectStore(STORES.ABIS)
    
    const data: ABIData = {
      address: address.toLowerCase(),
      abi,
      name,
      verified: true,
      timestamp: Date.now(),
    }
    
    store.put(data)
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('Failed to save ABI'))
    })
  }

  async loadABI(address: string): Promise<any[] | null> {
    const db = await this.getDb()
    const transaction = db.transaction(STORES.ABIS, 'readonly')
    const store = transaction.objectStore(STORES.ABIS)
    const request = store.get(address.toLowerCase())

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result as ABIData | undefined
        resolve(result?.abi || null)
      }
      request.onerror = () => reject(new Error('Failed to load ABI'))
    })
  }

  async getAllVerifiedContracts(): Promise<ABIData[]> {
    const db = await this.getDb()
    const transaction = db.transaction(STORES.ABIS, 'readonly')
    const store = transaction.objectStore(STORES.ABIS)
    const index = store.index('verified')
    const request = index.getAll(true)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result as ABIData[])
      }
      request.onerror = () => reject(new Error('Failed to load verified contracts'))
    })
  }

  // Contract source code operations
  async saveContract(address: string, contractData: Partial<ContractData>): Promise<void> {
    const db = await this.getDb()
    const transaction = db.transaction(STORES.CONTRACTS, 'readwrite')
    const store = transaction.objectStore(STORES.CONTRACTS)
    
    const data: ContractData = {
      address: address.toLowerCase(),
      ...contractData,
      timestamp: Date.now(),
    }
    
    store.put(data)
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('Failed to save contract'))
    })
  }

  async loadContract(address: string): Promise<ContractData | null> {
    const db = await this.getDb()
    const transaction = db.transaction(STORES.CONTRACTS, 'readonly')
    const store = transaction.objectStore(STORES.CONTRACTS)
    const request = store.get(address.toLowerCase())

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result as ContractData || null)
      }
      request.onerror = () => reject(new Error('Failed to load contract'))
    })
  }

  // Clear all data
  async clearAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME)
      request.onsuccess = () => {
        this.db = null
        console.log(`Database ${DB_NAME} cleared successfully`)
        resolve()
      }
      request.onerror = () => {
        reject(new Error('Failed to clear database'))
      }
    })
  }
}

// Export singleton instance
export const dbService = new DatabaseService()

// Export types
export type { MetricData, ABIData, ContractData }