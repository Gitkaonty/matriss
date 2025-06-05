import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { init } from '../../init';

let initial = init[0];

export default function TableBilanPassifModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="left" style={{width:"200px" , fontWeight:'bold'}}>Capitaux propres et passifs</TableCell>
            <TableCell align="left" style={{width:"50px" , fontWeight:'bold'}}>Note</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant Net</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant Net N-1</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.capitaux}</TableCell>
              <TableCell align="left">{row.note}</TableCell>
              <TableCell align="right">{row.montantNet}</TableCell>
              <TableCell align="right">{row.montantNetN1}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}