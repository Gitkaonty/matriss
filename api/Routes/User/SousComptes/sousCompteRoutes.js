const express = require('express');
const router = express.Router();

const sousCompteController = require('../../../Controllers/User/SousCompte/sousCompteController');

// Récupération de toutes les sous-comptes
router.get('/getAllSousComptes', sousCompteController.getAllSousComptes);

// Récupération de toutes les sous-comptes filtrés par les comptes
router.post('/getAllSousComptesByIdCompte', sousCompteController.getAllSousComptesByIdCompte);

// Ajout d'une sous-comptes
router.post('/addSousCompte', sousCompteController.addSousCompte);

// Suppréssion d'une ou plusieurs sous-compte
router.post('/deleteSelectedSousCompte', sousCompteController.deleteSelectedSousCompte);

// Vérification du mot de passe du sous-compte
router.post('/matchPassword/:id', sousCompteController.matchPassword);

// Envoye du code de validation
router.post('/sendCodeToEmail', sousCompteController.sendCodeToEmail);

// Modification du mot de passe
router.put('/updatePassword/:id', sousCompteController.updatePassword);

// Router pour le mot de passe oublié

// Vérification du mot de passe
router.post('/verifyEmail', sousCompteController.verifyEmail);

// Vérification de l'expiration du token
router.post('/verifyResetToken', sousCompteController.verifyResetToken);

// Modification du mot de passe oublié
router.put('/updateForgotPassword/:id', sousCompteController.updateForgotPassword);

// Récupération des permissions de l'utilisateur
router.post('/getUserPermissions', sousCompteController.getUserPermissions);

// Modification de permission
router.post('/updateUserPermission', sousCompteController.updateUserPermission);

// Récupération des permissions
router.get('/getAllRoles', sousCompteController.getAllRoles);

// Modification rôle 
router.post('/updateUserRole', sousCompteController.updateUserRole);

module.exports = router;