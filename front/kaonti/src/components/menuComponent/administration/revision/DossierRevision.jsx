import React, { useState } from 'react';
import { 
  Box, Typography, Stack, Paper, TextField, 
  List, ListItemButton, ListItemText, ListItemIcon,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  ToggleButtonGroup, ToggleButton, alpha, Tabs, Tab, Divider, Drawer, IconButton, Button,
  LinearProgress
} from '@mui/material';
import { 
  CalendarMonth, Verified, Edit, Delete, 
  Comment, Close, Save, PieChart, FiberManualRecord
} from '@mui/icons-material';

import { 
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis 
} from 'recharts';

const DossierTravailPage = () => {
  const [activeCycle, setActiveCycle] = useState("etat d'avancement");
  const [activeTab, setActiveTab] = useState(0);
  const [answers, setAnswers] = useState({});
  const [validatedRows, setValidatedRows] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const K_THEME = {
    navy: '#0f172a',
    cyan: '#06b6d4',
    slate: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f43f5e',
    bg: '#f8fafc',
    radius: '4px'
  };

  const handleValidation = (id) => {
    setValidatedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openCommentDrawer = (point) => {
    setSelectedPoint(point);
    setDrawerOpen(true);
  };

  const renderGeneralDashboard = () => {
    // Les données complètes de vos 13 cycles
    const allCycles = [
      { label: 'GÉNÉRAL', progress: 95, color: K_THEME.success },
      { label: 'ACTIONNAIRES', progress: 0, color: K_THEME.slate },
      { label: 'CAPITAUX PROPRES', progress: 0, color: K_THEME.slate },
      { label: 'IMMOBILISATION', progress: 20, color: K_THEME.cyan },
      { label: 'STOCKS', progress: 10, color: K_THEME.error },
      { label: 'ACHATS', progress: 85, color: K_THEME.cyan },
      { label: 'AUTRES ACHATS ET CHARGE', progress: 45, color: K_THEME.warning },
      { name: 'VENTES', progress: 100, color: K_THEME.success },
      { label: 'SOCIAL', progress: 40, color: K_THEME.error },
      { label: 'IMPÔTS ET TAXES', progress: 30, color: K_THEME.warning },
      { label: 'PROVISIONS', progress: 0, color: K_THEME.slate },
      { label: 'EMPRUNTS', progress: 15, color: K_THEME.cyan },
      { label: 'TRESORERIE', progress: 65, color: K_THEME.warning },
    ];

    return (
      <Stack spacing={4}>
        <Typography sx={{ color: K_THEME.navy, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
          KPI - ÉTAT D'AVANCEMENT GLOBAL DES CYCLES
        </Typography>
        
        {/* Grille responsive pour afficher les 13 cycles */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: 2 
        }}>
          {allCycles.map((item) => (
            <Paper 
              key={item.label} 
              elevation={0} 
              sx={{ 
                p: 2, 
                border: `1px solid ${K_THEME.border}`, 
                borderRadius: K_THEME.radius, 
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: K_THEME.cyan,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {/* Titre du cycle */}
              <Typography 
                sx={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 900, 
                  color: K_THEME.navy, 
                  textAlign: 'center',
                  lineHeight: 1.2,
                  height: '1.4rem', // Fixe la hauteur pour aligner les graphes
                  mb: 1
                }}
              >
                {item.label}
              </Typography>
              
              {/* Conteneur de la ProgressBar circulaire */}
              <Box sx={{ width: 100, height: 100, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    innerRadius="80%" 
                    outerRadius="100%" 
                    data={[{ value: item.progress }]} 
                    startAngle={90} 
                    endAngle={-270} // Fait un cercle complet
                  >
                    {/* L'axe qui définit le 100% pour que les cercles soient comparables */}
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    
                    <RadialBar
                      background={{ fill: alpha(K_THEME.slate, 0.05) }} // Fond gris très clair
                      dataKey="value"
                      cornerRadius={5} // Coins arrondis style Kaonti
                      fill={item.color}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                
                {/* Le pourcentage écrit en gros au centre */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  textAlign: 'center' 
                }}>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: K_THEME.navy }}>
                    {item.progress}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Stack>
    );
  };


  const renderContent = () => {
    if (activeCycle === "etat d'avancement") return renderGeneralDashboard();

    switch (activeTab) {
      case 0: 
        return (
          <Stack spacing={4}>
            <Stack direction="row" spacing={2}>
              <Box sx={{ 
                flex: 1, p: 2, border: `1px solid ${K_THEME.navy}`, 
                background: 'radial-gradient(circle at 20% 30%, #2f4566 0%, #010810 100%)', 
                borderRadius: K_THEME.radius 
              }}>
                <Typography sx={{ color: alpha('#fff', 0.6), fontSize: '0.7rem', fontWeight: 900, mb: 1 }}>PROGRESSION DU CYCLE</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ color: '#fff', fontSize: '1.2rem', fontWeight: 900 }}>85%</Typography>
                  <Verified sx={{ color: K_THEME.cyan }} />
                </Stack>
              </Box>
              <Box sx={{ flex: 1, p: 2, border: `1px solid ${K_THEME.border}`, borderTop: `4px solid ${K_THEME.warning}`, borderRadius: K_THEME.radius, bgcolor: '#fff' }}>
                <Typography sx={{ color: K_THEME.slate, fontSize: '0.7rem', fontWeight: 900, mb: 1 }}>POINTS DE VIGILANCE</Typography>
                <Typography sx={{ color: K_THEME.navy, fontSize: '1.2rem', fontWeight: 900 }}>02</Typography>
              </Box>
            </Stack>

            <Box>
              <Typography sx={{ color: K_THEME.navy, fontWeight: 900, fontSize: '0.75rem', mb: 2 }}>HISTORIQUE DES NOTES</Typography>
              <Stack spacing={2} sx={{ mb: 3 }}>
                {[
                  { user: "Jean Réviseur", date: "24/03/2026", text: "Vérification faite sur les factures de décembre. RAS sur le cut-off." },
                ].map((comm, idx) => (
                  <Box key={idx} sx={{ p: 2, bgcolor: '#fff', border: `1px solid ${K_THEME.border}`, borderRadius: K_THEME.radius, position: 'relative' }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: K_THEME.cyan }}>{comm.user.toUpperCase()}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: K_THEME.slate }}>{comm.date}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', color: K_THEME.navy, pr: 8 }}>{comm.text}</Typography>
                    <Stack direction="row" sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                      <IconButton size="small"><Edit sx={{ fontSize: '0.9rem' }} /></IconButton>
                      <IconButton size="small"><Delete sx={{ fontSize: '0.9rem' }} /></IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
              <Box sx={{ position: 'relative' }}>
                <TextField multiline rows={4} fullWidth placeholder="Ajouter un nouveau commentaire technique..." sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', borderRadius: K_THEME.radius, bgcolor: '#fff', pb: 6 } }} />
                <Button startIcon={<Save />} variant="contained" sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: K_THEME.navy, color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>SAUVEGARDER</Button>
              </Box>
            </Box>
          </Stack>
        );
      case 1: 
        return (
          <TableContainer sx={{ borderRadius: K_THEME.radius, border: `1px solid ${K_THEME.border}` }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: K_THEME.navy, color: '#fff', fontWeight: 900, fontSize: '0.65rem', py: 2 }}>TRAVAUX À RÉALISER</TableCell>
                  <TableCell align="center" sx={{ bgcolor: K_THEME.navy, color: '#fff', fontWeight: 900, fontSize: '0.65rem', width: 220 }}>STATUT</TableCell>
                  <TableCell align="center" sx={{ bgcolor: K_THEME.navy, color: '#fff', fontWeight: 900, fontSize: '0.65rem', width: 120 }}>NOTE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {["Analyse des suspens", "Cadrage des comptes", "Vérification des pièces"].map((q, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: K_THEME.navy, py: 2 }}>{q}</TableCell>
                    <TableCell align="center">
                      <ToggleButtonGroup 
                        value={answers[i]} exclusive onChange={(e, v) => setAnswers({...answers, [i]: v})} 
                        sx={{ height: 24, '& .MuiToggleButton-root': { borderRadius: K_THEME.radius, px: 1.5, fontSize: '0.55rem', fontWeight: 900, mx: 0.2, border: '1px solid transparent' } }}
                      >
                        <ToggleButton value="OUI" sx={{ '&.Mui-selected': { bgcolor: alpha(K_THEME.success, 0.1), color: K_THEME.success, borderColor: K_THEME.success, '&:hover': { bgcolor: alpha(K_THEME.success, 0.2) } } }}>OUI</ToggleButton>
                        <ToggleButton value="NON" sx={{ '&.Mui-selected': { bgcolor: alpha(K_THEME.error, 0.1), color: K_THEME.error, borderColor: K_THEME.error, '&:hover': { bgcolor: alpha(K_THEME.error, 0.2) } } }}>NON</ToggleButton>
                        <ToggleButton value="NA" sx={{ '&.Mui-selected': { bgcolor: alpha(K_THEME.slate, 0.1), color: K_THEME.slate, borderColor: K_THEME.slate, '&:hover': { bgcolor: alpha(K_THEME.slate, 0.2) } } }}>NA</ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                    <TableCell align="center"><IconButton size="small" onClick={() => openCommentDrawer(q)}><Comment sx={{ fontSize: '1.1rem', color: K_THEME.cyan }} /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 2:
        return (
          <TableContainer sx={{ borderRadius: K_THEME.radius, border: `1px solid ${K_THEME.border}` }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['DATE', 'COMPTE', 'LIBELLÉ', 'DÉBIT', 'CRÉDIT', 'VALIDÉ'].map((h) => (
                    <TableCell key={h} align={h === 'VALIDÉ' ? 'center' : 'left'} sx={{ bgcolor: K_THEME.navy, color: '#fff', fontWeight: 900, fontSize: '0.65rem', py: 2 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[101, 102, 103].map((id) => (
                  <TableRow key={id} hover>
                    <TableCell sx={{ fontSize: '0.7rem' }}>28/12/2022</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: K_THEME.cyan, fontWeight: 900 }}>401000</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem' }}>LIBELLÉ OPÉRATION {id}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem' }}>0.00</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 900 }}>1 000.00</TableCell>
                    <TableCell align="center">
                      <Box onClick={() => handleValidation(id)} sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: '20px', border: `1px solid ${validatedRows[id] ? K_THEME.cyan : K_THEME.border}`, bgcolor: validatedRows[id] ? alpha(K_THEME.cyan, 0.1) : 'transparent' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: validatedRows[id] ? K_THEME.cyan : K_THEME.border }} />
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: validatedRows[id] ? K_THEME.navy : K_THEME.slate }}>{validatedRows[id] ? 'VÉRIFIÉ' : 'À CONTRÔLER'}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default: return null;
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#fff', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 450, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography sx={{ color: K_THEME.navy, fontWeight: 900, fontSize: '0.8rem' }}>NOTES DE RÉVISION</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
          </Stack>
          <TextField multiline rows={20} fullWidth />
          <Button fullWidth sx={{ mt: 2, bgcolor: K_THEME.navy, color: '#fff' }}>ENREGISTRER</Button>
        </Box>
      </Drawer>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Stack direction="row" spacing={4} alignItems="center">
          <Box sx={{ p: 1, border: `2px solid ${K_THEME.navy}`, borderRadius: K_THEME.radius }}><CalendarMonth sx={{ color: K_THEME.navy }} /></Box>
          <Box>
            <Typography sx={{ color: K_THEME.slate, fontSize: '0.6rem', fontWeight: 900 }}>EXERCICE CLÔTURE</Typography>
            <Typography sx={{ color: K_THEME.navy, fontSize: '1.2rem', fontWeight: 900 }}>31 DÉCEMBRE 2022</Typography>
          </Box>
        </Stack>
        <Typography sx={{ color: K_THEME.cyan, fontWeight: 900, fontSize: '0.7rem' }}>KAONTI / REVISION / {activeCycle.toUpperCase()}</Typography>
      </Stack>

      <Divider sx={{ my: 1, bgcolor: K_THEME.navy, height: 2 }} />

      <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, overflow: 'hidden' }}>
        <Box sx={{ width: 260, overflowY: 'auto' }}>
          <List sx={{ p: 0 }}>
            {[
              { n: "ETAT D'AVANCEMENT", i: <PieChart /> },
              { n: 'GÉNÉRAL', i: <FiberManualRecord /> },
              { n: 'ACTIONNAIRES', i: <FiberManualRecord /> },
              { n: 'CAPITAUX PROPRES', i: <FiberManualRecord /> },
              { n: 'IMMOBILISATION', i: <FiberManualRecord /> },
              { n: 'STOCKS', i: <FiberManualRecord /> },
              { n: 'ACHATS', i: <FiberManualRecord /> },
              { n: 'AUTRES ACHATS ET CHARGE', i: <FiberManualRecord /> },
              { n: 'VENTES', i: <FiberManualRecord /> },
              { n: 'SOCIAL', i: <FiberManualRecord /> },
              { n: 'IMPÔTS ET TAXES', i: <FiberManualRecord /> },
              { n: 'PROVISIONS', i: <FiberManualRecord /> },
              { n: 'EMPRUNTS', i: <FiberManualRecord /> },
              { n: 'TRESORERIE', i: <FiberManualRecord /> }
            ].map((cycle) => {
              const isAvancement = cycle.n === "ETAT D'AVANCEMENT";
              const isActive = activeCycle === cycle.n.toLowerCase();
              return (
                <ListItemButton 
                  key={cycle.n} 
                  selected={isActive}
                  onClick={() => { setActiveCycle(cycle.n.toLowerCase()); setActiveTab(0); }}
                  sx={{ 
                    borderRadius: K_THEME.radius, mb: 0.1,
                    ...(isAvancement ? {
                      background: 'radial-gradient(circle at 10% 20%, #2f4566 0%, #010810 100%)',
                      '& .MuiTypography-root': { color: '#fff' },
                      '& .MuiListItemIcon-root': { color: K_THEME.cyan },
                      '&:hover': { background: 'radial-gradient(circle at 10% 20%, #3d5a85 0%, #010810 100%)' }
                    } : {
                      '&.Mui-selected': { bgcolor: alpha(K_THEME.cyan, 0.05), borderLeft: `4px solid ${K_THEME.navy}` }
                    })
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? K_THEME.cyan : K_THEME.slate }}>
                    {React.cloneElement(cycle.i, { sx: { fontSize: isAvancement ? '1.2rem' : '1.2rem' } })}
                  </ListItemIcon>
                  <ListItemText primary={cycle.n} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 600 }} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 2.5, display: 'flex' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 2.5,
                py: 1,
                bgcolor: K_THEME.cyan, // Fond Cyan pour la visibilité
                borderRadius: K_THEME.radius,
                boxShadow: `0 4px 12px ${alpha(K_THEME.cyan, 0.3)}`,
                border: `1px solid ${alpha(K_THEME.navy, 0.1)}`
              }}
            >
              <Typography 
                sx={{ 
                  color: K_THEME.navy, 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  mr: 1.5,
                  letterSpacing: '1px',
                  opacity: 0.8
                }}
              >
                CYCLE :
              </Typography>
              <Typography 
                sx={{ 
                  color: K_THEME.navy, 
                  fontSize: '0.85rem', // Texte plus grand comme demandé
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
              >
                {activeCycle.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          
          {activeCycle !== "etat d'avancement" && (
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 900 } }}>
              <Tab label="01. SYNTHÈSE" />
              <Tab label="02. DILIGENCES" />
              <Tab label="03. REVUE ANALYTIQUE" />
            </Tabs>
          )}
          <Box sx={{ flexGrow: 1, border: `1px solid ${K_THEME.border}`, p: 4, bgcolor: K_THEME.bg, overflow: 'auto' }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DossierTravailPage;