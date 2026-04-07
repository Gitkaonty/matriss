import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Badge,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { DataGridStyle } from '../../componentsTools/DatagridToolsStyle';
import { init } from '../../../../init';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { InfoFileStyle } from '../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../componentsTools/popupTestSelectedFile';
import PopupCommentaireAnalytique from './PopupCommentaireAnalytique';

// Format date as dd-mm-yy
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

export default function RevuAnalytiqueNN1Detail() {
  let initial = init[0];
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { id_compte, id_dossier, id_exercice } = useParams();
  const [searchParams] = useSearchParams();

  // Récupérer les paramètres d'URL si présents
  const urlDateDebut = searchParams.get('date_debut');
  const urlDateFin = searchParams.get('date_fin');

  const [listeExercice, setListeExercice] = useState([]);
  const [selectedExerciceId, setSelectedExerciceId] = useState(() => {
    const storedExerciceId = parseInt(sessionStorage.getItem('exerciceId'));
    console.log('[RevuAnalytiqueNN1Detail] Initialisation selectedExerciceId depuis sessionStorage:', storedExerciceId);
    return storedExerciceId || 0;
  });
  const [fileInfos, setFileInfos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noFile, setNoFile] = useState(false);
  const [fileId, setFileId] = useState(parseInt(id_dossier) || 0);

  // === Périodes ===
  const [listePeriodes, setListePeriodes] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [selectedPeriodeDates, setSelectedPeriodeDates] = useState(
    urlDateDebut && urlDateFin ? { date_debut: urlDateDebut, date_fin: urlDateFin } : null
  );

  // === Données du tableau ===
  const [rows, setRows] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

   const headerCellStyle = {
        bgcolor: '#F8FAFC',
        color: '#64748B',
        fontSize: '10px',
        fontWeight: 800,
        textTransform: 'uppercase',
        py: 1.5,
        px: 2,
        borderBottom: '2px solid #E2E8F0',
        textAlign: 'left'
    };

    const cellStyle = {
        py: 1.5,
        px: 2,
        fontSize: '13px',
        borderBottom: '1px solid #F1F5F9',
        textAlign: 'left',
        verticalAlign: 'top'
    };

    const labelStyle = {
        fontSize: '9px',
        color: '#94A3B8',
        fontWeight: 700,
        lineHeight: 1.2,
        mb: 0.5,
        textTransform: 'uppercase'
    };

  const sendToHome = (value) => {
    setNoFile(!value);
    navigate('/tab/home');
  };

  // Vérifier si un dossier est sélectionné au chargement
  useEffect(() => {
    const idDossier = id_dossier || sessionStorage.getItem('fileId');
    if (!idDossier || idDossier === '0') {
      setNoFile(true);
    } else {
      setFileId(parseInt(idDossier));
      setNoFile(false);
    }
  }, [id_dossier]);

  const getIds = useCallback(() => {
    return {
      id_compte: parseInt(id_compte) || parseInt(sessionStorage.getItem('compteId')) || 1,
      id_dossier: parseInt(id_dossier) || fileId || parseInt(sessionStorage.getItem('fileId')) || 1,
      id_exercice: parseInt(id_exercice) || selectedExerciceId || parseInt(sessionStorage.getItem('exerciceId')) || 1
    };
  }, [id_compte, id_dossier, id_exercice, fileId, selectedExerciceId]);

  const fetchExercices = useCallback(async () => {
    console.log('[RevuAnalytiqueNN1Detail] Début fetchExercices');
    try {
      const { id_dossier } = getIds();
      console.log('[RevuAnalytiqueNN1Detail] Récupération exercices pour id_dossier:', id_dossier);
      const response = await axiosPrivate.get(`/paramExercice/listeExercice/${id_dossier}`);
      const resData = response.data;
      console.log('[RevuAnalytiqueNN1Detail] Réponse exercices:', resData);
      if (resData.state) {
        setListeExercice(resData.list);
        console.log('[RevuAnalytiqueNN1Detail] Liste exercices mise à jour:', resData.list);
        // Sélectionner l'exercice correspondant aux dates URL ou le premier
        if (resData.list && resData.list.length > 0) {
          if (urlDateDebut && urlDateFin) {
            const matchingExercice = resData.list.find(e =>
              e.date_debut === urlDateDebut && e.date_fin === urlDateFin
            );
            if (matchingExercice) {
              setSelectedExerciceId(matchingExercice.id);
              console.log('[RevuAnalytiqueNN1Detail] Exercice sélectionné par dates URL:', matchingExercice);
            } else {
              setSelectedExerciceId(resData.list[0].id);
              console.log('[RevuAnalytiqueNN1Detail] Aucun exercice trouvé pour dates URL, sélection du premier:', resData.list[0]);
            }
          } else if (selectedExerciceId === 0) {
            setSelectedExerciceId(resData.list[0].id);
            console.log('[RevuAnalytiqueNN1Detail] Sélection du premier exercice par défaut:', resData.list[0]);
          }
        }
      } else {
        console.error('[RevuAnalytiqueNN1Detail] Erreur dans la réponse exercices - state false:', resData);
      }
    } catch (error) {
      console.error('[RevuAnalytiqueNN1Detail] Error fetching exercices:', error);
      console.error('[RevuAnalytiqueNN1Detail] Détails erreur:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
  }, [axiosPrivate, getIds, urlDateDebut, urlDateFin, selectedExerciceId]);

  const fetchDossierInfos = useCallback(async () => {
    console.log('[RevuAnalytiqueNN1Detail] Début fetchDossierInfos');
    try {
      const { id_dossier } = getIds();
      console.log('[RevuAnalytiqueNN1Detail] Récupération infos dossier pour id_dossier:', id_dossier);
      const response = await axiosPrivate.get(`/home/FileInfos/${id_dossier}`);
      const resData = response.data;
      console.log('[RevuAnalytiqueNN1Detail] Réponse infos dossier:', resData);
      if (resData.state && resData.fileInfos && resData.fileInfos.length > 0) {
        setFileInfos(resData.fileInfos[0]);
        console.log('[RevuAnalytiqueNN1Detail] Infos dossier mises à jour:', resData.fileInfos[0]);
      } else {
        console.error('[RevuAnalytiqueNN1Detail] Erreur dans la réponse infos dossier - state false ou fileInfos vide:', resData);
      }
    } catch (error) {
      console.error('[RevuAnalytiqueNN1Detail] Error fetching dossier infos:', error);
      console.error('[RevuAnalytiqueNN1Detail] Détails erreur:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
  }, [axiosPrivate, getIds]);

  const fetchPeriodes = useCallback(async (exerciceId) => {
    if (!exerciceId) {
      console.log('[RevuAnalytiqueNN1Detail] fetchPeriodes: exerciceId manquant');
      return;
    }
    console.log('[RevuAnalytiqueNN1Detail] Début fetchPeriodes pour exerciceId:', exerciceId);
    try {
      const response = await axiosPrivate.get(`/paramExercice/listePeriodes/${exerciceId}`);
      console.log('[RevuAnalytiqueNN1Detail] Réponse périodes:', response.data);
      if (response.data.state) {
        setListePeriodes(response.data.list || []);
        console.log('[RevuAnalytiqueNN1Detail] Liste périodes mise à jour:', response.data.list);
      } else {
        setListePeriodes([]);
        console.error('[RevuAnalytiqueNN1Detail] Erreur dans la réponse périodes - state false:', response.data);
      }
    } catch (error) {
      console.error('[RevuAnalytiqueNN1Detail] Error fetching periodes:', error);
      console.error('[RevuAnalytiqueNN1Detail] Détails erreur:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setListePeriodes([]);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchExercices();
    fetchDossierInfos();
  }, [fetchExercices, fetchDossierInfos]);

  useEffect(() => {
    if (selectedExerciceId > 0) {
      fetchPeriodes(selectedExerciceId);
    }
  }, [selectedExerciceId, fetchPeriodes]);

  const handleChangeExercice = (exerciceId) => {
    setSelectedExerciceId(exerciceId);
    setSelectedPeriodeId('');
    setSelectedPeriodeDates(null);
  };

  const handleChangePeriode = (periodeId) => {
    setSelectedPeriodeId(periodeId);
    if (periodeId && periodeId !== 'exercice') {
      const periode = listePeriodes.find(p => p.id === periodeId);
      if (periode) {
        setSelectedPeriodeDates({
          date_debut: periode.date_debut,
          date_fin: periode.date_fin
        });
      }
    } else {
      setSelectedPeriodeDates(null);
    }
  };

  // Récupérer les données de la revue analytique N/N-1
  useEffect(() => {
    const fetchRevuAnalytique = async () => {
      console.log('[RevuAnalytiqueNN1Detail] Début fetchRevuAnalytique');
      try {
        setLoading(true);
        const { id_compte, id_dossier, id_exercice } = getIds();
        console.log('[RevuAnalytiqueNN1Detail] IDs utilisés:', { id_compte, id_dossier, id_exercice });
        console.log('[RevuAnalytiqueNN1Detail] Période sélectionnée:', selectedPeriodeDates);
        console.log('[RevuAnalytiqueNN1Detail] selectedExerciceId:', selectedExerciceId, 'listeExercice.length:', listeExercice.length);

        // Ne pas faire l'appel si l'exerciceId est la valeur par défaut (1) et que les exercices ne sont pas encore chargés
        // ou si l'exerciceId par défaut est utilisé mais qu'il y a des exercices disponibles
        if (!id_compte || !id_dossier || !id_exercice ||
          (id_exercice === 1 && (listeExercice.length === 0 || selectedExerciceId === 0))) {
          console.error('[RevuAnalytiqueNN1Detail] IDs invalides ou exercice par défaut non souhaité - annulation de la requête');
          console.log('[RevuAnalytiqueNN1Detail] Condition vérifiée:', {
            id_compte,
            id_dossier,
            id_exercice,
            listeExerciceLength: listeExercice.length,
            selectedExerciceId
          });
          setRows([]);
          return;
        }

        let url = `/dashboard/revuAnalytiqueNN1/${id_compte}/${id_dossier}/${id_exercice}`;
        if (selectedPeriodeDates) {
          url += `?date_debut=${selectedPeriodeDates.date_debut}&date_fin=${selectedPeriodeDates.date_fin}`;
        }
        console.log('[RevuAnalytiqueNN1Detail] URL appelée:', url);

        const response = await axiosPrivate.get(url);
        console.log('[RevuAnalytiqueNN1Detail] Réponse revue analytique:', response.data);

        if (response.data.state) {
          const formattedRows = response.data.data.map((row, index) => ({
            id: index,
            compte: row.compte,
            libelle: row.libelle,
            soldeN: row.soldeN,
            soldeN1: row.soldeN1,
            var: row.var,
            varPourcent: row.varPourcent,
            anomalies: row.anomalies, // Garder les anomalies même si soldeN1 est null
            commentaire: row.commentaire,
            valide_anomalie: row.valide_anomalie
          }));
          setRows(formattedRows);
          console.log('[RevuAnalytiqueNN1Detail] Données formatées et mises à jour:', formattedRows.length, 'lignes');
        } else {
          console.error('[RevuAnalytiqueNN1Detail] Erreur dans la réponse revue analytique - state false:', response.data);
          setRows([]);
        }
      } catch (error) {
        console.error('[RevuAnalytiqueNN1Detail] Erreur lors de la récupération des données:', error);
        console.error('[RevuAnalytiqueNN1Detail] Détails erreur:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevuAnalytique();
  }, [axiosPrivate, getIds, selectedPeriodeDates, selectedExerciceId, listeExercice]);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState({ row: null, checked: false });

  const handleToggleValide = useCallback(
    (row, checked) => {
      // Ouvrir la popup de confirmation
      setConfirmDialogData({ row, checked });
      setConfirmDialogOpen(true);
    },
    []
  );

  const handleConfirmValidation = async () => {
    const { row, checked } = confirmDialogData;
    if (!row) return;

    try {
      const { id_compte, id_dossier, id_exercice } = getIds();
      const id_periode = selectedPeriodeId || null;

      // Appeler l'API RevuAnalytique pour valider/dévalider
      await axiosPrivate.post('/revuAnalytiqueStats/validateAnomaly', {
        id_compte: id_compte,
        id_exercice: id_exercice,
        id_dossier: id_dossier,
        id_periode: id_periode,
        compte: row.compte,
        type_revue: 'analytiqueNN1',
        validated: checked
      });

      await axiosPrivate.post('/commentaireAnalytique/addOrUpdate', {
        id_compte: id_compte,
        id_exercice: id_exercice,
        id_dossier: id_dossier,
        compte: row.compte,
        commentaire: row.commentaire || '',
        valide_anomalie: checked,
      });

      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, valide_anomalie: checked } : r)));
    } catch (error) {
      console.error('Erreur lors de la validation anomalie:', error);
    } finally {
      setConfirmDialogOpen(false);
      setConfirmDialogData({ row: null, checked: false });
    }
  };

  const handleCancelValidation = () => {
    setConfirmDialogOpen(false);
    setConfirmDialogData({ row: null, checked: false });
  };

  const handleSaveCommentaire = (savedCommentaire) => {
    const savedCompte = savedCommentaire?.compte;
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.compte === savedCompte
          ? {
            ...row,
            commentaire: savedCommentaire?.commentaire ?? row.commentaire,
            valide_anomalie: savedCommentaire?.valide_anomalie ?? row.valide_anomalie,
          }
          : row
      )
    );
  };

  const columns = useMemo(
    () => [
      {
        field: 'compte',
        headerName: 'Compte',
        flex: 1,
        minWidth: 130,
      },
      {
        field: 'libelle',
        headerName: 'Libelle',
        flex: 2,
        minWidth: 220,
      },
      {
        field: 'soldeN',
        headerName: 'Solde N',
        type: 'number',
        flex: 1,
        minWidth: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Box
            sx={{
              color: params.value > 0 ? 'blue' : params.value < 0 ? 'red' : 'inherit',
              fontWeight: params.value !== 0,
              fontSize: 12,
              width: '100%',
              textAlign: 'right'
            }}
          >
            {params.value?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
          </Box>
        ),
      },
      {
        field: 'soldeN1',
        headerName: 'Solde N-1',
        type: 'number',
        flex: 1,
        minWidth: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Box
            sx={{
              color: params.value > 0 ? 'blue' : params.value < 0 ? 'red' : 'inherit',
              fontWeight: params.value !== 0,
              fontSize: 12,
              width: '100%',
              textAlign: 'right'
            }}
          >
            {params.value?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
          </Box>
        ),
      },
      {
        field: 'var',
        headerName: 'Variation',
        type: 'number',
        flex: 1,
        minWidth: 120,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Box
            sx={{
              color: params.value > 0 ? 'blue' : params.value < 0 ? 'red' : 'inherit',
              fontWeight: params.value !== 0,
              fontSize: 12,
              width: '100%',
              textAlign: 'right'
            }}
          >
            {params.value?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
          </Box>
        ),
      },
      {
        field: 'varPourcent',
        headerName: 'Variation %',
        type: 'number',
        flex: 1,
        minWidth: 120,
        fontSize: 10,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (params) => {
          const value = params.value;
          return value !== null && value !== undefined ? `${value}%` : '';
        }
      },
      {
        field: 'anomalies',
        headerName: 'Anomalies',
        flex: 0.6,
        minWidth: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Checkbox
            size="small"
            checked={!!params.value}
            onChange={(e) => handleToggleAnomalie(params.row, e.target.checked)}
          />
        ),
      },
      {
        field: 'valide_anomalie',
        headerName: 'Validé',
        flex: 0.6,
        minWidth: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Checkbox
            size="small"
            checked={!!params.row.valide_anomalie}
            onChange={(e) => handleToggleValide(params.row, e.target.checked)}
          />
        ),
      },
      {
        field: 'commentaire',
        headerName: 'Commentaire',
        flex: 2,
        minWidth: 240,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Badge
              variant={params.row.commentaire && String(params.row.commentaire).trim() ? 'dot' : 'standard'}
              color="success"
              overlap="circular"
            >
              <IconButton
                size="small"
                onClick={() => {
                  const { id_compte, id_dossier, id_exercice } = getIds();
                  setSelectedRow({
                    ...params.row,
                    id_compte: id_compte,
                    id_exercice: id_exercice,
                    id_dossier: id_dossier,
                  });
                  setPopupOpen(true);
                }}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                <EditNoteIcon fontSize="small" />
              </IconButton>
            </Badge>
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {params.value || ''}
            </Box>
          </Box>
        ),
      },
    ],
    [getIds, handleToggleValide]
  );

  return (
    <>
      {noFile ? (
        <PopupTestSelectedFile
          confirmationState={sendToHome}
        />
      ) : (
        <Box sx={{ p: 2, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          {/* Dossier info */}
          <Box sx={{ mb: 1, width: '100px' }}>
            {InfoFileStyle(fileInfos?.dossier)}
          </Box>

          {/* Header with Exercise, Period */}
          <Box
            sx={{
              mb: 3,
              backgroundColor: 'white',
              p: 2,
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '3px solid rgba(241, 241, 241, 1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography component="div" variant="h7" sx={{ fontWeight: 600, color: '#333' }}>
                Traitement - Revue analytique N/N-1
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Stack direction="row" spacing={0} alignItems="center" sx={{ flex: '0 0 auto' }}>
                <Typography sx={{ minWidth: 70, fontSize: 15, mr: 1, whiteSpace: 'nowrap' }}>
                  Exercice :
                </Typography>
                <FormControl size="small" variant="outlined" sx={{ minWidth: 200 }}>
                  <Select
                    value={selectedExerciceId || ''}
                    onChange={(e) => handleChangeExercice(e.target.value)}
                    sx={{
                      height: 32,
                      fontSize: 15,
                      '& .MuiSelect-select': { py: 0.5 },
                    }}
                    MenuProps={{ disableScrollLock: true }}
                  >
                    {listeExercice.map((exercice) => (
                      <MenuItem key={exercice.id} value={exercice.id}>
                        {exercice.libelle_rang} - {formatDate(exercice.date_debut)} au {formatDate(exercice.date_fin)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {listePeriodes.length > 0 && (
                <Stack direction="row" spacing={0} alignItems="center" sx={{ flex: '0 0 auto' }}>
                  <Typography sx={{ minWidth: 70, fontSize: 15, mr: 1, whiteSpace: 'nowrap' }}>
                    Période :
                  </Typography>
                  <FormControl size="small" variant="outlined" sx={{ minWidth: 200 }}>
                    <Select
                      value={selectedPeriodeId}
                      onChange={(e) => handleChangePeriode(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em>Sélectionner une période...</em>;
                        }
                        const periode = listePeriodes.find(p => p.id === selected);
                        return periode ? `${formatDate(periode.date_debut)} au ${formatDate(periode.date_fin)}` : '';
                      }}
                      sx={{
                        height: 32,
                        fontSize: 15,
                        '& .MuiSelect-select': { py: 0.5 },
                      }}
                      MenuProps={{ disableScrollLock: true }}
                    >
                      <MenuItem value="" disabled>
                        <em>Sélectionner une période...</em>
                      </MenuItem>
                      {listePeriodes.map((periode) => (
                        <MenuItem key={periode.id} value={periode.id}>
                          {periode.libelle} {formatDate(periode.date_debut)} au {formatDate(periode.date_fin)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              )}
            </Box>
          </Box>

          {/* Tableau des résultats */}
          <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #E2E8F0' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Compte & Libellé</TableCell>
                  <TableCell sx={headerCellStyle}>Solde Actuel (N)</TableCell>
                  <TableCell sx={headerCellStyle}>Précédent (N-1)</TableCell>
                  <TableCell sx={headerCellStyle}>Variation</TableCell>
                  <TableCell sx={headerCellStyle}>Anom.</TableCell>
                  <TableCell sx={headerCellStyle}>Validé</TableCell>
                  <TableCell sx={headerCellStyle}>Action / Commentaire</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}><CircularProgress size={30} /></TableCell></TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Compte / Libellé */}
                      <TableCell sx={cellStyle}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={labelStyle}>Référence</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '14px' }}>{row.compte}</Typography>
                          <Typography sx={{ color: '#64748B', fontSize: '11px', mt: 0.5 }}>{row.libelle}</Typography>
                        </Box>
                      </TableCell>

                      {/* Solde N */}
                      <TableCell sx={cellStyle}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={labelStyle}>Montant N</Typography>
                          <Typography sx={{
                            fontWeight: 700,
                            color: row.soldeN < 0 ? '#EF4444' : '#3B82F6',
                            fontSize: '14px'
                          }}>
                            {row.soldeN?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Solde N-1 */}
                      <TableCell sx={cellStyle}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={labelStyle}>Montant N-1</Typography>
                          <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>
                            {row.soldeN1?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Variation */}
                      <TableCell sx={cellStyle}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={labelStyle}>Écart Relatif</Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: '13px' }}>
                            {row.var?.toLocaleString('fr-FR')} €
                          </Typography>
                          <Chip
                            label={`${row.varPourcent}%`}
                            size="small"
                            sx={{
                              height: '18px', fontSize: '10px', mt: 0.5, width: 'fit-content',
                              bgcolor: Math.abs(row.varPourcent) > 10 ? '#FEE2E2' : '#F1F5F9',
                              color: Math.abs(row.varPourcent) > 10 ? '#B91C1C' : '#475569'
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Checkbox Anomalies */}
                      <TableCell sx={cellStyle}>
                        <Checkbox size="small" checked={!!row.anomalies} color="error" />
                      </TableCell>

                      {/* Checkbox Validé */}
                      <TableCell sx={cellStyle}>
                        <Checkbox
                          size="small"
                          checked={!!row.valide_anomalie}
                          onChange={(e) => handleToggleValide(row, e.target.checked)}
                          color="success"
                        />
                      </TableCell>

                      {/* Commentaire / Action */}
                      <TableCell sx={cellStyle}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Badge
                            variant={row.commentaire?.trim() ? 'dot' : 'standard'}
                            color="success"
                            overlap="circular"
                          >
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedRow(row); setPopupOpen(true); }}
                              sx={{
                                bgcolor: '#3B82F6', color: 'white',
                                '&:hover': { bgcolor: '#2563EB' },
                                borderRadius: '6px'
                              }}
                            >
                              <EditNoteIcon fontSize="small" />
                            </IconButton>
                          </Badge>
                          <Typography sx={{
                            fontSize: '11px',
                            color: '#64748B',
                            fontStyle: 'italic',
                            maxWidth: '200px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {row.commentaire || "Aucun commentaire"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <PopupCommentaireAnalytique
            open={popupOpen}
            onClose={() => setPopupOpen(false)}
            compteData={selectedRow}
            onSave={handleSaveCommentaire}
          />

          {/* Dialog de confirmation pour validation */}
          <Dialog
            open={confirmDialogOpen}
            onClose={handleCancelValidation}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
          >
            <DialogTitle id="confirm-dialog-title">
              Confirmation de validation
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="confirm-dialog-description">
                {confirmDialogData.checked
                  ? 'Êtes-vous sûr de vouloir valider cette anomalie ?'
                  : 'Êtes-vous sûr de vouloir annuler la validation de cette anomalie ?'}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelValidation} color="inherit">
                Annuler
              </Button>
              <Button onClick={handleConfirmValidation} color="primary" variant="contained" autoFocus>
                Confirmer
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
}
