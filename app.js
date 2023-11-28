const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const {connectToMongoDB, loginUser, signupUser} = require('./connectDB')
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

// Middleware to parse JSON in requests
app.use(bodyParser.json());

// Middleware to parse URL-encoded data in requests
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

//route to handle requests for the home page
app.get('/', (req, res) => {
  // Send the HTML file as the response
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/category', (req, res) => {
    try{
        res.sendFile(path.join(__dirname, 'public', '/assets/templates/category.html'));
    }
    finally{

    }
})

app.get('/recipe', (req, res) => {
    try{
        res.sendFile(path.join(__dirname, 'public', '/assets/templates/recipe.html'));
    }
    finally{

    }
})
app.get('/login', (req, res) => {
    try{
        if(req.session.user){
            res.redirect('/')
        }
        else{
            res.sendFile(path.join(__dirname, 'public', '/assets/templates/login.html'));
        }
    }
    finally{

    }
})
// Login API
app.post('/api/login', async (req, res) => {
    try{
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        if(result.success){
            req.session.user = result.user;
            res.status(200).json({status: 200, message: result.message, userId: result.userId });
        }else{
            res.status(401).json({status: 401, message: result.message});
        }
    }
    catch (error){
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.get('/api/logout', (req, res) => {
    // Destroy the session on logout
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).json({status: 200, message: 'Logged Out Successfully'});
      }
    });
  });
  
// SignUp API
app.post('/api/signup', async (req, res) => {
    try{
        const { email, password } = req.body;
        const result = await signupUser(email, password);
        if(result.success){
            res.status(200).json({ message: result.message});
        }else{
            res.status(401).json({ message: result.message});
        }
    }
    catch (error){
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.get('/api/sessionVerify', (req, res) => {
    if(req.session.user){
        res.json({status:200, user:req.session.user});
    }
    else{
        res.json({status:404});
    }
})

app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        } else {
            // res.redirect('/login'); // Redirect to login page after logout
        }
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

