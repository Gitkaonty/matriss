const db = require("../../Models");
require('dotenv').config();
const devises = db.devises;
const journals = db.journals;
const dossierplancomptable = db.dossierplancomptable;
const codejournals = db.codejournals;
const analytiques = db.analytiques;

const fs = require('fs');
const path = require('path');

// Fonction pour plurieliser un mot
function pluralize(count, word) {
    return count > 1 ? word + 's' : word;
}

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
        if (!id_dossier) {
            return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' })
        }
        if (!id_exercice) {
            return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' })
        }
        const journalData = await journals.findAll({
            where: {
                id_compte,
                id_dossier,
                id_exercice
            },
            include: [
                {
                    model: dossierplancomptable,
                    attributes: ['compte']
                },
                {
                    model: codejournals,
                    attributes: ['code']
                }
            ],
            order: [
                ['id_ecriture', 'ASC'],
                ['id', 'DESC'],
                [dossierplancomptable, 'compte', 'ASC'],
                ['dateecriture', 'ASC']
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
