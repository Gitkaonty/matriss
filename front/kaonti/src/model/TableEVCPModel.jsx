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

export default function TableEVCPModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="left" style={{width:"200px" , fontWeight:'bold'}}>Rubriques</TableCell>
            <TableCell align="left" style={{width:"30px" , fontWeight:'bold'}}>Note</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Capital social (A6)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Capital prime & reserve (B6)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Ecart d'évaluation (C6)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Résultat (D6)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Report à nouveau (E6)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>TOTAL (A6+B6+C6+D6+E6)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.rubrique}</TableCell>
              <TableCell align="left">{row.note}</TableCell>
              <TableCell align="right">{row.capitalSocial}</TableCell>
              <TableCell align="right">{row.capitalPrime}</TableCell>
              <TableCell align="right">{row.ecartDevaluation}</TableCell>
              <TableCell align="right">{row.resultat}</TableCell>
              <TableCell align="right">{row.reportAnouveau}</TableCell>
              <TableCell align="right">{row.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}