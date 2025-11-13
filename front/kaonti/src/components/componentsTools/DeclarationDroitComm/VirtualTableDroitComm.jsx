import * as React from 'react';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Stack, TableFooter, Tooltip } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { init } from '../../../../init';
import { Box, IconButton } from '@mui/material';
import { IoMdCreate } from "react-icons/io";
import { IoMdTrash } from "react-icons/io";
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { TiWarning } from "react-icons/ti";

const VirtualTableDroitComm = ({ columns, nature, deleteState, modifyState, rows, verrouillage }) => {
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

    const groupedData = nature === 'PLP'
        ? {}
        : rows.reduce((acc, row) => {
            if (!acc[row.compte]) {
                acc[row.compte] = {
                    id: row.id,
                    id_numcpt: row.id_numcpt,
                    id_compte: row.id_compte,
                    id_dossier: row.id_dossier,
                    id_exercice: row.id_exercice,
                    compte: row.compte,
                    nif: row.nif,
                    num_stat: row.num_stat,
                    cin: row.cin,
                    date_cin: row.date_cin,
                    lieu_cin: row.lieu_cin,
                    adresse: row.adresse,
                    ex_province: row.ex_province,
                    ville: row.ville,
                    pays: row.pays,
                    raison_sociale: row.raison_sociale,
                    reference: row.reference,
                    type: row.type,
                    typeTier: row.typeTier,
                    nature: row.nature,
                    nature_autres: row.nature_autres,
                    lignes: [],
                    comptabilisees: parseFloat(row.comptabilisees) || 0,
                    versees: parseFloat(row.versees) || 0,
                    montanth_tva: parseFloat(row.montanth_tva) || 0,
                    tva: parseFloat(row.tva) || 0,
                    sousTotal: 0
                };
            } else {
                acc[row.compte].comptabilisees += parseFloat(row.comptabilisees) || 0;
                acc[row.compte].versees += parseFloat(row.versees) || 0;
                acc[row.compte].montanth_tva += parseFloat(row.montanth_tva) || 0;
                acc[row.compte].tva += parseFloat(row.tva) || 0;
            }

            acc[row.compte].lignes.push(row);

            acc[row.compte].sousTotal =
                acc[row.compte].comptabilisees +
                acc[row.compte].versees +
                acc[row.compte].montanth_tva +
                acc[row.compte].tva;

            return acc;
        }, {});

    return (
        <Box sx={{ width: '100%', padding: 0, margin: 0 }}>
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', maxHeight: '50vh', }}>
                <Table aria-label="simple table">
                    <TableHead
                        style={{
                            backgroundColor: initial.theme,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        <TableRow>
                            {
                                nature !== 'PLP' && (
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
                                    </TableCell>
                                )
                            }
                            {
                                !verrouillage ?
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
                                    : null
                            }
                            {
                                nature !== 'PLP' && (
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
                                )
                            }
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
                        {Object.values(groupedData).map((group, key) => {
                            let commentaires = [];
                            if (['SVT', 'ADR', 'AC', 'AI', 'DEB'].includes(nature)) {
                                if (!group.nif) commentaires.push("NIF vide");
                                if (!group.num_stat) commentaires.push("Stat vide");
                                if (!group.cin) commentaires.push("CIN vide");
                                if (!group.date_cin) commentaires.push("Date CIN vide");
                                if (!group.nif_representaires) commentaires.push("NIF représentant vide");
                                if (!group.raison_sociale) commentaires.push("Raison sociale vide");
                                if (!group.adresse) commentaires.push("Adresse vide");
                                if (!group.ville) commentaires.push("Ville vide");
                                if (!group.ex_province) commentaires.push("Ex-province vide");
                                if (!group.pays) commentaires.push("Pays vide");
                                if (!group.comptabilisees) commentaires.push("Montant comptabilisé vide");
                            } else {
                                if (!group.nif) commentaires.push("NIF vide");
                                if (!group.num_stat) commentaires.push("Stat vide");
                                if (!group.cin) commentaires.push("CIN vide");
                                if (!group.date_cin) commentaires.push("Date CIN vide");
                                if (!group.nif_representaires) commentaires.push("NIF représentant vide");
                                if (!group.raison_sociale) commentaires.push("Raison sociale vide");
                                if (!group.nom_commercial) commentaires.push("Nom commerciale vide");
                                if (!group.adresse) commentaires.push("Adresse vide");
                                if (!group.fokontany) commentaires.push("Fokontany vide");
                                if (!group.ville) commentaires.push("Ville vide");
                                if (!group.pays) commentaires.push("Pays vide");
                                if (!group.montanth_tva) commentaires.push("Montant HT vide");
                            }

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
                                        {
                                            nature !== 'PLP' && (
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
                                            )
                                        }
                                        {!verrouillage && (
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
                                        )}

                                        {nature !== 'PLP' && (
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
                                        )}

                                        {columns.map((column) => {
                                            if (!column.id) return null;
                                            let value = group[column.id];

                                            if (column.isnumber && (value === null || value === undefined)) {
                                                value = 0;
                                            }
                                            if (['compte', 'comptabilisees', 'versees', 'montanth_tva', 'tva'].includes(column.id)) {
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

                                    {openRows[group.compte] && group.lignes.map((row, rKey) => (
                                        <TableRow key={rKey}>
                                            <TableCell />
                                            {!verrouillage && (
                                                <TableCell align="center" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
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
                                            )}
                                            {nature !== 'PLP' && <TableCell />}
                                            <TableCell />
                                            {columns
                                                .filter(column => column.id !== 'compte')
                                                .map((column) => {
                                                    if (!column.id) return null;
                                                    let value = row[column.id];

                                                    if (column.isnumber && (value === null || value === undefined)) {
                                                        value = 0;
                                                    }

                                                    return (
                                                        <TableCell
                                                            key={column.id}
                                                            align={column.align}
                                                            style={{ paddingTop: '0px', paddingBottom: '0px', fontSize: '13px' }}
                                                        >
                                                            {column.renderCell
                                                                ? column.renderCell(value, row)
                                                                : column.format && value !== null && value !== undefined
                                                                    ? typeof value === 'number'
                                                                        ? column.format(value)
                                                                        : format(value, "dd/MM/yyyy")
                                                                    : value}
                                                        </TableCell>
                                                    )
                                                })}
                                        </TableRow>
                                    ))}

                                </React.Fragment>
                            );
                        })}
                    </TableBody>

                    <TableFooter
                        style={{
                            backgroundColor: '#89A8B2',
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 3,
                        }}
                    >
                        <TableRow>
                            {
                                nature !== 'PLP' && (
                                    <TableCell
                                        align="left"
                                        style={{
                                            paddingTop: '4px',
                                            paddingBottom: '4px',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}
                                    >Total
                                    </TableCell>
                                )
                            }
                            {
                                !verrouillage ?
                                    <TableCell
                                        align="left"
                                        style={{
                                            paddingTop: '4px',
                                            paddingBottom: '4px',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}
                                    >

                                    </TableCell> : null
                            }
                            {
                                nature !== 'PLP' && (
                                    <TableCell />
                                )
                            }
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
                                    {
                                        (column?.id === 'code_cn' || column?.id === 'nif') && verrouillage ? "Total" :
                                            column?.showSum
                                                ?
                                                totalColumn(rows, column.id).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                :
                                                ""
                                    }
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default VirtualTableDroitComm;