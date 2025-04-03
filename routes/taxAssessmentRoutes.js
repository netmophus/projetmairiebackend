const express = require('express');
const router = express.Router();
const taxAssessmentController = require('../controllers/taxAssessmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// 🔹 Créer un avis d’imposition pour un contribuable (réservé aux collecteurs)
router.post('/create', authMiddleware, roleMiddleware('collector'), taxAssessmentController.createTaxAssessment);

// 🔹 Récupérer l'avis d'imposition d'un contribuable (réservé aux collecteurs)
router.get('/:taxpayerId', authMiddleware, roleMiddleware('collector'), taxAssessmentController.getTaxAssessmentByTaxpayer);

// 🔹 Mettre à jour un avis d'imposition (ex: ajout d’une nouvelle taxe, réservé aux collecteurs)
router.put('/update/:assessmentId', authMiddleware, roleMiddleware('collector'), taxAssessmentController.updateTaxAssessment);

// 🔹 Supprimer un avis d'imposition (réservé aux collecteurs)
router.delete('/delete/:assessmentId', authMiddleware, roleMiddleware('collector'), taxAssessmentController.deleteTaxAssessment);

// 🔹 Récupérer tous les avis d’imposition (réservé aux collecteurs)
router.get('/', authMiddleware, roleMiddleware('collector'), taxAssessmentController.getAllTaxAssessments);

// ✅ Nouvelle Route : Récupérer les taxes d'un contribuable pour une année donnée
router.get('/taxpayer-taxes/:taxpayerId', authMiddleware, roleMiddleware('collector'), taxAssessmentController.getTaxpayerTaxesByYear);



module.exports = router;
