import React, { useState, useEffect, useCallback } from 'react';
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
    Checkbox,
    FormControlLabel,
    Grid,
    IconButton,
    TextField,
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
    TableRow,
    InputAdornment,
    Collapse,
    Divider,
    Chip
} from '@mui/material';
import { Search, ChevronLeft, ChevronRight, Visibility, ChatBubbleOutline, CheckCircle, WarningAmber, DeleteOutline, DoneAll, CalendarToday, Timer, FilterList } from '@mui/icons-material';
import { init } from '../../../../../init';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupActionConfirm from '../../../componentsTools/popupActionConfirm';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { useExercicePeriode } from '../../../../context/ExercicePeriodeContext';
import ExercicePeriodeSelector from '../../../componentsTools/ExercicePeriodeSelector/ExercicePeriodeSelector';


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

export default function RechercheDoublon() {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    // État pour gérer l'expansion des groupes
    const [expandedId, setExpandedId] = useState(null);
    const [validatingGroup, setValidatingGroup] = useState(null); // Pour suivre quel groupe est en cours de validation

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

    const [fileInfos, setFileInfos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [noFile, setNoFile] = useState(false);
    const [fileId, setFileId] = useState(0);

    // === Résultats de recherche ===
    const [resultats, setResultats] = useState([]);

    // === Stats ===
    const [stats, setStats] = useState({ nbGroupes: 0, nbLignes: 0 });

    // === Navigation par groupe ===
    const [currentGroupe, setCurrentGroupe] = useState(1);
    const [inputGroupe, setInputGroupe] = useState('1');

    // === Popup de confirmation ===
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openErrorDialog, setOpenErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const maxGroupe = stats.nbGroupes;

    // Résultats filtrés par groupe
    const filteredResultats = resultats.filter(row => row.id_doublon === currentGroupe);

    // Grouper les résultats par ID de doublon pour le nouveau format
    const groupedDoublons = resultats.reduce((groups, row) => {
        const groupId = row.id_doublon;
        if (!groups[groupId]) {
            groups[groupId] = {
                id: `GRP-${groupId}`,
                id_doublon: groupId,
                compte: row.compte,
                libelle: row.libelle,
                montant: (parseFloat(row.debit || 0) - parseFloat(row.credit || 0)).toFixed(2),
                debit: row.debit,
                credit: row.credit,
                date: row.date,
                journal: row.journal,
                piece: row.piece,
                ecritures: [],
                occurences: 0,
                statut: row.statut || 'NON_VALIDE'  // ← Prendre le statut de la ligne
            };
        }
        groups[groupId].ecritures.push(row);
        groups[groupId].occurences++;
        return groups;
    }, {});

    const doublonsGroups = Object.values(groupedDoublons);

    // Obtenir les critères actifs pour l'affichage
    const getActiveCriteresText = () => {
        const critereLabels = {
            date: 'Date',
            compte: 'Compte',
            journal: 'Journal',
            piece: 'Pièce',
            libelle: 'Libellé',
            montant: 'Montant'
        };
        const activeCriteres = Object.entries(criteres)
            .filter(([_, value]) => value)
            .map(([key, _]) => critereLabels[key]);
        if (activeCriteres.length === 6) return 'Tous';
        return activeCriteres.join(', ');
    };

    // Colonnes du tableau
    const columns = [
        // { field: 'id_doublon', headerName: 'ID Doublon', width: 100, headerAlign: 'center', align: 'center' },
        { field: 'date', headerName: 'Date', width: 120, headerAlign: 'center', align: 'center' },
        { field: 'compte', headerName: 'Compte', width: 150, headerAlign: 'center', align: 'center' },
        { field: 'journal', headerName: 'Journal', width: 100, headerAlign: 'center', align: 'center' },
        { field: 'piece', headerName: 'Pièce', width: 200, headerAlign: 'center', align: 'center' },
        { field: 'libelle', headerName: 'Libellé', width: 500, headerAlign: 'left' },
        {
            field: 'debit',
            headerName: 'Débit',
            width: 120,
            headerAlign: 'right',
            align: 'right',
            type: 'number',
            valueFormatter: (params) => params.value ? parseFloat(params.value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
        },
        {
            field: 'credit',
            headerName: 'Crédit',
            width: 120,
            headerAlign: 'right',
            align: 'right',
            type: 'number',
            valueFormatter: (params) => params.value ? parseFloat(params.value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
        },
    ];
    const [criteres, setCriteres] = useState({
        date: false,
        compte: false,
        journal: false,
        piece: false,
        libelle: false,
        montant: false,
    });

    const handleCritereChange = (critere) => {
        if (critere === 'tous') {
            // Vérifier si tous les critères sont déjà cochés
            const allChecked = Object.values(criteres).every(v => v);
            setCriteres({
                date: !allChecked,
                compte: !allChecked,
                journal: !allChecked,
                piece: !allChecked,
                libelle: !allChecked,
                montant: !allChecked,
            });
        } else {
            setCriteres(prev => ({
                ...prev,
                [critere]: !prev[critere]
            }));
        }
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
        const idIndex = pathParts.indexOf('rechercheDoublon') + 1;
        return {
            id_compte: parseInt(sessionStorage.getItem('compteId')) || 1,
            id_dossier: parseInt(sessionStorage.getItem('fileId')) || parseInt(pathParts[idIndex]) || 1,
            id_exercice: selectedExerciceId || parseInt(sessionStorage.getItem('exerciceId')) || 1
        };
    };

    // const fetchExercices = async () => {
    //     try {
    //         const { id_dossier } = getIds();
    //         const response = await axiosPrivate.get(`/paramExercice/listeExercice/${id_dossier}`);
    //         const resData = response.data;
    //         if (resData.state) {
    //             setListeExercice(resData.list);
    //             if (resData.list && resData.list.length > 0 && selectedExerciceId === 0) {
    //                 setSelectedExerciceId(resData.list[0].id);
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error fetching exercices:', error);
    //     }
    // };

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



    const handleOpenConfirmDialog = () => {
        if (!selectedExerciceId) return;

        // Vérifier qu'au moins un critère est sélectionné
        const hasCritere = Object.values(criteres).some(v => v);
        const hasPeriode = !!selectedPeriodeId && selectedPeriodeId !== 'exercice';
        if (!hasCritere || !hasPeriode) {
            if (!hasCritere && !hasPeriode) {
                setErrorMessage('Veuillez sélectionner au moins un critère de recherche et une période');
            } else if (!hasCritere) {
                setErrorMessage('Veuillez sélectionner au moins un critère de recherche');
            } else {
                setErrorMessage('Veuillez sélectionner une période');
            }
            setOpenErrorDialog(true);
            return;
        }

        setOpenConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
    };

    const handleConfirmRechercher = () => {
        setOpenConfirmDialog(false);
        executeRechercher();
    };

    const executeRechercher = async () => {
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

            // Ajouter les critères sélectionnés
            Object.entries(criteres).forEach(([key, value]) => {
                if (value) {
                    params.append(`critere_${key}`, 'true');
                }
            });

            const queryString = params.toString();

            // Appel API pour la recherche de doublons
            const response = await axiosPrivate.post(`/administration/rechercheDoublon/${id_compte}/${id_dossier}/${id_exercice}?${queryString}`);

            if (response.data.state) {
                setResultats(response.data.data || []);
                setStats({
                    nbGroupes: response.data.nbGroupes || 0,
                    nbLignes: response.data.nbLignes || 0
                });
                // Reset navigation
                setCurrentGroupe(1);
                setInputGroupe('1');
            } else {
                alert(response.data.message || 'Erreur lors de la recherche');
            }

        } catch (error) {
            console.error('Error searching duplicates:', error);
            alert('Erreur lors de la recherche de doublons');
        } finally {
            setLoading(false);
        }
    };

    const handlePrevGroupe = () => {
        if (currentGroupe > 1) {
            const newGroupe = currentGroupe - 1;
            setCurrentGroupe(newGroupe);
            setInputGroupe(String(newGroupe));
        }
    };

    const handleNextGroupe = () => {
        if (currentGroupe < maxGroupe) {
            const newGroupe = currentGroupe + 1;
            setCurrentGroupe(newGroupe);
            setInputGroupe(String(newGroupe));
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Bloquer si le nombre dépasse maxGroupe
        if (value !== '') {
            const num = parseInt(value, 10);
            if (num > maxGroupe) return; // Bloque la saisie
            if (num >= 1) {
                setCurrentGroupe(num);
            }
        }
        if (value === '' || /^\d+$/.test(value)) {
            setInputGroupe(value);
        }
    };

    const validateAndChangeGroupe = () => {
        const num = parseInt(inputGroupe, 10);
        if (num >= 1 && num <= maxGroupe) {
            setCurrentGroupe(num);
        } else {
            // Reset si invalide
            setInputGroupe(String(currentGroupe));
        }
    };

    const handleInputSubmit = (e) => {
        if (e.key === 'Enter') {
            validateAndChangeGroupe();
        }
    };

    // Fonction pour valider un groupe de doublons
    const handleValidateGroup = async (groupId) => {
        setValidatingGroup(groupId);
        try {
            const { id_compte, id_dossier, id_exercice } = getIds();

            // Appel API pour valider le groupe
            const url = `/administration/rechercheDoublon/validerGroupeDoublon/${id_compte}/${id_dossier}/${id_exercice}/${groupId}`;

            const response = await axiosPrivate.post(url);

            if (response.data.state) {
                const { nb_ecritures_valides } = response.data.data;

                // Mettre à jour le statut du groupe validé au lieu de le retirer
                setResultats(prev => {
                    const updated = prev.map(item =>
                        item.id_doublon === groupId
                            ? { ...item, statut: 'VALIDE', date_validation: new Date().toISOString() }
                            : item
                    );
                    return updated;
                });

                // Afficher un message de succès
                alert(`✅ Groupe ${groupId} validé avec succès !\n📊 ${nb_ecritures_valides} écritures traitées`);

            } else {
                alert(response.data.message || 'Erreur lors de la validation du groupe');
            }

        } catch (error) {
            console.error('Error validating group:', error);
            alert('❌ Erreur lors de la validation du groupe\n' + (error.response?.data?.message || error.message));
        } finally {
            setValidatingGroup(null);
        }
    };

    return (
        <>
            {noFile ? (
                <PopupTestSelectedFile
                    confirmationState={sendToHome}
                />
            ) : (
                <Box sx={{
                    bgcolor: '#F1F5F9',
                    minHeight: '100vh',
                    width: '100vw',
                    p: 3,
                    pt: 14,
                    boxSizing: 'border-box',
                    position: 'absolute',
                    left: 0,
                    top: 0
                }}>

                    {/* --- HEADER INFOS --- */}
                    <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}
                        >
                            Recherche Doublon
                        </Typography>

                        <Stack direction="row" spacing={4} alignItems="center">
                            <ExercicePeriodeSelector
                                selectedExerciceId={selectedExerciceId}
                                selectedPeriodeId={selectedPeriodeId}
                                onExerciceChange={handleChangeExercice}
                                onPeriodeChange={handleChangePeriode}
                                disabled={loading}
                                size="small"
                            />

                            <Button
                                variant="contained"
                                onClick={handleOpenConfirmDialog}
                                disabled={!selectedExerciceId || loading}
                                sx={{
                                    textTransform: 'none',
                                    outline: 'none',
                                    backgroundColor: initial.theme,
                                    color: "white",
                                    height: "32px",
                                }}
                            >
                                {loading ? 'Recherche...' : 'Rechercher'}
                            </Button>
                        </Stack>

                        {/* --- CRITÈRES DE RECHERCHE --- */}
                        <Stack direction="row" spacing={4} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Rechercher par montant..."
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                                    sx: { borderRadius: '8px', bgcolor: '#F8FAFC' }
                                }}
                                sx={{ width: 300 }}
                            />

                            <Stack direction="row" spacing={1} alignItems="center">
                                <FilterList sx={{ color: '#64748B', fontSize: '1.1rem' }} />
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', mr: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Critères de détection :
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">

                                        {[
                                            { key: 'date', label: 'Date' },
                                            { key: 'compte', label: 'Compte' },
                                            { key: 'journal', label: 'Journal' },
                                            { key: 'piece', label: 'Pièce' },
                                            { key: 'libelle', label: 'Libellé' },
                                            { key: 'montant', label: 'Montant' }
                                        ].map((item) => {
                                            const isActive = criteres[item.key];

                                            return (
                                                <Chip
                                                    key={item.key}
                                                    label={item.label}
                                                    onClick={() => handleCritereChange(item.key)}
                                                    variant={isActive ? "filled" : "outlined"}
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                        height: 26,
                                                        transition: '0.2s',
                                                        bgcolor: isActive ? '#064E3B' : 'transparent',
                                                        color: isActive ? '#fff' : '#64748B',
                                                        border: '1px solid',
                                                        borderColor: isActive ? '#064E3B' : '#CBD5E1',
                                                        '&:hover': {
                                                            bgcolor: isActive ? '#053e2f' : '#E2E8F0'
                                                        }
                                                    }}
                                                />
                                            );
                                        })}

                                    </Stack>

                                </Stack>
                            </Stack>
                        </Stack>

                    </Paper>

                    {/* --- TABLEAU PRINCIPAL --- */}
                    {doublonsGroups.length > 0 && (
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 800, color: '#64748B', py: 1.5, fontSize: '0.75rem', textTransform: 'uppercase' } }}>
                                        <TableCell width={40}></TableCell>
                                        <TableCell>ID GROUPE</TableCell>
                                        <TableCell>COMPTE</TableCell>
                                        <TableCell>LIBELLÉ COMMUN</TableCell>
                                        <TableCell align="right">MONTANT</TableCell>
                                        <TableCell align="center">DOUBLONS</TableCell>
                                        <TableCell align="center">STATUT</TableCell>
                                        <TableCell align="right">ACTION</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {doublonsGroups.map((group) => (
                                        <React.Fragment key={group.id}>
                                            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
                                                    >
                                                        <Visibility fontSize="small" color={expandedId === group.id ? "primary" : "action"} />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{group.id}</TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>{group.compte}</TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>{group.date},{group.compte},{group.journal},{group.piece},{group.libelle},                                                    {parseFloat(group.montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 900, fontSize: '0.85rem' }}>
                                                    {parseFloat(group.montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={group.occurences}
                                                        size="small"
                                                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 900 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {group.statut === 'VALIDE' ? (
                                                        <CheckCircle sx={{ color: '#10B981', fontSize: '1.2rem' }} />
                                                    ) : (
                                                        <WarningAmber sx={{ color: '#F59E0B', fontSize: '1.2rem' }} />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {group.statut === 'VALIDE' ? (
                                                        <Chip
                                                            label="VALIDÉ"
                                                            size="small"
                                                            color="success"
                                                            sx={{ fontWeight: 900, fontSize: '0.7rem' }}
                                                        />
                                                    ) : (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleValidateGroup(group.id_doublon)}
                                                            disabled={validatingGroup === group.id_doublon}
                                                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', fontSize: '0.75rem' }}
                                                        >
                                                            {validatingGroup === group.id_doublon ? 'Validation...' : 'Valider'}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>

                                            {/* --- CONTENU DU COLLAPSE --- */}
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                                                    <Collapse in={expandedId === group.id} timeout="auto" unmountOnExit>
                                                        <Box sx={{ py: 3, px: 10, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>

                                                            <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
                                                                <Box>
                                                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Montant détecté</Typography>
                                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
                                                                        {parseFloat(group.montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Compte concerné</Typography>
                                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>{group.compte}</Typography>
                                                                </Box>
                                                                <Box sx={{ flexGrow: 1 }} />
                                                                {/* <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    startIcon={<CheckCircle />}
                                                                    sx={{ bgcolor: '#0F172A', height: 'fit-content', mt: 1, textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                                                                    onClick={() => handleValidateGroup(group.id_doublon)}
                                                                    disabled={validatingGroup === group.id_doublon}
                                                                >
                                                                    {validatingGroup === group.id_doublon ? 'Validation...' : 'Valider tout le groupe'}
                                                                </Button> */}
                                                            </Stack>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                Écritures détectées <Chip label={group.occurences} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 900 }} />
                                                            </Typography>

                                                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                                                <Table size="small">
                                                                    <TableHead sx={{ bgcolor: 'white' }}>
                                                                        <TableRow>
                                                                            <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>DATE</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>JOURNAL</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>LIBELLE</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>PIÈCE</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>DÉBIT</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>CRÉDIT</TableCell>
                                                                            {/* <TableCell align="center" sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>ACTIONS</TableCell> */}
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody sx={{ bgcolor: 'white' }}>
                                                                        {group.ecritures.map((ecriture, idx) => (
                                                                            <TableRow key={idx} sx={{ bgcolor: idx === 0 ? 'rgba(16, 185, 129, 0.05)' : 'inherit' }}>
                                                                                <TableCell sx={{ fontSize: '0.8rem' }}>{formatDate(ecriture.date)}</TableCell>
                                                                                <TableCell sx={{ fontSize: '0.8rem' }}>{ecriture.journal}</TableCell>
                                                                                <TableCell sx={{ fontSize: '0.8rem' }}>{ecriture.libelle}</TableCell>
                                                                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{ecriture.piece}</TableCell>
                                                                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                                                                    {ecriture.debit ? parseFloat(ecriture.debit).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                                                                                </TableCell>
                                                                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                                                                    {ecriture.credit ? parseFloat(ecriture.credit).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                                                                                </TableCell>
                                                                                {/* <TableCell align="center">
                                                                                    {idx === 0 ? (
                                                                                        <Chip label="CONSERVER" size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', bgcolor: '#DCFCE7', color: '#15803D' }} />
                                                                                    ) : (
                                                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                                                            <IconButton size="small" sx={{ color: '#64748B' }}>
                                                                                                <ChatBubbleOutline fontSize="small" />
                                                                                            </IconButton>
                                                                                            <IconButton size="small" color="error">
                                                                                                <DeleteOutline fontSize="small" />
                                                                                            </IconButton>
                                                                                        </Stack>
                                                                                    )}
                                                                                </TableCell> */}
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* --- POPUPS --- */}
                    <Dialog
                        open={openErrorDialog}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>⚠️</span> Alerte
                        </DialogTitle>
                        <DialogContent>
                            <Typography>
                                {errorMessage}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="contained"
                                onClick={() => setOpenErrorDialog(false)}
                                sx={{ backgroundColor: initial.theme }}
                            >
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {openConfirmDialog && (
                        <PopupActionConfirm
                            msg={`Êtes-vous sûr de vouloir lancer la recherche de doublons ?\n\nCritères sélectionnés : ${getActiveCriteresText()}`}
                            confirmationState={(confirmed) => {
                                if (confirmed) {
                                    executeRechercher();
                                }
                                setOpenConfirmDialog(false);
                            }}
                            isLoading={loading}
                        />
                    )}
                </Box>
            )}
        </>
    );
};
