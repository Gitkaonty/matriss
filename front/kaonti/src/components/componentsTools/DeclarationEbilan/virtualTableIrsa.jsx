import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import { Box, Button, IconButton, Stack, Tooltip, Menu, MenuItem, Typography, Divider, TextField, Select, Paper, Card, CardActionArea, CardContent, Tab, FormControl, InputLabel, Popper } from '@mui/material';
import { IoMdTrash } from "react-icons/io";
import { IoMdCreate } from "react-icons/io";
import { format } from 'date-fns';
import { init } from '../../../../init';
import PopupConfirmDelete from '../popupConfirmDelete';



import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";


const VirtualTableIrsa = ({ columns, rows, deleteState, modifyState, state, editRowId, editRowData, onEditChange, onEditSave, onEditCancel, personnels, selectedRowId, onRowSelectionModelChange, onSort, onFilter, filters = [] }) => {
  // État pour le filtre contextuel popover
  const [filterPopoverAnchor, setFilterPopoverAnchor] = React.useState(null);
  const [filterPopoverColumn, setFilterPopoverColumn] = React.useState(null);

  // Pour ajout rapide d'un filtre dans le Popover
  const [newFilter, setNewFilter] = React.useState({ column: null, operator: 'contains', value: '' });
  const iconRefs = React.useRef({});

  React.useEffect(() => {
    if (filterPopoverAnchor && !document.body.contains(filterPopoverAnchor)) {
      setFilterPopoverAnchor(null);
    }
  }, [filterPopoverAnchor]);


  // State pour menu 3 points
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [menuColumnId, setMenuColumnId] = React.useState(null);
  // Sélection locale si non contrôlée
  const [localSelectedRowId, setLocalSelectedRowId] = React.useState(null);
  const effectiveSelectedRowId = selectedRowId !== undefined ? selectedRowId : localSelectedRowId;

  const handleRowClick = (rowId) => {
    if (onRowSelectionModelChange) {
      onRowSelectionModelChange([rowId]);
    } else {
      setLocalSelectedRowId(rowId);
    }
  }
  const initial = init[0];

  const handleRowModifClick = (row) => {
    if (modifyState) modifyState(row);
  };

  // Confirmation suppression ligne
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);
  const [rowToDelete, setRowToDelete] = React.useState(null);

  const handleRowDeleteClick = (row) => {
    setRowToDelete(row);
    setOpenConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (deleteState && rowToDelete) deleteState(rowToDelete);
    setOpenConfirmDelete(false);
    setRowToDelete(null);
  };

  const cancelDelete = () => {
    setOpenConfirmDelete(false);
    setRowToDelete(null);
  };

  // Pont vers PopupConfirmDelete (true => confirmer, false => annuler)
  const handleConfirmDeleteIrsa = (val) => {
    if (val === true) confirmDelete();
    else cancelDelete();
  };


  const columnWidths = columns.reduce((acc, column) => {
    acc[column.id] = column.minWidth;
    return acc;
  }, {});

  const totalColumn = (rows, columnId) => {
    return rows.reduce((total, row) => {
      const value = row[columnId];
      if (value != null && !isNaN(value)) {
        total += Number(value);
      }
      return total;
    }, 0);
  };

  return (
    <>
      {/* Popup de confirmation suppression (partagée) */}
      {openConfirmDelete && (
        <PopupConfirmDelete
          msg={'Voulez-vous vraiment supprimer cette ligne IRSA ?'}
          confirmationState={handleConfirmDeleteIrsa}
        />
      )}
      <TableContainer style={{ display: 'inline-block', width: 'auto', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650, border: '1px solid #ddd' }} aria-label="irsa table">
          <TableHead style={{ backgroundColor: initial.add_new_line_bouton_color, position: 'sticky', top: 0, zIndex: 1 }}>
            <TableRow>
              <TableCell
                key={'00modif'}
                align="center"
                style={{
                  fontWeight: 'bold',
                  top: 5,
                  minWidth: '50px',
                  paddingTop: '3px',
                  paddingBottom: '3px',
                  borderRight: '1px solid #ddd',
                  borderLeft: '1px solid #ddd',
                  fontSize: 14,
                  position: 'relative',
                  color: 'white',
                }}
              >
                Action
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{
                    fontWeight: 'bold',
                    top: 5,
                    minWidth: column.minWidth,
                    paddingTop: '3px',
                    paddingBottom: '3px',
                    borderRight: '1px solid #ddd',
                    borderLeft: '1px solid #ddd',
                    fontSize: 14,
                    color: 'white',
                    position: 'relative',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {column.label}

                    <>
                      <IconButton
                        ref={el => { iconRefs.current[column.id] = el; }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAnchorEl(e.currentTarget);
                          setMenuColumnId(column.id);
                        }}
                        size="small"
                        sx={{
                          marginLeft: 1,
                          color: 'white',
                          // 🔥 Enlever le rond au hover
                          '&:hover': {
                            backgroundColor: 'transparent'
                          },
                          // 🔥 Enlever le ripple (effet d’encre)
                          '& .MuiTouchRipple-root': {
                            display: 'none'
                          }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>

                      <Menu
                        anchorEl={menuAnchorEl}
                        open={menuColumnId === column.id && Boolean(menuAnchorEl)}
                        onClose={() => setMenuAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        PaperProps={{ sx: { minWidth: 140 } }}
                      >
                        <MenuItem onClick={() => { onSort && onSort('asc', column.id); setMenuAnchorEl(null); }}>
                          <ArrowUpwardIcon fontSize="small" sx={{ marginRight: 1 }} />
                          Tri ascendant
                        </MenuItem>
                        <MenuItem onClick={() => { onSort && onSort('desc', column.id); setMenuAnchorEl(null); }}>
                          <ArrowDownwardIcon fontSize="small" sx={{ marginRight: 1 }} />
                          Tri descendant
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setMenuAnchorEl(null);
                            setTimeout(() => {
                              const anchor = iconRefs.current[column.id];
                              if (anchor) {
                                setFilterPopoverAnchor(anchor);
                                setFilterPopoverColumn(column.id);
                              }
                            }, 100);
                          }}
                        >
                          <FilterListIcon fontSize="small" sx={{ marginRight: 1 }} />
                          Filtrer
                        </MenuItem>

                        <MenuItem
                          onClick={() => {
                            setMenuAnchorEl(null);
                            setTimeout(() => {
                              requestAnimationFrame(() => {
                                const anchor = iconRefs.current[column.id];
                                // On ne set l’ancre QUE si elle existe et est bien un HTMLElement
                                if (anchor && anchor instanceof HTMLElement && document.body.contains(anchor)) {
                                  setFilterPopoverAnchor(anchor);
                                  setFilterPopoverColumn(column.id);
                                }
                              });
                            }, 100);
                          }}
                        >
                        </MenuItem>
                      </Menu>
                      {/* Popover filtre contextuel */}
                      {filterPopoverAnchor && filterPopoverAnchor instanceof HTMLElement && filterPopoverColumn === column.id && (
                        <Popper
                          open={Boolean(filterPopoverAnchor) && filterPopoverAnchor instanceof HTMLElement}
                          anchorEl={filterPopoverAnchor}
                          placement="bottom"
                          style={{ zIndex: 1300 }}
                        >
                          <Box p={2} bgcolor="white" boxShadow={3} borderRadius={1} border={1} borderColor="#ddd" minWidth={340}>
                            <Typography fontWeight="bold" mb={1} fontSize={15}>Filtres actifs</Typography>
                            {(Array.isArray(filters) ? filters : []).map((filt, idx) => (

                              <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>

                                <FormControl variant="standard" sx={{ width: 200 }}>
                                  <InputLabel>Colonne à filtrer :</InputLabel>
                                  <Select
                                    value={filt.column}
                                    onChange={(e) => {
                                      const newFilters = filters.map((f, i) =>
                                        i === idx ? { ...f, column: e.target.value } : f
                                      );
                                      onFilter(newFilters);
                                    }}
                                    MenuProps={{
                                      PaperProps: {
                                        sx: {
                                          maxHeight: 300,
                                          width: 200,
                                        },
                                      },
                                      anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left",
                                      },
                                      transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left",
                                      },
                                    }}
                                  >
                                    {columns.map((col) => (
                                      <MenuItem key={col.id} value={col.id}>
                                        {col.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl variant="standard" sx={{ width: 110 }}>
                                  <InputLabel>Opérateur :</InputLabel>
                                  <Select
                                    value={filt.operator}
                                    onChange={(e) => {
                                      const newFilters = filters.map((f, i) =>
                                        i === idx ? { ...f, operator: e.target.value } : f
                                      );
                                      onFilter(newFilters);
                                    }}
                                  >
                                    <MenuItem value="contains">contient</MenuItem>
                                    <MenuItem value="equals">égal</MenuItem>
                                  </Select>
                                </FormControl>

                                <TextField
                                  variant="standard"
                                  label="Valeur"
                                  value={filt.value}
                                  onChange={(e) => {
                                    const newFilters = filters.map((f, i) =>
                                      i === idx ? { ...f, value: e.target.value } : f
                                    );
                                    onFilter(newFilters);
                                  }}
                                  sx={{ minWidth: 180 }}
                                />
                                <IconButton size="small" color="error" onClick={() => onFilter(filters.filter((_, i) => i !== idx))}>
                                  ×
                                </IconButton>
                              </Box>
                            ))}

                            <Box display="flex" gap={1} alignItems="center" mt={2}>
                              <FormControl variant="standard" sx={{ width: 200 }}>
                                <InputLabel>Colonne à filtrer :</InputLabel>
                                <Select
                                  value={newFilter.column || filterPopoverColumn || columns[0]?.id}
                                  onChange={(e) =>
                                    setNewFilter((f) => ({ ...f, column: e.target.value }))
                                  }
                                  MenuProps={{
                                    PaperProps: {
                                      sx: {
                                        maxHeight: 300,
                                        width: 200,
                                      },
                                    },
                                    anchorOrigin: {
                                      vertical: "bottom",
                                      horizontal: "left",
                                    },
                                    transformOrigin: {
                                      vertical: "top",
                                      horizontal: "left",
                                    },
                                  }}
                                >
                                  {columns.map((col) => (
                                    <MenuItem key={col.id} value={col.id}>
                                      {col.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>


                              <FormControl variant="standard" sx={{ minWidth: 130 }}>
                                <InputLabel>Opérateur :</InputLabel>
                                <Select
                                  value={newFilter.operator}
                                  onChange={e => setNewFilter(f => ({ ...f, operator: e.target.value }))}
                                  size="small"
                                  style={{ width: 110 }}
                                >
                                  <MenuItem value="contains">contient</MenuItem>
                                  <MenuItem value="equals">égal</MenuItem>
                                </Select>
                              </FormControl>
                              <TextField
                                variant="standard"
                                label="Valeur"
                                value={newFilter.value}
                                onChange={(e) =>
                                  setNewFilter((f) => ({ ...f, value: e.target.value }))
                                }
                                sx={{ width: 180 }}
                              />

                              <IconButton size="small" color="primary"
                                onClick={() => {
                                  if (!newFilter.column) return;
                                  const toAdd = { ...newFilter };
                                  onFilter([...(filters || []), toAdd]);
                                  setNewFilter({ column: null, operator: 'contains', value: '' });
                                }}
                              >
                                +
                              </IconButton>
                            </Box>
                            <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                              <Button
                                onClick={() => {
                                  // Si un filtre est en cours de saisie, on l’ajoute avant de fermer
                                  if (newFilter.column && newFilter.value !== '') {
                                    const toAdd = { ...newFilter };
                                    onFilter([...(filters || []), toAdd]);
                                    setNewFilter({ column: null, operator: 'contains', value: '' });
                                  }
                                  setFilterPopoverAnchor(null);
                                }}
                                size="small"
                                variant="contained"
                                startIcon={<IoIosCheckmarkCircle size={20} />}
                              >
                                OK
                              </Button>
                              <Button
                                onClick={() => setFilterPopoverAnchor(null)}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={<IoIosCloseCircle size={20} />}
                              >
                                Fermer
                              </Button>
                            </Box>

                          </Box>
                        </Popper>
                      )}
                    </>
                  </span>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                hover
                tabIndex={-1}
                key={row.id}
                style={{
                  height: '20px',
                  backgroundColor: row.id === effectiveSelectedRowId?.[0] || row.id === effectiveSelectedRowId ? '#e3f2fd' : '',
                  cursor: 'pointer',
                }}
                onClick={() => handleRowClick(row.id)}
              >

                {!state ? (
                  <TableCell key="boutonModif" align="center" style={{ paddingTop: '5px', paddingBottom: '5px', fontSize: 15 }}>
                    {row.id === editRowId ? (
                      <Stack direction={'row'} alignItems={'center'} spacing={1}>
                        <Button onClick={onEditSave} color="success" size="small" variant="contained">Valider</Button>
                        <Button onClick={onEditCancel} color="error" size="small" variant="outlined">Annuler</Button>
                      </Stack>
                    ) : (
                      <Stack direction={'row'} alignItems={'center'} spacing={1}>
                        <IconButton
                          onClick={() => {
                            if (modifyState) modifyState(row);
                            if (typeof setEditRowModal === 'function') setEditRowModal(row);
                          }}
                          variant="contained"
                          style={{ width: '25px', height: '25px', borderRadius: '1px', borderColor: 'transparent', backgroundColor: 'transparent', textTransform: 'none', outline: 'none' }}
                          title="Modifier cette ligne via formulaire"
                        >
                          <IoMdCreate style={{ width: '25px', height: '25px', color: initial.theme, position: 'absolute' }} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleRowDeleteClick(row)}
                          variant="contained"
                          style={{ width: '25px', height: '25px', borderRadius: '1px', borderColor: 'transparent', backgroundColor: 'transparent', textTransform: 'none', outline: 'none' }}
                        >
                          <IoMdTrash style={{ width: '25px', height: '25px', color: initial.button_delete_color, position: 'absolute' }} />
                        </IconButton>
                      </Stack>
                    )}
                  </TableCell>
                ) : (
                  <TableCell key="boutonModif" align="center" style={{ paddingTop: '5px', paddingBottom: '5px', fontSize: 15 }} />
                )}
                {columns.map((column) => {
                  // Mode édition inline ?
                  if (row.id === editRowId && editRowData) {
                    // Cas personnel : Select
                    if (column.id === 'personnel_id') {
                      return (
                        <TableCell key={column.id} align={column.align} style={{ paddingTop: '5px', paddingBottom: '5px', fontSize: 15 }}>
                          <select
                            value={editRowData.personnel_id || ''}
                            onChange={e => {
                              const selectedId = Number(e.target.value);
                              const selectedPersonnel = personnels.find(p => p.id === selectedId) || null;
                              onEditChange('personnel_id', selectedId);
                              onEditChange('personnel', selectedPersonnel);
                            }}
                          >
                            <option value=''>- Sélectionner -</option>
                            {personnels && personnels.map(p => (
                              <option key={p.id} value={p.id}>{p.matricule || p.nom || p.id}</option>
                            ))}
                          </select>
                        </TableCell>
                      );
                    }
                    // Cellules éditables (numériques ou texte)
                    if (column.editable) {
                      return (
                        <TableCell key={column.id} align={column.align} style={{ paddingTop: '5px', paddingBottom: '5px', fontSize: 15 }}>
                          <TextField
                            value={editRowData[column.id] || ''}
                            onChange={e => onEditChange(column.id, e.target.value)}
                            size='small'
                            type={column.isnumber ? 'number' : 'text'}
                            inputProps={column.isnumber ? { step: '0.01' } : {}}
                          />
                        </TableCell>
                      );
                    }
                    // Cellules non éditables (affichage)
                    let value = row[column.id];
                    if (column.valueGetter && typeof column.valueGetter === 'function') {
                      value = column.valueGetter({ row: editRowData });
                    }
                    return (
                      <TableCell key={column.id} align={column.align} style={{ paddingTop: '5px', paddingBottom: '5px', fontSize: 15 }}>
                        {column.format && value !== undefined && value !== null
                          ? column.format(value)
                          : value instanceof Date
                            ? format(value, 'dd/MM/yyyy')
                            : value}
                      </TableCell>
                    );
                  }
                  // Mode normal
                  let value = row[column.id];
                  if (column.valueGetter && typeof column.valueGetter === 'function') {
                    value = column.valueGetter({ row });
                  }
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{
                        paddingTop: '5px',
                        paddingBottom: '5px',
                        fontSize: 15,
                      }}
                    >
                      {column.format && value !== undefined && value !== null
                        ? column.format(value)
                        : value instanceof Date
                          ? format(value, 'dd/MM/yyyy')
                          : value}
                    </TableCell>
                  );
                })}
                {/* Colonne Action */}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter style={{ backgroundColor: '#89A8B2', position: 'sticky', bottom: 0, zIndex: 1 }}>
            <TableRow>
              <TableCell align="center" style={{ fontWeight: 'bold', paddingTop: '5px', paddingBottom: '5px', borderTop: '1px solid #ddd', minWidth: '50px', fontSize: 15 }}>
                {/* Cellule vide pour la colonne Action */}
              </TableCell>
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
                    fontSize: 15,
                  }}
                >
                  {column.isnumber
                    ? totalColumn(rows, column.id).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : ''}
                </TableCell>
              ))}

            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
};

export default VirtualTableIrsa;
