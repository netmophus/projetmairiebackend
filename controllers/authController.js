const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assurez-vous que le chemin correspond à votre modèle
const Otp = require('../models/Otp');
const { sendSMS } = require('../utils/sendSMS'); // ✅ Import de sendSMS
// authController.js (ou où se trouve loginUser)
const MarketCollector = require('../models/MarketCollector');

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
      createdBy: req.user ? req.user._id : null // 🔍 Ajoute l'ID du créateur si disponible
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



// const loginUser = async (req, res) => {
//   try {
//     console.log('Début du processus de connexion...');
//     const { phone, password } = req.body;

//     console.log('Données reçues :', { phone, password: '********' }); // Ne loguez jamais le mot de passe en clair

//     // Vérification si l'utilisateur existe
//     console.log('Recherche de l\'utilisateur avec le téléphone :', phone);
//     const user = await User.findOne({ phone });
//     if (!user) {
//       console.error('Utilisateur non trouvé avec ce téléphone :', phone);
//       return res.status(400).json({ message: 'Utilisateur non trouvé.' });
//     }

//     console.log('Utilisateur trouvé :', {
//       id: user._id,
//       name: user.name,
//       phone: user.phone,
//       role: user.role,
//       collectorType: user.collectorType || null, // ✅ AJOUT ICI
//     });


//       // ✅ Vérifier si l'utilisateur est désactivé
//       if (user.status !== 'active') {
//         return res.status(403).json({ message: "Compte désactivé. Veuillez contacter l'administrateur." });
//       }
  

//     // Vérification du mot de passe
//     console.log('Vérification du mot de passe...');
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       console.error('Mot de passe incorrect pour l\'utilisateur :', phone);
//       return res.status(400).json({ message: 'Mot de passe incorrect.' });
//     }

//     console.log('Mot de passe vérifié avec succès.');

//     // Génération du token JWT
//     console.log('Génération du token JWT...');
//     const token = jwt.sign(
//       { id: user._id, role: user.role, phone: user.phone ,  name: user.name, },
//       process.env.JWT_SECRET || 'secretKey', // Utiliser une clé secrète dans .env
//       { expiresIn: '7d' }
//     );

//     console.log('Token généré avec succès :', token);

//     res.status(200).json({
//       message: 'Connexion réussie.',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         role: user.role,
//       },
//     });
//     console.log('Connexion réussie pour l\'utilisateur :', user.name);
//   } catch (err) {
//     console.error('Erreur lors du processus de connexion :', err.message);
//     res.status(500).json({
//       message: 'Erreur lors de la connexion.',
//       error: err.message,
//     });
//   }
// };


// ✅ Générer un OTP aléatoire

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Compte désactivé.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    // → ICI on détermine collectorType
    let collectorType = null;
    if (user.role === 'collector') {
      const mc = await MarketCollector.findOne({
        user: user._id,
        assignedMarkets: { $exists: true, $ne: [] },
      });
      collectorType = mc ? 'marche' : 'mairie';
    }

   // controllers/authController.js
const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    phone: user.phone,
    name: user.name,
    collectorType: user.collectorType || null,    // ← on ajoute collectorType
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

res.status(200).json({
  message: 'Connexion réussie.',
  token,
  user: {
    id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    collectorType: user.collectorType || null,   // ← et dans l’objet user
  },
});

  } catch (err) {
    console.error('Erreur connexion :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};



const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 chiffres
};

// 🔵 1. Génération et envoi de l'OTP
const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Génération de l'OTP
    const otp = generateOtp();
    console.log('✅ OTP généré :', otp);

    // Enregistrement de l'OTP dans la base de données
    await Otp.create({ phone, otp });

    // Envoi de l'OTP par SMS
    const message = `votre code OTP:  ${otp}`;
    await sendSMS(phone, message);

    res.status(200).json({ message: "OTP envoyé avec succès." });
  } catch (err) {
    console.error('❌ Erreur lors de l\'envoi de l\'OTP :', err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// 🔵 2. Validation de l'OTP et changement de mot de passe
const changePassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    // Vérification de l'OTP
    const otpRecord = await Otp.findOne({ phone, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP invalide ou expiré." });
    }

    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mise à jour du mot de passe
    await User.findOneAndUpdate({ phone }, { password: hashedPassword });

    // Suppression de l'OTP après utilisation
    await Otp.deleteMany({ phone });

    res.status(200).json({ message: "Mot de passe changé avec succès." });
  } catch (err) {
    console.error('❌ Erreur lors du changement de mot de passe :', err.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


const getUserInfo = async (req, res) => {
  try {
    // Supposons que req.user ait été défini par ton middleware d'authentification
    // et que tu puisses récupérer l'utilisateur depuis ta base de données.
    const user = await User.findById(req.user.id).select('id name phone role');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur en récupérant les infos utilisateur :", error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};



module.exports = { registerUser, loginUser, requestOtp, changePassword , getUserInfo};
