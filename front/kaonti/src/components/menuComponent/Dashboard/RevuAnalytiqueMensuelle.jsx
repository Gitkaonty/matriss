import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Box, Checkbox, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, alpha, Chip, DialogTitle, Divider } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { init } from '../../../../init';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

export default function RevuAnalytiqueMensuelle({ compteId, dossierId, exerciceId, dateDebut, dateFin }) {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [moisColumns, setMoisColumns] = useState([]);
    const scrollContainerRef = useRef(null);

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
                        disabled
                        sx={{
                            color: params.value ? 'orange' : 'green',
                            '&.Mui-checked': {
                                color: 'orange',
                            },
                            '&.Mui-disabled': {
                                color: params.value ? 'orange' : 'green',
                            }
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
                        disabled
                        sx={{
                            '&.Mui-disabled': {
                                color: params.row.valide_anomalie ? 'success.main' : 'inherit'
                            }
                        }}
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
                        <IconButton
                            size="small"
                            disabled
                            sx={{
                                backgroundColor: params.row.commentaire ? 'success.main' : 'grey.400',
                                color: 'white',
                            }}
                        >
                            <EditNoteIcon fontSize="small" />
                        </IconButton>
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
    }, [monthColumns, compteId, dossierId, exerciceId]);

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

    const stickyCol0Style = { position: 'sticky', left: 0, zIndex: 2, minWidth: 100 };
    const stickyCol1Style = { position: 'sticky', left: 121, zIndex: 2, minWidth: 180 };

    const K_COLORS = {
        black: '#010810',
        cyan: '#00e5ff',
        slate: '#64748b',
        border: '#f1f5f9',
        white: '#ffffff',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc' // Un gris plus subtil
    };

    // On s'assure que le Header a bien un fond noir et est collé en haut (top: 0)
    const stickyTotalStyle = {
        position: 'sticky',
        right: 311,
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        top: 0, // Indispensable pour le Header
        bgcolor: '#F8FAFC', // On force la couleur ici
    };

    const stickyAnomaliesStyle = {
        position: 'sticky',
        right: 204,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
        top: 0,
        bgcolor: '#F8FAFC',
    };

    const stickyValideStyle = {
        position: 'sticky',
        right: 118,
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        top: 0,
        bgcolor: '#F8FAFC',
    };

    const stickyCommentaireStyle = {
        position: 'sticky',
        right: 0,
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        top: 0,
        bgcolor: '#F8FAFC',
    };
    const headerCellStyle = {

        bgcolor: '#F8FAFC',
        color: '#64748B',
        fontSize: '10px',
        fontWeight: 800,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        py: 1.5,
        px: 1,
        borderRight: '1px solid rgba(255,255,255,0.1)'

    };
    const cellStyle = {
        py: 1,
        px: 0.5,
        fontSize: '13px'
    };

    return (
        <Box sx={{ width: '100%', height: '60vh', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${K_COLORS.border}` }}>
            <TableContainer
                component={Paper}
                ref={scrollContainerRef}
                elevation={0}
                sx={{
                    height: '100%',
                    overflow: 'auto',
                    borderRadius: 0,
                    padding: 0,
                    margin: 0,
                    '&::-webkit-scrollbar': { height: 6, width: 6 },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(K_COLORS.slate, 0.2),
                        borderRadius: 4,
                    },
                    // 1. La scrollbar globale
                    '&::-webkit-scrollbar': {
                        width: 8,
                        height: 8
                    },

                    // 2. LE TRICK : Le fond de la scrollbar (Track)
                    // On crée un dégradé qui s'arrête pile à la hauteur de ton Header (env. 40px)
                    '&::-webkit-scrollbar-track': {
                        background: 'linear-gradient(to bottom, #F8FAFC 0px, #F8FAFC 45px, white 45px, white 100%)',
                    },

                    // 3. LE COIN (Corner)
                    // C'est l'intersection en haut à droite : on le met en gris comme le header
                    '&::-webkit-scrollbar-corner': {
                        backgroundColor: '#F8FAFC',
                    },

                    // 4. Le curseur (Thumb)
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha('#64748B', 0.2),
                        borderRadius: 4,
                        border: '2px solid transparent', // Donne un effet de padding interne
                        backgroundClip: 'content-box',
                    },
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                    sx={{
                        tableLayout: 'fixed',
                        minWidth: 280 + moisColumns.length * 110 + 530,
                    }}
                    className="dense-table"
                >
                    <TableHead>
                        <TableRow>
                            {/* Colonnes fixes GAUCHE - zIndex 10 pour écraser tout au scroll */}
                            <TableCell sx={{ ...headerCellStyle, ...stickyCol0Style, zIndex: 10 }}>Compte</TableCell>
                            <TableCell sx={{ ...headerCellStyle, ...stickyCol1Style, zIndex: 10 }}>Libellé</TableCell>

                            {/* Colonnes mois - zIndex standard 5 (stickyHeader) */}
                            {moisColumns.map((mois) => (
                                <TableCell
                                    key={mois.nom}
                                    align="right"
                                    sx={{ ...headerCellStyle, minWidth: 110, maxWidth: 110, zIndex: 5 }}
                                >
                                    {mois.nomAffiche}
                                </TableCell>
                            ))}

                            {/* Colonnes fixes DROITE - zIndex 10 pour l'angle Header/Sticky */}
                            <TableCell align="right" sx={{ ...headerCellStyle, ...stickyTotalStyle, zIndex: 10 }}>Total</TableCell>
                            <TableCell align="center" sx={{ ...headerCellStyle, ...stickyAnomaliesStyle, zIndex: 10 }}>Anomalies</TableCell>
                            <TableCell align="center" sx={{ ...headerCellStyle, ...stickyValideStyle, zIndex: 10 }}>Validé</TableCell>
                            <TableCell sx={{ ...headerCellStyle, ...stickyCommentaireStyle, zIndex: 10 }}>Commentaire</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row, index) => {
                            const isEven = index % 2 === 0;

                            return (
                                <TableRow key={row.id} sx={{ '&:hover td': { bgcolor: alpha(K_COLORS.white) + ' !important' } }}>
                                    {/* Colonnes fixes GAUCHE */}
                                    <TableCell sx={{ ...cellStyle, ...stickyCol0Style, bgcolor: '#fff', fontWeight: 700, zIndex: 2, color: '#000', textOverflow: 'ellipsis' }}>
                                        {row.compte}
                                    </TableCell>
                                    <TableCell sx={{ ...cellStyle, ...stickyCol1Style, bgcolor: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', zIndex: 2, color: '#000' }}>
                                        {row.libelle}
                                    </TableCell>

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
                                                    bgcolor: '#fff',
                                                    fontFamily: 'monospace',
                                                    color: value > 0 ? '#2563eb' : value < 0 ? '#dc2626' : K_COLORS.slate,
                                                    fontWeight: value !== 0 ? 600 : 400,
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
                                            ...stickyTotalStyle,
                                            bgcolor: '#fff', // Légère nuance pour le total
                                            fontFamily: 'monospace',
                                            fontWeight: 800,
                                            color: K_COLORS.black
                                        }}
                                    >
                                        {row.total_exercice?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                                    </TableCell>

                                    {/* Anomalies */}
                                    <TableCell align="center" sx={{ ...cellStyle, ...stickyAnomaliesStyle, bgcolor: '#fff' }}>
                                        <Checkbox
                                            size="small"
                                            checked={!!row.anomalies}
                                            disabled
                                            sx={{ p: 0, '&.Mui-disabled': { color: row.anomalies ? '#f59e0b' : '#10b981' } }}
                                        />
                                    </TableCell>

                                    {/* Validé */}
                                    <TableCell align="center" sx={{ ...cellStyle, ...stickyValideStyle, bgcolor: '#fff' }}>
                                        <Checkbox
                                            size="small"
                                            checked={!!row.valide_anomalie}
                                            disabled
                                            sx={{
                                                p: 0,
                                                '&.Mui-disabled': {
                                                    color: row.valide_anomalie ? '#16a34a' : alpha(K_COLORS.slate, 0.3)
                                                }
                                            }}
                                        />
                                    </TableCell>

                                    {/* Commentaire */}
                                    <TableCell sx={{ ...cellStyle, ...stickyCommentaireStyle, bgcolor: '#fff' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                disabled
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    bgcolor: row.commentaire ? '#16a34a' : alpha(K_COLORS.slate, 0.1),
                                                    color: 'white !important',
                                                    '&.Mui-disabled': { opacity: 1 }
                                                }}
                                            >
                                                <EditNoteIcon sx={{ fontSize: 14, color: row.commentaire ? '#fff' : '#ccc' }} />
                                            </IconButton>
                                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: K_COLORS.slate, fontSize: '0.65rem' }}>
                                                {row.commentaire || ''}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
