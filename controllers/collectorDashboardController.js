const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Tax = require('../models/Tax');
const Taxpayer = require('../models/Taxpayer');


// Contrôleur pour récupérer le total collecté

// Contrôleur pour récupérer le total collecté
const getTotalCollected = async (req, res) => {
    try {
      //console.log('Requête reçue pour total collecté.');
  
      // Vérifiez si req.user.id est défini
      if (!req.user || !req.user.id) {
        console.error('ID du collecteur manquant dans la requête.');
        return res.status(400).json({ message: 'ID du collecteur manquant.' });
      }
  
      const collectorId = new mongoose.Types.ObjectId(req.user.id); // Correction ici
      //console.log('ID du collecteur connecté (converti) :', collectorId);
  
      // Vérifiez les paiements associés au collecteur
      const payments = await Payment.find({ collector: collectorId });
     // console.log('Paiements trouvés pour le collecteur :', payments);
  
      if (payments.length === 0) {
        console.log('Aucun paiement trouvé pour ce collecteur.');
      }
  
      // Agrégation pour calculer le total collecté
      const totalCollected = await Payment.aggregate([
        { $match: { collector: collectorId } }, // Filtrer par collecteur
        { $group: { _id: null, total: { $sum: '$amount' } } }, // Calculer la somme
      ]);
      //console.log('Résultat de l\'agrégation :', totalCollected);
  
      const total = totalCollected.length > 0 ? totalCollected[0].total : 0;
      //console.log('Total collecté calculé :', total);
  
      res.status(200).json({ totalCollected: total });
    } catch (err) {
      console.error('Erreur lors de la récupération du total collecté :', err.message);
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
  const getActiveTaxpayers = async (req, res) => {
    try {
      const collectorId = new mongoose.Types.ObjectId(req.user.id); // Convertir l'ID en ObjectId
      //console.log('ID du collecteur connecté :', collectorId);
  
      // Filtrer les contribuables actifs attribués au collecteur
      const activeTaxpayers = await Taxpayer.countDocuments({ 
        assignedCollector: collectorId, 
        status: 'active' 
      });
      //console.log('Nombre de contribuables actifs attribués au collecteur :', activeTaxpayers);
  
      res.status(200).json({ activeTaxpayers });
    } catch (err) {
      console.error('Erreur lors de la récupération des contribuables actifs :', err.message);
      res.status(500).json({ message: 'Erreur lors de la récupération des contribuables actifs.', error: err.message });
    }
  };



  // Contrôleur pour récupérer les paiements récents
const getRecentPayments = async (req, res) => {
    try {
      const collectorId = new mongoose.Types.ObjectId(req.user.id); // ID du collecteur connecté
      //console.log('ID du collecteur connecté :', collectorId);
  
      // Calculer la date de 7 jours en arrière
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
      // Filtrer les paiements récents effectués par ce collecteur
      const recentPayments = await Payment.find({
        collector: collectorId,
        paymentDate: { $gte: sevenDaysAgo }, // Paiements après la date limite
      }).populate('taxpayer', 'name') // Récupère les informations sur le contribuable
        .populate('tax', 'name'); // Récupère les informations sur la taxe
  
      //console.log('Paiements récents trouvés :', recentPayments);
  
      res.status(200).json({ recentPayments });
    } catch (err) {
      console.error('Erreur lors de la récupération des paiements récents :', err.message);
      res.status(500).json({ message: 'Erreur lors de la récupération des paiements récents.', error: err.message });
    }
  };
  
  
  const getOverduePayments = async (req, res) => {
    try {
      // ID du collecteur connecté
      const collectorId = new mongoose.Types.ObjectId(req.user.id);
      //console.log('ID du collecteur connecté :', collectorId);
  
      // Filtrer les contribuables assignés au collecteur
      const taxpayers = await Taxpayer.find({ assignedCollector: collectorId }).select('_id');
      const taxpayerIds = taxpayers.map((taxpayer) => taxpayer._id);
  
      // Trouver les taxes échues (dueDate passée) associées à ces contribuables
      const overduePayments = await Tax.aggregate([
        {
          $lookup: {
            from: 'payments', // Jointure avec la collection des paiements
            localField: '_id', // Champ local (Tax ID)
            foreignField: 'tax', // Champ de la collection Payment
            as: 'payments' // Alias pour les résultats
          }
        },
        {
          $match: {
            taxpayer: { $in: taxpayerIds }, // Filtrer les contribuables assignés au collecteur
            dueDate: { $lt: new Date() }, // Taxes échues
            'payments.0': { $exists: false } // Pas de paiement enregistré
          }
        },
        {
          $lookup: {
            from: 'taxpayers', // Jointure avec la collection des contribuables
            localField: 'taxpayer', // Champ local (Taxpayer ID)
            foreignField: '_id', // Champ de la collection Taxpayer
            as: 'taxpayer' // Alias pour les résultats
          }
        },
        {
          $project: {
            taxName: '$name', // Nom de la taxe
            amountDue: '$amount', // Montant dû
            dueDate: 1, // Date d'échéance
            taxpayerName: { $arrayElemAt: ['$taxpayer.name', 0] } // Nom du contribuable
          }
        }
      ]);
  
      //console.log('Paiements en retard trouvés :', overduePayments);
  
      res.status(200).json({ overduePayments });
    } catch (err) {
      console.error('Erreur lors de la récupération des paiements en retard :', err.message);
      res.status(500).json({ message: 'Erreur lors de la récupération des paiements en retard.', error: err.message });
    }
  };
  

module.exports = { getTotalCollected, getTaxesCreated, getActiveTaxpayers, getRecentPayments, getOverduePayments };
