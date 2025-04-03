// const mongoose = require('mongoose');

// const MarketSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // Nom du marché
//   location: { type: String }, // Localisation du marché
//   collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Collecteur est un utilisateur
//   createdAt: { type: Date, default: Date.now }, // Date de création
// });

// module.exports = mongoose.model('Market', MarketSchema);






const mongoose = require('mongoose');


const MarketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  collector: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tableau pour plusieurs collecteurs
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Market', MarketSchema);
