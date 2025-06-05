import React from 'react';
import { Typography, Stack, Paper } from '@mui/material';
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
import TableImportAnnexeModel from '../model/TableImportAnnexeModel';

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

export default function importAnnexeDeclarationFiscaleComponent() {
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
    <Paper sx={{elevation: "3", margin:"5px", padding:"10px", width:"98%", height:"110%"}}>
         <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
         <Typography variant='h4' sx={{color: "black"}} align='left'>Import Annexes déclarations fiscales</Typography>

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

            <Stack width={"100%"} height={"100px"} spacing={2} alignItems={"center"} alignContent={"center"} direction={"row"} style={{marginLeft:"100px", marginTop:"-20px"}}>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                    <InputLabel id="demo-simple-select-standard-label">Annexe</InputLabel>
                    <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    value={valSelectType}
                    label={"valSelectType"}
                    onChange={handleChangeType}
                    sx={{width:"150px", display:"flex", justifyContent:"left", alignItems:"flex-start", alignContent:"flex-start", textAlign:"left"}}
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={1}>IRSA</MenuItem>
                    <MenuItem value={2}>IR</MenuItem>
                    <MenuItem value={3}>IS</MenuItem>
                    <MenuItem value={4}>TVA</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                    <InputLabel id="demo-simple-select-standard-label">Choix d'import</InputLabel>
                    <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    value={valSelectCptDispatch}
                    label={"valSelectCptDispatch"}
                    onChange={handleChangeCptDispatch}
                    sx={{width:"200px", display:"flex", justifyContent:"left", alignItems:"flex-start", alignContent:"flex-start", textAlign:"left"}}
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={1}>Ecraser les données</MenuItem>
                    <MenuItem value={2}>Ajouter les données</MenuItem>
                    </Select>
                </FormControl>
               
                <Stack spacing={1} width={"380px"} height={"60px"} direction={"row"} 
                        style={{border: '2px dashed rgba(5,96,116,0.60)', marginLeft:"30px", paddingLeft:"20px"}}
                        alignContent={"center"} justifyContent={"left"} alignItems={"center"}
                        >
                    <Typography variant='h7' sx={{color: "black"}} align='left'>Télécharger ici le modèle d'import</Typography>
                
                    <List style={{marginLeft:"10px"}}>
                        <ListItem style={{width:"100px", justifyContent:"center"}}>
                            <ListItemButton>
                                <ListItemIcon > <LogoutIcon style={{width:"40px", height:"30px", color:'rgba(5,96,116,0.60)', transform:"rotate(270deg)"}}/> </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Stack>

                <Stack spacing={1} width={"260px"} height={"60px"} direction={"row"} 
                        style={{border: '2px dashed rgba(5,96,116,0.60)', marginLeft:"30px", paddingLeft:"20px"}}
                        alignContent={"center"} justifyContent={"left"} alignItems={"center"}
                        backgroundColor={'rgba(5,96,116,0.05)'}
                        >
                    <Typography variant='h7' sx={{color: "black",fontWeight:"bold"}} align='left'>Importer depuis le fichier</Typography>
                
                    <List style={{marginLeft:"10px"}}>
                        <ListItem style={{width:"100px", justifyContent:"center"}}>
                            <ListItemButton>
                                <ListItemIcon > <SaveAltIcon style={{width:"50px", height:"33px", color:'rgba(5,96,116,0.60)'}}/> </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Stack>
            </Stack>

            <TableImportAnnexeModel headCells={headCells} rows={rows}/>
         </Stack>
    </Paper>
  )
}
