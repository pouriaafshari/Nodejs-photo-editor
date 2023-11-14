const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
app.use(express.json())

const users = []

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/register', async (req, res) => {
    try {
        // Check if the username already exists
        if (users.some(user => user.username === req.body.username)) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        // Modify user object to include "username" and "email"
        const user = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        }

        users.push(user)
        res.status(201).send()
    } catch {
        res.status(500).send();
    }
})

app.post('/login', async (req, res) => {
    const user = users.find(user => user.username === req.body.username)
    if (user == null) {
        res.status(400).send('User not found')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success')
        } else {
            res.send('Wrong Password')
        }
    } catch {
        res.status(500).send();
    }
})

app.listen(3000)
