// const express = require('express');
// const { registerUser, loginUser, getUsers, updateUserStatus, deleteUser, updateUser } = require('../controllers/authController');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');


// router.post('/register', registerUser); // Route d'inscription
// router.post('/login', loginUser); // Route de connexion

// router.get('/', authMiddleware, roleMiddleware('admin'), getUsers); // Accès réservé aux administrateurs


// router.put('/:id/status', authMiddleware, roleMiddleware('admin'), updateUserStatus);


// router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

// router.put('/:id', authMiddleware, roleMiddleware('admin'), updateUser);

// module.exports = router;






// authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Route pour l'inscription
router.post('/register', registerUser);

// Route pour la connexion
router.post('/login', loginUser);

module.exports = router;

















