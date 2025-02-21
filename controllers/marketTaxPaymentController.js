const MarketTaxPayment = require('../models/MarketTaxPayment');
const ReceiptBatch = require('../models/ReceiptBatch');

// Create a new market tax payment
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

    const payment = new MarketTaxPayment({
      market: receiptBatch.market,
      collector: receiptBatch.collector,
      receiptNumber,
      amount,
    });

    await payment.save();

    res.status(201).json({ message: 'Paiement enregistré avec succès.', payment });
  } catch (err) {
    console.error('Erreur lors de l’enregistrement du paiement:', err.message);
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
