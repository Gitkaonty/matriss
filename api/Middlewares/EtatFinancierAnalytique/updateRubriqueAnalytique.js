const db = require("../../Models");
const { Op } = require("sequelize");

const balances = db.balances;
const balanceAnalytiques = db.balanceAnalytiques;

const fonctionUpdateRubriqueEtatFinancier = require('../../Middlewares/EtatFinanciere/updateRubrique');
const updateRubrique = fonctionUpdateRubriqueEtatFinancier.updateRubrique;

const updateRubriqueAnalytique = async (id_compte, id_dossier, id_exercice, id_etat, id_axe, id_sections) => {
    try {
        await updateRubrique(id_compte, id_dossier, id_exercice, id_etat);

        const balanceGeneral = await balances.findAll({
            where: {
                id_compte,
                id_dossier,
                id_exercice
            }
        });

        const analytiques = await balanceAnalytiques.findAll({
            where: {
                id_compte,
                id_dossier,
                id_exercice,
                id_axe,
                id_section: { [Op.in]: id_sections }
            }
        });

        const mapAnalytique = new Map();
        analytiques.forEach(a => {
            if (!mapAnalytique.has(a.id_numcpt)) {
                mapAnalytique.set(a.id_numcpt, []);
            }
            mapAnalytique.get(a.id_numcpt).push(a);
        });

        for (const b of balanceGeneral) {
            const compte = b.id_numcompte;
            const lignes = mapAnalytique.get(compte);

            if (!lignes) {
                continue;
            }

            for (const a of lignes) {
                a.rubriquebilanactifbrutanalytique = b.rubriquebilanactifbrutexterne;
                a.rubriquebilanactifamortanalytique = b.rubriquebilanactifamortexterne;
                a.rubriquebilanpassifbrutanalytique = b.rubriquebilanpassifbrutexterne;
                a.rubriquecrnanalytique = b.rubriquecrnexterne;
                a.rubriquecrfanalytique = b.rubriquecrfexterne;
                a.rubriquetftdanalytique = b.rubriquetftdexterne;
                a.rubriquetftianalytique = b.rubriquetftiexterne;

                await a.save();
            }
        }

        return true;

    } catch (error) {
        throw error;
    }
};

module.exports = { updateRubriqueAnalytique };
