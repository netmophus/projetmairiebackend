
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taxRoutes = require('./routes/taxRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const taxpayerRoutes = require('./routes/taxpayerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const marketRoutes = require('./routes/marketRoutes');
const receiptBatchRoutes = require('./routes/receiptBatchRoutes');
const adminStaticsRoutes = require('./routes/AdminStaticsRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const adminDashboardRoutes = require('./routes/adminDashboardRoutes'); // Import des routes adminDashboard
const reportingRoutes = require('./routes/reportingRoutes');
const smsRoutes = require('./routes/smsRoutes');

const collectorDashboardRoutes = require('./routes/collectorDashboardRoutes');
const taxpayersDashboardRoutes = require('./routes/taxpayersDashboardRoutes');
const marketTaxPaymentRoutes = require('./routes/marketTaxPaymentRoutes');
const taxpayertaxRoutes = require("./routes/taxpayertaxRoutes");

const taxAssessmentRoutes = require("./routes/taxAssessmentRoutes");
const unpaidRoutes = require("./routes/unpaidRoutes"); // ✅ Ajouté

// 📌 PLACE LE CRON ICI
const cron = require('node-cron');
const { renewTaxes } = require('./job/taxRenewalJob'); // Vérifie le chemin




dotenv.config();
require('iconv-lite').encodingExists('foo');


const app = express();
const PORT = process.env.PORT || 5000;

// 📌 1️⃣ Configuration CORS bien placée
const allowedOrigins = [  
  'https://projetmairiefrontend-3dfbbe90c62f.herokuapp.com', 
  'http://192.168.0.100:8081',  // Expo (React Native)
  'exp://192.168.0.100:8081',   // Expo DevTools  
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://192.168.0.100:5000'
];



// const allowedOrigins = [
//   'http://localhost:3000', // React local
//   'http://127.0.0.1:3000', // React en utilisant l'IP
//   'http://localhost:3001', // Si tu utilises un autre port
//   'http://127.0.0.1:3001',
//   'http://10.7.121.39:8080',  // Expo (React Native)
//   'http://10.7.121.39:8081',  // Expo (React Native)
// ];



app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 📌 2️⃣ Ajout manuel des headers CORS pour toutes les requêtes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins.includes(req.headers.origin) ? req.headers.origin : '');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }

  next();
});

// 📌 3️⃣ Activation de JSON
app.use(express.json());

// 📌 4️⃣ Logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// //📌 5️⃣ Connexion MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ Connecté à MongoDB Atlas");
//     app.listen(PORT, () => {
//       console.log(`🚀 Serveur en ligne sur le port : ${PORT}`);




//     });
//   })
//   .catch(err => {
//     console.error("❌ Erreur MongoDB :", err);
//     process.exit(1);
//   });




// 📌 5️⃣ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en ligne sur le port : ${PORT}`);

      // ✅ Lancer le CRON Job après le démarrage du serveur
      cron.schedule('* * * * *', () => {
        console.log('⏰ CRON Job exécuté pour le renouvellement des taxes.');
        renewTaxes(); // Appelle la fonction pour renouveler les taxes
      });
      console.log('⏰ CRON Job configuré pour le renouvellement des taxes.');
    });
  })
  .catch(err => {
    console.error("❌ Erreur MongoDB :", err);
    process.exit(1);
  });


// 📌 6️⃣ Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Gestion des utilisateurs
app.use('/api/taxes', taxRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/taxpayers', taxpayerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/receipt-batches', receiptBatchRoutes);
app.use('/api/admin', adminStaticsRoutes);
app.use('/api/notifications', notificationRoutes);


// Route pour la gestion du tableau de bord administrateur
app.use('/api/admin-dashboard', adminDashboardRoutes);
// Utilisation des routes pour le Dashboard du Collecteur
app.use('/api/collector-dashboard', collectorDashboardRoutes);
// 📌 Configuration des routes
app.use('/api/taxpayers-dashboard', taxpayersDashboardRoutes);


app.use('/api/market-tax-payments', marketTaxPaymentRoutes);

// Utilisation des routes
app.use("/api/reports", reportingRoutes);



// Routes
app.use('/api/sms', smsRoutes);

// Routes
app.use("/api/taxpayer-taxes", taxpayertaxRoutes);

app.use("/api/tax-assessments", taxAssessmentRoutes);


app.use("/api/unpaid-taxes", unpaidRoutes); // ✅ Nouvelle route pour les impayés

// 📌 7️⃣ Route de test API
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur l\'API de gestion des taxes.' });
});

