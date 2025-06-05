//importing modules
const express = require('express');
const homeController = require('../../Controllers/Home/homeController');
const router = express.Router();

//login route
router.get('/file/:compteId', homeController.recupListDossier );

//création d'un nouveau dossier
router.post('/newFile', homeController.createNewFile );

//suppression d'un nouveau dossier
router.post('/deleteFile', homeController.deleteCreatedFile );

//récupérer les informations sur le dossier
router.get('/FileInfos/:id', homeController.informationsFile );

module.exports = router;