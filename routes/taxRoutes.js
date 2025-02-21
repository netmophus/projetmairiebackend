// const express = require('express');
// const router = express.Router();
// const taxController = require('../controllers/taxController');
// const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');

// // Ajouter une taxe
// router.post('/', authMiddleware, roleMiddleware('admin'), taxController.addTax);

// // Récupérer toutes les taxes
// router.get('/', authMiddleware, taxController.getAllTaxes);

// // Modifier une taxe
// router.put('/:id', authMiddleware, roleMiddleware('admin'), taxController.updateTax);

// // Supprimer une taxe
// router.delete('/:id', authMiddleware, roleMiddleware('admin'), taxController.deleteTax);

// module.exports = router;





const express = require('express');
const router = express.Router();
const { createTax, getAllTaxes, updateTax, deleteTax } = require('../controllers/taxController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route pour créer une taxe (accessible uniquement aux administrateurs)
router.post('/', authMiddleware, roleMiddleware('admin'), createTax);


router.get('/', authMiddleware, roleMiddleware(['admin', 'collector']), getAllTaxes);


// Route pour mettre à jour une taxe (accessible uniquement aux administrateurs)
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateTax);

// Route pour supprimer une taxe (accessible uniquement aux administrateurs)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteTax);

module.exports = router;
