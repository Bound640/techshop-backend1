const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ---- Vérifier le token JWT ----------------------------------
const proteger = async (req, res, next) => {
  try {
    let token;

    // Récupérer le token depuis l'en-tête Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Veuillez vous connecter.',
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-motDePasse');
    if (!user || !user.actif) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou compte désactivé.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré.',
    });
  }
};

// ---- Vérifier le rôle admin ---------------------------------
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Accès réservé aux administrateurs.',
  });
};

// ---- Générer un token JWT -----------------------------------
const genererToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ---- Authentification optionnelle (ne bloque jamais) ---------
// Si un token valide est fourni, req.user est rempli ; sinon on
// continue simplement sans utilisateur (utile pour les formulaires
// publics qui peuvent être remplis connecté ou non).
const optionnel = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-motDePasse');
    if (user && user.actif) req.user = user;
  } catch {
    // Token invalide : on ignore simplement, la route reste accessible
  }
  next();
};

module.exports = { proteger, admin, genererToken, optionnel };

