// Storage configuration - determined at build time
// Default to indexeddb for public demo builds
// Use 'api' for CLI builds that connect to SQLite backend

export const STORAGE_MODE = (import.meta.env.VITE_STORAGE_MODE || 'indexeddb') as 'indexeddb' | 'api'

export const isUsingIndexedDB = () => STORAGE_MODE === 'indexeddb'
export const isUsingAPI = () => STORAGE_MODE === 'api'