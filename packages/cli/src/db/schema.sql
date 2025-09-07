-- SQLite schema for evmscan.org storage
-- This database is created fresh on each CLI start

-- Metrics storage
CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);

-- ABI storage for verified contracts
CREATE TABLE IF NOT EXISTS abis (
  address TEXT PRIMARY KEY,
  abi TEXT NOT NULL,
  name TEXT,
  verified INTEGER DEFAULT 1,
  timestamp INTEGER NOT NULL
);

-- Create index for verified contracts query
CREATE INDEX IF NOT EXISTS idx_abis_verified ON abis(verified);

-- Contract source code storage
CREATE TABLE IF NOT EXISTS contracts (
  address TEXT PRIMARY KEY,
  source_code TEXT,
  compiler TEXT,
  optimization INTEGER,
  runs INTEGER,
  timestamp INTEGER NOT NULL
);