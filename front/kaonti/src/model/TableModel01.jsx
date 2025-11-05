import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { init } from '../../init';
import { Stack, TableFooter } from '@mui/material';

let initial = init[0];

export default function StickyHeadTable({ tableHeader, tableRow }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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

  return (

    <Stack width={'100%'} height={'80%'}>
      <TableContainer sx={{ height: '100%' }}>
        <Table stickyHeader aria-label="sticky table" >
          <TableHead>
            <TableRow>
              {tableHeader.map((column) => (
                <TableCell
                  sx={{
                    fontSize: 16,
                    fontWeight: "bold",
                    backgroundColor: initial.tableHeaderBackgroundColor,
                    paddingY: 0.5,
                    borderRadius : 0.5
                  }}
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRow
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {tableHeader.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ paddingY: 1.5 }}
                        >
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}

          </TableBody>
          <TableFooter>
            <TableRow>
              {tableHeader.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 15,
                    paddingY: 1.5,
                    backgroundColor: initial.tableHeaderBackgroundColor,
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
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={tableRow.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page :"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
        }
      />
    </Stack>
  );
}