

const TaxpayerTax = require('../models/TaxpayerTax');
const Taxpayer = require('../models/Taxpayer');
const ReceiptBatch = require('../models/ReceiptBatch'); // Assurez-vous du chemin correct vers le modèle

const Tax = require('../models/Tax');
const Payment = require('../models/Payment');

const MarketTaxPayment = require('../models/MarketTaxPayment'); // Assurez-vous que le chemin est correct

const logger = require("../utils/logger"); // Import du logger
const { sendSMS } = require('../utils/sendSMS');



const UnpaidTax = require('../models/UnpaidTax'); // Si pas encore fait





// const addUnpaidPayment = async (req, res) => {
//   try {
//     const { taxpayerId, taxId, unpaidTaxId, amountPaid } = req.body;

//     if (!taxpayerId || !taxId || !unpaidTaxId || !amountPaid) {
//       return res.status(400).json({ message: "Données manquantes." });
//     }

//     const unpaidTax = await UnpaidTax.findById(unpaidTaxId);
//     if (!unpaidTax) {
//       return res.status(404).json({ message: "Impayé introuvable." });
//     }

//     if (amountPaid > unpaidTax.remainingAmount) {
//       return res.status(400).json({ message: "Le montant payé dépasse l’impayé." });
//     }

//     // 🔥 Ajouter le paiement dans le tableau `payments` de UnpaidTax
//     unpaidTax.payments.push({
//       amount: amountPaid,
//       date: new Date(),
//       collector: req.user.id,
//     });

//     // 🔥 Mettre à jour les montants
//     unpaidTax.paidAmount += amountPaid;
//     unpaidTax.remainingAmount -= amountPaid;

//     // 🔥 Mise à jour du statut
//     if (unpaidTax.remainingAmount <= 0) {
//       unpaidTax.status = "paid";
//       unpaidTax.remainingAmount = 0; // Assurez-vous que c'est bien zéro
//     } else {
//       unpaidTax.status = "in progress";
//     }

//     await unpaidTax.save();

//     // ✅ Enregistrer le paiement dans `Payment` pour l’historique général
//     const payment = new Payment({
//       taxpayer: taxpayerId,
//       tax: taxId,
//       amountPaid,
//       collector: req.user.id,
//       date: new Date(),
//       source: "unpaid", // ✅ Indicateur de paiement d'impayé
//     });

//     await payment.save();

//     res.status(201).json({
//       message: "Paiement de l’impayé enregistré avec succès.",
//       paymentId: payment._id,
//       remainingAmount: unpaidTax.remainingAmount,
//     });

//   } catch (err) {
//     console.error("❌ Erreur paiement impayé :", err.message);
//     res.status(500).json({ message: "Erreur serveur." });
//   }
// };



const addUnpaidPayment = async (req, res) => {
  try {
    const { taxpayerId, taxId, unpaidTaxId, amountPaid } = req.body;

    if (!taxpayerId || !taxId || !unpaidTaxId || !amountPaid) {
      return res.status(400).json({ message: "Données manquantes." });
    }

    const unpaidTax = await UnpaidTax.findById(unpaidTaxId)
      .populate('taxpayer', 'user')  // On récupère l'utilisateur complet
      .populate('tax', 'name amount')
      .populate('collector', 'name');

    if (!unpaidTax) {
      return res.status(404).json({ message: "Impayé introuvable." });
    }

    if (amountPaid > unpaidTax.remainingAmount) {
      return res.status(400).json({ message: "Le montant payé dépasse l’impayé." });
    }

    // 🔥 Ajouter le paiement dans le tableau `payments` de UnpaidTax
    unpaidTax.payments.push({
      amount: amountPaid,
      date: new Date(),
      collector: req.user.id,
    });

    // 🔥 Mettre à jour les montants
    unpaidTax.paidAmount += amountPaid;
    unpaidTax.remainingAmount -= amountPaid;

    if (unpaidTax.remainingAmount <= 0) {
      unpaidTax.status = "paid";
      unpaidTax.remainingAmount = 0;
    } else {
      unpaidTax.status = "in progress";
    }

    await unpaidTax.save();

    const payment = new Payment({
      taxpayer: taxpayerId,
      tax: taxId,
      amountPaid,
      collector: req.user.id,
      date: new Date(),
      source: "unpaid",
    });

    await payment.save();

    // const paymentDetails = {
    //   taxpayer: unpaidTax.taxpayer?.user || { name: 'N/A', phone: 'N/A' },
    //   tax: unpaidTax.tax || { name: 'N/A', amount: 0 },
    //   totalAmount: unpaidTax.amountUnpaid,
    //   paidAmount: amountPaid, // 🔥 Ce paiement spécifique
    //   totalPaid: unpaidTax.paidAmount, // 🔥 Montant cumulé payé
    //   remainingAmount: unpaidTax.remainingAmount,
    //   dueDate: unpaidTax.originalDueDate,
    //   collector: req.user.name || 'Inconnu',
    //   paymentDate: new Date(),
    //   payments: unpaidTax.payments || []
    // };


    const paymentDetails = {
      taxpayer: unpaidTax.taxpayer?.user || { name: 'N/A', phone: 'N/A' },
      tax: unpaidTax.tax || { name: 'N/A', amount: 0 },
      totalAmount: unpaidTax.amountUnpaid,
      paidAmount: amountPaid, // 🔥 Met à jour ici
      totalPaid: unpaidTax.paidAmount,
      remainingAmount: unpaidTax.remainingAmount,
      dueDate: unpaidTax.originalDueDate,
      collector: req.user.name || 'Inconnu',
      paymentDate: new Date(),
      payments: unpaidTax.payments || []
    };
    

    return res.status(201).json({
      message: "Paiement de l’impayé enregistré avec succès.",
      paymentId: payment._id,
      paymentDetails
    });

  } catch (err) {
    console.error("❌ Erreur paiement impayé :", err.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};







const addMarketTaxPayment = async (req, res) => {
  try {
    console.log("📥 Données reçues pour le paiement :", req.body);

    const { receiptId, confirmationCode, amountPaid } = req.body;

    // Validation des données requises
    if (!receiptId || !confirmationCode || !amountPaid) {
      console.error("❌ Données manquantes :", { receiptId, confirmationCode, amountPaid });
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    console.log("🔍 Recherche du lot activé contenant le reçu...");
    // Rechercher le lot activé contenant le reçu
    const receiptBatch = await ReceiptBatch.findOne({
      status: 'Activated', // Statut activé
      "confirmationCodes.receipt": receiptId, // Reçu spécifique
    });

    if (!receiptBatch) {
      console.error("❌ Lot activé introuvable pour le reçu :", receiptId);
      return res.status(404).json({ message: 'Reçu introuvable dans ce lot.' });
    }

    console.log("✅ Lot activé trouvé :", JSON.stringify(receiptBatch, null, 2));

    // Trouver le sous-document correspondant dans `confirmationCodes`
    const receipt = receiptBatch.confirmationCodes.find((code) => code.receipt === receiptId);

    if (!receipt) {
      console.error("❌ Reçu introuvable dans le lot :", receiptId);
      return res.status(404).json({ message: 'Reçu introuvable dans ce lot.' });
    }

    console.log("✅ Reçu trouvé :", receipt);

    // Vérification du statut du reçu
    if (receipt.status !== 'Activated') {
      console.warn("⚠️ Reçu non activé ou déjà utilisé :", receiptId);
      return res.status(400).json({ message: 'Reçu non activé ou déjà utilisé.' });
    }

    // Validation du code de confirmation
    if (confirmationCode !== receipt.code) {
      console.error("❌ Code de confirmation incorrect :", confirmationCode);
      return res.status(400).json({ message: 'Code de confirmation incorrect.' });
    }

    // Validation du montant payé
    if (amountPaid <= 0) {
      console.error("❌ Montant invalide :", amountPaid);
      return res.status(400).json({ message: 'Montant invalide.' });
    }

    console.log("💾 Enregistrement du paiement...");
    // Enregistrer le paiement
    const marketTaxPayment = new MarketTaxPayment({
      receipt: receiptId, // Numéro du reçu utilisé
      confirmationCode, // Code validé
      amount: amountPaid,
      collector: receiptBatch.collector, // ID du collecteur depuis le batch
      market: receiptBatch.market, // ID du marché associé
      paymentDate: new Date(),
    });

    await marketTaxPayment.save(); // Sauvegarde dans la base de données
    console.log("✅ Paiement enregistré :", marketTaxPayment);

    // Mettre à jour le statut du reçu
    receipt.status = 'Used'; // Statut mis à "Utilisé"
    await receiptBatch.save(); // Sauvegarder les modifications du lot

    console.log("✅ Reçu marqué comme utilisé !");
    return res.status(201).json({ message: 'Paiement enregistré avec succès.', data: marketTaxPayment });
  } catch (err) {
    console.error("❌ Erreur lors de l'enregistrement du paiement :", err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};



const addPayment = async (req, res) => {
  try {
    const { taxpayerId, taxId, amountPaid } = req.body;

    logger.info("📥 Tentative d'ajout d'un paiement...");
    logger.info("📌 Données reçues :", { taxpayerId, taxId, amountPaid });

    if (!taxpayerId || !taxId || !amountPaid) {
      logger.warn("⚠️ Données manquantes ou invalides.");
      return res.status(400).json({ message: "Données manquantes ou invalides." });
    }

    const taxpayer = await Taxpayer.findById(taxpayerId).populate("user", "name phone");
    if (!taxpayer) {
      logger.warn(`⚠️ Contribuable introuvable : ${taxpayerId}`);
      return res.status(404).json({ message: "Contribuable introuvable." });
    }

    const tax = await Tax.findById(taxId);
    if (!tax) {
      logger.warn(`⚠️ Taxe introuvable : ${taxId}`);
      return res.status(404).json({ message: "Taxe introuvable." });
    }

    // Recherche uniquement de l'entrée active ("pending")
    // const taxpayerTax = await TaxpayerTax.findOne({
    //   taxpayer: taxpayerId,
    //   tax: taxId,
    //   status: 'pending'
    // }).sort({ dueDate: -1 });

// 🔍 Recherche de l'entrée active (plus précise)
const taxpayerTax = await TaxpayerTax.findOne({
  taxpayer: taxpayerId,
  tax: taxId,
  status: 'pending'
}).sort({ dueDate: -1 });

if (!taxpayerTax) {
  logger.warn("⚠️ Aucune taxe en cours trouvée (cycle actif introuvable).");
  return res.status(404).json({ message: "Aucune taxe en cours à payer." });
}

// 🔥 Vérification de la validité de la taxe renouvelée
const today = new Date();
if (new Date(taxpayerTax.dueDate) < today) {
  logger.warn("⚠️ Taxe trouvée, mais sa date d'échéance est passée. Ce n'est pas l'entrée renouvelée.");
  return res.status(404).json({ message: "La taxe trouvée est expirée. Vérifiez si elle a été renouvelée." });
}


    if (!taxpayerTax) {
      logger.warn("⚠️ Aucune taxe en cours trouvée (cycle actif introuvable).");
      return res.status(404).json({ message: "Aucune taxe en cours à payer." });
    }

    if (amountPaid > taxpayerTax.remainingAmount) {
      logger.warn("⚠️ Le montant payé dépasse le montant restant.");
      return res.status(400).json({ message: "Le montant payé dépasse le montant restant pour cette taxe." });
    }

    // Mise à jour de l'entrée active
// Mise à jour de l'entrée active
const newPaymentEntry = {
  amount: amountPaid,
  date: new Date(),
  collector: req.user.id,
};

taxpayerTax.payments.push(newPaymentEntry);
taxpayerTax.remainingAmount -= Number(amountPaid);
taxpayerTax.paidAmount += Number(amountPaid);

// Si le montant restant est 0, marquer la taxe comme payée et renouvelée
if (taxpayerTax.remainingAmount === 0) {
  taxpayerTax.status = "paid";  // Marquer comme payée
  taxpayerTax.isRenewed = true; // Marquer comme renouvelée
  taxpayerTax.renewedAt = today; // Mettre à jour la date de renouvellement
}

await taxpayerTax.save();

    // Création de l'enregistrement dans Payment pour l'historique
    const newPayment = new Payment({
      taxpayer: taxpayerId,
      tax: taxId,
      amountPaid,
      collector: req.user.id,
      date: new Date(),
      source: 'regular' // ✅ Paiement régulier
    });
    await newPayment.save();
    logger.info("✅ Paiement enregistré dans la collection `Payment` :", newPayment);

    // Envoi du SMS
    const taxpayerUser = taxpayer.user;
    if (taxpayerUser && taxpayerUser.phone) {
      const message = `Paiement recu !
Cher(e) ${taxpayerUser.name}, nous avons recu ${amountPaid} FCFA pour la taxe ${tax.name}.
Reste à payer : ${taxpayerTax.remainingAmount} FCFA.`;
      logger.info(`📲 Tentative d'envoi du SMS à ${taxpayerUser.phone}...`);
     const smsSent = await sendSMS(taxpayerUser.phone, message);
      if (smsSent) {
        logger.info(`✅ SMS envoyé avec succès à ${taxpayerUser.phone}`);
      } else {
        logger.error(`❌ Échec de l'envoi du SMS à ${taxpayerUser.phone}`);
      }
    } else {
      logger.warn("⚠️ Aucun numéro de téléphone disponible pour l'envoi du SMS.");
    }

    res.status(201).json({
      message: "Paiement enregistré avec succès.",
      paymentId: newPayment._id,
      taxpayer: { name: taxpayerUser.name, phone: taxpayerUser.phone },
      tax: { name: tax.name },
      amountPaid,
      remainingAmount: taxpayerTax.remainingAmount,
    });

  } catch (err) {
    logger.error("❌ Erreur lors de l’enregistrement du paiement :", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};



const getPayments = async (req, res) => {
  try {
    console.log("===> Début de la récupération des paiements...");

    const collectorId = req.user.collectorId; // 🔥 ID du collecteur connecté
    if (!collectorId) {
      console.error("❌ Erreur : ID du collecteur non trouvé");
      return res.status(400).json({ message: "Impossible d'identifier le collecteur." });
    }

    console.log(`🔍 Récupération des paiements pour le collecteur : ${collectorId}`);

    // 🔥 Récupérer les contribuables créés par ce collecteur
    const taxpayers = await Taxpayer.find({ createdBy: collectorId }, "_id");
    const taxpayerIds = taxpayers.map(t => t._id);
    console.log(`📋 Contribuables assignés au collecteur :`, taxpayerIds);

    if (taxpayerIds.length === 0) {
      console.log("⚠️ Aucun contribuable trouvé pour ce collecteur.");
      return res.status(200).json([]); // ✅ Retourne une liste vide au lieu d'une erreur
    }

    // ✅ Filtrer les paiements liés aux contribuables créés par ce collecteur
    const payments = await TaxpayerTax.find({ taxpayer: { $in: taxpayerIds } })
      .populate({
        path: "taxpayer",
        populate: { path: "user", select: "name phone" }, // Nom et téléphone du contribuable
      })
      .populate("tax", "name") // Peupler uniquement la taxe
      .populate({
        path: "payments.collector", // Peupler le collecteur
        select: "name",
      })
      .lean();

    if (!payments || payments.length === 0) {
      console.log(`⚠️ Aucun paiement trouvé pour les contribuables du collecteur ${collectorId}`);
      return res.status(200).json([]); // ✅ Retourne une liste vide au lieu d'une erreur
    }

    console.log(`✅ ${payments.length} paiements trouvés pour le collecteur ${collectorId}`);

    // ✅ Formatage des données
    const formattedPayments = payments.map((payment) => ({
      id: payment._id || "ID non disponible",
      taxpayer: payment.taxpayer
        ? {
            id: payment.taxpayer._id || "ID contribuable non disponible",
            name: payment.taxpayer.user?.name || "Nom inconnu",
            phone: payment.taxpayer.user?.phone || "Téléphone inconnu",
          }
        : { name: "Contribuable inconnu", phone: "N/A" },
      tax: payment.tax
        ? {
            id: payment.tax._id || "ID taxe non disponible",
            name: payment.tax.name || "Taxe inconnue",
          }
        : { name: "Taxe inconnue" },
      totalAmount: payment.totalAmount || 0,
      paidAmount: payment.paidAmount || 0,
      remainingAmount: payment.remainingAmount || 0,
      status: payment.status || "pending", // ✅ Ajout du statut ici
      dueDate: payment.dueDate
        ? new Date(payment.dueDate).toLocaleDateString("fr-FR")
        : "Date inconnue",
      payments: payment.payments.map((p) => ({
        amount: p.amount || 0,       
        date: p.date ? new Date(p.date).toLocaleDateString("fr-FR") : "Date inconnue",
        collector: p.collector?.name || "Non attribué",
      })),
    }));

    console.log("✅ Paiements formatés envoyés au frontend :", formattedPayments);

    res.status(200).json(formattedPayments);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des paiements :", err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};





const addOccupationPayment = async (req, res) => {
  try {
    const { taxpayerId, taxId, surface } = req.body;
    logger.info("Demande d'enregistrement d'un paiement d'occupation", { taxpayerId, taxId, surface });

    // Validation des données reçues
    if (!taxpayerId || !taxId || !surface || surface <= 0) {
      logger.warn("Données manquantes ou surface invalide", { taxpayerId, taxId, surface });
      return res.status(400).json({ message: "Données manquantes ou surface invalide." });
    }

    // Récupérer la taxe pour obtenir le taux (ex : 5000 FCFA par m²)
    const tax = await Tax.findById(taxId);
    if (!tax) {
      logger.warn("Taxe introuvable", { taxId });
      return res.status(404).json({ message: "Taxe introuvable." });
    }

    // Calculer le montant à payer : surface * taux (tax.amount)
    const calculatedAmount = surface * tax.amount;
    logger.info(`Montant calculé: ${surface} m² x ${tax.amount} = ${calculatedAmount}`);

    // Créer un nouveau paiement dans la collection Payment
    const newPayment = new Payment({
      taxpayer: taxpayerId,
      tax: taxId,
      amountPaid: calculatedAmount,
      surface, // Enregistrement de la surface utilisée pour le calcul
      collector: req.user.id, // L'ID du collecteur connecté (provenant de authMiddleware)
      date: new Date()
    });
    await newPayment.save();
    logger.info("Enregistrement dans Payment réussi", newPayment);

    // Mettre à jour le document TaxpayerTax pour ce contribuable et cette taxe
    const taxpayerTax = await TaxpayerTax.findOne({ taxpayer: taxpayerId, tax: taxId });
    if (!taxpayerTax) {
      logger.warn("Document TaxpayerTax introuvable", { taxpayerId, taxId });
      return res.status(404).json({ message: "Aucune association trouvée entre le contribuable et cette taxe." });
    }

    // Mise à jour des montants cumulés
    taxpayerTax.paidAmount += calculatedAmount;
    taxpayerTax.remainingAmount -= calculatedAmount;

    // Ajouter l'entrée dans l'historique des paiements partiels
    taxpayerTax.payments.push({
      amount: calculatedAmount,
      date: new Date(),
      collector: req.user.id
    });

    // Si le montant restant est nul (ou négatif), mettre à jour le statut et fixer remainingAmount à 0
    if (taxpayerTax.remainingAmount <= 0) {
      taxpayerTax.status = 'paid';
      taxpayerTax.remainingAmount = 0;
    }

    await taxpayerTax.save();
    logger.info("Mise à jour de TaxpayerTax réussie", taxpayerTax);

    res.status(201).json({
      message: "Paiement d'occupation enregistré avec succès.",
      payment: newPayment,
      taxpayerTax
    });
  } catch (error) {
    logger.error("Erreur lors de l'enregistrement du paiement d'occupation :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};





// const getPaymentReceipt = async (req, res) => {
//   try {
//     const { paymentId } = req.params;
//     console.log('[getPaymentReceipt] - Recherche du paiement avec ID :', paymentId);

//     // Récupération du document Payment avec population imbriquée
//     const payment = await Payment.findById(paymentId)
//       .populate({
//         path: 'taxpayer',
//         populate: { path: 'user', select: 'name phone' }
//       })
//       .populate('tax', 'name amount supportRates')
//       .populate('collector', 'name');

//     console.log('[getPaymentReceipt] - Document Payment trouvé :', payment);
//     if (!payment) {
//       console.error('[getPaymentReceipt] - Paiement non trouvé pour l’ID :', paymentId);
//       return res.status(404).json({ message: 'Paiement non trouvé' });
//     }

//     // Récupérer l'entrée active de TaxpayerTax (taxe payée ou impayée)
//     const taxpayerTax = await TaxpayerTax.find({
//       taxpayer: payment.taxpayer._id,
//       tax: payment.tax._id,
//       status: { $in: ['pending', 'archived'] } // Recherche des taxes actives ou archivées
//     })
//     .sort({ dueDate: -1 })
//     .limit(1);

//     const unpaidTax = await UnpaidTax.findOne({
//       taxpayer: payment.taxpayer._id,
//       tax: payment.tax._id,
//       status: 'unpaid'
//     });

//     console.log('[getPaymentReceipt] - TaxpayerTax trouvé :', taxpayerTax);
//     console.log('[getPaymentReceipt] - UnpaidTax trouvé :', unpaidTax);

//     let paymentDetails = {};

//     if (taxpayerTax && taxpayerTax.length > 0) {
//       // Si la taxe est payée ou archivée
//       const taxEntry = taxpayerTax[0];  // La plus récente

//       paymentDetails = {
//         ...payment.toObject(),
//         surface: taxEntry?.surface || payment.surface,
//         totalAmount: taxEntry.totalAmount,
//         totalPaid: taxEntry.paidAmount,
//         remainingAmount: taxEntry.remainingAmount,
//         dueDate: taxEntry.dueDate,
//       };
//     } else if (unpaidTax) {
//       // Si c'est un impayé
//       paymentDetails = {
//         ...payment.toObject(),
//         surface: unpaidTax?.surface || payment.surface,
//         totalAmount: unpaidTax.amountUnpaid,
//         totalPaid: unpaidTax.paidAmount,
//         remainingAmount: unpaidTax.remainingAmount,
//         dueDate: unpaidTax.originalDueDate,
//         reason: unpaidTax.reason,
//         status: unpaidTax.status,
//       };
//     }

//     console.log('[getPaymentReceipt] - Détails complets du paiement construits :', paymentDetails);
//     return res.status(200).json(paymentDetails);
//   } catch (error) {
//     console.error('[getPaymentReceipt] - Erreur :', error.message);
//     return res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };



const getPaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log('[getPaymentReceipt] - Recherche du paiement avec ID :', paymentId);

    // Récupération du document Payment avec population imbriquée
    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'taxpayer',
        populate: { path: 'user', select: 'name phone' }
      })
      .populate('tax', 'name amount supportRates')
      .populate('collector', 'name');

    console.log('[getPaymentReceipt] - Document Payment trouvé :', payment);
    if (!payment) {
      console.error('[getPaymentReceipt] - Paiement non trouvé pour l’ID :', paymentId);
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Récupérer la taxe payée ou archivée (taxpayerTax)
    const taxpayerTax = await TaxpayerTax.find({
      taxpayer: payment.taxpayer._id,
      tax: payment.tax._id,
      status: { $in: ['pending', 'paid'] }  // Recherche des taxes payées ou en attente
    })
      .sort({ dueDate: -1 })  // Trier pour récupérer la plus récente
      .limit(1);  // Limiter à une seule entrée

    // Récupérer la taxe impayée
    const unpaidTax = await UnpaidTax.findOne({
      taxpayer: payment.taxpayer._id,
      tax: payment.tax._id,
      status: 'unpaid'
    });

    console.log('[getPaymentReceipt] - TaxpayerTax trouvé :', taxpayerTax);
    console.log('[getPaymentReceipt] - UnpaidTax trouvé :', unpaidTax);

    let paymentDetails = {};

    // Si la taxe est payée
    if (taxpayerTax && taxpayerTax.length > 0) {
      const taxEntry = taxpayerTax[0];  // La plus récente

      paymentDetails = {
        ...payment.toObject(),
        surface: taxEntry?.surface || payment.surface,
        totalAmount: taxEntry.totalAmount,
        totalPaid: taxEntry.paidAmount,
        remainingAmount: taxEntry.remainingAmount,
        dueDate: taxEntry.dueDate,
        status: taxEntry.status, // Le statut restera "paid" ici
      };

      // Si le paiement est complet (remainingAmount === 0), on garde "paid"
      if (taxEntry.remainingAmount === 0) {
        paymentDetails.status = 'paid';  // Conserver "paid" si le paiement est complet
      }
    }

    // Si la taxe est impayée
    if (unpaidTax) {
      paymentDetails = {
        ...payment.toObject(),
        surface: unpaidTax?.surface || payment.surface,
        totalAmount: unpaidTax.amountUnpaid,
        totalPaid: unpaidTax.paidAmount,
        remainingAmount: unpaidTax.remainingAmount,
        dueDate: unpaidTax.originalDueDate,
        reason: unpaidTax.reason,
        status: unpaidTax.status,
      };
    }

    console.log('[getPaymentReceipt] - Détails complets du paiement construits :', paymentDetails);
    return res.status(200).json(paymentDetails);
  } catch (error) {
    console.error('[getPaymentReceipt] - Erreur :', error.message);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};





const getTaxpayers = async (req, res) => {
  try {
      const { page = 1, limit = 20, search = '' } = req.query;

      const query = search
          ? { 'user.name': { $regex: search, $options: 'i' } }
          : {};

      const taxpayers = await Taxpayer.find(query)
          .populate('user', 'name phone')
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .exec();

      const total = await Taxpayer.countDocuments(query);

      res.json({ taxpayers, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
  }
};




const getPaymentsSummary = async (req, res) => {
  console.log("📥 Début de la récupération des paiements...");

  try {
    let { month, year, phone } = req.query;
    console.log("🔎 Paramètres reçus :", { month, year, phone });

    let filter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
      console.log("📅 Filtre appliqué :", filter);
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
      console.log("📅 Filtre appliqué pour toute l'année :", filter);
    }

    console.log("🔄 Exécution de la requête d'agrégation...");

    let matchPhoneFilter = {};
    if (phone) {
      matchPhoneFilter = { 'userDetails.phone': phone };
      console.log("📞 Filtrage par numéro de téléphone :", phone);
    }

    const payments = await Payment.aggregate([
      { $match: filter },

      // 🔄 Jointure avec `Taxpayer` pour récupérer l'ID du `user`
      {
        $lookup: {
          from: 'taxpayers',
          localField: 'taxpayer',
          foreignField: '_id',
          as: 'taxpayerDetails',
        },
      },
      { $unwind: '$taxpayerDetails' },

      // 🔄 Jointure avec `User` pour récupérer le nom et le téléphone du contribuable
      {
        $lookup: {
          from: 'users',
          localField: 'taxpayerDetails.user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },

      // 🔄 Filtrage par téléphone s'il est fourni
      { $match: matchPhoneFilter },

      // 🔄 Jointure avec `User` pour récupérer le nom du collecteur
      {
        $lookup: {
          from: 'users',
          localField: 'collector',
          foreignField: '_id',
          as: 'collectorDetails',
        },
      },
      { $unwind: '$collectorDetails' },

      {
        $group: {
          _id: {
            collector: '$collectorDetails.name',
            taxpayer: '$userDetails.name', // ✅ Nom du contribuable
            taxpayerPhone: '$userDetails.phone', // ✅ Téléphone du contribuable
          },
          totalAmount: { $sum: '$amountPaid' },
          payments: { $push: { date: '$date', amount: '$amountPaid' } },
        },
      },
    ]);

    console.log("📊 Nombre total de paiements trouvés :", payments.length);
    console.log("✅ Paiements récupérés :", JSON.stringify(payments, null, 2));

    res.status(200).json(payments);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des paiements :", err.message);
    res.status(500).json({ message: "Erreur lors de la récupération des paiements." });
  }
};




  module.exports = { addUnpaidPayment, addPayment, getPayments, addMarketTaxPayment, addOccupationPayment , getPaymentReceipt, getTaxpayers , getPaymentsSummary};






