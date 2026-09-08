const express = require('express');
const router  = express.Router();
const {
  listerUtilisateurs,
  getUtilisateur,
  creerUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur,
  reactiverUtilisateur,
} = require('../controllers/userController');
const { proteger, admin } = require('../middleware/auth');

// Toutes ces routes sont réservées à l'administrateur
router.use(proteger, admin);

router.get('/',               listerUtilisateurs);
router.get('/:id',            getUtilisateur);
router.post('/',              creerUtilisateur);
router.put('/:id',            modifierUtilisateur);
router.delete('/:id',         supprimerUtilisateur);
router.put('/:id/reactiver',  reactiverUtilisateur);

module.exports = router;
