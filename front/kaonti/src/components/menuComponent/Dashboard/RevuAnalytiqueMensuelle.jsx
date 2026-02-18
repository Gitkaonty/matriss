import { useCallback, useMemo, useState, useEffect } from 'react';
import { Badge, Box, Checkbox, IconButton } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { DataGrid, frFR } from '@mui/x-data-grid';
import { DataGridStyle } from '../../componentsTools/DatagridToolsStyle';
import { init } from '../../../../init';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import PopupCommentaireAnalytique from './PopupCommentaireAnalytique';

export default function RevuAnalytiqueMensuelle({ compteId, dossierId, exerciceId }) {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();
    
    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [moisColumns, setMoisColumns] = useState([]);

    const handleToggleValide = useCallback(
        async (row, checked) => {
            try {
                await axiosPrivate.post('/commentaireAnalytiqueMensuelle/addOrUpdate', {
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

    // Colonnes de base fixes
    const baseColumns = [
        {
            field: 'compte',
            headerName: 'Compte',
            flex: 0.8,
            minWidth: 100,
        },
        {
            field: 'libelle',
            headerName: 'Libelle',
            flex: 1.5,
            minWidth: 180,
        }
    ];

    // Colonnes dynamiques pour les mois
    const monthColumns = useMemo(() => {
        return moisColumns.map(mois => ({
            field: mois.nom,
            headerName: mois.nomAffiche,
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
        }));
    }, [moisColumns]);

    // Colonnes finales
    const columns = useMemo(() => {
        const finalColumns = [
            ...baseColumns,
            ...monthColumns,
            {
                field: 'total_exercice',
                headerName: 'Total',
                type: 'number',
                flex: 1.2,
                minWidth: 140,
                align: 'right',
                headerAlign: 'right',
                renderCell: (params) => (
                    <Box
                        sx={{
                            color: params.value > 0 ? 'blue' : params.value < 0 ? 'red' : 'inherit',
                            fontWeight: params.value !== 0,
                            width: '100%',
                            textAlign: 'right'
                        }}
                    >
                        {params.value?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                    </Box>
                ),
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
                                sx={{
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }}
                                onClick={() => {
                                    setSelectedRow({
                                        ...params.row,
                                        id_compte: compteId,
                                        id_exercice: exerciceId,
                                        id_dossier: dossierId,
                                    });
                                    setPopupOpen(true);
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
        ];
        return finalColumns;
    }, [compteId, dossierId, exerciceId, handleToggleValide, monthColumns]);

    useEffect(() => {
        const fetchRevuAnalytiqueMensuelle = async () => {
            try {
                setLoading(true);
                if (!compteId || !dossierId || !exerciceId) {
                    setRows([]);
                    setMoisColumns([]);
                    return;
                }

                const response = await axiosPrivate.get(`/dashboard/revuAnalytiqueMensuelle/${compteId}/${dossierId}/${exerciceId}`);
                
                if (response.data.state) {
                    console.log('[RevuAnalytiqueMensuelle] Données reçues:', response.data);
                    console.log('[RevuAnalytiqueMensuelle] Colonnes mois:', response.data.moisColumns);
                    
                    setRows(response.data.data);
                    setMoisColumns(response.data.moisColumns || []);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données mensuelles:', error);
                setRows([]);
                setMoisColumns([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRevuAnalytiqueMensuelle();
    }, [axiosPrivate, compteId, dossierId, exerciceId]);

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
                apiBasePath="/commentaireAnalytiqueMensuelle"
            />
        </Box>
    );
}
