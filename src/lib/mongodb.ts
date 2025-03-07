import mongoose from 'mongoose';

// Get MongoDB URI from environment variables with explicit logging
const MONGODB_URI = process.env.MONGODB_URI;

// Verify MONGODB_URI is set
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables!');
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let isConnected = false;

export const dbConnect = async () => {
  if (isConnected) {
    return true;
  }

  try {
    // Log the connection string (with password obscured for security)
    const sanitizedUri = MONGODB_URI.replace(
      /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
      'mongodb$1://$2:****@'
    );
    console.log(`Connecting to MongoDB at: ${sanitizedUri}`);
    
    await mongoose.connect(MONGODB_URI, {
      // Add MongoDB connection options if needed
    });
    
    isConnected = true;
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Re-throw the error so we can handle it in the API routes
  }
};

export default dbConnect; 