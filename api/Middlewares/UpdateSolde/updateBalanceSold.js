const db = require("../../Models");
require('dotenv').config();
const { Op } = require('sequelize');

const codejournals = db.codejournals;
const dossierPlanComptable = db.dossierplancomptable;
const balances = db.balances;

const updateSold = async (compte_id, dossier_id, exercice_id, listecompte, allCompte) => {
    try {
        let stateUpdate = false;
        if (allCompte) {

            const existingBalances = await balances.findAll({
                where: {
                    id_compte: compte_id,
                    id_dossier: dossier_id,
                    id_exercice: exercice_id
                },
                attributes: ['id_numcompte'],
            });

            const existingSet = new Set(existingBalances.map(b => Number(b.id_numcompte)));

            const listeCpt = await dossierPlanComptable.findAll({
                where: {
                    id_compte: compte_id,
                    id_dossier: dossier_id,
                }
            });

            if (listeCpt.length > 0) {
                const payload = listeCpt
                    .filter(item => !existingSet.has(Number(item.id)))
                    .map(item => ({
                        id_compte: item.id_compte,
                        id_dossier: item.id_dossier,
                        id_exercice: exercice_id,
                        id_numcompte: item.id,
                        id_numcomptecentr: item.baseaux_id,
                        nature: item.nature,
                    }));

                if (payload.length > 0) {
                    await balances.bulkCreate(payload);
                }
            }

            //récupérer la liste des codes journaux de trésoreries pour reconstituer la balance des tréso
            const listCodeJournauxTreso = await codejournals.findAll({
                where:
                {
                    id_compte: compte_id,
                    id_dossier: dossier_id,
                    type: { [Op.in]: ['BANQUE', 'CAISSE'] }
                }
            });

            //mettre à jour la balance tréso s'il y a des codes jouranaux de trésorerie
            if (listCodeJournauxTreso.length > 0) {
                const arrayListCodeJnl = listCodeJournauxTreso.map(item => item.id);
                const inClauseCodeJnl = `(${arrayListCodeJnl.join(',')})`;

                await db.sequelize.query(`
                UPDATE balances SET
                    mvtdebittreso = ROUND(
                        (SELECT COALESCE(SUM(debit), 0)::numeric 
                        FROM journals 
                        WHERE journals.id_numcpt = balances.id_numcompte
                        AND journals.id_compte = :compte_id
                        AND journals.id_dossier = :dossier_id
                        AND journals.id_exercice = :exercice_id
                        AND journals.id_journal IN ${inClauseCodeJnl}), 2
                    ),
                    mvtcredittreso = ROUND(
                        (SELECT COALESCE(SUM(credit), 0)::numeric 
                        FROM journals 
                        WHERE journals.id_numcpt = balances.id_numcompte
                        AND journals.id_compte = :compte_id
                        AND journals.id_dossier = :dossier_id
                        AND journals.id_exercice = :exercice_id
                        AND journals.id_journal IN ${inClauseCodeJnl}), 2
                    )
                WHERE balances.id_compte = :compte_id 
                AND balances.id_dossier = :dossier_id 
                AND balances.id_exercice = :exercice_id
            `,
                    {
                        replacements: { compte_id, dossier_id, exercice_id },
                        type: db.Sequelize.QueryTypes.UPDATE
                    });
            }

            await db.sequelize.query(`
                UPDATE balances SET
                    mvtdebit = ROUND(
                        (SELECT COALESCE(SUM(debit), 0)::numeric 
                        FROM journals 
                        WHERE journals.id_numcpt = balances.id_numcompte
                        AND journals.id_compte = :compte_id
                        AND journals.id_dossier = :dossier_id
                        AND journals.id_exercice = :exercice_id), 2
                    ),
                    mvtcredit = ROUND(
                        (SELECT COALESCE(SUM(credit), 0)::numeric 
                        FROM journals 
                        WHERE journals.id_numcpt = balances.id_numcompte
                        AND journals.id_compte = :compte_id
                        AND journals.id_dossier = :dossier_id
                        AND journals.id_exercice = :exercice_id), 2
                    )
                WHERE balances.id_compte = :compte_id 
                AND balances.id_dossier = :dossier_id 
                AND balances.id_exercice = :exercice_id
            `,
                {
                    replacements: { compte_id, dossier_id, exercice_id },
                    type: db.Sequelize.QueryTypes.UPDATE
                });

            //mettre à jour le solde pour les comptes définit comme collectif
            await db.sequelize.query(`
                UPDATE balances SET
                    mvtdebit = ROUND(
                        (SELECT COALESCE(SUM(debit), 0)::numeric 
                        FROM journals 
                        WHERE journals.id_numcptcentralise = balances.id_numcompte
                        AND journals.id_compte = :compte_id
                        AND journals.id_dossier = :dossier_id
                        AND journals.id_exercice = :exercice_id), 2
                    ),
                    mvtcredit = ROUND(
                        (SELECT COALESCE(SUM(credit), 0)::numeric 
                        FROM journals 
                        WHERE journals.id_numcptcentralise = balances.id_numcompte
                        AND journals.id_compte = :compte_id
                        AND journals.id_dossier = :dossier_id
                        AND journals.id_exercice = :exercice_id), 2
                    )
                WHERE balances.id_compte = :compte_id 
                AND balances.id_dossier = :dossier_id 
                AND balances.id_exercice = :exercice_id
                AND nature = 'Collectif'
            `,
                {
                    replacements: { compte_id, dossier_id, exercice_id },
                    type: db.Sequelize.QueryTypes.UPDATE
                });

            await db.sequelize.query(`
                UPDATE balances SET
                    soldedebit = ROUND(GREATEST(mvtdebit - mvtcredit, 0)::numeric, 2),
                    soldecredit = ROUND(GREATEST(mvtcredit - mvtdebit, 0)::numeric, 2),
                    valeur = ROUND(ABS(mvtcredit - mvtdebit)::numeric, 2)
                WHERE balances.id_compte = :compte_id 
                AND balances.id_dossier = :dossier_id 
                AND balances.id_exercice = :exercice_id
            `,
                {
                    replacements: { compte_id, dossier_id, exercice_id },
                    type: db.Sequelize.QueryTypes.UPDATE
                });

            await db.sequelize.query(`
                UPDATE balances SET
                    soldedebittreso = ROUND(GREATEST(mvtdebittreso - mvtcredittreso, 0)::numeric, 2),
                    soldecredittreso = ROUND(GREATEST(mvtcredittreso - mvtdebittreso, 0)::numeric, 2),
                    valeurtreso = ROUND(ABS(mvtcredittreso - mvtdebittreso)::numeric, 2)
                WHERE balances.id_compte = :compte_id 
                AND balances.id_dossier = :dossier_id 
                AND balances.id_exercice = :exercice_id
            `,
                {
                    replacements: { compte_id, dossier_id, exercice_id },
                    type: db.Sequelize.QueryTypes.UPDATE
                });

            stateUpdate = true;
        } else {

        }
        return stateUpdate;
    } catch (error) {
        console.error("Erreur dans updateSold :", error.message);
        console.log(error);
    }
}

module.exports = { updateSold };