const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      minlength: [2, 'Le nom doit faire au moins 2 caractères'],
      maxlength: [60, 'Le nom ne peut dépasser 60 caractères'],
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
      minlength: [2, 'Le prénom doit faire au moins 2 caractères'],
      maxlength: [60, 'Le prénom ne peut dépasser 60 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email invalide'],
    },
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [8, 'Le mot de passe doit faire au moins 8 caractères'],
      select: false, // jamais renvoyé par défaut
    },
    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
    adresse: {
      rue:    { type: String, default: '' },
      ville:  { type: String, default: '' },
      codePostal: { type: String, default: '' },
      pays:   { type: String, default: 'Sénégal' },
    },
    telephone: { type: String, default: '' },
    actif:     { type: Boolean, default: true },
    favoris: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product',
  default: [],
}],
    resetPasswordToken:  { type: String, select: false },
    resetPasswordExpire: { type: Date,   select: false },
  },
  {
    timestamps: true, // createdAt, updatedAt automatiques
  }
);

// ---- Middleware : hacher le mot de passe avant sauvegarde ----
userSchema.pre('save', async function (next) {
  // Seulement si le mot de passe a été modifié
  if (!this.isModified('motDePasse')) return next();
  const salt = await bcrypt.genSalt(12);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

// ---- Méthode : comparer le mot de passe ----------------------
userSchema.methods.comparerMotDePasse = async function (candidat) {
  return bcrypt.compare(candidat, this.motDePasse);
};

// ---- Méthode : retourner le profil public --------------------
userSchema.methods.toPublicJSON = function () {
  return {
    id:        this._id,
    nom:       this.nom,
    prenom:    this.prenom,
    email:     this.email,
    role:      this.role,
    adresse:   this.adresse,
    telephone: this.telephone,
    favoris: this.favoris || [],
    createdAt: this.createdAt,
  };
};

// ---- Méthode : générer un token de réinitialisation -----------
userSchema.methods.genererTokenReset = function () {
  const tokenBrut = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(tokenBrut).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return tokenBrut; // le token brut est envoyé au client, seul le hash est stocké
};

module.exports = mongoose.model('User', userSchema);

