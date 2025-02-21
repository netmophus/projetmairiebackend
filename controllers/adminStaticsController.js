const ReceiptBatch = require('../models/ReceiptBatch');
const MarketTaxPayment = require('../models/MarketTaxPayment');
const Market = require("../models/Market");


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







// exports.getMarketStatisticsById = async (req, res) => {
//     try {
//       const { marketId } = req.params;
  
//       // Vérifier si le marché existe
//       const market = await Market.findById(marketId);
//       if (!market) {
//         return res.status(404).json({ message: "Marché non trouvé" });
//       }
  
//       // Récupérer les reçus de ce marché
//       const receiptBatches = await ReceiptBatch.find({ market: marketId })
//         .sort({ createdAt: 1 })
//         .lean();
  
//       // Récupérer les paiements effectués pour ce marché
//       const payments = await MarketTaxPayment.aggregate([
//         { $match: { market: market._id } },
//         {
//           $group: {
//             _id: "$market",
//             totalPayments: { $sum: "$amount" },
//             lastPaymentDate: { $max: "$paymentDate" },
//           },
//         },
//       ]);
  
//       const paymentData = payments.length > 0 ? payments[0] : null;
  
//       // Construire la réponse
//       const stats = {
//         marketName: market.name,
//         totalPayments: paymentData ? paymentData.totalPayments : 0,
//         lastPaymentDate: paymentData ? paymentData.lastPaymentDate : "Aucun paiement",
//         totalReceipts: receiptBatches.length,
//         usedReceipts: receiptBatches.reduce(
//           (total, batch) => total + batch.confirmationCodes.filter((c) => c.status === "Used").length,
//           0
//         ),
//         activeReceipts: receiptBatches.reduce(
//           (total, batch) =>
//             total + batch.confirmationCodes.filter((c) => c.status === "Activated").length,
//           0
//         ),
//       };
  
//       res.status(200).json(stats);
//     } catch (error) {
//       console.error("Erreur lors de la récupération des statistiques :", error.message);
//       res.status(500).json({ message: "Erreur interne du serveur" });
//     }
//   };
  

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





// exports.getMarketStateReport = async (req, res) => {
//   try {
//     const { marketId } = req.params;
//     console.log("Demande de reporting pour le marché:", marketId);

//     // Vérifier si le marché existe
//     const market = await Market.findById(marketId);
//     if (!market) {
//       console.log("Marché non trouvé pour l'ID:", marketId);
//       return res.status(404).json({ message: "Marché non trouvé" });
//     }
//     console.log("Marché trouvé:", market.name);

//     // Agréger les paiements pour obtenir un résumé
//     const reportSummary = await MarketTaxPayment.aggregate([
//       { $match: { market: market._id } },
//       {
//         $group: {
//           _id: "$market",
//           totalPayments: { $sum: "$amount" },
//           paymentCount: { $sum: 1 },
//           lastPaymentDate: { $max: "$paymentDate" },
//         },
//       },
//     ]);
//     console.log("Résumé des paiements:", reportSummary);

//     const summary =
//       reportSummary.length > 0
//         ? reportSummary[0]
//         : { totalPayments: 0, paymentCount: 0, lastPaymentDate: null };

//     // Récupérer la liste détaillée des paiements pour le marché,
//     // en peuplant le champ collector (pour récupérer ses champs 'name' et 'phone')
//     const paymentDetails = await MarketTaxPayment.find({ market: market._id })
//       .populate("collector", "name phone")
//       .lean();
//     console.log("Détails des paiements récupérés :", paymentDetails);

//     // Renvoie des données structurées pour le reporting
//     const response = {
//       marketName: market.name,
//       summary,
//       payments: paymentDetails,
//     };
//     console.log("Réponse envoyée :", response);
//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Erreur lors de la récupération du reporting :", error.message);
//     res.status(500).json({ message: "Erreur interne du serveur" });
//   }
// };





exports.getMarketStateReport = async (req, res) => {
  try {
    const { marketId } = req.params;
    console.log("Demande de reporting pour le marché:", marketId);

    // Récupérer le marché et peupler le champ collector (récupère 'name' et 'phone' depuis le modèle User)
    const market = await Market.findById(marketId).populate("collector", "name phone");
    if (!market) {
      console.log("Marché non trouvé pour l'ID:", marketId);
      return res.status(404).json({ message: "Marché non trouvé" });
    }
    console.log("Marché trouvé:", market.name);
    console.log("Collecteur récupéré depuis Market:", market.collector);

    // Agréger les paiements pour obtenir un résumé (total, nombre et dernière date de paiement)
    const reportSummary = await MarketTaxPayment.aggregate([
      { $match: { market: market._id } },
      {
        $group: {
          _id: "$market",
          totalPayments: { $sum: "$amount" },
          paymentCount: { $sum: 1 },
          lastPaymentDate: { $max: "$paymentDate" },
        },
      },
    ]);
    console.log("Résumé des paiements:", reportSummary);

    const summary =
      reportSummary.length > 0
        ? reportSummary[0]
        : { totalPayments: 0, paymentCount: 0, lastPaymentDate: null };

    // Récupérer la liste détaillée des paiements pour le marché, en peuplant le champ collector
    const paymentDetails = await MarketTaxPayment.find({ market: market._id })
      .populate("collector", "name phone")
      .lean();
    console.log("Détails des paiements récupérés (avant correction) :", paymentDetails);

    // Pour chaque paiement, si le champ collector est null, affecter le collecteur du Market
    const paymentsWithCollector = paymentDetails.map(payment => {
      if (!payment.collector && market.collector) {
        console.log(`Paiement ${payment._id} sans collecteur détecté, attribution du collecteur du Market`);
        return { ...payment, collector: market.collector };
      }
      return payment;
    });
    console.log("Détails des paiements avec collecteur corrigé :", paymentsWithCollector);

    // Construire la réponse finale
    const response = {
      marketName: market.name,
      collector: market.collector, // Le collecteur global du Market
      summary,
      payments: paymentsWithCollector,
    };
    console.log("Réponse envoyée :", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération du reporting :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
