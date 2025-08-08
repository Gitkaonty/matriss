const express = require('express');
const router = express.Router();
const ctrl = require('../../Controllers/irsa/irsaController');

router.get('/:id_compte/:id_dossier/:id_exercice', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);
router.post('/generate-batch-snapshot', ctrl.generateIrsaBatchSnapshot);
router.post('/export-pdf-tableau', ctrl.exportIrsaTablePdf);

module.exports = router;