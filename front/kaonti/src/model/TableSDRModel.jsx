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

export default function TableSDRModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="center" style={{width:"100px" , fontWeight:'bold'}}>Consitution / Imputation</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>N-6</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>N-5</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>N-4</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>N-3</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>N-2</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>N-1</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>N</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Total</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Solde imputable sur exercice ultérieur</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Solde non imputable sur exercice ultérieur</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="centre">{row.constitution}</TableCell>
              <TableCell align="right">{row.n6}</TableCell>
              <TableCell align="right">{row.n5}</TableCell>
              <TableCell align="right">{row.n4}</TableCell>
              <TableCell align="right">{row.n3}</TableCell>
              <TableCell align="right">{row.n2}</TableCell>
              <TableCell align="right">{row.n1}</TableCell>
              <TableCell align="right">{row.n}</TableCell>
              <TableCell align="right">{row.total}</TableCell>
              <TableCell align="right">{row.soldeImputable}</TableCell>
              <TableCell align="right">{row.soldeNonImputable}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}