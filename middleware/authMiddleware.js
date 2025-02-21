
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.error('❌ Erreur : Token manquant dans les headers');
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    //console.log('🔍 Token reçu :', token); // Log du token reçu
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assure-toi que la clé correspond à celle utilisée pour signer
    //console.log('✅ Token décodé avec succès :', decoded); // Log du contenu décodé du token

    req.user = {
      id: decoded.id,
      name: decoded.name,  // 🔥 Assure-toi que le nom est bien inclus dans le token
      role: decoded.role,
      phone: decoded.phone, // Assure-toi que ces champs sont inclus dans le token
    };


  

    next();
  } catch (err) {
    console.error('❌ Erreur lors de la vérification du token :', err.message);
    return res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = authMiddleware;
