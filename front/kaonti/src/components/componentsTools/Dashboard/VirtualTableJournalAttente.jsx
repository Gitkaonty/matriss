import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Stack, TableFooter, Typography, Paper } from '@mui/material';
import { init } from '../../../../init';

let initial = init[0];
const BORDER = '#E2E8F0';

export default function VirtualTableJournalAttente({ tableHeader, tableRow }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const totalColumn = (rows, columnId, page, rowsPerPage) => {
    const visibleRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return visibleRows.reduce((total, row) => {
      const value = row[columnId];
      if (value != null && !isNaN(value)) total += value;
      return total;
    }, 0);
  };
  const tdStyle = {
    fontSize: '11px',
    color: '#334155',
    borderBottom: `1px solid ${BORDER}`,
    py: 1
  };
  const thStyle = {
    fontSize: '10px',
    fontWeight: 800,
    color: '#64748B',
    textTransform: 'uppercase',
    borderBottom: `2px solid ${BORDER}`,
    py: 1.5
  };
  const sectionTitle = { fontSize: '14px', fontWeight: 900, color: '#1E293B' };
  const sectionPaperStyle = { p: 2, borderRadius: '8px', border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', bgcolor: '#fff' };


  return (
    <Stack width={'100%'} height={'80%'}>
        <Typography sx={sectionTitle}>Comptes en attente (471)</Typography>
        <TableContainer sx={{ mt: 2 }}>
          <Table size="small" className="dense-table">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                {tableHeader.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={thStyle} // On applique ici le style condensé et pro
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRow
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, i) => (
                  <TableRow hover key={row.id || i}>
                    {tableHeader.map((column) => {
                      const value = row[column.id];

                      // On fusionne tdStyle avec les propriétés spécifiques à la colonne (alignement, gras)
                      const cellStyle = {
                        ...tdStyle,
                        // Si c'est la colonne 'cr' (ou une autre condition), on peut forcer le gras
                        ...(column.id === 'cr' ? { fontWeight: 700 } : {})
                      };

                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={cellStyle}
                        >
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                {tableHeader.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{
                      fontWeight: 'bold',
                      fontSize: 14,
                      paddingY: 0.8,
                      backgroundColor: '#fff',
                      position: 'sticky',
                      bottom: 0,
                      zIndex: 2,
                      minWidth: column.minWidth || 80,
                      color: 'black'
                    }}
                  >
                    {column.id === 'date'
                      ? 'Total'
                      : column.id === 'debit' || column.id === 'credit'
                        ? totalColumn(tableRow, column.id, page, rowsPerPage)
                          .toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>

          </Table>
        </TableContainer>
        <TablePagination
          style={{ height: "20%" }}
          rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]}
          component="div"
          count={tableRow.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page : "
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
        />
    </Stack>
  );
}