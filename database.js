const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();
let client;

const URI = process.env.MONGO_URI;
// Function to connect mongo
async function connectToMongoDB() {
  try {
    client = new MongoClient(URI);
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Get User Details
async function getUserDetails(email) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const user = await db.collection('users').findOne({ email });
    if (user) {
      const { email, name, savedRecipes, userPreferences } = user;
      return { email, name, savedRecipes, userPreferences };
    } else {
      return false;
    }
  } catch (error) {
    console.log(error.message);
  }
}

// function to user login
async function loginUser(email, password) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    // Check user exists or not.
    const user = await db.collection('users').findOne({ email });
    if (user) {
      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        console.log('User authenticated:', user._id);
        const { email, name, savedRecipes, userPreferences } = user;
        return {
          success: true,
          message: 'Login successful',
          user: { email, name, savedRecipes, userPreferences },
        };
      } else {
        console.log('Incorrect password for user:', user._id);
        return { success: false, message: 'Incorrect Password' };
      }
    } else {
      console.log('User not found with email:', email);
      return { success: false, message: 'Email Not Found' };
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    return { success: false, message: 'Error during login: ' + error.message };
  } finally {
    // Close the MongoDB connection when done, even if an error occurred
    await client.close();
  }
}

// function to sign up  a new user
async function signupUser(user) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const email = user.email;
    // check for existing user
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      console.log('User with this email already exists.');
      return { success: false, message: 'User already exists' };
    }
    // Insert the new user into the database
    await insertUser(user);
    console.log('User successfully registered!');
    const newUser = await db.collection('users').findOne({ email });
    const { newemail, name, savedRecipes, userPreferences } = newUser;
    return {
      success: true,
      message: 'Registered Successfully',
      user: { newemail, name, savedRecipes, userPreferences },
    };
  } catch (error) {
    console.error('Error during signup:', error.message);
    return { success: false, message: 'Error During SignUp' };
  } finally {
    await client.close();
  }
}

// function to insert user
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
      savedRecipes: [],
    });
    success = result.insertedCount === 1;
    console.log('User inserted:', result.insertedId);
  } catch (error) {
    console.error('Error inserting user:', error.message);
  }
  return success;
}

// function to update preferences of a user
async function updatePreferences(userEmail, preferences) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const userCollection = db.collection('users');
    const updateQuery = { email: userEmail };
    const update = {
      $set: {
        userPreferences: preferences,
      },
    };
    userCollection.updateOne(updateQuery, update, (updateErr) => {
      if (updateErr) {
        console.error('Error updating user preferences:', updateErr);
      } else {
        console.log('User preferences updated successfully');
      }
      client.close();
    });
    return { success: true, message: 'User preferences updated successfully' };
  } catch (error) {
    console.error('Error Updating Preferences: ', error.message);
    return { success: false, message: error.message };
  }
}

// function to save a recipe in user collections
async function saveRecipe(userEmail, recipejsonData) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const userCollection = db.collection('users');
    const result = await userCollection.updateOne(
      { email: userEmail },
      { $push: { savedRecipes: recipejsonData } }
    );
    if (result.modifiedCount > 0) {
      console.log('Recipe saved successfully!');
      return { success: true, message: 'Recipe saved successfully!' };
    } else {
      console.log('User not found or recipe not saved.');
      return { success: false, message: 'User not found or recipe not saved.' };
    }
  } catch (error) {
    console.log('Error while saving recipe:', error.message);
    return {
      success: false,
      message: 'Error while saving recipe: ' + error.message,
    };
  }
}

// function to save a recipe from user collections
async function unSaveRecipe(userEmail, recipejsonData) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const userCollection = db.collection('users');
    const uri = recipejsonData['uri'];
    if (uri) {
      const userFilter = { email: userEmail };
      const updateOperation = { $pull: { savedRecipes: { uri: uri } } };
      const result = await userCollection.updateOne(
        userFilter,
        updateOperation
      );
      await client.close();
      return {
        success: true,
        message: 'Recipe unsaved successfully',
        user: result.value,
      };
    }
  } catch (error) {
    console.log('Error while saving recipe:', error.message);
    return {
      success: false,
      message: 'Error while saving recipe: ' + error.message,
    };
  }
}

// function to change password
async function changePassword(email, oldPassword, newPassword) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({ email: email });
    // const user = await db.collection('users').findOne({ email });
    if (user) {
      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (passwordMatch) {
        console.log('User authenticated:', user._id);
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        // Update the user's password in the database
        await userCollection.updateOne(
          { email: email },
          { $set: { password: hashedNewPassword } }
        );
        return { success: true, message: 'Password Changed Succesfully' };
      } else {
        console.log('Incorrect password for user:', user._id);
        return { success: false, message: 'Old password is incorrect' };
      }
    } else {
      console.log('User not found with email:', email);
      return { success: false, message: 'Email Not Found' };
    }
  } catch (error) {
    console.log(error.message);
    return { success: false, message: error.message };
  }
}

// function to update email and name
async function updateUser(oldEmail, email, name) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({ email: oldEmail });
    if (user) {
      let update = {};
      if (email.length > 0 && name.length > 0) {
        update = { email: email, name: name };
      } else if (email.length === 0) {
        update = { name: name };
      } else if (name.length === 0) {
        update = { email: email };
      }
      await userCollection.updateOne({ email: oldEmail }, { $set: update });
      return { success: true, message: 'Personal Info Updated' };
    } else {
      return { success: false, message: 'Invalid User' };
    }
  } catch (error) {
    console.log(error.message);
    return { success: false, message: error.message };
  }
}

// Funciton to get reviews of a recipe
async function getReviews(recipeID) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const reviewCollection = db.collection('review');
    const existingRecipe = await reviewCollection.findOne({
      recipeID: recipeID,
    });
    if (existingRecipe) {
      const sortedReviews = existingRecipe.reviews.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      return {
        success: true,
        data: sortedReviews,
        message: 'Recipe Review Data',
      };
    } else {
      console.log('No review Data for such Recipe ID :' + recipeID);
      return {
        success: true,
        message: 'No review Data for such Recipe ID :' + recipeID,
        data: '',
      };
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Function to add a review to a recipe
async function review(recipeID, userReview) {
  try {
    await connectToMongoDB();
    const db = client.db('recipehub');
    const reviewCollection = db.collection('review');
    const existingRecipe = await reviewCollection.findOne({
      recipeID: recipeID,
    });
    if (existingRecipe) {
      console.log('Recipe Review Data do not exist.');
      // Calculate new average rating
      const totalRatings = existingRecipe.reviews.length;
      const newTotalRatings = totalRatings + 1;

      const newAverageRating =
        (existingRecipe.averageRating * totalRatings + userReview.rating) /
        newTotalRatings;

      // Create new review object
      const newReview = {
        email: userReview.email,
        name: userReview.name,
        rating: userReview.rating,
        review: userReview.review,
        createdAt: new Date(),
      };

      // Update the recipe document with new averageRating and reviews
      const result = await reviewCollection.updateOne(
        { recipeID: recipeID },
        {
          $set: {
            averageRating: newAverageRating,
          },
          $push: {
            reviews: newReview,
          },
        }
      );
      return { success: true, message: 'Review added to existing recipe' };
    } else {
      console.log('Creating new Recipe Review Data');
      // Create new review db for recipe
      const newRecipe = {
        recipeID: recipeID,
        averageRating: userReview.rating,
        reviews: [
          {
            email: userReview.email,
            name: userReview.name,
            rating: userReview.rating,
            review: userReview.review,
            createdAt: new Date(),
          },
        ],
      };

      const result = await reviewCollection.insertOne(newRecipe);
      return { success: true, message: 'Review added to new recipe' };
    }
  } catch (error) {
    console.log(error.message);
    return { success: false, message: error.message };
  } finally {
    await client.close();
  }
}
module.exports = {
  connectToMongoDB,
  loginUser,
  signupUser,
  saveRecipe,
  unSaveRecipe,
  updatePreferences,
  changePassword,
  updateUser,
  getUserDetails,
  getReviews,
  review,
  getClient: () => client,
};
