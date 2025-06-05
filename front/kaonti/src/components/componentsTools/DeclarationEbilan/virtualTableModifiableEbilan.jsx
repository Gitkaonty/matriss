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

const VirtualTableModifiableEbilan = ({columns, rows, deleteState, modifyState, state}) => {
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
      return rows.reduce((total, row) => {
        //const value = parseFloat(row[columnId]);
        const value = row[columnId];
        
        if (value != null && !isNaN(value)) {
          total += value; 
        }
        return total;
      }, 0);
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
        <Table sx={{ minWidth: 650, border: '1px solid #ddd',  }} aria-label="simple table">
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
                      fontWeight:'bold', 
                      top: 5, 
                      minWidth: column.minWidth, 
                      paddingTop: '5px', 
                      paddingBottom: '5px', 
                      borderRight: '1px solid #ddd', 
                      borderLeft: '1px solid #ddd',
                      fontSize:15,
                      color:'white'
                    }}
                    >
                      {column.label}
                    </TableCell>
                ))}

                <TableCell
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
                </TableCell>
               
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
                let rowStyle = {};
                let cellStyle = {};
  
                switch (row.niveau) {
                  case 0:
                    rowStyle = { fontWeight: 'bold', backgroundColor: '#f0f0f0' }; // Pour les titres sans total
                    cellStyle ={ fontWeight: 'bold' };
                    break;
                  case 1:
                    rowStyle = { fontWeight: 'bold', backgroundColor: '#f0f0f0' }; // Pour les titres avec total
                    cellStyle ={ fontWeight: 'bold' };
                    break;
                  case 2:
                    rowStyle = { fontWeight: 'normal', color: 'black' }; // Pour les rubriques normales
                    cellStyle = {};
                    break;
                  case 3:
                    rowStyle = { fontStyle: 'italic', color: 'black' }; // Pour le sous groupe d'une rubrique
                    cellStyle = { paddingLeft: '50px' };
                    break;
                  case 4:
                    rowStyle = { fontWeight: 'normal', color: 'white', backgroundColor:'#89A8B2'}; // pour les lignes totaux
                    cellStyle = {};
                    break;
                  default:
                    rowStyle = { fontWeight: 'normal', color: 'black' }; // Valeur par défaut pour d'autres niveaux
                    cellStyle = {};
                }

                return (
                  <TableRow hover 
                    role="checkbox" tabIndex={-1} key={row.code} 
                    style={{height:'20px',...rowStyle}}
                    
                  >
                    {columns.map((column) => {
                      const value = row[column.id];

                      if (column.id === targetColumnId) {
                        return (
                            <TableCell 
                            key={column.id} 
                            align={column.align} 
                            style={{ 
                              paddingTop: '5px', 
                              paddingBottom: '5px',
                              // borderRight: '1px solid #ddd', borderLeft: '1px solid #ddd' ,
                              fontSize:15,
                              ...cellStyle,
                              }}
                            >
                              {column.format && value
                                ? typeof value === 'number'
                                  ? column.format(value)
                                  : format(value, "dd/MM/yyy")
                                  : value
                              }
                            </TableCell>
                        );
                      }else if(column.id !== targetColumnId && row.niveau === 0){
                        return (
                          <TableCell 
                            key={column.id} 
                            align={column.align} 
                            style={{ 
                              paddingTop: '5px', 
                              paddingBottom: '5px',
                              fontWeight: row.niveau === 1 ? 'bold': 'normal',
                              // borderRight: '1px solid #ddd', borderLeft: '1px solid #ddd' ,
                              fontSize:15,
                              }}
                          >
                           
                          </TableCell>
                        );
                      }else{
                        return (
                          <TableCell 
                            key={column.id} 
                            align={column.align} 
                            style={{ 
                              paddingTop: '5px', 
                              paddingBottom: '5px',
                              fontWeight: row.niveau === 1 ? 'bold': 'normal',
                              // borderRight: '1px solid #ddd', borderLeft: '1px solid #ddd' ,
                              fontSize:15,
                              }}
                          >
                             {column.format && value
                                ? typeof value === 'number'
                                  ? column.format(value)
                                  : format(value, "dd/MM/yyy")
                                  : value
                              }
                          </TableCell>
                        );
                      }
                    })}
                    {
                      !state
                        ? <TableCell
                            key={"boutonModif"} 
                            align={"center"} 
                            style={{ 
                            paddingTop: '5px', 
                            paddingBottom: '5px',
                            // borderRight: '1px solid #ddd', borderLeft: '1px solid #ddd' ,
                            fontSize:15,
                            }}
                          >
                            <Stack direction={'row'} alignItems={'center'} spacing={1}>
                              <IconButton
                              onClick={() => handleRowModifClick(row)}
                              variant="contained" 
                              style={{
                                  width:"25px", height:'25px', 
                                  borderRadius:"1px", borderColor: "transparent", 
                                  backgroundColor: "transparent",
                                  textTransform: 'none', outline: 'none'
                              }}
                              >
                                  <IoMdCreate style={{width:'25px', height:'25px', color:initial.theme, position: 'absolute',}}/>
                              </IconButton>

                              <IconButton
                              onClick={() => handleRowDeleteClick(row)}
                                variant="contained" 
                                style={{
                                  width:"25px", height:'25px', 
                                    borderRadius:"1px", borderColor: "transparent", 
                                    backgroundColor: "transparent",
                                    textTransform: 'none', outline: 'none'
                                }}
                                >
                                    <IoMdTrash style={{width:'25px', height:'25px', color:initial.button_delete_color, position: 'absolute',}}/>
                                </IconButton>
                            </Stack>
                            
                          </TableCell>
                        : null
                    }

                  </TableRow>
                );
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
                    column.id === "ref_marche" || column.id === "nif"
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

  export default VirtualTableModifiableEbilan;