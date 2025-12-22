import { useState } from 'react';
import { Stack, Typography, TextField, FormControl, Button } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import toast from 'react-hot-toast';
import axios from '../../../../../config/axios';

const PasswordConfirmForm = ({ onPasswordMatch, passwordVerification, setPasswordVerification, id_compte, setIsPassWordVerified, setCodeSent, setIsCodeVerified }) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const verifyPassword = () => {
        axios.post(`/sous-compte/matchPassword/${id_compte}`, {
            password: passwordVerification
        })
            .then((response) => {
                if (response?.data?.state) {
                    setIsPassWordVerified(true);
                    onPasswordMatch();
                } else {
                    toast.error(response?.data?.message);
                    setIsPassWordVerified(false);
                    setCodeSent(false);
                    setIsCodeVerified(false);
                }
            })
            .catch((err) => {
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error(err.message || "Erreur inconnue");
                }
            })
    }

    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            <Typography variant="body1">
                Veuillez entrer votre mot de passe s'il vous plaît :
            </Typography>
            <FormControl variant="standard" fullWidth>
                <Stack direction={'row'} alignItems={'end'} spacing={1}>
                    <Stack
                        style={{
                            width: '80%'
                        }}
                    >
                        <TextField
                            type={showPassword ? 'text' : 'password'}
                            label="Mot de passe actuel"
                            variant="standard"
                            value={passwordVerification}
                            onChange={(e) => setPasswordVerification(e.target.value)}
                            fullWidth
                            required
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
                    </Stack>
                    <Stack
                        style={{
                            width: '20%'
                        }}
                    >
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            style={{
                                textTransform: 'none',
                                outline: 'none',
                                height: 35
                            }}
                            onClick={verifyPassword}
                        >
                            Vérifier
                        </Button>
                    </Stack>
                </Stack>
            </FormControl>
        </Stack>
    );
};

export default PasswordConfirmForm;
