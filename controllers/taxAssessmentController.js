const TaxAssessment = require('../models/TaxAssessment');
const Taxpayer = require('../models/Taxpayer');
const TaxpayerTax = require('../models/TaxpayerTax');
const Tax = require('../models/Tax');



// 🔹 Récupérer les taxes d'un contribuable pour une année donnée
// 🔹 Récupérer les taxes d'un contribuable pour une année donnée
const getTaxpayerTaxesByYear = async (req, res) => {
  try {
    const { taxpayerId } = req.params;
    const { year } = req.query; // 🔥 On récupère l'année envoyée dans l'URL sous forme de query

    if (!taxpayerId || !year) {
      return res.status(400).json({ message: "Identifiant du contribuable ou année manquante." });
    }

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const taxes = await TaxpayerTax.find({
      taxpayer: taxpayerId,
      dueDate: { $gte: startDate, $lte: endDate }, // 🔥 Filtrer par année
    }).populate('tax'); // Pour afficher les informations de chaque taxe

    res.status(200).json(taxes);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des taxes par année :", err.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


// 🔹 Créer un avis d'imposition pour un contribuable

const createTaxAssessment = async (req, res) => {
  try {
    console.log("📌 [CONTROLLER] createTaxAssessment appelé.");
    console.log("📩 Données reçues :", req.body);

    const { taxpayer, taxes, totalAmount, remainingAmount, dueDate, fiscalYear } = req.body;

    if (!taxpayer || !taxes || taxes.length === 0) {
      console.warn("⚠️ Données invalides. Manque de données nécessaires.");
      return res.status(400).json({ message: "Données invalides." });
    }

    console.log("✅ Vérification des données validée.");

    // 🔹 Générer un `assessmentNumber` unique basé sur l’année fiscale et un compteur
    const lastAssessment = await TaxAssessment.findOne().sort({ createdAt: -1 }); 
    const lastNumber = lastAssessment ? parseInt(lastAssessment.assessmentNumber.split('-')[1]) : 0;
    const newNumber = lastNumber + 1;
    const assessmentNumber = `AI-${newNumber.toString().padStart(6, '0')}-${fiscalYear}`; 

    console.log("📌 Numéro d'avis généré :", assessmentNumber);

    const taxAssessment = new TaxAssessment({
      taxpayer,
      assessmentNumber, // ✅ Assignation du numéro d'avis unique
      taxes,
      totalAmount,
      remainingAmount,
      dueDate,
      fiscalYear,
      status: "pending",
    });

    console.log("📌 Enregistrement de l'avis d'imposition...");
    await taxAssessment.save();

    console.log("✅ Avis d'imposition créé avec succès :", taxAssessment);

    res.status(201).json({ message: "Avis d'imposition créé avec succès", taxAssessment });

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'avis d'imposition :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};





// 🔹 Récupérer l'avis d'imposition d'un contribuable
const getTaxAssessmentByTaxpayer = async (req, res) => {
  try {
    const { taxpayerId } = req.params;

    const taxAssessment = await TaxAssessment.findOne({ taxpayer: taxpayerId , status: 'pending' })
      .populate('taxpayer', 'user')
      .populate('taxes.tax', 'name amount frequency');

    if (!taxAssessment) {
      return res.status(404).json({ message: 'Aucun avis d’imposition trouvé pour ce contribuable.' });
    }

    res.status(200).json(taxAssessment);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’avis d’imposition:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// 🔹 Mettre à jour un avis d'imposition
const updateTaxAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { taxes } = req.body;

    if (!Array.isArray(taxes) || taxes.length === 0) {
      return res.status(400).json({ message: 'Aucune taxe fournie pour la mise à jour.' });
    }

    const taxAssessment = await TaxAssessment.findById(assessmentId);
    if (!taxAssessment) {
      return res.status(404).json({ message: 'Avis d’imposition introuvable.' });
    }

    // Mise à jour des taxes et recalcul du montant total
    let totalAmount = 0;
    const taxEntries = [];

    for (const taxId of taxes) {
      const tax = await Tax.findById(taxId);
      if (!tax) {
        return res.status(404).json({ message: `Taxe introuvable: ${taxId}` });
      }

      const amount = tax.frequency === 'monthly' ? tax.amount * 12 : tax.amount;
      totalAmount += amount;

      taxEntries.push({ tax: taxId, amount });
    }

    taxAssessment.taxes = taxEntries;
    taxAssessment.totalAmount = totalAmount;
    taxAssessment.remainingAmount = totalAmount - taxAssessment.paidAmount;

    await taxAssessment.save();

    res.status(200).json({ message: 'Avis d’imposition mis à jour avec succès.', taxAssessment });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l’avis d’imposition:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// 🔹 Supprimer un avis d'imposition
const deleteTaxAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const taxAssessment = await TaxAssessment.findByIdAndDelete(assessmentId);
    if (!taxAssessment) {
      return res.status(404).json({ message: 'Avis d’imposition introuvable.' });
    }

    res.status(200).json({ message: 'Avis d’imposition supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l’avis d’imposition:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};



const getAllTaxAssessments = async (req, res) => {
  try {
    const taxAssessments = await TaxAssessment.find()
      .populate({
        path: 'taxpayer',
        populate: { path: 'user', select: 'name phone address activity code arrondissement' } // ✅ Récupère les infos du contribuable
      })
      .populate({
        path: 'taxes.tax',
        select: 'name amount frequency'
      });
      
    res.status(200).json(taxAssessments);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des avis d’imposition:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


module.exports = {
  createTaxAssessment,
  getTaxAssessmentByTaxpayer,
  updateTaxAssessment,
  deleteTaxAssessment,
  getAllTaxAssessments,
  getTaxpayerTaxesByYear,
};
