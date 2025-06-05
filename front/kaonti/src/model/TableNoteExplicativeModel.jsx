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

export default function TableNoteExplicativeModel({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead style={{backgroundColor:initial.tableHeaderBackgroundColor}}>
          <TableRow>
            <TableCell align="left" style={{width:"100px" , fontWeight:'bold'}}>Tableau</TableCell>
            <TableCell align="left" style={{width:"60px" , fontWeight:'bold'}}>Code</TableCell>
            <TableCell align="left" style={{width:"600px" , fontWeight:'bold'}}>Commentaires</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } , fontSize:"16px"}}
            >
              <TableCell align="left">{row.tableau}</TableCell>
              <TableCell align="left">{row.code}</TableCell>
              <TableCell align="left">{row.commentaire}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}