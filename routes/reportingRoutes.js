const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const reportingController = require("../controllers/reportingController");

// 📊 Rapport sur l'activité des collecteurs
// 📊 Rapport sur l'activité des collecteurs
router.get(
    "/collectors-activity",
    authMiddleware,
    roleMiddleware(["admin"]),
    reportingController.getCollectorsActivityReport
  );

// 📄 Rapport des transactions et montants collectés
router.get(
  "/transactions-summary",
  authMiddleware,
  roleMiddleware(["admin"]),
  reportingController.getTransactionsSummaryReport
);

// 🧾 Rapport sur l'utilisation des reçus
router.get(
  "/receipts-usage",
  authMiddleware,
  roleMiddleware(["admin"]),
  reportingController.getReceiptsUsageReport
);

// 💰 Rapport sur les paiements et le recouvrement
router.get(
  "/payments-recovery",
  authMiddleware,
  roleMiddleware(["admin"]),
  reportingController.getPaymentsRecoveryReport
);



router.get("/receipts/:startReceipt/:endReceipt", authMiddleware,  roleMiddleware(["admin"]), reportingController.getPaymentsForReceipts);


module.exports = router;
