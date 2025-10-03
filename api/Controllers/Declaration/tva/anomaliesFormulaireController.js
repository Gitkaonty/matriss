const db = require('../../../Models');

// Helpers
const parseNullableInt = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toBool = (v) => v === true || v === 1 || v === '1' || v === 'true' || v === 'TRUE';

// Recalcule nbranomalie pour une période (compte/dossier/exercice/mois/annee) en se basant sur valide=false
async function recomputeEtatNbrAnomalie({ id_dossier, id_compte, id_exercice, mois, annee }, t) {
  const whereCtx = { id_dossier, id_compte, id_exercice, mois, annee };
  const countInvalid = await db.anomaliesFormulaireTva.count({ where: { ...whereCtx, valide: false }, transaction: t });
  const code = 'TVA';
  const nom = 'TVA';
  // Utiliser findOne + update/create pour éviter les erreurs "multiple rows" de findOrCreate
  const exist = await db.etatsdeclarations.findOne({ where: { ...whereCtx, code }, transaction: t });
  if (exist) {
    await exist.update({ nbranomalie: countInvalid }, { transaction: t });
  } else {
    await db.etatsdeclarations.create({ ...whereCtx, code, nom, valide: false, nbranomalie: countInvalid }, { transaction: t });
  }
  return countInvalid;
}

// GET /declaration/tva/anomalies
exports.listAnomalies = async (req, res) => {
  try {
    const { id_dossier, id_compte, id_exercice } = req.query || {};
    const mois = parseNullableInt(req.query?.mois);
    const annee = parseNullableInt(req.query?.annee);

    if (!id_dossier || !id_compte || !id_exercice) {
      return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
    }

    const where = {
      id_dossier: Number(id_dossier),
      id_compte: Number(id_compte),
      id_exercice: Number(id_exercice),
      mois,
      annee,
    };

    const rows = await db.anomaliesFormulaireTva.findAll({
      where,
      order: [['code', 'ASC'], ['kind', 'ASC'], ['id', 'ASC']],
    });
    return res.json({ state: true, list: rows, count: rows.length });
  } catch (e) {
    console.error('[TVA][ANOMALIES][LIST] error:', e);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', list: [] });
  }
};


exports.replaceAnomalies = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id_dossier, id_compte, id_exercice, mois, annee, anomalies } = req.body || {};
    if (!id_dossier || !id_compte || !id_exercice || anomalies === undefined) {
      await t.rollback();
      return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
    }
    if (!Array.isArray(anomalies)) {
      await t.rollback();
      return res.status(400).json({ state: false, msg: 'anomalies doit être un tableau' });
    }

    const ctx = {
      id_dossier: Number(id_dossier),
      id_compte: Number(id_compte),
      id_exercice: Number(id_exercice),
      mois: parseNullableInt(mois),
      annee: parseNullableInt(annee),
    };

    // Normaliser et dédupliquer (kind null vs '' vs espaces)
    const payload = [];
    const seen = new Set();
    const suppressed = [];
    for (const it of anomalies) {
      const code = Number(it.code) || 0;
      let kind = it?.kind != null ? String(it.kind).trim() : null;
      if (kind === '') kind = null;
      if (kind) kind = kind.toLowerCase();
      const key = `${code}::${kind ?? ''}`;
      if (seen.has(key)) { suppressed.push(key); continue; }
      seen.add(key);
      payload.push({
        id_dossier: ctx.id_dossier,
        id_compte: ctx.id_compte,
        id_exercice: ctx.id_exercice,
        mois: ctx.mois,
        annee: ctx.annee,
        code,
        kind,
        groupe: it?.groupe || null,
        expected: Number(it?.expected) || 0,
        actual: Number(it?.actual) || 0,
        diff: Number(it?.diff) || 0,
        message: it?.message || null,
        commentaire: it?.commentaire || null,
        valide: toBool(it?.valide) || false,
      });
    }

    // Remplacement dur: supprimer toutes les anomalies de la période puis insérer le payload
    await db.anomaliesFormulaireTva.destroy({ where: ctx, transaction: t });
    if (payload.length > 0) {
      try {
        await db.anomaliesFormulaireTva.bulkCreate(payload, { transaction: t });
      } catch (e) {
        if (String(e?.message || '').includes('uq_anom_ctx_code_kind')) {
          await t.rollback();
          console.error('[TVA][ANOMALIES][UPSERT] unique conflict payload keys:', payload.map(r => `${r.code}::${r.kind ?? ''}`));
          return res.status(409).json({ state: false, msg: 'Conflit d\'unicité anomalies (code/kind) pour la période', error: 'uq_anom_ctx_code_kind', suppressed });
        }
        throw e;
      }
    }

    // Recompute total anomalies pour la période
    const countInvalid = await recomputeEtatNbrAnomalie(ctx, t);

    await t.commit();
    return res.json({ state: true, msg: 'Anomalies enregistrées', count: payload.length, invalid: countInvalid });
  } catch (e) {
    await t.rollback();
    console.error('[TVA][ANOMALIES][UPSERT] error:', e);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: String(e?.message || e) });
  }
};

exports.updateAnomalieByKey = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      id_dossier, id_compte, id_exercice, mois, annee,
      code, kind,
      commentaire, valide,
    } = req.body || {};

    if (!id_dossier || !id_compte || !id_exercice || code === undefined) {
      await t.rollback();
      return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
    }

    const where = {
      id_dossier: Number(id_dossier),
      id_compte: Number(id_compte),
      id_exercice: Number(id_exercice),
      mois: parseNullableInt(mois),
      annee: parseNullableInt(annee),
      code: Number(code),
      kind: kind ? String(kind) : null,
    };

    const row = await db.anomaliesFormulaireTva.findOne({ where, transaction: t });
    if (!row) {
      await t.rollback();
      return res.json({ state: false, msg: 'Anomalie introuvable' });
    }

    const updates = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'commentaire')) updates.commentaire = commentaire ?? null;
    if (Object.prototype.hasOwnProperty.call(req.body, 'valide')) updates.valide = toBool(valide);

    await row.update(updates, { transaction: t });

    // ✅ Recalcul uniquement si valide a changé
    let invalid = 0;
    if ('valide' in updates) {
      const ctx = {
        id_dossier: row.id_dossier,
        id_compte: row.id_compte,
        id_exercice: row.id_exercice,
        mois: row.mois,
        annee: row.annee,
      };
      invalid = await recomputeEtatNbrAnomalie(ctx, t);
    }

    const refreshed = await db.anomaliesFormulaireTva.findByPk(row.id, { transaction: t });
    await t.commit();
    return res.json({ state: true, item: refreshed, invalid });
  } catch (e) {
    await t.rollback();
    console.error('[TVA][ANOMALIES][PATCH BY KEY] error:', e);
    return res.status(500).json({ state: false, msg: 'Erreur serveur' });
  }
};


// PATCH /declaration/tva/anomalies/:id
exports.updateAnomalie = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const id = Number(req.params?.id);
    if (!Number.isFinite(id)) {
      await t.rollback();
      return res.status(400).json({ state: false, msg: 'ID invalide' });
    }

    const row = await db.anomaliesFormulaireTva.findByPk(id, { transaction: t });
    if (!row) {
      await t.rollback();
      return res.json({ state: false, msg: 'Anomalie introuvable' });
    }

    const payload = {};
    if ('commentaire' in req.body) payload.commentaire = req.body.commentaire ?? null;
    if ('valide' in req.body) payload.valide = toBool(req.body.valide);

    if (Object.keys(payload).length === 0) {
      await t.rollback();
      return res.status(400).json({ state: false, msg: 'Aucun champ à mettre à jour' });
    }

    await db.anomaliesFormulaireTva.update(payload, { where: { id }, transaction: t });

    // ✅ Recalcul uniquement si valide a changé
    let invalid = 0;
    if ('valide' in payload) {
      const ctx = {
        id_dossier: row.id_dossier,
        id_compte: row.id_compte,
        id_exercice: row.id_exercice,
        mois: row.mois,
        annee: row.annee,
      };
      invalid = await recomputeEtatNbrAnomalie(ctx, t);
    }

    const updated = await db.anomaliesFormulaireTva.findByPk(id, { transaction: t });
    await t.commit();
    return res.json({ state: true, item: updated, invalid });
  } catch (e) {
    await t.rollback();
    console.error('[TVA][ANOMALIES][PATCH] error:', e);
    return res.status(500).json({ state: false, msg: 'Erreur serveur' });
  }
};


// DELETE /declaration/tva/anomalies (par période)
exports.clearAnomalies = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id_dossier, id_compte, id_exercice } = req.query || {};
    const mois = parseNullableInt(req.query?.mois);
    const annee = parseNullableInt(req.query?.annee);
    if (!id_dossier || !id_compte || !id_exercice) {
      await t.rollback();
      return res.status(400).json({ state: false, msg: 'Paramètres manquants' });
    }
    const ctx = {
      id_dossier: Number(id_dossier),
      id_compte: Number(id_compte),
      id_exercice: Number(id_exercice),
      mois,
      annee,
    };
    await db.anomaliesFormulaireTva.destroy({ where: ctx, transaction: t });
    const invalid = await recomputeEtatNbrAnomalie(ctx, t);
    await t.commit();
    return res.json({ state: true, msg: 'Anomalies supprimées', invalid });
  } catch (e) {
    await t.rollback();
    console.error('[TVA][ANOMALIES][DELETE] error:', e);
    return res.status(500).json({ state: false, msg: 'Erreur serveur' });
  }
};

