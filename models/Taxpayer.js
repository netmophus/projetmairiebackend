

const mongoose = require('mongoose');

const taxpayerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Lien avec l'utilisateur (nom et téléphone)

  taxpayerCode: { type: String, unique: true, required: true }, // ✅ Code unique du contribuable
  taxpayerType: { type: String, enum: ['Individu', 'Entreprise'], required: true }, // ✅ Type de contribuable
  businessName: { type: String, required: function () { return this.taxpayerType === 'Entreprise'; } }, // ✅ Nom de l'entreprise
  registrationNumber: { type: String }, // ✅ Numéro d'enregistrement de l'entreprise
  idNumber: { type: String, required: function () { return this.taxpayerType === 'Individu'; } }, // ✅ Numéro d'identité pour les individus
  phone: { type: String, required: true }, // ✅ Téléphone

  address: { type: String, required: true }, // ✅ Adresse complète
  communalDistrict: { type: String, required: true }, // ✅ Arrondissement communal
  activityType: { type: String, required: true }, // ✅ Type d'activité
  activitySector: { type: String, required: true }, // ✅ Secteur d'activité

  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' }, // ✅ Zone géographique
  
  region: { type: String, required: true }, // ✅ Région du contribuable
  city: { type: String, required: true }, // ✅ Ville du contribuable


  coordinates: { latitude: Number, longitude: Number }, // ✅ Coordonnées GPS

  taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxpayerTax' }], // ✅ Taxes associées

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', required: true }, // ✅ Collecteur qui a créé
  createdAt: { type: Date, default: Date.now }, // ✅ Date de création
});

// ✅ Index pour optimiser les recherches
taxpayerSchema.index({ user: 1 });
//taxpayerSchema.index({ taxpayerCode: 1 }, { unique: true });

module.exports = mongoose.model('Taxpayer', taxpayerSchema);


