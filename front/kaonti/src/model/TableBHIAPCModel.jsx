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

export default function TableBHIAPCModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="left" style={{width:"100px" , fontWeight:'bold'}}>NIF</TableCell>
            <TableCell align="left" style={{width:"150px" , fontWeight:'bold'}}>Raison sociale</TableCell>
            <TableCell align="left" style={{width:"150px" , fontWeight:'bold'}}>Adresse</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant porté en charge</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant perçu par le bénéficiaire</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.nif}</TableCell>
              <TableCell align="left">{row.raisonSociale}</TableCell>
              <TableCell align="left">{row.adresse}</TableCell>
              <TableCell align="right">{row.montantCharge}</TableCell>
              <TableCell align="right">{row.montantBeneficiaire}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}