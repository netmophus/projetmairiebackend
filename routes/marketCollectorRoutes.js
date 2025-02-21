const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const marketCollectorController = require('../controllers/marketCollectorController');

// Create a new market collector
router.post('/', authMiddleware, roleMiddleware(['admin']), marketCollectorController.createCollector);

// Get all market collectors
router.get('/', authMiddleware, roleMiddleware(['admin', 'collector']), marketCollectorController.getCollectors);

module.exports = router;
