import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, TextField, Button, Checkbox,
  FormControlLabel, InputAdornment, IconButton, Stack, GlobalStyles, Paper, Divider
} from '@mui/material';

import axios from '../../config/axios';
import { init } from '../../init';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Imports d'icônes standards (Vérifiés)
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// VOS CONSTANTES EXACTES
const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';

const LoginPage = () => {

  const initial = init[0];
  const navigate = useNavigate();
  const userRef = useRef();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleLoginSubmit = async (event) => {
    event?.preventDefault?.();
    try {
      const response = await axios.post('/', { email, password }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      const accessToken = response?.data?.accessToken;
      setAuth({ accessToken });
      navigate("/tab/home");
    } catch (err) {
      if (!err.response) {
        toast.error('Le serveur ne répond pas');
      } else if (err.response?.status === 400) {
        toast.error('Veuillez insérer votre email et mot de passe correctement');
      } else if (err.response?.status === 401) {
        toast.error(err.response?.data?.message);
      } else {
        toast.error('Erreur de connexion');
      }
    }
  };

  useEffect(() => {
    userRef.current.focus();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: BG_SOFT, width: '100vw', overflow: 'hidden' }}>
      <GlobalStyles styles={{
        body: { margin: 0, padding: 0, fontFamily: '"Inter", sans-serif', backgroundColor: BG_SOFT },
      }} />

      {/* SECTION GAUCHE : FORMULAIRE CLAIR & COMPACT */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
        zIndex: 2
      }}>
        <Paper elevation={0} component="form" onSubmit={handleLoginSubmit} sx={{
          width: '100%',
          maxWidth: 380,
          p: 5,
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF'
        }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: NAV_DARK, borderRadius: '6px', p: 0.5, display: 'flex' }}>
                <AutoAwesomeIcon sx={{ color: NEON_MINT, fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: NAV_DARK, letterSpacing: '0.5px' }}>
                Checkup-Data
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B', mt: 2 }}>
              Identification
            </Typography>
          </Stack>

          <Stack spacing={1.5}>
            <TextField
              inputRef={userRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              placeholder="votre@email.com"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  bgcolor: '#F8FAFC',
                  fontSize: '13px',
                  '& fieldset': { border: '1px solid #E2E8F0' },
                  '&:hover fieldset': { border: `1px solid ${NAV_DARK}` },
                  '&.Mui-focused fieldset': { border: `1px solid ${NAV_DARK}` }
                }
              }}
            />

            <TextField
              fullWidth
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              placeholder="Mot de passe"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} sx={{ p: 0 }}>
                      {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  bgcolor: '#F8FAFC',
                  fontSize: '13px',
                  '& fieldset': { border: '1px solid #E2E8F0' },
                  '&:hover fieldset': { border: `1px solid ${NAV_DARK}` },
                  '&.Mui-focused fieldset': { border: `1px solid ${NAV_DARK}` }
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={<Checkbox size="small" defaultChecked sx={{ color: '#CBD5E1', '&.Mui-checked': { color: NAV_DARK } }} />}
                label={<Typography sx={{ fontSize: '11px', color: '#64748B' }}>Rester connecté</Typography>}
              />
              <Typography variant="caption" sx={{ color: NAV_DARK, fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}>
                Oublié ?
              </Typography>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disableElevation
              sx={{
                bgcolor: NEON_MINT,
                color: NAV_DARK,
                borderRadius: '6px',
                py: 1,
                fontWeight: 900,
                textTransform: 'none',
                fontSize: '14px',
                mt: 1,
                boxShadow: `0 4px 12px -2px ${NEON_MINT}`,
                '&:hover': { bgcolor: '#00E685', transform: 'translateY(-1px)' }
              }}
            >
              S'identifier
            </Button>
          </Stack>
        </Paper>

        <Typography variant="caption" sx={{ mt: 4, color: '#94A3B8', fontWeight: 700, letterSpacing: '1px' }}>
          Checkup-Data V1.0.0.0
        </Typography>
      </Box>

      {/* SECTION DROITE : TEXTES ORNEMENTAUX SÉCURISÉS */}
      <Box sx={{
        flex: 1.3,
        background: `linear-gradient(135deg, #E2E8F0 0%, #F8FAFC 100%)`,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        p: 12,
        borderLeft: '1px solid #E2E8F0'
      }}>
        <Stack spacing={6}>
          <Box>
            <Typography variant="overline" sx={{ color: NAV_DARK, fontWeight: 800, letterSpacing: '2px', opacity: 0.5 }}>
              SÉCURITÉ ET PERFORMANCE
            </Typography>

            <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1, mt: 1, mb: 3, color: NAV_DARK, letterSpacing: '-1.5px' }}>
              Supervision comptable  <br />
              automatisée.
            </Typography>

            <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 450, lineHeight: 1.8, mb: 4 }}>
              Profitez d'un moteur d'analyse conçu pour les experts les plus exigeants.
              Une vérification exhaustive de vos données financières sans compromis.
            </Typography>
          </Box>

          {/* BLOCS D'INFO SANS CHIFFRES */}
          <Stack spacing={3}>
            {/* BLOC 1 : TEMPS RÉEL */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <SpeedIcon sx={{ color: NAV_DARK, mt: 0.5, fontSize: 24 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: NAV_DARK }}>
                  Analyse instantanée
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', maxWidth: 300 }}>
                  Traitez vos journaux et balances dès l'importation. Identifiez les anomalies sans attendre.
                </Typography>
              </Box>
            </Stack>

            {/* BLOC 2 : RÉVISION ANALYTIQUE */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <SecurityIcon sx={{ color: NAV_DARK, mt: 0.5, fontSize: 24 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: NAV_DARK }}>
                  Intelligence analytique
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', maxWidth: 300 }}>
                  Bénéficiez d'un contrôle de cohérence exhaustif et d'un audit en profondeur de chaque compte.
                </Typography>
              </Box>
            </Stack>

            {/* BLOC 3 : RÉVISION PAR CYCLE */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <VerifiedUserIcon sx={{ color: NAV_DARK, mt: 0.5, fontSize: 24 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: NAV_DARK }}>
                  Méthodologie par cycles
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', maxWidth: 300 }}>
                  Pilotez votre révision via un dossier de travail normé, structuré par cycles d'audit.
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Divider sx={{ maxWidth: 150, borderColor: 'rgba(11, 17, 32, 0.1)' }} />

          {/* FOOTER DISCRET */}
          <Stack direction="row" spacing={3} sx={{ opacity: 0.6 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CheckCircleIcon sx={{ fontSize: 12, color: NAV_DARK }} />
              <Typography variant="caption" sx={{ color: NAV_DARK, fontWeight: 800, letterSpacing: '0.5px' }}>
                Audit automatisé
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CheckCircleIcon sx={{ fontSize: 12, color: NAV_DARK }} />
              <Typography variant="caption" sx={{ color: NAV_DARK, fontWeight: 800, letterSpacing: '0.5px' }}>
                Révisoin fluidifiée
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CheckCircleIcon sx={{ fontSize: 12, color: NAV_DARK }} />
              <Typography variant="caption" sx={{ color: NAV_DARK, fontWeight: 800, letterSpacing: '0.5px' }}>
                Conformité garantie
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginPage;