import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import { IoMdCreate } from 'react-icons/io';
import { init } from '../../../../init';
import PopupAddDge from '../PopupAddDge';

// VirtualTableDGE: simple table with edit modal for montant
const VirtualTableDGE = ({
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
      {/* Edit popup */}
      <PopupAddDge
        open={!!editRowId}
        title={`Modifier la ligne ${editRowData?.id ?? ''}`}
        columns={columns}
        editRowData={editRowData}
        onEditChange={onEditChange}
        onSave={onEditSave}
        onCancel={onEditCancel}
        themeColor={initial.theme}
      />

      <TableContainer style={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ width: '100%', minWidth: 650, tableLayout: 'fixed', border: '1px solid #ddd' }} aria-label="centre-fiscaux table">
          <TableHead style={{ backgroundColor: initial.theme, position: 'sticky', top: 0, zIndex: 1 }}>
            <TableRow>
              {columns.map((column) => (
                <React.Fragment key={column.id}>
                  <TableCell
                    align={column.align || 'left'}
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      py: 0.25,
                      px: 0.75,
                      width: column.width ? `${column.width}px` : undefined,
                      minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
                    }}
                  >
                    {column.label}
                  </TableCell>

                  {/* Action après montant */}
                  {column.id === 'montant' && (
                    <TableCell
                      align="center"
                      style={{
                        fontWeight: 'bold',
                        minWidth: '90px',
                        width: '90px',
                        fontSize: 13,
                        color: 'white',
                        paddingTop: '2px',
                        paddingBottom: '2px',
                      }}
                    >
                      Action
                    </TableCell>
                  )}
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => handleRowClick(row.id)}
                sx={{
                  height: 26,
                }}
              >
                {columns.map((column) => (
                  <React.Fragment key={column.id}>
                    <TableCell
                      align={column.align || 'left'}
                      sx={{
                        py: 0.25,
                        px: 0.75,
                        lineHeight: 1.2,
                        width: column.width ? `${column.width}px` : undefined,
                        minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
                      }}
                    >
                      {row[column.id]}
                    </TableCell>

                    {/* Action après montant */}
                    {column.id === 'montant' && (
                      <TableCell align="center" sx={{ py: 0.25 }}>
                        <Tooltip title={"Modifier"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleRowModifClick(row)}
                            >
                              <IoMdCreate style={{ width: '25px', height: '25px', color: initial.theme }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    )}
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default VirtualTableDGE;
