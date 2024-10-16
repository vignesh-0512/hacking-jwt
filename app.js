const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Hardcoded users
const users = [
    { username: 'user', password: 'password', isAdmin: false },
    { username: 'admin', password: 'adminpass', isAdmin: true },
];

// Use your specified secret key here
const secretKey = 'd0f63c78a828fe1763b7f6a7c43f47466d287f363e84e5d01b1e1c2f92023066'; // Generated secret key

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Generate JWT token with 'iat' and 'exp' claims
        const token = jwt.sign(
            { username: user.username, isAdmin: user.isAdmin },
            secretKey,
            { expiresIn: '1h' } // Token expiration time
        );

        // Set the token in a cookie
        res.cookie('jwt', token, { httpOnly: true });
        return res.redirect('/welcome');
    }
    res.send('Invalid credentials');
});

// Welcome page
app.get('/welcome', (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.send('You need to log in!');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.send('Token is not valid');

        const username = decoded.isAdmin ? 'Admin' : 'User';
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .container {
                        background-color: white;
                        padding: 2rem;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        width: 300px;
                    }
                    h1 {
                        margin-bottom: 1.5rem;
                        color: #333;
                    }
                    a {
                        display: inline-block;
                        margin-top: 1rem;
                        padding: 0.5rem 1rem;
                        background-color: #007BFF;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                        transition: background-color 0.3s;
                    }
                    a:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Welcome, ${username}!</h1>
                    <a href="/admin">Go to Admin Page</a>
                </div>
            </body>
            </html>
        `);
    });
});

// Admin route
app.get('/admin', (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.send('You need to log in!');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err || !decoded.isAdmin) return res.send('Access denied');

        // Display flag
        res.send('<h1>Admin Page</h1><p>Flag: CTF{Congratulations_on_getting_admin_access}</p>');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
