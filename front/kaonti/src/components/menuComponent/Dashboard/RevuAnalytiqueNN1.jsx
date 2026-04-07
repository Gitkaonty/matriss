import { useCallback, useMemo, useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Checkbox, Box, IconButton, alpha, Chip
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { DataGrid, frFR } from '@mui/x-data-grid';
import { DataGridStyle } from '../../componentsTools/DatagridToolsStyle';
import { init } from '../../../../init';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

export default function RevuAnalytiqueNN1({ compteId, dossierId, exerciceId, dateDebut, dateFin }) {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();

    console.log('[RevuAnalytiqueNN1] Props reçues:', { compteId, dossierId, exerciceId, dateDebut, dateFin });

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

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
                flex: 2,
                minWidth: 240,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <IconButton
                            size="small"
                            disabled
                            sx={{
                                backgroundColor: params.row.commentaire ? 'success.main' : 'success.main',
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

        ],
        [compteId, dossierId, exerciceId]
    );

    useEffect(() => {
        const fetchRevuAnalytique = async () => {
            try {
                setLoading(true);
                if (!compteId || !dossierId || !exerciceId) {
                    setRows([]);
                    return;
                }

                let url = `/dashboard/revuAnalytiqueNN1/${compteId}/${dossierId}/${exerciceId}`;
                if (dateDebut && dateFin) {
                    url += `?date_debut=${dateDebut}&date_fin=${dateFin}`;
                }
                const response = await axiosPrivate.get(url);

                if (response.data.state) {
                    // console.log('[RevuAnalytiqueNN1] Données reçues du backend:', response.data.data);
                    const formattedRows = response.data.data.map((row, index) => ({
                        id: index,
                        compte: row.compte,
                        libelle: row.libelle,
                        soldeN: row.soldeN,
                        soldeN1: row.soldeN1,
                        var: row.var,
                        varPourcent: row.varPourcent,
                        // Ne pas marquer comme anomalie si le journal N-1 n'existe pas (soldeN1 null/undefined)
                        anomalies: row.anomalies, // Garder les anomalies même si soldeN1 est null
                        commentaire: row.commentaire,
                        valide_anomalie: row.valide_anomalie
                    }));
                    // console.log('[RevuAnalytiqueNN1] Données formatées:', formattedRows);
                    setRows(formattedRows);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevuAnalytique();
    }, [axiosPrivate, compteId, dossierId, exerciceId, dateDebut, dateFin]);

    // --- STYLES RÉUTILISABLES ---
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

    // Couleurs personnalisées (à adapter selon ton fichier constants)
    const K_COLORS = {
        slate: '#64748B',
        black: '#1E293B'
    };
    return (
        <Box sx={{ width: '100%', height: '60vh', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${K_COLORS.border}` }}>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    height: '100%',
                    overflow: 'auto',
                    borderRadius: 0,
                    border: '1px solid rgba(0,0,0,0.1)',

                    // --- STYLE DE LA SCROLLBAR ---
                    '&::-webkit-scrollbar': {
                        width: 8,
                        height: 8
                    },
                    '&::-webkit-scrollbar-track': {
                        // Dégradé : gris au niveau du header (35px), blanc en dessous
                        background: 'linear-gradient(to bottom, #F8FAFC 0px, #F8FAFC 35px, white 35px, white 100%)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(K_COLORS.slate, 0.2),
                        borderRadius: 4,
                        border: '2px solid transparent',
                        backgroundClip: 'content-box',
                    },
                    '&::-webkit-scrollbar-corner': {
                        backgroundColor: '#F8FAFC' // Le coin en haut à droite devient gris
                    }
                }}
            >
                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: 1200 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headerCellStyle, width: 70 }}>Compte</TableCell>
                            <TableCell sx={{ ...headerCellStyle, width: 220 }}>Libelle</TableCell>
                            <TableCell align="right" sx={{ ...headerCellStyle, width: 130 }}>Solde N-1</TableCell>
                            <TableCell align="right" sx={{ ...headerCellStyle, width: 130 }}>Solde N</TableCell>
                            <TableCell align="right" sx={{ ...headerCellStyle, width: 120 }}>Variation</TableCell>
                            <TableCell align="center" sx={{ ...headerCellStyle, width: 80 }}>Variation %</TableCell>
                            <TableCell align="center" sx={{ ...headerCellStyle, width: 50 }}>Anomalies</TableCell>
                            <TableCell align="center" sx={{ ...headerCellStyle, width: 50 }}>Validé</TableCell>
                            {/* Pas de bordure droite sur la dernière colonne pour éviter le trait avant le scroll */}
                            <TableCell sx={{ ...headerCellStyle, width: 120, borderRight: 'none' }}>Commentaire</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow
                                key={row.id || index}
                                hover
                                sx={{
                                    height: 35,
                                    bgcolor: '#fff'
                                }}
                            >
                                <TableCell sx={{ ...cellStyle, fontWeight: 700, textOverflow: 'ellipsis' }}>{row.compte}</TableCell>
                                <TableCell sx={{ ...cellStyle, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {row.libelle}
                                </TableCell>

                                {/* Cellules numériques avec logique de couleur */}
                                {[
                                    { field: 'soldeN1', val: row.soldeN1 },
                                    { field: 'soldeN', val: row.soldeN },
                                    { field: 'var', val: row.var }
                                ].map((item) => (
                                    <TableCell key={item.field} align="right" sx={{
                                        ...cellStyle,
                                        color: item.val > 0 ? '#2563eb' : item.val < 0 ? '#dc2626' : K_COLORS.slate,
                                        fontWeight: item.val !== 0 ? 600 : 400,
                                        fontFamily: 'monospace'
                                    }}>
                                        {item.val?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                                    </TableCell>
                                ))}

                                <TableCell
                                    align="center"
                                    sx={{
                                        ...cellStyle,
                                        padding: '2px 4px', // Réduction du padding pour bien centrer le Chip verticalement
                                        verticalAlign: 'middle'
                                    }}
                                >
                                    {row.varPourcent !== null ? (
                                        <Chip
                                            label={`${row.varPourcent > 0 ? '+' : ''}${row.varPourcent}%`}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                height: 20,
                                                minWidth: '55px', // Assure une taille constante pour l'alignement visuel
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                fontFamily: 'monospace',
                                                cursor: 'default',
                                                // Couleurs dynamiques basées sur la valeur
                                                color: row.varPourcent > 0 ? '#2563eb' : row.varPourcent < 0 ? '#dc2626' : 'inherit',
                                                borderColor: row.varPourcent > 0 ? alpha('#2563eb', 0.5) : row.varPourcent < 0 ? alpha('#dc2626', 0.5) : alpha(K_COLORS.slate, 0.3),
                                                bgcolor: row.varPourcent > 0 ? alpha('#2563eb', 0.04) : row.varPourcent < 0 ? alpha('#dc2626', 0.04) : 'transparent',
                                                '& .MuiChip-label': {
                                                    px: 0.5,
                                                    width: '100%',
                                                    textAlign: 'center'
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Box sx={{ color: alpha(K_COLORS.slate, 0.3), textAlign: 'center' }}>-</Box>
                                    )}
                                </TableCell>

                                <TableCell align="center" sx={cellStyle}>
                                    <Checkbox
                                        size="small"
                                        checked={!!row.anomalies}
                                        disabled
                                        sx={{ p: 0, '&.Mui-disabled': { color: row.anomalies ? '#f59e0b' : '#10b981' } }}
                                    />
                                </TableCell>

                                <TableCell align="center" sx={cellStyle}>
                                    <Checkbox
                                        size="small"
                                        checked={!!row.valide_anomalie}
                                        disabled
                                        sx={{ p: 0, '&.Mui-disabled': { color: row.valide_anomalie ? '#16a34a' : alpha(K_COLORS.slate, 0.2) } }}
                                    />
                                </TableCell>

                                <TableCell sx={{ ...cellStyle, borderRight: 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
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
                                        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px', flex: 1 }}>
                                            {row.commentaire}
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
