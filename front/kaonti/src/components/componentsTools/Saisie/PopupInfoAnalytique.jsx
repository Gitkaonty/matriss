import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, IconButton } from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import QuickFilter, { DataGridStyle } from '../DatagridToolsStyle';
import { init } from '../../../../init';
import axios from '../../../../config/axios';
const initial = init[0];

const PopupInfoAnalytique = ({ id, onClose, open }) => {
    const [rows, setRows] = useState([]);

    const getRepartition = () => {
        axios.get(`/paramCa/getRepartitionCA/${id}`).then((response) => {
            const resData = response?.data;
            console.log('resData : ', resData);
            if (!resData?.state) return;
            setRows(resData?.list);
        })
    }

    const CaColumnsHeader = [
        {
            field: 'libelle_axe',
            headerName: 'Axe',
            type: 'string',
            sortable: true,
            flex: 0.8,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: false
        },
        {
            field: 'section',
            headerName: 'Section',
            type: 'string',
            sortable: true,
            flex: 0.8,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: false
        },
        {
            field: 'pourcentage',
            headerName: 'Pourcentage',
            type: 'string',
            sortable: true,
            flex: 0.5,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: false,
        },
        {
            field: 'debit',
            headerName: 'Debit',
            type: 'text',
            sortable: true,
            flex: 0.7,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            editable: false,
            renderCell: (params) => {
                const raw = params.value;
                const value = raw === undefined || raw === '' ? 0 : Number(raw);

                const formatted = value.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                return formatted.replace(/\u202f/g, ' ');
            },
        },
        {
            field: 'credit',
            headerName: 'Credit',
            type: 'text',
            sortable: true,
            flex: 0.7,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            editable: false,
            renderCell: (params) => {
                const raw = params.value;
                const value = raw === undefined || raw === '' ? 0 : Number(raw);

                const formatted = value.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                return formatted.replace(/\u202f/g, ' ');
            },
        }
    ];

    useEffect(() => {
        getRepartition();
    }, [id])

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    height: '640px',
                    maxHeight: '640px',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    py: 1,
                    px: 2,
                    bgcolor: "#f5f5f5",
                    borderBottom: "1px solid #ddd",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography
                        variant="h6"
                        component="div"
                        fontWeight="bold"
                        color="text.primary"
                    >
                        Répartition analytique
                    </Typography>

                    <IconButton
                        onClick={onClose}
                        style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack height={"100%"} spacing={2} alignItems={'left'} alignContent={"center"}
                    direction={"column"} justifyContent={"center"}
                >
                    <Stack
                        width={"100%"}
                        style={{
                            marginLeft: "0px",
                            marginTop : "20px"
                        }}
                        height={"800px"}>
                        <DataGrid
                            disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                            disableColumnSelector={DataGridStyle.disableColumnSelector}
                            disableDensitySelector={DataGridStyle.disableDensitySelector}
                            disableRowSelectionOnClick
                            disableSelectionOnClick={true}
                            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                            slots={{
                                toolbar: QuickFilter,
                            }}
                            sx={{
                                ...DataGridStyle.sx,
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: initial.theme,
                                    color: 'white',
                                    fontWeight: 'bold',
                                },
                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                    outline: 'none',
                                    border: 'none',
                                },
                                '& .MuiInputBase-root': {
                                    boxShadow: 'none',
                                    border: 'none',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none',
                                },
                                '& .MuiDataGrid-row.highlight-separator': {
                                    borderBottom: `2px solid ${initial.theme}`
                                },
                            }}
                            rowHeight={DataGridStyle.rowHeight}
                            columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                            editMode='row'
                            columns={CaColumnsHeader}
                            rows={rows}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 100 },
                                },
                            }}
                            experimentalFeatures={{ newEditingApi: true }}
                            pageSizeOptions={[5, 10, 20, 30, 50, 100]}
                            pagination={DataGridStyle.pagination}
                            columnVisibilityModel={{
                                id: false,
                            }}
                            getRowId={(row) => `${row.id_ligne_ecriture}_${row.id_section}`}
                            getRowClassName={(params) => {
                                const index = rows.findIndex(
                                    row => `${row.id_ligne_ecriture}_${row.id_section}` === params.id
                                );

                                if (index < 0 || index === rows.length - 1) return '';

                                const current = rows[index];
                                const next = rows[index + 1];

                                if (current.id_axe !== next.id_axe) {
                                    return 'highlight-separator';
                                }

                                return '';
                            }}
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    autoFocus
                    onClick={onClose}
                    style={{ backgroundColor: initial.theme, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                >
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default PopupInfoAnalytique