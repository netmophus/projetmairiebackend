const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createBoutiqueModel,
  getBoutiqueModelsByMarket,
  deleteBoutiqueModel
} = require('../controllers/chefmarketBoutiqueModelController');

router.post('/', authMiddleware, roleMiddleware('chefmarket'), createBoutiqueModel);

// routes/chefMarketBoutiqueModelRoutes.js
router.get('/', authMiddleware, roleMiddleware('chefmarket'), getBoutiqueModelsByMarket);

router.delete('/:id', authMiddleware, roleMiddleware('chefmarket'), deleteBoutiqueModel);

module.exports = router;
