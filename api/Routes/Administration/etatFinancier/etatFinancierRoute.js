const express = require('express');
const router = express.Router();

const etatFinancierController = require('../../../Controllers/administration/etatFinancier/etatFinancierController');

// Récupération des états financier global
router.get('/getEtatFinancierGlobal/:id_compte/:id_dossier/:id_exercice', etatFinancierController.getEtatFinancierGlobal);

// Génération automatique d'une tableau
router.post('/generateTableEtatFinancier', etatFinancierController.generateTableEtatFinancier);

// Ajout ou modification d'une ajustement externe
router.post('/addModifyAjustementExterne', etatFinancierController.addModifyAjustementExterne);

// Récupération ajustement externe
router.get('/getAjustementExterne', etatFinancierController.getAjustementExterne);

// Suppréssion ajustement externe
router.delete('/deleteAjustementExterne/:id', etatFinancierController.deleteAjustementExterne);

// Exportation en pdf
router.get('/exportEtatFinancierToPdf/:id_compte/:id_dossier/:id_exercice/:id_etat', etatFinancierController.exportEtatFinancierToPdf);

// Exportation en excel
router.get('/exportEtatFinancierToExcel/:id_compte/:id_dossier/:id_exercice/:id_etat', etatFinancierController.exportEtatFinancierToExcel);

// Exporter tout en excel
router.get('/exportAllEtatFinancierToExcel/:id_compte/:id_dossier/:id_exercice', etatFinancierController.exportAllEtatFinancierToExcel);

// Exporter tout en PDF
router.get('/exportAllEtatFinancierToPdf/:id_compte/:id_dossier/:id_exercice', etatFinancierController.exportAllEtatFinancierToPdf);

// Récupération des états du tableau états financiers
router.post('/getVerouillageEtatFinancier', etatFinancierController.getVerouillageEtatFinancier);

// Vérouiller une tableau états financier
router.post('/lockEtatFinancier', etatFinancierController.lockEtatFinancier);

module.exports = router;