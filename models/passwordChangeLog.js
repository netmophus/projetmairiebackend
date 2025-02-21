const mongoose = require('mongoose');

const passwordChangeLogSchema = new mongoose.Schema({
  action: { type: String, enum: ['initialisation', 'changement', 'réinitialisation'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optionnel, si un admin effectue l'action
  timestamp: { type: Date, default: Date.now },
  details: { type: String, required: true },
});

module.exports = mongoose.model('PasswordChangeLog', passwordChangeLogSchema);
