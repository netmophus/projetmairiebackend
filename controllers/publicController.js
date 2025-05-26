const TaxMarketReceiptBatch = require('../models/TaxMarketReceiptBatch');

exports.verifyReceiptByCode = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Code manquant.' });
  }

  try {
    const batch = await TaxMarketReceiptBatch.findOne({
      'confirmationCodes.codeConfirmation': code,
    })
      .populate('market', 'name location')
      .populate('marketCollector', 'name phone');

    if (!batch) {
      return res.status(404).json({ message: 'Reçu introuvable.' });
    }

    const receipt = batch.confirmationCodes.find(
      (r) => r.codeConfirmation === code
    );

    if (!receipt) {
      return res.status(404).json({ message: 'Reçu non trouvé.' });
    }

    res.status(200).json({
      receiptNumber: receipt.receiptNumber,
      codeConfirmation: receipt.codeConfirmation,
      status: receipt.status,
      market: batch.market?.name || '—',
      location: batch.market?.location || '—',
      marketCollector: batch.marketCollector?.name || '—',
      createdAt: batch.createdAt,
    });
  } catch (err) {
    console.error('Erreur vérification reçu :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
