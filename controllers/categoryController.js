const Category  = require('../models/Category');
const Product   = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

// ---- GET /api/categories -----------------------------------
const listerCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ actif: true })
      .sort({ ordre: 1, nom: 1 })
      .lean();

    // Ajouter le nombre de produits par catégorie
    const avecCompte = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        nombreProduits: await Product.countDocuments({ categorie: cat._id, actif: true }),
      }))
    );

    res.status(200).json({ success: true, categories: avecCompte });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/categories/:slug -----------------------------
const getCategorie = async (req, res, next) => {
  try {
    const categorie = await Category.findOne({ slug: req.params.slug, actif: true });
    if (!categorie) return next(new AppError('Catégorie introuvable.', 404));

    res.status(200).json({ success: true, categorie });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/admin/categories  [Admin] -------------------
const creerCategorie = async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Catégorie créée.', categorie: cat });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/admin/categories/:id  [Admin] ----------------
const modifierCategorie = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!cat) return next(new AppError('Catégorie introuvable.', 404));
    res.status(200).json({ success: true, message: 'Catégorie mise à jour.', categorie: cat });
  } catch (err) {
    next(err);
  }
};

// ---- DELETE /api/admin/categories/:id  [Admin] -------------
const supprimerCategorie = async (req, res, next) => {
  try {
    const nbProduits = await Product.countDocuments({ categorie: req.params.id, actif: true });
    if (nbProduits > 0) {
      return next(new AppError(
        `Impossible de supprimer : ${nbProduits} produit(s) actif(s) dans cette catégorie.`, 400
      ));
    }
    const cat = await Category.findByIdAndUpdate(req.params.id, { actif: false }, { new: true });
    if (!cat) return next(new AppError('Catégorie introuvable.', 404));
    res.status(200).json({ success: true, message: 'Catégorie supprimée.' });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/categories/admin/toutes  [Admin] -----------------
const listerCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ ordre: 1, nom: 1 }).lean();
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/categories/admin/:id/reactiver  [Admin] -----------
const reactiverCategorie = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, { actif: true }, { new: true });
    if (!cat) return next(new AppError('Catégorie introuvable.', 404));
    res.status(200).json({ success: true, message: 'Catégorie réactivée.', categorie: cat });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listerCategories,
  getCategorie,
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
  listerCategoriesAdmin,
  reactiverCategorie,
};

