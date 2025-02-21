// const Taxpayer = require('../models/Taxpayer');
// const Collector = require('../models/Collector');
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const Tax = require('../models/Tax');
// const TaxpayerTax = require('../models/TaxpayerTax');


// // Ajouter un contribuable


// const addTaxpayer = async (req, res) => {

//   try {
//     const { name, address, activityType, phone, zone } = req.body;

//     // Vérifier si un utilisateur avec ce numéro de téléphone existe déjà
//     const existingUser = await User.findOne({ phone });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Un utilisateur avec ce numéro de téléphone existe déjà.' });
//     }

//     // Créer un utilisateur pour le contribuable
//     const defaultPassword = '12345678';
//     const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//     const newUser = new User({
//       name,
//       phone,
//       role: 'contribuable', // Rôle par défaut pour les contribuables
//       password: hashedPassword,
//     });

//     await newUser.save();
  
//     // Créer le contribuable
//     const taxpayer = new Taxpayer({
//       name,
//       address,
//       activityType,
//       phone,
//       zone,
//       assignedCollector: req.user.id, // Associer automatiquement le collecteur connecté
//       coordinates: req.body.coordinates || {}, // Par défaut vide si non fourni
//       media: {
//         photos: req.body.media?.photos || [],
//         videos: req.body.media?.videos || [],
//       },
//     });

//     await taxpayer.save();
   
//     res.status(201).json({ taxpayer, user: newUser });
//   } catch (err) {
//     console.error('Erreur lors de l’ajout du contribuable :', err.message);
//     res.status(500).json({ message: 'Erreur lors de l’ajout du contribuable.' });
//   }
// };


// // Récupérer les contribuables d’un collecteur








// // const getTaxpayersByCollector = async (req, res) => {
// //   try {
// //     // Construire la requête par défaut
// //     const query = { assignedCollector: req.user.id };

// //     // Ajouter un filtre par _id si fourni
// //     if (req.query.id) {
// //       query._id = req.query.id.trim(); // Filtrer par l'ID du contribuable
// //     }

// //     console.log("Filtre appliqué :", query);

// //     // Exécuter la requête
// //     const taxpayers = await Taxpayer.find(query)
// //       .populate('zone', 'name') // Inclure les informations sur la zone
// //       .populate('assignedCollector', 'name email phone'); // Inclure les informations sur le collecteur

// //     console.log("Contribuables trouvés :", taxpayers);

// //     res.status(200).json(taxpayers);
// //   } catch (err) {
// //     console.error('Erreur lors de la récupération des contribuables :', err.message);
// //     res.status(500).json({ message: 'Erreur lors de la récupération des contribuables.' });
// //   }
// // };

// const getTaxpayersByCollector = async (req, res) => {
//   try {
//     console.log("=== Début du traitement de la recherche ===");
//     console.log("Requête reçue :", req.query);

//     // Construire la requête par défaut pour filtrer par collecteur
//     const query = { assignedCollector: req.user.id };

//     // Ajouter un filtre par numéro de téléphone si fourni
//     if (req.query.phone) {
//       const phoneWithPrefix = req.query.phone.startsWith('+')
//         ? req.query.phone.trim() // Garder tel quel si déjà avec le préfixe
//         : `+${req.query.phone.trim()}`; // Ajouter le préfixe "+"
//       query.phone = phoneWithPrefix;
//     }

//     console.log("Filtre appliqué :", query);

//     // Exécuter la requête
//     const taxpayers = await Taxpayer.find(query)
//       .populate('zone', 'name') // Inclure les informations sur la zone
//       .populate('assignedCollector', 'name email phone'); // Inclure les informations sur le collecteur

//     console.log("=== Contribuables trouvés ===");
//     console.log(taxpayers);

//     res.status(200).json(taxpayers);
//   } catch (err) {
//     console.error("Erreur lors de la récupération des contribuables :", err.message);
//     res.status(500).json({ message: 'Erreur lors de la récupération des contribuables.' });
//   }
// };




// // Modifier un contribuable
// const updateTaxpayer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const taxpayer = await Taxpayer.findById(id);
//     if (!taxpayer) {
//       return res.status(404).json({ message: 'Taxpayer non trouvé.' });
//     }

//     if (String(taxpayer.assignedCollector) !== String(req.user.id)) {
//       return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce taxpayer." });
//     }

//     Object.assign(taxpayer, updates);
//     await taxpayer.save();
//     res.status(200).json({ message: 'Taxpayer mis à jour avec succès.', taxpayer });
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur lors de la modification du taxpayer.', error: err.message });
//   }
// };

// // Supprimer un contribuable
// const deleteTaxpayer = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const taxpayer = await Taxpayer.findById(id);
//     if (!taxpayer) {
//       return res.status(404).json({ message: 'Taxpayer non trouvé.' });
//     }

//     if (String(taxpayer.assignedCollector) !== String(req.user.id)) {
//       return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce taxpayer." });
//     }

//     await taxpayer.remove();
//     res.status(200).json({ message: 'Taxpayer supprimé avec succès.' });
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur lors de la suppression du taxpayer.', error: err.message });
//   }
// };


// // Associer des taxes à un contribuable



// const associateTaxes = async (req, res) => {
 
//   try {
//     const { taxes } = req.body;

//     // Extraire uniquement les IDs des taxes reçues (gestion de différents formats)
//     const taxIds = taxes.map((tax) => (typeof tax === 'string' ? tax : tax._id));
//     //console.log('Tax IDs à associer :', taxIds);

//     // Valider les taxes reçues
//     const validTaxes = await Tax.find({ _id: { $in: taxIds } });
//     //console.log('Taxes valides trouvées :', validTaxes);

//     if (validTaxes.length !== taxIds.length) {
//       return res.status(400).json({ message: 'Certaines taxes sont invalides ou introuvables.' });
//     }

//     // Créer ou vérifier les associations dans TaxpayerTax
//     const associations = [];
//     for (const tax of validTaxes) {
//       // Vérifiez si une association existe déjà pour éviter les doublons
//       const existingAssociation = await TaxpayerTax.findOne({
//         taxpayer: req.params.id,
//         tax: tax._id,
//       });

//       if (!existingAssociation) {
//         // Créer une nouvelle association
//         const newAssociation = await TaxpayerTax.create({
//           taxpayer: req.params.id,
//           tax: tax._id,
//           remainingAmount: tax.amount, // Montant total de la taxe
//           dueDate: tax.dueDate, // Date d’échéance
//           isPaid: false, // Impayé initial
//         });
//         associations.push(newAssociation);
//       }
//     }
    
//     // Mettre à jour la collection Taxpayer
//     const updatedTaxpayer = await Taxpayer.findByIdAndUpdate(
//       req.params.id,
//       { $set: { taxes: validTaxes.map((tax) => tax._id) } },
//       { new: true }
//     ).populate('taxes'); // Facultatif : peupler les taxes pour les détails
//    // console.log('Contribuable mis à jour :', updatedTaxpayer);

//     // Réponse
//     res.status(200).json({
//       message: 'Taxes associées avec succès.',
//       taxpayer: updatedTaxpayer,
//       associations,
//     });
//   } catch (err) {
//     console.error('Erreur lors de l’association des taxes :', err.message);
//     res.status(500).json({ message: 'Erreur lors de l’association des taxes.', error: err.message });
//   }
// };


// module.exports = {
//   addTaxpayer,
//   getTaxpayersByCollector,
//   updateTaxpayer,
//   deleteTaxpayer,
//   associateTaxes,
// };







const Taxpayer = require('../models/Taxpayer');
const User = require('../models/User');
const Tax = require('../models/Tax');
const TaxpayerTax = require('../models/TaxpayerTax');
const bcrypt = require('bcryptjs');

const createTaxpayer = async (req, res) => {
    try {
      const { name, phone, address, password, activityType, zone, coordinates } = req.body;
  
      // Validation des champs obligatoires
      if (!name || !phone || !address || !activityType || !zone) {
        return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
      }
  
      // Vérifiez si un utilisateur avec le même numéro de téléphone existe déjà
      let existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ message: 'Un utilisateur avec ce numéro de téléphone existe déjà.' });
      }

      // Créez un nouvel utilisateur avec un rôle 'taxpayer'
      const hashedPassword = await bcrypt.hash(password || '12345678', 10);
      
      const newUser = new User({
        name,
        phone,
        password:hashedPassword , // Mot de passe par défaut
        role: 'contribuable',
      });
  
      await newUser.save();
  
      // Créez le contribuable associé à cet utilisateur
      const newTaxpayer = new Taxpayer({
        user: newUser._id, // ID de l'utilisateur nouvellement créé
        address,
        activityType,
        zone,
        coordinates,
      });
  
      await newTaxpayer.save();
  
      res.status(201).json({ message: 'Contribuable créé avec succès.', taxpayer: newTaxpayer });
    } catch (err) {
      console.error('Erreur lors de la création du contribuable :', err.message);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };




// const createTaxpayer = async (req, res) => {
//   let newUser = null; // Pour rollback en cas d'erreur
//   try {
//     const { name, phone, address, password, activityType, zone, coordinates } = req.body;
//     const collectorId = req.user?._id; // 🔥 Vérification de l'ID du collecteur

//     console.log(`➡️ Début de la création d’un contribuable par le collecteur : ${collectorId}`);

//     // Vérifier si le collecteur est bien connecté
//     if (!collectorId || req.user.role !== 'collector') {
//       console.log("❌ Erreur : L'utilisateur n'est pas un collecteur.");
//       return res.status(403).json({ message: "Accès interdit. Seuls les collecteurs peuvent créer des contribuables." });
//     }

//     // Validation des champs obligatoires
//     if (!name || !phone || !address || !activityType || !zone) {
//       console.log("❌ Erreur : Tous les champs obligatoires doivent être remplis.");
//       return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
//     }

//     // Vérifier si un utilisateur avec ce téléphone existe déjà
//     const existingUser = await User.findOne({ phone });
//     if (existingUser) {
//       console.log(`❌ Erreur : Un utilisateur avec ce numéro de téléphone (${phone}) existe déjà.`);
//       return res.status(400).json({ message: 'Un utilisateur avec ce numéro de téléphone existe déjà.' });
//     }

//     console.log("🔑 Hashage du mot de passe...");
//     const hashedPassword = await bcrypt.hash(password || '12345678', 10);

//     // Création de l'utilisateur (contribuable)
//     console.log("➡️ Création de l’utilisateur...");
//     newUser = new User({
//       name,
//       phone,
//       password: hashedPassword,
//       role: 'contribuable',
//     });

//     await newUser.save();
//     console.log(`✅ Utilisateur créé : ${newUser._id}`);

//     // Création du contribuable
//     console.log("➡️ Création du contribuable...");
//     const newTaxpayer = new Taxpayer({
//       user: newUser._id,
//       address,
//       activityType,
//       zone,
//       coordinates,
//       createdBy: collectorId, // 🔥 Enregistre le collecteur
//     });

//     await newTaxpayer.save();
//     console.log(`✅ Contribuable créé : ${newTaxpayer._id}`);

//     res.status(201).json({ message: 'Contribuable créé avec succès.', taxpayer: newTaxpayer });

//   } catch (err) {
//     console.error('❌ Erreur lors de la création du contribuable :', err.message);

//     // Supprimer l'utilisateur si le contribuable n'a pas été créé
//     if (newUser) {
//       console.log("⚠️ Suppression de l'utilisateur car la création du contribuable a échoué...");
//       await User.findByIdAndDelete(newUser._id);
//     }

//     res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };


















  // const getTaxpayers = async (req, res) => {
  //   try {
  //     // Récupérez tous les contribuables avec les informations associées
  //     const taxpayers = await Taxpayer.find()
  //       .populate('user', 'name phone email') // Peupler les informations de l'utilisateur (nom, téléphone, email)
  //       .populate('zone', 'name'); // Peupler les informations de la zone (nom)
  
  //     res.status(200).json(taxpayers);
  //   } catch (err) {
  //     console.error('Erreur lors de la récupération des contribuables :', err.message);
  //     res.status(500).json({ message: 'Erreur interne du serveur.' });
  //   }
  // };

 



  // const getTaxpayersWithTaxes = async (req, res) => {
  //   try {
  //     console.log('Début de la récupération des contribuables avec leurs taxes.');
  
  //     const taxpayers = await Taxpayer.find()
  //       .populate('user', 'name phone') // Inclure les informations de l'utilisateur
  //       .populate('zone', 'name') // Inclure les informations de la zone
  //       .populate('taxes', 'name amount dueDate'); // Inclure les informations des taxes
  
  //     if (!taxpayers || taxpayers.length === 0) {
  //       console.warn('Aucun contribuable trouvé dans la base de données.');
  //       return res.status(404).json({ message: 'Aucun contribuable trouvé.' });
  //     }
  
  //     console.log('Contribuables récupérés avec succès :', taxpayers);
  
  //     res.status(200).json(taxpayers);
  //   } catch (err) {
  //     console.error('Erreur lors de la récupération des contribuables avec taxes :', err.message);
  //     res.status(500).json({ message: 'Erreur interne du serveur.' });
  //   } finally {
  //     console.log('Fin de la récupération des contribuables avec taxes.');
  //   }
  // };
  
 

  // const associateTaxesToTaxpayer = async (req, res) => {
  //   try {
  //     const { taxpayerId } = req.params;
  //     const { taxes } = req.body;
  
  //     console.log('Données reçues:', { taxpayerId, taxes });
  
  //     // Validation des données
  //     if (!taxpayerId || !Array.isArray(taxes) || taxes.length === 0) {
  //       return res.status(400).json({ message: 'Données invalides.' });
  //     }
  
  //     // Vérifier que le contribuable existe
  //     const taxpayer = await Taxpayer.findById(taxpayerId);
  //     if (!taxpayer) {
  //       return res.status(404).json({ message: 'Contribuable introuvable.' });
  //     }
  
  //     // Vérifier que toutes les taxes existent
  //     const existingTaxes = await Tax.find({ _id: { $in: taxes } });
  //     console.log('Taxes trouvées dans la base de données:', existingTaxes);
  
  //     if (existingTaxes.length !== taxes.length) {
  //       return res.status(400).json({ message: 'Une ou plusieurs taxes sont invalides.' });
  //     }
  
  //     // Traiter chaque taxe pour créer ou mettre à jour dans TaxpayerTax
  //     for (const tax of existingTaxes) {
  //       const existingEntry = await TaxpayerTax.findOne({
  //         taxpayer: taxpayerId,
  //         tax: tax._id,
  //       });
  
  //       if (!existingEntry) {
  //         // Créer une nouvelle entrée dans TaxpayerTax
  //         const newEntry = new TaxpayerTax({
  //           taxpayer: taxpayerId,
  //           tax: tax._id,
  //           totalAmount: tax.amount || 0, // Assurez-vous que le montant total est renseigné
  //           remainingAmount: tax.amount || 0, // Initialiser le montant restant
  //           dueDate: tax.dueDate || new Date(), // Utiliser une date par défaut si elle est absente
  //           status: 'pending', // Statut initial
  //         });
  
  //         await newEntry.save();
  //         console.log('Nouvelle entrée créée dans TaxpayerTax:', newEntry);
  //       }
  //     }
  
  //     // Mettre à jour la liste des taxes dans le modèle Taxpayer
  //     taxpayer.taxes = Array.from(new Set([...taxpayer.taxes, ...taxes])); // Éviter les doublons
  //     await taxpayer.save();
  //     console.log('Taxes mises à jour dans Taxpayer:', taxpayer.taxes);
  
  //     res.status(200).json({ message: 'Taxes associées avec succès.', taxpayer });
  //   } catch (err) {
  //     console.error('Erreur lors de l’association des taxes :', err.message);
  //     res.status(500).json({ message: 'Erreur interne du serveur.' });
  //   }
  // };
  


//   const getTaxpayers = async (req, res) => {
//     try {
//         const collectorId = req.user.id; // 🔥 Récupérer l'ID du collecteur
//         console.log(`🔍 Récupération des contribuables créés par le collecteur : ${collectorId}`);

//         // Filtrer les contribuables créés par ce collecteur uniquement
//         const taxpayers = await Taxpayer.find()
//             .populate({
//                 path: 'user',
//                 match: { createdBy: collectorId }, // 🔥 Filtrage ici
//                 select: 'name phone email' // Sélection des champs à afficher
//             })
//             .populate('zone', 'name'); // Peupler les infos de la zone

//         // Supprimer les contribuables sans utilisateur correspondant (évite les erreurs)
//         const filteredTaxpayers = taxpayers.filter(t => t.user !== null);

//         console.log(`✅ ${filteredTaxpayers.length} contribuables trouvés pour le collecteur ${collectorId}`);

//         res.status(200).json(filteredTaxpayers);
//     } catch (err) {
//         console.error('❌ Erreur lors de la récupération des contribuables :', err.message);
//         res.status(500).json({ message: 'Erreur interne du serveur.' });
//     }
// };



// const getTaxpayers = async (req, res) => {
//   try {
//       const collectorId = req.user.id; // 🔥 ID du collecteur connecté
//       console.log(`🔍 Récupération des contribuables créés par le collecteur : ${collectorId}`);

//       // 🔥 Étape 1 : Trouver les utilisateurs qui sont des contribuables
//       const usersCreatedByCollector = await User.find({ role: 'contribuable' }).select('_id');
//       const userIds = usersCreatedByCollector.map(user => user._id); // Liste des IDs des contribuables

//       // 🔥 Étape 2 : Trouver les contribuables associés à ces utilisateurs
//       const taxpayers = await Taxpayer.find({ user: { $in: userIds } }) // Filtrer par `user`
//           .populate('user', 'name phone email') // Peupler les infos du contribuable
//           .populate('zone', 'name'); // Peupler les infos de la zone

//       console.log(`✅ ${taxpayers.length} contribuables trouvés pour le collecteur ${collectorId}`);

//       res.status(200).json(taxpayers);
//   } catch (err) {
//       console.error('❌ Erreur lors de la récupération des contribuables :', err.message);
//       res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };






  const getTaxpayers = async (req, res) => {
    try {
      const collectorId = req.user._id; // 🔥 Collecteur connecté
      console.log(`🔍 Récupération des contribuables créés par le collecteur : ${collectorId}`);
  
      // Filtrer les contribuables créés par ce collecteur uniquement
      const taxpayers = await Taxpayer.find({ createdBy: collectorId }) // 🔥 Filtrage ici !
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
      console.log('Début de la récupération des contribuables avec leurs taxes.');
  
      const taxpayers = await Taxpayer.find()
        .populate('user', 'name phone') 
        .populate('zone', 'name') 
        .populate({ 
          path: 'taxes',
          populate: {
            path: 'tax',
            model: 'Tax', 
            select: 'name amount dueDate' 
          }
        }); 
  
      if (!taxpayers || taxpayers.length === 0) {
        console.warn('Aucun contribuable trouvé dans la base de données.');
        return res.status(404).json({ message: 'Aucun contribuable trouvé.' });
      }
  
      // Extraire uniquement le nom de la taxe
      const taxpayersWithTaxNames = taxpayers.map(taxpayer => ({
        ...taxpayer.toObject(), 
        taxes: taxpayer.taxes.map(taxpayerTax => taxpayerTax.tax.name) 
      }));
  
      console.log('Contribuables récupérés avec succès :', taxpayersWithTaxNames);
      res.status(200).json(taxpayersWithTaxNames);
  
    } catch (err) {
      console.error('Erreur lors de la récupération des contribuables avec taxes :', err.message);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    } finally {
      console.log('Fin de la récupération des contribuables avec taxes.');
    }
  };
















const associateTaxesToTaxpayer = async (req, res) => {
  try {
    const { taxpayerId } = req.params;
    // Le payload doit contenir { taxes: [...], surfaces: { taxId1: value1, taxId2: value2, ... } }
    // Pour une taxe fixe ou d'occupation, value1 est un nombre (la surface).
    // Pour la taxe de publicité, value sera un objet { surface, option }.
    const { taxes, surfaces } = req.body;
    
    console.log('Début de l’association des taxes.');
    console.log('Données reçues :', { taxpayerId, taxes, surfaces });
    
    if (!taxpayerId || !Array.isArray(taxes) || taxes.length === 0) {
      console.warn('Données invalides :', { taxpayerId, taxes });
      return res.status(400).json({ message: 'Données invalides.' });
    }
    
    // Vérifier l'existence du contribuable
    const taxpayer = await Taxpayer.findById(taxpayerId);
    if (!taxpayer) {
      console.warn('Contribuable introuvable avec l’ID :', taxpayerId);
      return res.status(404).json({ message: 'Contribuable introuvable.' });
    }
    console.log('Contribuable trouvé :', taxpayer);
    
    // Récupérer les taxes à associer
    const existingTaxes = await Tax.find({ _id: { $in: taxes } });
    console.log('Taxes trouvées :', existingTaxes);
    
    if (existingTaxes.length !== taxes.length) {
      console.warn('Certaines taxes sont invalides.');
      return res.status(400).json({ message: 'Une ou plusieurs taxes sont invalides.' });
    }
    
    const newTaxpayerTaxes = [];
    
    for (const tax of existingTaxes) {
      // Vérifier si une association existe déjà
      const existingEntry = await TaxpayerTax.findOne({
        taxpayer: taxpayerId,
        tax: tax._id,
      });
      
      if (!existingEntry) {
        let totalAmount, remainingAmount;
        
        if (tax.isVariable) {
          if (tax.name === "Taxe d'occupation du domaine publique") {
            // Pour cette taxe, surfaces[tax._id] doit être un nombre
            const surface = surfaces && surfaces[tax._id];
            if (!surface || surface <= 0) {
              console.error('Surface non renseignée ou invalide pour la taxe d’occupation.');
              return res.status(400).json({ message: 'Pour la taxe d’occupation, une surface valide doit être renseignée.' });
            }
            // Récupérer le taux par défaut depuis supportRates
            const rateValue = (tax.supportRates && tax.supportRates.get('default')) || 5000;
            totalAmount = surface * rateValue;
            remainingAmount = totalAmount;
            console.log(`Taxe d'occupation : surface = ${surface} m², taux = ${rateValue} FCFA/m², totalAmount = ${totalAmount} FCFA`);
          } else if (tax.name === "Taxe de publicité") {
            // Pour la taxe de publicité, surfaces[tax._id] doit être un objet { surface, option }
            const adData = surfaces && surfaces[tax._id];
            console.log('Taxe de publicité - adData reçu :', adData);
            if (!adData || !adData.surface || adData.surface <= 0 || !adData.option) {
              console.error('Données invalides pour la taxe de publicité. Une surface et une option valide sont requises.');
              return res.status(400).json({ message: 'Pour la taxe de publicité, une surface valide et une option (option1, option2 ou option3) doivent être renseignées.' });
            }
            if (!["option1", "option2", "option3"].includes(adData.option)) {
              console.error('Option invalide pour la taxe de publicité.');
              return res.status(400).json({ message: 'Option invalide pour la taxe de publicité. Les options valides sont option1, option2 et option3.' });
            }
            // Utiliser la méthode .get() pour récupérer le taux depuis la Map supportRates
            const rateValue = tax.supportRates && tax.supportRates.get(adData.option);
            if (!rateValue) {
              console.error('Taux non défini pour l’option sélectionnée dans la taxe de publicité.');
              return res.status(400).json({ message: 'Taux non défini pour l’option sélectionnée.' });
            }
            totalAmount = adData.surface * rateValue;
            remainingAmount = totalAmount;
            console.log(`Taxe de publicité : surface = ${adData.surface} m², option = ${adData.option}, taux = ${rateValue} FCFA/m², totalAmount = ${totalAmount} FCFA`);
          } else {
            // Autres taxes variables (logique personnalisée)
            totalAmount = 0;
            remainingAmount = 0;
            console.log(`Taxe variable (non spécifiée) pour ${tax.name} : totalAmount initialisé à 0.`);
          }
        } else {
          // Pour les taxes fixes
          totalAmount = tax.amount;
          remainingAmount = tax.amount;
          console.log(`Taxe fixe détectée pour ${tax.name} : montant = ${tax.amount} FCFA`);
        }
        
        const newEntry = new TaxpayerTax({
          taxpayer: taxpayerId,
          tax: tax._id,
          totalAmount,
          remainingAmount,
          dueDate: tax.dueDate,
          status: 'pending',
          // Pour une taxe variable, enregistrer la surface :
          // Pour la taxe d'occupation, surfaces[tax._id] est un nombre.
          // Pour la taxe de publicité, surfaces[tax._id] est un objet et on stocke sa propriété "surface".
          surface: tax.isVariable
            ? (tax.name === "Taxe d'occupation du domaine publique"
                ? surfaces[tax._id]
                : (surfaces[tax._id] && surfaces[tax._id].surface) || undefined)
            : undefined,
        });
        
        await newEntry.save();
        console.log('Nouvelle entrée ajoutée dans TaxpayerTax :', newEntry);
        newTaxpayerTaxes.push(newEntry._id);
      }
    }
    
    taxpayer.taxes = [...(taxpayer.taxes || []), ...newTaxpayerTaxes];
    await taxpayer.save();
    
    console.log('Taxes associées avec succès au contribuable :', taxpayer);
    res.status(200).json({ message: 'Taxes associées avec succès.', taxpayer });
  } catch (err) {
    console.error('Erreur lors de l’association des taxes :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  } finally {
    console.log('Fin de l’association des taxes.');
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



/**
 * getOneTaxpayerWithTaxes
 * Récupère toutes les associations (TaxpayerTax) pour un contribuable donné,
 * et peuple la "tax" pour obtenir les infos de la Tax.
 */
const getOneTaxpayerWithTaxes = async (req, res) => {
  console.log("[getOneTaxpayerWithTaxes] - Début de la fonction.");
  try {
    const { taxpayerId } = req.params;
    console.log("[getOneTaxpayerWithTaxes] - taxpayerId reçu :", taxpayerId);

    // On cherche tous les documents dans la collection TaxpayerTax
    // dont le champ "taxpayer" == taxpayerId
    const associations = await TaxpayerTax.find({ taxpayer: taxpayerId })
      .populate("tax", "name amount dueDate isVariable remainingAmount"); 
      // => On peuple le champ "tax" en récupérant
      // les champs name, amount, dueDate, etc. (selon ton modèle Tax)

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

  


// 🔹 Récupérer les contribuables avec pagination et recherche
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


  

module.exports = { createTaxpayer, getTaxpayers, getTaxpayersWithTaxes, associateTaxesToTaxpayer, getTaxpayerByPhone , getOneTaxpayerWithTaxes, getPaginatedTaxpayers};
