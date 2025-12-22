import React, { useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LogoutIcon from '@mui/icons-material/Logout';
import { PiWarningFill } from "react-icons/pi";
import { VscClose } from 'react-icons/vsc';
import ImportPaieCsvButton from './ImportPaieCsvButton';
import VirtualTableAnomalies from './VirtualTableAnomalies';
import { AiTwotoneFileText } from "react-icons/ai";
import { FaFileImport } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { MdOutlineFileUpload } from "react-icons/md";

export default function PaieImportExportDialog({ open, onClose, paieColumns, onImport, onDownload, onAnomalie, personnels, mois, annee }) {
  const fileInputRef = useRef();
  const [anomalies, setAnomalies] = useState([]);
  const [showAnomaliesInline, setShowAnomaliesInline] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleAnomaliesReceived = (detectedAnomalies) => {
    console.log('[DEBUG] PaieImportExportDialog - Anomalies reçues:', detectedAnomalies);
    setAnomalies(detectedAnomalies);
    console.log('[DEBUG] PaieImportExportDialog - État anomalies mis à jour, longueur:', detectedAnomalies.length);
    // Afficher automatiquement le tableau des anomalies en bas
    if (detectedAnomalies && detectedAnomalies.length > 0) {
      setShowAnomaliesInline(true);
    }
  };

  const handleShowAnomalies = () => {
    console.log('[DEBUG] PaieImportExportDialog - Bouton Anomalie cliqué');
    console.log('[DEBUG] PaieImportExportDialog - Anomalies actuelles:', anomalies);
    // Toggle affichage inline
    setShowAnomaliesInline(prev => !prev);
  };

  // Colonnes VirtualTableAnomalies
  const anomalyColumns = [
    { id: 'ligne', label: 'Ligne', minWidth: 80 },
    { 
      id: 'matricule', label: 'Matricule / Personnel', minWidth: 180,
      valueGetter: ({ row }) => {
        const data = row?.data || {};
        return data.matricule || data.Matricule || data.matricule_employe || data.personnel_id || data.personnelId || 'N/A';
      }
    },
    {
      id: 'nom', label: 'Nom/Prénom', minWidth: 200,
      valueGetter: ({ row }) => {
        const data = row?.data || {};
        const id = data.personnel_id || data.personnelId;
        const matricule = data.matricule || data.Matricule || data.matricule_employe;
        let p = undefined;
        if (id != null) p = (personnels || []).find(x => String(x.id) === String(id));
        if (!p && matricule) {
          const normalize = (m) => String(m ?? '').replace(/\s/g, '').toLowerCase();
          p = (personnels || []).find(x => normalize(x.matricule) === normalize(matricule));
        }
        return p ? `${p.nom || ''} ${p.prenom || ''}`.trim() : 'Personnel introuvable';
      }
    },
    {
      id: 'type', label: "Type d'erreur", minWidth: 160,
      valueGetter: ({ row }) => {
        const errs = Array.isArray(row?.errors) ? row.errors : [];
        return errs[0] || 'inconnue';
      }
    },
    { id: 'description', label: 'Description', minWidth: 420,
      valueGetter: ({ row }) => row?.description || '' }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"   // tu peux mettre "xs", "sm", "md"
      PaperProps={{
        sx: {
          width: 600,   // largeur fixe en px
          maxHeight: 600, // limite la hauteur
          borderRadius: 1, // coins arrondis comme dans ta capture
        },
      }}
    >
        <DialogTitle sx={{ px: 2, py: 1.5 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
            <Typography sx={{ fontWeight: 700, color: 'black' }}>
              Importation des paies :
            </Typography>

            <Button
              onClick={handleShowAnomalies}
              startIcon={
                <Badge 
                  badgeContent={anomalies.length}
                  color="error"
                  overlap="circular"
                >
                  <IoWarningOutline size={22}/>
                </Badge>
              }
              sx={{ 
                minWidth: "auto",      // enlève le padding large du bouton
                padding: 0.5,          // bouton plus compact
                color: 'red', 
                backgroundColor: 'transparent',
                marginTop: -0.5
              }}
            />
            </Box>

            <IconButton onClick={onClose} size="medium" sx={{ color: '#e53935' }}>
              <VscClose />
            </IconButton>
          </Box>
        </DialogTitle>
      <DialogContent>
        <Stack
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          sx={{ mt: 1.5, mb: 2 }}
        >
          {/* Bouton Télécharger le modèle (ne ferme plus le dialog) */}
          <Button
            onClick={() => { onDownload(); }}
            sx={{
              width: 260,
              height: 40,
              border: '1px dashed rgba(5,96,116,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textTransform: 'none',
              backgroundColor: 'transparent',
              color: '#164b6b',
              '&:hover': { backgroundColor: 'rgba(5,96,116,0.05)' },
            }}
            endIcon={<MdOutlineFileUpload size={22} />}
          >
            Télécharger le modèle d'import
          </Button>

          {/* Bouton Importer CSV (ne ferme plus le dialog automatiquement) */}
          <ImportPaieCsvButton
            personnels={personnels}
            paieColumns={paieColumns}
            onImport={(data) => { onImport(data); }}
            onAnomalies={handleAnomaliesReceived}
            mois={mois}
            annee={annee}
            sx={{
              width: 260,
              height: 40,
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          />
        </Stack>

        {showAnomaliesInline && anomalies.length > 0 && (
            <VirtualTableAnomalies
              columns={anomalyColumns}
              rows={anomalies}
              personnels={personnels}
            />
        )}
      </DialogContent>

      
      <DialogActions sx={{ justifyContent: 'right', pb: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            minWidth: 110,
            textTransform: 'none',
          }}
        >
          Annuler
        </Button>
      </DialogActions>
      
      {/* Suppression de l'ancien dialog anomalies: maintenant inline */}
    </Dialog>
  );
}
