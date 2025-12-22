const db = require("../../Models");
require('dotenv').config();
const recupExerciceN1 = require('../Standard/recupExerciceN1');

const soldeRubriqueBilan = async (compte_id, dossier_id, exercice_id) => {
    try {
        const {
            id_exerciceN1,
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1 ? id_exerciceN1 : 0;

        //mettre à jour les montants pour chaque rubrique - ACTIF
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantbrut = (
            SELECT COALESCE(SUM(
                CASE
                WHEN senscalculbilanbrut = 'D-C' THEN soldedebit - soldecredit
                WHEN senscalculbilanbrut = 'C-D' THEN soldecredit - soldedebit
                ELSE 0
                END
            ), 0)
            FROM balances
            WHERE balances.rubriquebilanbrut = rubriques.id_rubrique
                AND balances.id_compte = :compte_id
                AND balances.id_dossier = :dossier_id
                AND balances.id_exercice = :exercice_id
                AND NOT balances.nature = 'Collectif'
            )

            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'BILAN' AND ajustements.nature = 'BRUT'),

            montantamort = (
            SELECT COALESCE(SUM(
                CASE
                WHEN senscalculbilanamort = 'D-C' THEN soldedebit - soldecredit
                WHEN senscalculbilanamort = 'C-D' THEN soldecredit - soldedebit
                ELSE 0
                END
            ), 0)
            FROM balances
            WHERE balances.rubriquebilanamort = rubriques.id_rubrique
                AND balances.id_compte = :compte_id
                AND balances.id_dossier = :dossier_id
                AND balances.id_exercice = :exercice_id
                AND NOT balances.nature = 'Collectif'
            )

            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'BILAN' AND ajustements.nature = 'AMORT')
         
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'BILAN' AND NOT rubriques.nature IN('TOTAL','TITRE') and subtable = 1
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //mettre à jour les montants pour chaque rubrique - PASSIF
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantbrut = (
            SELECT COALESCE(SUM(
                CASE
                WHEN senscalculbilanbrut = 'D-C' THEN soldedebit - soldecredit
                WHEN senscalculbilanbrut = 'C-D' THEN soldecredit - soldedebit
                ELSE 0
                END
            ), 0)
            
            FROM balances
            WHERE balances.rubriquebilanbrut = rubriques.id_rubrique
                AND balances.id_compte = :compte_id
                AND balances.id_dossier = :dossier_id
                AND balances.id_exercice = :exercice_id
                AND NOT balances.nature = 'Collectif'
            )

            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'BILAN' AND ajustements.nature = 'BRUT')
            
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'BILAN' AND NOT rubriques.nature IN('TOTAL','TITRE') and subtable = 2
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //calculer les montants net du tableau
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantnet = montantbrut - montantamort
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'BILAN' AND NOT rubriques.nature IN('TOTAL','TITRE')
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //mettre à jour les montants pour l'exercice N-1
        await db.sequelize.query(`
            UPDATE rubriques as TabA SET
            montantnetn1 = (SELECT COALESCE(SUM(montantnet),0) FROM rubriques as TabB WHERE tabB.id_rubrique = tabA.id_rubrique
            AND tabB.id_compte = :compte_id AND tabB.id_dossier = :dossier_id AND tabB.id_exercice = :exercice_idN1 AND
            tabB.id_etat = 'BILAN')

            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_etat = 'BILAN'
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id, exercice_idN1 },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        return true;

    } catch (error) {
        console.log(error);
    }
}

const soldeRubriqueCRN = async (compte_id, dossier_id, exercice_id) => {
    try {
        const {
            id_exerciceN1,
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1 ? id_exerciceN1 : 0;

        //mettre à jour les montants dans la colonne montantbrut pour les rubriques charges (senscalcul = '+')
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantbrut = (SELECT COALESCE(SUM(soldedebit-soldecredit),0) FROM balances WHERE balances.rubriquecrn = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalculcrn = 'D-C')
            + (SELECT COALESCE(SUM(soldecredit - soldedebit),0) FROM balances WHERE balances.rubriquecrn = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalculcrn = 'C-D')

            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'CRN' AND ajustements.nature = 'BRUT')
            
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'CRN' AND rubriques.subtable = 0 AND NOT rubriques.nature IN('TOTAL','TITRE')
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //calculer les montants net
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantnet = montantbrut
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'CRN' AND rubriques.subtable = 0 AND NOT rubriques.nature IN('TOTAL','TITRE')
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //mettre à jour les montants pour l'exercice N-1
        await db.sequelize.query(`
            UPDATE rubriques as TabA SET
            montantnetn1 = (SELECT COALESCE(SUM(montantnet),0) FROM rubriques as TabB WHERE tabB.id_rubrique = tabA.id_rubrique
            AND tabB.id_compte = :compte_id AND tabB.id_dossier = :dossier_id AND tabB.id_exercice = :exercice_idN1 AND
            tabB.id_etat = 'CRN')

            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_etat = 'CRN'
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id, exercice_idN1 },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        return true;

    } catch (error) {
        console.log(error);
    }
}

const soldeRubriqueCRF = async (compte_id, dossier_id, exercice_id) => {
    try {
        const {
            id_exerciceN1,
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1 ? id_exerciceN1 : 0;

        //mettre à jour les montants dans la colonne montantbrut
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantbrut = (SELECT COALESCE(SUM(soldedebit-soldecredit),0) FROM balances WHERE balances.rubriquecrf = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalculcrf = 'D-C')
            + (SELECT COALESCE(SUM(soldecredit - soldedebit),0) FROM balances WHERE balances.rubriquecrf = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalculcrf = 'C-D')
            
            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'CRF' AND ajustements.nature = 'BRUT')
            
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'CRF' AND rubriques.subtable = 0 AND NOT rubriques.nature IN('TOTAL','TITRE')
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //calculer les montants net
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantnet = montantbrut
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'CRF' AND rubriques.subtable = 0 AND NOT rubriques.nature IN('TOTAL','TITRE')
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //mettre à jour les montants pour l'exercice N-1
        await db.sequelize.query(`
            UPDATE rubriques as TabA SET
            montantnetn1 = (SELECT COALESCE(SUM(montantnet),0) FROM rubriques as TabB WHERE tabB.id_rubrique = tabA.id_rubrique
            AND tabB.id_compte = :compte_id AND tabB.id_dossier = :dossier_id AND tabB.id_exercice = :exercice_idN1 AND
            tabB.id_etat = 'CRF')

            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_etat = 'CRF'
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id, exercice_idN1 },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        return true;

    } catch (error) {
        console.log(error);
    }
}

const soldeRubriqueTFTD = async (compte_id, dossier_id, exercice_id) => {
    try {
        const {
            id_exerciceN1,
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1 ? id_exerciceN1 : 0;

        //mettre à jour les montants dans la colonne montantbrut
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantbrut = (SELECT COALESCE(SUM(soldedebittreso - soldecredittreso),0) FROM balances WHERE balances.rubriquetftd = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalcultftd = 'D-C')
            + (SELECT COALESCE(SUM(soldecredittreso - soldedebittreso),0) FROM balances WHERE balances.rubriquetftd = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalcultftd = 'C-D')
            
            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'TFTD' AND ajustements.nature = 'BRUT')
            
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'TFTD' AND rubriques.subtable = 0 AND rubriques.nature IN('BRUT')
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //calculer les montants net
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantnet = montantbrut
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'TFTD' AND rubriques.subtable = 0 AND rubriques.nature IN('BRUT')
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //mettre à jour les montants pour l'exercice N-1
        await db.sequelize.query(`
            UPDATE rubriques as TabA SET
            montantnetn1 = (SELECT COALESCE(SUM(montantnet),0) FROM rubriques as TabB WHERE tabB.id_rubrique = tabA.id_rubrique
            AND tabB.id_compte = :compte_id AND tabB.id_dossier = :dossier_id AND tabB.id_exercice = :exercice_idN1 AND
            tabB.id_etat = 'TFTD')

            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_etat = 'TFTD'
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id, exercice_idN1 },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        return true;

    } catch (error) {
        console.log(error);
    }
}

const soldeRubriqueTFTI = async (compte_id, dossier_id, exercice_id) => {
    try {
        const {
            id_exerciceN1,
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1 ? id_exerciceN1 : 0;

        //mettre à jour les montants dans la colonne montantbrut
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantbrut = (SELECT COALESCE(SUM(soldedebit - soldecredit),0) FROM balances WHERE balances.rubriquetfti = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalcultfti = 'D-C')
            + (SELECT COALESCE(SUM(soldecredit - soldedebit),0) FROM balances WHERE balances.rubriquetfti = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalcultfti = 'C-D')

            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'TFTI' AND ajustements.nature = 'BRUT')
            
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'TFTI' AND rubriques.subtable = 0 AND rubriques.nature IN('BRUT')
        `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //calculer les montants net
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantnet = montantbrut
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'TFTI' AND rubriques.subtable = 0 AND rubriques.nature IN('BRUT')
            `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //mettre à jour les montants pour l'exercice N-1
        await db.sequelize.query(`
            UPDATE rubriques as TabA SET
            montantnetn1 = (SELECT COALESCE(SUM(montantnet),0) FROM rubriques as TabB WHERE tabB.id_rubrique = tabA.id_rubrique
            AND tabB.id_compte = :compte_id AND tabB.id_dossier = :dossier_id AND tabB.id_exercice = :exercice_idN1 AND
            tabB.id_etat = 'TFTI')

            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_etat = 'TFTI'
            `,
            {
                replacements: { compte_id, dossier_id, exercice_id, exercice_idN1 },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        return true;

    } catch (error) {
        console.log(error);
    }
}

const soldeRubriqueDRF = async (compte_id, dossier_id, exercice_id) => {
    try {
        const {
            id_exerciceN1,
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1 ? id_exerciceN1 : 0;

        await db.sequelize.query(`
            UPDATE liassedrfs SET
            montant_brut = 0
            
            WHERE liassedrfs.id_compte = :compte_id AND liassedrfs.id_dossier = :dossier_id AND liassedrfs.id_exercice = :exercice_id
            AND liassedrfs.id_etat = 'DRF' AND liassedrfs.nature IN('BRUT')
            `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        await db.sequelize.query(`
            UPDATE liassedrfs SET
            montant_brut = 0
            
            WHERE liassedrfs.id_compte = :compte_id AND liassedrfs.id_dossier = :dossier_id AND liassedrfs.id_exercice = :exercice_id
            AND liassedrfs.id_etat = 'DRF' AND liassedrfs.nature IN('BRUT')
            `,
            {
                replacements: { compte_id, dossier_id, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        await db.sequelize.query(`
            UPDATE liassedrfs SET
            montant_brut = montant_brut + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = liassedrfs.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'DRF' AND ajustements.nature = 'BRUT')
            
            WHERE liassedrfs.id_compte = :compte_id AND liassedrfs.id_dossier = :dossier_id AND liassedrfs.id_exercice = :exercice_id
            AND liassedrfs.id_etat = 'DRF' AND liassedrfs.nature IN('BRUT')
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

const soldeRubriqueSAD = async (compte_id, dossier_id, exercice_id) => {
    try {
        const {
            id_exerciceN1,
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1 ? id_exerciceN1 : 0;

        //Mise à jour de la colonne N-6 de l'exercice ( = colonne N-5 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesads as TabA SET
            n6 = (SELECT COALESCE(SUM(n5),0) FROM liassesads as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SAD' AND ajustements.nature = 'N6')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-5 de l'exercice ( = colonne N-4 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesads as TabA SET
            n5 = (SELECT COALESCE(SUM(n4),0) FROM liassesads as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SAD' AND ajustements.nature = 'N5')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-4 de l'exercice ( = colonne N-3 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesads as TabA SET
            n4 = (SELECT COALESCE(SUM(n3),0) FROM liassesads as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SAD' AND ajustements.nature = 'N4')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-3 de l'exercice ( = colonne N-2 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesads as TabA SET
            n3 = (SELECT COALESCE(SUM(n2),0) FROM liassesads as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SAD' AND ajustements.nature = 'N3')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-2 de l'exercice ( = colonne N-1 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesads as TabA SET
            n2 = (SELECT COALESCE(SUM(n1),0) FROM liassesads as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SAD' AND ajustements.nature = 'N2')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-1 de l'exercice ( = colonne N de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesads as TabA SET
            n1 = (SELECT COALESCE(SUM(n),0) FROM liassesads as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SAD' AND ajustements.nature = 'N1')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N de l'exercice
        await db.sequelize.query(`
            UPDATE liassesads as TabA SET
            n = (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SAD' AND ajustements.nature = 'N')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Récupération du déficit antérieur imputée dans le tableau DRF
        await db.sequelize.query(`
            UPDATE liassesads as TabA SET
            n = (SELECT COALESCE(SUM(montant_brut),0) FROM liassedrfs as TabB WHERE TabB.id_rubrique = 14
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SAD' AND ajustements.nature = 'N')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_rubrique = 8
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        return true;

    } catch (error) {
        console.log(error);
    }
}

const soldeRubriqueSDR = async (compte_id, dossier_id, exercice_id) => {
    try {
        const {
            id_exerciceN1,
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1 ? id_exerciceN1 : 0;

        //Mise à jour de la colonne N-6 de l'exercice ( = colonne N-5 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            n6 = (SELECT COALESCE(SUM(n5),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N6')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-5 de l'exercice ( = colonne N-4 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            n5 = (SELECT COALESCE(SUM(n4),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N5')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-4 de l'exercice ( = colonne N-3 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            n4 = (SELECT COALESCE(SUM(n3),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N4')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-3 de l'exercice ( = colonne N-2 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            n3 = (SELECT COALESCE(SUM(n2),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N3')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-2 de l'exercice ( = colonne N-1 de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            n2 = (SELECT COALESCE(SUM(n1),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N2')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N-1 de l'exercice ( = colonne N de l'exercice N-1)
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            n1 = (SELECT COALESCE(SUM(exercice),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = TabA.id_rubrique
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_idN1)
            +
            (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N1')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne N de l'exercice
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            exercice = (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'EXERCICE')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne Solde Imputable sur exercice ultérieur
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            solde_imputable = (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'SOLDE_IMPUTABLE')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Mise à jour de la colonne Solde Imputable sur exercice ultérieur
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            solde_non_imputable = (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'SOLDE_NON_IMPUTABLE')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Récupération du résultat fiscal sur la colonne exercice
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            exercice = (SELECT COALESCE(SUM(montant_brut),0) FROM liassedrfs as TabB WHERE TabB.id_rubrique = 5
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'EXERCICE')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_rubrique = 9
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //récupération du déficit antérieur imputable (total déficit restant à reporter N-1)
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            exercice = (SELECT COALESCE(SUM(n1),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 14
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'EXERCICE')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_rubrique = 10
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Récupération du déficit antérieur imputée dans le tableau DRF
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            exercice = (SELECT COALESCE(SUM(montant_brut),0) FROM liassedrfs as TabB WHERE TabB.id_rubrique = 8
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'EXERCICE')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_rubrique = 11
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        //Résultat fiscal après imputation des déficits
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            exercice = (SELECT COALESCE(SUM(exercice),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 9
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(exercice),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'EXERCICE'),


            n1 = (SELECT COALESCE(SUM(n1),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 9
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n1),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N1'),


            n2 = (SELECT COALESCE(SUM(n2),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 9
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n2),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N2'),


            n3 = (SELECT COALESCE(SUM(n3),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 9
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n3),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N3'),


            n4 = (SELECT COALESCE(SUM(n4),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 9
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n4),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N4'),


            n5 = (SELECT COALESCE(SUM(n5),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 9
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n5),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N5'),


            n6 = (SELECT COALESCE(SUM(n6),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 9
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n6),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N6')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_rubrique = 12
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );


        //calcul déficit restant à reporter
        await db.sequelize.query(`
            UPDATE liassesdrs as TabA SET
            exercice = (SELECT COALESCE(SUM(exercice),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 10
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(exercice),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(exercice),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 13
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'EXERCICE'),


            n1 = (SELECT COALESCE(SUM(n1),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 10
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n1),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n1),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 13
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N1'),


            n2 = (SELECT COALESCE(SUM(n2),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 10
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n2),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n2),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 13
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N2'),


            n3 = (SELECT COALESCE(SUM(n3),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 10
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n3),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n3),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 13
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N3'),


            n4 = (SELECT COALESCE(SUM(n4),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 10
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n4),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n4),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 13
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N4'),


            n5 = (SELECT COALESCE(SUM(n5),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 10
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n5),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n5),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 13
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N5'),


            n6 = (SELECT COALESCE(SUM(n6),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 10
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n6),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 11
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            -(SELECT COALESCE(SUM(n6),0) FROM liassesdrs as TabB WHERE TabB.id_rubrique = 13
            AND TabB.id_compte = :compte_id AND TabB.id_dossier = :dossier_id AND TabB.id_exercice = :exercice_id)

            +(SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = TabA.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'SDR' AND ajustements.nature = 'N6')
            
            WHERE TabA.id_compte = :compte_id AND TabA.id_dossier = :dossier_id AND TabA.id_exercice = :exercice_id
            AND TabA.id_rubrique = 14
            `,
            {
                replacements: { compte_id, dossier_id, exercice_idN1, exercice_id },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        return true;

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    soldeRubriqueBilan,
    soldeRubriqueCRN,
    soldeRubriqueCRF,
    soldeRubriqueTFTD,
    soldeRubriqueTFTI,
    soldeRubriqueDRF,
    soldeRubriqueSAD,
    soldeRubriqueSDR
};