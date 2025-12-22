import { Box, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Paper } from '@mui/material';
import { IoMdCreate } from "react-icons/io";
import { init } from '../../../../init';

const initial = init[0];

const VirtualTableDroitCommPlp = ({
    columns,
    rows,
    nature,
    verrouillage,
    canModify,
    canDelete,
    modifyState,
}) => {

    const handleRowModifClick = (row, nature) => {
        modifyState(row);
    }

    const totalColumn = (rows, columnId) => {
        return rows.reduce((total, row) => {
            const value = parseFloat(row[columnId]);

            if (value != null && !isNaN(value)) {
                total += value;
            }
            return total;
        }, 0);
    };

    return (
        <Box sx={{ width: '100%', p: 0, m: 0 }}>
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', maxHeight: '50vh' }}>
                <Table>
                    <TableHead
                        style={{
                            backgroundColor: initial.theme,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        <TableRow>
                            {!verrouillage && (
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
                            )}

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
                        {rows.map((row, key) => (
                            <TableRow
                                key={key}
                                sx={{
                                    zIndex: 2,
                                    backgroundColor: "#f5f5f5"
                                }}
                            >
                                {!verrouillage && (
                                    <TableCell align="center" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                            <IconButton
                                                disabled={!canModify}
                                                onClick={() => handleRowModifClick(row)}
                                                sx={{ p: 0, border: 'none', outline: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}
                                                disableFocusRipple
                                            >
                                                <IoMdCreate style={{ width: '22px', height: '22px', color: initial.theme }} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                )}

                                {columns.map((column) => {
                                    const value = row[column.id];

                                    return (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{
                                                paddingTop: '4px',
                                                paddingBottom: '4px',
                                                fontSize: '13px',
                                            }}
                                        >
                                            {column.renderCell
                                                ? column.renderCell(value, row)
                                                : column.format
                                                    ? column.format(value)
                                                    : value}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>

                    <TableFooter
                        style={{
                            backgroundColor: '#89A8B2',
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 5,
                        }}
                    >
                        <TableRow>
                            {!verrouillage && <TableCell />}

                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    sx={{
                                        paddingTop: '4px',
                                        paddingBottom: '4px',
                                        fontWeight: 'bold',
                                        fontSize: '14px'
                                    }}
                                >
                                    {column.showSum
                                        ? totalColumn(rows, column.id)?.toLocaleString('fr-FR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
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
};

export default VirtualTableDroitCommPlp;
