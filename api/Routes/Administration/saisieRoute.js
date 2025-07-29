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

router.get('/getJournal/:id_compte/:id_dossier/:id_exercice', saisieController.getJournal);

router.post('/addLettrage', saisieController.addLettrage);

router.post('/modificationJournal', upload.single('file'), saisieController.modificationJournal);

router.put('/deleteLettrage', saisieController.deleteLettrage);

module.exports = router;