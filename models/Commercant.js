const mongoose = require('mongoose');

const commercantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  idDocumentUrl: { type: String },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Commercant', commercantSchema);
