import { Autocomplete, Checkbox, Paper, Stack, TextField } from '@mui/material';

import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter, { DataGridStyle } from '../DatagridToolsStyle';

const CompteTab = ({
    rows,
    columns
}) => {
    return (
        <>
            <Stack
                width="100%"
                height="700px"
                style={{
                    marginLeft: "0px",
                    marginTop: "20px",
                    overflow: "auto",
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                    disableRowSelectionOnClick

                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}

                    slots={{
                        toolbar: QuickFilter,
                    }}

                    rowHeight={DataGridStyle.rowHeight}
                    columnHeaderHeight={DataGridStyle.columnHeaderHeight}

                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 100 },
                        },
                    }}

                    sx={{
                        ...DataGridStyle.sx,
                        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                            outline: "none",
                            border: "none",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            maxHeight: "700px",
                        },
                    }}

                    experimentalFeatures={{ newEditingApi: true }}
                    pageSizeOptions={[5, 10, 20, 30, 50, 100]}

                    pagination={DataGridStyle.pagination}

                    columnVisibilityModel={{
                        id: false,
                    }}

                    style={{ height: "700px" }}
                />


            </Stack>
        </>
    )
}

export default CompteTab