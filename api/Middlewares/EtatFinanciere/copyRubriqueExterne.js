const db = require("../../Models");

const rubriquesExternes = db.rubriquesExternes;
const rubriquesExternesMatrices = db.rubriquesExternesMatrices;

const copyRubriqueExterne = async (id_dossier, id_exercice, id_compte, id_etat) => {
    await rubriquesExternes.destroy({
        where: {
            id_dossier,
            id_compte,
            id_exercice,
            id_etat
        }
    });

    const rubriqueMatriceList = await rubriquesExternesMatrices.findAll({
        where: { id_etat }
    });

    if (rubriqueMatriceList.length > 0) {
        const dataToInsert = rubriqueMatriceList.map(rubrique => ({
            id_compte,
            id_dossier,
            id_exercice,
            id_etat: rubrique.id_etat,
            id_rubrique: rubrique.id_rubrique,
            libelle: rubrique.libelle,
            type: rubrique.type,
            ordre: rubrique.ordre,
            subtable: rubrique.subtable,
            par_default: true,
            active: true,
        }));

        await rubriquesExternes.bulkCreate(dataToInsert);
    }
};

module.exports = {
    copyRubriqueExterne
}