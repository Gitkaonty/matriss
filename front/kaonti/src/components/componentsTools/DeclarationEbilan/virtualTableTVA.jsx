import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';  
import { init } from '../../../../init';
import { Stack, IconButton } from '@mui/material';
import { IoMdCreate, IoMdTrash } from 'react-icons/io';
import { FaCheck } from "react-icons/fa";
import Tooltip from '@mui/material/Tooltip';
import { TiWarning } from "react-icons/ti";

export default function VirtualTableTVA({ columns, rows, onDeleteRow }) {
  const initial = init[0];
  const formatNumberFrs = (n) => {
    if (n === null || n === undefined || n === '') return '';
    const num = Number(n);
    if (!isFinite(num)) return String(n);
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  };

  const formatDateDMY = (val) => {
    if (!val) return '';
    const d = (val instanceof Date) ? val : new Date(String(val));
    if (!(d instanceof Date) || isNaN(d.getTime())) return String(val);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
      <TableHead>
      <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{ minWidth: column.minWidth, fontWeight: 'bold', color: 'white', backgroundColor: initial.add_new_line_bouton_color }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.id || idx} sx={{ height: 28 }}>
              {columns.map((column) => {
                const value = row[column.id];
                let content = value ?? '';
                // Allow custom formatting per column
                if (typeof column.format === 'function') {
                  try {
                    content = column.format(value, row);
                  } catch {}
                } else {
                  // Default automatic formatting for numbers/dates when no custom formatter provided
                  try {
                    // numbers
                    if (typeof value === 'number') {
                      content = formatNumberFrs(value);
                    } else if (value && typeof value === 'string') {
                      // ISO date-like strings -> format DD/MM/YYYY
                      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
                        content = formatDateDMY(value);
                      } else if (/^(debit|credit|montant|amount|prix|vnc|solde|total)/i.test(String(column.id || '')) && !isNaN(Number(value))) {
                        // numeric-ish columns with numeric content
                        content = formatNumberFrs(Number(value));
                      }
                    } else if (value instanceof Date) {
                      content = formatDateDMY(value);
                    }
                  } catch (e) {
                    // ignore formatting errors
                  }
                }
                if (column.id === 'action') {
                  content = (
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); row.onEdit && row.onEdit(row); }}
                        variant="contained"
                        style={{ width: '20px', height: '20px', borderRadius: '1px', borderColor: 'transparent', backgroundColor: 'transparent', textTransform: 'none', outline: 'none' }}
                        title="Modifier cette ligne via formulaire"
                      >
                        <IoMdCreate style={{ width: '25px', height: '25px', color: initial.theme, position: 'absolute' }} />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onDeleteRow === 'function') {
                            onDeleteRow(row);
                          } else if (row.onDelete) {
                            row.onDelete(row);
                          }
                        }}
                        variant="contained"
                        style={{ width: '20px', height: '20px', borderRadius: '1px', borderColor: 'transparent', backgroundColor: 'transparent', textTransform: 'none', outline: 'none' }}
                        title="Supprimer cette ligne"
                      >
                        <IoMdTrash style={{ width: '25px', height: '25px', color: '#d32f2f', position: 'absolute' }} />
                      </IconButton>
                    </Stack>
                  );
                } else if (column.id === 'anomalies') {
                  const isTrue = value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE';
                  const isEmpty = (v) => {
                    const s = String(v ?? '').trim();
                    if (s === '') return true;
                    const low = s.toLowerCase();
                    return low === 'n/a' || low === 'na' || low === 'null' || low === 'undefined' || low === '-';
                  };
                  const notes = [];
                  if (isEmpty(row?.nif)) notes.push('NIF vide');
                  if (isEmpty(row?.stat)) notes.push('STAT vide');
                  if (isEmpty(row?.raison_sociale)) notes.push('Raison sociale vide');
                  if (isEmpty(row?.adresse)) notes.push('Adresse vide');
                  if (isEmpty(row?.reference_facture)) notes.push('Référence facture vide');
                  if (isEmpty(row?.date_facture)) notes.push('Date facture vide');
                  const fallbackComment = notes.join(', ');
                  const comment = (row.commentaire && String(row.commentaire).trim()) ? row.commentaire : fallbackComment;
                  content = (
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      sx={{ width: '100%', height: '100%' }}
                    >
                      {isTrue ? (
                        <Tooltip title={comment || 'Anomalie détectée'} placement="top" arrow>
                          <span>
                            <TiWarning size={25} color="red" />
                          </span>
                        </Tooltip>
                      ) : (
                        <TiWarning size={25} color="green" />
                      )}
                    </Stack>
                  );
                }                
                return (
                  <TableCell key={column.id} align={column.align || 'left'} sx={{ padding: "4px 8px" }}>
                    {content}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
