import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Button, IconButton, Stack, Tooltip, Modal, Typography, TextField } from '@mui/material';
import { IoMdCreate } from 'react-icons/io';
import { init } from '../../../../init';

// VirtualTableCentreFiscaux: simple table with edit modal for montant
const VirtualTableCentreFiscaux = ({
  columns,
  rows,
  deleteState,
  modifyState,
  state,
  editRowId,
  editRowData,
  onEditChange,
  onEditSave,
  onEditCancel,
  selectedRowId,
  onRowSelectionModelChange,
  onSort,
  onFilter,
  filters = []
}) => {
  const initial = init[0];

  const handleRowClick = (rowId) => {
    if (onRowSelectionModelChange) onRowSelectionModelChange([rowId]);
  };

  const handleRowModifClick = (row) => {
    if (modifyState) modifyState(row);
  };

  return (
    <>
      {/* Edit modal */}
      <Modal open={!!editRowId} onClose={onEditCancel}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', border: '2px solid #1976d2', boxShadow: 24, p: 3, borderRadius: 2, minWidth: 360 }}>
          <Stack spacing={2}>
            {Array.isArray(columns) && columns.map((col) => {
              const isMontant = col.id === 'montant';
              const value = editRowData?.[col.id] ?? '';
              return (
                <TextField
                  key={col.id}
                  label={col.label || col.id}
                  value={value}
                  type={isMontant ? 'number' : 'text'}
                  inputProps={isMontant ? { step: '0.01' } : {}}
                  onChange={(e) => {
                    if (isMontant && onEditChange) {
                      onEditChange('montant', e.target.value);
                    }
                  }}
                  disabled={!isMontant}
                  fullWidth
                />
              );
            })}
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="outlined" onClick={onEditCancel}>Annuler</Button>
              <Button variant="contained" onClick={onEditSave} sx={{ backgroundColor: initial.theme }} disabled={!!editRowData?._computed}>Enregistrer</Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      <TableContainer style={{ display: 'inline-block', width: 'auto', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650, border: '1px solid #ddd' }} aria-label="centre-fiscaux table">
          <TableHead style={{ backgroundColor: initial.theme, position: 'sticky', top: 0, zIndex: 1 }}>
            <TableRow>
              <TableCell
                key={'00modif'}
                align="center"
                style={{
                  fontWeight: 'bold',
                  top: 5,
                  minWidth: '50px',
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  borderRight: '1px solid #ddd',
                  borderLeft: '1px solid #ddd',
                  fontSize: 15,
                  color: 'white',
                }}
              >
                Action
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align || 'left'} sx={{ color: 'white', fontWeight: 'bold' }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover onClick={() => handleRowClick(row.id)}>
                <TableCell align="center">
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={() => handleRowModifClick(row)}>
                        <IoMdCreate style={{ width: '25px', height: '25px', color: initial.theme, position: 'absolute' }} />                   
                    </IconButton>
                  </Tooltip>
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    {row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default VirtualTableCentreFiscaux;
