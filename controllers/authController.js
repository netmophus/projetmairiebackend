const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assurez-vous que le chemin correspond à votre modèle


const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password, role, status } = req.body;

    // Vérification si le numéro de téléphone est déjà utilisé
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Numéro de téléphone déjà utilisé.' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur avec le statut
    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role: role || 'taxpayer', // Par défaut, rôle contribuable
      status: status || 'active', // Par défaut, statut actif
    });

    await newUser.save();

    res.status(201).json({
      message: 'Utilisateur enregistré avec succès.',
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status, // Affichage du statut
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'Erreur lors de l\'inscription.',
      error: err.message,
    });
  }
};



const loginUser = async (req, res) => {
  try {
    console.log('Début du processus de connexion...');
    const { phone, password } = req.body;

    console.log('Données reçues :', { phone, password: '********' }); // Ne loguez jamais le mot de passe en clair

    // Vérification si l'utilisateur existe
    console.log('Recherche de l\'utilisateur avec le téléphone :', phone);
    const user = await User.findOne({ phone });
    if (!user) {
      console.error('Utilisateur non trouvé avec ce téléphone :', phone);
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    console.log('Utilisateur trouvé :', {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    });

    // Vérification du mot de passe
    console.log('Vérification du mot de passe...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Mot de passe incorrect pour l\'utilisateur :', phone);
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    console.log('Mot de passe vérifié avec succès.');

    // Génération du token JWT
    console.log('Génération du token JWT...');
    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone ,  name: user.name, },
      process.env.JWT_SECRET || 'secretKey', // Utiliser une clé secrète dans .env
      { expiresIn: '7d' }
    );

    console.log('Token généré avec succès :', token);

    res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
    console.log('Connexion réussie pour l\'utilisateur :', user.name);
  } catch (err) {
    console.error('Erreur lors du processus de connexion :', err.message);
    res.status(500).json({
      message: 'Erreur lors de la connexion.',
      error: err.message,
    });
  }
};


module.exports = { registerUser, loginUser };
