const express = require('express');
const router = express.Router();

const consolidationController = require('../../../Controllers/Parametres/Consolidation/paramConsolidationController');

const verifyJWT = require('../../../Middlewares/verifyJWT');
const verifyPermission = require('../../../Middlewares/verifyPermission');

// Récupération consolidation par dossier
router.get('/getListeConsolidationDossier/:id_compte/:id_dossier', consolidationController.getListeConsolidationDossier);

// Ajout ou suppression consolidation par dossier
router.post('/addOrUpdateConsolidationDossier', verifyJWT, verifyPermission('ADD', 'EDIT'), consolidationController.addOrUpdateConsolidationDossier);

// Suppression d'une consolidation de dossier
router.delete('/deleteConsolidation/:id', verifyJWT, verifyPermission('DELETE'), consolidationController.deleteConsolidation);

// Récupération consolidation par compte
router.get('/getAllConsolidationCompte/:id_compte/:id_dossier', consolidationController.getAllConsolidationCompte);

// Récupération liste compte associé à un dossier
router.get('/getListeCompteAssocieDossier/:id_compte/:id_dossier', consolidationController.getListeCompteAssocieDossier);

// Récupération de toutes les comptes dans la consolidation dossier
router.get('/getListeCompteInConsolidationDossier/:id_compte/:id_dossier', consolidationController.getListeCompteInConsolidationDossier);

// Ajout ou suppression consolidation par compte
router.post('/addOrUpdateConsolidationCompte', verifyJWT, verifyPermission('ADD', 'EDIT'), consolidationController.addOrUpdateConsolidationCompte);

// Suppréssion d'une consolidation de compte
router.delete('/deleteConsolidationCompte/:id', verifyJWT, verifyPermission('DELETE'), consolidationController.deleteConsolidationCompte);

module.exports = router;