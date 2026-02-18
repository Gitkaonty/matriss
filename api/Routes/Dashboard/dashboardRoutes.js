const express = require('express');
const router = express.Router();
const dashboardController = require('../../Controllers/Dashboard/dashboardController');
const revuAnalytiqueController = require('../../Controllers/Dashboard/revuAnalytiqueController');
const revuAnalytiqueMensuelleController = require('../../Controllers/Dashboard/revuAnalytiqueMensuelleController');

// Récupération
router.get('/getAllInfo/:id_compte/:id_dossier/:id_exercice', dashboardController.getAllInfo);

// Récupérarion compte en attente
router.get('/getListeJournalEnAttente/:id_compte/:id_dossier/:id_exercice', dashboardController.getListeJournalEnAttente);

// Revu analytique N/N-1
router.get('/revuAnalytiqueNN1/:id_compte/:id_dossier/:id_exercice', revuAnalytiqueController.getRevuAnalytiqueNN1);

// Revu analytique mensuelle
router.get('/revuAnalytiqueMensuelle/:id_compte/:id_dossier/:id_exercice', revuAnalytiqueMensuelleController.getRevuAnalytiqueMensuelle);

module.exports = router;