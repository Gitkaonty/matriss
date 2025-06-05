import React from 'react';
import { Typography, Stack, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import { IoAddSharp } from "react-icons/io5";
import { GoX } from "react-icons/go";
import { HiPencilSquare } from "react-icons/hi2";
import Tooltip from '@mui/material/Tooltip';
import TableParamCodeJournalModel from '../model/TableParamCodeJournalModel';
import TableParamTVAModel from '../model/TableParamTVAModel';
import TableParamDeviseModel from '../model/TableParamDeviseModel';

const headCells = [
    {
        id: 'symbole',
        numeric: false,
        disablePadding: false,
        label: 'Symbole',
        width: '50px'
    },
    {
        id: 'nom',
        numeric: false,
        disablePadding: false,
        label: 'Devise',
        width: '200px'
    }
  ];
  
  
  function createData(id, symbole, nom) {
    return {id, symbole, nom};
  }
  
  const rows = [
    createData(1, 'EUR', 'Euro','20'),
    createData(2, 'USD', 'Dollars usa')
  ];

export default function ParamDeviseComponent() {
  return (
    <Paper sx={{elevation: "3", margin:"5px", padding:"10px", width:"98%", height:"110%"}}>
        <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"} justifyContent={"stretch"}>
            <Typography variant='h4' sx={{color: "black"}} align='left'>Paramétrages : Devises</Typography>

            <Stack width={"100%"} height={"30px"} spacing={0} alignItems={"center"} alignContent={"center"} 
                direction={"row"} style={{marginLeft:"0px", marginTop:"20px", justifyContent:"right"}}>
                <Stack width={"100%"} height={"30px"} spacing={2} alignItems={"center"} alignContent={"center"} 
                direction={"row"} justifyContent={"right"}>
                    
                    <Tooltip title="Ajouter une ligne">
                        <Button variant="outlined" style={{borderRadius:"0"}}>
                            <IoAddSharp style={{width:'30px', height:'30px'}}/>
                        </Button>
                    </Tooltip>

                    <Tooltip title="Modifier la ligne sélectionnée">
                        <Button variant="outlined" style={{borderRadius:"0"}}>
                            <HiPencilSquare style={{width:'30px', height:'30px'}}/>
                        </Button>
                    </Tooltip>

                    <Tooltip title="Supprimer une ligne">
                        <Button variant="outlined" style={{borderRadius:"0", color:"red", borderColor:"red"}}>
                            <GoX style={{width:'30px', height:'30px'}}/>
                        </Button>
                    </Tooltip>
                </Stack>
            </Stack>

            <TableParamDeviseModel headCells={headCells} rows={rows}/>
        </Stack>
    </Paper>
  )
}
