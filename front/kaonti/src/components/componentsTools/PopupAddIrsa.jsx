import React, { useState, useEffect } from 'react';
import {
    Box, Button, IconButton, Stack, Tooltip, Menu, MenuItem, Modal,
    Typography, Divider, TextField, Select, Paper, Card, CardActionArea,
    CardContent, Tab, FormControl, InputLabel, Grid, Dialog, DialogTitle,
    DialogContent, DialogActions, styled
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormatedInput from './FormatedInput';
import axios from '../../../config/axios';
import toast from 'react-hot-toast';
import Autocomplete from '@mui/material/Autocomplete';
import { init } from '../../../init';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const PopupAddIrsa = ({ confirmationState, mois, annee, setIsRefresh, row = null, onAddIrsa, onEditIrsa, id_compte, id_dossier, id_exercice }) => {

    const initial = init[0];
    console.log(mois, annee);
    const [nbrEnfant, setNbrEnfant] = useState(0);
    const [personnels, setPersonnels] = useState([]);
    
    const menuProps = {
        PaperProps: {
            style: {
                minWidth: 250, // Largeur minimum du menu déroulant
            },
        },
    };

    const handleClose = () => {
        confirmationState(false);
    }
    const formDataFormik = useFormik({
        initialValues: row ? {
            personnel_id: row.personnel_id || row.personnelId || '',
            matricule: row.matricule || row.personnel?.matricule || row.personnel_matricule || '',
            salaireBase: row.salaireBase ?? '0.00',
            heuresSupp: row.heuresSupp ?? '0.00',
            primeGratification: row.primeGratification ?? '0.00',
            autres: row.autres ?? '0.00',
            salaireBrut: row.salaireBrut ?? '',
            cnapsRetenu: row.cnapsRetenu ?? '',
            ostie: row.ostie ?? '',
            salaireNet: row.salaireNet ?? '',
            autreDeduction: row.autreDeduction ?? '0.00',
            montantImposable: row.montantImposable ?? '0.00',
            impotCorrespondant: row.impotCorrespondant ?? '0.00',
            impotDu: row.impotDu ?? '0.00',
            indemniteImposable: row.indemniteImposable ?? '0.00',
            indemniteNonImposable: row.indemniteNonImposable ?? '0.00',
            avantageImposable: row.avantageImposable ?? '0.00',
            avantageExonere: row.avantageExonere ?? '0.00',
            nombre_enfants_charge: row.nombre_enfants_charge ?? nbrEnfant,
            reductionChargeFamille: row.reductionChargeFamille ?? nbrEnfant * 2000,
            mois: row.mois ?? mois,
            annee: row.annee ?? annee,
        } : {
            personnel_id: '',
            matricule: '',
            salaireBase: '0.00',
            heuresSupp: '0.00',
            primeGratification: '0.00',
            autres: '0.00',
            salaireBrut: '',
            cnapsRetenu: '',
            ostie: '',
            salaireNet: '',
            autreDeduction: '0.00',
            montantImposable: '0.00',
            impotCorrespondant: '0.00',
            impotDu: '0.00',
            indemniteImposable: '0.00',
            indemniteNonImposable: '0.00',
            avantageImposable: '0.00',
            avantageExonere: '0.00',
            nombre_enfants_charge: '0',
            reductionChargeFamille: '0',
            mois: mois,
            annee: annee,
            id_compte: id_compte,
            id_dossier: id_dossier,
            id_exercice: id_exercice,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            personnel_id: Yup.string().required("Veuillez sélectionner un personnel."),
            salaireBase: Yup.string()
                .required('Salaire obligatoire')
                .test('non-zero', 'Veuillez entrer un salaire de base', v => parseFloat(v || '0') > 0),
            // heuresSupp: Yup.string()
            //     .required('Heures supplémentaires obligatoires')
            //     .test('non-zero', 'Veuillez entrer des heures supplémentaires', v => parseFloat(v || '0') > 0),
            // primeGratification: Yup.string()
            //     .required('Prime/gratification obligatoire')
            //     .test('non-zero', 'Veuillez entrer une prime/gratification', v => parseFloat(v || '0') > 0),
            // autres: Yup.string()
            //     .required('Autres obligatoire')
            //     .test('non-zero', 'Veuillez entrer des autres', v => parseFloat(v || '0') > 0),
            // indemniteImposable: Yup.string()
            //     .required('Indemnité imposable obligatoire')
            //     .test('non-zero', 'Veuillez entrer une indemnite imposable', v => parseFloat(v || '0') > 0),
            // indemniteNonImposable: Yup.string()
            //     .required('Indemnité non imposable obligatoire')
            //     .test('non-zero', 'Veuillez entrer une indemnite non imposable', v => parseFloat(v || '0') > 0),
            // avantageImposable: Yup.string()
            //     .required('Avantage imposable obligatoire')
            //     .test('non-zero', 'Veuillez entrer un avantage imposable', v => parseFloat(v || '0') > 0),
            // avantageExonere: Yup.string()
            //     .required('Avantage exonéré obligatoire')
            //     .test('non-zero', 'Veuillez entrer un avantage exonéré', v => parseFloat(v || '0') > 0),
            mois: Yup.number()
                .min(1, "Le mois doit être entre 1 et 12.")
                .max(12, "Le mois doit être entre 1 et 12.")
                .required("Veuillez sélectionner un mois."),
            annee: Yup.number()
                .min(2000, "L'année doit être supérieure à 2000.")
                .max(2100, "L'année doit être inférieure à 2100.")
                .required("Veuillez sélectionner une année."),
        }),
        onSubmit: (values) => {
            handleSubmitForm();
        },
    });

    const gerNombreEnfant = (id) => {
        axios.get(`/administration/personnel/${id}`).then(res => {
            if (res.data.state) {
                const nbEnfants = res.data.data.nombre_enfants_charge || 0;
                setNbrEnfant(nbEnfants); // optionnel pour affichage externe
                formDataFormik.setFieldValue('nombre_enfants_charge', nbEnfants);
                formDataFormik.setFieldValue('reductionChargeFamille', nbEnfants * 2000);
            }
        });
    };

    const handleSubmitForm = async () => {
        const selectedPersonnel = personnels.find(p => p.id === Number(formDataFormik.values.personnel_id));
        const dataToSend = {
            // Envoyer à la fois l'id et le matricule pour compatibilité backend
            personnelId: selectedPersonnel?.id,
            matricule: formDataFormik.values.matricule || selectedPersonnel?.matricule || null,
            indemniteImposable: Number(formDataFormik.values.indemniteImposable),
            indemniteNonImposable: Number(formDataFormik.values.indemniteNonImposable),
            avantageImposable: Number(formDataFormik.values.avantageImposable),
            avantageExonere: Number(formDataFormik.values.avantageExonere),
            salaireBase: Number(formDataFormik.values.salaireBase),
            heuresSupp: Number(formDataFormik.values.heuresSupp),
            primeGratification: Number(formDataFormik.values.primeGratification),
            autres: Number(formDataFormik.values.autres),
            salaireBrut: Number(formDataFormik.values.salaireBrut),
            cnapsRetenu: Number(formDataFormik.values.cnapsRetenu),
            ostie: Number(formDataFormik.values.ostie),
            salaireNet: Number(formDataFormik.values.salaireNet),
            autreDeduction: Number(formDataFormik.values.autreDeduction),
            montantImposable: Number(formDataFormik.values.montantImposable),
            impotCorrespondant: Number(formDataFormik.values.impotCorrespondant),
            reductionChargeFamille: Number(formDataFormik.values.reductionChargeFamille),
            impotDu: Number(formDataFormik.values.impotDu),
            mois: Number(formDataFormik.values.mois),
            annee: Number(formDataFormik.values.annee),
            id_compte: Number(formDataFormik.values.id_compte),
            id_dossier: Number(formDataFormik.values.id_dossier),
            id_exercice: Number(formDataFormik.values.id_exercice),
        };
        try {
            let res;
            if (row && row.id > 0) {
                // Modification : PUT
                res = await axios.put(`/irsa/irsa/${row.id}`, dataToSend);
                if (res.data.state) {
                    toast.success("Modification réussie !");
                    if (onEditIrsa) {
                        // On attend que l'API renvoie la ligne modifiée, sinon on reconstruit localement
                        const updatedRow = { ...row, ...dataToSend, id: row.id };
                        onEditIrsa(updatedRow);
                    }
                } else {
                    toast.error("Erreur lors de la modification");
                    return;
                }
            } else {
                // Ajout : POST
                res = await axios.post('/irsa/irsa', dataToSend);
                if (res.data.state) {
                    toast.success("Ajout réussi !");
                    if (onAddIrsa) {
                        // On attend que l'API renvoie la nouvelle ligne, sinon on reconstruit localement
                        const newRow = { ...dataToSend, id: res.data.id || Date.now() };
                        onAddIrsa(newRow);
                    }
                } else {
                    toast.error("Erreur lors de l'ajout");
                    return;
                }
            }
        } catch (e) {
            toast.error("Erreur serveur");
        }
        handleClose();
    }

    useEffect(() => {
        axios.get(`/administration/personnel/${id_compte}/${id_dossier}`)
            .then(res => {
                if (res.data.state) setPersonnels(res.data.list);
                else setPersonnels([]);
            })
            .catch(() => setPersonnels([]));
    }, []);
    
    useEffect(() => {
        if (
            personnels.length > 0 &&
            formDataFormik.values.personnel_id &&
            !personnels.find(p => p.id === Number(formDataFormik.values.personnel_id))
        ) {
            // Si la valeur n'existe plus dans la liste, on la réinitialise à vide
            formDataFormik.setFieldValue('personnel_id', '');
        }
    }, [personnels, formDataFormik.values.personnel_id]);

    // Quand personnel_id change, on récupère les infos associées (par exemple via API)
    useEffect(() => {
        if (formDataFormik.values.personnel_id) {
            gerNombreEnfant(formDataFormik.values.personnel_id);
        }
    }, [formDataFormik.values.personnel_id]);

    const [salaireBase, setSalaireBase] = useState('0.00');
    const [salaireBrut, setSalaireBrut] = useState('0.00');
    const [cnapsRetenu, setCnapsRetenu] = useState('0.00');
    const [ostie, setOstie] = useState('0.00');
    const [salaireNet, setSalaireNet] = useState('0.00');

    useEffect(() => {
        const base = parseFloat(formDataFormik.values.salaireBase) || 0;
        const supp = parseFloat(formDataFormik.values.heuresSupp) || 0;
        const prime = parseFloat(formDataFormik.values.primeGratification) || 0;
        const autres = parseFloat(formDataFormik.values.autres) || 0;
        const indemnite = parseFloat(formDataFormik.values.indemniteImposable) || 0;
        const avantage = parseFloat(formDataFormik.values.avantageImposable) || 0;

        const salaireBrut = base + supp + prime + autres + indemnite + avantage;

        // Vérifie que salaireBrut est bien un nombre avant d'utiliser toFixed
        const salaireBrutFixed = Number.isNaN(salaireBrut) ? '0.00' : salaireBrut.toFixed(2);
        const cnapsRetenuCalc = Number.isNaN(cnapsRetenu) ? '0.00' : +(salaireBrutFixed * 0.01).toFixed(2);
        const ostieCalc = Number.isNaN(ostie) ? '0.00' : +(salaireBrutFixed * 0.01).toFixed(2);
        const salaireNetCalc = Number.isNaN(salaireNet) ? '0.00' : +(salaireBrutFixed - cnapsRetenuCalc - ostieCalc).toFixed(2);

        let impotDuCalc = 0;
        let calcul = 0;

        if (base <= 400000) {
            calcul = (base - 350000) * 0.05;
        } else if (base <= 500000) {
            calcul = 2500 + (base - 400000) * 0.10;
        } else if (base <= 600000) {
            calcul = 12500 + (base - 500000) * 0.15;
        } else if (base > 600000) {
            calcul = 27500 + (base - 600000) * 0.20;
        }

        // calcul <= 3000 → VRAI → impotDuCalc = 3000
        // calcul <= 3000 → FAUX → impotDuCalc = calcul
        impotDuCalc = calcul <= 3000 ? 3000 : calcul;

        if (salaireBrutFixed !== formDataFormik.values.salaireBrut) {
            formDataFormik.values.salaireBrut = salaireBrutFixed;
            formDataFormik.values.cnapsRetenu = cnapsRetenuCalc;
            formDataFormik.values.ostie = ostieCalc;
            formDataFormik.values.salaireNet = salaireNetCalc;
            formDataFormik.values.impotDu = impotDuCalc.toFixed(2);
        }
    }, [
        formDataFormik.values.salaireBase,
        formDataFormik.values.heuresSupp,
        formDataFormik.values.primeGratification,
        formDataFormik.values.autres,
        formDataFormik.values.indemniteImposable,
        formDataFormik.values.avantageImposable,
    ]);

    return (
        <BootstrapDialog
            open={true}
            onClose={handleClose}
            maxWidth="md"
            fullWidth

        >
            <DialogTitle sx={{ m: 0, p: 2, backgroundColor: 'transparent', color: 'black' }}>
                <Typography variant="h6" component="div">
                    Ajouter une déclaration IRSA
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="row" sx={{ width: '100%' }}>
                    <Box display="flex" flexDirection="column" gap={1.5} sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 400 }}>
                            Informations du personnel
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={2} mb={1} alignItems="flex-end">
                            <FormControl size="small" sx={{ flexBasis: 410, flexGrow: 0 }}>
                                {personnels.length === 0 ? (
                                    <TextField
                                        size="small"
                                        label="Matricule"
                                        variant="standard"
                                        value="Aucune"
                                        disabled
                                        sx={{
                                            width: 400,
                                            '& .MuiInputBase-root': { fontSize: '13px' },
                                            '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                ) : (
                                    <Autocomplete
                                        options={[...personnels].sort((a, b) => String(a.matricule || '').localeCompare(String(b.matricule || '')))}
                                        getOptionLabel={(option) =>
                                            option && typeof option === 'object'
                                                ? `${option.matricule || ''} - ${option.nom || ''} ${option.prenom || ''}`
                                                : ''
                                        }
                                        value={
                                            personnels.find(
                                                (p) => p.id === Number(formDataFormik.values.personnel_id)
                                            ) || null
                                        }
                                        onChange={(e, newValue) => {
                                            formDataFormik.setFieldValue('personnel_id', newValue ? Number(newValue.id) : '');
                                            formDataFormik.setFieldValue('matricule', newValue ? (newValue.matricule || '') : '');
                                        }}
                                        disabled={personnels.length === 0}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                label="Matricule"
                                                variant="standard"
                                                sx={{
                                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                                }}
                                                error={
                                                    formDataFormik.touched.personnel_id &&
                                                    Boolean(formDataFormik.errors.personnel_id)
                                                }
                                                helperText={
                                                    formDataFormik.touched.personnel_id &&
                                                    formDataFormik.errors.personnel_id
                                                }
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: {
                                                        '& input': {
                                                            padding: '2px 0',
                                                        },
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            </FormControl>


                            {/* Champ Salaire de base */}
                            <TextField
                                label="Salaire de base"
                                name="salaireBase"
                                value={formDataFormik.values.salaireBase}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.salaireBase && Boolean(formDataFormik.errors.salaireBase)}
                                helperText={formDataFormik.touched.salaireBase && formDataFormik.errors.salaireBase}
                                variant="standard"
                                size="small"
                                required
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <span style={{ fontSize: '13px' }}>Ar</span>
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>

                        {/* Groupe 2 */}
                        <Divider sx={{ my: 0 }} />

                        <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 400 }}>
                            Remunérations
                        </Typography>
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1.5}
                            flexWrap="wrap"
                        >
                            <TextField
                                label="Indemnités Imposables"
                                name="indemniteImposable"
                                value={formDataFormik.values.indemniteImposable}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.indemniteImposable && Boolean(formDataFormik.errors.indemniteImposable)}
                                helperText={formDataFormik.touched.indemniteImposable && formDataFormik.errors.indemniteImposable}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Indemnités Non Imposables"
                                name="indemniteNonImposable"
                                value={formDataFormik.values.indemniteNonImposable}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.indemniteNonImposable && Boolean(formDataFormik.errors.indemniteNonImposable)}
                                helperText={formDataFormik.touched.indemniteNonImposable && formDataFormik.errors.indemniteNonImposable}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Avantages Imposables"
                                name="avantageImposable"
                                value={formDataFormik.values.avantageImposable}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.avantageImposable && Boolean(formDataFormik.errors.avantageImposable)}
                                helperText={formDataFormik.touched.avantageImposable && formDataFormik.errors.avantageImposable}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />
                            <TextField
                                label="Avantages Exonérés"
                                name="avantageExonere"
                                value={formDataFormik.values.avantageExonere}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.avantageExonere && Boolean(formDataFormik.errors.avantageExonere)}
                                helperText={formDataFormik.touched.avantageExonere && formDataFormik.errors.avantageExonere}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Groupe 3 */}
                        <Divider sx={{ my: 0 }} />
                        <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 400 }}>
                            Autres rémunérations
                        </Typography>

                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1.5}
                            flexWrap="wrap"
                        >
                            <TextField
                                label="Heures supplémentaires"
                                name="heuresSupp"
                                value={formDataFormik.values.heuresSupp}
                                onChange={formDataFormik.handleChange}
                                variant="standard"
                                size="small"
                                error={formDataFormik.touched.heuresSupp && Boolean(formDataFormik.errors.heuresSupp)}
                                helperText={formDataFormik.touched.heuresSupp && formDataFormik.errors.heuresSupp}
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                label="Autres"
                                name="autres"
                                value={formDataFormik.values.autres}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.autres && Boolean(formDataFormik.errors.autres)}
                                helperText={formDataFormik.touched.autres && formDataFormik.errors.autres}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Prime Gratification"
                                name="primeGratification"
                                value={formDataFormik.values.primeGratification}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.primeGratification && Boolean(formDataFormik.errors.primeGratification)}
                                helperText={formDataFormik.touched.primeGratification && formDataFormik.errors.primeGratification}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />
                        </Box>

                        <Divider sx={{ my: 0 }} />
                        <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 400 }}>
                            Salaire Brut
                        </Typography>
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1.5}
                            flexWrap="wrap"
                        >
                            <TextField
                                label="Salaire Brut"
                                name="salaireBrut"
                                value={formDataFormik.values.salaireBrut}
                                disabled
                                error={formDataFormik.touched.salaireBrut && Boolean(formDataFormik.errors.salaireBrut)}
                                helperText={formDataFormik.touched.salaireBrut && formDataFormik.errors.salaireBrut}
                                variant="standard"
                                size="small"
                                sx={{
                                    textAlign: 'right',
                                    backgroundColor: '#F4F9F9',
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <span style={{ fontSize: '13px' }}>Ar</span>
                                        </InputAdornment>
                                    ),
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                        </Box>

                        {/* Groupe 3 */}
                        <Divider sx={{ my: 0 }} />
                        <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 400 }}>
                            Retenues et cotisations
                        </Typography>

                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1.5}
                            flexWrap="wrap"
                        >
                            <TextField
                                label="Cnaps Retenu"
                                name="cnapsRetenu"
                                value={formDataFormik.values.cnapsRetenu}
                                onChange={() => { }} // empêche la saisie
                                disabled
                                error={formDataFormik.touched.cnapsRetenu && Boolean(formDataFormik.errors.cnapsRetenu)}
                                helperText={formDataFormik.touched.cnapsRetenu && formDataFormik.errors.cnapsRetenu}
                                variant="standard"
                                size="small"
                                sx={{
                                    mb: 0,
                                    textAlign: 'right',
                                    width: 200,
                                    backgroundColor: '#E6F9E6',
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputProps={{
                                    readOnly: true,
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <TextField
                                label="Ostie"
                                name="ostie"
                                value={formDataFormik.values.ostie}
                                onChange={() => { }} // empêche la saisie
                                disabled
                                error={formDataFormik.touched.ostie && Boolean(formDataFormik.errors.ostie)}
                                helperText={formDataFormik.touched.ostie && formDataFormik.errors.ostie}
                                variant="standard"
                                size="small"
                                sx={{
                                    mb: 0,
                                    textAlign: 'right',
                                    width: 200,
                                    backgroundColor: '#E6F9E6',
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputProps={{
                                    readOnly: true,
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>
                        <Divider sx={{ my: 0 }} />
                        <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 400 }}>
                            Total Net
                        </Typography>
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1.5}
                            flexWrap="wrap"
                        >
                            <TextField
                                label="Salaire Net"
                                name="salaireNet"
                                value={formDataFormik.values.salaireNet}
                                onChange={formDataFormik.handleChange}
                                disabled
                                error={formDataFormik.touched.salaireNet && Boolean(formDataFormik.errors.salaireNet)}
                                helperText={formDataFormik.touched.salaireNet && formDataFormik.errors.salaireNet}
                                variant="standard"
                                size="small"
                                sx={{
                                    mb: 0,
                                    width: 200,
                                    textAlign: 'right',
                                    backgroundColor: '#F4F9F9',
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    readOnly: true,
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                        </Box>
                        <Divider sx={{ my: 0 }} />
                        <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 400 }}>
                            Autres
                        </Typography>
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1.5}
                            flexWrap="wrap"
                        >
                            <TextField
                                label="Autres déductions"
                                name="autreDeduction"
                                value={formDataFormik.values.autreDeduction}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.autreDeduction && Boolean(formDataFormik.errors.autreDeduction)}
                                helperText={formDataFormik.touched.autreDeduction && formDataFormik.errors.autreDeduction}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Montant imposable"
                                name="montantImposable"
                                value={formDataFormik.values.montantImposable}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.montantImposable && Boolean(formDataFormik.errors.montantImposable)}
                                helperText={formDataFormik.touched.montantImposable && formDataFormik.errors.montantImposable}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Impôt correspondant"
                                name="impotCorrespondant"
                                value={formDataFormik.values.impotCorrespondant}
                                onChange={formDataFormik.handleChange}
                                error={formDataFormik.touched.impotCorrespondant && Boolean(formDataFormik.errors.impotCorrespondant)}
                                helperText={formDataFormik.touched.impotCorrespondant && formDataFormik.errors.impotCorrespondant}
                                variant="standard"
                                size="small"
                                sx={{
                                    width: 200,
                                    mb: 0,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Charge famille"
                                name="reductionChargeFamille"
                                value={formDataFormik.values.reductionChargeFamille}
                                onChange={() => { }} // champ non modifiable manuellement
                                disabled
                                size="small"
                                error={formDataFormik.touched.reductionChargeFamille && Boolean(formDataFormik.errors.reductionChargeFamille)}
                                helperText={formDataFormik.touched.reductionChargeFamille && formDataFormik.errors.reductionChargeFamille}
                                variant="standard"
                                sx={{
                                    mb: 0,
                                    textAlign: 'right',
                                    backgroundColor: '#E6F9E6',
                                    width: 200,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    readOnly: true,
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                        </Box>
                        <Divider sx={{ my: 0 }} />
                        <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 400 }}>
                            Calcul IRSA
                        </Typography>
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1.5}
                            flexWrap="wrap"
                        >
                            <TextField
                                label="Impôt dû"
                                name="impotDu"
                                value={formDataFormik.values.impotDu !== undefined && formDataFormik.values.impotDu !== null ? formDataFormik.values.impotDu : "0.00"}
                                onChange={() => { }}
                                disabled
                                size="small"
                                error={formDataFormik.touched.impotDu && Boolean(formDataFormik.errors.impotDu)}
                                helperText={formDataFormik.touched.impotDu && formDataFormik.errors.impotDu}
                                variant="standard"
                                sx={{
                                    mb: 0,
                                    textAlign: 'right',
                                    backgroundColor: '#F4F9F9',
                                    width: 200,
                                    '& .MuiInputBase-root': { fontSize: '13px' },
                                    '& .MuiInputLabel-root': { color: '#1976d2', fontSize: '13px' },
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                            padding: '2px 0',
                                        },
                                    },
                                }}
                            />

                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Button 
            onClick={handleClose} 
            variant='outlined'
                        style={{
                            backgroundColor: "transparent",
                            color: initial.theme,
                            width: "100px",
                            textTransform: 'none',
                            //outline: 'none',
                        }}
            >
                Annuler
            </Button>

            <Button autoFocus
                type="submit"
                style={{ backgroundColor: initial.theme, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                onClick={() => {
                    const allTouched = Object.keys(formDataFormik.values).reduce((acc, key) => {
                      acc[key] = true;
                      return acc;
                    }, {});
                    formDataFormik.setTouched(allTouched, true);
                    formDataFormik.handleSubmit();
                  }}
            >
                Enregistrer
            </Button>
            </DialogActions>
        </BootstrapDialog>
    )
}
export default PopupAddIrsa;