import { useEffect, useState } from 'react';
import { Typography, Stack, TextField, FormHelperText, Chip, Box, Tab } from '@mui/material';
import { FormControl, FormControlLabel, FormLabel } from "@mui/material";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import CloseIcon from '@mui/icons-material/Close';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import toast from 'react-hot-toast';

import { useFormik } from 'formik';
import * as Yup from "yup";

import { init } from '../../../../init';
import axios from '../../../../config/axios';
import { inputAutoFill } from '../../inputStyle/inputAutoFill';
import roleMapping from '../../../../config/rolesMappin';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import TabDossier from './TabDossier';
import TabPortefeuille from './TabPortefeuille';

let initial = init[0];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
    '& .MuiPaper-root': {
        minHeight: '450px',
    },
}));

const PopupAddSousCompte = ({ selectedRowCompteIds, confirmationState, isRefreshedSousCompte, setIsRefreshedSousCompte, rowSelectedData, listeRoles, listePortefeuille, listeDossier, selectedRow, setSelectedRow, listeCompteDossier, setListeCompteDossier, actionSousCompte, listeComptePortefeuille, setListeComptePortefeuille }) => {
    const editSousCompte = actionSousCompte === 'Ajout';

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [value, setValue] = useState("1");

    const handleClose = () => {
        confirmationState(false);
        setIsRefreshedSousCompte(!isRefreshedSousCompte);
    }

    const getValidationSchema = (action) =>
        Yup.object({
            username: Yup.string()
                .required("Le nom est obligatoire")
                .min(2, "Le nom doit contenir au moins 2 caractères")
                .max(50, "Le nom est trop long"),
            email_add: Yup.string()
                .email("L'email est invalide")
                .required("L'email est obligatoire"),
            password: Yup.string().when([], {
                is: () => action === 'Ajout',
                then: schema =>
                    schema
                        .required("Le mot de passe est obligatoire")
                        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
                        .max(30, "Le mot de passe est trop long")
                        .matches(/[A-Z]/, "Doit contenir une majuscule")
                        .matches(/[a-z]/, "Doit contenir une minuscule")
                        .matches(/[0-9]/, "Doit contenir un chiffre")
                        .matches(/[^a-zA-Z0-9]/, "Doit contenir un caractère spécial"),
                otherwise: schema => schema.notRequired()
            }),
            passwordConfirmation: Yup.string().when([], {
                is: () => action === 'Ajout',
                then: schema =>
                    schema
                        .oneOf([Yup.ref('password'), null], "Les mots de passe ne correspondent pas")
                        .required("Le mot de passe de confirmation est obligatoire"),
                otherwise: schema => schema.notRequired()
            }),
            roles: Yup.string().required("Sélectionnez un rôle"),
        });

    const formData = useFormik({
        validateOnChange: true,
        validateOnBlur: true,
        initialValues: {
            username: !editSousCompte ? selectedRow?.username : '',
            email_add: !editSousCompte ? selectedRow?.email : '',
            password: '',
            passwordConfirmation: '',
            roles: !editSousCompte ? selectedRow?.role_id : '',
            compte_id: selectedRowCompteIds,
        },
        validationSchema: getValidationSchema(actionSousCompte, listePortefeuille.length > 0, listeDossier.length > 0),
        context: {
            hasPortefeuille: listePortefeuille?.length > 0,
            action: actionSousCompte
        },
        onSubmit: (values) => {
            const formattedRoles = {
                [values.roles]: roleMapping[values.roles]
            };

            const dossierIds = listeCompteDossier.map(val => val.id_dossier);
            const portefeuillesIds = listeComptePortefeuille.map(val => val.id_portefeuille);

            axios.post('/sous-compte/addSousCompte', {
                username: values.username,
                email: values.email_add,
                password: values.password,
                role_id: Number(values.roles),
                compte_id: values.compte_id,
                roles: formattedRoles,
                action: actionSousCompte,
                user_id: selectedRow?.id,
                dossier: dossierIds,
                portefeuille: portefeuillesIds,
            })
                .then((response) => {
                    if (response?.data?.state) {
                        setSelectedRow(response?.data?.compte);
                        handleClose();
                        toast.success(response?.data?.message);
                    } else {
                        toast.error(response?.data?.message);
                    }
                })
                .catch((err) => {
                    if (err.response && err.response.data && err.response.data.message) {
                        toast.error(err.response.data.message);
                    } else {
                        toast.error(err.message || "Erreur inconnue");
                    }
                })
        },
    })

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const handleClickShowPasswordConfirmation = () => {
        setShowPasswordConfirmation((show) => !show);
    }

    const handleMouseDownPasswordConfirmation = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPasswordConfirmation = (event) => {
        event.preventDefault();
    };

    const handleChangeTAB = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (editSousCompte) {
            setListeCompteDossier([]);
            setListeComptePortefeuille([]);
        } else {
            setListeCompteDossier(listeCompteDossier);
            setListeComptePortefeuille(listeComptePortefeuille);
        }
    }, [editSousCompte])

    return (
        <form
            onSubmit={formData.handleSubmit}
        >
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={true}
                maxWidth={false}
                PaperProps={{
                    sx: {
                        width: 800,
                    }
                }}
            >

                <DialogTitle
                    id="customized-dialog-title"
                    sx={{
                        ml: 1,
                        p: 2,
                        height: '50px',
                        backgroundColor: 'transparent',
                        boxSizing: 'border-box'
                    }}
                >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                        {
                            editSousCompte === false
                                ?
                                'Modification d\'un sous-compte'
                                :
                                'Ajout d\'un nouvau sous-compte'
                        }
                    </Typography>
                </DialogTitle>

                <IconButton
                    style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent
                    sx={{
                        height: 600
                    }}
                >
                    <TabContext
                        value={value}
                    >
                        <Box
                            sx={{
                                padding: 0,
                                marginTop: -2
                            }}
                        >
                            <TabList onChange={handleChangeTAB} aria-label="lab API tabs example" variant='scrollable'>
                                <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="Compte" value="1" />
                                <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="Portefeuille" value="2" />
                                <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="Dossier" value="3" />
                            </TabList>
                            <TabPanel
                                value="1"
                                sx={{
                                    padding: 2
                                }}
                            >
                                <Stack
                                    alignItems={'left'}
                                    direction={"column"}
                                    spacing={2}
                                    style={{
                                        marginLeft: '0px',
                                        marginTop: '10px'
                                    }}
                                >
                                    <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                                        <label style={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                            Nom du compte
                                        </label>
                                        <TextField
                                            size="small"
                                            name="nom-sous-compte"
                                            fullWidth
                                            variant="outlined"
                                            disabled={true}
                                            value={rowSelectedData?.nom}
                                            sx={{
                                                ...inputAutoFill,
                                                '& .MuiOutlinedInput-root': {
                                                    height: 32,
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    padding: '4px 6px',
                                                    fontSize: 13,
                                                },
                                            }}
                                        />
                                    </Stack>

                                    <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                                        <label style={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                            Nom d'utilisateur
                                        </label>
                                        <TextField
                                            size="small"
                                            name="username"
                                            fullWidth
                                            variant="outlined"
                                            required
                                            value={formData.values.username}
                                            onChange={formData.handleChange}
                                            onBlur={formData.handleBlur}
                                            error={Boolean(formData.touched.username && formData.errors.username)}
                                            helperText={formData.touched.username && formData.errors.username}
                                            sx={{
                                                ...inputAutoFill,
                                                '& .MuiOutlinedInput-root': {
                                                    height: 32,
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    padding: '4px 6px',
                                                    fontSize: 13,
                                                },
                                            }}
                                        />
                                    </Stack>

                                    <input
                                        type="text"
                                        name="fake_email"
                                        autoComplete="username"
                                        style={{ display: "none" }}
                                    />

                                    <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                                        <label style={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                            Email
                                        </label>
                                        <TextField
                                            size="small"
                                            name="email_add"
                                            fullWidth
                                            variant="outlined"
                                            required
                                            value={formData.values.email_add ?? ""}
                                            onChange={formData.handleChange}
                                            onBlur={formData.handleBlur}
                                            error={Boolean(formData.touched.email_add && formData.errors.email_add)}
                                            helperText={formData.touched.email_add && formData.errors.email_add}
                                            autoComplete="new-email"
                                            sx={{
                                                ...inputAutoFill,
                                                '& .MuiOutlinedInput-root': {
                                                    height: 32,
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    padding: '4px 6px',
                                                    fontSize: 13,
                                                },
                                            }}
                                        />
                                    </Stack>

                                    <input
                                        type="password"
                                        name="fake_password"
                                        autoComplete="new-password"
                                        style={{ display: "none" }}
                                    />

                                    <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                                        <label style={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                            Mot de passe
                                        </label>
                                        <TextField
                                            size="small"
                                            name="password"
                                            fullWidth
                                            variant="outlined"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.values.password || ""}
                                            onChange={formData.handleChange}
                                            onBlur={formData.handleBlur}
                                            error={Boolean(formData.touched.password && formData.errors.password)}
                                            helperText={formData.touched.password && formData.errors.password}
                                            autoComplete="new-password"
                                            InputProps={{
                                                style: {
                                                    pointerEvents: !editSousCompte ? 'none' : 'auto'
                                                },
                                                readOnly: !editSousCompte,
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
                                            sx={{
                                                ...inputAutoFill,
                                                '& .MuiOutlinedInput-root': {
                                                    height: 32,
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    padding: '4px 6px',
                                                    fontSize: 13,
                                                },
                                            }}
                                        />
                                    </Stack>

                                    <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                                        <label style={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                            Confirmation du mot de passe
                                        </label>
                                        <TextField
                                            size="small"
                                            name="passwordConfirmation"
                                            fullWidth
                                            variant="outlined"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            required
                                            value={formData.values.passwordConfirmation || ""}
                                            onChange={formData.handleChange}
                                            onBlur={formData.handleBlur}
                                            error={Boolean(formData.touched.passwordConfirmation && formData.errors.passwordConfirmation)}
                                            helperText={formData.touched.passwordConfirmation && formData.errors.passwordConfirmation}
                                            InputProps={{
                                                style: {
                                                    pointerEvents: !editSousCompte ? 'none' : 'auto'
                                                },
                                                readOnly: !editSousCompte,
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label={showPasswordConfirmation ? 'hide password' : 'show password'}
                                                            onClick={handleClickShowPasswordConfirmation}
                                                            onMouseDown={handleMouseDownPasswordConfirmation}
                                                            onMouseUp={handleMouseUpPasswordConfirmation}
                                                        >
                                                            {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                ...inputAutoFill,
                                                '& .MuiOutlinedInput-root': {
                                                    height: 32,
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    padding: '4px 6px',
                                                    fontSize: 13,
                                                },
                                            }}
                                        />
                                    </Stack>

                                    <FormControl
                                        component="fieldset"
                                        size="small"
                                        fullWidth
                                        style={{ width: "100%" }}
                                        error={Boolean(formData.touched.roles && formData.errors.roles)}
                                    >
                                        <FormLabel component="legend" style={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                            Rôle de l'utilisateur
                                        </FormLabel>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            useFlexGap
                                            flexWrap="wrap"
                                            sx={{ mt: 1 }}
                                            onBlur={() => formData.setFieldTouched("roles", true)}
                                        >
                                            {listeRoles.map((role) => {
                                                const isSelected = String(formData.values.roles || '') === String(role.id);

                                                return (
                                                    <Chip
                                                        key={role.id}
                                                        label={role.nom}
                                                        size="small"
                                                        clickable
                                                        onClick={() => {
                                                            formData.setFieldValue("roles", String(role.id));
                                                            formData.setFieldTouched("roles", true);
                                                        }}
                                                        variant={isSelected ? 'filled' : 'outlined'}
                                                        color={isSelected ? 'primary' : 'default'}
                                                        sx={{
                                                            fontSize: 12,
                                                            height: 26,
                                                            '& .MuiChip-label': { px: 1 }
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                        {formData.touched.roles && formData.errors.roles && (
                                            <FormHelperText
                                                style={{
                                                    marginLeft: 0,
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {formData.errors.roles}
                                            </FormHelperText>
                                        )}
                                    </FormControl>

                                </Stack>
                            </TabPanel>
                            <TabPanel
                                value="2"
                                sx={{
                                    padding: 2
                                }}
                            >
                                <TabPortefeuille
                                    listeComptePortefeuille={listeComptePortefeuille}
                                    listePortefeuille={listePortefeuille}
                                    setListeComptePortefeuille={setListeComptePortefeuille}
                                />
                            </TabPanel>
                            <TabPanel
                                value="3"
                                sx={{
                                    padding: 2
                                }}
                            >
                                <TabDossier
                                    listeCompteDossier={listeCompteDossier}
                                    listeDossier={listeDossier}
                                    setListeCompteDossier={setListeCompteDossier}
                                />
                            </TabPanel>
                        </Box>
                    </TabContext>
                </DialogContent>

                <DialogActions>
                    <Button autoFocus
                        variant='outlined'
                        style={{
                            backgroundColor: "transparent",
                            color: initial.theme,
                            width: "100px",
                            textTransform: 'none',
                            outline: 'none',
                        }}
                        onClick={handleClose}
                    >
                        Annuler
                    </Button>
                    <Button autoFocus
                        type="submit"
                        onClick={formData.handleSubmit}
                        style={{ backgroundColor: initial.add_new_line_bouton_color, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                    >
                        {`${editSousCompte === false ? 'Modifier' : 'Ajouter'}`}
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </form>
    )
}

export default PopupAddSousCompte