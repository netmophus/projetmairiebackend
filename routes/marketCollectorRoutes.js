const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const marketCollectorController = require('../controllers/marketCollectorController');
// 🔥 Pense à importer le modèle MarketCollector
const MarketCollector = require('../models/MarketCollector');




const {
    payWithTaxReceiptCode,
    getMyAssignedMarket,
    getAssignedCollectors,
    getActiveReceiptPrefix,
    getNextAvailableCode,
    verifyCollectorReceiptCode,
    getMyDailyPayments,

  } = require('../controllers/marketCollectorController');



// Create a new market collector
router.post('/', authMiddleware, roleMiddleware(['admin']), marketCollectorController.createCollector);

// Get all market collectors
router.get('/', authMiddleware, roleMiddleware(['admin', 'collector']), marketCollectorController.getCollectors);

//================================================================




// ✅ Paiement d’un reçu via code
router.post(
    '/pay-tax-receipt',
    authMiddleware,
    roleMiddleware('collector'),
    payWithTaxReceiptCode
  );



  router.get(
    '/my-market',
     authMiddleware,
    roleMiddleware('collector'),
    getMyAssignedMarket
  );

 
// Seul le chef de marché peut lister ses collecteurs
router.get(
    '/assigned-collectors',
    authMiddleware,
    roleMiddleware('chefmarket'),
    getAssignedCollectors
  );



  // ✅ Nouvelle route pour récupérer le prochain code activé
router.get(
    '/next-available-code',
    authMiddleware,
    roleMiddleware('collector'),
    getNextAvailableCode
  );



  router.get('/active-batch-prefix', authMiddleware, roleMiddleware('collector'), getActiveReceiptPrefix);


  router.get(
    '/verify-receipt-code',
    authMiddleware,
    roleMiddleware('collector'),
    verifyCollectorReceiptCode
  );


  router.get('/my-payments-today', authMiddleware, roleMiddleware('collector'), getMyDailyPayments);

  

module.exports = router;
