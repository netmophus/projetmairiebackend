const TaxpayerTax = require("../models/TaxpayerTax");

const getTaxesByTaxpayer = async (req, res) => {
  try {
    const { taxpayerId } = req.params;

    if (!taxpayerId) {
      return res.status(400).json({ message: "ID du contribuable requis." });
    }

    const taxes = await TaxpayerTax.find({ taxpayer: taxpayerId }).populate("tax");

    if (!taxes || taxes.length === 0) {
      return res.status(404).json({ message: "Aucune taxe associée trouvée pour ce contribuable." });
    }

    res.status(200).json(taxes);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des taxes :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


// ✅ Suppression (dissociation) d’une taxe d’un contribuable
const deleteTaxpayerTaxEntry = async (req, res) => {
    try {
      const { taxpayerTaxId } = req.params;
  
      // 🔍 Vérifie que l'entrée existe
      const entry = await TaxpayerTax.findById(taxpayerTaxId);
      if (!entry) {
        return res.status(404).json({ message: "Entrée TaxpayerTax non trouvée." });
      }
  
      // ✅ Supprime l’ID de la liste des taxes dans le modèle Taxpayer
      await Taxpayer.findByIdAndUpdate(entry.taxpayer, {
        $pull: { taxes: taxpayerTaxId },
      });
  
      // ✅ Supprime l’entrée elle-même
      await TaxpayerTax.findByIdAndDelete(taxpayerTaxId);
  
      res.status(200).json({ message: "Taxe dissociée avec succès." });
    } catch (err) {
      console.error("❌ Erreur lors de la suppression de l’entrée TaxpayerTax :", err.message);
      res.status(500).json({ message: "Erreur serveur lors de la suppression." });
    }
  };
  

// ✅ Vérifie que l'export est bien défini
module.exports = { getTaxesByTaxpayer, deleteTaxpayerTaxEntry, };
