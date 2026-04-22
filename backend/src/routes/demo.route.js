const express = require('express');
const { calculateDemoOrder } = require('../controllers/demo.controller');

const router = express.Router();

router.post('/order-preview', calculateDemoOrder);

module.exports = router;