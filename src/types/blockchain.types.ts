import type { Address, Hash, Hex } from 'viem'

// Block types
export interface Block {
  number: bigint
  hash: Hash
  parentHash: Hash
  timestamp: bigint
  miner: Address
  gasUsed: bigint
  gasLimit: bigint
  baseFeePerGas?: bigint
  difficulty?: bigint
  totalDifficulty?: bigint
  size: bigint
  nonce: Hex
  sha3Uncles: Hash
  logsBloom: Hex
  transactionsRoot: Hash
  stateRoot: Hash
  receiptsRoot: Hash
  extraData: Hex
  transactions: Hash[] | Transaction[]
  uncles: Hash[]
}

// Transaction types
export interface Transaction {
  hash: Hash
  nonce: number
  blockHash: Hash | null
  blockNumber: bigint | null
  transactionIndex: number | null
  from: Address
  to: Address | null
  value: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
  gas: bigint
  input: Hex
  v?: bigint
  r?: Hex
  s?: Hex
  type: 'legacy' | 'eip2930' | 'eip1559'
  chainId?: number
  accessList?: AccessListItem[]
  yParity?: number
}

export interface AccessListItem {
  address: Address
  storageKeys: Hex[]
}

// Transaction Receipt
export interface TransactionReceipt {
  transactionHash: Hash
  transactionIndex: number
  blockHash: Hash
  blockNumber: bigint
  from: Address
  to: Address | null
  cumulativeGasUsed: bigint
  gasUsed: bigint
  effectiveGasPrice: bigint
  contractAddress: Address | null
  logs: Log[]
  logsBloom: Hex
  root?: Hash
  status: 'success' | 'reverted'
  type: 'legacy' | 'eip2930' | 'eip1559'
}

// Log/Event types
export interface Log {
  address: Address
  topics: [Hex, ...Hex[]] | []
  data: Hex
  blockNumber: bigint | null
  blockHash: Hash | null
  transactionHash: Hash | null
  transactionIndex: number | null
  logIndex: number | null
  removed: boolean
}

// Address/Account types
export interface Account {
  address: Address
  balance: bigint
  nonce: number
  code?: Hex
  storageHash?: Hash
  codeHash?: Hash
}

// Contract types
export interface Contract {
  address: Address
  abi?: Abi
  bytecode?: Hex
  deploymentTransaction?: Hash
  isVerified: boolean
  name?: string
  compiler?: string
  optimizationUsed?: boolean
  runs?: number
  constructorArguments?: string
  libraries?: Record<string, Address>
  sourceCode?: string
}

// ABI types
export type Abi = readonly (AbiFunction | AbiEvent | AbiError | AbiConstructor | AbiFallback | AbiReceive)[]

export interface AbiFunction {
  type: 'function'
  name: string
  inputs: readonly AbiParameter[]
  outputs: readonly AbiParameter[]
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable'
}

export interface AbiEvent {
  type: 'event'
  name: string
  inputs: readonly AbiEventParameter[]
  anonymous?: boolean
}

export interface AbiError {
  type: 'error'
  name: string
  inputs: readonly AbiParameter[]
}

export interface AbiConstructor {
  type: 'constructor'
  inputs: readonly AbiParameter[]
  stateMutability: 'payable' | 'nonpayable'
}

export interface AbiFallback {
  type: 'fallback'
  stateMutability: 'payable' | 'nonpayable'
}

export interface AbiReceive {
  type: 'receive'
  stateMutability: 'payable'
}

export interface AbiParameter {
  name: string
  type: string
  internalType?: string
  components?: readonly AbiParameter[]
}

export interface AbiEventParameter extends AbiParameter {
  indexed?: boolean
}

// Token types
export interface Token {
  address: Address
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
  type: 'ERC20' | 'ERC721' | 'ERC1155'
  logo?: string
}

export interface TokenTransfer {
  token: Token
  from: Address
  to: Address
  value: bigint
  tokenId?: bigint
  transactionHash: Hash
  logIndex: number
}

// Stats types
export interface BlockchainStats {
  blockHeight: number
  avgGasPrice: bigint
  cumulativeTxCount: number
  txn24hVolume: number
  txnCost24hVolume: bigint
}

// Table pagination
export interface PaginationState {
  pageIndex: number
  pageSize: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  status: 'success' | 'error'
}

// Search types
export type SearchResult = 
  | { type: 'block'; data: Block }
  | { type: 'transaction'; data: Transaction }
  | { type: 'address'; data: Account }
  | { type: 'not_found'; query: string }