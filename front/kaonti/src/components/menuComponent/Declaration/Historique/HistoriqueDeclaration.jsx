import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter, { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import RefreshIcon from '@mui/icons-material/Refresh';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import useAuth from '../../../../hooks/useAuth';
import axios from '../../../../../config/axios';

export default function HistoriqueDeclaration({
  defaultType = 'ALL',
  forceCompteId = null,
  forceDossierId = null,
  height = '45vh',
  hideTypeFilter = false,
}) {
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const compteIdFromAuth = decoded?.UserInfo?.compteId || null;

  const [type, setType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]); // 🔹 Pour récupérer les lignes sélectionnées

  const compteId = useMemo(() => forceCompteId || compteIdFromAuth || null, [forceCompteId, compteIdFromAuth]);

  const dossierId = useMemo(() => {
    if (forceDossierId) return forceDossierId;
    const sid = sessionStorage.getItem('fileId');
    return sid ? Number(sid) : null;
  }, [forceDossierId]);

  const formatDate = (iso) => {
    try {
      if (!iso) return '';
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
    } catch {
      return String(iso);
    }
  };

  const columns = [
    { field: 'declaration', headerName: 'Déclaration', width: 120 },
    { field: 'designation', headerName: 'Désignation', flex: 1, minWidth: 200 },
    { field: 'date_export', headerName: 'Date d’export', width: 170, valueGetter: (params) => formatDate(params.row?.date_export) },
    { field: 'dossier', headerName: 'Dossier', width: 180, valueGetter: (params) => params.row?.dossier?.dossier || params.row?.idDossier || '' },
    { field: 'compte', headerName: 'Compte', width: 180, valueGetter: (params) => params.row?.compte?.nom || params.row?.idCompte || '' },
  ];

  const fetchHistorique = async () => {
    try {
      if (!compteId || !dossierId) {
        toast.error('Compte ou dossier non identifié pour l’historique.');
        return;
      }
      setLoading(true);
      const params = { idCompte: compteId, idDossier: dossierId };
      if (type && type !== 'ALL') params.declaration = type;

      const { data } = await axios.get('/historique/declaration', { params });
      if (data?.success) {
        const allRows = Array.isArray(data.historique) ? data.historique : [];

        // Filtrer pour ne garder que les fichiers XML (exclure PDF et Excel)
        const xmlOnlyRows = allRows.filter(row => {
          const designation = (row.designation || '').toLowerCase();
          // Exclure les fichiers PDF et Excel
          return !designation.includes('.pdf') &&
                 !designation.includes('.xlsx') &&
                 !designation.includes('.xls') &&
                 !designation.includes('pdf') &&
                 !designation.includes('excel');
        });

        setRows(xmlOnlyRows);
      } else {
        setRows([]);
        toast.error(data?.message || 'Erreur lors du chargement de l’historique');
      }
    } catch (e) {
      console.error('[HistoriqueDeclaration] fetch error', e);
      toast.error('Erreur serveur lors du chargement de l’historique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorique();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, compteId, dossierId]);

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Historique des déclarations
        </Typography>

        {/* {!hideTypeFilter && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Type de déclaration</InputLabel>
            <Select label="Type de déclaration" value={type} onChange={(e) => setType(e.target.value)}>
              <MenuItem value="ALL">Tous</MenuItem>
              <MenuItem value="IRSA">IRSA</MenuItem>
              <MenuItem value="TVA">TVA</MenuItem>
            </Select>
          </FormControl>
        )} */}

        <Tooltip title="Rafraîchir">
          <span>
            <IconButton onClick={fetchHistorique} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box sx={{ height: '45vh', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick={false}
          disableMultipleSelection={DataGridStyle.disableMultipleSelection}
          disableColumnSelector={DataGridStyle.disableColumnSelector}
          disableDensitySelector={DataGridStyle.disableDensitySelector}
          disableSelectionOnClick
          localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
          slots={{ toolbar: QuickFilter }}
          rowHeight={DataGridStyle.rowHeight}
          columnHeaderHeight={DataGridStyle.columnHeaderHeight}
          pageSizeOptions={[5, 10, 20, 30, 50, 100]}
          pagination
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(ids) => setSelectionModel(ids)}
          sx={{
            ...DataGridStyle.sx,
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none', border: 'none' },
            '& .MuiDataGrid-row.highlight-row': { backgroundColor: '#d9fdd3 !important' },
            border: 'none',
            '& .MuiDataGrid-cell': { fontSize: '0.875rem', borderBottom: '1px solid #e0e0e0' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#ffffff', borderBottom: '2px solid #1976d2', fontWeight: 600 },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f0f7ff' },
            '& .MuiDataGrid-row.Mui-selected': { backgroundColor: '#e3f2fd', '&:hover': { backgroundColor: '#bbdefb' } },
          }}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
            sorting: { sortModel: [{ field: 'date_export', sort: 'desc' }] },
          }}
        />
</Box>
    </Paper>
  );
}
