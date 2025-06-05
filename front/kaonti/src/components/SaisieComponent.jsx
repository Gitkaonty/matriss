import React from 'react';
import { Typography, Stack, Paper } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Divider from '@mui/joy/Divider';
import { useState } from 'react';
import OptionJoy from '@mui/joy/Option';
import SelectJoy from '@mui/joy/Select';
import InputJoy from '@mui/joy/Input';
import ButtonJoy from '@mui/joy/Button';
import TableSaisieModel from '../model/TableSaisieModel';

const headCells = [
    {
        id: 'dateMvt',
        numeric: false,
        disablePadding: true,
        label: 'Date',
        width: '20px'
    },
    {
        id: 'journal',
        numeric: false,
        disablePadding: false,
        label: 'Journal',
        width: '20px'
    },
    {
        id: 'compte',
        numeric: false,
        disablePadding: false,
        label: 'Compte',
        width: '100px'
    },
    {
        id: 'piece',
        numeric: false,
        disablePadding: false,
        label: 'Pièce',
        width: '100px'
    },
    {
        id: 'libelle',
        numeric: false,
        disablePadding: false,
        label: 'Libellé',
        width: '300px'
    },
    {
        id: 'debit',
        numeric: true,
        disablePadding: false,
        label: 'Débit',
        width: '100px'
    },
    {
        id: 'credit',
        numeric: true,
        disablePadding: false,
        label: 'Crédit',
        width: '100px'
    }
];


function createData(id, dateMvt, journal, compte, piece, libelle, debit, credit) {
    return {
        id,
        dateMvt,
        journal,
        compte,
        piece,
        libelle,
        debit,
        credit,
    };
}
  
const rows = [
    createData(1, '01/01/2023', 'ac', '401ORA','scan 0004', 'FACT202301001', 0.00,40000.12),
    createData(2, '01/01/2023', 'ac', '626000','scan 0004', 'FACT202301001', 35000.12,0.00),
    createData(3, '01/01/2023', 'ac', '445610','scan 0004', 'FACT202301001', 5000.00,0.00),
    createData(4, '01/01/2023', 'ac', '401ORA','scan 0004', 'FACT202301001', 0.00,40000.12),
    createData(5, '01/01/2023', 'ac', '626000','scan 0004', 'FACT202301001', 35000.12,0.00),
    createData(6, '01/01/2023', 'ac', '445610','scan 0004', 'FACT202301001', 5000.00,0.00),
    createData(7, '01/01/2023', 'ac', '401ORA','scan 0004', 'FACT202301001', 0.00,40000.12),
    createData(8, '01/01/2023', 'ac', '626000','scan 0004', 'FACT202301001', 35000.12,0.00),
    createData(9, '01/01/2023', 'ac', '445610','scan 0004', 'FACT202301001', 5000.00,0.00),
    createData(10, '01/01/2023', 'ac', '401ORA','scan 0004', 'FACT202301001', 0.00,40000.12),
    createData(11, '01/01/2023', 'ac', '626000','scan 0004', 'FACT202301001', 35000.12,0.00),
    createData(12, '01/01/2023', 'ac', '445610','scan 0004', 'FACT202301001', 5000.00,0.00),
    createData(13, '01/01/2023', 'ac', '401ORA','scan 0004', 'FACT202301001', 0.00,40000.12),
    createData(14, '01/01/2023', 'ac', '626000','scan 0004', 'FACT202301001', 35000.12,0.00),
    createData(15, '01/01/2023', 'ac', '445610','scan 0004', 'FACT202301001', 5000.00,0.00),
];

export default function SaisieComponent() {
    
    //Valeur du listbox choix exercice ou situation-----------------------------------------------------
  const [valSelect, setValSelect] = React.useState('');

  const handleChange = (event) => {
    setValSelect(event.target.value);
  };

  //Valeur du listbox choix code journal-----------------------------------------------------
  const [valSelectCodeJnl, setValSelectCodeJnl] = React.useState('');

  const handleChangeCodeJnl = (event) => {
    setValSelectCodeJnl(event.target.value);
  };

  //Valeur du listbox choix du mois-----------------------------------------------------
  const [valSelectMois, setValSelectMois] = React.useState('');

  const handleChangeMois = (event) => {
    setValSelectMois(event.target.value);
  };

  //Choix de devises-------------------------------------------------------------------
  const [currency, setCurrency] = useState('dollar');

  return (
    <Paper sx={{elevation: "3", margin:"5px", padding:"10px", width:"98%", height:"110%"}}>
        <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
            <Typography variant='h4' sx={{color: "black"}} align='left'>Saisie</Typography>

            <Stack width={"100%"} height={"100px"} spacing={2} alignItems={"center"} alignContent={"center"} direction={"row"} style={{marginLeft:"100px", marginTop:"-20px"}}>
                <RadioGroup
                    row
                    aria-labelledby="choixExercice"
                    name="choixExercice"
                    style={{marginRight:"50px", marginTop:"20px"}}
                    >
                    <FormControlLabel value="exercice" control={<Radio />} label="Exercice"/>
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
                    sx={{width:"300px", display:"flex", justifyContent:"left", alignItems:"flex-start", alignContent:"flex-start", textAlign:"left"}}
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

            <Stack width={"100%"} height={"120px"} spacing={2} alignItems={"center"} alignContent={"center"} direction={"row"} style={{marginLeft:"100px", marginTop:"-20px"}}>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 50 }}>
                    <InputLabel id="demo-simple-select-standard-label">Code journal</InputLabel>
                    <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={valSelectCodeJnl}
                    label={"valSelectCodeJnl"}
                    onChange={handleChangeCodeJnl}
                    sx={{width:"130px", display:"flex", justifyContent:"left", alignItems:"flex-start", alignContent:"flex-start", textAlign:"left"}}
                    >
                    <MenuItem value={1}>AC</MenuItem>
                    <MenuItem value={2}>VT</MenuItem>
                    <MenuItem value={3}>BQ</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="standard" sx={{ m: 1, minWidth: 50 }}>
                    <InputLabel id="demo-simple-select-standard-label" style={{marginLeft:"20px"}}>Mois</InputLabel>
                    <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={valSelectMois}
                    label={"valSelectMois"}
                    onChange={handleChangeMois}
                    sx={{width:"130px", display:"flex", alignItems:"flex-start", alignContent:"flex-start", textAlign:"left", marginLeft:"20px"}}
                    >
                    <MenuItem value={1}>Janvier</MenuItem>
                    <MenuItem value={2}>Février</MenuItem>
                    <MenuItem value={3}>Mars</MenuItem>
                    </Select>
                </FormControl>

                <RadioGroup
                    row
                    aria-labelledby="choixExercice"
                    name="choixExercice"
                    style={{marginLeft:"100px", marginTop:"20px"}}
                    >
                    <FormControlLabel value="MGA" control={<Radio />} label="MGA"/>
                    <FormControlLabel value="Devises" control={<Radio />} label="Devises" />
                </RadioGroup>

                <Stack spacing={1.5} style={{marginTop:"20px"}}>
                    <InputJoy
                        placeholder="taux"
                        startDecorator={{ dollar: '$', baht: '฿', yen: '¥' }[currency]}
                        endDecorator={
                        <React.Fragment>
                            <Divider orientation="vertical" />
                            <SelectJoy
                            variant="plain"
                            value={currency}
                            onChange={(_, value) => setCurrency(value)}
                            slotProps={{
                                listbox: {
                                variant: 'outlined',
                                },
                            }}
                            sx={{ mr: -1.5, '&:hover': { bgcolor: 'transparent' } }}
                            >
                            <OptionJoy value="dollar">US dollar</OptionJoy>
                            <OptionJoy value="baht">Thai baht</OptionJoy>
                            <OptionJoy value="yen">Japanese yen</OptionJoy>
                            </SelectJoy>
                        </React.Fragment>
                        }
                        sx={{ width: 300 }}
                    />
                </Stack>

                <ButtonJoy style={{marginTop:"20px", borderRadius:0}} size='md'>Nouvelle saisie</ButtonJoy>
                <ButtonJoy style={{marginTop:"20px", borderRadius:0}} size='md'>Modifier</ButtonJoy>
                <ButtonJoy style={{marginTop:"20px", borderRadius:0}} size='md' color='danger'>Supprimer</ButtonJoy>
            </Stack>

            <TableSaisieModel headCells={headCells} rows={rows}/>

        </Stack>
    </Paper>
  )
}
