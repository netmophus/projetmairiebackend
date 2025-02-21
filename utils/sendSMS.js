
// backend/utils/sendSMS.js

const axios = require('axios');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration de l'API SMS depuis le fichier .env
const SMS_API_URL = process.env.SMS_API_URL;
const SMS_USERNAME = process.env.SMS_USERNAME;
const SMS_PASSWORD = process.env.SMS_PASSWORD;

// Fonction pour envoyer un SMS
const sendSMS = async (to, message) => {
    try {
        const payload = {
            to: to,
            from: "Softlink",
            content: message,
            dlr: "yes",
            "dlr-level": 3, // Utilisation de guillemets pour éviter l'erreur de syntaxe
            "dlr-method": "GET",
            "dlr-url": "https://sms.ne/dlr"
        };

        const response = await axios({
            method: 'post',
            url: SMS_API_URL,
            data: payload,
            auth: {
                username: SMS_USERNAME,
                password: SMS_PASSWORD
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("✅ Réponse de l'API SMS :", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("❌ Erreur de l'API SMS :", error.response.data);
        } else {
            console.error("❌ Erreur lors de l'envoi du SMS :", error.message);
        }
        throw error;
    }
};

module.exports = { sendSMS };
