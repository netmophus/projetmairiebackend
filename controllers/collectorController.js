

const Collector = require('../models/Collector');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');





const addCollector = async (req, res) => {
  let newUser; // Variable pour suivre l'utilisateur en cas d'erreur
  console.log("➡️ Début de la création d’un collecteur...");
  
  try {
    const { name, phone, email, password, idDocument, address, assignedZones, hireDate } = req.body;
    console.log("📥 Données reçues :", req.body);

    // Vérifier si le champ phone est bien défini et non vide
    if (!phone) {
      console.log("❌ Échec : Numéro de téléphone manquant.");
      return res.status(400).json({ message: "Le numéro de téléphone est requis." });
    }

    // Vérifier si un utilisateur avec ce phone existe déjà
    console.log("🔍 Vérification de l'existence du téléphone...");
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      console.log(`❌ Conflit : Le téléphone ${phone} est déjà utilisé.`);
      return res.status(400).json({ message: "Le numéro de téléphone est déjà utilisé." });
    }
    console.log("✅ Aucun conflit de téléphone détecté.");

    // Hash du mot de passe
    console.log("🔑 Hashage du mot de passe...");
    const hashedPassword = await bcrypt.hash(password || "12345678", 10);

    // Création de l’utilisateur
    console.log("➡️ Création de l’utilisateur...");
    newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role: "collector",
    });

    await newUser.save();
    console.log("✅ Utilisateur créé :", {
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      _id: newUser._id,
    });

    // Création du collecteur
    console.log("➡️ Création du collecteur...");
    const newCollector = new Collector({
      user: newUser._id,
      idDocument,
      address,
      assignedZones,
      hireDate: hireDate ? new Date(hireDate) : null, // Assurer que la hireDate est bien ajoutée
    });

    await newCollector.save();
    console.log("✅ Collecteur ajouté :", {
      user: newCollector.user,
      idDocument: newCollector.idDocument,
      address: newCollector.address,
      assignedZones: newCollector.assignedZones,
      hireDate: newCollector.hireDate, // Afficher hireDate pour vérification
    });

    res.status(201).json({ message: "Collecteur ajouté avec succès.", collector: newCollector });

  } catch (err) {
    // Gestion des erreurs : suppression de l'utilisateur si nécessaire
    if (newUser && newUser._id) {
      console.log("⚠️ Une erreur est survenue après la création de l'utilisateur. Suppression en cours...");
      await User.findByIdAndDelete(newUser._id);
      console.log("✅ Utilisateur supprimé pour éviter des incohérences.");
    }

    console.error("❌ Erreur lors de la création du collecteur :", err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


const getCollectors = async (req, res) => {
  try {
    // Récupérer tous les collecteurs avec leurs informations utilisateur
    const collectors = await Collector.find()
      .populate('user', 'name phone email') // Récupérer les infos de l'utilisateur associé
      .populate('assignedZones', 'name description'); // Récupérer les infos des zones associées

    res.status(200).json(collectors);
  } catch (err) {
    console.error('Erreur lors de la récupération des collecteurs :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};





const updateCollector = async (req, res) => {
  const { id } = req.params; // Récupérer l'ID du collecteur dans l'URL
  console.log('ID du collecteur à mettre à jour:', id); // Log de l'ID

  try {
    const updatedCollector = await Collector.findOneAndUpdate(
      { '_id': id }, // Utilisation de l'ID pour rechercher le collecteur
      req.body,
      { new: true }
    );

    if (!updatedCollector) {
      return res.status(404).json({ message: 'Collecteur non trouvé.' }); // Ajouter un message d'erreur si non trouvé
    }

    console.log('Collecteur mis à jour:', updatedCollector); // Log du collecteur mis à jour
    res.status(200).json(updatedCollector);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du collecteur:', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};





module.exports = {
  getCollectors,
  addCollector, // Assurez-vous que cette fonction est déjà exportée si elle existe
  updateCollector,
};


