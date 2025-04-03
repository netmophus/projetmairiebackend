


const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  isVariable: { 
    type: Boolean, 
    default: false 
  },


  // 🔹 Montant fixe (si applicable)
  amount: { 
    type: Number, 
    required: function() { return !this.isVariable; } 
  },

  // 🔹 Taxe basée sur la superficie (ex: Taxe de publicité)
  surfaceRates: [{
    category: String, // Ex: "Panneau lumineux", "Affiche murale", "Banderole"
    ratePerSquareMeter: Number // Ex: 2000 FCFA/m²
  }],

  // 🔹 Taxe sur les pompes hydrocarbures (35000 FCFA × nb de pistolets)
  isFuelPumpTax: { 
    type: Boolean, 
    default: false 
  },

  // 🔹 Taxe de salubrité (1000 FCFA × 360 jours)
  isSanitationTax: { 
    type: Boolean, 
    default: false 
  },


  // 🔹 Tarif par pistolet pour la taxe sur les pompes hydrocarbures
pumpRate: { 
  type: Number, 
  default: 35000 // Tarif par pistolet
},

// 🔹 Tarif journalier et nombre de jours pour la taxe de salubrité
sanitationRate: { 
  type: Number, 
  default: 1000 // Tarif journalier
},
sanitationDays: { 
  type: Number, 
  default: 360 // Nombre de jours pris en compte
},


  // 🔹 Fréquence de paiement
  frequency: { 
    type: String, 
    enum: ['monthly', 'annual'], 
    required: true 
  },

  // 🔹 Date d’échéance pour le paiement de la taxe
  dueDate: { 
    type: Date, 
    required: true 
  },

  // 🔹 Date de création de la taxe
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// ✅ Ajout d'un index pour optimiser les requêtes
taxSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Tax', taxSchema);
