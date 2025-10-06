const DIsiColumns = [
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
    // {
    //     field: 'cin',
    //     headerName: 'CIN',
    //     type: 'string',
    //     sortable: true,
    //     flex: 1.5,
    //     headerAlign: 'left',
    //     align: 'left',
    //     headerClassName: 'HeaderbackColor',
    // }
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
    // {
    //     field: 'detail_transaction',
    //     headerName: 'Detail',
    //     type: 'string',
    //     sortable: true,
    //     flex: 0.75,
    //     headerAlign: 'left',
    //     align: 'left',
    //     headerClassName: 'HeaderbackColor',
    // }
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
    // {
    //     field: 'validite',
    //     headerName: 'Validite',
    //     type: 'string',
    //     sortable: true,
    //     flex: 0.75,
    //     headerAlign: 'left',
    //     align: 'left',
    //     headerClassName: 'HeaderbackColor',
    // },
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

export default DIsiColumns;