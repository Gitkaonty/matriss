const db = require('../../Models');
const { Op } = require('sequelize');

const ExcelJS = require('exceljs');
const Dossier = db.dossiers;
const Annex = db.etatsTvaAnnexes;

const generateTvaContent = async (id_compte, id_dossier, id_exercice, mois, annee) => {
    const annexes = await Annex.findAll({
        where: {
            id_compte,
            id_dossier,
            id_exercice,
            mois: Number(mois),
            annee: Number(annee)
        }
    })
 
    const buildTable = (data) => {
        const body = [];
    
        // 🔹 En-têtes
        body.push([
            { text: 'Fournisseur / Client', style: 'tableHeader' },
            { text: 'Local / Étranger', style: 'tableHeader' },
            { text: 'NIF', style: 'tableHeader' },
            { text: 'Raison sociale', style: 'tableHeader' },
            { text: 'STAT', style: 'tableHeader' },
            { text: 'Adresse', style: 'tableHeader' },
            { text: 'Montant HT', style: 'tableHeader' },
            { text: 'Montant TVA', style: 'tableHeader' },
            { text: 'Facture', style: 'tableHeader' },
            { text: 'Date facture', style: 'tableHeader' },
            { text: 'Nature', style: 'tableHeader' },
            { text: 'Libellé', style: 'tableHeader' },
            { text: 'Date paiement', style: 'tableHeader' },
            { text: 'Observation', style: 'tableHeader' },
            { text: 'DAU', style: 'tableHeader' },
            { text: 'Ligne formulaire', style: 'tableHeader' },
            { text: 'Mois', style: 'tableHeader' },
            { text: 'Année', style: 'tableHeader' },
        ]);
    
        let totalHT = 0;
        let totalTVA = 0;
    
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return String(dateString);
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        };
        const formatAmount = (value) => {
            if (value == null) return '0.00';
            return Number(value)
              .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              .replace(/\u202F/g, ' '); // remplace l’espace fine insécable
          };
    
        // 🔹 Lignes des données
        data.forEach(row => {
            totalHT += parseFloat(row.montant_ht) || 0;
            totalTVA += parseFloat(row.montant_tva) || 0;
            body.push([
                { text: row.collecte_deductible || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.local_etranger || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.nif || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.raison_sociale || '', alignment: 'left', margin: [0, 2, 0, 2], noWrap: false },
                { text: row.stat || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.adresse || '', alignment: 'left', margin: [0, 2, 0, 2], noWrap: false },
                { text: formatAmount(row.montant_ht), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(row.montant_tva), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: row.reference_facture || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: formatDate(row.date_facture) || '', alignment: 'center', margin: [0, 2, 0, 2] },
                { text: row.nature || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.libelle_operation || '', alignment: 'left', margin: [0, 2, 0, 2], noWrap: false },
                { text: formatDate(row.date_paiement) || '', alignment: 'center', margin: [0, 2, 0, 2] },
                { text: row.observation || '', alignment: 'left', margin: [0, 2, 0, 2], noWrap: false },
                { text: row.n_dau || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.ligne_formulaire || '', alignment: 'center', margin: [0, 2, 0, 2] },
                { text: row.mois || '', alignment: 'center', margin: [0, 2, 0, 2] },
                { text: row.annee || '', alignment: 'center', margin: [0, 2, 0, 2] }
            ]);
        });
    
        // 🔹 Ligne TOTAL
        body.push([
            { text: 'TOTAL', bold: true, alignment: 'left', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: formatAmount(totalHT), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totalTVA), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' }
        ]);
    
        return [
            {
                table: {
                    headerRows: 1,
                    // 18 colonnes: élargir libellés, équilibrer montants et dates
                    widths: [80, 50, 50, 70, 50, 50, '*', '*', 50, 50, 50, 50, 50, 50, 50, 60, 40, 40],
                    body
                },
                layout: 'lightHorizontalLines'
            }
        ];
    };    
    return {
        buildTable,
        annexes
    }
};

module.exports = { generateTvaContent };
