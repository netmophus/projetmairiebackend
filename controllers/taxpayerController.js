

const Taxpayer = require('../models/Taxpayer');
const User = require('../models/User');
const Tax = require('../models/Tax');
const TaxpayerTax = require('../models/TaxpayerTax');
const bcrypt = require('bcryptjs');



const { v4: uuidv4 } = require('uuid'); // 🔥 Générer un `taxpayerCode` unique




const searchTaxpayersByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "Le numéro de téléphone est requis pour la recherche." });
    }

    const taxpayers = await Taxpayer.find({ 
      "user.phone": { $regex: phone, $options: 'i' }  // Recherche partielle insensible à la casse
    }).limit(10);  // Limiter les résultats pour éviter de surcharger l'application

    res.json(taxpayers);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la recherche des contribuables." });
  }
};







const createTaxpayer = async (req, res) => {
  try {
    console.log("📌 [CONTROLLER] createTaxpayer appelé.");
    console.log("📩 Données reçues :", req.body);

    const {
      name,
      phone,
      address,
      password,
      activityType,
      activitySector, // ✅ Nouveau champ ajouté
      zone,
      coordinates,
      taxpayerType, // ✅ Individu ou Entreprise
      businessName,
      registrationNumber,
      idNumber,
      email,
      communalDistrict, // ✅ Ajout arrondissement communal
      city, // 🔹 Ajout de la ville
     region, // 🔹 Ajout de la région
    } = req.body;

    // ✅ Vérification des champs obligatoires
    if (!name || !phone || !address || !activityType || !zone || !communalDistrict || !taxpayerType || !city || !region) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }
    

    // ✅ Vérifiez si un utilisateur avec le même numéro de téléphone existe déjà
    let existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec ce numéro de téléphone existe déjà.' });
    }

    // ✅ Création de l'utilisateur avec un rôle 'taxpayer'
    const hashedPassword = await bcrypt.hash(password || '12345678', 10);

    const newUser = new User({
      name,
      phone,
      password: hashedPassword, // Mot de passe par défaut
      role: 'contribuable',
      email,
    });

    await newUser.save();

    // ✅ Génération d'un `taxpayerCode` unique
    const taxpayerCode = `TP-${uuidv4().split('-')[0].toUpperCase()}`;

    // ✅ Création du contribuable associé
    const newTaxpayer = new Taxpayer({
      user: newUser._id, // ID de l'utilisateur
      taxpayerCode,
      taxpayerType, // ✅ Individu ou Entreprise
      businessName: taxpayerType === 'Entreprise' ? businessName : null,
      registrationNumber: taxpayerType === 'Entreprise' ? registrationNumber : null,
      idNumber: taxpayerType === 'Individu' ? idNumber : null,
      email,
      phone,
      address,
      city, // 🔹 Ajout de la ville
      region, // 🔹 Ajout de la région
      activityType,
      activitySector,
      zone,
      communalDistrict, // ✅ Arrondissement communal
      coordinates,
      createdBy: req.user.collectorId, // ✅ Collecteur qui a créé le contribuable
    });

    await newTaxpayer.save();

    console.log("✅ Contribuable créé avec succès :", newTaxpayer);

    res.status(201).json({ message: 'Contribuable créé avec succès.', taxpayer: newTaxpayer });
  } catch (err) {
    console.error("❌ Erreur lors de la création du contribuable :", err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

 

  const getTaxpayers = async (req, res) => {
    try {
      const collectorId = req.user.collectorId; // 🔥 Récupère l'ID du collecteur défini dans le middleware
  
      if (!collectorId) {
        console.error("❌ Erreur : ID du collecteur non trouvé dans req.user");
        return res.status(400).json({ message: "Impossible d'identifier le collecteur." });
      }
  
      console.log(`🔍 Récupération des contribuables pour le collecteur : ${collectorId}`);
  
      // Filtrer les contribuables créés par ce collecteur uniquement
      const taxpayers = await Taxpayer.find({ createdBy: collectorId }) // 🔥 Utilisation correcte de l'ID
        .populate('user', 'name phone email') // Peupler les infos de l'utilisateur
        .populate('zone', 'name'); // Peupler les infos de la zone
  
      console.log(`✅ ${taxpayers.length} contribuables trouvés pour le collecteur ${collectorId}`);
  
      res.status(200).json(taxpayers);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des contribuables :', err.message);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };
  
  


 
  const getTaxpayersWithTaxes = async (req, res) => {
    try {
      const role = req.user.role;
      const collectorId = req.user.collectorId;
  
      console.log("📌 Début de la récupération des contribuables avec leurs taxes.");
      console.log("👤 Rôle :", role);
      console.log("📌 Collecteur connecté :", collectorId);
  
      let taxpayers;
  
      if (role === "collector") {
        // 👉 Récupérer les contribuables créés par ce collecteur
        taxpayers = await Taxpayer.find({ createdBy: collectorId })
          .populate("user", "name phone")
          .populate("zone", "name")
          .populate({
            path: "taxes",
            populate: {
              path: "tax",
              model: "Tax",
              select: "name amount dueDate",
            },
          });
      } else if (role === "admin") {
        // 👉 Récupérer TOUS les contribuables
        taxpayers = await Taxpayer.find()
          .populate("user", "name phone")
          .populate("zone", "name")
          .populate({
            path: "taxes",
            populate: {
              path: "tax",
              model: "Tax",
              select: "name amount dueDate",
            },
          });
      } else {
        return res.status(403).json({ message: "Accès non autorisé." });
      }
  
      if (!taxpayers || taxpayers.length === 0) {
        console.warn("⚠ Aucun contribuable trouvé.");
        return res.status(404).json({ message: "Aucun contribuable trouvé." });
      }
  
      const taxpayersWithTaxNames = taxpayers.map((taxpayer) => ({
        ...taxpayer.toObject(),
        taxes: taxpayer.taxes.map((taxpayerTax) => ({
          taxId: taxpayerTax.tax._id,
          name: taxpayerTax.tax.name,
          amount: taxpayerTax.totalAmount,
          dueDate: taxpayerTax.tax.dueDate,
          details: taxpayerTax.details || {},
        }))
        
      }));
  
      taxpayersWithTaxNames.forEach((tp) => {
        console.log(`🔍 Contribuable : ${tp.user?.name || tp.businessName}`);
        tp.taxes.forEach((t) => {
          console.log(`   ➤ Taxe : ${t.name}`);
          console.log(`   📦 Details :`, t.details);
        });
      });
  
      res.status(200).json(taxpayersWithTaxNames);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des contribuables avec taxes :", err.message);
      res.status(500).json({ message: "Erreur interne du serveur." });
    } finally {
      console.log("🔚 Fin de la récupération des contribuables avec taxes.");
    }
  };
  


const associateTaxesToTaxpayer = async (req, res) => {
  try {
    console.log("📥 Payload reçu :", JSON.stringify(req.body, null, 2));

    const { taxpayerId } = req.params;
    const collectorId = req.user.collectorId;
    const { taxes, surfaces } = req.body;

    if (!taxpayerId || !Array.isArray(taxes) || taxes.length === 0) {
      return res.status(400).json({ message: "Données invalides." });
    }

    const taxpayer = await Taxpayer.findOne({ _id: taxpayerId, createdBy: collectorId });
    if (!taxpayer) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const existingTaxes = await Tax.find({ _id: { $in: taxes } });
    if (existingTaxes.length !== taxes.length) {
      return res.status(400).json({ message: "Certaines taxes sont invalides." });
    }

    const newTaxpayerTaxes = [];

    for (const tax of existingTaxes) {
      const existingEntry = await TaxpayerTax.findOne({ taxpayer: taxpayerId, tax: tax._id });

      if (existingEntry) {
        if (existingEntry.status === 'archived') {
          existingEntry.status = 'pending';
          existingEntry.dueDate = tax.dueDate;
          existingEntry.remainingAmount = existingEntry.totalAmount - existingEntry.paidAmount;
          await existingEntry.save();
          newTaxpayerTaxes.push(existingEntry._id);
          continue;
        } else {
          continue; // Déjà active, on ne refait rien
        }
      }

      let totalAmount = 0;
      let taxDetails = {};

      console.log("🔍 TRAITEMENT TAXE :", tax.name);
      console.log("📩 Surfaces envoyées :", JSON.stringify(surfaces?.[tax._id], null, 2));
      console.log("📩 Tarifs BDD :", JSON.stringify(tax.surfaceRates || {}, null, 2));

      if (tax.name === "Taxe d'occupation du domaine public") {
        const surface = surfaces?.[tax._id]?.surface || 0;
        const rateValue = tax.surfaceRates?.find(rate => rate.category === "Occupation")?.ratePerSquareMeter || 5000;
        totalAmount = surface * rateValue;
        taxDetails = { surface, rate: rateValue };
      }

      else if (tax.name === "Taxe de publicité") {
        const adData = surfaces?.[tax._id]?.surfaces || {};
        const surfacesWithRates = {};
        for (const [category, surface] of Object.entries(adData)) {
          const rate = tax.surfaceRates.find(r => r.category === category)?.ratePerSquareMeter || 0;
          totalAmount += surface * rate;
          surfacesWithRates[category] = { surface, rate };
        }
        taxDetails = { surfaces: surfacesWithRates };
      }

      else if (tax.name === "Taxe de salubrité") {
        totalAmount = tax.sanitationRate * tax.sanitationDays;
        taxDetails = { dailyRate: tax.sanitationRate, days: tax.sanitationDays };
      }

      else if (tax.name === "Taxe sur les pompes à hydrocarbures et dépôts de colis") {
        const pumpCount = surfaces?.[tax._id]?.pistols || 0;
        totalAmount = pumpCount * tax.pumpRate;
        taxDetails = { pumpCount, rate: tax.pumpRate };
      }

      else {
        totalAmount = tax.frequency === "monthly" ? tax.amount * 12 : tax.amount;
      }

      const newEntry = new TaxpayerTax({
        taxpayer: taxpayerId,
        tax: tax._id,
        totalAmount,
        remainingAmount: totalAmount,
        dueDate: tax.dueDate,
        status: "pending",
        details: taxDetails,
      });

      await newEntry.save();
      newTaxpayerTaxes.push(newEntry._id);
    }

    taxpayer.taxes = [...(taxpayer.taxes || []), ...newTaxpayerTaxes];
    await taxpayer.save();

    res.status(200).json({ message: "Taxes associées avec succès.", taxpayer });

  } catch (err) {
    console.error("🔥 ERREUR BACKEND :", err);
    res.status(500).json({ message: "Erreur interne du serveur.", error: err.message });
  }
};



const dissociateTaxFromTaxpayer = async (req, res) => {
  try {
    const { taxpayerId } = req.params;
    const { taxIds } = req.body;

    console.log("🔄 Tentative de dissociation des taxes :", taxIds, "pour le contribuable :", taxpayerId);

    if (!Array.isArray(taxIds) || taxIds.length === 0) {
      return res.status(400).json({ message: "Aucune taxe à dissocier." });
    }

    // 1. Trouver les entrées TaxpayerTax concernées
    const entries = await TaxpayerTax.find({
      taxpayer: taxpayerId,
      tax: { $in: taxIds },
    });

    if (!entries || entries.length === 0) {
      return res.status(404).json({ message: "Aucune association trouvée." });
    }

    const entryIds = entries.map((e) => e._id);

    // 2. Supprimer les références dans Taxpayer
    await Taxpayer.findByIdAndUpdate(taxpayerId, {
      $pull: { taxes: { $in: entryIds } },
    });

    // 3. Supprimer les entrées TaxpayerTax
    await TaxpayerTax.deleteMany({ _id: { $in: entryIds } });

    console.log("✅ Taxes dissociées (archivées) avec succès.");
    res.status(200).json({ message: "Taxes dissociées avec succès." });
  } catch (err) {
    console.error("❌ Erreur lors de la dissociation :", err.message);
    res.status(500).json({ message: "Erreur serveur lors de la dissociation." });
  }
};



  const getTaxpayerByPhone = async (req, res) => {
    try {
      const { phone } = req.params;
  
      // Vérifier si le numéro de téléphone est fourni
      if (!phone) {
        return res.status(400).json({ message: 'Numéro de téléphone requis.' });
      }
  
      // Rechercher le contribuable par le numéro de téléphone
      const taxpayer = await Taxpayer.findOne({ 'user.phone': phone })
        .populate('user', 'name phone') // Peupler les informations utilisateur (nom, téléphone)
        .populate('zone', 'name') // Peupler les informations de la zone
        .populate('taxes', 'name amount remainingAmount dueDate'); // Peupler les informations sur les taxes associées
  
      // Vérifier si un contribuable a été trouvé
      if (!taxpayer) {
        return res.status(404).json({ message: 'Contribuable introuvable.' });
      }
  
      // Retourner les informations du contribuable
      res.status(200).json(taxpayer);
    } catch (err) {
      console.error('Erreur lors de la recherche du contribuable :', err.message);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };



// const getOneTaxpayerWithTaxes = async (req, res) => {
//   console.log("[getOneTaxpayerWithTaxes] - Début de la fonction.");
//   try {
//     const { taxpayerId } = req.params;
//     console.log("[getOneTaxpayerWithTaxes] - taxpayerId reçu :", taxpayerId);

//     // On cherche tous les documents dans la collection TaxpayerTax
//     // dont le champ "taxpayer" == taxpayerId
//     const associations = await TaxpayerTax.find({ taxpayer: taxpayerId })
//       .populate("tax", "name amount dueDate isVariable  remainingAmount"); 
//       // => On peuple le champ "tax" en récupérant
//       // les champs name, amount, dueDate, etc. (selon ton modèle Tax)

//     console.log("[getOneTaxpayerWithTaxes] - Nombre d’associations trouvées :", associations.length);

//     // Log détaillé de chaque association
//     associations.forEach((assoc, i) => {
//       console.log(`[getOneTaxpayerWithTaxes] - Association #${i}:`, JSON.stringify(assoc, null, 2));
//     });

//     // Renvoyer le tableau d'associations
//     res.status(200).json(associations);
//     console.log("[getOneTaxpayerWithTaxes] - Réponse envoyée avec succès.");

//   } catch (error) {
//     console.error("[getOneTaxpayerWithTaxes] - Erreur lors de la récupération des taxes associées :", error.message);
//     res.status(500).json({ message: "Erreur interne du serveur." });
//   } finally {
//     console.log("[getOneTaxpayerWithTaxes] - Fin de la fonction.");
//   }
// };

 

// 🔹 Récupérer les contribuables avec pagination et recherche

const getOneTaxpayerWithTaxes = async (req, res) => {
  console.log("[getOneTaxpayerWithTaxes] - Début de la fonction.");
  try {
    const { taxpayerId } = req.params;
    console.log("[getOneTaxpayerWithTaxes] - taxpayerId reçu :", taxpayerId);

    // On cherche tous les documents dans la collection TaxpayerTax
    const associations = await TaxpayerTax.find({ taxpayer: taxpayerId })
      .populate("tax", "name amount dueDate isVariable remainingAmount")
      .select("tax totalAmount status dueDate remainingAmount details"); // 🔥 Modification ici

    console.log("[getOneTaxpayerWithTaxes] - Nombre d’associations trouvées :", associations.length);

    // Log détaillé de chaque association
    associations.forEach((assoc, i) => {
      console.log(`[getOneTaxpayerWithTaxes] - Association #${i}:`, JSON.stringify(assoc, null, 2));
    });

    // Renvoyer le tableau d'associations
    res.status(200).json(associations);
    console.log("[getOneTaxpayerWithTaxes] - Réponse envoyée avec succès.");

  } catch (error) {
    console.error("[getOneTaxpayerWithTaxes] - Erreur lors de la récupération des taxes associées :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  } finally {
    console.log("[getOneTaxpayerWithTaxes] - Fin de la fonction.");
  }
};





const getPaginatedTaxpayers = async (req, res) => {
  console.log("===== Début de la récupération des contribuables avec pagination =====");

  try {
    console.log("📌 Utilisateur authentifié : ", req.user ? req.user.name : "Non défini");
    console.log("📌 Rôle de l'utilisateur : ", req.user ? req.user.role : "Non défini");

    // Vérification du rôle admin
    if (!req.user || req.user.role !== 'admin') {
      console.error("❌ Accès refusé : L'utilisateur n'a pas le rôle 'admin'.");
      return res.status(403).json({ message: 'Accès refusé. Rôle non autorisé.' });
    }

    // Récupérer les paramètres de requête pour la pagination et la recherche
    let { page = 1, limit = 50, search = "" } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    console.log(`🔍 Recherche : "${search}" | Page : ${page} | Limite : ${limit}`);

    const searchQuery = search
      ? {
          $or: [
            { address: { $regex: search, $options: 'i' } },
            { activityType: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    console.log("🟢 Exécution de la requête pour récupérer les contribuables...");

    const taxpayers = await Taxpayer.find(searchQuery)
      .populate('user', 'name phone status')
      .populate('zone', 'name') // Affichage du nom de la zone
      .sort({ createdAt: -1 }) // Trier du plus récent au plus ancien
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalTaxpayers = await Taxpayer.countDocuments(searchQuery);

    console.log(`✅ ${taxpayers.length} contribuables récupérés sur un total de ${totalTaxpayers}`);

    res.status(200).json({
      total: totalTaxpayers,
      page,
      limit,
      taxpayers,
    });

  } catch (err) {
    console.error("❌ Erreur lors de la récupération des contribuables :", err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des contribuables.' });
  }
};


  

module.exports = { searchTaxpayersByPhone, createTaxpayer, getTaxpayers, getTaxpayersWithTaxes, associateTaxesToTaxpayer, getTaxpayerByPhone , getOneTaxpayerWithTaxes, getPaginatedTaxpayers, dissociateTaxFromTaxpayer};
