/**
 * This script updates existing client records to ensure they have quotationAmount fields
 * Run with: npx dotenv -e .env.local -- node src/scripts/update-clients.js
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
    
    // Option 1: Update a specific client by ID (the one from your example)
    const specificClientId = '67c8215c1c2a9f9fcc453236';
    console.log(`Updating specific client with ID: ${specificClientId}`);
    
    // IMPORTANT: Set a specific amount for testing, e.g. 999.99
    const testAmount = 999.99;
    
    const updateSpecificResult = await clientsCollection.updateOne(
      { _id: new ObjectId(specificClientId) },
      { 
        $set: { 
          quotationAmount: testAmount,  // Set a specific test amount
        } 
      }
    );
    
    if (updateSpecificResult.matchedCount === 0) {
      console.log(`❌ Could not find client with ID: ${specificClientId}`);
    } else if (updateSpecificResult.modifiedCount === 1) {
      console.log(`✅ Updated client with ID: ${specificClientId} to amount: ${testAmount}`);
      
      // Verify the update
      const updatedClient = await clientsCollection.findOne({ _id: new ObjectId(specificClientId) });
      console.log('Updated client data:', updatedClient);
      console.log('Verify quotation amount:', updatedClient.quotationAmount, typeof updatedClient.quotationAmount);
      
      // Double-check the exact value was preserved
      if (updatedClient.quotationAmount === testAmount) {
        console.log('✅ EXACT value was preserved correctly in the database');
      } else {
        console.log('❌ WARNING: Value was not preserved exactly!');
        console.log(`Expected: ${testAmount} (${typeof testAmount})`);
        console.log(`Actual: ${updatedClient.quotationAmount} (${typeof updatedClient.quotationAmount})`);
      }
    } else {
      console.log(`⚠️ Client with ID: ${specificClientId} found but not modified (may already have quotationAmount)`);
    }
    
    // Option 2: Update all clients missing the quotationAmount field
    console.log('Checking for all clients missing quotationAmount field...');
    
    const updateAllResult = await clientsCollection.updateMany(
      { quotationAmount: { $exists: false } },
      { $set: { quotationAmount: 0 } }
    );
    
    console.log(`✅ Updated ${updateAllResult.modifiedCount} clients with missing quotationAmount field`);
    
    // Option 3: Update all clients with non-number quotationAmount values
    console.log('Checking for all clients with non-number quotationAmount values...');
    
    // First find clients where quotationAmount exists but might not be a number
    const clientsToFix = await clientsCollection.find({
      quotationAmount: { $exists: true }
    }).toArray();
    
    let fixedCount = 0;
    
    for (const client of clientsToFix) {
      const currentAmount = client.quotationAmount;
      
      // Check if it's not a number or is NaN
      if (typeof currentAmount !== 'number' || isNaN(currentAmount)) {
        console.log(`Found client ${client._id} with invalid quotationAmount: ${currentAmount}`);
        
        // Convert to number or default to 0
        const numericAmount = typeof currentAmount === 'string' ? 
          Number(currentAmount) || 0 : 0;
        
        // Update the client
        await clientsCollection.updateOne(
          { _id: client._id },
          { $set: { quotationAmount: numericAmount } }
        );
        
        fixedCount++;
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} clients with non-number quotationAmount values`);
    
    // Display all clients for verification
    console.log('\nVerifying all client amounts:');
    const allClients = await clientsCollection.find({}).toArray();
    
    allClients.forEach(client => {
      console.log(`Client ${client._id}: ${client.companyName}, Amount: ${client.quotationAmount} (${typeof client.quotationAmount})`);
    });
    
    console.log('\nUpdate completed successfully!');

  } catch (error) {
    console.error('❌ Error updating clients:');
    console.error(error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error); 