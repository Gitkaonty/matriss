const express = require('express');
const router = express.Router();
const revisionControleAutoController = require('../../Controllers/revision/revisionControleAutoController');
const revisionControleAnomaliesController = require('../../Controllers/revision/revisionControleAnomaliesController');
const revisionExportController = require('../../Controllers/revision/revisionExportController');
const verifyJWT = require('../../Middlewares/verifyJWT');

// Middleware d'authentification
router.use(verifyJWT);

// Route pour récupérer ou créer automatiquement les contrôles de révision
router.get('/:id_compte/:id_dossier/:id_exercice', revisionControleAutoController.getOrCreateRevisionControles);

// Route pour récupérer les contrôles par Type
router.get('/:id_compte/:id_dossier/:id_exercice/type/:type', revisionControleAutoController.getControlesByType);

// Route pour récupérer les écritures du journal par préfixes de compte
router.get('/:id_compte/:id_dossier/:id_exercice/journal/ecritures', revisionControleAutoController.getJournalEcrituresByComptePrefix);

// Route pour exécuter le contrôle global (reset + recopie + exécuter tous les types)
router.post('/:id_compte/:id_dossier/:id_exercice/executeAll', revisionControleAutoController.executeAll);

// Route pour récupérer les anomalies depuis table_controle_anomalies (par id_controle)
router.get('/:id_compte/:id_dossier/:id_exercice/anomalies/controle/:id_controle', revisionControleAnomaliesController.getAnomaliesByControle);

// Route pour valider/annuler/commenter une anomalie
router.patch('/:id_compte/:id_dossier/:id_exercice/anomalies/:id_anomalie', revisionControleAnomaliesController.updateAnomaly);

// Routes pour exporter les détails de révision
router.get('/:id_compte/:id_dossier/:id_exercice/export/pdf/:id_controle', revisionExportController.exportPdf);
router.get('/:id_compte/:id_dossier/:id_exercice/export/excel/:id_controle', revisionExportController.exportExcel);

module.exports = router;