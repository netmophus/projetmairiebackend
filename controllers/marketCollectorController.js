


const TaxChefMarketPaiement = require('../models/TaxChefMarketPaiement');
const TaxMarketReceiptBatch = require('../models/TaxMarketReceiptBatch');
const MarketCollector = require('../models/MarketCollector');
const mongoose = require('mongoose');
const Market = require('../models/Market');


const moment = require('moment');


exports.payWithTaxReceiptCode = async (req, res) => {
  try {
    const { codeConfirmation, amount } = req.body;
    const userId = req.user.id;

    if (!codeConfirmation || !amount) {
      return res.status(400).json({ message: "Code ou montant manquant." });
    }

    const marketCollector = await MarketCollector.findOne({
      user: userId,
      assignedMarkets: { $exists: true, $not: { $size: 0 } }
    });

    if (!marketCollector) {
      return res.status(403).json({ message: "Non autorisé : pas de marché affecté." });
    }

    const marketId = marketCollector.assignedMarkets[0];

    const batch = await TaxMarketReceiptBatch.findOne({
      market: marketId,
      marketCollector: userId,
      'confirmationCodes.codeConfirmation': codeConfirmation.toUpperCase()
    });

    if (!batch) {
      return res.status(404).json({ message: "Code de confirmation introuvable ou invalide." });
    }

    const codeObj = batch.confirmationCodes.find(
      (c) => c.codeConfirmation === codeConfirmation.toUpperCase()
    );

    if (!codeObj || codeObj.status !== 'Activated') {
      return res.status(400).json({ message: "Reçu déjà utilisé ou non activé." });
    }

    const paiement = await TaxChefMarketPaiement.create({
      receiptBatchId: batch._id,
      receiptNumber: codeObj.receiptNumber,
      codeConfirmation: codeObj.codeConfirmation,
      market: marketId,
      marketCollector: userId,
      amount
    });

    codeObj.status = 'Used';
    await batch.save();

    res.status(201).json({
      message: '✅ Paiement validé.',
      paiement
    });

  } catch (err) {
    console.error('❌ Erreur lors du paiement :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};




//=======================================================================


// Create a new market collector
exports.createCollector = async (req, res) => {
  try {
    const { name, phone, assignedMarket } = req.body;

    if (!name || !phone || !assignedMarket) {
      return res.status(400).json({ message: 'Nom, téléphone et marché assigné sont requis.' });
    }

    const collector = new MarketCollector({ name, phone, assignedMarket });
    await collector.save();

    res.status(201).json({ message: 'Collecteur ajouté avec succès.', collector });
  } catch (err) {
    console.error('Erreur lors de la création du collecteur:', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Get all market collectors
exports.getCollectors = async (req, res) => {
  try {
    const collectors = await MarketCollector.find().populate('assignedMarket', 'name location');
    res.status(200).json(collectors);
  } catch (err) {
    console.error('Erreur lors de la récupération des collecteurs:', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};





// controllers/marketCollectorController.js


exports.getMyAssignedMarket = async (req, res) => {
  try {
    // 1️⃣ Log de l'utilisateur connecté
    console.log('🔐 Utilisateur connecté :', req.user);

    // 2️⃣ Log de tous les MarketCollectors pour comparaison
    const allMC = await MarketCollector.find({});
    console.log('🧾 Tous les MarketCollectors en base :', allMC);

    // 3️⃣ Tentative de récupération du MarketCollector correspondant
    const mc = await MarketCollector
      .findOne({ user: req.user.id })
      .populate('assignedMarkets', 'name location');

    console.log('🔍 Recherche avec user ID :', req.user.id);
    console.log('📌 MarketCollector trouvé :', mc);

    // 4️⃣ Vérification du contenu
    if (!mc) {
      console.warn('⚠️ Aucun document MarketCollector trouvé pour cet utilisateur.');
      return res.status(404).json({ message: 'Collecteur non trouvé.' });
    }

    if (!mc.assignedMarkets || mc.assignedMarkets.length === 0) {
      console.warn('⚠️ Aucun marché assigné à ce collecteur.');
      return res.status(404).json({ message: 'Aucun marché assigné.' });
    }

    // 5️⃣ Log du marché retourné
    const market = mc.assignedMarkets[0];
    console.log('✅ Marché assigné :', market);

    return res.status(200).json({
      name: market.name,
      location: market.location
    });

  } catch (err) {
    console.error('❌ Erreur getMyAssignedMarket :', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.getAssignedCollectors = async (req, res) => {
  try {
    // 1️⃣ Récupère le marché du chefmarket connecté
    const market = await Market.findOne({ chefmarket: req.user.id });
    if (!market) {
      return res.status(404).json({ message: 'Marché introuvable pour ce chef.' });
    }

    // 2️⃣ Cherche tous les MarketCollector qui ont ce marché dans assignedMarkets
    const mcs = await MarketCollector
      .find({ assignedMarkets: market._id })
      .populate('user', 'name phone');

    // 3️⃣ On extrait et renvoie la liste des users (collecteurs)
    const collectors = mcs.map(mc => mc.user);
    return res.status(200).json(collectors);
  } catch (err) {
    console.error('Erreur getAssignedCollectors :', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.getActiveReceiptPrefix = async (req, res) => {
  const userId = req.user.id;

  const mc = await MarketCollector.findOne({ user: userId });
  if (!mc) return res.status(404).json({ message: "Collecteur non trouvé." });

  const marketId = mc.assignedMarkets[0];

  const batch = await TaxMarketReceiptBatch.findOne({
    market: marketId,
    marketCollector: userId,
    status: 'Activated'
  });

  if (!batch) return res.status(404).json({ message: "Aucun lot activé." });

  const startReceipt = batch.startReceipt; // ex: REC-MRK-2025-00001
  const prefix = startReceipt.slice(0, -5); // enlève les 5 derniers chiffres

  res.status(200).json({ prefix });
};



// exports.getNextAvailableCode = async (req, res) => {
//   try {
//     const userId = req.user.id;
//      console.log('✅ userId reçu :', userId);

//     // 🔍 Récupère le document MarketCollector associé au user connecté
//     const collector = await MarketCollector.findOne({ user: userId });
//       console.log('🔍 Résultat MarketCollector :', collector);
//     if (!collector) {
//       return res.status(404).json({ message: 'Collecteur introuvable.' });
//     }

//     // Récupère les lots de ce collecteur avec status "Activated"
//     const batches = await TaxMarketReceiptBatch.find({
//       marketCollector: userId,
//       status: 'Activated'
//     });

//     // Parcourt les lots pour trouver le premier code activé disponible
//     for (const batch of batches) {
//       const codeObj = batch.confirmationCodes.find(c => c.status === 'Activated');
//       if (codeObj) {
//         return res.status(200).json({ code: codeObj.codeConfirmation });
//       }
//     }

//     return res.status(404).json({ message: 'Aucun code disponible.' });
//   } catch (err) {
//     console.error('Erreur getNextAvailableCode :', err);
//     res.status(500).json({ message: 'Erreur serveur.' });
//   }
// };


exports.getNextAvailableCode = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('✅ userId reçu :', userId);

    // 🔍 Récupération du collecteur lié à l'utilisateur
    const collector = await MarketCollector.findOne({ user: userId });
    console.log('🔍 Résultat MarketCollector :', collector);

    if (!collector) {
      return res.status(200).json({ code: null, message: 'Collecteur non trouvé.' });
    }

    // 🎯 Récupère les lots de reçus activés
    const batches = await TaxMarketReceiptBatch.find({
      marketCollector: userId,
      status: 'Activated'
    });

    if (batches.length === 0) {
      return res.status(200).json({
        code: null,
        message: 'Aucun lot de reçus activé disponible.'
      });
    }

    // 🔍 Recherche du premier code activé disponible
    for (const batch of batches) {
      const codeObj = batch.confirmationCodes.find(c => c.status === 'Activated');
      if (codeObj) {
        return res.status(200).json({ code: codeObj.codeConfirmation });
      }
    }

    // ✅ Aucun code activé trouvé malgré des lots actifs
    return res.status(200).json({
      code: null,
      message: 'Tous les codes ont été utilisés.'
    });

  } catch (err) {
    console.error('❌ Erreur getNextAvailableCode :', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.verifyCollectorReceiptCode = async (req, res) => {
  try {
    const { code } = req.query;
    const collectorId = req.user.id;

    if (!code || code.length !== 6) {
      return res.status(400).json({ message: 'Code invalide.' });
    }

    // 🔍 Recherche dans les lots activés du collecteur connecté
    const batch = await TaxMarketReceiptBatch.findOne({
      'confirmationCodes.codeConfirmation': code.toUpperCase()
    })
    .populate('marketCollector', 'name')  // On veut le nom du collecteur
    .populate('market', 'name');           // On veut le nom du marché

    if (!batch) {
      return res.status(404).json({ message: 'Code introuvable ou non activé.' });
    }

    const receipt = batch.confirmationCodes.find(c => c.codeConfirmation === code.toUpperCase());

    if (!receipt || receipt.status !== 'Activated') {
      return res.status(400).json({ message: 'Code déjà utilisé ou inactif.' });
    }

    return res.status(200).json({
      codeConfirmation: receipt.codeConfirmation,
      receiptNumber: receipt.receiptNumber,
      market: batch.market,
      marketCollector: batch.marketCollector
    });

  } catch (err) {
    console.error('❌ Erreur lors de la vérification du code :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};





exports.getMyDailyPayments = async (req, res) => {
  try {
    const collectorId = req.user.id; // ✅ corrigé ici (venant du token)

    const startOfDay = moment.utc().startOf('day').toDate();
    const endOfDay = moment.utc().endOf('day').toDate();

    console.log('📌 Paiements du collecteur ID :', collectorId);
    console.log('📅 Date UTC début :', startOfDay);
    console.log('📅 Date UTC fin   :', endOfDay);

    const payments = await TaxChefMarketPaiement.find({
      marketCollector: collectorId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('❌ Erreur getMyDailyPayments:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

