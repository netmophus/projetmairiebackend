
// const mongoose = require('mongoose');

// // Ne mets plus de champ collector ici
// const MarketSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   location: { type: String },
//   chefmarket: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true,
//   },
//   createdAt: { type: Date, default: Date.now }
// });



// module.exports = mongoose.model('Market', MarketSchema);


const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true  // Adresse détaillée (ex. : Rue 12, Quartier Zongo)
  },
  geo: {
    lat: { type: Number },
    lng: { type: Number }
    // Tu peux aussi le nommer "coordinates" si tu veux suivre la convention GeoJSON plus tard
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif'
  },
  chefmarket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Market', MarketSchema);
