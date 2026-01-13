import { Stack, InputAdornment, FormControl, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { init } from '../../../../init';
import { useEffect, useRef, useState } from 'react';
import { inputAutoFill } from '../../inputStyle/inputAutoFill';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useAxiosPrivate from '../../../../config/axiosPrivate';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../config/axios';

let initial = init[0];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: '470px',
        maxWidth: '470px',
    },
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));


const PopupConfirmPasswordDossier = ({ onClose, id_dossier }) => {
    const { auth } = useAuth();
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const [motDePasse, setMotDePasse] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleCloseDeleteModel = () => {
        onClose();
    }

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const decoded = auth?.accessToken
        ? jwtDecode(auth.accessToken)
        : undefined

    const userId = decoded.UserInfo.userId || null;

    const handleSubmit = () => {
        const payload = {
            motDePasse,
            id_dossier,
            user_id: userId
        }
        axios.post('/home/verifyFilePassword', payload)
            .then((response) => {
                const data = response?.data;
                if (data?.state) {
                    navigate(`/tab/dashboard/${id_dossier}`);
                    sessionStorage.setItem("fileId", id_dossier);
                    handleCloseDeleteModel();
                } else {
                    toast.error(data?.message)
                }
            })
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <BootstrapDialog
            onClose={handleCloseDeleteModel}
            aria-labelledby="customized-dialog-title"
            open={true}
            fullWidth={true}
        >
            <DialogTitle sx={{ m: 0, p: 2, fontSize: 16 }} id="customized-dialog-title" style={{ fontWeight: 'bold', height: '40px', backgroundColor: 'transparent' }}>
                Veuillez entrer le mot de passe de ce dossier
            </DialogTitle>

            <IconButton
                style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                aria-label="close"
                onClick={handleCloseDeleteModel}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent >
                <Stack width={"100%"} spacing={0} alignItems={'center'} alignContent={"center"}
                    direction={"column"} justifyContent={"center"}>
                    <FormControl size="small" fullWidth style={{ width: '100%', marginTop: '10px' }}>
                        <TextField
                            inputRef={inputRef}
                            size="small"
                            label="Mot de passe du dossier"
                            fullWidth
                            variant='standard'
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={motDePasse}
                            onChange={(e) => {
                                setMotDePasse(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            InputProps={{
                                style: {
                                    fontSize: '13px',
                                    padding: '2px 4px',
                                    height: '30px',
                                },
                                sx: {
                                    '& input': {
                                        height: '30px',
                                    },
                                },
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
                            InputLabelProps={{
                                style: {
                                    fontSize: '13px',
                                    marginTop: '-2px',
                                },
                            }}
                            sx={{
                                ...inputAutoFill
                            }}
                        />
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleSubmit}
                    style={{ backgroundColor: initial.theme, color: 'white', width: "80px", textTransform: 'none', outline: 'none' }}
                >
                    Vérifier
                </Button>
            </DialogActions>
        </BootstrapDialog>
    )
}

export default PopupConfirmPasswordDossier;