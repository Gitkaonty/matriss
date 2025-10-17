const express = require('express');
const router = express.Router();

const compteController = require('../../../Controllers/User/Compte/compteController');

// Récupération de toutes les comptes
router.get('/getAllComptes', compteController.getAllComptes);

// Ajout d'une compte
router.post('/addCompte', compteController.addCompte);

// Suppréssion d'une ou plusieurs compte
router.post('/deleteSelectedCompte', compteController.deleteSelectedCompte);

// Récupération abonnement
router.get('/getAllAbonnement', compteController.getAllAbonnement);

// Récupération paiement
router.get('/getAllPaiement', compteController.getAllPaiement);

// Ajout abonnement
router.post('/addAbonnement', compteController.addAbonnement);

// Ajout paiement
router.post('/addPaiement', compteController.addPaiement);

// Suppression abonnement
router.post('/deleteSelectedAbonnement', compteController.deleteSelectedAbonnement);

// Suppression paiement
router.post('/deleteSelectedPaiement', compteController.deleteSelectedPaiement);

module.exports = router;