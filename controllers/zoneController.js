const Zone = require('../models/Zone');

// Création d'une nouvelle zone
const createZone = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Vérification des champs obligatoires
    if (!name) {
      return res.status(400).json({ message: 'Le nom de la zone est obligatoire.' });
    }

    // Vérifier si une zone avec le même nom existe déjà
    const existingZone = await Zone.findOne({ name });
    if (existingZone) {
      return res.status(400).json({ message: 'Une zone avec ce nom existe déjà.' });
    }

    // Créer une nouvelle zone
    const newZone = new Zone({ name, description });
    await newZone.save();

    res.status(201).json({ message: 'Zone créée avec succès.', zone: newZone });
  } catch (err) {
    console.error('Erreur lors de la création de la zone :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Récupération de toutes les zones
const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find();
    res.status(200).json(zones);
  } catch (err) {
    console.error('Erreur lors de la récupération des zones :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  createZone,
  getAllZones,
};
