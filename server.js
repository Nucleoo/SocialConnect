const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));  // Similar as body parser

// Routes
app.get('/', (req, res) => res.send('Server Running'));


//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

// Serve static build in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

// Listen to Server
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));