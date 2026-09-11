const crypto       = require('crypto');
const User        = require('../models/User');
const { genererToken } = require('../middleware/auth');
const { AppError }    = require('../middleware/errorHandler');

// ---- POST /api/auth/inscription -----------------------------
const inscription = async (req, res, next) => {
  try {
    const { nom, prenom, email, motDePasse } = req.body;

    // Vérifier si l'email existe déjà
    const existe = await User.findOne({ email: email.toLowerCase().trim() });
    if (existe) {
      return next(new AppError('Cet email est déjà associé à un compte.', 400));
    }

    // Créer l'utilisateur (hachage géré par le middleware Mongoose)
    const user = await User.create({ nom, prenom, email, motDePasse });

    const token = genererToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/auth/connexion -------------------------------
const connexion = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return next(new AppError('Email et mot de passe requis.', 400));
    }

    // Récupérer l'utilisateur avec le mot de passe (select: false par défaut)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+motDePasse');

    if (!user || !user.actif) {
      return next(new AppError('Identifiants invalides.', 401));
    }

    const valide = await user.comparerMotDePasse(motDePasse);
    if (!valide) {
      return next(new AppError('Identifiants invalides.', 401));
    }

    const token = genererToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/auth/moi -------------------------------------
const moi = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('Utilisateur introuvable.', 404));

    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/auth/profil ----------------------------------
const mettreAJourProfil = async (req, res, next) => {
  try {
    const { nom, prenom, telephone, adresse } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nom, prenom, telephone, adresse },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour.',
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/auth/changer-mot-de-passe -------------------
const changerMotDePasse = async (req, res, next) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    const user = await User.findById(req.user._id).select('+motDePasse');
    const valide = await user.comparerMotDePasse(ancienMotDePasse);

    if (!valide) {
      return next(new AppError('Ancien mot de passe incorrect.', 400));
    }

    user.motDePasse = nouveauMotDePasse;
    await user.save();

    const token = genererToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès.',
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/auth/mot-de-passe-oublie ----------------------
const motDePasseOublie = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Email requis.', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Réponse volontairement identique que l'utilisateur existe ou non
    // (on ne révèle jamais si un email est enregistré, par sécurité)
    const reponseGenerique = {
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été généré.',
    };

    if (!user) {
      return res.status(200).json(reponseGenerique);
    }

    const tokenBrut = user.genererTokenReset();
    await user.save({ validateBeforeSave: false });

    const lienReset = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reinitialiser-mot-de-passe/${tokenBrut}`;

    // Pas de service d'email configuré pour la soutenance : on affiche
    // le lien côté serveur (console) et on le renvoie aussi en dev
    // pour pouvoir tester la démo sans boîte mail réelle.
    console.log('\n📧 Lien de réinitialisation du mot de passe :');
    console.log('   ' + lienReset + '\n');

    res.status(200).json({
      ...reponseGenerique,
      ...(process.env.NODE_ENV === 'development' && { lienDev: lienReset }),
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/auth/reinitialiser-mot-de-passe/:token ---------
const reinitialiserMotDePasse = async (req, res, next) => {
  try {
    const { nouveauMotDePasse } = req.body;
    if (!nouveauMotDePasse || nouveauMotDePasse.length < 8) {
      return next(new AppError('Le nouveau mot de passe doit faire au moins 8 caractères.', 400));
    }

    const tokenHache = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: tokenHache,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+motDePasse +resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return next(new AppError('Lien de réinitialisation invalide ou expiré.', 400));
    }

    user.motDePasse = nouveauMotDePasse;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = genererToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/auth/favoris/:produitId  [Connecté] ------------
// Ajoute ou retire un produit des favoris (bascule)
const basculerFavori = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { produitId } = req.params;

    const index = user.favoris.findIndex((id) => String(id) === produitId);
    let estFavori;
    if (index === -1) {
      user.favoris.push(produitId);
      estFavori = true;
    } else {
      user.favoris.splice(index, 1);
      estFavori = false;
    }
    await user.save();

    res.status(200).json({
      success: true,
      estFavori,
      message: estFavori ? 'Ajouté aux favoris.' : 'Retiré des favoris.',
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/auth/favoris  [Connecté] --------------------------
const listerFavoris = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favoris',
      populate: { path: 'categorie', select: 'nom slug icone' },
    });
    res.status(200).json({ success: true, favoris: user.favoris });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  inscription, connexion, moi, mettreAJourProfil, changerMotDePasse,
  motDePasseOublie, reinitialiserMotDePasse,
  basculerFavori, listerFavoris,
};

