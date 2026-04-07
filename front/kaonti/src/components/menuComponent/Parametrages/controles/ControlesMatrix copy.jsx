import React, { useState } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Stack, Button,
  GlobalStyles, TextField, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, Select, Checkbox, Breadcrumbs, Switch
} from '@mui/material';

// Icônes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const NAV_DARK = '#0B1120';
const BORDER_COLOR = '#E2E8F0';

const ParametresControleClean = () => {
  const [editingId, setEditingId] = useState(null);
  const [controles, setControles] = useState([
    { id: 'ATYPIQUE0001', type: 'ATYPIQUE', compte: '0', test: 'EXISTE', description: 'Seuil de matérialité', anomalies: 'Montant élevé', param: '5000', active: true },
    { id: 'EXISTENCE001', type: 'EXISTENCE', compte: '101', test: 'EXISTE', description: 'Vérif. Capital', anomalies: 'Manquant', param: '1', active: true },
    { id: 'DELAI_REG01', type: 'RETARD', compte: '401', test: 'JOURS', description: 'Délai paiement', anomalies: 'Retard', param: '30', active: false },
  ]);

  const handleParamChange = (id, newVal) => {
    setControles(prev => prev.map(c => c.id === id ? { ...c, param: newVal.replace(/[^0-9]/g, '') } : c));
  };

  const handleToggleActive = (id) => {
    setControles(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles styles={{ body: { margin: 0, padding: 0 } }} />

      {/* HEADER BAR */}
      <AppBar position="static" sx={{ background: NAV_DARK, boxShadow: 'none', height: 50 }}>
        <Toolbar sx={{ minHeight: '50px !important', px: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ bgcolor: '#00FF94', borderRadius: '4px', p: 0.3, display: 'flex' }}>
              <AutoAwesomeIcon sx={{ color: NAV_DARK, fontSize: 14 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '12px', color: '#fff' }}>SAAS ADMIN</Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4, flexGrow: 1 }}>
        {/* FIL D'ARIANE */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '12px', color: '#64748B' }}>Paramétrages</Typography>
          <Typography sx={{ fontSize: '12px', color: NAV_DARK, fontWeight: 700 }}>Contrôles</Typography>
        </Breadcrumbs>

        {/* TITRE & ACTION */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-1.5px', color: '#1E293B' }}>
            Paramétrages / Contrôles
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} sx={primaryBtnStyle}>
            Ajouter une matrice
          </Button>
        </Stack>

        <TableContainer component={Paper} elevation={0} sx={tableContainerStyle}>
          <Table size="small" stickyHeader sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ height: '40px' }}>
                <TableCell padding="checkbox" sx={{ bgcolor: '#F1F5F9', width: '40px' }}><Checkbox size="small" /></TableCell>
                <TableCell sx={headerStyle('10%')}>ID</TableCell>
                <TableCell sx={headerStyle('10%')}>Type</TableCell>
                <TableCell sx={headerStyle('8%')}>Compte</TableCell>
                <TableCell sx={headerStyle('10%')}>Test</TableCell>
                <TableCell sx={headerStyle('22%')}>Description</TableCell>
                <TableCell sx={headerStyle('15%')}>Anomalies</TableCell>
                <TableCell sx={headerStyle('10%')}>Param.</TableCell>
                <TableCell sx={headerStyle('8%')}>Activé</TableCell>
                <TableCell align="right" sx={headerStyle('80px', true)}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {controles.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <TableRow key={row.id} hover sx={{ height: '36px' }}>
                    <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                    <TableCell sx={{ fontSize: '11px', fontWeight: 700 }}>{row.id}</TableCell>
                    <TableCell sx={{ fontSize: '11px' }}>{row.type}</TableCell>
                    <TableCell sx={{ fontSize: '11px', fontWeight: 800 }}>{row.compte}</TableCell>
                    <TableCell sx={{ fontSize: '11px' }}>{row.test}</TableCell>
                    <TableCell sx={{ fontSize: '11px', color: '#475569' }}>{row.description}</TableCell>
                    <TableCell sx={{ fontSize: '11px', color: '#64748B' }}>{row.anomalies}</TableCell>

                    {/* CHAMP PARAM : NUMÉRIQUE */}
                    <TableCell>
                      <TextField
                        value={row.param}
                        variant="standard"
                        onChange={(e) => handleParamChange(row.id, e.target.value)}
                        InputProps={{
                          disableUnderline: !isEditing,
                          style: { fontSize: '11px', fontWeight: 700, color: isEditing ? '#2563EB' : '#1E293B' }
                        }}
                        disabled={!isEditing}
                        sx={{ width: '60px' }}
                      />
                    </TableCell>

                    <TableCell>
                      <Switch
                        size="small"
                        checked={row.active}
                        onChange={() => handleToggleActive(row.id)}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => setEditingId(isEditing ? null : row.id)}>
                          {isEditing ? <CheckIcon fontSize="inherit" color="success" /> : <EditIcon fontSize="inherit" />}
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#EF4444' }}><DeleteIcon fontSize="inherit" /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

// --- STYLES ---
const headerStyle = (width, last = false) => ({
  fontWeight: 800, color: '#64748B', fontSize: '10px', width, bgcolor: '#F1F5F9',
  borderBottom: `1px solid ${BORDER_COLOR}`, pr: last ? 4 : 1, textTransform: 'uppercase'
});

const tableContainerStyle = {
  border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', bgcolor: '#fff', width: '100%', overflow: 'hidden'
};

const primaryBtnStyle = {
  bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: '36px', fontSize: '12px'
};

export default ParametresControleClean;