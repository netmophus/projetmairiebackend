

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true }, // Optional email
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'collector', 'contribuable'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Ajout du statut
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
