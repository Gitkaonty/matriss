const express = require('express');
const router = express.Router();

const compteController = require('../../../Controllers/User/Compte/compteController');

// Récupération de toutes les comptes
router.get('/getAllComptes', compteController.getAllComptes);

// Ajout d'une compte
router.post('/addCompte', compteController.addCompte);

// Suppréssion d'une ou plusieurs compte
router.post('/deleteSelectedCompte', compteController.deleteSelectedCompte);

module.exports = router;