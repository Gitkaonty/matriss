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

export default function TableListeDomBancaireModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="left" style={{width:"150px" , fontWeight:'bold'}}>Banque</TableCell>
            <TableCell align="left" style={{width:"100px" , fontWeight:'bold'}}>N° de compte</TableCell>
            <TableCell align="left" style={{width:"50px" , fontWeight:'bold'}}>Devise</TableCell>
            <TableCell align="left" style={{width:"100px" , fontWeight:'bold'}}>Pays</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.banque}</TableCell>
              <TableCell align="left">{row.compte}</TableCell>
              <TableCell align="left">{row.devise}</TableCell>
              <TableCell align="left">{row.pays}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}