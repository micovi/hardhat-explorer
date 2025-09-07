import { getPublicClient } from './lib/viem-client'

async function testTransaction() {
  const client = getPublicClient()
  const hash = '0x770ffd44133e760547f6a98509bfa8e21545271feec25e0c1e01d3aac5887d8b'
  
  try {
    console.log('Fetching transaction:', hash)
    const tx = await client.getTransaction({
      hash: hash as `0x${string}`
    })
    console.log('Transaction found:', tx)
    
    const receipt = await client.getTransactionReceipt({
      hash: hash as `0x${string}`
    })
    console.log('Receipt found:', receipt)
  } catch (error) {
    console.error('Error:', error)
  }
}

testTransaction()