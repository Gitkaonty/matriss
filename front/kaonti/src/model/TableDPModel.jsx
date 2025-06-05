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

export default function TableDPModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="left" style={{width:"150px" , fontWeight:'bold'}}>Nature des provisions</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant au début de l'exercice (A)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>AUGMENTATIONS Dotations de l'exercice (B)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>DIMINUTIONS Reprises de l'exercice (C)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant à la fin de l'exercice (D)=(A)+(B)+(C)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.nature}</TableCell>
              <TableCell align="right">{row.montantDebut}</TableCell>
              <TableCell align="right">{row.augmentation}</TableCell>
              <TableCell align="right">{row.diminutions}</TableCell>
              <TableCell align="right">{row.montantFin}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}