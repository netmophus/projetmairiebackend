// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Créer le dossier s'il n'existe pas
// const uploadDir = path.join(__dirname, '../uploads/boutiques');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configuration du stockage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const base = path.basename(file.originalname, ext);
//     const uniqueName = `${base}-${Date.now()}${ext}`;
//     cb(null, uniqueName);
//   }
// });

// // Filtrer uniquement les images
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Seules les images sont autorisées'), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
// });

// module.exports = upload;




const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fonction pour créer dynamiquement un dossier
const getUploadPath = (fieldname) => {
  const folderMap = {
    photo: 'uploads/boutiques',
    idDocument: 'uploads/commercants',
  };
  const uploadPath = folderMap[fieldname] || 'uploads/autres';

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadPath(file.fieldname);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const uniqueName = `${base}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// Accepter images ou PDF pour `idDocument`
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Fichier non supporté'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
});

module.exports = upload;
