import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Stack, TableFooter } from '@mui/material';
import { init } from '../../../../init';

let initial = init[0];

export default function VirtualTableImportModelPC({ tableHeader, tableRow }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (

        <Stack width={'100%'} height={'80%'}>
            <TableContainer sx={{ height: '100%' }}>
                <Table stickyHeader aria-label="sticky table" >
                    <TableHead>
                        <TableRow>
                            {tableHeader.map((column) => (
                                <TableCell
                                    sx={{
                                        fontSize: 16,
                                        fontWeight: "bold",
                                        backgroundColor: initial.add_new_line_bouton_color,
                                        paddingY: 0.8,
                                        borderRadius: 0.5,
                                        color: 'white'
                                    }}
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableRow
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index, array) => {
                                const rowsToRender = [];

                                const prevRow = index > 0 ? array[index - 1] : null;
                                const nextRow = index < array.length - 1 ? array[index + 1] : null;

                                rowsToRender.push(
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                        {tableHeader.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align} sx={{ paddingY: 1 }}>
                                                    {column.format ? column.format(value) : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );

                                if (nextRow && row.EcritureNum !== nextRow.EcritureNum) {
                                    rowsToRender.push(
                                        <TableRow key={`separator-${index}`}>
                                            <TableCell
                                                colSpan={tableHeader.length}
                                                style={{ padding: 0, borderBottom: '2px solid red' }}
                                            />
                                        </TableRow>
                                    );
                                }

                                return rowsToRender;
                            })}
                    </TableBody>

                </Table>
            </TableContainer>
            <TablePagination
                style={{ height: "20%" }}
                rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]}
                component="div"
                count={tableRow.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page : "
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                }
            />
        </Stack>
    );
}