const db = require("../../Models");
require('dotenv').config();


const devises = db.devises;
const journals = db.journals;
const dossierplancomptable = db.dossierplancomptable;
const codejournals = db.codejournals;
const rapprochements = db.rapprochements;
const analytiques = db.analytiques;
const balances = db.balances;
const consolidationDossier = db.consolidationDossier;
const dossiers = db.dossiers;
const exercices = db.exercices;

const fonctionUpdateBalanceSold = require("../../Middlewares/UpdateSolde/updateBalanceSold");

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
        const rapproId = Number(req.query?.rapproId);
        const endDateParam = req.query?.endDate; // requis pour la ligne sélectionnée
        const soldeBancaireParam = req.query?.soldeBancaire; // optionnel
        if (!fileId || !compteId || !exerciceId || !pcId || !endDateParam || !rapproId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const exo = await db.exercices.findByPk(exerciceId);
        if (!exo) return res.status(404).json({ state: false, msg: 'Exercice introuvable' });
        const dateDebut = exo.date_debut ? String(exo.date_debut).substring(0, 10) : null;
        const dateFin = endDateParam ? String(endDateParam).substring(0, 10) : null;
        if (!dateDebut || !dateFin) return res.status(400).json({ state: false, msg: 'Dates invalides' });
        try {
            console.debug('[RAPPRO][COMPUTE][INPUT]', { fileId, compteId, exerciceId, pcId, rapproId, endDateParam, dateDebut, dateFin, soldeBancaireParam });
        } catch { }

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

        // Total de TOUTES les écritures (pour solde_comptable)
        // sous-ensemble identique au grid: NON rapprochées
        // + rapprochées dont la date_rapprochement = dateFin sélectionnée
        const sqlAll = `SELECT COALESCE(SUM(j.credit),0) AS sum_credit, COALESCE(SUM(j.debit),0) AS sum_debit ${sqlAggBase}
                        AND ( (CASE WHEN j.rapprocher THEN 1 ELSE 0 END) = 0
                              OR ( (CASE WHEN j.rapprocher THEN 1 ELSE 0 END) = 1 AND j.date_rapprochement = :dateFin )
                            )`;
        // Total des écritures NON rapprochées uniquement (rapprocher = false)
        const sqlNonRapp = `SELECT COALESCE(SUM(j.credit),0) AS sum_credit, COALESCE(SUM(j.debit),0) AS sum_debit ${sqlAggBase}
                            AND (CASE WHEN j.rapprocher THEN 1 ELSE 0 END) = 0`;

        const [totAll] = await db.sequelize.query(sqlAll, {
            replacements: { fileId, compteId, exerciceId, pcId, dateDebut, dateFin },
            type: db.Sequelize.QueryTypes.SELECT,
        });
        const [totNonRapp] = await db.sequelize.query(sqlNonRapp, {
            replacements: { fileId, compteId, exerciceId, pcId, dateDebut, dateFin },
            type: db.Sequelize.QueryTypes.SELECT,
        });

        // Utiliser la même convention que le grid: Débit - Crédit
        const totalAll = (Number(totAll.sum_debit) || 0) - (Number(totAll.sum_credit) || 0);
        const totalNonRapp = (Number(totNonRapp.sum_debit) || 0) - (Number(totNonRapp.sum_credit) || 0);

        // solde comptable = total Débit - Crédit sur TOUTES les écritures
        const solde_comptable = totalAll;
        // solde lignes non rapprochées = total Débit - Crédit sur les lignes NON rapprochées uniquement
        const solde_non_rapproche = totalNonRapp;

        const solde_bancaire = soldeBancaireParam !== undefined && soldeBancaireParam !== null ? Number(soldeBancaireParam) : null;
        const ecart = typeof solde_bancaire === 'number' && !isNaN(solde_bancaire)
            ? (solde_comptable - solde_bancaire - solde_non_rapproche)
            : null;

        const payload = { state: true, solde_comptable, solde_non_rapproche, solde_bancaire, ecart };
        try {
            console.debug('[RAPPRO][COMPUTE][RESULT]', { totals: { totAll, totNonRapp, totalAll, totalNonRapp }, payload });
        } catch { }

        // Persister immédiatement les soldes sur la ligne de rapprochement concernée
        try {
            await rapprochements.update(
                {
                    solde_comptable,
                    solde_non_rapproche,
                    // on met à jour solde_bancaire seulement s'il est fourni
                    ...(typeof solde_bancaire === 'number' && !isNaN(solde_bancaire) ? { solde_bancaire } : {}),
                    ecart,
                },
                {
                    where: {
                        id: rapproId,
                        id_dossier: fileId,
                        id_compte: compteId,
                        id_exercice: exerciceId,
                        pc_id: pcId,
                    },
                }
            );
        } catch (errUpdate) {
            console.error('[RAPPRO][COMPUTE][UPDATE_RAPPRO] error:', errUpdate);
        }

        return res.json(payload);

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

// --- Immobilisations: comptes de classe 2 (hors 28 et 29) ---
exports.listImmobilisationsPc2 = async (req, res) => {
    try {
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        if (!fileId || !compteId || !exerciceId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }

        // Lister tous les comptes d'immobilisations (classe 2 hors 28 et 29)
        // Solde calculé directement à partir des journaux: SUM(debit) - SUM(credit)
        // Compte d'amortissement déduit (ex: 20100 -> 28010) puis recherché dans le plan comptable.
        const sql = `
            SELECT
              pc.pc_id AS id,
              pc.compte,
              pc.libelle,
              pc_amort.id AS compte_amort_id,
              pc_amort.compte AS compte_amort,
              -- Solde sur le compte d'immobilisation (journals j)
              (
                SELECT COALESCE(SUM(j1.debit), 0)
                FROM journals j1
                WHERE j1.id_numcpt = pc.pc_id
                  AND j1.id_compte = :compteId
                  AND j1.id_dossier = :fileId
                  AND j1.id_exercice = :exerciceId
              ) AS mvtdebit,
              (
                SELECT COALESCE(SUM(j1.credit), 0)
                FROM journals j1
                WHERE j1.id_numcpt = pc.pc_id
                  AND j1.id_compte = :compteId
                  AND j1.id_dossier = :fileId
                  AND j1.id_exercice = :exerciceId
              ) AS mvtcredit,
              (
                SELECT COALESCE(SUM(j1.debit), 0) - COALESCE(SUM(j1.credit), 0)
                FROM journals j1
                WHERE j1.id_numcpt = pc.pc_id
                  AND j1.id_compte = :compteId
                  AND j1.id_dossier = :fileId
                  AND j1.id_exercice = :exerciceId
              ) AS solde,
              -- Amortissement antérieur: compte d'amort, journaux type A_NOUVEAU
              (
                SELECT
                  COALESCE(SUM(CASE WHEN cj1.type = 'A_NOUVEAU' THEN ja1.credit ELSE 0 END), 0)
                  - COALESCE(SUM(CASE WHEN cj1.type = 'A_NOUVEAU' THEN ja1.debit ELSE 0 END), 0)
                FROM journals ja1
                LEFT JOIN codejournals cj1 ON cj1.id = ja1.id_journal
                WHERE ja1.id_numcpt = pc_amort.id
                  AND ja1.id_compte = :compteId
                  AND ja1.id_dossier = :fileId
                  AND ja1.id_exercice = :exerciceId
              ) AS amort_ant,
              -- Dotation: compte d'amort, journaux type <> A_NOUVEAU (ou sans type)
              (
                SELECT
                  COALESCE(SUM(CASE WHEN cj2.type <> 'A_NOUVEAU' OR cj2.type IS NULL THEN ja2.credit ELSE 0 END), 0)
                  - COALESCE(SUM(CASE WHEN cj2.type <> 'A_NOUVEAU' OR cj2.type IS NULL THEN ja2.debit ELSE 0 END), 0)
                FROM journals ja2
                LEFT JOIN codejournals cj2 ON cj2.id = ja2.id_journal
                WHERE ja2.id_numcpt = pc_amort.id
                  AND ja2.id_compte = :compteId
                  AND ja2.id_dossier = :fileId
                  AND ja2.id_exercice = :exerciceId
              ) AS dotation,
              -- Valeur nette et VNC immo: solde - amort_ant - dotation
              (
                (
                  SELECT COALESCE(SUM(j1.debit), 0) - COALESCE(SUM(j1.credit), 0)
                  FROM journals j1
                  WHERE j1.id_numcpt = pc.pc_id
                    AND j1.id_compte = :compteId
                    AND j1.id_dossier = :fileId
                    AND j1.id_exercice = :exerciceId
                )
                - (
                  SELECT
                    COALESCE(SUM(CASE WHEN cj1.type = 'A_NOUVEAU' THEN ja1.credit ELSE 0 END), 0)
                    - COALESCE(SUM(CASE WHEN cj1.type = 'A_NOUVEAU' THEN ja1.debit ELSE 0 END), 0)
                  FROM journals ja1
                  LEFT JOIN codejournals cj1 ON cj1.id = ja1.id_journal
                  WHERE ja1.id_numcpt = pc_amort.id
                    AND ja1.id_compte = :compteId
                    AND ja1.id_dossier = :fileId
                    AND ja1.id_exercice = :exerciceId
                )
                - (
                  SELECT
                    COALESCE(SUM(CASE WHEN cj2.type <> 'A_NOUVEAU' OR cj2.type IS NULL THEN ja2.credit ELSE 0 END), 0)
                    - COALESCE(SUM(CASE WHEN cj2.type <> 'A_NOUVEAU' OR cj2.type IS NULL THEN ja2.debit ELSE 0 END), 0)
                  FROM journals ja2
                  LEFT JOIN codejournals cj2 ON cj2.id = ja2.id_journal
                  WHERE ja2.id_numcpt = pc_amort.id
                    AND ja2.id_compte = :compteId
                    AND ja2.id_dossier = :fileId
                    AND ja2.id_exercice = :exerciceId
                )
              ) AS valeur_nette,
              (
                (
                  SELECT COALESCE(SUM(j1.debit), 0) - COALESCE(SUM(j1.credit), 0)
                  FROM journals j1
                  WHERE j1.id_numcpt = pc.pc_id
                    AND j1.id_compte = :compteId
                    AND j1.id_dossier = :fileId
                    AND j1.id_exercice = :exerciceId
                )
                - (
                  SELECT
                    COALESCE(SUM(CASE WHEN cj1.type = 'A_NOUVEAU' THEN ja1.credit ELSE 0 END), 0)
                    - COALESCE(SUM(CASE WHEN cj1.type = 'A_NOUVEAU' THEN ja1.debit ELSE 0 END), 0)
                  FROM journals ja1
                  LEFT JOIN codejournals cj1 ON cj1.id = ja1.id_journal
                  WHERE ja1.id_numcpt = pc_amort.id
                    AND ja1.id_compte = :compteId
                    AND ja1.id_dossier = :fileId
                    AND ja1.id_exercice = :exerciceId
                )
                - (
                  SELECT
                    COALESCE(SUM(CASE WHEN cj2.type <> 'A_NOUVEAU' OR cj2.type IS NULL THEN ja2.credit ELSE 0 END), 0)
                    - COALESCE(SUM(CASE WHEN cj2.type <> 'A_NOUVEAU' OR cj2.type IS NULL THEN ja2.debit ELSE 0 END), 0)
                  FROM journals ja2
                  LEFT JOIN codejournals cj2 ON cj2.id = ja2.id_journal
                  WHERE ja2.id_numcpt = pc_amort.id
                    AND ja2.id_compte = :compteId
                    AND ja2.id_dossier = :fileId
                    AND ja2.id_exercice = :exerciceId
                )
              ) AS vnc_immo
            FROM (
              SELECT
                MIN(id) AS pc_id,
                compte,
                MIN(libelle) AS libelle,
                id_compte,
                id_dossier
                FROM dossierplancomptables
                WHERE id_dossier = :fileId
                AND id_compte = :compteId
                AND compte LIKE '2%'
                AND compte NOT LIKE '28%'
                AND compte NOT LIKE '29%'
                GROUP BY compte, id_compte, id_dossier
            ) pc
            LEFT JOIN dossierplancomptables pc_amort
              ON pc_amort.id_compte = pc.id_compte
              AND pc_amort.id_dossier = pc.id_dossier
              AND pc_amort.compte = CONCAT(
                SUBSTRING(pc.compte, 1, 1),
                '8',
                SUBSTRING(pc.compte, 2, CHAR_LENGTH(pc.compte) - 2)
              )
            ORDER BY pc.compte ASC
        `;
        const rows = await db.sequelize.query(sql, {
            replacements: { fileId, compteId, exerciceId },
            type: db.Sequelize.QueryTypes.SELECT,
        });
        return res.json({ state: true, list: rows || [] });
    } catch (err) {
        console.error('[IMMO][PCS] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Immobilisations: lignes d'amortissement par immobilisation (details_immo_lignes) ---
exports.listDetailsImmoLignes = async (req, res) => {
    try {
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        const detailImmoId = Number(req.query?.detailId);
        if (!fileId || !compteId || !exerciceId || !detailImmoId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const rows = await db.detailsImmoLignes.findAll({
            where: {
                id_dossier: fileId,
                id_compte: compteId,
                id_exercice: exerciceId,
                id_detail_immo: detailImmoId,
            },
            order: [['id', 'ASC']],
        });
        return res.json({ state: true, list: rows || [] });
    } catch (err) {
        console.error('[IMMO][LIGNES] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Immobilisations: aperçu calcul amortissement linéaire (sans sauvegarde) ---

exports.previewImmoLineaire = async (req, res) => {
    try {
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        const detailImmoId = Number(req.query?.detailId);

        if (!fileId || !compteId || !exerciceId || !detailImmoId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }

        const [dossier, exo, detail] = await Promise.all([
            db.dossiers.findByPk(fileId),
            db.exercices.findByPk(exerciceId),
            db.detailsimmo.findByPk(detailImmoId),
        ]);
        if (!dossier || !exo || !detail) {
            return res.status(404).json({ state: false, msg: 'Données introuvables' });
        }

        // -----------------------------
        // PARAMÈTRES DE BASE
        // -----------------------------
        const baseJours = Number(dossier.immo_amort_base_jours) || 360;
        const montantHT = Number(detail.montant_ht) || Number(detail.montant) || 0;
        const dateMS = new Date(detail.date_mise_service);
        const exoDebut = exo.date_debut ? new Date(exo.date_debut) : null;
        const exoFin = exo.date_fin ? new Date(exo.date_fin) : null;

        const dureeCompInitiale = Math.max(1, Number(detail.duree_amort_mois) || 0);
        const dureeFisc = Math.max(0, Math.floor(Number(detail.duree_amort_mois_fisc) || 0));

        // -----------------------------
        // DONNÉES DE REPRISE (séparées comptable / fiscal)
        // -----------------------------
        const repriseActiveComp = Number(
            detail.reprise_immobilisation_comp ?? detail.reprise_immobilisation
        ) === 1;
        const dateRepriseComp = (detail.date_reprise_comp || detail.date_reprise)
            ? new Date(detail.date_reprise_comp || detail.date_reprise)
            : null;
        const amortAntComp = Number(detail.amort_ant_comp) || 0;

        const repriseActiveFisc = Number(
            detail.reprise_immobilisation_fisc ?? detail.reprise_immobilisation
        ) === 1;
        const dateRepriseFisc = (detail.date_reprise_fisc || detail.date_reprise)
            ? new Date(detail.date_reprise_fisc || detail.date_reprise)
            : null;
        const amortAntFisc = Number(detail.amort_ant_fisc) || 0;

        if (exoDebut && !isNaN(exoDebut.getTime()) && exoFin && !isNaN(exoFin.getTime())) {
            if (repriseActiveComp && dateRepriseComp && !isNaN(dateRepriseComp.getTime()) && (dateRepriseComp < exoDebut || dateRepriseComp > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise comptable hors période de l'exercice" });
            }
            if (repriseActiveFisc && dateRepriseFisc && !isNaN(dateRepriseFisc.getTime()) && (dateRepriseFisc < exoDebut || dateRepriseFisc > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise fiscale hors période de l'exercice" });
            }
        }

        // -----------------------------
        // OUTILS
        // -----------------------------
        const addMonths = (d, m) => { const nd = new Date(d); nd.setMonth(nd.getMonth() + m); return nd; };
        const addDays = (d, n) => { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; };
        const minDate = (a, b) => (a <= b ? a : b);
        const toYMD = d => d.toISOString().substring(0, 10);
        const clamp = v => Math.round((v + 0.0000001) * 100) / 100;

        const nbJoursBetween = (debut, fin) => {
            if (baseJours === 360) {
                const dStart = Math.min(debut.getDate(), 30);
                const dEnd = Math.min(fin.getDate(), 30);
                const monthsDiff = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
                if (monthsDiff === 0) return Math.max(1, dEnd - dStart + 1);
                return (30 - dStart + 1) + Math.max(0, monthsDiff - 1) * 30 + dEnd;
            }
            return Math.floor((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
        };

        // -----------------------------
        // CALCUL DE LA REPRISE (COMPTABLE)
        // -----------------------------
        let dateDepartAmortComp = new Date(dateMS);
        let dureeAmortCompEffective = dureeCompInitiale;
        let cumulInitialComp = 0;

        if (repriseActiveComp && dateRepriseComp && amortAntComp > 0) {
            const finTheo = addDays(addMonths(dateMS, dureeCompInitiale), -1);
            if (dateRepriseComp <= finTheo) {
                const joursRestants = nbJoursBetween(dateRepriseComp, finTheo);
                dureeAmortCompEffective = clamp((joursRestants / baseJours) * 12);
                dateDepartAmortComp = new Date(dateRepriseComp);
                cumulInitialComp = amortAntComp;
            }
        }

        // -----------------------------
        // AMORTISSEMENT COMPTABLE
        // -----------------------------
        const tauxAnnuelComp = 12 / dureeAmortCompEffective;
        const baseRestanteComp = clamp(montantHT - cumulInitialComp);
        const compLines = [];

        let debutC = new Date(dateDepartAmortComp);
        const finAmortComp = addDays(addMonths(dateDepartAmortComp, dureeAmortCompEffective), -1);
        let indexC = 1;
        let cumulC = cumulInitialComp;
        let vncC = clamp(montantHT - cumulInitialComp);
        let safetyC = 0;

        while (vncC > 0 && safetyC < 1000) {
            if (debutC > finAmortComp) break;

            let fin = indexC === 1
                ? (exoFin && exoFin < finAmortComp ? exoFin : finAmortComp)
                : addDays(addMonths(debutC, 12), -1);

            if (fin > finAmortComp) fin = finAmortComp;

            if (fin < debutC) {
                fin = minDate(addDays(addMonths(debutC, 1), -1), finAmortComp);
                if (fin < debutC) break;
            }

            const nbJours = nbJoursBetween(debutC, fin);
            if (!isFinite(nbJours) || nbJours <= 0) break;

            const anneeNombre = clamp(nbJours / baseJours);
            const dotTheorique = clamp(baseRestanteComp * tauxAnnuelComp * anneeNombre);

            let dot;
            if (fin >= finAmortComp || vncC - dotTheorique < 1) {
                dot = vncC;
            } else {
                dot = Math.min(vncC, dotTheorique);
            }

            compLines.push({
                rang: indexC,
                date_debut: toYMD(debutC),
                date_fin: toYMD(fin),
                nb_jours: nbJours,
                annee_nombre: anneeNombre,
                dotation_mensuelle: clamp(baseRestanteComp / dureeCompInitiale),
                dot_ant: clamp(cumulC),
                dotation_annuelle: dot,
                cumul_amort: clamp(cumulC + dot),
                vnc: clamp(vncC - dot),
            });

            cumulC += dot;
            vncC -= dot;
            debutC = addDays(fin, 1);
            indexC++;
            safetyC++;
        }

        // -----------------------------
        // AMORTISSEMENT FISCAL (avec reprise séparée)
        // -----------------------------
        let fiscLines = [];
        let dureeFiscEffectiveOut = null;
        let finAmortFiscOut = null;
        if (dureeFisc > 0) {
            let debutF = new Date(dateMS);
            let dureeFiscEffective = dureeFisc;
            let cumulInitialFisc = 0;

            if (repriseActiveFisc && dateRepriseFisc && amortAntFisc > 0) {
                const finTheoF = addDays(addMonths(dateMS, dureeFisc), -1);
                if (dateRepriseFisc <= finTheoF) {
                    const joursRestantsF = nbJoursBetween(dateRepriseFisc, finTheoF);
                    dureeFiscEffective = clamp((joursRestantsF / baseJours) * 12);
                    debutF = new Date(dateRepriseFisc);
                    cumulInitialFisc = amortAntFisc;
                }
            }

            const tauxAnnuelFisc = 12 / dureeFiscEffective;
            const baseRestanteFisc = clamp(montantHT - cumulInitialFisc);
            const finAmortFisc = addDays(addMonths(debutF, dureeFiscEffective), -1);
            dureeFiscEffectiveOut = dureeFiscEffective;
            finAmortFiscOut = finAmortFisc;

            let indexF = 1;
            let cumulF = cumulInitialFisc;
            let vncF = clamp(montantHT - cumulInitialFisc);
            let safetyF = 0;

            while (vncF > 0 && safetyF < 1000) {
                if (debutF > finAmortFisc) break;

                let fin = indexF === 1
                    ? (exoFin && exoFin < finAmortFisc ? exoFin : finAmortFisc)
                    : addDays(addMonths(debutF, 12), -1);

                if (fin > finAmortFisc) fin = finAmortFisc;

                if (fin < debutF) {
                    fin = minDate(addDays(addMonths(debutF, 1), -1), finAmortFisc);
                    if (fin < debutF) break;
                }

                const nbJours = nbJoursBetween(debutF, fin);
                if (!isFinite(nbJours) || nbJours <= 0) break;

                const anneeNombre = clamp(nbJours / baseJours);
                const dotTheorique = clamp(baseRestanteFisc * tauxAnnuelFisc * anneeNombre);

                let dot;
                if (fin >= finAmortFisc || vncF - dotTheorique < 1) {
                    dot = vncF;
                } else {
                    dot = Math.min(vncF, dotTheorique);
                }

                fiscLines.push({
                    rang: indexF,
                    date_debut: toYMD(debutF),
                    date_fin: toYMD(fin),
                    nb_jours: nbJours,
                    annee_nombre: anneeNombre,
                    dotation_mensuelle: clamp(baseRestanteFisc / dureeFisc),
                    dot_ant: clamp(cumulF),
                    dotation_annuelle: dot,
                    cumul_amort: clamp(cumulF + dot),
                    vnc: clamp(vncF - dot),
                });

                cumulF += dot;
                vncF -= dot;
                debutF = addDays(fin, 1);
                indexF++;
                safetyF++;
            }
        }

        // -----------------------------
        // RÉPONSE
        // -----------------------------
        return res.json({
            state: true,
            meta: {
                base_jours: baseJours,
                montant_ht: montantHT,
                date_mise_service: toYMD(dateMS),
                // Back-compat: reprise = reprise comptable
                reprise: repriseActiveComp && dateRepriseComp ? {
                    date_reprise: toYMD(dateRepriseComp),
                    amort_ant: amortAntComp,
                    duree_restante_mois: dureeAmortCompEffective
                } : null,
                reprise_comp: repriseActiveComp && dateRepriseComp ? {
                    date_reprise: toYMD(dateRepriseComp),
                    amort_ant: amortAntComp,
                    duree_restante_mois: dureeAmortCompEffective
                } : null,
                reprise_fisc: repriseActiveFisc && dateRepriseFisc ? {
                    date_reprise: toYMD(dateRepriseFisc),
                    amort_ant: amortAntFisc,
                    duree_restante_mois: dureeFiscEffectiveOut
                } : null,
                fin_amort_comp: toYMD(finAmortComp),
                fin_amort_fisc: finAmortFiscOut ? toYMD(finAmortFiscOut) : null,
            },

            list_comp: compLines,
            list_fisc: fiscLines,
        });

    } catch (err) {
        console.error('[IMMO][LINEAIRE][PREVIEW] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Immobilisations: aperçu calcul amortissement degressif (sans sauvegarde) ---
exports.previewImmoDegressif = async (req, res) => {
    try {
        // 1. Récupération des paramètres depuis la requête
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        const detailImmoId = Number(req.query?.detailId);

        if (!fileId || !compteId || !exerciceId || !detailImmoId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }

        // 2. Récupération des données dans la base (dossier, exercice, détail d'immobilisation)
        const [dossier, exo, detail] = await Promise.all([
            db.dossiers.findByPk(fileId),
            db.exercices.findByPk(exerciceId),
            db.detailsimmo.findByPk(detailImmoId),
        ]);
        if (!dossier || !exo || !detail) {
            return res.status(404).json({ state: false, msg: 'Données introuvables' });
        }

        // 3. Initialisation des variables principales
        const baseJours = Number(dossier.immo_amort_base_jours) || 360; // base de calcul (par défaut 360 jours)
        const montantHT = Number(detail.montant_ht) || Number(detail.montant) || 0; // valeur de l'immobilisation
        const dateMS = detail.date_mise_service ? new Date(detail.date_mise_service) : null;
        if (!dateMS || isNaN(dateMS.getTime())) return res.status(400).json({ state: false, msg: 'date_mise_service invalide' });
        if (montantHT <= 0) return res.status(400).json({ state: false, msg: 'montant HT invalide' });

        const exoDebut = exo.date_debut ? new Date(exo.date_debut) : null;
        const exoFin = exo.date_fin ? new Date(exo.date_fin) : null;

        const repriseActiveComp = Number(
            detail.reprise_immobilisation_comp ?? detail.reprise_immobilisation
        ) === 1;
        const dateRepriseComp = (detail.date_reprise_comp || detail.date_reprise)
            ? new Date(detail.date_reprise_comp || detail.date_reprise)
            : null;
        const amortAntComp = Number(detail.amort_ant_comp) || 0;

        const repriseActiveFisc = Number(
            detail.reprise_immobilisation_fisc ?? detail.reprise_immobilisation
        ) === 1;
        const dateRepriseFisc = (detail.date_reprise_fisc || detail.date_reprise)
            ? new Date(detail.date_reprise_fisc || detail.date_reprise)
            : null;
        const amortAntFisc = Number(detail.amort_ant_fisc) || 0;

        if (exoDebut && !isNaN(exoDebut.getTime()) && exoFin && !isNaN(exoFin.getTime())) {
            if (repriseActiveComp && dateRepriseComp && !isNaN(dateRepriseComp.getTime()) && (dateRepriseComp < exoDebut || dateRepriseComp > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise comptable hors période de l'exercice" });
            }
            if (repriseActiveFisc && dateRepriseFisc && !isNaN(dateRepriseFisc.getTime()) && (dateRepriseFisc < exoDebut || dateRepriseFisc > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise fiscale hors période de l'exercice" });
            }
        }

        // 4. Durée d'amortissement en mois et en années
        const dureeMois = Math.max(1, Number(detail.duree_amort_mois) || 0);
        const dureeAnnees = Math.ceil(dureeMois / 12);

        // 5. Détermination du coefficient dégressif selon la durée
        let coef = 0;
        if (dureeAnnees >= 1 && dureeAnnees <= 4) coef = 1.25;
        else if (dureeAnnees >= 5 && dureeAnnees <= 6) coef = 1.75;
        else if (dureeAnnees > 6) coef = 2.25;

        // 6. Calcul des taux annuels linéaire et dégressif
        const tauxLinAnnuel = 1 / dureeAnnees;
        const tauxDegAnnuel = tauxLinAnnuel * coef;

        // 7. Fonctions utilitaires
        const addMonths = (d, m) => { const nd = new Date(d); nd.setMonth(nd.getMonth() + m); return nd; }; // ajoute des mois à une date
        const addDays = (d, n) => { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; }; // ajoute des jours à une date
        const minDate = (a, b) => (a <= b ? a : b); // retourne la date la plus petite
        const toYMD = d => d.toISOString().substring(0, 10); // format YYYY-MM-DD
        const clamp = v => Math.round((v + 0.0000001) * 100) / 100; // arrondi à 2 décimales (optionnel)

        const nbJoursBetween = (debut, fin) => {
            if (baseJours === 360) {
                const dStart = Math.min(debut.getDate(), 30);
                const dEnd = Math.min(fin.getDate(), 30);
                const monthsDiff = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
                if (monthsDiff === 0) return Math.max(1, dEnd - dStart + 1);
                return (30 - dStart + 1) + Math.max(0, monthsDiff - 1) * 30 + dEnd;
            }
            return Math.floor((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
        };

        const computeRepriseParams = (dureeMoisX, repriseActiveX, dateRepriseX, amortAntX) => {
            const dureeM = Math.max(1, Number(dureeMoisX) || 0);
            const finTheoX = addDays(addMonths(dateMS, dureeM), -1);

            let dateDepartX = new Date(dateMS);
            let dureeMEffective = dureeM;
            let cumulInitialX = 0;

            if (repriseActiveX && dateRepriseX && amortAntX > 0 && dateRepriseX <= finTheoX) {
                const joursRestantsX = nbJoursBetween(dateRepriseX, finTheoX);
                dureeMEffective = clamp((joursRestantsX / baseJours) * 12);
                dateDepartX = new Date(dateRepriseX);
                cumulInitialX = amortAntX;
            }

            const finAmortX = addDays(addMonths(dateDepartX, dureeMEffective), -1);
            const baseRestanteX = clamp(montantHT - cumulInitialX);
            return { dureeM, finTheoX, dateDepartX, dureeMEffective, cumulInitialX, finAmortX, baseRestanteX };
        };

        // 8. Constructeur générique d'un tableau dégressif avec bascule linéaire
        const buildDegSchedule = (dureeMoisX, repriseActiveX, dateRepriseX, amortAntX, labelX) => {
            const rp = computeRepriseParams(dureeMoisX, repriseActiveX, dateRepriseX, amortAntX);
            const dureeA = Math.ceil(rp.dureeMEffective / 12);

            let coefX = 0;
            if (dureeA >= 1 && dureeA <= 4) coefX = 1.25;
            else if (dureeA >= 5 && dureeA <= 6) coefX = 1.75;
            else if (dureeA > 6) coefX = 2.25;

            const tauxLinX = 1 / dureeA;
            const tauxDegX = tauxLinX * coefX;
            const exoFin = exo.date_fin ? new Date(exo.date_fin) : null;

            const linesX = [];
            let vncX = clamp(montantHT - rp.cumulInitialX);
            let cumulX = clamp(rp.cumulInitialX);
            let debutX = new Date(rp.dateDepartX);
            let anneeCumuleeX = 0;
            let indexX = 1;
            let safetyX = 0;
            let modeX = 'degressif';
            let didSwitchLogX = false;

            while (vncX > 0 && safetyX < 1000) {
                if (debutX > rp.finAmortX) break;

                let finX = indexX === 1
                    ? (exoFin && exoFin < rp.finAmortX ? exoFin : rp.finAmortX)
                    : addDays(addMonths(debutX, 12), -1);
                if (finX > rp.finAmortX) finX = rp.finAmortX;
                if (finX < debutX) {
                    finX = minDate(addDays(addMonths(debutX, 1), -1), rp.finAmortX);
                    if (finX < debutX) break;
                }

                const isLastX = finX.getTime() === rp.finAmortX.getTime();
                const nbJoursX = nbJoursBetween(debutX, finX);
                if (!isFinite(nbJoursX) || nbJoursX <= 0) break;
                const prorataX = nbJoursX / baseJours;

                const dureeRestanteX = Math.max(1e-9, dureeA - anneeCumuleeX);
                const dotDegAnnX = vncX * tauxDegX;
                const dotLinRestAnnX = vncX / dureeRestanteX;
                if (modeX === 'degressif' && dotLinRestAnnX > dotDegAnnX) {
                    if (!didSwitchLogX) {
                        console.log('[IMMO][DEGRESSIF][SWITCH->LINEAIRE]', {
                            tab: labelX,
                            rang: indexX,
                            date_debut: toYMD(debutX),
                            date_fin_prevue: toYMD(finX),
                            vnc: clamp(vncX),
                            duree_restante_annees: clamp(dureeRestanteX),
                            dot_deg_annuel: clamp(dotDegAnnX),
                            dot_lin_rest_annuel: clamp(dotLinRestAnnX),
                        });
                        didSwitchLogX = true;
                    }
                    modeX = 'lineaire';
                }

                let dotPeriodeX = modeX === 'degressif'
                    ? (vncX * tauxDegX * prorataX)
                    : (dotLinRestAnnX * prorataX);

                if (isLastX || vncX - dotPeriodeX < 0.01) {
                    dotPeriodeX = vncX;
                }

                dotPeriodeX = clamp(dotPeriodeX);
                const antX = clamp(cumulX);
                cumulX = clamp(cumulX + dotPeriodeX);
                vncX = clamp(montantHT - cumulX);

                linesX.push({
                    rang: indexX,
                    date_debut: toYMD(debutX),
                    date_fin: toYMD(finX),
                    nb_jours: nbJoursX,
                    annee_nombre: clamp(prorataX),
                    mode_utilise: modeX,
                    dot_ant: antX,
                    dotation_annuelle: dotPeriodeX,
                    cumul_amort: cumulX,
                    vnc: vncX,
                });

                anneeCumuleeX += prorataX;
                if (vncX <= 0) break;
                debutX = addDays(finX, 1);
                indexX++;
                safetyX++;
            }

            return {
                coef: coefX,
                duree_mois: rp.dureeMEffective,
                duree_annees: dureeA,
                taux_lin_annuel: tauxLinX,
                taux_deg_annuel: tauxDegX,
                lines: linesX,
                finAmort: rp.finAmortX,
                reprise: repriseActiveX && dateRepriseX && rp.cumulInitialX > 0 ? {
                    date_reprise: toYMD(dateRepriseX),
                    amort_ant: rp.cumulInitialX,
                    duree_restante_mois: rp.dureeMEffective,
                } : null,
            };
        };

        // 9. Constructeur linéaire (prorata jours, 30/360 pris en compte)
        const buildLinSchedule = (dureeMoisX, repriseActiveX, dateRepriseX, amortAntX) => {
            const rp = computeRepriseParams(dureeMoisX, repriseActiveX, dateRepriseX, amortAntX);
            const dureeA = Math.ceil(rp.dureeMEffective / 12);
            const tauxLinX = 1 / dureeA;
            const exoFin = exo.date_fin ? new Date(exo.date_fin) : null;

            const linesX = [];
            let vncX = clamp(montantHT - rp.cumulInitialX);
            let cumulX = clamp(rp.cumulInitialX);
            let debutX = new Date(rp.dateDepartX);
            let indexX = 1;
            let safetyX = 0;

            while (vncX > 0 && safetyX < 1000) {
                if (debutX > rp.finAmortX) break;

                let finX = indexX === 1
                    ? (exoFin && exoFin < rp.finAmortX ? exoFin : rp.finAmortX)
                    : addDays(addMonths(debutX, 12), -1);
                if (finX > rp.finAmortX) finX = rp.finAmortX;
                if (finX < debutX) {
                    finX = minDate(addDays(addMonths(debutX, 1), -1), rp.finAmortX);
                    if (finX < debutX) break;
                }

                const nbJoursX = nbJoursBetween(debutX, finX);
                if (!isFinite(nbJoursX) || nbJoursX <= 0) break;
                const prorataX = nbJoursX / baseJours;

                let dotPeriodeX = rp.baseRestanteX * tauxLinX * prorataX;
                if (finX.getTime() === rp.finAmortX.getTime() || vncX - dotPeriodeX < 0.01) {
                    dotPeriodeX = vncX;
                }

                dotPeriodeX = clamp(dotPeriodeX);
                const antX = clamp(cumulX);
                cumulX = clamp(cumulX + dotPeriodeX);
                vncX = clamp(montantHT - cumulX);

                linesX.push({
                    rang: indexX,
                    date_debut: toYMD(debutX),
                    date_fin: toYMD(finX),
                    nb_jours: nbJoursX,
                    annee_nombre: clamp(prorataX),
                    mode_utilise: 'lineaire',
                    dot_ant: antX,
                    dotation_annuelle: dotPeriodeX,
                    cumul_amort: cumulX,
                    vnc: vncX,
                });

                if (vncX <= 0) break;
                debutX = addDays(finX, 1);
                indexX++;
                safetyX++;
            }

            return {
                coef: 0,
                duree_mois: rp.dureeMEffective,
                duree_annees: dureeA,
                taux_lin_annuel: tauxLinX,
                taux_deg_annuel: 0,
                lines: linesX,
                finAmort: rp.finAmortX,
                reprise: repriseActiveX && dateRepriseX && rp.cumulInitialX > 0 ? {
                    date_reprise: toYMD(dateRepriseX),
                    amort_ant: rp.cumulInitialX,
                    duree_restante_mois: rp.dureeMEffective,
                } : null,
            };
        };

        const normalizeNoAccent = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const typeComp = normalizeNoAccent(detail?.type_amort);
        const typeFisc = normalizeNoAccent(detail?.type_amort_fisc);

        const dureeMoisComp = Math.max(1, Number(detail.duree_amort_mois) || 0);
        const compIsDeg = typeComp.includes('degr');
        const resComp = compIsDeg
            ? buildDegSchedule(dureeMoisComp, repriseActiveComp, dateRepriseComp, amortAntComp, 'comptable')
            : buildLinSchedule(dureeMoisComp, repriseActiveComp, dateRepriseComp, amortAntComp);

        const dureeMoisFisc = Math.max(0, Math.floor(Number(detail.duree_amort_mois_fisc) || 0));
        const hasFisc = dureeMoisFisc > 0;
        const fiscIsDeg = typeFisc.includes('degr');
        const resFisc = hasFisc
            ? (fiscIsDeg
                ? buildDegSchedule(dureeMoisFisc, repriseActiveFisc, dateRepriseFisc, amortAntFisc, 'fiscal')
                : buildLinSchedule(dureeMoisFisc, repriseActiveFisc, dateRepriseFisc, amortAntFisc))
            : null;

        return res.json({
            state: true,
            meta: {
                base_jours: baseJours,
                montant_ht: montantHT,
                date_mise_service: toYMD(dateMS),
                // Back-compat: reprise = reprise comptable
                reprise: resComp.reprise,
                reprise_comp: resComp.reprise,
                reprise_fisc: resFisc ? resFisc.reprise : null,
                comp: {
                    coef_degressif: resComp.coef,
                    duree_mois: resComp.duree_mois,
                    duree_annees: resComp.duree_annees,
                    taux_lin_annuel: resComp.taux_lin_annuel,
                    taux_deg_annuel: resComp.taux_deg_annuel,
                    fin_amort_prevue: toYMD(resComp.finAmort),
                },
                fisc: hasFisc ? {
                    coef_degressif: resFisc.coef,
                    duree_mois: resFisc.duree_mois,
                    duree_annees: resFisc.duree_annees,
                    taux_lin_annuel: resFisc.taux_lin_annuel,
                    taux_deg_annuel: resFisc.taux_deg_annuel,
                    fin_amort_prevue: toYMD(resFisc.finAmort),
                } : null,
            },
            list_comp: resComp.lines,
            list_fisc: hasFisc ? resFisc.lines : [],
        });

    } catch (err) {
        console.error('[IMMO][DEGRESSIF][PREVIEW] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

// --- Immobilisations: calcul + sauvegarde des lignes d'amortissement linéaire ---
exports.saveImmoLineaire = async (req, res) => {
    try {
        const fileId = Number(req.body?.fileId ?? req.query?.fileId);
        const compteId = Number(req.body?.compteId ?? req.query?.compteId);
        const exerciceId = Number(req.body?.exerciceId ?? req.query?.exerciceId);
        const detailImmoId = Number(req.body?.detailId ?? req.query?.detailId);
        const modeParam = String((req.body?.mode ?? req.query?.mode) || '').toLowerCase();

        if (!fileId || !compteId || !exerciceId || !detailImmoId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }

        const [dossier, exo, detail] = await Promise.all([
            db.dossiers.findByPk(fileId),
            db.exercices.findByPk(exerciceId),
            db.detailsimmo.findByPk(detailImmoId),
        ]);
        if (!dossier) return res.status(404).json({ state: false, msg: 'Dossier introuvable' });
        if (!exo) return res.status(404).json({ state: false, msg: 'Exercice introuvable' });
        if (!detail) return res.status(404).json({ state: false, msg: 'Immobilisation introuvable' });

        const baseJours = Number(dossier.immo_amort_base_jours) || 360;
        const dateMiseService = detail.date_mise_service ? new Date(detail.date_mise_service) : null;
        const dureeComp = Math.max(1, Math.floor(Number(detail.duree_amort_mois) || 0));
        const hasFiscConfig = (
            Number(detail?.duree_amort_mois_fisc) > 0 ||
            (detail?.type_amort_fisc && String(detail.type_amort_fisc).length > 0) ||
            Number(detail?.amort_ant_fisc) > 0 ||
            Number(detail?.dotation_periode_fisc) > 0 ||
            Number(detail?.amort_exceptionnel_fisc) > 0 ||
            Number(detail?.derogatoire_fisc) > 0 ||
            Number(detail?.total_amortissement_fisc) > 0
        );
        const dureeFisc = hasFiscConfig ? Math.max(1, Math.floor(Number(detail.duree_amort_mois_fisc) || 0)) : 0;

        const montantHT = Number(detail.montant_ht) || Number(detail.montant) || 0;
        if (!dateMiseService || isNaN(dateMiseService.getTime())) return res.status(400).json({ state: false, msg: 'date_mise_service invalide' });
        if (montantHT <= 0) return res.status(400).json({ state: false, msg: 'montant HT invalide' });
        const exoFin = exo.date_fin ? new Date(exo.date_fin) : null;
        if (!exoFin || isNaN(exoFin.getTime())) return res.status(400).json({ state: false, msg: 'date_fin exercice invalide' });

        const addMonths = (d, m) => { const nd = new Date(d); nd.setMonth(nd.getMonth() + m); return nd; };
        const addDays = (d, n) => { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; };
        const minDate = (a, b) => (a <= b ? a : b);
        const toYMD = d => d.toISOString().substring(0, 10);
        const clamp = v => Math.round((v + 0.0000001) * 100) / 100;

        const dotMensComp = montantHT / dureeComp;
        const dotAnnComp = dotMensComp * 12;
        const dotMensFisc = hasFiscConfig && dureeFisc > 0 ? (montantHT / dureeFisc) : 0;
        const dotAnnFisc = dotMensFisc * 12;

        const out = [];
        let debut = new Date(dateMiseService);
        const finAmortComp = addDays(addMonths(debut, dureeComp), -1);
        const finAmortFisc = hasFiscConfig ? addDays(addMonths(debut, dureeFisc), -1) : null;

        let index = 1;
        let cumulComp = 0; let vncComp = montantHT;
        let cumulFisc = 0; let vncFisc = montantHT;
        let safety = 0;
        while ((vncComp > 0 || (hasFiscConfig && vncFisc > 0)) && safety < 1000) {
            let fin;
            if (index === 1) {
                fin = hasFiscConfig ? minDate(exoFin, minDate(finAmortComp, finAmortFisc)) : minDate(exoFin, finAmortComp);
            } else {
                fin = addDays(addMonths(debut, 12), -1);
                const cap = hasFiscConfig ? minDate(finAmortComp, finAmortFisc) : finAmortComp;
                if (fin > cap) fin = cap;
            }
            if (fin < debut) {
                const cap = hasFiscConfig ? minDate(finAmortComp, finAmortFisc) : finAmortComp;
                fin = minDate(addDays(addMonths(debut, 1), -1), cap);
                if (fin < debut) fin = debut;
            }

            let nbJours;
            if (baseJours === 360) {
                const dStart = Math.min(debut.getDate(), 30);
                const dEnd = Math.min(fin.getDate(), 30);
                const monthsDiff = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
                nbJours = (30 - dStart + 1) + Math.max(0, monthsDiff) * 30;
                if (monthsDiff === 0) nbJours = Math.max(1, dEnd - dStart + 1);
            } else {
                nbJours = Math.floor((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
            }
            if (!isFinite(nbJours) || nbJours < 1) nbJours = 1;

            const anneeNombre = nbJours / baseJours;
            // comptable
            let dotComp = vncComp > 0 ? clamp(dotAnnComp * anneeNombre) : 0;
            if (dotComp <= 0 && vncComp > 0) dotComp = clamp(Math.min(vncComp, dotMensComp));
            const antComp = clamp(cumulComp);
            cumulComp = clamp(cumulComp + dotComp);
            let vncCompAvant = clamp(montantHT - cumulComp);
            if (vncCompAvant < 0 && Math.abs(vncCompAvant) <= 5) {
                dotComp = clamp(dotComp + vncCompAvant);
                cumulComp = clamp(cumulComp + vncCompAvant);
                vncCompAvant = clamp(montantHT - cumulComp);
            }
            vncComp = vncCompAvant < 0 ? 0 : vncCompAvant;

            // fiscal (optionnel)
            let antFisc = 0, dotFisc = 0;
            if (hasFiscConfig) {
                dotFisc = vncFisc > 0 ? clamp(dotAnnFisc * anneeNombre) : 0;
                if (dotFisc <= 0 && vncFisc > 0) dotFisc = clamp(Math.min(vncFisc, dotMensFisc));
                antFisc = clamp(cumulFisc);
                cumulFisc = clamp(cumulFisc + dotFisc);
                let vncFiscAvant = clamp(montantHT - cumulFisc);
                if (vncFiscAvant < 0 && Math.abs(vncFiscAvant) <= 5) {
                    dotFisc = clamp(dotFisc + vncFiscAvant);
                    cumulFisc = clamp(cumulFisc + vncFiscAvant);
                    vncFiscAvant = clamp(montantHT - cumulFisc);
                }
                vncFisc = vncFiscAvant < 0 ? 0 : vncFiscAvant;
            } else {
                vncFisc = 0;
            }

            out.push({
                id_dossier: fileId,
                id_compte: compteId,
                id_exercice: exerciceId,
                id_detail_immo: detailImmoId,
                rang: index,
                date_mise_service: toYMD(debut),
                date_fin_exercice: toYMD(fin),
                annee_nombre: clamp(anneeNombre),
                montant_immo_ht: clamp(montantHT),
                vnc: vncComp,
                amort_ant_comp: antComp,
                dotation_periode_comp: dotComp,
                cumul_amort_comp: cumulComp,
                amort_ant_fisc: antFisc,
                dotation_periode_fisc: dotFisc,
                cumul_amort_fisc: cumulFisc,
                dot_derogatoire: 0,
            });

            if (vncComp <= 0 && (!hasFiscConfig || vncFisc <= 0)) break;
            debut = addDays(fin, 1);
            index++;
            safety++;
        }

        await db.detailsImmoLignes.destroy({
            where: { id_dossier: fileId, id_compte: compteId, id_exercice: exerciceId, id_detail_immo: detailImmoId },
        });
        if (out.length > 0) await db.detailsImmoLignes.bulkCreate(out);

        return res.json({ state: true, saved: out.length });
    } catch (err) {
        console.error('[IMMO][LINEAIRE][SAVE] error:', err);
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

        const idEcritureCommun = getDateSaisieNow(id_compte);

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
                id_ecriture: idEcritureCommun,
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

        if (!id_dossier) return res.status(400).json({ state: false, message: 'Dossier non trouvé' });
        if (!id_exercice) return res.status(400).json({ state: false, message: 'Exercice non trouvé' });
        if (!id_compte) return res.status(400).json({ state: false, message: 'Compte non trouvé' });

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
                { model: codejournals, attributes: ['code'] },
                { model: dossiers, attributes: ['dossier'] },
            ],
            order: [
                // ['id_ecriture', 'ASC'],
                // ['dateecriture', 'ASC'],
                // ['id', 'ASC']
                ['createdAt', 'DESC']
            ]
        });

        const mappedData = journalData.map(journal => {
            const { dossierplancomptable, codejournal, dossier, ...rest } = journal.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
                journal: codejournal?.code || null,
                dossier: dossier?.dossier || null
            };
        });

        return res.json(mappedData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

exports.getAllJournal = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice } = req.params;

        if (!id_dossier) return res.status(400).json({ state: false, message: 'Dossier non trouvé' });
        if (!id_exercice) return res.status(400).json({ state: false, message: 'Exercice non trouvé' });
        if (!id_compte) return res.status(400).json({ state: false, message: 'Compte non trouvé' });

        const dossierData = await dossiers.findByPk(id_dossier);
        const exerciceData = await exercices.findByPk(id_exercice);

        const consolidation = dossierData?.consolidation || false;
        const date_debut_exercice = new Date(exerciceData?.date_debut);
        const date_fin_exercice = new Date(exerciceData?.date_fin);

        let id_dossiers_a_utiliser = [Number(id_dossier)];

        if (consolidation) {
            const consolidationDossierData = await consolidationDossier.findAll({
                where: {
                    id_dossier,
                    id_compte
                }
            });

            if (!consolidationDossierData.length) {
                return res.json({
                    state: true,
                    msg: "Consolidation de dossier vide",
                    liste: []
                });
            }

            id_dossiers_a_utiliser = [...new Set(
                consolidationDossierData.map(val => Number(val.id_dossier_autre))
            ), Number(id_dossier)];
        }

        const exerciceDataToUse = await exercices.findAll({
            where: {
                id_compte,
                id_dossier: { [Op.in]: id_dossiers_a_utiliser },
                [Op.and]: [
                    { date_debut: { [Op.lte]: date_fin_exercice } },
                    { date_fin: { [Op.gte]: date_debut_exercice } }
                ]
            }
        })

        const id_exercices_a_utiliser = [...new Set(exerciceDataToUse.map(val => Number(val.id)))];

        const whereClause = {
            id_compte,
            id_dossier: { [Op.in]: id_dossiers_a_utiliser },
            id_exercice: { [Op.in]: id_exercices_a_utiliser }
        };

        const journalData = await journals.findAll({
            where: whereClause,
            include: [
                { model: dossierplancomptable, attributes: ['compte'] },
                { model: codejournals, attributes: ['code'] },
                { model: dossiers, attributes: ['dossier'] },
            ],
            order: [
                // ['id_ecriture', 'ASC'],
                // ['dateecriture', 'ASC'],
                // ['id', 'ASC']
                ['createdAt', 'DESC']
            ]
        });

        const mappedData = journalData.map(journal => {
            const { dossierplancomptable, codejournal, dossier, ...rest } = journal.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
                journal: codejournal?.code || null,
                dossier: dossier?.dossier || null
            };
        });

        return res.json(mappedData);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
    }
}

exports.getJournalFiltered = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice, journal, compte, piece, libelle, debut, fin } = req.body;
        const id_numcpt = compte?.id;

        if (!id_dossier) return res.status(400).json({ state: false, message: 'Dossier non trouvé' });
        if (!id_exercice) return res.status(400).json({ state: false, message: 'Exercice non trouvé' });
        if (!id_compte) return res.status(400).json({ state: false, message: 'Compte non trouvé' });

        const dossierData = await dossiers.findByPk(id_dossier);
        const exerciceData = await exercices.findByPk(id_exercice);

        const consolidation = dossierData?.consolidation || false;
        const date_debut_exercice = new Date(exerciceData?.date_debut);
        const date_fin_exercice = new Date(exerciceData?.date_fin);

        let id_dossiers_a_utiliser = [Number(id_dossier)];

        if (consolidation) {
            const consolidationDossierData = await consolidationDossier.findAll({
                where: {
                    id_dossier,
                    id_compte
                }
            });

            if (!consolidationDossierData.length) {
                return res.json({
                    state: true,
                    msg: "Consolidation de dossier vide",
                    liste: []
                });
            }

            id_dossiers_a_utiliser = [...new Set(
                consolidationDossierData.map(val => Number(val.id_dossier_autre))
            ), Number(id_dossier)];
        }

        const exerciceDataToUse = await exercices.findAll({
            where: {
                id_compte,
                id_dossier: { [Op.in]: id_dossiers_a_utiliser },
                [Op.and]: [
                    { date_debut: { [Op.lte]: date_fin_exercice } },
                    { date_fin: { [Op.gte]: date_debut_exercice } }
                ]
            }
        })

        const id_exercices_a_utiliser = [...new Set(exerciceDataToUse.map(val => Number(val.id)))];

        const whereClause = {
            id_compte,
            id_dossier: { [Op.in]: id_dossiers_a_utiliser },
            id_exercice: { [Op.in]: id_exercices_a_utiliser }
        };

        if (piece) whereClause.piece = { [Op.iLike]: `%${piece}%` };
        if (libelle) whereClause.libelle = { [Op.iLike]: `%${libelle}%` };
        if (debut && fin) {
            whereClause.dateecriture = { [Op.between]: [debut, fin] };
        } else if (debut) {
            whereClause.dateecriture = { [Op.gte]: debut };
        } else if (fin) {
            whereClause.dateecriture = { [Op.lte]: fin };
        } else if (date_debut_exercice && date_fin_exercice && consolidation) {
            whereClause.dateecriture = { [Op.between]: [date_debut_exercice, date_fin_exercice] };
        }

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
                id_dossier: { [Op.in]: id_dossiers_a_utiliser },
                id_exercice: { [Op.in]: id_exercices_a_utiliser }
            },
            include: [
                { model: dossierplancomptable, attributes: ['compte'] },
                { model: codejournals, attributes: ['code'] },
                { model: dossiers, attributes: ['dossier'] },
            ],
            order: [
                // ['id_ecriture', 'ASC'],
                // ['dateecriture', 'ASC'],
                // ['id', 'ASC']
                ['createdAt', 'DESC']
            ]
        })

        const mappedData = journalFinal.map(journal => {
            const { dossierplancomptable, codejournal, dossier, ...rest } = journal.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
                journal: codejournal?.code || null,
                dossier: dossier?.dossier || null,
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

        // journals.update retourne un tableau dont la première valeur est le nombre de lignes affectées
        const [affectedRows] = await journals.update(
            { lettrage: "" },
            {
                where: {
                    id: data,
                }
            }
        );

        return res.status(200).json({
            state: true,
            message: `Lettrage supprimé avec succès sur ${Number(affectedRows) || 0} ligne(s)`,
            affected: Number(affectedRows) || 0,
            lettrage: ""
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

// -------------------- IMMOBILISATIONS: details_immo CRUD --------------------
exports.listDetailsImmo = async (req, res) => {
    try {
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        const pcId = req.query?.pcId ? Number(req.query.pcId) : null;
        if (!fileId || !compteId || !exerciceId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const wherePc = pcId ? 'AND d.pc_id = :pcId' : '';
        const sql = `
            SELECT d.*
            FROM details_immo d
            WHERE d.id_dossier = :fileId
              AND d.id_compte = :compteId
              AND d.id_exercice = :exerciceId
              ${wherePc}
            ORDER BY d.id ASC
        `;
        const rows = await db.sequelize.query(sql, {
            replacements: { fileId, compteId, exerciceId, pcId },
            type: db.Sequelize.QueryTypes.SELECT,
        });
        return res.json({ state: true, list: rows || [] });
    } catch (err) {
        console.error('[IMMO][DETAILS][LIST] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

exports.createDetailsImmo = async (req, res) => {
    try {
        const {
            fileId, compteId, exerciceId, pcId,
            code, intitule, lien_ecriture_id, fournisseur,
            date_acquisition, date_mise_service, duree_amort_mois, type_amort,
            montant, taux_tva, montant_tva, montant_ht,
            reprise_immobilisation, date_reprise,
            reprise_immobilisation_comp, date_reprise_comp,
            reprise_immobilisation_fisc, date_reprise_fisc,
            // legacy (back-compat)
            amort_ant, dotation_periode, amort_exceptionnel, total_amortissement, derogatoire,
            // new comptable suffix
            amort_ant_comp, dotation_periode_comp, amort_exceptionnel_comp, total_amortissement_comp, derogatoire_comp,
            // new fiscale suffix
            amort_ant_fisc, dotation_periode_fisc, amort_exceptionnel_fisc, total_amortissement_fisc, derogatoire_fisc,
            duree_amort_mois_fisc, type_amort_fisc,
            compte_amortissement, vnc, date_sortie, prix_vente,
        } = req.body || {};

        if (!fileId || !compteId || !exerciceId || !pcId || !code) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }

        const exo = await db.exercices.findByPk(Number(exerciceId));
        if (!exo) {
            return res.status(404).json({ state: false, msg: 'Exercice introuvable' });
        }
        const exoDebut = exo.date_debut ? new Date(exo.date_debut) : null;
        const exoFin = exo.date_fin ? new Date(exo.date_fin) : null;
        
        if (exoDebut && !isNaN(exoDebut.getTime()) && exoFin && !isNaN(exoFin.getTime())) {
            const dAcq = date_acquisition ? new Date(String(date_acquisition).substring(0, 10)) : null;
            const dMs = date_mise_service ? new Date(String(date_mise_service).substring(0, 10)) : null;
            const dRepriseLegacy = date_reprise ? new Date(String(date_reprise).substring(0, 10)) : null;
            const dRepriseComp = date_reprise_comp ? new Date(String(date_reprise_comp).substring(0, 10)) : null;
            const dRepriseFisc = date_reprise_fisc ? new Date(String(date_reprise_fisc).substring(0, 10)) : null;

            if (dAcq && !isNaN(dAcq.getTime()) && dAcq < exoDebut) {
                return res.status(400).json({ state: false, msg: "Date d'acquisition avant la date de début de l'exercice" });
            }
            if (dMs && !isNaN(dMs.getTime()) && dMs < exoDebut) {
                return res.status(400).json({ state: false, msg: "Date de mise en service avant la date de début de l'exercice" });
            }

            if (dRepriseLegacy && !isNaN(dRepriseLegacy.getTime()) && (dRepriseLegacy < exoDebut || dRepriseLegacy > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise hors période de l'exercice" });
            }
            if (dRepriseComp && !isNaN(dRepriseComp.getTime()) && (dRepriseComp < exoDebut || dRepriseComp > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise comptable hors période de l'exercice" });
            }
            if (dRepriseFisc && !isNaN(dRepriseFisc.getTime()) && (dRepriseFisc < exoDebut || dRepriseFisc > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise fiscale hors période de l'exercice" });
            }
        }

        // Validate that amortisation account is provided (front derives one from compte)
        if (!compte_amortissement || String(compte_amortissement).trim() === '') {
            return res.status(400).json({ state: false, msg: "Veuillez ajouter un compte d'amort" });
        }

        const insertSql = `
            INSERT INTO details_immo (
                id_dossier, id_compte, id_exercice, pc_id,
                code, intitule, lien_ecriture_id, fournisseur,
                date_acquisition, date_mise_service, duree_amort_mois, type_amort,
                montant, taux_tva, montant_tva, montant_ht,
                compte_amortissement, vnc, date_sortie, prix_vente,
                reprise_immobilisation, date_reprise,
                reprise_immobilisation_comp, date_reprise_comp,
                reprise_immobilisation_fisc, date_reprise_fisc,
                amort_ant_comp, dotation_periode_comp, amort_exceptionnel_comp, total_amortissement_comp, derogatoire_comp,
                amort_ant_fisc, dotation_periode_fisc, amort_exceptionnel_fisc, total_amortissement_fisc, derogatoire_fisc,
                duree_amort_mois_fisc, type_amort_fisc,
                created_at, updated_at
            ) VALUES (
                :fileId, :compteId, :exerciceId, :pcId,
                :code, :intitule, :lien_ecriture_id, :fournisseur,
                :date_acquisition, :date_mise_service, :duree_amort_mois, :type_amort,
                :montant, :taux_tva, :montant_tva, :montant_ht,
                :compte_amortissement, :vnc, :date_sortie, :prix_vente,
                :reprise_immobilisation, :date_reprise,
                :reprise_immobilisation_comp, :date_reprise_comp,
                :reprise_immobilisation_fisc, :date_reprise_fisc,
                :amort_ant_comp, :dotation_periode_comp, :amort_exceptionnel_comp, :total_amortissement_comp, :derogatoire_comp,
                :amort_ant_fisc, :dotation_periode_fisc, :amort_exceptionnel_fisc, :total_amortissement_fisc, :derogatoire_fisc,
                :duree_amort_mois_fisc, :type_amort_fisc,
                NOW(), NOW()
            ) RETURNING id;
        `;
        const [ret] = await db.sequelize.query(insertSql, {
            replacements: {
                fileId: Number(fileId), compteId: Number(compteId), exerciceId: Number(exerciceId), pcId: Number(pcId),
                code: String(code), intitule: intitule ?? null, lien_ecriture_id: lien_ecriture_id ?? null, fournisseur: fournisseur ?? null,
                date_acquisition: date_acquisition ? String(date_acquisition).substring(0, 10) : null,
                date_mise_service: date_mise_service ? String(date_mise_service).substring(0, 10) : null,
                duree_amort_mois: duree_amort_mois ?? null, type_amort: type_amort ?? null,
                montant: Number(montant) || 0, taux_tva: taux_tva ?? null, montant_tva: montant_tva ?? null, montant_ht: montant_ht ?? null,
                compte_amortissement: compte_amortissement ?? null,
                vnc: Number(vnc) || 0,
                date_sortie: date_sortie ? String(date_sortie).substring(0, 10) : null, prix_vente: prix_vente ?? null,
                reprise_immobilisation: Number(reprise_immobilisation) === 1 || reprise_immobilisation === true,
                date_reprise: date_reprise ? String(date_reprise).substring(0, 10) : null,
                reprise_immobilisation_comp: Number(reprise_immobilisation_comp) === 1 || reprise_immobilisation_comp === true,
                date_reprise_comp: date_reprise_comp ? String(date_reprise_comp).substring(0, 10) : null,
                reprise_immobilisation_fisc: Number(reprise_immobilisation_fisc) === 1 || reprise_immobilisation_fisc === true,
                date_reprise_fisc: date_reprise_fisc ? String(date_reprise_fisc).substring(0, 10) : null,
                amort_ant_comp: Number(amort_ant_comp) || 0,
                dotation_periode_comp: Number(dotation_periode_comp) || 0,
                amort_exceptionnel_comp: Number(amort_exceptionnel_comp) || 0,
                total_amortissement_comp: Number(total_amortissement_comp) || 0,
                derogatoire_comp: Number(derogatoire_comp) || 0,
                amort_ant_fisc: Number(amort_ant_fisc) || 0,
                dotation_periode_fisc: Number(dotation_periode_fisc) || 0,
                amort_exceptionnel_fisc: Number(amort_exceptionnel_fisc) || 0,
                total_amortissement_fisc: Number(total_amortissement_fisc) || 0,
                derogatoire_fisc: Number(derogatoire_fisc) || 0,
                duree_amort_mois_fisc: duree_amort_mois_fisc ?? null,
                type_amort_fisc: type_amort_fisc ?? null,
            },
            type: db.Sequelize.QueryTypes.SELECT,
        });

        const insertedId = Array.isArray(ret) ? ret[0]?.id : ret?.id;
        if (insertedId && lien_ecriture_id) {
            const [jrow] = await db.sequelize.query(
                `SELECT id_ecriture FROM public.journals WHERE id = :ligne AND id_dossier = :file AND id_exercice = :exo LIMIT 1`,
                { replacements: { ligne: Number(lien_ecriture_id), file: Number(fileId), exo: Number(exerciceId) }, type: db.Sequelize.QueryTypes.SELECT }
            );
            if (jrow?.id_ecriture) {
                await db.sequelize.query(
                    `UPDATE public.journals SET id_immob = :immobId WHERE id_ecriture = :idec AND id_dossier = :file AND id_exercice = :exo`,
                    { replacements: { immobId: Number(insertedId), idec: String(jrow.id_ecriture), file: Number(fileId), exo: Number(exerciceId) }, type: db.Sequelize.QueryTypes.UPDATE }
                );
            } else {
                await db.sequelize.query(
                    `UPDATE public.journals SET id_immob = :immobId WHERE id = :ligne AND id_dossier = :file AND id_exercice = :exo`,
                    { replacements: { immobId: Number(insertedId), ligne: Number(lien_ecriture_id), file: Number(fileId), exo: Number(exerciceId) }, type: db.Sequelize.QueryTypes.UPDATE }
                );
            }
        } else if (insertedId && !lien_ecriture_id) {
            await db.sequelize.query(
                `UPDATE public.journals SET id_immob = 0 WHERE id_dossier = :file AND id_exercice = :exo AND id_immob = :immobId`,
                { replacements: { immobId: Number(insertedId), file: Number(fileId), exo: Number(exerciceId) }, type: db.Sequelize.QueryTypes.UPDATE }
            );
        }

        return res.json({ state: true, id: insertedId || null });
    } catch (err) {
        console.error('[IMMO][DETAILS][UPDATE] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

exports.updateDetailsImmo = async (req, res) => {
    try {
        const id = Number(req.params?.id);
        const {
            fileId, compteId, exerciceId, pcId,
            code, intitule, lien_ecriture_id, fournisseur,
            date_acquisition, date_mise_service, duree_amort_mois, type_amort,
            montant, taux_tva, montant_tva, montant_ht,
            reprise_immobilisation, date_reprise,
            reprise_immobilisation_comp, date_reprise_comp,
            reprise_immobilisation_fisc, date_reprise_fisc,
            // new comptable suffix
            amort_ant_comp, dotation_periode_comp, amort_exceptionnel_comp, total_amortissement_comp, derogatoire_comp,
            // new fiscale suffix
            amort_ant_fisc, dotation_periode_fisc, amort_exceptionnel_fisc, total_amortissement_fisc, derogatoire_fisc,
            duree_amort_mois_fisc, type_amort_fisc,
            compte_amortissement, vnc, date_sortie, prix_vente,
        } = req.body || {};
        if (!id || !fileId || !compteId || !exerciceId || !pcId || !code) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }

        const exo = await db.exercices.findByPk(Number(exerciceId));
        if (!exo) {
            return res.status(404).json({ state: false, msg: 'Exercice introuvable' });
        }
        const exoDebut = exo.date_debut ? new Date(exo.date_debut) : null;
        const exoFin = exo.date_fin ? new Date(exo.date_fin) : null;
        
        if (exoDebut && !isNaN(exoDebut.getTime()) && exoFin && !isNaN(exoFin.getTime())) {
            const dAcq = date_acquisition ? new Date(String(date_acquisition).substring(0, 10)) : null;
            const dMs = date_mise_service ? new Date(String(date_mise_service).substring(0, 10)) : null;
            const dRepriseLegacy = date_reprise ? new Date(String(date_reprise).substring(0, 10)) : null;
            const dRepriseComp = date_reprise_comp ? new Date(String(date_reprise_comp).substring(0, 10)) : null;
            const dRepriseFisc = date_reprise_fisc ? new Date(String(date_reprise_fisc).substring(0, 10)) : null;

            if (dAcq && !isNaN(dAcq.getTime()) && dAcq < exoDebut) {
                return res.status(400).json({ state: false, msg: "Date d'acquisition avant la date de début de l'exercice" });
            }
            if (dMs && !isNaN(dMs.getTime()) && dMs < exoDebut) {
                return res.status(400).json({ state: false, msg: "Date de mise en service avant la date de début de l'exercice" });
            }

            if (dRepriseLegacy && !isNaN(dRepriseLegacy.getTime()) && (dRepriseLegacy < exoDebut || dRepriseLegacy > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise hors période de l'exercice" });
            }
            if (dRepriseComp && !isNaN(dRepriseComp.getTime()) && (dRepriseComp < exoDebut || dRepriseComp > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise comptable hors période de l'exercice" });
            }
            if (dRepriseFisc && !isNaN(dRepriseFisc.getTime()) && (dRepriseFisc < exoDebut || dRepriseFisc > exoFin)) {
                return res.status(400).json({ state: false, msg: "Date de reprise fiscale hors période de l'exercice" });
            }
        }

        const updateSql = `
            UPDATE details_immo SET
                pc_id = :pcId,
                code = :code,
                intitule = :intitule,
                lien_ecriture_id = :lien_ecriture_id,
                fournisseur = :fournisseur,
                date_acquisition = :date_acquisition,
                date_mise_service = :date_mise_service,
                duree_amort_mois = :duree_amort_mois,
                type_amort = :type_amort,
                montant = :montant,
                taux_tva = :taux_tva,
                montant_tva = :montant_tva,
                montant_ht = :montant_ht,
                compte_amortissement = :compte_amortissement,
                vnc = :vnc,
                date_sortie = :date_sortie,
                prix_vente = :prix_vente,
                reprise_immobilisation = :reprise_immobilisation,
                date_reprise = :date_reprise,
                reprise_immobilisation_comp = :reprise_immobilisation_comp,
                date_reprise_comp = :date_reprise_comp,
                reprise_immobilisation_fisc = :reprise_immobilisation_fisc,
                date_reprise_fisc = :date_reprise_fisc,
                amort_ant_comp = :amort_ant_comp,
                dotation_periode_comp = :dotation_periode_comp,
                amort_exceptionnel_comp = :amort_exceptionnel_comp,
                total_amortissement_comp = :total_amortissement_comp,
                derogatoire_comp = :derogatoire_comp,
                amort_ant_fisc = :amort_ant_fisc,
                dotation_periode_fisc = :dotation_periode_fisc,
                amort_exceptionnel_fisc = :amort_exceptionnel_fisc,
                total_amortissement_fisc = :total_amortissement_fisc,
                derogatoire_fisc = :derogatoire_fisc,
                duree_amort_mois_fisc = :duree_amort_mois_fisc, 
                type_amort_fisc = :type_amort_fisc,
                updated_at = NOW()
            WHERE id = :id AND id_dossier = :fileId AND id_compte = :compteId AND id_exercice = :exerciceId
        `;

        await db.sequelize.query(updateSql, {
            replacements: {
                id: Number(id), fileId: Number(fileId), compteId: Number(compteId), exerciceId: Number(exerciceId), pcId: Number(pcId),
                code: String(code), intitule: intitule ?? null, lien_ecriture_id: lien_ecriture_id ?? null, fournisseur: fournisseur ?? null,
                date_acquisition: date_acquisition ? String(date_acquisition).substring(0, 10) : null,
                date_mise_service: date_mise_service ? String(date_mise_service).substring(0, 10) : null,
                duree_amort_mois: duree_amort_mois ?? null, type_amort: type_amort ?? null,
                montant: Number(montant) || 0, taux_tva: taux_tva ?? null, montant_tva: montant_tva ?? null, montant_ht: montant_ht ?? null,
                compte_amortissement: compte_amortissement ?? null,
                vnc: Number(vnc) || 0,
                date_sortie: date_sortie ? String(date_sortie).substring(0, 10) : null, prix_vente: prix_vente ?? null,
                reprise_immobilisation: Number(reprise_immobilisation) === 1 || reprise_immobilisation === true,
                date_reprise: date_reprise ? String(date_reprise).substring(0, 10) : null,
                reprise_immobilisation_comp: Number(reprise_immobilisation_comp) === 1 || reprise_immobilisation_comp === true,
                date_reprise_comp: date_reprise_comp ? String(date_reprise_comp).substring(0, 10) : null,
                reprise_immobilisation_fisc: Number(reprise_immobilisation_fisc) === 1 || reprise_immobilisation_fisc === true,
                date_reprise_fisc: date_reprise_fisc ? String(date_reprise_fisc).substring(0, 10) : null,
                amort_ant_comp: Number(amort_ant_comp) || 0,
                dotation_periode_comp: Number(dotation_periode_comp) || 0,
                amort_exceptionnel_comp: Number(amort_exceptionnel_comp) || 0,
                total_amortissement_comp: Number(total_amortissement_comp) || 0,
                derogatoire_comp: Number(derogatoire_comp) || 0,
                amort_ant_fisc: Number(amort_ant_fisc) || 0,
                dotation_periode_fisc: Number(dotation_periode_fisc) || 0,
                amort_exceptionnel_fisc: Number(amort_exceptionnel_fisc) || 0,
                total_amortissement_fisc: Number(total_amortissement_fisc) || 0,
                derogatoire_fisc: Number(derogatoire_fisc) || 0,
                duree_amort_mois_fisc: duree_amort_mois_fisc ?? null,
                type_amort_fisc: type_amort_fisc ?? null,
            },
            type: db.Sequelize.QueryTypes.UPDATE,
        });

        if (id && lien_ecriture_id) {
            const [jrow] = await db.sequelize.query(
                `SELECT id_ecriture FROM public.journals WHERE id = :ligne AND id_dossier = :file AND id_exercice = :exo LIMIT 1`,
                { replacements: { ligne: Number(lien_ecriture_id), file: Number(fileId), exo: Number(exerciceId) }, type: db.Sequelize.QueryTypes.SELECT }
            );
            if (jrow?.id_ecriture) {
                await db.sequelize.query(
                    `UPDATE public.journals SET id_immob = :immobId WHERE id_ecriture = :idec AND id_dossier = :file AND id_exercice = :exo`,
                    { replacements: { immobId: Number(id), idec: String(jrow.id_ecriture), file: Number(fileId), exo: Number(exerciceId) }, type: db.Sequelize.QueryTypes.UPDATE }
                );
            } else {
                await db.sequelize.query(
                    `UPDATE public.journals SET id_immob = :immobId WHERE id = :ligne AND id_dossier = :file AND id_exercice = :exo`,
                    { replacements: { immobId: Number(id), ligne: Number(lien_ecriture_id), file: Number(fileId), exo: Number(exerciceId) }, type: db.Sequelize.QueryTypes.UPDATE }
                );
            }
        } else if (id && !lien_ecriture_id) {
            await db.sequelize.query(
                `UPDATE public.journals SET id_immob = 0 WHERE id_dossier = :file AND id_exercice = :exo AND id_immob = :immobId`,
                { replacements: { immobId: Number(id), file: Number(fileId), exo: Number(exerciceId) }, type: db.Sequelize.QueryTypes.UPDATE }
            );
        }

        return res.json({ state: true, id });
    } catch (err) {
        console.error('[IMMO][DETAILS][UPDATE] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};

exports.deleteDetailsImmo = async (req, res) => {
    try {
        const id = Number(req.params?.id);
        const fileId = Number(req.query?.fileId);
        const compteId = Number(req.query?.compteId);
        const exerciceId = Number(req.query?.exerciceId);
        if (!id || !fileId || !compteId || !exerciceId) {
            return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
        }
        const sql = `DELETE FROM details_immo WHERE id = :id AND id_dossier = :fileId AND id_compte = :compteId AND id_exercice = :exerciceId`;
        await db.sequelize.query(sql, {
            replacements: { id, fileId, compteId, exerciceId },
            type: db.Sequelize.QueryTypes.DELETE,
        });
        return res.json({ state: true, id });
    } catch (err) {
        console.error('[IMMO][DETAILS][DELETE] error:', err);
        return res.status(500).json({ state: false, msg: 'Erreur serveur' });
    }
};
