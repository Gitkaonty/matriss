const express = require('express');
const importModelePCController = require('../../Controllers/administration/importModelePCController');

const router = express.Router();

//tester si le nom du modèle à importer existe déja
router.post('/testNewNameModelePc', importModelePCController.testModelePcName);

//import du modèle de plan comptable (version classique)
router.post('/importModelePc', importModelePCController.importModelePc);

//import du modèle de plan comptable avec progression en temps réel (SSE)
router.post('/importModelePcWithProgress', importModelePCController.importModelePcWithProgress);

module.exports = router;