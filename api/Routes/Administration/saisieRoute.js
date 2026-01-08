const express = require('express');
const saisieController = require('../../Controllers/administration/saisieController');
const exportRapprochementsController = require('../../Controllers/administration/exportRapprochementsController');
const path = require('path');

const verifyJWT = require('../../Middlewares/verifyJWT');
const verifyPermission = require('../../Middlewares/verifyPermission');

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

router.post('/ajoutJournal', verifyJWT, verifyPermission('ADD'), upload.single('file'), saisieController.addJournal);

router.delete('/deleteJournal', verifyJWT, verifyPermission('DELETE'), saisieController.deleteJournal);

// Rapprochements bancaires
router.get('/rapprochements', saisieController.listRapprochements); // expects query: fileId, compteId, exerciceId, pcId
router.get('/rapprochements/pcs', saisieController.listEligiblePc512); // expects query: fileId, compteId, exerciceId
router.get('/rapprochements/ecritures', saisieController.listEcrituresForRapprochement); // expects query: fileId, compteId, exerciceId, pcId, endDate?
router.post('/rapprochements/ecritures/mark', saisieController.updateEcrituresRapprochement); // body: { ids[], fileId, compteId, exerciceId, rapprocher:boolean, dateRapprochement? }
router.get('/rapprochements/soldes', saisieController.computeSoldesRapprochement); // query: fileId, compteId, exerciceId, pcId, endDate, soldeBancaire?
router.post('/rapprochements', saisieController.createRapprochement);
router.put('/rapprochements/:id', saisieController.updateRapprochement);
router.delete('/rapprochements/:id', saisieController.deleteRapprochement);

// Immobilisations: liste des comptes de classe 2 (hors 28, 29)
router.get('/immobilisations/pcs', saisieController.listImmobilisationsPc2); // expects query: fileId, compteId

// Immobilisations: détails (details_immo)
// GET list for a selected PC (pcId is the plan comptable id), filtered by fileId, compteId, exerciceId
router.get('/immobilisations/details', saisieController.listDetailsImmo);
// CREATE a detail row
router.post('/immobilisations/details', saisieController.createDetailsImmo);
// UPDATE a detail row by id
router.put('/immobilisations/details/:id', saisieController.updateDetailsImmo);
// DELETE a detail row by id
router.delete('/immobilisations/details/:id', saisieController.deleteDetailsImmo);

// Immobilisations: lignes d'amortissement par immobilisation
router.get('/immobilisations/details/lignes', saisieController.listDetailsImmoLignes);
router.get('/immobilisations/details/lineaire/preview', saisieController.previewImmoLineaire);
router.get('/immobilisations/details/degresif/preview', saisieController.previewImmoDegressif);
router.post('/immobilisations/details/lineaire/save', saisieController.saveImmoLineaire);
// router.post('/immobilisations/details/degresif/save', saisieController.saveImmoDegressif);

// Rapprochements exports
router.get('/rapprochements/export/pdf', exportRapprochementsController.exportPdf); // query: fileId, compteId, exerciceId, pcId, rapproId
router.get('/rapprochements/export/excel', exportRapprochementsController.exportExcel); // query: fileId, compteId, exerciceId, pcId, rapproId

// Récupération de journal avec 10 lignes d'écriture
router.get('/getJournal/:id_compte/:id_dossier/:id_exercice', saisieController.getJournal);

// Récupération de toutes les journal
router.get('/getAllJournal/:id_compte/:id_dossier/:id_exercice', saisieController.getAllJournal);

// Récupération de journal filtré
router.post('/getJournalFiltered', verifyJWT, verifyPermission('VIEW'), saisieController.getJournalFiltered);

router.post('/addLettrage', verifyJWT, verifyPermission('ADD'), saisieController.addLettrage);

router.post('/modificationJournal', verifyJWT, verifyPermission('EDIT'), upload.single('file'), saisieController.modificationJournal);

router.put('/deleteLettrage', verifyJWT, verifyPermission('DELETE'), saisieController.deleteLettrage);

module.exports = router;