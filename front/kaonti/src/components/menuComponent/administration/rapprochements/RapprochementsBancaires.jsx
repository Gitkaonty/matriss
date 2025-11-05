import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Box, Tab, Button, TextField,Tooltip, IconButton } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { DataGrid } from '@mui/x-data-grid';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

import { TbPlaylistAdd } from 'react-icons/tb';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { TfiSave } from 'react-icons/tfi';
import { VscClose } from 'react-icons/vsc';
import { IoMdTrash } from 'react-icons/io';


function RapprochementsBancaires() {
  let initial = init[0];
  const [fileInfos, setFileInfos] = useState('');
  const [fileId, setFileId] = useState(0);
  const { id } = useParams();
  const [noFile, setNoFile] = useState(false);

  const [selectedExerciceId, setSelectedExerciceId] = useState(0);
  const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);
  const [listeExercice, setListeExercice] = useState([]);
  const [listeSituation, setListeSituation] = useState([]);

  const [pc512Rows, setPc512Rows] = useState([]);
  const [pcSelected, setPcSelected] = useState(null);

  const [rapproRows, setRapproRows] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [editForm, setEditForm] = useState({ id: 0, date_debut: '', date_fin: '', solde_comptable: '', solde_bancaire: '', solde_non_rapproche: '' });
  const [mode, setMode] = useState('view'); // view | add | edit

  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const compteId = decoded?.UserInfo?.compteId || null;
  const navigate = useNavigate();

  const [disableCancelBouton, setDisableCancelBouton] = useState(false);
  const [disableDeleteBouton, setDisableDeleteBouton] = useState(false);
  const [disableSaveBouton, setDisableSaveBouton] = useState(false);

  const GetInfosIdDossier = (id) => {
    axios.get(`/home/FileInfos/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setFileInfos(resData.fileInfos[0]);
        setNoFile(false);
      } else {
        setFileInfos([]);
        setNoFile(true);
      }
    })
  }

  const sendToHome = (value) => {
    setNoFile(!value);
    navigate('/tab/home');
  }

  const handleChangeExercice = (exercice_id) => {
    setSelectedExerciceId(exercice_id);
    setSelectedPeriodeChoiceId("0");
    setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
    setSelectedPeriodeId(exercice_id);
  }

  const GetListeExercice = (id) => {
    axios.get(`/paramExercice/listeExercice/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setListeExercice(resData.list);
        const exerciceNId = resData.list?.filter((item) => item.libelle_rang === "N");
        setListeSituation(exerciceNId);
        setSelectedExerciceId(exerciceNId[0].id);
        setSelectedPeriodeChoiceId(0);
        setSelectedPeriodeId(exerciceNId[0].id);
      } else {
        setListeExercice([]);
        toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
      }
    })
  }

  const loadPc512 = async (fid) => {
    try {
      const { data } = await axios.post(`/paramPlanComptable/pc`, { fileId: fid });
      if (data?.state) {
        const listePc = data.liste || [];
        const filtered = (listePc || []).filter(r => typeof r?.compte === 'string' && r.compte.startsWith('512'));
        const unique = Array.from(new Map(filtered.map(r => [r.id, r])).values());
        setPc512Rows(unique);
      } else {
        setPc512Rows([]);
        toast.error(data?.msg || 'Erreur chargement plan comptable');
      }
    } catch (e) {
      setPc512Rows([]);
      toast.error('Erreur serveur lors du chargement du plan comptable');
    }
  };

  const computeEcart = (rc) => {
    const sc = Number(rc?.solde_comptable) || 0;
    const sb = Number(rc?.solde_bancaire) || 0;
    const snr = Number(rc?.solde_non_rapproche) || 0;
    return sc - sb - snr;
  };

  const loadRapprochements = async (pcRow) => {
    if (!pcRow || !fileId || !compteId || !selectedExerciceId) { setRapproRows([]); return; }
    try {
      const params = { fileId, compteId, exerciceId: selectedExerciceId, pcId: pcRow.id };
      const { data } = await axios.get('/administration/rapprochements', { params, timeout: 60000 });
      const list = Array.isArray(data?.list) ? data.list : (data?.list ? [data.list] : []);
      const rows = list.map(it => ({
        id: it.id,
        pc_id: pcRow.id,
        date_debut: it.date_debut,
        date_fin: it.date_fin,
        solde_comptable: Number(it.solde_comptable) || 0,
        solde_bancaire: Number(it.solde_bancaire) || 0,
        solde_non_rapproche: Number(it.solde_non_rapproche) || 0,
        ecart: Number(it.ecart != null ? it.ecart : computeEcart(it))
      }));
      setRapproRows(rows);
    } catch (e) {
      setRapproRows([]);
      toast.error("Erreur lors du chargement des rapprochements");
    }
  };

  const handleAdd = () => {
    if (!pcSelected) return toast.error('Sélectionner un compte 512');
    setMode('add');
    setEditForm({ id: 0, date_debut: '', date_fin: '', solde_comptable: '', solde_bancaire: '', solde_non_rapproche: '' });
  };
  const handleEdit = () => {
    const id = selectionModel[0];
    const row = rapproRows.find(r => r.id === id);
    if (!row) return toast.error('Sélectionner une ligne');
    setMode('edit');
    setEditForm({
      id: row.id,
      date_debut: row.date_debut ? String(row.date_debut).substring(0, 10) : '',
      date_fin: row.date_fin ? String(row.date_fin).substring(0, 10) : '',
      solde_comptable: row.solde_comptable,
      solde_bancaire: row.solde_bancaire,
      solde_non_rapproche: row.solde_non_rapproche,
    });
  };
  const handleDelete = async () => {
    const idSel = selectionModel[0];
    if (!idSel) return toast.error('Sélectionner une ligne');
    try {
      const params = { fileId, compteId, exerciceId: selectedExerciceId };
      await axios.delete(`/administration/rapprochements/${idSel}`, { params });
      toast.success('Supprimé');
      await loadRapprochements(pcSelected);
    } catch (e) {
      toast.error('Suppression échouée');
    }
  };
  const handleSave = async () => {
    if (!pcSelected) return toast.error('Sélectionner un compte 512');
    const payload = {
      fileId,
      compteId,
      exerciceId: selectedExerciceId,
      pcId: pcSelected.id,
      date_debut: editForm.date_debut,
      date_fin: editForm.date_fin,
      solde_comptable: Number(editForm.solde_comptable) || 0,
      solde_bancaire: Number(editForm.solde_bancaire) || 0,
      solde_non_rapproche: Number(editForm.solde_non_rapproche) || 0,
    };
    try {
      if (mode === 'add') {
        await axios.post('/administration/rapprochements', payload);
        toast.success('Ajouté');
      } else if (mode === 'edit' && editForm.id) {
        await axios.put(`/administration/rapprochements/${editForm.id}`, payload);
        toast.success('Modifié');
      } else {
        return;
      }
      setMode('view');
      await loadRapprochements(pcSelected);
    } catch (e) {
      toast.error('Enregistrement échoué');
    }
  };

  const pcColumns = useMemo(() => ([
    { field: 'compte', headerName: 'Compte', width: 140 },
    { field: 'libelle', headerName: 'Libellé', flex: 1 },
  ]), []);

  const rapproColumns = useMemo(() => ([
    { field: 'date_debut', headerName: 'Date début', width: 130, valueGetter: (p) => p.row.date_debut ? format(new Date(p.row.date_debut), 'yyyy-MM-dd') : '' },
    { field: 'date_fin', headerName: 'Date fin', width: 130, valueGetter: (p) => p.row.date_fin ? format(new Date(p.row.date_fin), 'yyyy-MM-dd') : '' },
    { field: 'solde_comptable', headerName: 'Solde comptable', width: 150, valueGetter: (p) => Number(p.row.solde_comptable) || 0 },
    { field: 'solde_bancaire', headerName: 'Solde bancaire', width: 150, valueGetter: (p) => Number(p.row.solde_bancaire) || 0 },
    { field: 'solde_non_rapproche', headerName: 'Solde lignes non rapprochées', width: 220, valueGetter: (p) => Number(p.row.solde_non_rapproche) || 0 },
    { field: 'ecart', headerName: 'Écart', width: 130, valueGetter: (p) => computeEcart(p.row) },
  ]), []);

  const GetListeSituation = (id) => {
    axios.get(`/paramExercice/listeSituation/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        const list = resData.list;
        setListeSituation(resData.list);
        if (list.length > 0) {
          setSelectedPeriodeId(list[0].id);
        }
      } else {
        setListeSituation([]);
        toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
      }
    })
  }

  const handleChangePeriode = (choix) => {
    setSelectedPeriodeChoiceId(choix);
    if (choix === 0) {
      setListeSituation(listeExercice?.filter((item) => item.id === selectedExerciceId));
      setSelectedPeriodeId(selectedExerciceId);
    } else if (choix === 1) {
      GetListeSituation(selectedExerciceId);
    }
  }

  const handleChangeDateIntervalle = (id) => {
    setSelectedPeriodeId(id);
  }

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType('navigation');
    let idFile = 0;
    if (navigationEntries.length > 0) {
      const navigationType = navigationEntries[0].type;
      if (navigationType === 'reload') {
        const idDossier = sessionStorage.getItem("fileId");
        setFileId(idDossier);
        idFile = idDossier;
      } else {
        sessionStorage.setItem('fileId', id);
        setFileId(id);
        idFile = id;
      }
    }
    GetInfosIdDossier(idFile);
    GetListeExercice(idFile);
    if (idFile) loadPc512(idFile);
  }, []);

  useEffect(() => {
    if (fileId) loadPc512(fileId);
  }, [fileId]);

  useEffect(() => {
    if (pcSelected) loadRapprochements(pcSelected);
  }, [pcSelected, fileId, compteId, selectedExerciceId]);

  return (
    <Box>
      {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
      <TabContext value={"1"}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList aria-label="lab API tabs example">
            <Tab
              style={{ textTransform: 'none', outline: 'none', border: 'none', margin: -5 }}
              label={InfoFileStyle(fileInfos?.dossier)} value="1"
            />
          </TabList>
        </Box>
        <TabPanel value="1" style={{ height: '100%' }}>
          <Stack width={"100%"} height={"100%"} spacing={3}>
            <Typography variant='h6' sx={{ color: "black" }} align='left'>Administration - Rapprochements bancaires</Typography>

            <Stack width={"100%"} spacing={4} alignItems={"center"} justifyContent="space-between" direction={"row"}>
              <Stack direction={"row"}>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                  <InputLabel>Exercice:</InputLabel>
                  <Select
                    value={selectedExerciceId}
                    onChange={(e) => handleChangeExercice(e.target.value)}
                    sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                    MenuProps={{ disableScrollLock: true }}
                  >
                    {listeExercice.map((option) => (
                      <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="standard" sx={{ m: 1, minWidth: 150 }}>
                  <InputLabel>Période</InputLabel>
                  <Select
                    disabled
                    value={selectedPeriodeChoiceId}
                    onChange={(e) => handleChangePeriode(e.target.value)}
                    sx={{ width: "150px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                    MenuProps={{ disableScrollLock: true }}
                  >
                    <MenuItem value={0}>Toutes</MenuItem>
                    <MenuItem value={1}>Situations</MenuItem>
                  </Select>
                </FormControl>

                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                  <InputLabel>Du</InputLabel>
                  <Select
                    value={selectedPeriodeId}
                    onChange={(e) => handleChangeDateIntervalle(e.target.value)}
                    sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                    MenuProps={{ disableScrollLock: true }}
                  >
                    {listeSituation?.map((option) => (
                      <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: '100%' }}>
              <Box sx={{ flex: 1, height: '60vh' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Liste des comptes</Typography>
                <DataGrid
                  rows={pc512Rows}
                  columns={pcColumns}
                  disableColumnMenu
                  density="compact"
                  pageSizeOptions={[10, 25, 50]}
                  onRowSelectionModelChange={(m) => {
                    setSelectionModel(m);
                    const idRow = m[0];
                    const row = pc512Rows.find(r => r.id === idRow);
                    setPcSelected(row || null);
                  }}
                  rowSelectionModel={pcSelected ? [pcSelected.id] : []}
                />
              </Box>

              <Box sx={{ flex: 2, height: '60vh' }}>
                <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                  direction={"row"} justifyContent={"right"}>
                  <Tooltip title="Ajouter une ligne">
                    <span>
                      <IconButton
                        // disabled={disableAddRowBouton}
                        // variant="contained"
                        // onClick={handleOpenDialogAddNewAssocie}
                        style={{
                          width: "35px", height: '35px',
                          borderRadius: "2px", borderColor: "transparent",
                          backgroundColor: initial.theme,
                          textTransform: 'none', outline: 'none'
                        }}
                      >
                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Modifier la ligne sélectionnée">
                    <span>
                      <IconButton
                        // disabled={disableModifyBouton}
                        // variant="contained"
                        // onClick={handleEditClick(selectedRowId)}
                        style={{
                          width: "35px", height: '35px',
                          borderRadius: "2px", borderColor: "transparent",
                          backgroundColor: initial.theme,
                          textTransform: 'none', outline: 'none'
                        }}
                      >
                        <FaRegPenToSquare style={{ width: '25px', height: '25px', color: 'white' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Sauvegarder les modifications">
                    <span>
                      <IconButton
                        // disabled={disableSaveBouton}
                        // variant="contained"
                        // onClick={handleSaveClick(selectedRowId)}
                        style={{
                          width: "35px", height: '35px',
                          borderRadius: "2px", borderColor: "transparent",
                          backgroundColor: initial.theme,
                          textTransform: 'none', outline: 'none'
                        }}
                      >
                        <TfiSave style={{ width: '50px', height: '50px', color: 'white' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Annuler les modifications">
                    <span>
                      <IconButton
                        // disabled={disableCancelBouton}
                        // variant="contained"
                        // onClick={handleCancelClick(selectedRowId)}
                        style={{
                          width: "35px", height: '35px',
                          borderRadius: "2px", borderColor: "transparent",
                          backgroundColor: initial.button_delete_color,
                          textTransform: 'none', outline: 'none'
                        }}
                      >
                        <VscClose style={{ width: '50px', height: '50px', color: 'white' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Supprimer la ligne sélectionnée">
                    <span>
                      <IconButton
                        // disabled={disableDeleteBouton}
                        // onClick={handleOpenDialogConfirmDeleteAssocieRow}
                        // variant="contained"
                        style={{
                          width: "35px", height: '35px',
                          borderRadius: "2px", borderColor: "transparent",
                          backgroundColor: initial.button_delete_color,
                          textTransform: 'none', outline: 'none'
                        }}
                      >
                        <IoMdTrash style={{ width: '50px', height: '50px', color: 'white' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>

                {mode !== 'view' && (
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <TextField label="Date début" type="date" size="small" value={editForm.date_debut} onChange={(e) => setEditForm(f => ({ ...f, date_debut: e.target.value }))} InputLabelProps={{ shrink: true }} />
                    <TextField label="Date fin" type="date" size="small" value={editForm.date_fin} onChange={(e) => setEditForm(f => ({ ...f, date_fin: e.target.value }))} InputLabelProps={{ shrink: true }} />
                    <TextField label="Solde comptable" type="number" size="small" value={editForm.solde_comptable} onChange={(e) => setEditForm(f => ({ ...f, solde_comptable: e.target.value }))} />
                    <TextField label="Solde bancaire" type="number" size="small" value={editForm.solde_bancaire} onChange={(e) => setEditForm(f => ({ ...f, solde_bancaire: e.target.value }))} />
                    <TextField label="Solde non rapproché" type="number" size="small" value={editForm.solde_non_rapproche} onChange={(e) => setEditForm(f => ({ ...f, solde_non_rapproche: e.target.value }))} />
                  </Stack>
                )}

                <DataGrid
                  rows={rapproRows.map(r => ({ ...r, ecart: computeEcart(r) }))}
                  columns={rapproColumns}
                  disableColumnMenu
                  density="compact"
                  pageSizeOptions={[10, 25, 50]}
                  onRowSelectionModelChange={(m) => setSelectionModel(m)}
                  rowSelectionModel={selectionModel}
                />
              </Box>
            </Stack>
          </Stack>
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default RapprochementsBancaires;

