const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const TicketSupport = require('../models/TicketSupport');
const { AppError } = require('../middleware/errorHandler');

// ---- Configuration Multer (upload de fichier) -----------------
const dossierUploads = path.join(__dirname, '..', 'uploads', 'support');
if (!fs.existsSync(dossierUploads)) {
  fs.mkdirSync(dossierUploads, { recursive: true });
}

const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dossierUploads),
  filename: (req, file, cb) => {
    const suffixe = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${suffixe}${path.extname(file.originalname)}`);
  },
});

const EXTENSIONS_AUTORISEES = ['.gif', '.jpg', '.jpeg', '.png', '.zip', '.txt'];

const filtreFichier = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (EXTENSIONS_AUTORISEES.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Format de fichier non supporté. Formats acceptés : gif, jpg, png, zip, txt.', 400), false);
  }
};

const upload = multer({
  storage: stockage,
  fileFilter: filtreFichier,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 Mo max
});

// Middleware exporté pour la route (champ "fichier" optionnel)
const uploadFichierUnique = upload.single('fichier');

// ---- POST /api/support  [Public] ------------------------------
const creerTicket = async (req, res, next) => {
  try {
    const {
      email, prenom, nom, titre, pays, ville, telephone, adresse,
      categorie, nomProduit, nomModele, numeroSerie, sujet, questions,
    } = req.body;

    const ticket = await TicketSupport.create({
      email, prenom, nom, titre, pays, ville, telephone, adresse,
      categorie, nomProduit, nomModele, numeroSerie, sujet, questions,
      utilisateur: req.user?._id || null,
      fichier: req.file ? {
        nomOriginal: req.file.originalname,
        cheminFichier: `/uploads/support/${req.file.filename}`,
        taille: req.file.size,
      } : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Votre demande a bien été envoyée. Nous vous répondrons dans les plus brefs délais.',
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/support  [Admin] --------------------------------
const listerTickets = async (req, res, next) => {
  try {
    const { statut } = req.query;
    const filtre = statut ? { statut } : {};
    const tickets = await TicketSupport.find(filtre).sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: tickets.length, tickets });
  } catch (err) {
    next(err);
  }
};

// ---- PUT /api/support/:id/statut  [Admin] ----------------------
const modifierStatutTicket = async (req, res, next) => {
  try {
    const { statut } = req.body;
    const ticket = await TicketSupport.findByIdAndUpdate(req.params.id, { statut }, { new: true });
    if (!ticket) return next(new AppError('Demande introuvable.', 404));
    res.status(200).json({ success: true, message: 'Statut mis à jour.', ticket });
  } catch (err) {
    next(err);
  }
};

module.exports = { creerTicket, listerTickets, modifierStatutTicket, uploadFichierUnique };
