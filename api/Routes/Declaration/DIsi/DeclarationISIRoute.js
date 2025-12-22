const express = require('express');
const router = express.Router();

const verifyJWT = require('../../../Middlewares/verifyJWT');
const verifyPermission = require('../../../Middlewares/verifyPermission');

const declarationISIController = require('../../../Controllers/Declaration/DIsi/DeclarationISIController');

// Récupération du journal par compteisi, jour et année
router.get('/getJournalsISI/:id_compte/:id_dossier/:id_exercice', declarationISIController.getJournalsISI);

// Ajout mois et année dans la table journal
router.put('/ajoutMoisAnnee', verifyJWT, verifyPermission('ADD'), declarationISIController.ajoutMoisAnnee);

// Suppression mois et année dans la table journal
router.put('/suppressionMoisAnnee', verifyJWT, verifyPermission('DELETE'), declarationISIController.suppressionMoisAnnee);

// Génération automatique de isi par les journales comptables
router.post('/generateIsiAuto', verifyJWT, verifyPermission('ADD'), declarationISIController.generateIsiAuto);

// Récupération des isi
router.get('/getIsi/:id_compte/:id_dossier/:id_exercice', declarationISIController.getIsi);

// Récupération de toutes les isi
router.get('/getAllIsi', declarationISIController.getAllIsi);

// Récupération des isi filtré avec le mois et l'année avec dateecriture
router.get('/getAnnexeDeclaration/:id_compte/:id_dossier/:id_exercice', declarationISIController.getAnnexeDeclaration);

// Modification d'une isi
router.put('/updateIsi/:id', verifyJWT, verifyPermission('EDIT'), declarationISIController.updateIsi);

// Suppression des isi sélectionnées
router.post('/deleteSelectedIsi', verifyJWT, verifyPermission('DELETE'), declarationISIController.deleteSelectedIsi);

// Récupération du journal par : jour et année et declisi = true
router.get('/getJournalsDeclIsi/:id_compte/:id_dossier/:id_exercice', declarationISIController.getJournalsDeclIsi);

// Récupération du journal par : jour et année et declisi = true ou declisi = false
router.get('/getDetailSelectionLigne/:id_compte/:id_dossier/:id_exercice', declarationISIController.getDetailSelectionLigne);

// Génération automatique de ISI dans Details/Ecritures associées
router.post('/generateIsiAutoDetail', verifyJWT, verifyPermission('ADD'), declarationISIController.generateIsiAutoDetail);

// Réinitalisation des isi
router.post('/reinitializeIsi', verifyJWT, verifyPermission('DELETE'), declarationISIController.reinitializeIsi);

// Récupération du journale par les comptes classse 6
router.get('/getJournalsDeclIsiClasseSix/:id_compte/:id_dossier/:id_exercice', declarationISIController.getJournalsDeclIsiClasseSix);

//Récupération du journale dans les comptes classes compte ISI
router.get('/getDetailEcritureAssocie/:id_compte/:id_dossier/:id_exercice', declarationISIController.getDetailEcritureAssocie);

//Génération automatique des isi dans annexe déclarations
router.post('/generateAnnexeDeclarationAuto', verifyJWT, verifyPermission('ADD'), declarationISIController.generateAnnexeDeclarationAuto);

//Suppréssion d'une ISI
router.delete('/deleteIsi/:id', verifyJWT, verifyPermission('DELETE'), declarationISIController.deleteIsi);

//Exportation ISI en pdf
router.get('/exportISIToPDF/:id_compte/:id_dossier/:id_exercice/:mois/:annee', declarationISIController.exportISIToPDF);

//Exportation ISI en excel
router.get('/exportISIToExcel/:id_compte/:id_dossier/:id_exercice/:mois/:annee', declarationISIController.exportISIToExcel);

// Exportation isi en XML
router.get('/exportIsiToXml/:id_compte/:id_dossier/:id_exercice/:mois/:annee', declarationISIController.exportIsiXml);

// Récupération des histotiques isi
router.get('/getHistoriqueIsi/:id_compte/:id_dossier', declarationISIController.getHistoriqueIsi);

// Suppression de toutes les isi
router.delete('/deleteAllIsi/:id_compte/:id_dossier/:id_exercice', verifyJWT, verifyPermission('DELETE'), declarationISIController.deleteAllISi);

// Suppression d'historique d'import d'isi
router.post('/deleteSelectedHistoriqueIsi', verifyJWT, verifyPermission('DELETE'), verifyJWT, verifyPermission('DELETE'), declarationISIController.deleteSelectedHistoriqueIsi);

module.exports = router;