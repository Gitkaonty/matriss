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

export default function TableDAModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="left" style={{width:"150px" , fontWeight:'bold'}}>Désignation</TableCell>
            <TableCell align="left" style={{width:"80px" , fontWeight:'bold'}}>N° de compte</TableCell>
            <TableCell align="left" style={{width:"70px" , fontWeight:'bold'}}>Date d'acquisition</TableCell>
            <TableCell align="left" style={{width:"50px" , fontWeight:'bold'}}>Taux</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Valeur d'acquisition (A)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Augmentation (B)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Diminution (C)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Amort. cumulés en début d'exercice (D)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Dot. exercice (E)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Amort. cumulés en fin d'exercice (F)=(D)+(E)</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>valeur nette comptable (G)=(A)+(B)-(C)-(F)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.designation}</TableCell>
              <TableCell align="left">{row.numCompte}</TableCell>
              <TableCell align="left">{row.dateAcquisition}</TableCell>
              <TableCell align="left">{row.taux}</TableCell>
              <TableCell align="right">{row.valeurAcquisition}</TableCell>
              <TableCell align="right">{row.augmentation}</TableCell>
              <TableCell align="right">{row.diminution}</TableCell>
              <TableCell align="right">{row.amortDebut}</TableCell>
              <TableCell align="right">{row.dotExercice}</TableCell>
              <TableCell align="right">{row.amortFin}</TableCell>
              <TableCell align="right">{row.valeurNette}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}