import * as React from 'react';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Stack, IconButton, Collapse, Tooltip } from '@mui/material';
import { IoMdCreate, IoMdTrash } from "react-icons/io";
import { TiWarning } from "react-icons/ti";
import { init } from '../../../../init';

const GroupedRow = ({ group, columns, initial, verrouillage, handleRowModifClick, handleRowDeleteClick, nature }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Ligne principale du compte avec sous-total */}
            <TableRow hover>
                <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? '▲' : '▼'}
                        </IconButton>
                        {group.compte}
                    </Stack>
                </TableCell>

                {!verrouillage && (
                    <TableCell align="center">
                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleRowModifClick(group)} sx={{ p: 0 }}>✏️</IconButton>
                            {nature !== 'PLP' && <IconButton onClick={() => handleRowDeleteClick(group)} sx={{ p: 0 }}>🗑️</IconButton>}
                        </Stack>
                    </TableCell>
                )}

                {columns.map((column) => (
                    <TableCell key={column.id} align={column.align} style={{ fontWeight: 'bold' }}>
                        {['comptabilisees', 'versees', 'montanth_tva', 'tva'].includes(column.id)
                            ? group[column.id].toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : ''}
                    </TableCell>
                ))}
            </TableRow>

            {/* Lignes détaillées */}
            <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={columns.length + 2}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table>
                            <TableBody>
                                {group.lignes.map((row, idx) => {
                                    let commentaires = [];
                                    if (nature !== 'PLP') {
                                        if (!row.nif) commentaires.push("NIF vide");
                                        if (!row.num_stat) commentaires.push("Stat vide");
                                        if (!row.cin) commentaires.push("CIN vide");
                                        if (!row.date_cin) commentaires.push("Date CIN vide");
                                        if (!row.nif_representaires) commentaires.push("NIF représentant vide");
                                        if (!row.raison_sociale) commentaires.push("Raison sociale vide");
                                        if (!row.nom_commercial) commentaires.push("Nom commerciale vide");
                                        if (!row.adresse) commentaires.push("Adresse vide");
                                        if (!row.fokontany) commentaires.push("Fokontany vide");
                                        if (!row.ville) commentaires.push("Ville vide");
                                        if (!row.pays) commentaires.push("Pays vide");
                                        if (!row.montanth_tva) commentaires.push("Montant HT vide");
                                    }

                                    return (
                                        <TableRow hover key={idx}>
                                            {!verrouillage && <TableCell />}
                                            {nature !== 'PLP' && (
                                                <TableCell>
                                                    <Tooltip
                                                        title={commentaires.length > 0 ? commentaires.join("\n") : "Aucune anomalie"}
                                                        arrow
                                                    >
                                                        <span>
                                                            <TiWarning color={commentaires.length > 0 ? '#ff086f' : '#39ff08'} />
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                            )}
                                            {columns.map((column) => (
                                                <TableCell key={column.id} align={column.align}>
                                                    {row[column.id]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

export default GroupedRow;