// unpaidRoutes.js
const express = require('express');
const router = express.Router();
const { getUnpaidTaxes, payUnpaidTax , getUnpaidTaxReceipt} = require('../controllers/unpaidController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route pour récupérer tous les impayés d'un collecteur
router.get('/', authMiddleware, roleMiddleware(['collector', 'admin']), getUnpaidTaxes);

// Route pour effectuer un paiement d'impayé
router.post('/pay', authMiddleware, roleMiddleware(['collector']), payUnpaidTax);

// Route pour récupérer les détails de l'impayé pour générer le reçu PDF
router.get('/receipt/:unpaidTaxId', authMiddleware, roleMiddleware(['collector']), getUnpaidTaxReceipt);

module.exports = router;
