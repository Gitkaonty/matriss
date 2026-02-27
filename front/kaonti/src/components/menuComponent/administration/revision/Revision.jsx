import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    ButtonGroup,
    Chip,
    Alert,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { init } from '../../../../../init';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import RevisionDetails from './RevisionDetails';
import PopupActionConfirm from "../../../componentsTools/popupActionConfirm";

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

export default function Revision() {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();

    const [controles, setControles] = useState([]);
    const [showControles, setShowControles] = useState(true);
    const [listeExercice, setListeExercice] = useState([]);
    const [selectedExerciceId, setSelectedExerciceId] = useState(0);
    const [selectedTypeDetails, setSelectedTypeDetails] = useState('');

    // === Popup de confirmation pour validation ===
    const [confirmPopup, setConfirmPopup] = useState({ open: false, type: null, nextValider: null });
    const [confirmLoading, setConfirmLoading] = useState(false);

    // === Popup d'erreur pour anomalies non validées ===
    const [errorPopup, setErrorPopup] = useState({ open: false, message: '' });

    // === Popup pour résultat de révision ===
    const [reviserPopup, setReviserPopup] = useState({ open: false, message: '', success: true });

    const [confirmReviserPopup, setConfirmReviserPopup] = useState(false);
    const [confirmReviserLoading, setConfirmReviserLoading] = useState(false);

    // === État de chargement pour les détails ===
    const [detailsLoading, setDetailsLoading] = useState(false);

    // === Périodes ===
    const [listePeriodes, setListePeriodes] = useState([]);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
    const [selectedPeriodeDates, setSelectedPeriodeDates] = useState(null);

    const getIds = () => {
        const pathParts = window.location.pathname.split('/');
        const idIndex = pathParts.indexOf('revision') + 1;
        return {
            id_compte: parseInt(sessionStorage.getItem('compteId')) || 1,
            id_dossier: parseInt(sessionStorage.getItem('fileId')) || parseInt(pathParts[idIndex]) || 1,
            id_exercice: selectedExerciceId || parseInt(sessionStorage.getItem('exerciceId')) || 1
        };
    };

    const fetchControles = useCallback(async () => {
        if (!selectedExerciceId) return;

        try {
            const { id_compte, id_dossier, id_exercice } = getIds();
            let url = `/administration/revisionControleAuto/${id_compte}/${id_dossier}/${id_exercice}`;

            // Ajouter les dates de période si sélectionnée
            if (selectedPeriodeDates) {
                const params = new URLSearchParams();
                params.append('date_debut', selectedPeriodeDates.date_debut);
                params.append('date_fin', selectedPeriodeDates.date_fin);
                url += `?${params.toString()}`;
                console.log('DEBUG FRONT - URL fetchControles:', url);
            }

            const response = await axiosPrivate.get(url);
            if (response.data.state) {
                setControles(response.data.controles);
                console.log('Controles fetched:', response.data.controles.length, response.data.message);
            }
        } catch (error) {
            console.error('Error fetching controles:', error);
        }
    }, [axiosPrivate, selectedExerciceId, selectedPeriodeDates]);

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
    }, []);

    useEffect(() => {
        if (selectedExerciceId > 0) {
            fetchControles();
            fetchPeriodes(selectedExerciceId);
        }
    }, [selectedExerciceId, fetchControles, fetchPeriodes]);


    const handleChangeExercice = (exerciceId) => {
        setSelectedExerciceId(exerciceId);
        setSelectedPeriodeId('exercice');
        setSelectedPeriodeDates(null);
        setSelectedTypeDetails('');
        fetchPeriodes(exerciceId);
    };

    const handleChangePeriode = (periodeId) => {
        setSelectedPeriodeId(periodeId);
        if (periodeId && periodeId !== 'exercice') {
            const periode = listePeriodes.find(p => p.id === periodeId);
            if (periode) {
                console.log('Période sélectionnée:', periode);
                console.log('Dates de période:', { date_debut: periode.date_debut, date_fin: periode.date_fin });
                setSelectedPeriodeDates({
                    date_debut: periode.date_debut,
                    date_fin: periode.date_fin
                });
            }
        } else {
            console.log('Aucune période sélectionnée - filtre sur tout l\'exercice');
            setSelectedPeriodeDates(null);
        }
    };

    const controlesByType = useMemo(() => {
        const byType = new Map();
        for (const c of controles || []) {
            const key = c?.Type || '';
            if (!key) continue;
            const list = byType.get(key) || [];
            list.push(c);
            byType.set(key, list);
        }
        return byType;
    }, [controles]);

    const executeControler = async () => {
        if (!selectedExerciceId) return;

        const { id_compte, id_dossier, id_exercice } = getIds();

        setConfirmReviserLoading(true);
        try {
            let url = `/administration/revisionControleAuto/${id_compte}/${id_dossier}/${id_exercice}/executeAll`;

            if (selectedPeriodeDates) {
                const params = new URLSearchParams();
                params.append('date_debut', selectedPeriodeDates.date_debut);
                params.append('date_fin', selectedPeriodeDates.date_fin);
                url += `?${params.toString()}`;
                console.log('DEBUG FRONT - URL handleControler:', url);
            }

            const response = await axiosPrivate.post(url);

            if (response.data.state) {
                console.log('Contrôle global exécuté:', response.data);
                await fetchControles();
                setReviserPopup({
                    open: true,
                    message: `Contrôle terminé! ${response.data.totalEcritures} écritures liées au total.`,
                    success: true
                });
            } else {
                setReviserPopup({
                    open: true,
                    message: response.data.message || 'Erreur lors du contrôle',
                    success: false
                });
            }
        } catch (error) {
            console.error('Error executing global controle:', error);
            setReviserPopup({
                open: true,
                message: 'Erreur lors de l\'exécution du contrôle global',
                success: false
            });
        } finally {
            setConfirmReviserLoading(false);
        }
    };

    const handleControler = () => {
        if (!selectedExerciceId) return;
        setConfirmReviserPopup(true);
    };

    const handleConfirmReviser = async (confirmed) => {
        if (!confirmed) {
            setConfirmReviserPopup(false);
            return;
        }

        await executeControler();
        setConfirmReviserPopup(false);
    };

    const handleToggleValidateType = async (type, nextValider) => {
        try {
            const items = (controlesByType.get(type) || []).filter((c) => c?.id);
            
            // Si on essaie de valider (pas d'annuler), vérifier que toutes les anomalies sont validées
            if (nextValider) {
                const { id_compte, id_dossier, id_exercice } = getIds();
                
                // Récupérer toutes les anomalies pour ce type de contrôle
                let hasUnvalidatedAnomalies = false;
                let totalUnvalidated = 0;
                
                for (const controle of items) {
                    try {
                        let url = `/administration/revisionControleAuto/${id_compte}/${id_dossier}/${id_exercice}/anomalies/controle/${encodeURIComponent(controle.id_controle)}`;
                        if (selectedPeriodeDates) {
                            const params = new URLSearchParams();
                            params.append('date_debut', selectedPeriodeDates.date_debut);
                            params.append('date_fin', selectedPeriodeDates.date_fin);
                            url += `?${params.toString()}`;
                        }
                        
                        const response = await axiosPrivate.get(url);
                        if (response.data.state && response.data.anomalies) {
                            const unvalidated = response.data.anomalies.filter(a => !a.valide);
                            if (unvalidated.length > 0) {
                                hasUnvalidatedAnomalies = true;
                                totalUnvalidated += unvalidated.length;
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching anomalies for controle:', controle.id_controle, err);
                    }
                }
                
                if (hasUnvalidatedAnomalies) {
                    setErrorPopup({
                        open: true,
                        message: `Impossible de valider : il reste ${totalUnvalidated} anomalie(s) non validée(s). Veuillez d'abord valider toutes les anomalies dans les détails.`
                    });
                    return;
                }
            }
            
            // Ouvrir le popup de confirmation
            setConfirmPopup({ open: true, type, nextValider });
        } catch (error) {
            console.error('Error in handleToggleValidateType:', error);
        }
    };

    const handleConfirmValidation = async (confirmed) => {
        if (!confirmed || !confirmPopup.type) {
            setConfirmPopup({ open: false, type: null, nextValider: null });
            return;
        }
        
        setConfirmLoading(true);
        try {
            const items = (controlesByType.get(confirmPopup.type) || []).filter((c) => c?.id);
            await Promise.all(
                items.map((c) =>
                    axiosPrivate.put(`/param/revisionControle/validation/${c.id}`, {
                        Valider: confirmPopup.nextValider
                    })
                )
            );
            await fetchControles();
        } catch (error) {
            console.error('Error updating validation for type:', confirmPopup.type, error);
            alert('Erreur lors de la validation');
        } finally {
            setConfirmLoading(false);
            setConfirmPopup({ open: false, type: null, nextValider: null });
        }
    };

    const controlesGrouped = useMemo(() => {
        const byType = new Map();

        for (const c of controles || []) {
            const key = c?.Type || '';
            if (!key) continue;

            const existing = byType.get(key);
            if (!existing) {
                byType.set(key, {
                    Type: key,
                    description: c?.description,
                    anomalies: Number(c?.anomalies) || 0,
                    Valider: Boolean(c?.Valider),
                    _count: 1
                });
            } else {
                existing.anomalies += Number(c?.anomalies) || 0;
                existing.Valider = existing.Valider && Boolean(c?.Valider);
                existing._count += 1;
            }
        }

        return Array.from(byType.values()).sort((a, b) => a.Type.localeCompare(b.Type));
    }, [controles]);

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

    return (
        <Box sx={{ p: 2, height: '100vh', backgroundColor: '#f5f5f5' }}>
            {confirmReviserPopup && (
                <PopupActionConfirm
                    msg="Confirmer l'exécution de la révision ?"
                    confirmationState={handleConfirmReviser}
                    isLoading={confirmReviserLoading}
                />
            )}
            <Box
                sx={{
                    mb: 3,
                    backgroundColor: 'white',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                <Typography component="div" variant="h7" sx={{ fontWeight: 600, color: '#333', mb: 2, display: 'block' }}>
                    Administration-Révision
                </Typography>

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
                                    sx={{
                                        height: 32,
                                        fontSize: 15,
                                        '& .MuiSelect-select': { py: 0.5 },
                                    }}
                                    MenuProps={{ disableScrollLock: true }}
                                >
                                    <MenuItem value="exercice">
                                        {currentExerciceDates ? `${formatDate(currentExerciceDates.date_debut)} au ${formatDate(currentExerciceDates.date_fin)}` : 'Tout l\'exercice'}
                                    </MenuItem>
                                    {listePeriodes.map((periode) => (
                                        <MenuItem key={periode.id} value={periode.id}>
                                            {periode.libelle}{formatDate(periode.date_debut)} au {formatDate(periode.date_fin)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleControler}
                        disabled={!selectedExerciceId}
                        style={{
                            textTransform: 'none',
                            outline: 'none',
                            backgroundColor: initial.theme,
                            color: "white",
                            height: "32px",
                        }}
                    >
                        Réviser
                    </Button>
                    {controlesGrouped.length > 0 && (
                        <Chip
                            label={`${controlesGrouped.reduce((sum, c) => sum + (c.anomalies || 0), 0)} anomalies`}
                            color="warning"
                            size="small"
                            sx={{ ml: 1 }}
                        />
                    )}
                </Box>
            </Box>

            <Paper sx={{ p: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowControles(!showControles)}
                        sx={{ height: 32, borderRadius: 1 }}
                    >
                        {showControles ? 'Masquer' : 'Afficher'} ({controlesGrouped.length})
                    </Button>
                </Box>

                {showControles &&
                    (controlesGrouped.length === 0 ? (
                        <Alert severity="info">
                            Aucun contrôle trouvé pour cet exercice. Les contrôles seront créés automatiquement.
                        </Alert>
                    ) : (
                        <Box sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={controlesGrouped.map((c, idx) => ({ id: idx, ...c }))}
                                columns={[
                                    // {
                                    //     field: 'Type',
                                    //     headerName: 'Type',
                                    //     width: 150, // largeur fixe
                                    //     renderCell: (params) => (
                                    //         <Typography
                                    //             variant="body2"
                                    //             sx={{
                                    //                 fontSize: 13,
                                    //                 whiteSpace: 'nowrap',
                                    //                 overflow: 'hidden',
                                    //                 textOverflow: 'ellipsis',
                                    //             }}
                                    //         >
                                    //             {params.value}
                                    //         </Typography>
                                    //     ),
                                    // },
                                    {
                                        field: 'description',
                                        headerName: 'Description',
                                        width: 500
                                    },
                                    {
                                        field: 'anomalies',
                                        headerName: 'Anomalies',
                                        width: 110,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={params.value || 0}
                                                    color={params.value > 0 ? 'warning' : 'success'}
                                                    size="small"
                                                />
                                            </Box>
                                        )
                                    },
                                    {
                                        field: 'Valider',
                                        headerName: 'Validé',
                                        width: 80,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Chip
                                                label={params.value ? 'Oui' : 'Non'}
                                                color={params.value ? 'success' : 'default'}
                                                size="small"
                                            />
                                        )
                                    },
                                    {
                                        field: 'actions',
                                        headerName: 'Action',
                                        width: 220,
                                        align: 'center',
                                        headerAlign: 'center',
                                        sortable: false,
                                        renderCell: (params) => (
                                            <ButtonGroup
                                                variant="outlined"
                                                sx={{
                                                    boxShadow: 'none',
                                                    display: 'flex',
                                                    gap: '2px',
                                                    '& .MuiButton-root': {
                                                        borderRadius: 0,
                                                        minWidth: '80px',
                                                        height: '28px',
                                                        fontSize: '0.75rem',
                                                        textTransform: 'none',
                                                    },
                                                    '& .MuiButtonGroup-grouped': {
                                                        boxShadow: 'none',
                                                        outline: 'none',
                                                        borderColor: 'inherit',
                                                        marginLeft: 0,
                                                        borderRadius: 1,
                                                        border: 'none',
                                                    },
                                                    '& .MuiButtonGroup-grouped:hover': {
                                                        boxShadow: 'none',
                                                        borderColor: 'inherit',
                                                        border: 'none',
                                                    },
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disableElevation
                                                    sx={{
                                                        backgroundColor: initial.theme,
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: initial.theme,
                                                        },
                                                    }}
                                                    onClick={() => handleToggleValidateType(params.row.Type, !params.row.Valider)}
                                                >
                                                    {params.row.Valider ? 'Annuler' : 'Valider'}
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disableElevation
                                                    sx={{
                                                        backgroundColor: initial.add_new_line_bouton_color,
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: initial.add_new_line_bouton_color,
                                                        },
                                                    }}
                                                    disabled={detailsLoading}
                                                    onClick={() => {
                                                        const type = params.row.Type;
                                                        const items = controlesByType.get(type);
                                                        if (!items || items.length === 0) {
                                                            console.warn('Aucun contrôle trouvé pour le type:', type);
                                                            return;
                                                        }
                                                        setDetailsLoading(true);
                                                        setSelectedTypeDetails(type);
                                                        setTimeout(() => setDetailsLoading(false), 500);
                                                    }}
                                                >
                                                    Détails
                                                </Button>
                                            </ButtonGroup>
                                        )
                                    }
                                ]}
                                pageSizeOptions={[5, 10, 25]}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } }
                                }}
                                disableRowSelectionOnClick
                                density="compact"
                                sx={{
                                    '& .MuiDataGrid-cell:focus': {
                                        outline: 'none',
                                    },
                                    '& .MuiDataGrid-cell:focus-within': {
                                        outline: 'none',
                                    },
                                }}
                            />
                        </Box>
                    ))}
            </Paper>

            {/* DETAILS */}
            {selectedTypeDetails && (
                <RevisionDetails
                    type={selectedTypeDetails}
                    controles={controlesByType.get(selectedTypeDetails) || []}
                    onClose={() => setSelectedTypeDetails('')}
                    idCompte={getIds().id_compte}
                    idDossier={getIds().id_dossier}
                    idExercice={selectedExerciceId}
                    dateDebut={selectedPeriodeDates?.date_debut || currentExerciceDates?.date_debut}
                    dateFin={selectedPeriodeDates?.date_fin || currentExerciceDates?.date_fin}
                    isPeriodeSelected={!!selectedPeriodeDates}
                    onValidationChange={fetchControles}
                />
            )}
            {/* POPUP DE CONFIRMATION POUR VALIDATION */}
            {confirmPopup.open && (
                <PopupActionConfirm
                    msg={confirmPopup.nextValider
                        ? `Voulez-vous valider tous les contrôles de type "${confirmPopup.type}" ?`
                        : `Voulez-vous annuler la validation de tous les contrôles de type "${confirmPopup.type}" ?`}
                    confirmationState={handleConfirmValidation}
                    isLoading={confirmLoading}
                />
            )}

            {/* POPUP D'ERREUR POUR ANOMALIES NON VALIDÉES */}
            <Dialog
                open={errorPopup.open}
                onClose={() => setErrorPopup({ open: false, message: '' })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>⚠️</span> Validation impossible
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mt: 1 }}>
                        {errorPopup.message}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => setErrorPopup({ open: false, message: '' })}
                        sx={{ backgroundColor: initial.theme }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* POPUP DE RÉSULTAT DE RÉVISION */}
            <Dialog
                open={reviserPopup.open}
                onClose={() => setReviserPopup({ open: false, message: '', success: true })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: reviserPopup.success ? 'success.main' : 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{reviserPopup.success ? '✅' : '❌'}</span> {reviserPopup.success ? 'Contrôle terminé' : 'Erreur'}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mt: 1 }}>
                        {reviserPopup.message}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => setReviserPopup({ open: false, message: '', success: true })}
                        sx={{ backgroundColor: initial.theme }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}