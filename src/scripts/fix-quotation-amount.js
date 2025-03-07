/**
 * This script fixes the quotationAmount field for all clients
 * Run with: node -r dotenv/config src/scripts/fix-quotation-amount.js
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
    
    // Find all clients and check if they have a quotationAmount field
    console.log('Fetching all clients...');
    const allClients = await clientsCollection.find({}).toArray();
    
    console.log(`Found ${allClients.length} clients in the database.`);
    console.log('Checking and fixing quotationAmount field for all clients:');
    console.log('--------------------------------------------------------');
    
    let clientsWithoutAmount = 0;
    let clientsWithInvalidAmount = 0;
    let clientsAlreadyOK = 0;
    
    for (const clientDoc of allClients) {
      const { _id, companyName } = clientDoc;
      
      console.log(`Client: ${companyName} (ID: ${_id})`);
      
      if (clientDoc.quotationAmount === undefined) {
        // Client is missing the quotationAmount field
        clientsWithoutAmount++;
        console.log('  ❌ Missing quotationAmount field, adding it with default value 0');
        
        await clientsCollection.updateOne(
          { _id: clientDoc._id },
          { $set: { quotationAmount: 0 } }
        );
        
        console.log('  ✅ Fixed: Added quotationAmount field with value 0');
      } else {
        console.log(`  Current quotationAmount: ${clientDoc.quotationAmount} (${typeof clientDoc.quotationAmount})`);
        
        // Check if the quotationAmount is a valid number
        if (typeof clientDoc.quotationAmount !== 'number' || isNaN(clientDoc.quotationAmount)) {
          clientsWithInvalidAmount++;
          console.log('  ❌ Invalid quotationAmount (not a number), fixing it');
          
          // Try to convert to a number or use 0 as fallback
          let validAmount = 0;
          if (typeof clientDoc.quotationAmount === 'string' && clientDoc.quotationAmount.trim() !== '') {
            const parsed = parseFloat(clientDoc.quotationAmount);
            if (!isNaN(parsed)) {
              validAmount = parsed;
            }
          }
          
          await clientsCollection.updateOne(
            { _id: clientDoc._id },
            { $set: { quotationAmount: validAmount } }
          );
          
          console.log(`  ✅ Fixed: Updated quotationAmount to ${validAmount}`);
        } else {
          // All good
          clientsAlreadyOK++;
          console.log('  ✅ Valid quotationAmount field');
        }
      }
      
      console.log('--------------------------------------------------------');
    }
    
    // Print summary
    console.log('\n📊 SUMMARY:');
    console.log(`Total clients checked: ${allClients.length}`);
    console.log(`Clients missing quotationAmount field: ${clientsWithoutAmount}`);
    console.log(`Clients with invalid quotationAmount: ${clientsWithInvalidAmount}`);
    console.log(`Clients with valid quotationAmount: ${clientsAlreadyOK}`);
    
    if (clientsWithoutAmount > 0 || clientsWithInvalidAmount > 0) {
      console.log('\n✅ All issues have been fixed!');
    } else {
      console.log('\n✅ All clients had valid quotationAmount values!');
    }
    
    // Verify a specific client if ID is provided
    const specificClientId = '67c835871c2a9f9fcc45324e'; // The ID from user's request
    console.log(`\nVerifying specific client with ID: ${specificClientId}`);
    
    const specificClient = await clientsCollection.findOne({ _id: new ObjectId(specificClientId) });
    if (specificClient) {
      console.log('Found client:');
      console.log(`Company: ${specificClient.companyName}`);
      console.log(`Quotation Amount: ${specificClient.quotationAmount} (${typeof specificClient.quotationAmount})`);
      
      if (specificClient.quotationAmount === undefined) {
        console.log('❌ This client is still missing the quotationAmount field!');
        
        // Fix it directly
        await clientsCollection.updateOne(
          { _id: new ObjectId(specificClientId) },
          { $set: { quotationAmount: 0 } }
        );
        
        console.log('✅ Fixed: Added quotationAmount field with value 0');
        
        // Verify the fix
        const updatedClient = await clientsCollection.findOne({ _id: new ObjectId(specificClientId) });
        console.log(`Updated quotationAmount: ${updatedClient.quotationAmount} (${typeof updatedClient.quotationAmount})`);
      } else {
        console.log('✅ This client has a quotationAmount field');
      }
    } else {
      console.log(`❌ Could not find client with ID: ${specificClientId}`);
    }

  } catch (error) {
    console.error('❌ Error fixing clients:');
    console.error(error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error); 