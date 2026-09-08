const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Erreur interne du serveur';

  // Erreur Mongoose : ID invalide
  if (err.name === 'CastError') {
    statusCode = 404;
    message    = 'Ressource introuvable';
  }

  // Erreur Mongoose : valeur dupliquée (unique)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message    = `La valeur du champ "${field}" est déjà utilisée.`;
  }

  // Erreur Mongoose : validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors).map(e => e.message).join('. ');
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Token invalide';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token expiré. Veuillez vous reconnecter.';
  }

  // Log en mode développement
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] ❌ ${statusCode} ${message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Helper pour créer des erreurs avec statusCode
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };

