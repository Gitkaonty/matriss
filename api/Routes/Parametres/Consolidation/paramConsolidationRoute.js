const express = require('express');
const router = express.Router();

const consolidationController = require('../../../Controllers/Parametres/Consolidation/paramConsolidationController');

const verifyJWT = require('../../../Middlewares/verifyJWT');
const verifyPermission = require('../../../Middlewares/verifyPermission');

// Récupération consolidation par dossier
router.get('/getListeConsolidationDossier/:id_compte/:id_dossier', consolidationController.getListeConsolidationDossier);

// Ajout ou suppression consolidation par dossier
router.post('/addOrUpdateConsolidationDossier', verifyJWT, verifyPermission('ADD', 'EDIT'), consolidationController.addOrUpdateConsolidationDossier);

// Suppression d'une consolidation
router.delete('/deleteConsolidation/:id', verifyJWT, verifyPermission('DELETE'), consolidationController.deleteConsolidation);

// Récupération consolidation par compte
router.get('/getAllConsolidationCompte/:id_compte/:id_dossier', consolidationController.getAllConsolidationCompte);

module.exports = router;