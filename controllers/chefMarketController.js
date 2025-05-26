const User = require('../models/User');
// const Collector = require('../models/Collector');
const Market = require('../models/Market');
const bcrypt = require('bcryptjs');
const Boutique = require('../models/Boutique');
const Commercant = require('../models/Commercant');
const PaiementLocation = require('../models/PaiementLocation');
const MarketCollector = require('../models/MarketCollector');
const TaxMarketReceiptBatch = require('../models/TaxMarketReceiptBatch');

// 🔹 Obtenir tous les utilisateurs avec le rôle 'chefmarket'
exports.getAllChefMarkets = async (req, res) => {
  try {
    const chefs = await User.find({ role: 'chefmarket' }).select('name phone role');
    res.status(200).json(chefs);
  } catch (error) {
    console.error('Erreur récupération chefs de marché :', error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};




exports.getChefMarketProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('name phone email');
    const market = await Market.findOne({ chefmarket: userId }).select('name');

    res.json({
      name: user.name,
      phone: user.phone,
      marketName: market?.name || 'Marché inconnu',
    });
  } catch (error) {
    console.error('Erreur profil chef de marché :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};




exports.assignBoutiqueToCommercant = async (req, res) => {
    try {
      const { commercantId, boutiqueId } = req.body;
  
      if (!commercantId || !boutiqueId) {
        return res.status(400).json({ message: 'Champs requis manquants.' });
      }
  
      const boutique = await Boutique.findById(boutiqueId);
      if (!boutique) {
        return res.status(404).json({ message: 'Boutique introuvable.' });
      }
  
      boutique.commercant = commercantId; // ✅ champ correct ici
      boutique.status = 'occupée';
      await boutique.save();
  
      res.status(200).json({ message: 'Boutique assignée avec succès.' });
    } catch (err) {
      console.error('Erreur assignation boutique :', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };
  


exports.createCommercant = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }

    const commercant = await Commercant.create({
      name,
      phone,
      address,
      idDocumentUrl: req.file ? `/uploads/commercants/${req.file.filename}` : null,
      market: req.user.marketId,
      createdBy: req.user.id,
    });

    res.status(201).json(commercant);
  } catch (error) {
    console.error('❌ Erreur ajout commerçant :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};



exports.createBoutiqueByChefmarket = async (req, res) => {
    try {
      const {
        number,
        locationDetails,
        acquisitionType,
        boutiqueModel,
        rentAmount,
        contractStartDate,
        contractDurationMonths,
        purchaseAmount,
        purchaseDate,
        latitude,
        longitude,
      } = req.body;
  
      if (!number || !acquisitionType || !boutiqueModel) {
        return res.status(400).json({ message: 'Champs obligatoires manquants.' });
      }
  
      if (acquisitionType === 'location') {
        if (rentAmount === undefined || isNaN(rentAmount)) {
          return res.status(400).json({ message: 'Le montant du loyer doit être un nombre valide.' });
        }
      }
  
      if (acquisitionType === 'achat') {
        if (purchaseAmount === undefined || isNaN(purchaseAmount)) {
          return res.status(400).json({ message: "Le montant d'achat doit être un nombre valide." });
        }
      }
  
      const boutique = await Boutique.create({
        number,
        market: req.user.marketId,
        chefmarket: req.user.id,
        locationDetails,
        acquisitionType,
        boutiqueModel,
        rentAmount: acquisitionType === 'location' ? rentAmount : undefined,
        contractStartDate: acquisitionType === 'location' ? contractStartDate : undefined,
        contractDurationMonths: acquisitionType === 'location' ? contractDurationMonths : undefined,
        purchaseAmount: acquisitionType === 'achat' ? purchaseAmount : undefined,
        purchaseDate: acquisitionType === 'achat' ? purchaseDate : undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        photoUrl: req.file ? `/uploads/boutiques/${req.file.filename}` : undefined,
      });
  
      res.status(201).json(boutique);
    } catch (err) {
      console.error('❌ Erreur création boutique :', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };
  


// exports.createChefmarketCollector = async (req, res) => {
//   try {
//     const { name, phone, password } = req.body;

//     // Vérifie l’unicité du numéro
//     const existing = await User.findOne({ phone });
//     if (existing) {
//       return res.status(400).json({ message: 'Ce numéro est déjà utilisé.' });
//     }

//     // Format international +227
//     const formattedPhone = phone.startsWith('+227') ? phone : `+227${phone}`;

//     // Création de l'utilisateur
//     const hashedPassword = await bcrypt.hash(password || '123456', 10);
//     const newUser = await User.create({
//       name,
//       phone: formattedPhone,
//       password: hashedPassword,
//       role: 'collector',
//       status: 'active',
//       collectorType: 'marche', // 🔥 Type explicitement défini ici
//       createdBy: req.user.id, // 🔥 trace du créateur
//     });

//     // Création du collecteur lié à cet utilisateur
//     const newCollector = await MarketCollector.create({
//       user: newUser._id,
//       assignedMarkets: [],
//     });

//     res.status(201).json({
//       message: 'Collecteur créé avec succès.',
//       user: newUser,
//       collectorDetails: newCollector,
//     });

//   } catch (err) {
//     console.error('Erreur création collecteur :', err);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// };




// exports.getChefmarketCollectors = async (req, res) => {
//   try {
//     const market = await Market.findById(req.user.marketId).populate({
//         path: 'collector',
//         select: 'name phone status role',
//       });
      

//     res.status(200).json(market.collector || []);
//   } catch (err) {
//     console.error('Erreur récupération collecteurs :', err);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// };

// ✅ Mettre à jour les infos d’un collecteur


// Création d'un utilisateur + collecteur de marché


// controllers/marketCollectorController.js



exports.createChefmarketCollector = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // 1️⃣ Champs obligatoires
    if (!name || !phone) {
      return res.status(400).json({ message: 'name et phone sont requis.' });
    }

    // 2️⃣ Récupérer le marché du chef de marché connecté
    const myMarket = await Market.findOne({ chefmarket: req.user.id });
    if (!myMarket) {
      return res.status(400).json({ message: 'Vous n’avez pas de marché configuré.' });
    }

    // 3️⃣ Unicité du téléphone + format +227
    const formattedPhone = phone.startsWith('+227') ? phone : `+227${phone}`;
    if (await User.findOne({ phone: formattedPhone })) {
      return res.status(400).json({ message: 'Ce numéro est déjà utilisé.' });
    }

    // 4️⃣ Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    // 5️⃣ Création du User en rôle collector
    const newUser = await User.create({
      name,
      phone: formattedPhone,
      password: hashedPassword,
      role: 'collector',
      status: 'active',
      collectorType: 'marche',
      createdBy: req.user.id
    });

    // 6️⃣ Création du MarketCollector lié automatiquement à myMarket
    const newMC = await MarketCollector.create({
      user: newUser._id,
      assignedMarkets: [ myMarket._id ],
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: 'Collecteur de marché créé avec succès.',
      user: newUser,
      marketCollector: newMC
    });

  } catch (err) {
    console.error('Erreur création collecteur :', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};




exports.getChefmarketCollectors = async (req, res) => {
  try {
    // Récupérer tous les collecteurs créés par ce chef (via User)
    const users = await User.find({
      role: 'collector',
      createdBy: req.user.id,
    }).select('_id name phone status role');

    const userIds = users.map(u => u._id);

    // Vérifie si ces users sont dans MarketCollector
    const marketCollectors = await MarketCollector.find({ user: { $in: userIds } });

    const result = users.filter(u =>
      marketCollectors.find(mc => mc.user.toString() === u._id.toString())
    );

    res.status(200).json(result);
  } catch (err) {
    console.error('Erreur récupération collecteurs :', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};;








exports.updateChefmarketCollector = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone }, { new: true });
    res.status(200).json({ message: 'Collecteur mis à jour', user });
  } catch (err) {
    console.error('Erreur mise à jour collecteur :', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Activer / Désactiver un collecteur
exports.toggleChefmarketCollectorStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.status(200).json({ message: `Statut mis à jour : ${user.status}` });
  } catch (err) {
    console.error('Erreur changement de statut :', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Supprimer un collecteur
exports.deleteChefmarketCollector = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Supprimer aussi le collecteur lié
    await Collector.deleteOne({ user: req.params.id });

    // Le retirer du marché
    await Market.findByIdAndUpdate(req.user.marketId, {
      $pull: { collectors: req.params.id },
    });

    res.status(200).json({ message: 'Collecteur supprimé' });
  } catch (err) {
    console.error('Erreur suppression collecteur :', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// ✅ Obtenir le marché du chef connecté
// exports.getChefmarketMarket = async (req, res) => {
//   try {
//     // On récupère simplement le marché lié au chef
//     const market = await Market.findOne({ chefmarket: req.user.id });

//     if (!market) {
//       return res.status(404).json({ message: 'Aucun marché trouvé pour ce chef.' });
//     }

//     // On ne renvoie que l'essentiel
//     return res.status(200).json({
//       name:     market.name,
//       location: market.location,
//       createdAt: market.createdAt // ← ici
//     });
//   } catch (error) {
//     console.error('❌ Erreur récupération marché :', error);
//     return res.status(500).json({ message: 'Erreur serveur.' });
//   }
// };


// ✅ Créer le marché du chef
// exports.createChefmarketMarket = async (req, res) => {
//   try {
//     // Vérifie qu’il n’existe pas déjà un marché pour ce chef
//     const existing = await Market.findOne({ chefmarket: req.user.id });
//     if (existing) {
//       return res.status(400).json({ message: 'Un marché existe déjà pour ce chef.' });
//     }

//     const market = await Market.create({
//       name: req.body.name,
//       location: req.body.location,
//       chefmarket: req.user.id,
//       collector: [], // aucun collecteur au départ
//       createdAt: new Date()
//     });

//     res.status(201).json(market);
//   } catch (error) {
//     console.error('❌ Erreur création marché :', error);
//     res.status(500).json({ message: 'Erreur serveur.' });
//   }
// };

// // ✅ Mettre à jour le marché du chef
// exports.updateChefmarketMarket = async (req, res) => {
//   try {
//     const updated = await Market.findOneAndUpdate(
//       { _id: req.params.id, chefmarket: req.user.id },
//       {
//         name: req.body.name,
//         location: req.body.location
//       },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: 'Marché introuvable ou non autorisé.' });
//     }

//     res.status(200).json(updated);
//   } catch (error) {
//     console.error('❌ Erreur mise à jour marché :', error);
//     res.status(500).json({ message: 'Erreur serveur.' });
//   }
// };



// ✅ Associer manuellement des collecteurs au marché
// exports.linkCollectorsToMarket = async (req, res) => {
//     try {
//       const { collectorIds } = req.body;
  
//       if (!Array.isArray(collectorIds)) {
//         return res.status(400).json({ message: "collectorIds doit être un tableau" });
//       }
  
//       await Market.findByIdAndUpdate(req.user.marketId, {
//         $addToSet: { collector: { $each: collectorIds } },
//       });
  
//       res.status(200).json({ message: "Collecteurs associés au marché avec succès." });
//     } catch (err) {
//       console.error("Erreur association collecteurs :", err);
//       res.status(500).json({ message: "Erreur serveur." });
//     }
//   };
  

exports.linkCollectorsToMarket = async (req, res) => {
  try {
    const { collectorIds } = req.body;

    if (!Array.isArray(collectorIds)) {
      return res.status(400).json({ message: "collectorIds doit être un tableau" });
    }

    const marketId = req.user.marketId;

    // Ajoute le marché au champ assignedMarkets de chaque collecteur
    await Promise.all(collectorIds.map(async (collectorId) => {
      await MarketCollector.findOneAndUpdate(
        { user: collectorId },
        { $addToSet: { assignedMarkets: marketId } }
      );
    }));

    res.status(200).json({ message: "Collecteurs associés au marché avec succès." });
  } catch (err) {
    console.error("Erreur association collecteurs :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


exports.getAssignedCollectors = async (req, res) => {
  try {
    const marketId = req.user.marketId;

    // Récupère tous les MarketCollectors liés à ce marché
    const marketCollectors = await MarketCollector.find({
      assignedMarkets: marketId
    }).populate({
      path: 'user',
      select: 'name phone status role createdBy',
      match: { createdBy: req.user.id } // ⚠️ Ne garde que ceux créés par ce chef
    });

    // Filtrer les entrées où user est null (non créé par ce chef)
    const filtered = marketCollectors
      .filter(mc => mc.user)
      .map(mc => mc.user);

    res.status(200).json(filtered);
  } catch (err) {
    console.error('Erreur récupération collecteurs associés :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};



  // exports.unlinkCollectorsFromMarket = async (req, res) => {
  //   try {
  //     const { collectorIds } = req.body;
  
  //     if (!Array.isArray(collectorIds)) {
  //       return res.status(400).json({ message: "collectorIds doit être un tableau" });
  //     }
  
  //     await Market.findByIdAndUpdate(req.user.marketId, {
  //       $pull: { collector: { $in: collectorIds } },
  //     });
  
  //     res.status(200).json({ message: "Collecteurs dissociés avec succès." });
  //   } catch (err) {
  //     console.error("Erreur dissociation collecteurs :", err);
  //     res.status(500).json({ message: "Erreur serveur." });
  //   }
  // };
  


exports.unlinkCollectorsFromMarket = async (req, res) => {
  try {
    const { collectorIds } = req.body;

    if (!Array.isArray(collectorIds)) {
      return res.status(400).json({ message: "collectorIds doit être un tableau." });
    }

    // 🔁 Supprimer le marché du champ `assignedMarkets` des collecteurs concernés
    await MarketCollector.updateMany(
      { user: { $in: collectorIds } },
      { $pull: { assignedMarkets: req.user.marketId } }
    );

    res.status(200).json({ message: "Collecteurs dissociés avec succès du marché." });
  } catch (err) {
    console.error("Erreur dissociation collecteurs :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};



exports.getBoutiquesByChefmarket = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;
  
      const [boutiques, total] = await Promise.all([
        Boutique.find({ market: req.user.marketId })
          .populate('boutiqueModel', 'name price') // ⚠️ ici !
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Boutique.countDocuments({ market: req.user.marketId }),
      ]);
  
      res.json({
        boutiques,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (err) {
      console.error('❌ Erreur récupération boutiques :', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };



  exports.updateBoutiqueByChefmarket = async (req, res) => {
    try {
      const {
        number,
        locationDetails,
        acquisitionType,
        boutiqueModel,
        rentAmount,
        contractStartDate,
        contractDurationMonths,
        purchaseAmount,
        purchaseDate,
        latitude,
        longitude,
      } = req.body;
  
      const boutique = await Boutique.findOne({
        _id: req.params.id,
        chefmarket: req.user.id,
      });
  
      if (!boutique) {
        return res.status(404).json({ message: 'Boutique introuvable' });
      }
  
      boutique.number = number || boutique.number;
      boutique.locationDetails = locationDetails || boutique.locationDetails;
      boutique.acquisitionType = acquisitionType || boutique.acquisitionType;
      boutique.boutiqueModel = boutiqueModel || boutique.boutiqueModel;
      boutique.latitude = latitude || boutique.latitude;
      boutique.longitude = longitude || boutique.longitude;
  
      if (acquisitionType === 'location') {
        boutique.rentAmount = rentAmount;
        boutique.contractStartDate = contractStartDate;
        boutique.contractDurationMonths = contractDurationMonths;
        boutique.purchaseAmount = undefined;
        boutique.purchaseDate = undefined;
      } else if (acquisitionType === 'achat') {
        boutique.purchaseAmount = purchaseAmount;
        boutique.purchaseDate = purchaseDate;
        boutique.rentAmount = undefined;
        boutique.contractStartDate = undefined;
        boutique.contractDurationMonths = undefined;
      }
  
      // Si une nouvelle image est envoyée
      if (req.file) {
        boutique.photoUrl = `/uploads/boutiques/${req.file.filename}`;
      }
  
      await boutique.save();
  
      res.status(200).json({ message: 'Boutique mise à jour', boutique });
  
    } catch (err) {
      console.error('❌ Erreur mise à jour boutique :', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };
  
  
  exports.getCommercantsByMarket = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;
  
      const [commercants, total] = await Promise.all([
        Commercant.find({ market: req.user.marketId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Commercant.countDocuments({ market: req.user.marketId }),
      ]);
  
      res.status(200).json({
        commercants,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("❌ Erreur récupération commerçants :", error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
  


  exports.getAssignedBoutiquesWithCommercants = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;
  
      const [boutiques, total] = await Promise.all([
        Boutique.find({ market: req.user.marketId, commercant: { $ne: null } })
          .populate('commercant', 'name phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Boutique.countDocuments({ market: req.user.marketId, commercant: { $ne: null } }),
      ]);
  
      res.json({
        boutiques,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (err) {
      console.error('Erreur récupération boutiques associées :', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };


  exports.unlinkBoutiqueFromCommercant = async (req, res) => {
    try {
      const { boutiqueId } = req.params;
  
      const updated = await Boutique.findByIdAndUpdate(
        boutiqueId,
        { commercant: null, status: 'libre' },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ message: 'Boutique non trouvée' });
      }
  
      res.status(200).json({ message: 'Boutique dissociée avec succès' });
    } catch (err) {
      console.error('Erreur dissociation :', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };




  // exports.generateMonthlyLocationPayments = async (req, res) => {
  //   try {
  //     const now = new Date();
  //     const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  //     const boutiques = await Boutique.find({ market: req.user.marketId, commercant: { $ne: null } }).populate('commercant');
  
  //     let created = 0;
  
  //     for (const b of boutiques) {
  //       const exists = await PaiementLocation.findOne({ boutique: b._id, period });
      
  //       if (!exists) {
  //         if (!b.rentAmount) {
  //           console.warn(`Boutique ${b._id} n’a pas de rentAmount défini.`);
  //           continue; // saute cette boutique
  //         }
      
  //         await PaiementLocation.create({
  //           boutique: b._id,
  //           commercant: b.commercant._id,
  //           chefmarket: req.user.id,
  //           expectedAmount: b.rentAmount,
  //           period,
  //           status: 'en_retard',
  //           isComplete: false,
  //         });
  //         created++;
  //       }
  //     }
      
  
  //     res.status(201).json({ message: `${created} paiements générés pour ${period}` });
  //   } catch (err) {
  //     console.error("Erreur génération paiements :", err);
  //     res.status(500).json({ message: "Erreur serveur" });
  //   }
  // };
  
  

  // exports.addLocationPayment = async (req, res) => {
  //   try {
  //     const { paiementLocationId, amount, modePaiement } = req.body;
  
  //     const paiement = await PaiementLocation.findById(paiementLocationId);
  //     if (!paiement) return res.status(404).json({ message: "Paiement introuvable." });
  
  //     paiement.paiements.push({ amount, modePaiement });
  
  //     const totalPaid = paiement.paiements.reduce((sum, p) => sum + p.amount, 0);
  
  //     paiement.isComplete = totalPaid >= paiement.expectedAmount;
  //     paiement.status = paiement.isComplete
  //       ? 'payé'
  //       : totalPaid > 0
  //       ? 'partiel'
  //       : 'en_retard';
  
  //     await paiement.save();
  
  //     res.status(200).json({ message: 'Paiement enregistré avec succès.', paiement });
  //   } catch (err) {
  //     console.error("Erreur lors de l'ajout du paiement :", err);
  //     res.status(500).json({ message: "Erreur serveur" });
  //   }
  // };




  
  



  

  // exports.getPaiementsLocation = async (req, res) => {
  //   try {
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = 6;
  //     const skip = (page - 1) * limit;
  //     const search = req.query.search || '';
  
  //     // Construire la condition de recherche
  //     const match = {
  //       chefmarket: req.user.id,
  //     };
  
  //     if (search) {
  //       const commercants = await Commercant.find({
  //         $or: [
  //           { name: { $regex: search, $options: 'i' } },
  //           { phone: { $regex: search, $options: 'i' } },
  //         ],
  //       }).select('_id');
  
  //       const commercantIds = commercants.map((c) => c._id);
  //       match.commercant = { $in: commercantIds };
  //     }
  
  //     const [paiements, total] = await Promise.all([
  //       PaiementLocation.find(match)
  //         .populate('boutique', 'number locationDetails')
  //         .populate('commercant', 'name phone')
  //         .skip(skip)
  //         .limit(limit)
  //         .sort({ period: -1 }),
  
  //       PaiementLocation.countDocuments(match),
  //     ]);
  
  //     res.json({
  //       paiements,
  //       totalPages: Math.ceil(total / limit),
  //       currentPage: page,
  //     });
  //   } catch (err) {
  //     console.error("❌ Erreur chargement paiements :", err);
  //     res.status(500).json({ message: "Erreur serveur" });
  //   }
  // };
  
  exports.generateMonthlyLocationPayments = async (req, res) => {
    try {
      // const now = new Date();
      // const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
      let period = req.body.period;

if (!period) {
  const now = new Date();
  period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}


// Protection : interdiction de générer pour un mois antérieur au mois actuel
const now = new Date();
const [inputYear, inputMonth] = period.split('-').map(Number);

const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

if (
  inputYear < currentYear ||
  (inputYear === currentYear && inputMonth < currentMonth)
) {
  return res.status(400).json({
    message: `❌ Vous ne pouvez pas générer les paiements pour une période antérieure à ${currentYear}-${String(currentMonth).padStart(2, '0')}`,
  });
}



      // ⚠️ Vérifie si des paiements pour ce mois existent déjà
      const existing = await PaiementLocation.findOne({
        chefmarket: req.user.id,
        period,
      });
  
      if (existing) {
        return res.status(400).json({
          message: `⚠️ Les paiements pour ${period} ont déjà été générés.`,
        });
      }
  
      // 🔍 Cherche les boutiques occupées
      const boutiques = await Boutique.find({
        market: req.user.marketId,
        commercant: { $ne: null },
      }).populate('commercant');
  
      let created = 0;
      let createdPaiements = [];
  
      for (const b of boutiques) {
        if (!b.rentAmount) {
          console.warn(`Boutique ${b._id} n’a pas de rentAmount défini.`);
          continue;
        }
  
        const paiement = await PaiementLocation.create({
          boutique: b._id,
          commercant: b.commercant._id,
          chefmarket: req.user.id,
          expectedAmount: b.rentAmount,
          period,
          status: 'en_retard',
          isComplete: false,
        });
  
        createdPaiements.push(paiement);
        created++;
      }
  
      return res.status(201).json({
        message: `${created} paiements générés pour ${period}`,
        paiements: createdPaiements,
      });
    } catch (err) {
      console.error("Erreur génération paiements :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  

 

exports.getPaiementsByPeriod = async (req, res) => {
  try {
    const period = req.query.period;
    if (!period) {
      return res.status(400).json({ message: 'Période manquante.' });
    }

    const paiements = await PaiementLocation.find({
      chefmarket: req.user.id,
      period,
    })
      .populate('boutique', 'number')
      .populate('commercant', 'name phone');

    res.json(paiements);
  } catch (err) {
    console.error('Erreur récupération paiements :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};






  exports.addLocationPayment = async (req, res) => {
    try {
      const { paiementLocationId, amount, modePaiement } = req.body;
  
      const paiement = await PaiementLocation.findById(paiementLocationId);
      if (!paiement) return res.status(404).json({ message: "Paiement introuvable." });
  
      const totalPaidSoFar = paiement.paiements.reduce((sum, p) => sum + p.amount, 0);
      const newTotal = totalPaidSoFar + amount;
  
      // ❌ Vérifie si on dépasse le montant attendu
      if (newTotal > paiement.expectedAmount) {
        return res.status(400).json({
          message: `Montant trop élevé. Montant attendu : ${paiement.expectedAmount.toLocaleString()} FCFA. Déjà payé : ${totalPaidSoFar.toLocaleString()} FCFA.`,
        });
      }
  
      // ✅ Si OK, on ajoute le paiement
      paiement.paiements.push({ amount, modePaiement });
  
      const totalPaid = newTotal;
      paiement.isComplete = totalPaid >= paiement.expectedAmount;
      paiement.status = paiement.isComplete
        ? 'payé'
        : totalPaid > 0
        ? 'partiel'
        : 'en_retard';
  
      await paiement.save();
  
      res.status(200).json({ message: 'Paiement enregistré avec succès.', paiement });
    } catch (err) {
      console.error("Erreur lors de l'ajout du paiement :", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  

  exports.getPaiementsLocation = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;
      const search = req.query.search || '';
  
      const match = {
        chefmarket: req.user.id,
      };
  
      if (search) {
        const commercants = await Commercant.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');
  
        const commercantIds = commercants.map((c) => c._id);
        match.commercant = { $in: commercantIds };
      }
  
      const [paiements, total] = await Promise.all([
        PaiementLocation.find(match)
          .populate('boutique', 'number locationDetails')
          .populate('commercant', 'name phone')
          .skip(skip)
          .limit(limit)
          .sort({ period: -1 }),
  
        PaiementLocation.countDocuments(match),
      ]);
  
      res.json({
        paiements,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (err) {
      console.error("❌ Erreur chargement paiements :", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  


  exports.getAllPaiementsForChefMarket = async (req, res) => {
    try {
      const filter = { chefmarket: req.user.id };
  
      if (req.query.period) {
        filter.period = req.query.period;
      }
  
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
  
      const paiements = await PaiementLocation.find(filter)
        .populate('boutique', 'number')
        .populate('commercant', 'name phone')
        .sort({ period: -1 })
        .skip(skip)
        .limit(limit);
  
      const total = await PaiementLocation.countDocuments(filter);
  
      res.json({
        paiements,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (err) {
      console.error('Erreur pagination paiements :', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };




  exports.getPaiementsSummary = async (req, res) => {
    try {
      const paiements = await PaiementLocation.find({ chefmarket: req.user.id })
        .populate('commercant')
        .populate('boutique');
  
      const totalBoutiques = await Boutique.countDocuments({ market: req.user.marketId });
      const occupiedBoutiques = await Boutique.countDocuments({ market: req.user.marketId, commercant: { $ne: null } });
      const nonOccupiedBoutiques = totalBoutiques - occupiedBoutiques;

      let totalExpected = 0;
      let totalPaid = 0;
      let enRetard = 0;
      let partiel = 0;
      let paye = 0;
  
      paiements.forEach((p) => {
        totalExpected += p.expectedAmount;
        const totalPaiement = p.paiements.reduce((sum, pay) => sum + pay.amount, 0);
        totalPaid += totalPaiement;
  
        if (p.status === 'en_retard') enRetard++;
        else if (p.status === 'partiel') partiel++;
        else if (p.status === 'payé') paye++;
      });
  
      res.json({
        totalBoutiques,
        occupiedBoutiques,
        nonOccupiedBoutiques,
        totalExpected,
        totalPaid,
        tauxPaiement: totalExpected ? Math.round((totalPaid / totalExpected) * 100) : 0,
        paiements: {
          enRetard,
          partiel,
          paye,
        },
      });
    } catch (err) {
      console.error('Erreur résumé paiements :', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };





  // GET /api/chefmarket/boutiques?occupied=true|false
  exports.getBoutiquesByOccupation = async (req, res) => {
    try {
      const isOccupied = req.query.occupied === 'true';
  
      const filter = {
        market: req.user.marketId,
        ...(isOccupied ? { commercant: { $ne: null } } : { commercant: null }),
      };
  
      const boutiques = await Boutique.find(filter)
      .select('number rentAmount commercant')
      .populate('commercant', 'name phone')
      .sort({ number: 1 });
    
  
      res.json(boutiques);
    } catch (err) {
      console.error('Erreur chargement boutiques occupation :', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };















exports.generateTaxMarketReceipts = async (req, res) => {
  try {
    const { marketCollectorId, quantity } = req.body;
    const userId = req.user.id; // Chef de marché connecté

    if (!marketCollectorId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Données invalides.' });
    }

    // 🔎 Récupérer le marché du chef connecté
    const market = await Market.findOne({ chefmarket: userId });
    if (!market) {
      return res.status(404).json({ message: 'Marché non trouvé.' });
    }

    // 📦 Générer les reçus
    const year = new Date().getFullYear();
    const prefix = `REC-MRK-${year}`;
    const existingCount = await TaxMarketReceiptBatch.countDocuments({ market: market._id });

    let confirmationCodes = [];
    let startNumber = existingCount * 1000 + 1;

    for (let i = 0; i < quantity; i++) {
      const receiptNumber = `${prefix}-${String(startNumber + i).padStart(5, '0')}`;
      const codeConfirmation = generateConfirmationCode();

      confirmationCodes.push({
        receiptNumber,
        codeConfirmation,
        status: 'Generated',
      });
    }

    const batch = new TaxMarketReceiptBatch({
      market: market._id,
      marketCollector: marketCollectorId,
      startReceipt: confirmationCodes[0].receiptNumber,
      endReceipt: confirmationCodes[confirmationCodes.length - 1].receiptNumber,
      confirmationCodes,
      createdBy: userId,
    });

    await batch.save();

    res.status(201).json({
      message: 'Lot de reçus généré avec succès.',
      receiptBatch: batch,
    });
  } catch (error) {
    console.error('Erreur génération reçus :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔐 Générateur de codes simples à taper (4 lettres + 2 chiffres)
function generateConfirmationCode() {
  const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sans I, O, Q
  const DIGITS = '23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
  }
  for (let i = 0; i < 2; i++) {
    result += DIGITS.charAt(Math.floor(Math.random() * DIGITS.length));
  }
  return result;
};



  
  



exports.getReceiptBatchesByChef = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔍 Récupérer le marché du chef connecté
    const market = await Market.findOne({ chefmarket: userId });
    if (!market) {
      return res.status(404).json({ message: 'Marché non trouvé.' });
    }

    const batches = await TaxMarketReceiptBatch.find({ market: market._id })
      .populate({
        path: 'market',
        select: 'name location chefmarket',
        populate: {
          path: 'chefmarket',
          select: 'name phone',
        },
      })
      .populate('marketCollector', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json(batches);
  } catch (error) {
    console.error("Erreur chargement des lots :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};



exports.activateReceiptBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const userId = req.user.id;

    console.log("🟢 Requête d'activation reçue pour :", batchId);
    console.log("🔐 Utilisateur connecté :", userId);

    const batch = await TaxMarketReceiptBatch.findById(batchId);
    if (!batch) {
      console.warn("❌ Lot introuvable :", batchId);
      return res.status(404).json({ message: 'Lot de reçus introuvable.' });
    }

    if (batch.status !== 'Generated') {
      console.warn("⚠️ Lot déjà activé ou utilisé :", batch.status);
      return res.status(400).json({ message: 'Ce lot est déjà activé ou utilisé.' });
    }

    // ✅ Mettre à jour le lot
    batch.status = 'Activated';
    batch.activatedAt = new Date();
    batch.activatedBy = userId;

    // ✅ Mettre à jour chaque reçu dans le lot
    batch.confirmationCodes = batch.confirmationCodes.map(code => ({
      ...code.toObject(),
      status: 'Activated',
    }));

    await batch.save();

    console.log("✅ Lot activé avec succès :", batch._id);

    res.status(200).json({
      message: 'Lot activé avec succès.',
      updatedBatch: batch,
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'activation :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};




// controllers/chefMarketController.js



/**
 * GET /api/is-market-collector
 * (roleMiddleware('collector'))
 * Renvoie { isMarketCollector: true } si le collector connecté
 * a au moins un marché dans assignedMarkets.
 */
exports.isMarketCollector = async (req, res) => {
  try {
    const mc = await MarketCollector.findOne({ user: req.user.id });
    const isMarket = Boolean(mc && mc.assignedMarkets.length > 0);
    return res.status(200).json({ isMarketCollector: isMarket });
  } catch (err) {
    console.error('❌ Erreur isMarketCollector :', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.getMyMarket = async (req, res) => {
  try {
    console.log('🧾 ID utilisateur connecté :', req.user.id);

    const market = await Market.findOne({ chefmarket: req.user.id });

    if (!market) {
      console.warn('❌ Aucun marché trouvé pour ce chef.');
      return res.status(404).json({ message: "Aucun marché trouvé." });
    }

    console.log('✅ Marché trouvé :', market.name);
    res.json(market);
  } catch (err) {
    console.error('❌ Erreur getMyMarket :', err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


exports.updateMyMarket = async (req, res) => {
  const updates = req.body;
  const market = await Market.findOneAndUpdate(
    { chefmarket: req.user.id },
    updates,
    { new: true }
  );
  if (!market) return res.status(404).json({ message: "Marché introuvable." });
  res.json({ message: "Marché mis à jour", market });
};
