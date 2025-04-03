const MarketTaxPayment = require('../models/MarketTaxPayment');
const ReceiptBatch = require('../models/ReceiptBatch');
const Market = require('../models/Market');
const Payment = require('../models/Payment');
const MarketCollector = require('../models/MarketCollector');

// Create a new market tax payment
// exports.createTaxPayment = async (req, res) => {
//   try {
//     const { receiptNumber, confirmationCode, amount } = req.body;

//     if (!receiptNumber || !confirmationCode || !amount) {
//       return res.status(400).json({ message: 'Tous les champs sont requis.' });
//     }

//     const receiptBatch = await ReceiptBatch.findOne({
//       'confirmationCodes.receiptNumber': receiptNumber,
//       'confirmationCodes.confirmationCode': confirmationCode,
//       status: 'Active',
//     });

//     if (!receiptBatch) {
//       return res.status(404).json({ message: 'Reçu invalide ou non activé.' });
//     }

//     const payment = new MarketTaxPayment({
//       market: receiptBatch.market,
//       collector: receiptBatch.collector,
//       receiptNumber,
//       amount,
//     });

//     await payment.save();

//     res.status(201).json({ message: 'Paiement enregistré avec succès.', payment });
//   } catch (err) {
//     console.error('Erreur lors de l’enregistrement du paiement:', err.message);
//     res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };


// exports.createTaxPayment = async (req, res) => {
//   try {
//     const { receiptNumber, confirmationCode, amount } = req.body;

//     if (!receiptNumber || !confirmationCode || !amount) {
//       return res.status(400).json({ message: 'Tous les champs sont requis.' });
//     }

//     // Vérifier si le reçu est valide et activé
//     const receiptBatch = await ReceiptBatch.findOne({
//       'confirmationCodes.receiptNumber': receiptNumber,
//       'confirmationCodes.confirmationCode': confirmationCode,
//       status: 'Activated',
//     }).populate('collector'); // Peupler le collecteur

//     if (!receiptBatch) {
//       return res.status(404).json({ message: 'Reçu invalide ou non activé.' });
//     }

//     if (!receiptBatch.collector || !receiptBatch.collector._id) {
//       return res.status(404).json({ message: "Aucun collecteur associé à ce reçu." });
//     }

//     // Trouver le MarketCollector lié à l'utilisateur collecteur
//     const marketCollector = await MarketCollector.findOne({ user: receiptBatch.collector._id });

//     if (!marketCollector) {
//       return res.status(404).json({ message: "Aucun MarketCollector trouvé pour ce collecteur." });
//     }

//     // Enregistrer le paiement avec l'ID du MarketCollector
//     const payment = new MarketTaxPayment({
//       market: receiptBatch.market,
//       collector: marketCollector._id,  // ✅ Correct : on stocke l'ID du MarketCollector
//       receipt: receiptNumber,
//       confirmationCode,
//       amount,
//       paymentDate: new Date(),
//     });

//     await payment.save();

//     res.status(201).json({ message: 'Paiement enregistré avec succès.', payment });
//   } catch (err) {
//     console.error('❌ Erreur lors de l’enregistrement du paiement:', err.message);
//     res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };

exports.createTaxPayment = async (req, res) => {
  try {
    const { receiptNumber, confirmationCode, amount } = req.body;

    if (!receiptNumber || !confirmationCode || !amount) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const receiptBatch = await ReceiptBatch.findOne({
      'confirmationCodes.receiptNumber': receiptNumber,
      'confirmationCodes.confirmationCode': confirmationCode,
      status: 'Active',
    });

    if (!receiptBatch) {
      return res.status(404).json({ message: 'Reçu invalide ou non activé.' });
    }

    // ✅ Vérification : Est-ce que le reçu existe bien ?
    const currentReceiptIndex = receiptBatch.confirmationCodes.findIndex(
      (code) => code.receiptNumber === receiptNumber
    );

    if (currentReceiptIndex === -1 || !receiptBatch.confirmationCodes[currentReceiptIndex]) {
      return res.status(400).json({ message: "Plus aucun reçu disponible pour ce lot." });
    }

    // ✅ Si tout est bon, on enregistre le paiement
    const payment = new MarketTaxPayment({
      market: receiptBatch.market,
      collector: receiptBatch.collector,
      receiptNumber,
      amount,
    });

   
    

    await payment.save();

    res.status(201).json({ message: 'Paiement enregistré avec succès.', payment });

  } catch (err) {
    console.error('❌ Erreur lors de l’enregistrement du paiement:', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Get all payments for a specific market
exports.getMarketPayments = async (req, res) => {
  try {
    const { marketId } = req.params;

    const payments = await MarketTaxPayment.find({ market: marketId }).populate(
      'collector',
      'name phone'
    );

    res.status(200).json(payments);
  } catch (err) {
    console.error('Erreur lors de la récupération des paiements:', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};





// Fonction pour générer le rapport par jour, mois et année
// exports.getMarketReport = async (req, res) => {
//   try {
//     const { marketId } = req.params;
//     const { collectorId, year, month, day } = req.query;

//     console.log('📥 Paramètres reçus :', { marketId, collectorId, year, month, day });

//     // Construire le filtre dynamiquement
//     const filter = { market: marketId };

//     if (collectorId) {
//       filter.collector = collectorId;
//       console.log('🔍 Filtre sur le collecteur :', collectorId);
//     }
//     if (year) {
//       filter['paymentDate'] = { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) };
//       console.log('🔍 Filtre sur l\'année :', year);
//     }
//     if (month) {
//       const startDate = new Date(`${year}-${month}-01`);
//       const endDate = new Date(`${year}-${month}-31`);
//       filter['paymentDate'] = { $gte: startDate, $lte: endDate };
//       console.log('🔍 Filtre sur le mois :', month);
//     }
//     if (day) {
//       const specificDate = new Date(`${year}-${month}-${day}`);
//       filter['paymentDate'] = {
//         $gte: new Date(specificDate.setHours(0, 0, 0, 0)),
//         $lte: new Date(specificDate.setHours(23, 59, 59, 999)),
//       };
//       console.log('🔍 Filtre sur le jour :', day);
//     }

//     console.log('🔎 Filtre final appliqué :', filter);

//     const report = await MarketTaxPayment.find(filter)
//     .populate({
//       path: 'collector',              // Peupler le champ collector
//       model: 'MarketCollector',       // Depuis le modèle MarketCollector
//       populate: {
//         path: 'user',                 // Puis peupler user à partir de MarketCollector
//         model: 'User',
//         select: 'name phone'           // Sélectionne le nom et le téléphone
//       }
//     })
//     .select('collector amount createdAt');
  
  

// console.log("📊 Rapport complet après le populate :", JSON.stringify(report, null, 2));


//     console.log('📊 Rapport généré :', report);

//     const total = report.reduce((sum, payment) => sum + payment.amount, 0);

//     console.log('💰 Total collecté :', total);

//     res.status(200).json({ report, total });
//   } catch (error) {
//     console.error('❌ Erreur lors de la récupération du rapport:', error.message);
//     res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };
const mongoose = require('mongoose');

exports.getMarketReport = async (req, res) => {
  try {
    const { marketId, collectorId, year, month, day } = req.query;

    // Construire le filtre dynamiquement
    const filter = { market: mongoose.Types.ObjectId(marketId) };

    if (collectorId) filter.collector = mongoose.Types.ObjectId(collectorId);

    if (year || month || day) {
      const startDate = new Date(`${year}-${month || '01'}-${day || '01'}T00:00:00.000Z`);
      const endDate = new Date(startDate);

      if (day) {
        endDate.setDate(endDate.getDate() + 1);
      } else if (month) {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      filter.paymentDate = { $gte: startDate, $lt: endDate };
    }

    const report = await MarketTaxPayment.aggregate([
      { $match: filter },

      // Lookup pour récupérer le MarketCollector
      {
        $lookup: {
          from: 'marketcollectors',      // Le nom de la collection MongoDB
          localField: 'collector',       // Champ dans MarketTaxPayment
          foreignField: '_id',           // Champ dans MarketCollector
          as: 'collectorDetails'
        }
      },
      { $unwind: { path: '$collectorDetails', preserveNullAndEmptyArrays: true } },

      // Lookup pour récupérer le User depuis MarketCollector
      {
        $lookup: {
          from: 'users',
          localField: 'collectorDetails.user',
          foreignField: '_id',
          as: 'collectorUser'
        }
      },
      { $unwind: { path: '$collectorUser', preserveNullAndEmptyArrays: true } },

      // Sélectionner uniquement les champs nécessaires
      {
        $project: {
          _id: 1,
          amount: 1,
          paymentDate: 1,
          collector: {
            _id: '$collectorUser._id',
            name: '$collectorUser.name',
            phone: '$collectorUser.phone'
          }
        }
      }
    ]);

    // Calculer le total des montants
    const total = report.reduce((sum, payment) => sum + payment.amount, 0);

    console.log('📊 Rapport complet après le aggregate :', report);

    res.status(200).json({ report, total });
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport:', error.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

