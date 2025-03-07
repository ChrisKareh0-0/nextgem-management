/**
 * This script adds the quotationAmount field to a specific client
 * Run with: node -r dotenv/config src/scripts/update-specific-client.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not defined in environment variables!');
    console.error('Please check your .env.local file');
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
    
    const db = client.db(dbName);
    const clientsCollection = db.collection('clients');
    
    // Target the specific client ID from the user's request
    const specificClientId = '67c835871c2a9f9fcc45324e';
    console.log(`Updating specific client with ID: ${specificClientId}`);
    
    // First, let's check if this client exists and what data it has
    const existingClient = await clientsCollection.findOne({ _id: new ObjectId(specificClientId) });
    
    if (!existingClient) {
      console.log(`❌ Client with ID ${specificClientId} not found!`);
      return;
    }
    
    console.log('Found client:');
    console.log(`Company: ${existingClient.companyName}`);
    console.log(`Current quotationAmount: ${existingClient.quotationAmount !== undefined ? existingClient.quotationAmount : 'MISSING'}`);
    
    // Set a default amount or adjust as needed
    const amountToSet = 0; // Default to 0 - adjust this value as needed
    
    const updateResult = await clientsCollection.updateOne(
      { _id: new ObjectId(specificClientId) },
      { 
        $set: { 
          quotationAmount: amountToSet,
        } 
      }
    );
    
    if (updateResult.matchedCount === 0) {
      console.log(`❌ Could not find client with ID: ${specificClientId}`);
    } else if (updateResult.modifiedCount === 1) {
      console.log(`✅ Updated client with ID: ${specificClientId} to add quotationAmount: ${amountToSet}`);
      
      // Verify the update
      const updatedClient = await clientsCollection.findOne({ _id: new ObjectId(specificClientId) });
      console.log('Updated client data:');
      console.log(`Company: ${updatedClient.companyName}`);
      console.log(`New quotationAmount: ${updatedClient.quotationAmount} (${typeof updatedClient.quotationAmount})`);
    } else {
      console.log(`⚠️ Client with ID: ${specificClientId} found but not modified (may already have quotationAmount)`);
    }
    
    console.log('\nUpdate completed successfully!');

  } catch (error) {
    console.error('❌ Error updating client:');
    console.error(error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error); 