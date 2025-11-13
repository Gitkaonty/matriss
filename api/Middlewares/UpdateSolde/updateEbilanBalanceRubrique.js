const db = require("../../Models");
require('dotenv').config();
const { Op } = require('sequelize');
const balances = db.balances;

const rubriques = db.rubriques;
const compterubriques = db.compterubriques;

const recupIdCompteFromPlanComptable = async (compte_id, dossier_id, numCompte) => {
    try {
        const listCpt = await dossierPlanComptable.findAll({
            where:
            {
                id_compte: compte_id,
                id_dossier: dossier_id,
                baseaux: { [Op.like]: `${numCompte}%` }
            },
            raw: true
        });
        return { listCpt };
    } catch (error) {
        return { listBrut: [] };
        console.log(error);
    }
}

const balanceColumnBilan = async (compte_id, dossier_id, exercice_id) => {
    try {
        //supprimer les id sur la colonne rubriquebilanbrut et amort
        await balances.update(
            {
                rubriquebilanbrut: 0,
                rubriquebilanamort: 0,
                senscalculbilan: ''
            },
            {
                where:
                {
                    id_compte: compte_id,
                    id_dossier: dossier_id,
                    id_exercice: exercice_id,
                }
            }
        );

        const listRubrique = await rubriques.findAll({
            where:
            {
                id_compte: compte_id,
                id_dossier: dossier_id,
                id_exercice: exercice_id,
                id_etat: 'BILAN',
            },
            order: [['ordre', 'ASC']]
        });

        if (listRubrique.length >= 1) {
            for (let item of listRubrique) {
                if (item.nature !== "TOTAL" && item.nature !== "TITRE") {
                    const listeAssociatedCompte = await compterubriques.findAll({
                        where:
                        {
                            id_compte: compte_id,
                            id_dossier: dossier_id,
                            id_exercice: exercice_id,
                            id_etat: 'BILAN',
                            id_rubrique: item.id_rubrique,
                            //nature: 'BRUT',
                            active: true
                        }
                    });

                    if (listeAssociatedCompte.length > 0) {
                        for (let param of listeAssociatedCompte) {
                            const { listCpt } = await recupIdCompteFromPlanComptable(compte_id, dossier_id, param.compte);
                            let fieldToUpdate = (param.nature === 'AMORT') ? 'rubriquebilanamort' : 'rubriquebilanbrut';

                            const fieldsToUpdate = {
                                [fieldToUpdate]: item.id_rubrique,
                                senscalculbilan: param.senscalcul
                            };

                            switch (param.condition) {
                                case "SOLDE":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiC":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldecredit: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiD":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldedebit: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                    break;
                            }
                        }
                    }
                }
            }
        }

        //copier dans la colonne rubriquebilanbrut les champs avec correspondance dans la colonne rubriquebilanAmort : 
        //pour le besoin d'affichage des détails également pour les amort ou perte de valeur
        await db.sequelize.query(`
            UPDATE balances SET
            rubriquebilanbrut = rubriquebilanamort
            WHERE balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND balances.rubriquebilanamort > 0
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        return true;

    } catch (error) {
        console.log(error);
    }
}

const balanceColumnCRN = async (compte_id, dossier_id, exercice_id) => {
    try {
        //supprimer les id sur la colonne rubriquecrn (réinitialiser)
        await balances.update(
            {
                rubriquecrn: 0,
                senscalculcrn: ''
            },
            {
                where:
                {
                    id_compte: compte_id,
                    id_dossier: dossier_id,
                    id_exercice: exercice_id,
                }
            }
        );

        const listRubrique = await rubriques.findAll({
            where:
            {
                id_compte: compte_id,
                id_dossier: dossier_id,
                id_exercice: exercice_id,
                id_etat: 'CRN',
            },
            order: [['ordre', 'ASC']]
        });

        if (listRubrique.length >= 1) {
            for (let item of listRubrique) {
                if (item.nature !== "TOTAL" && item.nature !== "TITRE") {
                    const listeAssociatedCompte = await compterubriques.findAll({
                        where:
                        {
                            id_compte: compte_id,
                            id_dossier: dossier_id,
                            id_exercice: exercice_id,
                            id_etat: 'CRN',
                            id_rubrique: item.id_rubrique,
                            //nature: 'BRUT',
                            active: true
                        }
                    });

                    if (listeAssociatedCompte.length > 0) {
                        for (let param of listeAssociatedCompte) {
                            const { listCpt } = await recupIdCompteFromPlanComptable(compte_id, dossier_id, param.compte);
                            let fieldToUpdate = 'rubriquecrn';

                            const fieldsToUpdate = {
                                [fieldToUpdate]: item.id_rubrique,
                                senscalculcrn: param.senscalcul
                            };

                            switch (param.condition) {
                                case "SOLDE":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiC":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldecredit: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiD":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldedebit: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                            }
                        }
                    }
                }
            }
        }

        return true;

    } catch (error) {
        console.log(error);
    }
}

const balanceColumnCRF = async (compte_id, dossier_id, exercice_id) => {
    try {
        //supprimer les id sur la colonne rubriquecrf (réinitialiser)
        await balances.update(
            {
                rubriquecrf: 0,
                senscalculcrf: ''
            },
            {
                where:
                {
                    id_compte: compte_id,
                    id_dossier: dossier_id,
                    id_exercice: exercice_id,
                }
            }
        );

        const listRubrique = await rubriques.findAll({
            where:
            {
                id_compte: compte_id,
                id_dossier: dossier_id,
                id_exercice: exercice_id,
                id_etat: 'CRF',
            },
            order: [['ordre', 'ASC']]
        });

        if (listRubrique.length >= 1) {
            for (let item of listRubrique) {
                if (item.nature !== "TOTAL" && item.nature !== "TITRE") {
                    const listeAssociatedCompte = await compterubriques.findAll({
                        where:
                        {
                            id_compte: compte_id,
                            id_dossier: dossier_id,
                            id_exercice: exercice_id,
                            id_etat: 'CRF',
                            id_rubrique: item.id_rubrique,
                            //nature: 'BRUT',
                            active: true
                        }
                    });

                    if (listeAssociatedCompte.length > 0) {
                        for (let param of listeAssociatedCompte) {
                            const { listCpt } = await recupIdCompteFromPlanComptable(compte_id, dossier_id, param.compte);
                            let fieldToUpdate = 'rubriquecrf';

                            const fieldsToUpdate = {
                                [fieldToUpdate]: item.id_rubrique,
                                senscalculcrf: param.senscalcul
                            };

                            switch (param.condition) {
                                case "SOLDE":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiC":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldecredit: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiD":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldedebit: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                            }
                        }
                    }
                }
            }
        }

        return true;

    } catch (error) {
        console.log(error);
    }
}

const balanceColumnTFTD = async (compte_id, dossier_id, exercice_id) => {
    try {
        //supprimer les id sur la colonne rubriquecrf (réinitialiser)
        await balances.update(
            {
                rubriquetftd: 0,
                senscalcultftd: ''
            },
            {
                where:
                {
                    id_compte: compte_id,
                    id_dossier: dossier_id,
                    id_exercice: exercice_id,
                }
            }
        );

        const listRubrique = await rubriques.findAll({
            where:
            {
                id_compte: compte_id,
                id_dossier: dossier_id,
                id_exercice: exercice_id,
                id_etat: 'TFTD',
            },
            order: [['ordre', 'ASC']]
        });

        if (listRubrique.length >= 1) {
            for (let item of listRubrique) {
                if (item.nature !== "TOTAL" && item.nature !== "TITRE" && item.nature !== "TOTALMIXTE") {
                    const listeAssociatedCompte = await compterubriques.findAll({
                        where:
                        {
                            id_compte: compte_id,
                            id_dossier: dossier_id,
                            id_exercice: exercice_id,
                            id_etat: 'TFTD',
                            id_rubrique: item.id_rubrique,
                            //nature: 'BRUT',
                            active: true
                        }
                    });

                    if (listeAssociatedCompte.length > 0) {
                        for (let param of listeAssociatedCompte) {
                            const { listCpt } = await recupIdCompteFromPlanComptable(compte_id, dossier_id, param.compte);
                            let fieldToUpdate = 'rubriquetftd';

                            const fieldsToUpdate = {
                                [fieldToUpdate]: item.id_rubrique,
                                senscalcultftd: param.senscalcul
                            };

                            switch (param.condition) {
                                case "SOLDE":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiC":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldecredittreso: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiD":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldedebittreso: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                            }
                        }
                    }
                }
            }
        }

        return true;

    } catch (error) {
        console.log(error);
    }
}

const balanceColumnTFTI = async (compte_id, dossier_id, exercice_id) => {
    try {
        //supprimer les id sur la colonne rubriquecrf (réinitialiser)
        await balances.update(
            {
                rubriquetfti: 0,
                senscalcultfti: ''
            },
            {
                where:
                {
                    id_compte: compte_id,
                    id_dossier: dossier_id,
                    id_exercice: exercice_id,
                }
            }
        );

        const listRubrique = await rubriques.findAll({
            where:
            {
                id_compte: compte_id,
                id_dossier: dossier_id,
                id_exercice: exercice_id,
                id_etat: 'TFTI',
            },
            order: [['ordre', 'ASC']]
        });

        if (listRubrique.length >= 1) {
            for (let item of listRubrique) {
                if (item.nature !== "TOTAL" && item.nature !== "TITRE" && item.nature !== "TOTALMIXTE") {
                    const listeAssociatedCompte = await compterubriques.findAll({
                        where:
                        {
                            id_compte: compte_id,
                            id_dossier: dossier_id,
                            id_exercice: exercice_id,
                            id_etat: 'TFTI',
                            id_rubrique: item.id_rubrique,
                            //nature: 'BRUT',
                            active: true
                        }
                    });

                    if (listeAssociatedCompte.length > 0) {
                        for (let param of listeAssociatedCompte) {
                            const { listCpt } = await recupIdCompteFromPlanComptable(compte_id, dossier_id, param.compte);
                            let fieldToUpdate = 'rubriquetfti';

                            const fieldsToUpdate = {
                                [fieldToUpdate]: item.id_rubrique,
                                senscalcultfti: param.senscalcul
                            };

                            switch (param.condition) {
                                case "SOLDE":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiC":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldecredit: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                                case "SiD":
                                    if (listCpt.length > 0) {
                                        for (let compteInfos of listCpt) {
                                            await balances.update(
                                                fieldsToUpdate,
                                                {
                                                    where:
                                                    {
                                                        id_numcompte: compteInfos.id,
                                                        id_compte: compte_id,
                                                        id_dossier: dossier_id,
                                                        id_exercice: exercice_id,
                                                        soldedebit: { [Op.gt]: 0 }
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    break;
                            }
                        }
                    }
                }
            }
        }

        return true;

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    balanceColumnBilan,
    balanceColumnCRN,
    balanceColumnCRF,
    balanceColumnTFTD,
    balanceColumnTFTI
};