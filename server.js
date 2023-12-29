const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://karina:hello123456@cluster0.hmwtw7f.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function findUser(uname) {
    try {
        // Get the database and collection on which to run the operation
        const database = client.db("react-photo-editor");
        const users = database.collection("users");
        // Query for a movie that has the title 'The Room'
        const query = { username: uname };
        // Execute query
        const user = await users.findOne(query)
        return user;
    } finally {
        await client.close();
    }
}

run("poorei").catch(console.dir);




// Define a Mongoose schema for users
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});


app.post('/register', async (req, res) => {
    try {
        // Check if the username already exists in the database
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user instance based on the Mongoose model
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();
        res.status(201).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        // Find the user in the database by username
        const user = await findUser(req.body.username);
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (passwordMatch) {
            res.send('Success');
        } else {
            res.send('Wrong Password');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(3000, () => {
    console.log("It's on");
});
