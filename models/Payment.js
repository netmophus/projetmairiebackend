


// Payment Model
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  taxpayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxpayer', required: true },
  tax: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', required: true },
  amountPaid: { type: Number, required: true },
  // Champ pour enregistrer la surface occupée (en m²) – utile pour le calcul de la taxe d'occupation
  surface: { type: Number },
  receiptId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReceiptBatch' }, // Optionnel
  date: { type: Date, default: Date.now },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

   // ✅ CHAMP AJOUTÉ ICI
   source: { type: String, enum: ['regular', 'unpaid'], default: 'regular' },
});

module.exports = mongoose.model('Payment', paymentSchema);

