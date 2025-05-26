


const mongoose = require('mongoose');

const PaiementLocationSchema = new mongoose.Schema({
  boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  commercant: { type: mongoose.Schema.Types.ObjectId, ref: 'Commercant', required: true },
  chefmarket: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  expectedAmount: { type: Number, required: true },
  period: { type: String, required: true }, // ex: "2025-05"

  paiements: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      modePaiement: { type: String, enum: ['espèces', 'mobile_money', 'virement'], default: 'espèces' },
    },
  ],

  isComplete: { type: Boolean, default: false },
  status: { type: String, enum: ['payé', 'en_retard', 'partiel'], default: 'partiel' },
});

module.exports = mongoose.model('PaiementLocation', PaiementLocationSchema);

