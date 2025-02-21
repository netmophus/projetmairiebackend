const mongoose = require('mongoose');

const CollectorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à User
  idDocument: { type: String, required: true },
  address: { type: String, required: true },
  assignedZones: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' } // Référence à la collection Zones
  ],
  hireDate: { type: Date, required: false }, // Ajout du champ hireDate
});

module.exports = mongoose.model('Collector', CollectorSchema);
