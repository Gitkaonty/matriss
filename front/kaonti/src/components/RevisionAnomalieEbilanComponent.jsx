import React from 'react';
import { Typography, Stack, Paper, Button, Box } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import TableImportBalanceModel from '../model/TableImportBalanceModel';
import TableRevisionAnomalieEbilanModel from '../model/TableRevisionAnomalieEbilanModel';

const headCells = [
    {
        id: 'anomalie',
        numeric: false,
        disablePadding: false,
        label: 'Anomalie',
        width: '400px'
    },
    {
        id: 'liasse',
        numeric: false,
        disablePadding: false,
        label: 'Liasse',
        width: '50px'
    },
    {
        id: 'commentaire',
        numeric: false,
        disablePadding: false,
        label: 'Commentaire',
        width: '200px'
    },
    {
        id: 'valide',
        numeric: false,
        disablePadding: false,
        label: 'Validé',
        width: '60px'
    }
];

function createData(id, anomalie, liasse, commentaire, valide) {
    return { id, anomalie, liasse, commentaire, valide };
}

const rows = [
    createData(1, 'Le compte 58000 doit être soldé.', 'Bilan', "normal", "OUI"),
    createData(2, 'Le compte 58000 doit être soldé.', 'Bilan', "normal", "OUI")
];

export default function RevisionAnomalieEbilanComponent() {
    //Valeur du listbox choix exercice ou situation-----------------------------------------------------
    const [valSelect, setValSelect] = useState('');

    const handleChange = (event) => {
        setValSelect(event.target.value);
    };

    //Valeur du listbox choix Type exercice-----------------------------------------------------
    const [valSelectType, setValSelectType] = useState('');

    const handleChangeType = (event) => {
        setValSelectType(event.target.value);
    };

    //Valeur du listbox choix compte à dispatcher----------------------------------------------------
    const [valSelectCptDispatch, setValSelectCptDispatch] = useState('');

    const handleChangeCptDispatch = (event) => {
        setValSelectCptDispatch(event.target.value);
    };

    return (
        <Box>
            <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                <Typography variant='h4' sx={{ color: "black" }} align='left'>Révision anomalies Ebilan</Typography>

                <Stack width={"100%"} height={"100px"} spacing={2} alignItems={"center"} alignContent={"center"} direction={"row"} style={{ marginLeft: "100px", marginTop: "-20px" }}>
                    <RadioGroup
                        row
                        aria-labelledby="choixExercice"
                        name="choixExercice"
                        style={{ marginRight: "50px", marginTop: "20px" }}
                    >
                        <FormControlLabel value="exercice" control={<Radio />} label="Exercice" />
                        <FormControlLabel value="situation" control={<Radio />} label="Situation" />
                    </RadioGroup>

                    <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                        <InputLabel id="demo-simple-select-standard-label">Du</InputLabel>
                        <Select
                            labelId="demo-simple-select-standard-label"
                            id="demo-simple-select-standard"
                            value={valSelect}
                            label={"valSelect"}
                            onChange={handleChange}
                            sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={1}>N   : 01/01/2023 - 31/12/2023</MenuItem>
                            <MenuItem value={2}>N-1 : 01/01/2022 - 31/12/2022</MenuItem>
                            <MenuItem value={3}>N-2 : 01/01/2021 - 31/12/2021</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Stack width={"100%"} height={"100px"} spacing={10} alignItems={"center"} alignContent={"flex-end"} justifyContent={"right"} direction={"row"} style={{ marginTop: "-20px" }}>
                    <Button variant="contained" style={{ borderRadius: "0", height: '43px', marginLeft: "5px", backgroundColor: "rgba(9, 77, 31, 0.8)" }}>Valider</Button>
                    <Button variant="contained" style={{ borderRadius: "0", height: '43px', marginLeft: "5px", backgroundColor: "rgba(240, 43, 33, 1)" }}>Dévalider</Button>
                </Stack>

                <TableRevisionAnomalieEbilanModel headCells={headCells} rows={rows} />
            </Stack>
        </Box>
    )
}
