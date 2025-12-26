const express = require('express');
const cors = require('cors');
const importRoutes = require('./routes/importRoutes');
const imageRoutes = require('./routes/imageRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/import', importRoutes);

app.use('/api/images', imageRoutes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'API is running' }));

module.exports = app;