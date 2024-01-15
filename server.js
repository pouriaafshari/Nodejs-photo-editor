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

async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
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

    // Compare the entered password with the hashed password stored in the database
    const passwordMatch = await comparePasswords(req.body.password, user.password);

    if (passwordMatch) {
      return res.status(200).send('Login successful');
    } else {
      return res.status(400).send('Invalid password');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/signup', async (req, res) => {
  const newUser = {
    username: req.body.username,
    email: req.body.email,
    premium: false,
  };

  try {
    // Check if the username is already taken
    const existingUser = await findUser(req.body.username);
    if (existingUser) {
      res.status(400).send('Username is taken');
      return;
    }

    // Hash the password with an explicit salt before storing it in the database
    const hashedPassword = await hashPassword(req.body.password);
    newUser.password = hashedPassword;

    const insertedUserId = await addUser(newUser);
    console.log(`User added with ID: ${insertedUserId}`);
    return res.status(200).send('User registered successfully');
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send(error.message);
  }
});

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
  
