import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from '@mui/material';
import { CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import CommentIcon from '@mui/icons-material/Comment';
import { DataGrid } from '@mui/x-data-grid';
import { init } from '../../../../../init';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';

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
    paiement_sans_facture: { label: 'Paiement sans facture', color: 'warning' },
    facture_3mois_non_reglee: { label: 'Facture >3 mois non réglée', color: 'error' },
    ajustement_non_traite: { label: 'Ajustement non traité', color: 'info' },
    solde_suspens: { label: 'Solde en suspens', color: 'default' }
};

export default function RevisionFournisseurClient() {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();

    const [activeTab, setActiveTab] = useState(0); // 0 = Fournisseur, 1 = Client
    const [listeExercice, setListeExercice] = useState([]);
    const [selectedExerciceId, setSelectedExerciceId] = useState(0);
    const [fileInfos, setFileInfos] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // === Résultats séparés par onglet ===
    const [resultatsFournisseur, setResultatsFournisseur] = useState([]);
    const [resultatsClient, setResultatsClient] = useState([]);
    const [selectedCompte, setSelectedCompte] = useState(null);

    // === Périodes ===
    const [listePeriodes, setListePeriodes] = useState([]);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
    const [selectedPeriodeDates, setSelectedPeriodeDates] = useState(null);

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

    // === Pagination par compte (séparée par onglet) ===
    const [compteIndexFournisseur, setCompteIndexFournisseur] = useState(0);
    const [compteIndexClient, setCompteIndexClient] = useState(0);

    const handleOpenCommentDialog = (anomalie) => {
        setSelectedCommentAnomalie(anomalie);
        setCommentaireText(anomalie.commentaire_validation || '');
        setOpenCommentDialog(true);
    };

    const handleAnalyserClick = () => {
        setOpenConfirmDialog(true);
    };

    const handleConfirmAnalyser = async () => {
        setOpenConfirmDialog(false);
        await handleAnalyser();
    };

    const getIds = () => {
        const pathParts = window.location.pathname.split('/');
        const idIndex = pathParts.indexOf('revisionFournisseurClient') + 1;
        return {
            id_compte: parseInt(sessionStorage.getItem('compteId')) || 1,
            id_dossier: parseInt(sessionStorage.getItem('fileId')) || parseInt(pathParts[idIndex]) || 1,
            id_exercice: selectedExerciceId || parseInt(sessionStorage.getItem('exerciceId')) || 1
        };
    };

    const fetchExercices = async () => {
        try {
            const { id_dossier } = getIds();
            const response = await axiosPrivate.get(`/paramExercice/listeExercice/${id_dossier}`);
            const resData = response.data;
            if (resData.state) {
                setListeExercice(resData.list);
                if (resData.list && resData.list.length > 0 && selectedExerciceId === 0) {
                    setSelectedExerciceId(resData.list[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching exercices:', error);
        }
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

    const fetchPeriodes = useCallback(async (exerciceId) => {
        if (!exerciceId) return;
        try {
            const response = await axiosPrivate.get(`/paramExercice/listePeriodes/${exerciceId}`);
            if (response.data.state) {
                setListePeriodes(response.data.list || []);
            } else {
                setListePeriodes([]);
            }
        } catch (error) {
            console.error('Error fetching periodes:', error);
            setListePeriodes([]);
        }
    }, [axiosPrivate]);

    useEffect(() => {
        fetchExercices();
        fetchDossierInfos();
    }, []);

    useEffect(() => {
        if (selectedExerciceId > 0) {
            fetchPeriodes(selectedExerciceId);
        }
    }, [selectedExerciceId, fetchPeriodes]);

    const handleChangeExercice = (exerciceId) => {
        setSelectedExerciceId(exerciceId);
        setSelectedPeriodeId('');
        setSelectedPeriodeDates(null);
        setResultatsFournisseur([]);
        setResultatsClient([]);
        fetchPeriodes(exerciceId);
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
            } else {
                const exercice = listeExercice.find(e => e.id === selectedExerciceId);
                if (exercice) {
                    params.append('date_debut', exercice.date_debut);
                    params.append('date_fin', exercice.date_fin);
                }
            }
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

    // Récupérer les dates de l'exercice courant
    const currentExerciceDates = useMemo(() => {
        const exercice = listeExercice.find(e => e.id === selectedExerciceId);
        if (exercice) {
            return {
                date_debut: exercice.date_debut,
                date_fin: exercice.date_fin,
                libelle_rang: exercice.libelle_rang
            };
        }
        return null;
    }, [listeExercice, selectedExerciceId]);

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
    }, [resultats, currentCompte]);

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

    return (
        <Box sx={{ p: 2, height: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Dossier info */}
            <Box sx={{ mb: 1, width: '100px' }}>
                {InfoFileStyle(fileInfos?.dossier)}
            </Box>

            {/* Header with Exercise, Period and Analyser button */}
            <Box
                sx={{
                    mb: 3,
                    backgroundColor: 'white',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography component="div" variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                        Administration - Analyse Fournisseur/Client
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Stack direction="row" spacing={0} alignItems="center" sx={{ flex: '0 0 auto' }}>
                        <Typography sx={{ minWidth: 70, fontSize: 15, mr: 1, whiteSpace: 'nowrap' }}>
                            Exercice :
                        </Typography>
                        <FormControl size="small" variant="outlined" sx={{ minWidth: 200 }}>
                            <Select
                                value={selectedExerciceId}
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

                    <Button
                        variant="contained"
                        onClick={handleAnalyserClick}
                        disabled={!selectedExerciceId || loading}
                        startIcon={<Refresh />}
                        style={{
                            textTransform: 'none',
                            outline: 'none',
                            backgroundColor: initial.theme,
                            color: "white",
                            height: "32px",
                        }}
                    >
                        {loading ? 'Analyse...' : 'Analyser'}
                    </Button>
                </Box>
            </Box>

            {/* Onglets Fournisseur / Client */}
            <Paper sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Fournisseur" />
                    <Tab label="Client" />
                </Tabs>

                <Box sx={{ p: 2 }}>
                    {activeTab === 0 && (
                        <>
                            {resultatsFournisseur.length === 0 ? (
                                <></>
                            ) : (
                                <>
                                    {/* Navigation par compte et stats - en haut du tableau */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                        {/* Afficher la navigation quand il y a au moins un compte */}
                                        {comptesList.length >= 1 && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={safeCompteIndex === 0}
                                                    onClick={() => setCompteIndexFournisseur((prev) => Math.max(0, prev - 1))}
                                                    sx={{ minWidth: '40px', px: 1 }}
                                                >
                                                    {"<"}
                                                </Button>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2', whiteSpace: 'nowrap' }}>
                                                    Compte {currentCompte} ({safeCompteIndex + 1} / {comptesList.length})
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={safeCompteIndex === comptesList.length - 1}
                                                    onClick={() => setCompteIndexFournisseur((prev) => Math.min(comptesList.length - 1, prev + 1))}
                                                    sx={{ minWidth: '40px', px: 1 }}
                                                >
                                                    {">"}
                                                </Button>
                                            </>
                                        )}
                                        {/* Chips spécifiques au compte courant */}
                                        <Chip
                                            label={`Validés: ${stats.valides}`}
                                            color="success"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={`Non validés: ${stats.nonValidés}`}
                                            color="warning"
                                            variant="outlined"
                                        />

                                    </Box>
                                    <Box sx={{ height: 500, width: '100%' }}>
                                        <DataGrid
                                            rows={rows}
                                            columns={columns}
                                            pageSizeOptions={[10, 25, 50, 100]}
                                            initialState={{
                                                pagination: { paginationModel: { pageSize: 25 } }
                                            }}
                                            disableRowSelectionOnClick
                                            density="compact"
                                            sx={{
                                                ...DataGridStyle.sx,
                                                height: '100%',
                                                '& .MuiDataGrid-columnHeaders': {
                                                    backgroundColor: initial.tableau_theme,
                                                    color: initial.text_theme,
                                                    minHeight: 35,
                                                    maxHeight: 35,
                                                },
                                                '& .MuiDataGrid-columnHeader': {
                                                    minHeight: 35,
                                                    maxHeight: 35,
                                                    lineHeight: '35px',
                                                },
                                                '& .MuiDataGrid-columnHeaderTitleContainer': {
                                                    minHeight: 35,
                                                    maxHeight: 35,
                                                },
                                                '& .MuiDataGrid-columnHeaderTitle': {
                                                    color: initial.text_theme,
                                                    fontWeight: 600,
                                                },
                                                '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                                    color: initial.text_theme,
                                                },
                                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                                    outline: 'none',
                                                    border: 'none',
                                                },
                                                '& .MuiDataGrid-row': {
                                                    minHeight: 35,
                                                    maxHeight: 35,
                                                },
                                            }}
                                        />
                                    </Box>
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 1 && (
                        <>
                            {resultatsClient.length === 0 ? (
                                <></>
                            ) : (
                                <>
                                    {/* Navigation par compte et stats - en haut du tableau */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                        {/* Afficher la navigation quand il y a au moins un compte */}
                                        {comptesList.length >= 1 && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={safeCompteIndex === 0}
                                                    onClick={() => setCompteIndexClient((prev) => Math.max(0, prev - 1))}
                                                    sx={{ minWidth: '40px', px: 1 }}
                                                >
                                                    {"<"}
                                                </Button>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2', whiteSpace: 'nowrap' }}>
                                                    Compte {currentCompte} ({safeCompteIndex + 1} / {comptesList.length})
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={safeCompteIndex === comptesList.length - 1}
                                                    onClick={() => setCompteIndexClient((prev) => Math.min(comptesList.length - 1, prev + 1))}
                                                    sx={{ minWidth: '40px', px: 1 }}
                                                >
                                                    {">"}
                                                </Button>
                                            </>
                                        )}
                                        {/* Chips spécifiques au compte courant */}
                                        <Chip
                                            label={`Validés: ${stats.valides}`}
                                            color="success"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={`Non validés: ${stats.nonValidés}`}
                                            color="warning"
                                            variant="outlined"
                                        />

                                    </Box>
                                    <Box sx={{ height: 500, width: '100%' }}>
                                        <DataGrid
                                            rows={rows}
                                            columns={columns}
                                            pageSizeOptions={[10, 25, 50, 100]}
                                            initialState={{
                                                pagination: { paginationModel: { pageSize: 25 } }
                                            }}
                                            disableRowSelectionOnClick
                                            density="compact"
                                            sx={{
                                                ...DataGridStyle.sx,
                                                height: '100%',
                                                '& .MuiDataGrid-columnHeaders': {
                                                    backgroundColor: initial.tableau_theme,
                                                    color: initial.text_theme,
                                                    minHeight: 35,
                                                    maxHeight: 35,
                                                },
                                                '& .MuiDataGrid-columnHeader': {
                                                    minHeight: 35,
                                                    maxHeight: 35,
                                                    lineHeight: '35px',
                                                },
                                                '& .MuiDataGrid-columnHeaderTitleContainer': {
                                                    minHeight: 35,
                                                    maxHeight: 35,
                                                },
                                                '& .MuiDataGrid-columnHeaderTitle': {
                                                    color: initial.text_theme,
                                                    fontWeight: 600,
                                                },
                                                '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                                    color: initial.text_theme,
                                                },
                                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                                    outline: 'none',
                                                    border: 'none',
                                                },
                                                '& .MuiDataGrid-row': {
                                                    minHeight: 35,
                                                    maxHeight: 35,
                                                },
                                            }}
                                        />
                                    </Box>
                                </>
                            )}
                        </>
                    )}
                </Box>
            </Paper>

            {/* Dialog de validation */}
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
        </Box>
    );
}
