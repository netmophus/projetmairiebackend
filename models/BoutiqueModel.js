const mongoose = require('mongoose');

const BoutiqueModelSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Exemple : "Kiosque"
  price: { type: Number, required: true },
  acquisitionType: { type: String, enum: ['location', 'achat'], required: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  chefmarket: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BoutiqueModel', BoutiqueModelSchema);
