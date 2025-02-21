const express = require('express');
const router = express.Router();
const taxpayersDashboardController = require('../controllers/taxpayersDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
    '/payment-history',
    (req, res, next) => {
      console.log('Requête reçue sur la route "/payment-history"');
      next();
    },
    authMiddleware,
    roleMiddleware('contribuable'),
    taxpayersDashboardController.getPaymentHistory
  );
  
   
module.exports = router;
