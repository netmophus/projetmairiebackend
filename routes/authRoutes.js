




// authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, requestOtp , changePassword} = require('../controllers/authController');

// Route pour l'inscription
router.post('/register', registerUser);

// Route pour la connexion
router.post('/login', loginUser);


// 🔵 Route pour demander un OTP
router.post('/request-otp', requestOtp);

// 🔵 Route pour changer le mot de passe
router.post('/change-password', changePassword);

module.exports = router;

















