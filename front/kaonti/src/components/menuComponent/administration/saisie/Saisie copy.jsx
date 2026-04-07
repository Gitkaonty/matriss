import React, { useState, useMemo } from 'react';
import {
    Box, Paper, Typography, Button, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip,
    Autocomplete, TextField, Dialog, DialogTitle, DialogContent,
    MenuItem, InputAdornment, GlobalStyles
} from '@mui/material';
import {
    Add, ChevronRight, CalendarToday, EditOutlined, DeleteOutline,
    Close, Save, CloudUpload, Clear, FileDownload,
    CheckCircle, ErrorOutline, Search
} from '@mui/icons-material';
const NAV_DARK = '#0B1120';
const EMERALD_GREEN = '#10B981'; // Le vert de ton thème
const BORDER_COLOR = '#E2E8F0';
const BG_SOFT = '#F8FAFC';
const RADIUS = '8px';
const SUGGESTIONS_MAP = {
    '@journal:': ['ACHAT', 'VENTE', 'BANQUE', 'OD'],
    '@compte:': ['606100', '445660', '401EDF', '512000', '707000', '622600', '411000', '445710', '607000'],
    '@statut:': ['OK', 'ERREUR']
};
const MOCK_DATA = [
    { idEcriture: 'E001', date: '01/01/2025', journal: 'ACHAT', compte: '606100', libelle: 'EDF Janvier', debit: 1250, credit: 0, statut: 'OK' },
    { idEcriture: 'E001', date: '01/01/2025', journal: 'ACHAT', compte: '445660', libelle: 'TVA s/ EDF', debit: 250, credit: 0, statut: 'OK' },
    { idEcriture: 'E001', date: '01/01/2025', journal: 'ACHAT', compte: '401EDF', libelle: 'EDF Janvier', debit: 0, credit: 1500, statut: 'OK' },
    { idEcriture: 'E002', date: '02/01/2025', journal: 'BANQUE', compte: '512000', libelle: 'Virement Client Alpha', debit: 5000, credit: 0, statut: 'OK' },
    { idEcriture: 'E002', date: '02/01/2025', journal: 'BANQUE', compte: '411000', libelle: 'Virement Client Alpha', debit: 0, credit: 5000, statut: 'OK' },
    { idEcriture: 'E003', date: '05/01/2025', journal: 'ACHAT', compte: '622600', libelle: 'Honoraires Avocat', debit: 2000, credit: 0, statut: 'ERR' },
    { idEcriture: 'E003', date: '05/01/2025', journal: 'ACHAT', compte: '401AVO', libelle: 'Honoraires Avocat', debit: 0, credit: 2000, statut: 'ERR' },
    { idEcriture: 'E004', date: '10/01/2025', journal: 'VENTE', compte: '411BETA', libelle: 'Facture F-2025-01', debit: 3600, credit: 0, statut: 'OK' },
    { idEcriture: 'E004', date: '10/01/2025', journal: 'VENTE', compte: '707000', libelle: 'Vente Marchandises', debit: 0, credit: 3000, statut: 'OK' },
    { idEcriture: 'E004', date: '10/01/2025', journal: 'VENTE', compte: '445710', libelle: 'TVA collectée', debit: 0, credit: 600, statut: 'OK' },
];
const ModalNouvelleEcriture = ({ open, onClose }) => {
    const [rows, setRows] = useState([{ id: 1, jour: '', compte: '', piece: '', libelle: '', debit: '', credit: '' }]);
    const addRow = () => setRows([...rows, { id: Date.now(), jour: '', compte: '', piece: '', libelle: '', debit: '', credit: '' }]);
    const removeRow = (id) => rows.length > 1 && setRows(rows.filter(r => r.id !== id));
    const updateRow = (id, field, value) => setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    const totals = useMemo(() => rows.reduce((acc, r) => ({
        debit: acc.debit + (Number(r.debit.replace(',', '.')) || 0),
        credit: acc.credit + (Number(r.credit.replace(',', '.')) || 0)
    }), { debit: 0, credit: 0 }), [rows]);
    const solde = totals.debit - totals.credit;
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" PaperProps={{ sx: { borderRadius: RADIUS, height: '85vh' } }}>
            <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: '13px', color: NAV_DARK }}>NOUVELLE ÉCRITURE</Typography>
                <IconButton onClick={onClose} size="small"><Close sx={{ fontSize: 20 }} /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', bgcolor: BG_SOFT }}>
                <Stack direction="row" spacing={3} sx={{ p: 2, bgcolor: '#FFF', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    <Stack spacing={0.5}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>JOURNAL</Typography>
                        <TextField select size="small" sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }} defaultValue="ACH"><MenuItem value="ACH">ACHATS</MenuItem></TextField>
                    </Stack>
                    <Stack spacing={0.5}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>MOIS</Typography>
                        <TextField select size="small" sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }} defaultValue="01"><MenuItem value="01">Janvier</MenuItem></TextField>
                    </Stack>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button variant="contained" disableElevation onClick={onClose} startIcon={<Save />} sx={{ bgcolor: EMERALD_GREEN, '&:hover': { bgcolor: '#059669' }, borderRadius: '6px', textTransform: 'none', fontWeight: 700, px: 3, height: 34 }}>Enregistrer</Button>
                </Stack>
                <Box sx={{ p: 2, flexGrow: 1 }}>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: `${RADIUS} !important`, border: `1px solid ${BORDER_COLOR}`, overflow: 'hidden', '& .MuiTable-root': { borderCollapse: 'separate' } }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>Jour</TableCell>
                                    <TableCell sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>Compte</TableCell>
                                    <TableCell sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>Libellé</TableCell>
                                    <TableCell align="right" sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>Débit</TableCell>
                                    <TableCell align="right" sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>Crédit</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ bgcolor: '#FFF' }}>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ py: 0.5 }}><TextField variant="standard" fullWidth InputProps={{ disableUnderline: true, sx: { fontSize: '12px' } }} onChange={(e) => updateRow(row.id, 'jour', e.target.value)} /></TableCell>
                                        <TableCell sx={{ py: 0.5 }}><TextField variant="standard" fullWidth InputProps={{ disableUnderline: true, sx: { fontWeight: 700, color: EMERALD_GREEN, fontSize: '12px' } }} onChange={(e) => updateRow(row.id, 'compte', e.target.value)} /></TableCell>
                                        <TableCell sx={{ py: 0.5 }}><TextField variant="standard" fullWidth InputProps={{ disableUnderline: true, sx: { fontSize: '12px' } }} onChange={(e) => updateRow(row.id, 'libelle', e.target.value)} /></TableCell>
                                        <TableCell align="right" sx={{ py: 0.5 }}><TextField variant="standard" fullWidth InputProps={{ disableUnderline: true }} inputProps={{ style: { textAlign: 'right', fontWeight: 700, fontSize: '12px' } }} onChange={(e) => updateRow(row.id, 'debit', e.target.value)} /></TableCell>
                                        <TableCell align="right" sx={{ py: 0.5 }}><TextField variant="standard" fullWidth InputProps={{ disableUnderline: true }} inputProps={{ style: { textAlign: 'right', fontWeight: 700, fontSize: '12px' } }} onChange={(e) => updateRow(row.id, 'credit', e.target.value)} /></TableCell>
                                        <TableCell align="center" sx={{ py: 0.5 }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <IconButton size="small" onClick={() => removeRow(row.id)}><Clear sx={{ fontSize: 16 }} /></IconButton>
                                                <IconButton size="small" onClick={addRow} sx={{ color: EMERALD_GREEN }}><Add sx={{ fontSize: 16 }} /></IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#FFF', borderTop: `1px solid ${BORDER_COLOR}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ border: `1px dashed ${BORDER_COLOR}`, borderRadius: '6px', p: '8px 16px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: BG_SOFT }}>
                            <CloudUpload sx={{ color: EMERALD_GREEN, fontSize: 20 }} />
                            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: NAV_DARK }}>JUSTIFICATIF PDF</Typography>
                        </Box>
                        <Stack direction="row" spacing={5}>
                            <Box textAlign="right"><Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>DÉBIT</Typography><Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{totals.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</Typography></Box>
                            <Box textAlign="right"><Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>CRÉDIT</Typography><Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{totals.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</Typography></Box>
                            <Box textAlign="right" sx={{ minWidth: 120, bgcolor: solde === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', p: 1, borderRadius: '6px' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: solde === 0 ? EMERALD_GREEN : '#EF4444' }}>SOLDE</Typography>
                                <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: solde === 0 ? EMERALD_GREEN : '#EF4444' }}>{solde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
const SaisieExpertIntegrale = () => {
    const [filters, setFilters] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [openAssist, setOpenAssist] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const options = useMemo(() => {
        const currentPrefix = Object.keys(SUGGESTIONS_MAP).find(p => inputValue === p);
        if (currentPrefix) return SUGGESTIONS_MAP[currentPrefix].map(val => `${currentPrefix}${val}`);
        return Object.keys(SUGGESTIONS_MAP);
    }, [inputValue]);
    const filteredData = useMemo(() => {
        if (filters.length === 0) return MOCK_DATA;
        const matchingIds = new Set();
        MOCK_DATA.forEach(row => {
            const match = filters.every(f => {
                const [key, val] = f.includes(':') ? f.split(':') : [null, f];
                if (key === '@journal') return row.journal === val;
                if (key === '@compte') return row.compte.startsWith(val);
                if (key === '@statut') return (val === 'ERREUR' ? row.statut === 'ERR' : row.statut === 'OK');
                return row.libelle.toLowerCase().includes(val.toLowerCase());
            });
            if (match) matchingIds.add(row.idEcriture);
        });
        return MOCK_DATA.filter(row => matchingIds.has(row.idEcriture));
    }, [filters]);
    const totals = useMemo(() => filteredData.reduce((acc, curr) => ({ debit: acc.debit + (curr.debit || 0), credit: acc.credit + (curr.credit || 0) }), { debit: 0, credit: 0 }), [filteredData]);
    return (
        <Box sx={{ height: '95vh', width: '98vw', display: 'flex', flexDirection: 'column', bgcolor: BG_SOFT, p: 2 }}>
            <GlobalStyles styles={{ body: { margin: 0, padding: 0, overflow: 'hidden' } }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, color: '#64748B', fontSize: '10px' }}>ADMINISTRATION</Typography>
                        <ChevronRight sx={{ color: BORDER_COLOR, fontSize: 12 }} />
                        <Typography sx={{ fontWeight: 800, color: NAV_DARK, fontSize: '12px' }}>SAISIE EXPERT</Typography>
                    </Stack>
                    <Paper elevation={0} sx={{ px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: '#FFF', display: 'inline-flex', alignItems: 'center', border: `1px solid ${BORDER_COLOR}` }}>
                        <CalendarToday sx={{ fontSize: 13, color: EMERALD_GREEN, mr: 1 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '11px', color: NAV_DARK }}>Exercice 2025</Typography>
                    </Paper>
                </Box>
                <Button variant="outlined" size="small" disableElevation startIcon={<FileDownload />} sx={{ color: NAV_DARK, borderColor: BORDER_COLOR, borderRadius: '6px', textTransform: 'none', fontWeight: 700, fontSize: '11px', bgcolor: '#FFF' }}>Export</Button>
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <Autocomplete
                    multiple freeSolo open={openAssist}
                    options={options} value={filters} inputValue={inputValue}
                    onInputChange={(e, val) => { setInputValue(val); if (val.length > 0) setOpenAssist(true); }}
                    onChange={(e, newValue) => {
                        const last = newValue[newValue.length - 1];
                        if (Object.keys(SUGGESTIONS_MAP).includes(last)) { setInputValue(last); setOpenAssist(true); }
                        else { setFilters(newValue); setInputValue(''); setOpenAssist(false); }
                    }}
                    renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: EMERALD_GREEN, fontWeight: 800, fontSize: '10px', borderRadius: '4px' }} />
                    ))}
                    sx={{ flexGrow: 1 }}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Filtrer..." variant="outlined" size="small"
                            sx={{ bgcolor: '#FFF', '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                            InputProps={{ ...params.InputProps, startAdornment: <><InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#64748B' }} /></InputAdornment>{params.InputProps.startAdornment}</> }}
                        />
                    )}
                />
                <Button variant="contained" disableElevation onClick={() => setOpenModal(true)} startIcon={<Add />} sx={{ bgcolor: EMERALD_GREEN, '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 700, height: 40, px: 3, borderRadius: '6px' }}>Nouvelle écriture</Button>
            </Stack>
            <TableContainer component={Paper} elevation={0} sx={{ flex: 1, borderRadius: `${RADIUS} !important`, border: `1px solid ${BORDER_COLOR}`, overflow: 'hidden', '& .MuiTable-root': { borderCollapse: 'separate' } }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>ACTIONS</TableCell>
                            <TableCell sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>ID</TableCell>
                            <TableCell sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>DATE</TableCell>
                            <TableCell sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>JOURNAL</TableCell>
                            <TableCell sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>COMPTE</TableCell>
                            <TableCell sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>LIBELLÉ</TableCell>
                            <TableCell align="right" sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>DÉBIT</TableCell>
                            <TableCell align="right" sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>CRÉDIT</TableCell>
                            <TableCell align="center" sx={{ bgcolor: BG_SOFT, color: '#475569', fontWeight: 800, fontSize: '10px' }}>STATUT</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ bgcolor: '#FFF' }}>
                        {filteredData.map((row, index) => {
                            const isNewGroup = index === 0 || row.idEcriture !== filteredData[index - 1].idEcriture;
                            return (
                                <TableRow key={index} hover sx={{ borderTop: isNewGroup && index !== 0 ? `1px solid ${BORDER_COLOR}` : 'none', bgcolor: isNewGroup ? '#FFF' : '#FAFBFC' }}>
                                    <TableCell align="center" sx={{ py: 0.8 }}>{isNewGroup && <Stack direction="row" justifyContent="center"><IconButton size="small" sx={{ color: EMERALD_GREEN }}><EditOutlined sx={{ fontSize: 16 }} /></IconButton><IconButton size="small" sx={{ color: '#EF4444' }}><DeleteOutline sx={{ fontSize: 16 }} /></IconButton></Stack>}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: isNewGroup ? NAV_DARK : 'transparent' }}>{row.idEcriture}</TableCell>
                                    <TableCell sx={{ fontSize: '11px' }}>{row.date}</TableCell>
                                    <TableCell>{isNewGroup && <Chip label={row.journal} size="small" sx={{ fontWeight: 800, fontSize: '9px', borderRadius: '4px' }} />}</TableCell>
                                    <TableCell sx={{ color: EMERALD_GREEN, fontWeight: 800, fontSize: '11px' }}>{row.compte}</TableCell>
                                    <TableCell sx={{ fontSize: '11px' }}>{row.libelle}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '11px' }}>{row.debit?.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) || '-'}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '11px' }}>{row.credit?.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) || '-'}</TableCell>
                                    <TableCell align="center">{row.statut === 'ERR' ? <ErrorOutline sx={{ color: '#EF4444', fontSize: 16 }} /> : (isNewGroup && <CheckCircle sx={{ fontSize: 16, color: EMERALD_GREEN }} />)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ p: 1.5, bgcolor: BG_SOFT, border: `1px solid ${BORDER_COLOR}`, borderTop: 'none', color: NAV_DARK, display: 'flex', justifyContent: 'flex-end', gap: 6, px: 4, borderRadius: '0 0 8px 8px' }}>
                <Stack textAlign="right"><Typography sx={{ fontSize: '9px', fontWeight: 800, color: EMERALD_GREEN }}>TOTAL DÉBIT</Typography><Typography sx={{ fontWeight: 900, fontSize: '14px' }}>{totals.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</Typography></Stack>
                <Stack textAlign="right"><Typography sx={{ fontSize: '9px', fontWeight: 800, color: EMERALD_GREEN }}>TOTAL CRÉDIT</Typography><Typography sx={{ fontWeight: 900, fontSize: '14px' }}>{totals.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</Typography></Stack>
                <Box textAlign="right" minWidth={100}><Typography sx={{ fontSize: '9px', fontWeight: 800, color: '#64748B' }}>DIFFÉRENCE</Typography><Typography sx={{ fontWeight: 900, fontSize: '14px', color: EMERALD_GREEN }}>0,00</Typography></Box>
            </Box>
            <ModalNouvelleEcriture open={openModal} onClose={() => setOpenModal(false)} />
        </Box>
    );
};
export default SaisieExpertIntegrale;