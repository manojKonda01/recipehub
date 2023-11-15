
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

async function createUserDB(){
    try{
        await client.connect();
        const database = client.db('recipehub');
        const collection = client.db('users');
        // User schema
        const userSchema = {
            email: { type: 'string', required: true, unique: true },
            password: { type: 'string', required: true },
            name: { type: 'string', required: true },
            imageUrl: { type: 'string' },
            age: { type: 'number' },
            birthDate: { type: 'date' },
            userPreferences: {type: 'array'},
            savedRecipes: { type: 'array' },
            createdAt: { type: 'date', default: new Date() },
        };
    }
    finally{

    }
}