import * as React from 'react';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Stack, TableFooter } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { init } from '../../../../init';
import { Box, Button, Chip, Collapse, IconButton, Typography } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { CgDetailsMore } from "react-icons/cg";
import { RiExchangeBoxFill } from "react-icons/ri";
import toast from 'react-hot-toast';
import PopupAjustRubriqueEbilan from '../FormulaireModifTableauEbilan/popupAjustRubriqueEbilan';
import { FaRegPenToSquare } from "react-icons/fa6";
import { IoMdCreate } from "react-icons/io";
import { IoMdTrash } from "react-icons/io";

const VirtualTableDroitComm = ({ refreshTable, columns, nature, deleteState, modifyState, rows, verrouillage, noCollapsible, state }) => {
    const handleRowDeleteClick = (row) => {
        deleteState(row);
    }

    const handleRowModifClick = (row) => {
        modifyState(row);
    }
    const initial = init[0];

    const totalColumn = (rows, columnId) => {
        return rows.reduce((total, row) => {
            const value = parseFloat(row[columnId]);
            // const value = row[columnId];

            if (value != null && !isNaN(value)) {
                total += value;
            }
            return total;
        }, 0);
    };

    return (
        <Box sx={{ width: '100%', padding: 0, margin: 0 }}>
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', maxHeight: '50vh', }}>
                <Table sx={{ width: '100%', border: '1px solid #ddd', }} aria-label="simple table">
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
                            {
                                !verrouillage ?
                                    <TableCell
                                        key={'00modif'}
                                        align="center"
                                        className="sticky-action"
                                        sx={{
                                            fontWeight: 'bold',
                                            paddingTop: '5px',
                                            paddingBottom: '5px',
                                            fontSize: 15,
                                            color: 'white',
                                            backgroundColor: initial.theme,
                                        }}
                                    >
                                        Action
                                    </TableCell>
                                    : null
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows?.map((row, key) => (
                            <TableRow
                                hover
                                key={key}>
                                {columns.map((column) => {
                                    if (!column.id) return null;

                                    const value = row[column.id];
                                    return (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{
                                                paddingTop: '4px',
                                                paddingBottom: '4px',
                                                fontSize: '13px',
                                                borderRight: '1px solid #ddd',
                                                borderLeft: '1px solid #ddd',
                                            }}
                                        >
                                            {column.format && value
                                                ? typeof value === 'number'
                                                    ? column.format(value)
                                                    : format(value, "dd/MM/yyy")
                                                : value
                                            }
                                        </TableCell>
                                    );
                                })}

                                {
                                    !verrouillage ?
                                        <TableCell
                                            key={"boutonAction"}
                                            align="center"
                                            sx={{
                                                paddingTop: '5px',
                                                paddingBottom: '5px',
                                                borderRight: '1px solid #ddd',
                                                borderLeft: '1px solid #ddd',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Stack direction="row" spacing={1}>
                                                <IconButton
                                                    onClick={() => handleRowModifClick(row)}
                                                    sx={{ p: 0 }}
                                                    style={{
                                                        borderColor: "transparent",
                                                        backgroundColor: "transparent",
                                                        textTransform: 'none', outline: 'none'
                                                    }}
                                                >
                                                    <IoMdCreate style={{ width: '22px', height: '22px', color: initial.theme }} />
                                                </IconButton>
                                                {nature !== 'PLP' && (
                                                    <IconButton
                                                        onClick={() => handleRowDeleteClick(row)}
                                                        sx={{ p: 0 }}
                                                        style={{
                                                            borderColor: "transparent",
                                                            backgroundColor: "transparent",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '22px', height: '22px', color: initial.button_delete_color }} />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </TableCell> : null
                                }
                            </TableRow>
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
                                        paddingTop: '4px',
                                        paddingBottom: '4px',
                                        fontSize: '13px',
                                        borderRight: '1px solid #ddd',
                                        borderLeft: '1px solid #ddd',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {
                                        column?.id === 'code_cn' || column?.id === 'nif' || column?.id === '' ? "Total" :
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