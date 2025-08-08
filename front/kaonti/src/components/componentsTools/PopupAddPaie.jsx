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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { MdExpandCircleDown } from "react-icons/md";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const PopupAddPaie = ({ confirmationState, mois, annee, setIsRefresh, row, id_compte, id_dossier, id_exercice }) => {
    console.log(mois, annee);
    const [nbrEnfant, setNbrEnfant] = useState(0);
    const [personnels, setPersonnels] = useState([]);
    const handleClose = () => confirmationState(false);

    useEffect(() => {
        axios.get(`/sociales/personnel/${id_compte}/${id_dossier}`)
            .then(res => {
                if (res.data.state) setPersonnels(res.data.list);
                else setPersonnels([]);
            })
            .catch(() => setPersonnels([]));
    }, []);

    const formik = useFormik({
        initialValues: row ? {
            ...row,
            mois: row.mois || mois,
            annee: row.annee || annee,
            nombre_enfants_charge: typeof row.nombre_enfants_charge === 'number' ? row.nombre_enfants_charge : nbrEnfant,
            deductionEnfants: typeof row.deductionEnfants === 'number' ? row.deductionEnfants : nbrEnfant * 2000,
        } : {
            personnel_id: '',
            salaireBase: '0.00',
            prime: '0.00',
            heuresSupp: '0.00',
            indemnites: '0.00',
            remunerationFerieDimanche: '0.00',
            salaireBrutNumeraire: '0.00',
            assurance: '0.00',
            carburant: '0.00',
            entretienReparation: '0.00',
            totalDepensesVehicule: '0.00',
            totalAvantageNatureVehicule: '0.00',
            loyerMensuel: '0.00',
            remunerationFixe25: '0.00',
            avantageNatureLoyer: '0.00',
            depenseTelephone: '0.00',
            avantageNatureTelephone: '0.00',
            autresAvantagesNature: '0.00',
            totalAvantageNature: '0.00',
            salaireBrut20: '0.00',
            totalSalaireBrut: '0.00',
            cnapsEmployeur: '0.00',
            ostieEmployeur: '0.00',
            baseImposable: '0.00',
            irsaBrut: '0.00',
            nombre_enfants_charge: nbrEnfant,
            deductionEnfants: nbrEnfant * 2000,
            irsaNet: '0.00',
            salaireNet: '0.00',
            avanceQuinzaineAutres: '0.00',
            avancesSpeciales: '0.00',
            allocationFamiliale: '0.00',
            netAPayerAriary: '0.00',
            partPatronalCnaps: '0.00',
            partPatronalOstie: '0.00',
            mois: mois,
            annee: annee,
        },
            personnel_id: '',
            salaireBase: '0.00',
            prime: '0.00',
            heuresSupp: '0.00',
            indemnites: '0.00',
            remunerationFerieDimanche: '0.00',
            salaireBrutNumeraire: '0.00',
            assurance: '0.00',
            carburant: '0.00',
            entretienReparation: '0.00',
            totalDepensesVehicule: '0.00',
            totalAvantageNatureVehicule: '0.00',
            loyerMensuel: '0.00',
            remunerationFixe25: '0.00',
            avantageNatureLoyer: '0.00',
            depenseTelephone: '0.00',
            avantageNatureTelephone: '0.00',
            autresAvantagesNature: '0.00',
            totalAvantageNature: '0.00',
            salaireBrut20: '0.00',
            totalSalaireBrut: '0.00',
            cnapsEmployeur: '0.00',
            ostieEmployeur: '0.00',
            baseImposable: '0.00',
            irsaBrut: '0.00',
            nombre_enfants_charge: nbrEnfant,
            deductionEnfants: nbrEnfant * 2000,
            irsaNet: '0.00',
            salaireNet: '0.00',
        onSubmit: (values) => {
            handleSubmitForm();
        }
    });

    // Fonction de soumission du formulaire
    const handleSubmitForm = async () => {
        // mode édition : PUT /paie/paie/:id, sinon POST
        const selectedPersonnel = personnels.find(p => p.id === Number(formik.values.personnel_id));
        const dataToSend = {
            personnelId: selectedPersonnel && selectedPersonnel.id ? selectedPersonnel.id : Number(formik.values.personnel_id),
            salaireBase: Number(formik.values.salaireBase),
            prime: Number(formik.values.prime),
            heuresSup: Number(formik.values.heuresSupp),
            indemnites: Number(formik.values.indemnites),
            remunerationFerieDimanche: Number(formik.values.remunerationFerieDimanche),
            salaireBrutNumeraire: Number(formik.values.salaireBrutNumeraire),
            assurance: Number(formik.values.assurance),
            carburant: Number(formik.values.carburant),
            entretienReparation: Number(formik.values.entretienReparation),
            totalDepensesVehicule: Number(formik.values.totalDepensesVehicule),
            totalAvantageNatureVehicule: Number(formik.values.totalAvantageNatureVehicule),
            loyerMensuel: Number(formik.values.loyerMensuel),
            remunerationFixe25: Number(formik.values.remunerationFixe25),
            avantageNatureLoyer: Number(formik.values.avantageNatureLoyer),
            depenseTelephone: Number(formik.values.depenseTelephone),
            avantageNatureTelephone: Number(formik.values.avantageNatureTelephone),
            autresAvantagesNature: Number(formik.values.autresAvantagesNature),
            totalAvantageNature: Number(formik.values.totalAvantageNature),
            salaireBrut20: Number(formik.values.salaireBrut20),
            cnapsEmployeur: Number(formik.values.cnapsEmployeur),
            ostieEmployeur: Number(formik.values.ostieEmployeur),
            baseImposable: Number(formik.values.baseImposable),
            irsaBrut: Number(formik.values.irsaBrut),
            deductionEnfants: Number(formik.values.deductionEnfants),
            irsaNet: Number(formik.values.irsaNet),
            salaireNet: Number(formik.values.salaireNet),
            avanceQuinzaineAutres: Number(formik.values.avanceQuinzaineAutres),
            avancesSpeciales: Number(formik.values.avancesSpeciales),
            allocationFamiliale: Number(formik.values.allocationFamiliale),
            netAPayerAriary: Number(formik.values.netAPayerAriary),
            partPatronalCnaps: Number(formik.values.partPatronalCnaps),
            partPatronalOstie: Number(formik.values.partPatronalOstie),
            totalSalaireBrut: Number(formik.values.totalSalaireBrut),
            mois: Number(formik.values.mois),
            annee: Number(formik.values.annee),
            id_compte: id_compte,
            id_dossier: id_dossier,
            id_exercice: id_exercice,
        };
        try {
            let res;
            if (row && row.id) {
                // édition
                res = await axios.put(`/paie/paie/${row.id}`, dataToSend);
            } else {
                // ajout
                res = await axios.post('/paie/paie', dataToSend);
            }
            if (res.data.state) {
                toast.success(row && row.id ? "Modification réussie !" : "Ajout réussi !");
                setIsRefresh(true);
            } else {
                toast.error("Erreur lors de la " + (row && row.id ? "modification" : "l'ajout"));
            }
        } catch (e) {
            toast.error("Erreur serveur");
        }
        handleClose();
    }


    const gerNombreEnfant = async (id) => {
        try {
          const res = await axios.get(`/sociales/personnel/${id}`);
          let nbEnfants = 0;
          if (res.data?.state && typeof res.data.data?.nombre_enfants_charge === 'number') {
            nbEnfants = res.data.data.nombre_enfants_charge;
          }
      
          setNbrEnfant(nbEnfants);
      
          // Ne mettre à jour que si c’est différent
          if (formik.values.nombre_enfants_charge !== nbEnfants) {
            formik.setFieldValue('nombre_enfants_charge', nbEnfants, false);
          }
          const reduction = nbEnfants * 2000;
          if (formik.values.reductionChargeFamille !== reduction) {
            formik.setFieldValue('reductionChargeFamille', reduction, false);
          }
        } catch (err) {
          console.error('Erreur lors de la récupération du nombre d’enfants', err);
        }
      };
      

    // Reset matricule si la sélection n'existe plus dans la liste (robuste, comme IRSA)
    useEffect(() => {
      if (
        personnels.length > 0 &&
        formik.values.personnel_id &&
        !personnels.find(p => p.id === Number(formik.values.personnel_id))
      ) {
        formik.setFieldValue('personnel_id', '');
      }
    }, [personnels, formik.values.personnel_id]);

    // Calcul automatique du salaire brut numéraire 
    useEffect(() => {
        const base = parseFloat(formik.values.salaireBase) || 0;
        const prime = parseFloat(formik.values.prime) || 0;
        const supp = parseFloat(formik.values.heuresSupp) || 0;
        const indemnites = parseFloat(formik.values.indemnites) || 0;
        const remunerationFerieDimanche = parseFloat(formik.values.remunerationFerieDimanche) || 0;
        const assurance = parseFloat(formik.values.assurance) || 0;
        const carburant = parseFloat(formik.values.carburant) || 0;
        const entretienReparation = parseFloat(formik.values.entretienReparation) || 0;
        const loyerMensuel = parseFloat(formik.values.loyerMensuel) || 0;
        const depenseTelephone = parseFloat(formik.values.depenseTelephone) || 0;
        const autresAvantagesNature = parseFloat(formik.values.autresAvantagesNature) || 0;

        const deductionEnfants = nbrEnfant * 2000;
        if (formik.values.deductionEnfants !== deductionEnfants.toFixed(2)) {
            formik.setFieldValue('deductionEnfants', deductionEnfants.toFixed(2));
        }

        const avanceQuinzaineAutres = parseFloat(formik.values.avanceQuinzaineAutres) || 0;
        const avancesSpeciales = parseFloat(formik.values.avancesSpeciales) || 0;
        const allocationFamiliale = parseFloat(formik.values.allocationFamiliale) || 0;
 
        const salaireBrutNumeraire = base + prime + supp + indemnites + remunerationFerieDimanche;
        const remunerationFixe25 = salaireBrutNumeraire * 0.25;
        const salaireBrut20 = salaireBrutNumeraire * 0.2;
        const totalDepensesVehicule = assurance + carburant + entretienReparation;
        const totalAvantageNatureVehicule = totalDepensesVehicule * 0.15;

        const avantageNatureLoyer = (loyerMensuel * 0.5 > remunerationFixe25)
            ? remunerationFixe25
            : loyerMensuel * 0.5;

        const avantageNatureTelephone = depenseTelephone * 0.15;

        const totalAvantageNature = totalAvantageNatureVehicule + avantageNatureLoyer + avantageNatureTelephone + autresAvantagesNature;

        let maxAvantage;
        if (totalAvantageNature > salaireBrut20) {
            maxAvantage = salaireBrutNumeraire + salaireBrut20;
        } else {
            maxAvantage = salaireBrutNumeraire + totalAvantageNature;
        }

        const totalSalaireBrut = maxAvantage;

        const montantPlafond = 2101440;
        const partPatronalCnaps = ((salaireBrutNumeraire + totalAvantageNature) < montantPlafond)
            ?(salaireBrutNumeraire + totalAvantageNature) * 0.13
            :montantPlafond * 0.13;
            
        const partPatronalOstie = ((salaireBrutNumeraire + totalAvantageNature) < montantPlafond)
            ? totalSalaireBrut * 0.05
            :montantPlafond * 0.05;

        const cnapsEmployeur = totalSalaireBrut * 0.01;
        const ostieEmployeur = totalSalaireBrut * 0.01;
        const baseImposable = Math.floor((totalSalaireBrut - cnapsEmployeur - ostieEmployeur) / 100) * 100;

        let calcul = 0;
        if (baseImposable <= 400000) {
          calcul = (baseImposable - 350000) * 0.05;
        } else if (baseImposable <= 500000) {
          calcul = 2500 + (baseImposable - 400000) * 0.10;
        } else if (baseImposable <= 600000) {
          calcul = 12500 + (baseImposable - 500000) * 0.15;
        } else if (baseImposable > 600000) {
          calcul = 27500 + (baseImposable - 600000) * 0.20;
        }

        const impotDuCalc = calcul <= 3000 ? 3000 : calcul;

        const irsaNetCalc = Math.max(impotDuCalc - deductionEnfants, 3000);

        const salaireNet = salaireBrutNumeraire - cnapsEmployeur - ostieEmployeur - irsaNetCalc;

        const netAPayerAriary = salaireNet - avanceQuinzaineAutres - avancesSpeciales + allocationFamiliale;

        if (formik.values.salaireBrutNumeraire !== salaireBrutNumeraire.toFixed(2)) {
            formik.setFieldValue('salaireBrutNumeraire', salaireBrutNumeraire.toFixed(2));
        }
        if (formik.values.remunerationFixe25 !== remunerationFixe25.toFixed(2)) {
            formik.setFieldValue('remunerationFixe25', remunerationFixe25.toFixed(2));
        }
        if (formik.values.salaireBrut20 !== salaireBrut20.toFixed(2)) {
            formik.setFieldValue('salaireBrut20', salaireBrut20.toFixed(2));
        }
        if (formik.values.totalDepensesVehicule !== totalDepensesVehicule.toFixed(2)) {
            formik.setFieldValue('totalDepensesVehicule', totalDepensesVehicule.toFixed(2));
        }
        if (formik.values.totalAvantageNatureVehicule !== totalAvantageNatureVehicule.toFixed(2)) {
            formik.setFieldValue('totalAvantageNatureVehicule', totalAvantageNatureVehicule.toFixed(2));
        }
        if (formik.values.avantageNatureLoyer !== avantageNatureLoyer.toFixed(2)) {
            formik.setFieldValue('avantageNatureLoyer', avantageNatureLoyer.toFixed(2));
        }
        if (formik.values.avantageNatureTelephone !== avantageNatureTelephone.toFixed(2)) {
            formik.setFieldValue('avantageNatureTelephone', avantageNatureTelephone.toFixed(2));
        }
        if (formik.values.totalAvantageNature !== totalAvantageNature.toFixed(2)) {
            formik.setFieldValue('totalAvantageNature', totalAvantageNature.toFixed(2));
        }
        if (formik.values.totalSalaireBrut !== totalSalaireBrut.toFixed(2)) {
            formik.setFieldValue('totalSalaireBrut', totalSalaireBrut.toFixed(2));
        }
        if (formik.values.cnapsEmployeur !== cnapsEmployeur.toFixed(2)) {
            formik.setFieldValue('cnapsEmployeur', cnapsEmployeur.toFixed(2));
        }
        if (formik.values.ostieEmployeur !== ostieEmployeur.toFixed(2)) {
            formik.setFieldValue('ostieEmployeur', ostieEmployeur.toFixed(2));
        }
        if (formik.values.baseImposable !== baseImposable.toFixed(2)) {
            formik.setFieldValue('baseImposable', baseImposable.toFixed(2));
        }
        if (formik.values.irsaBrut !== impotDuCalc.toFixed(2)) {
            formik.setFieldValue('irsaBrut', impotDuCalc.toFixed(2));
        }
        if (formik.values.irsaNet !== Math.max(impotDuCalc - deductionEnfants, 3000).toFixed(2)) {
            formik.setFieldValue('irsaNet', Math.max(impotDuCalc - deductionEnfants, 3000).toFixed(2));
        }
        if (formik.values.salaireNet !== salaireNet.toFixed(2)) {
            formik.setFieldValue('salaireNet', salaireNet.toFixed(2));
        }
        if (formik.values.netAPayerAriary !== netAPayerAriary.toFixed(2)) {
            formik.setFieldValue('netAPayerAriary', netAPayerAriary.toFixed(2));
        }
        if (formik.values.partPatronalCnaps !== partPatronalCnaps.toFixed(2)) {
            formik.setFieldValue('partPatronalCnaps', partPatronalCnaps.toFixed(2));
        }
        if (formik.values.partPatronalOstie !== partPatronalOstie.toFixed(2)) {
            formik.setFieldValue('partPatronalOstie', partPatronalOstie.toFixed(2));
        }
    }, [
        formik.values.salaireBase, formik.values.prime, formik.values.heuresSupp, formik.values.indemnites, 
        formik.values.remunerationFerieDimanche, formik.values.assurance,formik.values.carburant, formik.values.entretienReparation,
        formik.values.loyerMensuel, formik.values.depenseTelephone, formik.values.autresAvantagesNature, 
        formik.values.avanceQuinzaineAutres, formik.values.avancesSpeciales, formik.values.allocationFamiliale,
        nbrEnfant
    ]);

    return (
        <BootstrapDialog
            open={true}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle sx={{ m: 0, p: 2, backgroundColor: 'transparent', color: 'black' }}>
                <Typography variant="h6">Saisie fiche de paie</Typography>
            </DialogTitle>
            
            <DialogContent dividers>

                {/* Groupe 1 : Informations du personnel */}
                <Typography sx={{ fontWeight: 'normal', fontSize: '15px', mb: 1.5}}>Informations du personnel</Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mb={1} alignItems="center">
                            <FormControl size="small" sx={{ flexBasis: 410, flexGrow: 0 }}>
                                {personnels.length === 0 ? (
                                    <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{ height: 40, width: 400 }}
                                    >
                                    <span style={{ marginRight: 8 }}>Chargement des matricules...</span>
                                    <span
                                        className="MuiCircularProgress-root MuiCircularProgress-colorPrimary"
                                        style={{
                                        width: 20,
                                        height: 20,
                                        display: 'inline-block',
                                        verticalAlign: 'middle',
                                        border: '2px solid #1976d2',
                                        borderRadius: '50%',
                                        borderTop: '2px solid transparent',
                                        animation: 'spin 0.8s linear infinite',
                                        }}
                                    />
                                    <style>
                                        {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
                                    </style>
                                    </Box>
                                     ) : (
                                    <Autocomplete
                                    options={[...personnels].sort((b, a) => b.id - a.id)}
                                    getOptionLabel={(option) =>
                                        option && typeof option === 'object'
                                        ? `${option.id || ''} - ${option.nom || ''} ${option.prenom || ''}`
                                        : ''
                                    }
                                    value={
                                        personnels.find(
                                        (p) => p.id === Number(formik.values.personnel_id)
                                        ) || null
                                    }
                                    onChange={(e, newValue) => {
                                        const id = newValue ? Number(newValue.id) : '';
                                        formik.setFieldValue('personnel_id', id);
                                        
                                        if (id) {
                                          // Attend que le personnel_id soit bien mis à jour avant d'appeler gerNombreEnfant
                                          setTimeout(() => {
                                            gerNombreEnfant(id);
                                          }, 0);
                                        }
                                      }}                                      
                                    disabled={personnels.length === 0 || (row && row.id)}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        size="small"
                                        label="Matricule"
                                        variant="outlined"
                                        error={
                                            formik.touched.personnel_id &&
                                            Boolean(formik.errors.personnel_id)
                                        }
                                        helperText={
                                            formik.touched.personnel_id &&
                                            formik.errors.personnel_id
                                        }
                                        InputLabelProps={{
                                            shrink: true,
                                            sx: {
                                            color: '#1976d2',
                                            fontSize: '13px',
                                            },
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            style: { height: 38 },
                                        }}
                                        />
                                        )}
                                    />
                                )}
                            </FormControl>
                            <TextField
                                label="Salaire de base"
                                name="salaireBase"
                                value={formik.values.salaireBase}
                                onChange={formik.handleChange}
                                size="small"
                                sx={{
                                    marginBottom: '0px',
                                    textAlign: 'right',
                                    justifyContent: 'right',
                                    justifyItems: 'right',
                                    backgroundColor: 'transparent',
                                    width: 200
                                }}
                                InputLabelProps={{
                                    style: {
                                        fontSize: '13px',
                                        marginTop: '-3px',
                                        color: '#1976d2',
                                    },
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: '13px',
                                        padding: '2px 4px',
                                        height: '30px'
                                    },
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right',
                                        },
                                    },
                                }}
                                error={formik.touched.salaireBase && Boolean(formik.errors.salaireBase)} helperText={formik.touched.salaireBase && formik.errors.salaireBase}
                            />
                </Box>

                {/* Groupe 2 : Rémunérations fixes */}
                <Accordion
                defaultExpanded
                elevation={0}
                sx={{
                    width: '100%',
                    border: 'none',
                    boxShadow: 'none',
                    marginBottom: 1,
                    '&::before': {
                    display: 'none', // Supprime la ligne grise
                    }
                }}
                >
                    <AccordionSummary
                    expandIcon={<MdExpandCircleDown style={{ width: '25px', height: '25px', color: '#1976d2' }} />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                    style={{ flexDirection: 'row-reverse' }}
                >
                    <Typography style={{ fontWeight: 'normal', fontSize: '20px', marginLeft: '10px' }}>Avantages en numéraire</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Box display="flex" flexDirection="row" gap={1.5} flexWrap="wrap" style={{ marginLeft: '50px' }}>
                   
                    <TextField 
                    label="Prime" 
                    name="prime" 
                    value={formik.values.prime} 
                    onChange={formik.handleChange} 
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: 'transparent',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.prime && Boolean(formik.errors.prime)} helperText={formik.touched.prime && formik.errors.prime}
                    />
                     
                     <TextField 
                    label="Indemnités" 
                    name="indemnites" 
                    value={formik.values.indemnites} 
                    onChange={formik.handleChange} 
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: 'transparent',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.indemnites && Boolean(formik.errors.indemnites)} helperText={formik.touched.indemnites && formik.errors.indemnites}
                    />
                     
                    <TextField 
                    label="Heures Supp." 
                    name="heuresSupp" 
                    value={formik.values.heuresSupp} 
                    onChange={formik.handleChange} 
                    size="small"
                                sx={{
                                    marginBottom: '0px',
                                    textAlign: 'right',
                                    justifyContent: 'right',
                                    justifyItems: 'right',
                                    backgroundColor: 'transparent',
                                    width: 200
                                }}
                                InputLabelProps={{
                                    style: {
                                        fontSize: '13px',
                                        marginTop: '-3px',
                                        color: '#1976d2',
                                    },
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: '13px',
                                        padding: '2px 4px',
                                        height: '30px'
                                    },
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right', // Alignement du texte dans le champ à droite
                                        },
                                    },
                                }}
                        error={formik.touched.heuresSupp && Boolean(formik.errors.heuresSupp)} helperText={formik.touched.heuresSupp && formik.errors.heuresSupp}
                    />
                   
                    <TextField 
                    label="Rémunération Férié/Dim." 
                    name="remunerationFerieDimanche" 
                    value={formik.values.remunerationFerieDimanche} 
                    onChange={formik.handleChange} 
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: 'transparent',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.remunerationFerieDimanche && Boolean(formik.errors.remunerationFerieDimanche)} helperText={formik.touched.remunerationFerieDimanche && formik.errors.remunerationFerieDimanche}
                    />
                   
                </Box>
                </AccordionDetails>
                </Accordion>

                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 'normal', fontSize: '15px', mb: 1.5, marginLeft: '50px' }}
                    >
                    Salaires
                    </Typography>

                    <Box
                    display="flex"
                    flexDirection="row"
                    gap={1.5}
                    flexWrap="wrap"
                    sx={{ ml: '62px', mt: 0 }}
                    >

                    <TextField 
                    label="Salaire Brut Numéraire" 
                    name="salaireBrutNumeraire" 
                    value={formik.values.salaireBrutNumeraire} 
                    onChange={() => { }} 
                    size="small" 
                    disabled
                    sx={{
                        marginBottom: '12px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.salaireBrutNumeraire && Boolean(formik.errors.salaireBrutNumeraire)} helperText={formik.touched.salaireBrutNumeraire && formik.errors.salaireBrutNumeraire}
                    />
                    <TextField 
                    label="Rémunération Fixe 25%" 
                    name="remunerationFixe25" 
                    value={formik.values.remunerationFixe25} 
                    onChange={() => { }} 
                    size="small"
                    disabled
                    sx={{
                        marginBottom: '10px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.remunerationFixe25 && Boolean(formik.errors.remunerationFixe25)} helperText={formik.touched.remunerationFixe25 && formik.errors.remunerationFixe25}
                    />
                    <TextField 
                    label="Salaire Brut 20%" 
                    name="salaireBrut20" 
                    value={formik.values.salaireBrut20} 
                    onChange={() => { }} 
                    size="small"
                    disabled
                    sx={{
                        marginBottom: '10px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.remunerationFixe25 && Boolean(formik.errors.remunerationFixe25)} helperText={formik.touched.remunerationFixe25 && formik.errors.remunerationFixe25}
                    />
                </Box>

                <Accordion
                    defaultExpanded
                    elevation={0}
                    disableGutters
                    sx={{
                        width: '100%',
                        border: 'none',
                        boxShadow: 'none',
                        '&::before': {
                        display: 'none',
                        },
                        mb: 1,
                    }}
                    >
                <AccordionSummary
                    expandIcon={<MdExpandCircleDown style={{ width: '25px', height: '25px', color: '#1976d2' }} />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                    style={{ flexDirection: 'row-reverse' }}
                >
                    <Typography style={{ fontWeight: 'normal', fontSize: '20px', marginLeft: '10px' }}>Avantages en nature</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box display="flex" flexDirection="row" gap={1.5} flexWrap="wrap" style={{ marginLeft: '50px' }}>
                        <TextField 
                            label="Assurance" 
                            name="assurance" 
                            value={formik.values.assurance} 
                            onChange={formik.handleChange} 
                            size="small"
                            sx={{
                                marginBottom: '0px',
                                textAlign: 'right',
                                justifyContent: 'right',
                                justifyItems: 'right',
                                backgroundColor: 'transparent',
                                width: 200
                            }}
                            InputLabelProps={{
                                style: {
                                    fontSize: '13px',
                                    marginTop: '-3px',
                                    color: '#1976d2',
                                },
                            }}
                            InputProps={{
                                style: {
                                    fontSize: '13px',
                                    padding: '2px 4px',
                                    height: '30px'
                                },
                                inputComponent: FormatedInput,
                                endAdornment: <InputAdornment position="end">
                                    <span style={{ fontSize: '13px' }}>Ar</span>
                                </InputAdornment>,
                                sx: {
                                    '& input': {
                                        textAlign: 'right', // Alignement du texte dans le champ à droite
                                    },
                                },
                            }}
                        error={formik.touched.assurance && Boolean(formik.errors.assurance)} helperText={formik.touched.assurance && formik.errors.assurance}
                     />

                     <TextField 
                    label="Carburant" 
                    name="carburant" 
                    value={formik.values.carburant} 
                    onChange={formik.handleChange} 
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: 'transparent',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.carburant && Boolean(formik.errors.carburant)} helperText={formik.touched.carburant && formik.errors.carburant}
                    />

                <TextField 
                    label="Entretien/Réparation" 
                    name="entretienReparation" 
                    value={formik.values.entretienReparation} 
                    onChange={formik.handleChange} 
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: 'transparent',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.entretienReparation && Boolean(formik.errors.entretienReparation)} helperText={formik.touched.entretienReparation && formik.errors.entretienReparation}
                    />   
                    <TextField 
                    label="Total Dépenses Véhicule" 
                    name="totalDepensesVehicule" 
                    value={formik.values.totalDepensesVehicule} 
                    onChange={() => { }} 
                    size="small"
                    disabled
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.totalDepensesVehicule && Boolean(formik.errors.totalDepensesVehicule)} helperText={formik.touched.totalDepensesVehicule && formik.errors.totalDepensesVehicule}
                    />

                    <TextField 
                    label="Total Avantage Nature Véhicule" 
                    name="totalAvantageNatureVehicule" 
                    value={formik.values.totalAvantageNatureVehicule} 
                    onChange={() => { }} 
                    size="small"
                    disabled
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.totalAvantageNatureVehicule && Boolean(formik.errors.totalAvantageNatureVehicule)} helperText={formik.touched.totalAvantageNatureVehicule && formik.errors.totalAvantageNatureVehicule}
                    />   
                     <Stack direction="column" spacing={2}>
                     <TextField 
                    label="Loyer Mensuel" 
                    name="loyerMensuel" 
                    value={formik.values.loyerMensuel} 
                    onChange={formik.handleChange} 
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: 'transparent',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.loyerMensuel && Boolean(formik.errors.loyerMensuel)} helperText={formik.touched.loyerMensuel && formik.errors.loyerMensuel}
                    />     

                    
                    <TextField 
                    label="Dépense Téléphone" 
                    name="depenseTelephone" 
                    value={formik.values.depenseTelephone} 
                    onChange={formik.handleChange} 
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: 'transparent',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.depenseTelephone && Boolean(formik.errors.depenseTelephone)} helperText={formik.touched.depenseTelephone && formik.errors.depenseTelephone}
                    />
                     </Stack>
                     
                     <Stack direction="column" spacing={2}>
                     <TextField 
                    label="Avantage Nature Loyer" 
                    name="avantageNatureLoyer" 
                    value={formik.values.avantageNatureLoyer} 
                    onChange={formik.handleChange} 
                    size="small"
                    disabled
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.avantageNatureLoyer && Boolean(formik.errors.avantageNatureLoyer)} helperText={formik.touched.avantageNatureLoyer && formik.errors.avantageNatureLoyer}
                    />  

                     <TextField 
                    label="Avantage Nature Téléphone" 
                    name="avantageNatureTelephone" 
                    value={formik.values.avantageNatureTelephone} 
                    onChange={() => { }} 
                    size="small"
                    disabled
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.avantageNatureTelephone && Boolean(formik.errors.avantageNatureTelephone)} helperText={formik.touched.avantageNatureTelephone && formik.errors.avantageNatureTelephone}
                    />
                    </Stack>
</Box>

<Box display="flex" flexDirection="row" gap={2} flexWrap="wrap" style={{ marginLeft: '50px', marginTop: '16px' }} >
                    <TextField 
                    label="Autres Avantages Nature" 
                    name="autresAvantagesNature" 
                    value={formik.values.autresAvantagesNature} 
                    onChange={formik.handleChange}
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: 'transparent',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.totalAvantageNature && Boolean(formik.errors.totalAvantageNature)} helperText={formik.touched.totalAvantageNature && formik.errors.totalAvantageNature}
                    />

                    <TextField 
                    label="Total Avantage Nature" 
                    name="totalAvantageNature" 
                    value={formik.values.totalAvantageNature} 
                    onChange={() => { }}
                    disabled 
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.totalAvantageNature && Boolean(formik.errors.totalAvantageNature)} helperText={formik.touched.totalAvantageNature && formik.errors.totalAvantageNature}
                    />
                    </Box>
               
                </AccordionDetails>
                </Accordion>

                <Typography variant="subtitle1" sx={{fontWeight: 'normal', fontSize: '15px', mb: 1.5, marginLeft: '50px' }}>Total salaire Brut</Typography>
                <Box display="flex" flexDirection="row" gap={1.5} flexWrap="wrap" marginLeft="62px">
                <TextField 
                    label="Total salaire" 
                    name="totalSalaireBrut" 
                    value={formik.values.totalSalaireBrut} 
                    onChange={() => { }} 
                    disabled
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.cnapsEmployeur && Boolean(formik.errors.cnapsEmployeur)} helperText={formik.touched.cnapsEmployeur && formik.errors.cnapsEmployeur}
                    />
                </Box>
                <Box sx={{ mt: 1}} />
                {/* Groupe 6 : Cotisations et base imposable */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'normal', fontSize: '15px', mb: 1, marginLeft: '50px' }}>Cotisations – part salarié</Typography>
<Box display="flex" flexWrap="wrap" gap={2} mb={1} alignItems="center" style={{ marginLeft: '50px' }}>

</Box>
{/* Séparateur visuel avant synthèse paie */}
{/* <Box sx={{ marginTop: '32px' }} /> */}
<Box
  display="flex"
  flexDirection="row"
  gap={1.5}
  flexWrap="wrap"
  sx={{ ml: '62px', mt: 0 }}  // Pas de marge au-dessus
>
                    <TextField 
                    label="CNAPS Employeur" 
                    name="cnapsEmployeur" 
                    value={formik.values.cnapsEmployeur} 
                    onChange={() => { }} 
                    disabled
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.cnapsEmployeur && Boolean(formik.errors.cnapsEmployeur)} helperText={formik.touched.cnapsEmployeur && formik.errors.cnapsEmployeur}
                    />
                    <TextField 
                    label="OSTIE Employeur" 
                    name="ostieEmployeur" 
                    value={formik.values.ostieEmployeur} 
                    onChange={() => { }} 
                    disabled    
                    size="small"
                    sx={{
                        marginBottom: '0px',
                        textAlign: 'right',
                        justifyContent: 'right',
                        justifyItems: 'right',
                        backgroundColor: '#F4F9F9',
                        width: 200
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '13px',
                            marginTop: '-3px',
                            color: '#1976d2',
                        },
                    }}
                    InputProps={{
                        style: {
                            fontSize: '13px',
                            padding: '2px 4px',
                            height: '30px'
                        },
                        inputComponent: FormatedInput,
                        endAdornment: <InputAdornment position="end">
                            <span style={{ fontSize: '13px' }}>Ar</span>
                        </InputAdornment>,
                        sx: {
                            '& input': {
                                textAlign: 'right', // Alignement du texte dans le champ à droite
                            },
                        },
                    }}
                        error={formik.touched.ostieEmployeur && Boolean(formik.errors.ostieEmployeur)} helperText={formik.touched.ostieEmployeur && formik.errors.ostieEmployeur}
                    />
                     <TextField 
                    label="Base Imposable" 
                    name="baseImposable" 
                    value={formik.values.baseImposable} 
                    onChange={() => { }} 
                    disabled
                                size="small"
                                sx={{
                                    marginBottom: '0px',
                                    textAlign: 'right',
                                    justifyContent: 'right',
                                    justifyItems: 'right',
                                    backgroundColor: '#F4F9F9',
                                    width: 200
                                }}
                                InputLabelProps={{
                                    style: {
                                        fontSize: '13px',
                                        marginTop: '-3px',
                                        color: '#1976d2',
                                    },
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: '13px',
                                        padding: '2px 4px',
                                        height: '30px'
                                    },
                                    inputComponent: FormatedInput,
                                    endAdornment: <InputAdornment position="end">
                                        <span style={{ fontSize: '13px' }}>Ar</span>
                                    </InputAdornment>,
                                    sx: {
                                        '& input': {
                                            textAlign: 'right', // Alignement du texte dans le champ à droite
                                        },
                                    },
                                }}
                        error={formik.touched.baseImposable && Boolean(formik.errors.baseImposable)} helperText={formik.touched.baseImposable && formik.errors.baseImposable}
                    />
                </Box>

                {/* Synthèse paie */}
                <Accordion
                    defaultExpanded
                    elevation={0}
                    disableGutters
                    sx={{
                        width: '100%',
                        border: 'none',
                        boxShadow: 'none',
                        '&::before': {
                        display: 'none',
                        },
                        mb: 1,
                    }}
                    >
                    <AccordionSummary
                        expandIcon={<MdExpandCircleDown style={{ width: '25px', height: '25px', color: '#1976d2' }} />}
                        aria-controls="panelSynthese-content"
                        id="panelSynthese-header"
                        style={{ flexDirection: 'row-reverse' }}
                    >
                        <Typography style={{ fontWeight: 'normal', fontSize: '20px', marginLeft: '10px' }}>Synthèse paie</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap" style={{ marginLeft: '50px', marginBottom: '12px' }}>
                    <TextField 
                        label="IRSA Brut" 
                        name="irsaBrut" 
                        value={formik.values.irsaBrut} 
                        onChange={() => { }} 
                        disabled
                        size="small"
                        sx={{ marginBottom: '0px', width: 200, backgroundColor: '#F4F9F9' }}
                        InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                        InputProps={{
                            style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                            inputComponent: FormatedInput,
                            endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                            sx: { '& input': { textAlign: 'right' } },
                        }}
                        error={formik.touched.irsaBrut && Boolean(formik.errors.irsaBrut)} helperText={formik.touched.irsaBrut && formik.errors.irsaBrut}
                    />
                    <TextField 
                        label="IRSA Net" 
                        name="irsaNet" 
                        value={formik.values.irsaNet} 
                        onChange={() => { }} 
                        disabled
                        size="small"
                        sx={{ marginBottom: '0px', width: 200, backgroundColor: '#F4F9F9' }}
                        InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                        InputProps={{
                            style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                            inputComponent: FormatedInput,
                            endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                            sx: { '& input': { textAlign: 'right' } },
                        }}
                        error={formik.touched.irsaNet && Boolean(formik.errors.irsaNet)} helperText={formik.touched.irsaNet && formik.errors.irsaNet}
                    />
                    <TextField 
                        label="Déduction famille" 
                        name="deductionEnfants" 
                        value={formik.values.deductionEnfants} 
                        onChange={() => { }} 
                        disabled
                        size="small"
                        sx={{ marginBottom: '0px', width: 200, backgroundColor: '#F4F9F9' }}
                        InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                        InputProps={{
                            style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                            inputComponent: FormatedInput,
                            endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                            sx: { '& input': { textAlign: 'right' } },
                        }}
                        error={formik.touched.deductionEnfants && Boolean(formik.errors.deductionEnfants)} helperText={formik.touched.deductionEnfants && formik.errors.deductionEnfants}
                    />
                    <TextField 
                        label="Salaire Net" 
                        name="salaireNet" 
                        value={formik.values.salaireNet} 
                        onChange={() => { }} 
                        disabled
                        size="small"
                        sx={{ marginBottom: '0px', width: 200, backgroundColor: '#F4F9F9' }}
                        InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                        InputProps={{
                            style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                            inputComponent: FormatedInput,
                            endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                            sx: { '& input': { textAlign: 'right' } },
                        }}
                        error={formik.touched.salaireNet && Boolean(formik.errors.salaireNet)} helperText={formik.touched.salaireNet && formik.errors.salaireNet}
                    />
                </Box>
                <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap" style={{ marginLeft: '50px', marginBottom: '12px' }}>
                    <TextField 
                        label="Avance Quizaine/Autres" 
                        name="avanceQuinzaineAutres" 
                        value={formik.values.avanceQuinzaineAutres} 
                        onChange={formik.handleChange} 
                        size="small"
                        sx={{ marginBottom: '0px', width: 200 }}
                        InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                        InputProps={{
                            style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                            inputComponent: FormatedInput,
                            endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                            sx: { '& input': { textAlign: 'right' } },
                        }}
                        error={formik.touched.avanceQuinzaineAutres && Boolean(formik.errors.avanceQuinzaineAutres)} helperText={formik.touched.avanceQuinzaineAutres && formik.errors.avanceQuinzaineAutres}
                    />
                    <TextField 
                        label="Avances Spéciales" 
                        name="avancesSpeciales" 
                        value={formik.values.avancesSpeciales} 
                        onChange={formik.handleChange} 
                        size="small"
                        sx={{ marginBottom: '0px', width: 200 }}
                        InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                        InputProps={{
                            style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                            inputComponent: FormatedInput,
                            endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                            sx: { '& input': { textAlign: 'right' } },
                        }}
                        error={formik.touched.avancesSpeciales && Boolean(formik.errors.avancesSpeciales)} helperText={formik.touched.avancesSpeciales && formik.errors.avancesSpeciales}
                    />
                    <TextField 
                        label="Allocation Familiale" 
                        name="allocationFamiliale" 
                        value={formik.values.allocationFamiliale} 
                        onChange={formik.handleChange} 
                        size="small"
                        sx={{ marginBottom: '0px', width: 200 }}
                        InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                        InputProps={{
                            style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                            inputComponent: FormatedInput,
                            endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                            sx: { '& input': { textAlign: 'right' } },
                        }}
                        error={formik.touched.allocationFamiliale && Boolean(formik.errors.allocationFamiliale)} helperText={formik.touched.allocationFamiliale && formik.errors.allocationFamiliale}
                    />
                    <TextField 
                        label="Net à Payer (Ar)" 
                        name="netAPayerAriary" 
                        value={formik.values.netAPayerAriary} 
                        onChange={() => { }} 
                        disabled
                        size="small"
                        sx={{ marginBottom: '0px', width: 200, backgroundColor: '#F4F9F9' }}
                        InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                        InputProps={{
                            style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                            inputComponent: FormatedInput,
                            endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                            sx: { '& input': { textAlign: 'right' } },
                        }}
                        error={formik.touched.netAPayerAriary && Boolean(formik.errors.netAPayerAriary)} helperText={formik.touched.netAPayerAriary && formik.errors.netAPayerAriary}
                    />
                </Box>
                </AccordionDetails>
                </Accordion>

                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 'normal', fontSize: '15px', mb: 1.5, marginLeft: '50px' }}
                                    >
                                    Part Patronale
                                    </Typography>

                                    <Box
                                    display="flex"
                                    flexDirection="row"
                                    gap={1.5}
                                    flexWrap="wrap"
                                    sx={{ ml: '62px', mt: 0 }}
                                    > 
                                    <TextField 
                                    label="Part Patronal Cnaps" 
                                    name="partPatronalCnaps" 
                                    value={formik.values.partPatronalCnaps} 
                                    onChange={() => { }} 
                                    disabled
                                    size="small"
                                    sx={{ marginBottom: '0px', width: 200, backgroundColor: '#F4F9F9' }}
                                    InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                                    InputProps={{
                                        style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                                        inputComponent: FormatedInput,
                                        endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                                        sx: { '& input': { textAlign: 'right' } },
                                    }}
                                    error={formik.touched.partPatronalCnaps && Boolean(formik.errors.partPatronalCnaps)} helperText={formik.touched.partPatronalCnaps && formik.errors.partPatronalCnaps}
                                />
                                <TextField 
                                    label="Part Patronal Ostie" 
                                    name="partPatronalOstie" 
                                    value={formik.values.partPatronalOstie} 
                                    onChange={() => { }} 
                                    disabled
                                    size="small"
                                    sx={{ marginBottom: '0px', width: 200, backgroundColor: '#F4F9F9' }}
                                    InputLabelProps={{ style: { fontSize: '13px', color: '#1976d2' } }}
                                    InputProps={{
                                        style: { fontSize: '13px', padding: '2px 4px', height: '30px' },
                                        inputComponent: FormatedInput,
                                        endAdornment: <InputAdornment position="end"><span style={{ fontSize: '13px' }}>Ar</span></InputAdornment>,
                                        sx: { '& input': { textAlign: 'right' } },
                                    }}
                                    error={formik.touched.partPatronalOstie && Boolean(formik.errors.partPatronalOstie)} helperText={formik.touched.partPatronalOstie && formik.errors.partPatronalOstie}
                                />
                            </Box>
         

        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Button onClick={handleClose} variant="outlined" sx={{ minWidth: 100 }}>Annuler</Button>
            <Button 
                onClick={handleSubmitForm}
                variant="contained" 
                color="primary" 
                sx={{ minWidth: 100 }}
             >Valider
            </Button>
        </DialogActions>

    </BootstrapDialog>
    );
}


export default PopupAddPaie
