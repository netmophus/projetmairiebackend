
// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (!token) {
//     console.error('❌ Erreur : Token manquant dans les headers');
//     return res.status(401).json({ message: 'Non autorisé, token manquant' });
//   }

//   try {
//     //console.log('🔍 Token reçu :', token); // Log du token reçu
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assure-toi que la clé correspond à celle utilisée pour signer
//     //console.log('✅ Token décodé avec succès :', decoded); // Log du contenu décodé du token

//     req.user = {
//       id: decoded.id,
//       name: decoded.name,  // 🔥 Assure-toi que le nom est bien inclus dans le token
//       role: decoded.role,
//       phone: decoded.phone, // Assure-toi que ces champs sont inclus dans le token
//     };


  

//     next();
//   } catch (err) {
//     console.error('❌ Erreur lors de la vérification du token :', err.message);
//     return res.status(403).json({ message: 'Token invalide ou expiré.' });
//   }
// };

// module.exports = authMiddleware;



// 📌 Importation des modules nécessaires
const jwt = require('jsonwebtoken');
const Collector = require('../models/Collector');
const Taxpayer = require('../models/Taxpayer');

const authMiddleware = async (req, res, next) => {
  // ✅ Récupération du token depuis les headers
  const token = req.headers.authorization?.split(' ')[1];
  
  // ✅ Vérification de l'existence du token
  if (!token) {
    console.error('❌ Erreur : Token manquant dans les headers');
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    // ✅ Décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 📌 Ajoute les informations de base du User
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
      phone: decoded.phone,
    };

    // 🔥 Si c'est un `Collector`, on récupère son ID et les zones assignées
    if (req.user.role === 'collector') {
      const collector = await Collector.findOne({ user: req.user.id }).populate('assignedZones').select('_id assignedZones'); 
      
      if (collector) {
        req.user.collectorId = collector._id; // ✅ Ajoute l'ID du `Collector`
        req.user.assignedZones = collector.assignedZones; // ✅ Ajoute les zones assignées
        console.log('📋 Zones assignées au collecteur :', req.user.assignedZones);
      } else {
        console.error('❌ Erreur : Collecteur non trouvé.');
        return res.status(404).json({ message: 'Collecteur non trouvé.' });
      }
    }

    // 🔥 Si c'est un `Taxpayer`, on récupère son ID
    if (req.user.role === 'contribuable') {
      const taxpayer = await Taxpayer.findOne({ user: req.user.id }).select('_id');
      if (taxpayer) {
        req.user.taxpayerId = taxpayer._id; // ✅ Ajoute l'ID du `Taxpayer`
      }
    }

    next();
  } catch (err) {
    console.error('❌ Erreur lors de la vérification du token :', err.message);
    return res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = authMiddleware;
