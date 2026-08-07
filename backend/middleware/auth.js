// ==========================================
// File: middleware/auth.js
// Purpose: Protect routes so only logged-in users can access them
// ==========================================

// 1. Import jsonwebtoken and our User model
// JWT is used to create and verify secure "tickets" (tokens) for logged-in users.
import jwt from 'jsonwebtoken';
// We need the User model to find the user in the database based on their token.
import User from '../models/User.js';

// ==========================================
// Middleware: protect
// Purpose: Checks if the user has a valid login token
// ==========================================
export const protect = async (req, res, next) => {
  let token;

  // 2. Check if the request has an authorization header that starts with 'Bearer'
  // When a user logs in, the frontend should send their token like this: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 3. Extract the token
      // "Bearer <token>".split(' ') turns it into an array: ["Bearer", "<token>"]
      // We grab the second item [1] which is just the token string.
      token = req.headers.authorization.split(' ')[1];

      // 4. Verify the token!
      // This checks if the token was created by us (using JWT_SECRET) and hasn't expired.
      // If valid, it decrypts the token payload (which contains the user's ID).
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 5. Find the user in the database
      // We search by the decoded user ID.
      // .select('-password') means "get all user info EXCEPT the password" for security.
      req.user = await User.findById(decoded.id).select('-password');

      // 6. Call next()!
      // This tells Express: "Everything is good, move on to the actual route handler."
      return next();
    } catch (error) {
      // 7. If token is invalid or expired, this catch block runs.
      console.error("Auth Error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // 8. If there was no token at all in the headers...
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ==========================================
// Middleware: adminOnly
// Purpose: Checks if the logged-in user is an admin
// ==========================================
export const adminOnly = (req, res, next) => {
  // 1. We check req.user (which was added by the 'protect' middleware above!)
  // If the user exists and their role is exactly 'admin', they are allowed in.
  if (req.user && req.user.role === 'admin') {
    next(); // Move to the next function
  } else {
    // 2. If they are not an admin, we block them! 403 means Forbidden.
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
