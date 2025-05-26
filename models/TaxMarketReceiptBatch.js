const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

// 🔹 Sous-document : chaque reçu individuel avec code et statut
const ConfirmationCodeSchema = new Schema({
  receiptNumber: { type: String, required: true }, // ex: REC-MRK-2025-0001
  codeConfirmation: { type: String, required: true }, // ex: A7B9K3
  status: {
    type: String,
    enum: ['Generated', 'Activated', 'Used'],
    default: 'Generated',
  },
}, { _id: false });


// 🔸 Modèle principal : lot de reçus attribué à un collecteur de marché
const TaxMarketReceiptBatchSchema = new Schema({
  market: {
    type: Types.ObjectId,
    ref: 'Market',
    required: true,
  },

  marketCollector: {
    type: Types.ObjectId,
    ref: 'User', // utilisateur avec rôle 'collector'
    required: true,
  },

  startReceipt: { type: String, required: true }, // ex: REC-MRK-2025-0001
  endReceipt: { type: String, required: true },   // ex: REC-MRK-2025-0050

  confirmationCodes: {
    type: [ConfirmationCodeSchema],
    validate: {
      validator: function (codes) {
        return codes.length > 0;
      },
      message: 'Il faut au moins un reçu dans le lot.',
    },
  },

  status: {
    type: String,
    enum: ['Generated', 'Printed', 'Activated', 'Used'],
    default: 'Generated',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  activatedAt: {
    type: Date,
  },

  createdBy: {
    type: Types.ObjectId,
    ref: 'User', // le chef de marché connecté
  },

  activatedBy: {
    type: Types.ObjectId,
    ref: 'User',
  },
});

// 🔍 Index combiné utile pour requêtes filtrées
TaxMarketReceiptBatchSchema.index({ market: 1, marketCollector: 1 });

module.exports = model('TaxMarketReceiptBatch', TaxMarketReceiptBatchSchema);
