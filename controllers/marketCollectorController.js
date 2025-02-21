const MarketCollector = require('../models/MarketCollector');

// Create a new market collector
exports.createCollector = async (req, res) => {
  try {
    const { name, phone, assignedMarket } = req.body;

    if (!name || !phone || !assignedMarket) {
      return res.status(400).json({ message: 'Nom, téléphone et marché assigné sont requis.' });
    }

    const collector = new MarketCollector({ name, phone, assignedMarket });
    await collector.save();

    res.status(201).json({ message: 'Collecteur ajouté avec succès.', collector });
  } catch (err) {
    console.error('Erreur lors de la création du collecteur:', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Get all market collectors
exports.getCollectors = async (req, res) => {
  try {
    const collectors = await MarketCollector.find().populate('assignedMarket', 'name location');
    res.status(200).json(collectors);
  } catch (err) {
    console.error('Erreur lors de la récupération des collecteurs:', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
