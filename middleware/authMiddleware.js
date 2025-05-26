


// const jwt = require('jsonwebtoken');
// const Collector = require('../models/Collector');
// const Taxpayer = require('../models/Taxpayer');
// const Market = require('../models/Market');

// const authMiddleware = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     console.error('❌ Erreur : Token manquant dans les headers');
//     return res.status(401).json({ message: 'Non autorisé, token manquant' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = {
//       id: decoded.id,
//       name: decoded.name,
//       role: decoded.role,
//       phone: decoded.phone,
//     };

//     // 🔥 Si c'est un `Collector`
//     if (req.user.role === 'collector') {
//       const collector = await Collector.findOne({ user: req.user.id }).populate('assignedZones').select('_id assignedZones');
//       if (collector) {
//         req.user.collectorId = collector._id;
//         req.user.assignedZones = collector.assignedZones;
//         console.log('📋 Zones assignées au collecteur :', req.user.assignedZones);
//       } else {
//         console.error('❌ Erreur : Collecteur non trouvé.');
//         return res.status(404).json({ message: 'Collecteur non trouvé.' });
//       }
//     }

//     // 🔥 Si c'est un `Taxpayer`
//     if (req.user.role === 'contribuable') {
//       const taxpayer = await Taxpayer.findOne({ user: req.user.id }).select('_id');
//       if (taxpayer) {
//         req.user.taxpayerId = taxpayer._id;
//       }
//     }

//     // 🔥 Si c'est un `chefmarket` → essaie de récupérer son marché, mais ne bloque pas
//     if (req.user.role === 'chefmarket') {
//       const market = await Market.findOne({ chefmarket: req.user.id });
//       if (market) {
//         req.user.marketId = market._id;
//       }
//       // ❌ Ne pas bloquer s'il n'en a pas encore (utile pour POST /my-market)
//     }

//     next();
//   } catch (err) {
//     console.error('❌ Erreur lors de la vérification du token :', err.message);
//     return res.status(403).json({ message: 'Token invalide ou expiré.' });
//   }
// };

// module.exports = authMiddleware;



const jwt = require('jsonwebtoken');
const Collector = require('../models/Collector');
const MarketCollector = require('../models/MarketCollector');
const Taxpayer = require('../models/Taxpayer');
const Market = require('../models/Market');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.error('❌ Erreur : Token manquant dans les headers');
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
      phone: decoded.phone,
      collectorType: decoded.collectorType || null,
    };

    // 🔥 Si c’est un collecteur
    if (req.user.role === 'collector') {
      if (req.user.collectorType === 'marche') {
        const mc = await MarketCollector.findOne({ user: req.user.id })
          .populate('assignedMarkets')
          .select('_id assignedMarkets');

        if (!mc) {
          console.error('❌ Erreur : Collecteur de marché non trouvé.');
          return res.status(404).json({ message: 'Collecteur de marché non trouvé.' });
        }

        req.user.collectorId = mc._id;
        req.user.assignedMarkets = mc.assignedMarkets;
      } else {
        const collector = await Collector.findOne({ user: req.user.id })
          .populate('assignedZones')
          .select('_id assignedZones');

        if (!collector) {
          console.error('❌ Erreur : Collecteur mairie non trouvé.');
          return res.status(404).json({ message: 'Collecteur mairie non trouvé.' });
        }

        req.user.collectorId = collector._id;
        req.user.assignedZones = collector.assignedZones;
      }
    }

    // 🔥 Si c’est un contribuable
    if (req.user.role === 'contribuable') {
      const taxpayer = await Taxpayer.findOne({ user: req.user.id }).select('_id');
      if (taxpayer) {
        req.user.taxpayerId = taxpayer._id;
      }
    }

    // 🔥 Si c’est un chef de marché
    if (req.user.role === 'chefmarket') {
      const market = await Market.findOne({ chefmarket: req.user.id });
      if (market) {
        req.user.marketId = market._id;
      }
    }

    next();
  } catch (err) {
    console.error('❌ Erreur lors de la vérification du token :', err.message);
    return res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = authMiddleware;
