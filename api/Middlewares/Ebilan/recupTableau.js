const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const rubriques = db.rubriques;
const rubriquesmatrices = db.rubriquesmatrices;
const compterubriques = db.compterubriques;
const compterubriquematrices = db.compterubriquematrices;
const liassebhiapcs = db.liassebhiapcs;
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
const etats = db.etats;
const balances = db.balances;
const dossierplancomptables = db.dossierplancomptable;
const ajustements = db.ajustements;

const recupBILAN_ACTIF = async (compteId, fileId, exerciceId) => {
    try{
        const listeBrute = await rubriques.findAll({
            where: {
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: 'BILAN',
                subtable: 1,
            },
            include: [
                {
                model: rubriquesmatrices,
                attributes: [['libelle', 'libelle']],
                required: false,
                where: {
                    id_etat: 'BILAN',
                },
                },
                {
                model: balances,
                as: 'details',
                attributes: [
                    ['id_numcompte', 'id_numcompte'],
                    ['soldedebit', 'soldedebit'],
                    ['soldecredit', 'soldecredit']
                ],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    nature: { [Op.notIn]: ['Collectif'] },
                    valeur: {[Op.gt]: 0}
                },
                include: [
                    {
                    model: dossierplancomptables,
                    as: 'infosCompte', // doit correspondre à l'alias de la relation
                    attributes: ['compte', 'libelle'],
                    required: false,
                    where: {
                        id_compte: compteId,
                        id_dossier: fileId,
                    },
                    }
                ]
                },
                {
                model: ajustements,
                as: 'ajusts',
                attributes: ['id', 'id_compte', 'id_dossier', 'id_exercice', 'id_etat', 'id_rubrique', 'nature', 'motif', 'montant'],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    id_etat: 'BILAN',
                },
                },
            ],
            raw: false,
            order: [['ordre', 'ASC']],
        });

        const liste = listeBrute.map(rubrique => {
            const plain = rubrique.get({ plain: true });
            
            return {
                ...plain,
                'rubriquesmatrix.libelle': plain.rubriquesmatrix?.libelle || '',
                infosCompte: (plain.details || []).map(detail => ({
                id_numcompte: detail.id_numcompte,  // Prendre l'id_numcompte ici
                compte: detail.infosCompte?.compte || null,
                libelle: detail.infosCompte?.libelle || null,
                soldedebit: detail.soldedebit || 0,
                soldecredit: detail.soldecredit || 0
                }))
            };
        });

        return liste ;
    }catch (error){
        console.log(error);
    }
}

const recupBILAN_PASSIF = async (compteId, fileId, exerciceId) => {
    try{
        const listeBrute = await rubriques.findAll({
            where: {
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: 'BILAN',
                subtable: 2,
            },
            include: [
                {
                model: rubriquesmatrices,
                attributes: [['libelle', 'libelle']],
                required: false,
                where: {
                    id_etat: 'BILAN',
                },
                },
                {
                model: balances,
                as: 'details',
                attributes: [
                    ['id_numcompte', 'id_numcompte'],
                    ['soldedebit', 'soldedebit'],
                    ['soldecredit', 'soldecredit']
                ],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    nature : {[Op.notIn]: ['Collectif']}
                },
                include: [
                    {
                    model: dossierplancomptables,
                    as: 'infosCompte', // doit correspondre à l'alias de la relation
                    attributes: ['compte', 'libelle'],
                    required: false,
                    where: {
                        id_compte: compteId,
                        id_dossier: fileId,
                    },
                    }
                ]
                },
                {
                model: ajustements,
                as: 'ajusts',
                attributes: ['id', 'id_compte', 'id_dossier', 'id_exercice', 'id_etat', 'id_rubrique', 'nature', 'motif', 'montant'],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    id_etat: 'BILAN',
                },
                },
            ],
            raw: false,
            order: [['ordre', 'ASC']],
        });
        
        const liste = listeBrute.map(rubrique => {
            const plain = rubrique.get({ plain: true });
            
            return {
                ...plain,
                'rubriquesmatrix.libelle': plain.rubriquesmatrix?.libelle || '',
                infosCompte: (plain.details || []).map(detail => ({
                id_numcompte: detail.id_numcompte,  // Prendre l'id_numcompte ici
                compte: detail.infosCompte?.compte || null,
                libelle: detail.infosCompte?.libelle || null,
                soldedebit: detail.soldedebit || 0,
                soldecredit: detail.soldecredit || 0
                }))
            };
        });
        
        return liste ;
    }catch (error){
        console.log(error);
    }
}

const recupCRN = async (compteId, fileId, exerciceId) => {
    try{
        const listeBrute = await rubriques.findAll({
            where: {
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: 'CRN',
                subtable: 0,
            },
            include: [
                {
                model: rubriquesmatrices,
                attributes: [['libelle', 'libelle']],
                required: false,
                where: {
                    id_etat: 'CRN',
                },
                },
                {
                model: balances,
                as: 'detailsCRN',
                attributes: [
                    ['id_numcompte', 'id_numcompte'],
                    ['soldedebit', 'soldedebit'],
                    ['soldecredit', 'soldecredit']
                ],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    nature : {[Op.notIn]: ['Collectif']}
                },
                include: [
                    {
                    model: dossierplancomptables,
                    as: 'infosCompte', // doit correspondre à l'alias de la relation
                    attributes: ['compte', 'libelle'],
                    required: false,
                    where: {
                        id_compte: compteId,
                        id_dossier: fileId,
                    },
                    }
                ]
                },
                {
                model: ajustements,
                as: 'ajusts',
                attributes: ['id', 'id_compte', 'id_dossier', 'id_exercice', 'id_etat', 'id_rubrique', 'nature', 'motif', 'montant'],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    id_etat: 'CRN',
                },
                },
            ],
            raw: false,
            order: [['ordre', 'ASC']],
        });

        const liste = listeBrute.map(rubrique => {
            const plain = rubrique.get({ plain: true });
            
            return {
                ...plain,
                'rubriquesmatrix.libelle': plain.rubriquesmatrix?.libelle || '',
                infosCompte: (plain.detailsCRN || []).map(detail => ({
                id_numcompte: detail.id_numcompte,  // Prendre l'id_numcompte ici
                compte: detail.infosCompte?.compte || null,
                libelle: detail.infosCompte?.libelle || null,
                soldedebit: detail.soldedebit || 0,
                soldecredit: detail.soldecredit || 0
                }))
            };
        });

        return liste ;
    }catch (error){
        console.log(error);
    }
}

const recupCRF = async (compteId, fileId, exerciceId) => {
    try{
        const listeBrute = await rubriques.findAll({
            where: {
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: 'CRF',
                subtable: 0,
            },
            include: [
                {
                model: rubriquesmatrices,
                attributes: [['libelle', 'libelle']],
                required: false,
                where: {
                    id_etat: 'CRF',
                },
                },
                {
                model: balances,
                as: 'detailsCRF',
                attributes: [
                    ['id_numcompte', 'id_numcompte'],
                    ['soldedebit', 'soldedebit'],
                    ['soldecredit', 'soldecredit']
                ],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    nature : {[Op.notIn]: ['Collectif']}
                },
                include: [
                    {
                    model: dossierplancomptables,
                    as: 'infosCompte', // doit correspondre à l'alias de la relation
                    attributes: ['compte', 'libelle'],
                    required: false,
                    where: {
                        id_compte: compteId,
                        id_dossier: fileId,
                    },
                    }
                ]
                },
                {
                model: ajustements,
                as: 'ajusts',
                attributes: ['id', 'id_compte', 'id_dossier', 'id_exercice', 'id_etat', 'id_rubrique', 'nature', 'motif', 'montant'],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    id_etat: 'CRF',
                },
                },
            ],
            raw: false,
            order: [['ordre', 'ASC']],
        });

        const liste = listeBrute.map(rubrique => {
            const plain = rubrique.get({ plain: true });
            
            return {
                ...plain,
                'rubriquesmatrix.libelle': plain.rubriquesmatrix?.libelle || '',
                infosCompte: (plain.detailsCRF || []).map(detail => ({
                id_numcompte: detail.id_numcompte,  // Prendre l'id_numcompte ici
                compte: detail.infosCompte?.compte || null,
                libelle: detail.infosCompte?.libelle || null,
                soldedebit: detail.soldedebit || 0,
                soldecredit: detail.soldecredit || 0
                }))
            };
        });

        return liste ;
    }catch (error){
        console.log(error);
    }
}

const recupTFTI = async (compteId, fileId, exerciceId) => {
    try{
        const listeBrute = await rubriques.findAll({
            where: {
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: 'TFTI',
                subtable: 0,
            },
            include: [
                {
                model: rubriquesmatrices,
                attributes: [['libelle', 'libelle']],
                required: false,
                where: {
                    id_etat: 'TFTI',
                },
                },
                {
                model: balances,
                as: 'detailsTFTI',
                attributes: [
                    ['id_numcompte', 'id_numcompte'],
                    ['soldedebit', 'soldedebit'],
                    ['soldecredit', 'soldecredit']
                ],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    nature : {[Op.notIn]: ['Collectif']}
                },
                include: [
                    {
                    model: dossierplancomptables,
                    as: 'infosCompte', // doit correspondre à l'alias de la relation
                    attributes: ['compte', 'libelle'],
                    required: false,
                    where: {
                        id_compte: compteId,
                        id_dossier: fileId,
                    },
                    }
                ]
                },
                {
                model: ajustements,
                as: 'ajusts',
                attributes: ['id', 'id_compte', 'id_dossier', 'id_exercice', 'id_etat', 'id_rubrique', 'nature', 'motif', 'montant'],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    id_etat: 'TFTI',
                },
                },
            ],
            raw: false,
            order: [['ordre', 'ASC']],
        });

        const liste = listeBrute.map(rubrique => {
            const plain = rubrique.get({ plain: true });
            
            return {
                ...plain,
                'rubriquesmatrix.libelle': plain.rubriquesmatrix?.libelle || '',
                infosCompte: (plain.detailsTFTI || []).map(detail => ({
                id_numcompte: detail.id_numcompte,  // Prendre l'id_numcompte ici
                compte: detail.infosCompte?.compte || null,
                libelle: detail.infosCompte?.libelle || null,
                soldedebit: detail.soldedebit || 0,
                soldecredit: detail.soldecredit || 0
                }))
            };
        });

        return liste ;
    }catch (error){
        console.log(error);
    }
}

const recupTFTD = async (compteId, fileId, exerciceId) => {
    try{
        const listeBrute = await rubriques.findAll({
            where: {
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: 'TFTD',
                subtable: 0,
            },
            include: [
                {
                model: rubriquesmatrices,
                attributes: [['libelle', 'libelle']],
                required: false,
                where: {
                    id_etat: 'TFTD',
                },
                },
                {
                model: balances,
                as: 'detailsTFTD',
                attributes: [
                    ['id_numcompte', 'id_numcompte'],
                    ['soldedebittreso', 'soldedebittreso'],
                    ['soldecredittreso', 'soldecredittreso']
                ],
                required: false,
                where: {
                    [Op.and]: [
                        { id_compte: compteId },
                        { id_dossier: fileId },
                        { id_exercice: exerciceId },
                        { nature: { [Op.notIn]: ['Collectif'] } },
                        {
                        [Op.or]: [
                            { soldedebittreso: { [Op.gt]: 0 } },
                            { soldecredittreso: { [Op.gt]: 0 } }
                        ]
                        }
                    ]
                },
                include: [
                    {
                    model: dossierplancomptables,
                    as: 'infosCompte', // doit correspondre à l'alias de la relation
                    attributes: ['compte', 'libelle'],
                    required: false,
                    where: {
                        id_compte: compteId,
                        id_dossier: fileId,
                    },
                    }
                ]
                },
                {
                model: ajustements,
                as: 'ajusts',
                attributes: ['id', 'id_compte', 'id_dossier', 'id_exercice', 'id_etat', 'id_rubrique', 'nature', 'motif', 'montant'],
                required: false,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    id_etat: 'TFTD',
                },
                },
            ],
            raw: false,
            order: [['ordre', 'ASC']],
        });

        const liste = listeBrute.map(rubrique => {
            const plain = rubrique.get({ plain: true });
            
            return {
                ...plain,
                'rubriquesmatrix.libelle': plain.rubriquesmatrix?.libelle || '',
                infosCompte: (plain.detailsTFTD || []).map(detail => ({
                id_numcompte: detail.id_numcompte,  // Prendre l'id_numcompte ici
                compte: detail.infosCompte?.compte || null,
                libelle: detail.infosCompte?.libelle || null,
                soldedebit: detail.soldedebittreso || 0,
                soldecredit: detail.soldecredittreso || 0
                }))
            };
        });

        return liste ;
    }catch (error){
        console.log(error);
    }
}

const recupEVCP = async (compteId, fileId, exerciceId) => {
    try{
        const listeBrute = await liasseevcps.findAll({
            where: {
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: 'EVCP',
            },
            include: [
                {
                    model: rubriquesmatrices,
                    attributes: [['libelle', 'libelle']],
                    required: false,
                    where: {
                        id_etat: 'EVCP',
                    },
                },
                {
                    model: ajustements,
                    as: 'ajustsEVCP',
                    attributes: ['id', 'id_compte', 'id_dossier', 'id_exercice', 'id_etat', 'id_rubrique', 'nature', 'motif', 'montant'],
                    required: false,
                    where: {
                        id_compte: compteId,
                        id_dossier: fileId,
                        id_exercice: exerciceId,
                        id_etat: 'EVCP',
                    },
                },
            ],
            raw: false,
            order: [['ordre', 'ASC']],
        });

        const liste = listeBrute.map(rubrique => {
            const plain = rubrique.get({ plain: true });
            return {
                ...plain,
                'rubriquesmatrix.libelle': plain.rubriquesmatrix?.libelle || '',
            };
        });

        return liste ;
    }catch (error){
        console.log(error);
    }
}

module.exports = {
    recupBILAN_ACTIF,
    recupBILAN_PASSIF,
    recupCRN,
    recupCRF,
    recupTFTI,
    recupTFTD,
    recupEVCP
};