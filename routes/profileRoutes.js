const express = require('express');
const router = express.Router();
const { getMyProfile, updateProfilePhoto, updateProfileDetails } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// 📁 Dossier de stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// 🔒 Routes protégées
router.get('/me', authMiddleware, getMyProfile);
router.put('/photo', authMiddleware, upload.single('photo'), updateProfilePhoto);
router.put('/update', authMiddleware, updateProfileDetails);

module.exports = router;
