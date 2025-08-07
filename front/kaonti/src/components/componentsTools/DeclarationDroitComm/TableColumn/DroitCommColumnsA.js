const droitCommColumnsA = [
    {
        id: 'nif',
        label: 'NIF',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
    {
        id: 'num_stat',
        label: 'Stat',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
    {
        id: 'cin',
        label: 'CIN',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'lieu_cin',
        label: 'Lieu CIN',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
    {
        id: 'date_cin',
        label: 'Date CIN',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'nif_represenataires',
        label: 'NIF Représentant',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'nature_autres',
        label: 'Nature (autres)',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'reference',
        label: 'Reference (autres)',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'raison_sociale',
        label: 'Raison sociale',
        minWidth: 180,
        align: 'left',
        showSum: false
    },
    {
        id: 'adresse',
        label: 'Adresse',
        minWidth: 160,
        align: 'left',
        showSum: false
    },
    {
        id: 'ville',
        label: 'Ville',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
    {
        id: 'ex_province',
        label: 'Ex-Province',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
    {
        id: 'pays',
        label: 'Pays',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
    {
        id: 'nature',
        label: 'Nature',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'comptabilisees',
        label: 'Montant comptabilisé (MGA)',
        minWidth: 180,
        align: 'right',
        format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        isnumber: true,
        showSum: true
    },
    {
        id: 'versees',
        label: 'Montant versé (MGA)',
        minWidth: 180,
        align: 'right',
        format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        isnumber: true,
        showSum: true
    },
];

export default droitCommColumnsA;
