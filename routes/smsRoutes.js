// backend/routes/smsRoutes.js

const express = require('express');
const router = express.Router();
const { sendSmsNotification } = require('../controllers/smsController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔥 Import du middleware

// Route pour envoyer un SMS avec le middleware d'authentification
router.post('/send', authMiddleware, sendSmsNotification);

module.exports = router;

