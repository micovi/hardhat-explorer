# evmscan CLI

Local EVM blockchain explorer - instant setup, zero configuration.

## Installation

```bash
# Run directly with npx/bunx (recommended)
bunx evmscan init
bunx evmscan start

# Or install globally with Bun
bun add -g evmscan
evmscan init
evmscan start
```

## Quick Start

```bash
# Initialize configuration
bunx evmscan init

# Start the explorer
bunx evmscan start

# Start with custom RPC
bunx evmscan start --rpc https://mainnet.infura.io/v3/YOUR_KEY

# Start on different port
bunx evmscan start --port 4000
```

## Commands

- `evmscan init` - Initialize configuration file
- `evmscan start` - Start the explorer server
- `evmscan config` - Show current configuration
- `evmscan version` - Show version information

## Configuration

The `evmscan.config.json` file supports:

- RPC endpoint configuration
- Server port and host settings
- Chain ID and name customization
- Feature flags for promotions, sponsors, etc.
- UI theming options

## Runtime

This CLI is optimized for Bun runtime but also works with Node.js.

## License

MIT

## Learn More

Visit [evmscan.org](https://evmscan.org) for documentation and updates.
