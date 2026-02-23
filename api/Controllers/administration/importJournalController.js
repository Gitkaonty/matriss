const db = require("../../Models");
require('dotenv').config();
const { Op, Sequelize } = require('sequelize');
const Papa = require("papaparse");
const fs = require("fs");
const crypto = require('crypto');
const { withSSEProgress } = require('../../Middlewares/sseProgressMiddleware');

const fonctionUpdateBalanceSold = require('../../Middlewares/UpdateSolde/updateBalanceSold');

function buildIdEcriture(item) {
  const key = [
    item.JournalCode?.trim(),
    item.EcritureNum,
    item.EcritureDate,
    item.PieceRef?.trim()
  ].join('|');

  return crypto
    .createHash('sha1')
    .update(key)
    .digest('hex')
    .substring(0, 25);
}

const journals = db.journals;
const codejournals = db.codejournals;
const dossierPlanComptable = db.dossierplancomptable;
const caaxes = db.caAxes;
const casections = db.caSections;
const analytiques = db.analytiques;

const createNotExistingCodeJournal = async (req, res) => {
  try {
    const { compteId, fileId, codeJournalToCreate } = req.body;

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    const normalizeCode = (v) => String(v || '').trim().toUpperCase();

    const ranJournal = await codejournals.findOne({
      where: {
        id_compte: Number(compteId),
        id_dossier: Number(fileId),
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('upper', Sequelize.fn('trim', Sequelize.col('type'))),
            'RAN'
          )
        ]
      }
    });

    console.log('DEBUG createNotExistingCodeJournal: compteId', compteId, 'fileId', fileId);
    console.log('DEBUG createNotExistingCodeJournal: ranJournal trouvé ?', ranJournal?.toJSON?.() || ranJournal);

    if (!ranJournal) {
      resData.state = false;
      resData.msg = "Veuillez créer le code journal RAN avant d'importer.";
      resData.list = null;
      return res.json(resData);
    }

    if (codeJournalToCreate.length > 0) {
      // normaliser, dédoublonner et créer seulement si inexistant
      const entries = codeJournalToCreate.map((item) => ({
        code: normalizeCode(typeof item === 'string' ? item : (item?.code || '')),
        libelle: (typeof item === 'object' && item?.libelle ? String(item.libelle).trim() : 'Libellé à définir')
      })).filter(e => !!e.code && e.code !== 'RAN');

      // set unique by code
      const uniqueByCode = Array.from(new Map(entries.map(e => [e.code, e])).values());

      await Promise.all(uniqueByCode.map(async (e) => {
        const exists = await codejournals.findOne({ where: { id_compte: compteId, id_dossier: fileId, code: e.code } });
        if (!exists) {
          await codejournals.create({ id_compte: compteId, id_dossier: fileId, code: e.code, libelle: e.libelle, type: 'OD' });
        }
      }));

      //récuperer la liste à jour des codes journaux
      const updatedList = await codejournals.findAll({
        where:
        {
          id_compte: compteId,
          id_dossier: fileId
        },
        raw: true,
      });
      resData.state = true;
      resData.list = updatedList;
    } else {
      //récuperer la liste à jour des codes journaux
      const updatedList = await codejournals.findAll({
        where:
        {
          id_compte: compteId,
          id_dossier: fileId
        },
        raw: true,
      });

      resData.state = true;
      resData.list = updatedList;
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const createNotExistingCompte = async (req, res) => {
  try {
    const { compteId, fileId, compteToCreateGen, compteToCreateAux } = req.body;

    let resData = { state: false, msg: '', list: [] };

    // Dédupliquer les entrées et ne créer que si inexistant
    const uniqBy = (arr, keyFn) => Array.from(new Map(arr.map(v => [keyFn(v), v])).values());

    const genList = Array.isArray(compteToCreateGen) ? uniqBy(compteToCreateGen, x => String(x.CompteNum || '').trim()) : [];
    const auxList = Array.isArray(compteToCreateAux) ? uniqBy(compteToCreateAux, x => String(x.CompAuxNum || '').trim()) : [];

    if (genList.length > 0) {
      await Promise.all(
        genList.map(async (item) => {
          const compte = String(item.CompteNum || '').trim();
          const natureCompte = item.CompAuxNum !== '' ? 'Collectif' : 'General';
          if (!compte) return null;
          const exists = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte } });
          if (!exists) {
            await dossierPlanComptable.create({
              id_compte: compteId,
              id_dossier: fileId,
              compte,
              libelle: item.CompteLib || '',
              nature: natureCompte,
              typetier: "general",
              baseaux: compte,
              pays: 'Madagascar'
            });
          }
          return null;
        })
      );
    }

    if (auxList.length > 0) {
      await Promise.all(
        auxList.map(async (item) => {
          const aux = String(item.CompAuxNum || '').trim();
          if (!aux) return null;
          const exists = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte: aux } });
          if (exists) return null;
          // Trouver le général de rattachement par CompteNum (baseaux)
          const genCompte = String(item.CompteNum || '').trim();
          const base = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte: genCompte, nature: 'Collectif' } });
          return dossierPlanComptable.create({
            id_compte: compteId,
            id_dossier: fileId,
            compte: aux,
            libelle: item.CompAuxLib || '',
            nature: "Aux",
            typetier: "sans-nif",
            pays: 'Madagascar',
            baseaux_id: base?.id,
            baseaux: base?.compte,
            typecomptabilite: 'Français'
          });
        })
      );
    }

    await db.sequelize.query(
      `UPDATE dossierplancomptables
       SET baseaux_id = id, baseaux = compte
       WHERE compte = baseaux
       AND id_compte = :compteId
       AND id_dossier = :fileId`,
      {
        replacements: { compteId, fileId },
        type: db.Sequelize.QueryTypes.UPDATE
      }
    );

    const updatedList = await dossierPlanComptable.findAll({
      where: { id_compte: compteId, id_dossier: fileId },
      raw: true
    });

    resData.state = true;
    resData.list = updatedList;

    return res.json(resData);

  } catch (error) {
    console.log("Erreur createNotExistingCompte :", error);
    return res.status(500).json({ state: false, error: error.message });
  }
};

function parseDate(str) {
  if (!str) return null;

  // Si c'est déjà une Date
  if (str instanceof Date) {
    return isNaN(str.getTime()) ? null : str;
  }

  let s = String(str).trim();
  if (!s) return null;

  // Retirer l'heure si présente (ex: "2026-01-22 13:22:53" ou "2026-01-22T13:22:53")
  s = s.replace('T', ' ');
  if (s.includes(' ')) s = s.split(' ')[0];

  // Formats: dd/mm/yyyy ou dd-mm-yyyy
  if (s.includes('/') || s.includes('-')) {
    const separator = s.includes('/') ? '/' : '-';
    const parts = s.split(separator).map(p => p.trim());
    if (parts.length === 3) {
      // Vérifier si c'est format dd/mm/yyyy ou dd-mm-yyyy (jour en premier)
      if (parts[0].length <= 2 && parts[1].length <= 2) {
        const [day, month, year] = parts;
        const d = new Date(`${year}-${month}-${day}`);
        return isNaN(d.getTime()) ? null : d;
      }
    }
  }

  // Formats: yyyy-mm-dd ou yyyy/mm/dd
  if (s.includes('-') || s.includes('/')) {
    const normalized = s.replace(/\//g, '-');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }

  // Format: yyyymmdd
  if (/^\d{8}$/.test(s)) {
    console.log('🔍 PARSE - Format yyyymmdd détecté:', s);
    const year = s.substring(0, 4);
    const month = s.substring(4, 6);
    const day = s.substring(6, 8);
    // Forcer 12:00 GMT pour éviter le décalage horaire
    const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    console.log('🔍 PARSE - Date créée yyyymmdd:', d);
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback
  console.log('🔍 PARSE - Fallback pour:', s);
  const d = new Date(s);
  console.log('🔍 PARSE - Date créée fallback:', d);
  return isNaN(d.getTime()) ? null : d;
}

const importJournal = async (req, res) => {
  try {
    const { compteId, userId, fileId, selectedPeriodeId, fileTypeCSV, valSelectCptDispatch, journalData, periodeStart, periodeEnd } = req.body;

    let resData = {
      state: false,
      msg: '',
      list: [],
      nbrligne: 0
    }

    let importSuccess = 1;
    let importedCount = 0;
    let skippedCount = 0;
    const skippedDetails = [];

    // Bloquer l'import si le code journal RAN n'existe pas
    const ranJournal = await codejournals.findOne({
      where: {
        id_compte: Number(compteId),
        id_dossier: Number(fileId),
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('upper', Sequelize.fn('trim', Sequelize.col('type'))),
            'RAN'
          )
        ]
      }
    });

    if (!ranJournal) {
      return res.status(400).json({
        state: false,
        msg: "Veuillez créer le code journal RAN avant d'importer.",
        list: [],
        nbrligne: 0
      });
    }

    if (valSelectCptDispatch === 'ECRASER') {
      await journals.destroy({
        where:
        {
          id_compte: Number(compteId),
          id_dossier: Number(fileId),
          id_exercice: Number(selectedPeriodeId),
        }
      });
    }

    if (journalData.length > 0) {
      importSuccess = 1;

      // Assurer l'existence des devises utilisées et de la devise par défaut MGA
      const deviseCodes = [...new Set((journalData || [])
        .map(r => (r.Idevise || '').trim())
        .filter(v => v))];
      if (!deviseCodes.includes('MGA')) deviseCodes.push('MGA');
      for (const code of deviseCodes) {
        const existing = await db.Devise.findOne({ where: { id_compte: compteId, id_dossier: fileId, code } });
        if (!existing) await db.Devise.create({ id_compte: compteId, id_dossier: fileId, code, libelle: code });
      }

      // Construire une map code -> id
      const allDevises = await db.Devise.findAll({ where: { id_compte: compteId, id_dossier: fileId }, raw: true });
      const deviseMap = new Map(allDevises.map(dv => [dv.code, dv.id]));
      const defaultDeviseId = deviseMap.get('MGA');

      // Grouper par numéro d'écriture
      const grouped = journalData.reduce((acc, item) => {
        const key = item.EcritureNum;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      // Pour chaque groupe
      // bornes d'exercice si fournies
      const toMidnight = (d) => { if (!d) return null; const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
      const debutExo = toMidnight(periodeStart);
      const finExo = toMidnight(periodeEnd);

      for (let ecritureNum in grouped) {
        const lines = grouped[ecritureNum];
        console.log('DEBUG traitement écriture:', ecritureNum, 'lignes:', lines.length);
        // const newIdEcriture = Date.now() + Math.floor(Math.random() * 1000);
        const newIdEcriture = buildIdEcriture(lines[0]);

        // Traiter chaque ligne du groupe
        for (let item of lines) {
          try {
            // Récupération des IDs
            const rawAux = String(item.CompAuxNum || '').trim();
            const rawGen = String(item.CompteNum || '').trim();

            const normCode = String(item.JournalCode || '').trim().toUpperCase();
            let idCodeJournal = await codejournals.findOne({
              where: { id_compte: compteId, id_dossier: fileId, code: normCode },
            });
            if (!idCodeJournal && normCode) {
              idCodeJournal = await codejournals.create({ id_compte: compteId, id_dossier: fileId, code: normCode, libelle: normCode, type: 'OD' });
            }
            const codeJournalId = idCodeJournal?.id || 0;

            // Essayer de trouver l'auxiliaire et/ou le général
            let foundCompte = null;
            let foundAux = null;
            let foundGen = null;
            if (rawAux) {
              foundAux = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte: rawAux } });
            }
            // chercher le général (valeur brute)
            foundGen = await dossierPlanComptable.findOne({
              where: {
                id_compte: compteId,
                id_dossier: fileId,
                compte: rawGen
              },
            });
            foundCompte = foundAux || foundGen;

            if (!foundCompte) {
              // Auto-créer si possible
              let genCompte = null;
              if (rawGen) {
                // vérifier ou créer le général
                genCompte = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte: rawGen } });
                if (!genCompte) {
                  genCompte = await dossierPlanComptable.create({
                    id_compte: compteId,
                    id_dossier: fileId,
                    compte: rawGen,
                    libelle: '',
                    nature: 'General',
                    typetier: 'general',
                    baseaux: rawGen,
                    pays: 'Madagascar',
                    longueur: rawGen.length
                  });
                  await db.sequelize.query(
                    `UPDATE dossierplancomptables SET baseaux_id = id WHERE id = :id`,
                    { replacements: { id: genCompte.id }, type: db.Sequelize.QueryTypes.UPDATE }
                  );
                }
              }
              if (rawAux) {
                // créer l'aux au besoin et lier au général si disponible
                let createdAux = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte: rawAux } });
                if (!createdAux) {
                  createdAux = await dossierPlanComptable.create({
                    id_compte: compteId,
                    id_dossier: fileId,
                    compte: rawAux,
                    libelle: '',
                    nature: 'Aux',
                    typetier: 'sans-nif',
                    pays: 'Madagascar',
                    baseaux: genCompte?.compte,
                    baseaux_id: genCompte?.id,
                    typecomptabilite: 'Français',
                    longueur: rawAux.length
                  });
                }
                foundCompte = createdAux || genCompte;
              } else if (genCompte) {
                foundCompte = genCompte;
              }
              if (!foundCompte) {
                importSuccess = importSuccess * 0; skippedCount++;
                skippedDetails.push({ reason: 'compte_introuvable', ecriture: ecritureNum, compAux: rawAux, compGen: rawGen });
                continue;
              }
            }

            // Si le général existe mais l'aux n'existe pas et rawAux est fourni, créer l'aux puis utiliser l'aux pour l'écriture
            if (rawAux && !foundAux && foundGen) {
              let createdAux = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte: rawAux } });
              if (!createdAux) {
                createdAux = await dossierPlanComptable.create({
                  id_compte: compteId,
                  id_dossier: fileId,
                  compte: rawAux,
                  libelle: '',
                  nature: 'Aux',
                  typetier: 'sans-nif',
                  pays: 'Madagascar',
                  baseaux: foundGen.compte,
                  baseaux_id: foundGen.id,
                  typecomptabilite: 'Français',
                  longueur: rawAux.length
                });
              }
              foundCompte = createdAux;
            }

            const compteNumId = foundCompte.id;
            const IdCompAuxNum = foundCompte.baseaux_id || foundCompte.id;

            // Montants (normaliser espaces et séparateurs)
            const normalizeAmount = (val) => {
              if (val == null) return 0;
              let s = String(val).trim();
              if (!s) return 0;
              s = s.replace(/\s+/g, '');
              if (s.includes(',') && s.includes('.')) {
                // suppose '.' milliers, ',' décimal
                s = s.replace(/\./g, '').replace(/,/g, '.');
              } else if (s.includes(',')) {
                s = s.replace(/,/g, '.');
              }
              const n = parseFloat(s);
              return isNaN(n) ? 0 : n;
            };
            const debit = normalizeAmount(item.Debit);
            const credit = normalizeAmount(item.Credit);

            // Dates (définir avant l'insert)
            const dateEcrit = toMidnight(parseDate(item.EcritureDate));
            const datePiece = toMidnight(parseDate(item.PieceDate));
            const datelettrage = toMidnight(parseDate(item.DateLet));

            // Règle RAN: dateecriture = début exercice, vraie_date = date du fichier
            // Sinon: dateecriture = vraie_date = date du fichier
            const isRAN = idCodeJournal?.type?.toUpperCase()?.trim() === 'RAN';
            const vraieDate = isRAN ? dateEcrit : dateEcrit;
            const dateEcritureImportee = isRAN ? debutExo : dateEcrit;

            // Filtrer hors exercice si au moins une borne est fournie (sauf pour RAN)
            if (debutExo || finExo) {
              const afterStart = debutExo ? (dateEcrit && dateEcrit >= debutExo) : true;
              const beforeEnd = finExo ? (dateEcrit && dateEcrit <= finExo) : true;
              if (!(afterStart && beforeEnd) && !isRAN) {
                skippedCount++;
                skippedDetails.push({ reason: 'hors_exercice', ecriture: ecritureNum, date: item.EcritureDate });
                continue;
              }
            }

            // Résoudre la devise (id et code)
            const usedCode = (item.Idevise && item.Idevise.trim()) ? item.Idevise.trim() : 'MGA';
            const idDevise = deviseMap.get(usedCode) || defaultDeviseId || null;

            const dossierPc = await dossierPlanComptable.findByPk(compteNumId);
            const comptegen = dossierPc?.compte;
            const comptebaseaux = dossierPc?.baseaux_id;

            let libelleaux = '';
            let compteaux = null;
            if (comptebaseaux) {
              const cpt = await dossierPlanComptable.findByPk(comptebaseaux);
              compteaux = cpt?.compte;
              libelleaux = cpt?.libelle;
            }
            await journals.create({
              id_compte: compteId,
              id_dossier: fileId,
              id_ecriture: newIdEcriture,
              id_exercice: selectedPeriodeId,
              dateecriture: dateEcritureImportee,
              vraie_date: vraieDate,
              id_journal: codeJournalId,
              id_numcpt: compteNumId,
              id_numcptcentralise: IdCompAuxNum,
              piece: item.PieceRef,
              piecedate: datePiece,
              libelle: item.EcritureLib,
              debit,
              credit,
              id_devise: idDevise || 0,
              devise: usedCode,
              lettrage: item.EcritureLet || null,
              lettragedate: datelettrage || null,
              saisiepar: userId,
              modifierpar: userId || 0,
              comptegen: comptegen,
              compteaux: rawAux,
              libelleaux: item.EcritureLibAux
            });

            console.log('DEBUG écriture créée (importJournal): id_ecriture:', newIdEcriture, 'dateecriture:', dateEcritureImportee, 'vraie_date:', vraieDate);

            importSuccess = importSuccess * 1;
            importedCount++;
          } catch (error) {
            importSuccess = importSuccess * 0;
            resData.msg = error;
            skippedDetails.push({ reason: 'exception', ecriture: ecritureNum, message: String(error?.message || error) });
            skippedCount++;
          }
        }
      }
    } else {
      resData.msg = `${journalData.length} lignes ont été importées avec succès`;
      resData.nbrligne = journalData.length;
      resData.state = true;
    }

    if (importSuccess === 1 || importedCount > 0) {

      fonctionUpdateBalanceSold.updateSold(compteId, fileId, selectedPeriodeId, [], true);

      resData.msg = skippedCount > 0
        ? `${importedCount} lignes importées, ${skippedCount} ignorées`
        : `${importedCount || journalData.length} lignes ont été importées avec succès`;
      resData.nbrligne = importedCount || journalData.length;
      resData.ignored = skippedCount;
      resData.state = true;
      if (skippedDetails.length) resData.skippedDetails = skippedDetails;
    } else {
      resData.state = false;
      resData.msg = 'Aucune ligne importée (comptes introuvables ou données hors exercice)';
      resData.nbrligne = 0;
      resData.ignored = journalData.length;
      if (skippedDetails.length) resData.skippedDetails = skippedDetails;
    }

    return res.json(resData);
  } catch (error) {
    //let importSuccess = importSuccess * 0;
    let resData = { state: false, msg: '', details: null };
    console.log(error);
  }
}


const parseToDate = (str) => {
  if (!str) return null;
  if (typeof str === "string") str = str.trim();

  let d = null;

  if (typeof str === "string") {
    if (str.includes("/")) {
      const [day, month, year] = str.split("/").map(s => s.trim());
      d = new Date(`${year}-${month}-${day}`);
    } else if (/^\d{8}$/.test(str)) {
      d = new Date(`${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`);
    } else {
      d = new Date(str);
    }
  } else {
    d = new Date(str);
  }

  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const recupListeImporte = async (req, res) => {
  try {
    const { startDate, endDate, fileTypeCSV } = req.body;

    const dStart = parseToDate(startDate);
    const dEnd = parseToDate(endDate);

    const csvFile = fs.readFileSync(req.file.path, "utf8");

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {

        const baseData = fileTypeCSV === "true"
          ? result.data.map((row, index) => ({
            ...row,
            id: index,
            CompteLib: "",
          }))
          : result.data;

        const finalData = [];

        for (const row of baseData) {
          const d = parseToDate(row.EcritureDate);

          if (!d) continue;
          if (dStart && d < dStart) continue;
          if (dEnd && d > dEnd) continue;

          finalData.push(row);
        }

        fs.unlinkSync(req.file.path);

        return res.json({
          success: true,
          data: finalData
        });
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'import du fichier"
    });
  }
}

const importJournalWithProgressLogic = async (req, res, progress) => {
  try {
    const {
      compteId,
      userId,
      fileId,
      selectedPeriodeId,
      valSelectCptDispatch,
      journalData,
      periodeStart,
      periodeEnd
    } = req.body;

    if (!Array.isArray(journalData) || journalData.length === 0) {
      progress.error("Aucune donnée à importer");
      return;
    }

    /* ======================================================
       NORMALISATION DATE
       ====================================================== */
    const normalizeDate = (val) => {
      if (!val) return null;
      const s = String(val).trim();
      if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
      if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(s)) {
        const sep = s.includes('/') ? '/' : '-';
        const [day, month, year] = s.split(sep);
        return `${year}-${month}-${day}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const d = new Date(s);
      return isNaN(d) ? null : d.toISOString().slice(0, 10);
    };

    const debutExo = normalizeDate(periodeStart);
    const finExo = normalizeDate(periodeEnd);

    if (!debutExo) {
      progress.error("Date début exercice invalide");
      return;
    }

    progress.step("Initialisation...", 5);

    /* ======================================================
       VÉRIFICATION JOURNAL RAN
       ====================================================== */
    const ranJournal = await codejournals.findOne({
      where: { id_compte: compteId, id_dossier: fileId, type: 'RAN' }
    });

    if (!ranJournal) {
      progress.error("Veuillez créer le journal RAN avant l'import");
      return;
    }

    /* ======================================================
       ÉCRASEMENT SI NÉCESSAIRE
       ====================================================== */
    if (valSelectCptDispatch === 'ECRASER') {
      await journals.destroy({
        where: { id_compte: compteId, id_dossier: fileId, id_exercice: selectedPeriodeId }
      });
    }

    progress.step("Pré-chargement des données...", 10);

    /* ======================================================
       PRÉ-CHARGEMENT EN MÉMOIRE (CACHE)
       ====================================================== */
    // Charger tous les journaux existants
    const allJournals = await codejournals.findAll({
      where: { id_compte: compteId, id_dossier: fileId },
      raw: true
    });
    const journalMap = new Map(allJournals.map(j => [j.code, j]));

    // Charger tous les comptes existants
    const allComptes = await dossierPlanComptable.findAll({
      where: { id_compte: compteId, id_dossier: fileId },
      raw: true
    });
    const compteMap = new Map(allComptes.map(c => [c.compte, c]));

    // Charger toutes les devises
    const allDevises = await db.Devise.findAll({
      where: { id_compte: compteId, id_dossier: fileId },
      raw: true
    });
    const deviseMap = new Map(allDevises.map(d => [d.code, d.id]));
    let defaultDeviseId = deviseMap.get('MGA');

    // Créer les devises manquantes
    const deviseCodes = [...new Set(journalData.map(r => String(r.Idevise || '').trim()).filter(Boolean))];
    if (!deviseCodes.includes('MGA')) deviseCodes.push('MGA');
    
    const newDevises = deviseCodes.filter(code => !deviseMap.has(code));
    if (newDevises.length > 0) {
      await db.Devise.bulkCreate(
        newDevises.map(code => ({ id_compte: compteId, id_dossier: fileId, code, libelle: code }))
      );
      // Recharger
      const freshDevises = await db.Devise.findAll({
        where: { id_compte: compteId, id_dossier: fileId },
        raw: true
      });
      freshDevises.forEach(d => deviseMap.set(d.code, d.id));
      defaultDeviseId = deviseMap.get('MGA');
    }

    progress.step("Création des journaux manquants...", 15);

    /* ======================================================
       CRÉATION BATCH DES JOURNAUX MANQUANTS
       ====================================================== */
    const journalCodesNeeded = [...new Set(
      journalData.map(r => String(r.JournalCode || '').trim().toUpperCase().slice(0, 10)).filter(Boolean)
    )];
    const newJournalCodes = journalCodesNeeded.filter(code => !journalMap.has(code));
    
    if (newJournalCodes.length > 0) {
      const journalsToCreate = newJournalCodes.map(code => ({
        id_compte: compteId,
        id_dossier: fileId,
        code: code,
        libelle: code,
        type: 'OD'
      }));
      
      const createdJournals = await codejournals.bulkCreate(journalsToCreate, { returning: true });
      createdJournals.forEach(j => journalMap.set(j.code, j));
    }

    progress.step("Création des comptes manquants...", 20);

    /* ======================================================
       CRÉATION BATCH DES COMPTES MANQUANTS
       ====================================================== */
    const comptesNeeded = [...new Set(
      journalData.flatMap(r => [
        String(r.CompteNum || '').trim(),
        String(r.CompAuxNum || '').trim()
      ]).filter(c => c)
    )];
    const newComptes = comptesNeeded.filter(c => !compteMap.has(c));
    
    if (newComptes.length > 0) {
      const comptesToCreate = newComptes.map(num => ({
        id_compte: compteId,
        id_dossier: fileId,
        compte: num,
        libelle: num,
        longueur: num.length,
        type: num.startsWith('6') || num.startsWith('7') ? 'RESULTAT' : 'BILAN',
        actif: true
      }));
      
      const createdComptes = await dossierPlanComptable.bulkCreate(comptesToCreate, { returning: true });
      createdComptes.forEach(c => compteMap.set(c.compte, c));
    }

    /* ======================================================
       PRÉPARATION DES ÉCRITURES
       ====================================================== */
    progress.step("Préparation des écritures...", 25);

    const grouped = journalData.reduce((acc, row) => {
      if (!acc[row.EcritureNum]) acc[row.EcritureNum] = [];
      acc[row.EcritureNum].push(row);
      return acc;
    }, {});

    const ecritureKeys = Object.keys(grouped);
    let imported = 0;
    let skipped = 0;
    let skippedNoDate = 0;
    let skippedOutOfPeriod = 0;
    let skippedNoAccount = 0;
    let skippedError = 0;
    let batchEntries = [];
    const BATCH_SIZE = 500; // Taille du batch pour bulkCreate

    for (let i = 0; i < ecritureKeys.length; i++) {
      const ecritureNum = ecritureKeys[i];
      const lines = grouped[ecritureNum];
      const idEcriture = buildIdEcriture(lines[0]);

      for (const item of lines) {
        const dateEcrit = normalizeDate(item.EcritureDate);
        if (!dateEcrit) {
          skipped++; skippedNoDate++; continue;
        }

        const journalCode = String(item.JournalCode || '').trim().toUpperCase().slice(0, 10);
        const journal = journalMap.get(journalCode);
        
        if (!journal) {
          skipped++; skippedError++; continue;
        }

        const isRAN = journal.type === 'RAN';
        const inExercice = dateEcrit >= debutExo && (!finExo || dateEcrit <= finExo);
        
        if (!inExercice && !isRAN) {
          skipped++; skippedOutOfPeriod++; continue;
        }

        const compteNum = String(item.CompteNum || '').trim();
        if (!compteNum) {
          skipped++; skippedNoAccount++; continue;
        }

        const compte = compteMap.get(compteNum);
        if (!compte) {
          skipped++; skippedError++; continue;
        }

        const compteAux = String(item.CompAuxNum || '').trim();
        const auxCompte = compteAux ? compteMap.get(compteAux) : null;

        // Parser montants
        const parseAmount = (v) => {
          if (!v) return 0;
          let s = String(v).replace(/\s/g, '');
          if (s.includes(',') && s.includes('.')) {
            s = s.replace(/\./g, '').replace(',', '.');
          } else {
            s = s.replace(',', '.');
          }
          const n = parseFloat(s);
          return isNaN(n) ? 0 : n;
        };

        const debit = parseAmount(item.Debit);
        const credit = parseAmount(item.Credit);

        batchEntries.push({
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: selectedPeriodeId,
          id_ecriture: idEcriture,
          dateecriture: isRAN ? debutExo : dateEcrit,
          vraie_date: dateEcrit,
          id_journal: journal.id,
          id_numcpt: compte.id,
          id_numcptcentralise: compte.baseaux_id || compte.id,
          piece: String(item.PieceRef || '').substring(0, 50),
          piecedate: normalizeDate(item.PieceDate),
          libelle: String(item.EcritureLib || '').substring(0, 100),
          debit,
          credit,
          id_devise: deviseMap.get(item.Idevise) || defaultDeviseId,
          devise: String(item.Idevise || 'MGA').substring(0, 10),
          lettrage: item.EcritureLet || null,
          lettragedate: normalizeDate(item.DateLet),
          saisiepar: userId,
          modifierpar: userId,
          comptegen: compteNum.substring(0, 50),
          compteaux: (compteAux || compteNum).substring(0, 50),
          libellecompte: String(compte?.libelle || compteNum).substring(0, 50),
          libelleaux: String(auxCompte?.libelle || compteAux || 'Pas encore de libellé').substring(0, 50)
        });

        imported++;

        // Insérer par batch pour éviter surcharge mémoire
        if (batchEntries.length >= BATCH_SIZE) {
          await journals.bulkCreate(batchEntries, { 
            ignoreDuplicates: true,
            validate: false,
            individualHooks: false,
            hooks: false,
            logging: false
          });
          batchEntries = [];
        }
      }

      // Progression mise à jour moins fréquemment
      if (i % 50 === 0 || i === ecritureKeys.length - 1) {
        progress.update(
          i + 1,
          ecritureKeys.length,
          "Import des écritures...",
          25 + Math.floor((i / ecritureKeys.length) * 65)
        );
      }
    }

    // Insérer le batch final
    if (batchEntries.length > 0) {
      await journals.bulkCreate(batchEntries, { 
        ignoreDuplicates: true,
        validate: false,
        individualHooks: false,
        hooks: false,
        logging: false
      });
    }

    /* ======================================================
       MISE À JOUR DES SOLDES (UNE SEULE FOIS)
       ====================================================== */
    progress.step("Mise à jour des soldes...", 95);

    await fonctionUpdateBalanceSold.updateSold(
      compteId,
      fileId,
      selectedPeriodeId,
      [],
      true
    );

    progress.complete(
      `${imported} lignes importées, ${skipped} ignorées`,
      { imported, skipped, skippedNoDate, skippedOutOfPeriod, skippedNoAccount, skippedError }
    );

    console.log('📊 RAPPORT IMPORT:', {
      imported,
      skipped,
      skippedNoDate,
      skippedOutOfPeriod,
      skippedNoAccount,
      skippedError
    });

  } catch (err) {
    console.error("❌ ERREUR IMPORT:", err);
    progress.error(err.message);
  }
};
const importJournalWithProgress = withSSEProgress(importJournalWithProgressLogic, {
  batchSize: 20
});

module.exports = {
  createNotExistingCodeJournal,
  createNotExistingCompte,
  importJournal,
  importJournalWithProgress,
  recupListeImporte
};