// ==========================================
// File: middleware/upload.js
// Purpose: Handle file uploads from users (images/videos) and send them to Cloudinary
// ==========================================

// 1. Import multer and our cloudinary config
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// ==========================================
// Part 1: Multer Configuration
// Purpose: Catch files coming from the frontend and hold them in memory
// ==========================================

// 2. Set up Memory Storage
// We want to keep the uploaded file in the server's RAM (Memory) temporarily,
// instead of saving it to the server's hard drive. This is faster for uploading directly to cloud!
const storage = multer.memoryStorage();

// 3. Define a File Filter
// We don't want users uploading dangerous files (like .exe or .zip).
// We only allow specific image and video types.
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo']; // quicktime is .mov, x-msvideo is .avi
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // File is safe, accept it!
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, WEBP, MP4, MOV, and AVI are allowed.'), false); // Reject it!
  }
};

// 4. Create the multer instance
// We combine our storage, filter, and add a file size limit (10MB).
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Megabytes in bytes
  fileFilter
});

// ==========================================
// Part 2: Cloudinary Upload Helper
// Purpose: Take the file from memory and send it to Cloudinary
// ==========================================

// 5. Create a function to upload the file buffer to Cloudinary
// A "Buffer" is just the raw binary data of the file sitting in our RAM.
export const uploadToCloudinary = (fileBuffer, folderName) => {
  // We return a Promise because uploading takes time over the internet.
  return new Promise((resolve, reject) => {
    
    // We create an "upload stream" to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName, // Which folder in Cloudinary to put this in
        resource_type: 'auto' // 'auto' tells Cloudinary to figure out if it's an image or video
      },
      (error, result) => {
        // This callback runs when Cloudinary is done.
        if (error) {
          reject(error); // If something went wrong, reject the promise
        } else {
          // If successful, resolve the promise and give back the URL and Public ID
          // (Public ID is used if we ever want to delete the image later)
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    // 6. Finally, we take our fileBuffer and push it into the uploadStream!
    uploadStream.end(fileBuffer);
  });
};
