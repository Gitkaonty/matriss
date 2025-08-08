const express = require('express');
const router = express.Router();
const fonctionController = require('../../Controllers/personnels/fonctionController');

router.get('/:id_compte/:id_dossier', fonctionController.getAll);
router.get('/:id', fonctionController.getOne);
router.post('/', fonctionController.create);
router.put('/:id', fonctionController.update);
router.delete('/:id', fonctionController.delete);

module.exports = router; 