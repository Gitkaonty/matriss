import React, { useEffect, useState } from 'react';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter, { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import axios from '../../../../../config/axios';
import { Box, Typography } from '@mui/material';

const columns = [
  {
    field: 'compte',
    headerName: 'Compte',
    width: 180,
    valueGetter: (params) => params.row.compte?.nom || params.row.idCompte || ''
  },
  {
    field: 'dossier',
    headerName: 'Dossier',
    width: 180,
    valueGetter: (params) => params.row.dossier?.dossier || params.row.idDossier || ''
  },
  { field: 'declaration', headerName: 'Déclaration', width: 100 },
  { field: 'designation', headerName: 'Désignation', width: 400 },
  {
    field: 'date_export',
    headerName: 'Date export',
    width: 180,
    valueGetter: (params) => new Date(params.row.date_export).toLocaleString()
  },
];

export default function HistoriqueIrsaTable({ refreshKey, exportType = 'XML' }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorique = async () => {
      try {
        const res = await axios.get('/historique/irsa');
        const allRows = res.data.historique || [];
        console.log('[DEBUG] Toutes les données historique:', allRows);
        console.log('[DEBUG] Type d\'export demandé:', exportType);
        
        // Filtrer par type d'export selon la désignation
        const filteredRows = allRows.filter(row => {
          if (exportType === 'XML') {
            // Chercher "XML" (insensible à la casse) ou les anciennes désignations sans "PDF"
            const hasXml = row.designation && row.designation.toLowerCase().includes('xml');
            const noPdf = row.designation && !row.designation.toLowerCase().includes('pdf');
            const match = hasXml || noPdf; // Considérer les anciens comme XML
            return match;
          } else if (exportType === 'PDF') {
            // Accepte aussi "IRSA PDF" (nouveau format)
            const match = row.designation && row.designation.toLowerCase().includes('pdf');
            return match;
          }
          return true;
        });
        console.log('[DEBUG] Données filtrées:', filteredRows);
        setRows(filteredRows);
      } catch (e) {
        setRows([]);
      }
      setLoading(false);
    };
    fetchHistorique();
  }, [refreshKey, exportType]);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 , fontWeight: 100, fontSize: 16}}>
        Historique des exports IRSA
      </Typography>
      <DataGrid
        disableMultipleSelection={DataGridStyle.disableMultipleSelection}
        disableColumnSelector={DataGridStyle.disableColumnSelector}
        disableDensitySelector={DataGridStyle.disableDensitySelector}
        disableRowSelectionOnClick
        disableSelectionOnClick={true}
        localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
        slots={{ toolbar: QuickFilter }}
        sx={DataGridStyle.sx}
        rowHeight={DataGridStyle.rowHeight}
        columnHeaderHeight={DataGridStyle.columnHeaderHeight}
        columns={columns}
        rows={rows}
        loading={loading}
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 20, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        checkboxSelection={false}
      />
    </Box>
  );
}
