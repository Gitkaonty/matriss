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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { init } from '../../../../../init';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
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

export default function RevisionAnalytique() {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const [listeExercice, setListeExercice] = useState([]);
    const [selectedExerciceId, setSelectedExerciceId] = useState(0);
    const [fileInfos, setFileInfos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [noFile, setNoFile] = useState(false);
    const [fileId, setFileId] = useState(0);

    // === Périodes ===
    const [listePeriodes, setListePeriodes] = useState([]);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
    const [selectedPeriodeDates, setSelectedPeriodeDates] = useState(null);

    // === Résultats ===
    const [resultats, setResultats] = useState([]);

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
        const idIndex = pathParts.indexOf('revisionAnalytique') + 1;
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
        setResultats([]);
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

    const handleControler = async () => {
        if (!selectedExerciceId) return;

        // Vérifier qu'une période est sélectionnée
        if (!selectedPeriodeId) {
            alert('Veuillez sélectionner une période avant de lancer le contrôle.');
            return;
        }

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

            const response = await axiosPrivate.post(`/administration/revisionAnalytique/${id_compte}/${id_dossier}/${id_exercice}?${queryString}`);
            if (response.data.state) {
                setResultats(response.data.data || []);
            } else {
                alert(response.data.message || 'Erreur lors du contrôle');
            }
        } catch (error) {
            console.error('Error executing control:', error);
            alert('Erreur lors du contrôle analytique');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        // { field: 'id', headerName: 'ID', width: 80 },
        { field: 'date', headerName: 'Date', width: 120 },
        { field: 'compte', headerName: 'Compte', width: 150 },
        { field: 'libelle', headerName: 'Libellé', width: 300 },
        {
            field: 'debit',
            headerName: 'Débit',
            width: 120,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (params) => params.value ? parseFloat(params.value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
        },
        {
            field: 'credit',
            headerName: 'Crédit',
            width: 120,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (params) => params.value ? parseFloat(params.value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
        },
    ];

    return (
        <>
            {noFile ? (
                <PopupTestSelectedFile
                    confirmationState={sendToHome}
                />
            ) : (
                <Box sx={{ p: 2, height: '100vh', backgroundColor: '#f5f5f5' }}>
                    {/* Dossier info */}
                    <Box sx={{ mb: 1, width: '100px' }}>
                        {InfoFileStyle(fileInfos?.dossier)}
                    </Box>

                    {/* Header with Exercise, Period and Controler button */}
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
                                Administration - Révision Analytique
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
                                onClick={handleControler}
                                disabled={!selectedExerciceId || loading}
                                style={{
                                    textTransform: 'none',
                                    outline: 'none',
                                    backgroundColor: initial.theme,
                                    color: "white",
                                    height: "32px",
                                }}
                            >
                                {loading ? 'Contrôle...' : 'Contrôler'}
                            </Button>
                        </Box>
                    </Box>

                    {/* Résultats */}
                    <Paper sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)', p: 2, height: 'calc(100vh - 200px)' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Résultats de la révision analytique
                        </Typography>
                        {resultats.length > 0 ? (
                            <DataGrid
                                rows={resultats}
                                columns={columns}
                                pageSizeOptions={[10, 25, 50, 100]}
                                initialState={{
                                    pagination: {
                                        paginationModel: { pageSize: 25 },
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
                                    '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                        color: initial.text_theme,
                                    },
                                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                        outline: 'none',
                                        border: 'none',
                                    }
                                }}
                            />
                        ) : (
                            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                                Aucun résultat. Sélectionnez un exercice et une période puis cliquez sur "Contrôler" pour lancer la révision.
                            </Typography>
                        )}
                    </Paper>
                </Box>
            )}
        </>
    );
}
