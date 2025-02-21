


// TaxpayerTax Model

const mongoose = require('mongoose');

const taxpayerTaxSchema = new mongoose.Schema({
  taxpayer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Taxpayer', 
    required: true 
  }, // Référence au contribuable
  tax: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tax', 
  
    required: true 
  }, // Référence à la taxe associée
  totalAmount: { 
    type: Number, 
    required: true 
  }, // Montant total initial de la taxe
  remainingAmount: { 
    type: Number, 
    required: true 
  }, // Montant restant à payer
  paidAmount: { 
    type: Number, 
    default: 0 
  }, // Montant payé à ce jour
  dueDate: { 
    type: Date, 
    required: true 
  }, // Date d'échéance
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'], 
    default: 'pending' 
  }, // Statut de la taxe
  payments: [
    {
      amount: { type: Number, required: true }, // Montant du paiement
      date: { type: Date, default: Date.now }, // Date du paiement
      collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Collecteur
    },
  ], // Historique des paiements
  surface: { 
    type: Number  // Champ optionnel pour enregistrer la surface (en m²)
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }, // Date de création de l'entrée
});

// Index pour éviter les doublons sur taxpayer et tax
taxpayerTaxSchema.index({ taxpayer: 1, tax: 1 }, { unique: true });

module.exports = mongoose.model('TaxpayerTax', taxpayerTaxSchema);
