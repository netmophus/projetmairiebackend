const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordChangeLog = require('../models/passwordChangeLog');

// Modifier le mot de passe (Utilisateur)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si le mot de passe actuel est correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Valider la complexité du nouveau mot de passe
    const isPasswordComplex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword);
    if (!isPasswordComplex) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit comporter au moins 8 caractères, avec une majuscule, une minuscule, un chiffre et un caractère spécial.',
      });
    }

    // Hacher le nouveau mot de passe et le sauvegarder
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Enregistrer le log
    await PasswordChangeLog.create({
      action: 'changement',
      userId: user._id,
      details: 'Mot de passe modifié par l’utilisateur.',
    });

    res.status(200).json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la modification du mot de passe', error: err.message });
  }
};

// Réinitialiser le mot de passe (Administrateur)
const resetPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Réinitialiser le mot de passe à la valeur par défaut
    const defaultPassword = '12345678';
    user.password = await bcrypt.hash(defaultPassword, 10);
    await user.save();

    // Enregistrer le log
    await PasswordChangeLog.create({
      action: 'réinitialisation',
      userId: user._id,
      adminId: req.user.id, // Administrateur effectuant l’action
      details: 'Mot de passe réinitialisé à la valeur par défaut.',
    });

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe', error: err.message });
  }
};


// Récupérer le profil de l'utilisateur connecté
const getUserProfile = async (req, res) => {
    try {
      // Récupère l'utilisateur connecté depuis le middleware authMiddleware
      const user = await User.findById(req.user.id).select('-password'); // Exclure le mot de passe
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.status(200).json(user); // Retourne les données utilisateur
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: err.message });
    }
  };

module.exports = { changePassword, resetPassword, getUserProfile };
