const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const marketController = require('../controllers/marketController');

// Create a new market
router.post('/', authMiddleware, roleMiddleware(['admin']), marketController.createMarket);

// Get all markets
router.get('/', authMiddleware, roleMiddleware(['admin', 'collector']), marketController.getMarkets);


// // Récupérer les collecteurs pour un marché
// router.get('/collectors', authMiddleware, roleMiddleware(['admin']), marketController.getCollectorsForMarket);


router.get('/collector-markets', authMiddleware, roleMiddleware(['collector']), marketController.getMarketsByCollector);


// Get all collectors
router.get('/collectorss', authMiddleware, roleMiddleware(['admin']), marketController.getCollectors);


module.exports = router;
