const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  photoUrl: {
    type: String, // ex: '/uploads/profiles/photo123.jpg'
    default: '',
  },

  logoUrl: {
    type: String, // ex: '/uploads/logos/market-logo.jpg'
    default: '',
  },

  title: {
    type: String, // ex: "Chef du Marché", "Inspecteur Régional"
  },

  description: {
    type: String, // Bio ou fonction courte
  },

  address: {
    type: String, // Adresse professionnelle ou localisation
  },

  contactPhone: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', profileSchema);
