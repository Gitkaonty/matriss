/**
 * Calcule tous les champs dérivés de la paie à partir des données brutes.
 * @param {object} row - Un objet contenant les données de base (salaireBase, prime, etc.).
 * @param {number} nbrEnfant - Le nombre d'enfants à charge pour le calcul de la déduction.
 * @returns {object} Un objet avec tous les champs calculés.
 */
function parse(v) {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'string') return parseFloat(v.replace(/\s/g, '').replace(',', '.')) || 0;
  return Number(v) || 0;
}

function computePaieFields(row, nbrEnfant = 0) {
  // Extraction et parsing des champs de base
  const salaireBase = parse(row.salaireBase);
  const prime = parse(row.prime);
  const heuresSup = parse(row.heuresSup);
  const indemnites = parse(row.indemnites);
  const remunerationFerieDimanche = parse(row.remunerationFerieDimanche);
  const assurance = parse(row.assurance);
  const carburant = parse(row.carburant);
  const entretienReparation = parse(row.entretienReparation);
  const loyerMensuel = parse(row.loyerMensuel);
  const depenseTelephone = parse(row.depenseTelephone);
  const autresAvantagesNature = parse(row.autresAvantagesNature);
  const avanceQuinzaineAutres = parse(row.avanceQuinzaineAutres);
  const avancesSpeciales = parse(row.avancesSpeciales);
  const allocationFamiliale = parse(row.allocationFamiliale);
  const deductionEnfants = parse(row.deductionEnfants);
  const nombre_enfants_charge = parse(row.nombre_enfants_charge) || nbrEnfant;

  // Calculs intermédiaires (à adapter selon ta logique métier exacte)
  const totalSalaireBrut = salaireBase + prime + heuresSup + indemnites + remunerationFerieDimanche;
  const cnapsEmployeur = totalSalaireBrut * 0.13;
  const ostieEmployeur = totalSalaireBrut * 0.01;
  const baseImposable = totalSalaireBrut - cnapsEmployeur - ostieEmployeur;
  const irsaBrut = Math.max(0, baseImposable * 0.2); // exemple
  const deductionEnfantsCalc = nombre_enfants_charge * 2000; // exemple
  const irsaNet = Math.max(0, irsaBrut - deductionEnfantsCalc);
  const salaireNet = baseImposable - irsaNet;
  const netAPayerAriary = salaireNet + allocationFamiliale - avanceQuinzaineAutres - avancesSpeciales;
  const partPatronalCnaps = cnapsEmployeur;
  const partPatronalOstie = ostieEmployeur;

  return {
    salaireBase,
    prime,
    heuresSup,
    indemnites,
    remunerationFerieDimanche,
    assurance,
    carburant,
    entretienReparation,
    loyerMensuel,
    depenseTelephone,
    autresAvantagesNature,
    avanceQuinzaineAutres,
    avancesSpeciales,
    allocationFamiliale,
    deductionEnfants: deductionEnfantsCalc,
    nombre_enfants_charge,
    totalSalaireBrut: parseFloat(totalSalaireBrut.toFixed(2)),
    cnapsEmployeur: parseFloat(cnapsEmployeur.toFixed(2)),
    ostieEmployeur: parseFloat(ostieEmployeur.toFixed(2)),
    baseImposable: parseFloat(baseImposable.toFixed(2)),
    irsaBrut: parseFloat(irsaBrut.toFixed(2)),
    irsaNet: parseFloat(irsaNet.toFixed(2)),
    salaireNet: parseFloat(salaireNet.toFixed(2)),
    netAPayerAriary: parseFloat(netAPayerAriary.toFixed(2)),
    partPatronalCnaps: parseFloat(partPatronalCnaps.toFixed(2)),
    partPatronalOstie: parseFloat(partPatronalOstie.toFixed(2))
  };
}

module.exports = computePaieFields;
