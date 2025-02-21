const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  taxpayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Taxpayer", // Référence au contribuable qui a effectué le paiement
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment", // Référence au paiement lié à cette notification
    required: true,
  },
  status: {
    type: String,
    enum: ["envoyé", "échec"],
    default: "envoyé",
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
