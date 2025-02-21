const mongoose = require('mongoose');

const MarketCollectorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à User
  assignedMarkets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Market' }], // Marchés assignés
  createdAt: { type: Date, default: Date.now }, // Date de création
});

// Vérifie si le modèle existe déjà avant de le redéfinir
module.exports = mongoose.models.MarketCollector || mongoose.model('MarketCollector', MarketCollectorSchema);
