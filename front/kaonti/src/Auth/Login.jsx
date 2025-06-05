import { useState, React, useRef, useEffect } from 'react';
import {Link, Stack, Box, TextField, Button, Typography, Checkbox} from "@mui/material";
import axios from '../../config/axios';
import { toast } from 'react-hot-toast';
import { init } from '../../init';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useAuth from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

function Login() {

  let initial = init[0];
  const serverUrl = `${initial.REACT_APP_API_URL}:${initial.REACT_APP_API_PORT}` ;

  //Envoi requete de connexion---------------------------------------------------------------------
  const { setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef =useRef();
  const errRef =useRef();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [email, password]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {

        const response = await axios.post('/',{email, password},
          {
            headers:{'Content-Type': 'application/json'},
            withCredentials: true
          }
        );
      
        const accessToken = response?.data?.accessToken;
        setAuth({ accessToken }); 
        //navigate(from, { replace: true });
        navigate("/tab/home");
    }catch (err){
        if(!err.response) {
          setErrMsg('Le serveur ne repond pas');
        } else if (err.response?.status === 400){
          setErrMsg('Veuillez insérer votre email et mot de passe correctement');
        }else if (err.response?.status === 401){
          setErrMsg('Unauthorized');
        }else {
          setErrMsg('Erreur de connexion');
        }

        //errRef.current.focus();
    }
  }

  //Option de choix d'afficher ou non du mot de passe-----------------------------------------------------------------
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (<Stack alignItems={"center"}
                justifyContent={"center"}
                backgroundColor={initial.theme}
                width={"100vw"}
                height={"48vw"}
                 direction={"column"}
                 display={"inline-flex"} 
          >

          <Stack alignItems={"center"}
                    justifyContent={"center"}
                    width={"28%"}
                    height={"35vw"}
                    display={"inline-block"}
                    backgroundColor={"white"}
                    borderRadius={"2%"}
                    marginTop={"10px"}
                    >
 
            <Box width={"100%"}>
              <form style={{marginTop: 5}} onSubmit={handleSubmit}>
                  <Stack direction={"column"} 
                        gap={3}
                        width={"80%"}
                        alignItems={"center"}
                        paddingLeft={"50px"}
                        justifyContent={"center"}
                        >

                      <img style={{border:'1px solid #FFF',borderRadius: '8px', marginTop:'40px'}} 
                        src='/src/img/Logo Kaonty_2.png' 
                        width={"40px"} 
                        height={"40px"}
                      />

                      <Typography 
                      variant='h4' 
                      marginTop={"-20px"} 
                      paddingLeft={"0px"}
                      fontFamily={"Bahnschrift Condensed"}
                      fontWeight={'light'}
                      >
                        Kaonty
                      </Typography>
                      <Typography 
                      variant='h6' 
                      marginTop={"-25px"} 
                      paddingLeft={"0px"}
                      fontFamily={"Bahnschrift"}
                      fontWeight={'light'}
                      fontSize={"16px"}
                      >
                        Connectez-vous à votre compte
                      </Typography>
                      
                      <TextField ref={userRef}  type='email' onChange={e => setEmail(e.target.value)} id="standard-basic01" label="adresse mail" variant="standard" fullWidth size='small' required/>

                      <FormControl sx={{ m: 1, width: '100%' }} variant="standard">
                        <InputLabel htmlFor="standard-adornment-password" sx={{color:"black"}}>mot de passe</InputLabel>
                        <Input
                          onChange={e => setPassword(e.target.value)}
                          id="standard-adornment-password"
                          type={showPassword ? 'text' : 'password'}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                sx={{backgroundColor:"transparent"}}
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                      <Stack alignItems={'flex-end'}
                            justifyContent={"right"}
                            width={"100%"}
                            marginTop={"-15px"}>
                        <Typography variant='h10' ><Link>mot de passe oublier?</Link></Typography>
                      </Stack>
                      
                      <Button type='submit' variant="contained" sx={{
                        marginTop:5,
                        width: '100%',
                        marginLeft:'0px'
                      }}>Se connecter</Button>

                  </Stack>
                  
                  <Stack alignItems={"center"}
                          justifyContent={"left"}
                          width={"100%"}
                          direction={"row"}
                          paddingTop={"10px"}
                          marginLeft={"40px"}
                          >
                    <Checkbox defaultChecked/>
                    <Typography 
                    variant='h10'
                    fontSize={'14px'}
                    >
                      J'ai lu et j'accepte les conditions générales d'utilisation
                    </Typography>
                    
                  </Stack>
              </form>
            </Box>
          </Stack>


          <Typography 
          variant='h7'
          color={"white"}
          marginTop={"10px"}
          >
            © Kaonti v1.0.0.0
          </Typography>
        </Stack>
  )
};

export default Login
