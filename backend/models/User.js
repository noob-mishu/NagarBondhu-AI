import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// A Schema in Mongoose defines the structure of our documents (like rows in a database table)
const userSchema = new mongoose.Schema({
  // 'name' will store the user's full name. It's a string and is required.
  // 'trim: true' removes extra spaces before and after the name.
  name: { type: String, required: true, trim: true },
  
  // 'email' will store the user's email. It must be unique so two users can't have the same email.
  // 'lowercase: true' ensures the email is always saved in lowercase to prevent duplicates like 'A@a.com' and 'a@a.com'.
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  
  // 'password' is required and must be at least 6 characters long for security.
  password: { type: String, required: true, minlength: 6 },
  
  // 'role' determines what the user can do. It can only be 'citizen' or 'admin'.
  // We default new users to 'citizen'.
  role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
  
  // 'location' can store the user's ward, city, or address. It's optional.
  location: { type: String, default: '' },
  
  // 'avatarUrl' will store a link to the user's profile picture.
  avatarUrl: { type: String, default: '' },

  // 'points' gamifies civic participation: +10 for every report submitted,
  // +50 bonus when a report gets resolved (awarded in routes/reportRoutes.js).
  points: { type: Number, default: 0 },
  
  // 'createdAt' automatically stores the exact date and time the user registered.
  createdAt: { type: Date, default: Date.now }
});

// A "pre-save hook" is a function that runs automatically right before we save a user to the database.
// We use this to "hash" (scramble/encrypt) the password so we don't save raw passwords in our database.
userSchema.pre('save', async function(next) {
  // If the password wasn't changed (e.g., they only updated their name), skip hashing.
  if (!this.isModified('password')) {
    return next();
  }
  
  // 'bcrypt.genSalt' creates a random string to mix with the password, making it harder to crack.
  const salt = await bcrypt.genSalt(10);
  // We hash the password with the salt and replace the plain text password with the hashed one.
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Move on to actually saving the user
});

// We can add custom methods to our users.
// This method checks if the password the user typed when logging in matches the hashed password in the database.
userSchema.methods.matchPassword = async function(enteredPassword) {
  // bcrypt.compare will hash the entered password and compare it to the stored hash safely.
  return await bcrypt.compare(enteredPassword, this.password);
};

// We export the model so we can use it in our routes to create, find, or update users!
export default mongoose.model('User', userSchema);
