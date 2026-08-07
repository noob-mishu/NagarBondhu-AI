// ==========================================
// File: config/cloudinary.js
// Purpose: Configure Cloudinary for storing images and videos
// ==========================================

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables here because ES module imports are hoisted
// and process.env might not be populated yet if server.js hasn't run dotenv.config()
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
