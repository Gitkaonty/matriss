const db = require("../../Models");
require('dotenv').config();
const devises = db.devises;
const journals = db.journals;
const dossierplancomptable = db.dossierplancomptable;
const codejournals = db.codejournals;
const rapprochements = db.rapprochements;
const analytiques = db.analytiques;

const { Op } = require("sequelize");

const fs = require('fs');
const path = require('path');

// Fonction pour plurieliser un mot
function pluralize(count, word) {
    return count > 1 ? word + 's' : word;
}

// --- Rapprochements: PC 512 éligibles par exercice ---
exports.listEligiblePc512 = async (req, res) => {
    try {
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        if (!fileId || !compteId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        // Lister tous les comptes 512 du plan comptable du dossier et du compte (pas de filtre exercice)
        const sql = `
            SELECT pc.*
            FROM dossierplancomptables pc
            WHERE pc.id_dossier = :fileId
              AND pc.id_compte = :compteId
              AND pc.compte LIKE '512%'
            ORDER BY pc.compte ASC
        `;
        const rows = await db.sequelize.query(sql, {
            replacements: { fileId, compteId },
            type: db.Sequelize.QueryTypes.SELECT,
        });
        return res.json({ state: true, list: rows || [] });
    } catch (err) {
        console.error('[RAPPRO][PCS] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Ecritures: marquer/démarquer comme rapprochée en masse ---
exports.updateEcrituresRapprochement = async (req, res) => {
    try {
        const { ids, fileId, compteId, exerciceId, rapprocher, dateRapprochement } = req.body || {};
        if (!Array.isArray(ids) || ids.length === 0 || !fileId || !compteId || !exerciceId || typeof rapprocher !== 'boolean') {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants ou invalides' });
        }
        const payload = {
            rapprocher: !!rapprocher,
            // store as 'YYYY-MM-DD' to avoid TZ shift
            date_rapprochement: !!rapprocher ? (dateRapprochement ? String(dateRapprochement).substring(0, 10) : null) : null,
            modifierpar: Number(compteId) || 0,
        };
        if (rapprocher && !payload.date_rapprochement) {
            return res.status(400).json({ state: false, msg: 'dateRapprochement requis quand rapprocher = true' });
        }
        const [affected] = await journals.update(payload, {
            where: {
                id: ids,
                id_compte: Number(compteId),
                id_dossier: Number(fileId),
                id_exercice: Number(exerciceId),
            }
        });
        return res.json({ state: true, updated: affected });
    } catch (err) {
        console.error('[RAPPRO][MARK] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Rapprochements: calcul des soldes pour une ligne sélectionnée ---
exports.computeSoldesRapprochement = async (req, res) => {
    try {
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        const pcId = Number(req.query?.pcId);
        const endDateParam = req.query?.endDate; // requis pour la ligne sélectionnée
        const soldeBancaireParam = req.query?.soldeBancaire; // optionnel
        if (!fileId || !compteId || !exerciceId || !pcId || !endDateParam) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const exo = await db.exercices.findByPk(exerciceId);
        if (!exo) return res.status(404).json({ state: false, msg: 'Exercice introuvable' });
        const dateDebut = exo.date_debut ? String(exo.date_debut).substring(0, 10) : null;
        const dateFin = endDateParam ? String(endDateParam).substring(0, 10) : null;
        if (!dateDebut || !dateFin) return res.status(400).json({ state: false, msg: 'Dates invalides' });

        const sqlAggBase = `
            FROM journals j
            JOIN codejournals cj ON cj.id = j.id_journal
            JOIN dossierplancomptables pc ON pc.id = :pcId
            JOIN dossierplancomptables c ON c.id = j.id_numcpt
            WHERE j.id_compte = :compteId
              AND j.id_dossier = :fileId
              AND j.id_exercice = :exerciceId
              AND cj.compteassocie = pc.compte
              AND j.dateecriture BETWEEN :dateDebut AND :dateFin
              AND c.compte <> pc.compte
        `;

        const sqlAll = `SELECT COALESCE(SUM(j.credit),0) AS sum_credit, COALESCE(SUM(j.debit),0) AS sum_debit ${sqlAggBase}`;
        const sqlRapp = `SELECT COALESCE(SUM(j.credit),0) AS sum_credit, COALESCE(SUM(j.debit),0) AS sum_debit ${sqlAggBase} AND (CASE WHEN j.rapprocher THEN 1 ELSE 0 END) = 1`;

        const [totAll] = await db.sequelize.query(sqlAll, {
            replacements: { fileId, compteId, exerciceId, pcId, dateDebut, dateFin },
            type: db.Sequelize.QueryTypes.SELECT,
        });
        const [totRapp] = await db.sequelize.query(sqlRapp, {
            replacements: { fileId, compteId, exerciceId, pcId, dateDebut, dateFin },
            type: db.Sequelize.QueryTypes.SELECT,
        });

        const totalAll = (Number(totAll.sum_credit) || 0) - (Number(totAll.sum_debit) || 0);
        const totalRapp = (Number(totRapp.sum_credit) || 0) - (Number(totRapp.sum_debit) || 0);

        const solde_comptable = totalAll;
        // si aucune écriture rapprochée, solde_non_rapproché = solde_comptable, sinon on exclut celles rapprochées
        const hasRapp = Math.abs(totalRapp) > 0;
        const solde_non_rapproche = hasRapp ? (totalAll - totalRapp) : totalAll;

        const solde_bancaire = soldeBancaireParam !== undefined && soldeBancaireParam !== null ? Number(soldeBancaireParam) : null;
        const ecart = typeof solde_bancaire === 'number' && !isNaN(solde_bancaire)
            ? (solde_comptable - solde_bancaire - solde_non_rapproche)
            : null;

        return res.json({ state: true, solde_comptable, solde_non_rapproche, solde_bancaire, ecart });
    } catch (err) {
        console.error('[RAPPRO][COMPUTE] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Rapprochements: liste des rapprochements pour un PC ---
exports.listRapprochements = async (req, res) => {
    try {
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        const pcId = Number(req.query?.pcId);
        if (!fileId || !compteId || !exerciceId || !pcId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const rows = await rapprochements.findAll({
            where: {
                id_dossier: fileId,
                id_compte: compteId,
                id_exercice: exerciceId,
                pc_id: pcId,
            },
            order: [['date_debut', 'ASC'], ['id', 'ASC']]
        });
        return res.json({ state: true, list: rows || [] });
    } catch (err) {
        console.error('[RAPPRO][LIST] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Rapprochements: créer ---
exports.createRapprochement = async (req, res) => {
    try {
        const {
            fileId, compteId, exerciceId, pcId,
            date_debut, date_fin,
            solde_comptable = 0, solde_bancaire = 0, solde_non_rapproche = 0,
        } = req.body || {};
        if (!fileId || !compteId || !exerciceId || !pcId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const row = await rapprochements.create({
            id_dossier: Number(fileId),
            id_compte: Number(compteId),
            id_exercice: Number(exerciceId),
            pc_id: Number(pcId),
            // Store as provided date-only strings to avoid timezone issues
            date_debut: date_debut ? String(date_debut).substring(0, 10) : null,
            date_fin: date_fin ? String(date_fin).substring(0, 10) : null,
            solde_comptable: Number(solde_comptable) || 0,
            solde_bancaire: Number(solde_bancaire) || 0,
            solde_non_rapproche: Number(solde_non_rapproche) || 0,
        });
        return res.json({ state: true, id: row.id });
    } catch (err) {
        console.error('[RAPPRO][CREATE] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Rapprochements: modifier ---
exports.updateRapprochement = async (req, res) => {
    try {
        const id = Number(req.params?.id);
        const {
            fileId, compteId, exerciceId, pcId,
            date_debut, date_fin,
            solde_comptable = 0, solde_bancaire = 0, solde_non_rapproche = 0,
        } = req.body || {};
        if (!id || !fileId || !compteId || !exerciceId || !pcId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const [affected] = await rapprochements.update({
            date_debut: date_debut ? String(date_debut).substring(0, 10) : null,
            date_fin: date_fin ? String(date_fin).substring(0, 10) : null,
            solde_comptable: Number(solde_comptable) || 0,
            solde_bancaire: Number(solde_bancaire) || 0,
            solde_non_rapproche: Number(solde_non_rapproche) || 0,
        }, {
            where: {
                id,
                id_dossier: Number(fileId),
                id_compte: Number(compteId),
                id_exercice: Number(exerciceId),
                pc_id: Number(pcId),
            }
        });
        if (affected === 0) return res.status(404).json({ state: false, msg: 'Introuvable' });
        return res.json({ state: true, id });
    } catch (err) {
        console.error('[RAPPRO][UPDATE] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Rapprochements: supprimer ---
exports.deleteRapprochement = async (req, res) => {
    try {
        const id = Number(req.params?.id);
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        if (!id || !fileId || !compteId || !exerciceId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const affected = await rapprochements.destroy({ where: { id, id_dossier: fileId, id_compte: compteId, id_exercice: exerciceId } });
        if (!affected) return res.status(404).json({ state: false, msg: 'Introuvable' });
        return res.json({ state: true, id });
    } catch (err) {
        console.error('[RAPPRO][DELETE] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Ecritures pour rapprochement: liste des écritures filtrées ---
exports.listEcrituresForRapprochement = async (req, res) => {
    try {
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        const pcId = Number(req.query?.pcId);
        const endDateParam = req.query?.endDate; // optionnel, sinon on prend fin d'exercice
        if (!fileId || !compteId || !exerciceId || !pcId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        // Récupérer début/fin d'exercice
        const exo = await db.exercices.findByPk(exerciceId);
        if (!exo) return res.status(404).json({ state: false, msg: 'Exercice introuvable' });
        const dateDebut = exo.date_debut;
        const dateFin = endDateParam ? new Date(endDateParam) : exo.date_fin;
        // SQL: journaux du code journal associé au compte 512 sélectionné, dates incluses, et compte different du 512 sélectionné
        const sql = `
            SELECT j.*, c.compte AS compte_ecriture, cj.code AS code_journal
            FROM journals j
            JOIN codejournals cj ON cj.id = j.id_journal
            JOIN dossierplancomptables pc ON pc.id = :pcId
            JOIN dossierplancomptables c ON c.id = j.id_numcpt
            WHERE j.id_compte = :compteId
              AND j.id_dossier = :fileId
              AND j.id_exercice = :exerciceId
              AND cj.compteassocie = pc.compte
              AND j.dateecriture BETWEEN :dateDebut AND :dateFin
              AND c.compte <> pc.compte
            ORDER BY j.dateecriture ASC, j.id ASC
        `;
        const rows = await db.sequelize.query(sql, {
            replacements: { fileId, compteId, exerciceId, pcId, dateDebut, dateFin },
            type: db.Sequelize.QueryTypes.SELECT,
        });
        return res.json({ state: true, list: rows || [] });
    } catch (err) {
        console.error('[RAPPRO][ECRITURES] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

exports.getAllDevises = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ state: false, message: 'Id_compte non trouvé' })
        }
        const devisesData = await devises.findAll({ where: { compte_id: id } });
        if (!devisesData) {
            return res.status(404).json({ state: false, message: 'Devise non trouvé' })
        }
        return res.status(200).json({ state: true, list: devisesData });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};

const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());

const getDateSaisieNow = (id) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${dd}${mm}${yyyy}${hh}${min}${ss}${id}`;
};

exports.addJournal = async (req, res) => {
    try {
        const jsonData = JSON.parse(req.body.data);
        const file = req.file;

        if (!jsonData) {
            return res.status(400).json({ message: "Données ou fichier manquant" });
        }

        const id_compte = Number(jsonData.id_compte);
        const id_dossier = Number(jsonData.id_dossier);
        const id_exercice = Number(jsonData.id_exercice);
        const id_journal = Number(jsonData.valSelectCodeJnl);
        const id_devise = Number(jsonData.id_devise);

        const codeJournal = await codejournals.findByPk(id_journal);
        if (!codeJournal) {
            return res.status(404).json({ message: "Code journal introuvable" });
        }

        const typeCodeJournal = codeJournal.type;

        const mois = jsonData.valSelectMois;
        const annee = jsonData.valSelectAnnee;
        const currency = jsonData.currency;
        const devise = jsonData.choixDevise === 'MGA' ? jsonData.choixDevise : currency;
        const tableRows = jsonData.tableRows;
        const listCa = jsonData.listCa;
        const taux = jsonData.taux;

        let fichierCheminRelatif = null;

        if (file) {
            const dossierRelatif = path.join(
                "public",
                "ScanEcriture",
                id_compte.toString(),
                id_dossier.toString(),
                id_exercice.toString(),
                typeCodeJournal
            );

            const dossierAbsolu = path.resolve(dossierRelatif);
            fs.mkdirSync(dossierAbsolu, { recursive: true });

            const nomFichier = `journal_${Date.now()}${path.extname(file.originalname)}`;
            const cheminComplet = path.join(dossierAbsolu, nomFichier);

            fs.renameSync(file.path, cheminComplet);

            fichierCheminRelatif = path.join(dossierRelatif, nomFichier).replace(/\\/g, '/');
        }

        const newTableRows = await Promise.all(tableRows.map(async (row) => {
            const dossierPc = await dossierplancomptable.findByPk(row.compte);
            const comptebaseaux = dossierPc?.baseaux_id;

            let id_numcptcentralise = null;
            if (comptebaseaux) {
                const cpt = await dossierplancomptable.findByPk(comptebaseaux);
                id_numcptcentralise = cpt?.id || null;
            }

            const dateecriture = new Date(
                annee,
                mois - 1,
                row.jour + 1
            );

            if (!isValidDate(dateecriture)) {
                throw new Error(`Date invalide pour la ligne ${JSON.stringify(row)}`);
            }

            return {
                id_temporaire: row.id,
                id_compte,
                id_dossier,
                id_exercice,
                id_numcpt: row.compte,
                id_journal,
                id_devise,
                taux,
                devise,
                saisiepar: id_compte,
                id_ecriture: getDateSaisieNow(id_compte),
                debit: row.debit === "" ? 0 : row.debit,
                num_facture: row.num_facture,
                credit: row.credit === "" ? 0 : row.credit,
                montant_devise: row.montant_devise || 0,
                dateecriture: dateecriture,
                id_numcptcentralise,
                libelle: row.libelle || '',
                piece: row.piece || '',
                piecedate: row.piecedate || null,
                fichier: fichierCheminRelatif
            };
        }));

        let count = 0;
        for (const row of newTableRows) {
            const createdJournal = await journals.create({ ...row });
            count++;

            const journalId = createdJournal.id;

            const relevantCa = listCa?.filter(item => item.id_ligne_ecriture === row.id_temporaire) || [];

            if (relevantCa.length > 0) {
                const listCaRows = relevantCa.map(item => ({
                    id_compte,
                    id_dossier,
                    id_exercice,
                    id_ligne_ecriture: journalId,
                    id_axe: item.id_axe,
                    id_section: item.id_section,
                    debit: item.debit || 0,
                    credit: item.credit || 0,
                    pourcentage: item.pourcentage || 0
                }));

                await analytiques.bulkCreate(listCaRows);
            }
        }

        return res.json({
            message: `${count} ${pluralize(count, 'ligne')} ${pluralize(count, 'ajoutée')} avec succès`,
            data: newTableRows,
            state: true
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ state: false, message: error.message });
    }
};

exports.modificationJournal = async (req, res) => {
    try {
        const jsonData = JSON.parse(req.body.data);
        const file = req.file;
        const conserverFichier = jsonData.conserverFichier === true;

        if (!jsonData) {
            return res.status(400).json({ message: "Données ou fichier manquant" });
        }

        const id_compte = Number(jsonData.id_compte);
        const id_dossier = Number(jsonData.id_dossier);
        const id_exercice = Number(jsonData.id_exercice);
        const id_journal = Number(jsonData.valSelectCodeJnl);
        const id_devise = Number(jsonData.id_devise);

        const codeJournal = await codejournals.findByPk(id_journal);
        if (!codeJournal) {
            return res.status(404).json({ message: "Code journal introuvable" });
        }

        const typeCodeJournal = codeJournal.type;
        const mois = jsonData.valSelectMois;
        const annee = jsonData.valSelectAnnee;
        const currency = jsonData.currency;
        const devise = jsonData.choixDevise === 'MGA' ? jsonData.choixDevise : currency;
        const tableRows = jsonData.tableRows;
        const listCa = jsonData.listCa;
        const taux = jsonData.taux;
        const deletedIds = jsonData.deletedIds || [];
        const num_facture = jsonData.num_facture;

        let fichierCheminRelatif = null;

        if (file) {
            const dossierRelatif = path.join(
                "public",
                "ScanEcriture",
                id_compte.toString(),
                id_dossier.toString(),
                id_exercice.toString(),
                typeCodeJournal
            );

            const dossierAbsolu = path.resolve(dossierRelatif);
            fs.mkdirSync(dossierAbsolu, { recursive: true });

            const nomFichier = `journal_${Date.now()}${path.extname(file.originalname)}`;
            const cheminComplet = path.join(dossierAbsolu, nomFichier);

            fs.renameSync(file.path, cheminComplet);

            fichierCheminRelatif = path.join(dossierRelatif, nomFichier).replace(/\\/g, '/');
        }

        let ajout = 0;
        let modification = 0;

        let idEcritureCommun = null;
        for (const row of tableRows) {
            if (row.id && Number(row.id) > 0) {
                const journalExistant = await journals.findByPk(row.id);
                idEcritureCommun = journalExistant.id_ecriture;
                break;
            }
        }

        for (const row of tableRows) {
            const dossierPc = await dossierplancomptable.findByPk(row.compte);
            const comptebaseaux = dossierPc?.baseaux_id;

            let id_numcptcentralise = null;
            if (comptebaseaux) {
                const cpt = await dossierplancomptable.findByPk(comptebaseaux);
                id_numcptcentralise = cpt?.id || null;
            }

            const dateecriture = new Date(
                annee,
                mois - 1,
                row.jour + 1
            );

            if (!isValidDate(dateecriture)) {
                throw new Error(`Date invalide pour la ligne ${JSON.stringify(row)}`);
            }

            const journalData = {
                id_temporaire: row.id,
                id_compte,
                id_dossier,
                id_exercice,
                id_numcpt: row.compte,
                id_journal,
                id_devise,
                num_facture,
                taux,
                devise,
                modifierpar: id_compte,
                debit: row.debit === "" ? 0 : row.debit,
                credit: row.credit === "" ? 0 : row.credit,
                num_facture: row.num_facture,
                montant_devise: row.montant_devise || 0,
                dateecriture: dateecriture,
                id_numcptcentralise,
                libelle: row.libelle || '',
                piece: row.piece || '',
                piecedate: row.piecedate || null,
                id_ecriture: idEcritureCommun,
                fichier: null
            };

            const journalExistant = await journals.findByPk(row.id);
            if (row.id && Number(row.id) > 0) {
                if (!journalExistant) continue;

                if (file) {
                    if (journalExistant.fichier) {
                        const ancienChemin = path.resolve(process.cwd(), journalExistant.fichier);
                        if (fs.existsSync(ancienChemin)) fs.unlinkSync(ancienChemin);
                    }
                    journalData.fichier = fichierCheminRelatif;

                } else if (conserverFichier && journalExistant.fichier) {
                    journalData.fichier = journalExistant.fichier;

                } else if (!conserverFichier && journalExistant.fichier) {
                    const ancienChemin = path.resolve(process.cwd(), journalExistant.fichier);
                    if (fs.existsSync(ancienChemin)) fs.unlinkSync(ancienChemin);
                    journalData.fichier = null;

                } else {
                    journalData.fichier = null;
                }

                await journals.update(journalData, { where: { id: row.id } });
                modification++;

                const relevantCa = listCa?.filter(item => item.id_ligne_ecriture === row.id) || [];
                for (const item of relevantCa) {
                    await analytiques.update(
                        {
                            debit: item.debit || 0, credit: item.credit || 0, pourcentage: item.pourcentage || 0
                        },
                        {
                            where: {
                                id_ligne_ecriture: row.id,
                                id_axe: item.id_axe,
                                id_section: item.id_section
                            }
                        }
                    );
                }
            }
            else {
                journalData.fichier = fichierCheminRelatif || null;

                const createdJournal = await journals.create(journalData);

                const journalId = createdJournal.id;

                const relevantCa = listCa?.filter(item => item.id_ligne_ecriture === row.id_temporaire) || [];

                if (relevantCa.length > 0) {
                    const listCaRows = relevantCa.map(item => ({
                        id_compte,
                        id_dossier,
                        id_exercice,
                        id_ligne_ecriture: journalId,
                        id_axe: item.id_axe,
                        id_section: item.id_section,
                        debit: item.debit || 0,
                        credit: item.credit || 0,
                        pourcentage: item.pourcentage || 0

                    }));

                    await analytiques.bulkCreate(listCaRows);
                }
                ajout++;
            }
        }

        if (deletedIds.length > 0) {
            await journals.destroy({ where: { id: deletedIds } });
        }

        return res.json({
            message: `${modification} ${pluralize(modification, 'ligne')} ${pluralize(modification, 'modifiée')}, ${ajout} ${pluralize(ajout, 'ajoutée')}, ${deletedIds.length} ${pluralize(deletedIds.length, 'supprimée')}`,
            state: true
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ state: false, message: error.message });
    }
};

exports.getJournal = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice } = req.params;

        if (!id_dossier) return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' });
        if (!id_exercice) return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' });

        const firstTenIds = await journals.findAll({
            attributes: ['id_ecriture', 'createdAt'],
            where: { id_compte, id_dossier, id_exercice },
            order: [['createdAt', 'DESC']],
            raw: true
        });

        const uniqueEcritures = [...new Set(firstTenIds.map(val => val.id_ecriture))];

        const id_ecritures = uniqueEcritures.slice(0, 10);

        const journalData = await journals.findAll({
            where: {
                id_compte,
                id_dossier,
                id_exercice,
                id_ecriture: id_ecritures
            },
            include: [
                { model: dossierplancomptable, attributes: ['compte'] },
                { model: codejournals, attributes: ['code'] }
            ],
            order: [
                // ['id_ecriture', 'ASC'],
                // ['dateecriture', 'ASC'],
                // ['id', 'ASC']
                ['createdAt', 'DESC']
            ]
        });

        const mappedData = journalData.map(journal => {
            const { dossierplancomptable, codejournal, ...rest } = journal.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
                journal: codejournal?.code || null
            };
        });

        return res.json(mappedData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

exports.getJournalFiltered = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice, journal, compte, piece, libelle, debut, fin } = req.body;
        const id_numcpt = compte?.id;

        if (!id_dossier) return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' });
        if (!id_exercice) return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' });

        const whereClause = {
            id_compte,
            id_dossier,
            id_exercice
        };

        if (piece) whereClause.piece = { [Op.iLike]: `%${piece}%` };
        if (libelle) whereClause.libelle = { [Op.iLike]: `%${libelle}%` };
        if (debut && fin) whereClause.dateecriture = { [Op.between]: [debut, fin] };
        else if (debut) whereClause.dateecriture = { [Op.gte]: debut };
        else if (fin) whereClause.dateecriture = { [Op.lte]: fin };

        const journalData = await journals.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: dossierplancomptable,
                    attributes: ['compte', 'id'],
                    where:
                    {
                        ...(compte ? { id: id_numcpt } : {}),
                    }
                },
                {
                    model: codejournals,
                    attributes: ['code'],
                    where:
                    {
                        ...(journal ? { code: journal } : {}),
                    }
                }
            ]
        });

        const id_ecritures = [...new Set(journalData.map(val => val.id_ecriture))];

        const journalFinal = await journals.findAll({
            where: {
                id_ecriture: id_ecritures,
                id_compte,
                id_dossier,
                id_exercice
            },
            include: [
                { model: dossierplancomptable, attributes: ['compte'] },
                { model: codejournals, attributes: ['code'] }
            ],
            order: [
                // ['id_ecriture', 'ASC'],
                // ['dateecriture', 'ASC'],
                // ['id', 'ASC']
                ['createdAt', 'DESC']
            ]
        })

        const mappedData = journalFinal.map(journal => {
            const { dossierplancomptable, codejournal, ...rest } = journal.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
                journal: codejournal?.code || null
            };
        });

        return res.json({ state: true, list: mappedData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
    }
};

function nextLettrage(current) {
    if (!current) return 'A';

    const chars = current.toUpperCase().split('');
    let i = chars.length - 1;

    while (i >= 0) {
        if (chars[i] !== 'Z') {
            chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
            for (let j = i + 1; j < chars.length; j++) {
                chars[j] = 'A';
            }
            return chars.join('');
        }
        i--;
    }
    return 'A'.repeat(current.length + 1);
}

exports.addLettrage = async (req, res) => {
    try {
        const { data, id_compte, id_dossier, id_exercice } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0 || !id_compte || !id_dossier || !id_exercice) {
            return res.status(400).json({ state: false, message: 'Données manquantes ou invalides' });
        }

        const dernierLettrage = await journals.max('lettrage', {
            where: {
                id_compte,
                id_dossier,
                id_exercice,
            }
        });

        const nouveauLettrage = nextLettrage(dernierLettrage);

        await journals.update(
            { lettrage: nouveauLettrage },
            {
                where: {
                    id: data,
                }
            }
        );

        return res.status(200).json({
            state: true,
            message: `Lettrage "${nouveauLettrage}" ajouté avec succès à ${data.length} lignes`,
            lettrage: nouveauLettrage
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};

exports.deleteLettrage = async (req, res) => {
    try {
        const { data, id_compte, id_dossier, id_exercice } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0 || !id_compte || !id_dossier || !id_exercice) {
            return res.status(400).json({ state: false, message: 'Données manquantes ou invalides' });
        }

        const nouveauLettrage = await journals.update(
            { lettrage: "" },
            {
                where: {
                    id: data,
                }
            }
        );

        return res.status(200).json({
            state: true,
            message: `Lettrage "${nouveauLettrage}" supprimé avec succès à ${data.length} lignes`,
            lettrage: nouveauLettrage
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};

exports.deleteJournal = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ state: false, msg: "Aucun ID fourni" });
        }

        const journal = await journals.findOne({
            where: { id: ids[0] }
        });

        if (journal?.fichier) {
            const filePath = path.resolve(process.cwd(), journal.fichier);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                } else {
                    console.warn("Fichier introuvable :", filePath);
                }
            } catch (err) {
                console.warn("Erreur suppression fichier :", err.message);
            }
        }

        const result = await journals.destroy({
            where: {
                id: ids
            }
        });

        return res.json({
            state: result > 0,
            msg: result > 0 ? "Lignes supprimées avec succès" : "Aucune ligne supprimée"
        });

    } catch (error) {
        console.error("Erreur deleteJournal :", error);
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};
