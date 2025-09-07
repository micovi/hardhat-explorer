# evmscan.org

Open source blockchain explorer for local EVM development - Like Etherscan for your local/testnet chains.

## Overview

evmscan.org is a modern, fast, and user-friendly blockchain explorer specifically designed for developers working with local EVM nodes. It provides instant insights into your local blockchain state without external dependencies.

## Features

- 🚀 **Real-time Monitoring** - WebSocket support for live blockchain updates
- 🔍 **Smart Search** - Universal search for blocks, transactions, and addresses
- 📊 **Dashboard Analytics** - Live statistics and activity charts
- 📝 **Contract Interaction** - Read and write contract functions with ABI support
- 🎨 **Modern UI** - Clean, responsive design with dark mode support
- 🔧 **Developer Tools** - ETH unit converter and development utilities
- 📦 **Zero Config** - Works out-of-the-box with any local EVM node

## Quick Start

### Prerequisites

- Node.js 18+
- Local EVM node running on port 8545 (Hardhat, Anvil, Ganache, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/evmscan/explorer
cd explorer

# Install dependencies
npm install

# Start your local EVM node (in another terminal)
npx hardhat node  # or anvil, ganache-cli, etc.

# Start the explorer
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the explorer.

## Configuration

Create a `.env` file in the root directory:

```env
# Local EVM Node Configuration
VITE_RPC_URL=http://localhost:8545
VITE_WS_URL=ws://localhost:8545
VITE_CHAIN_ID=31337
VITE_CHAIN_NAME=localhost
VITE_APP_NAME=evmscan.org
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Blockchain**: Viem (modern replacement for ethers.js)
- **Storage**: IndexedDB for ABI persistence

### Project Structure

```
src/
├── components/     # Reusable UI components (kebab-case)
├── pages/         # Route components (kebab-case)
├── hooks/         # Custom React hooks (kebab-case)
├── services/      # Business logic and APIs
├── lib/           # Utilities and configurations
└── types/         # TypeScript type definitions
```

## Features in Detail

### Block Explorer
- View all blocks with pagination
- Block details including transactions and gas usage
- Real-time block updates

### Transaction Explorer
- Transaction list with status indicators
- Detailed transaction view with decoded data
- Event logs with ABI decoding
- Internal transactions support

### Address Explorer
- ETH balance and transaction history
- Token transfers (ERC-20, ERC-721, ERC-1155)
- Contract interaction UI for verified contracts
- QR code generation

### Contract Verification
- Simple ABI upload for instant verification
- Decoded transactions and events
- Direct contract interaction

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- **Website**: [evmscan.org](https://evmscan.org)
- **Documentation**: [docs.evmscan.org](https://docs.evmscan.org)
- **GitHub**: [github.com/evmscan](https://github.com/evmscan)
- **NPM**: [@evmscan/explorer](https://www.npmjs.com/package/@evmscan/explorer)

## Support

For bugs and feature requests, please [open an issue](https://github.com/evmscan/explorer/issues).

---

Built with ❤️ for developers by the evmscan.org team