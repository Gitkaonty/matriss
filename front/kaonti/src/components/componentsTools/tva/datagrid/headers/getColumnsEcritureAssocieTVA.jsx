const getColumnsEcritureAssocieTVA = ({ }) => ([
    {
        field: 'dateecriture',
        headerName: 'Date',
        type: 'string',
        sortable: true,
        flex: 0.6,
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
    },
    {
        field: 'journal',
        headerName: 'Journal',
        type: 'string',
        sortable: true,
        flex: 0.43,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'piece',
        headerName: 'Pièce',
        type: 'string',
        sortable: true,
        flex: 0.7,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    }, {
        field: 'compte',
        headerName: 'Compte',
        type: 'string',
        sortable: true,
        flex: 0.75,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'compte_cetralise',
        headerName: 'Compte centralisé',
        type: 'string',
        sortable: false,
        flex: 0.75,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'libelle',
        headerName: 'Libellé',
        type: 'string',
        sortable: true,
        flex: 2.5,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },{
        field: 'debit',
        headerName: 'Débit',
        type: 'string',
        sortable: true,
        flex: 0.9,
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
        field: 'credit',
        headerName: 'Crédit',
        type: 'string',
        sortable: true,
        flex: 0.9,
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
        field: 'decltvamois',
        headerName: 'Mois',
        type: 'string',
        sortable: false,
        flex: 0.3,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => params.value === 0 ? "" : params.value

    }, {
        field: 'decltvaannee',
        headerName: 'Année',
        type: 'string',
        sortable: false,
        flex: 0.4,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => params.value === 0 ? "" : params.value
    }
])
 
export default getColumnsEcritureAssocieTVA;
