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

export default function TableSEModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="center" style={{width:"100px" , fontWeight:'bold'}}>Liste des prêteurs</TableCell>
            <TableCell align="left" style={{width:"80px" , fontWeight:'bold'}}>Date de contrat</TableCell>
            <TableCell align="left" style={{width:"80px" , fontWeight:'bold'}}>Durée contrat</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant des emprunts (capital)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant des intérêts</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant Total</TableCell>
            <TableCell align="right" style={{width:"80px" , fontWeight:'bold'}}>Date de mise à disposition</TableCell>
            <TableCell align="right" style={{width:"80px" , fontWeight:'bold'}}>Date de remboursement</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant remboursé de la période (capital)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Montant remboursé de la période (intérêt)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Solde non remboursé en fin d'exercice</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.listePreteur}</TableCell>
              <TableCell align="left">{row.dateContrat}</TableCell>
              <TableCell align="left">{row.dureeContrat}</TableCell>
              <TableCell align="right">{row.montantCapital}</TableCell>
              <TableCell align="right">{row.montantInteret}</TableCell>
              <TableCell align="right">{row.montantTotal}</TableCell>
              <TableCell align="right">{row.dateMiseDisposition}</TableCell>
              <TableCell align="right">{row.dateRemboursement}</TableCell>
              <TableCell align="right">{row.montantRmbCapital}</TableCell>
              <TableCell align="right">{row.montantRmbInteret}</TableCell>
              <TableCell align="right">{row.soldeNonRembourse}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}