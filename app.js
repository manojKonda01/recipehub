const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { connectToMongoDB, loginUser, signupUser, unSaveRecipe, saveRecipe, updatePreferences, changePassword, updateUser, getUserDetails, getReviews, review} = require('./database')
require('dotenv').config();


connectToMongoDB();

const app = express();
const port = process.env.PORT;
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET_ACCESS_TOKEN,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1200000 }
}));

// Middleware to extend the session on activity
app.use((req, res, next) => {
    req.session._garbage = Date();
    req.session.touch();
    next();
});

// Middleware to parse JSON in requests
app.use(bodyParser.json());

// Middleware to parse URL-encoded data in requests
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// const allowedURLs = ['/recipe', '/category', '/login', '/api/login', '/api/logout', '/api/signup', '/api/sessionVerify'];

// app.use((req, res, next) => {
//     const requestedURL = req.url.split('?')[0];
//     if (allowedURLs.includes(requestedURL)) {
//         // Do nothing, allow access to login and signup pages
//         next();
//     }else {
//         // Redirect to the home page
//         res.redirect('/');
//     }
// });

//route to handle requests for the home page
app.get('/', (req, res) => {
    // Send the HTML file as the response
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/category', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', '/assets/templates/category.html'));
    }
    finally {

    }
})

app.get('/profile', (req, res) => {
    try {
        // if (req.session.user) {
            res.sendFile(path.join(__dirname, 'public', '/assets/templates/profile.html'));
        // }
        // else{
        //     res.redirect('/login')
        // }
    }
    finally {

    }
})

app.get('/recipe', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', '/assets/templates/recipe.html'));
    }
    finally {

    }
})
app.get('/login', (req, res) => {
    try {
        // if (req.session.user) {
        //     res.redirect('/')
        // }
        // else {
            res.sendFile(path.join(__dirname, 'public', '/assets/templates/login.html'));
        // }
    }
    finally {

    }
})
// Login API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        if (result.success) {
            req.session.user = result.user;
            res.status(200).json({ status: 200, message: result.message, user: result.user});
        } else {
            res.status(401).json({ status: 401, message: result.message });
        }
    }
    catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// API to logout 
app.get('/api/logout', (req, res) => {
    // Destroy the session on logout
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).json({ status: 200, message: 'Logged Out Successfully' });
        }
    });
});

// SignUp API
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const result = await signupUser({ name, email, password });
        if (result.success || result.message === 'User already exists') {
            if (result.success) {
                req.session.user = result.user;
            }
            res.status(200).json({ status: 200, message: result.message });
        } else {
            res.status(401).json({ status: 401, message: result.message });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// API to check user session
app.get('/api/sessionVerify', async (req, res) => {
    if (req.session.user) {
        res.json({ status: 200, user: req.session.user });
    }
    else {
        res.json({ status: 404 });
    }
})

// API to update preferences
app.post('/api/updatePreferences', async (req, res) => {
    try {
        const { email, updatedPreferences } = req.body;
        const result = await updatePreferences(email, updatedPreferences);
        if (result.success) {
            res.status(200).json({ status: 200, message: result.message });
            const user = req.session.user;
            user.userPreferences = updatedPreferences;
            req.session.user = user;
            req.session.save();
        } else {
            res.status(401).json({ status: 401, message: result.message });
        }
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
})

// API to save a recipe to user account
app.post('/api/saveRecipe', async (req, res) => {
    try {
        const { email, jsonData } = req.body;
        const result = await saveRecipe(email, jsonData);
        if (result.success) {
            res.status(200).json({ status: 200, message: result.message });
            if (req.session.user) {
                const user = req.session.user
                if (user.savedRecipes) {
                    // Check if the recipe exists within the user session
                    const exists = user.savedRecipes.some(obj => obj.uri === jsonData.uri);
                    // If the value doesn't exist, add a new object to the array
                    if (!exists) {
                        user.savedRecipes.push(jsonData);
                        req.session.user = user;
                        req.session.save();
                    }
                }
            }
        } else {
            res.status(401).json({ status: 401, message: result.message });
        }
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

// API to unsave a recipe from user account
app.post('/api/unSaveRecipe', async (req, res) => {
    try {
        const { email, jsonData } = req.body;
        const result = await unSaveRecipe(email, jsonData);
        if (result.success) {
            if (req.session.user) {
                const user = req.session.user
                if (user.savedRecipes) {
                    // Find the index of the recipe to remove from user session;
                    const index = user.savedRecipes.findIndex(obj => obj.uri === jsonData.uri);
                    // If the value exists, remove the object from the array
                    if (index !== -1) {
                        user.savedRecipes.splice(index, 1);
                        req.session.user = user;
                        req.session.save();
                    }
                }
            }

            res.status(200).json({ status: 200, message: result.message, user: result.user });
        } else {
            res.status(401).json({ status: 401, message: result.message });
        }
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

// change password api
app.post('/api/changePassword', async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        const result = await changePassword(email, oldPassword, newPassword);
        if (result.success) {
            const user = req.session.user;
            user.email = email;
            req.session.user = user;
            req.session.save();
            res.status(200).json({ status: 200, message: result.message});
        } else {
            res.status(401).json({ status: 401, message: result.message });
        }
    }
    catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// update personal details info
app.post('/api/updateUser', async (req, res) => {
    try {
        const { oldEmail, email, name } = req.body;
        const result = await updateUser(oldEmail, email, name);
        if (result.success) {
            const user = req.session.user

            res.status(200).json({ status: 200, message: result.message});
        } else {
            res.status(500).json({ status: 401, message: result.message });
        }
    }
    catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// API to get user details
app.post('/api/get-user-details', async (req, res) => {
    try{
        const {email} = req.body;
        const user = await getUserDetails(email);
        if(user){
            res.status(200).json({ status: 200, user: user});
        }
        else{
            res.status(500).json({ status: 401, message:'No Such User'});
        }
    }
    catch(error){
        res.status(500).json({message: error.message});

    }
})

// API to fetch Review of recipe
app.post('/api/getReviews', async (req, res) => {
    try{
        const {recipeID} = req.body;
        const result = await getReviews(recipeID);
        if(result.success){
            res.status(200).json({ status: 200, message: result.message, data: result.data});
        }
        else{
            res.status(500).json({ status: 401, message: result.message});
        }
    }
    catch(error){
        res.status(500).json({message: error.message});

    }
})

// APi to add review
app.post('/api/review', async (req, res) => {
    try{
        const {recipeID, userReview} = req.body;
        const result = await review(recipeID, userReview);
        if(result.success){
            res.status(200).json({ status: 200, message: result.message});
        }
        else{
            res.status(500).json({ status: 401, message: result.message});
        }
    }
    catch(error){
        res.status(500).json({message: error.message});

    }
})
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

