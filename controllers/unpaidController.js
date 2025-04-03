// controllers/unpaidController.js

const UnpaidTax = require("../models/UnpaidTax");
const Taxpayer = require("../models/Taxpayer");

const Payment = require("../models/Payment");



// const getUnpaidTaxReceipt = async (req, res) => {
//   const { unpaidTaxId } = req.params;

//   try {
//     const unpaidTax = await UnpaidTax.findById(unpaidTaxId)
//       .populate({
//         path: 'taxpayer',
//         populate: { path: 'user', select: 'name phone email' } // On peuple 'user' avec les champs name, phone et email
//       })
//       .populate('tax', 'name amount')
//       .populate('collector', 'name');

//     if (!unpaidTax) {
//       return res.status(404).json({ message: 'Impaye introuvable.' });
//     }

//     const receiptData = {
//       taxpayerName: unpaidTax.taxpayer.user.name,   // Nom du contribuable
//       taxpayerPhone: unpaidTax.taxpayer.user.phone, // Téléphone du contribuable
//       taxpayerEmail: unpaidTax.taxpayer.user.email, // Email du contribuable
//       taxName: unpaidTax.tax.name,
//       amountUnpaid: unpaidTax.amountUnpaid,
//       paidAmount: unpaidTax.paidAmount,
//       remainingAmount: unpaidTax.remainingAmount,
//       dueDate: unpaidTax.originalDueDate,
//       collectorName: unpaidTax.collector.name,
//       paymentDate: new Date(),
//     };

//     res.status(200).json(receiptData);  // Renvoie les données pour le frontend
//   } catch (error) {
//     console.error('[getUnpaidTaxReceipt] - Erreur:', error.message);
//     return res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };

const getUnpaidTaxReceipt = async (req, res) => {
  const { unpaidTaxId } = req.params;

  try {
    const unpaidTax = await UnpaidTax.findById(unpaidTaxId)
      .populate({
        path: 'taxpayer',
        populate: { path: 'user', select: 'name phone email' } // Peupler le taxpayer avec user (nom, téléphone, email)
      })
      .populate('tax', 'name amount')
      .populate({
        path: 'collector',
        populate: { path: 'user', select: 'name phone' } // Peupler le collector avec user (nom, téléphone)
      });

    if (!unpaidTax) {
      return res.status(404).json({ message: 'Impaye introuvable.' });
    }

    // Préparation des données à renvoyer
    const receiptData = {
      taxpayerName: unpaidTax.taxpayer.user.name,   // Nom du contribuable
      taxpayerPhone: unpaidTax.taxpayer.user.phone, // Téléphone du contribuable
      taxpayerEmail: unpaidTax.taxpayer.user.email, // Email du contribuable
      taxName: unpaidTax.tax.name,                  // Nom de la taxe
      amountUnpaid: unpaidTax.amountUnpaid,         // Montant total impayé
      paidAmount: unpaidTax.paidAmount,             // Montant payé
      remainingAmount: unpaidTax.remainingAmount,   // Montant restant à payer
      dueDate: unpaidTax.originalDueDate,           // Date d'échéance
      collectorName: unpaidTax.collector.user.name, // Nom du collecteur
      collectorPhone: unpaidTax.collector.user.phone, // Téléphone du collecteur
      paymentDate: new Date(),                      // Date du paiement (actuelle)
    };

    res.status(200).json(receiptData);  // Renvoie les données pour le frontend
  } catch (error) {
    console.error('[getUnpaidTaxReceipt] - Erreur:', error.message);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


const payUnpaidTax = async (req, res) => {
  try {
    const { unpaidTaxId, amountPaid } = req.body;

    if (!unpaidTaxId || !amountPaid || amountPaid <= 0) {
      return res.status(400).json({ message: "Données invalides ou incomplètes." });
    }

    const unpaid = await UnpaidTax.findById(unpaidTaxId);
    if (!unpaid) {
      return res.status(404).json({ message: "Impayé introuvable." });
    }

    if (amountPaid > unpaid.remainingAmount) {
      return res.status(400).json({ message: "Le montant payé dépasse le reste dû." });
    }

    // Mise à jour de l'impayé
    unpaid.paidAmount += Number(amountPaid);
    unpaid.remainingAmount -= Number(amountPaid);

    // Statut : totalement payé
    if (unpaid.remainingAmount === 0) {
      unpaid.status = "paid";
    }

    await unpaid.save();

    // Historique dans la collection Payment
    const paymentRecord = new Payment({
      taxpayer: unpaid.taxpayer,
      tax: unpaid.tax,
      amountPaid: amountPaid,
      collector: req.user.id,
      date: new Date(),
      source: "unpaid", // ✅ Distinction avec les paiements normaux
    });

    await paymentRecord.save();

    res.status(201).json({
      message: "Paiement d'impayé enregistré avec succès.",
      payment: paymentRecord,
      unpaid: unpaid,
    });
  } catch (err) {
    console.error("❌ Erreur lors du paiement d'un impayé :", err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};




// 📌 GET /api/unpaid-taxes (pour les collecteurs)
const getUnpaidTaxes = async (req, res) => {
  try {
    const collectorId = req.user.collectorId;

    if (!collectorId) {
      return res.status(403).json({ message: "Collecteur non identifié." });
    }

    // On récupère tous les contribuables créés par ce collecteur
    const taxpayers = await Taxpayer.find({ createdBy: collectorId }, "_id");
    const taxpayerIds = taxpayers.map((tp) => tp._id);

    if (taxpayerIds.length === 0) {
      return res.status(200).json([]); // Aucun contribuable
    }

    // Récupérer tous les impayés liés aux contribuables du collecteur
    const unpaidTaxes = await UnpaidTax.find({ taxpayer: { $in: taxpayerIds } })
      .populate({
        path: "taxpayer",
        populate: { path: "user", select: "name phone" }
      })
      .populate("tax", "name");

    res.status(200).json(unpaidTaxes);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des impayés :", err.message);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des impayés." });
  }
};







module.exports = {
    payUnpaidTax,
    getUnpaidTaxes,
    getUnpaidTaxReceipt,
   
    
};

