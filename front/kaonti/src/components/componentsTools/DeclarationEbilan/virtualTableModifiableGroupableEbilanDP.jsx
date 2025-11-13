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

const VirtualTableModifiableGroupableEbilanDP = ({ columns, rows, deleteState, modifyState, state }) => {
  const initial = init[0];

  const handleRowModifClick = (row) => {
    modifyState(row);
  }

  const handleRowDeleteClick = (row) => {
    deleteState(row);
  }

  const [expanded, setExpanded] = useState({});

  const handleToggleCollapse = (groupName) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [groupName]: !prevExpanded[groupName],
    }));
  };

  const colWidths = columns.map((c) => (typeof c.minWidth === "number" ? `${c.minWidth}px` : c.minWidth || "auto"));

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
      if (a.nature_prov < b.nature_prov) {
        return -1;  // a vient avant b
      }
      if (a.nature_prov > b.nature_prov) {
        return 1;   // b vient avant a
      }
      return 0;  // a et b sont égaux
    });
  }, [rows]);

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

          <TableHead sx={{ backgroundColor: initial.theme || "#1976d2", position: "sticky", top: 0, zIndex: 2 }}>
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
                className="sticky-action"
                sx={{
                  fontWeight: 'bold',
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  fontSize: 15,
                  color: 'white',
                  backgroundColor: initial.theme,
                  minWidth: 350
                }}
              >
                Action
              </TableCell>

            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((group) => (
              <React.Fragment key={group.nature_prov}>
                {/* Ligne groupe (titre) */}
                <TableRow>
                  {/* <TableCell
                    colSpan={columns.length + 1}
                    sx={{ fontWeight: "bold", border: "none", py: 1 }}
                  >
                    <IconButton
                      onClick={() => handleToggleCollapse(group.nature_prov)}
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
                      {expanded[group.nature_prov] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>

                    {group.nature_prov === "RISQUE"
                      ? "Provisions pour risques et charges"
                      : group.nature_prov === "DEPRECIATION"
                        ? "Provisions pour dépréciation"
                        : "Autres provisions"}
                  </TableCell> */}
                  {columns.map((column) => {
                    if (column.id === 'nature_prov') {
                      const label =
                        group.nature_prov === "RISQUE"
                          ? "Provisions pour risques et charges"
                          : group.nature_prov === "DEPRECIATION"
                            ? "Provisions pour dépréciation"
                            : "Autres provisions"

                      return (
                        <TableCell key={column.id} colSpan={1} sx={{ fontWeight: "bold", py: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton
                              onClick={() => handleToggleCollapse(group.nature_prov)}
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
                              {expanded[group.nature_prov] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                            </IconButton>
                            <Typography fontWeight="bold" fontSize={14}>{label}</Typography>
                          </Stack>
                        </TableCell>
                      );
                    }

                    const numericColumns = [
                      'montant_debut_ex', 'augm_dot_ex', 'dim_repr_ex',
                      'montant_fin'
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
                  })}
                </TableRow>

                {/* Collapse: on met une cellule full-width qui contient une TABLE avec colgroup identique */}
                <TableRow>
                  <TableCell colSpan={columns.length + 1} sx={{ p: 0 }}>
                    <Collapse in={!!expanded[group.nature_prov]} timeout="auto" unmountOnExit>
                      <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                        {/* même colgroup ici => alignement parfait */}
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
                                      ? typeof value === "number"
                                        ? column.format(value)
                                        : format(value, "dd/MM/yyyy")
                                      : value ?? ""}
                                  </TableCell>
                                );
                              })}

                              {/* Colonne Action (toujours présente pour garder alignement) */}
                              <TableCell
                                align="center"
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

                                    {
                                      group.nature_prov === 'AUTRE'
                                        ? <IconButton
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
                                        : null
                                    }

                                  </Stack>
                                ) : (
                                  <span />
                                )}
                              </TableCell>

                            </TableRow>
                          ))}

                          {/* Ligne Sous-total (même nombre de cellules) */}
                          {/* <TableRow>
                            {columns.map((column) => (
                              <TableCell
                                key={`subtotal-${column.id}`}
                                align={column.align || "left"}
                                sx={{
                                  fontWeight: "bold",
                                  fontSize: 15,
                                  py: 0.6,
                                  backgroundColor: column.id === "nature_prov" ? "transparent" : "#f0f0f0",
                                }}
                              >
                                {column.id === "nature_prov"
                                  ? ""
                                  : column.id === "libelle"
                                    ? "Sous Total"
                                    : column.isnumber
                                      ? // soustotalGroup doit exister dans ton scope
                                      typeof soustotalGroup === "function"
                                        ? soustotalGroup(group.nature_prov, column.id).toLocaleString("fr-FR", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                        : ""
                                      : ""}
                              </TableCell>
                            ))}

                            <TableCell sx={{ backgroundColor: "#f0f0f0" }} />
                          </TableRow> */}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>

          {/* Footer (optionnel) */}
          <TableFooter>
            <TableRow sx={{ backgroundColor: "#89A8B2", position: "sticky", bottom: 0 }}>
              {columns.map((column) => (
                <TableCell
                  key={`footer-${column.id}`}
                  align={column.align || "left"}
                  sx={{ fontWeight: "bold", py: 1, minWidth: column.minWidth, fontSize: 15 }}
                >
                  {column.id === "nature_prov"
                    ? "Total"
                    : column.isnumber
                      ? typeof totalGroup === "function"
                        ? totalGroup(column.id).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : ""
                      : ""}
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

export default VirtualTableModifiableGroupableEbilanDP;