import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
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
  FormControlLabel
} from '@mui/material';
import { Edit, Delete, Add, Check, Close } from '@mui/icons-material';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';

export default function ControlesMatrix() {
  const axiosPrivate = useAxiosPrivate();

  const [matrices, setMatrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState(null);

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
    Commentaire: ''
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
        Commentaire: matrix.Commentaire || ''
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
        Commentaire: ''
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

      if (editingMatrix) {
        await axiosPrivate.put(`/param/revisionControleMatrix/${editingMatrix.id}`, payload);
      } else {
        await axiosPrivate.post('/param/revisionControleMatrix', payload);
      }

      fetchMatrices();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving controle matrix:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matrice de contrôle ?')) {
      try {
        await axiosPrivate.delete(`/param/revisionControleMatrix/${id}`);
        fetchMatrices();
      } catch (error) {
        console.error('Error deleting controle matrix:', error);
      }
    }
  };

  const handleValidationToggle = async (matrix) => {
    try {
      await axiosPrivate.put(`/param/revisionControleMatrix/validation/${matrix.id}`, {
        Valider: !matrix.Valider,
        Commentaire: matrix.Commentaire
      });
      fetchMatrices();
    } catch (error) {
      console.error('Error updating validation:', error);
    }
  };
  return (
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
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
          Matrices de Contrôles
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter une matrice
        </Button>
      </Box>

      {/* Table */}
      {matrices.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucune matrice de contrôle trouvée.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>ID Contrôle</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Compte</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Test</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Anomalies</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Validé</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Actions</TableCell>
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
                  <TableCell align="center" sx={{ py: 0.5 }}>
                    <Chip
                      label={matrix.Valider ? 'Oui' : 'Non'}
                      color={matrix.Valider ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Button
                        color="success"
                        variant="contained"
                        size="small"
                        startIcon={<Check />}
                        onClick={() => handleValidationToggle(matrix)}
                        sx={{ height: '25px', borderRadius: '1px' }}
                      >
                        {matrix.Valider ? 'Invalider' : 'Valider'}
                      </Button>
                      <Button
                        color="primary"
                        variant="contained"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleOpenDialog(matrix)}
                        sx={{ height: '25px', borderRadius: '1px' }}
                      >
                        Modifier
                      </Button>
                      <Button
                        color="error"
                        variant="contained"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(matrix.id)}
                        sx={{ height: '25px', borderRadius: '1px' }}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMatrix ? 'Modifier la matrice' : 'Ajouter une matrice'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="ID Contrôle"
              value={formData.id_controle}
              onChange={(e) => setFormData({ ...formData, id_controle: e.target.value })}
              fullWidth
              disabled={!!editingMatrix}
            />
            <TextField
              label="Type"
              value={formData.Type}
              onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
              fullWidth
            />
            <TextField
              label="Compte"
              value={formData.compte}
              onChange={(e) => setFormData({ ...formData, compte: e.target.value })}
              fullWidth
            />
            <TextField
              label="Test"
              value={formData.test}
              onChange={(e) => setFormData({ ...formData, test: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Anomalies"
              value={formData.anomalies}
              onChange={(e) => setFormData({ ...formData, anomalies: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Détails"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Commentaire"
              value={formData.Commentaire}
              onChange={(e) => setFormData({ ...formData, Commentaire: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.Valider}
                  onChange={(e) => setFormData({ ...formData, Valider: e.target.checked })}
                  color="primary"
                />
              }
              label="Validé"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMatrix ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
