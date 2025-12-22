import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormulaireTvaCollapsibleTable from '../../../componentsTools/tva/table/FormulaireTvaCollapsibleTable';

export default function FormulaireTvaUnified({ fileInfos, fileId, compteId, selectedExerciceId, mois, annee, computeTrigger, refreshCounter, onAnomaliesChange, canView }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anomsLoading, setAnomsLoading] = useState(false);
  const [anomsCount, setAnomsCount] = useState(0);
  const [anomsList, setAnomsList] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [rowsBackup, setRowsBackup] = useState(null);
  const [allowPersist, setAllowPersist] = useState(false);
  const lastComputeTriggerRef = useRef(computeTrigger);
  const lastPeriodRef = useRef({ mois, annee });
  const anomsPersistingRef = useRef(false);
  const lastExerciceRef = useRef(selectedExerciceId);
  const debounceTimerRef = useRef(null);

  const formulas = useMemo(() => ({
    150: [100, 102, 103, 105, 106, 107, 108, 115, 125, 130, 140],
    161: [155, 160],
    170: [100, 102, 103, 105, 106, 107, 108, 130, 140, 161, 165],
    180: [270],
    200: { terms: [{ id: 102, w: 0.05 }] },
    205: { terms: [{ id: 103, w: 0.15 }] },
    210: {
      terms: [
        { id: 105, w: 0.2 },
        { id: 106, w: 0.2 },
        { id: 107, w: 0.2 },
        { id: 108, w: 0.2 },
        { id: 115, w: 0.2 },
        { id: 125, w: 0.2 }
      ]
    },
    274: { terms: [{ id: 271, w: 1 }, { id: 272, w: 1 }, { id: 273, w: -1 }] },
    275: [200, 205, 210, 270, 273],
    310: [300, 305],
    360: [315, 316, 335, 340, 345, 350, 355, 359],

    366: { terms: [{ id: 360, w: 365 }, { id: 338, w: 1 }] },
    368: [320, 330],
    370: { terms: [{ id: 368, w: 365 }] },
    375: [310, 366, 370],
    // Nouvelles formules alignées backend
    400: { terms: [{ id: 375, w: 1 }, { id: 275, w: -1 }] },
    700: {
      terms: [
        { id: 275, w: 1 }, { id: 620, w: 1 },
        { id: 375, w: -1 }, { id: 579, w: -1 }, { id: 589, w: -1 }, { id: 635, w: -1 }, { id: 640, w: -1 }, { id: 660, w: -1 }
      ]
    },
    701: {
      terms: [
        { id: 610, w: 1 }, { id: 400, w: 1 }, { id: 579, w: 1 }, { id: 589, w: 1 }, { id: 640, w: 1 },
        { id: 620, w: -1 }, { id: 630, w: -1 }, { id: 670, w: -1 }
      ]
    },
  }), []);
  const getCurrentFormulas = () => formulas;

  const numberFormatter = React.useMemo(
    () => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    []
  );

  const round2 = (n) => {
    const v = Number(n || 0);
    return Math.round(v * 100) / 100;
  };

  const closeTo = (a, b) => {
    const A = round2(a);
    const B = round2(b);
    const absMax = Math.max(1, Math.abs(A), Math.abs(B));
    const tol = Math.max(0.01, 0.005 * absMax); // 1 centime or 0.5% of magnitude
    return Math.abs(A - B) <= tol;
  };

  // Fetch anomalies from backend and forward count to parent (for badge display)
  const fetchAnomalies = useCallback(async () => {
    if (!fileId || !compteId || !selectedExerciceId || !mois || !annee) {
      setAnomsCount(0);
      setAnomsList([]);
      if (typeof onAnomaliesChange === 'function') onAnomaliesChange({ count: 0, list: [] });
      return;
    }
    try {
      setAnomsLoading(true);
      const url = `/declaration/tva/anomalies/compute`;
      const params = {
        id_dossier: fileId,
        id_compte: compteId,
        id_exercice: selectedExerciceId,
        mois,
        annee,
      };
      const { data } = await axios.get(url, { params });
      let count = Number(data?.count) || 0;
      let list = Array.isArray(data?.list) ? data.list : [];
      // Fallback: si aucune anomalie renvoyée par compute, tenter l'auto-calc avec includeAnoms=true
      if (count === 0) {
        try {
          const autoUrl = `/declaration/tva/formulaire/auto-calc/${fileId}/${compteId}/${selectedExerciceId}`;
          const { data: auto } = await axios.post(autoUrl, { mois, annee, includeAnoms: true });
          const fbCount = Number(auto?.anomalies?.count) || 0;
          const fbList = Array.isArray(auto?.anomalies?.list) ? auto.anomalies.list : [];
          if (fbCount > 0) {
            count = fbCount;
            list = fbList;
          }
        } catch (e) {
          // silencieux: on garde le résultat initial si fallback échoue
        }
      }
      // Persist anomalies to DB for this period
      try {
        // Dédoublonner et normaliser (code, kind) pour respecter l'unicité côté DB
        const seen = new Set();
        const uniqueList = [];
        for (const it of (list || [])) {
          const code = Number(it?.code) || 0;
          let kind = it?.kind != null ? String(it.kind).trim() : '';
          if (kind === '') kind = null; else kind = kind.toLowerCase();
          const key = `${code}::${kind ?? ''}`;
          if (seen.has(key)) continue;
          seen.add(key);
          uniqueList.push({ ...it, code, kind });
        }
        // Ne persister que lorsque explicitement autorisé (évite insertions multiples automatiques)
        if (!allowPersist) {
          // Pas d'écriture DB: on affiche juste le résultat calculé côté UI
        } else if (anomsPersistingRef.current) {
          // Eviter les doublons de requêtes simultanées
          console.warn('[FRONT][ANOMALIES] persistence skipped (in-flight)');
        } else {
          // Comparer avec l'état DB actuel pour cette période; si identique, ne rien écrire
          try {
            const { data: dbData } = await axios.get('/declaration/tva/anomalies', { params });
            const dbListRaw = Array.isArray(dbData?.list) ? dbData.list : (dbData?.list ? [dbData.list] : []);
            const dbSeen = new Set();
            for (const it of dbListRaw) {
              const code = Number(it?.code) || 0;
              let kind = it?.kind != null ? String(it.kind).trim() : '';
              if (kind === '') kind = null; else kind = kind.toLowerCase();
              dbSeen.add(`${code}::${kind ?? ''}`);
            }
            const compSeen = new Set(uniqueList.map(it => `${Number(it.code) || 0}::${(it.kind ?? '').toString().trim().toLowerCase()}`));
            const sameSize = dbSeen.size === compSeen.size;
            let equal = sameSize;
            if (equal) {
              for (const k of compSeen) { if (!dbSeen.has(k)) { equal = false; break; } }
            }
            if (equal) {
              // Rien à persister: déjà à jour
            } else {
              anomsPersistingRef.current = true;
              try {
                if (uniqueList.length > 0) {
                  await axios.put('/declaration/tva/anomalies/replace', {
                    id_dossier: fileId,
                    id_compte: compteId,
                    id_exercice: selectedExerciceId,
                    mois,
                    annee,
                    anomalies: uniqueList,
                  });
                }
              } catch (e) {
                const status = e?.response?.status;
                if (status === 409) {
                  // Conflit d'unicité: récupérer l'état DB existant et l'afficher au lieu d'erreur
                  try {
                    const { data: dbData2 } = await axios.get('/declaration/tva/anomalies', { params });
                    const list2 = Array.isArray(dbData2?.list) ? dbData2.list : [];
                    const cnt2 = Number(dbData2?.count) || list2.length;
                    setAnomsCount(cnt2);
                    setAnomsList(list2);
                    if (typeof onAnomaliesChange === 'function') onAnomaliesChange({ count: cnt2, list: list2 });
                  } catch { }
                } else {
                  console.warn('[FormTVA] persist anomalies failed (non-bloquant)', e);
                }
              } finally {
                anomsPersistingRef.current = false;
              }
            }
          } catch (cmpErr) {
            console.warn('[FormTVA] comparaison anomalies DB échouée, on évite la persistance pour prévenir doublons', cmpErr);
          }
        }
      } catch (e) {
        console.warn('[FormTVA] persist anomalies failed (non-bloquant)', e);
      }
      setAnomsCount(count);
      setAnomsList(list);
      if (typeof onAnomaliesChange === 'function') onAnomaliesChange({ count, list });
    } catch (e) {
      console.error('[FormTVA] anomalies fetch error', e);
      setAnomsCount(0);
      setAnomsList([]);
      if (typeof onAnomaliesChange === 'function') onAnomaliesChange({ count: 0, list: [] });
    } finally {
      setAnomsLoading(false);
    }
  }, [fileId, compteId, selectedExerciceId, mois, annee, onAnomaliesChange]);

  const normalizeFormula = (def) => {
    if (!def) return null;
    if (Array.isArray(def)) return { sources: def, factor: 1 };
    if (typeof def === 'object') {
      if (Array.isArray(def.sources)) return { sources: def.sources, factor: Number(def.factor) || 1 };
      if (Array.isArray(def.terms)) {
        const sources = def.terms.map(t => t?.id).filter(id => typeof id === 'number');
        return { sources, factor: Number(def.factor) || 1, terms: def.terms };
      }
    }
    return null;
  };

  // Detect period change (anomalies disabled)
  useEffect(() => {
    const prev = lastPeriodRef.current || {};
    if (prev.mois !== mois || prev.annee !== annee) {
      setAllowPersist(false);
      lastPeriodRef.current = { mois, annee };
    }
  }, [mois, annee, onAnomaliesChange]);

  // Fetch anomalies whenever the context/period changes
  useEffect(() => {
    if (canView) {
      fetchAnomalies();
    }
  }, [fetchAnomalies]);

  // Fetch form after any context/period trigger changes
  // useEffect(() => {
  //   fetchFormulaire();
  // }, [fileId, compteId, selectedExerciceId, mois, annee, computeTrigger, refreshCounter, fileInfos?.centrefisc]);

  // Enable persistence after an explicit auto-calc trigger (not used)
  useEffect(() => {
    if (computeTrigger !== lastComputeTriggerRef.current) {
      setAllowPersist(true);
      lastComputeTriggerRef.current = computeTrigger;
    }
  }, [computeTrigger]);

  // useEffect(() => {
  //   // rechargement si computeTrigger a changé
  //   if (computeTrigger !== lastComputeTriggerRef.current) {
  //     lastComputeTriggerRef.current = computeTrigger;
  //     reloadFormRows(); // appelle ici ta fonction qui get les lignes du formulaire et setRows(...)
  //     return;
  //   }
  //   // rechargement si la période change
  //   if (mois !== lastPeriodRef.current.mois || annee !== lastPeriodRef.current.annee) {
  //     lastPeriodRef.current = { mois, annee };
  //     reloadFormRows();
  //   }
  // }, [computeTrigger, mois, annee]);

  async function reloadFormRows() {
    try {
      setLoading(true);
      // Recharger le formulaire et les anomalies pour la période courante
      await fetchFormulaire();
      await fetchAnomalies();
    } finally {
      setLoading(false);
    }
  }

  const applyFormulas = (rws) => {
    if (!Array.isArray(rws)) return [];

    let currentRows = [...rws];
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 5; // Éviter les boucles infinies

    // 🔁 Répéter les calculs jusqu'à ce qu'il n'y ait plus de changements (calculs en cascade)
    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      iterations++;

      const byId = new Map(currentRows.map(r => [r.id, r]));
      const newRows = currentRows.map(r => {
        const def = getCurrentFormulas()[r.id];
        const norm = normalizeFormula(def);

        if (norm && Array.isArray(norm.sources) && norm.sources.length > 0) {
          let sum = 0;
          if (Array.isArray(norm.terms)) {
            sum = norm.terms.reduce((acc, t) => acc + ((Number(byId.get(t.id)?.montant) || 0) * (Number(t.w) || 0)), 0);
          } else {
            sum = norm.sources.reduce((acc, sid) => acc + (Number(byId.get(sid)?.montant) || 0), 0);
          }
          const value = sum * (norm.factor || 1);

          // ✅ Vérifier si la valeur a changé
          if (Math.abs(value - (r.montant || 0)) > 0.01) {
            hasChanges = true;
          }

          return { ...r, montant: value, _computed: true };
        }
        return { ...r, _computed: false };
      });

      currentRows = newRows;
    }

    return currentRows;
  };

  const fetchFormulaire = async () => {
    if (!fileId || !compteId || !selectedExerciceId) return;
    // Ne pas appeler le backend tant que la période n'est pas définie
    if (!mois || !annee) {
      return;
    }
    try {
      setLoading(true);
      const url = `/declaration/tva/formulaire/${fileId}/${compteId}/${selectedExerciceId}`;
      try { console.log('[FRONT][FORM LIST] url:', url, 'params:', { mois, annee }); } catch { }
      const { data } = await axios.get(url, { params: { mois, annee } });
      if (data?.state) {
        let list = Array.isArray(data.list) ? data.list : (data.list ? [data.list] : []);
        if (!list || list.length === 0) {
          try {
            const initUrl = `/declaration/tva/formulaire/initialize/${fileId}/${compteId}/${selectedExerciceId}`;
            try { console.log('[FRONT][FORM INIT] url:', initUrl, 'params:', { mois, annee }); } catch { }
            await axios.post(initUrl, null, { params: { mois, annee } });
            try { console.log('[FRONT][FORM LIST-RELOAD] url:', url, 'params:', { mois, annee }); } catch { }
            const { data: data2 } = await axios.get(url, { params: { mois, annee } });
            list = data2?.state ? (Array.isArray(data2.list) ? data2.list : (data2.list ? [data2.list] : [])) : [];
          } catch (err) {
            console.error('[FormTVA] init error', err);
            const msg = err?.response?.data?.msg || err?.message;
            if (err?.response?.status === 400 && /hors bornes/i.test(String(msg))) {
              toast.error('Période sélectionnée hors bornes de l\'exercice. Merci de choisir un mois/année valides.');
            } else {
              toast.error('Initialisation du formulaire de déclaration du TVA impossible');
            }
            list = [];
          }
        }
        // On conserve le plus récent via updatedAt si disponible
        const sorted = [...(list || [])].sort((a, b) => {
          const aCode = Number(a.id_code) || 0;
          const bCode = Number(b.id_code) || 0;
          const byCode = aCode - bCode;
          if (byCode !== 0) return byCode;
          const aUpd = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpd = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bUpd - aUpd; // plus récent d'abord
        });
        const seenCodes = new Set();
        const deduped = [];
        for (const it of sorted) {
          const code = Number(it.id_code) || 0;
          if (seenCodes.has(code)) continue;
          seenCodes.add(code);
          deduped.push(it);
        }
        const mapped = (deduped || []).map(r => ({
          id: Number(r.id_code),
          libelle: r.libelle,
          montant: Number(r.montant) || 0,
          groupe: r.groupe || null,
        }));
        const computed = applyFormulas(mapped);
        setRows(computed);
      } else {
        setRows([]);
        toast.error(data?.msg || 'Erreur chargement données');
      }
    } catch (e) {
      console.error('[FormTVA] fetch error', e);
      toast.error('Erreur serveur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce les chargements pour laisser le temps à mois/annee de se mettre à jour après un changement d'exercice
    if (canView) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      debounceTimerRef.current = setTimeout(() => {
        // Si paramètres manquants, on ne tente rien
        if (!fileId || !compteId || !selectedExerciceId || !mois || !annee) return;
        // Lancer les chargements
        (async () => {
          setLoading(true);
          try {
            await fetchFormulaire();
            await fetchAnomalies();
          } finally {
            setLoading(false);
          }
        })();
      }, 250);
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      };
    }
  }, [fileInfos?.centrefisc, fileId, compteId, selectedExerciceId, mois, annee, computeTrigger, refreshCounter]);


  const onModify = (row) => {
    const formulas = getCurrentFormulas();
    const def = formulas[row?.id];
    const isComputed = Array.isArray(def) || (def && typeof def === 'object');
    if (row && isComputed) {
      toast.error('Cette ligne est calculée automatiquement');
      return;
    }
    setRowsBackup(rows.map(r => ({ ...r })));
    setEditRowId(row?.id ?? null);
    setEditRowData(row ? { ...row } : {});
  };

  // --- Lorsqu'on modifie une ligne ---
  const onEditChange = (field, value) => {
    setEditRowData(prev => ({ ...prev, [field]: value }));

    if (field === 'montant' && editRowId) {
      const num = parseFloat(value);
      const safe = isNaN(num) ? 0 : num;

      setRows(prev => {
        // Met à jour la ligne modifiée
        const updatedRows = prev.map(r =>
          r.id === editRowId ? { ...r, montant: safe } : r
        );

        // 🔁 Recalcule immédiatement toutes les lignes dépendantes (400, 700, 701, etc.)
        const recomputed = applyFormulas(updatedRows);

        return recomputed;
      });
    }
  };

  const onEditSave = async () => {
    if (!editRowId) return;
    const newVal = parseFloat(editRowData.montant);
    const safeVal = isNaN(newVal) ? 0 : newVal;

    try {
      const payload = {
        id_dossier: fileId,
        id_compte: compteId,
        id_exercice: selectedExerciceId,
        montant: safeVal,
        mois,
        annee,
      };

      const { data } = await axios.put(`/declaration/tva/formulaire/${editRowId}`, payload);

      if (data?.state) {
        toast.success('Montant mis à jour');

        setRows(prev => {
          // Mise à jour immédiate côté client
          const updatedRows = prev.map(r =>
            r.id === editRowId ? { ...r, montant: safeVal } : r
          );

          // 🔁 Recalcule toutes les lignes dépendantes
          const recomputed = applyFormulas(updatedRows);

          return recomputed;
        });

        setEditRowId(null);
        setEditRowData({});
        setRowsBackup(null);

        // ⏳ Petit délai avant de refetch le formulaire complet
        setTimeout(async () => {
          try {
            await reloadFormRows(); // fetchFormulaire + fetchAnomalies
          } catch (err) {
            console.error('[FormTVA] reload after save failed', err);
          }
        }, 500); // 500ms, tu peux ajuster selon ton serveur

      } else {
        toast.error(data?.msg || 'Échec mise à jour');
      }
    } catch (e) {
      console.error('[FormTVA] update error', e);
      toast.error('Erreur serveur lors de la mise à jour');
    }
  };


  const onEditCancel = () => {
    if (rowsBackup) setRows(rowsBackup);
    setRowsBackup(null);
    setEditRowId(null);
    setEditRowData({});
  };

  if (!fileInfos || !fileInfos.centrefisc) return null;

  if (fileInfos.centrefisc === 'CFISC') {
    return (
      <Stack spacing={2}>
        <Typography variant='h6'>Formulaire de déclaration du TVA - Modèle Centre fiscal</Typography>
        <FormulaireTvaCollapsibleTable
          rows={rows}
          fileId={fileId}
          compteId={compteId}
          selectedExerciceId={selectedExerciceId}
          mois={mois}
          annee={annee}
          editRowId={editRowId}
          editRowData={editRowData}
          onModify={onModify}
          onEditChange={onEditChange}
          onEditSave={onEditSave}
          onEditCancel={onEditCancel}
        />
      </Stack>
    );
  }

  // DGE grouped rendering
  const groups = [
    { code: '01', title: "01 DETERMINATION DU CHIFFRE D'AFFAIRES" },
    { code: '02', title: '02 TVA COLLECTEE' },
    { code: '03', title: '03 TVA DEDUCTIBLE' },
    { code: '04', title: '04 CREDITS ET REGULARISATION' },
    { code: '05', title: '05 SYNTHESE' },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant='h6'>Formulaire de déclaration du TVA - Modèle DGE</Typography>
      {groups.map(group => {
        const groupRows = (rows || []).filter(r => r?.groupe === group.code);
        if (!groupRows || groupRows.length === 0) return null;
        return (
          <Box key={group.code} sx={{ width: '100%' }}>
            <Box sx={{ width: '100%', backgroundColor: '#d4edda', color: '#155724', px: 1.5, py: 0.75, borderRadius: 1, fontWeight: 600, mb: 1 }}>
              {group.title}
            </Box>
            <Box sx={{ width: '100%' }}>
              <FormulaireTvaCollapsibleTable
                rows={groupRows}
                fileId={fileId}
                compteId={compteId}
                selectedExerciceId={selectedExerciceId}
                mois={mois}
                annee={annee}
                editRowId={editRowId}
                editRowData={editRowData}
                onModify={onModify}
                onEditChange={onEditChange}
                onEditSave={onEditSave}
                onEditCancel={onEditCancel}
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
