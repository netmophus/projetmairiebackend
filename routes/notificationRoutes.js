const express = require("express");
const { sendNotification } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("collector"), sendNotification);

module.exports = router;
