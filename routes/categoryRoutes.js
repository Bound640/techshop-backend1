const express = require('express');
const router  = express.Router();
const {
  listerCategories,
  getCategorie,
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
  listerCategoriesAdmin,
  reactiverCategorie,
} = require('../controllers/categoryController');
const { proteger, admin } = require('../middleware/auth');

// Routes publiques
router.get('/admin/toutes', proteger, admin, listerCategoriesAdmin);
router.get('/',        listerCategories);
router.get('/:slug',   getCategorie);

// Routes admin
router.post('/',       proteger, admin, creerCategorie);
router.put('/:id',     proteger, admin, modifierCategorie);
router.delete('/:id',  proteger, admin, supprimerCategorie);
router.put('/admin/:id/reactiver', proteger, admin, reactiverCategorie);

module.exports = router;

