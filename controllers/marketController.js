const Market = require('../models/Market');
const Collector = require('../models/Collector');
const User = require('../models/User');
const MarketCollector = require('../models/MarketCollector');


// Create a new market


  
// exports.createMarket = async (req, res) => {
//     try {
//       console.log('➡️ Début de la création du marché...');
//       console.log('📥 Données reçues :', req.body);
  
//       const { name, location, collector } = req.body;
  
//       if (!name || !location || !collector) {
//         console.error('❌ Nom, localisation ou collecteur manquant');
//         return res.status(400).json({ message: 'Nom, localisation et collecteur sont requis.' });
//       }
  
//       // Vérifier si le collecteur existe
//       const existingCollector = await User.findById(collector);
//       if (!existingCollector) {
//         console.error('❌ Collecteur introuvable pour l\'ID fourni :', collector);
//         return res.status(404).json({ message: 'Collecteur introuvable.' });
//       }
  
//       console.log('✅ Collecteur vérifié :', existingCollector);
  
//       // Créer le marché
//       const market = new Market({
//         name,
//         location,
//         collector,
//       });
  
//       await market.save();
  
//       console.log('✅ Marché créé avec succès :', market);
  
//       // Remplir ou mettre à jour MarketCollector
//       let marketCollector = await MarketCollector.findOne({ user: collector });
  
//       if (!marketCollector) {
//         // Si MarketCollector n'existe pas, en créer un
//         marketCollector = new MarketCollector({
//           user: collector,
//           assignedMarkets: [market._id], // Associer le marché créé
//         });
//       } else {
//         // Sinon, ajouter le marché à la liste des marchés assignés
//         marketCollector.assignedMarkets.push(market._id);
//       }
  
//       await marketCollector.save();
//       console.log('✅ MarketCollector mis à jour :', marketCollector);
  
//       res.status(201).json({
//         message: 'Marché créé avec succès et collecteur mis à jour.',
//         market,
//       });
//     } catch (err) {
//       console.error('❌ Erreur lors de la création du marché :', err.message);
//       res.status(500).json({ message: 'Erreur interne du serveur.' });
//     }
//   };
  
exports.createMarket = async (req, res) => {
    try {
      console.log('➡️ Début de la création du marché...');
      console.log('📥 Données reçues :', req.body);
  
      const { name, location, collector } = req.body;
  
      if (!name || !location || !collector) {
        console.error('❌ Nom, localisation ou collecteur manquant');
        return res.status(400).json({ message: 'Nom, localisation et collecteur sont requis.' });
      }
  
      // Vérifier si le collecteur existe dans la collection Collector
      const existingCollector = await Collector.findById(collector).populate('user');

      if (!existingCollector) {
        console.error('❌ Collecteur introuvable pour l\'ID de l\'utilisateur fourni :', collector);
        return res.status(404).json({ message: 'Collecteur introuvable.' });
      }
  
      console.log('✅ Collecteur vérifié :', existingCollector);
  
      // Créer le marché
      const market = new Market({
        name,
        location,
        collector: existingCollector.user._id, // Associer l'ID du User
      });
  
      await market.save();
  
      console.log('✅ Marché créé avec succès :', market);
  
      // Remplir ou mettre à jour MarketCollector
      let marketCollector = await MarketCollector.findOne({ user: collector });
  
      if (!marketCollector) {
        // Si MarketCollector n'existe pas, en créer un
        marketCollector = new MarketCollector({
          user: collector,
          assignedMarkets: [market._id], // Associer le marché créé
        });
      } else {
        // Sinon, ajouter le marché à la liste des marchés assignés
        marketCollector.assignedMarkets.push(market._id);
      }
  
      await marketCollector.save();
      console.log('✅ MarketCollector mis à jour :', marketCollector);
  
      res.status(201).json({
        message: 'Marché créé avec succès et collecteur mis à jour.',
        market,
      });
    } catch (err) {
      console.error('❌ Erreur lors de la création du marché :', err.message);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };
  

// Get all markets
exports.getMarkets = async (req, res) => {
    try {
      console.log('➡️ Début de la récupération des marchés...');
  
      const markets = await Market.find()
        .populate('collector', 'name phone email role'); // Inclure les informations nécessaires depuis User
  
      console.log('✅ Marchés récupérés avec succès :', JSON.stringify(markets, null, 2));
      res.status(200).json(markets);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des marchés :', err.message);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
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
  
  
  
  
  
  



// exports.getCollectorsForMarket = async (req, res) => {
//     try {
//       // Rechercher tous les collecteurs et inclure les informations de l'utilisateur associé
//       const collectors = await Collector.find().populate('user', 'name phone');
  
//       if (!collectors || collectors.length === 0) {
//         return res.status(404).json({ message: 'Aucun collecteur trouvé.' });
//       }
  
//       // Formater les données pour simplifier le frontend
//       const formattedCollectors = collectors.map((collector) => ({
//         id: collector._id,
//         name: collector.user.name,
//         phone: collector.user.phone,
//       }));
  
//       res.status(200).json(formattedCollectors);
//     } catch (err) {
//       console.error('Erreur lors de la récupération des collecteurs :', err.message);
//       res.status(500).json({ message: 'Erreur interne du serveur.' });
//     }
//   };
  
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
