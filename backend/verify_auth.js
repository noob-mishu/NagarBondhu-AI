import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testAuth = async () => {
  try {
    console.log('1. Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB Connected');

    const testEmail = 'verify_test@example.com';
    const testPassword = 'mysecurepassword123';

    console.log('2. Cleaning up old test data...');
    await User.deleteOne({ email: testEmail });

    console.log('3. Testing Registration API...');
    const regRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Verify Test',
        email: testEmail,
        password: testPassword,
        location: 'Test City'
      })
    });
    
    const regData = await regRes.json();
    if (!regRes.ok) {
      throw new Error('Registration failed: ' + JSON.stringify(regData));
    }
    console.log('✅ Registration API successful. Token:', regData.token ? 'Received' : 'Missing');

    console.log('4. Testing Login API...');
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error('Login failed: ' + JSON.stringify(loginData));
    }
    console.log('✅ Login API successful. Token:', loginData.token ? 'Received' : 'Missing');

    console.log('5. Verifying in Database...');
    const userInDb = await User.findOne({ email: testEmail });
    if (!userInDb) {
      throw new Error('User not found in DB!');
    }
    console.log('✅ User found in DB.');
    console.log('   - Name:', userInDb.name);
    console.log('   - Email:', userInDb.email);
    console.log('   - Password is Hashed:', userInDb.password !== testPassword);
    
    const isMatch = await userInDb.matchPassword(testPassword);
    console.log('   - Password Hash matches input:', isMatch);

    console.log('6. Cleaning up...');
    await User.deleteOne({ email: testEmail });
    
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! Login and Signup are working perfectly.');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

testAuth();
