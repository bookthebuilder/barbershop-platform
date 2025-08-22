// test-connection.js - Save this in your project root
require('dotenv').config({ path: '.env.local' })

console.log('Testing database connection...')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing')
console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Found' : 'Missing')

// Test with Prisma
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Attempting to connect to database...')
    
    // Simple test query
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query test successful:', result)
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    
    // More detailed error info
    if (error.message.includes('5432')) {
      console.log('\n🔍 Debug: Trying to connect to port 5432 (direct connection)')
      console.log('💡 Suggestion: Make sure you have the pooled connection URL for DATABASE_URL')
    }
    
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
