import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { Box, IconButton, Stack, TableFooter, Typography, Menu, MenuItem, Popper, Select, Button, TextField, InputLabel, FormControl } from '@mui/material';
import { IoMdTrash } from "react-icons/io";
import { IoMdCreate } from "react-icons/io";
import { format } from 'date-fns';
import React from 'react';
import { init } from '../../../../init';
import PopupConfirmDelete from '../popupConfirmDelete';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";

// Composant VirtualTablePaie : tableau custom paie avec tri, filtre, édition via modal
const VirtualTablePaie = ({ columns, rows, deleteState, modifyState, state, editRowId, editRowData, onEditChange, onEditSave, onEditCancel, personnels, selectedRowId, onRowSelectionModelChange, onSort, onFilter, filters = [] }) => {
  // État pour le filtre contextuel popper
  const [filterPopoverAnchor, setFilterPopoverAnchor] = React.useState(null);
  const [filterPopoverColumn, setFilterPopoverColumn] = React.useState(null);
  const [newFilter, setNewFilter] = React.useState({ column: null, operator: 'contains', value: '' });
  const iconRefs = React.useRef({});
  const initial = init[0];
  // Confirmation suppression ligne via PopupConfirmDelete
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);
  const [rowToDelete, setRowToDelete] = React.useState(null);

  const handleRowDeleteClick = (row) => {
    setRowToDelete(row);
    setOpenConfirmDelete(true);
  };

  const handleConfirmDeletePaie = (val) => {
    if (val === true) {
      if (deleteState && rowToDelete) deleteState(rowToDelete);
    }
    setOpenConfirmDelete(false);
    setRowToDelete(null);
  };

  // État pour le filtre contextuel popper
  const [filterOperator, setFilterOperator] = React.useState('contains');
  const [filterValue, setFilterValue] = React.useState('');

  React.useEffect(() => {
    if (filterPopoverAnchor && !document.body.contains(filterPopoverAnchor)) {
      setFilterPopoverAnchor(null);
    }
  }, [filterPopoverAnchor]);

  // State pour menu 3 points
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [menuColumn, setMenuColumn] = React.useState(null);

  const columnWidths = columns.reduce((acc, column) => {
    acc[column.id] = column.minWidth;
    return acc;
  }, {});

  // Fonction pour totaliser une colonne numérique
  const totalColumn = (rows, columnId) => {
    return rows.reduce((total, row) => {
      const value = row[columnId];
      if (value != null && !isNaN(value)) {
        total += Number(value);
      }
      return total;
    }, 0);
  };

  const handleMenuOpen = (event, column) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuColumn(column);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuColumn(null);
  };

  // Handler pour sélectionner une ligne au clic (comme VirtualTableIrsa)
  const [localSelectedRowId, setLocalSelectedRowId] = React.useState(null);
  // Ne redéclarer effectiveSelectedRowId qu'une seule fois ici
  const effectiveSelectedRowId = selectedRowId !== undefined ? selectedRowId : localSelectedRowId;
  const handleRowClick = (rowId) => {
    if (onRowSelectionModelChange) {
      onRowSelectionModelChange([rowId]);
    } else {
      setLocalSelectedRowId(rowId);
    }
  };

  return (
    <>
    {openConfirmDelete && (
      <PopupConfirmDelete
        msg={"Voulez-vous vraiment supprimer cette ligne de paie ?"}
        confirmationState={handleConfirmDeletePaie}
      />
    )}
    <TableContainer style={{ display: 'inline-block', width: 'auto', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650, border: '1px solid #ddd' }} aria-label="paie table">
        <TableHead style={{ backgroundColor: initial.add_new_line_bouton_color, position: 'sticky', top: 0, zIndex: 1 }}>
          <TableRow>
            <TableCell key="boutonModif" align="center" style={{ fontWeight: 'bold', top: 5, minWidth: '50px', paddingTop: '3px', paddingBottom: '3px', borderRight: '1px solid #ddd', borderLeft: '1px solid #ddd', fontSize: 14, color: 'white', position: 'relative' }}>
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
                <span style={{display:'inline-flex',alignItems:'center'}}>
                  {column.label}
                
                  <>
                  <IconButton
                    ref={el => { iconRefs.current[column.id] = el; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuAnchorEl(e.currentTarget);
                      setMenuColumn(column.id);
                    }}
                    size="small"
                    sx={{ marginLeft: 1, color: 'white' }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>

                  <Menu
                    anchorEl={menuAnchorEl}
                    open={menuColumn === column.id && Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    PaperProps={{ sx: { minWidth: 140 } }}
                  >
                    <MenuItem onClick={() => { onSort && onSort('desc', column.id); handleMenuClose(); }}>
                        <ArrowUpwardIcon fontSize="small" sx={{ marginRight: 1 }} />
                        Tri descendant
                        </MenuItem>
                    <MenuItem onClick={() => { onSort && onSort('asc', column.id); handleMenuClose(); }}>
                        <ArrowDownwardIcon fontSize="small" sx={{ marginRight: 1 }} />
                        Tri ascendant
                        </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        setTimeout(() => {
                          requestAnimationFrame(() => {
                            const anchor = iconRefs.current[column.id];
                            if (anchor && anchor instanceof HTMLElement && document.body.contains(anchor)) {
                              setFilterPopoverAnchor(anchor);
                              setFilterPopoverColumn(column.id);
                            }
                          });
                        }, 100);
                      }}
                    >
                     <FilterListIcon fontSize="small" sx={{ marginRight: 1 }} />
                     Filtrer
                    </MenuItem>
                  </Menu>
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
                              onChange={e => {
                                const newFilters = filters.map((f, i) => i === idx ? { ...f, column: e.target.value } : f);
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
                              {columns.map(col => (
                                <MenuItem key={col.id} value={col.id}>{col.label}</MenuItem>
                              ))}
                            </Select>
                            </FormControl>
                            <FormControl variant="standard" sx={{ width: 110 }}>
                            <InputLabel>Opérateur :</InputLabel>
                            <Select
                              value={filt.operator}
                              onChange={e => {
                                const newFilters = filters.map((f, i) => i === idx ? { ...f, operator: e.target.value } : f);
                                onFilter(newFilters);
                              }}
                              size="small"
                              style={{ minWidth: 110 }}
                            >
                              <MenuItem value="contains">contient</MenuItem>
                              <MenuItem value="equals">égal</MenuItem>
                            </Select>
                            </FormControl>

                            <TextField
                            variant="standard"
                            label="Valeur"
                              value={filt.value}
                              onChange={e => {
                                const newFilters = filters.map((f, i) => i === idx ? { ...f, value: e.target.value } : f);
                                onFilter(newFilters);
                              }}
                              size="small"
                              style={{ width: 180 }}
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
                            onChange={e => setNewFilter(f => ({ ...f, column: e.target.value }))}
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
                            {columns.map(col => (
                              <MenuItem key={col.id} value={col.id}>{col.label}</MenuItem>
                            ))}
                          </Select>
                          </FormControl>
                          <FormControl variant="standard" sx={{ width: 110 }}>
                          <InputLabel>Opérateur :</InputLabel>
                          <Select
                            value={newFilter.operator}
                            onChange={e => setNewFilter(f => ({ ...f, operator: e.target.value }))}
                            size="small"
                            style={{ minWidth: 110 }}
                          >
                            <MenuItem value="contains">contient</MenuItem>
                            <MenuItem value="equals">égal</MenuItem>
                          </Select>
                          </FormControl>
                          <TextField
                            variant="standard"
                            label="Valeur"
                            value={newFilter.value}
                            onChange={e => setNewFilter(f => ({ ...f, value: e.target.value }))}
                            size="small"
                            style={{ width: 180 }}
                          />

                          <IconButton size="small" color="primary" onClick={() => {
                              if (!newFilter.column) return;
                              const toAdd = { ...newFilter };
                              onFilter([...(filters || []), toAdd]);
                              setNewFilter({ column: null, operator: 'contains', value: '' });
                            }}
                            variant="outlined"
                          >
                            +
                          </IconButton>
                        </Box>
                        <Box display="flex" gap={1} justifyContent="flex-end" mt={2}>
                        <Button
                            onClick={() => {
                              if (!newFilter.column) return;
                              const toAdd = { ...newFilter };
                              onFilter([...(filters || []), toAdd]);
                              setNewFilter({ column: null, operator: 'contains', value: '' });
                              setFilterPopoverAnchor(null);
                            }}
                            size="small"
                            variant="contained"
                            color="primary"
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
    <TableCell key="boutonModif" align="center" style={{ paddingTop: '5px', paddingBottom: '5px', fontSize: 15 }}>
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            if (modifyState) modifyState(row);
            if (typeof setEditRowPaieModal === 'function') setEditRowPaieModal(row);
          }}
          variant="contained"
          style={{ width: '25px', height: '25px', borderRadius: '1px', borderColor: 'transparent', backgroundColor: 'transparent', textTransform: 'none', outline: 'none' }}
          title="Modifier cette ligne via formulaire"
        >
          <IoMdCreate style={{ width: '25px', height: '25px', color: initial.theme, position: 'absolute' }} />
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleRowDeleteClick(row);
          }}
          variant="contained"
          style={{ width: '25px', height: '25px', borderRadius: '1px', borderColor: 'transparent', backgroundColor: 'transparent', textTransform: 'none', outline: 'none' }}
        >
          <IoMdTrash style={{ width: '25px', height: '25px', color: initial.button_delete_color, position: 'absolute' }} />
        </IconButton>
      </Stack>
    </TableCell>
      {columns.map((column) => {
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

export default VirtualTablePaie;
