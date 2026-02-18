const db = require("../../Models");
const PdfPrinter = require('pdfmake');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');

const dossiers = db.dossiers;
const exercices = db.exercices;
const userscomptes = db.userscomptes;
const revisionControle = db.revisionControle;
const tableControleAnomalies = db.tableControleAnomalies;
const journals = db.journals;

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatMontant = (value) => {
  if (value === null || value === undefined) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Récupérer les données pour l'export - chaque anomalie avec ses lignes de journal spécifiques
const getRevisionDetailsData = async (id_compte, id_dossier, id_exercice, id_controle, date_debut, date_fin) => {
  // Récupérer le contrôle
  const controle = await revisionControle.findOne({
    where: {
      id_compte,
      id_dossier,
      id_exercice,
      id_controle
    }
  });

  if (!controle) {
    throw new Error('Contrôle non trouvé');
  }

  // Construire le filtre de date
  let dateFilter = {};
  if (date_debut && date_fin) {
    dateFilter = {
      dateecriture: {
        [Op.gte]: date_debut,
        [Op.lte]: date_fin
      }
    };
  }

  // Récupérer les anomalies
  const anomalies = await tableControleAnomalies.findAll({
    where: {
      id_compte,
      id_dossier,
      id_exercice,
      id_controle
    },
    order: [['id', 'ASC']]
  });

  // Pour chaque anomalie, récupérer ses lignes de journal spécifiques (sans regrouper avec d'autres comptes)
  const anomaliesWithLines = await Promise.all(
    anomalies.map(async (anomalie) => {
      const anomalieData = anomalie.toJSON();
      
      // Récupérer les lignes de journal pour ce compte spécifique uniquement
      if (anomalie.id_jnl) {
        const whereClause = {
          comptegen: anomalie.id_jnl, // Compte spécifique de cette anomalie uniquement
          id_compte,
          id_dossier,
          id_exercice,
          ...dateFilter
        };

        const lines = await journals.findAll({
          where: whereClause,
          order: [['dateecriture', 'ASC'], ['id', 'ASC']]
        });

        anomalieData.journalLines = lines;
      } else {
        anomalieData.journalLines = [];
      }

      return anomalieData;
    })
  );

  return {
    controle,
    anomalies: anomaliesWithLines
  };
};

// Export PDF
exports.exportPdf = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_controle } = req.params;
    const { date_debut, date_fin } = req.query;

    if (!id_compte || !id_dossier || !id_exercice || !id_controle) {
      return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
    }

    const dossier = await dossiers.findByPk(id_dossier);
    const exercice = await exercices.findByPk(id_exercice);
    const compte = await userscomptes.findByPk(id_compte, { attributes: ['id', 'nom'], raw: true });

    const { controle, anomalies } = await getRevisionDetailsData(
      id_compte, id_dossier, id_exercice, id_controle, date_debut, date_fin
    );

    if (!controle) {
      return res.status(404).json({ state: false, msg: 'Contrôle non trouvé' });
    }

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const printer = new PdfPrinter(fonts);

    // Construire le contenu
    const content = [
      {
        text: 'DÉTAILS DE RÉVISION',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: `Dossier : ${dossier?.dossier || ''}`,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      // {
      //   text: `Contrôle : ${controle.Libelle || ''}`,
      //   style: 'subheader',
      //   alignment: 'center',
      //   margin: [0, 0, 0, 5]
      // },
      {
        text: `Type : ${controle.Type || ''}`,
        style: 'subheader2',
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      {
        text: `Dates exercice : ${formatDate(exercice?.date_debut)} au ${formatDate(exercice?.date_fin)}`,
        style: 'subheader2',
        alignment: 'left',
        margin: [0, 0, 0, 5]
      },
      {
        text: `Période : ${date_debut && date_fin ? `${formatDate(date_debut)} au ${formatDate(date_fin)}` : 'Tout l\'exercice'}`,
        style: 'subheader2',
        alignment: 'left',
        margin: [0, 0, 0, 15]
      }
    ];

    // Pour chaque anomalie, créer une section avec ses écritures spécifiques
    if (anomalies.length > 0) {
      anomalies.forEach((anomalie, index) => {
        // En-tête de l'anomalie
        content.push({
          text: `Anomalie #${index + 1}`,
          style: 'anomalyHeader',
          margin: [0, 15, 0, 5]
        });

        // Tableau des infos de l'anomalie
        const infoTable = {
          table: {
            widths: ['20%', '80%'],
            body: [
              [{ text: 'Code', style: 'labelCell' }, anomalie.codeCtrl || ''],
              [{ text: 'Compte', style: 'labelCell' }, anomalie.id_jnl || ''],
              [{ text: 'Message', style: 'labelCell' }, anomalie.message || '']
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingTop: () => 3,
            paddingBottom: () => 3
          },
          margin: [0, 0, 0, 10]
        };
        content.push(infoTable);

        // Tableau des écritures spécifiques à cette anomalie
        if (anomalie.journalLines && anomalie.journalLines.length > 0) {
          content.push({
            text: `Écritures du compte ${anomalie.id_jnl} :`,
            style: 'sectionTitle',
            margin: [0, 5, 0, 5]
          });

          const ecrituresTable = {
            table: {
              headerRows: 1,
              widths: ['12%', '10%', '10%', '*', '12%', '12%'],
              body: [
                [
                  { text: 'Date', style: 'tableHeader' },
                  { text: 'Pièce', style: 'tableHeader' },
                  { text: 'Journal', style: 'tableHeader' },
                  { text: 'Libellé', style: 'tableHeader' },
                  { text: 'Débit', style: 'tableHeader' },
                  { text: 'Crédit', style: 'tableHeader' }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              paddingTop: () => 3,
              paddingBottom: () => 3,
              fillColor: (rowIndex) => rowIndex === 0 ? '#1A5276' : (rowIndex % 2 === 0 ? null : '#f2f2f2')
            },
            margin: [0, 0, 0, 15]
          };

          anomalie.journalLines.forEach((line) => {
            ecrituresTable.table.body.push([
              formatDate(line.dateecriture),
              line.piece || '',
              line.codejournal || '',
              line.libelle || '',
              { text: formatMontant(line.debit), alignment: 'right' },
              { text: formatMontant(line.credit), alignment: 'right' }
            ]);
          });

          content.push(ecrituresTable);
        } else {
          content.push({
            text: 'Aucune écriture pour cette anomalie',
            style: 'noData',
            margin: [0, 0, 0, 15]
          });
        }
      });
    } else {
      content.push({
        text: 'Aucune anomalie détectée',
        style: 'noAnomaly',
        margin: [0, 10, 0, 15]
      });
    }

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [20, 40, 20, 40],
      defaultStyle: { font: 'Helvetica', fontSize: 8 },
      content,
      styles: {
        header: { fontSize: 18, bold: true, font: 'Helvetica' },
        subheader: { fontSize: 14, bold: true, font: 'Helvetica' },
        subheader2: { fontSize: 11, bold: true, font: 'Helvetica' },
        anomalyHeader: { fontSize: 13, bold: true, font: 'Helvetica', color: '#1A5276' },
        sectionTitle: { fontSize: 10, bold: true, font: 'Helvetica', fillColor: '#CDE9F6' },
        labelCell: { bold: true, fillColor: '#E8F4FD' },
        tableHeader: {
          bold: true,
          fontSize: 8,
          color: 'white',
          fillColor: '#1A5276',
          alignment: 'center',
          font: 'Helvetica'
        },
        noAnomaly: { fontSize: 10, color: 'green', italics: true },
        noData: { fontSize: 9, color: '#666', italics: true }
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Revision_${id_controle}_${id_dossier}_${id_exercice}.pdf`);
    pdfDoc.pipe(res);
    pdfDoc.end();

  } catch (error) {
    console.error('[REVISION DETAILS][PDF] error:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }
};

// Export Excel
exports.exportExcel = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_controle } = req.params;
    const { date_debut, date_fin } = req.query;

    if (!id_compte || !id_dossier || !id_exercice || !id_controle) {
      return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
    }

    const dossier = await dossiers.findByPk(id_dossier);
    const exercice = await exercices.findByPk(id_exercice);
    const compte = await userscomptes.findByPk(id_compte, { attributes: ['id', 'nom'], raw: true });

    const { controle, anomalies } = await getRevisionDetailsData(
      id_compte, id_dossier, id_exercice, id_controle, date_debut, date_fin
    );

    if (!controle) {
      return res.status(404).json({ state: false, msg: 'Contrôle non trouvé' });
    }

    const workbook = new ExcelJS.Workbook();
    
    // Feuille 1: Informations générales
    const infoSheet = workbook.addWorksheet('Informations');
    
    infoSheet.addRow(['DÉTAILS DE RÉVISION']).font = { size: 16, bold: true };
    infoSheet.addRow([]);
    infoSheet.addRow(['Dossier', dossier?.dossier || '']);
    infoSheet.addRow(['Exercice', `${formatDate(exercice?.date_debut)} au ${formatDate(exercice?.date_fin)}`]);
    infoSheet.addRow(['Période filtrée', date_debut && date_fin ? `${formatDate(date_debut)} au ${formatDate(date_fin)}` : 'Tout l\'exercice']);
    infoSheet.addRow([]);
    infoSheet.addRow(['Contrôle', controle.Libelle || '']).font = { bold: true };
    infoSheet.addRow(['Type', controle.Type || '']);
    infoSheet.addRow(['Commentaire', controle.Commentaire || '']);
    infoSheet.addRow([]);
    infoSheet.addRow(['Nombre d\'anomalies', anomalies.length.toString()]).font = { bold: true };

    // Ajuster les largeurs
    infoSheet.getColumn('A').width = 20;
    infoSheet.getColumn('B').width = 50;

    // Feuille 2: Anomalies avec écritures détaillées (comme le frontend)
    const detailsSheet = workbook.addWorksheet('Détails des anomalies');
    
    let currentRow = 1;

    // Pour chaque anomalie, créer une section avec ses écritures spécifiques
    anomalies.forEach((anomalie, index) => {
      // Titre de l'anomalie
      const titleRow = detailsSheet.addRow([`Anomalie #${index + 1} - Compte: ${anomalie.id_jnl || 'N/A'}`]);
      titleRow.font = { size: 12, bold: true, color: { argb: '1A5276' } };
      currentRow++;

      // Informations de l'anomalie
      const headerRow = detailsSheet.addRow(['Code', 'Compte', 'Message']);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1A5276' } };
      currentRow++;

      const dataRow = detailsSheet.addRow([
        anomalie.codeCtrl || '',
        anomalie.id_jnl || '',
        anomalie.message || ''
      ]);
      currentRow++;

      // Écritures spécifiques à cette anomalie
      if (anomalie.journalLines && anomalie.journalLines.length > 0) {
        // Sous-titre
        const subTitleRow = detailsSheet.addRow([`Écritures du compte ${anomalie.id_jnl} :`]);
        subTitleRow.font = { bold: true };
        currentRow++;

        // En-têtes des écritures
        const ecrituresHeader = detailsSheet.addRow(['Date', 'Pièce', 'Journal', 'Libellé', 'Débit', 'Crédit']);
        ecrituresHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
        ecrituresHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '5DADE2' } };
        currentRow++;

        // Lignes d'écritures
        anomalie.journalLines.forEach((line) => {
          const row = detailsSheet.addRow([
            formatDate(line.dateecriture),
            line.piece || '',
            line.codejournal || '',
            line.libelle || '',
            parseFloat(line.debit) || 0,
            parseFloat(line.credit) || 0
          ]);
          row.getCell(5).numFmt = '#,##0.00';
          row.getCell(6).numFmt = '#,##0.00';
          currentRow++;
        });
      } else {
        const noDataRow = detailsSheet.addRow(['Aucune écriture pour cette anomalie']);
        noDataRow.font = { italics: true, color: { argb: '666666' } };
        currentRow++;
      }

      // Ligne vide entre les anomalies
      detailsSheet.addRow([]);
      currentRow++;
    });

    // Ajuster les largeurs
    detailsSheet.getColumn('A').width = 12;
    detailsSheet.getColumn('B').width = 12;
    detailsSheet.getColumn('C').width = 12;
    detailsSheet.getColumn('D').width = 40;
    detailsSheet.getColumn('E').width = 15;
    detailsSheet.getColumn('F').width = 15;

    workbook.views = [{ activeTab: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Revision_${id_controle}_${id_dossier}_${id_exercice}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('[REVISION DETAILS][EXCEL] error:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }
};
