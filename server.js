const express = require('express');
const connectDB = require('./config/db');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Routes
app.get('/', (req, res) => res.send('Server Running'));


//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

// Listen to Server
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));