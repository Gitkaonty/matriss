const db = require('../../Models');

const Irsa = db.irsa;
const Personnel = db.personnels;
const Fonction = db.fonctions;

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
  console.log('[IRSA XML] rows count:', rows.length);
  if (rows.length > 0) {
    // Affiche seulement quelques champs utiles pour vérifier la valeur “5”
    const s = rows[0];
    console.log('[IRSA XML] sample row:', {
      id: s.id,
      matricule: s.matricule,
      mois: s.mois,
      annee: s.annee,
      salaireBase: s.salaireBase,
      heuresSupp: s.heuresSupp,
      fonction: s.fonction, 
      primeGratification: s.primeGratification,
      montantImposable: s.montantImposable,
      impotCorrespondant: s.impotCorrespondant,
      impotDu: s.impotDu
    });
  } else {
    console.log('[IRSA XML] no rows for filter', { id_compte, id_dossier, id_exercice, mois, annee });
  }

  // Charger personnels (matricule -> id_fonction) et fonctions (id -> nom)
  const PersonnelModel = Personnel;
  const FonctionModel = Fonction;
  let persByMat = new Map();
  let fonctionById = new Map();
  try {
    if (PersonnelModel && typeof PersonnelModel.findAll === 'function') {
      const personnels = await PersonnelModel.findAll({
        where: { id_compte, id_dossier },
        attributes: ['matricule', 'id_fonction']
      });
      persByMat = new Map(
        personnels.map(p => [String(p.matricule).trim(), Number(p.id_fonction)])
      );
    } else {
      console.warn('[IRSA XML] Personnel model not found');
    }
    if (FonctionModel && typeof FonctionModel.findAll === 'function') {
      const fonctions = await FonctionModel.findAll({
        where: { id_compte, id_dossier },
        attributes: ['id', 'nom']
      });
      fonctionById = new Map(
        fonctions.map(f => [Number(f.id), String(f.nom)])
      );
    } else {
      console.warn('[IRSA XML] Fonction model not found');
    }
  } catch (e) {
    console.warn('[IRSA XML] mapping personnels/fonctions failed:', e?.message || e);
  }

  // Debug: tailles des maps utilisées pour la résolution
  try {
    console.log('[IRSA XML] persByMat size:', persByMat.size);
    console.log('[IRSA XML] fonctionById size:', fonctionById.size);
  } catch {}

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
    // Debug résolution fonction par ligne
    try {
      const matDbg = String(row.matricule || '').trim();
      const idFonctDbg = persByMat.get(matDbg);
      const libelleFonctDbg = idFonctDbg != null ? fonctionById.get(Number(idFonctDbg)) : undefined;
      console.log('[IRSA XML][RESOLVE]', { mat: matDbg, idFonct: idFonctDbg, libelleFonct: libelleFonctDbg });
    } catch {}
    const champs = [
      { code: 'MATRICULE', valeur: row.matricule || '' },
      { code: 'NUMERO_CNAPS', valeur: row.cnaps || '' },
      { code: 'NOM_PRENOM', valeur: row.nom + ' ' + row.prenom || '' },
      { code: 'NUMERO_CIN', valeur: row.cin || '' },
      { code: 'DATE_ENTREE', valeur: formatDate(row.dateEntree) },
      { code: 'DATE_SORTIE', valeur: formatDate(row.dateSortie) },
      // Résoudre le libellé de fonction via matricule -> id_fonction -> nom
      (() => {
        const mat = String(row.matricule || '').trim();
        const idFonct = persByMat.get(mat);
        const libelleFonct = idFonct != null ? fonctionById.get(Number(idFonct)) : undefined;
        return { code: 'FONCTION', valeur: libelleFonct || '' };
      })(),
      { code: 'SALAIRE_BASE', valeur: row.salaireBase || 0 },
      { code: 'INDEMNITE_IMPOSABLE', valeur: row.indemniteImposable || 0 },
      { code: 'INDEMNITE_NONIMPOSABLE', valeur: row.indemniteNonImposable || 0 },
      { code: 'AVANTAGE_IMPOSABLE', valeur: row.avantageImposable || 0 },
      { code: 'AVANTAGE_EXONERE', valeur: row.avantageExonere || 0 },
      { code: 'HEURES_SUP', valeur: row.heuresSupp || 0 },
      { code: 'MONTANT_PRIMES', valeur: row.primeGratification || 0 },
      { code: 'MONTANT_AUTRES', valeur: row.autres || 0 },
      { code: 'SALAIRE_BRUT', valeur: row.salaireBrut || 0 },
      { code: 'DEDUCTION_CNAPS', valeur: row.cnapsRetenu || 0 },
      { code: 'DEDUCTION_OSTIES', valeur: row.ostie || 0 },
      { code: 'DEDUCTION_SALAIRE_NET', valeur: row.salaireNet || 0 },
      { code: 'DEDUCTION_AUTRE', valeur: row.autreDeduction || 0 },
      { code: 'MONTANT_IMPOSABLE', valeur: row.montantImposable || 0 },
      { code: 'MONTANT_IMPOT', valeur: row.impotCorrespondant || 0 },
      { code: 'REDUCTION', valeur: row.reductionChargeFamille || 0 },
      { code: 'IMPOT_NET', valeur: row.impotDu || 0 },
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
