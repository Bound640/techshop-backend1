const Avis    = require('../models/Avis');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

// ---- Recalcule la note moyenne et le nombre d'avis d'un produit ----
const recalculerNoteProduit = async (produitId) => {
  const avis = await Avis.find({ produit: produitId });
  const nombreAvis = avis.length;
  const note = nombreAvis === 0
    ? 0
    : Math.round((avis.reduce((s, a) => s + a.note, 0) / nombreAvis) * 10) / 10;

  await Product.findByIdAndUpdate(produitId, { note, nombreAvis });
};

// ---- GET /api/avis/produit/:produitId  [Public] ----------------
const listerAvisProduit = async (req, res, next) => {
  try {
    const avis = await Avis.find({ produit: req.params.produitId })
      .populate('utilisateur', 'nom prenom')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: avis.length, avis });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/avis/produit/:produitId  [Connecté] --------------
const ajouterAvis = async (req, res, next) => {
  try {
    const { note, commentaire } = req.body;
    if (!note || note < 1 || note > 5) {
      return next(new AppError('La note doit être comprise entre 1 et 5.', 400));
    }
    if (!commentaire?.trim()) {
      return next(new AppError('Le commentaire est requis.', 400));
    }

    const produit = await Product.findById(req.params.produitId);
    if (!produit) return next(new AppError('Produit introuvable.', 404));

    const dejaAvis = await Avis.findOne({ produit: req.params.produitId, utilisateur: req.user._id });
    if (dejaAvis) {
      return next(new AppError('Vous avez déjà laissé un avis pour ce produit.', 400));
    }

    const avis = await Avis.create({
      produit: req.params.produitId,
      utilisateur: req.user._id,
      note,
      commentaire: commentaire.trim(),
    });
    await recalculerNoteProduit(req.params.produitId);

    const avisPopule = await avis.populate('utilisateur', 'nom prenom');

    res.status(201).json({ success: true, message: 'Avis ajouté, merci !', avis: avisPopule });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('Vous avez déjà laissé un avis pour ce produit.', 400));
    }
    next(err);
  }
};

// ---- DELETE /api/avis/:id  [Propriétaire ou Admin] ---------------
const supprimerAvis = async (req, res, next) => {
  try {
    const avis = await Avis.findById(req.params.id);
    if (!avis) return next(new AppError('Avis introuvable.', 404));

    if (String(avis.utilisateur) !== String(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Action non autorisée.', 403));
    }

    const produitId = avis.produit;
    await avis.deleteOne();
    await recalculerNoteProduit(produitId);

    res.status(200).json({ success: true, message: 'Avis supprimé.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listerAvisProduit, ajouterAvis, supprimerAvis };
