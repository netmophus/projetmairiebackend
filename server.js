
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


dotenv.config();
require('iconv-lite').encodingExists('foo');

const app = express();
const PORT = process.env.PORT || 5000;

// 📌 1️⃣ Configuration CORS bien placée
const allowedOrigins = [
  'https://projetmairiefrontend-3dfbbe90c62f.herokuapp.com',
  'exp://192.168.0.100:8081',  
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002'
];


app.use(cors({
  origin: '*',  // 🔴 TEMPORAIRE : Autorise toutes les origines
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


// app.use(cors({
//   origin: allowedOrigins,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

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

// 📌 5️⃣ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en ligne sur le port : ${PORT}`);
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


// Utilisation des routes
app.use("/api/reports", reportingRoutes);



// Routes
app.use('/api/sms', smsRoutes);

// 📌 7️⃣ Route de test API
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur l\'API de gestion des taxes.' });
});

