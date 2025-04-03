const ReceiptBatch = require('../models/ReceiptBatch');
const MarketTaxPayment = require('../models/MarketTaxPayment');
const Market = require("../models/Market");



const MarketCollector = require("../models/MarketCollector");

exports.getMarketStatsCardCreated = async (req, res) => {
  try {
    // Récupérer tous les marchés
    const markets = await Market.find();

    // Récupérer les lots de reçus pour chaque marché
    const stats = await Promise.all(
      markets.map(async (market) => {
        // Récupérer le premier et le dernier reçu pour chaque marché
        const receiptBatches = await ReceiptBatch.find({ market: market._id })
          .sort({ createdAt: 1 })
          .select("startReceipt endReceipt");

        const firstReceipt = receiptBatches[0]?.startReceipt || "N/A";
        const lastReceipt = receiptBatches[receiptBatches.length - 1]?.endReceipt || "N/A";

        return {
          id: market._id,
          name: market.name,
          firstReceipt,
          lastReceipt,
        };
      })
    );

    // Envoyer les statistiques pour les cartes des marchés
    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des cartes :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};








exports.getMarketStatisticsById = async (req, res) => {
  try {
    const { marketId } = req.params;

    // Vérifier si le marché existe et peupler le champ collector
    const market = await Market.findById(marketId).populate('collector', 'name phone');
    if (!market) {
      return res.status(404).json({ message: "Marché non trouvé" });
    }

    // Récupérer les reçus de ce marché
    const receiptBatches = await ReceiptBatch.find({ market: marketId })
      .sort({ createdAt: 1 })
      .lean();

    // Récupérer les paiements effectués pour ce marché
    const payments = await MarketTaxPayment.aggregate([
      { $match: { market: market._id } },
      {
        $group: {
          _id: "$market",
          totalPayments: { $sum: "$amount" },
          lastPaymentDate: { $max: "$paymentDate" },
        },
      },
    ]);

    const paymentData = payments.length > 0 ? payments[0] : null;

    // Construire la réponse en incluant le collecteur
    const stats = {
      marketName: market.name,
      collector: market.collector ? market.collector : { name: "Inconnu", phone: "N/A" },
      totalPayments: paymentData ? paymentData.totalPayments : 0,
      lastPaymentDate: paymentData ? paymentData.lastPaymentDate : "Aucun paiement",
      totalReceipts: receiptBatches.length,
      usedReceipts: receiptBatches.reduce(
        (total, batch) =>
          total + batch.confirmationCodes.filter((c) => c.status === "Used").length,
        0
      ),
      activeReceipts: receiptBatches.reduce(
        (total, batch) =>
          total + batch.confirmationCodes.filter((c) => c.status === "Activated").length,
        0
      ),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};



exports.getMarketStatistics = async (req, res) => {
  try {
    // Étape 1: Récupérer les marchés avec leurs lots de reçus
    const receiptBatches = await ReceiptBatch.find({})
      .populate('market', 'name') // Inclut le nom du marché
      .lean();

    // Étape 2: Calculer les montants collectés pour chaque marché
    const payments = await MarketTaxPayment.aggregate([
      {
        $group: {
          _id: '$market',
          totalCollected: { $sum: '$amount' },
        },
      },
    ]);

    // Étape 3: Transformer les données pour les assembler
    const marketStats = receiptBatches.map((batch) => {
      const paymentData = payments.find((p) => p._id.toString() === batch.market._id.toString());
      const totalCollected = paymentData ? paymentData.totalCollected : 0;

      const activatedReceipts = batch.confirmationCodes.filter(
        (code) => code.status === 'Activated'
      ).length;
      const usedReceipts = batch.confirmationCodes.filter(
        (code) => code.status === 'Used'
      ).length;

      return {
        marketId: batch.market._id,
        marketName: batch.market.name,
        firstReceipt: batch.startReceipt,
        lastReceipt: batch.endReceipt,
        totalCollected,
        activatedReceipts,
        usedReceipts,
      };
    });

    // Étape 4: Retourner les statistiques
    res.status(200).json(marketStats);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques des marchés:', error.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};












exports.getMarketStateReport = async (req, res) => {
  try {
    const { marketId } = req.params;
    console.log("📥 Demande de reporting pour le marché:", marketId);

    // 🔹 Étape 1 : Vérifier si le marché existe
    const market = await Market.findById(marketId).populate("collector", "name phone");
    if (!market) {
      console.log("❌ Marché non trouvé pour l'ID:", marketId);
      return res.status(404).json({ message: "Marché non trouvé" });
    }
    console.log("✅ Marché trouvé:", market.name);

    // 🔹 Étape 2 : Récupérer tous les MarketCollectors et leur utilisateur (User)
    const marketCollectors = await MarketCollector.find().populate("user", "name phone").lean();
    console.log("📋 Collecteurs disponibles :", marketCollectors);

    // 🔹 Étape 3 : Récupérer tous les reçus pour ce marché
    const receiptBatches = await ReceiptBatch.find({ market: marketId }).populate("collector", "name phone").lean();
    console.log("📦 Reçus associés au marché:", receiptBatches);

    // 🔹 Étape 4 : Récupérer les paiements pour ce marché
    const paymentDetails = await MarketTaxPayment.find({ market: marketId }).lean();
    console.log("📄 Paiements après récupération :", JSON.stringify(paymentDetails, null, 2));

    // 🔹 Étape 5 : Associer le bon collecteur à chaque paiement
    const paymentsWithCollector = paymentDetails.map(payment => {
      let assignedCollector = "Inconnu"; // Valeur par défaut

      // 🔍 Trouver le MarketCollector correspondant au User (car `payment.collector` stocke un `user._id`)
      const matchingCollector = marketCollectors.find(mc => mc.user._id.toString() === payment.collector.toString());

      if (matchingCollector) {
        assignedCollector = {
          name: matchingCollector.user.name,
          phone: matchingCollector.user.phone
        };
      }

      return {
        ...payment,
        collector: assignedCollector, // Associer le collecteur correct
      };
    });

    console.log("✅ Paiements avec collecteur corrigés :", paymentsWithCollector);

    // 🔹 Étape 6 : Résumé des paiements
    const summary = await MarketTaxPayment.aggregate([
      { $match: { market: market._id } },
      {
        $group: {
          _id: "$market",
          totalPayments: { $sum: "$amount" },
          paymentCount: { $sum: 1 },
          lastPaymentDate: { $max: "$paymentDate" },
        },
      },
    ]).then(res => res[0] || { totalPayments: 0, paymentCount: 0, lastPaymentDate: null });

    // 🔹 Étape 7 : Construire la réponse finale
    const response = {
      marketName: market.name,
      collector: market.collector, // Collecteur principal du marché
      summary,
      payments: paymentsWithCollector, // Paiements avec leurs collecteurs corrigés
    };

    console.log("📤 Réponse envoyée :", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du reporting :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};