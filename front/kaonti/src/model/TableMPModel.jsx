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

export default function TableMPModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="left" style={{width:"30px" , fontWeight:'bold'}}>Marché</TableCell>
            <TableCell align="left" style={{width:"150px" , fontWeight:'bold'}}>Référence du marché</TableCell>
            <TableCell align="left" style={{width:"70px" , fontWeight:'bold'}}>Date</TableCell>
            <TableCell align="left" style={{width:"70px" , fontWeight:'bold'}}>Date de paiement</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Mantant du marché conclu HT</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>TMP</TableCell>
            <TableCell align="right" style={{width:"100px" , fontWeight:'bold'}}>Mantant payé</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.marche}</TableCell>
              <TableCell align="left">{row.reference}</TableCell>
              <TableCell align="left">{row.date}</TableCell>
              <TableCell align="left">{row.datePaiement}</TableCell>
              <TableCell align="right">{row.montantMarche}</TableCell>
              <TableCell align="right">{row.tmp}</TableCell>
              <TableCell align="right">{row.montantPaye}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}