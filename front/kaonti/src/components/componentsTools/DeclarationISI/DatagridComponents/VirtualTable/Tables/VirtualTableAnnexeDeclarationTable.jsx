import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Stack, TableFooter, Tooltip } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, IconButton } from '@mui/material';
import { IoMdCreate } from "react-icons/io";
import { IoMdTrash } from "react-icons/io";
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { init } from '../../../../../../../init';
import { format } from 'date-fns';

import { TiWarning } from "react-icons/ti";

const VirtualTableAnnexeDeclarationTable = ({ columns, deleteState, modifyState, rows }) => {
    const [openRows, setOpenRows] = useState({});

    const handleRowDeleteClick = (row, type) => {
        const newRow = { ...row, type: type };
        deleteState(newRow);
    }

    const handleRowModifClick = (row) => {
        modifyState(row);
    }

    const toggleRow = (compte) => setOpenRows(prev => ({ ...prev, [compte]: !prev[compte] }));

    const initial = init[0];

    const totalColumn = (rows, columnId) => {
        return rows.reduce((total, row) => {
            const value = parseFloat(row[columnId]);

            if (value != null && !isNaN(value)) {
                total += value;
            }
            return total;
        }, 0);
    };

    const groupedData =
        rows.reduce((acc, row) => {
            if (!acc[row.compte]) {
                acc[row.compte] = {
                    id: row.id,
                    id_numcpt: row.id_numcpt,
                    id_compte: row.id_compte,
                    id_dossier: row.id_dossier,
                    id_exercice: row.id_exercice,
                    compte: row.compte,
                    nom: row.nom,
                    cin: row.cin,
                    nature_transaction: row.nature_transaction,
                    detail_transaction: row.detail_transaction,
                    date_transaction: row.date_transaction,
                    province: row.province,
                    region: row.region,
                    district: row.district,
                    commune: row.commune,
                    fokontany: row.fokontany,
                    validite: row.validite,
                    lignes: [],
                    montant_transaction: parseFloat(row.montant_transaction) || 0,
                    montant_isi: parseFloat(row.montant_isi) || 0,
                    sousTotal: 0
                };
            } else {
                acc[row.compte].montant_transaction += parseFloat(row.montant_transaction) || 0;
                acc[row.compte].montant_isi += parseFloat(row.montant_isi) || 0;
            }

            acc[row.compte].lignes.push(row);

            acc[row.compte].sousTotal =
                acc[row.compte].montant_transaction +
                acc[row.compte].montant_isi

            return acc;
        }, {});

    const excludedColumnIds = new Set([
        'compte',
        'nom',
        'cin',
        'nature_transaction',
        'detail_transaction',
        'date_transaction',
        'province',
        'region',
        'district',
        'commune',
        'fokontany',
        'validite'
    ])

    return (
        <Box sx={{ width: '100%', padding: 0, margin: 0 }}>
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', maxHeight: '50vh', }}>
                <Table sx={{ width: '100%', border: '', ableLayout: "fixed" }} aria-label="simple table">
                    <TableHead
                        style={{
                            backgroundColor: initial.theme,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        <TableRow>
                            <TableCell
                                className="sticky-action"
                                sx={{
                                    fontWeight: 'bold',
                                    paddingTop: '5px',
                                    paddingBottom: '5px',
                                    fontSize: 15,
                                    color: 'white',
                                    align: 'center',
                                    backgroundColor: initial.theme,
                                }}
                            >
                            </TableCell>
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
                                    borderLeft: '1px solid #ddd',
                                }}
                            >
                                Action
                            </TableCell>
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
                                    borderLeft: '1px solid #ddd',
                                }}
                            >
                                Annomalies
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{
                                        fontWeight: 'bold',
                                        top: 5,
                                        minWidth: column.minWidth,
                                        flex: 10,
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            Object.values(groupedData).map((group, key) => {
                                const commentaires = [];
                                // if (!row.id_numcpt) commentaires.push("N° compte vide")
                                if (!group.nom) commentaires.push("Nom vide");
                                if (!group.province) commentaires.push("Province vide");
                                if (!group.region) commentaires.push("Région vide");
                                if (!group.district) commentaires.push("District vide");
                                if (!group.commune) commentaires.push("Commune vide");
                                if (!group.fokontany) commentaires.push("Fokontany vide");
                                if (!group.cin) commentaires.push("CIN vide");
                                if (!group.nature_transaction) commentaires.push("Nature transaction vide");
                                if (!group.detail_transaction) commentaires.push("Detail transaction vide");

                                return (
                                    <React.Fragment key={key}>
                                        <TableRow
                                            sx={{
                                                position: "sticky",
                                                top: 35,
                                                zIndex: 2,
                                                backgroundColor: "#f5f5f5"
                                            }}
                                        >

                                            <TableCell align="center"
                                                style={{
                                                    paddingTop: '4px', paddingBottom: '4px', fontSize: '13px', position: "sticky", top: 35
                                                }}
                                            >
                                                <IconButton
                                                    onClick={() => toggleRow(group.compte)}
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                    }}
                                                    style={{
                                                        textTransform: 'none',
                                                        outline: 'none',
                                                        backgroundColor: "#67AE6E",
                                                        color: 'white',
                                                    }}
                                                >
                                                    {openRows[group.compte] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                                                </IconButton>
                                            </TableCell>

                                            <TableCell align="center" style={{ paddingTop: '4px', paddingBottom: '4px', position: "sticky", top: 35 }}>
                                                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                                    <IconButton
                                                        onClick={() => handleRowModifClick(group)}
                                                        sx={{ p: 0, border: 'none', outline: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}
                                                        disableFocusRipple
                                                    >
                                                        <IoMdCreate style={{ width: '22px', height: '22px', color: initial.theme }} />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleRowDeleteClick(group, 'group')}
                                                        sx={{ p: 0, border: 'none', outline: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}
                                                        disableFocusRipple
                                                    >
                                                        <IoMdTrash style={{ width: '22px', height: '22px', color: initial.button_delete_color }} />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>

                                            <TableCell align="center" style={{ paddingTop: '4px', paddingBottom: '4px', fontSize: '13px', position: "sticky", top: 35 }}>
                                                <Tooltip
                                                    title={commentaires.length ? commentaires.join("\n") : "Aucune anomalie trouvée"}
                                                    arrow
                                                    placement="right"
                                                    slotProps={{ tooltip: { sx: { fontSize: '14px', maxWidth: 400, whiteSpace: 'pre-line' } } }}
                                                >
                                                    <span>
                                                        <TiWarning size={22} color={commentaires.length ? '#ff086f' : '#39ff08'} />
                                                    </span>
                                                </Tooltip>
                                            </TableCell>

                                            {columns.map((column) => {
                                                if (!column.id) return null;
                                                let value = group[column.id];

                                                if (column.isnumber && (value === null || value === undefined)) {
                                                    value = 0;
                                                }
                                                if (['compte', 'montant_transaction', 'montant_isi', 'nom', 'cin', 'nature_transaction', 'detail_transaction', 'date_transaction', 'province', 'region', 'district', 'commune', 'fokontany', 'validite'].includes(column.id)) {
                                                    return (
                                                        <TableCell key={column.id} align={column.align} style={{ paddingTop: '4px', paddingBottom: '4px', fontSize: '13px', position: "sticky", top: 35 }}>
                                                            {column.renderCell
                                                                ? column.renderCell(value, group)
                                                                : column.format && value !== null && value !== undefined
                                                                    ? typeof value === 'number'
                                                                        ? column.format(value)
                                                                        : format(value, "dd/MM/yyyy")
                                                                    : value}
                                                        </TableCell>
                                                    );
                                                }
                                                return <TableCell key={column.id} align={column.align} style={{ paddingTop: '4px', paddingBottom: '4px', fontSize: '13px', position: "sticky", top: 35 }}></TableCell>
                                            })}

                                        </TableRow>
                                        {
                                            openRows[group.compte] && group.lignes.map((row, rKey) => (
                                                <TableRow key={rKey}>
                                                    <TableCell />
                                                    <TableCell align="center" style={{ paddingTop: '8px', paddingBottom: '8px', position: "sticky", top: 35 }}>
                                                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                                            <Stack
                                                                style={{ width: '22px', height: '22px' }}
                                                            >
                                                            </Stack>
                                                            <IconButton
                                                                onClick={() => handleRowDeleteClick(row, 'row')}
                                                                sx={{ p: 0, border: 'none', outline: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}
                                                                disableFocusRipple
                                                            >
                                                                <IoMdTrash style={{ width: '22px', height: '22px', color: initial.button_delete_color }} />
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell />
                                                    <TableCell />
                                                    {columns
                                                        .filter(column => (column.id !== 'compte'))
                                                        .map((column) => {
                                                            if (!column.id) return null;
                                                            let value = row[column.id];

                                                            if (excludedColumnIds.has(column.id)) {
                                                                value = "";
                                                            }

                                                            if (column.isnumber && (value === null || value === undefined)) {
                                                                value = 0;
                                                            }

                                                            return (
                                                                <TableCell
                                                                    key={column.id}
                                                                    align={column.align}
                                                                    style={{ paddingTop: '4px', paddingBottom: '4px', fontSize: '13px' }}
                                                                >
                                                                    {column.renderCell
                                                                        ? column.renderCell(value, row)
                                                                        : column.format && value
                                                                            ? column.format(value)
                                                                            : value}
                                                                </TableCell>
                                                            )
                                                        })}
                                                </TableRow>
                                            ))
                                        }
                                    </React.Fragment>
                                )
                            })
                        }
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
                            <TableCell
                                align="left"
                                style={{
                                    paddingTop: '4px',
                                    paddingBottom: '4px',
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Total
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{
                                        paddingTop: '4px',
                                        paddingBottom: '4px',
                                        fontSize: '13px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {column?.showSum
                                        ? totalColumn(rows, column.id).toLocaleString('fr-FR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })
                                        : ""}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>

    );
}

export default VirtualTableAnnexeDeclarationTable;