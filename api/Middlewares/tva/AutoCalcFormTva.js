const db = require('../../Models');

// - If code_tva == id_dge AND groupe == '01' => use sum(montant_ht)
// - If code_tva == id_dge AND groupe == '02' => use sum(montant_tva)

async function autoCalcDGE({ dossierId, compteId, exerciceId, mois, annee, debug = false }) {
  const whereAnn = {
    id_dossier: Number(dossierId),
    id_compte: Number(compteId),
    id_exercice: Number(exerciceId),
  };
  if (mois) whereAnn.mois = Number(mois);
  if (annee) whereAnn.annee = Number(annee);

  // Load annexes
  const annexes = await db.etatsTvaAnnexes.findAll({ where: whereAnn });

  // Build code_tva -> single chosen annexe row (latest by date_facture, then highest id)
  const pickLatest = (oldRec, newRec) => {
    if (!oldRec) return newRec;
    const dOld = oldRec.date_facture ? new Date(oldRec.date_facture) : null;
    const dNew = newRec.date_facture ? new Date(newRec.date_facture) : null;
    if (dOld && dNew) {
      if (dNew.getTime() > dOld.getTime()) return newRec;
      if (dNew.getTime() < dOld.getTime()) return oldRec;
      // same date, tie-breaker by id
      return Number(newRec.id || 0) >= Number(oldRec.id || 0) ? newRec : oldRec;
    }
    if (dNew && !dOld) return newRec;
    if (!dNew && dOld) return oldRec;
    return Number(newRec.id || 0) >= Number(oldRec.id || 0) ? newRec : oldRec;
  };

  const recordByCode = new Map();
  for (const a of annexes) {
    const raw = a.code_tva;
    if (raw === null || raw === undefined) continue;
    // Normalize: extract first continuous digit sequence (e.g., '210 - x' -> '210')
    const match = String(raw).trim().match(/\d+/);
    const normalized = match ? String(Number(match[0])) : '';
    if (!normalized) continue;
    const prev = recordByCode.get(normalized);
    const chosen = pickLatest(prev, a);
    recordByCode.set(normalized, chosen);
  }

  // Load DGE templates to know groups
  const templates = await db.etatsDgeMatrices.findAll();
  const idToGroup = new Map((templates || []).map(t => [String(t.id_dge), t.groupe || null]));

  // Load target DGE lines for the form
  const whereDge = {
    id_dossier: Number(dossierId),
    id_compte: Number(compteId),
    id_exercice: Number(exerciceId),
  };
  const dgeRows = await db.etatsDge.findAll({ where: whereDge });

  const updates = [];
  const debugMap = [];
  for (const row of dgeRows) {
    const iddgeNorm = String(Number(row.id_dge));
    const grp = idToGroup.get(Number(row.id_dge)) || idToGroup.get(iddgeNorm) || null;
    const rec = recordByCode.get(iddgeNorm);
    if (debug) {
      debugMap.push({
        id_dge: row.id_dge,
        groupe: grp,
        matchedAnnexeId: rec ? rec.id : null,
        code_tva: rec ? rec.code_tva : null,
      });
    }
    if (!rec) continue;
    let value = null;
    if (grp === '01') value = Number(rec.montant_ht || 0);
    if (grp === '02') value = Number(rec.montant_tva || 0);
    if (grp === '03') value = Number(rec.montant_tva || 0);
    if (value !== null) {
      const newVal = Number(value || 0);
      if (Number(row.montant) !== newVal) {
        await row.update({ montant: newVal });
        updates.push({ id_dge: row.id_dge, groupe: grp, from: rec.id, montant: newVal });
      }
    }
  }

  return { count: updates.length, updates, ...(debug ? { debug: debugMap } : {}) };
}

// Auto-calc for unified formulaire (formulaire_tva_annexes)
async function autoCalcUnified({ dossierId, compteId, exerciceId, mois, annee, debug = false }) {
  try {
    if (debug) console.log('[AUTO-CALC][UNIFIED] start', { dossierId, compteId, exerciceId, mois, annee });
    const whereAnn = {
      id_dossier: Number(dossierId),
      id_compte: Number(compteId),
      id_exercice: Number(exerciceId),
    };
    if (mois) whereAnn.mois = Number(mois);
    if (annee) whereAnn.annee = Number(annee);

    const annexes = await db.etatsTvaAnnexes.findAll({ where: whereAnn });
    if (debug) console.log('[AUTO-CALC][UNIFIED] annexes.count', annexes?.length || 0);

    // Aggregate all annexes per code_tva: compute sums (HT, TVA)
    const totalsByCode = new Map(); // code -> { sumHT, sumTVA, count }
    for (const a of annexes) {
      const raw = a.code_tva;
      if (raw === null || raw === undefined) continue;
      const match = String(raw).trim().match(/\d+/);
      const normalized = match ? String(Number(match[0])) : '';
      if (!normalized) continue;
      const prev = totalsByCode.get(normalized) || { sumHT: 0, sumTVA: 0, count: 0 };
      prev.sumHT += Number(a.montant_ht || 0);
      prev.sumTVA += Number(a.montant_tva || 0);
      prev.count += 1;
      totalsByCode.set(normalized, prev);
    }
    if (debug) console.log('[AUTO-CALC][UNIFIED] totalsByCode.size', totalsByCode.size);

    // Load unified templates to know groups per id_code
    const templates = await db.formulaireTvaAnnexesMatrices.findAll();
    if (debug) console.log('[AUTO-CALC][UNIFIED] templates.count', templates?.length || 0);
    const idToGroup = new Map((templates || []).map(t => [String(Number(t.id_code)), t.groupe || null]));

    const whereForm = {
      id_dossier: Number(dossierId),
      id_compte: Number(compteId),
      id_exercice: Number(exerciceId),
    };
    if (mois != null) whereForm.mois = Number(mois);
    if (annee != null) whereForm.annee = Number(annee);
    let formRows = await db.formulaireTvaAnnexes.findAll({ where: whereForm, order: [['id_code', 'ASC']] });
    if (debug) console.log('[AUTO-CALC][UNIFIED] formRows.where', whereForm, 'count', formRows?.length || 0);

    const updates = [];
    const debugMap = [];

    for (const row of formRows) {
      const idCodeNorm = String(Number(row.id_code));
      const grp = idToGroup.get(idCodeNorm) || null;
      const rec = totalsByCode.get(idCodeNorm);
    
      if (debug) {
        debugMap.push({
          id_code: row.id_code,
          groupe: grp,
          matchedAnnexeId: rec ? rec.id : null,
          code_tva: rec ? rec.code_tva : null,
          current: Number(row.montant),
        });
      }
    
      // - sinon => remettre le montant à 0 (afin d'éviter des restes d'un autre mois)
      if (grp === '01' || grp === '02' || grp === '03') {
        // Groupe 01 : on ignore les totaux annexes -> remis à 0, ce sera mis à jour par les journaux
        if (grp === '01') {
          if (Number(row.montant) !== 0) {
            if (debug) console.log('[AUTO-CALC][UNIFIED] grp01: ignore annex totals -> reset to 0', { id_code: row.id_code });
            await row.update({ montant: 0 });
            updates.push({ id_code: row.id_code, groupe: grp, from: 'annex-skip', montant: 0 });
          } else if (debug) {
            console.log('[AUTO-CALC][UNIFIED] grp01: already 0 (annex skipped)', { id_code: row.id_code });
          }
          continue; // on passe au prochain row
        }
    
        // Groupes 02/03 : utiliser les totaux annexes
        if (!rec) {
          if (Number(row.montant) !== 0) {
            if (debug) console.log('[AUTO-CALC][UNIFIED] reset to 0', { id_code: row.id_code, groupe: grp });
            await row.update({ montant: 0 });
            updates.push({ id_code: row.id_code, groupe: grp, from: null, montant: 0 });
          }
          continue;
        }
    
        let value = null;
        if (grp === '02' || grp === '03') value = Number(rec.sumTVA || 0);
        const newVal = Number(value || 0);
    
        if (Number(row.montant) !== newVal) {
          if (debug) console.log('[AUTO-CALC][UNIFIED] update (sum)', { id_code: row.id_code, groupe: grp, montant: newVal });
          await row.update({ montant: newVal });
          updates.push({ id_code: row.id_code, groupe: grp, montant: newVal });
        }
      }
    }
    
     // =============================================
  // 2) CALCUL CA (comptes 7*) DIRECTEMENT DEPUIS JOURNALS (hors annexes)
  // =============================================
  try {
    // Charger le mapping ParamTVA (id_numcpt -> code_tva)
    const params = await db.paramtvas.findAll({ where: { id_dossier: Number(dossierId) } });
    const cptIds = Array.from(new Set((params || []).map(p => Number(p.id_cptcompta)).filter(Boolean)));
    let idToNumero = new Map();
    if (cptIds.length > 0) {
      const pcRows = await db.dossierplancomptable.findAll({ where: { id: { [db.Sequelize.Op.in]: cptIds } } });
      idToNumero = new Map((pcRows || []).map(r => [Number(r.id), String(r.compte || '')]));
    }
    const codeIdToCode = new Map();
    // Précharger les codes TVA
    const codeRows = await db.listecodetvas.findAll();
    (codeRows || []).forEach(c => codeIdToCode.set(Number(c.id), String(c.code || '').trim()));
    // Construire mapping id_numcpt -> code (numérique simple)
    const idNumcptToCode = new Map();
    for (const p of (params || [])) {
      const idc = Number(p.id_cptcompta);
      const numero = idToNumero.get(idc) || '';
      if (!numero || !numero.startsWith('7')) continue; // seulement comptes 7*
      const codeStr = codeIdToCode.get(Number(p.type)) || '';
      const match = String(codeStr).match(/\d+/);
      const codeNorm = match ? String(Number(match[0])) : '';
      if (!codeNorm) continue;
      idNumcptToCode.set(idc, codeNorm);
    }
    if (debug) console.log('[AUTO-CALC][UNIFIED][CA] mapped comptes7 count', idNumcptToCode.size);

    // Charger les journals pour la période déclarative (decltva=true + decltvamois/decltvaannee)
    const m = Number(mois), y = Number(annee);
    if (m && y) {
      const { Op } = db.Sequelize;
      const whereJournal = {
        id_dossier: Number(dossierId),
        id_compte: Number(compteId),
        id_exercice: Number(exerciceId),
        decltva: true,
        decltvamois: Number(m),
        decltvaannee: Number(y),
      };
      const jrns = await db.journals.findAll({ where: whereJournal, attributes: ['id_numcpt', 'debit', 'credit'] });
      if (debug) console.log('[AUTO-CALC][UNIFIED][CA] journals.where', whereJournal, 'count', jrns?.length || 0);

      // Agrégat par code via id_numcpt -> code
      const sumByCode = new Map();
      for (const j of (jrns || [])) {
        const idn = Number(j.id_numcpt);
        const code = idNumcptToCode.get(idn);
        if (!code) continue;
        const delta = Number(j.credit || 0) - Number(j.debit || 0);
        sumByCode.set(code, (sumByCode.get(code) || 0) + delta);
      }
      if (debug) {
        try {
          console.log('[AUTO-CALC][UNIFIED][CA] sumByCode', Array.from(sumByCode.entries()).map(([c,v]) => ({ code: String(Number(c)), total: v })));
        } catch {}
      }

      // Mettre à jour le formulaire pour chaque code trouvé
      if (sumByCode.size > 0) {
        // Relire les lignes formulaire courantes (déjà chargées: formRows)
        for (const [code, amount] of sumByCode.entries()) {
          const codeNum = String(Number(code));
          const grp = idToGroup.get(codeNum) || null;
          if (grp !== '01') {
            if (debug) console.log('[AUTO-CALC][UNIFIED][CA] skip non-01 group', { code: codeNum, grp });
            continue;
          }
          const row = (formRows || []).find(r => String(Number(r.id_code)) === codeNum);
          if (debug) {
            try {
              console.log('[AUTO-CALC][UNIFIED][CA] match row?', {
                code: codeNum,
                found: !!row,
                row_mois: row?.mois ?? null,
                row_annee: row?.annee ?? null,
                target_mois: Number(m),
                target_annee: Number(y),
              });
            } catch {}
          }
          if (!row) {
            // Créer la ligne formulaire pour cette période et ce code (groupe 01) si absente
            try {
              const mPer = Number(m), yPer = Number(y);
              if (mPer && yPer) {
                const lib = (templates || []).find(t => String(Number(t.id_code)) === codeNum)?.libelle || codeNum;
                const payload = {
                  id_dossier: Number(dossierId),
                  id_compte: Number(compteId),
                  id_exercice: Number(exerciceId),
                  id_code: Number(codeNum),
                  mois: mPer,
                  annee: yPer,
                  libelle: lib,
                  montant: Number(amount || 0),
                };
                // 1) Rechercher s'il existe déjà une ligne sur la période (sécurité supplémentaire)
                const existPeriod = await db.formulaireTvaAnnexes.findOne({ where: payload });
                if (existPeriod) {
                  // Mettre à jour le montant si différent
                  if (Number(existPeriod.montant) !== Number(amount || 0)) {
                    await existPeriod.update({ montant: Number(amount || 0) });
                    updates.push({ id_code: Number(codeNum), groupe: '01', from: 'journals', montant: Number(amount || 0), updated: true });
                  }
                  formRows.push(existPeriod);
                } else {
                  // 2) Sinon, tenter de réutiliser un placeholder (mois/annee NULL) pour ce code
                  const placeholder = await db.formulaireTvaAnnexes.findOne({
                    where: {
                      id_dossier: Number(dossierId),
                      id_compte: Number(compteId),
                      id_exercice: Number(exerciceId),
                      id_code: Number(codeNum),
                      mois: { [db.Sequelize.Op.is]: null },
                      annee: { [db.Sequelize.Op.is]: null },
                    }
                  });
                  if (placeholder) {
                    await placeholder.update({ mois: mPer, annee: yPer, libelle: lib, montant: Number(amount || 0) });
                    if (debug) console.log('[AUTO-CALC][UNIFIED][CA] reuse placeholder -> period (grp01)', { code: codeNum, mois: mPer, annee: yPer });
                    formRows.push(placeholder);
                    updates.push({ id_code: Number(codeNum), groupe: '01', from: 'journals', montant: Number(amount || 0), reused: true });
                  } else {
                    // 3) Dernier recours: upsert idempotent (protégé par un index unique côté DB si présent)
                    const [rowUp, created] = await db.formulaireTvaAnnexes.upsert(payload, { returning: true });
                    if (debug) console.log('[AUTO-CALC][UNIFIED][CA] upsert row (grp01)', { payload, created });
                    formRows.push(rowUp);
                    updates.push({ id_code: Number(codeNum), groupe: '01', from: 'journals', montant: Number(amount || 0), created: !!created });
                  }
                }
                continue;
              }
            } catch (e) {
              console.warn('[AUTO-CALC][UNIFIED][CA] create missing row failed (grp01):', e?.message || e);
            }
            continue; // si création non faite, ignorer
          }
          const newVal = Number(amount || 0);
          if (Number(row.montant) !== newVal) {
            if (debug) console.log('[AUTO-CALC][UNIFIED][CA] update (grp01)', { id_code: row.id_code, montant: newVal });
            await row.update({ montant: newVal });
            updates.push({ id_code: row.id_code, groupe: '01', from: 'journals', montant: newVal });
          }
        }
      }
    }
  } catch (e) {
    console.error('[AUTO-CALC][UNIFIED][CA] error', e);
  }

    if (debug) console.log('[AUTO-CALC][UNIFIED] done updates', updates.length);
    return { count: updates.length, updates, ...(debug ? { debug: debugMap } : {}) };
  } catch (e) {
    console.error('[AUTO-CALC][UNIFIED] fatal error', e);
    throw e;
  }
}

module.exports = { autoCalcDGE, autoCalcUnified };
