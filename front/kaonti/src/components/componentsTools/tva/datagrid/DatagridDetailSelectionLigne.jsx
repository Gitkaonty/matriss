import React, { useState, useEffect } from 'react';
import { Autocomplete, Button, FormControl, Stack, TextField, Tooltip } from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import { DataGridStyle } from '../../DatagridToolsStyle.jsx';
import QuickFilter from '../../DatagridToolsStyle.jsx';
import { init } from '../../../../../init.js';

import getTvaDetailEcritureAssocieColumns from './getTvaDetailEcritureAssocieColumns.jsx';
import axios from '../../../../../config/axios.js';

import { GrPrevious } from 'react-icons/gr';
import { GrNext } from 'react-icons/gr';
import { IoMdRemoveCircleOutline } from 'react-icons/io';
import { FaRegCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useAxiosPrivate from '../../../../../config/axiosPrivate.js';

const initial = init[0];

const DatagridDetailSelectionLigne = ({ DATAGRID_HEIGHT = '500px', valSelectMois, valSelectAnnee, compteId, selectedExerciceId, fileId, canModify, canAdd, canDelete, canView }) => {
  const axiosPrivate = useAxiosPrivate();
  const [selectedDetailRows, setSelectedDetailRows] = useState([]);
  const [listSaisie, setListSaisie] = useState([]);
  const [listePlanComptable, setListePlanComptable] = useState([]);
  const [listeComptesTvaParam, setListeComptesTvaParam] = useState([]);
  const [filteredList, setFilteredList] = useState(null);

  const [listSaiseSansIsi, setListSaisieSansIsi] = useState([]);
  const [openPopupShowListSaisieSansIsi, setOpenPopupShowListSaisieSansIsi] = useState(false);
  

  const [isEcritureAssocieRefreshed, setIsEcritureAssocieRefreshed] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const hasDecltvaTrue = selectedDetailRows.some(id => {
    const row = listSaisie.find(item => item.id === id);
    return row?.decltva === true;
  });

  const hasDecltvaFalse = selectedDetailRows.some(id => {
    const row = listSaisie.find(item => item.id === id);
    return row?.decltva === false;
  });

  const [valSelectedCompte, setValSelectedCompte] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('valSelectedCompteTVA') || 'tout';
    }
    return 'tout';
  });

  const getJournalsSelectionLigne = () => {
    axios
      .get(`/declaration/tva/selectionLigne/${compteId}/${fileId}/${selectedExerciceId}`, {
        params: {
          mois: Number(valSelectMois),
          annee: Number(valSelectAnnee),
        },
      })
      .then(response => {
        const resData = response.data;
        let rows = Array.isArray(resData?.list) ? resData.list : [];

        // Tri par défaut par date d'écriture croissante
        rows = [...rows].sort((a, b) => {
          const da = a.dateecriture ? new Date(a.dateecriture) : null;
          const db = b.dateecriture ? new Date(b.dateecriture) : null;
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return da - db;
        });
      try { console.debug('[TVA][DETAIL] filteredPc after join =', filteredPc.length); } catch {}

        setListSaisie(rows);
      });
  };

  const getPc = async () => {
    if (!fileId) return;
    try {
      let pcRes = null;
      const paramReq = axios.get(`/paramTva/listeParamTva/${fileId}`);
      if (compteId) {
        pcRes = await axios.get(`/declaration/tva/recupPcClasseSix/${compteId}/${fileId}`);
      }
      const paramRes = await paramReq;

      let listePc = [];
      if (pcRes) {
        const pcData = pcRes.data;
        if (!pcData?.state) {
          toast.error(pcData?.msg || 'Erreur lors du chargement du plan comptable');
        } else {
          listePc = Array.isArray(pcData.liste) ? pcData.liste : (pcData.liste ? [pcData.liste] : []);
        }
      }

      try { console.debug('[TVA][DETAIL] listePc count =', listePc.length, 'sample =', listePc[0]); } catch {}

      const paramRaw = paramRes?.data?.list || [];
      const paramList = Array.isArray(paramRaw) ? paramRaw : (paramRaw ? [paramRaw] : []);
      setListeComptesTvaParam(paramList);
      try { console.debug('[TVA][DETAIL] paramList count =', paramList.length, 'sample =', paramList[0]); } catch {}

      // Helper: normaliser un numéro de compte (garde les chiffres uniquement)
      const norm = (v) => {
        const s = (v ?? '').toString().trim();
        const onlyDigits = s.replace(/\D+/g, '');
        return onlyDigits || s; // si pas de chiffres, garder tel quel
      };

      // Ne garder que les comptes qui ont un code TVA paramétré.
      // On se base sur le numéro de compte (champ "compte") pour faire la jointure,
      // car les IDs internes peuvent être différents entre le plan comptable et le paramétrage TVA.
      const comptesAvecTva = new Set(
        paramList
          .map(r => norm(
            r.compte
            || r.cptcompta
            || r["dossierplancomptable.compte"]
            || r.num_compte
            || r.numero_compte
            || r.cpt
          ))
          .filter(c => c && c !== '')
      );

      // Ajouter les comptes liés éventuels déclarés dans le paramétrage
      for (const r of paramList) {
        const maybeArrays = [r.comptes_lies, r.comptesLies, r.linked_accounts, r.comptes_associes];
        for (const arr of maybeArrays) {
          if (Array.isArray(arr)) {
            for (const v of arr) {
              const c = norm(v);
              if (c) comptesAvecTva.add(c);
            }
          }
        }
        const maybeScalars = [r.compte_lie, r.compteLie, r.associe_compte];
        for (const v of maybeScalars) {
          const c = norm(v);
          if (c) comptesAvecTva.add(c);
        }
        const maybeCsv = r.comptes_lies_str || r.comptesLiesStr;
        if (typeof maybeCsv === 'string') {
          for (const part of maybeCsv.split(',')) {
            const c = norm(part);
            if (c) comptesAvecTva.add(c);
          }
        }
      }

      let filteredPc = listePc.filter(pc => {
        const cNorm = norm(pc.compte);
        if (!cNorm) return false;
        if (comptesAvecTva.has(cNorm)) return true;
        // fallback: startsWith si param utilise comptes racines
        for (const ref of comptesAvecTva) {
          if (cNorm.startsWith(ref) || ref.startsWith(cNorm)) return true;
        }
        // fallback: par id si disponible
        const idMatch = paramList.some(r => Number(r.id_cptcompta) === Number(pc.id));
        return idMatch;
      });

      // Dédupliquer au cas où
      const seen = new Set();
      filteredPc = filteredPc.filter(pc => {
        const key = String(pc.id) + '|' + norm(pc.compte);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (filteredPc.length === 0 && paramList.length > 0) {
        // Fallback: construire des options depuis les paramètres TVA
        const fallbackOpts = [];
        const seenKey = new Set();
        for (const p of paramList) {
          const acc = (p["dossierplancomptable.compte"] || p.compte || p.cptcompta || '').toString().trim();
          if (!acc) continue;
          const idCpt = Number(p.id_cptcompta);
          const key = (Number.isFinite(idCpt) && idCpt > 0) ? `id-${idCpt}` : `acc-${acc}`;
          if (seenKey.has(key)) continue;
          seenKey.add(key);
          const label = (p["dossierplancomptable.libelle"] || p.libelle || p["listecodetva.libelle"] || p.codedescription || '').toString();
          fallbackOpts.push({ id: Number.isFinite(idCpt) && idCpt > 0 ? idCpt : `param-${acc}`, compte: acc, libelle: label });
          // inclure aussi les comptes liés éventuels
          const linked = [];
          if (Array.isArray(p.comptes_lies)) linked.push(...p.comptes_lies);
          if (Array.isArray(p.comptesLies)) linked.push(...p.comptesLies);
          const csv = p.comptes_lies_str || p.comptesLiesStr;
          if (typeof csv === 'string') linked.push(...csv.split(','));
          for (const v of linked) {
            const acc2 = (v || '').toString().trim();
            if (!acc2) continue;
            const key2 = `acc-${acc2}`;
            if (seenKey.has(key2)) continue;
            seenKey.add(key2);
            fallbackOpts.push({ id: `param-${acc2}`, compte: acc2, libelle: label });
          }
        }
        try { console.debug('[TVA][DETAIL] fallbackOpts count =', fallbackOpts.length, 'sample =', fallbackOpts[0]); } catch {}
        if (fallbackOpts.length > 0) {
          setListePlanComptable(fallbackOpts);
        } else {
          // Fallback #2: filtrer les comptes du PC qui ressemblent à des comptes TVA (ex: 445*)
          const tvaLike = listePc.filter(pc => {
            const c = (pc.compte || '').toString();
            const lib = (pc.libelle || '').toString().toUpperCase();
            return c.startsWith('445') || lib.includes('TVA');
          });
          try { console.debug('[TVA][DETAIL] tvaLike from PC =', tvaLike.length); } catch {}
          setListePlanComptable(tvaLike);
        }
      } else {
        setListePlanComptable(filteredPc);
      }
    } catch (e) {
      console.error('[TVA] getPc (plan comptable + param TVA) error', e);
      toast.error('Erreur lors du chargement des comptes TVA');
      setListePlanComptable([]);
      setListeComptesTvaParam([]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = listePlanComptable.findIndex(item => item.id === Number(valSelectedCompte));
    if (currentIndex > 0) {
      setValSelectedCompte(listePlanComptable[currentIndex - 1].id);
    } else if (currentIndex === 0) {
      setValSelectedCompte('tout');
    }
  };

  const handleNext = () => {
    const currentIndex = listePlanComptable.findIndex(item => item.id === Number(valSelectedCompte));
    if (currentIndex < listePlanComptable.length - 1) {
      setValSelectedCompte(listePlanComptable[currentIndex + 1].id);
    }
  };

  const handleSearch = () => {
    // Base : soit toutes les lignes, soit filtrées par compte sélectionné
    let base = listSaisie || [];

    if (valSelectedCompte && valSelectedCompte !== 'tout') {
      const compteSelect = listePlanComptable.find(item => item.id === Number(valSelectedCompte));
      if (!compteSelect) {
        setFilteredList([]);
        return;
      }
      base = base.filter(item => item.compte?.toString().includes(compteSelect.compte.toString()));
    }

    // Filtre supplémentaire selon le mois sélectionné et decltva === false
    const moisSelect = Number(valSelectMois);
    const anneeSelect = Number(valSelectAnnee);

    const endOfSelectedMonth = new Date(anneeSelect, moisSelect, 0); // dernier jour du mois sélectionné

    const filtered = base.filter(item => {
      // 1) Lignes déjà déclarées :
      //    -> visibles UNIQUEMENT dans le mois/année où elles ont été déclarées
      if (item.decltva === true) {
        const moisDecl = Number(item.decltvamois);
        const anneeDecl = Number(item.decltvaannee);
        return moisDecl === moisSelect && anneeDecl === anneeSelect;
      }

      // 2) Lignes non déclarées :
      //    -> visibles pour tous les mois dont la date d'écriture est <= fin du mois sélectionné
      if (!item.dateecriture) return false;
      const d = new Date(item.dateecriture);
      if (Number.isNaN(d.getTime())) return false;

      return d <= endOfSelectedMonth;
    });

    setFilteredList(filtered);
  };

  const updateAnneeMois = (type) => {
    if (type === 'Ajouter') {
        axiosPrivate.put(`/declaration/tva/ajoutMoisAnnee`, {
            id_compte: Number(compteId),
            id_exercice: Number(selectedExerciceId),
            id_dossier: Number(fileId),
            selectedDetailRows,
            decltvamois: valSelectMois,
            decltvaannee: valSelectAnnee,
            decltva: true,
        }).then((response) => {
            const data = response?.data;

            if (!data) return toast.error("Aucune réponse du serveur");

            if (data.state) {
                if (data.message === 'Compte TVA non trouvé à chacune des lignes') {
                    toast.error(data.message);
                } else {
                    toast.success(data.message);
                    // MAJ optimiste des lignes: marquer comme déclarées pour la période
                    {
                      const selectedIds = new Set((selectedDetailRows || []).map(x => Number(x)));
                      setListSaisie(prev => (prev || []).map(r =>
                      (selectedIds.has(Number(r.id))
                        ? { ...r, decltva: true, decltvamois: Number(valSelectMois), decltvaannee: Number(valSelectAnnee) }
                        : r)
                      ));
                      if (filteredList) {
                        setFilteredList(prev => (prev || []).map(r =>
                        (selectedIds.has(Number(r.id))
                          ? { ...r, decltva: true, decltvamois: Number(valSelectMois), decltvaannee: Number(valSelectAnnee) }
                          : r)
                        ));
                      }
                    }
                    setSelectedDetailRows([]);
                    setRefreshTick(t => t + 1);
                }
                // Rafraîchir immédiatement la liste sans changer de page
                getJournalsSelectionLigne();

            } else {
                toast.error(data.message || "Erreur inconnue");
            }
        }).catch(err => {
            console.error(err);
            toast.error("Erreur lors de la requête");
        });
    } else {
        axiosPrivate.put(`/declaration/tva/supprimerMoisAnnee`, {
            id_compte: Number(compteId),
            id_exercice: Number(selectedExerciceId),
            id_dossier: Number(fileId),
            selectedDetailRows: selectedDetailRows,
            decltvamois: valSelectMois,
            decltvaannee: valSelectAnnee,
            decltva: false
        }).then((response) => {
            if (response?.data?.state) {
                toast.success(response?.data?.message);
                // MAJ optimiste des lignes: marquer comme non déclarées
                {
                  const selectedIds = new Set((selectedDetailRows || []).map(x => Number(x)));
                  setListSaisie(prev => (prev || []).map(r =>
                  (selectedIds.has(Number(r.id))
                    ? { ...r, decltva: false, decltvamois: null, decltvaannee: null }
                    : r)
                  ));
                  if (filteredList) {
                    setFilteredList(prev => (prev || []).map(r =>
                    (selectedIds.has(Number(r.id))
                      ? { ...r, decltva: false, decltvamois: null, decltvaannee: null }
                      : r)
                    ));
                  }
                }
                setSelectedDetailRows([]);
                setRefreshTick(t => t + 1);
                // Rafraîchir immédiatement la liste sans changer de page
                getJournalsSelectionLigne();
            } else {
                toast.error(response?.data?.message);
            }
        })
    }
}
 
  const handleCloseDialogShowListSaisieSansIsi = () => {
    setOpenPopupShowListSaisieSansIsi(false);
    setSelectedDetailRows([]);
  };

  useEffect(() => {
    if(canView){
      getJournalsSelectionLigne();
    }
  }, [compteId, fileId, selectedExerciceId, valSelectMois, valSelectAnnee]);

  useEffect(() => {
    if (isEcritureAssocieRefreshed && canView) {
      getJournalsSelectionLigne();
    }
  }, [isEcritureAssocieRefreshed]);

  useEffect(() => {
   if(canView){
     getPc();
   }
  }, [fileId, compteId]);

  useEffect(() => {
    if(canView){
      handleSearch();
    }
  }, [valSelectedCompte, listSaisie]);

  useEffect(() => {
    if (canView) {
      const handleKeyDown = e => {
        if (e.ctrlKey && e.key === 'ArrowRight') {
          handleNext();
        } else if (e.ctrlKey && e.key === 'ArrowLeft') {
          handlePrevious();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [listePlanComptable, valSelectedCompte, isEcritureAssocieRefreshed]);

  useEffect(() => {
    if (valSelectedCompte) {
      localStorage.setItem('valSelectedCompteTVA', valSelectedCompte);
    }
  }, [valSelectedCompte]);

  return (
    <>
      <Stack width={'100%'} height={'100%'} alignItems={'flex-start'} alignContent={'flex-start'} justifyContent={'stretch'}>
        <Stack
          width={'100%'}
          paddingLeft={'5px'}
          alignItems={'left'}
          alignContent={'center'}
          direction={'row'}
          justifyContent={'space-between'}
          style={{
            marginLeft: '0px',
            backgroundColor: '#F4F9F9',
            borderRadius: '5px',
          }}
        >
          <FormControl variant="standard">
            <Stack direction={'row'} alignContent={'center'}>
              <Stack sx={{ width: 500, mr: 2 }}>
                <Autocomplete
                  value={listePlanComptable.find(item => item.id === Number(valSelectedCompte)) || null}
                  onChange={(event, newValue) => {
                    setValSelectedCompte(newValue?.id || 'tout');
                  }}
                  options={listePlanComptable}
                  getOptionLabel={option => `${option.compte || ''} - ${option.libelle || ''}`}
                  renderInput={params => <TextField {...params} label="Compte" variant="standard" />}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText="Aucun compte disponible"
                />
              </Stack>
              <Stack direction="row" alignItems="center" height="100%" spacing={1} sx={{ flex: 1 }}>
                <Tooltip title="Ctrl + < -">
                  <span>
                    <Button
                      disabled={valSelectedCompte === 'tout'}
                      sx={{
                        minWidth: 0,
                        padding: 1,
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: 'transparent' },
                        '&:focus': { outline: 'none', backgroundColor: 'transparent', boxShadow: 'none' },
                        '&:active': { backgroundColor: 'transparent', boxShadow: 'none' },
                      }}
                      onClick={handlePrevious}
                    >
                      <GrPrevious color="gray" size={20} />
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Ctrl + - >">
                  <span>
                    <Button
                      disabled={listePlanComptable.findIndex(item => item.id === valSelectedCompte) >= listePlanComptable.length - 1}
                      sx={{
                        minWidth: 0,
                        padding: 1,
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: 'transparent' },
                        '&:focus': { outline: 'none', backgroundColor: 'transparent', boxShadow: 'none' },
                        '&:active': { backgroundColor: 'transparent', boxShadow: 'none' },
                      }}
                      onClick={handleNext}
                    >
                      <GrNext color="gray" size={20} />
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </FormControl>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5} sx={{ borderRadius: '5px' }} style={{ marginLeft: '0px', borderRadius: '5px' }}>
            <Tooltip title="Ajouter le mois et l'année sélectionnés">
              <span>
                <Button
                  variant="contained"
                  disabled={!canAdd||selectedDetailRows.length === 0 || hasDecltvaTrue}
                  style={{ textTransform: 'none', outline: 'none', backgroundColor: initial.add_new_line_bouton_color, color: 'white', height: '39px' }}
                  onClick={() => updateAnneeMois('Ajouter')}
                  startIcon={<FaRegCheckCircle size={20} />}
                >
                  Ajouter
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Enlever le mois et l'année sélectionnés">
                            <span>
                                <Button
                                    variant="contained"
                  disabled={!canDelete || selectedDetailRows.length === 0 || hasDecltvaFalse}
                                    style={{
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: '#FF8A8A',
                                        color: "white",
                                        height: "39px"
                                    }}
                                    onClick={() => updateAnneeMois('Enlever')}
                                    startIcon={<IoMdRemoveCircleOutline size={20} />}
                                >
                                    Enlever
                                </Button>
                            </span>
                        </Tooltip>
          </Stack>
        </Stack>

        <Stack width={'100%'} height={'50vh'}>
          <Stack
            width={'100%'}
            style={{
              marginLeft: '0px',
              marginTop: '20px',
            }}
            height={DATAGRID_HEIGHT}
          >
            <DataGrid
              key={refreshTick}
              disableMultipleSelection={DataGridStyle.disableMultipleSelection}
              disableColumnSelector={DataGridStyle.disableColumnSelector}
              disableDensitySelector={DataGridStyle.disableDensitySelector}
              disableRowSelectionOnClick
              disableSelectionOnClick={true}
              localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
              slots={{ toolbar: QuickFilter }}
              sx={{
                ...DataGridStyle.sx,
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none', border: 'none' },
                '& .MuiDataGrid-row.highlight-row': { backgroundColor: '#d9fdd3 !important' },
              }}
              rowHeight={DataGridStyle.rowHeight}
              columnHeaderHeight={DataGridStyle.columnHeaderHeight}
              editMode="row"
              columns={getTvaDetailEcritureAssocieColumns({})}
              rows={(filteredList ?? listSaisie) || []}
              initialState={{ pagination: { paginationModel: { page: 0, pageSize: 100 } } }}
              experimentalFeatures={{ newEditingApi: true }}
              pageSizeOptions={[5, 10, 20, 30, 50, 100]}
              pagination={DataGridStyle.pagination}
              checkboxSelection={DataGridStyle.checkboxSelection}
              getRowId={(row) => Number(row.id)}
              columnVisibilityModel={{ id: false }}
              rowSelectionModel={selectedDetailRows}
              onRowSelectionModelChange={ids => {
                setSelectedDetailRows(ids.map(Number));
              }}
              getRowClassName={params => (params.row.decltvamois === valSelectMois && params.row.decltvaannee === valSelectAnnee && params.row.decltva === true ? 'highlight-row' : '')}
            />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default DatagridDetailSelectionLigne;
