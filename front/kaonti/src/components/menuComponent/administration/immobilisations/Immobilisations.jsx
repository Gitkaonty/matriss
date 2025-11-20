import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Stack, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import { init } from '../../../../../init';

const keepTotalBottomComparator = (v1, v2, cellParams1, cellParams2) => {
  const r1 = cellParams1?.row;
  const r2 = cellParams2?.row;
  const isTot1 = !!r1?.isTotal;
  const isTot2 = !!r2?.isTotal;
  if (isTot1 && !isTot2) return 1;
  if (!isTot1 && isTot2) return -1;
  if (typeof v1 === 'number' && typeof v2 === 'number') return v1 - v2;
  const s1 = v1 == null ? '' : String(v1);
  const s2 = v2 == null ? '' : String(v2);
  return s1.localeCompare(s2);
};

const formatMoneyFr = (n) => {
  const num = Number(n);
  if (!isFinite(num)) return n ?? '';
  try {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  } catch {
    return String(num.toFixed?.(2) ?? num);
  }
};

const Immobilisations = () => {
  const { id } = useParams(); // id dossier
  const initial = init[0];
  const navigate = useNavigate();
  const { auth } = useAuth();
  const compteId = auth?.accessToken ? (jwtDecode(auth.accessToken)?.UserInfo?.compteId || null) : null;

  const [fileInfos, setFileInfos] = useState('');
  const [noFile, setNoFile] = useState(false);

  const [selectedExerciceId, setSelectedExerciceId] = useState(0);
  const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);
  const [listeExercice, setListeExercice] = useState([]);
  const [listeSituation, setListeSituation] = useState([]);

  const [rows, setRows] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => ([
    { field: 'compte', headerName: 'N° de compte', width: 140, sortComparator: keepTotalBottomComparator },
    { field: 'libelle', headerName: 'Libellé', flex: 1, sortComparator: keepTotalBottomComparator },
    { field: 'compte_amort', headerName: 'Compte amort', width: 140, sortComparator: keepTotalBottomComparator },
    {
      field: 'solde', headerName: 'Solde', width: 120, type: 'number', headerAlign: 'right', align: 'right',
      renderCell: (p) => formatMoneyFr(p.value),
      sortComparator: keepTotalBottomComparator,
    },
    {
      field: 'amort_ant', headerName: 'Amort Ant', width: 120, type: 'number', headerAlign: 'right', align: 'right',
      renderCell: (p) => formatMoneyFr(p.value),
      sortComparator: keepTotalBottomComparator,
    },
    {
      field: 'dotation', headerName: 'Dotation', width: 120, type: 'number', headerAlign: 'right', align: 'right',
      renderCell: (p) => formatMoneyFr(p.value),
      sortComparator: keepTotalBottomComparator,
    },
    {
      field: 'valeur_nette', headerName: 'Valeur nette', width: 140, type: 'number', headerAlign: 'right', align: 'right',
      renderCell: (p) => formatMoneyFr(p.value),
      sortComparator: keepTotalBottomComparator,
    },
    {
      field: 'vnc_immo', headerName: 'VNC immo', width: 140, type: 'number', headerAlign: 'right', align: 'right',
      renderCell: (p) => formatMoneyFr(p.value),
      sortComparator: keepTotalBottomComparator,
    },
  ]), []);

  const GetInfosIdDossier = (idDossier) => {
    axios.get(`/home/FileInfos/${idDossier}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setFileInfos(resData.fileInfos[0]);
        setNoFile(false);
      } else {
        setFileInfos([]);
        setNoFile(true);
      }
    });
  };

  const sendToHome = (value) => {
    setNoFile(!value);
    navigate('/tab/home');
  };

  const handleChangeExercice = (exercice_id) => {
    setSelectedExerciceId(exercice_id);
    setSelectedPeriodeChoiceId(0);
    setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
    setSelectedPeriodeId(exercice_id);
  };

  const handleChangePeriode = (choix) => {
    setSelectedPeriodeChoiceId(choix);
    if (choix === 0) {
      setListeSituation(listeExercice?.filter((item) => item.id === selectedExerciceId));
      setSelectedPeriodeId(selectedExerciceId);
    } else if (choix === 1) {
      setListeSituation(listeExercice);
    }
  };

  const handleChangeDateIntervalle = (idPeriode) => {
    setSelectedPeriodeId(idPeriode);
  };

  const GetListeExercice = (idDossier) => {
    axios.get(`/paramExercice/listeExercice/${idDossier}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setListeExercice(resData.list);
        const exerciceNId = resData.list?.filter((item) => item.libelle_rang === 'N');
        setListeSituation(exerciceNId);
        setSelectedExerciceId(exerciceNId[0].id);
        setSelectedPeriodeChoiceId(0);
        setSelectedPeriodeId(exerciceNId[0].id);
      } else {
        setListeExercice([]);
        toast.error('une erreur est survenue lors de la récupération de la liste des exercices');
      }
    });
  };

  useEffect(() => {
    const idFile = Number(id) || 0;
    if (!idFile) {
      setNoFile(true);
      return;
    }
    GetInfosIdDossier(idFile);
    GetListeExercice(idFile);
  }, [id]);

  useEffect(() => {
    const loadImmobilisations = async () => {
      try {
        const fid = Number(id) || 0;
        const exoId = Number(selectedExerciceId) || 0;
        if (!fid || !compteId || !exoId) { setRows([]); return; }
        setLoading(true);
        const { data } = await axios.get('/administration/traitementSaisie/immobilisations/pcs', {
          params: { fileId: fid, compteId, exerciceId: exoId },
          timeout: 60000,
        });
        if (data?.state) {
          const list = Array.isArray(data.list) ? data.list : (data.list ? [data.list] : []);
          // dédoublonner côté front: une seule ligne par N° de compte
          const mapByCompte = list.reduce((acc, row) => {
            const key = row.compte ?? row.id;
            if (key && !acc[key]) acc[key] = row;
            return acc;
          }, {});
          const uniqueList = Object.values(mapByCompte);
          setRows(uniqueList);
        } else {
          setRows([]);
          toast.error(data?.msg || 'Aucun compte immobilisation trouvé');
        }
      } catch (e) {
        setRows([]);
        try { console.error('[IMMO][PCS][ERROR]', e?.response?.status, e?.response?.data || e); } catch { }
        toast.error("Erreur serveur lors du chargement des comptes d'immobilisations");
      } finally {
        setLoading(false);
      }
    };
    loadImmobilisations();
  }, [id, compteId, selectedExerciceId]);

  return (
    <Box>
      {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
      <TabContext value={'1'}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList aria-label="immobilisations tabs">
            <Tab
              style={{ textTransform: 'none', outline: 'none', border: 'none', margin: -5 }}
              label={InfoFileStyle(fileInfos?.dossier)} value="1"
            />
          </TabList>
        </Box>
        <TabPanel value="1" style={{ height: '100%' }}>
          <Stack width={'100%'} height={'100%'} spacing={3}>
            <Typography variant='h6' sx={{ color: 'black' }} align='left'>Administration - Immobilisations</Typography>

            <Stack width={'100%'} spacing={4} alignItems={'center'} justifyContent="space-between" direction={'row'}>
              <Stack direction={'row'}>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                  <InputLabel>Exercice:</InputLabel>
                  <Select
                    value={selectedExerciceId}
                    onChange={(e) => handleChangeExercice(e.target.value)}
                    sx={{ width: '300px', display: 'flex', justifyContent: 'left', alignItems: 'flex-start', alignContent: 'flex-start', textAlign: 'left' }}
                    MenuProps={{ disableScrollLock: true }}
                  >
                    {listeExercice.map((option) => {
                      const d1 = option?.date_debut ? String(option.date_debut).substring(0, 10) : '';
                      const d2 = option?.date_fin ? String(option.date_fin).substring(0, 10) : '';
                      const toFr = (s) => s ? `${s.substring(8, 10)}/${s.substring(5, 7)}/${s.substring(0, 4)}` : '';
                      return (
                        <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {toFr(d1)} - {toFr(d2)}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControl variant="standard" sx={{ m: 1, minWidth: 150 }}>
                  <InputLabel>Période</InputLabel>
                  <Select
                    disabled
                    value={selectedPeriodeChoiceId}
                    onChange={(e) => handleChangePeriode(e.target.value)}
                    sx={{ width: '150px', display: 'flex', justifyContent: 'left', alignItems: 'flex-start', alignContent: 'flex-start', textAlign: 'left' }}
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
                    sx={{ width: '300px', display: 'flex', justifyContent: 'left', alignItems: 'flex-start', alignContent: 'flex-start', textAlign: 'left' }}
                    MenuProps={{ disableScrollLock: true }}
                  >
                    {listeSituation?.map((option) => {
                      const d1 = option?.date_debut ? String(option.date_debut).substring(0, 10) : '';
                      const d2 = option?.date_fin ? String(option.date_fin).substring(0, 10) : '';
                      const toFr = (s) => s ? `${s.substring(8, 10)}/${s.substring(5, 7)}/${s.substring(0, 4)}` : '';
                      return (
                        <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {toFr(d1)} - {toFr(d2)}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Box sx={{ flex: 1 }}>
              {loading && (
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ color: initial.theme }}>
                    Chargement des immobilisations...
                  </Typography>
                </Stack>
              )}
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(r) => r.id}
                rowSelectionModel={selectionModel}
                onRowSelectionModelChange={(m) => setSelectionModel(m.slice(-1))}
                checkboxSelection
                disableRowSelectionOnClick
                disableColumnMenu
                density="compact"
                pageSizeOptions={[10, 25, 50]}
                autoHeight
                loading={loading}
                sx={{
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: initial.theme,
                    color: 'white',
                    fontWeight: 'bold',
                  },
                }}
              />
            </Box>
          </Stack>
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default Immobilisations;
