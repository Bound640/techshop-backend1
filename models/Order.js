const mongoose = require('mongoose');

const ligneCommandeSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  nomProduit:  { type: String, required: true }, // copie au moment de la commande
  imageProduit:{ type: String, default: '' },
  quantite:    { type: Number, required: true, min: 1 },
  prixUnitaire:{ type: Number, required: true }, // prix figé au moment de la commande
});

// Calcul du sous-total d'une ligne
ligneCommandeSchema.virtual('sousTotal').get(function () {
  return this.quantite * this.prixUnitaire;
});

const orderSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      unique: true,
    },
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lignes: {
      type: [ligneCommandeSchema],
      required: true,
      validate: {
        validator: v => v.length > 0,
        message: 'La commande doit contenir au moins un produit',
      },
    },
    adresseLivraison: {
      nom:        { type: String, required: true },
      email:      { type: String, required: true },
      rue:        { type: String, required: true },
      ville:      { type: String, required: true },
      codePostal: { type: String, default: '' },
      pays:       { type: String, default: 'Sénégal' },
    },
    statut: {
      type: String,
      enum: ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'],
      default: 'en_attente',
    },
    sousTotal:      { type: Number, required: true },
    tva:            { type: Number, required: true },
    fraisLivraison: { type: Number, default: 0 },
    total:          { type: Number, required: true },
    modePaiement: {
      type: String,
      enum: ['carte', 'wave', 'orange_money', 'a_la_livraison'],
      default: 'a_la_livraison',
    },
    statutPaiement: {
      type: String,
      enum: ['en_attente', 'paye', 'rembourse'],
      default: 'en_attente',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// ---- Générer un numéro de commande unique --------------------
orderSchema.pre('save', async function (next) {
  if (!this.numero) {
    const count  = await mongoose.model('Order').countDocuments();
    const date   = new Date();
    const annee  = date.getFullYear();
    const mois   = String(date.getMonth() + 1).padStart(2, '0');
    this.numero  = `TS-${annee}${mois}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// ---- Calcul automatique du total ----------------------------
orderSchema.pre('validate', function (next) {
  this.sousTotal = this.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  this.tva       = Math.round(this.sousTotal * 0.18);
  this.fraisLivraison = this.sousTotal >= 30000 ? 0 : 2500;
  this.total     = this.sousTotal + this.tva + this.fraisLivraison;
  next();
});

module.exports = mongoose.model('Order', orderSchema);

