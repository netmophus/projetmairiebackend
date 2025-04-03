// const mongoose = require('mongoose');

// const unpaidTaxSchema = new mongoose.Schema({
//   taxpayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxpayer', required: true },
//   tax: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', required: true },
//   originalDueDate: { type: Date, required: true },
//   amountUnpaid: { type: Number, required: true },
//   status: { type: String, enum: ['unpaid', 'in progress', 'paid'], default: 'unpaid' },
//   collector: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', required: true },
//   reason: { type: String, default: 'Montant non réglé à échéance' },
//   observations: { type: String },
//   payments: [ // 🔥 Historique des paiements pour l'impayé
//     {
//       amount: Number,
//       date: Date,
//       collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     }
//   ],
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('UnpaidTax', unpaidTaxSchema);





// const mongoose = require('mongoose');

// const unpaidTaxSchema = new mongoose.Schema({
//   taxpayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxpayer', required: true },
//   tax: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', required: true },
//   originalDueDate: { type: Date, required: true },
//   amountUnpaid: { type: Number, required: true },
//   remainingAmount: { type: Number, required: true }, // ✅ Ajouter ce champ si manquant
//   paidAmount: { type: Number, default: 0 }, // ✅ Ajouter ce champ si manquant
//   status: { type: String, enum: ['unpaid', 'in progress', 'paid'], default: 'unpaid' },
//   collector: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', required: true },
//   reason: { type: String, default: 'Montant non réglé à échéance' },
//   observations: { type: String },
//   payments: [ // ✅ Ajouter cette partie pour enregistrer les paiements effectués
//     {
//       amount: Number,
//       date: Date,
//       collector: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' },
//     }
//   ],
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('UnpaidTax', unpaidTaxSchema);




const mongoose = require('mongoose');

const unpaidTaxSchema = new mongoose.Schema({
  taxpayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxpayer', required: true },
  tax: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', required: true },
  originalDueDate: { type: Date, required: true },
  amountUnpaid: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['unpaid', 'in progress', 'paid'], default: 'unpaid' },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', required: true },
  reason: { type: String, default: 'Montant non réglé à échéance' },
  observations: { type: String },
  payments: [  // 🔥 IMPORTANT : Historique des paiements transféré ici
    {
      amount: Number,
      date: Date,
      collector: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' }
    }
  ],
  details: { type: mongoose.Schema.Types.Mixed },  // ✅ AJOUT DE CE CHAMP 🔥🔥🔥
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('UnpaidTax', unpaidTaxSchema);