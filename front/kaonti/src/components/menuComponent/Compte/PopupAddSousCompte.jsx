import { useState } from 'react';
import { Typography, Stack, TextField, FormHelperText, RadioGroup, Radio, Autocomplete } from '@mui/material';
import { FormControl, FormControlLabel, Checkbox, FormLabel } from "@mui/material";
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

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { init } from '../../../../init';
import axios from '../../../../config/axios';
import { inputAutoFill } from '../../inputStyle/inputAutoFill';
import roleMapping from '../../../../config/rolesMappin';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

let initial = init[0];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
    // '& .MuiPaper-root': {
    //     minHeight: '370px',
    // },
    '& .MuiPaper-root': {
        minHeight: '350px',
    },
}));

const PopupAddSousCompte = ({ selectedRowCompteIds, confirmationState, isRefreshedSousCompte, setIsRefreshedSousCompte, rowSelectedData, listeRoles, listePortefeuille, listeDossier, selectedRow, setSelectedRow, listeCompteDossier, actionSousCompte }) => {
    const editSousCompte = actionSousCompte === 'Ajout';

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const handleClose = () => {
        confirmationState(false);
        setIsRefreshedSousCompte(!isRefreshedSousCompte);
    }

    const getValidationSchema = (action, hasPortefeuille, hasDossier) =>
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
            portefeuille: Yup.array().when([], {
                is: () => hasPortefeuille,
                then: schema => schema.min(1, "Sélectionnez un portefeuille").required("Sélectionnez un portefeuille"),
                otherwise: schema => schema.notRequired()
            }),
            dossier: Yup.array().when([], {
                is: () => hasDossier,
                then: schema => schema.min(1, "Sélectionnez un dossier").required("Sélectionnez un dossier"),
                otherwise: schema => schema.notRequired()
            }),
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
            portefeuille: !editSousCompte ? listePortefeuille.filter(p =>
                selectedRow?.id_portefeuille?.map(Number).includes(p.id)
            ) : [],
            dossier: !editSousCompte ? listeDossier.filter(d =>
                listeCompteDossier.some(cd => cd.id_dossier === d.id)
            ) : []
        },
        validationSchema: getValidationSchema(actionSousCompte, listePortefeuille.length > 0, listeDossier.length > 0),
        context: {
            hasPortefeuille: listePortefeuille?.length > 0,
            hasDossier: listeDossier?.length > 0,
            action: actionSousCompte
        },
        onSubmit: (values) => {
            const formattedRoles = {
                [values.roles]: roleMapping[values.roles]
            };

            const portefeuilleIds = values.portefeuille.map(val => val.id);
            const dossierIds = values.dossier.map(val => val.id);

            axios.post('/sous-compte/addSousCompte', {
                username: values.username,
                email: values.email_add,
                password: values.password,
                role_id: Number(values.roles),
                compte_id: values.compte_id,
                roles: formattedRoles,
                portefeuille: portefeuilleIds,
                dossier: dossierIds,
                action: actionSousCompte,
                user_id: selectedRow?.id
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

    return (
        <form
            onSubmit={formData.handleSubmit}
        >
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={true}
                PaperProps={{
                    sx: {
                        width: 800,
                        // maxWidth: '500px',
                    }
                }}
                fullWidth={true}
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
                        {editSousCompte === false ? 'Modification d\'une sous-compte' : 'Ajout d\'une nouvelle sous-compte'}
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

                <DialogContent>
                    <Stack alignItems={'left'}
                        direction={"column"} spacing={2} style={{ marginLeft: '0px' }}
                    >

                        <FormControl size="small" fullWidth style={{ width: '100%' }}>
                            <TextField
                                size="small"
                                name="nom-sous-compte"
                                label="Nom du compte"
                                fullWidth
                                variant='standard'
                                disabled={true}
                                value={rowSelectedData?.nom}
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

                        <FormControl size="small" fullWidth style={{ width: '100%' }}>
                            <TextField
                                size="small"
                                name="username"
                                label="Nom d'utilisateur"
                                fullWidth
                                variant='standard'
                                required
                                value={formData.values.username}
                                onChange={formData.handleChange}
                                onBlur={formData.handleBlur}
                                error={Boolean(formData.touched.username && formData.errors.username)}
                                helperText={formData.touched.username && formData.errors.username}
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

                        <input
                            type="text"
                            name="fake_email"
                            autoComplete="username"
                            style={{ display: "none" }}
                        />

                        <FormControl size="small" fullWidth>
                            <TextField
                                size="small"
                                label="Email"
                                name="email_add"
                                fullWidth
                                variant="standard"
                                required
                                value={formData.values.email_add ?? ""}
                                onChange={formData.handleChange}
                                onBlur={formData.handleBlur}
                                error={Boolean(formData.touched.email_add && formData.errors.email_add)}
                                helperText={formData.touched.email_add && formData.errors.email_add}
                                autoComplete="new-email"
                                InputProps={{
                                    style: { fontSize: "13px", padding: "2px 4px", height: "30px" },
                                    sx: { "& input": { height: "30px" } },
                                }}
                                InputLabelProps={{
                                    style: { fontSize: "13px", marginTop: "-2px" },
                                }}
                            />
                        </FormControl>

                        <input
                            type="password"
                            name="fake_password"
                            autoComplete="new-password"
                            style={{ display: "none" }}
                        />

                        <FormControl size="small" fullWidth style={{ width: '100%' }}>
                            <TextField
                                size="small"
                                label="Mot de passe"
                                name="password"
                                fullWidth
                                variant='standard'
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
                                        fontSize: '13px',
                                        padding: '2px 4px',
                                        height: '30px',
                                        pointerEvents: !editSousCompte ? 'none' : 'auto'
                                    },
                                    sx: {
                                        '& input': {
                                            height: '30px',
                                        },
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

                        <FormControl size="small" fullWidth style={{ width: '100%' }}>
                            <TextField
                                size="small"
                                label="Confirmation du mot de passe"
                                name="passwordConfirmation"
                                fullWidth
                                variant='standard'
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                required
                                value={formData.values.passwordConfirmation || ""}
                                onChange={formData.handleChange}
                                onBlur={formData.handleBlur}
                                error={Boolean(formData.touched.passwordConfirmation && formData.errors.passwordConfirmation)}
                                helperText={formData.touched.passwordConfirmation && formData.errors.passwordConfirmation}
                                InputProps={{
                                    style: {
                                        fontSize: '13px',
                                        padding: '2px 4px',
                                        height: '30px',
                                        pointerEvents: !editSousCompte ? 'none' : 'auto'
                                    },
                                    sx: {
                                        '& input': {
                                            height: '30px',
                                        },
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

                        <FormControl
                            component="fieldset"
                            size="small"
                            fullWidth
                            style={{ width: "100%" }}
                            error={Boolean(formData.touched.roles && formData.errors.roles)}
                        >
                            <FormLabel component="legend" style={{ fontSize: "13px" }}>
                                Rôle de l'utilisateur
                            </FormLabel>
                            <RadioGroup
                                row
                                name="roles"
                                value={formData.values.roles || ""}
                                onChange={(e) => {
                                    formData.setFieldValue("roles", e.target.value)
                                }
                                }
                                onBlur={() => formData.setFieldTouched("roles", true)}
                            >
                                {listeRoles.map((role) => (
                                    <FormControlLabel
                                        // disabled={!editSousCompte}
                                        key={role.id}
                                        value={role.id}
                                        control={<Radio size="small" />}
                                        label={role.nom}
                                        sx={{ "& .MuiFormControlLabel-label": { fontSize: "13px" } }}
                                    />
                                ))}
                            </RadioGroup>
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

                        <FormControl
                            component="fieldset"
                            size="small"
                            fullWidth
                            style={{ width: "100%" }}
                            error={Boolean(formData.touched.portefeuille && formData.errors.portefeuille)}
                        >
                            <Autocomplete
                                // disabled={!editSousCompte}
                                multiple
                                id="checkboxes-tags-demo-portefeuille"
                                options={listePortefeuille}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.nom}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={(_event, newValue) => {
                                    formData.setFieldValue("portefeuille", newValue);
                                }}
                                value={formData.values.portefeuille || []}
                                renderOption={(props, option, { selected }) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                        <li
                                            key={key}
                                            {...optionProps}
                                            style={{
                                                paddingTop: 2,
                                                paddingBottom: 2,
                                                paddingLeft: 4,
                                                paddingRight: 4,
                                                fontSize: "0.8rem",
                                                display: "flex",
                                                alignItems: "center"
                                            }}
                                        >
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option.nom}
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label="Portefeuille"
                                        InputLabelProps={{
                                            style: { fontSize: "13px", marginTop: "-2px" },
                                        }}
                                    />
                                )}
                            />

                            {formData.touched.portefeuille && formData.errors.portefeuille && (
                                <FormHelperText
                                    style={{
                                        marginLeft: 0,
                                        fontSize: "12px",
                                    }}
                                >
                                    {formData.errors.portefeuille}
                                </FormHelperText>
                            )}
                        </FormControl>

                        <FormControl
                            component="fieldset"
                            size="small"
                            fullWidth
                            style={{ width: "100%" }}
                            error={Boolean(formData.touched.dossier && formData.errors.dossier)}
                        >
                            <Autocomplete
                                // disabled={!editSousCompte}
                                multiple
                                id="checkboxes-tags-demo-dossier"
                                options={listeDossier}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.dossier}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={(_event, newValue) => {
                                    formData.setFieldValue("dossier", newValue);
                                }}
                                value={formData.values.dossier || []}
                                renderOption={(props, option, { selected }) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                        <li
                                            key={key}
                                            {...optionProps}
                                            style={{
                                                paddingTop: 2,
                                                paddingBottom: 2,
                                                paddingLeft: 4,
                                                paddingRight: 4,
                                                fontSize: "0.8rem",
                                                display: "flex",
                                                alignItems: "center"
                                            }}
                                        >
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option.dossier}
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label="Dossier"
                                        InputLabelProps={{
                                            style: { fontSize: "13px", marginTop: "-2px" },
                                        }}
                                    />
                                )}
                            />

                            {formData.touched.dossier && formData.errors.dossier && (
                                <FormHelperText
                                    style={{
                                        marginLeft: 0,
                                        fontSize: "12px",
                                    }}
                                >
                                    {formData.errors.dossier}
                                </FormHelperText>
                            )}
                        </FormControl>

                    </Stack>
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
                        style={{ backgroundColor: initial.theme, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                    >
                        {`${editSousCompte === false ? 'Modifier' : 'Ajouter'}`}
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </form>
    )
}

export default PopupAddSousCompte