import { useState } from 'react';
import { Link, Stack, Box, TextField, Button, Typography, Checkbox } from "@mui/material";
import axios from '../../config/axios';
import { init } from '../../init';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from "@mui/material";
import toast from 'react-hot-toast';

import { useFormik } from 'formik';

const Login = () => {
  let initial = init[0];

  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  //Envoi requete de connexion
  const { setAuth } = useAuth();

  //Option de choix d'afficher ou non du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  // const validationSchema = Yup.object({
  //     email:
  //         Yup.string().required("L'adresse email est obligatoire")
  //             .email("L'adresse email n'est pas valide"),
  //     password: Yup.string().required("Le mot de passe est obligatoire"),
  // })

  const formData = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    // validationSchema,

    onSubmit: async (values) => {
      try {
        const response = await axios.post('/', { email: values.email, password: values.password },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          }
        );
        const accessToken = response?.data?.accessToken;
        setAuth({ accessToken });
        navigate("/tab/home");
      } catch (err) {
        if (!err.response) {
          toast.error('Le serveur ne repond pas');
        } else if (err.response?.status === 400) {
          toast.error('Veuillez insérer votre email et mot de passe correctement');
        } else if (err.response?.status === 401) {
          toast.error('Unauthorized');
        } else {
          toast.error('Erreur de connexion');
        }
      }
    }
  })

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      style={{
        backgroundColor: initial.theme,
        width: '100vw',
        height: '100vh',
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        width={isMobile ? '80%' : '400px'}
        maxWidth="90vw"
        bgcolor="white"
        borderRadius={2}
        boxShadow={3}
        py={4}
        px={3}
        mt={2}
      >
        <Box width="100%">
          <form onSubmit={formData.handleSubmit}>
            <Stack
              direction="column"
              spacing={3}
              alignItems="center"
              justifyContent="center"
            >
              <img
                src="/src/img/Logo Kaonty_2.png"
                alt="Logo Kaonty"
                style={{
                  border: '1px solid #FFF',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  marginTop: '10px'
                }}
              />

              <Typography
                variant="h4"
                fontFamily="Bahnschrift Condensed"
                fontWeight="light"
                color="rgba(112, 112, 112, 0.96)"
                mt={-1}
              >
                Kaonty
              </Typography>

              <Typography
                variant="body1"
                fontFamily="Bahnschrift"
                fontWeight="light"
                fontSize="16px"
                color="rgba(192, 190, 190, 0.96)"
                mt={-2}
              >
                Connectez-vous à votre compte
              </Typography>

              <TextField
                type="email"
                name="email"

                value={formData.values.email}
                onChange={formData.handleChange}
                // onBlur={formData.handleBlur}
                // error={Boolean(formData.touched.email && formData.errors.email)}
                // helperText={formData.touched.email && formData.errors.email}

                label="Adresse mail"
                variant="standard"
                fullWidth
                size="small"
                required
              />

              <FormControl variant="standard" fullWidth>
                <TextField
                  id="standard-adornment-password"
                  label="Mot de passe"
                  variant="standard"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  fullWidth
                  required

                  value={formData.values.password}
                  onChange={formData.handleChange}
                  // onBlur={formData.handleBlur}
                  // error={Boolean(formData.touched.password && formData.errors.password)}
                  // helperText={formData.touched.password && formData.errors.password}

                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'hide password' : 'show password'}
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          onMouseUp={handleMouseUpPassword}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <Stack alignItems="flex-end" width="100%" mt={-1}>
                <Typography variant="caption">
                  <Link
                    href="#"
                    sx={{
                      textDecoration: 'none',
                      color: 'rgba(0, 34, 107, 0.81)',
                      '&:hover': {
                        color: 'rgba(8, 55, 157, 0.81)',
                        textDecoration: 'none',
                      },
                    }}
                  >
                    Mot de passe oublié ?
                  </Link>
                </Typography>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 1 }}
                style={{
                  textTransform: 'none',
                  outline: 'none',
                }}
              >
                Se connecter
              </Button>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="flex-start" mt={2}>
              <Checkbox defaultChecked />
              <Typography
                variant="body2"
                fontSize="14px"
                color="rgba(0, 0, 0, 0.96)"
              >
                J'ai lu et j'accepte les conditions générales d'utilisation
              </Typography>
            </Stack>
          </form>
        </Box>
      </Stack>

      <Typography variant="caption" color="white" mt={2}>
        © Kaonty v1.0.0.0
      </Typography>
    </Stack>
  );
}

export default Login