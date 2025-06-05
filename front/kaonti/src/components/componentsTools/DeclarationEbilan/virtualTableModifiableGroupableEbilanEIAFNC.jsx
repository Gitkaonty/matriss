import * as React from 'react';
import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import Paper from '@mui/material/Paper';
import { init } from '../../../../init';
import { Box, Button, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { IoMdCreate } from "react-icons/io";
import { format } from 'date-fns';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const VirtualTableModifiableGroupableEbilanEIAFNC = ({columns, rows, deleteState, modifyState, state}) => {
    const initial = init[0];
    const targetColumnId = 'rubriquesmatrix.libelle';
  
    const handleRowModifClick = (row) => {
      modifyState(row);
    }

    const handleRowDeleteClick = (row) => {
      deleteState(row);
    }

    const [expanded, setExpanded] = useState({}); // Contient l'état d'expansion de chaque groupe

    const handleToggleCollapse = (groupName) => {
      setExpanded((prevExpanded) => ({
        ...prevExpanded,
        [groupName]: !prevExpanded[groupName], // Inverse l'état d'expansion
      }));
    };

    const columnWidths = columns.reduce((acc, column) => {
      acc[column.id] = column.minWidth;
      return acc;
    }, {});

    const soustotalGroup = (item, columnId) => {
      return rows.reduce((totals, group) => {
        // Vérifier si le groupe correspond à celui que nous recherchons (ex: "GOODWILL")
        if (group.rubriques_poste === item) {
          // Parcourir les items du groupe
          group.items.forEach((item) => {
            // Vérifier si 'augmentation' existe et est un nombre valide
            const value = item[columnId];
            
            // Si la valeur est définie et un nombre, on l'ajoute au total
            if (value != null && !isNaN(value)) {
              totals += value; 
            }
          });
        }
        return totals;
      }, 0); 
    };

    const totalGroup = (columnId) => {
      return rows.reduce((totals, group) => {
        
        // Parcourir les items du groupe
        group.items.forEach((item) => {
          // Vérifier si 'augmentation' existe et est un nombre valide
          const value = item[columnId];
          
          // Si la valeur est définie et un nombre, on l'ajoute au total
          if (value != null && !isNaN(value)) {
            totals += value; 
          }
        });
       
        return totals;
      }, 0); 
    };

    //triage des données par ordre croissant
    useEffect(() => {
      rows = rows.sort((a, b) => {
        if (a.rubriques_poste < b.rubriques_poste) {
          return -1;  // a vient avant b
        }
        if (a.rubriques_poste > b.rubriques_poste) {
          return 1;   // b vient avant a
        }
        return 0;  // a et b sont égaux
      });
    },[rows]);

    const stickyColumnStyle = {
      position: 'sticky',
      left: 200,
      backgroundColor: '#fff', // Assurez-vous que le fond est blanc ou transparent
      zIndex: 1, // Assurez-vous que la colonne est au-dessus des autres
    };

    return (
      <TableContainer  
      // component={Paper}
      style={{ 
        display: 'inline-block', 
        width: 'auto', 
        overflowX: 'auto',
       }}
      >
        <Table sx={{ width: 320, border: '1px solid #ddd' }} aria-label="simple table">
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
                      color:'white',
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
                      width: "100px", 
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
            {rows.map((group) => (
              <React.Fragment key={group.rubriques_poste} >
                {/* Ligne pour afficher le nom du groupe et l'icône de dépliage/repliage */}
                <TableRow
                  style={{border:'none', height:'20px', width:'100%'}}
                >
                  <TableCell 
                    colSpan={10} 
                    style={{ 
                      fontWeight: 'bold', 
                      border:'none', 
                      //backgroundColor:"green",
                      paddingTop: '5px', 
                      paddingBottom: '2px', 
                      minWidth: columnWidths["rubriques_poste"],
                    }}
                  >
                    <IconButton 
                    onClick={() => handleToggleCollapse(group.rubriques_poste)}
                    style={{ 
                      width:'20px', height:'20px',
                      textTransform: 'none', outline: 'none',
                      backgroundColor:"#67AE6E", 
                      color:'white',
                      marginRight:5 
                    }}
                    >
                      {expanded[group.rubriques_poste] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    {
                    group.rubriques_poste === "AUTREACTIF"
                      ? "Autres actifs financiers non courant"
                      : group.rubriques_poste === "IMMOCORP"
                        ? "Immobilisation corporelle"
                        : group.rubriques_poste === "IMMOINCORP"
                          ? "Immobilisation incorporelle"
                          : group.rubriques_poste === "IMMOENCOUR"
                            ? "Immobilisation en cours"
                            : group.rubriques_poste === "IMMOFIN"
                              ? "Immobilisation financière"
                              : "Participation"
                    }
                  </TableCell>
                </TableRow>

                {/* Les lignes du groupe avec Collapse */}
                <TableRow
                  style={{border:'none'}}
                >
                  <TableCell 
                    colSpan={8}
                    style={{
                      height:'0px', 
                      padding: '5px', 
                      paddingBottom: '0px',
                    }}
                  >
                    <Collapse 
                    in={expanded[group.rubriques_poste]} 
                    timeout="auto" unmountOnExit
                    style={{
                      marginLeft: "-5px", 
                      height:'20px', 
                      width:'100%',
                     display:'table'
                    }}
                    >
                      {/* Liste des éléments du groupe */}
                      {group.items.map((item) => (
                        <TableRow 
                          key={item.id} 
                          style={{
                            border:'none', 
                            padding:'5px',
                          }}
                        >
                          {columns.map((column) => {
                            const value = column.sousgroupLabel? item[column.id] : "";

                            return (
                              <TableCell
                              key={column.id} 
                              align={column.align} 
                              style={{ 
                                paddingTop: '5px', 
                                paddingBottom: '5px',
                                borderBottom : column.sousgroupLabel? '1px solid #ddd': '1px solid transparent',
                                // borderRight: '1px solid #ddd', borderLeft: '1px solid #ddd' ,
                                //backgroundColor: column.id === 'dim_repr_ex' ? 'red' : 'green',
                                fontSize:15,
                                minwidth: columnWidths[column.id],
                                
                                }}
                              >
                                {column.format && value
                                  ? typeof value === 'number'
                                    ? column.format(value)
                                    : format(value, "dd/MM/yyy")
                                    : value
                                }
                              </TableCell>
                            )
                          })
                        }
                        {
                        !state
                          ?<TableCell
                              key={"boutonModif"} 
                              align={"center"} 
                              style={{ 
                                paddingTop: '5px', 
                                paddingBottom: '5px',
                                // borderRight: '1px solid #ddd', borderLeft: '1px solid #ddd' ,
                                fontSize:15,
                                width: "50px",
                                }}
                            >
                              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                                <IconButton
                                onClick={() => handleRowModifClick(item)}
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
                                onClick={() => handleRowDeleteClick(item)}
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
                    ))}

                      <TableRow
                        key={'subtotal'} 
                        style={{padingLeft: -5, border:'none'}}
                      >
                        {columns.map((column) => {
                            return (
                              <TableCell
                              key={column.id} 
                              align={column.align} 
                              style={{ 
                                paddingTop: '2px', 
                                paddingBottom: '2px',
                                fontSize:15,
                                fontWeight:'bold',
                                minWidth: column.minWidth,
                                backgroundColor: column.id === "rubriques_poste" ? 'transparent' : '#f0f0f0'
                                }}
                              >
                                {
                                  column.id === "rubriques_poste"
                                    ? ""
                                    : column.id === "libelle"
                                      ? "Sous Total"
                                      : column.isnumber
                                        ? soustotalGroup(group.rubriques_poste, column.id).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : ""
                                }
                              </TableCell>
                            )
                          })
                        }
                      </TableRow>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
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
                      minWidth: column.minWidth,
                      fontSize: 14
                    }}
                  >
                    {
                      column.id === "rubriques_poste"
                        ? "Total"
                        : column.isnumber
                            ? totalGroup(column.id).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

  export default VirtualTableModifiableGroupableEbilanEIAFNC;