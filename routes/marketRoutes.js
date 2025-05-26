// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');
// const marketController = require('../controllers/marketController');

// // Create a new market
// router.post('/', authMiddleware, roleMiddleware(['admin']), marketController.createMarket);


// // Mise à jour des collecteurs d'un marché
// //router.put('/markets/:marketId/collectors', authMiddleware, roleMiddleware(['admin']), marketController.updateMarketCollectors);
// router.put('/:marketId/collectors', authMiddleware, roleMiddleware(['admin']), marketController.updateMarketCollectors);


// // Get all markets
// router.get('/', authMiddleware, roleMiddleware(['admin', 'collector']), marketController.getMarkets);


// router.get('/collector-markets', authMiddleware, roleMiddleware(['collector']), marketController.getMarketsByCollector);


// // Get all collectors
// router.get('/collectorss', authMiddleware, roleMiddleware(['admin']), marketController.getCollectors);




// module.exports = router;




const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const marketController = require('../controllers/marketController');

// 📌 1. Créer un marché (ADMIN uniquement)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  marketController.createMarket
);

// 📌 2. Mettre à jour un marché (nom, localisation, statut, etc.)
router.put(
  '/:marketId',
  authMiddleware,
  roleMiddleware(['admin']),
  marketController.updateMarket
);

// 📌 3. Récupérer tous les marchés (ADMIN ou COLLECTOR)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'collector']),
  marketController.getMarkets
);

// 📌 4. Associer un chef de marché à un marché
router.put(
  '/:marketId/assign-chef',
  authMiddleware,
  roleMiddleware(['admin']),
  marketController.assignChefToMarket
);

// 📌 5. Dissocier le chef de marché d’un marché
router.put(
  '/:marketId/remove-chef',
  authMiddleware,
  roleMiddleware(['admin']),
  marketController.removeChefFromMarket
);

// 📌 6. (Optionnel) Liste des marchés liés à un collecteur
router.get(
  '/collector-markets',
  authMiddleware,
  roleMiddleware(['collector']),
  marketController.getMarketsByCollector
);

// 📌 7. (Optionnel) Liste de tous les collecteurs (admin)
router.get(
  '/collectorss',
  authMiddleware,
  roleMiddleware(['admin']),
  marketController.getCollectors
);

module.exports = router;
