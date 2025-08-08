import React, { useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningIcon from '@mui/icons-material/Warning';
import ImportPaieCsvButton from './ImportPaieCsvButton';
import CsvAnomaliesDialog from './CsvAnomaliesDialog';

export default function PaieImportExportDialog({ open, onClose, paieColumns, onImport, onDownload, onAnomalie, personnels, mois, annee }) {
  const fileInputRef = useRef();
  const [anomalies, setAnomalies] = useState([]);
  const [anomaliesDialogOpen, setAnomaliesDialogOpen] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleAnomaliesReceived = (detectedAnomalies) => {
    console.log('[DEBUG] PaieImportExportDialog - Anomalies reçues:', detectedAnomalies);
    setAnomalies(detectedAnomalies);
    console.log('[DEBUG] PaieImportExportDialog - État anomalies mis à jour, longueur:', detectedAnomalies.length);
    
    // Ouvrir automatiquement le dialogue des anomalies si des anomalies sont détectées
    // if (detectedAnomalies.length > 0) {
    //   console.log('[DEBUG] PaieImportExportDialog - Ouverture automatique du dialogue anomalies');
    //   setAnomaliesDialogOpen(true);
    // }
  };

  const handleShowAnomalies = () => {
    console.log('[DEBUG] PaieImportExportDialog - Bouton Anomalie cliqué');
    console.log('[DEBUG] PaieImportExportDialog - Anomalies actuelles:', anomalies);
    console.log('[DEBUG] PaieImportExportDialog - Ouverture du dialogue anomalies');
    setAnomaliesDialogOpen(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth maxHeight="md">
      <DialogTitle sx={{ textAlign: 'left', fontWeight: 700 ,backgroundColor:'rgba(5,96,116,0.05)'}}>Import / Export Paie</DialogTitle>
      <DialogContent>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2, mb: 2 }}>
          {/* Bouton Télécharger le modèle */}
          <Button
            onClick={() => { onDownload(); onClose(); }}
            sx={{
              width: "200px",
              height: "40px",
              border: '1px dashed rgba(5,96,116,0.60)',
              marginRight: "8px",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textTransform: 'none',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(5,96,116,0.05)',
              }
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: "black", fontSize: '0.75rem', fontWeight: "bold" }}
            >
              Télécharger modèle
            </Typography>
            <LogoutIcon
              sx={{
                width: "25px",
                height: "20px",
                color: 'rgba(5,96,116,0.60)',
                transform: "rotate(270deg)"
              }}
            />
          </Button>

          {/* Bouton Importer CSV */}
          <ImportPaieCsvButton 
            personnels={personnels} 
            paieColumns={paieColumns} 
            onImport={(data) => { onImport(data); onClose(); }} 
            onAnomalies={handleAnomaliesReceived}
            mois={mois} 
            annee={annee} 
          />

           {/* Bouton Anomalie */}
           <Button
            onClick={handleShowAnomalies}
            sx={{
              width: "150px",
              height: "40px",
              border: '1px dashed rgba(255, 87, 34, 0.8)', 
              marginRight: "8px",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textTransform: 'none',
              backgroundColor: 'rgba(241, 105, 63, 0.88)', 
              color: 'rgba(138, 37, 6, 0.9)', 
              '&:hover': {
                backgroundColor: 'rgba(255, 87, 34, 0.2)', 
              }
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: "black", fontSize: '0.75rem', fontWeight: "bold" }}
            >
              Anomalie
            </Typography>
            <WarningIcon
              sx={{
                width: "25px",
                height: "20px",
                color: 'rgba(255,152,0,0.80)'
              }}
            />
          </Button>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'right', pb: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          sx={{
            minWidth: '120px',
            textTransform: 'none',
            fontWeight: 'bold',
          }}
        >
          Fermer
        </Button>
      </DialogActions>
      
      {/* Dialog des anomalies CSV */}
      <CsvAnomaliesDialog
        open={anomaliesDialogOpen}
        onClose={() => setAnomaliesDialogOpen(false)}
        anomalies={anomalies}
        personnels={personnels}
      />
    </Dialog>
  );
}
