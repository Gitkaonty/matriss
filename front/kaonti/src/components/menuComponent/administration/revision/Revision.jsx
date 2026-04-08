import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    DialogActions,
    Collapse,
    Divider
} from '@mui/material';

import { init } from '../../../../../init';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import RevisionDetails from './RevisionDetails';
import PopupActionConfirm from "../../../componentsTools/popupActionConfirm";
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { ErrorOutline, CheckCircle, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
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

export default function Revision() {
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
        loading: contextLoading
    } = useExercicePeriode();

    const [activeTab, setActiveTab] = useState(0); // 0 = Fournisseur, 1 = Client
    const [loading, setLoading] = useState(false);


    const [controles, setControles] = useState([]);
    const [showControles, setShowControles] = useState(true);
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

    // === Variables restantes pour logique spécifique ===
    const [searchParams] = useSearchParams();
    const [fileInfos, setFileInfos] = useState(null);

    const [noFile, setNoFile] = useState(false);
    const [fileId, setFileId] = useState(0);

    // Debug multi-onglets: log quand l'onglet reprend le focus
    useEffect(() => {
        const onFocus = () => {
            const ids = getIds();
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [selectedExerciceId, selectedPeriodeId, selectedPeriodeDates]);

    // Lecture des paramètres d'URL pour date_debut et date_fin
    useEffect(() => {
        const dateDebutFromUrl = searchParams.get('date_debut');
        const dateFinFromUrl = searchParams.get('date_fin');
        const idPeriodeFromUrl = searchParams.get('id_periode');

        // La logique URL sera gérée par le contexte maintenant
    }, [searchParams]);

    // Synchroniser l'exercice depuis l'URL
    useEffect(() => {
        const { id_exercice } = getIds();
        if (id_exercice && id_exercice > 0 && id_exercice !== selectedExerciceId) {
            // Le contexte gérera la synchronisation
        }
    }, []);

    // Logique URL simplifiée - gérée par le contexte
    // useEffect(() => {
    //     if (!listePeriodes || listePeriodes.length === 0) return;
    //     // ... logique déplacée dans le contexte
    // }, [listePeriodes, searchParams]);

    const [periodeErrorPopup, setPeriodeErrorPopup] = useState({ open: false, message: '' });

    const getIds = () => {
        const pathParts = window.location.pathname.split('/');
        const idIndex = pathParts.indexOf('revision') + 1;
        const dossierFromUrl = parseInt(pathParts[idIndex]);
        const exerciceFromUrl = parseInt(pathParts[idIndex + 1]);
        return {
            id_compte: parseInt(sessionStorage.getItem('compteId')) || 1,
            id_dossier: dossierFromUrl || parseInt(sessionStorage.getItem('fileId')) || 1,
            id_exercice: exerciceFromUrl || selectedExerciceId || parseInt(sessionStorage.getItem('exerciceId')) || 1
        };
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
                if (selectedPeriodeId) {
                    params.append('id_periode', selectedPeriodeId);
                }
                url += `?${params.toString()}`;
            }

            const response = await axiosPrivate.get(url);
          
            if (response.data.state) {
                setControles(response.data.controles);
                setControles(response.data.controles);
            }
        } catch (error) {
            console.error('Error fetching controles:', error);
        }
    }, [axiosPrivate, selectedExerciceId, selectedPeriodeDates, selectedPeriodeId]);


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

            if (selectedPeriodeDates && selectedPeriodeId) {
                const params = new URLSearchParams();
                params.append('date_debut', selectedPeriodeDates.date_debut);
                params.append('date_fin', selectedPeriodeDates.date_fin);
                params.append('id_periode', selectedPeriodeId);
                url += `?${params.toString()}`;
                // console.log('DEBUG FRONT - URL handleControler:', url);
            }

            const response = await axiosPrivate.post(url);

            if (response.data.state) {
                // console.log('Contrôle global exécuté:', response.data);
                await fetchControles();
                setReviserPopup({
                    open: true,
                    message: `Contrôle terminé!`,
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

        // Vérifier qu'une période spécifique est sélectionnée
        if (!selectedPeriodeId || selectedPeriodeId === 'exercice') {
            setPeriodeErrorPopup({
                open: true,
                message: 'Veuillez sélectionner une période spécifique avant de lancer la révision.'
            });
            return;
        }

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
                        if (selectedPeriodeDates && selectedPeriodeId) {
                            const params = new URLSearchParams();
                            params.append('date_debut', selectedPeriodeDates.date_debut);
                            params.append('date_fin', selectedPeriodeDates.date_fin);
                            params.append('id_periode', selectedPeriodeId);
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
    // const currentExerciceDates = useMemo(() => {
    //     const exercice = listeExercice.find(e => e.id === selectedExerciceId);
    //     if (exercice) {
    //         return {
    //             date_debut: exercice.date_debut,
    //             date_fin: exercice.date_fin,
    //             libelle_rang: exercice.libelle_rang
    //         };
    //     }
    //     return null;
    // }, [listeExercice, selectedExerciceId]);

    const [expandedType, setExpandedType] = useState('');

    const handleToggleExpand = (type) => {
        if (expandedType === type) {
            setExpandedType('');
        } else {
            setExpandedType(type);
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography component="div" variant="h6" sx={{ fontWeight: 800, color: '#333' }}>
                               Révision Globale
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
                        {showControles &&
                            (controlesGrouped.length === 0 ? (
                                <Alert severity="info">
                                    Aucun contrôle trouvé pour cet exercice. Les contrôles seront créés automatiquement.
                                </Alert>
                            ) : (
                                <Stack spacing={1.5} sx={{ width: '100%' }}>
                                    {controlesGrouped.map((item) => {
                                        // Déterminer si tout est OK (0 anomalies)
                                        const isAllGood = item.anomalies === 0;
                                        // Calculer le restant (si on avait une donnée, sinon on affiche 0 ou le total)
                                        const restant = item.anomalies || 0;

                                        return (
                                            <Paper key={item.Type} elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden', width: '100%' }}>
                                                <Box
                                                    onClick={() => handleToggleExpand(item.Type)}
                                                    sx={{
                                                        p: 2,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        position: 'relative',
                                                        bgcolor: expandedType === item.Type ? '#F8FAFC' : 'white'
                                                    }}
                                                >
                                                    {/* Bordure latérale : Verte si 0 anomalies, Rouge sinon */}
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        width: '5px',
                                                        bgcolor: isAllGood ? '#10B981' : '#EF4444'
                                                    }} />

                                                    <Stack direction="row" sx={{ width: '100%' }} alignItems="center" spacing={3}>
                                                        <Box sx={{ ml: 1 }}>
                                                            {isAllGood ?
                                                                <CheckCircle sx={{ color: '#10B981', fontSize: 26 }} /> :
                                                                <ErrorOutline sx={{ color: '#EF4444', fontSize: 26 }} />
                                                            }
                                                        </Box>

                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                                                                {item.description}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem', mb: 0.5 }}>
                                                                {item.Type}
                                                            </Typography>
                                                        </Box>

                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            {/* TOTAL ANOMALIES */}
                                                            <Chip
                                                                label={`${item.anomalies || 0} TOTAL`}
                                                                sx={{
                                                                    bgcolor: item.anomalies > 0 ? '#FEE2E2' : '#DCFCE7',
                                                                    color: item.anomalies > 0 ? '#B91C1C' : '#15803D',
                                                                    fontWeight: 900,
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.75rem',
                                                                    minWidth: '80px'
                                                                }}
                                                            />

                                                            {/* RESTANT - affiché seulement s'il y a des anomalies */}
                                                            {item.anomalies > 0 && (
                                                                <Chip
                                                                    label={`${restant} RESTANT`}
                                                                    sx={{
                                                                        bgcolor: '#E0F7FA',
                                                                        color: '#00ACC1',
                                                                        fontWeight: 900,
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.75rem',
                                                                        minWidth: '90px'
                                                                    }}
                                                                />
                                                            )}

                                                            <Box sx={{ minWidth: '40px', textAlign: 'center' }}>
                                                                {expandedType === item.Type ?
                                                                    <KeyboardArrowUp color="action" /> :
                                                                    <KeyboardArrowDown color="action" />
                                                                }
                                                            </Box>
                                                        </Stack>
                                                    </Stack>
                                                </Box>

                                                {/* Détails dans le pavé */}
                                                <Collapse in={expandedType === item.Type} timeout="auto" unmountOnExit>
                                                    <Divider />
                                                    <Box sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                                                        <RevisionDetails
                                                            type={item.Type}
                                                            controles={controlesByType.get(item.Type) || []}
                                                            onClose={() => setExpandedType('')}
                                                            idCompte={getIds().id_compte}
                                                            idDossier={getIds().id_dossier}
                                                            idExercice={selectedExerciceId}
                                                            idPeriode={selectedPeriodeId}
                                                            dateDebut={selectedPeriodeDates?.date_debut || currentExerciceDates?.date_debut}
                                                            dateFin={selectedPeriodeDates?.date_fin || currentExerciceDates?.date_fin}
                                                            isPeriodeSelected={!!selectedPeriodeDates}
                                                            onValidationChange={fetchControles}
                                                        />
                                                    </Box>
                                                </Collapse>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            ))}
                    </Paper>

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

                    {/* POPUP D'ERREUR POUR PÉRIODE NON SÉLECTIONNÉE */}
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
            )}
        </>
    );
}