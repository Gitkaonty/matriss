const express = require('express');
const saisieController = require('../../Controllers/administration/saisieController');
const path = require('path');

const router = express.Router();

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', '..', 'public'); 
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, name + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage });

//Récuperer liste devises
//router.post('/recupBalance', exportBalanceController.recupBalance);
router.get('/recupDevise/:id', saisieController.getAllDevises);

router.post('/ajoutJournal', upload.single('file'), saisieController.addJournal);

router.delete('/deleteJournal', saisieController.deleteJournal);

// Rapprochements bancaires
router.get('/rapprochements', saisieController.listRapprochements); // expects query: fileId, compteId, exerciceId, pcId
router.get('/rapprochements/pcs', saisieController.listEligiblePc512); // expects query: fileId, compteId, exerciceId
router.get('/rapprochements/ecritures', saisieController.listEcrituresForRapprochement); // expects query: fileId, compteId, exerciceId, pcId, endDate?
router.post('/rapprochements/ecritures/mark', saisieController.updateEcrituresRapprochement); // body: { ids[], fileId, compteId, exerciceId, rapprocher:boolean, dateRapprochement? }
router.get('/rapprochements/soldes', saisieController.computeSoldesRapprochement); // query: fileId, compteId, exerciceId, pcId, endDate, soldeBancaire?
router.post('/rapprochements', saisieController.createRapprochement);
router.put('/rapprochements/:id', saisieController.updateRapprochement);
router.delete('/rapprochements/:id', saisieController.deleteRapprochement);

// Récupération de journal avec 10 lignes d'écriture
router.get('/getJournal/:id_compte/:id_dossier/:id_exercice', saisieController.getJournal);

// Récupération de journal filtré
router.post('/getJournalFiltered', saisieController.getJournalFiltered);

router.post('/addLettrage', saisieController.addLettrage);

router.post('/modificationJournal', upload.single('file'), saisieController.modificationJournal);

router.put('/deleteLettrage', saisieController.deleteLettrage);

module.exports = router;