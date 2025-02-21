const express = require('express');
const router = express.Router();
const adminStaticsController = require('../controllers/adminStaticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route pour récupérer les statistiques des marchés
router.get(
  '/statistics',
  authMiddleware, // Vérifie si l'utilisateur est authentifié
  roleMiddleware(['admin']), // Autorise uniquement les administrateurs
  adminStaticsController.getMarketStatistics // Appelle la méthode du contrôleur
);



  router.get(
    "/markets/stats/:marketId",
    authMiddleware, // Vérifie si l'utilisateur est authentifié
    roleMiddleware(["admin"]), // Autorise uniquement les administrateurs
    adminStaticsController.getMarketStatisticsById
  );
  


// Route pour récupérer les statistiques des marchés et créer les cartes
router.get(
    "/markets/cards",
    authMiddleware, // Vérifie si l'utilisateur est authentifié
    roleMiddleware(["admin"]), // Restreint l'accès uniquement aux administrateurs
    adminStaticsController.getMarketStatsCardCreated
  );



  // Route pour récupérer le reporting des paiements pour un marché
router.get(
  "/markets/state-report/:marketId",
  authMiddleware, // Vérifie si l'utilisateur est authentifié
  roleMiddleware(["admin"]), // Autorise uniquement les administrateurs
  adminStaticsController.getMarketStateReport // Appelle la méthode du contrôleur
);
  

module.exports = router;
