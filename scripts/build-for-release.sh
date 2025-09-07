#!/bin/bash

# Build script for CI/CD pipelines
# This script builds both the explorer and CLI for release

set -e  # Exit on error

echo "🚀 Starting build for release..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install bun first."
    echo "Visit: https://bun.sh"
    exit 1
fi

# Clean previous builds
print_step "Cleaning previous builds..."
bun run clean:dist
print_success "Clean complete"

# Install dependencies
print_step "Installing dependencies..."
bun install --frozen-lockfile 2>/dev/null || bun install
print_success "Dependencies installed"

# Build Explorer
print_step "Building Explorer application..."
cd apps/explorer
bun run build
cd ../..
print_success "Explorer built successfully"

# Check if build was successful
if [ ! -d "apps/explorer/dist" ]; then
    print_error "Explorer build failed - dist directory not found"
    exit 1
fi

# Copy dist to CLI package
print_step "Copying build artifacts to CLI package..."
rm -rf packages/cli/dist
cp -r apps/explorer/dist packages/cli/dist
print_success "Build artifacts copied"

# Build CLI TypeScript files
print_step "Building CLI TypeScript files..."
cd packages/cli
bun run build.ts --copy-only 2>/dev/null || true
cd ../..
print_success "CLI prepared"

# Create release info
print_step "Creating release info..."
echo "{
  \"version\": \"$(node -p "require('./package.json').version")\",
  \"buildDate\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"commit\": \"$(git rev-parse HEAD 2>/dev/null || echo 'unknown')\",
  \"branch\": \"$(git branch --show-current 2>/dev/null || echo 'unknown')\"
}" > packages/cli/dist/build-info.json
print_success "Release info created"

# Verify build
print_step "Verifying build..."
if [ -f "packages/cli/dist/index.html" ] && [ -d "packages/cli/dist/assets" ]; then
    print_success "Build verification passed"
else
    print_error "Build verification failed - missing required files"
    exit 1
fi

# Summary
echo ""
echo "════════════════════════════════════════"
echo -e "${GREEN}✨ Build completed successfully!${NC}"
echo "════════════════════════════════════════"
echo ""
echo "Build artifacts:"
echo "  • Explorer: apps/explorer/dist/"
echo "  • CLI:      packages/cli/dist/"
echo ""
echo "Next steps:"
echo "  1. Test locally: cd packages/cli && bun run src/cli.ts start"
echo "  2. Publish CLI: cd packages/cli && npm publish"
echo "  3. Deploy Explorer: Upload apps/explorer/dist to your hosting"
echo ""