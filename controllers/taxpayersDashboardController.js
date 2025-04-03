// 📌 Importation des modules nécessaires
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const User = require('../models/User');
const Taxpayer = require('../models/Taxpayer');



const TaxpayerTax = require('../models/TaxpayerTax');
const Tax = require('../models/Tax');




const getTotalPaid = async (req, res) => {
    try {
      console.log('🔍 Début de la récupération du montant total payé...');
      console.log('📌 ID du contribuable connecté :', req.user.taxpayerId);
  
      // 1. Rechercher les paiements réguliers (source: 'regular')
      const regularPayments = await Payment.find({
        taxpayer: req.user.taxpayerId,
        source: 'regular', // Filtrer les paiements réguliers
      }).select('amountPaid'); // On ne sélectionne que le montant payé
  
      console.log('📋 Paiements réguliers trouvés :', regularPayments);
  
      // 2. Rechercher les paiements impayés (source: 'unpaid')
      const unpaidPayments = await Payment.find({
        taxpayer: req.user.taxpayerId,
        source: 'unpaid', // Filtrer les paiements impayés
      }).select('amountPaid'); // On ne sélectionne que le montant payé
  
      console.log('📋 Paiements impayés trouvés :', unpaidPayments);
  
      // 3. Calculer le montant total payé en additionnant les montants des paiements réguliers et impayés
      const totalPaidFromRegular = regularPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
      const totalPaidFromUnpaid = unpaidPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
  
      // 4. Total payé
      const totalPaid = totalPaidFromRegular + totalPaidFromUnpaid;
  
      console.log('💰 Montant total payé (régulier + impayé) :', totalPaid);
  
      res.status(200).json({
        totalPaid: totalPaid || 0
      });
    } catch (err) {
      console.error('❌ Erreur lors de la récupération du montant total payé :', err.message);
      res.status(500).json({
        message: 'Erreur lors de la récupération du montant total payé.',
        error: err.message
      });
    }
  };
  




const getTotalMonthlyAndAnnualDue = async (req, res) => {
    try {
        console.log('🔍 Début de la récupération des taxes mensuelles et annuelles...');
        console.log('📌 ID du contribuable connecté :', req.user.taxpayerId);

        // Rechercher les taxes associées au contribuable
        const taxpayerTaxes = await TaxpayerTax.find({ taxpayer: req.user.taxpayerId })
            .populate({
                path: 'tax',
                select: 'name frequency' // On récupère le nom et la fréquence de la taxe
            });

        console.log('📋 Taxes associées trouvées :', taxpayerTaxes);

        // Filtrer et calculer les montants
        const totalMonthlyDue = taxpayerTaxes
            .filter(taxpayerTax => taxpayerTax.tax.frequency === 'monthly')
            .reduce((sum, taxpayerTax) => sum + (taxpayerTax.totalAmount || 0), 0);

        const totalAnnualDue = taxpayerTaxes
            .filter(taxpayerTax => taxpayerTax.tax.frequency === 'annual')
            .reduce((sum, taxpayerTax) => sum + (taxpayerTax.totalAmount || 0), 0);

        console.log('💰 Montant total mensuel dû :', totalMonthlyDue);
        console.log('💰 Montant total annuel dû :', totalAnnualDue);

        res.status(200).json({
            totalMonthlyDue: totalMonthlyDue || 0,
            totalAnnualDue: totalAnnualDue || 0
        });
    } catch (err) {
        console.error('❌ Erreur lors de la récupération des montants totaux mensuels et annuels :', err.message);
        res.status(500).json({
            message: 'Erreur lors de la récupération des montants totaux mensuels et annuels.',
            error: err.message
        });
    }
};









const getTotalDue = async (req, res) => {
    console.log('🔍 Début de la récupération du montant total dû...');
    try {
        // Récupération de l'ID du contribuable depuis le token
        const taxpayerId = req.user.taxpayerId;
        console.log('📌 ID du contribuable connecté :', taxpayerId);

        // Vérification si l'utilisateur est bien un contribuable
        if (req.user.role !== 'contribuable') {
            console.error('❌ Accès refusé : rôle non autorisé.');
            return res.status(403).json({ message: 'Accès refusé. Rôle non autorisé.' });
        }

        // ✅ Nouvelle approche : Récupération de TaxpayerTax avec les informations sur les taxes
        const taxes = await TaxpayerTax.find({ 
            taxpayer: taxpayerId, 
            status: { $in: ['pending', 'overdue'] } // 🔥 Prendre en compte pending et overdue
        })
        .populate('tax', 'name')
        .select('remainingAmount tax');

        console.log('📋 Taxes récupérées :', taxes);

        // ✅ Calcul du montant total dû
        const totalDue = taxes.reduce((acc, tax) => acc + (tax.remainingAmount || 0), 0);

        // ✅ Réponse avec valeurs par défaut
        res.status(200).json({ 
            totalDue: totalDue || 0,  // Si undefined, retourne 0
            taxes: taxes || []        // Si undefined, retourne un tableau vide
        });

    } catch (err) {
        console.error('❌ Erreur lors de la récupération du montant total dû :', err.message);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération du montant total dû.', 
            error: err.message 
        });
    }
};



// 📌 Contrôleur pour l'historique des paiements


const getPaymentHistory = async (req, res) => {
    console.log('===== Début du contrôleur getPaymentHistory =====');
    console.log('📥 Requête reçue sur /payment-history');
    console.log('Utilisateur extrait du token :', req.user);
  
    try {
        // ID du contribuable connecté depuis le token
        const taxpayerId = req.user.taxpayerId;
        console.log('📌 ID du contribuable connecté :', taxpayerId);

        // Rechercher les paiements pour ce contribuable
        const payments = await Payment.find({ taxpayer: taxpayerId })
            .populate('tax', 'name amount') // Inclure les infos sur la taxe
            .populate('collector', 'name')  // Inclure les infos du collecteur
            .sort({ date: -1 }); // Trier par date décroissante

        console.log('✅ Paiements trouvés :', payments);

        res.status(200).json({ payments });
    } catch (err) {
        console.error('❌ Erreur lors de la récupération des paiements :', err.message);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des paiements.', 
            error: err.message 
        });
    }
};





// ✅ Contrôleur pour récupérer les détails par taxe
const getTaxDetails = async (req, res) => {
    try {
      const taxpayerId = req.user.taxpayerId;
  
      const taxDetails = await TaxpayerTax.find({
        taxpayer: taxpayerId,
        status: { $in: ['pending', 'overdue'] }
      })
      .sort({ dueDate: -1 }) // Trier par date d'échéance décroissante
      .populate('tax', 'name')
      .lean();
  
      const detailsByTax = taxDetails.map((tax) => ({
        name: tax.tax.name,
        totalAmount: tax.totalAmount,
        totalPaid: tax.paidAmount,
        remainingAmount: tax.remainingAmount || tax.totalAmount, 
      }));
  
      res.json({ detailsByTax });
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des détails par taxe :', err.message);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };
  


module.exports = { getPaymentHistory, getTotalDue,getTotalPaid, getTotalMonthlyAndAnnualDue, getTaxDetails };
