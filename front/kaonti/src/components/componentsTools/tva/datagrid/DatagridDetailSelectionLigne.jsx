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
        setListSaisie(resData?.list);
      });
  };

  const getPc = () => {
    axios.get(`/declaration/tva/recupPcClasseSix/${compteId}/${fileId}`).then(response => {
      const resData = response.data;
      if (resData.state) {
        setListePlanComptable(resData.liste);
      } else {
        toast.error(resData.msg);
      }
    });
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
    if (!valSelectedCompte || valSelectedCompte === 'tout') {
      setFilteredList([]);
      return;
    }

    const compteSelect = listePlanComptable.find(item => item.id === Number(valSelectedCompte));
    if (!compteSelect) {
      setFilteredList([]);
      return;
    }

    const filtered = listSaisie.filter(item => item.compte?.toString().includes(compteSelect.compte.toString()));

    setFilteredList(filtered);
  };

  // const updateAnneeMois = type => {
  //   if (type === 'Ajouter') {
  //     axios
  //       .put(`/declaration/tva/ajoutMoisAnnee`, {
  //         selectedDetailRows,
  //         decltvamois: Number(valSelectMois),
  //         decltvaannee: Number(valSelectAnnee),
  //       })
  //       .then(response => {
  //         const data = response?.data;

  //         if (!data) return toast.error('Aucune réponse du serveur');

  //         if (data.state) {
  //           if (data.message === 'Compte TVA non trouvé à chacune des lignes') {
  //             toast.error(data.message);
  //           } else {
  //             toast.success(data.message);
  //             setSelectedDetailRows([]);
  //           }

  //           setIsEcritureAssocieRefreshed(prev => !prev);
  //         } else {
  //           toast.error(data.message || 'Erreur inconnue');
  //         }
  //       })
  //       .catch(err => {
  //         console.error(err);
  //         toast.error('Erreur lors de la requête');
  //       });
  //   } else {
  //     axios.put(`/declaration/tva/suppressionMoisAnnee`, {
  //       id_compte: Number(compteId),
  //       id_exercice: Number(selectedExerciceId),
  //       id_dossier: Number(fileId),
  //       selectedDetailRows: selectedDetailRows,
  //       decltva: false,
  //       decltvamois: valSelectMois,
  //       decltvaannee: valSelectAnnee,
  //   }).then((response) => {
  //       if (response?.data?.state) {
  //           toast.success(response?.data?.message);
  //           setSelectedDetailRows([]);
  //           setIsDetailSelectionRefreshed(prev => !prev);
  //           setIsDetailEcritureRefreshed(prev => !prev);
  //       } else {
  //           toast.error(response?.data?.message);
  //       }
  //       });
  //   }
  // };
 
    // Modification du moi et année dans journal
  // const updateAnneeMois = (type) => {
  //       if (type === 'Ajouter') {
  //           axios.put(`/declaration/isi/ajoutMoisAnnee`, {
  //               id_compte: Number(compteId),
  //               id_exercice: Number(selectedExerciceId),
  //               id_dossier: Number(fileId),
  //               selectedDetailRows,
  //               declisimois: valSelectMois,
  //               declisiannee: valSelectAnnee,
  //               declisi: true,
  //               compteisi
  //           }).then((response) => {
  //               const data = response?.data;
 
  //               if (!data) return toast.error("Aucune réponse du serveur");
 
  //               if (data.state) {
  //                   if (data.message === 'Compte ISI non trouvé à chacune des lignes') {
  //                       toast.error(data.message);
  //                   } else {
  //                       toast.success(data.message);
  //                       setSelectedDetailRows([]);
  //                   }
 
  //                   setIsDetailSelectionRefreshed(prev => !prev);
  //                   setIsDetailEcritureRefreshed(prev => !prev);
 
  //               } else {
  //                   toast.error(data.message || "Erreur inconnue");
  //               }
  //           }).catch(err => {
  //               console.error(err);
  //               toast.error("Erreur lors de la requête");
  //           });
  //       } else {
  //           axios.put(`/declaration/isi/suppressionMoisAnnee`, {
  //               id_compte: Number(compteId),
  //               id_exercice: Number(selectedExerciceId),
  //               id_dossier: Number(fileId),
  //               selectedDetailRows: selectedDetailRows,
  //               declisimois: valSelectMois,
  //               declisiannee: valSelectAnnee,
  //               declisi: false
  //           }).then((response) => {
  //               if (response?.data?.state) {
  //                   toast.success(response?.data?.message);
  //                   setSelectedDetailRows([]);
  //                   setIsDetailSelectionRefreshed(prev => !prev);
  //                   setIsDetailEcritureRefreshed(prev => !prev);
  //               } else {
  //                   toast.error(response?.data?.message);
  //               }
  //           })
  //       }
  // }
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
                  style={{ textTransform: 'none', outline: 'none', backgroundColor: initial.theme, color: 'white', height: '39px' }}
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
