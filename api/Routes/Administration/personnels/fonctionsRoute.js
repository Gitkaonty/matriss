const express = require('express');
const router = express.Router();
const fonctionController = require('../../../Controllers/administration/personnels/fonctionController');

const verifyJWT = require('../../../Middlewares/verifyJWT');
const verifyPermission = require('../../../Middlewares/verifyPermission');

router.get('/:id_compte/:id_dossier', fonctionController.getAll);
router.get('/:id', fonctionController.getOne);
router.post('/', verifyJWT, verifyPermission('ADD', 'EDIT'), fonctionController.create);
router.put('/:id', fonctionController.update);
router.delete('/:id', verifyJWT, verifyPermission('DELETE'), fonctionController.delete);

module.exports = router; 