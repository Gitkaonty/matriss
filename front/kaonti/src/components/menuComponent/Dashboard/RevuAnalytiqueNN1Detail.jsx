import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Typography, Button, Stack, FormControl, Select, MenuItem, Paper, Badge,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, Box, IconButton, alpha, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Breadcrumbs, TablePagination
} from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { init } from '../../../../init';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { InfoFileStyle } from '../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../componentsTools/popupTestSelectedFile';
import PopupCommentaireAnalytique from './PopupCommentaireAnalytique';

import ExercicePeriodeSelector from '../../componentsTools/ExercicePeriodeSelector/ExercicePeriodeSelector';
import { useExercicePeriode } from '../../../context/ExercicePeriodeContext';


import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/HighlightOff';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';

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

    const NEON_MINT = '#00FF94';
    const NAV_DARK = '#0B1120';
    const BG_SOFT = '#F8FAFC';

    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const { id_compte, id_dossier, id_exercice } = useParams();
    const [searchParams] = useSearchParams();

    // Récupérer les paramètres d'URL si présents
    const urlDateDebut = searchParams.get('date_debut');
    const urlDateFin = searchParams.get('date_fin');

    const [listeExercice, setListeExercice] = useState([]);

    const [fileInfos, setFileInfos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [noFile, setNoFile] = useState(false);
    const [fileId, setFileId] = useState(parseInt(id_dossier) || 0);

    // === Périodes ===
    const [listePeriodes, setListePeriodes] = useState([]);


    // === Données du tableau ===
    const [rows, setRows] = useState([]);
    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25); // Valeur par défaut

    const {
        selectedExerciceId,
        selectedPeriodeId,
        selectedPeriodeDates,
        handleChangeExercice,
        handleChangePeriode,
        loading: contextLoading
    } = useExercicePeriode();


    // const headerCellStyle = {
    //     bgcolor: '#F8FAFC',
    //     color: '#64748B',
    //     fontSize: '10px',
    //     fontWeight: 800,
    //     textTransform: 'uppercase',
    //     whiteSpace: 'nowrap',
    //     py: 1.5,
    //     px: 1,
    //     borderRight: '1px solid rgba(255,255,255,0.1)'
    // };
    const headerCellStyle = {
        fontWeight: 800,
        textTransform: 'uppercase',
        backgroundColor: '#F8FAFC',
        color: '#64748B',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        fontSize: '10px', // Légèrement plus petit pour l'équilibre
        py: 0.5,             // On réduit le padding vertical (0.5 = 4px au lieu de 1 = 8px)
        lineHeight: '1.2rem', // Contrôle précis de la hauteur du texte
        height: '30px'       // Force la hauteur minimale
    };

    const cellStyle = {
        py: 0.5,
        px: 0.5,
        fontSize: '12px',
        height: '20px'
    };

    const K_COLORS = {
        slate: '#64748B',
        black: '#1E293B'
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

    useEffect(() => {
        fetchDossierInfos();
    }, [fetchDossierInfos]);


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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Calcul des lignes à afficher pour la page courante
    const displayedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            {noFile ? (
                <PopupTestSelectedFile
                    confirmationState={sendToHome}
                />
            ) : (
                <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
                    <br />
                    <Typography variant='h6' sx={{ fontWeight: 800, color: NAV_DARK, ml: 2 }}>
                        Revue analytique N/N-1
                    </Typography>
                    <br />
                    <Box
                        sx={{
                            mb: 3,
                            backgroundColor: 'white',
                            p: 2,
                            ml: 2,
                            mr: 3,
                            borderRadius: 3,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Stack direction="row" spacing={0} alignItems="center" sx={{ flex: '0 0 auto' }}>
                                <ExercicePeriodeSelector
                                    selectedExerciceId={selectedExerciceId}
                                    selectedPeriodeId={selectedPeriodeId}
                                    onExerciceChange={handleChangeExercice}
                                    onPeriodeChange={handleChangePeriode}
                                    disabled={loading}
                                    size="small"
                                />
                            </Stack>
                        </Box>
                    </Box>
                    <Box sx={{ px: 0, pr: 1 }}>
                        <Stack
                            maxWidth="98%" // 32px = 16px de chaque côté
                            height="650px"
                            minHeight="400px"
                            sx={{
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                bgcolor: '#fff',
                                mx: 'auto',
                                display: 'flex', // Assure le comportement flex
                                flexDirection: 'column' // Aligne TableContainer et Pagination verticalement
                            }}
                        >                    {/* Tableau des résultats */}
                            <TableContainer
                                sx={{
                                    flex: '1 1 auto', // Force le conteneur à prendre TOUT l'espace disponible
                                    height: '0px',   // Astuce CSS : permet au scroll de s'activer correctement dans un flex-item
                                    overflow: 'auto',
                                    bgcolor: '#fff',
                                    // --- STYLE DE LA SCROLLBAR ---
                                    '&::-webkit-scrollbar': { width: 8, height: 8 },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'linear-gradient(to bottom, #F8FAFC 0px, #F8FAFC 35px, white 35px, white 100%)',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: alpha(K_COLORS.slate, 0.2),
                                        borderRadius: 4,
                                        border: '2px solid transparent',
                                        backgroundClip: 'content-box',
                                    },
                                    '&::-webkit-scrollbar-corner': { backgroundColor: '#F8FAFC' }
                                }}
                            >
                                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: 1200 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ ...headerCellStyle, width: 70 }}>Compte</TableCell>
                                            <TableCell sx={{ ...headerCellStyle, width: 220 }}>Libelle</TableCell>
                                            <TableCell align="right" sx={{ ...headerCellStyle, width: 130 }}>Solde N-1</TableCell>
                                            <TableCell align="right" sx={{ ...headerCellStyle, width: 130 }}>Solde N</TableCell>
                                            <TableCell align="right" sx={{ ...headerCellStyle, width: 80 }}>Variation</TableCell>
                                            <TableCell align="center" sx={{ ...headerCellStyle, width: 80 }}>Variation %</TableCell>
                                            <TableCell align="center" sx={{ ...headerCellStyle, width: 50 }}>Anomalies</TableCell>
                                            <TableCell align="center" sx={{ ...headerCellStyle, width: 50 }}>Validé</TableCell>
                                            <TableCell sx={{ ...headerCellStyle, width: 120, borderRight: 'none' }}>Commentaire</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                                                    <CircularProgress size={30} />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            displayedRows.map((row, index) => (
                                                <TableRow
                                                    key={row.id || index}
                                                    hover
                                                    sx={{ height: 30, bgcolor: '#fff' }}
                                                >
                                                    {/* Compte / Libellé */}
                                                    <TableCell sx={{ ...cellStyle, fontWeight: 700, textOverflow: 'ellipsis' }}>{row.compte}</TableCell>
                                                    <TableCell sx={{ ...cellStyle, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.libelle}</TableCell>

                                                    {/* Colonnes Montants */}
                                                    {[
                                                        { field: 'soldeN1', val: row.soldeN1 },
                                                        { field: 'soldeN', val: row.soldeN },
                                                        { field: 'var', val: row.var }
                                                    ].map((item) => (
                                                        <TableCell key={item.field} align="right" sx={{
                                                            ...cellStyle,
                                                            color: item.val > 0 ? '#2563eb' : item.val < 0 ? '#dc2626' : K_COLORS.slate,
                                                            fontWeight: item.val !== 0 ? 600 : 400,
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {item.val?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                                                        </TableCell>
                                                    ))}

                                                    {/* Variation % avec Chip */}
                                                    <TableCell align="center" sx={{ ...cellStyle, padding: '2px 4px', verticalAlign: 'middle' }}>
                                                        {row.varPourcent !== null ? (
                                                            <Chip
                                                                label={`${row.varPourcent > 0 ? '+' : ''}${row.varPourcent}%`}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    height: 20,
                                                                    minWidth: '55px',
                                                                    fontSize: '10px',
                                                                    fontWeight: 700,
                                                                    fontFamily: 'monospace',
                                                                    color: row.varPourcent > 0 ? '#2563eb' : row.varPourcent < 0 ? '#dc2626' : 'inherit',
                                                                    borderColor: row.varPourcent > 0 ? alpha('#2563eb', 0.5) : row.varPourcent < 0 ? alpha('#dc2626', 0.5) : alpha(K_COLORS.slate, 0.3),
                                                                    bgcolor: row.varPourcent > 0 ? alpha('#2563eb', 0.04) : row.varPourcent < 0 ? alpha('#dc2626', 0.04) : 'transparent',
                                                                    '& .MuiChip-label': { px: 0.5, width: '100%', textAlign: 'center' }
                                                                }}
                                                            />
                                                        ) : (
                                                            <Box sx={{ color: alpha(K_COLORS.slate, 0.3), textAlign: 'center' }}>-</Box>
                                                        )}
                                                    </TableCell>

                                                    {/* Checkbox Anomalies */}
                                                    <TableCell sx={cellStyle} align="center">
                                                        <Checkbox size="small" checked={!!row.anomalies} sx={{ p: 0, '&.Mui-disabled': { color: row.anomalies ? '#f59e0b' : '#10b981' } }} />
                                                    </TableCell>

                                                    {/* Checkbox Validé */}
                                                    <TableCell sx={cellStyle} align="center">
                                                        <Checkbox
                                                            size="small"
                                                            checked={!!row.valide_anomalie}
                                                            onChange={(e) => handleToggleValide(row, e.target.checked)}
                                                            sx={{ p: 0, '&.Mui-disabled': { color: row.valide_anomalie ? '#16a34a' : alpha(K_COLORS.slate, 0.2) } }}
                                                        />
                                                    </TableCell>

                                                    {/* Commentaire / Action */}
                                                    <TableCell sx={{ ...cellStyle, borderRight: 'none' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                            <Badge variant={row.commentaire?.trim() ? 'dot' : 'standard'} color="success" overlap="circular">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        const { id_compte, id_dossier, id_exercice } = getIds();
                                                                        setSelectedRow({ ...row, id_compte, id_dossier, id_exercice });
                                                                        setPopupOpen(true);
                                                                    }}
                                                                    sx={{ bgcolor: '#3B82F6', color: 'white', '&:hover': { bgcolor: '#2563EB' }, borderRadius: '6px' }}
                                                                >
                                                                    <EditNoteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Badge>
                                                            <Typography sx={{
                                                                fontSize: '11px', color: '#64748B', fontStyle: 'italic', maxWidth: '200px',
                                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
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

                            {/* BARRE DE PAGINATION */}
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={rows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Lignes par page :"
                                // --- AJUSTEMENT DE LA TAILLE ICI ---
                                sx={{
                                    borderTop: '1px solid rgba(0,0,0,0.1)',
                                    bgcolor: '#F8FAFC',
                                    flexShrink: 0,
                                    // On cible la toolbar interne de MUI pour agrandir la hauteur
                                    '& .MuiToolbar-root': {
                                        minHeight: 52, // Augmente la hauteur (par défaut ~48px)
                                        height: 52,
                                    },
                                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                        fontSize: '0.85rem', // Texte un peu plus lisible
                                        margin: 0
                                    },
                                    '& .MuiTablePagination-actions': {
                                        marginLeft: 2, // Espace un peu plus les flèches du texte
                                    }
                                }}
                            />
                        </Stack>
                    </Box>
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
                </Box >
            )
            }
        </>
    );
}
