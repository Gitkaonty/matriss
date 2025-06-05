import { React, useState, useEffect } from 'react';
import { Typography, Stack, TextField, FormControl } from '@mui/material';
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

const PopupModifBHIAPC = ({choix, confirmationState, data}) =>{
    const [formDataFinal, setFormDataFinal] = useState({
        state: false,
        id:-1,
        nif: '',
        raisonsociale: '',
        adresse: '',
        montantcharge: 0,
        montantbeneficiaire: 0
      });

    const formData = useFormik({
        initialValues : {
            state: true,
            id:-1,
            nif: '',
            raisonsociale: '',
            adresse: '',
            montantcharge: 0,
            montantbeneficiaire: 0
            },
        validationSchema: Yup.object({
            raisonsociale : Yup.string().required("Veuillez ajouter une raison sociale."),
            montantcharge: Yup.number().positive("Veuillez entrer un montant.").required("Veuillez entrer un montant."),
        }),
        //validateOnChange: false,
        //validateOnBlur: true,
        onSubmit: (values) => {
            setFormDataFinal(prevFormDataFinal => {
                const newFormDataFinal = { 
                    ...prevFormDataFinal, 
                    state: true, 
                    id: values.id, 
                    nif: nif,
                    raisonsociale: values.raisonsociale,
                    adresse: values.adresse,
                    montantcharge: values.montantcharge,
                    montantbeneficiaire: values.montantbeneficiaire
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
                nif: data.nif,
                raisonsociale: data.raison_sociale,
                adresse: data.adresse,
                montantcharge: data.montant_charge,
                montantbeneficiaire: data.montant_beneficiaire
            });
        }
   }, [data]);

    return (
        <form onSubmit={formData.handleSubmit}>
            <BootstrapDialog
                onClose={handleCloseDeleteModel}
                aria-labelledby="customized-dialog-title"
                open={true}
            >
                <DialogTitle sx={{ ml: 1, p: 2 }} id="customized-dialog-title" style={{fontWeight:'bold', width:'550px', height:'50px',backgroundColor : 'transparent'}}>
                    <Typography variant={'h6'} style={{fontZise: 12}}>
                        {choix} d'une ligne pour le formulaire BHIAPC
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
            
                <Stack width={"550px"} height={"400px"} spacing={2} alignItems={'left'} alignContent={"center"} 
                    direction={"column"} justifyContent={"center"} style={{marginLeft:'10px'}}
                >
                    <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '200px' }}>
                        <TextField
                            size="small"
                            label="Nif"
                            name="nif"
                            value={formData.values.nif}
                            onChange={formData.handleChange}
                            fullWidth
                            style={{ marginBottom: '10px', width: '200px' }}
                            InputLabelProps={{
                                style: {
                                color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                                },
                            }}
                        />
                    </FormControl>
                    

                    <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '100%' }}>
                        <TextField
                        size="small"
                        label="Raison sociale"
                        name="raisonsociale"
                        value={formData.values.raisonsociale}
                        onChange={formData.handleChange}
                        type="string"
                        fullWidth
                        style={{ marginBottom: '10px' }}
                        InputLabelProps={{
                            style: {
                              color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                            },
                          }}
                        />
                    </FormControl>
                    

                    <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '100%' }}>
                        <TextField
                        size="small"
                        label="Adresse"
                        name="adresse"
                        value={formData.values.adresse}
                        onChange={formData.handleChange}
                        fullWidth
                        style={{ marginBottom: '10px' }}
                        InputLabelProps={{
                            style: {
                              color: '#1976d2',  // Couleur primary par défaut (bleu de Material-UI)
                            },
                          }}
                        />
                    </FormControl>
                    

                    <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '200px' }}>
                        <TextField
                            size="small"
                            label="Montant charge"
                            name="montantcharge"
                            value={formData.values.montantcharge}
                            onChange={formData.handleChange}
                            fullWidth
                            style={{ 
                                marginBottom: '10px', 
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
                    </FormControl>
                    

                    <FormControl size="small" fullWidth style={{ marginBottom: '10px', width: '200px' }}>
                        <TextField
                            size="small"
                            label="Montant bénéf."
                            name="montantbeneficiaire"
                            value={formData.values.montantbeneficiaire}
                            onChange={formData.handleChange}
                            fullWidth
                            style={{ marginBottom: '10px', width: '200px' }}
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
                    </FormControl>
                    
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

export default PopupModifBHIAPC;
