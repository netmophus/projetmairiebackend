const ReceiptBatch = require('../models/ReceiptBatch');
const Market = require('../models/Market');
const MarketCollector = require('../models/MarketCollector');
const mongoose = require('mongoose');


// exports.createReceiptBatch = async (req, res) => {
//   try {
//     //console.log('📥 Données reçues pour la création du lot :', req.body);

//     const { market, startReceipt, endReceipt } = req.body;

//     // Validation des champs requis
//     if (!market || !startReceipt || !endReceipt) {
//       console.error('❌ Champs requis manquants.');
//       return res.status(400).json({ message: 'Tous les champs sont requis : marché, reçus début et fin.' });
//     }

//     // Vérification du marché
//     const existingMarket = await Market.findById(market).populate('collector', 'name phone');
//     if (!existingMarket) {
//       console.error(`❌ Le marché avec l'ID ${market} est introuvable.`);
//       return res.status(404).json({ message: 'Marché introuvable.' });
//     }

//     if (!existingMarket.collector) {
//       console.error(`❌ Aucun collecteur n'est assigné au marché ${market}.`);
//       return res.status(400).json({ message: "Aucun collecteur n'est assigné à ce marché." });
//     }

//    //console.log('✅ Marché trouvé avec collecteur :', existingMarket.collector);

//     // Validation de la plage de reçus
//     const start = parseInt(startReceipt.replace('R', ''), 10);
//     const end = parseInt(endReceipt.replace('R', ''), 10);

//     if (isNaN(start) || isNaN(end) || start > end) {
//       console.error('❌ Numéros de reçus invalides ou hors plage.');
//       return res.status(400).json({ message: 'Les numéros de reçus sont invalides ou la plage est incorrecte.' });
//     }

//     // Génération des codes de confirmation
//     // const confirmationCodes = [];
//     // for (let i = start; i <= end; i++) {
//     //   confirmationCodes.push({
//     //     receipt: `R${String(i).padStart(5, '0')}`,
//     //     code: Math.floor(100 + Math.random() * 900).toString(), // Code aléatoire à 3 chiffres
//     //   });
//     // }


//     const confirmationCodes = [];
//     for (let i = start; i <= end; i++) {
//   confirmationCodes.push({
//     receipt: `R${String(i).padStart(5, '0')}`,
//     code: Math.floor(100 + Math.random() * 900).toString(),
//     status: "Generated", // 🔥 Assurez-vous que le statut par défaut est bien "Generated"
//   });
// }

//     // console.log('✅ Codes de confirmation générés :', confirmationCodes);

//     // Création du lot de reçus
//     const receiptBatch = new ReceiptBatch({
//       market,
//       collector: existingMarket.collector._id,
//       startReceipt,
//       endReceipt,
//       confirmationCodes,
//       status: 'Generated', // Respect du modèle
//     });

//     await receiptBatch.save();

   
//     res.status(201).json({
//       message: 'Lot de reçus créé avec succès.',
//       receiptBatch,
//     });
//   } catch (err) {
//     console.error('❌ Erreur lors de la création du lot de reçus :', err);
//     res.status(500).json({ 
//       message: 'Erreur interne du serveur.',
//       error: err.message,
//     });
//   }
// };

exports.createReceiptBatch = async (req, res) => {
  try {
    const { market, startReceipt, endReceipt, collector } = req.body;

    // Vérification des champs requis
    if (!market || !startReceipt || !endReceipt || !collector) {
      console.error('❌ Champs requis manquants.');
      return res.status(400).json({ message: 'Tous les champs sont requis : marché, reçus début et fin, collecteur.' });
    }

    // Vérification du marché et récupération des collecteurs associés
    const existingMarket = await Market.findById(market).populate('collector', 'name phone');

    if (!existingMarket) {
      console.error(`❌ Le marché avec l'ID ${market} est introuvable.`);
      return res.status(404).json({ message: 'Marché introuvable.' });
    }

    if (!existingMarket.collector || existingMarket.collector.length === 0) {
      console.error(`❌ Aucun collecteur n'est assigné au marché ${market}.`);
      return res.status(400).json({ message: "Aucun collecteur n'est assigné à ce marché." });
    }

    console.log('✅ Marché trouvé avec collecteurs :', existingMarket.collector);

    // 🔥 Vérification que le collecteur sélectionné est bien associé à ce marché
    const isCollectorValid = existingMarket.collector.some(
      (col) => col._id.toString() === collector
    );

    if (!isCollectorValid) {
      console.error("❌ Ce collecteur n'est pas assigné à ce marché.");
      return res.status(400).json({ message: "Ce collecteur n'est pas assigné à ce marché." });
    }

    console.log('✅ Collecteur sélectionné :', collector);

    // Validation de la plage de reçus
    const start = parseInt(startReceipt.replace('R', ''), 10);
    const end = parseInt(endReceipt.replace('R', ''), 10);

    if (isNaN(start) || isNaN(end) || start > end) {
      console.error('❌ Numéros de reçus invalides ou hors plage.');
      return res.status(400).json({ message: 'Les numéros de reçus sont invalides ou la plage est incorrecte.' });
    }

    // Génération des codes de confirmation
    const confirmationCodes = [];
    for (let i = start; i <= end; i++) {
      confirmationCodes.push({
        receipt: `R${String(i).padStart(5, '0')}`,
        code: Math.floor(100 + Math.random() * 900).toString(),
        status: "Generated",
      });
    }

    console.log('✅ Codes de confirmation générés :', confirmationCodes);

    // 🔥 Associer le lot de reçus uniquement au collecteur sélectionné
    const receiptBatch = new ReceiptBatch({
      market,
      collector,  // 🔥 Utilisation du collecteur sélectionné
      startReceipt,
      endReceipt,
      confirmationCodes,
      status: 'Generated',
    });

    await receiptBatch.save();

    console.log('✅ Lot de reçus créé pour le collecteur sélectionné :', collector);

    res.status(201).json({
      message: 'Lot de reçus créé avec succès pour le collecteur sélectionné.',
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
        //console.log('➡️ Début de la récupération des lots de reçus...');
    
        // Récupérer les lots de reçus avec les informations des marchés et des collecteurs
        const receiptBatches = await ReceiptBatch.find()
        .populate('market', 'name location') // Inclure nom et localisation du marché
        .populate('collector', 'name'); // Inclure le nom du collecteur
        //console.log('📥 Lots de reçus récupérés depuis la base de données :', receiptBatches);
    
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

// Récupérer tous les lots de reçus d'un collecteur spécifique



// exports.getReceiptBatchById = async (req, res) => {
//   const { id, collectorId } = req.params;

//   if (!collectorId) {
//     return res.status(400).json({ message: "L'identifiant du collecteur est requis." });
//   }

//   try {
//     const batch = await ReceiptBatch.findOne({ _id: id, collector: collectorId })
//       .populate('market', 'name location')
//       .populate('collector', 'name');

//     if (!batch) {
//       console.log("❌ Aucun lot trouvé pour cet ID ou ce collecteur :", id);
//       return res.status(404).json({ message: "Lot non trouvé pour ce collecteur." });
//     }

//     console.log("✅ Lot trouvé :", JSON.stringify(batch, null, 2));
//     return res.json(batch);
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération du lot :", error.message);
//     return res.status(500).json({ message: "Erreur interne du serveur" });
//   }
// };


exports.getReceiptBatchById = async (req, res) => {
  const { id } = req.params;

  try {
    const batch = await ReceiptBatch.findById(id)
      .populate('market', 'name location')
      .populate('collector', 'name phone'); // 🔥 Modification ici : Récupère aussi le téléphone


    if (!batch) {
      console.log("❌ Aucun lot trouvé pour cet ID :", id);
      return res.status(404).json({ message: "Lot non trouvé pour cet ID." });
    }

    console.log("✅ Lot trouvé :", JSON.stringify(batch, null, 2));
    return res.json(batch);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du lot :", error.message);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};


exports.getTotalGeneratedReceipts = async (req, res) => {
  //console.log("📥 Début de la récupération du nombre de reçus générés...");

  try {
    // Filtrer les reçus avec le statut "Generated"
    const totalGeneratedReceipts = await ReceiptBatch.countDocuments({ status: "Generated" });

    //console.log("📊 Nombre total de reçus générés trouvés :", totalGeneratedReceipts);

    res.status(200).json({ totalGeneratedReceipts });
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des reçus générés :", err.message);
    res.status(500).json({ message: "Erreur lors de la récupération des reçus générés." });
  }
};


exports.activateReceiptBatch = async (req, res) => {
  try {
    //console.log("📥 Requête reçue pour activer le lot de reçus avec ID :", req.params.id);

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

    //console.log("🔍 Lot de reçus trouvé :", receiptBatch);

    // Mise à jour du statut des reçus individuels
    receiptBatch.confirmationCodes.forEach((receipt) => {
      receipt.status = 'Activated';
    });

    // Mise à jour du statut du lot
    receiptBatch.status = 'Activated';
    receiptBatch.activatedAt = new Date(); // Date d'activation
    receiptBatch.activatedBy = req.user.id; // ID de l'utilisateur connecté

    await receiptBatch.save();

    //console.log("✅ Lot de reçus activé avec succès :", receiptBatch);

    res.status(200).json({ message: 'Lot de reçus activé avec succès.', receiptBatch });
  } catch (err) {
    console.error("❌ Erreur lors de l’activation du lot de reçus :", err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};





exports.getActivatedReceiptsByMarket = async (req, res) => {
  try {
    const { marketId } = req.params;

    // ✅ Vérification de la validité de l'ID du marché
    if (!mongoose.Types.ObjectId.isValid(marketId)) {
      console.error("❌ ID du marché invalide :", marketId);
      return res.status(400).json({ message: "ID du marché invalide." });
    }

    // ✅ Vérifier si le marché existe
    const marketExists = await Market.findById(marketId);
    if (!marketExists) {
      console.warn("⚠️ Aucun marché trouvé avec cet ID :", marketId);
      return res.status(404).json({ message: "Aucun marché trouvé avec cet ID." });
    }

    // ✅ Récupérer les reçus activés
    const receipts = await ReceiptBatch.find({
      market: marketId,
      status: 'Activated',
    })
    .select('market collector startReceipt endReceipt confirmationCodes status activatedAt')
    .populate('market', 'name location')
    .populate('collector', 'name phone');

    // ✅ Vérifier s'il n'y a pas de reçus activés
    if (!receipts.length) {
      console.warn("⚠️ Aucun reçu activé trouvé pour ce marché :", marketId);
      return res.status(200).json({ message: "Aucun reçu activé pour ce marché.", receipts: [] });
    }

    // 🔥 Filtrer les reçus activés et non utilisés
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
        confirmationCodes: unusedReceipts,
      };
    });

    // ✅ Vérifier si après filtrage il reste des reçus activés
    const hasReceipts = filteredReceipts.some(
      (batch) => batch.confirmationCodes.length > 0
    );

    if (!hasReceipts) {
      console.warn("⚠️ Aucun reçu activé disponible pour ce marché après filtrage.");
      return res.status(200).json({ message: "Aucun reçu activé disponible pour ce marché.", receipts: [] });
    }

    res.status(200).json({ receipts: filteredReceipts });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des reçus activés :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur.", error: error.message });
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
    // ✅ Récupérer l'ID du collecteur connecté
    const collectorId = req.user.id;
    console.log("📥 ID du collecteur connecté :", collectorId);

    // ✅ Vérifier les zones assignées au collecteur
    const collectorData = await MarketCollector.findOne({ user: collectorId })
      .populate('assignedZones', 'name description');

    if (!collectorData) {
      console.warn("⚠️ Aucun collecteur trouvé avec l'ID :", collectorId);
      return res.status(404).json({ message: "Aucun collecteur trouvé." });
    }

    console.log("📋 Zones assignées au collecteur :", collectorData.assignedZones);

    // ✅ Récupérer les IDs des zones assignées
    const assignedZoneIds = collectorData.assignedZones.map(zone => zone._id);

    // ✅ Filtrer les reçus activés par collecteur et par zones assignées
    const activeReceipts = await ReceiptBatch.find({
      collector: collectorId, // 🔥 Filtrer par collecteur connecté
      status: 'Activated',
      market: { $in: assignedZoneIds }
    })
    .populate('market', 'name location')
    .populate('collector', 'name phone');

    // 🟡 Vérification si aucun reçu n'est trouvé
    if (!activeReceipts.length) {
      console.warn("⚠️ Aucun reçu activé trouvé pour ce collecteur :", collectorId);
      return res.status(404).json({ message: "Aucun reçu activé trouvé pour ce collecteur." });
    }

    // ✅ Afficher les reçus activés trouvés
    console.log("✅ Reçus activés pour le collecteur :", collectorId);
    console.log(JSON.stringify(activeReceipts, null, 2));

    res.status(200).json({ activeReceipts });
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des reçus activés :", err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};



// 🔥 Fonction pour récupérer les reçus activés par collecteur et marché
exports.getActivatedReceiptsByCollector = async (req, res) => {
  try {
    const { marketId } = req.params;
    const collectorId = req.user.id; // 🔥 ID du collecteur connecté

    console.log("📥 Requête pour reçus activés - Marché :", marketId, " Collecteur :", collectorId);

    // Vérification de la validité de l'ID du marché
    if (!marketId) {
      console.error("❌ ID du marché manquant dans la requête.");
      return res.status(400).json({ message: 'ID du marché requis.' });
    }

    // 🔥 Recherche des reçus activés pour le collecteur connecté et le marché sélectionné
    const receipts = await ReceiptBatch.find({
      market: marketId,
      collector: collectorId, // Filtrer par le collecteur connecté
      status: 'Activated',
    })
      .select('market collector startReceipt endReceipt confirmationCodes status activatedAt')
      .populate('market', 'name location') // Inclure les détails du marché
      .populate('collector', 'name phone'); // Inclure les détails du collecteur

    console.log("✅ Reçus activés récupérés :", receipts);

    if (!receipts.length) {
      console.warn("⚠️ Aucun reçu activé trouvé pour ce collecteur et marché.");
      return res.status(404).json({ message: 'Aucun reçu activé trouvé pour ce marché.' });
    }

    // Filtrer les reçus activés
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
        confirmationCodes: unusedReceipts,
      };
    });

    res.status(200).json({ activeReceipts: filteredReceipts });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des reçus activés :", error.message);
    res.status(500).json({ message: 'Erreur interne du serveur.', error: error.message });
  }
};
