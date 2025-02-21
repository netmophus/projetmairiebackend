



// Zone Model

const mongoose = require('mongoose');


const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

zoneSchema.index({ name: 1 });

module.exports = mongoose.model('Zone', zoneSchema);