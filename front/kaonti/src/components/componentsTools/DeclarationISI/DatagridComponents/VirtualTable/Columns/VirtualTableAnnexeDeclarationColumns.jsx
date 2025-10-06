import { Chip, Stack } from "@mui/material";
import { format } from "date-fns";

const VirtualTableAnnexeDeclarationColumns = (fileId) => [
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
        id: 'montant_transaction',
        label: 'Transaction',
        minWidth: 180,
        align: 'right',
        format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        isnumber: true,
        showSum: true
    },
    {
        id: 'montant_isi',
        label: 'ISI',
        minWidth: 180,
        align: 'right',
        format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        isnumber: true,
        showSum: true
    },
    {
        id: 'nom',
        label: 'Nom',
        minWidth: 150,
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
        id: 'nature_transaction',
        label: 'Nature',
        minWidth: 200,
        align: 'left',
        showSum: false
    },
    {
        id: 'detail_transaction',
        label: 'Detail',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'date_transaction',
        label: 'Date',
        minWidth: 100,
        align: 'left',
        showSum: false,
        isDate: true,
        format: (value) => value ? format(new Date(value), "dd/MM/yyyy") : "",
    },
    {
        id: 'province',
        label: 'Province',
        minWidth: 150,
        align: 'left',
        showSum: false
    },
    {
        id: 'region',
        label: 'Région',
        minWidth: 180,
        align: 'left',
        showSum: false
    },
    {
        id: 'district',
        label: 'District',
        minWidth: 210,
        align: 'left',
        showSum: false
    },
    {
        id: 'commune',
        label: 'Commune',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
    {
        id: 'fokontany',
        label: 'Fokontany',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
    {
        id: 'validite',
        label: 'Validité',
        minWidth: 120,
        align: 'left',
        showSum: false
    },
];

export default VirtualTableAnnexeDeclarationColumns;