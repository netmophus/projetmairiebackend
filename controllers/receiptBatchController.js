const ReceiptBatch = require('../models/ReceiptBatch');
const Market = require('../models/Market');
const MarketCollector = require('../models/MarketCollector');


exports.createReceiptBatch = async (req, res) => {
  try {
    console.log('📥 Données reçues pour la création du lot :', req.body);

    const { market, startReceipt, endReceipt } = req.body;

    // Validation des champs requis
    if (!market || !startReceipt || !endReceipt) {
      console.error('❌ Champs requis manquants.');
      return res.status(400).json({ message: 'Tous les champs sont requis : marché, reçus début et fin.' });
    }

    // Vérification du marché
    const existingMarket = await Market.findById(market).populate('collector', 'name phone');
    if (!existingMarket) {
      console.error(`❌ Le marché avec l'ID ${market} est introuvable.`);
      return res.status(404).json({ message: 'Marché introuvable.' });
    }

    if (!existingMarket.collector) {
      console.error(`❌ Aucun collecteur n'est assigné au marché ${market}.`);
      return res.status(400).json({ message: "Aucun collecteur n'est assigné à ce marché." });
    }

    console.log('✅ Marché trouvé avec collecteur :', existingMarket.collector);

    // Validation de la plage de reçus
    const start = parseInt(startReceipt.replace('R', ''), 10);
    const end = parseInt(endReceipt.replace('R', ''), 10);

    if (isNaN(start) || isNaN(end) || start > end) {
      console.error('❌ Numéros de reçus invalides ou hors plage.');
      return res.status(400).json({ message: 'Les numéros de reçus sont invalides ou la plage est incorrecte.' });
    }

    // Génération des codes de confirmation
    // const confirmationCodes = [];
    // for (let i = start; i <= end; i++) {
    //   confirmationCodes.push({
    //     receipt: `R${String(i).padStart(5, '0')}`,
    //     code: Math.floor(100 + Math.random() * 900).toString(), // Code aléatoire à 3 chiffres
    //   });
    // }


    const confirmationCodes = [];
    for (let i = start; i <= end; i++) {
  confirmationCodes.push({
    receipt: `R${String(i).padStart(5, '0')}`,
    code: Math.floor(100 + Math.random() * 900).toString(),
    status: "Generated", // 🔥 Assurez-vous que le statut par défaut est bien "Generated"
  });
}

    console.log('✅ Codes de confirmation générés :', confirmationCodes);

    // Création du lot de reçus
    const receiptBatch = new ReceiptBatch({
      market,
      collector: existingMarket.collector._id,
      startReceipt,
      endReceipt,
      confirmationCodes,
      status: 'Generated', // Respect du modèle
    });

    await receiptBatch.save();

    console.log('✅ Lot de reçus créé avec succès :', receiptBatch);
    res.status(201).json({
      message: 'Lot de reçus créé avec succès.',
      receiptBatch,
    });
  } catch (err) {
    console.error('❌ Erreur lors de la création du lot de reçus :', err);
    res.status(500).json({ 
      message: 'Erreur interne du serveur.',
      error: err.message,
    });
  }
};

  

  exports.getReceiptBatchSummary = async (req, res) => {
    try {
        console.log('➡️ Début de la récupération des lots de reçus...');
    
        // Récupérer les lots de reçus avec les informations des marchés et des collecteurs
        const receiptBatches = await ReceiptBatch.find()
        .populate('market', 'name location') // Inclure nom et localisation du marché
        .populate('collector', 'name'); // Inclure le nom du collecteur
        console.log('📥 Lots de reçus récupérés depuis la base de données :', receiptBatches);
    
        res.status(200).json(receiptBatches);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des reçus :', error.message);
        console.error('🛑 Stack de l\'erreur :', error.stack); // Log de la pile d'erreurs pour plus de détails
        res.status(500).json({ message: 'Erreur interne du serveur.' });
      }
  };
  
  
  
  

// Récupérer tous les lots de reçus
exports.getAllReceiptBatches = async (req, res) => {
  try {
    const receiptBatches = await ReceiptBatch.find()
      .populate('market', 'name location')
      .populate('collector', 'name phone');
    res.status(200).json(receiptBatches);
  } catch (err) {
    console.error('Erreur lors de la récupération des lots de reçus :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};








exports.getReceiptBatchById = async (req, res) => {
  const { id } = req.params;
  console.log("📥 Requête reçue pour récupérer le batch avec ID :", id);

  try {
    const batch = await ReceiptBatch.findById(id)
      .populate('market', 'name location') // Inclut nom et localisation du marché
      .populate('collector', 'name'); // Inclut le collecteur

    if (!batch) {
      console.log("❌ Aucun batch trouvé pour cet ID :", id);
      return res.status(404).json({ message: "Lot non trouvé" });
    }

    console.log("✅ Lot trouvé :", JSON.stringify(batch, null, 2));
    return res.json(batch); // Retourne les données directement
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du batch :", error.message);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};


exports.getTotalGeneratedReceipts = async (req, res) => {
  console.log("📥 Début de la récupération du nombre de reçus générés...");

  try {
    // Filtrer les reçus avec le statut "Generated"
    const totalGeneratedReceipts = await ReceiptBatch.countDocuments({ status: "Generated" });

    console.log("📊 Nombre total de reçus générés trouvés :", totalGeneratedReceipts);

    res.status(200).json({ totalGeneratedReceipts });
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des reçus générés :", err.message);
    res.status(500).json({ message: "Erreur lors de la récupération des reçus générés." });
  }
};


exports.activateReceiptBatch = async (req, res) => {
  try {
    console.log("📥 Requête reçue pour activer le lot de reçus avec ID :", req.params.id);

    const { id } = req.params;

    // Rechercher le lot de reçus par ID
    const receiptBatch = await ReceiptBatch.findById(id);

    if (!receiptBatch) {
      console.error("❌ Lot de reçus introuvable pour l'ID :", id);
      return res.status(404).json({ message: 'Lot de reçus introuvable.' });
    }

    if (receiptBatch.status === 'Activated') {
      console.warn("⚠️ Ce lot de reçus est déjà activé :", id);
      return res.status(400).json({ message: 'Ce lot de reçus est déjà activé.' });
    }

    console.log("🔍 Lot de reçus trouvé :", receiptBatch);

    // Mise à jour du statut des reçus individuels
    receiptBatch.confirmationCodes.forEach((receipt) => {
      receipt.status = 'Activated';
    });

    // Mise à jour du statut du lot
    receiptBatch.status = 'Activated';
    receiptBatch.activatedAt = new Date(); // Date d'activation
    receiptBatch.activatedBy = req.user.id; // ID de l'utilisateur connecté

    await receiptBatch.save();

    console.log("✅ Lot de reçus activé avec succès :", receiptBatch);

    res.status(200).json({ message: 'Lot de reçus activé avec succès.', receiptBatch });
  } catch (err) {
    console.error("❌ Erreur lors de l’activation du lot de reçus :", err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};




exports.getActivatedReceiptsByMarket = async (req, res) => {
  try {
    const { marketId } = req.params;

    // Log: ID du marché reçu
    console.log("📥 Requête pour les reçus activés du marché ID :", marketId);

    // Vérification de la validité de l'ID du marché
    if (!marketId) {
      console.error("❌ ID du marché manquant dans la requête.");
      return res.status(400).json({ message: 'ID du marché requis.' });
    }

    // Requête pour trouver les reçus activés pour le marché donné
    const receipts = await ReceiptBatch.find({
      market: marketId,
      status: 'Activated',
    })
      .select('market collector startReceipt endReceipt confirmationCodes status activatedAt') // Sélectionner uniquement les champs nécessaires
      .populate('market', 'name location') // Inclure les détails du marché
      .populate('collector', 'name phone'); // Inclure les détails du collecteur

    // Log: Résultat de la requête
    console.log("🔍 Résultat des reçus activés :", receipts);

    // Vérification si aucun reçu n'est trouvé
    if (!receipts.length) {
      console.warn("⚠️ Aucun reçu activé trouvé pour ce marché :", marketId);
      return res.status(404).json({ message: 'Aucun reçu activé trouvé pour ce marché.' });
    }

    // Filtrer pour retourner uniquement les reçus non utilisés
    const filteredReceipts = receipts.map((batch) => {
      const unusedReceipts = batch.confirmationCodes.filter(
        (code) => code.status === 'Activated'
      );

      return {
        _id: batch._id,
        market: batch.market,
        collector: batch.collector,
        startReceipt: batch.startReceipt,
        endReceipt: batch.endReceipt,
        status: batch.status,
        activatedAt: batch.activatedAt,
        confirmationCodes: unusedReceipts, // Inclure uniquement les reçus non utilisés
      };
    });

    // Vérifier si après le filtrage il reste des reçus activés
    const hasReceipts = filteredReceipts.some(
      (batch) => batch.confirmationCodes.length > 0
    );

    if (!hasReceipts) {
      console.warn("⚠️ Aucun reçu activé disponible pour ce marché après filtrage.");
      return res.status(404).json({ message: 'Aucun reçu activé disponible pour ce marché.' });
    }

    // Log: Réponse avant envoi
    console.log("✅ Reçus activés disponibles :", filteredReceipts);
    res.status(200).json({ receipts: filteredReceipts });
  } catch (error) {
    // Log: Erreur du serveur
    console.error("❌ Erreur lors de la récupération des reçus activés :", error.message);
    res.status(500).json({ message: 'Erreur interne du serveur.', error: error.message });
  }
};














exports.deleteReceiptBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const receiptBatch = await ReceiptBatch.findById(id);

    if (!receiptBatch) {
      return res.status(404).json({ message: 'Lot de reçus introuvable.' });
    }

    await receiptBatch.deleteOne();

    res.status(200).json({ message: 'Lot de reçus supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression du lot de reçus :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};




exports.exportBatch = async (req, res) => {
    try {
        console.log('➡️ Début de l’exportation d’un lot de reçus...');
        const { batchId } = req.params;

        const receiptBatch = await ReceiptBatch.findById(batchId)
            .populate('market', 'name location')
            .populate('collector', 'user')
            .populate({ path: 'collector', populate: { path: 'user', select: 'name phone' } });

        if (!receiptBatch) {
            console.error(`❌ Erreur : Lot de reçus avec l'ID ${batchId} introuvable.`);
            return res.status(404).json({ message: 'Lot de reçus introuvable.' });
        }

        // Renvoyer les données nécessaires pour le PDF et le fichier texte
        const exportData = {
            marketName: receiptBatch.market.name,
            marketLocation: receiptBatch.market.location,
            collectorName: receiptBatch.collector.user.name,
            collectorPhone: receiptBatch.collector.user.phone,
            receipts: receiptBatch.confirmationCodes,
        };

        console.log('✅ Données d’exportation prêtes :', exportData);

        res.status(200).json(exportData);
    } catch (err) {
        console.error('❌ Erreur lors de l’exportation d’un lot de reçus :', err.message);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};



exports.getActiveReceiptsForCollector = async (req, res) => {
  try {
    const collectorId = req.user.id; // Récupérer l'ID du collecteur connecté

    // Rechercher les lots de reçus activés attribués à ce collecteur
    const activeReceipts = await ReceiptBatch.find({
      collector: collectorId,
      status: 'Activated',
    }).populate('market', 'name location'); // Inclure les informations du marché

    if (!activeReceipts.length) {
      return res.status(404).json({ message: "Aucun reçu activé trouvé pour ce collecteur." });
    }

    res.status(200).json({ activeReceipts });
  } catch (err) {
    console.error("Erreur lors de la récupération des reçus activés :", err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
