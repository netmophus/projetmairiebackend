


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
  // Pour une taxe fixe, "amount" est utilisé
  amount: { 
    type: Number, 
    required: function() { return !this.isVariable; } 
  },
  // Pour une taxe variable (comme la taxe de publicité), on utilise "supportRates"
  // Ici, on utilise un Map pour stocker plusieurs taux par support
  supportRates: {
    type: Map,
    of: Number,
    required: function() { return this.isVariable; },
    // Exemple de données :
    // { "option1": 2000, "option2": 10000, "option3": 15000 }
  },
  frequency: { 
    type: String, 
    enum: ['monthly', 'annual'], 
    required: true 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Tax', taxSchema);
