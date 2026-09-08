const mongoose = require('mongoose');

let estConnecte = false;

const connectDB = async () => {
  try {
    console.log('🔍 MONGO_URI présente :', !!process.env.MONGO_URI);

    mongoose.connection.on('connected', () => {
      estConnecte = true;
      console.log(`✅ MongoDB connecté : ${mongoose.connection.host}`);
    });
    mongoose.connection.on('disconnected', () => {
      estConnecte = false;
      console.warn('⚠️  MongoDB déconnecté.');
    });

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
  } catch (err) {
    estConnecte = false;
    console.error('\n❌ Erreur de connexion à MongoDB :', err.message);
    console.error('   → Le serveur reste démarré, mais les requêtes vers la base de données échoueront.');
    console.error('   → Vérifie que :');
    console.error('      1. Ta connexion internet fonctionne (base hébergée sur MongoDB Atlas)');
    console.error('      2. Ton adresse IP actuelle est autorisée dans MongoDB Atlas (Network Access → Add IP Address → "Allow access from anywhere")');
    console.error('      3. Le MONGO_URI dans backend/.env est correct (utilisateur/mot de passe non expirés)');
    console.error('   → Le serveur va réessayer de se connecter automatiquement.\n');

    // Nouvelle tentative dans 5 secondes, sans jamais arrêter le processus
    setTimeout(connectDB, 5000);
  }
};

const dbEstConnectee = () => estConnecte;

module.exports = connectDB;
module.exports.dbEstConnectee = dbEstConnectee;
