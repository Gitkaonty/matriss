import React, { useRef } from 'react';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import Papa from 'papaparse';
import { toast } from 'react-hot-toast';
import axios from '../../../../config/axios'
import { FaFileImport } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import { init } from '../../../../init';


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
const initial = init[0];
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

  // Calculs intermédiaires
  const salaireBrutNumeraire = salaireBase + prime + heuresSup + indemnites + remunerationFerieDimanche;
  const deductionEnfantsCalc = nombre_enfants_charge * 2000;
  const remunerationFixe25 = salaireBrutNumeraire * 0.25;
  const salaireBrut20 = salaireBrutNumeraire * 0.2;

  const totalDepensesVehicule = assurance + carburant + entretienReparation;
  const totalAvantageNatureVehicule = totalDepensesVehicule * 0.15;
  const avantageNatureTelephone = depenseTelephone * 0.15;
  const avantageNatureLoyer = (loyerMensuel * 0.5 > remunerationFixe25)
    ? remunerationFixe25
    : loyerMensuel * 0.5;

  const totalAvantageNature = totalAvantageNatureVehicule + avantageNatureLoyer + avantageNatureTelephone + autresAvantagesNature;

  let maxAvantage;
  if (totalAvantageNature > salaireBrut20) {
    maxAvantage = salaireBrutNumeraire + salaireBrut20;
  } else {
    maxAvantage = salaireBrutNumeraire + totalAvantageNature;
  }

  const totalSalaireBrut = maxAvantage;

  // Cotisations
  const cnapsEmployeur = totalSalaireBrut * 0.01;
  const ostieEmployeur = totalSalaireBrut * 0.01;

  const montantPlafond = 2101440;
  const partPatronalCnaps = ((salaireBrutNumeraire + totalAvantageNature) < montantPlafond)
    ? (salaireBrutNumeraire + totalAvantageNature) * 0.13
    : montantPlafond * 0.13;

  const partPatronalOstie = ((salaireBrutNumeraire + totalAvantageNature) < montantPlafond)
    ? totalSalaireBrut * 0.05
    : montantPlafond * 0.05;

  const baseImposable = Math.floor((totalSalaireBrut - cnapsEmployeur - ostieEmployeur) / 100) * 100;

  // IRSA
  let calcul = 0;
  if (baseImposable <= 400000) {
    calcul = (baseImposable - 350000) * 0.05;
  } else if (baseImposable <= 500000) {
    calcul = 2500 + (baseImposable - 400000) * 0.10;
  } else if (baseImposable <= 600000) {
    calcul = 12500 + (baseImposable - 500000) * 0.15;
  } else {
    calcul = 27500 + (baseImposable - 600000) * 0.20;
  }

  const irsaBrut = calcul <= 3000 ? 3000 : calcul;
  const irsaNet = Math.max(irsaBrut - deductionEnfantsCalc, 3000);

  // Résultats finaux
  const salaireNet = totalSalaireBrut - irsaNet;
  const netAPayerAriary = salaireNet - avanceQuinzaineAutres - avancesSpeciales;

  return {
    salaireBase,
    prime,
    heuresSup,
    indemnites,
    remunerationFerieDimanche,
    salaireBrutNumeraire,
    remunerationFixe25,
    salaireBrut20,
    assurance,
    carburant,
    entretienReparation,
    loyerMensuel,
    depenseTelephone,
    avanceQuinzaineAutres,
    avancesSpeciales,
    allocationFamiliale,
    deductionEnfants: deductionEnfantsCalc,
    nombre_enfants_charge,
    totalAvantageNature,
    totalDepensesVehicule,
    totalAvantageNatureVehicule,
    avantageNatureLoyer,
    avantageNatureTelephone,
    autresAvantagesNature,
    totalSalaireBrut,
    cnapsEmployeur,
    ostieEmployeur,
    baseImposable,
    irsaBrut,
    irsaNet,
    salaireNet,
    netAPayerAriary,
    partPatronalCnaps,
    partPatronalOstie
  };
}
/**
 * Bouton d'import CSV pour la table Paie.
 * @param {Object[]} personnels - Liste des personnels (avec id)
 * @param {Object[]} paieColumns - Colonnes paie (pour validation)
 * @param {Function} onImport - Callback pour injecter les données importées (array)
 */

export default function ImportPaieCsvButton({ personnels, paieColumns, onImport, onAnomalies, mois, annee }) {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    // Empêcher l'import si la liste du personnel n'est pas encore chargée
    if (!Array.isArray(personnels) || personnels.length === 0) {
      toast.error('Veuillez attendre le chargement du personnel avant d\'importer.');
      e.target.value = '';
      return;
    }
    // console.log('[DEBUG][ImportPaieCsvButton] Début import CSV');
    const file = e.target.files[0];
    if (!file) return;
    // console.log('[DEBUG][ImportPaieCsvButton] Fichier sélectionné:', file);
    Papa.parse(file, {
      delimiter: ';',
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // console.log('[DEBUG][ImportPaieCsvButton] Résultat parsing CSV:', results);
        // console.log("[DEBUG][ImportPaieCsvButton] Résultat du parse CSV:", results.data);
        
        if (!results.data || !Array.isArray(results.data)) {
          toast.error('Le fichier CSV semble vide ou mal formaté.');
          return;
        }
        const data = results.data;
        const anomalies = []; // Collecter les erreurs
        const dataWithPersonnelAndCalculs = []; // Données valides après traitement
        
        console.log('Données CSV parsées:', results.data);
        // 3. Mapping : injecter les objets personnels ET les champs calculés pour chaque ligne
        const normalizeMatricule = (m) => String(m ?? '').replace(/\s/g, '').toLowerCase();
        const personnelsByMat = Array.isArray(personnels)
          ? new Map(personnels.map(p => [normalizeMatricule(p.matricule), p]))
          : new Map();
        // Fonction de nettoyage robuste pour tous les champs numériques
        const sanitizeNumber = v => {
          if (v === '' || v === undefined || v === null) return 0;
          const n = Number((v ?? '').toString().replace(/\s/g, ''));
          return isNaN(n) ? 0 : n;
        };

        const numericFields = [
          'salaireBase','prime','heuresSup','indemnites','remunerationFerieDimanche','salaireBrutNumeraire','assurance','carburant','entretienReparation','totalDepensesVehicule','totalAvantageNatureVehicule','loyerMensuel','remunerationFixe25','avantageNatureLoyer','depenseTelephone','avantageNatureTelephone','autresAvantagesNature','totalAvantageNature','salaireBrut20','cnapsEmployeur','baseImposable','ostieEmployeur','totalSalaireBrut','irsaBrut','deductionEnfants','irsaNet','salaireNet','avanceQuinzaineAutres','avancesSpeciales','allocationFamiliale','netAPayerAriary','partPatronalCnaps','partPatronalOstie','mois','annee'
        ];

        // Traitement de chaque ligne avec validation
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          const ligneNum = idx + 1;
          
          // Vérifier la présence du matricule (nouvelle référence)
          const matricule = row.matricule || row.Matricule || row.matricule_employe;
          if (!matricule) {
            anomalies.push({
              ligne: ligneNum,
              data: row,
              errors: ['champ_manquant'],
              description: 'matricule manquant'
            });
            console.warn(`Ligne ${ligneNum}: matricule manquant, ligne ignorée`);
            continue;
          }

          // Trouver le personnel correspondant par matricule (pour enrichissement optionnel)
          const personnel = personnelsByMat.get(normalizeMatricule(matricule));
          // Si aucun personnel ne correspond, lever une anomalie et ignorer la ligne
          if (!personnel) {
            const anomalie = {
              ligne: ligneNum,
              data: row,
              errors: ['personnel_introuvable'],
              description: `Matricule ${matricule} introuvable dans la liste du personnel`
            };
            anomalies.push(anomalie);
            console.warn(`Ligne ${ligneNum}: ${anomalie.description}, ligne ignorée`);
            continue;
          }
          
          // Vérifier les valeurs numériques (invalides et négatives)
          const champsNumeriques = ['salaireBase', 'prime', 'heuresSup', 'indemnites', 'remunerationFerieDimanche', 'assurance', 'carburant', 'entretienReparation', 'loyerMensuel', 'depenseTelephone', 'autresAvantagesNature', 'avanceQuinzaineAutres', 'avancesSpeciales', 'allocationFamiliale', 'nombre_enfants_charge'];
          const champsAvecErreurs = [];
          const champsNegatifs = [];
          
          // Mapping des noms de champs pour des descriptions claires
          const nomsChamps = {
            'salaireBase': 'Salaire de base',
            'prime': 'Prime',
            'heuresSup': 'Heures supplémentaires',
            'indemnites': 'Indemnités',
            'remunerationFerieDimanche': 'Rémunération férié/dimanche',
            'assurance': 'Assurance',
            'carburant': 'Carburant',
            'entretienReparation': 'Entretien/Réparation',
            'loyerMensuel': 'Loyer mensuel',
            'depenseTelephone': 'Dépense téléphone',
            'autresAvantagesNature': 'Autres avantages en nature',
            'avanceQuinzaineAutres': 'Avance quinzaine/autres',
            'avancesSpeciales': 'Avances spéciales',
            'allocationFamiliale': 'Allocation familiale',
            'nombre_enfants_charge': 'Nombre d\'enfants à charge'
          };
          
          for (const champ of champsNumeriques) {
            const valeur = row[champ];
            if (valeur && valeur !== '') {
              const valeurNum = parseFloat(valeur);
              if (isNaN(valeurNum)) {
                champsAvecErreurs.push({
                  champ: champ,
                  nom: nomsChamps[champ] || champ,
                  valeur: valeur
                });
              } else if (valeurNum < 0) {
                champsNegatifs.push({
                  champ: champ,
                  nom: nomsChamps[champ] || champ,
                  valeur: valeurNum
                });
              }
            }
          }
          
          if (champsAvecErreurs.length > 0) {
            const descriptions = champsAvecErreurs.map(c => 
              `${c.nom}: "${c.valeur}" (valeur non numérique)`
            );
            anomalies.push({
              ligne: ligneNum,
              data: row,
              errors: ['valeur_invalide'],
              description: `Matricule ${matricule} - Champs invalides: ${descriptions.join(', ')}`
            });
            console.warn(`Ligne ${ligneNum}: Valeurs numériques invalides, ligne ignorée`);
            continue;
          }
          
          if (champsNegatifs.length > 0) {
            const descriptions = champsNegatifs.map(c => 
              `${c.nom}: ${c.valeur} Ar (valeur négative non autorisée)`
            );
            const anomalie = {
              ligne: ligneNum,
              data: row,
              errors: ['valeur_negative'],
              description: `Matricule ${matricule} - Champs négatifs: ${descriptions.join(', ')}`
            };
            anomalies.push(anomalie);
            console.log(`[DEBUG] Anomalie détectée:`, anomalie);
            console.warn(`Ligne ${ligneNum}: Valeurs négatives détectées, ligne ignorée`);
            continue;
          }
          
          // Récupérer le nombre d'enfants depuis l'API personnels (comme dans PopupAddPaie)
          let nbrEnfant = 0;
          
          // 1. D'abord vérifier si c'est dans le CSV
          if (row.nombre_enfants_charge !== undefined && row.nombre_enfants_charge !== '') {
            nbrEnfant = Number(row.nombre_enfants_charge) || 0;
            console.log(`[DEBUG] Nombre enfants depuis CSV: ${nbrEnfant}`);
          } else {
            // 2. Sinon, récupérer depuis l'API personnels
            try {
              if (personnel && personnel.id) {
                const resPersonnel = await axios.get(`/administration/personnel/${personnel.id}`);
                if (resPersonnel.data?.state && typeof resPersonnel.data.data?.nombre_enfants_charge === 'number') {
                  nbrEnfant = resPersonnel.data.data.nombre_enfants_charge;
                  console.log(`[DEBUG] Nombre enfants depuis API: ${nbrEnfant}`);
                } else {
                  console.warn(`[DEBUG] Nombre enfants non trouvé pour personnel ${personnel?.id}`);
                  nbrEnfant = 0;
                }
              } else {
                console.warn(`[DEBUG] Personnel introuvable par matricule (${matricule}) pour récupération enfants`);
                nbrEnfant = 0;
              }
            } catch (error) {
              console.error(`[DEBUG] Erreur récupération enfants pour matricule ${matricule}:`, error);
              nbrEnfant = 0;
            }
          }

          // Affichage debug : ligne brute
          console.log(`[IMPORT PAIE][${idx}] LIGNE CSV BRUTE :`, row);

          // Mapping correctif + nettoyage numérique
          const rowMapped = { ...row, matricule };
          delete rowMapped.personnel_id; // nettoyage si présent par erreur
          numericFields.forEach(field => {
            rowMapped[field] = sanitizeNumber(row[field]);
          });

          // Log des champs sources utilisés pour le calcul
          console.log(`[IMPORT PAIE][${idx}] Champs sources pour calcul:`, {
            salaireBase: rowMapped.salaireBase,
            prime: rowMapped.prime,
            heuresSup: rowMapped.heuresSup,
            indemnites: rowMapped.indemnites,
            remunerationFerieDimanche: rowMapped.remunerationFerieDimanche,
            assurance: rowMapped.assurance,
            carburant: rowMapped.carburant,
            entretienReparation: rowMapped.entretienReparation,
            loyerMensuel: rowMapped.loyerMensuel,
            depenseTelephone: rowMapped.depenseTelephone,
            autresAvantagesNature: rowMapped.autresAvantagesNature,
            avanceQuinzaineAutres: rowMapped.avanceQuinzaineAutres,
            avancesSpeciales: rowMapped.avancesSpeciales,
            allocationFamiliale: rowMapped.allocationFamiliale,
            deductionEnfants: rowMapped.deductionEnfants,
            nombre_enfants_charge: rowMapped.nombre_enfants_charge,
          });

          // Isoler les champs sources pour le calcul pour éviter les interférences
          const inputForCalculs = {
            salaireBase: rowMapped.salaireBase,
            prime: rowMapped.prime,
            heuresSup: rowMapped.heuresSup,
            indemnites: rowMapped.indemnites,
            remunerationFerieDimanche: rowMapped.remunerationFerieDimanche,
            assurance: rowMapped.assurance,
            carburant: rowMapped.carburant,
            entretienReparation: rowMapped.entretienReparation,
            loyerMensuel: rowMapped.loyerMensuel,
            depenseTelephone: rowMapped.depenseTelephone,
            autresAvantagesNature: rowMapped.autresAvantagesNature,
            avanceQuinzaineAutres: rowMapped.avanceQuinzaineAutres,
            avancesSpeciales: rowMapped.avancesSpeciales,
            allocationFamiliale: rowMapped.allocationFamiliale,
            deductionEnfants: rowMapped.deductionEnfants,
            nombre_enfants_charge: rowMapped.nombre_enfants_charge,
          };

          const moisNum = Number(mois) || 0;
          const anneeNum = Number(annee) || 0;
          // 4. Calculer tous les champs dérivés en utilisant la nouvelle fonction
          const calculs = computePaieFields(rowMapped, nbrEnfant);

          // 5. Fusionner les données originales, les infos du personnel et les champs calculés
          // Les champs calculés écraseront les valeurs potentiellement présentes dans le CSV
          const finalRow = { ...rowMapped, ...(personnel || {}), ...calculs, mois: moisNum, annee: anneeNum };

          console.log(`[DEBUG] Ligne finale fusionnée ${idx}:`, finalRow);

          if (annee === '' || isNaN(anneeNum)) {
            console.error(`[IMPORT PAIE][${idx}] ATTENTION: champ annee vide ou non numérique ! annee=`, annee, '=>', anneeNum);
          }
          if (mois === '' || isNaN(moisNum)) {
            console.error(`[IMPORT PAIE][${idx}] ATTENTION: champ mois vide ou non numérique ! mois=`, mois, '=>', moisNum);
          }
          dataWithPersonnelAndCalculs.push(finalRow);
        }
        
        console.log('[DEBUG][ImportPaieCsvButton] Objet final envoyé à onImport:', dataWithPersonnelAndCalculs);
        console.log('[DEBUG][ImportPaieCsvButton] Anomalies détectées:', anomalies);
        
        // Politique stricte: s'il y a des anomalies, on bloque l'import complet
        console.log(`[DEBUG] Transmission - Données valides: ${dataWithPersonnelAndCalculs.length} lignes`);
        console.log(`[DEBUG] Transmission - Anomalies: ${anomalies.length} anomalies`);
        if (anomalies.length > 0) {
          console.log(`[DEBUG] Détail des anomalies:`, anomalies);
          if (onAnomalies) onAnomalies(anomalies);
          else console.warn(`[DEBUG] Anomalies détectées mais onAnomalies non défini!`);
          toast.error(`Échec de l'import ! ${anomalies.length} anomalie(s) détectée(s). Aucune ligne importée.`);
          return;
        }

        // Aucun anomalie: on importe toutes les lignes valides
        onImport(dataWithPersonnelAndCalculs);
        toast.success(`Import réussi ! ${dataWithPersonnelAndCalculs.length} ligne(s) importée(s), aucune anomalie détectée.`);
      },
      error: (err) => {
        toast.error('Erreur lors du parsing CSV : ' + err.message);
      }
    });
    e.target.value = '';
  };

  return (
    <>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            sx={{
              width: 260,
              height: 40,
              border: '1px dashed rgba(5,96,116,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textTransform: 'none',
              backgroundColor: 'initial.theme',
            }}
            endIcon={<MdOutlineFileDownload  size={22} />}
          >
            Importer depuis le fichier
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
        </Stack>


    </>
  );

}



