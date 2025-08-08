const express = require('express');
const router = express.Router();
const personnelController = require('../../Controllers/personnels/personnelController');

router.get('/:id_compte/:id_dossier', personnelController.getAll);
router.get('/:id', personnelController.getOne);
router.post('/', personnelController.create);
router.put('/:id', personnelController.update);
router.delete('/:id', personnelController.delete);

module.exports = router; 