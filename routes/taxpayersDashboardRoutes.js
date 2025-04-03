// 📌 Importation des modules nécessaires
const express = require('express');
const router = express.Router();
const taxpayersDashboardController = require('../controllers/taxpayersDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Payment = require('../models/Payment');

// 📌 Route pour l'historique des paiements
router.get(
    '/payment-history',
    (req, res, next) => {
        console.log('📥 Requête reçue sur /payment-history');
        next();
    },
    authMiddleware,
    roleMiddleware(['contribuable']), // 🔒 Accès réservé aux contribuables
    taxpayersDashboardController.getPaymentHistory
);


router.get(
  '/total-due',
  authMiddleware,
  roleMiddleware(['contribuable']),
  taxpayersDashboardController.getTotalDue
);


router.get(
  '/total-monthly-annual-due',
  authMiddleware,
  roleMiddleware(['contribuable']),
  taxpayersDashboardController.getTotalMonthlyAndAnnualDue
);


// ✅ Route pour obtenir le montant total payé
router.get(
  '/total-paid',
  authMiddleware,
  roleMiddleware('contribuable'),
  taxpayersDashboardController.getTotalPaid
);


router.get(
  '/user-info',
  authMiddleware,
  (req, res) => {
    console.log("🔑 Récupération des informations de l'utilisateur connecté (Contribuable)");
    res.json({
      name: req.user.name,
      phone: req.user.phone
    });
  }
);




// routes/taxpayers-dashboard.js

// router.get(
//   '/payment-history',
//   authMiddleware,
//   async (req, res) => {
//     try {
//       // 🔥 Double populate pour accéder à name et phone dans User
//       const payments = await Payment.find({ taxpayer: req.user.taxpayerId })
//         .populate({
//           path: 'collector', // On accède d'abord à Collector depuis Payment
//           populate: {
//             path: 'user', // Puis on accède à User depuis Collector
//             select: 'name phone', // On sélectionne le nom et le téléphone
//             model: 'User'
//           }
//         })
//         .populate('tax', 'name'); // Optionnel pour avoir le nom de la taxe

//       console.log('✅ Paiements trouvés :', payments);
//       res.json({ payments });
//     } catch (err) {
//       console.error('Erreur lors de la récupération des paiements:', err.message);
//       res.status(500).json({ message: 'Erreur serveur.' });
//     }
//   }
// );





// ✅ Route pour les détails par taxe
router.get(
  '/tax-details',
  authMiddleware,
  roleMiddleware(['contribuable']),
  taxpayersDashboardController.getTaxDetails  // 👉 Assure-toi d'avoir cette méthode dans ton contrôleur
);



module.exports = router;
