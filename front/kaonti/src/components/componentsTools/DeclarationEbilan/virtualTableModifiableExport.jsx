import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { init } from '../../../../init';
import { TableFooter } from '@mui/material';

const VirtualTableModifiableExport = ({ columns, rows }) => {
  const initial = init[0];

  const columnWidths = columns.reduce((acc, column) => {
    acc[column.id] = column.minWidth;
    return acc;
  }, {});

  const totalColumn = (rows, columnId) => {

    const total = rows.reduce((acc, item) => {
      const Value = parseFloat(item[columnId]) || 0;
      return acc + Value;
    }, 0);

    return total;
  };

  return (
    <TableContainer
      style={{
        display: 'inline-block',
        width: 'auto',
        overflowX: 'auto'
      }}
    >
      <Table sx={{ minWidth: 650, border: '1px solid #ddd', }} aria-label="simple table">
        <TableHead
          style={{
            backgroundColor: initial.theme,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{
                  fontWeight: 'bold',
                  top: 5,
                  minWidth: column.minWidth,
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  borderRight: '1px solid #ddd',
                  borderLeft: '1px solid #ddd',
                  fontSize: 15,
                  color: 'white'
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, key) => {

            return (
              <TableRow hover
                role="checkbox" tabIndex={-1} key={key}
                style={{ height: '20px' }}

              >
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{
                        paddingTop: '5px',
                        paddingBottom: '5px',
                        fontSize: 15,
                      }}
                    >
                      {
                        column.format && value
                          ? typeof value === 'number'
                            ? column.format(value)
                            : value
                          : value
                      }
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter
          style={{
            backgroundColor: '#89A8B2',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{
                  fontWeight: 'bold',
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  borderTop: '1px solid #ddd',
                  minWidth: columnWidths[column.id],
                  fontSize: 15
                }}
              >
                {
                  column.id === "EcritureLib" || column.id === "compte"
                    ? "Total"
                    : column.isnumber
                      ? totalColumn(rows, column.id).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : ""
                }
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

export default VirtualTableModifiableExport;