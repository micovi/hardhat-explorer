// Storage factory - selects the appropriate storage provider based on build configuration

import { STORAGE_MODE } from '@/config/storage.config'
import { IndexedDBProvider } from './indexeddb.provider'
import { ApiProvider } from './api.provider'
import type { StorageProvider } from './storage.interface'

let storageProvider: StorageProvider | null = null

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    console.log(`Initializing storage provider: ${STORAGE_MODE}`)
    
    switch (STORAGE_MODE) {
      case 'api':
        storageProvider = new ApiProvider()
        break
      case 'indexeddb':
      default:
        storageProvider = new IndexedDBProvider()
        break
    }
  }
  
  return storageProvider
}