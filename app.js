const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON in requests
app.use(bodyParser.json());

// Middleware to parse URL-encoded data in requests
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Define a route to handle requests for the home page
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

