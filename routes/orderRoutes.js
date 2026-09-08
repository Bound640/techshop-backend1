const express = require('express');
const router  = express.Router();
const {
  creerCommande,
  mesCommandes,
  getCommande,
  annulerCommande,
  toutesLesCommandes,
  modifierStatutCommande,
  statistiques,
} = require('../controllers/orderController');
const { proteger, admin } = require('../middleware/auth');

// ---- Routes client (connecté) --------------------------------
router.post('/',                    proteger, creerCommande);
router.get('/mes-commandes',        proteger, mesCommandes);
router.get('/:id',                  proteger, getCommande);
router.put('/:id/annuler',          proteger, annulerCommande);

// ---- Routes admin -------------------------------------------
router.get('/admin/toutes',         proteger, admin, toutesLesCommandes);
router.put('/admin/:id/statut',     proteger, admin, modifierStatutCommande);
router.get('/admin/statistiques',   proteger, admin, statistiques);

module.exports = router;

