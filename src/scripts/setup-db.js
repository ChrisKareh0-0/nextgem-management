/**
 * This script is for verifying and setting up the MongoDB connection
 * Run with: node src/scripts/setup-db.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not defined in environment variables!');
    console.error('Please check your .env.local file and ensure it contains:');
    console.error('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/...');
    process.exit(1);
  }

  console.log('MongoDB Connection String found in environment variables.');
  console.log('Attempting to connect to MongoDB...');

  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    // Get database name from connection string or use default
    const dbName = uri.split('/').pop().split('?')[0] || 'admin-dashboard';
    console.log(`Using database: ${dbName}`);
    
    // List collections in the database
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    console.log('Available collections:');
    if (collections.length === 0) {
      console.log('- No collections found. This appears to be a new database.');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }

    // Create collections if they don't exist
    if (!collections.some(c => c.name === 'clients')) {
      console.log('Creating clients collection...');
      await db.createCollection('clients');
      console.log('✅ Clients collection created successfully!');
    }

    console.log('\nMongoDB setup completed successfully!');
    console.log('You can now run your application and the database connection should work.');

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:');
    console.error(error);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\nThis error suggests DNS resolution failed. Check your internet connection and MongoDB URI.');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\nConnection timed out. Check your network or firewalls that might be blocking the connection.');
    } else if (error.message && error.message.includes('Authentication failed')) {
      console.log('\nAuthentication failed. Verify your username and password in the MongoDB URI.');
    }
    
    process.exit(1);
  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error); 