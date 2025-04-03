const Tax = require('../models/Tax');
const logger = require('../utils/logger');



const createTax = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      amount, 
      isVariable, 
      supportRates, 
      surfaceRates, 
      frequency, 
      dueDate, 
      isFuelPumpTax, 
      isSanitationTax 
    } = req.body;

    console.log('📌 [TAX CONTROLLER] Payload reçu pour création:', req.body);

    if (!name || !frequency || !dueDate) {
      console.warn('⚠️ Champs obligatoires manquants.');
      return res.status(400).json({ message: 'Les champs name, frequency et dueDate sont obligatoires.' });
    }

    const existingTax = await Tax.findOne({ name });
    if (existingTax) {
      return res.status(400).json({ message: 'Une taxe avec ce nom existe déjà.' });
    }

    let newTaxData = {
      name,
      description,
      frequency,
      dueDate,
      isVariable: isVariable || false,
      isFuelPumpTax: isFuelPumpTax || false,
      //isSanitationTax: isSanitationTax || false,
      isSanitationTax: name === "Taxe de salubrité" ? true : req.body.isSanitationTax || false,

    };

    if (isVariable) {
      if (!supportRates && !surfaceRates) {
        return res.status(400).json({ message: 'Une taxe variable doit avoir supportRates ou surfaceRates.' });
      }
      if (supportRates) {
        newTaxData.supportRates = {};
        for (const key in supportRates) {
          newTaxData.supportRates[key] = parseFloat(supportRates[key]);
        }
      }
      if (surfaceRates) {
        newTaxData.surfaceRates = surfaceRates;
      }
    } else {
      if (amount === undefined) {
        return res.status(400).json({ message: 'Une taxe fixe doit avoir un montant (amount).' });
      }
      newTaxData.amount = parseFloat(amount);
    }

    if (isFuelPumpTax) {
      newTaxData.amount = 35000; // Coût par pistolet
    }

    // if (isSanitationTax) {
    //   newTaxData.amount = 360000; // 1000 FCFA × 360 jours
    // }


    if (isSanitationTax) {
      newTaxData.sanitationRate = req.body.sanitationRate || 1000; // ✅ Stocke le tarif journalier
      newTaxData.sanitationDays = req.body.sanitationDays || 360; // ✅ Stocke le nombre de jours
    }
    

    const newTax = new Tax(newTaxData);
    await newTax.save();

    res.status(201).json({ message: 'Taxe créée avec succès.', tax: newTax });

  } catch (err) {
    console.error('❌ Erreur lors de la création de la taxe:', err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


const getAllTaxes = async (req, res) => {
  try {
    const taxes = await Tax.find();
    
    // Vérifier si c'est une taxe hydrocarbures ou salubrité et calculer dynamiquement
    const formattedTaxes = taxes.map(tax => {
      let formattedAmount = null;

      if (tax.isFuelPumpTax) {
        formattedAmount = `${tax.pumpRate} FCFA × Nb pistolets`;
      } else if (tax.isSanitationTax) {
        formattedAmount = `${tax.sanitationRate} FCFA × ${tax.sanitationDays} jours`;
      } else if (tax.isVariable) {
        formattedAmount = tax.supportRates;
      } else {
        formattedAmount = `${tax.amount.toLocaleString('fr-FR')} FCFA`;
      }

      return {
        ...tax._doc, 
        formattedAmount
      };
    });

    res.status(200).json(formattedTaxes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des taxes.' });
  }
};





const updateTax = async (req, res) => {
  try {
    const taxId = req.params.id;
    const { name, description, amount, isVariable, supportRates, surfaceRates, frequency, dueDate, isFuelPumpTax, isSanitationTax } = req.body;

    console.log(`📌 [TAX CONTROLLER] Mise à jour de la taxe ${taxId}:`, req.body);

    if (!name || !frequency || !dueDate) {
      return res.status(400).json({ message: 'Les champs name, frequency et dueDate sont obligatoires.' });
    }

    let updateData = {
      name,
      description,
      frequency,
      dueDate,
      isVariable: isVariable || false,
      isFuelPumpTax: isFuelPumpTax || false,
      isSanitationTax: isSanitationTax || false,
    };

    if (isVariable) {
      if (!supportRates && !surfaceRates) {
        return res.status(400).json({ message: 'Une taxe variable doit avoir supportRates ou surfaceRates.' });
      }
      if (supportRates) {
        updateData.supportRates = {};
        for (const key in supportRates) {
          updateData.supportRates[key] = parseFloat(supportRates[key]);
        }
      }
      if (surfaceRates) {
        updateData.surfaceRates = surfaceRates;
      }
    } else {
      if (amount === undefined) {
        return res.status(400).json({ message: 'Une taxe fixe doit avoir un montant (amount).' });
      }
      updateData.amount = parseFloat(amount);
    }

    if (isFuelPumpTax) {
      updateData.amount = 35000; // Coût par pistolet
    }

    if (isSanitationTax) {
      updateData.amount = 360000; // 1000 FCFA × 360 jours
    }

    const updatedTax = await Tax.findByIdAndUpdate(taxId, updateData, { new: true, runValidators: true });

    if (!updatedTax) {
      return res.status(404).json({ message: 'Taxe non trouvée.' });
    }

    res.status(200).json({ message: 'Taxe mise à jour avec succès.', tax: updatedTax });

  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour de la taxe:', err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};







const deleteTax = async (req, res) => {
  try {
    const taxId = req.params.id;
    logger.info('Demande de suppression de la taxe', { taxId });

    // Vérifier si la taxe est utilisée (vous pouvez ajouter votre logique de vérification ici)
    // Par exemple, vérifier si le champ "used" existe et vaut true.
    const taxToDelete = await Tax.findById(taxId);
    if (!taxToDelete) {
      logger.error('Taxe non trouvée pour la suppression', { taxId });
      return res.status(404).json({ message: 'Taxe non trouvée.' });
    }
    
    if (taxToDelete.used) {
      logger.warn('Tentative de suppression d\'une taxe utilisée', { taxId });
      return res.status(400).json({ message: 'Cette taxe est utilisée et ne peut pas être supprimée.' });
    }

    await Tax.findByIdAndDelete(taxId);
    logger.info('Taxe supprimée avec succès', { taxId });
    res.status(200).json({ message: 'Taxe supprimée avec succès.' });
  } catch (err) {
    logger.error('Erreur lors de la suppression de la taxe :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};



module.exports = { createTax, getAllTaxes, updateTax, deleteTax};
