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

//sauvegarder les modifications et commentaires sur les anomalies des tableaux
router.put('/savemodifAnom/:id', declEbilanController.savemodifAnom);

// Exportation en pdf
router.get('/exportToPDF/:id_compte/:id_dossier/:id_exercice/:id_etat', declEbilanController.exportToPDF);

// Exportation en excel
router.get('/exportToExcel/:id_compte/:id_dossier/:id_exercice/:id_etat', declEbilanController.exportToExcel);

// Exporter tout en excel
router.get('/exportAllToExcel/:id_compte/:id_dossier/:id_exercice', declEbilanController.exportAllToExcel);

// Exporter tout en PDF
router.get('/exportAllToPDF/:id_compte/:id_dossier/:id_exercice', declEbilanController.exportAllToPDF);

// Import formulaire bhiapc
router.post('/importBhiapc', declEbilanController.importBhiapc);

// Import formulaire mp
router.post('/importMp', declEbilanController.importMp);

// Import formulaire da
router.post('/importDa', declEbilanController.importDa);

// Import formulaire eiafnc
router.post('/importEiafnc', declEbilanController.importEiafnc);

// Import formulaire se
router.post('/importSe', declEbilanController.importSe);

// Génération automatique du tableau BHIAPC
router.post('/generateBhiapcAuto', declEbilanController.generateBhiapcAuto);

// Génération automatique du tableau DP
router.post('/generateDpAuto', declEbilanController.generateDpAuto);

// Génération global des tableaux bilan
router.get('/exportAllToXml/:id_compte/:id_dossier/:id_exercice', declEbilanController.exportAllToXml);

module.exports = router;