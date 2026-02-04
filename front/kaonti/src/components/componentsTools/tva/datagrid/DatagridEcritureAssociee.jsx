import React, { useState, useEffect } from 'react';
import { Button, Stack, Tooltip } from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import DataGridStyle from '../../DatagridToolsStyle.jsx';
import QuickFilter from '../../DatagridToolsStyle.jsx';
import { init } from '../../../../../init.js';

import getColumnsEcritureAssocieTVA from './headers/getColumnsEcritureAssocieTVA.jsx';
import axios from '../../../../../config/axios.js';

import { MdOutlineAutoMode } from 'react-icons/md';
import { MdReplay } from 'react-icons/md';
import toast from 'react-hot-toast';
import PopupConfirmDelete from '../../popupConfirmDelete.jsx';
import useAxiosPrivate from '../../../../../config/axiosPrivate.js';

const initial = init[0];

const DatagridDetailEcritureAssociee = ({ DATAGRID_HEIGHT = '500px', valSelectMois, valSelectAnnee, compteId, selectedExerciceId, fileId, canModify, canAdd, canDelete, canView  }) => {
  const axiosPrivate = useAxiosPrivate();
  const [selectedDetailRows, setSelectedDetailRows] = useState([]);
  const [listSaisie, setListSaisie] = useState([]);
  const [isListSaisieRefreshed, setIsListSaisieRefreshed] = useState(false);

  const [openDialogGenerateAuto, setOpenDialogGenerateAuto] = useState(false);
  const [openDialogReinitialize, setOpenDialogReinitialize] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const reinitializeTva = value => {
    if (value) {
      axiosPrivate
        .put(`/declaration/tva/reinitializeTva`, {
          id_compte: compteId,
          id_exercice: selectedExerciceId,
          id_dossier: fileId,
          decltvaannee: valSelectAnnee,
          decltvamois: valSelectMois,
        })
        .then(response => {
          const resData = response.data;
          if (resData.state) {
            toast.success(response?.data?.message);
            // Forcer un rafraîchissement immédiat de la liste
            setIsListSaisieRefreshed(true);
            setOpenDialogReinitialize(false);
          } else {
            toast.error(resData.message);
            setOpenDialogReinitialize(false);
          }
        })
        .catch(error => {
          toast.error(error.response?.data?.message || error.message);
          setOpenDialogReinitialize(false);
        });
    } else {
      setOpenDialogReinitialize(false);
    }
  };

  const handleOpenDialogConfirmGenerateAuto = () => setOpenDialogGenerateAuto(true);
  const handleOpenDialogConfirmReinitialize = () => setOpenDialogReinitialize(true);

  const handleGenerateAuto = async () => {
    const m = Number(valSelectMois), y = Number(valSelectAnnee);
    if (!compteId || !fileId || !selectedExerciceId || !m || !y) {
      toast.error('Sélection dossier/compte/exercice/période manquante');
      return;
    }
    try {
      setGenLoading(true);
      const payload = {
        id_dossier: Number(fileId),
        id_compte: Number(compteId),
        id_exercice: Number(selectedExerciceId),
        decltvaannee: y,
        decltvamois: m,
      };
      const { data } = await axiosPrivate.post('/declaration/tva/generateTvaAutoDetail', payload, { timeout: 120000 });
      if (data?.state) {
        const n = Number(data?.count ?? 0);
        toast.success(`${n} écriture${n>1?'s':''} générée${n>1?'s':''} avec succès`);
      } else {
        toast.error(data?.message || 'Génération échouée');
      }
      getJournalsSelectionLigne();
    } catch (e) {
      console.error('[ECRITURES ASSOCIEES] generate auto error', e);
      toast.error(e?.response?.data?.message || e?.message || 'Erreur génération auto');
    } finally {
      setGenLoading(false);
    }
  };

  const getJournalsSelectionLigne = () => {
    const m = Number(valSelectMois), y = Number(valSelectAnnee);
    if (!compteId || !fileId || !selectedExerciceId || !m || !y) return;
    axios
      .get(`/declaration/tva/ecritureassociee/${compteId}/${fileId}/${selectedExerciceId}`, {
        params: { mois: m, annee: y },
      })
      .then(response => {
        const resData = response.data;
        setListSaisie(resData?.list || []);
      })
      .catch(err => {
        if (err?.response?.status !== 400) {
          console.error('[Ecritures associées] fetch error', err);
        }
        setListSaisie([]);
      });
  };

  useEffect(() => {
    if(canView){
      getJournalsSelectionLigne();
    }
  }, [compteId, fileId, selectedExerciceId, valSelectMois, valSelectAnnee]);

  useEffect(() => {
    if (isListSaisieRefreshed && canView) {
      getJournalsSelectionLigne();
      setIsListSaisieRefreshed(false);
    }
  }, [isListSaisieRefreshed]);

  return (
    <>
      {openDialogReinitialize && canDelete ? (
        <PopupConfirmDelete
          msg={`Voulez-vous vraiment réinitaliser le mois et l'année de toutes ces lignes ?`}
          confirmationState={reinitializeTva}
          type={"Reinialiser"}
        />
      ) : null}

      <Stack width={'100%'} height={'100%'} alignI tems={'flex-start'} alignContent={'flex-start'} justifyContent={'stretch'}>
        <Stack
          width={'100%'}
          paddingLeft={'5px'}
          alignItems={'center'}   
          direction={'row'}
          justifyContent={'flex-end'}
          spacing={0.5}
          style={{ marginLeft: '0px', padding: '8px' }} 
        >
          <Tooltip title="Réinitialiser les écritures">
            <span>
              <Button
                variant="contained"
                style={{ textTransform: 'none', outline: 'none', backgroundColor: initial.add_new_line_bouton_color, color: 'white', height: '39px' }}
                startIcon={<MdReplay size={20} />}
                onClick={handleOpenDialogConfirmReinitialize}
                disabled={!canDelete || listSaisie.length === 0}
              >
                Réinitialiser
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Générer automatiquement les écritures">
            <span>
              <Button
                variant="contained"
                style={{ textTransform: 'none', outline: 'none', backgroundColor: '#3bbc24ff', color: 'white', height: '39px' }}
                disabled={!canAdd || genLoading || !valSelectMois || !valSelectAnnee}
                onClick={handleGenerateAuto}
                startIcon={<MdOutlineAutoMode size={20} />}
              >
                {genLoading ? 'Génération…' : 'Générer auto'}
              </Button>
            </span>
          </Tooltip>
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
              }}
              rowHeight={DataGridStyle.rowHeight}
              columnHeaderHeight={DataGridStyle.columnHeaderHeight}
              editMode='row'
              columns={getColumnsEcritureAssocieTVA({})}
              rows={listSaisie || []}
              initialState={{ pagination: { paginationModel: { page: 0, pageSize: 100 } } }}
              experimentalFeatures={{ newEditingApi: true }}
              pageSizeOptions={[5, 10, 20, 30, 50, 100]}
              pagination={DataGridStyle.pagination}
              getRowId={(row) => Number(row.id)}
              checkboxSelection={DataGridStyle.checkboxSelection}
              columnVisibilityModel={{ id: false }}
              rowSelectionModel={selectedDetailRows}
              onRowSelectionModelChange={ids => setSelectedDetailRows(ids.map(Number))}
            />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default DatagridDetailEcritureAssociee;
