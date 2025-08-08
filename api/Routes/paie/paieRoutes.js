const express = require('express');
const router = express.Router();
const ctrl = require('../../Controllers/paie/paieController');

// Export modèle CSV Paie
router.get('/template', ctrl.exportPaieTemplate);

router.get('/:id_compte/:id_dossier/:id_exercice', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;