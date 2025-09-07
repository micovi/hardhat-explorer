#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

// Fix common TypeScript errors in the codebase
async function fixTypeScriptErrors() {
  console.log('🔧 Fixing TypeScript errors...\n');

  // Fix unused imports - remove specific unused imports
  const unusedImports = [
    { file: 'apps/explorer/src/App.tsx', remove: 'TestTransactionPage' },
    { file: 'apps/explorer/src/components/contract/contract-read-functions.tsx', remove: ['Badge', 'formatUnits', 'Link'] },
    { file: 'apps/explorer/src/components/contract/contract-write-functions.tsx', remove: ['CardTitle', 'Edit3', 'createPublicClient'] },
    { file: 'apps/explorer/src/components/dashboard/activity-chart.tsx', remove: 'Blocks' },
    { file: 'apps/explorer/src/components/developer/developer-tools.tsx', remove: ['CheckCircle', 'getPublicClient'] },
    { file: 'apps/explorer/src/components/layout/navbar.tsx', remove: ['Image', 'SearchSuggestion'] },
    { file: 'apps/explorer/src/components/sponsors/sponsor-banner.tsx', remove: 'Sparkles' },
    { file: 'apps/explorer/src/hooks/use-address.ts', remove: ['formatEther', 'AddressTransactions'] },
    { file: 'apps/explorer/src/pages/address-page.tsx', remove: 'tokenData' },
    { file: 'apps/explorer/src/pages/block-details-page.tsx', remove: ['CheckCircle', 'formatHash'] },
    { file: 'apps/explorer/src/pages/home-page.tsx', remove: ['Activity', 'Clock', 'formatEther'] },
    { file: 'apps/explorer/src/pages/network-page.tsx', remove: 'CheckCircle' },
    { file: 'apps/explorer/src/pages/transaction-details-page.tsx', remove: 'Button' },
    { file: 'apps/explorer/src/pages/transaction-list-page.tsx', remove: ['XCircle', 'truncateAddress'] },
  ];

  for (const { file, remove } of unusedImports) {
    try {
      const filePath = join(process.cwd(), file);
      let content = readFileSync(filePath, 'utf-8');
      const toRemove = Array.isArray(remove) ? remove : [remove];
      
      for (const importName of toRemove) {
        // Remove from import statements
        content = content.replace(new RegExp(`\\b${importName}\\b,?\\s*`, 'g'), '');
        // Clean up empty imports
        content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"]/g, '');
        // Clean up trailing commas in imports
        content = content.replace(/,(\s*})/g, '$1');
        // Clean up leading commas
        content = content.replace(/{\s*,/g, '{');
      }
      
      writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in ${file}`);
    } catch (error) {
      console.error(`❌ Failed to fix ${file}:`, error);
    }
  }

  // Fix contract-read-functions.tsx - getAbi returns an object with abi property
  try {
    const contractReadPath = join(process.cwd(), 'apps/explorer/src/components/contract/contract-read-functions.tsx');
    let content = readFileSync(contractReadPath, 'utf-8');
    
    // Fix the getAbi usage
    content = content.replace(
      /const stored = await dbService\.getAbi\(address\)/g,
      'const storedAbi = await dbService.getAbi(address)'
    );
    content = content.replace(
      /if \(stored\) \{[\s\S]*?setAbi\(stored\)/gm,
      'if (storedAbi) {\n      setAbi(storedAbi)'
    );
    content = content.replace(
      /setReadFunctions\(stored\.abi/g,
      'setReadFunctions(storedAbi'
    );
    
    // Fix the error state type
    content = content.replace(
      /functionName: string; error: any;/g,
      'functionName: string; result: null; error: any;'
    );
    
    writeFileSync(contractReadPath, content);
    console.log('✅ Fixed contract-read-functions.tsx');
  } catch (error) {
    console.error('❌ Failed to fix contract-read-functions.tsx:', error);
  }

  // Fix contract-write-functions.tsx similarly
  try {
    const contractWritePath = join(process.cwd(), 'apps/explorer/src/components/contract/contract-write-functions.tsx');
    let content = readFileSync(contractWritePath, 'utf-8');
    
    // Fix the getAbi usage
    content = content.replace(
      /const stored = await dbService\.getAbi\(address\)/g,
      'const storedAbi = await dbService.getAbi(address)'
    );
    content = content.replace(
      /if \(stored\) \{[\s\S]*?setAbi\(stored\)/gm,
      'if (storedAbi) {\n      setAbi(storedAbi)'
    );
    content = content.replace(
      /setWriteFunctions\(stored\.abi/g,
      'setWriteFunctions(storedAbi'
    );
    
    // Remove unused import
    content = content.replace(
      /import { Label } from '@\/components\/ui\/label'/g,
      ''
    );
    
    writeFileSync(contractWritePath, content);
    console.log('✅ Fixed contract-write-functions.tsx');
  } catch (error) {
    console.error('❌ Failed to fix contract-write-functions.tsx:', error);
  }

  // Fix sponsor-banner.tsx - remove jsx prop
  try {
    const sponsorBannerPath = join(process.cwd(), 'apps/explorer/src/components/sponsors/sponsor-banner.tsx');
    let content = readFileSync(sponsorBannerPath, 'utf-8');
    content = content.replace(/jsx={true}/g, '');
    content = content.replace(/jsx/g, '');
    writeFileSync(sponsorBannerPath, content);
    console.log('✅ Fixed sponsor-banner.tsx');
  } catch (error) {
    console.error('❌ Failed to fix sponsor-banner.tsx:', error);
  }

  // Fix ErrorState prop type
  try {
    const blockDetailsPath = join(process.cwd(), 'apps/explorer/src/pages/block-details-page.tsx');
    let content = readFileSync(blockDetailsPath, 'utf-8');
    content = content.replace(
      /action={\s*<Link[^>]*>.*?<\/Link>\s*}/gs,
      ''
    );
    writeFileSync(blockDetailsPath, content);
    console.log('✅ Fixed block-details-page.tsx');
  } catch (error) {
    console.error('❌ Failed to fix block-details-page.tsx:', error);
  }

  console.log('\n✅ TypeScript error fixes complete!');
}

// Run the fixes
fixTypeScriptErrors().catch(console.error);