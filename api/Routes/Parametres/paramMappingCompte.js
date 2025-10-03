const express = require('express');
const paramMappingCompteController = require('../../Controllers/Parametres/paramMappingCompteController');

const router = express.Router();

//récupérer liste des rubriques getListeCompteRubrique
router.post('/listeRubrique', paramMappingCompteController.getListeRubrique);

//récupérer liste des comptes pour une rubrique sélectionnée 
router.post('/listeCompteRubrique', paramMappingCompteController.getListeCompteRubrique);

//ajouter un nouveau paramétrage 
router.post('/MappingCompteAdd', paramMappingCompteController.mappingCompteAdd);

//supprimer un paramétrage 
router.post('/MappingCompteDelete', paramMappingCompteController.mappingCompteDelete);

//restauration paramétrages par défaut
router.post('/restaureDefaultParameter', paramMappingCompteController.restaureDefaultParameter);

//mettre à jour les paramétrages par défaut
router.post('/updateDefaultParameter', paramMappingCompteController.updateDefaultParameter);

//récupérer listes des rubirques pour le D. Com
router.get('/getListeRubriqueDCom/:id_compte/:id_dossier/:id_exercice', paramMappingCompteController.getListeRubriqueDCom);

module.exports = router;