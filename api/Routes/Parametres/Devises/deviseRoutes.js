const express = require('express');
const router = express.Router();
const deviseController = require('../../../Controllers/Parametres/devises/deviseController');

router.get('/compte/:id_compte/:id_dossier', deviseController.getAllDevises); // id = id du compte

router.get('/:id', deviseController.getDeviseById);

router.post('/', deviseController.createDevise);

router.put('/:id', deviseController.updateDevise);

router.delete('/:id', deviseController.deleteDevise);

module.exports = router;
