import { useState, useEffect, useCallback, useMemo } from 'react';
import { Select, MenuItem, Stack, Typography } from '@mui/material';
import axios from '../../../../config/axios';

const ExercicePeriodeSelector = ({
    selectedExerciceId,
    selectedPeriodeId,
    onExerciceChange,
    onPeriodeChange,
    disabled = false,
    showPeriodeOnly = false,
    size = "small",
    sx = {},
    exerciceSx = {},
    periodeSx = {}
}) => {
    const [listeExercice, setListeExercice] = useState([]);
    const [listePeriodes, setListePeriodes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Récupérer les IDs depuis sessionStorage
    const getIds = () => {
        return {
            id_compte: parseInt(sessionStorage.getItem('compteId')) || 1,
            id_dossier: parseInt(sessionStorage.getItem('fileId')) || 1
        };
    };

    // Formatter les dates
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Récupérer les exercices
    const fetchExercices = useCallback(async () => {
        try {
            setLoading(true);
            const { id_dossier } = getIds();
            const response = await axios.get(`/paramExercice/listeExercice/${id_dossier}`);
            const resData = response.data;
            if (resData.state) {
                setListeExercice(resData.list || []);
            }
        } catch (error) {
            console.error('Error fetching exercices:', error);
            setListeExercice([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Récupérer les périodes pour un exercice
    const fetchPeriodes = useCallback(async (exerciceId) => {
        if (!exerciceId) {
            setListePeriodes([]);
            return;
        }
        try {
            const response = await axios.get(`/paramExercice/listePeriodes/${exerciceId}`);
            if (response.data.state) {
                setListePeriodes(response.data.list || []);
            } else {
                setListePeriodes([]);
            }
        } catch (error) {
            console.error('Error fetching periodes:', error);
            setListePeriodes([]);
        }
    }, []);

    // Effet pour charger les exercices au montage
    useEffect(() => {
        fetchExercices();
    }, [fetchExercices]);

    // Effet pour charger les périodes quand l'exercice change
    useEffect(() => {
        if (selectedExerciceId && selectedExerciceId > 0) {
            fetchPeriodes(selectedExerciceId);
        } else {
            setListePeriodes([]);
        }
    }, [selectedExerciceId, fetchPeriodes]);

    // Gérer le changement d'exercice
    const handleExerciceChange = (exerciceId) => {
        onExerciceChange(exerciceId);
        // Réinitialiser la période quand l'exercice change
        if (onPeriodeChange) {
            onPeriodeChange('');
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

    return (
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {!showPeriodeOnly && (
                <Select
                    size={size}
                    value={selectedExerciceId || ''}
                    onChange={(e) => handleExerciceChange(e.target.value)}
                    disabled={disabled || loading}
                    displayEmpty
                    sx={{
                        minWidth: 220,
                        bgcolor: 'white',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        height: 32,
                        '& .MuiSelect-select': {
                            padding: '4px 12px',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        ...exerciceSx,
                        ...sx
                    }}
                >
                    <MenuItem value="" disabled>
                        <em>Sélectionner un exercice...</em>
                    </MenuItem>
                    {listeExercice.map((exercice) => (
                        <MenuItem
                            key={exercice.id}
                            value={exercice.id}
                            sx={{
                                fontSize: '0.8rem',
                                minHeight: 28,
                                py: 0.5
                            }}
                        >
                            {exercice.libelle_rang} - {formatDate(exercice.date_debut)} au {formatDate(exercice.date_fin)}
                        </MenuItem>
                    ))}
                </Select>
            )}

            {listePeriodes.length > 0 && (
                <Select
                    size={size}
                    value={selectedPeriodeId || ''}
                    onChange={(e) => onPeriodeChange(e.target.value)}
                    disabled={disabled || loading || (!selectedExerciceId && !showPeriodeOnly)}
                    displayEmpty
                    sx={{
                        minWidth: 220,
                        bgcolor: 'white',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        height: 32,
                        '& .MuiSelect-select': {
                            padding: '4px 12px',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        ...periodeSx,
                        ...sx
                    }}
                >
                    <MenuItem value="">
                        <em>Sélectionner une période...</em>
                    </MenuItem>
                    {/* {!showPeriodeOnly && (
                        <MenuItem value="exercice">
                            <em>Tout l'exercice</em>
                        </MenuItem>
                    )} */}
                    {listePeriodes.map((periode) => (
                        <MenuItem
                            key={periode.id}
                            value={periode.id}
                            sx={{
                                fontSize: '0.8rem',
                                minHeight: 28,
                                py: 0.5
                            }}
                        >
                            {periode.libelle} {formatDate(periode.date_debut)} au {formatDate(periode.date_fin)}
                        </MenuItem>
                    ))}
                </Select>
            )}
            {/* {currentExerciceDates && !showPeriodeOnly && (
                <Typography variant="caption" sx={{ color: 'gray', ml: 1 }}>
                    Exercice: {formatDate(currentExerciceDates.date_debut)} au {formatDate(currentExerciceDates.date_fin)}
                </Typography>
            )} */}
        </Stack>
    );
};

export default ExercicePeriodeSelector;
