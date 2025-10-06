import { Chip, Stack } from "@mui/material";

const DIsiAnnexeColumns = [
    {
        field: 'compte',
        headerName: 'Compte',
        type: 'string',
        sortable: true,
        flex: 1.4,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            return (
                <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                    <Chip
                        label={params.value}
                        style={{
                            width: "100%",
                            display: 'flex',
                            justifyContent: 'space-between',
                            backgroundColor: '#48A6A7',
                            color: 'white'
                        }}
                    />
                </Stack>
            )
        }
    },
    {
        field: 'nom',
        headerName: 'Nom',
        type: 'string',
        sortable: true,
        flex: 2,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    , {
        field: 'nature_transaction',
        headerName: 'Nature',
        type: 'string',
        sortable: true,
        flex: 2,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    , {
        field: 'date_transaction',
        headerName: 'Date',
        type: 'string',
        sortable: true,
        flex: 1.2,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            const rawDate = params.value;
            const dateObj = new Date(rawDate);

            if (isNaN(dateObj.getTime())) return "";

            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();

            return `${day}/${month}/${year}`;
        },
    }, {
        field: 'province',
        headerName: 'Province',
        type: 'string',
        sortable: true,
        flex: 1.2,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    }, {
        field: 'region',
        headerName: 'Region',
        type: 'string',
        sortable: true,
        flex: 1.8,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    }, {
        field: 'district',
        headerName: 'District',
        type: 'string',
        sortable: true,
        flex: 2,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    }, {
        field: 'commune',
        headerName: 'Commune',
        type: 'string',
        sortable: true,
        flex: 1.8,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    }, {
        field: 'fokontany',
        headerName: 'Fokontany',
        type: 'string',
        sortable: true,
        flex: 1.8,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'montant_transaction',
        headerName: 'Transaction',
        type: 'string',
        sortable: true,
        flex: 1.8,
        headerAlign: 'right',
        align: 'right',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            const formatted = Number(params.value).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return formatted.replace(/\u202f/g, ' ');
        },
    }, {
        field: 'montant_isi',
        headerName: 'ISI',
        type: 'string',
        sortable: true,
        flex: 1.8,
        headerAlign: 'right',
        align: 'right',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            const formatted = Number(params.value).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return formatted.replace(/\u202f/g, ' ');
        },
    }
]

export default DIsiAnnexeColumns;