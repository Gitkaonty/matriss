const express = require('express');
const router = express.Router();
const personnelController = require('../../../Controllers/administration/personnels/personnelController');

const verifyJWT = require('../../../Middlewares/verifyJWT');
const verifyPermission = require('../../../Middlewares/verifyPermission');

router.get('/:id_compte/:id_dossier', personnelController.getAll);
router.get('/:id', personnelController.getOne);
router.post('/', verifyJWT, verifyPermission('ADD', 'EDIT'), personnelController.create);
router.put('/:id', personnelController.update);
router.delete('/:id', verifyJWT, verifyPermission('DELETE'), personnelController.delete);

module.exports = router; 