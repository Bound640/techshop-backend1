const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
      maxlength: [150, 'Le nom ne peut dépasser 150 caractères'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      maxlength: [2000, 'La description ne peut dépasser 2000 caractères'],
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    prixPromo: {
      type: Number,
      default: null,
    },
    marque: {
      type: String,
      trim: true,
      default: '',
    },
    stock: {
      type: Number,
      required: [true, 'Le stock est requis'],
      min: [0, 'Le stock ne peut pas être négatif'],
      default: 0,
    },
    images: [
      {
        url:       { type: String, required: true },
        alt:       { type: String, default: '' },
        principale:{ type: Boolean, default: false },
      },
    ],
    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La catégorie est requise'],
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    badge: {
      type: String,
      enum: ['Nouveau', 'Best-seller', 'Top rated', 'Pro', null],
      default: null,
    },
    note: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    nombreAvis: {
      type: Number,
      default: 0,
    },
    actif: {
      type: Boolean,
      default: true,
    },
    vedette: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ---- Index de recherche full-text ----------------------------
productSchema.index({ nom: 'text', description: 'text' });

// ---- Générer le slug depuis le nom ---------------------------

  productSchema.pre('validate', function (next) {
  if (this.isModified('nom')) {
    this.slug = this.nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  next();
});

// ---- Virtuel : image principale ------------------------------
productSchema.virtual('imagePrincipale').get(function () {
  const img = this.images.find(i => i.principale);
  return img ? img.url : (this.images[0]?.url || '');
});

module.exports = mongoose.model('Product', productSchema);

