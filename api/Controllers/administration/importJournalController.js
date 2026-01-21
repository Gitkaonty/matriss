const db = require("../../Models");
require('dotenv').config();
const { Op } = require('sequelize');
const Papa = require("papaparse");
const fs = require("fs");
const crypto = require('crypto');

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

const createNotExistingCodeJournal = async (req, res) => {
  try {
    const { compteId, fileId, codeJournalToCreate } = req.body;

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    const normalizeCode = (v) => String(v || '').trim().toUpperCase();

    if (codeJournalToCreate.length > 0) {
      // normaliser, dédoublonner et créer seulement si inexistant
      const entries = codeJournalToCreate.map((item) => ({
        code: normalizeCode(typeof item === 'string' ? item : (item?.code || '')),
        libelle: (typeof item === 'object' && item?.libelle ? String(item.libelle).trim() : 'Libellé à définir')
      })).filter(e => !!e.code);

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
          if (!compte) return null;
          const exists = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte } });
          if (!exists) {
            return dossierPlanComptable.create({
              id_compte: compteId,
              id_dossier: fileId,
              compte,
              libelle: item.CompteLib || '',
              nature: "General",
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
          const base = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte: genCompte } });
          return dossierPlanComptable.create({
            id_compte: compteId,
            id_dossier: fileId,
            compte: aux,
            libelle: item.CompAuxLib || '',
            nature: "Aux",
            typetier: "sans-nif",
            pays: 'Madagascar',
            baseaux: base?.id || 0,
            typecomptabilite: 'Français'
          });
        })
      );
    }

    await db.sequelize.query(
      `UPDATE dossierplancomptables
       SET baseaux_id = id
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
  if (str.includes("/")) {
    const [day, month, year] = str.split("/");
    return new Date(`${year}-${month}-${day}`);
  } else {
    return new Date(`${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`);
  }
}

const importJournal = async (req, res) => {
  try {
    const { compteId, userId, fileId, selectedPeriodeId, fileTypeCSV, valSelectCptDispatch, journalData, longeurCompteStd, periodeStart, periodeEnd } = req.body;

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
        // const newIdEcriture = Date.now() + Math.floor(Math.random() * 1000);
        const newIdEcriture = buildIdEcriture(lines[0]);

        // Traiter chaque ligne du groupe
        for (let item of lines) {
          try {
            // Récupération des IDs
            const rawAux = String(item.CompAuxNum || '').trim();
            const rawGen = String(item.CompteNum || '').trim();
            const isGenDigits = /^\d+$/.test(rawGen);
            const paddedGen = isGenDigits ? rawGen.padEnd(longeurCompteStd, '0').slice(0, longeurCompteStd) : rawGen;

            const normCode = String(item.JournalCode || '').trim().toUpperCase();
            let idCodeJournal = await codejournals.findOne({
              where: { id_compte: compteId, id_dossier: fileId, code: normCode },
            });
            if (!idCodeJournal && normCode) {
              // créer à la volée si nécessaire
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
            // chercher le général (brut/pad)
            foundGen = await dossierPlanComptable.findOne({
              where: {
                id_compte: compteId,
                id_dossier: fileId,
                [Op.or]: [{ compte: rawGen }, { compte: paddedGen }]
              },
            });
            foundCompte = foundAux || foundGen;

            if (!foundCompte) {
              // Auto-créer si possible
              let genCompte = null;
              if (isGenDigits && paddedGen) {
                // vérifier ou créer le général padé
                genCompte = await dossierPlanComptable.findOne({ where: { id_compte: compteId, id_dossier: fileId, compte: paddedGen } });
                if (!genCompte) {
                  genCompte = await dossierPlanComptable.create({
                    id_compte: compteId,
                    id_dossier: fileId,
                    compte: paddedGen,
                    libelle: '',
                    nature: 'General',
                    typetier: 'general',
                    baseaux: paddedGen,
                    pays: 'Madagascar',
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
                    baseaux: genCompte?.id || 0,
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
                  baseaux: foundGen.id,
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

            // Filtrer hors exercice si au moins une borne est fournie
            if (debutExo || finExo) {
              const afterStart = debutExo ? (dateEcrit && dateEcrit >= debutExo) : true;
              const beforeEnd = finExo ? (dateEcrit && dateEcrit <= finExo) : true;
              if (!(afterStart && beforeEnd)) {
                skippedCount++;
                skippedDetails.push({ reason: 'hors_exercice', ecriture: ecritureNum, date: item.EcritureDate });
                continue;
              }
            }

            // Résoudre la devise (id et code)
            const usedCode = (item.Idevise && item.Idevise.trim()) ? item.Idevise.trim() : 'MGA';
            const idDevise = deviseMap.get(usedCode) || defaultDeviseId || null;

            // Création journal
            await journals.create({

              id_compte: compteId,
              id_dossier: fileId,
              id_exercice: selectedPeriodeId,
              id_ecriture: newIdEcriture,
              dateecriture: dateEcrit,
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
              comptegen: rawGen,
              compteaux: rawAux,
              libelleaux: item.EcritureLibAux
            });

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

module.exports = {
  createNotExistingCodeJournal,
  createNotExistingCompte,
  importJournal,
  recupListeImporte
};