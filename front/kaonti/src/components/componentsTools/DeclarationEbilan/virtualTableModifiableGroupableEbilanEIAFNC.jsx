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
import { Box, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { IoMdTrash } from "react-icons/io";
import { IoMdCreate } from "react-icons/io";
import { format } from 'date-fns';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const VirtualTableModifiableGroupableEbilanEIAFNC = ({ columns, rows, deleteState, modifyState, state }) => {
  const initial = init[0];

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
  }, [rows]);

  const colWidths = columns.map((c) => (typeof c.minWidth === "number" ? `${c.minWidth}px` : c.minWidth || "auto"));

  return (
    <Box sx={{ width: "100%", p: 0, m: 0 }}>
      <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
        {/* Table principale avec colgroup (garantit alignement avec les tables internes) */}
        <Table aria-label="grouped-table" sx={{ tableLayout: "fixed", width: "100%" }}>
          {/* colgroup principal */}
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={columns[i].id} style={{ width: w }} />
            ))}
            <col key="action-col" style={{ width: "100px" }} />
          </colgroup>

          <TableHead sx={{ backgroundColor: initial.add_new_line_bouton_color || "#1976d2", position: "sticky", top: 0, zIndex: 2 }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || "left"}
                  sx={{
                    fontWeight: "bold",
                    py: "6px",
                    borderRight: "1px solid #ddd",
                    borderLeft: "1px solid #ddd",
                    fontSize: 15,
                    color: "white",
                    minWidth: col.minWidth,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}

              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  py: "6px",
                  borderRight: "1px solid #ddd",
                  borderLeft: "1px solid #ddd",
                  fontSize: 15,
                  color: "white",
                  width: 25,
                  maxWidth: 25,
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
                <TableRow  >
                  {
                    columns.map((column) => {
                      if (column.id === 'rubriques_poste') {
                        const label = group.rubriques_poste === "AUTRESACTIF"
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
                        return (
                          <TableCell key={column.id} colSpan={1} sx={{ fontWeight: "bold", py: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconButton
                                onClick={() => handleToggleCollapse(group.rubriques_poste)}
                                sx={{
                                  width: 20,
                                  height: 20,
                                  mr: 1,
                                }}
                                style={{
                                  textTransform: 'none',
                                  outline: 'none',
                                  backgroundColor: "#67AE6E",
                                  color: 'white',
                                }}
                              >
                                {expanded[group.rubriques_poste] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                              </IconButton>
                              <Typography fontWeight="bold" fontSize={14}>{label}</Typography>
                            </Stack>
                          </TableCell>
                        )
                      }
                      const numericColumns = [
                        'valeur_acquisition', 'augmentation', 'diminution', 'valeur_brute'
                      ];

                      if (numericColumns.includes(column.id)) {
                        const value = group[column.id] || 0;
                        return (
                          <TableCell key={column.id} sx={{ fontWeight: 'bold', py: 1 }} align={column.align}>
                            <Typography fontWeight="bold" fontSize={14}>
                              {value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </TableCell>
                        );
                      }

                      return <TableCell key={column.id} />;
                    })
                  }

                </TableRow>

                {/* Les lignes du groupe avec Collapse */}
                <TableRow   >
                  <TableCell colSpan={columns.length + 1} sx={{ p: 0 }}>
                    <Collapse in={!!expanded[group.rubriques_poste]} timeout="auto" unmountOnExit>
                      <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>

                        <colgroup>
                          {colWidths.map((w, i) => (
                            <col key={`c-${columns[i].id}`} style={{ width: w }} />
                          ))}
                          <col key="c-action" style={{ width: "100px" }} />
                        </colgroup>

                        <TableBody>
                          {group.items.map((item) => (
                            <TableRow key={item.id}>
                              {columns.map((column) => {
                                const value = column.sousgroupLabel ? item[column.id] : "";

                                return (
                                  <TableCell
                                    key={column.id}
                                    align={column.align || "left"}
                                    sx={{
                                      fontSize: 15,
                                      py: 0.1,
                                      borderBottom: column.sousgroupLabel ? "1px solid #ddd" : "transparent",
                                      // ensure content wraps neatly
                                      whiteSpace: column.isnumber ? "nowrap" : "normal",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
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
                              <TableCell
                                align="center"
                                sx={{
                                  width: 25,
                                  maxWidth: 25,
                                }}
                              >
                                {!state ? (
                                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-evenly'}>
                                    <IconButton
                                      onClick={() => handleRowModifClick(item)}
                                      variant="contained"
                                      style={{
                                        width: "25px", height: '25px',
                                        borderRadius: "1px", borderColor: "transparent",
                                        backgroundColor: "transparent",
                                        textTransform: 'none', outline: 'none'
                                      }}
                                    >
                                      <IoMdCreate style={{ width: '25px', height: '25px', color: initial.theme, position: 'absolute', }} />
                                    </IconButton>

                                    <IconButton
                                      onClick={() => handleRowDeleteClick(item)}
                                      variant="contained"
                                      style={{
                                        width: "25px", height: '25px',
                                        borderRadius: "1px", borderColor: "transparent",
                                        backgroundColor: "transparent",
                                        textTransform: 'none', outline: 'none'
                                      }}
                                    >
                                      <IoMdTrash style={{ width: '25px', height: '25px', color: initial.button_delete_color, position: 'absolute', }} />
                                    </IconButton>

                                  </Stack>
                                ) : (
                                  <span />
                                )}
                              </TableCell>

                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>

          <TableFooter >
            <TableRow sx={{ backgroundColor: "#89A8B2", position: "sticky", bottom: 0 }}>
              {columns.map((column) => (
                <TableCell
                  key={`footer-${column.id}`}
                  align={column.align || "left"}
                  sx={{ fontWeight: "bold", py: 1, minWidth: column.minWidth, fontSize: 15 }}
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
              <TableCell sx={{ fontWeight: "bold" }} />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default VirtualTableModifiableGroupableEbilanEIAFNC;