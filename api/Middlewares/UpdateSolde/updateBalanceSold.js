const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const journals = db.journals;
const codejournals = db.codejournals;
const dossierPlanComptable = db.dossierplancomptable;
const balances = db.balances;

const updateSold = async (compte_id, dossier_id, exercice_id, listecompte, allCompte) => {
    try{
        let stateUpdate = false;
        if(allCompte){
            await balances.destroy({
                where: {
                    id_compte: compte_id, 
                    id_dossier: dossier_id,
                    id_exercice: exercice_id
                }
            });

            const listeCpt = await dossierPlanComptable.findAll({
                where:
                {
                    id_compte: compte_id, 
                    id_dossier: dossier_id,
                }
            });

            if(listeCpt.length > 0){
                const payload = listeCpt.map(item => ({
                id_compte: item.id_compte,
                id_dossier: item.id_dossier,
                id_exercice: exercice_id,
                id_numcompte: item.id,
                id_numcomptecentr: item.baseaux_id,
                nature: item.nature,
                }));

                await balances.bulkCreate(payload);
            }

            //récupérer la liste des codes journaux de trésoreries pour reconstituer la balance des tréso
            const listCodeJournauxTreso = await codejournals.findAll({
                where:
                    {
                        id_compte: compte_id, 
                        id_dossier: dossier_id,
                        type: {[Op.in]: ['BANQUE', 'CAISSE']}
                    }
            });

            //mettre à jour la balance tréso s'il y a des codes jouranaux de trésorerie
            if(listCodeJournauxTreso.length > 0){
                const arrayListCodeJnl = listCodeJournauxTreso.map(item => item.id);
                const inClauseCodeJnl = `(${arrayListCodeJnl.join(',')})`;

                await db.sequelize.query(`
                UPDATE balances SET
                mvtdebittreso = (SELECT COALESCE(SUM(debit),0) FROM journals WHERE journals.id_numcpt = balances.id_numcompte
                AND journals.id_compte = :compte_id AND journals.id_dossier = :dossier_id AND journals.id_exercice = :exercice_id
                AND journals.id_journal IN ${inClauseCodeJnl}),
                mvtcredittreso = (SELECT COALESCE(SUM(credit),0) FROM journals WHERE journals.id_numcpt = balances.id_numcompte
                AND journals.id_compte = :compte_id AND journals.id_dossier = :dossier_id AND journals.id_exercice = :exercice_id
                AND journals.id_journal IN ${inClauseCodeJnl})
                WHERE balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            `, 
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
            );
            }
            

            await db.sequelize.query(`
                UPDATE balances SET
                mvtdebit = (SELECT COALESCE(SUM(debit),0) FROM journals WHERE journals.id_numcpt = balances.id_numcompte
                AND journals.id_compte = :compte_id AND journals.id_dossier = :dossier_id AND journals.id_exercice = :exercice_id),
                mvtcredit = (SELECT COALESCE(SUM(credit),0) FROM journals WHERE journals.id_numcpt = balances.id_numcompte
                AND journals.id_compte = :compte_id AND journals.id_dossier = :dossier_id AND journals.id_exercice = :exercice_id)
                WHERE balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            `, 
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
            );

            //mettre à jour le solde pour les comptes définit comme collectif
            await db.sequelize.query(`
                UPDATE balances SET
                mvtdebit = (SELECT COALESCE(SUM(debit),0) FROM journals WHERE journals.id_numcptcentralise = balances.id_numcompte
                AND journals.id_compte = :compte_id AND journals.id_dossier = :dossier_id AND journals.id_exercice = :exercice_id),
                mvtcredit = (SELECT COALESCE(SUM(credit),0) FROM journals WHERE journals.id_numcptcentralise = balances.id_numcompte
                AND journals.id_compte = :compte_id AND journals.id_dossier = :dossier_id AND journals.id_exercice = :exercice_id)
                WHERE balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
                AND nature = 'Collectif'
            `, 
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
            );

            await db.sequelize.query(`
                UPDATE balances SET
                soldedebit = GREATEST(mvtdebit-mvtcredit,0),
                soldecredit = GREATEST(mvtcredit-mvtdebit,0),
                valeur = ABS(mvtcredit-mvtdebit)
                WHERE balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            `, 
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
            );

            await db.sequelize.query(`
                UPDATE balances SET
                soldedebittreso = GREATEST(mvtdebittreso-mvtcredittreso,0),
                soldecredittreso = GREATEST(mvtcredittreso-mvtdebittreso,0),
                valeurtreso = ABS(mvtcredittreso-mvtdebittreso)
                WHERE balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            `, 
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
            );
            stateUpdate = true;
        }else{

        }
        return stateUpdate;
    }catch (error){
        console.error("❌ Erreur dans updateSold :", error.message);
        console.log(error);
    }
}

module.exports = { updateSold };