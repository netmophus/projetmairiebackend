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


router.get('/recent-payments', authMiddleware, roleMiddleware('collector'), collectorDashboardController.getRecentPayments);


router.get('/overdue-payments', authMiddleware, roleMiddleware('collector'), collectorDashboardController.getOverduePayments);

module.exports = router;
