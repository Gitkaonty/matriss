import React from 'react';
import {
  Box, Typography, AppBar, Toolbar, Stack, Button,
  GlobalStyles, TextField, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Checkbox, IconButton, InputAdornment, Breadcrumbs, Grid
} from '@mui/material';

// Icônes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';
const BORDER_COLOR = '#E2E8F0';

const ExercicesPageFinal = () => {
  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles styles={{
        body: { margin: 0, padding: 0, overflowX: 'hidden' },
        '*': { boxSizing: 'border-box' }
      }} />

      {/* HEADER */}
      <AppBar position="sticky" sx={{ background: NAV_DARK, boxShadow: 'none', width: '100%' }}>
        <Toolbar sx={{ px: 4, height: 50 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: NEON_MINT, borderRadius: '6px', p: 0.4, display: 'flex' }}>
              <AutoAwesomeIcon sx={{ color: NAV_DARK, fontSize: 16 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase' }}>
                Application
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4, width: '100%' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Paramétrages</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: NAV_DARK }}>Exercices & Périodes</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B', letterSpacing: '-1px', mb: 4 }}>
          Gestion des Exercices
        </Typography>

        <Grid container spacing={3}>

          {/* TABLEAU EXERCICES (GAUCHE) */}
          <Grid item xs={12} lg={5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, height: '32px' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '14px', color: NAV_DARK }}>Exercices</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  placeholder="Recherche..."
                  size="small"
                  sx={searchStyle}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94A3B8' }} /></InputAdornment>),
                  }}
                />
                <Button size="small" startIcon={<AddIcon />} sx={btnStyle}>Ajouter</Button>
              </Stack>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={tableContainerStyle}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow sx={{ height: '35px' }}>
                    <TableCell sx={headerStyle(120)}>Date début</TableCell>
                    <TableCell sx={headerStyle(120)}>Date fin</TableCell>
                    <TableCell align="right" sx={headerStyle(100, true)}>Actions</TableCell>
                    <TableCell sx={{ bgcolor: '#F8FAFC' }} /> {/* ABSORBE L'ESPACE */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ height: '36px', '&:hover': { bgcolor: '#F1F5F9' } }}>
                    <TableCell sx={cellStyle}>01/01/2025</TableCell>
                    <TableCell sx={cellStyle}>31/12/2025</TableCell>
                    <TableCell align="right" sx={{ py: 0 }}>
                      <Stack direction="row" spacing={0} justifyContent="flex-end">
                        <IconButton size="small" sx={{ color: '#64748B' }}><EditIcon fontSize="inherit" /></IconButton>
                        <IconButton size="small" sx={{ color: '#CBD5E1' }}><DeleteIcon fontSize="inherit" /></IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell /> {/* ABSORBE L'ESPACE */}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* TABLEAU PÉRIODES (DROITE) */}
          <Grid item xs={12} lg={7}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, height: '32px' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '14px', color: NAV_DARK }}>Périodes détaillées</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  placeholder="Recherche..."
                  size="small"
                  sx={searchStyle}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94A3B8' }} /></InputAdornment>),
                  }}
                />
                <Button size="small" startIcon={<AddIcon />} sx={btnStyle}>Ajouter</Button>
              </Stack>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={tableContainerStyle}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow sx={{ height: '35px' }}>
                    <TableCell sx={headerStyle(100)}>Période</TableCell>
                    <TableCell sx={headerStyle(120)}>Début</TableCell>
                    <TableCell sx={headerStyle(120)}>Fin</TableCell>
                    <TableCell align="center" sx={headerStyle(80)}>Vérrouillé</TableCell>
                    <TableCell align="right" sx={headerStyle(100, true)}>Actions</TableCell>
                    <TableCell sx={{ bgcolor: '#F8FAFC' }} /> {/* ABSORBE L'ESPACE */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ height: '36px', '&:hover': { bgcolor: '#F1F5F9' } }}>
                    <TableCell sx={cellStyle}>Janvier</TableCell>
                    <TableCell sx={cellStyle}>01/01/2025</TableCell>
                    <TableCell sx={cellStyle}>31/01/2025</TableCell>
                    <TableCell align="center" sx={{ py: 0 }}><Checkbox size="small" disabled /></TableCell>
                    <TableCell align="right" sx={{ py: 0 }}>
                      <Stack direction="row" spacing={0} justifyContent="flex-end">
                        <IconButton size="small" sx={{ color: '#64748B' }}><EditIcon fontSize="inherit" /></IconButton>
                        <IconButton size="small" sx={{ color: '#CBD5E1' }}><DeleteIcon fontSize="inherit" /></IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell /> {/* ABSORBE L'ESPACE */}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// --- STYLES HARMONISÉS ---
const tableContainerStyle = {
  borderRadius: '12px',
  border: `1px solid ${BORDER_COLOR}`,
  bgcolor: '#fff',
  overflow: 'hidden'
};

const cellStyle = { fontSize: '13px', py: '6px' };

const headerStyle = (width, last = false) => ({
  fontWeight: 800,
  color: '#94A3B8',
  fontSize: '10px',
  textTransform: 'uppercase',
  width: width,
  minWidth: width, // Bloque la largeur minimum
  paddingY: '4px',
  pr: last ? 2 : 1
});

const btnStyle = {
  bgcolor: '#10B981',
  color: '#fff',
  textTransform: 'none',
  fontWeight: 700,
  borderRadius: '6px',
  height: '28px',
  fontSize: '11px',
  '&:hover': { bgcolor: '#059669' }
};

const searchStyle = {
  width: 140,
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    bgcolor: '#fff',
    height: '28px',
    fontSize: '11px'
  }
};