const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const recupExerciceN1 = require('../Standard/recupExerciceN1');

const journals = db.journals;
const codejournals = db.codejournals;
const dossierPlanComptable = db.dossierplancomptable;
const balances = db.balances;
const liassebhiapcs = db.liassebhiapcs;
const liassebilans = db.liassebilans;
const liassecrfs = db.liassecrfs;
const liassecrns = db.liassecrns;
const liassedas = db.liassedas;
const liassedps = db.liassedps;
const liassedrfs = db.liassedrfs;
const liasseeiafncs = db.liasseeiafncs;
const liasseevcps = db.liasseevcps;
const liassempautres = db.liassempautres;
const liassemps = db.liassemps;
const liassenotes = db.liassenotes;
const liassesads = db.liassesads;
const liassesdrs = db.liassesdrs;
const liasseses = db.liasseses;
const liassetftds = db.liassetftds;
const liassetftis = db.liassetftis;
const rubriques = db.rubriques;
const compterubriques = db.compterubriques;

const soldeRubriqueBilan = async (compte_id, dossier_id, exercice_id) => {
    try{
        const {
            id_exerciceN1, 
            date_debutN1, 
            date_finN1, 
            libelleExerciceN1, 
            rangN1, 
            clotureN1 
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1? id_exerciceN1 : 0;

        //mettre à jour les montants pour chaque rubrique - ACTIF
        await db.sequelize.query(`
            UPDATE rubriques SET
            montantbrut = (SELECT COALESCE(SUM(soldedebit-soldecredit),0) FROM balances WHERE balances.rubriquebilanbrut = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalculbilan = 'D-C')

            + (SELECT COALESCE(SUM(soldecredit-soldedebit),0) FROM balances WHERE balances.rubriquebilanbrut = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalculbilan = 'C-D')
            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'BILAN' AND ajustements.nature = 'BRUT')
            ,
            montantamort = (SELECT COALESCE(SUM(soldedebit-soldecredit),0) FROM balances WHERE balances.rubriquebilanamort = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalculbilan = 'D-C')
            + (SELECT COALESCE(SUM(soldecredit-soldedebit),0) FROM balances WHERE balances.rubriquebilanamort = rubriques.id_rubrique
            AND balances.id_compte = :compte_id AND balances.id_dossier = :dossier_id AND balances.id_exercice = :exercice_id
            AND NOT balances.nature = 'Collectif' AND balances.senscalculbilan = 'C-D')

            + (SELECT COALESCE(SUM(montant),0) FROM ajustements WHERE ajustements.id_rubrique = rubriques.id_rubrique
            AND ajustements.id_compte = :compte_id AND ajustements.id_dossier = :dossier_id AND ajustements.id_exercice = :exercice_id
            AND ajustements.id_etat = 'BILAN' AND ajustements.nature = 'AMORT')
         
            WHERE rubriques.id_compte = :compte_id AND rubriques.id_dossier = :dossier_id AND rubriques.id_exercice = :exercice_id
            AND rubriques.id_etat = 'BILAN' AND NOT rubriques.nature IN('TOTAL','TITRE')
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
       
    }catch (error){
        console.log(error);
    }
}

const soldeRubriqueCRN = async (compte_id, dossier_id, exercice_id) => {
    try{
        const {
            id_exerciceN1, 
            date_debutN1, 
            date_finN1, 
            libelleExerciceN1, 
            rangN1, 
            clotureN1 
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1? id_exerciceN1 : 0;

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
       
    }catch (error){
        console.log(error);
    }
}

const soldeRubriqueCRF = async (compte_id, dossier_id, exercice_id) => {
    try{
        const {
            id_exerciceN1, 
            date_debutN1, 
            date_finN1, 
            libelleExerciceN1, 
            rangN1, 
            clotureN1 
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1? id_exerciceN1 : 0;

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
       
    }catch (error){
        console.log(error);
    }
}

const soldeRubriqueTFTD = async (compte_id, dossier_id, exercice_id) => {
    try{
        const {
            id_exerciceN1, 
            date_debutN1, 
            date_finN1, 
            libelleExerciceN1, 
            rangN1, 
            clotureN1 
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1? id_exerciceN1 : 0;

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
       
    }catch (error){
        console.log(error);
    }
}

const soldeRubriqueTFTI = async (compte_id, dossier_id, exercice_id) => {
    try{
        const {
            id_exerciceN1, 
            date_debutN1, 
            date_finN1, 
            libelleExerciceN1, 
            rangN1, 
            clotureN1 
        } = await recupExerciceN1.recupInfos(compte_id, dossier_id, exercice_id);

        const exercice_idN1 = id_exerciceN1? id_exerciceN1 : 0;

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
       
    }catch (error){
        console.log(error);
    }
}

module.exports = { 
    soldeRubriqueBilan,
    soldeRubriqueCRN,
    soldeRubriqueCRF,
    soldeRubriqueTFTD,
    soldeRubriqueTFTI
};