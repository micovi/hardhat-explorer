# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

evmscan.org is a modern blockchain explorer specifically designed for local EVM node development. It's a React-based web application that provides real-time monitoring and interaction with local Ethereum development environments, compatible with any EVM chain (Hardhat, Anvil, Ganache, etc.).

## Key Technologies

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand + React Query (TanStack Query)
- **Blockchain Interaction**: Viem (modern replacement for ethers.js)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation

## Commands

```bash
# Development
npm run dev         # Start Vite dev server on http://localhost:5173

# Build & Production
npm run build       # Run TypeScript check and build for production
npm run preview     # Preview production build locally

# Code Quality
npm run lint        # Run ESLint for code linting
```

## Architecture

### Core Services
- **viem-client** (`src/lib/viem-client.ts`): Manages blockchain connections (HTTP/WebSocket) to local EVM node (default port 8545)
- **abi.service** (`src/services/abi.service.ts`): Handles ABI storage and contract verification
- **db.service** (`src/services/db.service.ts`): IndexedDB management for persistent storage of ABIs and metrics

### Directory Structure (kebab-case naming)
- **src/components**: Reusable UI components organized by feature (blockchain, contract, dashboard, layout, tools, ui)
- **src/pages**: Route components for each major view (address-page, block-details-page, transaction-list-page, etc.)
- **src/hooks**: Custom React hooks for blockchain data fetching (use-blockchain, use-address, etc.)
- **src/types**: TypeScript type definitions

**Important**: All file names use kebab-case (e.g., `address-link.tsx`, `use-blockchain.ts`, `abi.service.ts`)

### Path Aliases
The project uses Vite path aliases configured in `vite.config.ts`:
- `@/` → `src/`
- `@/components` → `src/components/`
- `@/lib` → `src/lib/`
- `@/hooks` → `src/hooks/`
- `@/pages` → `src/pages/`
- `@/types` → `src/types/`

## Key Features Implementation

### Real-time Updates
The application uses Viem's WebSocket transport for real-time blockchain updates. The WebSocket client is initialized in `viem-client.ts` and connects to `ws://localhost:8545`.

### Contract Interaction
- **Read Functions**: Implemented in `contract-read-functions.tsx`
- **Write Functions**: Implemented in `contract-write-functions.tsx` with MetaMask wallet integration
- **ABI Management**: Stored in IndexedDB for persistent contract verification

### Data Fetching Patterns
Custom hooks in `/hooks` directory use React Query for efficient data fetching:
- `use-blocks`: Fetches block data with pagination
- `use-transactions`: Manages transaction data
- `use-address`: Handles address-specific data
- `use-dashboard-stats`: Aggregates dashboard statistics

## Development Notes

### EVM Node Configuration
- Default Chain ID: 31337 (configurable via VITE_CHAIN_ID)
- Default RPC URL: http://localhost:8545 (configurable via VITE_RPC_URL)
- Default WebSocket URL: ws://localhost:8545 (configurable via VITE_WS_URL)
- Chain Name: configurable via VITE_CHAIN_NAME
- Compatible with Hardhat, Anvil, Ganache, and any EVM-compatible local node

### Testing Contracts
Test contract ABIs are available in `test-contracts/` directory:
- `ComplexContract.json`: Example contract with multiple functions
- `TestToken.json`: ERC-20 token contract for testing

### Performance Considerations
- Tables use virtual scrolling for large datasets
- React Query provides caching and background refetching
- IndexedDB stores ABIs and metrics locally to reduce network calls