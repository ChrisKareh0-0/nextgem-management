/**
 * This script verifies the quotation amount for all clients
 * Run with: node -r dotenv/config src/scripts/verify-amount-due.js
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
    
    // Find all clients and analyze their quotationAmount
    console.log('Fetching all clients to verify quotationAmount field...');
    const allClients = await clientsCollection.find({}).toArray();
    
    console.log(`Found ${allClients.length} clients in the database.`);
    console.log('Analyzing quotationAmount field for each client:');
    console.log('---------------------------------------------------');
    
    let clientsWithIssues = 0;
    let clientsWithoutAmount = 0;
    
    for (const clientDoc of allClients) {
      const { _id, companyName, quotationAmount } = clientDoc;
      
      console.log(`Client ID: ${_id}`);
      console.log(`Company Name: ${companyName}`);
      
      if (quotationAmount === undefined || quotationAmount === null) {
        console.log(`❌ ERROR: quotationAmount is ${quotationAmount}`);
        clientsWithoutAmount++;
        
        // Fix the client by setting a default amount
        console.log(`  → Fixing client by setting quotationAmount to 0`);
        await clientsCollection.updateOne(
          { _id: clientDoc._id },
          { $set: { quotationAmount: 0 } }
        );
        console.log(`  ✅ Fixed!`);
      } else {
        console.log(`quotationAmount: ${quotationAmount} (${typeof quotationAmount})`);
        
        // Check for valid number
        if (typeof quotationAmount !== 'number' || isNaN(quotationAmount)) {
          console.log(`❌ ERROR: quotationAmount is not a valid number`);
          clientsWithIssues++;
          
          // Fix the client by converting to a valid number
          const fixedAmount = typeof quotationAmount === 'string' ? 
                             parseFloat(quotationAmount) || 0 : 0;
          
          console.log(`  → Fixing client by setting quotationAmount to ${fixedAmount}`);
          await clientsCollection.updateOne(
            { _id: clientDoc._id },
            { $set: { quotationAmount: fixedAmount } }
          );
          console.log(`  ✅ Fixed!`);
        } else {
          console.log(`✅ Valid number!`);
        }
      }
      
      console.log('---------------------------------------------------');
    }
    
    console.log('\nSummary:');
    console.log(`Total clients checked: ${allClients.length}`);
    console.log(`Clients missing quotationAmount: ${clientsWithoutAmount}`);
    console.log(`Clients with invalid quotationAmount: ${clientsWithIssues}`);
    console.log(`Clients with valid quotationAmount: ${allClients.length - clientsWithoutAmount - clientsWithIssues}`);
    
    if (clientsWithoutAmount > 0 || clientsWithIssues > 0) {
      console.log('\n✅ All issues have been fixed!');
    } else {
      console.log('\n✅ All clients have valid quotationAmount values!');
    }

  } catch (error) {
    console.error('❌ Error verifying clients:');
    console.error(error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error); 