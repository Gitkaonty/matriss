const express = require('express');
const importModelePCController = require('../../Controllers/administration/importModelePCController');

const router = express.Router();

//tester si le nom du modèle à importer existe déja
router.post('/testNewNameModelePc', importModelePCController.testModelePcName);

//import du modèle de plan comptable
router.post('/importModelePc', importModelePCController.importModelePc);

module.exports = router;