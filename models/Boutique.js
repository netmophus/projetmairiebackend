
const mongoose = require('mongoose');

const BoutiqueSchema = new mongoose.Schema({
  number: { type: String, required: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  locationDetails: { type: String },
  status: { type: String, enum: ['libre', 'occupée'], default: 'libre' },

  commercant: { type: mongoose.Schema.Types.ObjectId, ref: 'Commercant' },

  chefmarket: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 🔗 Référence au modèle de boutique
  boutiqueModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoutiqueModel',
    required: true,
  },

  acquisitionType: { type: String, enum: ['location', 'achat'], required: true },

  // 🔽 Champs spécifiques si achat
  purchaseAmount: { type: Number },
  purchaseDate: { type: Date },
  purchaseDocument: { type: String },

  // 🔽 Champs spécifiques si location
  rentAmount: { type: Number }, // 💡 À ajouter ici
  contractStartDate: { type: Date },
  contractDurationMonths: { type: Number },
  photoUrl: { type: String }, // lien vers la photo
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Boutique', BoutiqueSchema);
