const express = require('express');
const router = express.Router();
const ctrl = require('../../../Controllers/Declaration/irsa/irsaController');

const verifyJWT = require('../../../Middlewares/verifyJWT');
const verifyPermission = require('../../../Middlewares/verifyPermission');

router.get('/:id_compte/:id_dossier/:id_exercice', ctrl.getAll);

router.get('/:id', ctrl.getOne);

router.post('/', verifyJWT, verifyPermission('ADD'), ctrl.create);

router.put('/:id', verifyJWT, verifyPermission('EDIT'), ctrl.update);

router.delete('/:id', ctrl.delete);

router.post('/generate-batch-snapshot', ctrl.generateIrsaBatchSnapshot);

router.get('/export-excel-tableau/:id_compte/:id_dossier/:id_exercice/:mois/:annee', ctrl.exportIrsaTableExcel);

router.post('/export-pdf-tableau/:id_compte/:id_dossier/:id_exercice/:mois/:annee', ctrl.exportIrsaTablePdf);

router.get('/export-xml/:id_compte/:id_dossier/:id_exercice/:mois/:annee', ctrl.exportIrsaXml);

module.exports = router;