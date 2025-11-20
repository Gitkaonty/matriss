const db = require("../../Models");
const PdfPrinter = require('pdfmake');
const ExcelJS = require('exceljs');
const { generateRapproContent } = require('../../Middlewares/rapprochements/RapprochementsGeneratePdf');
const { exportRapprochementExcel } = require('../../Middlewares/rapprochements/RapprochementsGenerateExcel');

const dossiers = db.dossiers;
const exercices = db.exercices;
const userscomptes = db.userscomptes;
const dossierplancomptables = db.dossierplancomptable;
const rapprochements = db.rapprochements;
const codejournals = db.codejournals;
const Sequelize = require('sequelize');

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString).substring(0,10);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

module.exports = {
  exportPdf: async (req, res) => {
    try {
      const fileId = Number(req.query?.fileId);
      const compteId = Number(req.query?.compteId);
      const exerciceId = Number(req.query?.exerciceId);
      const pcId = Number(req.query?.pcId);
      const rapproId = Number(req.query?.rapproId);
      if (
        fileId === undefined || fileId === null || isNaN(fileId) ||
        compteId === undefined || compteId === null || isNaN(compteId) ||
        exerciceId === undefined || exerciceId === null || isNaN(exerciceId) ||
        pcId === undefined || pcId === null || isNaN(pcId) ||
        rapproId === undefined || rapproId === null || isNaN(rapproId)
      ) {
        return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
      }

      const dossier = await dossiers.findByPk(fileId);
      const exercice = await exercices.findByPk(exerciceId);
      const compte = await userscomptes.findByPk(compteId, { attributes: ['id','nom'], raw: true });
      const pc = await dossierplancomptables.findByPk(pcId);
      const row = await rapprochements.findOne({ where: { id: rapproId, id_dossier: fileId, id_compte: compteId, id_exercice: exerciceId, pc_id: pcId } });
      if (!row) return res.status(404).json({ state: false, msg: 'Ligne de rapprochement introuvable' });

      const fonts = {
        Helvetica: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique'
        }
      };

      const headerLines = [
        { text: 'RAPPROCHEMENT BANCAIRE', style: 'header', alignment: 'center', margin: [0, 0, 0, 8] },
        { text: `Dossier : ${dossier?.dossier || ''}`, alignment: 'center', fontSize: 15, bold: true, margin: [0, 0, 0, 5] },
        // { text: `Compte: ${pc?.compte || ''}  |  Utilisateur: ${compte?.nom || ''}`, alignment: 'left', fontSize: 9, margin: [0, 0, 0, 3] },
        { text: `Exercice: ${formatDate(exercice?.date_debut)} - ${formatDate(exercice?.date_fin)}`, alignment: 'left', fontSize: 9, margin: [0, 0, 0, 12] },
      ];

      const { rjson, summary, rapproTable, ecrituresTable } = await generateRapproContent(fileId, compteId, exerciceId, pcId, rapproId, exercice?.date_debut, exercice?.date_fin);

      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [20, 40, 20, 40],
        defaultStyle: { font: 'Helvetica', fontSize: 9 },
        content: [
          ...headerLines,
          { text: `Période: du ${formatDate(rjson?.date_debut)} au ${formatDate(rjson?.date_fin)}`, alignment: 'left', fontSize: 9, margin: [0, 0, 0, 6] },
          summary,
          { text: 'Ecritures', style: 'subheader', margin: [0, 0, 0, 6] },
          rapproTable,
          ecrituresTable
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Helvetica' },
          subheader: { fontSize: 11, bold: true, font: 'Helvetica' },
          tableHeader: { bold: true, fontSize: 8, color: 'white', fillColor: '#1A5276', alignment: 'center', font: 'Helvetica' }
        }
      };

      const printer = new PdfPrinter(fonts);
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Rapprochement_${rapproId}.pdf`);
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('[RAPPRO][PDF] error:', error);
      return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
    }
  },

  exportExcel: async (req, res) => {
    try {
      const fileId = Number(req.query?.fileId);
      const compteId = Number(req.query?.compteId);
      const exerciceId = Number(req.query?.exerciceId);
      const pcId = Number(req.query?.pcId);
      const rapproId = Number(req.query?.rapproId);
      if (!fileId || !compteId || !exerciceId || !pcId || !rapproId) {
        return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
      }

      const dossier = await dossiers.findByPk(fileId);
      const exercice = await exercices.findByPk(exerciceId);
      const compte = await userscomptes.findByPk(compteId, { attributes: ['id','nom'], raw: true });
      const pc = await dossierplancomptables.findByPk(pcId);
      const row = await rapprochements.findOne({ where: { id: rapproId, id_dossier: fileId, id_compte: compteId, id_exercice: exerciceId, pc_id: pcId } });
      if (!row) return res.status(404).json({ state: false, msg: 'Ligne de rapprochement introuvable' });

      const workbook = new ExcelJS.Workbook();
      await exportRapprochementExcel(fileId, compteId, exerciceId, pcId, rapproId, workbook, dossier?.dossier, compte?.nom, exercice?.date_debut, exercice?.date_fin);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Rapprochement_${rapproId}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('[RAPPRO][EXCEL] error:', error);
      return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
    }
  }
};
