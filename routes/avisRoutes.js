const express = require('express');
const router  = express.Router();
const { listerAvisProduit, ajouterAvis, supprimerAvis } = require('../controllers/avisController');
const { proteger } = require('../middleware/auth');

router.get('/produit/:produitId',  listerAvisProduit);
router.post('/produit/:produitId', proteger, ajouterAvis);
router.delete('/:id',              proteger, supprimerAvis);

module.exports = router;
