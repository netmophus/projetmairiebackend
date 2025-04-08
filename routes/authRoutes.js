




// authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, requestOtp , changePassword, getUserInfo} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');

// Route pour l'inscription
router.post('/register', registerUser);

// Route pour la connexion
router.post('/login', loginUser);


// 🔵 Route pour demander un OTP
router.post('/request-otp', requestOtp);

// 🔵 Route pour changer le mot de passe
router.post('/change-password', changePassword);

// Ajoute cette route dans authRoutes.js
router.get('/user-info', authMiddleware, getUserInfo);


module.exports = router;

















