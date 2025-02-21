


// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');
// const paymentController = require('../controllers/paymentController');

// // Route pour enregistrer un paiement

// // Route pour créer un paiement
// router.post(
//   '/taxpayer-payments', // Le chemin que le frontend appelle
//   authMiddleware,
//   roleMiddleware('collector'),
//   paymentController.createPayment
// );


// router.get(
//   '/taxpayers-with-taxes',
//   authMiddleware, // Vérifie l'authentification
//   roleMiddleware('collector'), // Vérifie que l'utilisateur est un collecteur
//   paymentController.getTaxpayersWithTaxes // Appelle le contrôleur pour récupérer les données
// );


// router.get(
//   '/collector',
//   authMiddleware,
//   roleMiddleware('collector'),
//   paymentController.getPaymentsByCollector
// );


// router.get(
//   '/taxpayer/:taxpayerId/payment-list',
//   authMiddleware,
//   roleMiddleware('collector'),
//   paymentController.getPaymentListByTaxpayer
// );

// // Route pour récupérer les informations du contribuable et les paiements
// router.get(
//   '/taxpayer/:taxpayerId/payment-details',
//   authMiddleware,
//   roleMiddleware('collector'),
//   paymentController.getPaymentDetailsByTaxpayer
// );


// router.get(
//   '/taxpayer/:taxpayerId/payment-details',
//   authMiddleware,
//   roleMiddleware('collector'),
//   paymentController.getPaymentDetailsByTaxpayer
// );


// module.exports = router;













const express = require('express');
const { addPayment, getPayments, addMarketTaxPayment, addOccupationPayment, getPaymentReceipt, getTaxpayers,   getPaymentsSummary} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

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

