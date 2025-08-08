import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
// import CodeIcon from '@mui/icons-material/Code';
import HistoriqueIrsaTable from './HistoriqueIrsaTable';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';

import toast from 'react-hot-toast';

export default function ExportIrsaDialog({ open, onClose, onExport, refreshKey, irsaData, exerciceId, valSelectMois, valSelectAnnee, compteId, setRefreshKey }) {
  const [selectedHisto, setSelectedHisto] = useState('histo_xml');
  const [selectedExerciceId, setSelectedExerciceId] = useState(0);

  const handleExport = () => {
    if (selectedHisto === 'histo_xml') {
      onExport();
    } else if (selectedHisto === 'histo_pdf') {
      handleExportPdf();
    } else if (selectedHisto === 'histo_csv') {
      toast.info('Export CSV non disponible pour le moment.');
    }
  };
  // --- Sélection période export PDF ---
  const [periodeDebut, setPeriodeDebut] = useState({ jour: 1, mois: valSelectMois, annee: valSelectAnnee });
  const [periodeFin, setPeriodeFin] = useState({ jour: getLastDayOfMonth(valSelectMois, valSelectAnnee), mois: valSelectMois, annee: valSelectAnnee });

  // Helper pour obtenir le dernier jour du mois
  function getLastDayOfMonth(mois, annee) {
    return new Date(annee, mois, 0).getDate();
  }

  const handleExportPdf = () => {
    const moisLabels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const moisLabel = typeof valSelectMois === 'number' ? moisLabels[valSelectMois - 1] : valSelectMois;

    // Calcule automatiquement la période comme en export XML
    const mois = typeof valSelectMois === 'number' ? valSelectMois : Number(valSelectMois);
    const annee = typeof valSelectAnnee === 'number' ? valSelectAnnee : Number(valSelectAnnee);
    const dernierJour = new Date(annee, mois, 0).getDate();
    const header = {
      exercice: exerciceId,
      mois: moisLabel,
      annee: valSelectAnnee,
      periodeDebut: { jour: 1, mois, annee },
      periodeFin: { jour: dernierJour, mois, annee },
    };

    fetch('http://localhost:5100/irsa/irsa/export-pdf-tableau', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
      },
      body: JSON.stringify({
        rows: irsaData,
        header
      }) // irsaData = tableau affiché à l'écran
    })
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la génération du PDF');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export_irsa.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        // Enregistrer dans l'historique des exports PDF
        const fileId = sessionStorage.getItem('fileId');
        if (compteId && fileId) {
           // Format harmonisé : IRSA PDF - du 01-<mois>-<année> au <dernierJour>-<mois>-<année>
           const mois = typeof valSelectMois === 'number' ? valSelectMois : Number(valSelectMois);
           const annee = typeof valSelectAnnee === 'number' ? valSelectAnnee : Number(valSelectAnnee);
           const dernierJour = new Date(annee, mois, 0).getDate();
           const debutStr = `01-${String(mois).padStart(2, '0')}-${annee}`;
           const finStr = `${String(dernierJour).padStart(2, '0')}-${String(mois).padStart(2, '0')}-${annee}`;
           const designation = `IRSA PDF - du ${debutStr} au ${finStr} - Mois ${mois}/${annee}`;
          fetch('http://localhost:5100/historique/irsa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idCompte: compteId,
              idDossier: fileId,
              declaration: 'IRSA',
              designation,
              date_export: new Date().toISOString()
            })
          })
          .then(() => {
            toast.success('Export PDF IRSA enregistré dans l\'historique.');
            if (typeof setRefreshKey === 'function') setRefreshKey(Date.now());
          })
          .catch(histErr => {
            console.error('Erreur historique PDF:', histErr);
          });
        }
      })
      .catch(() => {
        toast.error('Erreur lors de la génération du PDF.');
      });
  };
  const exportLabel = selectedHisto === 'histo_xml' ? 'Exporter' : selectedHisto === 'histo_pdf' ? 'Exporter' : 'Exporter';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Box
        sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid #ccc',
        }}
    >
    <Typography variant="h6">Exporter IRSA</Typography>
    <IconButton onClick={onClose} sx={{ color: 'red' }} size="small">
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>

      <DialogContent>
           <Box mb={0}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Afficher l'historique</FormLabel>
            <RadioGroup
              row
              aria-label="historique"
              name="historique-radio-group"
              sx={{ gap: 1 }}
              value={selectedHisto}
              onChange={e => setSelectedHisto(e.target.value)}
            >
            <FormControlLabel
                value="histo_xml"
                control={<Radio size="small" />}
                label="XML"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' }, mr: 1 }}
            />
            <FormControlLabel
                value="histo_pdf"
                control={<Radio size="small" />}
                label="PDF"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' }, mr: 1 }}
            />
            <FormControlLabel
                value="histo_csv"
                control={<Radio size="small" />}
                label="EXCEL"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
            />
            </RadioGroup>
            <Box display="flex" flexDirection="column" alignItems="left" justifyContent="center" height={50} mb={2}>
          <Button
            variant="contained"
            color="success"
            onClick={handleExport}
            sx={{ width: 100, fontWeight: 100, fontSize: 12 }}
          >
            {exportLabel}
          </Button>
        </Box>
          </FormControl>
        </Box>
        {selectedHisto === 'histo_xml' && (
          <HistoriqueIrsaTable refreshKey={refreshKey} exportType="XML" />
        )}
        {selectedHisto === 'histo_pdf' && (
          <HistoriqueIrsaTable refreshKey={refreshKey} exportType="PDF" />
        )}
        {selectedHisto === 'histo_csv' && (
          <Box minHeight={120} display="flex" alignItems="center" justifyContent="center">
            <span style={{ color: '#888' }}>Aucun historique CSV disponible.</span>
          </Box>
        )}

      </DialogContent>
    
    </Dialog>
  );
}
