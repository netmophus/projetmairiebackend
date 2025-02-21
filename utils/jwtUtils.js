const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    phone: user.phone, // Inclure le numéro de téléphone ici
  };

  return jwt.sign(payload, 'secretKey', { expiresIn: '24h' }); // Remplacez 'secretKey' par votre clé réelle
};

module.exports = { generateToken };
