const droitCommColumnPLP = [
    {
        id: 'code_cn',
        label: 'Code',
        minWidth: 100,
        align: 'left',
        showSum: false
    },
    {
        id: 'nature_produit',
        label: 'Nature',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'unite_quantite',
        label: 'Unité',
        minWidth: 50,
        align: 'center',
        showSum: false
    },
    {
        id: 'commercant_quantite',
        label: 'Quantité-Commercant',
        minWidth: 180,
        align: 'right',
        showSum: false
    },
    {
        id: 'commercant_valeur',
        label: 'Valeur-Commercant',
        minWidth: 160,
        align: 'right',
        showSum: true,
        format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
        id: 'producteur_quantite',
        label: 'Quantité-Producteur',
        minWidth: 120,
        align: 'right',
        showSum: false
    },
    {
        id: 'producteur_valeur',
        label: 'Valeur-Producteur',
        minWidth: 120,
        align: 'right',
        showSum: true,
        format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    }
];

export default droitCommColumnPLP;
