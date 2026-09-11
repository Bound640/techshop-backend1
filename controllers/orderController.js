const Order   = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

// ---- POST /api/commandes ------------------------------------
// Créer une commande depuis le panier
const creerCommande = async (req, res, next) => {
  try {
    const { articles, adresseLivraison, modePaiement } = req.body;

    if (!articles || articles.length === 0) {
      return next(new AppError('Le panier est vide.', 400));
    }

    // Construire les lignes de commande + vérifier les stocks
    const lignes = [];
    for (const article of articles) {
      const produit = await Product.findById(article.id);

      if (!produit || !produit.actif) {
        return next(new AppError(`Produit "${article.name}" introuvable ou indisponible.`, 404));
      }
      if (produit.stock < article.quantity) {
        return next(new AppError(
          `Stock insuffisant pour "${produit.nom}" (disponible : ${produit.stock}).`, 400
        ));
      }

      lignes.push({
        produit:      produit._id,
        nomProduit:   produit.nom,
        imageProduit: produit.images[0]?.url || '',
        quantite:     article.quantity,
        prixUnitaire: produit.prixPromo || produit.prix,
      });

      // Décrémenter le stock
      produit.stock -= article.quantity;
      await produit.save();
    }

    // Créer la commande (totaux calculés par middleware Mongoose)
    const commande = await Order.create({
      utilisateur:      req.user._id,
      lignes,
      adresseLivraison,
      modePaiement:     modePaiement || 'a_la_livraison',
    });

    await commande.populate('utilisateur', 'nom prenom email');

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès.',
      commande,
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/commandes/mes-commandes ----------------------
const mesCommandes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments({ utilisateur: req.user._id });

    const commandes = await Order.find({ utilisateur: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('lignes.produit', 'nom slug images')
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      commandes,
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/commandes/:id ---------------------------------
const getCommande = async (req, res, next) => {
  try {
    const commande = await Order.findById(req.params.id)
      .populate('utilisateur', 'nom prenom email')
      .populate('lignes.produit', 'nom slug images');

    if (!commande) return next(new AppError('Commande introuvable.', 404));

    // Vérifier que la commande appartient à l'utilisateur (ou admin)
    if (
      commande.utilisateur._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Accès refusé.', 403));
    }

    res.status(200).json({ success: true, commande });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/commandes/:id/annuler ------------------------
const annulerCommande = async (req, res, next) => {
  try {
    const commande = await Order.findById(req.params.id);
    if (!commande) return next(new AppError('Commande introuvable.', 404));

    if (commande.utilisateur.toString() !== req.user._id.toString()) {
      return next(new AppError('Accès refusé.', 403));
    }

    if (['expediee', 'livree'].includes(commande.statut)) {
      return next(new AppError('Impossible d\'annuler une commande expédiée ou livrée.', 400));
    }

    // Remettre les stocks
    for (const ligne of commande.lignes) {
      await Product.findByIdAndUpdate(ligne.produit, {
        $inc: { stock: ligne.quantite },
      });
    }

    commande.statut = 'annulee';
    await commande.save();

    res.status(200).json({
      success: true,
      message: 'Commande annulée. Les stocks ont été remis à jour.',
      commande,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  ADMIN
// ============================================================

// ---- GET /api/admin/commandes  [Admin] ---------------------
const toutesLesCommandes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, statut } = req.query;
    const filtre = statut ? { statut } : {};
    const skip   = (Number(page) - 1) * Number(limit);
    const total  = await Order.countDocuments(filtre);

    const commandes = await Order.find(filtre)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('utilisateur', 'nom prenom email')
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      commandes,
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/admin/commandes/:id/statut  [Admin] ----------
const modifierStatutCommande = async (req, res, next) => {
  try {
    const { statut } = req.body;
    const statutsValides = ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'];

    if (!statutsValides.includes(statut)) {
      return next(new AppError('Statut invalide.', 400));
    }

    const commande = await Order.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    ).populate('utilisateur', 'nom prenom email');

    if (!commande) return next(new AppError('Commande introuvable.', 404));

    res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${statut}`,
      commande,
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/admin/statistiques  [Admin] ------------------
const statistiques = async (req, res, next) => {
  try {
    const [
      totalCommandes,
      totalProduits,
      totalUtilisateurs,
      revenuTotal,
      commandesParStatut,
      ventesMensuelles,
    ] = await Promise.all([
      Order.countDocuments(),
      require('../models/Product').countDocuments({ actif: true }),
      require('../models/User').countDocuments({ role: 'client' }),
      Order.aggregate([
        { $match: { statut: { $ne: 'annulee' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { statut: { $ne: 'annulee' } } },
        {
          $group: {
            _id:    { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenu: { $sum: '$total' },
            count:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCommandes,
        totalProduits,
        totalUtilisateurs,
        revenuTotal: revenuTotal[0]?.total || 0,
        commandesParStatut,
        ventesMensuelles,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  creerCommande,
  mesCommandes,
  getCommande,
  annulerCommande,
  toutesLesCommandes,
  modifierStatutCommande,
  statistiques,
};

