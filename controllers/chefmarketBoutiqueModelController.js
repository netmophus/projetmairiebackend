const BoutiqueModel = require('../models/BoutiqueModel');

// ✅ Créer un modèle de boutique
exports.createBoutiqueModel = async (req, res) => {
  try {
    const { name, price, acquisitionType } = req.body;

    if (!name || !price || !acquisitionType) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const newModel = await BoutiqueModel.create({
      name,
      price,
      acquisitionType,
      market: req.user.marketId,
      chefmarket: req.user.id,
    });

    res.status(201).json(newModel);
  } catch (error) {
    console.error("Erreur création modèle :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Obtenir tous les modèles de boutique du marché du chef
exports.getBoutiqueModelsByMarket = async (req, res) => {
  try {
    const models = await BoutiqueModel.find({ market: req.user.marketId }).sort({ createdAt: -1 });
    res.status(200).json(models);
  } catch (error) {
    console.error("Erreur récupération modèles :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Supprimer un modèle de boutique
exports.deleteBoutiqueModel = async (req, res) => {
  try {
    const deleted = await BoutiqueModel.findOneAndDelete({
      _id: req.params.id,
      chefmarket: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Modèle non trouvé ou non autorisé." });
    }

    res.status(200).json({ message: "Modèle supprimé avec succès." });
  } catch (error) {
    console.error("Erreur suppression modèle :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
