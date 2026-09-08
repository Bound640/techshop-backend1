require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('../models/User');

const emailArg = process.argv[2];
const motDePasseArg = process.argv[3];

if (!emailArg || !motDePasseArg) {
  console.log('❌ Usage : node config/check-user.js "email@exemple.com" "MotDePasse"');
  process.exit(1);
}

const check = async () => {
  try {
    await connectDB();
    console.log('🔍 Recherche de l\'utilisateur :', emailArg);

    const emailNormalise = emailArg.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalise }).select('+motDePasse');

    if (!user) {
      console.log('❌ AUCUN utilisateur trouvé avec cet email exact :', emailNormalise);
      console.log('\n📋 Voici tous les emails existants dans la base :');
      const tous = await User.find({}).select('email actif role');
      tous.forEach(u => console.log(`   - "${u.email}" | actif: ${u.actif} | role: ${u.role}`));
      process.exit(0);
    }

    console.log('✅ Utilisateur trouvé :');
    console.log('   - Email en base :', `"${user.email}"`);
    console.log('   - Actif :', user.actif);
    console.log('   - Rôle :', user.role);
    console.log('   - Hash motDePasse en base :', user.motDePasse);

    const valide = await user.comparerMotDePasse(motDePasseArg);
    console.log('\n🔑 Test du mot de passe fourni : "' + motDePasseArg + '"');
    console.log(valide ? '✅ MOT DE PASSE CORRECT' : '❌ MOT DE PASSE INCORRECT (ne correspond pas au hash en base)');

    if (!user.actif) {
      console.log('\n⚠️  ATTENTION : ce compte a "actif: false" — c\'est peut-être la vraie cause du blocage même avec le bon mot de passe.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
};

check();

