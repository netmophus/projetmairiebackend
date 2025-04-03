// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');
// const adminDashboardController = require('../controllers/adminDashboardController'); // Nouveau contrôleur

// // Route pour récupérer les statistiques des taxes collectées
// router.get('/taxes-collected', authMiddleware, roleMiddleware('admin'), adminDashboardController.getTaxesCollected);

// // Route pour récupérer les collecteurs actifs
// router.get('/active-collectors', authMiddleware, roleMiddleware('admin'), adminDashboardController.getActiveCollectors);


// // Route pour récupérer les paiements par collecteurs et zones
// router.get(
//   '/payments-summary',
//   authMiddleware,
//   roleMiddleware('admin'),
//   adminDashboardController.getPaymentsSummary
// );


// // Récupérer les contribuables par collecteur
// router.get(
//     '/contributors-by-collector',
//     authMiddleware,
//     roleMiddleware('admin'),
//     adminDashboardController.getContributorsByCollector
//   );


// module.exports = router;





const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminDashboardController = require('../controllers/adminDashboardController'); // Nouveau contrôleur

// Route pour récupérer les statistiques des taxes collectées
router.get('/taxes-collected', authMiddleware, roleMiddleware('admin'), adminDashboardController.getTaxesCollected);

// Route pour récupérer le nombre total de collecteurs actifs
router.get('/total-active-collectors', authMiddleware, roleMiddleware('admin'), adminDashboardController.getTotalActiveCollectors);

// Route pour récupérer le nombre total de contribuables actifs
// Route pour récupérer le nombre total d'utilisateurs actifs
router.get(
  '/total-active-users',
  authMiddleware, 
  roleMiddleware('admin'), 
  adminDashboardController.getTotalActiveUsers
);



// Route pour récupérer le nombre total de contribuables actifs
router.get(
  '/total-active-taxpayers',
  authMiddleware, 
  roleMiddleware('admin'), 
  adminDashboardController.getTotalActiveTaxpayers
);



// Route pour récupérer le résumé des reçus
router.get(
  '/receipts-summary',
  authMiddleware,
  roleMiddleware('admin'),
  adminDashboardController.getReceiptsSummary
);

// Route pour récupérer les paiements par collecteurs et zones
router.get(
  '/payments-summary',
  authMiddleware,
  roleMiddleware('admin'),
  adminDashboardController.getPaymentsSummary
);

// Récupérer les contribuables par collecteur
router.get(
  '/contributors-by-collector',
  authMiddleware,
  roleMiddleware('admin'),
  adminDashboardController.getContributorsByCollector
);


router.get(
  '/user-info',
  authMiddleware,
  (req, res) => {
    console.log("🔑 Récupération des informations de l'utilisateur connecté");
    res.json({
      name: req.user.name,
      phone: req.user.phone
    });
  }
);



module.exports = router;
