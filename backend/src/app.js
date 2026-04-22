const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.route');
const demoRoutes = require('./routes/demo.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/demo', demoRoutes);

module.exports = app;