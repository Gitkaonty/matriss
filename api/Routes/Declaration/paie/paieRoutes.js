const express = require('express');
const router = express.Router();
const ctrl = require('../../../Controllers/Declaration/paie/paieController');

const verifyJWT = require('../../../Middlewares/verifyJWT');
const verifyPermission = require('../../../Middlewares/verifyPermission');

// Export modèle CSV Paie
router.get('/template', ctrl.exportPaieTemplate);

router.get('/:id_compte/:id_dossier/:id_exercice', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', verifyJWT, verifyPermission('ADD'), ctrl.create);
router.put('/:id', verifyJWT, verifyPermission('EDIT'), ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;