// ==========================================
// File: config/db.js
// Purpose: Connect to our MongoDB database
// ==========================================

// 1. Import mongoose
// Mongoose is a library that helps Node.js talk to MongoDB easily.
// It allows us to create models and save data in a structured way.
import mongoose from 'mongoose';

// 2. Create an async function called connectDB
// We use 'async' because connecting to a database takes time, and we
// want to wait for it to finish before moving on.
const connectDB = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Try to connect to MongoDB with explicit timeout options
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,   // Wait up to 15s to find a server
        connectTimeoutMS: 15000,           // Wait up to 15s for initial connection
        socketTimeoutMS: 45000,            // Close sockets after 45s of inactivity
      });

      console.log(`✅ MongoDB Connected Successfully! Host: ${conn.connection.host}`);
      return; // Connected — exit the function
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      
      if (attempt < retries) {
        const delay = attempt * 3000; // 3s, 6s, 9s
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ All MongoDB connection attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
};

// 6. Export the function so we can use it in server.js
export default connectDB;
