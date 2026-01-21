const db = require("../../Models");
require('dotenv').config();
const { Op } = require('sequelize');

const dossierplancomptable = db.dossierplancomptable;
const balances = db.balances;
const dossiers = db.dossiers;
const exercices = db.exercices;
const userscomptes = db.userscomptes;
const balanceAnalytiques = db.balanceAnalytiques;
const caSections = db.caSections;
const caAxes = db.caAxes;
const journals = db.journals;

const PdfPrinter = require('pdfmake');
const ExcelJS = require('exceljs');
const { generateBalanceContent } = require('../../Middlewares/Balance/BalanceGeneratePdf');
const { exportBalanceTableExcel } = require('../../Middlewares/Balance/BalanceGenerateExcel');

const fonctionUpdateSoldAnalytique = require('../../Middlewares/UpdateSolde/updateBalanceAnalytique');
const updateSoldAnalytiqueGlobal = fonctionUpdateSoldAnalytique.updateSoldAnalytiqueGlobal;

const fonctionUpdateSoldGenerale = require('../../Middlewares/UpdateSolde/updateBalanceSold');
const updateSold = fonctionUpdateSoldGenerale.updateSold;

balances.belongsTo(dossierplancomptable, { as: 'compteLibelle', foreignKey: 'id_numcompte', targetKey: 'id' });
balances.belongsTo(dossierplancomptable, { as: 'compteCentralisation', foreignKey: 'id_numcomptecentr', targetKey: 'id' });

const recupBalance = async (req, res) => {
    try {
        const { centraliser, unSolded, movmentedCpt, compteId, fileId, exerciceId, type } = req.body || {};

        const cId = Number(compteId);
        const fId = Number(fileId);
        const eId = Number(exerciceId);

        if (!cId || !fId || !eId) {
            return res.json({ state: false, msg: 'Paramètres manquants pour la récupération de la balance.' });
        }

        let baseAUXFilter = {};

        if (type === 1) {
            baseAUXFilter = {
                baseaux: { [Op.like]: '401%' }
            };
        }

        if (type === 2) {
            baseAUXFilter = {
                baseaux: { [Op.like]: '411%' }
            };
        }

        const listeBalance = await balances.findAll({
            where: {
                id_compte: cId,
                id_dossier: fId,
                id_exercice: eId,
                valeur: { [Op.gt]: unSolded ? 0 : -1 },
                [Op.or]: [
                    { mvtdebit: { [Op.gt]: movmentedCpt ? 0 : -1 } },
                    { mvtcredit: { [Op.gt]: movmentedCpt ? 0 : -1 } }
                ]
            },
            include: [
                {
                    model: dossierplancomptable,
                    as: 'compteLibelle',
                    attributes: [
                        ['compte', 'compte'],
                        ['libelle', 'libelle'],
                        ['nature', 'nature'],
                        ['baseaux', 'baseaux']
                    ],
                    required: true,
                    where: {
                        id_compte: cId,
                        id_dossier: fId,
                        nature: { [Op.ne]: centraliser ? 'Aux' : 'Collectif' },
                        ...baseAUXFilter
                    }
                },
            ],
            raw: true,
            order: [
                [{ model: dossierplancomptable, as: 'compteLibelle' }, 'compte', 'ASC']
            ]
        })

        let resData = {
            state: true,
            list: listeBalance || []
        };

        return res.json(resData);

    } catch (error) {
        console.log(error);
        return res.json({ state: false, msg: "Erreur interne" });
    }
};

const recupBalanceFromJournal = async (req, res) => {
    try {
        const {
            compteId,
            fileId,
            exerciceId,
            centraliser = false,
            unSolded = false,
            movmentedCpt = false,
            type = null
        } = req.body;

        let rows = await db.sequelize.query(
            `
            SELECT 
                A.compte,
                A.libelle,
                SUM(J.debit) AS mvmdebit,
                SUM(J.credit) AS mvmcredit,
                GREATEST(SUM(J.debit) - SUM(J.credit), 0) AS soldedebit,
                GREATEST(SUM(J.credit) - SUM(J.debit), 0) AS soldecredit,
                ABS(SUM(J.credit) - SUM(J.debit)) AS valeur
            FROM dossierplancomptables C
            JOIN dossierplancomptables A 
                ON A.id = C.id
            JOIN journals J 
                ON 
                ${centraliser
                ? 'J.id_numcptcentralise = A.baseaux_id'
                : 'J.id_numcpt = A.id'
            }
            WHERE
                A.id_dossier = :id_dossier
                AND A.id_compte = :id_compte
                AND J.id_dossier = :id_dossier
                AND J.id_compte = :id_compte
                AND J.id_exercice = :id_exercice
                AND (
                    :type = 0
                    OR (:type = 1 AND A.baseaux LIKE '401%')
                    OR (:type = 2 AND A.baseaux LIKE '411%')
                )
                ${centraliser ? "AND A.nature <> 'Aux'" : "AND A.nature <> 'Collectif'"}
            GROUP BY 
                ${centraliser ? 'A.baseaux_id,' : 'A.id,'}
                A.compte,
                A.libelle
            HAVING
                (:unSolded = 0 OR ABS(SUM(J.debit) - SUM(J.credit)) > 0)
                AND (:movmentedCpt = 0 OR SUM(J.debit) > 0 OR SUM(J.credit) > 0)
            ORDER BY A.compte ASC
            `,
            {
                replacements: {
                    id_dossier: Number(fileId),
                    id_compte: Number(compteId),
                    id_exercice: Number(exerciceId),
                    unSolded: unSolded ? 1 : 0,
                    movmentedCpt: movmentedCpt ? 1 : 0,
                    type: Number(type)
                },
                type: db.Sequelize.QueryTypes.SELECT
            });

        // if (centraliser) {
        //     const collectifs = await db.sequelize.query(
        //         `
        //         SELECT
        //             C.ID AS id,
        //             C.COMPTE AS compte,
        //             C.LIBELLE AS libelle,
        //             SUM(J.DEBIT) AS mvmdebit,
        //             SUM(J.CREDIT) AS mvmcredit,
        //             GREATEST(SUM(J.DEBIT) - SUM(J.CREDIT), 0) AS soldedebit,
        //             GREATEST(SUM(J.CREDIT) - SUM(J.DEBIT), 0) AS soldecredit
        //         FROM DOSSIERPLANCOMPTABLES C
        //         JOIN DOSSIERPLANCOMPTABLES A
        //             ON A.BASEAUX_ID = C.ID
        //             AND A.NATURE = 'Aux'
        //             AND A.ID_COMPTE = :id_compte
        //             AND A.ID_DOSSIER = :id_dossier
        //         JOIN JOURNALS J
        //             ON J.ID_NUMCPT = A.ID
        //             AND J.ID_DOSSIER = :id_dossier
        //             AND J.ID_COMPTE = :id_compte
        //             AND J.ID_EXERCICE = :id_exercice
        //         WHERE C.NATURE = 'Collectif'
        //         GROUP BY C.ID, C.COMPTE, C.LIBELLE
        //         ORDER BY C.COMPTE ASC
        //         `,
        //         {
        //             replacements: {
        //                 id_compte: Number(compteId),
        //                 id_dossier: Number(fileId),
        //                 id_exercice: Number(exerciceId)
        //             },
        //             type: db.Sequelize.QueryTypes.SELECT
        //         }
        //     );

        //     const collectifIds = collectifs.map(c => c.id);
        //     rows = rows.filter(r => !collectifIds.includes(r.id));
        //     rows.push(...collectifs);
        // }

        return res.json({ state: true, list: rows });

    } catch (error) {
        console.error(error);
        return res.json({ state: false, msg: 'Erreur serveur', error: error.message });
    }
};

// const recupBalanceFromJournal = async (req, res) => {
//     try {
//         const { compteId, fileId, exerciceId, centraliser = false, unSolded = false, movmentedCpt = false, type = 0 } = req.body;

//         const cId = Number(compteId);
//         const fId = Number(fileId);
//         const eId = Number(exerciceId);

//         if (!cId || !fId || !eId) {
//             return res.json({ state: false, msg: 'Paramètres manquants pour la récupération de la balance.' });
//         }

//         const comptesCollectif = await dossierplancomptable.findAll({
//             where: { id_compte: cId, id_dossier: fId, nature: 'Collectif' }
//         });

//         let comptesIds = [cId]; 

//         for (const collectif of comptesCollectif) {
//             const auxilliaires = await dossierplancomptable.findAll({
//                 where: { id_compte: cId, id_dossier: fId, nature: 'Aux', baseaux_id: collectif.id }
//             });
//             comptesIds.push(...auxilliaires.map(val => Number(val.id)));
//         }

//         const rows = await journals.findAll({
//             where: {
//                 id_dossier: fId,
//                 id_exercice: eId,
//                 id_numcpt: { [Op.in]: comptesIds }
//             },
//             include: [
//                 {
//                     model: dossierplancomptable,
//                     as: 'compteLibelle',
//                     attributes: ['id', 'id_compte', 'compte', 'libelle', 'nature', 'baseaux'],
//                     required: true,
//                     where: {
//                         ...(type === 1 ? { baseaux: { [Op.like]: '401%' } } : {}),
//                         ...(type === 2 ? { baseaux: { [Op.like]: '411%' } } : {}),
//                         [Op.or]: [
//                             { nature: centraliser ? { [Op.ne]: 'Aux' } : { [Op.ne]: 'Collectif' } }
//                         ]
//                     }
//                 }
//             ]
//         });

//         const resultMap = new Map();

//         for (const row of rows) {
//             const data = row.toJSON();
//             const compteKey = data.compteLibelle.id_compte; 

//             const totalDebit = Number(data.debit || 0);
//             const totalCredit = Number(data.credit || 0);
//             const soldedebit = Math.max(totalDebit - totalCredit, 0);
//             const soldecredit = Math.max(totalCredit - totalDebit, 0);

//             if (!resultMap.has(compteKey)) {
//                 resultMap.set(compteKey, {
//                     compte: data.compteLibelle.compte,
//                     libelle: data.compteLibelle.libelle,
//                     mvmdebit: totalDebit,
//                     mvmcredit: totalCredit,
//                     soldedebit,
//                     soldecredit
//                 });
//             } else {
//                 const existing = resultMap.get(compteKey);
//                 existing.mvmdebit += totalDebit;
//                 existing.mvmcredit += totalCredit;
//                 existing.soldedebit += soldedebit;
//                 existing.soldecredit += soldecredit;
//             }
//         }

//         let resultList = Array.from(resultMap.values());

//         if (unSolded) {
//             resultList = resultList.filter(r => Math.abs(r.mvmdebit - r.mvmcredit) > 0);
//         }
//         if (movmentedCpt) {
//             resultList = resultList.filter(r => r.mvmdebit > 0 || r.mvmcredit > 0);
//         }

//         resultList.sort((a, b) => (a.compte > b.compte ? 1 : -1));

//         return res.json({ state: true, list: resultList });

//     } catch (error) {
//         console.error(error);
//         return res.json({ state: false, msg: 'Erreur serveur', error: error.message });
//     }
// };

const recupBalanceCa = async (req, res) => {
    const { fileId, exerciceId, compteId, id_axes, id_sections, centraliser, unSolded, movmentedCpt } = req.body;

    // await updateSoldAnalytiqueGlobal(compteId, fileId, exerciceId, id_axes, id_sections);

    const sectionData = await caSections.findAll({
        where: {
            id_axe: id_axes
        }
    })

    const mappedSectionsIds = sectionData.map(val => Number(val.id));

    const sectionsIds = !id_sections || id_sections.length === 0 ? mappedSectionsIds : id_sections;

    const balanceAnalytique = await balanceAnalytiques.findAll({
        where: {
            id_dossier: Number(fileId),
            id_exercice: Number(exerciceId),
            id_compte: Number(compteId),
            id_axe: id_axes,
            id_section: { [Op.in]: sectionsIds },
            valeuranalytique: { [Op.gt]: unSolded ? 0 : -1 },
            [Op.or]: [
                { mvtdebitanalytique: { [Op.gt]: movmentedCpt ? 0 : -1 } },
                { mvtcreditanalytique: { [Op.gt]: movmentedCpt ? 0 : -1 } }
            ]
        },
        include: [
            { model: caAxes },
            { model: caSections },
            {
                model: dossierplancomptable,
                as: 'compteLibelle',
                attributes: [
                    ['compte', 'compte'],
                    ['libelle', 'libelle'],
                    ['nature', 'nature'],
                    ['baseaux', 'baseaux']
                ],
                required: true,
                where: {
                    id_dossier: Number(fileId),
                    id_compte: Number(compteId),
                    nature: { [Op.ne]: centraliser ? 'Aux' : 'Collectif' },
                }
            },
        ],
        order: [
            [{ model: dossierplancomptable, as: 'compteLibelle' }, 'compte', 'ASC']
        ]
    })

    const balanceAnalytiqueMapped = balanceAnalytique.map(val => {
        const codeAxe = val.caax ? val.caax.code : null;
        const section = val.casection ? val.casection.section : null;

        const compte = val.compteLibelle ? val.compteLibelle.compte : null;

        const libelle = `${codeAxe ?? ""} : ${section ?? ""}`;

        return {
            'compteLibelle.libelle': libelle,
            'compteLibelle.compte': compte,
            mvtdebitanalytique: val.mvtdebitanalytique,
            mvtcreditanalytique: val.mvtcreditanalytique,
            soldedebitanalytique: val.soldedebitanalytique,
            soldecreditanalytique: val.soldecreditanalytique,
            valeuranalytique: val.valeuranalytique
        }
    })

    return res.json({
        state: true,
        list: balanceAnalytiqueMapped
    });
};

const actualizeBalance = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice, type, id_axe, id_sections } = req.body;
        if (type === 3) {
            await updateSoldAnalytiqueGlobal(id_compte, id_dossier, id_exercice, id_axe, id_sections);
            return res.json({ state: true, message: 'Balance analytique actualisé avec succès' });
        } else {
            await updateSold(id_compte, id_dossier, id_exercice, [], true);
            return res.json({ state: true, message: 'Balance générale actualisé avec succès' });
        }
    } catch (error) {
        console.log(error);
        return res.json({ state: false, message: "Erreur interne" });
    }
}

module.exports = {
    recupBalanceFromJournal,
    recupBalance,
    exportPdf: async (req, res) => {
        try {
            const { centraliser = false, unSolded = false, movmentedCpt = false, compteId, fileId, exerciceId } = req.body || {};

            if (!compteId || !fileId || !exerciceId) {
                return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
            }

            const dossier = await dossiers.findByPk(fileId);
            const exercice = await exercices.findByPk(exerciceId);
            const compte = await userscomptes.findByPk(compteId, { attributes: ['id', 'nom'], raw: true });

            const { buildTable, list } = await generateBalanceContent(compteId, fileId, exerciceId, centraliser, unSolded, movmentedCpt);
            if (!list || list.length === 0) {
                return res.status(404).json({ state: false, msg: 'Aucune donnée de balance.' });
            }

            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return String(dateString);
                const dd = String(date.getDate()).padStart(2, '0');
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const yyyy = date.getFullYear();
                return `${dd}/${mm}/${yyyy}`;
            };

            const fonts = {
                Helvetica: {
                    normal: 'Helvetica',
                    bold: 'Helvetica-Bold',
                    italics: 'Helvetica-Oblique',
                    bolditalics: 'Helvetica-BoldOblique'
                }
            };

            const docDefinition = {
                pageSize: 'A4',
                pageOrientation: 'landscape',
                pageMargins: [10, 40, 10, 40],
                defaultStyle: { font: 'Helvetica', fontSize: 8 },
                content: [
                    { text: 'BALANCE', style: 'header', alignment: 'center', margin: [0, 0, 0, 15] },
                    {
                        text: `Dossier: ${dossier?.dossier || ''}`, alignment: 'center',
                        style: 'subheader', margin: [0, 0, 0, 20]
                    },
                    {
                        text: `Période du ${formatDate(exercice?.date_debut)} au ${formatDate(exercice?.date_fin)}`,
                        alignment: 'left',
                        style: 'subheader2', margin: [0, 0, 0, 20]
                    },
                    {
                        ...buildTable(list)[0],
                        layout: {
                            hLineWidth: () => 0,
                            vLineWidth: () => 0,
                            paddingTop: () => 4,
                            paddingBottom: () => 4
                        }
                    }
                ],
                styles: {
                    header: { fontSize: 18, bold: true, font: 'Helvetica' },
                    subheader: { fontSize: 18, bold: true, font: 'Helvetica' },
                    subheader2: { fontSize: 12, bold: true, font: 'Helvetica' },
                    tableHeader: { bold: true, fontSize: 7, color: 'white', fillColor: '#1A5276', alignment: 'center', font: 'Helvetica' }
                }
            };

            const printer = new PdfPrinter(fonts);
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Balance_${fileId}_${exerciceId}.pdf`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        } catch (error) {
            console.error('[BALANCE][PDF] error:', error);
            return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
        }
    },
    exportExcel: async (req, res) => {
        try {
            const { centraliser = false, unSolded = false, movmentedCpt = false, compteId, fileId, exerciceId } = req.body || {};
            if (!compteId || !fileId || !exerciceId) {
                return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
            }

            const dossier = await dossiers.findByPk(fileId);
            const exercice = await exercices.findByPk(exerciceId);
            const compte = await userscomptes.findByPk(compteId, { attributes: ['id', 'nom'], raw: true });

            const workbook = new ExcelJS.Workbook();
            await exportBalanceTableExcel(compteId, fileId, exerciceId, centraliser, unSolded, movmentedCpt, workbook, dossier?.dossier, compte?.nom, exercice?.date_debut, exercice?.date_fin);
            workbook.views = [{ activeTab: 0 }];

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Balance_${fileId}_${exerciceId}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('[BALANCE][EXCEL] error:', error);
            return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
        }
    },
    recupBalanceCa,
    actualizeBalance
}