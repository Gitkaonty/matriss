import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { init } from '../../../../init';
import { Box, Button, Typography } from '@mui/material';

const VirtualTableEbilan = ({columns, rows}) => {
    const initial = init[0];
    const targetColumnId = 'rubriquesmatrix.libelle';
  
    const handleRowClick = (row) => {
      //console.log(row.id);
    }

    return (
      <TableContainer  
      // component={Paper}
      style={{ display: 'inline-block', width: 'auto', overflowX: 'auto' }}
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
                    onClick={() => handleRowClick(row)}
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
                              {column.isNumber
                              ? column.format(value)
                              : value}
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
                            {column.isNumber
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      }
                    })}
                  </TableRow>
                );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  export default VirtualTableEbilan;