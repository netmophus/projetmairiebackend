const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const receiptBatchController = require('../controllers/receiptBatchController');

// Créer un nouveau lot de reçus - utilisé 
router.post('/', authMiddleware, roleMiddleware(['admin']), receiptBatchController.createReceiptBatch);

// Récupérer des lots de reçus avec uniquement les champs nécessaires
router.get('/summary', authMiddleware, roleMiddleware(['admin', 'collector']), receiptBatchController.getReceiptBatchSummary);

// Récupérer le nombre total de reçus générés (status: 'Generated')
router.get('/total-generated-receipts', authMiddleware, roleMiddleware(['admin']), receiptBatchController.getTotalGeneratedReceipts);


router.get('/active-receipts', authMiddleware, roleMiddleware(['collector']), receiptBatchController.getActiveReceiptsForCollector);

// Récupérer les reçus activés pour un marché donné
router.get('/:marketId/activated', authMiddleware, roleMiddleware(['collector']), receiptBatchController.getActivatedReceiptsByMarket);


// Récupérer tous les lots de reçus
router.get('/', authMiddleware, roleMiddleware(['admin', 'collector']), receiptBatchController.getAllReceiptBatches);





// Récupérer un lot de reçus par ID
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'collector']), receiptBatchController.getReceiptBatchById);

// Activer un lot de reçus
router.put('/:id/activate', authMiddleware, roleMiddleware(['admin']), receiptBatchController.activateReceiptBatch);



// Supprimer un lot de reçus
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), receiptBatchController.deleteReceiptBatch);



// Exporter un lot de reçus en PDF et fichier texte  - utilisé 
router.get('/:batchId/export', authMiddleware, roleMiddleware(['admin', 'collector']), receiptBatchController.exportBatch);

module.exports = router;
