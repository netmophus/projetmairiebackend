




const cron = require('node-cron'); 
const { addYears, format, isAfter, parseISO, isValid } = require('date-fns');
const TaxpayerTax = require('../models/TaxpayerTax');
const UnpaidTax = require('../models/UnpaidTax');

const renewTaxes = async () => {
  console.log('🔄 Début du Cron Job : Renouvellement des Taxes Annuelles');
  
  try {
    const taxes = await TaxpayerTax.find({ status: { $in: ['pending', 'paid'] } })
      .populate('tax', 'amount frequency')
      .populate('taxpayer', 'createdBy')
      .select('taxpayer tax totalAmount remainingAmount paidAmount dueDate status payments details'); // Inclure `details`

    // for (const tax of taxes) {
    //   const today = new Date();
    //   const dueDate = parseISO(tax.dueDate.toISOString());

    //   if (isAfter(today, dueDate)) {
    //     console.log('⚠️ Échéance dépassée pour la taxe:', tax._id);

    //     if (tax.remainingAmount > 0) {
    //       const newUnpaid = new UnpaidTax({
    //         taxpayer: tax.taxpayer._id,
    //         tax: tax.tax._id,
    //         dueDate: tax.dueDate,
    //         totalAmount: tax.totalAmount, // Assurez-vous que totalAmount est bien défini
    //         paidAmount: tax.paidAmount,
    //         remainingAmount: tax.remainingAmount, // Assurez-vous que remainingAmount est bien défini
    //         archivedAt: new Date(),
    //         collector: tax.taxpayer.createdBy,
    //         amountUnpaid: tax.remainingAmount,
    //         originalDueDate: tax.dueDate,
    //         payments: tax.payments || [] // Transfert des paiements partiels s'il y en a
    //       });

    //       await newUnpaid.save();
    //       console.log('🟥 Impayé enregistré pour la taxe :', tax._id);

    //       // Ne pas supprimer l'entrée TaxpayerTax
    //       tax.status = 'archived';
    //       await tax.save();
    //       console.log('✅ Taxe archivée :', tax._id);
    //     }

    //     const nextDueDate = addYears(dueDate, 1);

    //     if (!isValid(nextDueDate)) {
    //       console.error('❌ Date de prochaine échéance invalide.');
    //       continue;
    //     }

    //     const newTaxEntry = new TaxpayerTax({
    //       taxpayer: tax.taxpayer,
    //       tax: tax.tax,
    //       totalAmount: tax.totalAmount,  // S'assurer que totalAmount est bien assigné ici
    //       remainingAmount: tax.totalAmount, // S'assurer que remainingAmount est bien assigné ici
    //       paidAmount: 0,
    //       dueDate: nextDueDate,
    //       status: 'pending',
    //       payments: [], // Nouveau cycle sans paiements
    //       details: tax.details || {}  // Ajouter `details` correctement
    //     });

    //     await newTaxEntry.save();
    //     console.log(`✅ Nouvelle taxe créée pour ${format(nextDueDate, 'dd/MM/yyyy')}`);
    //   }
    // }

 
    for (const tax of taxes) {
      const today = new Date();
      const dueDate = parseISO(tax.dueDate.toISOString());
    
      // Vérifier si la taxe est déjà archivée (payée ou traitée dans le passé)
      if (tax.status === 'archived') {
        console.log(`⚠️ La taxe ${tax._id} est déjà archivée, pas de renouvellement.`);
        continue; // Passer cette taxe et ne pas la renouveler
      }
    
      if (isAfter(today, dueDate)) {
        console.log('⚠️ Échéance dépassée pour la taxe:', tax._id);
    
        // Si la taxe est payée (remainingAmount == 0), la marquer comme "archived"
        if (tax.remainingAmount === 0) {
          // La taxe est entièrement payée, mettre à jour son statut à "archived"
          tax.status = 'archived';
          await tax.save();
          console.log('✅ Taxe payée et archivée pour la taxe :', tax._id);
    
          // Créer une nouvelle taxe pour 2026 avec un statut "pending"
          const nextDueDate = addYears(dueDate, 1); // Date de la prochaine échéance
          if (!isValid(nextDueDate)) {
            console.error('❌ Date de prochaine échéance invalide.');
            continue;
          }
    
          const newTaxEntry = new TaxpayerTax({
            taxpayer: tax.taxpayer,
            tax: tax.tax,
            totalAmount: tax.totalAmount, // Le montant total de la taxe pour 2026
            remainingAmount: tax.totalAmount, // Montant restant pour 2026
            paidAmount: 0, // Pas de paiements encore pour 2026
            dueDate: nextDueDate,
            status: 'pending', // Statut "pending" pour 2026
            payments: [], // Aucun paiement effectué pour 2026 encore
            details: tax.details || {} // Détails de la taxe précédente
          });
    
          await newTaxEntry.save();
          console.log(`✅ Nouvelle taxe pour 2026 créée pour ${format(nextDueDate, 'dd/MM/yyyy')}`);
        } else {
          // Si la taxe est encore impayée, la traiter comme impayée
          if (tax.remainingAmount > 0) {
            const newUnpaid = new UnpaidTax({
              taxpayer: tax.taxpayer._id,
              tax: tax.tax._id,
              dueDate: tax.dueDate,
              totalAmount: tax.totalAmount,
              paidAmount: tax.paidAmount,
              remainingAmount: tax.remainingAmount,
              archivedAt: new Date(),
              collector: tax.taxpayer.createdBy,
              amountUnpaid: tax.remainingAmount,
              originalDueDate: tax.dueDate,
              payments: tax.payments || [] // Transfert des paiements partiels s'il y en a
            });
    
            await newUnpaid.save();
            console.log('🟥 Impayé enregistré pour la taxe :', tax._id);
    
            // Ne pas supprimer l'entrée TaxpayerTax, mais la marquer comme "archived"
            tax.status = 'archived';
            await tax.save();
            console.log('✅ Taxe archivée :', tax._id);
          }
    
          const nextDueDate = addYears(dueDate, 1); // Créer la nouvelle échéance pour 2026
    
          if (!isValid(nextDueDate)) {
            console.error('❌ Date de prochaine échéance invalide.');
            continue;
          }
    
          // Créer une nouvelle taxe pour 2026 avec un statut "pending"
          const newTaxEntry = new TaxpayerTax({
            taxpayer: tax.taxpayer,
            tax: tax.tax,
            totalAmount: tax.totalAmount,  // Le montant total pour 2026
            remainingAmount: tax.totalAmount, // Montant restant pour 2026
            paidAmount: 0, // Aucun paiement effectué pour 2026 encore
            dueDate: nextDueDate, // Nouvelle date d'échéance pour 2026
            status: 'pending',  // Statut "pending"
            payments: [], // Aucun paiement pour l'instant
            details: tax.details || {}  // Détails de la taxe précédente
          });
    
          await newTaxEntry.save();
          console.log(`✅ Nouvelle taxe créée pour ${format(nextDueDate, 'dd/MM/yyyy')}`);
        }
      }
    }
    



  } catch (err) {
    console.error('❌ Erreur:', err);
  }
};


// Planifier le cron job pour qu'il s'exécute tous les jours à minuit
cron.schedule('0 0 * * *', renewTaxes);

module.exports = { renewTaxes };

