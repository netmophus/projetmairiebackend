








const express = require('express');
const { addUnpaidPayment, addPayment, getPayments, addMarketTaxPayment, addOccupationPayment, getPaymentReceipt, getTaxpayers,   getPaymentsSummary} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/unpaid', authMiddleware, roleMiddleware("collector"), addUnpaidPayment);


// Route pour enregistrer un paiement pour les taxes de marché
// router.post('/taxmarket', authMiddleware, roleMiddleware('collector'), addMarketTaxPayment);
router.post('/taxmarket', addMarketTaxPayment);

// Route pour ajouter un paiement
router.post('/', authMiddleware, roleMiddleware('collector'), addPayment);


// Route pour enregistrer un paiement pour la taxe d'occupation du domaine public
router.post('/occupation', authMiddleware, roleMiddleware('collector'), addOccupationPayment);

router.get('/paginated', authMiddleware, getTaxpayers);


// Route pour récupérer les paiements
router.get('/', authMiddleware, getPayments);



// Route pour récupérer les détails d'un paiement pour générer le reçu PDF
router.get('/:paymentId/receipt', authMiddleware, getPaymentReceipt);


// Route pour récupérer les paiements filtrés par mois et année
router.get('/payments-summary', authMiddleware, roleMiddleware(['admin']), getPaymentsSummary);



module.exports = router;

