const { MongoClient } = require('mongodb');
const bcrypt = require("bcryptjs");
require('dotenv').config();

// const username = encodeURIComponent(process.env.DB_USER);
// const password = encodeURIComponent(process.env.DB_PASSWORD);
// console.log(username, password);
// const uri = `mongodb+srv://${username}:${password}@recipehubcluster.avc0ez1.mongodb.net/?retryWrites=true&w=majority`;
let client;

const URI = process.env.MONGO_URI;
async function connectToMongoDB() {
  try {
    client = new MongoClient(URI);
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

async function loginUser(email, password) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const user = await db.collection('users').findOne({ email });

    if (user) {
      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        console.log('User authenticated:', user._id);
        return { success: true, message: 'Login successful', user: user }
      }
      else {
        console.log('Incorrect password for user:', user._id);
        return { success: false, message: 'Incorrect Password' }
      }
    }
    else {
      console.log('User not found with email:', email);
      return { success: false, message: 'Email Not Found' }
    }
  }
  catch (error) {
    console.error('Error during login:', error.message);
    return { success: false, message: 'Error during login: ' + error.message }
  }
  finally {
    // Close the MongoDB connection when done, even if an error occurred
    await client.close();
  }
}

async function signupUser(user) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const email = user.email;
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      console.log('User with this email already exists.');
      return { success: false, message: 'User already exists' };
    }
    // Insert the new user into the database
    await insertUser(user);
    console.log('User successfully registered!');
    const newUser = await db.collection('users').findOne({ email });
    return { success: true, message: 'Registered Successfully', user: newUser};
  }
  catch (error) {
    console.error('Error during signup:', error.message);
    return { success: false, message: 'Error During SignUp' };
  }
  finally {
    await client.close();
  }
}

async function insertUser(user) {
  let success = false;
  try {
    await connectToMongoDB();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const db = client.db('recipehub');
    const result = await db.collection('users').insertOne({
      email: user.email,
      password: hashedPassword,
      name: user.name,
      createdAt: new Date(),
    });
    success = result.insertedCount === 1;
    console.log('User inserted:', result.insertedId);
  }
  catch (error) {
    console.error('Error inserting user:', error.message);
  }
  return success;
}

module.exports = { connectToMongoDB, loginUser, signupUser, getClient: () => client };