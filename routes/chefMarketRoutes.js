

const express = require('express');
const router = express.Router();
const {
  createChefmarketCollector,
  getChefmarketCollectors,
  updateChefmarketCollector,
  toggleChefmarketCollectorStatus,
  deleteChefmarketCollector,
  // getChefmarketMarket,
  // createChefmarketMarket,
  // updateChefmarketMarket,
  linkCollectorsToMarket,
  getAssignedCollectors,
  unlinkCollectorsFromMarket,
  createBoutiqueByChefmarket,
  getBoutiquesByChefmarket,
  updateBoutiqueByChefmarket,
  createCommercant,
  getCommercantsByMarket,
  assignBoutiqueToCommercant,
  getAssignedBoutiquesWithCommercants,
  unlinkBoutiqueFromCommercant,
  generateMonthlyLocationPayments,
  addLocationPayment,
  getPaiementsLocation,
  getChefMarketProfile,
  getPaiementsByPeriod,
  getAllPaiementsForChefMarket,
  getPaiementsSummary,
  getBoutiquesByOccupation,
  generateTaxMarketReceipts,
  getReceiptBatchesByChef,
  activateReceiptBatch,
  isMarketCollector,
   getAllChefMarkets,
   getMyMarket,
   updateMyMarket,

} = require('../controllers/chefMarketController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware'); // le chemin dépend de ton projet
const MarketCollector = require('../models/MarketCollector'); // ajoute si pas déjà importé





router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
 getAllChefMarkets
);

// ✅ Collectors

router.post(
  '/boutiques',
  authMiddleware,
  roleMiddleware('chefmarket'),
  upload.single('photo'), // 🟢 très important
  createBoutiqueByChefmarket
);




// Pour le chef de marché qui crée un collecteur
router.post(
  '/collectors',
  authMiddleware,
  roleMiddleware('chefmarket'),
  createChefmarketCollector
);


router.get('/collectors', authMiddleware, roleMiddleware('chefmarket'), getChefmarketCollectors);
router.put('/collectors/:id', authMiddleware, roleMiddleware('chefmarket'), updateChefmarketCollector);
router.put('/collectors/:id/status', authMiddleware, roleMiddleware('chefmarket'), toggleChefmarketCollectorStatus);
router.delete('/collectors/:id', authMiddleware, roleMiddleware('chefmarket'), deleteChefmarketCollector);

// // ✅ Market management
//  router.get('/my-market', authMiddleware, roleMiddleware('chefmarket'), getChefmarketMarket);

// router.put('/my-market/:id', authMiddleware, roleMiddleware('chefmarket'), updateChefmarketMarket);
// router.post('/my-market', authMiddleware, roleMiddleware('chefmarket'), createChefmarketMarket);

// Récupérer le marché du chef connecté
router.get('/my-market', authMiddleware, roleMiddleware(['chefmarket']), getMyMarket);

// Mettre à jour son marché
router.put('/my-market', authMiddleware, roleMiddleware(['chefmarket']), updateMyMarket);

router.post(
    '/assign-collectors',
    authMiddleware,
    roleMiddleware('chefmarket'),
    linkCollectorsToMarket
  );


  router.get(
    '/assigned-collectors',
    authMiddleware,
    roleMiddleware('chefmarket'),
    getAssignedCollectors
  );
  
  router.post(
  '/unlink-collectors',
  authMiddleware,
  roleMiddleware('chefmarket'),
  unlinkCollectorsFromMarket
);





router.put(
    '/boutiques/:id',
    authMiddleware,
    roleMiddleware('chefmarket'),
    upload.single('photo'),
    updateBoutiqueByChefmarket
  );
  


  router.get(
    '/boutiques',
    authMiddleware,
    roleMiddleware('chefmarket'),
    getBoutiquesByChefmarket
  );



  // ✅ Route pour créer un commerçant
router.post(
    '/commercants',
    authMiddleware,
    roleMiddleware('chefmarket'),
    upload.single('idDocument'), // le champ du fichier
    createCommercant
  );



  router.get(
    '/commercants',
    authMiddleware,
    roleMiddleware('chefmarket'),
    getCommercantsByMarket
  );
  
  
  router.post(
    '/assign-boutique',
    authMiddleware,
    roleMiddleware('chefmarket'),
    assignBoutiqueToCommercant
  );

  router.get(
    '/assigned-boutiques',
    authMiddleware,
    roleMiddleware('chefmarket'),
    getAssignedBoutiquesWithCommercants
  );



  router.put(
    '/unlink-boutique/:boutiqueId',
    authMiddleware,
    roleMiddleware('chefmarket'),
    unlinkBoutiqueFromCommercant
  );
  
  
  router.post(
    '/generate-location-payments',
    authMiddleware,
    roleMiddleware('chefmarket'),
    generateMonthlyLocationPayments
  );


  router.post(
    '/add-location-payment',
    authMiddleware,
    roleMiddleware('chefmarket'),
    addLocationPayment
  );
  
  
  router.get(
    '/paiements-location',
    authMiddleware,
    roleMiddleware('chefmarket'),
    getPaiementsLocation
  );


  router.get('/profile',  authMiddleware, getChefMarketProfile);


  router.get('/paiements-location', authMiddleware, roleMiddleware('chefmarket'), getPaiementsByPeriod);
  

  router.get('/paiements-location/all', authMiddleware, roleMiddleware('chefmarket'), getAllPaiementsForChefMarket);

  router.get('/paiements-location/summary', authMiddleware, roleMiddleware('chefmarket'), getPaiementsSummary);

  router.get('/boutiques', authMiddleware, roleMiddleware('chefmarket'), getBoutiquesByOccupation);



  router.post( '/generate-tax-receipts',  authMiddleware, roleMiddleware('chefmarket'), generateTaxMarketReceipts );

  router.get(
    '/receipt-batches',
    authMiddleware,
    roleMiddleware('chefmarket'),
    getReceiptBatchesByChef
  );


  router.put(
    '/activate-receipt-batch/:batchId',
    authMiddleware,
    roleMiddleware('chefmarket'),
    activateReceiptBatch
  );




// Pour un collecteur qui se connecte
router.get(
  '/is-market-collector',
  authMiddleware,
  roleMiddleware('collector'),
  isMarketCollector
);
  


module.exports = router;
