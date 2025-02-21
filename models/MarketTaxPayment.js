

const mongoose = require('mongoose');

const MarketTaxPaymentSchema = new mongoose.Schema({
  receipt: { type: String, required: true }, // Numéro de reçu utilisé
  confirmationCode: { type: String, required: true }, // Code de confirmation utilisé pour le paiement
  amount: { type: Number, required: true, min: 0 }, // Montant payé (doit être supérieur ou égal à 0)
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketCollector', required: true }, // Collecteur qui a effectué le paiement
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true }, // Marché où la taxe a été collectée
  paymentDate: { type: Date, default: Date.now }, // Date du paiement
});

module.exports = mongoose.model('MarketTaxPayment', MarketTaxPaymentSchema);
