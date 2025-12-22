const express = require('express');
const router = express.Router();
const paramTvaController = require('../../../Controllers/Parametres/paramTvaController');
const { listCFISC, updateMontantCFISC, listFormulaire, updateMontantFormulaire, initializeFormulaire, getFormulaireDetails , infosVerrouillage,
  verrouillerTableau,
  infosVerrouillageDeclaration,
  verrouillerDeclaration,
  computeFormAnomaliesPeriod,
} = require('../../../Controllers/Declaration/tva/tvaControllers');
const { listDGE, updateMontantDGE } = require('../../../Controllers/Declaration/tva/tvaControllers');
const {
  listAnnexes,
  createAnnexe,
  updateAnnexe,
  deleteAnnexe,
  exportTvaToPDF,
  exportTvaTableExcel,
  exportTvaXml,
  initializeCFISC,
  initializeDGE,
  autoCalcDGEFromAnnexes,
  autoCalcFormulaireFromAnnexes,
  exportFormulaireExcel,
  exportFormulairePdf,
} = require('../../../Controllers/Declaration/tva/tvaControllers');

const verifyJWT = require('../../../Middlewares/verifyJWT');
const verifyPermission = require('../../../Middlewares/verifyPermission');

const { listAnomalies, replaceAnomalies, updateAnomalie, updateAnomalieByKey, clearAnomalies } = require('../../../Controllers/Declaration/tva/anomaliesFormulaireController');

///////////////////////// Annexes
// Liste (filtrable par compte/dossier/exercice/mois/annee via query params)
router.get('/annexes', listAnnexes);

// Création
router.post('/annexes', createAnnexe);

// Mise à jour
router.put('/annexes/:id', updateAnnexe);

// Suppression
router.delete('/annexes/:id/:id_dossier/:id_compte/:id_exercice/:mois/:annee', deleteAnnexe);

////////////////////////// CFISC
// Liste des lignes CFISC pour un dossier (et exercice optionnel)
router.get('/cfisc/:dossierId/:compteId/:exerciceId', listCFISC);

// Initialiser formulaire CFISC si vide
router.post('/cfisc/initialize/:dossierId/:compteId/:exerciceId', initializeCFISC);

// Mise à jour du montant d'une ligne
router.put('/cfisc/:id_cfisc', updateMontantCFISC);

// Liste des lignes CFISC pour un dossier (et exercice optionnel)
router.get('/dge/:dossierId/:compteId/:exerciceId', listDGE);

// Initialiser formulaire DGE si vide
router.post('/dge/initialize/:dossierId/:compteId/:exerciceId', initializeDGE);

// Auto-calc DGE from annexes
router.post('/dge/auto-calc/:dossierId/:compteId/:exerciceId', autoCalcDGEFromAnnexes);

// Auto-calc unified formulaire from annexes (DGE/CFISC)
router.post('/formulaire/auto-calc/:dossierId/:compteId/:exerciceId', autoCalcFormulaireFromAnnexes);

// Mise à jour du montant d'une ligne
router.put('/dge/:id_dge', updateMontantDGE);

////////////////////////// FORMULAIRE TVA UNIFIE
router.get('/formulaire/:dossierId/:compteId/:exerciceId', listFormulaire);
router.put('/formulaire/:id_code', updateMontantFormulaire);
router.post('/formulaire/initialize/:dossierId/:compteId/:exerciceId', initializeFormulaire);
router.get('/formulaire/details/:dossierId/:compteId/:exerciceId/:idCode', getFormulaireDetails);

// Persist anomalies of unified formulaire TVA
router.put('/anomalies/replace', replaceAnomalies);
router.get('/anomalies', listAnomalies);
// IMPORTANT: register 'by-key' BEFORE ':id' to avoid route capture
router.patch('/anomalies/by-key', updateAnomalieByKey);
router.patch('/anomalies/:id', updateAnomalie);
router.delete('/anomalies', clearAnomalies);

// Backend-only: compute anomalies for a period (no persistence)
router.get('/anomalies/compute', computeFormAnomaliesPeriod);

////////////////////////// VERROUILLAGE FORMULAIRE TVA
router.post('/infosVerrouillage', infosVerrouillage);
router.post('/verrouillerTableau', verrouillerTableau);
// Verrouillage par période (enregistre dans etatsdeclarations)
router.post('/infosVerrouillageDeclaration', infosVerrouillageDeclaration);
router.post('/verrouillerDeclaration', verrouillerDeclaration);

////////////////////////// DETAILS 
// filtrer les écritures pour un compte/dossier/exercice selon logique TVA (decltva=false OR (decltva=true & mois/annee correspond))
router.get('/selectionLigne/:id_compte/:id_dossier/:id_exercice', paramTvaController.getJournalsSelectionLigne);

// filtrer les écritures pour un compte/dossier/exercice selon logique TVA (decltva=false OR (decltva=true & mois/annee correspond))
router.get('/ecritureassociee/:id_compte/:id_dossier/:id_exercice', paramTvaController.getJournalsDeclTvaClasseTva);

// mettre à jour en masse mois/année de déclaration sur des écritures
router.put('/ajoutMoisAnnee',verifyJWT, verifyPermission('ADD'), paramTvaController.ajoutMoisAnnee);

// supprimer en masse mois/année de déclaration sur des écritures
router.put('/supprimerMoisAnnee',verifyJWT, verifyPermission('DELETE'), paramTvaController.suppressionMoisAnnee);

// mettre à jour le flag booléen decltva en masse
router.put('/declflag', paramTvaController.updateJournalsDeclFlag);

// récupérer le plan comptable pour un compte comptable
router.get('/recupPcClasseSix/:id_compte/:id_dossier', paramTvaController.recupPcClasseSix);

// générer une annexe de déclaration automatiquement
router.post('/generateAnnexeDeclarationAuto', verifyJWT, verifyPermission('ADD'),paramTvaController.generateAnnexeDeclarationAuto);

// réinitialiser la déclaration TVA en masse
router.put('/reinitializeTva',verifyJWT, verifyPermission('DELETE'), paramTvaController.reinitializeTva);

// Export Excel Annexes TVA
router.get('/export-excel-tableau/:id_compte/:id_dossier/:id_exercice/:mois/:annee', exportTvaTableExcel);

// Export XML Annexes TVA
router.get('/export-xml/:id_compte/:id_dossier/:id_exercice/:mois/:annee', exportTvaXml);

// Export PDF Annexes TVA 
router.get('/export-pdf-tableau/:id_compte/:id_dossier/:id_exercice/:mois/:annee', exportTvaToPDF);

// Export Formulaire TVA (unifié) - Excel/PDF (mois/annee via query params)
router.get('/formulaire/export-excel/:id_dossier/:id_compte/:id_exercice', exportFormulaireExcel);
router.get('/formulaire/export-pdf/:id_dossier/:id_compte/:id_exercice', exportFormulairePdf);

// Générer les détails automatiquement
router.post('/generateTvaAutoDetail',verifyJWT, verifyPermission('ADD'), paramTvaController.generateTvaAutoDetail);

// Récupérer les écritures associées (déjà marquées decltva=true) pour une période
router.get('/getDetailEcritureAssocie/:id_compte/:id_dossier/:id_exercice', paramTvaController.getDetailEcritureAssocie);

module.exports = router;