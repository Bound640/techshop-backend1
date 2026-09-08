const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ---- GET /api/utilisateurs  [Admin] ---------------------------
const listerUtilisateurs = async (req, res, next) => {
  try {
    const { recherche, role } = req.query;
    const filtre = {};

    if (role) filtre.role = role;
    if (recherche) {
      filtre.$or = [
        { nom:    { $regex: recherche, $options: 'i' } },
        { prenom: { $regex: recherche, $options: 'i' } },
        { email:  { $regex: recherche, $options: 'i' } },
      ];
    }

    const utilisateurs = await User.find(filtre).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: utilisateurs.length,
      utilisateurs: utilisateurs.map(u => u.toPublicJSON()).map((u, i) => ({
        ...u,
        actif: utilisateurs[i].actif,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/utilisateurs/:id  [Admin] -----------------------
const getUtilisateur = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Utilisateur introuvable.', 404));

    res.status(200).json({
      success: true,
      utilisateur: { ...user.toPublicJSON(), actif: user.actif },
    });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/utilisateurs  [Admin] ---------------------------
const creerUtilisateur = async (req, res, next) => {
  try {
    const { nom, prenom, email, motDePasse, role, telephone } = req.body;

    const existe = await User.findOne({ email: email?.toLowerCase().trim() });
    if (existe) {
      return next(new AppError('Cet email est déjà associé à un compte.', 400));
    }

    const user = await User.create({
      nom, prenom, email, motDePasse, telephone,
      role: role === 'admin' ? 'admin' : 'client',
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé.',
      utilisateur: { ...user.toPublicJSON(), actif: user.actif },
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/utilisateurs/:id  [Admin] -------------------------
const modifierUtilisateur = async (req, res, next) => {
  try {
    const { nom, prenom, email, role, telephone, actif } = req.body;

    if (String(req.params.id) === String(req.user._id) && role && role !== 'admin') {
      return next(new AppError('Vous ne pouvez pas retirer votre propre rôle administrateur.', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nom, prenom, email, role, telephone, actif },
      { new: true, runValidators: true }
    );
    if (!user) return next(new AppError('Utilisateur introuvable.', 404));

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour.',
      utilisateur: { ...user.toPublicJSON(), actif: user.actif },
    });
  } catch (err) {
    next(err);
  }
};

// ---- DELETE /api/utilisateurs/:id  [Admin] -----------------------
// Suppression douce : on désactive le compte plutôt que de l'effacer,
// pour conserver l'intégrité des commandes déjà passées.
const supprimerUtilisateur = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return next(new AppError('Vous ne pouvez pas supprimer votre propre compte.', 400));
    }

    const user = await User.findByIdAndUpdate(req.params.id, { actif: false }, { new: true });
    if (!user) return next(new AppError('Utilisateur introuvable.', 404));

    res.status(200).json({ success: true, message: 'Utilisateur désactivé.' });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/utilisateurs/:id/reactiver  [Admin] -----------------
const reactiverUtilisateur = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { actif: true }, { new: true });
    if (!user) return next(new AppError('Utilisateur introuvable.', 404));

    res.status(200).json({ success: true, message: 'Utilisateur réactivé.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listerUtilisateurs,
  getUtilisateur,
  creerUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur,
  reactiverUtilisateur,
};
