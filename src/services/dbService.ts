import type { Abi } from 'viem'

const DB_NAME = 'BlockExplorerDB'
const DB_VERSION = 1
const ABI_STORE_NAME = 'contractAbis'

interface StoredAbi {
  address: string
  abi: Abi
  contractName?: string
  source?: string
  compiler?: string
  timestamp: number
}

class DBService {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create ABI store
        if (!db.objectStoreNames.contains(ABI_STORE_NAME)) {
          const abiStore = db.createObjectStore(ABI_STORE_NAME, { keyPath: 'address' })
          abiStore.createIndex('timestamp', 'timestamp', { unique: false })
          abiStore.createIndex('contractName', 'contractName', { unique: false })
        }
      }
    })
  }

  async saveAbi(address: string, abi: Abi, contractName?: string, source?: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ABI_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(ABI_STORE_NAME)

      const data: StoredAbi = {
        address: address.toLowerCase(),
        abi,
        contractName,
        source,
        timestamp: Date.now()
      }

      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to save ABI'))
    })
  }

  async getAbi(address: string): Promise<StoredAbi | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ABI_STORE_NAME], 'readonly')
      const store = transaction.objectStore(ABI_STORE_NAME)
      const request = store.get(address.toLowerCase())

      request.onsuccess = () => {
        resolve(request.result || null)
      }
      request.onerror = () => reject(new Error('Failed to get ABI'))
    })
  }

  async getAllAbis(): Promise<StoredAbi[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ABI_STORE_NAME], 'readonly')
      const store = transaction.objectStore(ABI_STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(new Error('Failed to get ABIs'))
    })
  }

  async deleteAbi(address: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ABI_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(ABI_STORE_NAME)
      const request = store.delete(address.toLowerCase())

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to delete ABI'))
    })
  }
}

// Export singleton instance
export const dbService = new DBService()

// Initialize DB on import
dbService.init().catch(console.error)