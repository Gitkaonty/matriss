import React, { useState } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Stack, Button,
  GlobalStyles, TextField, MenuItem, Tabs, Tab,
  Paper, Switch, FormControlLabel, Grid
} from '@mui/material';

// Icônes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SaveIcon from '@mui/icons-material/CheckCircleOutline';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';
const BORDER_COLOR = '#E2E8F0';

const CRMSettingsFinal = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles styles={{
        body: { margin: 0, padding: 0, overflowX: 'hidden' },
        html: { margin: 0, padding: 0 }
      }} />

      {/* Conteneur de page (Plein écran) */}
      <Box sx={{ p: 4, width: '100%', boxSizing: 'border-box' }}>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B', letterSpacing: '-1.2px' }}>
            Configuration Dossier
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon sx={{ fontSize: '18px !important' }} />}
            sx={{
              bgcolor: NAV_DARK, color: '#fff', textTransform: 'none', fontWeight: 700, px: 3, borderRadius: '8px',
              '&:hover': { bgcolor: '#1E293B' }
            }}
          >
            Sauvegarder
          </Button>
        </Stack>

        {/* Onglets sans bordure de focus */}
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            mb: 4,
            '& .MuiTabs-indicator': { bgcolor: NAV_DARK, height: 2 },
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 700, fontSize: '14px', color: '#64748B',
              outline: 'none !important', minWidth: 120
            },
            '& .Mui-selected': { color: `${NAV_DARK} !important` }
          }}
        >
          <Tab label="Infos société" disableRipple />
          <Tab label="Comptabilité" disableRipple />
          <Tab label="Fiscales" disableRipple />
        </Tabs>

        {/* Card de contenu */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: `1px solid ${BORDER_COLOR}`, bgcolor: '#fff', width: '98%' }}>

          <Grid container spacing={1}>
            {tabValue === 0 && (
              <>
                <Grid item xs={12} md={3}> {/* On réduit l'emprise sur la grille */}
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', mb: 1 }}>
                    Nom du dossier
                  </Typography>
                  <TextField
                    fullWidth size="small" defaultValue="demo 20260313"
                    sx={compactFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', mb: 1 }}>
                    Portefeuille
                  </Typography>
                  <TextField
                    select fullWidth size="small" defaultValue="Test"
                    sx={compactFieldStyle}
                  >
                    <MenuItem value="Test">Test</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}

            {tabValue === 1 && (
              <>
                <Grid item xs={12} md={4}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', mb: 1 }}>
                    Plan comptable
                  </Typography>
                  <TextField
                    select fullWidth size="small" defaultValue="Aucun"
                    sx={compactFieldStyle}
                  >
                    <MenuItem value="Aucun">Aucun</MenuItem>
                    <MenuItem value="Standard">Standard Français</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: `1px dashed ${BORDER_COLOR}`, display: 'inline-flex' }}>
                    <FormControlLabel
                      control={<Switch color="default" size="small" />}
                      label={<Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>Avec analytique</Typography>}
                      sx={{ m: 0 }}
                    />
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

// Style pour brider la largeur des champs et éviter l'effet "étiré"
const compactFieldStyle = {
  maxWidth: '400px', // Largeur maximale fixée pour rester "pro"
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: '#fff',
    fontSize: '14px',
    '& fieldset': { borderColor: BORDER_COLOR },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: NAV_DARK, borderWidth: '1.5px' }
  }
};

export default CRMSettingsFinal;