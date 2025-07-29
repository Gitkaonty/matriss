import React from 'react';
import { Typography, Stack, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import { IoAddSharp } from "react-icons/io5";
import { GoX } from "react-icons/go";
import { HiPencilSquare } from "react-icons/hi2";
import Tooltip from '@mui/material/Tooltip';
import TableParamCodeJournalModel from '../model/TableParamCodeJournalModel';

const headCells = [
    {
        id: 'code',
        numeric: false,
        disablePadding: false,
        label: 'Code',
        width: '30px'
    },
    {
        id: 'libelle',
        numeric: false,
        disablePadding: false,
        label: 'Libellé',
        width: '200px'
    },
    {
        id: 'type',
        numeric: false,
        disablePadding: false,
        label: 'Type',
        width: '80px'
    },
    {
        id: 'compteAssocie',
        numeric: false,
        disablePadding: false,
        label: 'Compte associé',
        width: '80px'
    }
];


function createData(id, code, libelle, type, compteAssocie) {
    return { id, code, libelle, type, compteAssocie };
}

const rows = [
    createData(1, 'Ac', 'achat', 'achat', ''),
    createData(1, 'Vt', 'vente locale', 'vente', ''),
    createData(1, 'Bq', 'banque BNI', 'banque', '512100'),
    createData(1, 'OD', 'diverses', 'OD', ''),
];

export default function RevisionPrecontroleFiscalComponent() {
    return (
        <Paper sx={{ elevation: "3", margin: "5px", padding: "10px", width: "98%", height: "110%" }}>
            <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"} justifyContent={"stretch"}>
                <Typography variant='h4' sx={{ color: "black" }} align='left'>Révisions : pré-contrôle fiscal</Typography>

                <Stack width={"100%"} height={"30px"} spacing={0} alignItems={"center"} alignContent={"center"}
                    direction={"row"} style={{ marginLeft: "0px", marginTop: "20px", justifyContent: "right" }}>
                    <Stack width={"100%"} height={"30px"} spacing={2} alignItems={"center"} alignContent={"center"}
                        direction={"row"} justifyContent={"right"}>

                        <Tooltip title="Ajouter une ligne">
                            <Button variant="outlined" style={{ borderRadius: "0" }}>
                                <IoAddSharp style={{ width: '30px', height: '30px' }} />
                            </Button>
                        </Tooltip>

                        <Tooltip title="Modifier la ligne sélectionnée">
                            <Button variant="outlined" style={{ borderRadius: "0" }}>
                                <HiPencilSquare style={{ width: '30px', height: '30px' }} />
                            </Button>
                        </Tooltip>

                        <Tooltip title="Supprimer une ligne">
                            <Button variant="outlined" style={{ borderRadius: "0", color: "red", borderColor: "red" }}>
                                <GoX style={{ width: '30px', height: '30px' }} />
                            </Button>
                        </Tooltip>
                    </Stack>
                </Stack>

                <TableParamCodeJournalModel headCells={headCells} rows={rows} />
            </Stack>
        </Paper>
    )
}
