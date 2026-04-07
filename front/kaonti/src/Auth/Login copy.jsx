import { useEffect, useRef, useState } from 'react';
import { Stack, Box, TextField, Button, Typography, Checkbox, InputAdornment, IconButton } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from '../../config/axios';
import { init } from '../../init';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
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
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        backgroundColor: '#F3F4F6',
        position: 'relative',
      }}
    >
      {/* Left side - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, md: 8 },
          py: { xs: 5, md: 8 },
          position: 'relative',
        }}
      >
        {/* Transparent card */}
        <Box
          component="form"
          onSubmit={handleLoginSubmit}
          sx={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'rgba(255, 255, 255, 0.08)', // transparent / glass effect
            borderRadius: 2,
            boxShadow: 3,
            px: { xs: 3, md: 4 },
            py: { xs: 4, md: 5 },
            backdropFilter: 'blur(8px)', // effet glass
          }}
        >
          <Stack spacing={3} alignItems="center">

            {/* Logo + Title + Subtitle */}
            <Stack spacing={1.5} alignItems="center">
              <Box
                component="img"
                src="/src/img/30.png"
                alt="Logo"
                sx={{ width: 150, height: 150, objectFit: 'contain' }}
              />
              {/* <Typography
                variant="h5"
                fontWeight={700}
                font-family= "Space Grotesk"
                letter-spacing= "0.8px"
              >
                Check-Up Data
              </Typography> */}
              <Typography
                variant="body2"
                fontFamily="Bahnschrift"
                color="rgba(17, 24, 39, 0.7)"
                textAlign="center"
              >
                Connectez-vous à votre compte
              </Typography>
            </Stack>

            {/* Email */}
            <TextField
              inputRef={userRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Adresse mail"
              variant="standard"  // juste la ligne
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0,0,0,0.3)' },
                '& .MuiInput-underline:hover:before': { borderBottomColor: 'rgba(0,0,0,0.5)' },
                '& .MuiInput-underline:after': { borderBottomColor: initial.theme },
              }}
            />

            {/* Password */}
            <TextField
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Mot de passe"
              variant="standard"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} sx={{ p: 0 }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0,0,0,0.3)' },
                '& .MuiInput-underline:hover:before': { borderBottomColor: 'rgba(0,0,0,0.5)' },
                '& .MuiInput-underline:after': { borderBottomColor: initial.theme },
              }}
            />

            {/* Checkbox */}
            <Stack direction="row" alignItems="center">
              <Checkbox defaultChecked size="small" />
              <Typography variant="body2">J'ai lu et j'accepte les conditions générales</Typography>
            </Stack>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 1,
                backgroundColor: initial.theme,
                '&:hover': { backgroundColor: initial.auth_theme },
                textTransform: 'none',
                py: 1.2,
              }}
            >
              Se connecter
            </Button>

          </Stack>
        </Box>

        {/* Version text at bottom */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 16,
            width: '100%',
            textAlign: 'center',
            color: 'rgba(17,24,39,0.55)',
          }}
        >
          Check Up Data v1.0.0.0
        </Typography>
      </Box>

      {/* Right side - Background gradient for desktop */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          px: 8,
          py: 8,
          color: '#FFFFFF',
          textAlign: 'center',
          background: `linear-gradient(135deg, ${initial.auth_gradient_start} 0%, ${initial.auth_gradient_end} 100%)`,
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 420 }}>
          <Typography variant="h4" fontWeight={700}>
            Welcome back!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Welcome back! We are so happy to have you here. It's great to see you again.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default Login;