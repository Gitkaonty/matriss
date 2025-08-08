import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid } from '@mui/material';

// On attend aussi irsaColumns en prop pour le rendu dynamique
export default function ModalEditIrsa({ open, row, personnels, irsaColumns, onSave, onCancel }) {
  // On stocke uniquement les champs éditables dans le state
  const [form, setForm] = useState(row || {});

  useEffect(() => {
    setForm(row || {});
  }, [row]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Dérivation temps réel des champs calculés à chaque rendu
  const base = parseFloat(form.salaireBase) || 0;
  const supp = parseFloat(form.heuresSupp) || 0;
  const prime = parseFloat(form.primeGratification) || 0;
  const autres = parseFloat(form.autres) || 0;
  const indemnite = parseFloat(form.indemniteImposable) || 0;
  const avantage = parseFloat(form.avantageImposable) || 0;
  const nbEnfants = parseInt(form.nombre_enfants_charge, 10) || 0;

  const salaireBrut = base + supp + prime + autres + indemnite + avantage;
  const salaireBrutFixed = Number.isNaN(salaireBrut) ? '0.00' : salaireBrut.toFixed(2);
  const cnapsRetenuCalc = Number.isNaN(salaireBrut) ? '0.00' : +(salaireBrut * 0.01).toFixed(2);
  const ostieCalc = Number.isNaN(salaireBrut) ? '0.00' : +(salaireBrut * 0.01).toFixed(2);
  const salaireNetCalc = Number.isNaN(salaireBrut) ? '0.00' : +(salaireBrut - cnapsRetenuCalc - ostieCalc).toFixed(2);
  const reductionChargeFamille = nbEnfants * 2000;

  // Calcul IRSA (impôt dû)
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
  const impotDuCalc = calcul <= 3000 ? 3000 : calcul;


  const handlePersonnelChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedPersonnel = personnels.find(p => p.id === selectedId) || null;
    setForm(prev => ({
      ...prev,
      personnel_id: selectedId,
      personnel: selectedPersonnel,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>Modifier la ligne IRSA</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {/* Groupe 1 : Informations personnel (grisées) */}
          <Grid container spacing={2} sx={{backgroundColor: 'white', borderRadius: 2, p: 1, mb: 1}}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Matricule"
                value={form.personnel?.matricule || form.personnel_id || form.personnel?.nom || form.personnel?.prenom || form.personnel?.fonction?.nom || ''}
                fullWidth
                size="small"
                sx={{ width: 200, marginBottom: '0px', backgroundColor: '#f5f5f5' }}
                InputProps={{ readOnly: true, style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }}
                InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Salaire Base"
                type="number"
                value={form.salaireBase ?? ''}
                onChange={e => handleChange('salaireBase', e.target.value)}
                fullWidth
                size="small"
                sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }}
                inputProps={{ step: '0.01', style: { textAlign: 'right' } }}
                InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }}
                InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }}
              />
            </Grid>            
          </Grid>

          {/* Groupe 3 : Avantages et Indemnités sur une ligne */}
          <Grid container spacing={2} sx={{mb: 3}} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Avantage Imposable" type="number" value={form.avantageImposable ?? ''} onChange={e => handleChange('avantageImposable', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Avantage Exonéré" type="number" value={form.avantageExonere ?? ''} onChange={e => handleChange('avantageExonere', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Indemnité Imposable" type="number" value={form.indemniteImposable ?? ''} onChange={e => handleChange('indemniteImposable', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Indemnité Non Imposable" type="number" value={form.indemniteNonImposable ?? ''} onChange={e => handleChange('indemniteNonImposable', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
          </Grid>

          {/* Groupe 4 : Prime, Heures Supp, Autres */}
          <Grid container spacing={2} sx={{mb: 3}} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Prime/Gratification" type="number" value={form.primeGratification ?? ''} onChange={e => handleChange('primeGratification', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Heures Supp." type="number" value={form.heuresSupp ?? ''} onChange={e => handleChange('heuresSupp', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Autres" type="number" value={form.autres ?? ''} onChange={e => handleChange('autres', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{mb: 1}} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Salaire Brut" type="number" value={salaireBrutFixed} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: '#F4F9F9', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' }, readOnly: true }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ readOnly: true, style: { fontSize: '13px', padding: '2px 4px', height: '30px', textAlign: 'right', backgroundColor: '#F4F9F9' } }} />
            </Grid>
          </Grid>


          {/* Groupe 5 : CNAPS, OSTIE, Réduction famille */}
          <Grid container spacing={2} sx={{mb: 3}} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="CNAPS Retenu" type="number" value={cnapsRetenuCalc} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: '#E6F9E6', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' }, readOnly: true }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ readOnly: true, style: { fontSize: '13px', padding: '2px 4px', height: '30px', textAlign: 'right', backgroundColor: '#E6F9E6' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="OSTIE" type="number" value={ostieCalc} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: '#E6F9E6', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' }, readOnly: true }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ readOnly: true, style: { fontSize: '13px', padding: '2px 4px', height: '30px', textAlign: 'right', backgroundColor: '#E6F9E6' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Réduction Famille" type="number" value={reductionChargeFamille} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: '#E6F9E6', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' }, readOnly: true }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ readOnly: true, style: { fontSize: '13px', padding: '2px 4px', height: '30px', textAlign: 'right', backgroundColor: '#E6F9E6' } }} />
            </Grid>
          </Grid>

          {/* Groupe 6 : Salaire brut, Salaire net */}
          <Grid container spacing={2} sx={{mb: 3}} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Salaire Net" type="number" value={salaireNetCalc} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: '#F4F9F9', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' }, readOnly: true }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ readOnly: true, style: { fontSize: '13px', padding: '2px 4px', height: '30px', textAlign: 'right', backgroundColor: '#F4F9F9' } }} />
            </Grid>
          </Grid>

          {/* Groupe 7 : Autre déduction, Montant imposable */}
          <Grid container spacing={2} sx={{mb: 3}} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Autre Déduction" type="number" value={form.autreDeduction ?? ''} onChange={e => handleChange('autreDeduction', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Montant Imposable" type="number" value={form.montantImposable ?? ''} onChange={e => handleChange('montantImposable', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Impôt Correspondant" type="number" value={form.impotCorrespondant ?? ''} onChange={e => handleChange('impotCorrespondant', e.target.value)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: 'transparent', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' } }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ style: { fontSize: '13px', padding: '2px 4px', height: '30px' } }} />
            </Grid>
          </Grid>

          {/* Groupe 8 : Impôt dû */}
          <Grid container spacing={2} sx={{mb: 3}} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Impôt Dû" type="number" value={impotDuCalc.toFixed(2)} fullWidth size="small" sx={{ width: 200, marginBottom: '0px', backgroundColor: '#F4F9F9', textAlign: 'right' }} inputProps={{ step: '0.01', style: { textAlign: 'right' }, readOnly: true }} InputLabelProps={{ style: { color: '#1976d2', fontSize: '13px' } }} InputProps={{ readOnly: true, style: { fontSize: '13px', padding: '2px 4px', height: '30px', textAlign: 'right', backgroundColor: '#F4F9F9' } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="secondary">Annuler</Button>
          <Button type="submit" color="primary" variant="contained">Valider</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
