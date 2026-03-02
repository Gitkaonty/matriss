import { useCallback, useMemo, useState, useEffect } from 'react';
import { Badge, Box, Checkbox, IconButton } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { DataGrid, frFR } from '@mui/x-data-grid';
import { DataGridStyle } from '../../componentsTools/DatagridToolsStyle';
import { init } from '../../../../init';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import PopupCommentaireAnalytique from './PopupCommentaireAnalytique';

export default function RevuAnalytiqueNN1({ compteId, dossierId, exerciceId }) {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();

    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleToggleValide = useCallback(
        async (row, checked) => {
            try {
                await axiosPrivate.post('/commentaireAnalytique/addOrUpdate', {
                    id_compte: compteId,
                    id_exercice: exerciceId,
                    id_dossier: dossierId,
                    compte: row.compte,
                    commentaire: row.commentaire || '',
                    valide_anomalie: checked,
                });

                setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, valide_anomalie: checked } : r)));
            } catch (error) {
                console.error('Erreur lors de la validation anomalie:', error);
            }
        },
        [axiosPrivate, compteId, dossierId, exerciceId]
    );

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
                        disabled
                        sx={{
                            '&.Mui-disabled': {
                                color: params.value ? 'orange' : 'green'
                            }
                        }}
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
                                    setSelectedRow({
                                        ...params.row,
                                        id_compte: compteId,
                                        id_exercice: exerciceId,
                                        id_dossier: dossierId,
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
        [compteId, dossierId, exerciceId, handleToggleValide]
    );

    useEffect(() => {
        const fetchRevuAnalytique = async () => {
            try {
                setLoading(true);
                if (!compteId || !dossierId || !exerciceId) {
                    setRows([]);
                    return;
                }

                const response = await axiosPrivate.get(`/dashboard/revuAnalytiqueNN1/${compteId}/${dossierId}/${exerciceId}`);

                if (response.data.state) {
                    console.log('[RevuAnalytiqueNN1] Données reçues du backend:', response.data.data);
                    const formattedRows = response.data.data.map((row, index) => ({
                        id: index,
                        compte: row.compte,
                        libelle: row.libelle,
                        soldeN: row.soldeN,
                        soldeN1: row.soldeN1,
                        var: row.var,
                        varPourcent: row.varPourcent,
                        // Ne pas marquer comme anomalie si le journal N-1 n'existe pas (soldeN1 null/undefined)
                        anomalies: (row.soldeN1 === null || row.soldeN1 === undefined) ? false : row.anomalies,
                        commentaire: row.commentaire,
                        valide_anomalie: row.valide_anomalie
                    }));
                    console.log('[RevuAnalytiqueNN1] Données formatées:', formattedRows);
                    setRows(formattedRows);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevuAnalytique();
    }, [axiosPrivate, compteId, dossierId, exerciceId]);

    const handleSaveCommentaire = (savedCommentaire) => {
        // Mettre à jour la ligne dans le tableau avec le nouveau commentaire
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

    return (
        <Box sx={{ width: '100%', height: '60vh' }}>
            <DataGrid
                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                rows={rows}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                rowHeight={35}
                columnHeaderHeight={35}
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
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 25 },
                    },
                }}
                pageSizeOptions={[25, 50, 100]}
                processRowUpdate={(newRow) => {
                    setRows((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
                    return newRow;
                }}
            />

            <PopupCommentaireAnalytique
                open={popupOpen}
                onClose={() => setPopupOpen(false)}
                compteData={selectedRow}
                onSave={handleSaveCommentaire}
            />
        </Box>
    );
}
