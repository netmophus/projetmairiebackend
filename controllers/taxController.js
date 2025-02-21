// const Tax = require('../models/Tax');


// // Ajouter une taxe
// const addTax = async (req, res) => {
//     try {
//       const { name, description, amount, frequency, dueDate } = req.body;
  
//       // Vérification que `dueDate` est présent et valide
//       if (!dueDate) {
//         return res.status(400).json({ message: 'La date d’échéance (dueDate) est requise.' });
//       }
  
//       const newTax = new Tax({
//         name,
//         description,
//         amount,
//         frequency,
//         dueDate, // Ajout du champ dueDate
//       });
  
//       await newTax.save();
//       res.status(201).json({ message: 'Taxe ajoutée avec succès.', tax: newTax });
//     } catch (err) {
//       res.status(500).json({ message: 'Erreur lors de l’ajout de la taxe.', error: err.message });
//     }
//   };
  

// // Récupérer toutes les taxes
// const getAllTaxes = async (req, res) => {
//   try {
//     const taxes = await Tax.find();
//     res.status(200).json(taxes);
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur lors de la récupération des taxes.', error: err.message });
//   }
// };

// // Modifier une taxe


// const updateTax = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { name, description, amount, frequency, dueDate } = req.body;
  
//       const updatedTax = await Tax.findByIdAndUpdate(
//         id,
//         { name, description, amount, frequency, dueDate },
//         { new: true }
//       );
  
//       if (!updatedTax) {
//         return res.status(404).json({ message: 'Taxe non trouvée.' });
//       }

//       if (!dueDate || isNaN(new Date(dueDate).getTime())) {
//         return res.status(400).json({ message: 'Une date d’échéance valide est requise.' });
//       }
  
//       res.status(200).json({ message: 'Taxe modifiée avec succès.', tax: updatedTax });
//     } catch (err) {
//       res.status(500).json({ message: 'Erreur lors de la modification de la taxe.', error: err.message });
//     }
//   };
  

// // Supprimer une taxe
// const deleteTax = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedTax = await Tax.findByIdAndDelete(id);
//     if (!deletedTax) {
//       return res.status(404).json({ message: 'Taxe non trouvée.' });
//     }
//     res.status(200).json({ message: 'Taxe supprimée avec succès.' });
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur lors de la suppression de la taxe.', error: err.message });
//   }
// };

// module.exports = { addTax, getAllTaxes, updateTax, deleteTax };



















const Tax = require('../models/Tax');
const logger = require('../utils/logger');


// Contrôleur pour créer une taxe
// const createTax = async (req, res) => {
//   try {
//     const { name, description, amount, frequency, dueDate } = req.body;

//     // Vérification des champs obligatoires
//     if (!name || !amount || !frequency || !dueDate) {
//       return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
//     }

//     // Vérifier si une taxe avec le même nom existe déjà
//     const existingTax = await Tax.findOne({ name });
//     if (existingTax) {
//       return res.status(400).json({ message: 'Une taxe avec ce nom existe déjà.' });
//     }

//     // Créer une nouvelle taxe
//     const newTax = new Tax({
//       name,
//       description,
//       amount,
//       frequency,
//       dueDate,
//     });

//     await newTax.save();

//     res.status(201).json({ message: 'Taxe créée avec succès.', tax: newTax });
//   } catch (err) {
//     console.error('Erreur lors de la création de la taxe :', err.message);
//     res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };















// const createTax = async (req, res) => {
//   try {
//     // Déstructuration du body avec les nouveaux champs
//     const { name, description, amount, isVariable, rate, frequency, dueDate } = req.body;
//     console.log('Payload reçu pour la création de la taxe:', req.body);

//     // Vérification des champs obligatoires communs
//     if (!name || !frequency || !dueDate) {
//       console.error('Erreur: Champs obligatoires manquants (name, frequency, dueDate)');
//       return res.status(400).json({ message: 'Tous les champs obligatoires (name, frequency, dueDate) doivent être remplis.' });
//     }

//     // Vérification spécifique selon le type de taxe
//     if (isVariable) {
//       // Pour une taxe variable, le champ rate est requis
//       if (rate === undefined || rate === null || rate === '') {
//         console.error('Erreur: Pour une taxe variable, le champ "rate" est obligatoire.');
//         return res.status(400).json({ message: 'Pour une taxe variable, le champ "rate" est obligatoire.' });
//       }
//       console.log('Taxe variable détectée, taux fourni:', rate);
//     } else {
//       // Pour une taxe fixe, le champ amount est requis
//       if (amount === undefined || amount === null || amount === '') {
//         console.error('Erreur: Pour une taxe fixe, le champ "amount" est obligatoire.');
//         return res.status(400).json({ message: 'Pour une taxe fixe, le champ "amount" est obligatoire.' });
//       }
//       console.log('Taxe fixe détectée, montant fourni:', amount);
//     }

//     // Vérifier si une taxe avec le même nom existe déjà
//     const existingTax = await Tax.findOne({ name });
//     if (existingTax) {
//       console.error('Erreur: Une taxe avec ce nom existe déjà.', name);
//       return res.status(400).json({ message: 'Une taxe avec ce nom existe déjà.' });
//     }

//     // Préparer les données pour la nouvelle taxe
//     const newTaxData = {
//       name,
//       description,
//       frequency,
//       dueDate,
//       isVariable: isVariable || false, // Par défaut false
//     };

//     if (isVariable) {
//       newTaxData.rate = parseFloat(rate);
//       console.log('Création d’une taxe variable avec taux:', newTaxData.rate);
//     } else {
//       newTaxData.amount = parseFloat(amount);
//       console.log('Création d’une taxe fixe avec montant:', newTaxData.amount);
//     }

//     // Créer la nouvelle taxe
//     const newTax = new Tax(newTaxData);
//     await newTax.save();

//     console.log('Nouvelle taxe créée avec succès:', newTax);
//     res.status(201).json({ message: 'Taxe créée avec succès.', tax: newTax });
//   } catch (err) {
//     console.error('Erreur lors de la création de la taxe :', err.message);
//     res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };





const createTax = async (req, res) => {
  try {
    // Déstructuration du body avec les nouveaux champs
    const { 
      name, 
      description, 
      amount, 
      isVariable, 
      rate, 
      supportRates, 
      frequency, 
      dueDate 
    } = req.body;

    console.log('Payload reçu pour la création de la taxe:', req.body);

    // Vérification des champs obligatoires communs
    if (!name || !frequency || !dueDate) {
      console.error('Erreur: Champs obligatoires manquants (name, frequency, dueDate)');
      return res.status(400).json({ message: 'Les champs name, frequency et dueDate sont obligatoires.' });
    }

    // Vérifier si une taxe avec le même nom existe déjà
    const existingTax = await Tax.findOne({ name });
    if (existingTax) {
      console.error('Erreur: Une taxe avec ce nom existe déjà.', name);
      return res.status(400).json({ message: 'Une taxe avec ce nom existe déjà.' });
    }

    // Préparer les données pour la nouvelle taxe
    const newTaxData = {
      name,
      description,
      frequency,
      dueDate,
      isVariable: isVariable || false, // Par défaut false
    };

    if (isVariable) {
      // Pour une taxe variable, on attend que supportRates soit fourni.
      if (!supportRates || Object.keys(supportRates).length === 0) {
        console.error('Erreur: Pour une taxe variable, le champ "supportRates" est obligatoire.');
        return res.status(400).json({ message: 'Pour une taxe variable, veuillez fournir le champ "supportRates".' });
      }
      // Optionnel : si vous souhaitez autoriser également un taux unique (via rate)
      // vous pouvez le gérer ici en priorité ou en complément.
      newTaxData.supportRates = {};
      // Convertir les valeurs de supportRates en nombres
      for (const key in supportRates) {
        newTaxData.supportRates[key] = parseFloat(supportRates[key]);
      }
      console.log('Création d’une taxe variable avec supportRates:', newTaxData.supportRates);
    } else {
      // Pour une taxe fixe, le champ amount est requis
      if (amount === undefined || amount === null || amount === '') {
        console.error('Erreur: Pour une taxe fixe, le champ "amount" est obligatoire.');
        return res.status(400).json({ message: 'Pour une taxe fixe, le champ "amount" est obligatoire.' });
      }
      newTaxData.amount = parseFloat(amount);
      console.log('Création d’une taxe fixe avec montant:', newTaxData.amount);
    }

    // Créer la nouvelle taxe
    const newTax = new Tax(newTaxData);
    await newTax.save();

    console.log('Nouvelle taxe créée avec succès:', newTax);
    res.status(201).json({ message: 'Taxe créée avec succès.', tax: newTax });
  } catch (err) {
    console.error('Erreur lors de la création de la taxe :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};



const getAllTaxes = async (req, res) => {
  try {
    const taxes = await Tax.find();
    res.status(200).json(taxes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des taxes.' });
  }
};




// Mise à jour d'une taxe
// const updateTax = async (req, res) => {
//   try {
//     const taxId = req.params.id;
//     const { name, description, amount, isVariable, rate, frequency, dueDate } = req.body;
//     logger.info('Mise à jour de la taxe demandée', { taxId, body: req.body });

//     // Vérification des champs obligatoires communs
//     if (!name || !frequency || !dueDate) {
//       logger.error('Champs obligatoires manquants lors de la mise à jour');
//       return res.status(400).json({ message: 'Les champs name, frequency et dueDate sont obligatoires.' });
//     }

//     // Vérification spécifique selon le type de taxe
//     if (isVariable) {
//       if (rate === undefined || rate === null || rate === '') {
//         logger.error('Pour une taxe variable, le champ rate est obligatoire');
//         return res.status(400).json({ message: 'Pour une taxe variable, le champ "rate" est obligatoire.' });
//       }
//       logger.info('Taxe variable détectée avec taux:', rate);
//     } else {
//       if (amount === undefined || amount === null || amount === '') {
//         logger.error('Pour une taxe fixe, le champ amount est obligatoire');
//         return res.status(400).json({ message: 'Pour une taxe fixe, le champ "amount" est obligatoire.' });
//       }
//       logger.info('Taxe fixe détectée avec montant:', amount);
//     }

//     // Vérifier si une taxe avec le même nom existe déjà (en excluant l'ID actuel)
//     const existingTax = await Tax.findOne({ name, _id: { $ne: taxId } });
//     if (existingTax) {
//       logger.error('Une taxe avec ce nom existe déjà.', { name });
//       return res.status(400).json({ message: 'Une taxe avec ce nom existe déjà.' });
//     }

//     // Préparer les données à mettre à jour
//     const updateData = {
//       name,
//       description,
//       frequency,
//       dueDate,
//       isVariable: isVariable || false,
//     };

//     if (isVariable) {
//       updateData.rate = parseFloat(rate);
//     } else {
//       updateData.amount = parseFloat(amount);
//     }

//     // Mise à jour de la taxe
//     const updatedTax = await Tax.findByIdAndUpdate(taxId, updateData, { new: true, runValidators: true });
//     if (!updatedTax) {
//       logger.error('Taxe non trouvée pour la mise à jour', { taxId });
//       return res.status(404).json({ message: 'Taxe non trouvée.' });
//     }

//     logger.info('Taxe mise à jour avec succès:', updatedTax);
//     res.status(200).json({ message: 'Taxe mise à jour avec succès.', tax: updatedTax });
//   } catch (err) {
//     logger.error('Erreur lors de la mise à jour de la taxe :', err.message);
//     res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };


const updateTax = async (req, res) => {
  try {
    const taxId = req.params.id;
    const { name, description, amount, isVariable, rate, supportRates, frequency, dueDate } = req.body;
    console.log('Payload reçu pour la mise à jour de la taxe:', req.body, 'Tax ID:', taxId);

    // Vérification des champs obligatoires communs
    if (!name || !frequency || !dueDate) {
      console.error('Erreur: Champs obligatoires manquants (name, frequency, dueDate)');
      return res.status(400).json({ message: 'Les champs name, frequency et dueDate sont obligatoires.' });
    }

    // Vérification spécifique selon le type de taxe
    if (isVariable) {
      if (!supportRates || Object.keys(supportRates).length === 0) {
        console.error('Erreur: Pour une taxe variable, le champ "supportRates" est obligatoire.');
        return res.status(400).json({ message: 'Pour une taxe variable, veuillez fournir le champ "supportRates".' });
      }
      console.log('Taxe variable détectée, supportRates fourni:', supportRates);
    } else {
      if (amount === undefined || amount === null || amount === '') {
        console.error('Erreur: Pour une taxe fixe, le champ "amount" est obligatoire.');
        return res.status(400).json({ message: 'Pour une taxe fixe, le champ "amount" est obligatoire.' });
      }
      console.log('Taxe fixe détectée, montant fourni:', amount);
    }

    // Vérifier si une autre taxe avec le même nom existe
    const existingTax = await Tax.findOne({ name, _id: { $ne: taxId } });
    if (existingTax) {
      console.error('Erreur: Une taxe avec ce nom existe déjà.', name);
      return res.status(400).json({ message: 'Une taxe avec ce nom existe déjà.' });
    }

    // Préparer les données pour la mise à jour
    const updateData = {
      name,
      description,
      frequency,
      dueDate,
      isVariable: isVariable || false,
    };

    if (isVariable) {
      updateData.supportRates = {};
      for (const key in supportRates) {
        updateData.supportRates[key] = parseFloat(supportRates[key]);
      }
      console.log('Mise à jour d’une taxe variable avec supportRates:', updateData.supportRates);
    } else {
      updateData.amount = parseFloat(amount);
      console.log('Mise à jour d’une taxe fixe avec montant:', updateData.amount);
    }

    // Mettre à jour la taxe
    const updatedTax = await Tax.findByIdAndUpdate(taxId, updateData, { new: true, runValidators: true });
    if (!updatedTax) {
      console.error('Erreur: Taxe non trouvée pour la mise à jour', taxId);
      return res.status(404).json({ message: 'Taxe non trouvée.' });
    }

    console.log('Taxe mise à jour avec succès:', updatedTax);
    res.status(200).json({ message: 'Taxe mise à jour avec succès.', tax: updatedTax });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la taxe :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};






// Suppression d'une taxe
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
