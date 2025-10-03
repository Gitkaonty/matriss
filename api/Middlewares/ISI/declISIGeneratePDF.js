const db = require("../../Models");
const isis = db.isi;

require('dotenv').config();

const formatAmount = (value) => {
    if (value === null || value === undefined) return '';

    const absValue = Math.abs(Number(value));
    let str = absValue.toFixed(2); // "4699842.16"
    // Ajouter un espace comme séparateur de milliers
    str = str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');

    // Ajouter un espace après le signe moins si valeur négative
    return Number(value) < 0 ? `- ${str}` : str;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    if (isNaN(d)) return '';

    const jour = String(d.getDate()).padStart(2, '0');
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const annee = d.getFullYear();

    return `${jour}/${mois}/${annee}`;
};

const generateISIContent = async (id_compte, id_dossier, id_exercice, mois, annee) => {
    const isi = await isis.findAll({
        where: {
            id_compte,
            id_dossier,
            id_exercice,
            declisimois: mois,
            declisiannee: annee
        }
    })

    const buildTable = (data) => {
        const body = [];

        body.push([
            { text: 'Nom', style: 'tableHeader' },
            { text: 'CIN', style: 'tableHeader' },
            { text: 'Nature', style: 'tableHeader' },
            { text: 'Detail', style: 'tableHeader' },
            { text: 'Date', style: 'tableHeader' },
            { text: 'Province', style: 'tableHeader' },
            { text: 'Région', style: 'tableHeader' },
            { text: 'District', style: 'tableHeader' },
            { text: 'Commune', style: 'tableHeader' },
            { text: 'Fokontany', style: 'tableHeader' },
            { text: 'Transaction', style: 'tableHeader', alignment: 'right' },
            { text: 'ISI', style: 'tableHeader', alignment: 'right' }
        ]);
        let totalTransaction = 0;
        let totalIsi = 0;

        data.forEach(row => {
            totalTransaction += parseFloat(row.montant_transaction) || 0;
            totalIsi += parseFloat(row.montant_isi) || 0;
            body.push([
                {
                    text: row.nom || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.cin ? row.cin.toString() : '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.nature_transaction || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.detail_transacation || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatDate(row.date_transaction) || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.province || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.region || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.district || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.commune || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.fokontany || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.montant_transaction),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.montant_isi),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                }
            ]);
        });

        body.push([
            {
                text: 'TOTAL',
                bold: true,
                alignment: 'left',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: formatAmount(totalTransaction),
                bold: true,
                alignment: 'right',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
            {
                text: formatAmount(totalIsi),
                bold: true,
                alignment: 'right',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            }
        ]);

        return [
            {
                table: {
                    headerRows: 1,
                    widths: ['8.33%', '8.33%', '8.33%', '8.33%', '8.33%', '8.33%', '8.33%', '8.33%', '8.33%', '8.33%', '8.33%', '8.33%'],
                    body
                },
                layout: 'lightHorizontalLines'
            }
        ];
    };

    return {
        buildTable,
        isi
    }
}

module.exports = {
    generateISIContent
}