// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box,
//   Typography,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Chip,
//   Alert,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Switch,
//   FormControlLabel
// } from '@mui/material';
// import { Edit, Delete, Add, Check, Close } from '@mui/icons-material';
// import { init } from '../../../../../init';
// import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';

// export default function Controles() {
//   let initial = init[0];
//   const axiosPrivate = useAxiosPrivate();

//   const [controles, setControles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [editingControle, setEditingControle] = useState(null);
//   const [listeExercice, setListeExercice] = useState([]);
//   const [selectedExerciceId, setSelectedExerciceId] = useState(0);

//   // Récupérer les IDs depuis sessionStorage ou URL
//   const getIds = () => {
//     const pathParts = window.location.pathname.split('/');
//     return {
//       id_compte: parseInt(sessionStorage.getItem('compteId')) || 1,
//       id_dossier: parseInt(sessionStorage.getItem('fileId')) || 1,
//       id_exercice: selectedExerciceId || parseInt(sessionStorage.getItem('exerciceId')) || 1
//     };
//   };

//   const fetchExercices = async () => {
//     try {
//       const { id_dossier } = getIds();
//       const response = await axiosPrivate.get(`/paramExercice/listeExercice/${id_dossier}`);
//       const resData = response.data;
//       if (resData.state) {
//         setListeExercice(resData.list);
//         if (resData.list && resData.list.length > 0 && selectedExerciceId === 0) {
//           setSelectedExerciceId(resData.list[0].id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching exercices:', error);
//     }
//   };

//   const fetchControles = useCallback(async () => {
//     if (!selectedExerciceId) return;
    
//     try {
//       setLoading(true);
//       const { id_compte, id_dossier, id_exercice } = getIds();
//       const response = await axiosPrivate.get(`/param/revisionControle/${id_compte}/${id_dossier}/${id_exercice}`);
//       if (response.data.state) {
//         setControles(response.data.controles);
//       }
//     } catch (error) {
//       console.error('Error fetching controles:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [axiosPrivate, selectedExerciceId]);

//   useEffect(() => {
//     fetchExercices();
//   }, []);

//   useEffect(() => {
//     if (selectedExerciceId > 0) {
//       fetchControles();
//     }
//   }, [selectedExerciceId, fetchControles]);

//   const handleChangeExercice = (exerciceId) => {
//     setSelectedExerciceId(exerciceId);
//   };

//   const [formData, setFormData] = useState({
//     id_controle: '',
//     Type: '',
//     compte: '',
//     test: '',
//     description: '',
//     anomalies: '',
//     details: '',
//     Valider: false,
//     Commentaire: ''
//   });

//   const handleOpenDialog = (controle = null) => {
//     setEditingControle(controle);
//     if (controle) {
//       setFormData({
//         id_controle: controle.id_controle || '',
//         Type: controle.Type || '',
//         compte: controle.compte || '',
//         test: controle.test || '',
//         description: controle.description || '',
//         anomalies: controle.anomalies || '',
//         details: controle.details || '',
//         Valider: controle.Valider || false,
//         Commentaire: controle.Commentaire || ''
//       });
//     } else {
//       setFormData({
//         id_controle: '',
//         Type: '',
//         compte: '',
//         test: '',
//         description: '',
//         anomalies: '',
//         details: '',
//         Valider: false,
//         Commentaire: ''
//       });
//     }
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setEditingControle(null);
//   };

//   const handleSubmit = async () => {
//     try {
//       const { id_compte, id_dossier, id_exercice } = getIds();
//       const payload = {
//         id_compte,
//         id_dossier,
//         id_exercice,
//         ...formData
//       };

//       if (editingControle) {
//         await axiosPrivate.put(`/param/revisionControle/${editingControle.id}`, payload);
//       } else {
//         await axiosPrivate.post(`/param/revisionControle/${id_compte}/${id_dossier}/${id_exercice}`, payload);
//       }

//       fetchControles();
//       handleCloseDialog();
//     } catch (error) {
//       console.error('Error saving controle:', error);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrôle ?')) {
//       try {
//         await axiosPrivate.delete(`/param/revisionControle/${id}`);
//         fetchControles();
//       } catch (error) {
//         console.error('Error deleting controle:', error);
//       }
//     }
//   };

//   const handleValidationToggle = async (controle) => {
//     try {
//       await axiosPrivate.put(`/param/revisionControle/validation/${controle.id}`, {
//         Valider: !controle.Valider,
//         Commentaire: controle.Commentaire
//       });
//       fetchControles();
//     } catch (error) {
//       console.error('Error updating validation:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <Box p={3}>
//         <Typography>Chargement...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 2, height: '100vh', backgroundColor: '#f5f5f5' }}>
//       {/* Header */}
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         mb: 3,
//         backgroundColor: 'white',
//         p: 2,
//         borderRadius: 1,
//         boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//       }}>
//         <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
//           Contrôles
//         </Typography>
        
//         <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
//           <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
//             <InputLabel>Exercice</InputLabel>
//             <Select
//               value={selectedExerciceId}
//               onChange={(e) => handleChangeExercice(e.target.value)}
//               label="Exercice"
//             >
//               {listeExercice.map((option) => (
//                 <MenuItem key={option.id} value={option.id}>
//                   {option.libelle_rang}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
          
//           <Button
//             variant="contained"
//             startIcon={<Add />}
//             onClick={() => handleOpenDialog()}
//           >
//             Ajouter un contrôle
//           </Button>
//         </Box>
//       </Box>

//       {/* Table */}
//       {controles.length === 0 ? (
//         <Alert severity="info" sx={{ mt: 2 }}>
//           Aucun contrôle trouvé pour cet exercice.
//         </Alert>
//       ) : (
//         <TableContainer component={Paper} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//           <Table>
//             <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
//               <TableRow>
//                 <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>ID Contrôle</TableCell>
//                 <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Type</TableCell>
//                 <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Compte</TableCell>
//                 <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Test</TableCell>
//                 <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Description</TableCell>
//                 <TableCell sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Anomalies</TableCell>
//                 <TableCell align="center" sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Validé</TableCell>
//                 <TableCell align="center" sx={{ fontWeight: 600, color: '#495057', py: 0.5 }}>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {controles.map((controle) => (
//                 <TableRow 
//                   key={controle.id} 
//                   hover
//                   sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
//                 >
//                   <TableCell sx={{ py: 0.5 }}>{controle.id_controle}</TableCell>
//                   <TableCell sx={{ py: 0.5 }}>{controle.Type}</TableCell>
//                   <TableCell sx={{ py: 0.5 }}>{controle.compte}</TableCell>
//                   <TableCell sx={{ py: 0.5 }}>
//                     <Box sx={{ maxHeight: '30px', overflow: 'auto', fontSize: '13px', pr: 1 }}>
//                       {controle.test}
//                     </Box>
//                   </TableCell>
//                   <TableCell sx={{ py: 0.5 }}>
//                     <Box sx={{ maxHeight: '30px', overflow: 'auto', fontSize: '13px', pr: 1 }}>
//                       {controle.description}
//                     </Box>
//                   </TableCell>
//                   <TableCell sx={{ py: 0.5 }}>
//                     <Box sx={{ maxHeight: '30px', overflow: 'auto', fontSize: '13px', pr: 1 }}>
//                       {controle.anomalies || '-'}
//                     </Box>
//                   </TableCell>
//                   <TableCell align="center" sx={{ py: 0.5 }}>
//                     <Chip
//                       label={controle.Valider ? 'Oui' : 'Non'}
//                       color={controle.Valider ? 'success' : 'default'}
//                       size="small"
//                       sx={{ fontWeight: 500 }}
//                     />
//                   </TableCell>
//                   <TableCell align="center" sx={{ py: 0.5 }}>
//                     <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
//                       <Button
//                         color="success"
//                         variant="contained"
//                         size="small"
//                         startIcon={<Check />}
//                         onClick={() => handleValidationToggle(controle)}
//                         sx={{ height: '25px', borderRadius: '1px' }}
//                       >
//                         {controle.Valider ? 'Invalider' : 'Valider'}
//                       </Button>
//                       <Button
//                         color="primary"
//                         variant="contained"
//                         size="small"
//                         startIcon={<Edit />}
//                         onClick={() => handleOpenDialog(controle)}
//                         sx={{ height: '25px', borderRadius: '1px' }}
//                       >
//                         Modifier
//                       </Button>
//                       <Button
//                         color="error"
//                         variant="contained"
//                         size="small"
//                         startIcon={<Delete />}
//                         onClick={() => handleDelete(controle.id)}
//                         sx={{ height: '25px', borderRadius: '1px' }}
//                       >
//                         Supprimer
//                       </Button>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}

//       {/* Dialog pour ajouter/modifier un contrôle */}
//       <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
//         <DialogTitle>
//           {editingControle ? 'Modifier le contrôle' : 'Ajouter un contrôle'}
//         </DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2} pt={1}>
//             <TextField
//               label="ID Contrôle"
//               value={formData.id_controle}
//               onChange={(e) => setFormData({ ...formData, id_controle: e.target.value })}
//               fullWidth
//               disabled={!!editingControle}
//             />
//             <TextField
//               label="Type"
//               value={formData.Type}
//               onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
//               fullWidth
//             />
//             <TextField
//               label="Compte"
//               value={formData.compte}
//               onChange={(e) => setFormData({ ...formData, compte: e.target.value })}
//               fullWidth
//             />
//             <TextField
//               label="Test"
//               value={formData.test}
//               onChange={(e) => setFormData({ ...formData, test: e.target.value })}
//               fullWidth
//               multiline
//               rows={3}
//             />
//             <TextField
//               label="Description"
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               fullWidth
//               multiline
//               rows={3}
//             />
//             <TextField
//               label="Anomalies"
//               value={formData.anomalies}
//               onChange={(e) => setFormData({ ...formData, anomalies: e.target.value })}
//               fullWidth
//               multiline
//               rows={2}
//             />
//             <TextField
//               label="Détails"
//               value={formData.details}
//               onChange={(e) => setFormData({ ...formData, details: e.target.value })}
//               fullWidth
//               multiline
//               rows={2}
//             />
//             <TextField
//               label="Commentaire"
//               value={formData.Commentaire}
//               onChange={(e) => setFormData({ ...formData, Commentaire: e.target.value })}
//               fullWidth
//               multiline
//               rows={2}
//             />
//             <FormControlLabel
//               control={
//                 <Switch
//                   checked={formData.Valider}
//                   onChange={(e) => setFormData({ ...formData, Valider: e.target.checked })}
//                   color="primary"
//                 />
//               }
//               label="Validé"
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Annuler</Button>
//           <Button onClick={handleSubmit} variant="contained">
//             {editingControle ? 'Mettre à jour' : 'Ajouter'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
