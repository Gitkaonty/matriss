const DatagridColumnsHistoriqueISI = [
    {
        field: 'compte',
        headerName: 'Compte',
        flex: 0.8,
    },
    {
        field: 'dossier',
        headerName: 'Dossier',
        flex: 0.8,
    },
    {
        field: 'designation',
        headerName: 'Désignation',
        flex: 1.8
    },
    {
        field: 'date_export',
        headerName: "Date d\éxportation",
        flex: 0.7,
        renderCell: (params) => {
            const value = params.value;
            if (!value) return "";
            return new Date(value).toLocaleString('fr-FR', {
                dateStyle: 'short',
                timeStyle: 'short'
            });
        }
    },
];

export default DatagridColumnsHistoriqueISI;