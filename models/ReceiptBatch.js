

const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

// Sous-document pour les codes de confirmation
// Sous-document pour les codes de confirmation
const ConfirmationCodeSchema = new Schema({
  receipt: { type: String, required: true }, // Reçu
  code: { type: String, required: true }, // Code
  status: { type: String, enum: ['Generated','Activated', 'Used'], default: 'Generated' }, // Statut par reçu
}, { _id: false });


// Modèle principal pour le lot de reçus
const ReceiptBatchSchema = new Schema({
  market: { type: Types.ObjectId, ref: 'Market', required: true }, // Référence au marché
  //collector: { type: Types.ObjectId, ref: 'User', required: true }, // Référence à User pour le collecteur
  collector: [{ type: Types.ObjectId, ref: 'User', required: true }],

  startReceipt: { type: String, required: true }, // Reçu de départ
  endReceipt: { type: String, required: true }, // Reçu de fin
  confirmationCodes: {
    type: [ConfirmationCodeSchema],
    validate: {
      validator: function (codes) {
        return codes.length > 0;
      },
      message: 'Il doit y avoir au moins un code de confirmation.',
    },
  },
  status: {
    type: String,
    enum: ['Generated', 'Printed', 'Activated', 'Used'],
    default: 'Generated',
  }, // Statut du lot
  createdAt: { type: Date, default: Date.now }, // Date de création
  activatedAt: { type: Date }, // Date d'activation
  createdBy: { type: Types.ObjectId, ref: 'User' }, // Administrateur qui a créé le lot
  activatedBy: { type: Types.ObjectId, ref: 'User' }, // Administrateur qui a activé le lot
});

// Index pour faciliter les recherches sur le marché et le collecteur
ReceiptBatchSchema.index({ market: 1, collector: 1 });

module.exports = model('ReceiptBatch', ReceiptBatchSchema);
