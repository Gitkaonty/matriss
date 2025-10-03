const db = require('../../Models');

const Irsa = db.irsa;

const generateIrsaXml = async (id_compte, id_dossier, id_exercice, mois, annee, nif) => {
  // Récupérer les données IRSA
  const rows = await Irsa.findAll({
    where: {
      id_compte,
      id_dossier,
      id_exercice,
      mois: Number(mois),
      annee: Number(annee)
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number') return value.toString();
    return String(value);
  };

  const createChamp = (code, valeur) => {
    return `<champ>\n<code>${code}</code>\n<valeur>${formatValue(valeur)}</valeur>\n</champ>`;
  };

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<EDI>\n<informations>\n<type>IRSA</type>\n<ncc>${nif || ''}</ncc>\n<codeTaxe>IRSA</codeTaxe>\n<mois>${mois}</mois>\n<exercice>${annee}</exercice>\n</informations>\n<tableaux>\n<tableau>\n<donnees>`;

  rows.forEach((row) => {
    xml += `\n<ligne>`;
    const champs = [
      { code: 'NOM', valeur: row.nom || '' },
      { code: 'PRENOM', valeur: row.prenom || '' },
      { code: 'CIN', valeur: row.cin || '' },
      { code: 'CNAPS', valeur: row.cnaps || '' },
      { code: 'FONCTION', valeur: row.fonction || '' },
      { code: 'DATE_ENTREE', valeur: formatDate(row.dateEntree) },
      { code: 'DATE_SORTIE', valeur: formatDate(row.dateSortie) },
      { code: 'INDEMNITE_IMPOSABLE', valeur: row.indemniteImposable || 0 },
      { code: 'INDEMNITE_NON_IMPOSABLE', valeur: row.indemniteNonImposable || 0 },
      { code: 'AVANTAGE_IMPOSABLE', valeur: row.avantageImposable || 0 },
      { code: 'AVANTAGE_EXONERE', valeur: row.avantageExonere || 0 },
      { code: 'SALAIRE_BASE', valeur: row.salaireBase || 0 },
      { code: 'HEURES_SUPP', valeur: row.heuresSupp || 0 },
      { code: 'PRIME_GRATIFICATION', valeur: row.primeGratification || 0 },
      { code: 'AUTRES', valeur: row.autres || 0 },
      { code: 'SALAIRE_BRUT', valeur: row.salaireBrut || 0 },
      { code: 'CNAPS_RETENU', valeur: row.cnapsRetenu || 0 },
      { code: 'ORG_SANTE', valeur: row.ostie || 0 },
      { code: 'SALAIRE_NET', valeur: row.salaireNet || 0 },
      { code: 'AUTRE_DEDUCTION', valeur: row.autreDeduction || 0 },
      { code: 'MONTANT_IMPOSABLE', valeur: row.montantImposable || 0 },
      { code: 'IMPOT_CORRESPONDANT', valeur: row.impotCorrespondant || 0 },
      { code: 'REDUCTION_CHARGE_FAMILLE', valeur: row.reductionChargeFamille || 0 },
      { code: 'IMPOT_DU', valeur: row.impotDu || 0 },
      { code: 'MOIS', valeur: row.mois || Number(mois) },
      { code: 'ANNEE', valeur: row.annee || Number(annee) },
    ];
    champs.forEach((c) => {
      xml += `\n${createChamp(c.code, c.valeur)}`;
    });
    xml += `\n</ligne>`;
  });

  xml += `\n</donnees>\n</tableau>\n</tableaux>\n</EDI>`;

  return xml;
};

module.exports = { generateIrsaXml };
