const express = require('express');
const router = express.Router();
const dashboardController = require('../../Controllers/Dashboard/dashboardController');

// Récupération
router.get('/getAllInfo/:id_compte/:id_dossier/:id_exercice', dashboardController.getAllInfo);

// Récupérarion compte en attente
router.get('/getListeJournalEnAttente/:id_compte/:id_dossier/:id_exercice', dashboardController.getListeJournalEnAttente);

module.exports = router;