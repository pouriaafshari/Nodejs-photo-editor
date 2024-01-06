const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
app.use(express.json());
app.use(cors())

const uri = "mongodb+srv://karina:hello123456@cluster0.hmwtw7f.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB when the server starts
client.connect(err => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
  console.log('Connected to MongoDB');
});

async function findUser(uname) {
  const database = client.db("react-photo-editor");
  const users = database.collection("users");
  const query = { username: uname };
  const user = await users.findOne(query);
  return user;
}

async function addUser(userData) {
  const database = client.db("react-photo-editor");
  const users = database.collection("users");

  try {
    const result = await users.insertOne(userData);
    console.log(`User added successfully with _id: ${result.insertedId}`);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error; // You might want to handle this error in a more appropriate way in your application.
  }
}

app.post('/login', async (req, res) => {
  try {
    const user = await findUser(req.body.username);
    if (!user) {
      return res.status(400).send('User not found');
    }
    return res.status(200).send('yes')
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/signup', async (req, res) => {
  const newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    premium: false,
  };
  
  try {
    const user = await findUser(req.body.username);
    if (user != null) {
      res.status(400).send('Username is taken')
      return
    }
    const insertedUserId = await addUser(newUser);
    console.log(`User added with ID: ${insertedUserId}`);
    return res.status(200).send('yes')
  } catch (error) {
    console.error("Error adding user:", error);
  }
  
})

// Handle MongoDB reconnection events
client.on('reconnect', () => {
    console.log('Reconnected to MongoDB');
  });
  
  client.on('close', () => {
    console.log('Connection to MongoDB closed');
  });
  
  client.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

// Close the MongoDB client when the server stops
process.on('SIGINT', () => {
  client.close().then(() => {
    console.log('MongoDB client disconnected');
    process.exit(0);
  });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
  
