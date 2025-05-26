const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus, updateUserRole } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const User = require('../models/User');

// 🔹 Route pour récupérer tous les utilisateurs avec recherche et pagination
router.get('/', authMiddleware, roleMiddleware(['admin']), getUsers);

// 🔹 Route pour modifier le statut d’un utilisateur (activer/désactiver)
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), updateUserStatus);

// 🔹 Route pour modifier le rôle d’un utilisateur
router.put('/:id/role', authMiddleware, roleMiddleware(['admin']), updateUserRole);


// Accessible au chefmarket uniquement
router.get('/collectors', authMiddleware, roleMiddleware('chefmarket'), async (req, res) => {
  try {
    const collectors = await User.find({
      role: 'collector',
      createdBy: req.user.id, // 🔥 Filtre les collecteurs créés par ce chef
    }).select('name phone status');

    res.json(collectors);
  } catch (err) {
    console.error('❌ Erreur récupération des collecteurs :', err.message, err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

  
module.exports = router;
