import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Typography } from '@mui/material';
import { init } from '../../../../init';


export default function VirtualTableAnomalies({ columns = [], rows = [], personnels = [] }) {
    const initial = init[0];
   const columnWidths = columns.reduce((acc, column) => {
    acc[column.id] = column.minWidth || 120;
    return acc;
  }, {});

  return (
    <TableContainer style={{ display: 'inline-block', width: '100%', overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650, border: '1px solid #ddd' }} aria-label="anomalies table">
        <TableHead style={{ backgroundColor: initial.theme, position: 'sticky', top: 0, zIndex: 1 }}>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{
                  fontWeight: 'bold',
                  top: 5,
                  minWidth: column.minWidth || 120,
                  paddingTop: '3px',
                  paddingBottom: '3px',
                  borderRight: '1px solid #ddd',
                  borderLeft: '1px solid #ddd',
                  fontSize: 14,
                  color: 'white',
                  position: 'relative',
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow hover tabIndex={-1} key={`${row.ligne}-${row.description}-${idx}`}>
              {columns.map((column) => {
                let value = row[column.id];
                if (column.valueGetter && typeof column.valueGetter === 'function') {
                  value = column.valueGetter({ row, personnels });
                }
                return (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ paddingTop: '6px', paddingBottom: '6px', fontSize: 14 }}
                  >
                    {value instanceof Object ? (
                      <Box component="span">{JSON.stringify(value)}</Box>
                    ) : (
                      <Typography variant="body2">{value}</Typography>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
          {(!rows || rows.length === 0) && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                Aucune anomalie à afficher
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
