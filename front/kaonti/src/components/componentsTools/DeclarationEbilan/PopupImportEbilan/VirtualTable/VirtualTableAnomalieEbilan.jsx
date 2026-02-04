import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box } from '@mui/material';

import { init } from '../../../../../../init';
const initial = init[0];

const VirtualTableAnomalie = ({ rows, columns }) => {
    return (
        <Box sx={{ width: '100%', padding: 0, margin: 0 }}>
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', maxHeight: '250px', }}>
                <Table sx={{ width: '100%', border: '', }} aria-label="simple table">
                    <TableHead
                        style={{
                            backgroundColor: initial.add_new_line_bouton_color,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        {columns.map((column) => (
                            <TableCell
                                key={column.id}
                                align={column.align}
                                style={{
                                    fontWeight: 'bold',
                                    top: 5,
                                    width: column.minWidth,
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
                    </TableHead>
                    <TableBody>
                        {rows.map((item, key) => (
                            <TableRow
                                key={key}
                                sx={{
                                    backgroundColor: key % 2 === 0 ? '#ffffff' : '#F4F9F9',
                                    borderBottom: '0px',
                                    borderTop: '0px',
                                }}
                            >
                                <TableCell >{item.ligne}</TableCell>
                                <TableCell>
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                        {item.anomalies.map((anom, i) => (
                                            <li key={i}>{anom}</li>
                                        ))}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default VirtualTableAnomalie