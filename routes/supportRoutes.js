const express = require('express');
const router  = express.Router();
const {
  creerTicket,
  listerTickets,
  modifierStatutTicket,
  uploadFichierUnique,
} = require('../controllers/supportController');
const { proteger, admin, optionnel } = require('../middleware/auth');

// Route publique — pas besoin d'être connecté pour contacter le support,
// mais si l'utilisateur est connecté, on rattache la demande à son compte
router.post('/', optionnel, uploadFichierUnique, creerTicket);

// Routes admin
router.get('/',            proteger, admin, listerTickets);
router.put('/:id/statut',  proteger, admin, modifierStatutTicket);

module.exports = router;
