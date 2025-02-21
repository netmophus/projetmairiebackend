const Payment = require("../models/Payment");
const Taxpayer = require("../models/Taxpayer");
const Collector = require("../models/Collector"); 
const User = require("../models/User");
const ReceiptBatch = require("../models/ReceiptBatch");
const Tax = require("../models/Tax");
const Zone = require("../models/Zone");
const MarketTaxPayment = require('../models/MarketTaxPayment');
const TaxpayerTax = require('../models/TaxpayerTax');



// 📊 Rapport sur l'activité des collecteurs (Données pour le frontend)
// exports.getCollectorsActivityReport = async (req, res) => {
//     try {
//       console.log("📥 Début de la génération du rapport des collecteurs...");
  
//       // 1️⃣ Récupérer tous les collecteurs avec leurs informations utilisateurs
//       const collectors = await Collector.find().populate("user", "name phone").lean();
//       console.log("✅ Collecteurs récupérés :", collectors.length);
  
//       if (!collectors.length) {
//         console.warn("⚠️ Aucun collecteur trouvé.");
//         return res.status(404).json({ message: "Aucun collecteur trouvé." });
//       }
  
//       // 2️⃣ Récupérer tous les paiements avec les contribuables et les taxes
//       const payments = await Payment.find()
//         .populate({
//           path: "taxpayer",
//           populate: [
//             { path: "user", select: "name phone" },
//             { path: "zone", select: "name" }, // ✅ On récupère ici le nom de la zone
//           ],
//         })
//         .populate("tax", "name")
//         .populate("collector", "name phone") // ✅ On garde uniquement `collector`
//         .lean();
  
//       console.log("✅ Paiements récupérés :", payments.length);
  
//       // 3️⃣ Association des collecteurs avec leurs taxes et contribuables
//       const reportData = collectors.map((collector) => {
//         console.log(`🔍 Traitement du collecteur : ${collector.user.name} (${collector.user.phone})`);
  
//         // Filtrer les paiements liés à ce collecteur
//         const collectorPayments = payments.filter(
//           (payment) => String(payment.collector?._id) === String(collector.user?._id)
//         );
  
//         console.log(`📌 Nombre de paiements associés : ${collectorPayments.length}`);
  
//         // 🏛 Récupérer la liste des taxes collectées
//         const taxesCollected = [...new Set(collectorPayments.map((p) => p.tax.name))];
  
//         console.log(`💰 Taxes collectées : ${taxesCollected.length > 0 ? taxesCollected : "Aucune"}`);
  
//         // 📊 Regrouper les contribuables par taxe
//         const taxpayersByTax = {};
//         collectorPayments.forEach((payment) => {
//           const taxName = payment.tax.name;
  
//           if (!taxpayersByTax[taxName]) {
//             taxpayersByTax[taxName] = [];
//           }
  
//           taxpayersByTax[taxName].push({
//             name: payment.taxpayer?.user?.name || "Nom inconnu",
//             phone: payment.taxpayer?.user?.phone || "Non défini",
//             address: payment.taxpayer?.address || "Adresse non renseignée",
//             activityType: payment.taxpayer?.activityType || "Non défini",
//             zone: payment.taxpayer?.zone?.name || "Non définie", // ✅ Correction ici
//             amountPaid: payment.amountPaid.toLocaleString(), // ✅ Correction du format ici
//           });
//         });
  
//         console.log("📊 Contribuables regroupés par taxe :", taxpayersByTax);
  
//         return {
//           collecteur: collector.user.name || "Inconnu",
//           telephone: collector.user.phone || "Non défini",
//           taxesCollectées: taxesCollected.length > 0 ? taxesCollected : ["Aucune"],
//           contribuablesParTaxe: taxpayersByTax,
//         };
//       });
  
//       console.log("✅ Rapport généré avec succès ! Résumé :", reportData);
  
//       // 📤 Envoi du rapport en JSON pour affichage côté frontend
//       res.status(200).json(reportData);
  
//     } catch (err) {
//       console.error("❌ Erreur lors de la génération du rapport :", err);
//       res.status(500).json({ message: "Erreur lors de la génération du rapport." });
//     }
//   };



exports.getCollectorsActivityReport = async (req, res) => {
  try {
    console.log("📥 Début de la génération du rapport des collecteurs...");

    // 1️⃣ Récupérer tous les collecteurs avec leurs informations utilisateurs
    const collectors = await Collector.find().populate("user", "name phone").lean();
    console.log("✅ Collecteurs récupérés :", collectors.length);

    if (!collectors.length) {
      console.warn("⚠️ Aucun collecteur trouvé.");
      return res.status(404).json({ message: "Aucun collecteur trouvé." });
    }

    // 2️⃣ Récupérer tous les paiements avec les contribuables, taxes et zones
    const payments = await Payment.find()
      .populate({
        path: "taxpayer",
        populate: [
          { path: "user", select: "name phone" },
          { path: "zone", select: "name" }, // ✅ On récupère ici le nom de la zone
        ],
      })
      .populate("tax", "name")
      .populate("collector", "name phone")
      .lean();

    console.log("✅ Paiements récupérés :", payments.length);

    // 3️⃣ Association des collecteurs avec leurs taxes et contribuables
    const reportData = collectors.map((collector) => {
      console.log(`🔍 Traitement du collecteur : ${collector.user.name} (${collector.user.phone})`);

      // Filtrer les paiements liés à ce collecteur
      const collectorPayments = payments.filter(
        (payment) => String(payment.collector?._id) === String(collector.user?._id)
      );

      console.log(`📌 Nombre de paiements associés : ${collectorPayments.length}`);

      // 🏛 Récupérer la liste des taxes collectées
      const taxesCollected = [...new Set(collectorPayments.map((p) => p.tax?.name || "Taxe inconnue"))];

      console.log(`💰 Taxes collectées : ${taxesCollected.length > 0 ? taxesCollected : "Aucune"}`);

      // 📊 Regrouper les contribuables par taxe et zone
      const taxpayersByTaxAndZone = {};
      collectorPayments.forEach((payment) => {
        const taxName = payment.tax?.name || "Taxe inconnue";
        const zoneName = payment.taxpayer?.zone?.name || "Zone inconnue";

        if (!taxpayersByTaxAndZone[zoneName]) {
          taxpayersByTaxAndZone[zoneName] = {};
        }

        if (!taxpayersByTaxAndZone[zoneName][taxName]) {
          taxpayersByTaxAndZone[zoneName][taxName] = [];
        }

        taxpayersByTaxAndZone[zoneName][taxName].push({
          name: payment.taxpayer?.user?.name || "Nom inconnu",
          phone: payment.taxpayer?.user?.phone || "Non défini",
          address: payment.taxpayer?.address || "Adresse non renseignée",
          activityType: payment.taxpayer?.activityType || "Non défini",
        //   amountPaid: payment.amountPaid.toLocaleString(),
        amountPaid: Number(payment.amountPaid),

          paymentDate: new Date(payment.date).toLocaleDateString("fr-FR"),
        });
      });

      console.log("📊 Contribuables regroupés par taxe et zone :", taxpayersByTaxAndZone);

      return {
        collecteur: collector.user.name || "Inconnu",
        telephone: collector.user.phone || "Non défini",
        taxesCollectées: taxesCollected.length > 0 ? taxesCollected : ["Aucune"],
        contribuablesParTaxeEtZone: taxpayersByTaxAndZone,
      };
    });

    console.log("✅ Rapport généré avec succès ! Résumé :", reportData);

    // 📤 Envoi du rapport en JSON pour affichage côté frontend
    res.status(200).json(reportData);
  } catch (err) {
    console.error("❌ Erreur lors de la génération du rapport :", err);
    res.status(500).json({ message: "Erreur lors de la génération du rapport." });
  }
};



// 📄 Rapport des transactions et montants collectés
// exports.getTransactionsSummaryReport = async (req, res) => {
//     try {
//         console.log("📥 Début de la récupération des paiements...");

//         // Récupération des paiements avec les détails des collecteurs et contribuables
//         const payments = await Payment.find()
//             .populate({
//                 path: "taxpayer",
//                 populate: { path: "user", select: "name phone" } // Récupère le nom et téléphone du contribuable
//             })
//             .populate("tax", "name") // Récupère le nom de la taxe
//             .populate({
//                 path: "collector",
//                 select: "name phone" // Récupère le nom et téléphone du collecteur
//             })
//             .lean();

//         console.log(`✅ Paiements récupérés : ${payments.length}`);

//         if (!payments.length) {
//             console.warn("⚠️ Aucun paiement trouvé.");
//             return res.status(404).json({ message: "Aucun paiement trouvé." });
//         }

//         // ✅ Logs détaillés des paiements récupérés
//         payments.forEach((payment, index) => {
//             console.log(`🔹 Paiement ${index + 1}:`);
//             console.log(`   📌 Collecteur : ${payment.collector?.name || "Non défini"} (${payment.collector?.phone || "N/A"})`);
//             console.log(`   🧑 Contribuable : ${payment.taxpayer?.user?.name || "Non défini"} (${payment.taxpayer?.user?.phone || "N/A"})`);
//             console.log(`   💰 Taxe : ${payment.tax?.name || "Non définie"}`);
//             console.log(`   💵 Montant payé : ${payment.amountPaid} FCFA`);
//             console.log(`   🗓️ Date : ${new Date(payment.date).toLocaleDateString("fr-FR")}`);
//         });

//         // 📊 Construction du rapport structuré par jour, mois, année
//         const reportData = payments.map(payment => ({
//             date: new Date(payment.date).toISOString().split("T")[0], // Date au format YYYY-MM-DD
//             collecteur: payment.collector?.name || "Non défini",
//             collecteurPhone: payment.collector?.phone || "N/A",
//             contribuable: payment.taxpayer?.user?.name || "Non défini",
//             contribuablePhone: payment.taxpayer?.user?.phone || "N/A",
//             taxe: payment.tax?.name || "Non définie",
//             montant: payment.amountPaid,
//         }));

//         console.log("✅ Rapport structuré généré avec succès !");
//         res.status(200).json(reportData);

//     } catch (error) {
//         console.error("❌ Erreur lors de la récupération du rapport :", error);
//         res.status(500).json({ message: "Erreur interne du serveur." });
//     }
// };


exports.getTransactionsSummaryReport = async (req, res) => {
    try {
        console.log("📥 Début de la récupération des paiements...");

        const { page = 1, limit = 1000, filter = "all" } = req.query;

        const skip = (page - 1) * limit;

        // **Récupération et filtrage des paiements**
        let filterQuery = {};
        const now = new Date();

        if (filter === "day") {
            filterQuery.date = {
                $gte: new Date(now.setHours(0, 0, 0, 0)),
                $lt: new Date(now.setHours(23, 59, 59, 999)),
            };
        } else if (filter === "month") {
            filterQuery.date = {
                $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                $lt: new Date(now.getFullYear(), now.getMonth() + 1, 0),
            };
        } else if (filter === "year") {
            filterQuery.date = {
                $gte: new Date(now.getFullYear(), 0, 1),
                $lt: new Date(now.getFullYear() + 1, 0, 1),
            };
        }

        const payments = await Payment.find(filterQuery)
            .populate({
                path: "taxpayer",
                populate: { path: "user", select: "name phone" },
            })
            .populate("tax", "name")
            .populate({
                path: "collector",
                select: "name phone",
            })
            .skip(skip)
            .limit(Number(limit))
            .lean();

        console.log(`✅ Paiements récupérés : ${payments.length}`);

        if (!payments.length) {
            console.warn("⚠️ Aucun paiement trouvé.");
            return res.status(404).json({ message: "Aucun paiement trouvé." });
        }

        // **Construction du rapport**
        const reportData = payments.map(payment => ({
            date: new Date(payment.date).toISOString().split("T")[0],
            collecteur: payment.collector?.name || "Non défini",
            collecteurPhone: payment.collector?.phone || "N/A",
            contribuable: payment.taxpayer?.user?.name || "Non défini",
            contribuablePhone: payment.taxpayer?.user?.phone || "N/A",
            taxe: payment.tax?.name || "Non définie",
            montant: parseFloat(payment.amountPaid) || 0, // ✅ Correction ici pour éviter /000
        }));

        console.log("✅ Rapport structuré généré avec succès !");
        res.status(200).json({
            total: payments.length,
            page: Number(page),
            totalPages: Math.ceil(payments.length / limit),
            data: reportData,
        });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération du rapport :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};







// 🧾 Rapport sur l'utilisation des reçus activés
exports.getReceiptsUsageReport = async (req, res) => {
    try {
        console.log("📥 Début de la récupération des reçus activés...");

        // Récupération des reçus activés avec les collecteurs et marchés associés
        const receipts = await ReceiptBatch.find({ status: "Activated" }) // ✅ On filtre seulement les reçus activés
            .populate("market", "name") // 📌 Récupérer le nom du marché
            .populate("collector", "name phone") // 📌 Récupérer le collecteur (nom & téléphone)
            .lean();

        console.log(`✅ Reçus activés récupérés : ${receipts.length}`);

        if (!receipts.length) {
            console.warn("⚠️ Aucun reçu activé trouvé.");
            return res.status(404).json({ message: "Aucun reçu activé trouvé." });
        }

        // 📊 Structuration des données
        const reportData = receipts.map((receipt, index) => {
            console.log(`🔹 Reçu Activé ${index + 1}:`);
            console.log(`   📅 Date d'Activation : ${receipt.activatedAt ? new Date(receipt.activatedAt).toISOString().split("T")[0] : "Date inconnue"}`);
            console.log(`   🏛 Marché : ${receipt.market?.name || "Non défini"}`);
            console.log(`   🧑 Collecteur : ${receipt.collector?.name || "Non défini"} (${receipt.collector?.phone || "N/A"})`);
            console.log(`   🎫 Reçus : ${receipt.startReceipt} ➡ ${receipt.endReceipt}`);
            console.log(`   🔢 Nombre de reçus activés : ${receipt.confirmationCodes.length}`);

            return {
                date: receipt.activatedAt ? new Date(receipt.activatedAt).toISOString().split("T")[0] : "Date inconnue",
                marché: receipt.market?.name || "Non défini",
                collecteur: receipt.collector?.name || "Non défini",
                collecteurPhone: receipt.collector?.phone || "N/A",
                startReceipt: receipt.startReceipt || "N/A",
                endReceipt: receipt.endReceipt || "N/A",
                nombreReçusActivés: receipt.confirmationCodes.length,
            };
        });

        console.log("✅ Rapport généré avec succès !");
        res.status(200).json(reportData);

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des reçus activés :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};








exports.getPaymentsForReceipts = async (req, res) => {
    try {
        const { startReceipt, endReceipt } = req.params;

        console.log(`📥 Récupération des paiements pour les reçus de ${startReceipt} à ${endReceipt}...`);

        if (!startReceipt || !endReceipt) {
            console.warn("⚠️ startReceipt ou endReceipt est manquant !");
            return res.status(400).json({ message: "Les numéros de reçus sont requis." });
        }

        // 🔍 Recherche des paiements avec des reçus dans cette plage
        const payments = await MarketTaxPayment.find({
            receipt: { $regex: `^R00[0-9]+` } // Vérifie si le reçu est bien formaté
        })
        .populate({
            path: "collector",
            populate: {
                path: "user", // 🔍 Aller chercher l'utilisateur du collecteur
                select: "name phone"
            }
        })
        .populate("market", "name")
        .lean();
        
        // Vérifier si le collecteur est bien récupéré
        console.log("🔍 Paiements trouvés :", payments);
        
        for (let payment of payments) {
            if (payment.collector && payment.collector.user) {
                payment.collecteur = payment.collector.user.name || "Non défini";
                payment.collecteurPhone = payment.collector.user.phone || "N/A";
            } else {
                payment.collecteur = "Non défini";
                payment.collecteurPhone = "N/A";
            }
        }
        
        console.log("✅ Paiements après transformation :", payments);
        

        if (!payments.length) {
            console.warn(`⚠️ Aucun paiement trouvé pour ces reçus.`);
            return res.status(404).json({ message: "Aucun paiement trouvé pour ces reçus." });
        }

        // 📝 Formatage des données pour la réponse
        const reportData = payments.map(payment => ({
            date: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split("T")[0] : "Date inconnue",
            marché: payment.market?.name || "Non défini",
            collecteur: payment.collector?.user?.name || "Non défini", // ✅ Ici !
            collecteurPhone: payment.collector?.user?.phone || "N/A", // ✅ Ici aussi !
            numéroReçu: payment.receipt || "Non défini",
            confirmationCode: payment.confirmationCode || "Non défini",
            montant: payment.amount || 0
        }));
        

        console.log("✅ Rapport généré avec succès !");
        res.status(200).json(reportData);

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des paiements :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};






//💰 Rapport sur les paiements et le recouvrement







exports.getPaymentsRecoveryReport = async (req, res) => {
    try {
        console.log("📥 Récupération des données du rapport des paiements...");

        const payments = await Payment.find()
            .populate("taxpayer", "user")
            .lean();

        const reportData = payments.map((payment) => ({
            taxpayer: payment.taxpayer?.user?.name || "Inconnu",
            amount: payment.amountPaid,
            date: payment.date.toISOString().split("T")[0],
        }));

        console.log("✅ Données du rapport des paiements récupérées !");
        res.status(200).json(reportData);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des paiements :", err);
        res.status(500).json({ message: "Erreur lors de la récupération des paiements." });
    }
};
