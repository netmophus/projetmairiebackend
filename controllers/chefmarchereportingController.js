const TaxMarketReceiptBatch = require('../models/TaxMarketReceiptBatch');
const TaxChefMarketPaiement = require('../models/TaxChefMarketPaiement');
const User = require('../models/User');
const mongoose = require('mongoose');

// exports.getMonthlyReportByCollector = async (req, res) => {
//   try {
//     const limit = parseInt(req.query.limit) || 30;
//     const page = parseInt(req.query.page) || 1;

//     // Étape 1 — Unwind des confirmationCodes
//     const aggregation = await TaxMarketReceiptBatch.aggregate([
//       { $unwind: '$confirmationCodes' },
//       {
//         $addFields: {
//           month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
//           status: '$confirmationCodes.status',
//           receiptNumber: '$confirmationCodes.receiptNumber'
//         }
//       },
//       {
//         $group: {
//           _id: {
//             collector: '$marketCollector',
//             month: '$month'
//           },
//           totalReceipts: { $sum: 1 },
//           usedReceipts: {
//             $sum: {
//               $cond: [{ $eq: ['$status', 'Used'] }, 1, 0]
//             }
//           },
//           receiptNumbersUsed: {
//             $push: {
//               $cond: [{ $eq: ['$status', 'Used'] }, '$confirmationCodes.receiptNumber', null]
//             }
//           }
//         }
//       },
//       {
//         $addFields: {
//           receiptNumbersUsed: {
//             $filter: {
//               input: '$receiptNumbersUsed',
//               as: 'num',
//               cond: { $ne: ['$$num', null] }
//             }
//           },
//           remainingReceipts: {
//             $subtract: ['$totalReceipts', '$usedReceipts']
//           }
//         }
//       },
//       { $sort: { '_id.month': -1 } },
//       { $skip: (page - 1) * limit },
//       { $limit: limit }
//     ]);

//     // Étape 2 — Obtenir les montants encaissés depuis TaxChefMarketPaiement
//     const allUsedNumbers = aggregation.flatMap(item => item.receiptNumbersUsed);

//     const paymentSums = await TaxChefMarketPaiement.aggregate([
//       {
//         $match: { receiptNumber: { $in: allUsedNumbers } }
//       },
//       {
//         $group: {
//           _id: '$receiptNumber',
//           amount: { $sum: '$amount' }
//         }
//       }
//     ]);

//     const amountMap = {};
//     paymentSums.forEach(p => {
//       amountMap[p._id] = p.amount;
//     });

//     // Étape 3 — Récupérer les noms de collecteurs
//     const collectorIds = aggregation.map(a => a._id.collector);
//     const users = await User.find({ _id: { $in: collectorIds } }).select('name');

//     const collectorMap = {};
//     users.forEach(u => {
//       collectorMap[u._id.toString()] = u.name || 'Inconnu'; // Utilisation du champ 'name'
//     });

//     // Étape 4 — Composer le résultat final
//     const result = aggregation.map(a => {
//       const totalCollected = a.receiptNumbersUsed.reduce((sum, number) => {
//         return sum + (amountMap[number] || 0);
//       }, 0);

//       return {
//         collectorId: a._id.collector,
//         collectorName: collectorMap[a._id.collector.toString()] || 'Inconnu',
//         month: a._id.month,
//         totalReceipts: a.totalReceipts,
//         usedReceipts: a.usedReceipts,
//         remainingReceipts: a.remainingReceipts,
//         totalCollected,
//         usageRate: ((a.usedReceipts / a.totalReceipts) * 100).toFixed(2)
//       };
//     });

//     res.status(200).json({
//       data: result,
//       pagination: {
//         page,
//         limit
//       }
//     });
//   } catch (error) {
//     console.error('Erreur reporting:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };



// exports.getCollectorPayments = async (req, res) => {
//     try {
//       const { collectorId, month } = req.query;
  
//       // Vérifier si les paramètres sont valides
//       if (!collectorId || !month) {
//         return res.status(400).json({ message: 'Collector ID et mois sont requis.' });
//       }
  
//       // Récupérer tous les reçus utilisés par le collecteur pour ce mois
//       const payments = await TaxChefMarketPaiement.aggregate([
//         {
//           $match: {
//             marketCollector: mongoose.Types.ObjectId(collectorId),
//             createdAt: {
//               $gte: new Date(`${month}-01`),
//               $lt: new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1),
//             },
//           },
//         },
//         {
//           $lookup: {
//             from: 'taxmarketreceiptbatches',
//             localField: 'receiptBatchId',
//             foreignField: '_id',
//             as: 'receiptBatch',
//           },
//         },
//         {
//           $unwind: '$receiptBatch',
//         },
//         {
//           $project: {
//             receiptNumber: 1,
//             amount: 1,
//             codeConfirmation: 1,
//             'receiptBatch.startReceipt': 1,
//             'receiptBatch.endReceipt': 1,
//             createdAt: 1,
//           },
//         },
//         {
//           $sort: { createdAt: 1 }, // Tri des paiements par date
//         },
//       ]);
  
//       if (!payments.length) {
//         return res.status(404).json({ message: 'Aucun paiement trouvé pour ce collecteur et mois.' });
//       }
  
//       // Retourner les résultats
//       res.status(200).json({ data: payments });
//     } catch (error) {
//       console.error('Erreur dans la récupération des paiements:', error);
//       res.status(500).json({ message: 'Erreur serveur' });
//     }
//   };
  


exports.getMonthlyReportByCollector = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const page = parseInt(req.query.page) || 1;

    // Récupère le marché du chef connecté
    const marketId = req.user.marketId;

    // Étape 1 — Filtrer par marché + unwind
    const aggregation = await TaxMarketReceiptBatch.aggregate([
      { $match: { market: marketId } }, // 🔥 Filtrage par marché
      { $unwind: '$confirmationCodes' },
      {
        $addFields: {
          month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          status: '$confirmationCodes.status',
          receiptNumber: '$confirmationCodes.receiptNumber'
        }
      },
      {
        $group: {
          _id: {
            collector: '$marketCollector',
            month: '$month'
          },
          totalReceipts: { $sum: 1 },
          usedReceipts: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Used'] }, 1, 0]
            }
          },
          receiptNumbersUsed: {
            $push: {
              $cond: [{ $eq: ['$status', 'Used'] }, '$confirmationCodes.receiptNumber', null]
            }
          }
        }
      },
      {
        $addFields: {
          receiptNumbersUsed: {
            $filter: {
              input: '$receiptNumbersUsed',
              as: 'num',
              cond: { $ne: ['$$num', null] }
            }
          },
          remainingReceipts: {
            $subtract: ['$totalReceipts', '$usedReceipts']
          }
        }
      },
      { $sort: { '_id.month': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    // Étape 2 — Paiements encaissés
    const allUsedNumbers = aggregation.flatMap(item => item.receiptNumbersUsed);

    const paymentSums = await TaxChefMarketPaiement.aggregate([
      {
        $match: { receiptNumber: { $in: allUsedNumbers } }
      },
      {
        $group: {
          _id: '$receiptNumber',
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const amountMap = {};
    paymentSums.forEach(p => {
      amountMap[p._id] = p.amount;
    });

    // Étape 3 — Noms des collecteurs
    const collectorIds = aggregation.map(a => a._id.collector);
    const users = await User.find({ _id: { $in: collectorIds } }).select('name');

    const collectorMap = {};
    users.forEach(u => {
      collectorMap[u._id.toString()] = u.name || 'Inconnu';
    });

    // Étape 4 — Résultat final
    const result = aggregation.map(a => {
      const totalCollected = a.receiptNumbersUsed.reduce((sum, number) => {
        return sum + (amountMap[number] || 0);
      }, 0);

      return {
        collectorId: a._id.collector,
        collectorName: collectorMap[a._id.collector.toString()] || 'Inconnu',
        month: a._id.month,
        totalReceipts: a.totalReceipts,
        usedReceipts: a.usedReceipts,
        remainingReceipts: a.remainingReceipts,
        totalCollected,
        usageRate: ((a.usedReceipts / a.totalReceipts) * 100).toFixed(2)
      };
    });

    res.status(200).json({
      data: result,
      pagination: {
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Erreur reporting:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


exports.getCollectorPayments = async (req, res) => {
  try {
    const { collectorId, month } = req.query;

    // Vérification des paramètres
    if (!collectorId || !month) {
      return res.status(400).json({ message: 'Collector ID et mois sont requis.' });
    }

    // Conversion du mois en plage de dates
    const startDate = new Date(`${month}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Requête d’agrégation
    const payments = await TaxChefMarketPaiement.aggregate([
      {
        $match: {
          marketCollector: new mongoose.Types.ObjectId(collectorId),
          createdAt: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $project: {
          receiptNumber: 1,
          amount: 1,
          codeConfirmation: 1,
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);

    if (!payments.length) {
      return res.status(404).json({ message: 'Aucun paiement trouvé pour ce collecteur et ce mois.' });
    }

    res.status(200).json({ data: payments });
  } catch (error) {
    console.error('Erreur dans getCollectorPayments:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
