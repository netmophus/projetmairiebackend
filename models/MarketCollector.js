const mongoose = require('mongoose');

const MarketCollectorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedMarkets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Market' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.MarketCollector || mongoose.model('MarketCollector', MarketCollectorSchema);
