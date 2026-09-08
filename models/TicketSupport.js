const mongoose = require('mongoose');

const ticketSupportSchema = new mongoose.Schema(
  {
    // ---- Coordonnées -------------------------------------------
    email:      { type: String, required: [true, "L'email est requis"], trim: true, lowercase: true },
    prenom:     { type: String, required: [true, 'Le prénom est requis'], trim: true },
    nom:        { type: String, required: [true, 'Le nom de famille est requis'], trim: true },
    titre:      { type: String, required: [true, 'Le titre est requis'], enum: ['Monsieur', 'Mlle'] },
    pays:       { type: String, required: [true, 'Le pays est requis'] },
    ville:      { type: String, required: [true, 'La ville est requise'], trim: true },
    telephone:  { type: String, required: [true, 'Le numéro de contact est requis'], trim: true },
    adresse:    { type: String, required: [true, "L'adresse est requise"], trim: true },

    // ---- Détails de la demande -----------------------------------
    categorie: {
      type: String,
      required: [true, 'La catégorie est requise'],
      enum: [
        'Promotion : Pack de jeux et pack matériel',
        'Enregistrement des produits',
        "Problème d'achat",
        'Garantie et service de réparation',
        'Support technique',
        'Programme de récompenses',
        'Application mobile',
      ],
    },
    nomProduit:   { type: String, required: [true, 'Le nom du produit est requis'], trim: true },
    nomModele:    { type: String, required: [true, 'Le nom du modèle est requis'], trim: true },
    numeroSerie:  { type: String, required: [true, 'Le numéro de série est requis'], trim: true },
    sujet:        { type: String, required: [true, 'Le sujet est requis'], trim: true },
    questions:    { type: String, required: [true, 'Les questions/détails sont requis'], trim: true },

    // ---- Pièce jointe -----------------------------------------
    fichier: {
      nomOriginal: { type: String, default: null },
      cheminFichier: { type: String, default: null },
      taille: { type: Number, default: null },
    },

    // ---- Suivi (usage interne / admin) ----------------------------
    statut: {
      type: String,
      enum: ['nouveau', 'en_cours', 'resolu', 'ferme'],
      default: 'nouveau',
    },
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TicketSupport', ticketSupportSchema);
