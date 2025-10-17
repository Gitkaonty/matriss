const db = require('../../Models');
const { Op } = require('sequelize');

const Irsa = db.irsa;

const generateIrsaContent = async (id_compte, id_dossier, id_exercice, mois, annee) => {
    const irsaData = await Irsa.findAll({
        where: {
            id_compte,
            id_dossier,
            id_exercice,
            mois: Number(mois),
            annee: Number(annee)
        }
    });

    // Préparer le mapping pour afficher le libellé de fonction (et non l'ID)
const PersonnelModel = db.personnels;
const FonctionModel = db.fonctions;
let persByMat = new Map(); // matricule -> id_fonction
let fonctionById = new Map(); // id_fonction -> nom

try {
    if (PersonnelModel && typeof PersonnelModel.findAll === 'function') {
        const personnels = await PersonnelModel.findAll({
            where: { id_compte, id_dossier },
            attributes: ['matricule', 'id_fonction']
        });

        persByMat = new Map(
            personnels.map(p => [String(p.matricule).trim(), Number(p.id_fonction)])
        );
    }

    if (FonctionModel && typeof FonctionModel.findAll === 'function') {
        const fonctions = await FonctionModel.findAll({
            where: { id_compte, id_dossier },
            attributes: ['id', 'nom']
        });

        fonctionById = new Map(
            fonctions.map(f => [Number(f.id), String(f.nom)])
        );
    }
} catch (e) {
    console.warn('[IRSA PDF] mapping personnels/fonctions failed:', e?.message || e);
}


    const buildTable = (data) => {
        const body = [];
    
        // En-têtes
        body.push([
            { text: 'Nom', style: 'tableHeader' },
            { text: 'Prénom', style: 'tableHeader' },
            { text: 'CIN', style: 'tableHeader' },
            { text: 'CNAPS', style: 'tableHeader' },
            { text: 'Fonction', style: 'tableHeader' },
            { text: 'Date Entrée', style: 'tableHeader' },
            { text: 'Date Sortie', style: 'tableHeader' },
            { text: 'Salaire Base', style: 'tableHeader' },
            { text: 'Heures Supp', style: 'tableHeader' },
            { text: 'Prime/Gratif.', style: 'tableHeader' },
            { text: 'Autres', style: 'tableHeader' },
            { text: 'Salaire Brut', style: 'tableHeader' },
            { text: 'CNAPS Retenu', style: 'tableHeader' },
            { text: 'Org. Santé', style: 'tableHeader' },
            { text: 'Salaire Net', style: 'tableHeader' },
            { text: 'Autre Déduction', style: 'tableHeader' },
            { text: 'Montant Imposable', style: 'tableHeader' },
            { text: 'Impôt Corr.', style: 'tableHeader' },
            { text: 'Réd. Charge Fam.', style: 'tableHeader' },
            { text: 'Impôt Dû', style: 'tableHeader' },
            { text: 'Mois', style: 'tableHeader' },
            { text: 'Année', style: 'tableHeader' }
        ]);
    
        // Totaux
        const totals = Array(13).fill(0); // colonnes de 8 à 20 = 13 totaux
    
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
        // Lignes des données
        data.forEach(row => {
            // Résoudre le libellé de la fonction via matricule -> id_fonction -> nom
            const mat = String(row.matricule || '').trim();
            const idFonct = persByMat.get(mat);
            const fonctionLibelle = idFonct != null ? (fonctionById.get(Number(idFonct)) || '') : '';
            const values = [
                parseFloat(row.salaireBase) || 0,
                parseFloat(row.heuresSupp) || 0,
                parseFloat(row.primeGratification) || 0,
                parseFloat(row.autres) || 0,
                parseFloat(row.salaireBrut) || 0,
                parseFloat(row.cnapsRetenu) || 0,
                parseFloat(row.ostie) || 0,
                parseFloat(row.salaireNet) || 0,
                parseFloat(row.autreDeduction) || 0,
                parseFloat(row.montantImposable) || 0,
                parseFloat(row.impotCorrespondant) || 0,
                parseFloat(row.reductionChargeFamille) || 0,
                parseFloat(row.impotDu) || 0
            ];

            // Cumuler les totaux
            values.forEach((val, idx) => {
                totals[idx] += val;
            });

            body.push([
                { text: row.nom || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.prenom || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.cin || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: row.cnaps || '', alignment: 'left', margin: [0, 2, 0, 2] },
                { text: fonctionLibelle || '', alignment: 'left', margin: [0, 2, 0, 2], noWrap: false },
                { text: formatDate(row.dateEntree) || '', alignment: 'center', margin: [0, 2, 0, 2] },
                { text: formatDate(row.dateSortie) || '', alignment: 'center', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[0]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[1]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[2]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[3]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[4]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[5]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[6]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[7]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[8]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[9]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[10]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[11]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: formatAmount(values[12]), alignment: 'right', margin: [0, 2, 0, 2] },
                { text: row.mois || Number(mois), alignment: 'center', margin: [0, 2, 0, 2] },
                { text: row.annee || Number(annee), alignment: 'center', margin: [0, 2, 0, 2] }
            ]);
        });
    
        // Ligne TOTAL
        body.push([
            { text: 'TOTAL', bold: true, alignment: 'left', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: formatAmount(totals[0]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[1]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[2]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[3]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[4]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[5]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[6]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[7]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[8]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[9]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[10]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[11]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: formatAmount(totals[12]), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' },
            { text: '', fillColor: '#89A8B2' }
        ]);
    
        return [
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', 35, 35],
                    body
                },
                layout: 'lightHorizontalLines'
            }
        ];
    };    

    return {
        buildTable,
        irsaData
    };
};

module.exports = { generateIrsaContent };