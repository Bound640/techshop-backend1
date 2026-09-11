const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema(
  {
    produit:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note:        { type: Number, required: true, min: 1, max: 5 },
    commentaire: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// Un utilisateur ne peut laisser qu'un seul avis par produit
avisSchema.index({ produit: 1, utilisateur: 1 }, { unique: true });

module.exports = mongoose.model('Avis', avisSchema);
