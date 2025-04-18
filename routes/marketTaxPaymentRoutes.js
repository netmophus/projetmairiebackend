const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const marketTaxPaymentController = require('../controllers/marketTaxPaymentController');

// Create a new market tax payment
router.post('/', authMiddleware, roleMiddleware(['collector']), marketTaxPaymentController.createTaxPayment);

// Get all payments for a specific market
router.get('/:marketId', authMiddleware, roleMiddleware(['admin', 'collector']), marketTaxPaymentController.getMarketPayments);




// Route pour récupérer le rapport de collecte
router.get(
    '/admin/marketreporting/:marketId',
    authMiddleware,
    roleMiddleware(['admin']),
    marketTaxPaymentController.getMarketReport
  );

module.exports = router;
