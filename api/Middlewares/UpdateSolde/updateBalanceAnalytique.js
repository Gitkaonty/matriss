const db = require("../../Models");
require('dotenv').config();
const { Op } = require('sequelize');

const balanceanalytiques = db.balanceAnalytiques;
const analytiques = db.analytiques;
const journals = db.journals;
const dossierplancomptableModel = db.dossierplancomptable;
const balances = db.balances;

const updateSoldAnalytique = async (compte_id, dossier_id, exercice_id) => {
    try {
        let stateUpdate = false;

        await balanceanalytiques.destroy({
            where: {
                id_compte: compte_id,
                id_dossier: dossier_id,
                id_exercice: exercice_id
            }
        });

        const lignes = await analytiques.findAll({
            attributes: ['id_axe', 'id_section', 'debit', 'credit'],
            include: [
                {
                    model: journals,
                    as: 'journals',
                    attributes: ['id_numcpt'],
                    required: true
                }
            ],
            where: {
                id_compte: compte_id,
                id_dossier: dossier_id,
                id_exercice: exercice_id
            }
        });

        if (lignes.length === 0) return;

        const payload = lignes.map(line => {
            const mvtdebitanalytique = line.debit || 0;
            const mvtcreditanalytique = line.credit || 0;

            let soldedebitanalytique = mvtdebitanalytique - mvtcreditanalytique;
            let soldecreditanalytique = mvtcreditanalytique - mvtdebitanalytique;

            soldedebitanalytique = soldedebitanalytique < 0 ? 0 : soldedebitanalytique;
            soldecreditanalytique = soldecreditanalytique < 0 ? 0 : soldecreditanalytique;

            const valeuranalytique = Math.abs(mvtcreditanalytique - mvtdebitanalytique);

            return {
                id_compte: compte_id,
                id_dossier: dossier_id,
                id_exercice: exercice_id,
                id_numcpt: line.journals.id_numcpt,
                id_axe: line.id_axe,
                id_section: line.id_section,
                mvtdebitanalytique,
                mvtcreditanalytique,
                soldedebitanalytique,
                soldecreditanalytique,
                valeuranalytique
            };
        });

        await balanceanalytiques.bulkCreate(payload);

        return stateUpdate;
    } catch (error) {
        console.error("Erreur dans updateSold :", error.message);
        console.log(error);
    }
}

const getJournalWithCompteFilter = async (id_ecriture, compteWhere) => {
    return await journals.findAll({
        where: { id_ecriture },
        include: [
            {
                model: dossierplancomptableModel,
                attributes: ['compte'],
                where: compteWhere
            }
        ],
    });
};

const addCompteBilanToBalanceAnalytique = async (id_compte, id_dossier, id_exercice, id_axe, id_section) => {
    try {
        console.log('id_section : ', id_section);
        const analytiqueData = await analytiques.findAll({
            where: {
                id_dossier,
                id_exercice,
                id_compte,
                id_axe,
                id_section: { [Op.in]: id_section }
            },
            attributes: ['id_ligne_ecriture']
        })
        const id_journals = [...new Set(analytiqueData.map(val => val.id_ligne_ecriture))];
        const journalData = await journals.findAll({
            where: {
                id: { [Op.in]: id_journals }
            },
            attributes: ['id_ecriture']
        })

        const id_ecritures = [...new Set(journalData.map(val => val.id_ecriture))]

        for (const id_ecriture of id_ecritures) {

            const id_journal = journalData
                .filter(val => val.id_ecriture === id_ecriture)
                .map(val => val.id);

            const journal_6_7 = await journals.findAll({
                where: {
                    id_ecriture
                },
                include: [
                    {
                        model: dossierplancomptableModel,
                        attributes: ['compte'],
                        where: {
                            [Op.or]: [
                                { compte: { [Op.like]: '6%' } },
                                { compte: { [Op.like]: '7%' } }
                            ]
                        }
                    }
                ],
            });

            const journal_not_2 = await journals.findAll({
                where: {
                    id_ecriture
                },
                include: [
                    {
                        model: dossierplancomptableModel,
                        attributes: ['compte'],
                        where: {
                            compte: { [Op.notLike]: '2%' }
                        }
                    }
                ],
                attributes: ['id_numcpt'],
            });

            const total_debit_credit = journal_6_7.reduce((sum, l) => sum + ((l.credit || 0) + (l.debit || 0)), 0);

            const id_numcpt_not_2 = [...new Set(journal_not_2.map(val => Number(val.id_numcpt)))];

            for (const section of id_section) {
                for (const compte of id_numcpt_not_2) {
                    const assinedBalance = await balances.findOne({
                        where: {
                            id_numcompte: compte,
                            id_dossier,
                            id_dossier,
                            id_exercice
                        }
                    })

                    const sectionsInAnalytique = await analytiques.findAll({
                        where: {
                            id_ligne_ecriture: id_journal,
                            id_section: section,
                            id_compte,
                            id_dossier,
                            id_exercice,
                        }
                    })

                    if (!assinedBalance) {
                        throw new error('Compte non trouvé dans la balance');
                    }

                    const mvtdebit = Number(assinedBalance.mvtdebit).toFixed(2);
                    const mvtcredit = Number(assinedBalance.mvtcredit).toFixed(2);
                    const soldedebit = Number(assinedBalance.soldedebit).toFixed(2);
                    const soldecredit = Number(assinedBalance.soldecredit).toFixed(2);
                    const valeur = Number(assinedBalance.valeur).toFixed(2);
                }
            }

            console.log('total_debit_credit : ', total_debit_credit);
            console.log('id_numcpt_not_2 : ', id_numcpt_not_2);
        }
    } catch (error) {
        console.error("Erreur dans addCompteBilanToBalanceAnalytique :", error.message);
        console.log(error);
    }
}

module.exports = {
    updateSoldAnalytique,
    addCompteBilanToBalanceAnalytique
};