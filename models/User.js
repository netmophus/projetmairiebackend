

// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   phone: { type: String, required: true, unique: true },
//   email: { type: String, unique: true, sparse: true }, // Optional email
//   password: { type: String, required: true },
//   role: { type: String, enum: ['admin', 'collector', 'contribuable', 'chefmarket'], required: true },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Ajout du statut
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'collector',  'contribuable', 'chefmarket'],
    required: true,
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  collectorType: { type: String, enum: ['mairie', 'marche'] }, // facultatif
 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
