import React, { useState, useRef } from 'react';

import {

    Box, Paper, Typography, Button, Stack, Table, TableBody, TableCell,

    TableContainer, TableHead, TableRow, IconButton, TextField, MenuItem,

    Tabs, Tab, alpha, Chip, Dialog, DialogTitle, DialogContent, Divider

} from '@mui/material';

import {

    Refresh, BusinessCenterRounded, FiberManualRecord, ShowChart,

    FileDownload, FileUpload, Close, Edit, Delete, PlayArrow, Add, CloudUpload

} from '@mui/icons-material';



const K_COLORS = {

    black: '#010810',

    cyan: '#00e5ff',

    slate: '#64748b',

    border: '#f1f5f9',

    inputBg: '#fcfcfc',

    white: '#ffffff'

};



const textFieldStyle = {

    '& .MuiOutlinedInput-root': {

        borderRadius: '4px',

        backgroundColor: K_COLORS.inputBg,

        '& fieldset': { borderColor: '#e2e8f0' },

        '&.Mui-focused fieldset': { borderColor: K_COLORS.cyan, borderWidth: '1px' },

    },

    '& input': { fontSize: '0.85rem', py: 0.8 }

};



const headerCellStyle = {

    bgcolor: K_COLORS.black,

    color: '#fff',

    fontSize: '0.6rem',

    fontWeight: 900,

    whiteSpace: 'nowrap',

    py: 1.5,

    px: 1,

    borderRight: '1px solid rgba(255,255,255,0.1)'

};



export default function IRSASplitView() {

    const [tabValue, setTabValue] = useState(0);

    const [importDialogOpen, setImportDialogOpen] = useState(false);



    return (

        <Box sx={{ width: '100vw', height: '100vh', display: 'flex', bgcolor: '#f8fafc', overflow: 'hidden' }}>



            {/* SECTION GAUCHE */}

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, gap: 2, overflow: 'hidden' }}>

                <Stack direction="row" justifyContent="space-between" alignItems="center">

                    <Box>

                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>

                            <BusinessCenterRounded sx={{ color: K_COLORS.cyan, fontSize: 16 }} />

                            <Typography variant="caption" sx={{ fontWeight: 900, color: K_COLORS.slate }}>KAONTI SOCIAL</Typography>

                        </Stack>

                        <Typography variant="h5" sx={{ fontWeight: 900, color: K_COLORS.black, letterSpacing: '-1px' }}>Déclaration IRSA</Typography>

                    </Box>

                    <Stack direction="row" spacing={1}>

                        <Button variant="contained" size="small" startIcon={<FileDownload />} sx={{ bgcolor: K_COLORS.black, textTransform: 'none', fontWeight: 800, px: 2, borderRadius: '4px' }}>Exporter</Button>

                    </Stack>

                </Stack>



                {/* FILTRES */}

                <Paper elevation={0} sx={{ p: 2, border: `1px solid ${K_COLORS.border}`, borderRadius: '8px' }}>

                    <Stack spacing={2}>

                        <Stack spacing={0.5}>

                            <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.65rem', color: K_COLORS.black }}>EXERCICE COMPTABLE</Typography>

                            <TextField select size="small" defaultValue="2022" sx={{ ...textFieldStyle, width: 350 }}>

                                <MenuItem value="2022">Exercice 2022 (N: 01/01/2022 - 31/12/2022)</MenuItem>

                            </TextField>

                        </Stack>

                        <Stack direction="row" spacing={3} alignItems="center">

                            <Stack spacing={0.5}>

                                <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.65rem', color: K_COLORS.black }}>MOIS / ANNÉE</Typography>

                                <Stack direction="row" spacing={1}>

                                    <TextField select size="small" defaultValue="Janvier" sx={{ ...textFieldStyle, width: 140 }}><MenuItem value="Janvier">Janvier</MenuItem></TextField>

                                    <TextField select size="small" defaultValue="2022" sx={{ ...textFieldStyle, width: 100 }}><MenuItem value="2022">2022</MenuItem></TextField>

                                </Stack>

                            </Stack>

                            <Box sx={{ ml: 'auto' }}>

                                <Chip icon={<FiberManualRecord sx={{ fontSize: '10px !important', color: K_COLORS.cyan }} />} label="PRÉLÈVEMENTS À LA SOURCE" sx={{ fontWeight: 900, fontSize: '0.65rem', bgcolor: alpha(K_COLORS.cyan, 0.1), color: K_COLORS.cyan, border: `1px solid ${alpha(K_COLORS.cyan, 0.2)}` }} />

                            </Box>

                        </Stack>

                    </Stack>

                </Paper>



                <Paper elevation={0} sx={{ flexGrow: 1, border: `1px solid ${K_COLORS.border}`, borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ minHeight: 40, borderBottom: `1px solid ${K_COLORS.border}`, bgcolor: '#fff' }}>

                        <Tab label="LISTE NOMINATIVE" sx={{ fontSize: '0.7rem', fontWeight: 800 }} disableRipple />

                        <Tab label="RÉCAPITULATIF PAIE" sx={{ fontSize: '0.7rem', fontWeight: 800 }} disableRipple />

                    </Tabs>



                    <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>

                        {tabValue === 0 && (

                            <>

                                <Stack direction="row" justifyContent="space-between" alignItems="center">

                                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Détail des rémunérations par salarié</Typography>

                                    <Stack direction="row" spacing={1} alignItems="center">

                                        <IconButton size="small" sx={{ border: `1px solid ${K_COLORS.border}`, bgcolor: '#fff' }}><Refresh fontSize="small" /></IconButton>

                                        <Button variant="contained" size="small" startIcon={<PlayArrow />} sx={{ bgcolor: '#16a34a', textTransform: 'none', fontWeight: 800, px: 2, borderRadius: '4px' }}>Générer</Button>

                                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20 }} />

                                        <IconButton size="small" sx={{ border: `1px solid ${K_COLORS.border}`, color: K_COLORS.black }}><Add fontSize="small" /></IconButton>

                                    </Stack>

                                </Stack>



                                <TableContainer sx={{ border: `1px solid ${K_COLORS.border}`, borderRadius: '8px', bgcolor: '#fff', flexGrow: 1 }}>

                                    <Table stickyHeader size="small">

                                        <TableHead>

                                            <TableRow>

                                                <TableCell sx={{ ...headerCellStyle, position: 'sticky', left: 0, zIndex: 3 }}>MATRICULE</TableCell>

                                                <TableCell sx={{ ...headerCellStyle, position: 'sticky', left: 80, zIndex: 3 }}>NOM & PRÉNOMS</TableCell>

                                                <TableCell sx={headerCellStyle}>CNAPS</TableCell>

                                                <TableCell sx={headerCellStyle}>CIN / RÉSIDENT</TableCell>

                                                <TableCell sx={headerCellStyle}>FONCTION</TableCell>

                                                <TableCell sx={headerCellStyle}>ENTRÉE</TableCell>

                                                <TableCell sx={headerCellStyle}>SORTIE</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>SALAIRE BASE</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>H.SUP</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>PRIME/GRAT</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>AUTRES</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>INDEM. IMPOS.</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>INDEM. NON-IMP.</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>AVANT. IMPOS.</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>AVANT. EXONÉRÉ</TableCell>

                                                <TableCell align="right" sx={{ ...headerCellStyle, color: K_COLORS.cyan }}>SALAIRE BRUT</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>CNAPS RETENU</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>ORG. SANTÉ</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>SALAIRE NET</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>AUTRE DÉDUCT.</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>MONTANT IMPOS.</TableCell>

                                                <TableCell align="right" sx={headerCellStyle}>IMPÔT CORR.</TableCell>

                                                <TableCell align="right" sx={{ ...headerCellStyle, bgcolor: '#16a34a' }}>IMPÔT DÛ</TableCell>

                                                <TableCell align="center" sx={{ ...headerCellStyle, position: 'sticky', right: 0, zIndex: 3 }}>ACTIONS</TableCell>

                                            </TableRow>

                                        </TableHead>

                                        <TableBody>

                                            {[1, 2, 3, 4, 5].map((i) => (

                                                <TableRow key={i} hover>

                                                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, position: 'sticky', left: 0, bgcolor: '#fff', zIndex: 1 }}>S00{i}</TableCell>

                                                    <TableCell sx={{ fontSize: '0.7rem', position: 'sticky', left: 80, bgcolor: '#fff', zIndex: 1, whiteSpace: 'nowrap' }}>SALARIÉ EXEMPLE {i}</TableCell>

                                                    <TableCell sx={{ fontSize: '0.7rem' }}>45899201-B</TableCell>

                                                    <TableCell sx={{ fontSize: '0.7rem' }}>101 202 303</TableCell>

                                                    <TableCell sx={{ fontSize: '0.7rem' }}>Poste {i}</TableCell>

                                                    <TableCell sx={{ fontSize: '0.7rem' }}>01/01/22</TableCell>

                                                    <TableCell sx={{ fontSize: '0.7rem' }}>-</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>1 250 000</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>0</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>50 000</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>0</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>20 000</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>10 000</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>0</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>0</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 900 }}>1 320 000</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>13 200</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>13 200</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>1 200 000</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>0</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>1 293 600</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>0</TableCell>

                                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 900, bgcolor: alpha('#16a34a', 0.05) }}>85 400</TableCell>

                                                    <TableCell align="center" sx={{ position: 'sticky', right: 0, bgcolor: '#fff', zIndex: 1 }}>

                                                        <Stack direction="row" spacing={0.5} justifyContent="center">

                                                            <IconButton size="small"><Edit fontSize="inherit" /></IconButton>

                                                            <IconButton size="small"><Delete fontSize="inherit" /></IconButton>

                                                        </Stack>

                                                    </TableCell>

                                                </TableRow>

                                            ))}

                                        </TableBody>

                                    </Table>

                                </TableContainer>

                            </>

                        )}



                        {tabValue === 1 && (

                            <Box sx={{ p: 1 }}>

                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Récapitulatif des tranches IRSA</Typography>

                                    <Button variant="outlined" size="small" startIcon={<FileUpload />} onClick={() => setImportDialogOpen(true)} sx={{ borderColor: K_COLORS.slate, color: K_COLORS.slate, fontWeight: 800, textTransform: 'none', borderRadius: '4px' }}>Import Paie</Button>

                                </Stack>

                                <TableContainer sx={{ border: `1px solid ${K_COLORS.border}`, borderRadius: '8px', bgcolor: '#fff', maxWidth: 700 }}>

                                    <Table size="small">

                                        <TableHead sx={{ bgcolor: K_COLORS.black }}>

                                            <TableRow sx={{ '& th': { color: '#fff', fontSize: '0.65rem', fontWeight: 900 } }}>

                                                <TableCell>TRANCHE D'IMPOSITION</TableCell>

                                                <TableCell align="right">NOMBRE</TableCell>

                                                <TableCell align="right">BASE</TableCell>

                                                <TableCell align="right">IMPÔT</TableCell>

                                            </TableRow>

                                        </TableHead>

                                        <TableBody>

                                            <TableRow>

                                                <TableCell sx={{ fontSize: '0.75rem' }}>Tranche 0% (Inférieur à 350.000)</TableCell>

                                                <TableCell align="right">12</TableCell>

                                                <TableCell align="right">4.200.000</TableCell>

                                                <TableCell align="right">0</TableCell>

                                            </TableRow>

                                        </TableBody>

                                    </Table>

                                </TableContainer>

                            </Box>

                        )}

                    </Box>

                </Paper>

            </Box>



            {/* SECTION DROITE */}

            <Box sx={{ width: 320, bgcolor: '#fff', borderLeft: `1px solid ${K_COLORS.border}`, display: 'flex', flexDirection: 'column', p: 3, gap: 3 }}>

                <Typography variant="overline" sx={{ fontWeight: 900, color: K_COLORS.slate }}>Tableau de Bord Social</Typography>

                <Paper elevation={0} sx={{ p: 2, bgcolor: K_COLORS.black, color: '#fff', borderRadius: '8px' }}>

                    <Typography variant="caption" sx={{ color: K_COLORS.slate, fontWeight: 800 }}>TOTAL IRSA À PAYER (MGA)</Typography>

                    <Typography variant="h6" sx={{ fontWeight: 900, color: K_COLORS.cyan, mt: 1 }}>1.450.300</Typography>

                </Paper>

                <Stack spacing={3}>

                    <Box ><Typography variant="caption" sx={{ fontWeight: 900, color: K_COLORS.slate }}>EFFECTIF DÉCLARÉ</Typography><Typography variant="h7" sx={{ display: 'block', fontWeight: 900 }}>42 Salariés</Typography></Box>

                    <Box sx={{ width: 300, display: 'flex', flexDirection: 'row' }}>

                        <Typography variant="caption" sx={{ fontWeight: 900, color: K_COLORS.slate }}>MASSE SALARIALE BRUTE</Typography>

                        <Typography variant="h7" sx={{ fontWeight: 900 }}>45.800.000</Typography>

                    </Box>

                    <Box><Typography variant="caption" sx={{ fontWeight: 900, color: K_COLORS.slate }}>CHARGES SOCIALES (CNaPS)</Typography><Typography variant="h7" sx={{ fontWeight: 900, color: K_COLORS.slate }}>4.122.000</Typography></Box>

                </Stack>



                {/* Bloc Variation N-1 à insérer avant le bouton Valider */}

                <Box sx={{ mt: 'auto', mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: `1px dashed ${K_COLORS.border}` }}>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>

                        <ShowChart sx={{ color: K_COLORS.cyan, fontSize: 18 }} />

                        <Typography variant="caption" sx={{ fontWeight: 900, color: K_COLORS.black }}>

                            VAR. MOIS N-1 : +2.4%

                        </Typography>

                    </Stack>

                    <Typography variant="caption" sx={{ color: K_COLORS.slate, fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>

                        Augmentation constatée sur la masse salariale brute par rapport au mois précédent.

                    </Typography>

                </Box>

                <Button fullWidth variant="contained" sx={{ bgcolor: K_COLORS.black, mt: 'auto', fontWeight: 900, py: 1.5 }}>Valider Déclaration</Button>

            </Box>

            {/* DIALOG D'IMPORT */}

            <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>

                <DialogTitle sx={{ bgcolor: K_COLORS.black, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    <Typography sx={{ fontWeight: 900 }}>Importation Paie</Typography>

                    <IconButton onClick={() => setImportDialogOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>

                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>

                    <Box sx={{ border: `2px dashed ${alpha(K_COLORS.slate, 0.3)}`, borderRadius: '8px', p: 4, textAlign: 'center', bgcolor: '#fcfcfc' }}>

                        <CloudUpload sx={{ fontSize: 40, color: K_COLORS.slate, mb: 1 }} />

                        <Typography variant="body2" sx={{ fontWeight: 800 }}>Glissez votre fichier ici</Typography>

                    </Box>

                    <Button fullWidth variant="contained" sx={{ bgcolor: K_COLORS.black, mt: 3, fontWeight: 900 }}>Lancer l'import</Button>

                </DialogContent>

            </Dialog>

        </Box>

    );

}