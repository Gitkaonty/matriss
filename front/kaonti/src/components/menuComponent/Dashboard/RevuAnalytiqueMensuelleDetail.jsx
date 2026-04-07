import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Stack,
    FormControl,
    Select,
    MenuItem,
    Paper,
    IconButton,
    alpha,
    Badge,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Breadcrumbs,
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
import NavigateNextIcon from '@mui/icons-material/NavigateNext';


import ExercicePeriodeSelector from '../../componentsTools/ExercicePeriodeSelector/ExercicePeriodeSelector';
import { useExercicePeriode } from '../../../context/ExercicePeriodeContext';

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

export default function RevuAnalytiqueMensuelleDetail() {
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
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogData, setConfirmDialogData] = useState({ row: null, checked: false });

    // === Périodes ===
    const [listePeriodes, setListePeriodes] = useState([]);

    // === Données du tableau ===
    const [rows, setRows] = useState([]);
    const [moisColumns, setMoisColumns] = useState([]);
    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const scrollContainerRef = useRef(null);

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
        console.log('[RevuAnalytiqueMensuelleDetail] Début fetchExercices');
        try {
            const { id_dossier } = getIds();
            console.log('[RevuAnalytiqueMensuelleDetail] Récupération exercices pour id_dossier:', id_dossier);
            const response = await axiosPrivate.get(`/paramExercice/listeExercice/${id_dossier}`);
            const resData = response.data;
            console.log('[RevuAnalytiqueMensuelleDetail] Réponse exercices:', resData);
            if (resData.state) {
                setListeExercice(resData.list);
                console.log('[RevuAnalytiqueMensuelleDetail] Liste exercices mise à jour:', resData.list);
                // Sélectionner l'exercice correspondant aux dates URL ou le premier
                if (resData.list && resData.list.length > 0) {
                    if (urlDateDebut && urlDateFin) {
                        const matchingExercice = resData.list.find(e =>
                            e.date_debut === urlDateDebut && e.date_fin === urlDateFin
                        );
                        if (matchingExercice) {
                            setSelectedExerciceId(matchingExercice.id);
                            console.log('[RevuAnalytiqueMensuelleDetail] Exercice sélectionné par dates URL:', matchingExercice);
                        } else {
                            setSelectedExerciceId(resData.list[0].id);
                            console.log('[RevuAnalytiqueMensuelleDetail] Aucun exercice trouvé pour dates URL, sélection du premier:', resData.list[0]);
                        }
                    } else if (selectedExerciceId === 0) {
                        setSelectedExerciceId(resData.list[0].id);
                        console.log('[RevuAnalytiqueMensuelleDetail] Sélection du premier exercice par défaut:', resData.list[0]);
                    }
                }
            } else {
                console.error('[RevuAnalytiqueMensuelleDetail] Erreur dans la réponse exercices - state false:', resData);
            }
        } catch (error) {
            console.error('[RevuAnalytiqueMensuelleDetail] Error fetching exercices:', error);
            console.error('[RevuAnalytiqueMensuelleDetail] Détails erreur:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }
    }, [axiosPrivate, getIds, urlDateDebut, urlDateFin, selectedExerciceId]);

    const fetchDossierInfos = useCallback(async () => {
        console.log('[RevuAnalytiqueMensuelleDetail] Début fetchDossierInfos');
        try {
            const { id_dossier } = getIds();
            console.log('[RevuAnalytiqueMensuelleDetail] Récupération infos dossier pour id_dossier:', id_dossier);
            const response = await axiosPrivate.get(`/home/FileInfos/${id_dossier}`);
            const resData = response.data;
            console.log('[RevuAnalytiqueMensuelleDetail] Réponse infos dossier:', resData);
            if (resData.state && resData.fileInfos && resData.fileInfos.length > 0) {
                setFileInfos(resData.fileInfos[0]);
                console.log('[RevuAnalytiqueMensuelleDetail] Infos dossier mises à jour:', resData.fileInfos[0]);
            } else {
                console.error('[RevuAnalytiqueMensuelleDetail] Erreur dans la réponse infos dossier - state false ou fileInfos vide:', resData);
            }
        } catch (error) {
            console.error('[RevuAnalytiqueMensuelleDetail] Error fetching dossier infos:', error);
            console.error('[RevuAnalytiqueMensuelleDetail] Détails erreur:', {
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



    // Récupérer les données de la revue analytique mensuelle
    useEffect(() => {
        const fetchRevuAnalytiqueMensuelle = async () => {
            console.log('[RevuAnalytiqueMensuelleDetail] Début fetchRevuAnalytiqueMensuelle');
            try {
                setLoading(true);
                const { id_compte, id_dossier, id_exercice } = getIds();
                console.log('[RevuAnalytiqueMensuelleDetail] IDs utilisés:', { id_compte, id_dossier, id_exercice });
                console.log('[RevuAnalytiqueMensuelleDetail] Période sélectionnée:', selectedPeriodeDates);
                console.log('[RevuAnalytiqueMensuelleDetail] selectedExerciceId:', selectedExerciceId, 'listeExercice.length:', listeExercice.length);

                // Ne pas faire l'appel si l'exerciceId est la valeur par défaut (1) et que les exercices ne sont pas encore chargés
                // ou si l'exerciceId par défaut est utilisé mais qu'il y a des exercices disponibles
                if (!id_compte || !id_dossier || !id_exercice ||
                    (id_exercice === 1 && (listeExercice.length === 0 || selectedExerciceId === 0))) {
                    console.error('[RevuAnalytiqueMensuelleDetail] IDs invalides ou exercice par défaut non souhaité - annulation de la requête');
                    console.log('[RevuAnalytiqueMensuelleDetail] Condition vérifiée:', {
                        id_compte,
                        id_dossier,
                        id_exercice,
                        listeExerciceLength: listeExercice.length,
                        selectedExerciceId
                    });
                    setRows([]);
                    setMoisColumns([]);
                    return;
                }

                let url = `/dashboard/revuAnalytiqueMensuelle/${id_compte}/${id_dossier}/${id_exercice}`;
                if (selectedPeriodeDates) {
                    url += `?date_debut=${selectedPeriodeDates.date_debut}&date_fin=${selectedPeriodeDates.date_fin}`;
                }
                console.log('[RevuAnalytiqueMensuelleDetail] URL appelée:', url);

                const response = await axiosPrivate.get(url);
                console.log('[RevuAnalytiqueMensuelleDetail] Réponse revue analytique mensuelle:', response.data);

                if (response.data.state) {
                    setRows(response.data.data);
                    setMoisColumns(response.data.moisColumns || []);
                    console.log('[RevuAnalytiqueMensuelleDetail] Données mensuelles mises à jour:', {
                        nombreLignes: response.data.data?.length || 0,
                        nombreColonnes: response.data.moisColumns?.length || 0,
                        colonnes: response.data.moisColumns
                    });
                } else {
                    console.error('[RevuAnalytiqueMensuelleDetail] Erreur dans la réponse revue analytique mensuelle - state false:', response.data);
                    setRows([]);
                    setMoisColumns([]);
                }
            } catch (error) {
                console.error('[RevuAnalytiqueMensuelleDetail] Erreur lors de la récupération des données mensuelles:', error);
                console.error('[RevuAnalytiqueMensuelleDetail] Détails erreur:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                setRows([]);
                setMoisColumns([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRevuAnalytiqueMensuelle();
    }, [axiosPrivate, getIds, selectedPeriodeDates, selectedExerciceId, listeExercice]);

    const handleToggleAnomalie = useCallback(
        async (row, checked) => {
            try {
                const { id_compte, id_dossier, id_exercice } = getIds();
                const id_periode = selectedPeriodeId || null;

                // Appeler l'API RevuAnalytique pour incrémenter/décrémenter
                const endpoint = checked ? '/revuAnalytiqueStats/incrementAnomaly' : '/revuAnalytiqueStats/decrementAnomaly';
                await axiosPrivate.post(endpoint, {
                    id_compte: id_compte,
                    id_exercice: id_exercice,
                    id_dossier: id_dossier,
                    id_periode: id_periode,
                    compte: row.compte,
                    type_revue: 'analytiqueMensuelle'
                });

                // Mettre à jour le commentaire (sans anomalies)
                await axiosPrivate.post('/commentaireAnalytiqueMensuelle/addOrUpdate', {
                    id_compte: id_compte,
                    id_exercice: id_exercice,
                    id_dossier: id_dossier,
                    compte: row.compte,
                    commentaire: row.commentaire || '',
                    valide_anomalie: row.valide_anomalie
                });

                setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, anomalies: checked } : r)));
            } catch (error) {
                console.error('Erreur lors de la mise à jour anomalie:', error);
            }
        },
        [axiosPrivate, getIds, selectedPeriodeId]
    );

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

            await axiosPrivate.post('/revuAnalytiqueStats/validateAnomaly', {
                id_compte: id_compte,
                id_exercice: id_exercice,
                id_dossier: id_dossier,
                id_periode: selectedPeriodeId || null,
                compte: row.compte,
                type_revue: 'analytiqueMensuelle',
                validated: checked
            });

            await axiosPrivate.post('/commentaireAnalytiqueMensuelle/addOrUpdate', {
                id_compte: id_compte,
                id_exercice: id_exercice,
                id_dossier: id_dossier,
                compte: row.compte,
                commentaire: row.commentaire || '',
                valide_anomalie: checked
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

    // Styles pour les colonnes sticky
    const stickyCol0Style = { position: 'sticky', left: 0, zIndex: 2, width: 80, bgcolor: '#F8FAFC', };
    const stickyCol1Style = { position: 'sticky', left: 98, zIndex: 2, minWidth: 180, bgcolor: '#F8FAFC', };

    const K_COLORS = {
        black: '#010810',
        cyan: '#00e5ff',
        slate: '#64748b',
        border: '#f1f5f9',
        white: '#ffffff',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc' // Un gris plus subtil
    };

    // On s'assure que le Header a bien un fond noir et est collé en haut (top: 0)
    const stickyTotalStyle = {
        position: 'sticky',
        right: 334,
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        top: 0, // Indispensable pour le Header
        bgcolor: '#F8FAFC', // On force la couleur ici
    };

    const stickyAnomaliesStyle = {
        position: 'sticky',
        right: 236,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
        top: 0,
        bgcolor: '#F8FAFC',
    };

    const stickyValideStyle = {
        position: 'sticky',
        right: 156,
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        top: 0,
        bgcolor: '#F8FAFC',
    };

    const stickyCommentaireStyle = {
        position: 'sticky',
        right: 0,
        width: 150,
        minWidth: 150,
        maxWidth: 150,
        top: 0,
        bgcolor: '#F8FAFC',
    };
    const headerCellStyle = {

        bgcolor: '#F8FAFC',
        color: '#64748B',
        fontSize: '10px',
        fontWeight: 800,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        py: 1.5,
        px: 1,
        borderRight: '1px solid rgba(255,255,255,0.1)'
    };
    const cellStyle = {
        py: 0.5,
        px: 0.5,
        fontSize: '13px',
        lineHeight: 1.2
    };


    const stickyHeaderStyle = {
        position: 'sticky',
        top: 0,
        zIndex: 4,
        backgroundColor: initial.tableau_theme,
        color: initial.text_theme,
        fontWeight: 600,
        fontSize: '12px',
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Calcul des lignes à afficher pour la page courante
    const displayedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const compactCellStyle = {
        py: 0.25,
        px: 0.5,
        height: '28px',
        fontSize: '0.8rem',
        lineHeight: 1.2,
    };


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
                        Revue analytique mensuelle
                    </Typography>
                    <br />
                    {/* Header with Exercise, Period */}
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

                    {/* Tableau des résultats */}
                    <Box sx={{ px: 0, pr: 1 }}>
                        <Stack
                            height="650px"
                            minHeight="400px"
                            sx={{
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                bgcolor: '#fff',
                                mx: 'auto',
                                ml: 2,
                                mr: 2,
                                display: 'flex', // Assure le comportement flex
                                flexDirection: 'column' // Aligne TableContainer et Pagination verticalement
                            }}
                        >
                            <TableContainer
                                sx={{
                                    flex: '1 1 auto', // Force le conteneur à prendre TOUT l'espace disponible
                                    height: '100%',   // Astuce CSS : permet au scroll de s'activer correctement dans un flex-item
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
                                <Table
                                    stickyHeader
                                    size="small"
                                    sx={{
                                        tableLayout: 'fixed',
                                        minWidth: 280 + moisColumns.length * 110 + 530,
                                    }}
                                    className="dense-table"
                                >
                                    <TableHead>
                                        <TableRow>
                                            {/* Colonnes fixes GAUCHE - zIndex 10 pour écraser tout au scroll */}
                                            <TableCell sx={{ ...headerCellStyle, ...stickyCol0Style, zIndex: 10 }}>Compte</TableCell>
                                            <TableCell sx={{ ...headerCellStyle, ...stickyCol1Style, zIndex: 10 }}>Libellé</TableCell>

                                            {/* Colonnes mois - zIndex standard 5 (stickyHeader) */}
                                            {moisColumns.map((mois) => (
                                                <TableCell
                                                    key={mois.nom}
                                                    align="right"
                                                    sx={{ ...headerCellStyle, minWidth: 110, maxWidth: 110, zIndex: 5, bgcolor: '#F8FAFC', }}
                                                >
                                                    {mois.nomAffiche}
                                                </TableCell>
                                            ))}

                                            {/* Colonnes fixes DROITE - zIndex 10 pour l'angle Header/Sticky */}
                                            <TableCell align="right" sx={{ ...headerCellStyle, ...stickyTotalStyle, zIndex: 10 }}>Total</TableCell>
                                            <TableCell align="center" sx={{ ...headerCellStyle, ...stickyAnomaliesStyle, zIndex: 10 }}>Anomalies</TableCell>
                                            <TableCell align="center" sx={{ ...headerCellStyle, ...stickyValideStyle, zIndex: 10 }}>Validé</TableCell>
                                            <TableCell sx={{ ...headerCellStyle, ...stickyCommentaireStyle, zIndex: 10 }}>Commentaire</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row, index) => {
                                            return (
                                                <TableRow key={row.id} hover>
                                                    {/* Colonnes fixes */}
                                                    <TableCell sx={{ ...cellStyle, ...stickyCol0Style, ...compactCellStyle, bgcolor: '#fff', fontWeight: 700, zIndex: 2, color: '#000', textOverflow: 'ellipsis' }}>
                                                        {row.compte}
                                                    </TableCell>
                                                    <TableCell sx={{ ...cellStyle, ...stickyCol1Style, ...compactCellStyle, bgcolor: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', zIndex: 2, color: '#000' }}>
                                                        {row.libelle}
                                                    </TableCell>

                                                    {/* Colonnes mois */}
                                                    {moisColumns.map((mois) => {
                                                        const value = row[mois.nom];
                                                        return (
                                                            <TableCell
                                                                key={mois.nom}
                                                                align="right"
                                                                sx={{
                                                                    ...cellStyle,
                                                                    ...compactCellStyle,
                                                                    minWidth: 110,
                                                                    maxWidth: 110,
                                                                    bgcolor: '#fff',
                                                                    fontFamily: 'monospace',
                                                                    color: value > 0 ? '#2563eb' : value < 0 ? '#dc2626' : K_COLORS.slate,
                                                                    fontWeight: value !== 0 ? 600 : 400,
                                                                }}
                                                            >
                                                                {value?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                                                            </TableCell>
                                                        );
                                                    })}

                                                    {/* Total */}
                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            ...cellStyle,
                                                            ...stickyTotalStyle,
                                                            ...compactCellStyle,
                                                            bgcolor: '#fff', // Légère nuance pour le total
                                                            fontFamily: 'monospace',
                                                            fontWeight: 800,
                                                            color: K_COLORS.black
                                                        }}                                                    >
                                                        {row.total_exercice?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                                                    </TableCell>

                                                    {/* Anomalies */}
                                                    <TableCell align="center" sx={{ ...cellStyle, ...stickyAnomaliesStyle, ...compactCellStyle, bgcolor: '#fff' }}>
                                                        <Checkbox
                                                            size="small"
                                                            checked={!!row.anomalies}
                                                            onChange={(e) => handleToggleAnomalie(row, e.target.checked)}
                                                            sx={{
                                                                p: 0,
                                                                color: row.anomalies ? 'orange' : 'green',
                                                                '&.Mui-checked': {
                                                                    color: 'orange',
                                                                },
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Validé */}
                                                    <TableCell align="center" sx={{ ...cellStyle, ...stickyValideStyle, ...compactCellStyle, bgcolor: '#fff' }}>
                                                        <Checkbox
                                                            size="small"
                                                            checked={!!row.valide_anomalie}
                                                            onChange={(e) => handleToggleValide(row, e.target.checked)}
                                                            sx={{
                                                                p: 0,
                                                                color: row.valide_anomalie ? '#16a34a' : alpha(K_COLORS.slate, 0.3)
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Commentaire */}
                                                    <TableCell sx={{ ...cellStyle, ...stickyCommentaireStyle, ...compactCellStyle, bgcolor: '#fff' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Badge
                                                                variant={row.commentaire && String(row.commentaire).trim() ? 'dot' : 'standard'}
                                                                color="success"
                                                                overlap="circular"
                                                            >
                                                                <IconButton
                                                                    size="small"
                                                                    // sx={{ bgcolor: '#3B82F6', color: 'white', '&:hover': { bgcolor: '#2563EB' }, borderRadius: '6px' }}
                                                                    onClick={() => {
                                                                        const { id_compte, id_dossier, id_exercice } = getIds();
                                                                        setSelectedRow({
                                                                            ...row,
                                                                            id_compte: id_compte,
                                                                            id_exercice: id_exercice,
                                                                            id_dossier: id_dossier,
                                                                        });
                                                                        setPopupOpen(true);
                                                                    }}
                                                                >
                                                                    <EditNoteIcon fontSize="small" color='blue' />
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
                                            );
                                        })}
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
                        apiBasePath="/commentaireAnalytiqueMensuelle"
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