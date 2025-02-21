const Payment = require('../models/Payment');
const Collector = require('../models/Collector');
const Taxpayer = require('../models/Taxpayer'); 
const ReceiptBatch = require('../models/ReceiptBatch'); // Import du modèle
const User = require('../models/User');

// Obtenir le total des taxes collectées

const getTaxesCollected = async (req, res) => {
  try {
    // Exécution de l'agrégation pour obtenir le total des taxes collectées
    const totalTaxesCollected = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }, // On fait la somme de tous les montants payés
    ]); 

    const total = totalTaxesCollected[0]?.total || 0;  // Si aucun résultat, on renvoie 0

        // Réponse envoyée au frontend
    console.log("Réponse envoyée au frontend avec le total des taxes collectées.");
    res.status(200).json({ totalTaxesCollected: total });
  } catch (err) {
    // Log pour afficher les erreurs en cas de problème
    console.error("❌ Erreur lors de la récupération des taxes collectées :", err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des taxes collectées.' });
  }
};




// Obtenir le nombre de collecteurs actifs
const getTotalActiveCollectors = async (req, res) => {
  console.log("===== Début de la récupération du nombre de collecteurs actifs =====");

  try {
    console.log("Utilisateur authentifié : ", req.user.name);
    console.log("Rôle de l'utilisateur : ", req.user.role);

    if (req.user.role !== 'admin') {
      console.error("❌ Accès refusé, l'utilisateur n'a pas le rôle 'admin'.");
      return res.status(403).json({ message: 'Accès refusé. Rôle non autorisé.' });
    }

    console.log("Exécution de la requête pour récupérer les collecteurs actifs...");

    // 🔥 Correction : Peupler `user` et filtrer par `user.status`
    const activeCollectorsCount = await Collector.find()
      .populate('user', 'status') // Ajoute les infos de `user`
      .exec();

    const count = activeCollectorsCount.filter(c => c.user?.status === 'active').length;

    console.log("Nombre de collecteurs actifs récupérés : ", count);

    res.status(200).json({ activeCollectorsCount: count });

  } catch (err) {
    console.error("Erreur lors de la récupération des collecteurs actifs :", err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des collecteurs actifs.' });
  }
};



const getTotalActiveTaxpayers = async (req, res) => {
  console.log("===== Début de la récupération du nombre de contribuables actifs =====");

  try {
    console.log("Utilisateur authentifié : ", req.user.name);
    console.log("Rôle de l'utilisateur : ", req.user.role);

    if (req.user.role !== 'admin') {
      console.error("❌ Accès refusé, l'utilisateur n'a pas le rôle 'admin'.");
      return res.status(403).json({ message: 'Accès refusé. Rôle non autorisé.' });
    }

    console.log("Exécution de la requête pour récupérer les contribuables actifs...");

    // 🔥 Correction : Peupler `user` et filtrer par `user.status`
    const activeTaxpayers = await Taxpayer.find()
      .populate('user', 'status') // Ajoute les infos de `user`
      .exec();

    const count = activeTaxpayers.filter(t => t.user?.status === 'active').length;

    console.log("Nombre de contribuables actifs récupérés : ", count);

    res.status(200).json({ activeTaxpayersCount: count });

  } catch (err) {
    console.error("Erreur lors de la récupération des contribuables actifs :", err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des contribuables actifs.' });
  }
};



const getReceiptsSummary = async (req, res) => {
  console.log("===== Début de la récupération des statistiques des reçus =====");

  try {
    console.log("Utilisateur authentifié : ", req.user.name);
    console.log("Rôle de l'utilisateur : ", req.user.role);

    if (req.user.role !== 'admin') {
      console.error("❌ Accès refusé, l'utilisateur n'a pas le rôle 'admin'.");
      return res.status(403).json({ message: 'Accès refusé. Rôle non autorisé.' });
    }

    console.log("Exécution de la requête pour récupérer les statistiques des reçus...");

    // Compter les reçus par statut
    const receipts = await ReceiptBatch.aggregate([
      { 
        $group: { 
          _id: "$status", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Formater les résultats pour le frontend
    const receiptsSummary = {
      Generated: 0,
      Printed: 0,
      Activated: 0,
      Used: 0
    };

    receipts.forEach(item => {
      receiptsSummary[item._id] = item.count;
    });

    console.log("Résumé des reçus :", receiptsSummary);

    res.status(200).json({ receipts: receiptsSummary });

  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques des reçus :", err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques des reçus.' });
  }
};


const getPaymentsSummary = async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      {
        $lookup: {
          from: 'taxpayers', // Liaison avec les contribuables
          localField: 'taxpayer',
          foreignField: '_id',
          as: 'taxpayerDetails',
        },
      },
      {
        $unwind: '$taxpayerDetails',
      },
      {
        $lookup: {
          from: 'zones', // Liaison avec les zones
          localField: 'taxpayerDetails.zone',
          foreignField: '_id',
          as: 'zoneDetails',
        },
      },
      {
        $unwind: { path: '$zoneDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'users', // Liaison avec les collecteurs
          localField: 'collector',
          foreignField: '_id',
          as: 'collectorDetails',
        },
      },
      {
        $unwind: { path: '$collectorDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: {
            collector: '$collectorDetails.name',
            zone: '$zoneDetails.name',
          },
          totalAmount: { $sum: '$amountPaid' },
          payments: { $push: { paymentDate: '$date', amount: '$amountPaid' } },
        },
      },
    ]);
    res.status(200).json(payments);
  } catch (err) {
    console.error('Erreur lors de la génération du résumé des paiements :', err.message);
    res.status(500).json({ message: 'Erreur lors de la génération du résumé des paiements.' });
  }
};




const getContributorsByCollector = async (req, res) => {
  try {
    const taxpayers = await Taxpayer.aggregate([
      {
        $lookup: {
          from: 'users', // Liaison avec les collecteurs
          localField: 'assignedCollector',
          foreignField: '_id',
          as: 'collectorDetails',
        },
      },
      {
        $unwind: { path: '$collectorDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: '$collectorDetails.name',
          taxpayers: { $push: { name: '$name', phone: '$phone', address: '$address', zone: '$zone' } },
        },
      },
    ]);
    res.status(200).json(taxpayers);
  } catch (err) {
    console.error('Erreur lors de la récupération des contribuables par collecteur :', err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des contribuables.' });
  }
};



const getTotalActiveUsers = async (req, res) => {
  console.log("===== Début de la récupération du nombre d'utilisateurs actifs =====");

  try {
    console.log("📌 Utilisateur authentifié : ", req.user ? req.user.name : "Non défini");
    console.log("📌 Rôle de l'utilisateur : ", req.user ? req.user.role : "Non défini");

    // Vérification du rôle admin
    if (!req.user || req.user.role !== 'admin') {
      console.error("❌ Accès refusé : L'utilisateur n'a pas le rôle 'admin'.");
      return res.status(403).json({ message: 'Accès refusé. Rôle non autorisé.' });
    }

    console.log("🟢 Exécution de la requête pour récupérer les utilisateurs actifs...");

    // Compter le nombre d'utilisateurs actifs
    const activeUsersCount = await User.countDocuments({ status: 'active' });

    console.log("✅ Nombre d'utilisateurs actifs récupérés :", activeUsersCount);

    res.status(200).json({ activeUsersCount });

  } catch (err) {
    console.error("❌ Erreur lors de la récupération des utilisateurs actifs :", err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs actifs.' });
  }
};







module.exports = {
  getTaxesCollected,
  getTotalActiveCollectors,
  getPaymentsSummary,
  getContributorsByCollector,
  getTotalActiveTaxpayers,
  getReceiptsSummary,
  getTotalActiveUsers,
  
};
