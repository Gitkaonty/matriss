import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    FormControl,
    Select,
    MenuItem,
    Paper,
    Alert,
    Tabs,
    Tab,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Collapse
} from '@mui/material';
import {
    ChevronRight, ChatBubbleOutline, KeyboardArrowDown,
    KeyboardArrowUp, ErrorOutline, CheckCircle, ChevronLeft, DoneAll, History, Search, Cancel
} from '@mui/icons-material';
import CommentIcon from '@mui/icons-material/Comment';
import { DataGrid } from '@mui/x-data-grid';
import { init } from '../../../../../init';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import ExercicePeriodeSelector from '../../../componentsTools/ExercicePeriodeSelector/ExercicePeriodeSelector';
import { useExercicePeriode } from '../../../../context/ExercicePeriodeContext';

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

// Types d'anomalies
const ANOMALIE_TYPES = {
    paiement_sans_facture: {
        label: 'Paiement sans facture',
        color: 'warning',
        description: 'Le paiement a été effectué sans qu’une facture soit enregistrée.'
    },
    facture_3mois_non_reglee: {
        label: 'Factures > 3 mois non réglées',
        color: 'error',
        description: 'Cette facture n’a pas été réglée depuis plus de 3 mois.'
    },
    ajustement_non_traite: {
        label: 'Ajustements non traité',
        color: 'info',
        description: 'Certains ajustements comptables n’ont pas encore été traités.'
    },
    solde_suspens: {
        label: 'Solde en suspens',
        color: 'default',
        description: 'Le compte présente un solde en suspens à vérifier.'
    }
};

export default function RevisionFournisseurClient() {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    // Utiliser le contexte global pour exercice et période
    const {
        selectedExerciceId,
        selectedPeriodeId,
        selectedPeriodeDates,
        handleChangeExercice,
        handleChangePeriode,
        loading: contextLoading,
        getApiParams
    } = useExercicePeriode();

    const [activeTab, setActiveTab] = useState(0); // 0 = Fournisseur, 1 = Client
    const [fileInfos, setFileInfos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [noFile, setNoFile] = useState(false);
    const [fileId, setFileId] = useState(0);

    // === Résultats séparés par onglet ===
    const [resultatsFournisseur, setResultatsFournisseur] = useState([]);
    const [resultatsClient, setResultatsClient] = useState([]);
    const [selectedCompte, setSelectedCompte] = useState(null);

    // === Dialog validation ===
    const [openValidationDialog, setOpenValidationDialog] = useState(false);
    const [selectedAnomalie, setSelectedAnomalie] = useState(null);
    const [validationCommentaire, setValidationCommentaire] = useState('');

    // === Dialog commentaire ===
    const [openCommentDialog, setOpenCommentDialog] = useState(false);
    const [selectedCommentAnomalie, setSelectedCommentAnomalie] = useState(null);
    const [commentaireText, setCommentaireText] = useState('');

    // === Dialog confirmation analyse ===
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const [periodeErrorPopup, setPeriodeErrorPopup] = useState({ open: false, message: '' });

    // === Pagination par compte (séparée par onglet) ===
    const [compteIndexFournisseur, setCompteIndexFournisseur] = useState(0);
    const [compteIndexClient, setCompteIndexClient] = useState(0);

    const [expandedType, setExpandedType] = useState(null); // ID du type d'anomalie déplié

    const [selectedType, setSelectedType] = useState(null);

    const handleOpenCommentDialog = (anomalie) => {
        setSelectedCommentAnomalie(anomalie);
        setCommentaireText(anomalie.commentaire_validation || '');
        setOpenCommentDialog(true);
    };

    const handleAnalyserClick = () => {
        if (!selectedPeriodeId || selectedPeriodeId === 'exercice') {
            setPeriodeErrorPopup({
                open: true,
                message: 'Veuillez sélectionner une période spécifique avant de lancer l\'analyse.'
            });
            return;
        }
        setOpenConfirmDialog(true);
    };

    const handleConfirmAnalyser = async () => {
        setOpenConfirmDialog(false);
        await handleAnalyser();
    };

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    };

    // Vérifier si un dossier est sélectionné au chargement
    useEffect(() => {
        const idDossier = sessionStorage.getItem('fileId');
        if (!idDossier || idDossier === '0') {
            setNoFile(true);
        } else {
            setFileId(parseInt(idDossier));
            setNoFile(false);
        }
    }, []);

    const getIds = () => {
        const pathParts = window.location.pathname.split('/');
        const idIndex = pathParts.indexOf('revisionFournisseurClient') + 1;
        return {
            id_compte: parseInt(sessionStorage.getItem('compteId')) || 1,
            id_dossier: parseInt(sessionStorage.getItem('fileId')) || parseInt(pathParts[idIndex]) || 1,
            id_exercice: selectedExerciceId || parseInt(sessionStorage.getItem('exerciceId')) || 1
        };
    };

    const fetchDossierInfos = async () => {
        try {
            const { id_dossier } = getIds();
            const response = await axiosPrivate.get(`/home/FileInfos/${id_dossier}`);
            const resData = response.data;
            if (resData.state && resData.fileInfos && resData.fileInfos.length > 0) {
                setFileInfos(resData.fileInfos[0]);
            }
        } catch (error) {
            console.error('Error fetching dossier infos:', error);
        }
    };

    useEffect(() => {
        fetchDossierInfos();
    }, []);

    const getApiBasePath = () => {
        return activeTab === 0
            ? '/administration/analyseFournisseurClient'
            : '/administration/analyseClient';
    };

    const handleAnalyser = async () => {
        if (!selectedExerciceId) return;

        setLoading(true);
        try {
            const { id_compte, id_dossier, id_exercice } = getIds();

            const params = new URLSearchParams();
            if (selectedPeriodeDates) {
                params.append('date_debut', selectedPeriodeDates.date_debut);
                params.append('date_fin', selectedPeriodeDates.date_fin);
            }
            // La logique de récupération des dates de l'exercice sera gérée par le composant ExercicePeriodeSelector
            // et passée via selectedPeriodeDates si nécessaire
            if (selectedPeriodeId) {
                params.append('id_periode', selectedPeriodeId);
            }
            const queryString = params.toString();

            // Lancer les deux analyses en parallele
            const [fournisseurResponse, clientResponse] = await Promise.all([
                axiosPrivate.post(`/administration/analyseFournisseurClient/${id_compte}/${id_dossier}/${id_exercice}/analyser?${queryString}`),
                axiosPrivate.post(`/administration/analyseClient/${id_compte}/${id_dossier}/${id_exercice}/analyser?${queryString}`)
            ]);

            if (fournisseurResponse.data.state) {
                setResultatsFournisseur(fournisseurResponse.data.resultats || []);
            } else {
                setResultatsFournisseur([]);
            }

            if (clientResponse.data.state) {
                setResultatsClient(clientResponse.data.resultats || []);
            } else {
                setResultatsClient([]);
            }
        } catch (error) {
            console.error('Error executing analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValiderAnomalie = async (anomalie, valider) => {
        if (!anomalie || !anomalie.id) {
            console.error('Anomalie ID is undefined');
            return;
        }
        try {
            const { id_compte, id_dossier, id_exercice } = getIds();
            const basePath = getApiBasePath();
            const url = `${basePath}/${id_compte}/${id_dossier}/${id_exercice}/anomalies/${anomalie.id}`;

            await axiosPrivate.patch(url, {
                valider,
                commentaire_validation: anomalie.commentaire_validation || ''
            });

            const updateResultats = (prev) => prev.map(compte => ({
                ...compte,
                lignes: compte.lignes.map(ligne => ({
                    ...ligne,
                    anomalies: ligne.anomalies.map(a =>
                        a.id === anomalie.id
                            ? { ...a, valider }
                            : a
                    )
                }))
            }));

            if (activeTab === 0) {
                setResultatsFournisseur(updateResultats);
            } else {
                setResultatsClient(updateResultats);
            }

            setOpenValidationDialog(false);
            setSelectedAnomalie(null);
        } catch (error) {
            console.error('Error validating anomaly:', error);
        }
    };

    const openValidation = (anomalie) => {
        setSelectedAnomalie(anomalie);
        setOpenValidationDialog(true);
    };

    const handleSaveComment = async () => {
        try {
            if (!selectedCommentAnomalie) return;

            const { id_compte, id_dossier, id_exercice } = getIds();
            const basePath = getApiBasePath();
            const url = `${basePath}/${id_compte}/${id_dossier}/${id_exercice}/anomalies/${selectedCommentAnomalie.id}`;

            await axiosPrivate.patch(url, {
                valider: selectedCommentAnomalie.valider,
                commentaire_validation: commentaireText
            });

            const updateResultats = (prev) => prev.map(compte => ({
                ...compte,
                lignes: compte.lignes.map(ligne => ({
                    ...ligne,
                    anomalies: ligne.anomalies.map(a =>
                        a.id === selectedCommentAnomalie.id
                            ? { ...a, commentaire_validation: commentaireText }
                            : a
                    )
                }))
            }));

            if (activeTab === 0) {
                setResultatsFournisseur(updateResultats);
            } else {
                setResultatsClient(updateResultats);
            }

            setOpenCommentDialog(false);
            setSelectedCommentAnomalie(null);
            setCommentaireText('');
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    };

    // === Données actuelles selon l'onglet actif ===
    const resultats = activeTab === 0 ? resultatsFournisseur : resultatsClient;
    const compteIndex = activeTab === 0 ? compteIndexFournisseur : compteIndexClient;
    const setCompteIndex = activeTab === 0 ? setCompteIndexFournisseur : setCompteIndexClient;

    // Extraction des comptes uniques pour la pagination
    const comptesList = useMemo(() => {
        return resultats.map(r => r.compte).sort();
    }, [resultats]);

    // Index calculé - clampé aux bornes valides
    const safeCompteIndex = useMemo(() => {
        if (comptesList.length === 0) return 0;
        return Math.min(Math.max(0, compteIndex), comptesList.length - 1);
    }, [comptesList.length, compteIndex]);

    const currentCompte = useMemo(() => {
        if (comptesList.length === 0) return null;
        return comptesList[safeCompteIndex];
    }, [comptesList, safeCompteIndex]);

    // Réinitialiser l'index quand les résultats changent
    useEffect(() => {
        setCompteIndex(0);
    }, [resultats.length, activeTab]);

    // Préparer les données pour le DataGrid (filtrées par compte courant et non validées)
    const rows = useMemo(() => {
        const flatRows = [];
        resultats.forEach((compte, compteIdx) => {
            // Ne pas inclure si on a un compte courant sélectionné et ce n'est pas lui
            if (currentCompte && compte.compte !== currentCompte) return;

            compte.lignes.forEach((ligne, ligneIdx) => {
                ligne.anomalies.forEach((anomalie, anomalieIdx) => {
                    // Ne pas afficher les anomalies déjà validées
                    // if (anomalie.valider) return;

                    flatRows.push({
                        id: `${compteIdx}-${ligneIdx}-${anomalieIdx}`,
                        compte: compte.compte,
                        id_ligne: ligne.id_ligne_originale || ligne.id,
                        date_ecriture: ligne.date_ecriture,
                        piece: ligne.piece,
                        libelle: ligne.libelle,
                        debit: ligne.debit,
                        credit: ligne.credit,
                        lettrage: ligne.lettrage,
                        code_journal: ligne.code_journal,
                        type_anomalie: anomalie.type,
                        commentaire: anomalie.commentaire,
                        commentaire_validation: anomalie.commentaire_validation,
                        valider: anomalie.valider,
                        anomalie_id: anomalie.id
                    });
                });
            });
        });
        return flatRows;
    }, [resultats, currentCompte, activeTab]);



    const columns = [
        // {
        //     field: 'compte',
        //     headerName: 'Compte',
        //     width: 120,
        //     renderCell: (params) => (
        //         <Typography variant="body2" fontWeight="bold">
        //             {params.value}
        //         </Typography>
        //     ),
        // },
        {
            field: 'date_ecriture',
            headerName: 'Date',
            width: 100,
            renderCell: (params) => formatDate(params.value),
        },
        {
            field: 'code_journal',
            headerName: 'Journal',
            width: 80,
        },
        {
            field: 'piece',
            headerName: 'Pièce',
            width: 100,
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            width: 250,
        },
        {
            field: 'debit',
            headerName: 'Débit',
            width: 100,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => params.value ? Number(params.value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '',
        },
        {
            field: 'credit',
            headerName: 'Crédit',
            width: 100,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => params.value ? Number(params.value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '',
        },
        {
            field: 'lettrage',
            headerName: 'Lettrage',
            width: 80,
            renderCell: (params) => (
                <Chip
                    label={params.value || '-'}
                    size="small"
                    variant={params.value ? "filled" : "outlined"}
                    color={params.value ? "success" : "default"}
                />
            ),
        },
        {
            field: 'type_anomalie',
            headerName: "Type d'anomalie",
            width: 300,
            renderCell: (params) => {
                const config = ANOMALIE_TYPES[params.value] || { label: params.value, color: 'default' };
                return <Chip label={config.label} color={config.color} size="small" />;
            },
        },
        // {
        //     field: 'commentaire',
        //     headerName: 'Anomalie',
        //     width: 300,
        // },
        {
            field: 'valider',
            headerName: 'Validé',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Oui' : 'Non'}
                    color={params.value ? 'success' : 'warning'}
                    size="small"
                />
            ),
        },
        {
            field: 'commentaire_validation',
            headerName: 'Commentaire',
            width: 250,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontStyle: params.value ? 'normal' : 'italic', color: params.value ? 'inherit' : '#999' }}>
                    {params.value || ' '}
                </Typography>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title={params.row.valider ? "Annuler la validation" : "Valider"}>
                        <IconButton
                            size="small"
                            color={params.row.valider ? "error" : "success"}
                            onClick={() => openValidation({
                                id: params.row.anomalie_id,
                                valider: params.row.valider,
                                commentaire_validation: params.row.commentaire_validation
                            })}
                        >
                            {params.row.valider ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Ajouter/Modifier commentaire">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenCommentDialog({
                                id: params.row.anomalie_id,
                                valider: params.row.valider,
                                commentaire_validation: params.row.commentaire_validation
                            })}
                        >
                            <CommentIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ];

    // Statistiques
    const stats = useMemo(() => {
        const total = rows.length;
        const valides = rows.filter(r => r.valider).length;
        const parType = {};
        rows.forEach(r => {
            parType[r.type_anomalie] = (parType[r.type_anomalie] || 0) + 1;
        });
        return { total, valides, nonValidés: total - valides, parType };
    }, [rows]);

    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        textTransform: 'none',
        fontSize: '0.85rem',
        borderRadius: '6px',
        boxShadow: 'none',
        '& .MuiTouchRipple-root': {
            display: 'none',
        },
        '&:focus': {
            outline: 'none',
        },
        '&.Mui-focusVisible': {
            outline: 'none',
            boxShadow: 'none',
        },
        '&:hover': {
            boxShadow: 'none',
            backgroundColor: 'action.hover',
            border: 'none',
        },
        '&.Mui-disabled': {
            opacity: 0.4
        },
    };

    const anomaliesByType = useMemo(() => {
        const grouped = {};

        rows.forEach(row => {
            if (!grouped[row.type_anomalie]) {
                grouped[row.type_anomalie] = [];
            }
            grouped[row.type_anomalie].push(row);
        });

        return grouped;
    }, [rows]);

    return (
        <>
            {noFile ? (
                <PopupTestSelectedFile confirmationState={sendToHome} />
            ) : (
                <Box sx={{ p: 2, height: '100vh', backgroundColor: '#f5f5f5' }}>

                    {/* HEADER */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}
                        >
                            Analyse Fournisseur / Client
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">

                            <ExercicePeriodeSelector
                                selectedExerciceId={selectedExerciceId}
                                selectedPeriodeId={selectedPeriodeId}
                                onExerciceChange={handleChangeExercice}
                                onPeriodeChange={handleChangePeriode}
                                disabled={loading}
                                size="small"
                            />

                            {/* Bouton analyser */}
                            <Button
                                variant="contained"
                                startIcon={<Search />}
                                onClick={handleAnalyserClick}
                                disabled={!selectedExerciceId || loading}
                                sx={{
                                    bgcolor: '#064E3B',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3,
                                    borderRadius: '8px'
                                }}
                            >
                                {loading ? 'Analyse...' : 'Analyser'}
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Onglets Fournisseur / Client */}
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                        <Tab label="FOURNISSEUR" sx={{ fontWeight: 800 }} />
                        <Tab label="CLIENT" sx={{ fontWeight: 800 }} />
                    </Tabs>

                    {/* === PAVÉS PAR TYPE D'ANOMALIES === */}
                    
                        <Stack spacing={1.5}>
                            {Object.keys(ANOMALIE_TYPES).map((type) => {

                                const config = ANOMALIE_TYPES[type];

                                const rowsByType = rows.filter(r => r.type_anomalie === type);

                                const total = rowsByType.length;
                                const remaining = rowsByType.filter(a => !a.valider).length;

                                const hasAnomalies = rowsByType.length > 0;

                                return (
                                    <Paper
                                        key={type}
                                        elevation={0}
                                        sx={{
                                            borderRadius: '10px',
                                            border: '1px solid #E2E8F0',
                                            overflow: 'hidden'
                                        }}
                                    >

                                        {/* ===== HEADER PAVÉ ===== */}
                                        <Box
                                            onClick={() => setExpandedType(expandedType === type ? null : type)}
                                            sx={{
                                                p: 2,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                position: 'relative',
                                                bgcolor: expandedType === type ? '#F8FAFC' : 'white',
                                            }}
                                        >
                                            {/* BARRE COULEUR GAUCHE */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '5px',
                                                    bgcolor: remaining === 0 ? '#10B981' : '#EF4444',
                                                }}
                                            />

                                            <Stack direction="row" sx={{ width: '100%' }} alignItems="center" spacing={2}>
                                                {/* Icône gauche */}
                                                <Box sx={{ ml: 1 }}>
                                                    {remaining === 0 ? (
                                                        <CheckCircle sx={{ color: '#10B981', fontSize: 26 }} />
                                                    ) : (
                                                        <ErrorOutline sx={{ color: '#EF4444', fontSize: 26 }} />
                                                    )}
                                                </Box>

                                                {/* Texte */}
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>
                                                        {ANOMALIE_TYPES[type]?.label || type}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {ANOMALIE_TYPES[type]?.description || ''}
                                                    </Typography>
                                                </Box>

                                                {/* Chips alignés à droite, juste avant la flèche */}
                                                <Stack direction="row" spacing={1}>
                                                    <Chip
                                                        label={`${total} TOTAL`}
                                                        sx={{
                                                            bgcolor: '#FEE2E2',
                                                            color: '#B91C1C',
                                                            fontWeight: 900,
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                        }}
                                                    />
                                                    <Chip
                                                        label={`${remaining} RESTANT`}
                                                        sx={{
                                                            bgcolor: remaining === 0 ? '#DCFCE7' : '#E0F7FA',
                                                            color: remaining === 0 ? '#15803D' : '#00ACC1',
                                                            fontWeight: 900,
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                        }}
                                                    />
                                                </Stack>

                                                {/* Flèche */}
                                                {expandedType === type ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                            </Stack>
                                        </Box>

                                        {/* ===== TABLEAU QUAND ON CLIQUE ===== */}
                                        <Collapse in={expandedType === type}>
                                            <Divider />
                                            <Box sx={{ p: 3, bgcolor: 'white' }}>
                                                {rowsByType.length > 0 ? (
                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                                                <TableRow>
                                                                    <TableCell>Date</TableCell>
                                                                    <TableCell>Libellé</TableCell>
                                                                    <TableCell align="right">Débit</TableCell>
                                                                    <TableCell align="right">Crédit</TableCell>
                                                                    <TableCell align="center">Validé</TableCell>
                                                                    <TableCell>Commentaire</TableCell>
                                                                    <TableCell align="center">Actions</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {rowsByType.map(row => (
                                                                    <TableRow key={row.id}>
                                                                        <TableCell>{row.date_ecriture}</TableCell>
                                                                        <TableCell>{row.libelle}</TableCell>
                                                                        <TableCell align="right">{row.debit}</TableCell>
                                                                        <TableCell align="right">{row.credit}</TableCell>
                                                                        <TableCell align="center">
                                                                            <Chip
                                                                                label={row.valider ? 'Oui' : 'Non'}
                                                                                color={row.valider ? 'success' : 'warning'}
                                                                                size="small"
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Typography variant="body2" sx={{ fontStyle: row.commentaire_validation ? 'normal' : 'italic', color: row.commentaire_validation ? 'inherit' : '#999' }}>
                                                                                {row.commentaire_validation || ' '}
                                                                            </Typography>
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" key={row.anomalie_id}>
                                                                                {/* Bouton commentaire */}
                                                                                <IconButton size="small" onClick={() => handleOpenCommentDialog({
                                                                                    id: row.anomalie_id,
                                                                                    valider: row.valider,
                                                                                    commentaire_validation: row.commentaire_validation
                                                                                })}>
                                                                                    <ChatBubbleOutline fontSize="small" />
                                                                                </IconButton>

                                                                                {/* Bouton Valider */}
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    color="success"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        fontWeight: 700,
                                                                                        borderRadius: '6px'
                                                                                    }}
                                                                                    onClick={() => openValidation({
                                                                                        id: row.anomalie_id,
                                                                                        valider: row.valider,
                                                                                        commentaire_validation: row.commentaire_validation
                                                                                    })}
                                                                                >
                                                                                    {row.valider ? 'Annuler' : 'Valider'}
                                                                                </Button>
                                                                            </Stack>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Typography sx={{ textAlign: 'center', color: '#64748B', py: 2 }}>Aucune anomalie pour ce type.</Typography>
                                                )}
                                            </Box>
                                        </Collapse>

                                    </Paper>
                                );
                            })}
                        </Stack>
                    

                    {/* === TABLE FILTRÉE PAR TYPE === */}
                    {selectedType && (
                        <Paper elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>

                            <Box sx={{ p: 2, bgcolor: 'white' }}>
                                <Typography sx={{ fontWeight: 800, mb: 2 }}>
                                    {ANOMALIE_TYPES[selectedType]?.label}
                                </Typography>

                                <TableContainer>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                            <TableRow>
                                                {columns.map((col) => (
                                                    <TableCell key={col.field} sx={{ fontWeight: 700 }}>
                                                        {col.headerName}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {rows
                                                .filter(r => r.type_anomalie === selectedType)
                                                .map((row) => (
                                                    <TableRow key={row.id} hover>
                                                        {columns.map((col) => (
                                                            <TableCell key={col.field}>
                                                                {col.renderCell
                                                                    ? col.renderCell({ value: row[col.field], row })
                                                                    : row[col.field]}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                            </Box>
                        </Paper>
                    )}
                </Box>

            )}
            <Dialog
                open={openValidationDialog}
                onClose={() => setOpenValidationDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Confirmation
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {selectedAnomalie?.valider
                            ? 'Voulez-vous annuler la validation de cette anomalie ?'
                            : 'Voulez-vous valider cette anomalie ?'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenValidationDialog(false)}
                        // color="secondary"
                        sx={{
                            ...buttonStyle,
                            backgroundColor: initial.annuler_bouton_color,
                            color: 'white',
                            borderColor: initial.annuler_bouton_color,
                            '&:hover': {
                                backgroundColor: initial.annuler_bouton_color,
                                none: 'none',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: initial.annuler_bouton_color,
                                color: 'white',
                                cursor: 'not-allowed',
                            },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        // color="primary"
                        onClick={() => handleValiderAnomalie(selectedAnomalie, !selectedAnomalie?.valider)}
                        sx={{
                            ...buttonStyle,
                            backgroundColor: initial.auth_gradient_end,
                            color: 'white',
                            borderColor: initial.auth_gradient_end,
                            '&:hover': {
                                backgroundColor: initial.auth_gradient_end,
                                border: 'none',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: initial.auth_gradient_end,
                                color: 'white',
                                cursor: 'not-allowed',
                            },
                        }}
                    >
                        Sauvegarder
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de commentaire */}
            <Dialog
                open={openCommentDialog}
                onClose={() => setOpenCommentDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Ajouter/Modifier un commentaire
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Commentaire"
                        multiline
                        rows={3}
                        fullWidth
                        value={commentaireText}
                        onChange={(e) => setCommentaireText(e.target.value)}
                        placeholder="Saisir votre commentaire..."
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenCommentDialog(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveComment}
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de confirmation analyse */}
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Confirmation
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Voulez-vous lancer l'analyse des fournisseurs et clients ?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        sx={{
                            ...buttonStyle,
                            backgroundColor: initial.annuler_bouton_color,
                            color: 'white',
                            borderColor: initial.annuler_bouton_color,
                            '&:hover': {
                                backgroundColor: initial.annuler_bouton_color,
                            },
                            '&.Mui-disabled': {
                                backgroundColor: initial.annuler_bouton_color,
                                color: 'white',
                            },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAnalyser}
                        sx={{
                            ...buttonStyle,
                            backgroundColor: initial.auth_gradient_end,
                            color: 'white',
                            borderColor: initial.auth_gradient_end,
                            '&:hover': {
                                backgroundColor: initial.auth_gradient_end,
                            },
                            '&.Mui-disabled': {
                                backgroundColor: initial.auth_gradient_end,
                                color: 'white',
                            },
                        }}
                    >
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={periodeErrorPopup.open}
                onClose={() => setPeriodeErrorPopup({ open: false, message: '' })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>⚠️</span> Période requise
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mt: 1 }}>
                        {periodeErrorPopup.message}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => setPeriodeErrorPopup({ open: false, message: '' })}
                        sx={{ backgroundColor: initial.theme }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}