

// const mongoose = require('mongoose');
// const TaxpayerTax = require('../models/TaxpayerTax'); // Modèle d'association
// const { ObjectId } = require('mongodb'); // Importer ObjectId depuis MongoDB


// // Récupérer toutes les taxes associées à un contribuable spécifique
// const getTaxpayerTaxes = async (req, res) => {
//   try {
//     const { taxpayerId } = req.params;

//     const taxpayerTaxes = await TaxpayerTax.find({ taxpayer: taxpayerId }).populate('tax', 'name amount dueDate');
//     if (!taxpayerTaxes.length) {
//       return res.status(404).json({ message: 'Aucune taxe associée trouvée pour ce contribuable.' });
//     }

//     res.status(200).json(taxpayerTaxes);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des taxes associées :', err.message);
//     res.status(500).json({ message: 'Erreur interne.' });
//   }
// };



  
  

// // Associer une taxe à un contribuable
// // const associateTaxToTaxpayer = async (req, res) => {
// //   try {
// //     const { taxpayerId } = req.params;
// //     const { taxId, dueDate } = req.body;

// //     const tax = await Tax.findById(taxId);
// //     if (!tax) {
// //       return res.status(404).json({ message: 'Taxe non trouvée.' });
// //     }

// //     const newAssociation = new TaxpayerTax({
// //       taxpayer: taxpayerId,
// //       tax: taxId,
// //       remainingAmount: tax.amount, // Montant initial de la taxe
// //       dueDate: dueDate || tax.dueDate, // Utiliser la date d'échéance par défaut si aucune n'est fournie
// //     });

// //     await newAssociation.save();
// //     res.status(201).json({ message: 'Taxe associée avec succès.', data: newAssociation });
// //   } catch (err) {
// //     console.error('Erreur lors de l’association de la taxe :', err.message);
// //     res.status(500).json({ message: 'Erreur interne.' });
// //   }
// // };

// // const associateTaxToTaxpayer = async (req, res) => {
// //     console.log('===== Début du contrôleur associateTaxes =====');
// //     console.log('ID du contribuable :', req.params.id);
// //     console.log('Taxes reçues :', req.body.taxes);
  
// //     try {
// //       const { taxes } = req.body;
  
// //       // Vérifiez que les taxes sont fournies et au bon format
// //       if (!Array.isArray(taxes) || taxes.length === 0) {
// //         return res.status(400).json({ message: 'Aucune taxe à associer.' });
// //       }
  
// //       // Extraire uniquement les IDs des taxes
// //       const taxIds = taxes.map((taxDetail) => taxDetail.tax);
  
// //       console.log('IDs extraits des taxes :', taxIds);
  
// //       // Vérifier si chaque ID est un ObjectId valide
// //       const validTaxIds = taxIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
// //       if (validTaxIds.length !== taxIds.length) {
// //         return res.status(400).json({ message: 'Certains IDs de taxes sont invalides.' });
// //       }
  
// //       console.log('IDs validés des taxes :', validTaxIds);
  
// //       // Vérifier si les taxes existent dans la collection Tax
// //       const validTaxes = await Tax.find({ _id: { $in: validTaxIds } });
// //       console.log('Taxes trouvées dans la collection Tax :', validTaxes);
  
// //       if (validTaxes.length !== validTaxIds.length) {
// //         return res.status(400).json({ message: 'Certaines taxes sont introuvables.' });
// //       }
  
// //       // Créer les associations pour le contribuable
// //       const associations = [];
// //       for (const taxDetail of taxes) {
// //         const association = await TaxpayerTax.create({
// //           taxpayer: req.params.id,
// //           tax: taxDetail.tax, // ID de la taxe
// //           remainingAmount: taxDetail.amount || 0, // Montant restant (par défaut 0)
// //           dueDate: taxDetail.dueDate || null, // Date d’échéance (par défaut null)
// //           isPaid: false,
// //         });
// //         associations.push(association);
// //       }
  
// //       console.log('Associations créées avec succès :', associations);
  
// //       res.status(200).json({ message: 'Taxes associées avec succès.', associations });
// //     } catch (err) {
// //       console.error('Erreur lors de l’association des taxes :', err.message);
// //       res.status(500).json({
// //         message: 'Erreur lors de l’association des taxes.',
// //         error: err.message,
// //       });
// //     }
// //   };
  
  



  


  
  

// // Mettre à jour une taxe associée à un contribuable (paiement partiel ou modification)
// const updateTaxForTaxpayer = async (req, res) => {
//   try {
//     const { taxpayerId, taxId } = req.params;
//     const { amountPaid } = req.body;

//     const association = await TaxpayerTax.findOne({ taxpayer: taxpayerId, tax: taxId });
//     if (!association) {
//       return res.status(404).json({ message: 'Association entre le contribuable et la taxe non trouvée.' });
//     }

//     // Réduire le montant restant
//     if (amountPaid) {
//       association.remainingAmount -= amountPaid;
//       if (association.remainingAmount <= 0) {
//         association.remainingAmount = 0;
//         association.isPaid = true; // Marquer comme payé si le montant restant est 0
//       }
//     }

//     await association.save();
//     res.status(200).json({ message: 'Taxe mise à jour avec succès.', data: association });
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour de la taxe :', err.message);
//     res.status(500).json({ message: 'Erreur interne.' });
//   }
// };

// // Récupérer toutes les taxes en retard
// const getOverdueTaxes = async (req, res) => {
//   try {
//     const overdueTaxes = await TaxpayerTax.find({ dueDate: { $lt: new Date() }, isPaid: false }).populate('taxpayer', 'name').populate('tax', 'name');
//     if (!overdueTaxes.length) {
//       return res.status(404).json({ message: 'Aucune taxe en retard trouvée.' });
//     }

//     res.status(200).json(overdueTaxes);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des taxes en retard :', err.message);
//     res.status(500).json({ message: 'Erreur interne.' });
//   }
// };

// // Récupérer les taxes en retard pour un contribuable spécifique
// const getOverdueTaxesByTaxpayer = async (req, res) => {
//   try {
//     const { taxpayerId } = req.params;

//     const overdueTaxes = await TaxpayerTax.find({ taxpayer: taxpayerId, dueDate: { $lt: new Date() }, isPaid: false }).populate('tax', 'name amount dueDate');
//     if (!overdueTaxes.length) {
//       return res.status(404).json({ message: 'Aucune taxe en retard trouvée pour ce contribuable.' });
//     }

//     res.status(200).json(overdueTaxes);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des taxes en retard pour le contribuable :', err.message);
//     res.status(500).json({ message: 'Erreur interne.' });
//   }
// };

// module.exports = {
//   getTaxpayerTaxes,
//   //associateTaxToTaxpayer,
//   updateTaxForTaxpayer,
//   getOverdueTaxes,
//   getOverdueTaxesByTaxpayer,
// };
