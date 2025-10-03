import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

export default function EditTvaAnnexeDialog({ open, confirmationState, row = null, onEditAnnexe }) {
  const handleClose = () => confirmationState(false);

  const formik = useFormik({
    initialValues: row ? {
      type_tva: row.collecte_deductible === 'deductible' ? 'deductible' : (row.collecte_deductible === 'collectee' ? 'collectee' : ''),
      origine: row.local_etranger === 'etranger' ? 'etranger' : (row.local_etranger === 'local' ? 'local' : ''),
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
      type_tva: '', origine: '', nif: '', raison_sociale: '', stat: '', adresse: '',
      montant_ht: '', montant_tva: '', reference_facture: '', date_facture: '',
      nature: '', libelle_operation: '', date_paiement: '', observation: '',
      n_dau: '', ligne_formulaire: '', code_tva: ''
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (row && row.id && onEditAnnexe) {
        await onEditAnnexe(row.id, values);
      }
    },
  });

  const f = formik.values;

  const commonProps = {
    variant: 'standard',
    size: 'small',
    sx: { width: '250px' },
    InputLabelProps: { shrink: true }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, backgroundColor: 'transparent', color: 'black' }}>
        Modifier une annexe TVA
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>

            <Box display="flex" gap={2}>
              <TextField
                {...commonProps}
                select
                label="Type TVA"
                name="type_tva"
                value={f.type_tva}
                onChange={formik.handleChange}
              >
                <MenuItem value="C">Collectée</MenuItem>
                <MenuItem value="D">Déductible</MenuItem>
              </TextField>
              <TextField
                {...commonProps}
                select
                label="Origine"
                name="origine"
                value={f.origine}
                onChange={formik.handleChange}
              >
                <MenuItem value="L">Local</MenuItem>
                <MenuItem value="E">Étranger</MenuItem>
              </TextField>
              <TextField {...commonProps} label="Raison sociale" name="raison_sociale" value={f.raison_sociale} onChange={formik.handleChange} disabled />

            </Box>

            <Box display="flex" gap={2}>
              <TextField {...commonProps} label="NIF" name="nif" value={f.nif} onChange={formik.handleChange} />
              <TextField {...commonProps} label="Stat" name="stat" value={f.stat} onChange={formik.handleChange} />
              <TextField {...commonProps} label="Adresse" name="adresse" value={f.adresse} onChange={formik.handleChange} />

            </Box>

            <Box display="flex" gap={2}>
              <TextField {...commonProps} type="number" label="Montant HT" name="montant_ht" value={f.montant_ht} onChange={formik.handleChange} disabled />
              <TextField {...commonProps} type="number" label="Montant TVA" name="montant_tva" value={f.montant_tva} onChange={formik.handleChange} disabled />
            </Box>

            <Box display="flex" gap={2}>
              <TextField {...commonProps} label="Référence facture" name="reference_facture" value={f.reference_facture} onChange={formik.handleChange} />
              <TextField {...commonProps} type="date" label="Date facture" name="date_facture" value={f.date_facture} onChange={formik.handleChange} disabled />
            </Box>

            <Box display="flex" gap={2}>
              <TextField {...commonProps} label="Nature" name="nature" value={f.nature} onChange={formik.handleChange} disabled />
              <TextField {...commonProps} label="Libellé opération" name="libelle_operation" value={f.libelle_operation} onChange={formik.handleChange} />
            </Box>

            <Box display="flex" gap={2}>
              <TextField {...commonProps} type="date" label="Date paiement" name="date_paiement" value={f.date_paiement} onChange={formik.handleChange} disabled />
              <TextField {...commonProps} label="Observation" name="observation" value={f.observation} onChange={formik.handleChange} />
            </Box>

            <Box display="flex" gap={2}>
              <TextField {...commonProps} label="N° DAU" name="n_dau" value={f.n_dau} onChange={formik.handleChange} />
              <TextField {...commonProps} label="Ligne de formulaire" name="ligne_formulaire" value={f.ligne_formulaire} onChange={formik.handleChange} />
            </Box>

            <Box display="flex" gap={2}>
              <TextField {...commonProps} label="Code TVA" name="code_tva" value={f.code_tva} onChange={formik.handleChange} />
            </Box>

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleClose} variant="outlined" sx={{ minWidth: 100 }}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 100 }}>Valider</Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
}
