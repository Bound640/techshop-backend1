const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: { type: String, default: '' },
    icone:       { type: String, default: '📦' },
    image:       { type: String, default: '' },
    actif:       { type: Boolean, default: true },
    ordre:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Générer le slug automatiquement depuis le nom
categorySchema.pre('save', function (next) {
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

module.exports = mongoose.model('Category', categorySchema);

