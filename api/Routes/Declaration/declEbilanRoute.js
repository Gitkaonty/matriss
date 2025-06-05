const express = require('express');
const declEbilanController = require('../../Controllers/Declaration/Ebilan/declEbilanController');

const router = express.Router();

//récupérer liste des rubriques globale
router.post('/listeRubriqueGlobal', declEbilanController.getListeRubriqueGlobal);

//récupérer liste des rubriques getListeCompteRubrique
//router.post('/listeRubriqueIndividual', declEbilanController.getListeRubriqueIndividual);
router.post('/listeOneTable', declEbilanController.getListeOneTable);

//récupérer liste des comptes pour une rubrique sélectionnée 
router.post('/listeCompteRubrique', declEbilanController.getListeCompteRubrique);

//actualiser le calcul pour un tableau
router.post('/activateCalcul', declEbilanController.activateCalcul);

//ajouter ou modifier une ligne d'un tableau
router.post('/addmodifyTableau', declEbilanController.addmodifyTableau);

//supprimer une ligne d'un tableau
router.post('/deleteTableOneRow', declEbilanController.deleteTableOneRow);

//supprimer toutes les lignes d'un tableau
router.post('/deleteTableAllRow', declEbilanController.deleteTableAllRow);

//récupération des informations de vérrouillage des tableaux
router.post('/infosVerrouillage', declEbilanController.infosVerrouillage);

//vérouiller ou déverouiller un tableau
router.post('/verrouillerTableau', declEbilanController.verrouillerTableau);

//sauvegarder les ajouts ou modification des ajustements de rubriques
router.post('/addModifyAjust', declEbilanController.addModifyAjustement);

//récupérer la liste des ajustements après mise à jour de la table
router.get('/listeAjust', declEbilanController.listeAjustement);

//supprimer un ajustement 
router.post('/deleteAjust', declEbilanController.deleteAjustement);

module.exports = router;