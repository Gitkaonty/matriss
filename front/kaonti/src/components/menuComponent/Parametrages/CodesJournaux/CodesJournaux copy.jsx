import React, { useState } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Stack, Button,
  GlobalStyles, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, Chip
} from '@mui/material';

// Icônes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/HighlightOff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceOutlined';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';

const JournalCodesSettings = () => {
  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles styles={{
        body: { margin: 0, padding: 0, overflowX: 'hidden', backgroundColor: BG_SOFT, fontFamily: '"Inter", sans-serif' }
      }} />

      {/* HEADER CORE.OS */}
      <AppBar position="sticky" sx={{ background: NAV_DARK, boxShadow: 'none' }}>
        <Toolbar sx={{ px: 4, height: 60 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: NEON_MINT, borderRadius: '8px', p: 0.5, display: 'flex' }}>
              <AutoAwesomeIcon sx={{ color: NAV_DARK, fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>PARAMÉTRAGES</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 5 }}>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 4, fontWeight: 600 }}>JOURNAUX / CODES JOURNAUX</Typography>

        <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* ENTÊTE AVEC BOUTON SOMBRE */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 1 }}>
            <Typography sx={{ fontWeight: 900, color: '#1E293B', fontSize: '20px', letterSpacing: '-0.5px' }}>
              Codes Journaux
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                textTransform: 'none', fontSize: '12px', fontWeight: 700,
                bgcolor: NAV_DARK, color: '#fff', borderRadius: '6px', px: 2.5, py: 0.8,
                '&:hover': { bgcolor: '#1E293B' }
              }}
            >
              Ajouter journal
            </Button>
          </Stack>

          {/* TABLEAU DES JOURNAUX */}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '10px', textTransform: 'uppercase' }}>Libellé</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '10px', textTransform: 'uppercase' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '10px', textTransform: 'uppercase' }}>Compte associé</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B', fontSize: '10px', pr: 3 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <JournalRow code="VT" label="Journal de vente" type="VENTE" typeColor="#10B981" />
                <JournalRow code="HSBC" label="Journal de trésorerie - HSBC" type="BANQUE" typeColor="#0369A1" account="5121002" />
                <JournalRow code="HA" label="Journal d'achat" type="ACHAT" typeColor="#3B82F6" />
                <JournalRow code="OD" label="Journal des opérations diverses" type="OD" typeColor="#64748B" />
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

const JournalRow = ({ code, label, type, typeColor, account = "-" }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <TableRow sx={{ '&:hover': { bgcolor: '#F1F5F9' }, transition: '0.2s' }}>
      <TableCell sx={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{code}</TableCell>
      <TableCell sx={{ fontSize: '13px', color: '#475569' }}>{label}</TableCell>
      <TableCell>
        <Chip
          label={type}
          size="small"
          sx={{
            bgcolor: typeColor,
            color: '#fff',
            fontWeight: 800,
            fontSize: '10px',
            borderRadius: '6px',
            height: '20px'
          }}
        />
      </TableCell>
      <TableCell sx={{ fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>{account}</TableCell>

      <TableCell align="right" sx={{ pr: 2 }}>
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          {isEditing ? (
            <>
              <Tooltip title="Sauvegarder">
                <IconButton onClick={() => setIsEditing(false)} size="small" sx={{ color: '#10B981' }}><SaveIcon sx={{ fontSize: 20 }} /></IconButton>
              </Tooltip>
              <Tooltip title="Annuler">
                <IconButton onClick={() => setIsEditing(false)} size="small" sx={{ color: '#F43F5E' }}><CancelIcon sx={{ fontSize: 20 }} /></IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Modifier">
                <IconButton onClick={() => setIsEditing(true)} size="small" sx={{ color: '#CBD5E1', '&:hover': { color: NAV_DARK } }}><EditIcon sx={{ fontSize: 20 }} /></IconButton>
              </Tooltip>
              <Tooltip title="Supprimer">
                <IconButton size="small" sx={{ color: '#CBD5E1', '&:hover': { color: '#EF4444' } }}><DeleteIcon sx={{ fontSize: 20 }} /></IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default JournalCodesSettings;