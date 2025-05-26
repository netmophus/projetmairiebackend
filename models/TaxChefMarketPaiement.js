const mongoose = require('mongoose');

const TaxChefMarketPaiementSchema = new mongoose.Schema({
  receiptBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxMarketReceiptBatch',
    required: true
  },
  receiptNumber: { type: String, required: true },        // Ex: "REC-MRK-2025-00001"
  codeConfirmation: { type: String, required: true },      // Ex: "WMNW48"
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  marketCollector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

TaxChefMarketPaiementSchema.index({ codeConfirmation: 1 }, { unique: true });

module.exports = mongoose.model('TaxChefMarketPaiement', TaxChefMarketPaiementSchema);
