# Product Requirements Document (PRD)
## Modern Blockchain Explorer for Hardhat Local Development

### 1. Executive Summary

**Product Name:** Custom Block Explorer v2  
**Purpose:** A modern, fast, and user-friendly blockchain explorer specifically designed for developers working with local Hardhat nodes  
**Target Users:** Ethereum developers testing smart contracts on local Hardhat networks  
**Core Value:** Instant insights into local blockchain state without external dependencies  

---

### 2. Problem Statement

Developers working with local Hardhat nodes need a reliable way to:
- Monitor blockchain activity in real-time
- Inspect blocks, transactions, and addresses
- Interact with smart contracts
- Verify and debug contract deployments
- Track gas usage and costs
- View transaction traces and internal calls

Current solutions are either too complex, require external services, or don't work well with local development environments.

---

### 3. Solution Overview

A standalone web application that connects directly to local Hardhat nodes (default port 8545) providing:
- Real-time blockchain monitoring
- Contract interaction capabilities
- ABI management
- Transaction analysis
- No external API dependencies
- Fast, modern UI with excellent UX

---

### 4. Core Features

#### 4.1 Dashboard/Home Page
- **Live Statistics**
  - Current block height
  - Average gas price
  - Total transactions (24h)
  - ETH volume (24h)
  - Network status indicator
- **Latest Activity**
  - Recent blocks (last 10)
  - Recent transactions (last 10)
  - Real-time updates via WebSocket
- **Quick Search**
  - Universal search bar (block/tx/address)
  - Auto-detection of input type
  - Search history

#### 4.2 Block Explorer
- **Block List View**
  - Paginated table of all blocks
  - Columns: Block #, Age, Txn Count, Miner, Gas Used, Gas Limit
  - Click to view details
- **Block Details View**
  - Block header information
  - List of transactions in block
  - Uncle blocks (if any)
  - Withdrawals (post-merge)
  - Gas usage visualization

#### 4.3 Transaction Explorer
- **Transaction List View**
  - Paginated table of all transactions
  - Columns: Txn Hash, Method, Block, Age, From, To, Value, Gas Fee
  - Status indicators (success/failed)
- **Transaction Details View**
  - Full transaction data
  - Input data (decoded if ABI available)
  - Event logs (decoded if ABI available)
  - Internal transactions
  - State changes
  - Gas usage breakdown
  - Transaction trace (Geth/Parity style)

#### 4.4 Address Explorer
- **Address Overview**
  - ETH balance
  - Transaction count (nonce)
  - First/Last seen
  - QR code for address
- **Tabbed Interface**
  - Transactions (sent/received)
  - Token transfers (ERC-20)
  - NFT transfers (ERC-721/1155)
  - Internal transactions
  - Contract info (if contract)
- **Contract Features** (if address is contract)
  - Code viewer
  - Read functions
  - Write functions (with wallet connection)
  - Events viewer
  - Contract verification

#### 4.5 Contract Verification
- **Two Modes**
  1. **Simple ABI Upload**
     - Paste ABI JSON directly
     - Instant verification
     - Perfect for development
  2. **Source Code Verification**
     - Upload Solidity source
     - Compile and match bytecode
     - Store source for reference
- **Verified Contract Features**
  - Decoded transactions
  - Human-readable events
  - Direct interaction UI

#### 4.6 Token Tracking
- **ERC-20 Tokens**
  - List of all deployed tokens
  - Token details (name, symbol, supply)
  - Holder distribution
  - Transfer history
- **NFTs (ERC-721/1155)**
  - NFT collections list
  - Token IDs and metadata
  - Owner history
  - Transfer events

---

### 5. Technical Requirements

#### 5.1 Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand + React Query
- **Routing:** React Router v6
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

#### 5.2 Blockchain Interaction
- **Library:** Viem (replacing ethers.js)
- **Provider:** HTTP + WebSocket connection to localhost:8545
- **Chain ID:** 31337 (Hardhat default)
- **Wallet:** MetaMask support for write operations

#### 5.3 Data Management
- **Caching:** IndexedDB for ABIs and metrics
- **Real-time:** WebSocket subscriptions for live updates
- **Pagination:** Server-side pagination for large datasets

#### 5.4 Performance
- **Initial Load:** < 2 seconds
- **Page Navigation:** < 200ms
- **Search Response:** < 100ms
- **Real-time Updates:** < 50ms latency

---

### 6. User Interface Requirements

#### 6.1 Design Principles
- **Clean & Modern:** Minimal, focused design
- **Responsive:** Works on desktop, tablet, mobile
- **Accessible:** WCAG 2.1 AA compliant
- **Intuitive:** No manual needed
- **Fast:** Instant feedback, optimistic updates

#### 6.2 Key UI Components
- **Navigation**
  - Top navbar with search
  - Breadcrumbs for navigation context
  - Quick links to major sections
- **Tables**
  - Sortable columns
  - Filterable data
  - Export to CSV
  - Virtual scrolling for performance
- **Code Display**
  - Syntax highlighting
  - Copy button
  - Fullscreen mode
- **Forms**
  - Inline validation
  - Clear error messages
  - Loading states

#### 6.3 Theme
- **Light Mode:** Default, clean white background
- **Dark Mode:** Optional, developer-friendly
- **Colors:** Consistent with Ethereum branding
- **Typography:** Clear hierarchy, readable fonts

---

### 7. Non-Functional Requirements

#### 7.1 Reliability
- Handle network disconnections gracefully
- Automatic reconnection with exponential backoff
- Offline mode with cached data
- Error boundaries for fault isolation

#### 7.2 Security
- No sensitive data storage
- Input sanitization
- XSS protection
- No external API calls

#### 7.3 Usability
- Zero configuration required
- Works out-of-box with Hardhat
- Helpful error messages
- Tooltips for complex features

#### 7.4 Maintainability
- TypeScript for type safety
- Component-based architecture
- Comprehensive testing
- Clear documentation

---

### 8. User Flows

#### 8.1 Exploring a Transaction
1. User enters transaction hash in search
2. System auto-detects hash format
3. Redirects to transaction details page
4. Shows full transaction info
5. If ABI available, decodes input/logs
6. User can navigate to block/addresses

#### 8.2 Verifying a Contract
1. User navigates to contract address
2. Clicks "Verify Contract"
3. Chooses simple or advanced mode
4. Uploads ABI or source code
5. System verifies and stores
6. Contract page now shows decoded data

#### 8.3 Interacting with Contract
1. User navigates to verified contract
2. Switches to "Write" tab
3. Connects MetaMask wallet
4. Fills function parameters
5. Submits transaction
6. Sees real-time status updates

---

### 9. Success Metrics

- **Performance**
  - Page load time < 2s
  - 60 FPS scrolling
  - < 100ms search response
- **Reliability**
  - 99.9% uptime
  - < 0.1% error rate
  - Automatic error recovery
- **Usability**
  - < 3 clicks to any feature
  - No documentation lookups needed
  - Positive developer feedback

---

### 10. Future Enhancements (v3)

- Multi-chain support (other local networks)
- Advanced debugging tools
- Gas optimization suggestions
- Transaction simulation
- Collaborative features
- API for programmatic access
- Mobile app (React Native)
- **Smart Method Detection**: Automatically decode transaction methods from stored ABIs in IndexedDB, providing accurate method names and parameter decoding for all verified contracts

---

### 11. Acceptance Criteria

The product is considered complete when:
1. All core features are implemented and tested
2. Performance metrics are met
3. UI is responsive across devices
4. Real-time updates work reliably
5. Contract verification works for common patterns
6. No critical bugs in production
7. Documentation is complete

---

### 12. Dependencies

- Local Hardhat node running on port 8545
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: MetaMask for write operations
- No external API dependencies

---

**Document Version:** 1.0  
**Last Updated:** September 2024  
**Status:** In Development