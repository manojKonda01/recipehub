const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');

const username = encodeURIComponent("mkonda");
const password = encodeURIComponent("Bmma@9979");
const uri = `mongodb+srv://${username}:${password}@recipehubcluster.avc0ez1.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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

