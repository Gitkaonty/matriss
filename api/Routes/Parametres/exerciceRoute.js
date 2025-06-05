const express = require('express');
const paramExerciceController = require('../../Controllers/Parametres/paramExerciceController');

const router = express.Router();

//récupérer la liste de dossiers associé l'user et à son compte
router.get('/listeExercice/:id', paramExerciceController.getListeExercice);

//récupérer la liste de situations associés à l'exercice
router.get('/listeSituation/:id', paramExerciceController.getListeSituation);

//création du premier exercice
router.post('/createFirstExercice', paramExerciceController.createFirstExercice);

//création de l'exercice suivant
router.post('/createNextExercice', paramExerciceController.createNextExercice);

//création de l'exercice précédent
router.post('/createPreviewExercice', paramExerciceController.createPreviewExercice);

//verrouiller un exercice
router.post('/verrouillerExercice', paramExerciceController.verrouillerExercice);

//deverrouiller un exercice
router.post('/deverrouillerExercice', paramExerciceController.deverrouillerExercice);

//supprimer un exercice
router.post('/deleteExercice', paramExerciceController.deleteExercice);
module.exports = router;