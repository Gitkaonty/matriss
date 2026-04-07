import React, { useState } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Stack, Button,
  GlobalStyles, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Grid, Tooltip
} from '@mui/material';

// Icônes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/HighlightOff';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';

const AnalyticsSettingsDarkBtn = () => {
  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles styles={{
        body: { margin: 0, padding: 0, overflowX: 'hidden', backgroundColor: BG_SOFT, fontFamily: '"Inter", sans-serif' }
      }} />

      <Box sx={{ p: 5 }}>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 4, fontWeight: 600 }}>CONFIGURATION / ANALYTIQUE</Typography>

        <Grid container spacing={4}>
          {/* SECTION AXES */}
          <Grid item xs={12} lg={5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 900, color: '#1E293B', fontSize: '18px' }}>Axes</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  textTransform: 'none', fontSize: '12px', fontWeight: 700,
                  bgcolor: NAV_DARK, color: '#fff', borderRadius: '6px', px: 2,
                  '&:hover': { bgcolor: '#1E293B' }
                }}
              >
                Ajouter axe
              </Button>
            </Stack>
            <AnalyticsTable
                headers={['Code Axe', 'Libellé']}
                data={[{ id: 1, col1: 'axe1_1_143', col2: 'axe1' }]}
            />
          </Grid>

          {/* SECTION SECTIONS */}
          <Grid item xs={12} lg={7}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 900, color: '#1E293B', fontSize: '18px' }}>Sections</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  textTransform: 'none', fontSize: '12px', fontWeight: 700,
                  bgcolor: NAV_DARK, color: '#fff', borderRadius: '6px', px: 2,
                  '&:hover': { bgcolor: '#1E293B' }
                }}
              >
                Ajouter section
              </Button>
            </Stack>
            <AnalyticsTable
                headers={['Section', 'Intitulé', 'Compte', '%']}
                data={[{ id: 1, col1: 'S1', col2: 'Ventes Sud', col3: '701000', col4: '100' }]}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

const AnalyticsTable = ({ headers, data }) => {
  const [editingId, setEditingId] = useState(null);

  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            {headers.map((h) => (
              <TableCell key={h} sx={{ fontWeight: 800, color: '#64748B', fontSize: '10px', textTransform: 'uppercase', py: 2 }}>{h}</TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B', fontSize: '10px', pr: 2 }}>ACTIONS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => {
            const isEditing = editingId === row.id;
            return (
              <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#F1F5F9' } }}>
                <TableCell sx={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{row.col1}</TableCell>
                <TableCell sx={{ fontSize: '13px', color: '#475569' }}>{row.col2}</TableCell>
                {row.col3 && <TableCell sx={{ fontSize: '13px', color: '#475569' }}>{row.col3}</TableCell>}
                {row.col4 && <TableCell sx={{ fontSize: '13px', color: '#475569' }}>{row.col4}%</TableCell>}

                <TableCell align="right" sx={{ pr: 1 }}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    {isEditing ? (
                      <>
                        <IconButton onClick={() => setEditingId(null)} size="small" sx={{ color: '#10B981' }}><SaveIcon sx={{ fontSize: 20 }} /></IconButton>
                        <IconButton onClick={() => setEditingId(null)} size="small" sx={{ color: '#F43F5E' }}><CancelIcon sx={{ fontSize: 20 }} /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => setEditingId(row.id)} size="small" sx={{ color: '#CBD5E1', '&:hover': { color: NAV_DARK } }}><EditIcon sx={{ fontSize: 20 }} /></IconButton>
                        <IconButton size="small" sx={{ color: '#CBD5E1', '&:hover': { color: '#EF4444' } }}><DeleteIcon sx={{ fontSize: 20 }} /></IconButton>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AnalyticsSettingsDarkBtn;