import Database from 'better-sqlite3';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface MetricData {
  id: string;
  data: any;
  timestamp: number;
}

interface ABIData {
  address: string;
  abi: any[];
  name?: string;
  verified: boolean;
  timestamp: number;
}

interface ContractData {
  address: string;
  sourceCode?: string;
  compiler?: string;
  optimization?: boolean;
  runs?: number;
  timestamp: number;
}

export class SQLiteService {
  private db: Database.Database;
  
  constructor(dbPath: string, resetOnStart: boolean = true) {
    // Remove existing database if reset is requested
    if (resetOnStart && existsSync(dbPath)) {
      console.log('Removing existing database for fresh start');
      unlinkSync(dbPath);
    }
    
    // Create new database
    this.db = new Database(dbPath);
    
    // Initialize schema
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
    
    console.log(`SQLite database initialized at ${dbPath}`);
  }
  
  // Metrics operations
  saveMetric(key: string, value: any): void {
    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO metrics (id, data, timestamp) VALUES (?, ?, ?)'
    );
    stmt.run(key, JSON.stringify(value), Date.now());
  }
  
  loadMetric<T = any>(key: string): T | null {
    const stmt = this.db.prepare('SELECT data FROM metrics WHERE id = ?');
    const row = stmt.get(key) as { data: string } | undefined;
    return row ? JSON.parse(row.data) : null;
  }
  
  // ABI operations
  saveABI(address: string, abi: any[], name?: string): void {
    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO abis (address, abi, name, verified, timestamp) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(
      address.toLowerCase(),
      JSON.stringify(abi),
      name || null,
      1,
      Date.now()
    );
  }
  
  loadABI(address: string): any[] | null {
    const stmt = this.db.prepare('SELECT abi FROM abis WHERE address = ?');
    const row = stmt.get(address.toLowerCase()) as { abi: string } | undefined;
    return row ? JSON.parse(row.abi) : null;
  }
  
  getAbiData(address: string): ABIData | null {
    const stmt = this.db.prepare(
      'SELECT address, abi, name, verified, timestamp FROM abis WHERE address = ?'
    );
    const row = stmt.get(address.toLowerCase()) as any;
    
    if (!row) return null;
    
    return {
      address: row.address,
      abi: JSON.parse(row.abi),
      name: row.name,
      verified: Boolean(row.verified),
      timestamp: row.timestamp,
    };
  }
  
  getAllVerifiedContracts(): ABIData[] {
    const stmt = this.db.prepare(
      'SELECT address, abi, name, verified, timestamp FROM abis WHERE verified = 1'
    );
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      address: row.address,
      abi: JSON.parse(row.abi),
      name: row.name,
      verified: Boolean(row.verified),
      timestamp: row.timestamp,
    }));
  }
  
  // Contract source code operations
  saveContract(address: string, contractData: Partial<ContractData>): void {
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO contracts 
       (address, source_code, compiler, optimization, runs, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    
    stmt.run(
      address.toLowerCase(),
      contractData.sourceCode || null,
      contractData.compiler || null,
      contractData.optimization ? 1 : 0,
      contractData.runs || null,
      Date.now()
    );
  }
  
  loadContract(address: string): ContractData | null {
    const stmt = this.db.prepare(
      'SELECT * FROM contracts WHERE address = ?'
    );
    const row = stmt.get(address.toLowerCase()) as any;
    
    if (!row) return null;
    
    return {
      address: row.address,
      sourceCode: row.source_code,
      compiler: row.compiler,
      optimization: Boolean(row.optimization),
      runs: row.runs,
      timestamp: row.timestamp,
    };
  }
  
  // Clear all data
  clearAll(): void {
    this.db.exec('DELETE FROM metrics');
    this.db.exec('DELETE FROM abis');
    this.db.exec('DELETE FROM contracts');
    console.log('All data cleared from SQLite database');
  }
  
  // Close database connection
  close(): void {
    this.db.close();
  }
}