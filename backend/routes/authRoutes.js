import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import the User model we created

// We create a "router" to handle all URLs that start with /api/auth
const router = express.Router();

// --- ROUTE 1: REGISTER A NEW USER ---
// When a user submits the signup form, this POST route runs.
router.post('/register', async (req, res) => {
  try {
    // 1. Get the data the user typed in from the "request body" (req.body)
    const { name, email, password, location } = req.body;

    // 2. Check if a user with this email already exists in our database.
    const userExists = await User.findOne({ email });
    if (userExists) {
      // If they exist, stop and send an error response with a 400 Bad Request status.
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Create the new user. 
    // (Remember: Our pre-save hook in the User model will automatically hash the password before saving!)
    const user = await User.create({
      name,
      email,
      password,
      location
    });

    // 4. Generate a JWT token. 
    // A JWT token is like a digital ID card. It proves the user is logged in.
    // We put their user._id inside the token as 'id'. We sign it with our secret key.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // 5. Send back a success response (201 Created) containing the token and user details.
    res.status(201).json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location
    });

  } catch (error) {
    // If anything goes wrong (e.g., database is down), catch the error and send a 500 status.
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// --- ROUTE 2: LOGIN AN EXISTING USER ---
// When a user submits the login form, this POST route runs.
router.post('/login', async (req, res) => {
  try {
    // 1. Get the email and password from the request body.
    const { email, password } = req.body;

    // 2. Find the user in the database by their email.
    const user = await User.findOne({ email });

    // 3. If the user exists, check if the password is correct.
    // We use the custom matchPassword method we created in the User model!
    if (user && (await user.matchPassword(password))) {
      // 4. If password is correct, generate a new JWT token.
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

      // 5. Send back the token and user details so the frontend knows who is logged in.
      res.json({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      });
    } else {
      // If user is not found or password is wrong, send an error.
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Export the router so it can be used in our main server file (e.g., server.js)
export default router;
