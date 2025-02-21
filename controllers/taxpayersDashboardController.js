const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Tax = require('../models/Tax');
const User = require('../models/User');
const Taxpayer = require('../models/Taxpayer');

const getPaymentHistory = async (req, res) => {
    console.log('===== Début du contrôleur getPaymentHistory =====');
    console.log('Requête reçue sur /payment-history');
    console.log('Utilisateur extrait du token :', req.user);
  
    try {
      // ID utilisateur connecté depuis le token
      const userId = req.user.id;
      const userRole = req.user.role;
      const userPhone = req.user.phone;
  
      console.log('ID utilisateur connecté :', userId);
      console.log('Rôle utilisateur :', userRole);
      console.log('Téléphone utilisateur :', userPhone);
  
      // Assurez-vous que l'utilisateur a le rôle requis
      if (userRole !== 'contribuable') {
        console.error(`Accès refusé : rôle requis "contribuable", rôle actuel "${userRole}"`);
        return res.status(403).json({ message: 'Accès interdit, rôle insuffisant.' });
      }
  
      // Trouver le contribuable associé à cet utilisateur
      console.log(`Recherche du contribuable avec le téléphone : ${userPhone}`);
      const taxpayer = await Taxpayer.findOne({ phone: userPhone });
      if (!taxpayer) {
        console.error('Contribuable non trouvé pour cet utilisateur.');
        return res.status(404).json({ message: 'Contribuable non trouvé.' });
      }
  
      console.log('Contribuable trouvé :', taxpayer);
  
      // Rechercher les paiements pour ce contribuable
      console.log(`Recherche des paiements pour le contribuable avec l'ID : ${taxpayer._id}`);
      const payments = await Payment.find({ taxpayer: taxpayer._id })
        .populate('collector', 'name') // Inclure les infos du collecteur
        .populate('tax', 'name amount'); // Inclure les infos sur la taxe
  
      console.log('Paiements trouvés pour ce contribuable :', payments);
  
      res.status(200).json({ payments });
    } catch (err) {
      console.error('Erreur lors de la récupération des paiements :', err.message);
      res.status(500).json({ message: 'Erreur lors de la récupération des paiements.', error: err.message });
    } finally {
      console.log('===== Fin du contrôleur getPaymentHistory =====');
    }
  };
  

  

module.exports = { getPaymentHistory };
