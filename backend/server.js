// ==========================================
// File: server.js
// Purpose: The main starting point for our backend server!
// ==========================================

// 1. Load Environment Variables First!
// We use 'dotenv' to read our secret variables from the .env file.
// This MUST happen before we try to use things like process.env.PORT.
import dotenv from 'dotenv';
dotenv.config();

// 2. Import core libraries
import express from 'express';     // Express is the framework we use to build our server easily.
import cors from 'cors';           // CORS allows our frontend (which might run on a different port) to talk to our backend.
import connectDB from './config/db.js'; // Our MongoDB connection function

// 3. Create the Express App
// This 'app' object is our server. We will teach it how to handle requests.
const app = express();

// 4. Middleware Setup
// Middleware are like security guards or helpers that check every request before it reaches our routes.
app.use(cors()); // Allow requests from other origins (like our React frontend)
app.use(express.json()); // Allow our server to understand JSON data sent in request bodies

// 5. Connect to the Database
// We call the function we imported from db.js to connect to MongoDB.
connectDB();

// 6. Mount Routes
// Here we tell Express: "If a request URL starts with /api/auth, use the authRoutes file to handle it!"
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// 7. A Simple Health Check Route
// A quick way to test if our server is alive. If we visit http://localhost:5000/ we should see this message!
app.get('/', (req, res) => {
  res.send('NagarBondhu AI Backend is running beautifully! 🚀');
});

// 8. Global Error Handler
// If something goes wrong anywhere in our app, Express will send the error here instead of crashing completely.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error so we can debug it
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 (Server Error)
  res.status(statusCode).json({
    message: err.message,
    // Only show detailed error info if we are in development mode!
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// 9. Start the Server!
// We tell our app to start listening for requests on a specific port.
const PORT = process.env.PORT || 5000; // Use PORT from .env, or 5000 if not found
app.listen(PORT, () => {
  console.log(`🌟 Server is running on port ${PORT}`);
});
