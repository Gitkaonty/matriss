const db = require("../../Models");

const rubriquesExternesAnalytiques = db.rubriquesExternesAnalytiques;
const rubriquesExternesMatrices = db.rubriquesExternesMatrices;
const rubriquesmatrices = db.rubriquesmatrices;
const rubriqueExternesEvcpAnalytiques = db.rubriqueExternesEvcpAnalytiques;

const copyRubriqueExterneAnalytique = async (id_dossier, id_exercice, id_compte, id_etat) => {
    const listeRubriqueEVCP = await rubriquesmatrices.findAll({
        where:
        {
            id_etat: "EVCP"
        }
    });

    const rubriqueMatriceList = await rubriquesExternesMatrices.findAll({
        where: { id_etat }
    });

    if (id_etat === 'EVCP') {
        await rubriqueExternesEvcpAnalytiques.destroy({
            where: {
                id_dossier,
                id_exercice,
                id_compte
            }
        })

        listeRubriqueEVCP.map(async (item) => {
            await rubriqueExternesEvcpAnalytiques.create({
                id_compte,
                id_dossier,
                id_exercice,
                id_etat: item.id_etat,
                id_rubrique: item.id_rubrique,
                note: item.note,
                nature: item.nature,
                ordre: item.ordre,
                niveau: item.niveau,
                libelle: item.libelle,
            })
        });
    } else {
        if (rubriqueMatriceList.length > 0) {

            await rubriquesExternesAnalytiques.destroy({
                where: {
                    id_dossier,
                    id_compte,
                    id_exercice,
                    id_etat
                }
            });

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

            await rubriquesExternesAnalytiques.bulkCreate(dataToInsert);
        }
    }
};

module.exports = {
    copyRubriqueExterneAnalytique
}