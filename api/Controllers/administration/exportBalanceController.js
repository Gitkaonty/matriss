const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const dossierplancomptable = db.dossierplancomptable;
const balances = db.balances;
const dossiers = db.dossiers;
const exercices = db.exercices;
const userscomptes = db.userscomptes;
const PdfPrinter = require('pdfmake');
const ExcelJS = require('exceljs');
const { generateBalanceContent } = require('../../Middlewares/Balance/BalanceGeneratePdf');
const { exportBalanceTableExcel } = require('../../Middlewares/Balance/BalanceGenerateExcel');

balances.belongsTo(dossierplancomptable, { as: 'compteLibelle', foreignKey: 'id_numcompte' , targetKey: 'id'});
balances.belongsTo(dossierplancomptable, { as: 'compteCentralisation', foreignKey: 'id_numcomptecentr' , targetKey: 'id'});

const recupBalance = async (req, res) => {
    try{
        const { centraliser, unSolded, movmentedCpt, compteId, fileId, exerciceId } = req.body || {}; 

        const cId = Number(compteId);
        const fId = Number(fileId);
        const eId = Number(exerciceId);

        if (!cId || !fId || !eId) {
            return res.json({ state: false, msg: 'Paramètres manquants pour la récupération de la balance.' });
        }

        let resData = {
            state: false,
            msg: '',
            list: []
        }

        const listeBalance = await balances.findAll({
            where: 
              {
                id_compte: cId,
                id_dossier: fId,
                id_exercice: eId,
                valeur: { [Op.gt]: unSolded? 0: -1},
                [Op.or]: [
                    { mvtdebit: { [Op.gt]: movmentedCpt? 0: -1 } },
                    { mvtcredit: { [Op.gt]: movmentedCpt? 0: -1 } }
                ]
              },
            include: [
              { model: dossierplancomptable, 
                as: 'compteLibelle',
                attributes: [
                    ['compte', 'compte'],
                    ['libelle', 'libelle'],
                    ['nature', 'nature']
                ],
                required: true,
                where: {
                    id_compte: cId,
                    id_dossier: fId,
                    nature: { [Op.ne]: centraliser? 'Aux': 'Collectif' }
                }
              },
            ],
            raw:true,
            order: [[{ model: dossierplancomptable, as: 'compteLibelle' }, 'libelle', 'ASC']]
        });

        if(listeBalance){
            resData.state = true;

            let sortedList = listeBalance.sort((a, b) => {
                const libA = a['compteLibelle.compte'] || '';
                const libB = b['compteLibelle.compte'] || '';
                return libA.localeCompare(libB);
            });

            resData.list = sortedList;
        }else{
            resData.state = false;
            resData.list = [];
        }
    
        return res.json(resData);
    }catch (error){
        console.log(error);
    }
}

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
                const compte = await userscomptes.findByPk(compteId, { attributes: ['id','nom'], raw: true });

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
                        { text: 'BALANCE', style: 'header', alignment: 'center', margin: [0,0,0,15] },
                        { text: `Dossier: ${dossier?.dossier || ''}`, alignment: 'center',
                          style: 'subheader', margin: [0,0,0,20] },
                        { text: `Période du ${formatDate(exercice?.date_debut)} au ${formatDate(exercice?.date_fin)}`,
                          alignment: 'left',
                          style: 'subheader2', margin: [0,0,0,20] },
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
                const compte = await userscomptes.findByPk(compteId, { attributes: ['id','nom'], raw: true });

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
        }
    }