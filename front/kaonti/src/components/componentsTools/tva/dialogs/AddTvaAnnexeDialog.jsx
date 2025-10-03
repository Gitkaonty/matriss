import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

export default function AddTvaAnnexeDialog({ open, confirmationState, mois, annee, id_compte, id_dossier, id_exercice, row = null, onAddAnnexe, onEditAnnexe }) {
  const handleClose = () => confirmationState(false);

  const formik = useFormik({
    initialValues: row ? {
      type_tva: row.collecte_deductible === 'D' || row.collecte_deductible === 'deductible' ? 'D' : 'C',
      origine: row.local_etranger === 'E' || row.local_etranger === 'etranger' ? 'E' : 'L',
      nif: row.nif ?? '',
      raison_sociale: row.raison_sociale ?? '',
      stat: row.stat ?? '',
      adresse: row.adresse ?? '',
      montant_ht: row.montant_ht?.toString?.() ?? '',
      montant_tva: row.montant_tva?.toString?.() ?? '',
      reference_facture: row.reference_facture ?? '',
      date_facture: row.date_facture ?? '',
      nature: row.nature ?? '',
      libelle_operation: row.libelle_operation ?? '',
      date_paiement: row.date_paiement ?? '',
      observation: row.observation ?? '',
      n_dau: row.n_dau ?? '',
      ligne_formulaire: row.ligne_formulaire ?? '',
      code_tva: row.code_tva ?? '',
    } : {
      type_tva: '',
      origine: '',
      nif: '',
      raison_sociale: '',
      stat: '',
      adresse: '',
      montant_ht: '',
      montant_tva: '',
      reference_facture: '',
      date_facture: '',
      nature: '',
      libelle_operation: '',
      date_paiement: '',
      observation: '',
      n_dau: '',
      ligne_formulaire: '',
      code_tva: '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (row && row.id && onEditAnnexe) {
        await onEditAnnexe(row.id, values);
      } else if (onAddAnnexe) {
        await onAddAnnexe(values);
      }
    },
  });

  const f = formik.values;

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Ajouter une annexe TVA</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type TVA</InputLabel>
                <Select label="Type TVA" name="type_tva" value={f.type_tva ?? ''} onChange={formik.handleChange}>
                  <MenuItem value="C">Collectée</MenuItem>
                  <MenuItem value="D">Déductible</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Origine</InputLabel>
                <Select label="Origine" name="origine" value={f.origine ?? ''} onChange={formik.handleChange}>
                  <MenuItem value="L">Local</MenuItem>
                  <MenuItem value="E">Étranger</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="NIF" name="nif" value={f.nif ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Raison sociale" name="raison_sociale" value={f.raison_sociale ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Stat" name="stat" value={f.stat ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Adresse" name="adresse" value={f.adresse ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth type="number" inputProps={{ step: '0.01' }} label="Montant HT" name="montant_ht" value={f.montant_ht ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth type="number" inputProps={{ step: '0.01' }} label="Montant TVA" name="montant_tva" value={f.montant_tva ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Référence facture" name="reference_facture" value={f.reference_facture ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth type="date" label="Date facture" name="date_facture" value={f.date_facture ?? ''} onChange={formik.handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Nature" name="nature" value={f.nature ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Libellé opération" name="libelle_operation" value={f.libelle_operation ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth type="date" label="Date paiement" name="date_paiement" value={f.date_paiement ?? ''} onChange={formik.handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Observation" name="observation" value={f.observation ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="N° DAU" name="n_dau" value={f.n_dau ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Ligne de formulaire" name="ligne_formulaire" value={f.ligne_formulaire ?? ''} onChange={formik.handleChange} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Anomalies</InputLabel>
                <Select label="Anomalies" name="anomalies" value={f.anomalies ? 'true' : 'false'} onChange={(e) => formik.setFieldValue('anomalies', e.target.value === 'true')}>
                  <MenuItem value={'false'}>Non</MenuItem>
                  <MenuItem value={'true'}>Oui</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Code TVA" name="code_tva" value={f.code_tva ?? ''} onChange={formik.handleChange} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Annuler</Button>
          <Button type="submit" variant="contained">Enregistrer</Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
}
