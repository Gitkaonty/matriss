const express = require('express');
const paramCAController = require('../../Controllers/Parametres/paramCAnalitique');

const router = express.Router();

// Récupérer la liste des axes
router.get('/getAxes/:id_compte/:id_dossier', paramCAController.getAxes);

// Récupérer la liste des section par id_axe
router.post('/getSectionsByAxeIds/:id_compte/:id_dossier', paramCAController.getSectionsByAxeIds);

// Ajouter une axe
router.post('/addAxe', paramCAController.addAxe);

// Ajouter une section
router.post('/addSection', paramCAController.addSection);

// Ajouter ou modifier une axe
router.post('/addOrUpdateAxes/:id_compte/:id_dossier', paramCAController.addOrUpdateAxes);

// Ajouter ou modifier une section
router.post('/addOrUpdateSections/:id_compte/:id_dossier', paramCAController.addOrUpdateSections);

// Supprimer les axes selectionnées
router.post('/deleteAxes', paramCAController.deleteAxes);

// Supprimer les sections selectionnés
router.post('/deleteSections', paramCAController.deleteSections);

module.exports = router;