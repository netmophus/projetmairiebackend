// const Notification = require("../models/Notification");
// const Payment = require("../models/Payment");
// const sendSmsNotification = require("../utils/sendSmsNotification");




const axios = require('axios');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

const sendNotification = async (req, res) => {
  try {
    // On attend que le body contienne phoneNumber, message et paymentId.
    const { phoneNumber, message, paymentId } = req.body;
    if (!phoneNumber || !message || !paymentId) {
      logger.warn('Champs manquants pour l’envoi de la notification SMS.');
      return res.status(400).json({ message: 'Tous les champs (phoneNumber, message, paymentId) sont requis.' });
    }
    
    // Récupérer la clé API et le sender depuis les variables d'environnement
    const apiKey = process.env.TEXTLOCAL_API_KEY;
    if (!apiKey) {
      logger.error('Clé API Textlocal non configurée.');
      return res.status(500).json({ message: 'Clé API Textlocal non configurée.' });
    }
    const sender = process.env.TEXTLOCAL_SENDER || 'TXTLCL';
    
    // Préparer le payload pour l'API Textlocal
    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('numbers', phoneNumber);
    params.append('sender', sender);
    params.append('message', message);
    
    logger.info(`Envoi de SMS vers ${phoneNumber} avec message : ${message}`);
    
    // Envoyer la requête POST à l'API Textlocal
    const textlocalUrl = 'https://api.txtlocal.com/send/';
    const response = await axios.post(textlocalUrl, params);
    logger.info(`Réponse Textlocal : ${JSON.stringify(response.data)}`);
    
    if (response.data && response.data.status === 'success') {
      // Créer une notification dans la base de données
      const notification = new Notification({
        taxpayer: req.user.id, // On suppose que le contributeur connecté (collector) est dans req.user
        phoneNumber,
        message,
        payment: paymentId,
        status: 'envoyé'
      });
      await notification.save();
      logger.info(`Notification enregistrée pour le paiement ${paymentId}.`);
      return res.status(200).json({ message: 'Notification envoyée avec succès.', notification });
    } else {
      logger.error(`Erreur Textlocal: ${JSON.stringify(response.data)}`);
      return res.status(500).json({ message: 'Erreur lors de l’envoi de la notification SMS.' });
    }
  } catch (error) {
    logger.error(`Erreur dans sendNotification: ${error.message} - ${error.stack}`);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = { sendNotification };
