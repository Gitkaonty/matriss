const express = require('express');
const router = express.Router();

const paramRubriquesExternesController = require('../../../Controllers/Parametres/RubriqueExternes/paramRubriquesExternesController');

// Récupération des rubriques externes
router.get('/getRubriquesExternes/:id_compte/:id_dossier/:id_exercice', paramRubriquesExternesController.getRubriquesExternes);

// Ajout rubriques externes
router.post('/addRubriquesExternes', paramRubriquesExternesController.addRubriquesExternes);

// Modification rubriques externes
router.put('/updateRubriquesExternes/:id', paramRubriquesExternesController.updateRubriquesExternes);

// Suppression rubtiques externes
router.delete('/deleteRubriquesExternes/:id', paramRubriquesExternesController.deleteRubriquesExternes);

// Ajouter ou supprimer une rubriques externes
router.post('/addOrUpdateRubriqueExterne', paramRubriquesExternesController.addOrUpdateRubriqueExterne);

// Récupération compte rubriques externes
router.post('/getCompteRubriqueExterne', paramRubriquesExternesController.getCompteRubriqueExterne);

// Suppréssion compte rubriques externes 
router.delete('/deleteCompteRubriqueExterne/:id', paramRubriquesExternesController.deleteCompteRubriqueExterne);

// Ajouter ou supprimer une compte rubrique externes
router.post('/addOrUpdateCompteRubriqueExterne', paramRubriquesExternesController.addOrUpdateCompteRubriqueExterne);

// Réstaurer les paramètres par défaut
router.post('/restaureDefaultParameter', paramRubriquesExternesController.restaureDefaultParameter);

// Mettre à jour les paramètres par défaut
router.post('/updateDefaultParameter', paramRubriquesExternesController.updateDefaultParameter);

module.exports = router;