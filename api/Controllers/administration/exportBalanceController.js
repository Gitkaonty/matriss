const db = require("../../Models");
require('dotenv').config();
const { Op } = require('sequelize');

const dossierplancomptable = db.dossierplancomptable;
const balances = db.balances;
const balanceAnalytiques = db.balanceAnalytiques;
const dossiers = db.dossiers;
const exercices = db.exercices;
const userscomptes = db.userscomptes;
const caAxes = db.caAxes;
const caSections = db.caSections;
const analytiques = db.analytiques;
const journals = db.journals;

const PdfPrinter = require('pdfmake');
const ExcelJS = require('exceljs');
const { generateBalanceContent } = require('../../Middlewares/Balance/BalanceGeneratePdf');
const { exportBalanceTableExcel } = require('../../Middlewares/Balance/BalanceGenerateExcel');

const fonctionUpdateSoldAnalytique = require('../../Middlewares/UpdateSolde/updateBalanceAnalytique');
const updateSoldAnalytique = fonctionUpdateSoldAnalytique.updateSoldAnalytique;
const addCompteBilanToBalanceAnalytique = fonctionUpdateSoldAnalytique.addCompteBilanToBalanceAnalytique;

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
                [{ model: dossierplancomptable, as: 'compteLibelle' }, 'libelle', 'ASC']
            ]
        });

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

const recupBalanceCa = async (req, res) => {
    const { fileId, exerciceId, compteId, id_axes, id_sections, centraliser, unSolded, movmentedCpt } = req.body;

    await updateSoldAnalytique(compteId, fileId, exerciceId);

    if (!compteId) return res.json({ state: false, message: 'Compte non trouvé' });
    if (!fileId) return res.json({ state: false, message: 'Dossier non trouvé' });
    if (!exerciceId) return res.json({ state: false, message: 'Exercice non trouvé' });
    if (!id_axes) return res.json({ state: false, message: 'Axe non trouvé' });

    const sectionData = await caSections.findAll({
        where: {
            id_axe: id_axes
        }
    })

    const mappedSectionsIds = sectionData.map(val => Number(val.id));

    const sectionsIds = !id_sections || id_sections.length === 0 ? mappedSectionsIds : id_sections;

    await addCompteBilanToBalanceAnalytique(compteId, fileId, exerciceId, id_axes, sectionsIds);
};

module.exports = {
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
    recupBalanceCa
}