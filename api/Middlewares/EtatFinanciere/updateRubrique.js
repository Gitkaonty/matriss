const db = require("../../Models");
require('dotenv').config();
const { Op } = require('sequelize');

const dossierPlanComptable = db.dossierplancomptable;
const balances = db.balances;
const compteRubriquesExternes = db.compteRubriquesExternes;
const rubriquesExternes = db.rubriquesExternes;

const updateRubrique = async (id_compte, id_dossier, id_exercice, id_etat) => {
    try {
        const rubriqueExternesData = await rubriquesExternes.findAll({
            where: {
                id_dossier,
                id_compte,
                id_exercice,
                active: true
            }
        });

        if (!rubriqueExternesData.length) return;

        const compteRubriqueExterneData = await compteRubriquesExternes.findAll({
            where: {
                id_dossier,
                id_compte,
                id_exercice,
                active: true,
                // id_etat: { [Op.in]: rubriqueExternesData.map(r => r.id_etat) },
                id_etat,
                id_rubrique: {
                    [Op.in]: rubriqueExternesData
                        .filter(r => ['RUBRIQUE', 'SOUS-RUBRIQUE'].includes(r.type))
                        .map(r => r.id_rubrique)
                }
            }
        });

        if (!compteRubriqueExterneData.length) return;

        const compteRubriqueExterneDataFiltered = compteRubriqueExterneData.filter(c => {
            const rubrique = rubriqueExternesData.find(r => (r.id_rubrique === c.id_rubrique) && (r.id_etat === c.id_etat));
            return c.id_etat === c.tableau && rubrique && ['RUBRIQUE', 'SOUS-RUBRIQUE'].includes(rubrique.type);
        });

        for (const compteRubrique of compteRubriqueExterneDataFiltered) {
            const { id_rubrique, id_etat, compte, senscalcul, condition, nature } = compteRubrique;

            let column = null;
            if (id_etat === 'BILAN_ACTIF' && nature === 'BRUT') column = 'rubriquebilanactifbrutexterne';
            else if (id_etat === 'BILAN_ACTIF' && nature === 'AMORT') column = 'rubriquebilanactifamortexterne';
            else if (id_etat === 'BILAN_PASSIF' && nature === 'BRUT') column = 'rubriquebilanpassifbrutexterne';
            else if (id_etat === 'CRN' && nature === 'BRUT') column = 'rubriquecrnexterne';
            else if (id_etat === 'CRF' && nature === 'BRUT') column = 'rubriquecrfexterne';
            else if (id_etat === 'TFTD' && nature === 'BRUT') column = 'rubriquetftdexterne';
            else if (id_etat === 'TFTI' && nature === 'BRUT') column = 'rubriquetftiexterne';
            else if (id_etat === 'SIG' && nature === 'BRUT') column = 'rubriquesig';
            if (!column) continue;

            const matchingCpt = await dossierPlanComptable.findAll({
                where: {
                    id_compte,
                    id_dossier,
                    compte: { [Op.like]: `${compte}%` },
                    nature: { [Op.notIn]: ['Collectif'] }
                },
                attributes: ['id']
            });

            const idsNumCompte = matchingCpt.map(c => c.id);
            if (!idsNumCompte.length) continue;

            const balancesData = await balances.findAll({
                where: {
                    id_compte,
                    id_dossier,
                    id_exercice,
                    id_numcompte: { [Op.in]: idsNumCompte }
                },
                attributes: ['id_numcompte', 'soldedebit', 'soldecredit']
            });

            for (const balance of balancesData) {
                const { soldedebit, soldecredit } = balance;

                let solde = 0;

                if (senscalcul === "D-C") {
                    solde = soldedebit;
                } else if (senscalcul === "C-D") {
                    solde = soldecredit;
                }

                if (condition === "SiD" && solde <= 0) solde = 0;
                else if (condition === "SiC" && solde >= 0) solde = 0;

                const rubriqueFinale = solde === 0 ? 0 : id_rubrique;

                await balances.update(
                    { [column]: rubriqueFinale },
                    {
                        where: {
                            id_compte,
                            id_dossier,
                            id_exercice,
                            id_numcompte: balance.id_numcompte
                        }
                    }
                );
            }
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des rubriques externes :', error);
        throw error;
    }
};

module.exports = { updateRubrique }