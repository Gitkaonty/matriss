
import React, { useState } from 'react';
import {
    Box, Typography, Avatar, AppBar, Toolbar, Stack, Button,
    Grid, Card, LinearProgress, GlobalStyles, List, ListItem,
    ListItemIcon, ListItemText, Divider, IconButton, Chip,
    ListSubheader, FormControl, Select, MenuItem
} from '@mui/material';

// Icônes
import HomeIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/GridView';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';

const FinalUserDashboard = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [exercice, setExercice] = useState(1);

    return (
        <Box sx={{ width: '100vw', height: 'auto', bgcolor: BG_SOFT }}>
            <GlobalStyles styles={{
                body: { margin: 0, padding: 0, overflowX: 'hidden', backgroundColor: BG_SOFT },
                '.MuiButtonBase-root': {
                    outline: 'none !important',
                    boxShadow: 'none !important',
                    WebkitTapHighlightColor: 'transparent !important'
                }
            }} />

            {/* HEADER */}
            <AppBar position="sticky" sx={{ 
                background: NAV_DARK, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                zIndex: 1100,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <Toolbar sx={{ justifyContent: 'space-between', px: 4, height: 64 }}>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '250px' }}>
                        <Box sx={{ bgcolor: NEON_MINT, borderRadius: '8px', p: 0.5, display: 'flex' }}>
                            <AutoAwesomeIcon sx={{ color: NAV_DARK, fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '0.5px' }}>CORE.OS</Typography>
                    </Box>

                    {/* MENU NAVIGATION */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            height: '64px'
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" height="100%">

                            <Button
                                disableRipple
                                startIcon={<HomeIcon />}
                                sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}
                            >
                                Accueil
                            </Button>

                            <Box
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%',
                                    px: 1 // 👈 zone hover plus large
                                }}
                            >
                                <Button
                                    disableRipple
                                    startIcon={<DashboardIcon />}
                                    endIcon={
                                        <KeyboardArrowDownIcon
                                            sx={{
                                                transition: '0.2s',
                                                transform: isHovered ? 'rotate(180deg)' : 'none'
                                            }}
                                        />
                                    }
                                    sx={{
                                        color: isHovered ? NEON_MINT : 'rgba(255,255,255,0.6)',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        height: '100%'
                                    }}
                                >
                                    Administration
                                </Button>

                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '100%', // 👈 mieux que 64px
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 280,
                                        bgcolor: '#fff',
                                        borderRadius: '0 0 16px 16px',
                                        boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                                        border: '1px solid #E2E8F0',
                                        borderTop: 'none',
                                        py: 1,
                                        display: isHovered ? 'block' : 'none',
                                        zIndex: 2000
                                    }}
                                >
                                    <ListSubheader
                                        sx={{
                                            lineHeight: '30px',
                                            fontWeight: 800,
                                            fontSize: '10px',
                                            bgcolor: 'transparent'
                                        }}
                                    >
                                        GESTION DES FLUX
                                    </ListSubheader>

                                    <ListItem button sx={{ py: 1.5, '&:hover': { bgcolor: '#F1F5F9' } }}>
                                        <ListItemIcon sx={{ minWidth: 38 }}>
                                            <AssignmentIcon sx={{ color: NEON_MINT }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Supervision active"
                                            primaryTypographyProps={{ fontSize: '13px', fontWeight: 600 }}
                                        />
                                    </ListItem>

                                    <Divider sx={{ my: 1, mx: 2 }} />

                                    <ListItem button sx={{ py: 1.5, '&:hover': { bgcolor: '#F1F5F9' } }}>
                                        <ListItemIcon sx={{ minWidth: 38 }}>
                                            <ReceiptLongIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Historique complet"
                                            primaryTypographyProps={{ fontSize: '13px' }}
                                        />
                                    </ListItem>
                                </Box>
                            </Box>

                            <Button
                                disableRipple
                                startIcon={<SettingsIcon />}
                                sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}
                            >
                                Paramètres
                            </Button>

                        </Stack>
                    </Box>

                    {/* PROFIL UTILISATEUR CONNECTÉ */}
                    <Stack direction="row" spacing={2.5} alignItems="center" justifyContent="flex-end" sx={{ width: '250px' }}>
                        <IconButton sx={{ color: 'rgba(255,255,255,0.5)' }}><NotificationsNoneIcon /></IconButton>

                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ cursor: 'pointer' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>
                                    Jean Dupont
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Administrateur
                                </Typography>
                            </Box>
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: NEON_MINT,
                                    color: NAV_DARK,
                                    fontWeight: 900,
                                    fontSize: '13px',
                                    border: '2px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                JD
                            </Avatar>
                        </Stack>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* CONTENU */}
            <Box sx={{ p: 6 }}>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>WORKSPACE / SUPERVISION</Typography>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500 }}>Période fiscale :</Typography>
                    <FormControl size="small">
                        <Select
                            value={exercice}
                            onChange={(e) => setExercice(e.target.value)}
                            sx={{
                                height: 36, fontSize: '13px', bgcolor: '#fff', minWidth: 260, borderRadius: '10px',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                            }}
                        >
                            <MenuItem value={1}>Exercice 2026 (01/01 au 31/12)</MenuItem>
                            <MenuItem value={2}>Exercice 2025 (Clôturé)</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: '#1E293B', letterSpacing: '0.5px' }}>SYNTHÈSE</Typography>

                <Grid container spacing={3} sx={{ maxWidth: '1200px', mb: 8 }}>
                    <StatCard label="Anomalies" value="32" color="#EF4444" icon={<ErrorOutlineIcon />} />
                    <StatCard label="En attente" value="23" color="#F59E0B" icon={<HistoryIcon />} />
                    <StatCard label="Validées" value="9" color={NEON_MINT} icon={<CheckCircleOutlineIcon />} />
                    <Grid item xs={3}>
                        <Stack variant="outlined" sx={{ height: '110px', borderRadius: '16px', display: 'flex', alignItems: 'center', px: 4, bgcolor: '#fff', border: '1px solid #E2E8F0', justifyContent: 'center' }}>
                            <Box sx={{ width: '100%' }}>
                                <Typography sx={{ fontSize: '12px', color: '#64748B', mb: 1.5, fontWeight: 600 }}>Taux d'achèvement : 28%</Typography>
                                <LinearProgress variant="determinate" value={28} sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: NEON_MINT } }} />
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: '#1E293B', letterSpacing: '0.5px' }}>ANALYSES DÉTAILLÉES</Typography>
                <Stack direction="row" spacing={4}>
                    <AnalysisCard title="Revue analytique Mensuelle" errors="28" pending="22" progress={15} />
                    <AnalysisCard title="Contrôle de conformité N-1" errors="6" pending="1" progress={85} />
                </Stack>
            </Box>
        </Box>
    );
};

const StatCard = ({ label, value, color, icon }) => (
    <Grid item xs={3}>
        <Stack variant="outlined" sx={{
            height: '110px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 4, bgcolor: '#fff', border: '1px solid #E2E8F0'
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '36px', fontWeight: 300, color: '#1E293B', lineHeight: 1 }}>{value}</Typography>
                <Box sx={{ color: color, opacity: 0.8 }}>{icon}</Box>
            </Stack>
            <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', mt: 1 }}>{label}</Typography>
        </Stack>
    </Grid>
);

const AnalysisCard = ({ title, errors, pending, progress }) => (
    <Stack variant="outlined" sx={{
        width: '400px', borderRadius: '16px', p: 4, cursor: 'pointer', transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        border: '1px solid #E2E8F0',
        '&:hover': { borderColor: NEON_MINT, transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0, 255, 148, 0.15)' }
    }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B' }}>{title}</Typography>
            <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#CBD5E1' }} />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
            <Chip label={`${errors} erreurs`} sx={{ height: 22, fontSize: '10px', bgcolor: '#FEF2F2', color: '#B91C1C', fontWeight: 700, border: 'none' }} />
            <Chip label={`${pending} en attente`} sx={{ height: 22, fontSize: '10px', bgcolor: '#F0F9FF', color: '#0369A1', fontWeight: 700, border: 'none' }} />
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 5, borderRadius: 2, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: NEON_MINT } }} />
    </Stack>
);

export default FinalUserDashboard;