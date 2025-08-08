import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, MenuItem, FormHelperText } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const IRSAFormModal = ({ open, onClose, onSubmit, personnels, indemniteOptions, avantageOptions }) => {
  const validationSchema = Yup.object({
    personnel_id: Yup.string().required('Personnel obligatoire'),
    salaireBase: Yup.number().typeError('Numérique').required('Obligatoire'),
    heuresSupp: Yup.number().typeError('Numérique').required('Obligatoire'),
    primeGratification: Yup.number().typeError('Numérique').required('Obligatoire'),
    autres: Yup.number().typeError('Numérique').required('Obligatoire'),
    salaireBrut: Yup.number().typeError('Numérique').required('Obligatoire'),
    cnapsRetenu: Yup.number().typeError('Numérique').required('Obligatoire'),
    ostie: Yup.number().typeError('Numérique').required('Obligatoire'),
    salaireNet: Yup.number().typeError('Numérique').required('Obligatoire'),
    autreDeduction: Yup.number().typeError('Numérique').required('Obligatoire'),
    montantImposable: Yup.number().typeError('Numérique').required('Obligatoire'),
    impotCorrespondant: Yup.number().typeError('Numérique').required('Obligatoire'),
    reductionChargeFamille: Yup.number().typeError('Numérique').required('Obligatoire'),
    impotDu: Yup.number().typeError('Numérique').required('Obligatoire'),
    indemniteImposable: Yup.number().typeError('Numérique').required('Obligatoire'),
    indemniteNonImposable: Yup.number().typeError('Numérique').required('Obligatoire'),
    avantageImposable: Yup.number().typeError('Numérique').required('Obligatoire'),
    avantageExonere: Yup.number().typeError('Numérique').required('Obligatoire'),
  });

  const formik = useFormik({
    initialValues: {
      personnel_id: '',
      salaireBase: '',
      heuresSupp: '',
      primeGratification: '',
      autres: '',
      salaireBrut: '',
      cnapsRetenu: '',
      ostie: '',
      salaireNet: '',
      autreDeduction: '',
      montantImposable: '',
      impotCorrespondant: '',
      reductionChargeFamille: '',
      impotDu: '',
      indemniteImposable: '',
      indemniteNonImposable: '',
      avantageImposable: '',
      avantageExonere: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      onSubmit(values);
      resetForm();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Ajouter une déclaration IRSA</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Personnel"
              name="personnel_id"
              value={formik.values.personnel_id}
              onChange={formik.handleChange}
              error={formik.touched.personnel_id && Boolean(formik.errors.personnel_id)}
              helperText={formik.touched.personnel_id && formik.errors.personnel_id}
              fullWidth
            >
              <MenuItem value=""><em>Choisir</em></MenuItem>
              {personnels.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.nom} {p.prenom}</MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField label="Salaire de base" name="salaireBase" value={formik.values.salaireBase} onChange={formik.handleChange} error={formik.touched.salaireBase && Boolean(formik.errors.salaireBase)} helperText={formik.touched.salaireBase && formik.errors.salaireBase} fullWidth />
              <TextField label="Heures supp." name="heuresSupp" value={formik.values.heuresSupp} onChange={formik.handleChange} error={formik.touched.heuresSupp && Boolean(formik.errors.heuresSupp)} helperText={formik.touched.heuresSupp && formik.errors.heuresSupp} fullWidth />
              <TextField label="Prime/Gratification" name="primeGratification" value={formik.values.primeGratification} onChange={formik.handleChange} error={formik.touched.primeGratification && Boolean(formik.errors.primeGratification)} helperText={formik.touched.primeGratification && formik.errors.primeGratification} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Autres" name="autres" value={formik.values.autres} onChange={formik.handleChange} error={formik.touched.autres && Boolean(formik.errors.autres)} helperText={formik.touched.autres && formik.errors.autres} fullWidth />
              <TextField label="Salaire brut" name="salaireBrut" value={formik.values.salaireBrut} onChange={formik.handleChange} error={formik.touched.salaireBrut && Boolean(formik.errors.salaireBrut)} helperText={formik.touched.salaireBrut && formik.errors.salaireBrut} fullWidth />
              <TextField label="CNAPS retenu" name="cnapsRetenu" value={formik.values.cnapsRetenu} onChange={formik.handleChange} error={formik.touched.cnapsRetenu && Boolean(formik.errors.cnapsRetenu)} helperText={formik.touched.cnapsRetenu && formik.errors.cnapsRetenu} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="OSTIE" name="ostie" value={formik.values.ostie} onChange={formik.handleChange} error={formik.touched.ostie && Boolean(formik.errors.ostie)} helperText={formik.touched.ostie && formik.errors.ostie} fullWidth />
              <TextField label="Salaire net" name="salaireNet" value={formik.values.salaireNet} onChange={formik.handleChange} error={formik.touched.salaireNet && Boolean(formik.errors.salaireNet)} helperText={formik.touched.salaireNet && formik.errors.salaireNet} fullWidth />
              <TextField label="Autre déduction" name="autreDeduction" value={formik.values.autreDeduction} onChange={formik.handleChange} error={formik.touched.autreDeduction && Boolean(formik.errors.autreDeduction)} helperText={formik.touched.autreDeduction && formik.errors.autreDeduction} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Montant imposable" name="montantImposable" value={formik.values.montantImposable} onChange={formik.handleChange} error={formik.touched.montantImposable && Boolean(formik.errors.montantImposable)} helperText={formik.touched.montantImposable && formik.errors.montantImposable} fullWidth />
              <TextField label="Impôt correspondant" name="impotCorrespondant" value={formik.values.impotCorrespondant} onChange={formik.handleChange} error={formik.touched.impotCorrespondant && Boolean(formik.errors.impotCorrespondant)} helperText={formik.touched.impotCorrespondant && formik.errors.impotCorrespondant} fullWidth />
              <TextField label="Réduction charge famille" name="reductionChargeFamille" value={formik.values.reductionChargeFamille} onChange={formik.handleChange} error={formik.touched.reductionChargeFamille && Boolean(formik.errors.reductionChargeFamille)} helperText={formik.touched.reductionChargeFamille && formik.errors.reductionChargeFamille} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Impôt dû" name="impotDu" value={formik.values.impotDu} onChange={formik.handleChange} error={formik.touched.impotDu && Boolean(formik.errors.impotDu)} helperText={formik.touched.impotDu && formik.errors.impotDu} fullWidth />
              <TextField label="Indemnité imposable" name="indemniteImposable" value={formik.values.indemniteImposable} onChange={formik.handleChange} error={formik.touched.indemniteImposable && Boolean(formik.errors.indemniteImposable)} helperText={formik.touched.indemniteImposable && formik.errors.indemniteImposable} fullWidth />
              <TextField label="Indemnité non imposable" name="indemniteNonImposable" value={formik.values.indemniteNonImposable} onChange={formik.handleChange} error={formik.touched.indemniteNonImposable && Boolean(formik.errors.indemniteNonImposable)} helperText={formik.touched.indemniteNonImposable && formik.errors.indemniteNonImposable} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Avantage imposable" name="avantageImposable" value={formik.values.avantageImposable} onChange={formik.handleChange} error={formik.touched.avantageImposable && Boolean(formik.errors.avantageImposable)} helperText={formik.touched.avantageImposable && formik.errors.avantageImposable} fullWidth />
              <TextField label="Avantage exonéré" name="avantageExonere" value={formik.values.avantageExonere} onChange={formik.handleChange} error={formik.touched.avantageExonere && Boolean(formik.errors.avantageExonere)} helperText={formik.touched.avantageExonere && formik.errors.avantageExonere} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">Ajouter</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IRSAFormModal;
