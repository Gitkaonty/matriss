import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
} from '@mui/material';
import { Delete, Add, Edit } from '@mui/icons-material';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import PopupActionConfirm from '../../../componentsTools/popupActionConfirm';

export default function ControlesMatrix() {
  const axiosPrivate = useAxiosPrivate();

  const [matrices, setMatrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState(null);

  // Popup de confirmation pour Activer/Désactiver
  const [confirmTogglePopup, setConfirmTogglePopup] = useState({ open: false, matrix: null, action: '' });
  const [confirmToggleLoading, setConfirmToggleLoading] = useState(false);

  const fetchMatrices = async () => {
    try {
      const response = await axiosPrivate.get('/param/revisionControleMatrix');
      if (response.data.state) {
        setMatrices(response.data.matrices);
      }
    } catch (error) {
      console.error('Error fetching controle matrices:', error);
    }
  };

  useEffect(() => {
    fetchMatrices();
  }, []);

  const [formData, setFormData] = useState({
    id_controle: '',
    Type: '',
    compte: '',
    test: '',
    description: '',
    anomalies: '',
    details: '',
    Valider: false,
    Commentaire: '',
    paramUn: ''
  });

  const handleOpenDialog = (matrix = null) => {
    setEditingMatrix(matrix);
    if (matrix) {
      setFormData({
        id_controle: matrix.id_controle || '',
        Type: matrix.Type || '',
        compte: matrix.compte || '',
        test: matrix.test || '',
        description: matrix.description || '',
        anomalies: matrix.anomalies || '',
        details: matrix.details || '',
        Valider: matrix.Valider || false,
        Commentaire: matrix.Commentaire || '',
        paramUn: matrix.paramUn || ''
      });
    } else {
      setFormData({
        id_controle: '',
        Type: '',
        compte: '',
        test: '',
        description: '',
        anomalies: '',
        details: '',
        Valider: false,
        Commentaire: '',
        paramUn: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMatrix(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };

      console.log('Editing matrix ID:', editingMatrix?.id);
      console.log('Editing matrix id_controle:', editingMatrix?.id_controle);
      console.log('Payload to send:', payload);

      // Utiliser le même endpoint POST pour l'ajout et la modification
      // Le backend gère automatiquement la mise à jour si id_controle existe
      console.log('Sending to addOrUpdate endpoint:', payload);
      await axiosPrivate.post('/param/revisionControleMatrix', payload);

      fetchMatrices();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving controle matrix:', error);
      alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('êtes-vous sûr de vouloir supprimer cette matrice de contrôle ?')) {
      try {
        await axiosPrivate.delete(`/param/revisionControleMatrix/${id}`);
        fetchMatrices();
      } catch (error) {
        console.error('Error deleting controle matrix:', error);
      }
    }
  };

  const handleValidationToggleClick = (matrix) => {
    setConfirmTogglePopup({ 
      open: true, 
      matrix, 
      action: matrix.Valider ? 'desactiver' : 'activer' 
    });
  };

  const handleConfirmToggle = async (confirmed) => {
    if (!confirmed || !confirmTogglePopup.matrix) {
      setConfirmTogglePopup({ open: false, matrix: null, action: '' });
      return;
    }

    setConfirmToggleLoading(true);
    try {
      await axiosPrivate.put(`/param/revisionControleMatrix/validation/${confirmTogglePopup.matrix.id}`, {
        Valider: !confirmTogglePopup.matrix.Valider,
        Commentaire: confirmTogglePopup.matrix.Commentaire
      });
      fetchMatrices();
    } catch (error) {
      console.error('Error updating validation:', error);
    } finally {
      setConfirmToggleLoading(false);
      setConfirmTogglePopup({ open: false, matrix: null, action: '' });
    }
  };
  return (
    <>
      {confirmTogglePopup.open && (
        <PopupActionConfirm
          msg={confirmTogglePopup.action === 'activer' 
            ? `Voulez-vous activer cette matrice de contrôle ?` 
            : `Voulez-vous désactiver cette matrice de contrôle ?`}
          confirmationState={handleConfirmToggle}
          isLoading={confirmToggleLoading}
        />
      )}
      <Box sx={{ p: 2, height: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          backgroundColor: 'white',
          p: 2,
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h7" sx={{ fontWeight: 600, color: '#333' }}>
            paramétrages-contrôle
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ height: '25px', textTransform: 'none' }}
          >
            Ajouter une matrice
          </Button>
        </Box>

        {/* Table */}
        {matrices.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            aucune matrice de contrôle trouvée.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>id contrôle</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>compte</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5, width: '100px' }}>
                    test
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 0.5, width: '500px' }}>
                    description
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5, width: '500px' }}>
                    anomalies
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5, width: '300px' }}>
                    paramUn
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5, width: '100px' }}>activé</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5, width: '100px' }}>actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matrices.map((matrix) => (
                  <TableRow
                    key={matrix.id}
                    hover
                    sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
                  >
                    <TableCell sx={{ py: 0.5 }}>{matrix.id_controle}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{matrix.Type}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{matrix.compte}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ maxHeight: '30px', overflow: 'auto', fontSize: '13px', pr: 1 }}>
                        {matrix.test}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ maxHeight: '30px', overflow: 'auto', fontSize: '13px', pr: 1 }}>
                        {matrix.description}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ maxHeight: '30px', overflow: 'auto', fontSize: '13px', pr: 1 }}>
                        {matrix.anomalies || '-'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ maxHeight: '30px', overflow: 'auto', fontSize: '13px', pr: 1 }}>
                        {matrix.paramUn !== null && matrix.paramUn !== undefined ? matrix.paramUn.toString() : '-'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Chip
                        label={matrix.Valider ? 'oui' : 'non'}
                        color={matrix.Valider ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 500, height: '25px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start' }}>
                        <Button
                          color="success"
                          variant="contained"
                          size="small"
                          onClick={() => handleValidationToggleClick(matrix)}
                          sx={{ height: '25px', borderRadius: '1px', textTransform: 'none' }}
                        >
                          {matrix.Valider ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          color="primary"
                          variant="contained"
                          size="small"
                          // startIcon={<Edit />}
                          onClick={() => handleOpenDialog(matrix)}
                          sx={{ height: '25px', borderRadius: '1px', textTransform: 'none' }}
                        >
                          Modifier
                        </Button>
                        <Button
                          color="error"
                          variant="contained"
                          size="small"
                          // startIcon={<Delete />}
                          onClick={() => handleDelete(matrix.id)}
                          sx={{ height: '25px', borderRadius: '1px', textTransform: 'none' }}
                        >
                          Supprimer
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog pour ajouter/modifier une matrice */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingMatrix ? 'Modifier la matrice' : 'Ajouter une matrice'}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={1} pt={1}>

              {[
                { label: "id contrôle :", name: "id_controle", disabled: !!editingMatrix },
                { label: "type :", name: "Type" },
                { label: "compte :", name: "compte" },
                { label: "test :", name: "test" },
                { label: "description :", name: "description" },
                { label: "anomalies :", name: "anomalies" },
                { label: "détails", name: "details" },
                { label: "paramUn :", name: "paramUn", type: "number" },
                { label: "commentaire", name: "Commentaire" },
              ].map((field) => (

                <Box key={field.name} display="flex" alignItems="center" gap={1}>

                  {/* LABEL */}
                  <Box
                    sx={{
                      width: "100px",
                      fontWeight: 500,
                      height: "32px",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    {field.label}
                  </Box>

                  {/* INPUT */}
                  <TextField
                    value={formData[field.name]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    disabled={field.disabled}
                    type={field.type || "text"}
                    size="small"
                    sx={{
                      width: "350px",
                      "& .MuiInputBase-root": {
                        height: "32px"
                      },
                      "& .MuiInputBase-input": {
                        padding: "4px 8px"
                      }
                    }}
                  />
                </Box>
              ))}

              {/* SWITCH */}
              <Box display="flex" alignItems="center" gap={2}>
                <Switch
                  checked={formData.Valider}
                  onChange={(e) =>
                    setFormData({ ...formData, Valider: e.target.checked })
                  }
                  size="small"
                  sx={{ height: "32px" }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ height: '25px', textTransform: 'none' }}>Annuler</Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ height: '25px', textTransform: 'none' }}>
              {editingMatrix ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
