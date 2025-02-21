// controllers/smsController.js
const { sendSMS } = require('../utils/sendSMS');

// Contrôleur pour l'envoi du SMS
const sendSmsNotification = async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ message: "Le numéro de téléphone et le message sont requis." });
    }

    try {
        const response = await sendSMS(to, message);
        res.status(200).json({ message: 'SMS envoyé avec succès', response });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'envoi du SMS', error: error.message });
    }
};

module.exports = { sendSmsNotification };
