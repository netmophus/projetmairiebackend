

// Taxpayer Model

const mongoose = require('mongoose');

const taxpayerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Lien avec l'utilisateur (nom et téléphone)
  address: { type: String, required: true }, // Adresse complète du contribuable
  activityType: { type: String, required: true }, // Type d'activité (e.g., Commerce, Agriculture)
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' }, // Zone géographique
  coordinates: { latitude: Number, longitude: Number }, // Coordonnées GPS
  taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxpayerTax' }], // Références aux entrées dans `TaxpayerTax`
  
  createdAt: { type: Date, default: Date.now }, // Date de création
});

taxpayerSchema.index({ user: 1 }); // Index pour des recherches rapides

module.exports = mongoose.model('Taxpayer', taxpayerSchema);





// const mongoose = require('mongoose');

// const taxpayerSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Lien avec l'utilisateur (nom et téléphone)
//   address: { type: String, required: true }, // Adresse complète du contribuable
//   activityType: { type: String, required: true }, // Type d'activité (e.g., Commerce, Agriculture)
//   zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' }, // Zone géographique
//   coordinates: { latitude: Number, longitude: Number }, // Coordonnées GPS
//   taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxpayerTax' }], // Références aux entrées dans `TaxpayerTax`
  
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 🔥 Collecteur qui a créé le contribuable
//   createdAt: { type: Date, default: Date.now }, // Date de création
// });

// // Ajout d'un index pour accélérer la recherche des contribuables par collecteur
// taxpayerSchema.index({ createdBy: 1 });

// module.exports = mongoose.model('Taxpayer', taxpayerSchema);
