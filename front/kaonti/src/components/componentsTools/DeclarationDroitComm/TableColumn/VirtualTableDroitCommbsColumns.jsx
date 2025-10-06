import { Chip, Stack } from "@mui/material";

const VirtualTableDroitCommbsColumns = (fileId) => [
    {
        id: 'compte',
        label: 'Compte',
        minWidth: 120,
        align: 'left',
        showSum: false,
        renderCell: (value, row) => {
            const isClickable = value !== null;
            return (
                <Stack
                    width="100%"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isClickable ? "pointer" : "default"
                    }}
                    onClick={isClickable ? () => window.open(`/tab/parametrages/paramPlanComptable/${fileId}?compte=${value}`, "_blank") : undefined}
                >
                    <Chip
                        label={value === null ? "Pas de compte" : value}
                        sx={{
                            width: "100%",
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "center",
                            backgroundColor: "#48A6A7",
                            color: "white",
                            cursor: value !== null ? "pointer" : "default",
                            "&:hover": {
                                backgroundColor: value !== null ? "#45bfc1ff" : "#48A6A7"
                            },
                            transition: "background-color 0.25s ease"
                        }}
                    />
                </Stack>
            );
        }
    },
    {
        id: 'montanth_tva',
        label: 'Montant HT (MGA)',
        minWidth: 180,
        align: 'right',
        format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        isnumber: true,
        showSum: true
    },
    {
        id: 'tva',
        label: 'TVA (MGA)',
        minWidth: 130,
        align: 'right',
        format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        isnumber: true,
        showSum: true
    },
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
    }, {
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
        minWidth: 170,
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
        minWidth: 170,
        align: 'left',
        showSum: false
    },
    {
        id: 'raison_sociale',
        label: 'Raison sociale',
        minWidth: 200,
        align: 'left',
        showSum: false
    },
    {
        id: 'nom_commercial',
        label: 'Nom commercial',
        minWidth: 180,
        align: 'left',
        showSum: false
    },
    {
        id: 'adresse',
        label: 'Adresse',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'fokontany',
        label: 'Fokontany',
        minWidth: 180,
        align: 'left',
        showSum: false
    },
    {
        id: 'ville',
        label: 'Ville',
        minWidth: 100,
        align: 'left',
        showSum: false
    },
    {
        id: 'pays',
        label: 'Pays',
        minWidth: 100,
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
        id: 'mode_payement',
        label: 'Mode de paiement',
        minWidth: 170,
        align: 'left',
        showSum: false
    },
]

export default VirtualTableDroitCommbsColumns;