const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus, updateUserRole } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// 🔹 Route pour récupérer tous les utilisateurs avec recherche et pagination
router.get('/', authMiddleware, roleMiddleware(['admin']), getUsers);

// 🔹 Route pour modifier le statut d’un utilisateur (activer/désactiver)
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), updateUserStatus);

// 🔹 Route pour modifier le rôle d’un utilisateur
router.put('/:id/role', authMiddleware, roleMiddleware(['admin']), updateUserRole);

module.exports = router;
