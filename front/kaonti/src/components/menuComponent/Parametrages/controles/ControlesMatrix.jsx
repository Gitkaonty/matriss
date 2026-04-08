import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Button,
  TextField,
  Grid,
  Chip,
  Alert,
  Paper,
  Switch,
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  Breadcrumbs,
  Checkbox,
  GlobalStyles,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  InputLabel
} from '@mui/material';

import { useFormik } from 'formik';
import * as yup from 'yup';

import { Delete, Add, Edit, Check, CommentOutlined } from '@mui/icons-material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import PopupActionConfirm from '../../../componentsTools/popupActionConfirm';

import GridViewIcon from '@mui/icons-material/GridView';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import AddIcon from '@mui/icons-material/Add';

// Icônes modernes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';

const NAV_DARK = '#0B1120';
const BORDER_COLOR = '#E2E8F0';
const NEON_MINT = '#00FF94';

export default function ControlesMatrix() {
  const axiosPrivate = useAxiosPrivate();

  const [matrices, setMatrices] = useState([]);
  const [filteredMatrices, setFilteredMatrices] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState(null);
  const [selectedRow, setSelectedRow] = useState([]); // Ligne sélectionnée

  // Popup de confirmation pour Activer/Désactiver
  const [confirmTogglePopup, setConfirmTogglePopup] = useState({ open: false, matrix: null, action: '' });
  const [confirmToggleLoading, setConfirmToggleLoading] = useState(false);

  // Données pour les listes déroulantes
  const [types, setTypes] = useState([]);
  const [tests, setTests] = useState([]);

  const fetchMatrices = async () => {
    try {
      const response = await axiosPrivate.get('/param/revisionControleMatrix');
      if (response.data.state) {
        setMatrices(response.data.matrices);

        // Extraire les types et tests uniques pour les listes déroulantes
        const uniqueTypes = [...new Set(response.data.matrices.map(m => m.Type).filter(Boolean))];
        const uniqueTests = [...new Set(response.data.matrices.map(m => m.test).filter(Boolean))];

        setTypes(uniqueTypes);
        setTests(uniqueTests);
      }
    } catch (error) {
      console.error('Error fetching controle matrices:', error);
    }
  };

  // Fonction de filtrage pour la recherche multi-colonnes
  const handleSearch = (searchValue) => {
    setSearchText(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredMatrices(matrices);
      return;
    }

    const filtered = matrices.filter(row => {
      const searchLower = searchValue.toLowerCase();
      return (
        (row.Type && row.Type.toLowerCase().includes(searchLower)) ||
        (row.test && row.test.toLowerCase().includes(searchLower)) ||
        (row.Compte && row.Compte.toLowerCase().includes(searchLower)) ||
        (row.Libelle && row.Libelle.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredMatrices(filtered);
  };

  // Mettre à jour filteredMatrices quand matrices change
  useEffect(() => {
    setFilteredMatrices(matrices);
  }, [matrices]);

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

  const handleOpenDialog = () => {
    // Vérifier si une ligne est sélectionnée pour modification
    if (selectedRow.length !== 1) {
      alert('Veuillez sélectionner une seule ligne pour modifier');
      return;
    }
    const matrix = matrices.find(m => m.id === selectedRow[0]);
    if (!matrix) return;

    setEditingMatrix(matrix);
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
    setOpenDialog(true);
  };

  const handleOpenDialogCreate = () => {
    // Pour créer, pas besoin de sélection
    setEditingMatrix(null);
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMatrix(null);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = { ...values };

      // Utiliser le même endpoint POST pour l'ajout et la modification
      // Le backend gère automatiquement la mise à jour si id_controle existe
      await axiosPrivate.post('/param/revisionControleMatrix', payload);

      fetchMatrices();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving controle matrix:', error);
      console.error('Error response:', error.response?.data);
      alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    // Vérifier si une ligne est sélectionnée
    if (selectedRow.length !== 1) {
      alert('Veuillez sélectionner une seule ligne pour supprimer');
      return;
    }
    const id = selectedRow[0];

    if (window.confirm('êtes-vous sûr de vouloir supprimer cette matrice de contrôle ?')) {
      try {
        await axiosPrivate.delete(`/param/revisionControleMatrix/${id}`);
        fetchMatrices();
        setSelectedRow([]);
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

  const validationSchema = yup.object({
    id_controle: yup.string().required('ID requis'),
    Type: yup.string().required('Type requis'),
    compte: yup.string().required('Compte requis'),
    anomalies: yup.string().required('Anomalies requises'),
    test: yup.string().required('Test requis'),
    description: yup.string().required('Description requise'),
    paramUn: yup.string().required('Paramètre requis'),
    // Le commentaire et le switch sont optionnels par défaut
  });

  const formik = useFormik({
    initialValues: formData, // On utilise tes données initiales
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSubmit(values); // Appelle ta fonction de sauvegarde
    },
  });

  // Colonnes DataGrid modernes
  const columns = [
    {
      field: 'id_controle',
      headerName: 'ID Contrôle',
      width: 150,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'Type',
      headerName: 'Type',
      width: 150,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'compte',
      headerName: 'Compte',
      width: 80,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '11px', fontWeight: 800 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'test',
      headerName: 'Test',
      width: 100,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'anomalies',
      headerName: 'Anomalies',
      flex: 1,
      minWidth: 150,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'paramUn',
      headerName: 'Param.',
      width: 80,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'Valider',
      headerName: 'Activé',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Switch
          size="small"
          checked={params.value}
          onChange={() => handleValidationToggleClick(params.row)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            disabled={!selectedRow.includes(params.row.id)}
            onClick={() => {
              const matrix = params.row;
              setEditingMatrix(matrix);
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
              setOpenDialog(true);
            }}
            sx={{ color: '#64748B', '&:hover': { color: NAV_DARK } }}
          >
            <Edit sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            disabled={!selectedRow.includes(params.row.id)}
            onClick={() => {
              if (window.confirm('êtes-vous sûr de vouloir supprimer cette matrice de contrôle ?')) {
                axiosPrivate.delete(`/param/revisionControleMatrix/${params.row.id}`).then(() => {
                  fetchMatrices();
                });
              }
            }}
            sx={{ color: '#CBD5E1', '&:hover': { color: '#EF4444' } }}
          >
            <Delete sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: "id_controle", label: 'ID Contrôle', icon: <BadgeOutlinedIcon fontSize="small" />, disabled: !!editingMatrix },
    { name: "Type", label: 'Type', icon: <AccountTreeOutlinedIcon fontSize="small" /> },
    { name: "compte", label: 'Compte', icon: <AccountBalanceOutlinedIcon fontSize="small" /> },
    { name: "anomalies", label: 'Anomalies', icon: <ReportProblemOutlinedIcon fontSize="small" /> },
    { name: "details", label: 'Détails' },
    { name: "test", label: 'Test', icon: <FindInPageOutlinedIcon fontSize="small" /> },
    { name: "description", label: 'Description', icon: <ListAltOutlinedIcon fontSize="small" /> },
    { name: "paramUn", type: "number", label: 'ParamUn', icon: <SettingsOutlinedIcon fontSize="small" /> },
    { label: "commentaire :", name: "Commentaire", multiline: true },
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <GlobalStyles styles={{ body: { margin: 0, padding: 0 } }} />

      <Box sx={{ p: 4 }}>
        {/* BREADCRUMBS */}
 
          <Typography variant='h6' sx={{ color: NAV_DARK, fontWeight: 700 }}>Contrôles</Typography>

        {/* TITRE & ACTION */}
        <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" sx={{ mb: 3 , mt: 2 }}>
          <Stack
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="flex-end"   // tout passe à droite
            sx={{ mt: -5}}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                placeholder="Rechercher ..."
                size="small"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#fff',
                    height: '32px',
                    fontSize: '12px'
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialogCreate()}
                sx={{
                  bgcolor: NEON_MINT,
                  textTransform: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  height: '32px',
                  mr: 2,
                  color: '#000',
                  borderRadius: '6px',
                  px: 2,
                  '&:hover': {
                    bgcolor: '#00E685',
                    transform: 'translateY(-1px)'
                  },
                }}
              >
                Ajouter une matrice
              </Button>
            </Stack>

          </Stack>
        </Stack>

        {/* Popup de confirmation Activer/Désactiver */}
        {confirmTogglePopup.open && (
          <PopupActionConfirm
            msg={confirmTogglePopup.action === 'activer'
              ? `Voulez-vous activer cette matrice de contrôle ?`
              : `Voulez-vous désactiver cette matrice de contrôle ?`}
            confirmationState={handleConfirmToggle}
            isLoading={confirmToggleLoading}
          />
        )}

        {/* Table DataGrid moderne */}
        {matrices.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            aucune matrice de contrôle trouvée.
          </Alert>
        ) : (
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: '16px',
              bgcolor: '#fff',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <DataGrid
              disableMultipleSelection={DataGridStyle.disableMultipleSelection}
              disableColumnSelector={DataGridStyle.disableColumnSelector}
              disableDensitySelector={DataGridStyle.disableDensitySelector}
              disableRowSelectionOnClick
              disableSelectionOnClick={true}
              localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
              sx={{
                border: 'none',
                borderRadius: '16px',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F8FAFC',
                  color: '#64748B',
                  fontWeight: 800,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                  minHeight: '45px !important',
                  maxHeight: '45px !important',
                },
                '& .MuiDataGrid-columnHeader': {
                  height: '45px !important',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: '#64748B',
                  fontWeight: 800,
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                },
                '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                  color: '#64748B',
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '12px',
                  color: '#475569',
                  borderBottom: '1px solid #F1F5F9',
                  py: 1,
                },
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                  outline: 'none',
                  border: 'none',
                },
                '& .MuiDataGrid-row': {
                  '&:hover': { bgcolor: '#F1F5F9' },
                  transition: '0.2s',
                  minHeight: '40px !important',
                  maxHeight: '40px !important',
                },
                '& .MuiDataGrid-main': {
                  height: '100%',
                },
              }}
              rowHeight={40}
              columnHeaderHeight={45}
              columns={columns}
              rows={filteredMatrices}
              pageSizeOptions={[50, 100]}
              checkboxSelection={DataGridStyle.checkboxSelection}
              rowSelectionModel={selectedRow}
              onRowSelectionModelChange={(ids) => setSelectedRow(ids)}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 100 },
                },
              }}
            />
          </Paper>
        )}
      </Box>

      {/* Dialog pour ajouter/modifier une matrice */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography fontWeight={800} fontSize={20} color="#1E293B">
                  {editingMatrix ? "Modifier la matrice" : "Ajouter une matrice"}
                </Typography>
                <Typography fontSize={12} color="#64748B">Remplissez les champs obligatoires</Typography>
              </Box>
              <Box sx={{ color: "#CBD5E1" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" /></svg>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              {fields.map((field) => (
                <Grid item xs={12} md={field.multiline ? 12 : 6} key={field.name}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Box sx={{ width: 4, height: 14, bgcolor: formik.touched[field.name] && formik.errors[field.name] ? "#EF4444" : "#3B82F6", borderRadius: 1 }} />
                    <Typography fontSize={11} fontWeight={700} color="#475569" sx={{ textTransform: 'uppercase' }}>
                      {field.label}
                    </Typography>
                  </Box>

                  {field.name === 'Type' || field.name === 'test' ? (
                    <FormControl fullWidth size="small">
                      {/* <InputLabel sx={{ fontSize: '13px', backgroundColor: '#F8FAFC', px: 1 }}>
                        {field.name === 'Type' ? 'Type' : 'Test'}
                      </InputLabel> */}
                      <Select
                        name={field.name}
                        value={formik.values[field.name]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                        sx={{
                          borderRadius: "11px",
                          backgroundColor: "#F8FAFC",
                          height: "35px", // Force la hauteur comme tes TextFields
                          fontSize: "11px", // Taille du texte choisi
                          "& .MuiSelect-select": {
                            paddingTop: 0,
                            paddingBottom: 0,
                            display: "flex",
                            alignItems: "center",
                            height: "35px", // Aligne parfaitement le texte verticalement
                            paddingLeft: "12px",
                          },
                          "& fieldset": { borderColor: "#E2E8F0" },
                        }}
                        // Pour éviter que le texte long ne pousse les murs après sélection
                        renderValue={(selected) => (
                          <Box sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '90%' // Laisse de la place pour la flèche
                          }}>
                            {selected}
                          </Box>
                        )}
                      >
                        {(field.name === 'Type' ? types : tests).map((item) => (
                          <MenuItem key={item} value={item} sx={{ fontSize: '11px' }}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched[field.name] && formik.errors[field.name] && (
                        <Typography fontSize='11px' color="#EF4444" mt={0}>
                          {formik.errors[field.name]}
                        </Typography>
                      )}
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      name={field.name}
                      type={field.type || "text"}
                      multiline={field.multiline}
                      rows={field.multiline ? 2 : 1}
                      disabled={field.disabled}
                      value={formik.values[field.name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                      helperText={formik.touched[field.name] && formik.errors[field.name]}
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: "11px",
                          backgroundColor: "#F8FAFC",
                          fontSize: "11px",
                          height: field.multiline ? "auto" : "35px",
                        },
                        "& .MuiFormHelperText-root": { fontSize: '11px', mt: 0 }
                      }}
                    />
                  )}
                </Grid>
              ))}

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="space-between"
                  sx={{ backgroundColor: "#F1F5F9", borderRadius: "12px", px: 2, py: 1 }}>
                  <Typography fontWeight={700} fontSize={13} color="#1E293B">Activer ou désactiver la matrice</Typography>
                  <Switch
                    size="small"
                    name="Valider"
                    checked={formik.values.Valider}
                    onChange={formik.handleChange}
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button onClick={handleCloseDialog} sx={{ textTransform: "none", color: "#64748B" }}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" disableElevation
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: "11px", backgroundColor: "#1E40AF", px: 4 }}>
              {editingMatrix ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
