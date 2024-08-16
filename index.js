const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5173', 'https://scic-job-task-tushin.web.app'],
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.mj6vep2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

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
    // await client.connect();`

    // Collection ID
    const database = client.db("SCIC_Task");
    const productCollection = database.collection("product");
    const userCollection = database.collection("User");

    
    app.get('/api/products', async (req, res) => {
      try {
        const page = parseInt(req.query.page, 10) || 0; // Default to 0 if page is not provided
        const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if limit is not provided
    
        // Ensure page and limit are valid numbers
        if (page < 0 || limit <= 0) {
          return res.status(400).json({ message: 'Invalid page or limit values' });
        }
    
        // Count total products
        const totalProducts = await productCollection.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
    
        // Fetch products with pagination
        const products = await productCollection
          .find()
          .skip(page * limit)
          .limit(limit)
          .toArray(); // Use toArray() instead of forEach() for better handling
    
        res.status(200).json({ products, totalProducts, totalPages });
      } catch (err) {
        res.status(500).json({ message: 'Error fetching products', err });
      }
    });
    


    // Create a new user
    app.post('/api/users', async (req, res) => {
      try {
        const { email, name, imageUrl } = req.body;

        // Validate input fields
        if (!email || !name || !imageUrl) {
          return res.status(400).json({ message: 'Email, name, and imageUrl are required' });
        }

        const newUser = { email, name, imageUrl };

        const result = await userCollection.insertOne(newUser);
        res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
      } catch (err) {
        res.status(500).json({ message: 'Error creating user', err });
      }
    });

    // Get User Information
    app.get('/api/users/:email', async (req, res) => {
      try {
        const { email } = req.params;

        // Validate email input
        if (!email) {
          return res.status(400).json({ message: 'Email is required' });
        }

        const user = await userCollection.findOne({ email });

        if (user) {
          res.json(user);
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (err) {
        res.status(500).json({ message: 'Error fetching user', err });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('SCIC Job Task Is Running')
})

app.listen(port, () => {
  console.log(`SCIC Job Task Is Running On Port ${port}`)
})
