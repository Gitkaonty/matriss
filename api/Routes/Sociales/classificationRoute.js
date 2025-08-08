const express = require('express');
const router = express.Router();
const classificationController = require('../../Controllers/sociales/classificationController');

router.get('/', classificationController.getAllClassifications);

router.get('/:id', classificationController.getClassificationById);

router.post('/', classificationController.createClassification);

router.put('/:id', classificationController.updateClassification);

router.delete('/:id', classificationController.deleteClassification);

router.get('/dossier/:id_compte/:id_dossier', classificationController.getClassificationsByDossier);

module.exports = router; 