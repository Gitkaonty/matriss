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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TableConsultationModel from '../model/TableConsultationModel';

const test =0;

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
    },
    {
        id: 'lettrage',
        numeric: false,
        disablePadding: false,
        label: 'Lettrage',
        width: '30px'
    },
    {
        id: 'analytique',
        numeric: false,
        disablePadding: false,
        label: 'Analytique',
        width: '100px'
    },
    {
        id: 'comm',
        numeric: false,
        disablePadding: false,
        label: 'Commentaires',
        width: '200px'
    }
  ];
  
  
  function createData(id, dateMvt, journal, piece, libelle, debit, credit,lettrage,analytique,comm) {
    return {
        id,
        dateMvt,
        journal,
        piece,
        libelle,
        debit,
        credit,
        lettrage,
        analytique,
        comm
    };
  }
  
  const rows = [
    createData(1, '01/01/2023', 'ac','scan 0004', 'FACT202301001', 0.00,40000.12,'AAA','sect001',''),
    createData(2, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 35000.12,0.00,'ABA','sect002',''),
    createData(3, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 5000.00,0.00,'ACC','sect002',''),
    createData(4, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 0.00,40000.12,'','sect002',''),
    createData(5, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 35000.12,0.00,'','sect001',''),
    createData(6, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 5000.00,0.00,'ATT','sect001',''),
    createData(7, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 0.00,40000.12,'ER','sect003',''),
    createData(8, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 35000.12,0.00,'AKJ','sect003',''),
    createData(9, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 5000.00,0.00,'ALM','sect003',''),
    createData(10, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 0.00,40000.12,'AUU','sect004',''),
    createData(11, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 35000.12,0.00,'AGD','sect004',''),
    createData(12, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 5000.00,0.00,'','sect004',''),
    createData(13, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 0.00,40000.12,'AAA','sect004',''),
    createData(14, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 35000.12,0.00,'AXZ','sect004',''),
    createData(15, '01/01/2023', 'ac', 'scan 0004', 'FACT202301001', 5000.00,0.00,'AAA','sect004',''),
  ];

export default function ConsultationComponent() {

    //Valeur du listbox choix exercice ou situation-----------------------------------------------------
    const [valSelect, setValSelect] = useState('');

    const handleChange = (event) => {
        setValSelect(event.target.value);
    };

  return (
    <Paper sx={{elevation: "3", margin:"5px", padding:"10px", width:"98%", height:"110%"}}>
        <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
            <Typography variant='h4' sx={{color: "black"}} align='left'>Consultation</Typography>

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

            <Stack width={"100%"} height={"100px"} spacing={2} alignItems={"center"} alignContent={"center"} 
                    direction={"row"} style={{marginLeft:"100px", marginTop:"-20px"}}>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                    <InputLabel id="demo-simple-select-standard-label">Compte</InputLabel>
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
                    <MenuItem value={1}>101000</MenuItem>
                    <MenuItem value={2}>103000</MenuItem>
                    <MenuItem value={3}>206000</MenuItem>
                    </Select>
                </FormControl>

                <List style={{width:"30px"}}>
                    <ListItem style={{justifyContent:"center", alignContent:"center", alignItems:"center"}}>
                    <ListItemButton style={{justifyContent:"center", alignContent:"center", alignItems:"center"}}>
                        <ListItemIcon><ArrowBackIosNewIcon color='black' style={{marginLeft:"15px"}}/></ListItemIcon>
                    </ListItemButton>
                    </ListItem>
                </List> 

                <List style={{width:"30px", marginLeft:"-15px"}}>
                    <ListItem>
                    <ListItemButton>
                    <ListItemIcon><ArrowForwardIosIcon color='black' style={{marginLeft:"-15px"}}/></ListItemIcon>
                    </ListItemButton>
                    </ListItem>
                </List>

                <RadioGroup
                    row
                    aria-labelledby="choixFiltreAffichage"
                    name="choixFiltreAffichage"
                    style={{marginRight:"50px", marginTop:"0px", marginLeft:"80px"}}
                    >
                    <FormControlLabel value="tous" control={<Radio />} label="Tous" style={{marginLeft:"20px"}}/>
                    <FormControlLabel value="mouvemente" control={<Radio />} label="Comptes mouvementés" style={{marginLeft:"20px"}}/>
                    <FormControlLabel value="solde" control={<Radio />} label="Comptes soldés" style={{marginLeft:"20px"}}/>
                    <FormControlLabel value="nonSolde" control={<Radio />} label="Comptes non soldés" style={{marginLeft:"20px"}}/>
                </RadioGroup>                
            </Stack>

            <TableConsultationModel headCells={headCells} rows={rows}/>
        </Stack>
    </Paper>
  )
}
