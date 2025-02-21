const express = require('express');
const router = express.Router();
const { createZone, getAllZones } = require('../controllers/zoneController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route pour créer une zone (accessible uniquement aux administrateurs)
router.post('/', authMiddleware, roleMiddleware('admin'), createZone);

// Route pour récupérer toutes les zones
router.get('/', authMiddleware, getAllZones);

module.exports = router;
