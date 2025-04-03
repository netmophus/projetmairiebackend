const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Tax = require('../models/Tax');
const Taxpayer = require('../models/Taxpayer');
const TaxpayerTax = require('../models/TaxpayerTax');
const { sendSMS } = require('../utils/sendSMS');
const ReceiptBatch = require('../models/ReceiptBatch'); // 🔥 Assure-toi d'importer le modèle des reçus
const Collector = require('../models/Collector');
const UnpaidTax = require('../models/UnpaidTax'); // Assurez-vous que ce chemin est correct


// Contrôleur pour récupérer le total collecté

// Contrôleur pour récupérer le total collecté
const getTotalCollected = async (req, res) => {
  try {
    //console.log('➡️ Requête reçue pour total collecté.');

    // Vérifiez si req.user.id est défini
    if (!req.user || !req.user.id) {
      console.error('❌ ID du collecteur manquant dans la requête.');
      return res.status(400).json({ message: 'ID du collecteur manquant.' });
    }

    const collectorId = new mongoose.Types.ObjectId(req.user.id);
    //console.log('✅ ID du collecteur connecté (converti) :', collectorId);

    // Vérifiez les paiements associés au collecteur
    const payments = await Payment.find({ collector: collectorId });
    //console.log('📊 Paiements trouvés pour le collecteur :', payments);

    if (payments.length === 0) {
      console.log('⚠️ Aucun paiement trouvé pour ce collecteur.');
    }

    // Agrégation pour calculer le total collecté
   // console.log('🔄 Début de l\'agrégation pour le total collecté...');
    const totalCollected = await Payment.aggregate([
      { $match: { collector: collectorId } }, // Filtrer par collecteur
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }, // Utilisation de amountPaid
    ]);

    //console.log('🔢 Résultat de l\'agrégation :', totalCollected);

    const total = totalCollected.length > 0 ? totalCollected[0].total : 0;
    //console.log('💰 Total collecté calculé :', total);

    res.status(200).json({ totalCollected: total });
  } catch (err) {
    console.error('❌ Erreur lors de la récupération du total collecté :', err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération du total collecté.', error: err.message });
  }
};


  // Récupérer le nombre de taxes créées
const getTaxesCreated = async (req, res) => {
    try {
      const totalTaxes = await Tax.countDocuments(); // Compte toutes les taxes
      //console.log('Nombre total de taxes créées :', totalTaxes);
      res.status(200).json({ totalTaxes });
    } catch (err) {
      console.error('Erreur lors de la récupération des taxes créées :', err.message);
      res.status(500).json({ message: 'Erreur lors de la récupération des taxes créées.', error: err.message });
    }
  };


  // Récupérer le nombre de contribuables actifs
// controllers/collectorDashboardController.js

const getActiveTaxpayers = async (req, res) => {
  try {
    console.log('🔍 Début de la récupération des contribuables actifs...');

    // Utilisation du collectorId
    const collectorId = req.user.collectorId;
    console.log('📌 ID du collecteur connecté :', collectorId);

    // Vérifier si collectorId est défini
    if (!collectorId) {
      console.error('❌ Erreur : collectorId non défini dans req.user.');
      return res.status(400).json({ message: 'ID du collecteur manquant.' });
    }

    // Vérification des zones assignées au collecteur
    console.log('📋 Zones assignées au collecteur :', req.user.assignedZones);

    // Récupérer les contribuables associés à ce collecteur
    console.log('🔄 Début de la requête pour les contribuables actifs...');
    const activeTaxpayers = await Taxpayer.find({
      zone: { $in: req.user.assignedZones }
    })
      .populate({
        path: 'user',
        select: 'name phone' // Récupère le nom et le téléphone du contribuable
      });

    console.log('✅ Contribuables actifs trouvés :', activeTaxpayers);

    // Compter le nombre de contribuables actifs
    const totalActiveTaxpayers = activeTaxpayers.length;
    console.log('🔢 Nombre total de contribuables actifs :', totalActiveTaxpayers);

    res.status(200).json({
      totalActiveTaxpayers,
      activeTaxpayers
    });
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des contribuables actifs :', err.message);
    res.status(500).json({
      message: 'Erreur lors de la récupération des contribuables actifs.',
      error: err.message
    });
  }
};





  

// Contrôleur pour récupérer les paiements récents
const getRecentPayments = async (req, res) => {
  try {
    const collectorId = new mongoose.Types.ObjectId(req.user.id);

    // Date de 7 jours en arrière
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filtrer les paiements récents effectués par ce collecteur
    const recentPayments = await Payment.find({
      collector: collectorId,
      date: { $gte: sevenDaysAgo }
    })
    .populate({
      path: 'taxpayer',       // 📌 1er populate sur Taxpayer
      select: 'user',         // 📌 Sélectionne le champ `user` dans Taxpayer
      populate: {
        path: 'user',         // 📌 2e populate sur User
        select: 'name'        // 📌 Récupère le `name` depuis User
      }
    })
    .populate('tax', 'name')  // 📌 Récupère le nom de la taxe
    .sort({ date: -1 })       // Tri par date décroissante
    .limit(20);               // Limite à 20 paiements récents

    res.status(200).json({ recentPayments });
  } catch (err) {
    console.error('Erreur lors de la récupération des paiements récents :', err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements récents.', error: err.message });
  }
};


// const getOverduePayments = async (req, res) => {
//   try {
//     console.log("🔍 Début de la récupération des paiements en retard...");

//     // 1. Récupère l'ID du collecteur connecté
//     const collectorId = new mongoose.Types.ObjectId(req.user.id);
//     console.log("📌 ID du collecteur :", collectorId);

//     // 2. Trouver tous les contribuables associés à ce collecteur
//     const taxpayers = await Taxpayer.find({ 
//       // On suppose ici que chaque Taxpayer a des taxes associées
//       taxes: { $exists: true, $ne: [] }
//     }).select('taxes');
    
//     console.log("👥 Contribuables associés trouvés :", taxpayers);

//     // 3. Récupérer tous les `TaxpayerTax` liés à ces contribuables
//     const taxpayerTaxIds = taxpayers.flatMap(t => t.taxes); // Récupère tous les IDs de `TaxpayerTax`
//     console.log("💼 Taxes associées :", taxpayerTaxIds);

//     // 4. Filtrer les `TaxpayerTax` qui ont un montant restant à payer et une date échue
//     const overduePayments = await TaxpayerTax.find({
//       _id: { $in: taxpayerTaxIds },          // Récupère uniquement les taxes de ces contribuables
//       remainingAmount: { $gt: 0 },            // Montant restant à payer
//       dueDate: { $lt: new Date() }            // Date d'échéance passée
//     })
//     .populate({
//       path: 'taxpayer',
//       populate: {
//         path: 'user', // Récupère le nom et le téléphone depuis User
//         select: 'name phone'
//       }
//     })
//     .populate('tax', 'name') // Nom de la taxe
//     .sort({ dueDate: -1 }) // Tri par date décroissante
//     .limit(20); // Limiter à 20 paiements en retard

//     console.log("⏳ Paiements en retard trouvés :", overduePayments);

//     // 5. Calculer le total des paiements en retard
//     const totalOverdue = overduePayments.reduce((acc, payment) => acc + payment.remainingAmount, 0);

//     res.status(200).json({ 
//       totalOverdue, 
//       overduePayments 
//     });
//   } catch (err) {
//     console.error('❌ Erreur lors de la récupération des paiements en retard :', err.message);
//     res.status(500).json({ message: 'Erreur lors de la récupération des paiements en retard.', error: err.message });
//   }
// };



// Notification


// 📌 Importe `Collector` si ce n'est pas déjà fait


// 🔄 Récupérer les contribuables pour notification


const getOverduePayments = async (req, res) => {
  try {
    console.log("🔍 Début de la récupération des paiements en retard...");

    // Récupérer l'ID du collecteur
    const collectorId = new mongoose.Types.ObjectId(req.user.id);
    console.log("📌 ID du collecteur :", collectorId);

    // Récupérer tous les contribuables associés à ce collecteur
    const taxpayers = await Taxpayer.find({ /* logique de recherche */ }).select('taxes');
    console.log("👥 Contribuables associés trouvés :", taxpayers);

    // Récupérer les TaxpayerTax liés aux contribuables
    const taxpayerTaxIds = taxpayers.flatMap(t => t.taxes);
    console.log("💼 Taxes associées :", taxpayerTaxIds);

    const overduePayments = await UnpaidTax.find({
      _id: { $in: taxpayerTaxIds },
      remainingAmount: { $gt: 0 },
      originalDueDate: { $lt: new Date() }
    })
    .populate({
      path: 'taxpayer',
      populate: {
        path: 'user',
        select: 'name phone'
      }
    })
    .populate('tax', 'name')
    .sort({ originalDueDate: -1 })
    .limit(20);

    console.log("⏳ Paiements en retard trouvés :", overduePayments);

    const totalOverdue = overduePayments.reduce((acc, payment) => acc + payment.remainingAmount, 0);

    res.status(200).json({ totalOverdue, overduePayments });
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des paiements en retard :', err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements en retard.', error: err.message });
  }
};



const getTaxpayersForNotification = async (req, res) => {
  try {
      console.log('🔍 Début de la récupération des contribuables pour notification...');

      // 🔥 Récupère les zones assignées au collecteur connecté
      const collector = await Collector.findOne({ user: req.user.id }).select('assignedZones');
      const assignedZones = collector?.assignedZones || [];
      console.log('📋 Zones assignées au collecteur :', assignedZones);

      // Vérifier s'il y a des zones assignées
      if (assignedZones.length === 0) {
          return res.status(200).json({ taxpayersWithDebt: [] });
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Filtrer en fonction du paramètre `filter`
      const filter = req.query.filter || 'all';
      const taxFilter = filter === 'unpaid' 
          ? { remainingAmount: { $gt: 0 } }
          : {}; // Pas de filtre spécifique pour `all`

      // 🔄 Rechercher les contribuables dans les zones assignées
      const taxpayers = await Taxpayer.find({
          zone: { $in: assignedZones },
          taxes: { $exists: true, $ne: [] } // Contribuables ayant des taxes
      })
      .populate({
          path: 'taxes',
          model: 'TaxpayerTax',
          match: taxFilter, // 🔥 Applique le filtre
          select: 'totalAmount remainingAmount dueDate',
          populate: {
              path: 'tax',
              select: 'name'
          }
      })
      .populate({
          path: 'user',
          select: 'name phone'
      })
      .skip(skip)
      .limit(limit);

      // Réorganiser les données pour inclure le montant restant
      const taxpayersWithDebt = taxpayers.map(taxpayer => {
          return {
              _id: taxpayer._id,
              name: taxpayer.user.name,
              phone: taxpayer.user.phone,
              remainingAmount: taxpayer.taxes.reduce((acc, tax) => acc + tax.remainingAmount, 0),
              taxes: taxpayer.taxes.map(tax => ({
                  name: tax.tax.name,
                  remainingAmount: tax.remainingAmount,
                  dueDate: tax.dueDate
              }))
          }
      }).filter(taxpayer => taxpayer.remainingAmount > 0 || filter === 'all'); // 🔥 Filtrer les non-payés seulement si `unpaid`

      console.log('💼 Contribuables trouvés :', taxpayersWithDebt);

      res.status(200).json({ 
          taxpayersWithDebt,
          currentPage: page,
          totalTaxpayers: taxpayersWithDebt.length
      });
  } catch (err) {
      console.error('Erreur lors de la récupération des contribuables pour notification :', err.message);
      res.status(500).json({ 
          message: 'Erreur lors de la récupération des contribuables pour notification.', 
          error: err.message 
      });
  }
};




// notification

const sendNotification = async (req, res) => {
  try {
    console.log('🔔 Début de l\'envoi de notification...');
    const { message, recipients } = req.body;
    console.log('📧 Message à envoyer :', message);
    console.log('👥 Destinataires :', recipients);

    if (!message || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Message ou destinataires manquants.' });
    }

    // 🔄 Boucle sur chaque destinataire pour envoyer le SMS
    for (const taxpayer of recipients) {
      const phoneNumber = taxpayer.phone;
      const personalizedMessage = `Bonjour ${taxpayer.name}, ${message}`;
      try {
        // ✅ Envoi du SMS
        const response = await sendSMS(phoneNumber, personalizedMessage);
        console.log(`✅ Notification envoyée à ${taxpayer.name} (${phoneNumber}) : ${message}`);
        console.log('📲 Réponse SMS API :', response);
      } catch (err) {
        console.error(`❌ Erreur lors de l'envoi à ${taxpayer.name} (${phoneNumber}) :`, err.message);
      }
    }

    res.status(200).json({ message: 'Notifications envoyées avec succès.' });
  } catch (err) {
    console.error('Erreur lors de l\'envoi des notifications :', err.message);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi des notifications.', 
      error: err.message 
    });
  }
};

// 2️⃣ Récupération des contribuables avec le montant restant et la date d'échéance
const getTaxpayersWithDueDate = async (req, res) => {
  try {
      //const collectorId = new mongoose.Types.ObjectId(req.user.id);

      const taxpayers = await TaxpayerTax.find({
          remainingAmount: { $gt: 0 }
      })
          .populate({
              path: 'taxpayer',
              populate: {
                  path: 'user',
                  select: 'name phone'
              }
          })
          .populate('tax', 'name')
          .select('remainingAmount dueDate')
          .sort({ dueDate: 1 }); // Tri par date d'échéance la plus proche

      console.log("🔔 Contribuables avec montant restant et date d'échéance :", taxpayers);

      res.status(200).json({ taxpayers });
  } catch (err) {
      console.error('Erreur lors de la récupération des contribuables avec date d\'échéance :', err.message);
      res.status(500).json({ message: 'Erreur lors de la récupération des contribuables avec date d\'échéance.', error: err.message });
  }
};



// 📌 Récupération des reçus activés pour le collecteur
const getActiveReceipts = async (req, res) => {
  try {
    console.log("📥 Début de la récupération des reçus activés pour le collecteur...");
    
    // Vérifie si le collecteur a des zones assignées
    if (!req.user.collectorId) {
      console.warn("⚠️ Aucune information sur le collecteur trouvé dans req.user.");
      return res.status(400).json({ message: "ID du collecteur manquant." });
    }

    // 🔄 Trouver les reçus activés liés aux zones du collecteur
    const activeReceipts = await ReceiptBatch.find({
      zone: { $in: req.user.assignedZones },
      status: 'activated'
    });

    console.log("✅ Reçus activés trouvés :", activeReceipts);

    res.status(200).json({ activeReceipts });
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des reçus activés :", err.message);
    res.status(500).json({ message: "Erreur lors de la récupération des reçus activés." });
  }
};

module.exports = { getTotalCollected, getTaxpayersWithDueDate, getTaxpayersForNotification, sendNotification, getTaxesCreated, getActiveTaxpayers, getRecentPayments, getOverduePayments, getActiveReceipts };
