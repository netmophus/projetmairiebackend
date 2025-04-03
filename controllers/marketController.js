const Market = require('../models/Market');
const Collector = require('../models/Collector');
const User = require('../models/User');
const MarketCollector = require('../models/MarketCollector');
const { ObjectId } = require('mongodb');

// Create a new market




// Créer un nouveau marché avec plusieurs collecteurs


exports.createMarket = async (req, res) => {
  try {
    console.log('➡️ Début de la création du marché...');
    console.log('📥 Données reçues :', req.body);

    const { name, location, collector } = req.body;

    if (!name || !location || !collector || collector.length === 0) {
      console.error('❌ Nom, localisation ou collecteurs manquants');
      return res.status(400).json({ message: 'Nom, localisation et collecteurs sont requis.' });
    }

    // Récupérer les utilisateurs à partir des collecteurs
    const existingCollectors = await Collector.find({
      _id: { $in: collector }
    }).populate('user');

    if (existingCollectors.length !== collector.length) {
      console.error('❌ Un ou plusieurs collecteurs sont introuvables :', collector);
      return res.status(404).json({ message: 'Un ou plusieurs collecteurs sont introuvables.' });
    }

    console.log('✅ Collecteurs vérifiés :', existingCollectors);

    // Extraire les ObjectId des User à partir des collecteurs
    const userIds = existingCollectors.map(collector => collector.user._id);

    // Créer le marché avec les ObjectId des User
    const market = new Market({
      name,
      location,
      collector: userIds  // Utilisation des ObjectId des User
    });

    await market.save();
    console.log('✅ Marché créé avec succès :', market);

    // Mettre à jour MarketCollector pour chaque collecteur
    for (const col of existingCollectors) {
      let marketCollector = await MarketCollector.findOne({ user: col.user._id });

      if (!marketCollector) {
        // Si MarketCollector n'existe pas, en créer un
        marketCollector = new MarketCollector({
          user: col.user._id,
          assignedMarkets: [market._id]
        });
      } else {
        // Sinon, ajouter le marché à la liste des marchés assignés
        if (!marketCollector.assignedMarkets.includes(market._id)) {
          marketCollector.assignedMarkets.push(market._id);
        }
      }

      await marketCollector.save();
      console.log('✅ MarketCollector mis à jour pour le collecteur :', col.user._id);
    }

    res.status(201).json({
      message: 'Marché créé avec succès et collecteurs mis à jour.',
      market
    });
  } catch (err) {
    console.error('❌ Erreur lors de la création du marché :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};



// Mettre à jour un marché pour ajouter ou retirer des collecteurs
exports.updateMarketCollectors = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { collector } = req.body; // Liste des nouveaux collecteurs à ajouter

    if (!collector || collector.length === 0) {
      return res.status(400).json({ message: "Les collecteurs sont requis." });
    }

    // Vérifier si le marché existe et récupérer les collecteurs actuels
    const marketToUpdate = await Market.findById(marketId).populate("collector", "_id name phone");
    if (!marketToUpdate) {
      return res.status(404).json({ message: "Marché non trouvé." });
    }

    console.log("🔄 Collecteurs existants avant mise à jour :", marketToUpdate.collector);
    console.log("📥 Nouveaux collecteurs reçus :", collector);

    // Fusionner les collecteurs existants et les nouveaux (sans doublons)
    const updatedCollectors = [
      ...new Set([...marketToUpdate.collector.map((c) => c._id.toString()), ...collector]),
    ];

    console.log("✅ Liste finale des collecteurs :", updatedCollectors);

    // Mettre à jour le marché avec la nouvelle liste de collecteurs
    const updatedMarket = await Market.findByIdAndUpdate(
      marketId,
      { collector: updatedCollectors },
      { new: true }
    ).populate("collector", "name phone email");

    console.log("✅ Collecteurs mis à jour avec succès :", updatedMarket.collector);
    res.status(200).json({ message: "Collecteurs mis à jour.", market: updatedMarket });
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour des collecteurs :", err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};










exports.getMarkets = async (req, res) => {
  try {
    const markets = await Market.find().populate({
      path: 'collector',
      model: 'User',
      select: 'name phone email'  // Sélectionnez les champs à afficher
    });

    console.log('✅ Marchés récupérés avec les collecteurs :', JSON.stringify(markets, null, 2));
    res.status(200).json(markets);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des marchés :', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des marchés' });
  }
};



// Get all collectors
exports.getCollectors = async (req, res) => {
    try {
      console.log('➡️ Début de la récupération des collecteurs...');
      const collectors = await User.find({ role: 'collector' }).select('name phone');
      console.log('✅ Collecteurs récupérés :', collectors);
      res.status(200).json(collectors);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des collecteurs :', err.message);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };
  
  

  
exports.getMarketsByCollector = async (req, res) => {
  try {
    // Récupérer l'ID du collecteur connecté depuis le token
    const collectorId = req.user.id;

    console.log("📥 Requête reçue pour les marchés du collecteur :", collectorId);

    // Trouver les marchés associés à ce collecteur
    const markets = await Market.find({ collector: collectorId });

    console.log("✅ Marchés récupérés pour le collecteur :", markets);

    // Vérifier si des marchés ont été trouvés
    if (markets.length === 0) {
      return res.status(404).json({ message: "Aucun marché trouvé pour ce collecteur." });
    }

    res.status(200).json(markets);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des marchés :", err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
