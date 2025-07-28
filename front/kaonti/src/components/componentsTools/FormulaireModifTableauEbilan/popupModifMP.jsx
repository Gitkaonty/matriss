import { React, useState, useEffect } from 'react';
import { Typography, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Divider, FormHelperText } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { init } from '../../../../init';
import { CiWarning } from "react-icons/ci";
import { IoIosWarning } from "react-icons/io";
import toast from 'react-hot-toast';
import axios from '../../../../config/axios';
import InputAdornment from '@mui/material/InputAdornment';
import { NumericFormat } from 'react-number-format';
import { useFormik } from 'formik';
import * as Yup from "yup";
import FormatedInput from '../FormatedInput';

let initial = init[0];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));

const PopupModifMP = ({choix, confirmationState, data}) =>{
    const [formDataFinal, setFormDataFinal] = useState({
        state: false,
        id:-1,
        marche: '',
        refmarche: '',
        date: '',
        datepaiement: '',
        montantht: 0,
        montantpaye: 0,
        montanttmp: 0,
      });

    const formData = useFormik({
        initialValues : {
            state: true,
            id:-1,
            marche: '',
            refmarche: '',
            date: '',
            datepaiement: '',
            montantht: 0,
            montantpaye: 0,
            montanttmp: 0,
        },
        validationSchema: Yup.object({
            marche : Yup.string().required("Veuillez choisir le type de marché."),
            date: Yup.string()
                .matches(
                    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, // = format du back pour la datapicker yyyy-MM-dd
                    'La date doit être au format jj/mm/aaaa'
                )
                .test('is-valid-date', 'La date doit être valide', (value) => {
                if (!value) return false;
    
                const [year, month, day] = value.split('-').map(Number);
    
                // Vérifie les mois
                if (month < 1 || month > 12) return false;
    
                // Vérifie les jours en fonction du mois
                const daysInMonth = new Date(year, month, 0).getDate();
                return day >= 1 && day <= daysInMonth;
            }).required("La date du marché est obligatoire."),
            datepaiement: Yup.string()
                .matches(
                    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, // = format du back pour la datapicker yyyy-MM-dd
                    'La date doit être au format jj/mm/aaaa'
                )
                .test('is-valid-date', 'La date doit être valide', (value) => {
                if (!value) return false;
    
                const [year, month, day] = value.split('-').map(Number);
    
                // Vérifie les mois
                if (month < 1 || month > 12) return false;
    
                // Vérifie les jours en fonction du mois
                const daysInMonth = new Date(year, month, 0).getDate();
                return day >= 1 && day <= daysInMonth;
            }).required("La date de paiement est obligatoire."),
            montantht: Yup.number().positive("Veuillez entrer le montant du marché.").required("Veuillez entrer le montant du marché."),
        }),
        //validateOnChange: false,
        //validateOnBlur: true,
        onSubmit: (values) => {
            setFormDataFinal(prevFormDataFinal => {
                const newFormDataFinal = { 
                    ...prevFormDataFinal, 
                    state: true, 
                    id: values.id, 
                    marche: values.marche,
                    refmarche: values.refmarche,
                    date: values.date,
                    datepaiement: values.datepaiement,
                    montantht: values.montantht,
                    montantpaye: values.montantpaye,
                    montanttmp: values.montanttmp,
                };
                confirmationState(newFormDataFinal);
                return newFormDataFinal;
            });  
        }
    });

    const handleCloseDeleteModel = () => {
        setFormDataFinal(prevFormDataFinal => {
            const newFormDataFinal = { ...prevFormDataFinal, state: false };
            confirmationState(newFormDataFinal);
            return newFormDataFinal;
        });
    }

    // Fonction pour gérer le clic sur le bouton "Modifier"
   useEffect(() => {
        if(data){
            formData.setValues({
                state: false,
                id: data.id,
                marche: data.marche,
                refmarche: data.refmarche,
                date: data.date,
                datepaiement: data.date_paiement,
                montantht: data.montant_marche_ht,
                montantpaye: data.montant_paye,
                montanttmp: data.tmp,
            });
        }
   }, [data]);

    return (
        <form onSubmit={formData.handleSubmit}>
            <BootstrapDialog
                onClose={handleCloseDeleteModel}
                aria-labelledby="customized-dialog-title"
                open={true}
                fullWidth={true}
                maxWidth="md"
            >
                <DialogTitle sx={{ ml: 1, p: 2 }} id="customized-dialog-title" style={{fontWeight:'bold', width:'550px', height:'50px',backgroundColor : 'transparent'}}>
                    <Typography variant={'h6'} style={{fontZise: 12}}>
                        {choix} d'une ligne pour le formulaire MP
                    </Typography>
                </DialogTitle>
                
                <IconButton
                    style={{color:'red', textTransform: 'none', outline: 'none'}}
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
                <DialogContent>
            
                <Stack width={"95%"} height={"450px"} spacing={2} alignItems={'left'} alignContent={"center"} 
                    direction={"column"} justifyContent={"center"} style={{marginLeft:'10px'}}
                >
                    <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '200px' }}>
                        <InputLabel style={{ color: '#1976d2' }}>Marché</InputLabel>
                        <Select
                            label="Marché"
                            name="marche"
                            value={formData.values.marche}
                            onChange={formData.handleChange}
                            fullWidth
                            style={{ marginBottom: '0px' }}
                        >
                            {/* Remplacer ces options par celles dont tu as besoin */}
                            <MenuItem key="MP" value="MP">Marché public</MenuItem>
                            <MenuItem key="AUTRE" value="AUTRE">Autres marchés</MenuItem>
                        </Select>

                        <FormHelperText style={{color:'red', width: '300px'}}>
                            {formData.errors.marche && formData.touched.marche && formData.errors.marche}
                        </FormHelperText>
                    </FormControl>

                    <FormControl size="small" fullWidth style={{ marginBottom: '10px' }}>
                        <TextField
                            size="small"
                            label="réf. du marché"
                            name="refmarche"
                            value={formData.values.refmarche}
                            onChange={formData.handleChange}
                            type="string"
                            fullWidth
                            style={{ marginBottom: '0px' }}
                            InputLabelProps={{
                                style: {
                                color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                                },
                            }}
                        />

                        <FormHelperText style={{color:'red', width: '300px'}}>
                            {formData.errors.refmarche && formData.touched.refmarche && formData.errors.refmarche}
                        </FormHelperText>
                    </FormControl>
                    
                    <Divider style={{marginTop:'10px', marginBottom:'30px'}}/>

                    <Stack direction={'row'} spacing={2}>
                        <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '200px' }}>
                            <TextField
                                size="small"
                                label="Date"
                                name="date"
                                type="date"
                                value={formData.values.date}
                                onChange={formData.handleChange}
                                fullWidth
                                style={{ marginBottom: '0px', width: '200px' }}
                                InputLabelProps={{
                                    style: {
                                    color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                                    },
                                    shrink: true,  // Cela fait "flotter" le label au-dessus du champ
                                }}
                            />

                            <FormHelperText style={{color:'red', width: '200px'}}>
                                {formData.errors.date && formData.touched.date && formData.errors.date}
                            </FormHelperText>
                        </FormControl>
                        

                        <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '200px' }}>
                            <TextField
                                size="small"
                                label="Date paiement"
                                name="datepaiement"
                                type="date"
                                value={formData.values.datepaiement}
                                onChange={formData.handleChange}
                                fullWidth
                                style={{ marginBottom: '0px', width: '200px' }}
                                InputLabelProps={{
                                    style: {
                                    color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                                    },
                                    shrink: true,  // Cela fait "flotter" le label au-dessus du champ
                                }}
                            />

                            <FormHelperText style={{color:'red', width: '200px'}}>
                                {formData.errors.datepaiement && formData.touched.datepaiement && formData.errors.datepaiement}
                            </FormHelperText>
                        </FormControl>
                    </Stack>

                    <Divider style={{marginTop:'10px', marginBottom:'30px'}}/>
                    
                    <Stack direction={'row'} spacing={2}>
                        <FormControl size="small" fullWidth style={{ marginBottom: '10px' , width: '200px'}}>
                            <TextField
                                size="small"
                                label="Montant marché"
                                name="montantht"
                                value={formData.values.montantht}
                                onChange={formData.handleChange}
                                fullWidth
                                style={{ 
                                    marginBottom: '0px', 
                                    width: '200px', 
                                    textAlign: 'right', 
                                    justifyContent:'right', 
                                    justifyItems:'right'
                                }}
                                 InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">Ar</InputAdornment>,
                                    sx: {
                                    '& input': {
                                        textAlign: 'right', // Alignement du texte dans le champ à droite
                                    },
                                    },
                                }}
                                InputLabelProps={{
                                style: {
                                    color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                                },
                                }}
                            />

                            <FormHelperText style={{color:'red', width: '200px'}}>
                                {formData.errors.montantht && formData.touched.montantht && formData.errors.montantht}
                            </FormHelperText>
                        </FormControl>
                        
                        <FormControl size="small" fullWidth style={{ marginBottom: '10px' , width: '200px'}}>
                            <TextField
                                size="small"
                                label="Montant payé"
                                name="montantpaye"
                                value={formData.values.montantpaye}
                                onChange={formData.handleChange}
                                fullWidth
                                style={{ marginBottom: '0px', width: '200px' }}
                                 InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">Ar</InputAdornment>,
                                    sx: {
                                    '& input': {
                                        textAlign: 'right', // Alignement du texte dans le champ à droite
                                    },
                                    },
                                }}
                                InputLabelProps={{
                                    style: {
                                    color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                                    },
                                }}
                            />

                            <FormHelperText style={{color:'red', width: '200px'}}>
                                {formData.errors.montantpaye && formData.touched.montantpaye && formData.errors.montantpaye}
                            </FormHelperText>
                        </FormControl>
                        
                        <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '200px' }}>
                            <TextField
                                size="small"
                                label="Montant tmp"
                                name="montanttmp"
                                value={formData.values.montanttmp}
                                onChange={formData.handleChange}
                                fullWidth
                                style={{ marginBottom: '0px', width: '200px' }}
                                InputProps={{
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">Ar</InputAdornment>,
                                    sx: {
                                    '& input': {
                                        textAlign: 'right', // Alignement du texte dans le champ à droite
                                    },
                                    },
                                }}
                                InputLabelProps={{
                                    style: {
                                    color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                                    },
                                }}
                            />

                            <FormHelperText style={{color:'red', width: '200px'}}>
                                {formData.errors.montanttmp && formData.touched.montanttmp && formData.errors.montanttmp}
                            </FormHelperText>
                        </FormControl>
                    </Stack>
                </Stack>

                </DialogContent>
                <DialogActions>
                    <Button autoFocus
                        variant='outlined'
                        style={{backgroundColor:"transparent", 
                            color:initial.theme, 
                            width:"100px", 
                            textTransform: 'none', 
                            //outline: 'none',
                        }}
                        onClick={handleCloseDeleteModel}
                        >
                            Annuler
                    </Button>
                    <Button autoFocus 
                    type="submit"
                    onClick={formData.handleSubmit}
                    style={{backgroundColor:initial.theme, color:'white', width:"100px", textTransform: 'none', outline: 'none'}}
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </form>
    )
}

export default PopupModifMP;
