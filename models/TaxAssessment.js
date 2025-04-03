const mongoose = require('mongoose');

const taxAssessmentSchema = new mongoose.Schema({
  taxpayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taxpayer',
    required: true,
  }, // Le contribuable concerné

  assessmentNumber: { type: String, unique: true, required: true }, // ✅ Numéro unique de l'avis
  

  fiscalYear: { type: Number, required: true }, // Année fiscale de l'avis (ex: 2025, 2026)
  
  taxes: [
    {
      tax: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', required: true },
      annualAmount: { type: Number, required: true },
      details: { type: mongoose.Schema.Types.Mixed, default: {} }, // ✅ Ajout du champ manquant
    }
  ],
  // Liste des taxes associées à cet avis

  totalAmount: { type: Number, required: true }, // Montant total à payer (somme des taxes)
  paidAmount: { type: Number, default: 0 }, // Montant déjà payé
  remainingAmount: { type: Number, required: true }, // Montant restant à payer

  payments: [
    {
      amount: { type: Number, required: true }, // Montant du paiement
      date: { type: Date, default: Date.now }, // Date du paiement
      collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Collecteur
    },
  ], // Historique des paiements effectués

  dueDate: { type: Date, required: true }, // Date limite de paiement (ex: 31/12 de l'année en cours)

  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'], 
    default: 'pending' 
  }, // Statut de l'avis d'imposition

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TaxAssessment', taxAssessmentSchema);
