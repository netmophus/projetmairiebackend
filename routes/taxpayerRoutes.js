// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');
// const taxpayersController = require('../controllers/taxpayersController'); // Vérifiez le chemin et le nom du fichier

// // Ajouter un contribuable
// router.post('/', authMiddleware, roleMiddleware('collector'), taxpayersController.addTaxpayer);

// // Récupérer les contribuables
// router.get('/', authMiddleware, roleMiddleware('collector'), taxpayersController.getTaxpayersByCollector);

// // Modifier un contribuable
// router.put('/:id', authMiddleware, roleMiddleware('collector'), taxpayersController.updateTaxpayer);

// // Supprimer un contribuable
// router.delete('/:id', authMiddleware, roleMiddleware('collector'), taxpayersController.deleteTaxpayer);


// // Associer des taxes à un contribuable
// router.put('/:id/associate-taxes', authMiddleware, roleMiddleware('collector'), taxpayersController.associateTaxes);


// module.exports = router;


















const express = require('express');
const router = express.Router();
const { createTaxpayer, getTaxpayers, getTaxpayersWithTaxes, searchTaxpayersByPhone, associateTaxesToTaxpayer, getOneTaxpayerWithTaxes, getPaginatedTaxpayers, dissociateTaxFromTaxpayer} = require('../controllers/taxpayerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route pour créer un contribuable (accessible uniquement aux collecteurs)
router.post('/', authMiddleware, roleMiddleware('collector'), createTaxpayer);

// Route pour récupérer tous les contribuables (accessible aux collecteurs et administrateurs)
router.get('/', authMiddleware, roleMiddleware('collector'), getTaxpayers);


// Route pour récupérer les contribuables avec leurs taxes
//router.get('/taxpayers-with-taxes', authMiddleware, roleMiddleware('collector'), getTaxpayersWithTaxes);
router.get(
  "/taxpayers-with-taxes",
  authMiddleware,
  roleMiddleware(["collector", "admin"]), // ✅ Autorise les deux rôles
  getTaxpayersWithTaxes
);


router.put('/:taxpayerId/dissociate', authMiddleware, roleMiddleware(['admin', 'collector']), dissociateTaxFromTaxpayer);


// Route pour récupérer les contribuables avec pagination et recherche
router.get(
    '/paginated',
    authMiddleware,
    roleMiddleware('admin'),
    getPaginatedTaxpayers
  );



// // Route pour associer une taxe à un contribuable (accessible au collecteur uniquement)
// router.post('/associate-tax', authMiddleware, roleMiddleware('collector'), associateTaxToTaxpayer);


// Route pour associer des taxes à un contribuable (accessible uniquement aux collecteurs)
router.put('/:taxpayerId/associate-taxes', authMiddleware, roleMiddleware('collector'), associateTaxesToTaxpayer);

// Dissocier une taxe du contribuable
router.delete('/:taxpayerId/dissociate/:taxId', authMiddleware, roleMiddleware("admin"), dissociateTaxFromTaxpayer);


router.get('/:taxpayerId/taxes', authMiddleware, getOneTaxpayerWithTaxes);


// routes/taxpayerRoutes.js
router.get('/search', authMiddleware, roleMiddleware('collector'), searchTaxpayersByPhone);

module.exports = router;
