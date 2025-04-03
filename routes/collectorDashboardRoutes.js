const express = require('express');
const router = express.Router();
const collectorDashboardController = require('../controllers/collectorDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route pour récupérer le total collecté
router.get('/total-collected', authMiddleware, roleMiddleware('collector'), collectorDashboardController.getTotalCollected);


// Route pour récupérer le nombre de taxes créées
router.get('/taxes-created', authMiddleware, roleMiddleware('collector'), collectorDashboardController.getTaxesCreated);

// Route pour récupérer le nombre de contribuables actifs
router.get('/active-taxpayers', authMiddleware, roleMiddleware('collector'), collectorDashboardController.getActiveTaxpayers);


router.get('/taxpayers-due-date', authMiddleware, collectorDashboardController.getTaxpayersWithDueDate);


router.get('/recent-payments', authMiddleware, roleMiddleware('collector'), collectorDashboardController.getRecentPayments);


router.get('/overdue-payments', authMiddleware, roleMiddleware('collector'), collectorDashboardController.getOverduePayments);


// Route pour récupérer les contribuables pour notification
router.get('/taxpayers-for-notification', authMiddleware, collectorDashboardController.getTaxpayersForNotification);

// ✅ Route pour envoyer des notifications par SMS
router.post('/send-notification', authMiddleware, roleMiddleware('collector'), collectorDashboardController.sendNotification);


router.get(
    '/user-info',
    authMiddleware,
    (req, res) => {
      console.log("🔑 Récupération des informations de l'utilisateur connecté (Collecteur)");
      res.json({
        name: req.user.name,
        phone: req.user.phone
      });
    }
  );


  router.get('/active-receipts', authMiddleware, roleMiddleware('collector'), collectorDashboardController.getActiveReceipts);

  
module.exports = router;
