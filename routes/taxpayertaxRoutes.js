// const express = require("express");
// const { getTaxesByTaxpayer } = require("../controllers/taxpayertaxController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// const router = express.Router();

// // Route pour récupérer les taxes associées à un contribuable
// router.get("/:taxpayerId", authMiddleware, roleMiddleware("collector"), getTaxesByTaxpayer);

// module.exports = router;


const express = require("express");
const {
  getTaxesByTaxpayer,
  deleteTaxpayerTaxEntry, // ✅ Contrôleur à ajouter ensuite
} = require("../controllers/taxpayertaxController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Route pour récupérer les taxes associées à un contribuable
router.get("/:taxpayerId", authMiddleware, roleMiddleware("collector"), getTaxesByTaxpayer);

// ✅ Route pour supprimer une entrée TaxpayerTax (dissociation)
router.delete("/:taxpayerTaxId", authMiddleware, roleMiddleware("collector"), deleteTaxpayerTaxEntry);

module.exports = router;
