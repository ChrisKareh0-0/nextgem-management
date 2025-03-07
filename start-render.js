// Custom start script for Render deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting server for Render deployment...');

// Check for MongoDB URI and create .env.local if needed
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables!');
  console.error('The application will not function correctly without a valid MongoDB connection.');
  console.error('Please set the MONGODB_URI environment variable in the Render dashboard.');
} else {
  console.log('Creating .env.local file with environment variables...');
  try {
    const envContent = `MONGODB_URI=${process.env.MONGODB_URI}\n`;
    fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);
    console.log('Created .env.local file with MongoDB URI.');
  } catch (envError) {
    console.error('Error creating .env.local file:', envError.message);
  }
}

// Check if .next directory exists and has required files
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir) || !fs.readdirSync(nextDir).length) {
  console.warn('.next directory is missing or empty. Attempting emergency build...');
  try {
    // Set environment variables
    process.env.NEXT_SKIP_TYPECHECKING = '1';
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    
    // Use the special Render configuration if available
    if (fs.existsSync(path.join(process.cwd(), 'next.config.render.mjs'))) {
      if (fs.existsSync(path.join(process.cwd(), 'next.config.mjs'))) {
        fs.renameSync(
          path.join(process.cwd(), 'next.config.mjs'),
          path.join(process.cwd(), 'next.config.mjs.bak')
        );
      }
      fs.renameSync(
        path.join(process.cwd(), 'next.config.render.mjs'),
        path.join(process.cwd(), 'next.config.mjs')
      );
    }
    
    // Run minimal build
    execSync('next build --no-lint', { stdio: 'inherit' });
  } catch (error) {
    console.warn('Emergency build failed, but we will try to start anyway:', error.message);
    
    // Create minimal .next structure if needed
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }
  } finally {
    // Restore original config if needed
    if (fs.existsSync(path.join(process.cwd(), 'next.config.mjs.bak'))) {
      fs.renameSync(
        path.join(process.cwd(), 'next.config.mjs'),
        path.join(process.cwd(), 'next.config.render.mjs')
      );
      fs.renameSync(
        path.join(process.cwd(), 'next.config.mjs.bak'),
        path.join(process.cwd(), 'next.config.mjs')
      );
    }
  }
}

// Start the server
console.log('Starting Next.js server...');
try {
  execSync('next start', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
} 