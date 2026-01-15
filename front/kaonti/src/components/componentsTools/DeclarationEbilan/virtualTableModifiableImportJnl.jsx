import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { init } from '../../../../init';
import { Box, Button, IconButton, Stack, TableFooter, Typography } from '@mui/material';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { IoMdCreate } from "react-icons/io";
import { format } from 'date-fns';

const VirtualTableModifiableImportJnl = ({ columns, rows, deleteState, modifyState, state }) => {
  const initial = init[0];
  const targetColumnId = 'rubriquesmatrix.libelle';

  const handleRowModifClick = (row) => {
    modifyState(row);
  }

  const handleRowDeleteClick = (row) => {
    deleteState(row);
  }

  const columnWidths = columns.reduce((acc, column) => {
    acc[column.id] = column.minWidth;
    return acc;
  }, {});

  const totalColumn = (rows, columnId) => {

    const total = rows.reduce((acc, item) => {
      const Value = parseFloat(item[columnId].replace(',', '.')) || 0;
      return acc + Value;
    }, 0);

    return total;
  };

  return (
    <TableContainer
      // component={Paper}
      style={{
        display: 'inline-block',
        width: 'auto',
        overflowX: 'auto'
      }}
    >
      <Table sx={{ minWidth: 150, border: '1px solid #ddd', }} aria-label="simple table">
        <TableHead
          style={{
            backgroundColor: initial.theme,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{
                  fontWeight: 'bold',
                  top: 5,
                  minWidth: column.minWidth,
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  borderRight: '1px solid #ddd',
                  borderLeft: '1px solid #ddd',
                  fontSize: 15,
                  color: 'white'
                }}
              >
                {column.label}
              </TableCell>
            ))}

            {/* <TableCell
                    key={'00modif'}
                    align={"center"}
                    style={{
                      fontWeight:'bold', 
                      top: 5, 
                      minWidth: "50px", 
                      paddingTop: '5px', 
                      paddingBottom: '5px', 
                      borderRight: '1px solid #ddd', 
                      borderLeft: '1px solid #ddd',
                      fontSize:15,
                      color:'white'
                    }}
                >
                  Action
                </TableCell> */}

          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const rowsToRender = [];

            const currentNum = row.EcritureNum;
            const previousNum = index > 0 ? rows[index - 1].EcritureNum : null;

            // Ligne séparatrice si le numéro change
            if (index > 0 && currentNum !== previousNum) {
              rowsToRender.push(
                <TableRow key={`separator-${index}`}>
                  <TableCell colSpan={columns.length + (!state ? 1 : 0)} style={{ padding: 0 }}>
                    <div style={{ borderTop: '1px solid red', width: '100%' }} />
                  </TableCell>
                </TableRow>
              );
            }

            // Styles selon le niveau
            let rowStyle = {};
            let cellStyle = {};
            switch (row.niveau) {
              case 0:
              case 1:
                rowStyle = { fontWeight: 'bold', backgroundColor: '#f0f0f0' };
                cellStyle = { fontWeight: 'bold' };
                break;
              case 2:
                rowStyle = { fontWeight: 'normal', color: 'black' };
                cellStyle = {};
                break;
              case 3:
                rowStyle = { fontStyle: 'italic', color: 'black' };
                cellStyle = { paddingLeft: '50px' };
                break;
              case 4:
                rowStyle = { fontWeight: 'normal', color: 'white', backgroundColor: '#89A8B2' };
                cellStyle = {};
                break;
              default:
                rowStyle = { fontWeight: 'normal', color: 'black' };
                cellStyle = {};
            }

            rowsToRender.push(
              <TableRow hover role="checkbox" tabIndex={-1} key={`${row.code}-${index}`} style={{ height: '20px', ...rowStyle }}>
                {columns.map((column) => {
                  let value = row[column.id];

                  // Gérer les objets pour éviter l'erreur React
                  if (typeof value === 'object' && value !== null) {
                    value = value.name || JSON.stringify(value); // Choisir une propriété ou stringify
                  }

                  // Appliquer format si nécessaire
                  if (column.format && value) {
                    if (typeof value === 'number') {
                      value = column.format(value);
                    } else if (value instanceof Date) {
                      value = format(value, "dd/MM/yyyy");
                    }
                  }

                  return (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{
                        paddingTop: '5px',
                        paddingBottom: '5px',
                        fontSize: 15,
                        ...cellStyle
                      }}
                    >
                      {column.isnumber && typeof value === 'string'
                        ? column.format(Number(value.replace(/,/g, '.')))
                        : value
                      }
                    </TableCell>
                  );
                })}

                {!state && (
                  <TableCell
                    key="actions"
                    align="center"
                    style={{ paddingTop: '5px', paddingBottom: '5px', fontSize: 15 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton onClick={() => handleRowModifClick(row)} style={{ width: 25, height: 25, backgroundColor: 'transparent' }}>
                        <IoMdCreate style={{ width: 25, height: 25, color: initial.theme, position: 'absolute' }} />
                      </IconButton>
                      <IconButton onClick={() => handleRowDeleteClick(row)} style={{ width: 25, height: 25, backgroundColor: 'transparent' }}>
                        <IoMdTrash style={{ width: 25, height: 25, color: initial.button_delete_color, position: 'absolute' }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            );

            return rowsToRender;
          })}
        </TableBody>


        <TableFooter
          style={{
            backgroundColor: '#89A8B2',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{
                  fontWeight: 'bold',
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  borderTop: '1px solid #ddd',
                  minWidth: columnWidths[column.id],
                  fontSize: 15
                }}
              >
                {
                  column.id === "EcritureLib" || column.id === "libelle"
                    ? "Total"
                    : column.isnumber
                      ? totalColumn(rows, column.id).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : ""
                }
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

export default VirtualTableModifiableImportJnl;