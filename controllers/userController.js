const User = require('../models/User');

// 🔹 Récupérer les utilisateurs avec pagination et recherche
const getUsers = async (req, res) => {
  console.log("📥 Début de la récupération des utilisateurs...");

  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }] }
      : {};

    const users = await User.find(query)
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(query);

    console.log("✅ Nombre total d'utilisateurs :", totalUsers);
    res.status(200).json({ users, totalPages: Math.ceil(totalUsers / limit) });
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des utilisateurs :", err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
  }
};

// 🔹 Modifier le statut d'un utilisateur (activer/désactiver)
const updateUserStatus = async (req, res) => {
  console.log("🔄 Changement du statut de l'utilisateur :", req.params.id);

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    console.log(`✅ Statut mis à jour : ${user.name} est maintenant ${user.status}`);
    res.status(200).json({ message: "Statut mis à jour avec succès.", user });
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du statut :", err.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut.' });
  }
};

// 🔹 Modifier le rôle d'un utilisateur
const updateUserRole = async (req, res) => {
  console.log("🔄 Changement du rôle de l'utilisateur :", req.params.id);

  try {
    const { role } = req.body;
    if (!['admin', 'collector', 'contribuable'].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    user.role = role;
    await user.save();

    console.log(`✅ Rôle mis à jour : ${user.name} est maintenant ${user.role}`);
    res.status(200).json({ message: "Rôle mis à jour avec succès.", user });
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du rôle :", err.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle.' });
  }
};

module.exports = { getUsers, updateUserStatus, updateUserRole };
