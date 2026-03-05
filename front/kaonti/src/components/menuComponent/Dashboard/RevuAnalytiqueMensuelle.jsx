import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Badge, Box, Checkbox, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { init } from '../../../../init';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import PopupCommentaireAnalytique from './PopupCommentaireAnalytique';

export default function RevuAnalytiqueMensuelle({ compteId, dossierId, exerciceId, dateDebut, dateFin }) {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();

    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [moisColumns, setMoisColumns] = useState([]);
    const scrollContainerRef = useRef(null);

    const handleToggleAnomalie = useCallback(
        async (row, checked) => {
            try {
                await axiosPrivate.post('/commentaireAnalytiqueMensuelle/addOrUpdate', {
                    id_compte: compteId,
                    id_exercice: exerciceId,
                    id_dossier: dossierId,
                    compte: row.compte,
                    commentaire: row.commentaire || '',
                    valide_anomalie: row.valide_anomalie,
                    anomalies: checked,
                });

                setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, anomalies: checked } : r)));
            } catch (error) {
                console.error('Erreur lors de la mise à jour anomalie:', error);
            }
        },
        [axiosPrivate, compteId, dossierId, exerciceId]
    );

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
                    anomalies: row.anomalies,
                });

                setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, valide_anomalie: checked } : r)));
            } catch (error) {
                console.error('Erreur lors de la validation anomalie:', error);
            }
        },
        [axiosPrivate, compteId, dossierId, exerciceId]
    );

    // Colonnes de base fixes (Compte + Libelle avec classes CSS sticky)
    const baseColumns = [
        {
            field: 'compte',
            headerName: 'Compte',
            width: 100,
            sortable: false,
            disableColumnMenu: true,
            headerClassName: 'sticky-header-col-0',
            cellClassName: 'sticky-cell-col-0',
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            width: 180,
            sortable: false,
            disableColumnMenu: true,
            headerClassName: 'sticky-header-col-1',
            cellClassName: 'sticky-cell-col-1',
        }
    ];

    // Colonnes dynamiques pour les mois
    const monthColumns = useMemo(() => {
        return moisColumns.map(mois => ({
            field: mois.nom,
            headerName: mois.nomAffiche,
            type: 'number',
            width: 110,
            align: 'right',
            headerAlign: 'right',
            sortable: false,
            disableColumnMenu: true,
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
                width: 130,
                align: 'right',
                headerAlign: 'right',
                sortable: false,
                disableColumnMenu: true,
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
                width: 90,
                sortable: false,
                disableColumnMenu: true,
                renderCell: (params) => (
                    <Checkbox
                        size="small"
                        checked={!!params.value}
                        onChange={(e) => handleToggleAnomalie(params.row, e.target.checked)}
                        sx={{
                            color: params.value ? 'orange' : 'green',
                            '&.Mui-checked': {
                                color: 'orange',
                            },
                        }}
                    />
                ),
            },
            {
                field: 'valide_anomalie',
                headerName: 'Validé',
                width: 70,
                sortable: false,
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
                width: 240,
                sortable: false,
                disableColumnMenu: true,
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
    }, [monthColumns, compteId, dossierId, exerciceId, handleToggleValide, handleToggleAnomalie]);

    useEffect(() => {
        const fetchRevuAnalytiqueMensuelle = async () => {
            try {
                setLoading(true);
                if (!compteId || !dossierId || !exerciceId) {
                    setRows([]);
                    setMoisColumns([]);
                    return;
                }

                let url = `/dashboard/revuAnalytiqueMensuelle/${compteId}/${dossierId}/${exerciceId}`;
                if (dateDebut && dateFin) {
                    url += `?date_debut=${dateDebut}&date_fin=${dateFin}`;
                }
                const response = await axiosPrivate.get(url);

                if (response.data.state) {
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
    }, [axiosPrivate, compteId, dossierId, exerciceId, dateDebut, dateFin]);

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

    // Styles pour les colonnes sticky
    const stickyCol0Style = {
        position: 'sticky',
        left: 0,
        zIndex: 3,
        borderRight: '1px solid #e0e0e0',
        minWidth: 100,
        maxWidth: 100,
    };

    const stickyCol1Style = {
        position: 'sticky',
        left: 100,
        zIndex: 3,
        borderRight: '1px solid #e0e0e0',
        minWidth: 300,
        maxWidth: 300,
        width: 300,
    };

    const stickyHeaderStyle = {
        position: 'sticky',
        top: 0,
        zIndex: 4,
        backgroundColor: initial.tableau_theme,
        color: initial.text_theme,
        fontWeight: 600,
        fontSize: '12px',
    };

    const headerCellStyle = {
        ...stickyHeaderStyle,
        padding: '1px 6px',
        fontSize: '14px'
    };

    const cellStyle = {
        padding: '1px 6px',
        fontSize: '13px',
    };

    return (
        <Box sx={{ width: '100%', height: '60vh' }}>
            <TableContainer
                component={Paper}
                ref={scrollContainerRef}
                sx={{
                    height: '100%',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        height: 8,
                        width: 8,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#bdbdbd',
                        borderRadius: 4,
                    },
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                    sx={{
                        tableLayout: 'fixed',
                        minWidth: 280 + moisColumns.length * 110 + 530,

                        '& .MuiTableCell-root': {
                            padding: '1px 4px',
                            fontSize: '14px',
                            lineHeight: 1.2,
                            borderBottom: 'none',
                        },

                        '& .MuiTableHead .MuiTableCell-root': {
                            height: 35,
                        },

                        '& .MuiTableBody .MuiTableCell-root': {
                            height: 35,
                        },

                        '& .MuiTableRow-root': {
                            height: 35,
                        },
                        '& .MuiTableBody .MuiTableRow-root:nth-of-type(odd)': {
                            backgroundColor: '#f5f5f5',
                        },

                        '& .MuiTableBody .MuiTableRow-root:nth-of-type(even)': {
                            backgroundColor: '#ffffff',
                        },

                    }}
                >
                    <TableHead>
                        <TableRow>
                            {/* Colonnes fixes */}
                            <TableCell sx={{ ...headerCellStyle, ...stickyCol0Style, zIndex: 5, backgroundColor: initial.tableau_theme }}>Compte</TableCell>
                            <TableCell sx={{ ...headerCellStyle, ...stickyCol1Style, zIndex: 5, backgroundColor: initial.tableau_theme }}>Libellé</TableCell>

                            {/* Colonnes mois */}
                            {moisColumns.map((mois) => (
                                <TableCell
                                    key={mois.nom}
                                    align="right"
                                    sx={{ ...headerCellStyle, minWidth: 110, maxWidth: 110 }}
                                >
                                    {mois.nomAffiche}
                                </TableCell>
                            ))}

                            {/* Autres colonnes */}
                            <TableCell align="right" sx={{ ...headerCellStyle, minWidth: 130, maxWidth: 130 }}>Total</TableCell>
                            <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 90, maxWidth: 90 }}>Anomalies</TableCell>
                            <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 70, maxWidth: 70 }}>Validé</TableCell>
                            <TableCell sx={{ ...headerCellStyle, minWidth: 240, maxWidth: 240 }}>Commentaire</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={row.id} hover>
                                {/* Colonnes fixes */}
                                <TableCell sx={{ ...cellStyle, ...stickyCol0Style, backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5' }}>{row.compte}</TableCell>
                                <TableCell sx={{ ...cellStyle, ...stickyCol1Style, backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5' }}>{row.libelle}</TableCell>

                                {/* Colonnes mois */}
                                {moisColumns.map((mois) => {
                                    const value = row[mois.nom];
                                    return (
                                        <TableCell
                                            key={mois.nom}
                                            align="right"
                                            sx={{
                                                ...cellStyle,
                                                minWidth: 110,
                                                maxWidth: 110,
                                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                                                color: value > 0 ? 'blue' : value < 0 ? 'red' : 'inherit',
                                                fontWeight: value !== 0 ? 500 : 400,
                                            }}
                                        >
                                            {value?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                                        </TableCell>
                                    );
                                })}

                                {/* Total */}
                                <TableCell
                                    align="right"
                                    sx={{
                                        ...cellStyle,
                                        minWidth: 130,
                                        maxWidth: 130,
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                                        color: row.total_exercice > 0 ? 'blue' : row.total_exercice < 0 ? 'red' : 'inherit',
                                        fontWeight: row.total_exercice !== 0 ? 500 : 400,
                                    }}
                                >
                                    {row.total_exercice?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                                </TableCell>

                                {/* Anomalies */}
                                <TableCell align="center" sx={{ ...cellStyle, minWidth: 90, maxWidth: 90, backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5' }}>
                                    <Checkbox
                                        size="small"
                                        checked={!!row.anomalies}
                                        onChange={(e) => handleToggleAnomalie(row, e.target.checked)}
                                        sx={{
                                            color: row.anomalies ? 'orange' : 'green',
                                            '&.Mui-checked': {
                                                color: 'orange',
                                            },
                                        }}
                                    />
                                </TableCell>

                                {/* Validé */}
                                <TableCell align="center" sx={{ ...cellStyle, minWidth: 70, maxWidth: 70, backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5' }}>
                                    <Checkbox
                                        size="small"
                                        checked={!!row.valide_anomalie}
                                        onChange={(e) => handleToggleValide(row, e.target.checked)}
                                    />
                                </TableCell>

                                {/* Commentaire */}
                                <TableCell sx={{ ...cellStyle, minWidth: 240, maxWidth: 240, backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Badge
                                            variant={row.commentaire && String(row.commentaire).trim() ? 'dot' : 'standard'}
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
                                                        ...row,
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
                                            {row.commentaire || ''}
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
