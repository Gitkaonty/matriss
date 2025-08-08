import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

/**
 * Menu Import/Export Paie (un seul bouton, deux actions)
 * @param {Object[]} paieColumns
 * @param {Function} onImportCsv (callback handlePaieImport)
 */
export default function PaieImportExportMenu({ paieColumns, onImportCsv }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef();

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleDownload = async () => {
    try {
      const response = await axios.get('/paie/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modele_import_paie.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erreur lors du téléchargement du modèle : ' + (error?.response?.data || error.message));
    }
    handleCloseMenu();
  };


  const handleImportClick = () => {
    fileInputRef.current && fileInputRef.current.click();
    handleCloseMenu();
  };

  const handleFileChange = (e) => {
    if (onImportCsv) onImportCsv(e);
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={handleOpenMenu}
        size="small"
        sx={{ minWidth: 44, height: 35, borderRadius: 2, marginRight: 1, textTransform: 'none' }}
      >
        Import/Export
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleDownload}>
          <DownloadIcon fontSize="small" style={{ marginRight: 8 }} />
          Télécharger le modèle d'import
        </MenuItem>
        <MenuItem onClick={handleImportClick}>
          <UploadFileIcon fontSize="small" style={{ marginRight: 8 }} />
          Importer CSV
        </MenuItem>
      </Menu>
    </>
  );
}
