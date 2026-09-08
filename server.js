require('dotenv').config();
const express     = require('express');
const path        = require('path');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const connectDB        = require('./config/db');
const { dbEstConnectee } = connectDB;
const { errorHandler } = require('./middleware/errorHandler');

// ---- Routes -------------------------------------------------
const authRoutes     = require('./routes/authRoutes');
const productRoutes  = require('./routes/productRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes     = require('./routes/userRoutes');
const supportRoutes  = require('./routes/supportRoutes');

// ---- Initialisation -----------------------------------------
const app = express();
connectDB();

// ============================================================
//  MIDDLEWARES GLOBAUX
// ============================================================

// Sécurité HTTP headers
app.use(helmet());

// CORS — autoriser le front-end React (localhost, tous ports en dev)
app.use(cors({
  origin: function (origin, callback) {
    // Pas d'origine (ex: Postman, curl) → autorisé
    if (!origin) return callback(null, true);

    const autorise =
      /^http:\/\/localhost:\d+$/.test(origin) ||      // tout port localhost
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||    // tout port 127.0.0.1
      origin === 'https://techshop-frontend1-mocha.vercel.app';   // production

    if (autorise) {
      callback(null, true);
    } else {
      callback(new Error(`Origine non autorisée par CORS : ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Limite de requêtes (100 req / 15 min par IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: 'Trop de requêtes, réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api/', limiter);

// Parser JSON + URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logs des requêtes HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================================
//  ROUTES API
// ============================================================

// Fichiers uploadés (pièces jointes du formulaire de support)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Garde-fou : base de données indisponible ----------------
// Évite que les requêtes /api/* restent bloquées indéfiniment
// (et donc un "Failed to fetch" côté navigateur) quand MongoDB
// n'est pas joignable — renvoie une erreur claire à la place.
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (!dbEstConnectee()) {
    return res.status(503).json({
      success: false,
      message: 'Base de données indisponible pour le moment. Le serveur réessaie de se reconnecter automatiquement — réessayez dans quelques secondes.',
    });
  }
  next();
});

app.use('/api/auth',         authRoutes);
app.use('/api/produits',     productRoutes);
app.use('/api/commandes',    orderRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/utilisateurs', userRoutes);
app.use('/api/support',      supportRoutes);

// ---- Route de santé (health check) -------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API TechShop opérationnelle 🚀',
    version: '1.0.0',
    env:     process.env.NODE_ENV,
    baseDeDonnees: dbEstConnectee() ? 'connectée' : 'déconnectée',
    date:    new Date().toISOString(),
  });
});

// ---- Route inconnue -----------------------------------------
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route "${req.method} ${req.originalUrl}" introuvable.`,
  });
});

// ---- Gestion centralisée des erreurs -----------------------
app.use(errorHandler);

// ============================================================
//  DÉMARRAGE
// ============================================================

const PORT = process.env.PORT || 3000;

  app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Serveur TechShop démarré sur http://localhost:${PORT}`);
  console.log(`📋 Environnement : ${process.env.NODE_ENV}`);
  console.log(`🔗 API Health    : http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS          : tous les ports localhost autorisés en développement\n`);
});

// Empêcher le serveur de crasher silencieusement sur une erreur non gérée
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée (Promise) :', err.message);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée :', err.message);
});

module.exports = app;
