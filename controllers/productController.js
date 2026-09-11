const Product   = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

// ---- GET /api/produits --------------------------------------
// Filtrage, recherche, tri, pagination
const listerProduits = async (req, res, next) => {
  try {
    const {
      categorie, search, sortBy = 'createdAt', order = 'desc',
      page = 1, limit = 12, vedette, badge, minPrix, maxPrix, marque,
    } = req.query;

    const filtre = { actif: true };

    if (categorie) filtre.categorie = categorie;
    if (vedette)   filtre.vedette   = vedette === 'true';
    if (badge)     filtre.badge     = badge;
    if (marque)    filtre.marque    = marque;
    if (minPrix || maxPrix) {
      filtre.prix = {};
      if (minPrix) filtre.prix.$gte = Number(minPrix);
      if (maxPrix) filtre.prix.$lte = Number(maxPrix);
    }

    // Recherche full-text
    if (search) {
      filtre.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filtre);

    const produits = await Product.find(filtre)
      .populate('categorie', 'nom slug icone')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      count:   produits.length,
      produits,
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/produits/:id ----------------------------------
const getProduit = async (req, res, next) => {
  try {
    const produit = await Product.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      actif: true,
    }).populate('categorie', 'nom slug icone');

    if (!produit) {
      return next(new AppError('Produit introuvable.', 404));
    }

    // Produits similaires (même catégorie, hors ce produit)
    const similaires = await Product.find({
      categorie: produit.categorie._id,
      _id:       { $ne: produit._id },
      actif:     true,
    })
      .limit(4)
      .select('nom slug images prix note badge')
      .lean();

    res.status(200).json({
      success: true,
      produit,
      similaires,
    });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/produits  [Admin] ----------------------------
const creerProduit = async (req, res, next) => {
  try {
    const produit = await Product.create(req.body);
    await produit.populate('categorie', 'nom slug');

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      produit,
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/produits/:id  [Admin] ------------------------
const modifierProduit = async (req, res, next) => {
  try {
    const produit = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categorie', 'nom slug');

    if (!produit) return next(new AppError('Produit introuvable.', 404));

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour.',
      produit,
    });
  } catch (err) {
    next(err);
  }
};

// ---- DELETE /api/produits/:id  [Admin] ----------------------
const supprimerProduit = async (req, res, next) => {
  try {
    const produit = await Product.findById(req.params.id);
    if (!produit) return next(new AppError('Produit introuvable.', 404));

    // Suppression logique (actif = false)
    produit.actif = false;
    await produit.save();

    res.status(200).json({
      success: true,
      message: 'Produit supprimé (désactivé).',
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/produits/vedettes ----------------------------
const getProduitsVedettes = async (req, res, next) => {
  try {
    const produits = await Product.find({ actif: true, vedette: true })
      .populate('categorie', 'nom slug')
      .limit(8)
      .lean();

    res.status(200).json({ success: true, produits });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/produits/admin/tous  [Admin] --------------------
// Comme listerProduits mais sans filtrer les produits désactivés,
// pour que l'admin puisse les retrouver et les réactiver.
const listerProduitsAdmin = async (req, res, next) => {
  try {
    const produits = await Product.find({})
      .populate('categorie', 'nom slug icone')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, total: produits.length, produits });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/produits/admin/:id/reactiver  [Admin] -----------
const reactiverProduit = async (req, res, next) => {
  try {
    const produit = await Product.findByIdAndUpdate(req.params.id, { actif: true }, { new: true });
    if (!produit) return next(new AppError('Produit introuvable.', 404));

    res.status(200).json({ success: true, message: 'Produit réactivé.', produit });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/produits/marques  [Public] -----------------------
const listerMarques = async (req, res, next) => {
  try {
    const marques = await Product.distinct('marque', { actif: true, marque: { $ne: '' } });
    res.status(200).json({ success: true, marques: marques.sort() });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listerProduits,
  getProduit,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  getProduitsVedettes,
  listerProduitsAdmin,
  reactiverProduit,
  listerMarques,
};

