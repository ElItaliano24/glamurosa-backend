import { MongoClient, ServerApiVersion } from 'mongodb'

// const uri = "mongodb+srv://glamurosa_user:pOytDmXGEO0P0Cpl@cluster-glamurosa.3xckmu2.mongodb.net/?retryWrites=true&w=majority&appName=cluster-glamurosa";
const uri = "mongodb+srv://fabricio:cGZ9FWA6yeF9L7uO@cluster-glamurosa.3xckmu2.mongodb.net/?retryWrites=true&w=majority&appName=cluster-glamurosa";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,{ tls: true }, {
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