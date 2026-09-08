const express = require('express');
const router  = express.Router();
const {
  listerProduits,
  getProduit,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  getProduitsVedettes,
  listerProduitsAdmin,
  reactiverProduit,
} = require('../controllers/productController');
const { proteger, admin } = require('../middleware/auth');

// ---- Routes publiques ---------------------------------------
router.get('/vedettes',    getProduitsVedettes);
router.get('/admin/tous',  proteger, admin, listerProduitsAdmin);
router.get('/',            listerProduits);
router.get('/:id',         getProduit);

// ---- Routes admin (authentification + rôle admin requis) ----
router.post('/',    proteger, admin, creerProduit);
router.put('/:id',  proteger, admin, modifierProduit);
router.delete('/:id', proteger, admin, supprimerProduit);
router.put('/admin/:id/reactiver', proteger, admin, reactiverProduit);

module.exports = router;

