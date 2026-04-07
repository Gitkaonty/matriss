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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { init } from '../../../../../init';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupActionConfirm from '../../../componentsTools/popupActionConfirm';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
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
                console.log('Recherche terminée:', response.data.message);
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

    return (
        <>
            {noFile ? (
                <PopupTestSelectedFile
                    confirmationState={sendToHome}
                />
            ) : (
                <Box sx={{ p: 2, height: '100vh', backgroundColor: '#f5f5f5' }}>
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
                            <Typography component="div" variant="h7" sx={{ fontWeight: 600, color: '#333' }}>
                                Administration - Recherche des Doublons
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
                                // startIcon={<Search />}
                                style={{
                                    textTransform: 'none',
                                    outline: 'none',
                                    backgroundColor: initial.theme,
                                    color: "white",
                                    height: "32px",
                                }}
                            >
                                {loading ? 'Recherche...' : 'Rechercher'}
                            </Button>
                        </Box>

                        {/* Section des critères de recherche */}
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#555' }}>
                                Critères:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={Object.values(criteres).every(v => v)}
                                            onChange={() => handleCritereChange('tous')}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Tous</Typography>}
                                    labelPlacement="start"
                                    sx={{ m: 0, mr: 4 }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={criteres.date}
                                            onChange={() => handleCritereChange('date')}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">Date</Typography>}
                                    labelPlacement="start"
                                    sx={{ m: 0 }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={criteres.compte}
                                            onChange={() => handleCritereChange('compte')}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">Compte</Typography>}
                                    labelPlacement="start"
                                    sx={{ m: 0 }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={criteres.journal}
                                            onChange={() => handleCritereChange('journal')}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">Journal</Typography>}
                                    labelPlacement="start"
                                    sx={{ m: 0 }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={criteres.piece}
                                            onChange={() => handleCritereChange('piece')}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">Pièce</Typography>}
                                    labelPlacement="start"
                                    sx={{ m: 0 }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={criteres.libelle}
                                            onChange={() => handleCritereChange('libelle')}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">Libellé</Typography>}
                                    labelPlacement="start"
                                    sx={{ m: 0 }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={criteres.montant}
                                            onChange={() => handleCritereChange('montant')}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">Montant</Typography>}
                                    labelPlacement="start"
                                    sx={{ m: 0 }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Popup d'erreur */}
                    <Dialog
                        open={openErrorDialog}
                        onClose={() => setOpenErrorDialog(false)}
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

                    {/* Popup de confirmation */}
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

                    {/* Navigation par groupe */}
                    {resultats.length > 0 && (
                        <Paper sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: '#F1D3C9' }}>
                            <IconButton
                                onClick={handlePrevGroupe}
                                disabled={currentGroupe <= 1}
                                size="small"
                                sx={{ color: currentGroupe <= 1 ? '#bbb' : '#000' }}
                            >
                                <ChevronLeft />
                            </IconButton>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* <Typography variant="body2" color="textSecondary">
                            Doublons
                        </Typography> */}
                                <TextField
                                    value={inputGroupe}
                                    onChange={handleInputChange}
                                    onKeyDown={handleInputSubmit}
                                    onBlur={validateAndChangeGroupe}
                                    variant="standard"
                                    size="small"
                                    sx={{
                                        width: 40,
                                        '& input': {
                                            textAlign: 'center',
                                            color: '#000'
                                            // color: '#000',
                                            // fontSize: '1.1rem'
                                        }
                                    }}
                                />
                                <Typography variant="body1" sx={{ color: '#000' }}>
                                    / {maxGroupe}
                                </Typography>
                            </Box>

                            <IconButton
                                onClick={handleNextGroupe}
                                disabled={currentGroupe >= maxGroupe}
                                size="small"
                                sx={{ color: currentGroupe >= maxGroupe ? '#bbb' : '#000' }}
                            >
                                <ChevronRight />
                            </IconButton>
                        </Paper>
                    )}
                    <Paper sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)', p: 2, height: 'calc(100vh - 280px)' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Résultats de la recherche de doublons
                            {/* Résultats de la recherche {resultats.length > 0 && `(${resultats.length} lignes)`} */}
                        </Typography>
                        {resultats.length > 0 ? (
                            <DataGrid
                                rows={filteredResultats}
                                columns={columns}
                                pageSizeOptions={[10, 25, 50, 100]}
                                initialState={{
                                    pagination: {
                                        paginationModel: { pageSize: 25 },
                                    },
                                    sorting: {
                                        sortModel: [{ field: 'id_doublon', sort: 'asc' }],
                                    },
                                }}
                                density="compact"
                                disableRowSelectionOnClick
                                sx={{
                                    ...DataGridStyle.sx,
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: initial.tableau_theme,
                                        color: initial.text_theme,
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        color: initial.text_theme,
                                        fontWeight: 600,
                                    },
                                    // Alternance blanc / gris clair standard
                                    '& .MuiDataGrid-row:nth-of-type(odd)': {
                                        backgroundColor: '#ffffff !important',
                                    },
                                    '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                        color: initial.text_theme,
                                    },
                                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                        outline: 'none',
                                        border: 'none',
                                    }
                                }}
                                getRowClassName={() => ''}
                            />
                        ) : (
                            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                                {/* Aucun résultat. Sélectionnez des critères et cliquez sur "Valider les critères" pour lancer la recherche. */}
                            </Typography>
                        )}
                    </Paper>
                </Box>
            )}
        </>
    );
}