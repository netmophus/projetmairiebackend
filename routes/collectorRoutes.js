
const express = require('express');
const router = express.Router();
const { addCollector, getCollectors, updateCollector } = require('../controllers/collectorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route pour créer un collecteur (accessible uniquement aux administrateurs)
router.post('/', authMiddleware, roleMiddleware('admin'), addCollector);

// Route pour récupérer tous les collecteurs
router.get('/', authMiddleware, roleMiddleware('admin'), getCollectors);

// Route pour mettre à jour un collecteur
router.put('/collectors/:id', authMiddleware, roleMiddleware('admin'), updateCollector);

module.exports = router;


