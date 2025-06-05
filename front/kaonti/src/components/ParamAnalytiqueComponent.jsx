import React from 'react';
import { Typography, Stack, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import { IoAddSharp } from "react-icons/io5";
import { GoX } from "react-icons/go";
import { HiPencilSquare } from "react-icons/hi2";
import Tooltip from '@mui/material/Tooltip';
import TableParamAnalytiqueT1Model from '../model/TableParamAnalytiqueT1Model';
import TableParamAnalytiqueT2Model from '../model/TableParamAnalytiqueT2Model';

//données pour le tableau T1
const headCellsT1 = [
    {
        id: 'axe',
        numeric: false,
        disablePadding: false,
        label: 'Axe',
        width: '100px'
    },
    {
        id: 'libelle',
        numeric: false,
        disablePadding: false,
        label: 'Libellé',
        width: '300px'
    }
]

function createDataT1(id, axe, libelle) {
    return { id, axe, libelle };
  }
  
  const rowsT1 = [
    createDataT1(1, 'AXE1',"libellé axe 01"),
    createDataT1(2, 'AXE2',"libellé axe 02"),
  ];


//données pour le tableau T2
const headCells = [
    {
        id: 'section',
        numeric: false,
        disablePadding: false,
        label: 'Section',
        width: '100px'
    },
    {
        id: 'libelle',
        numeric: false,
        disablePadding: false,
        label: 'Libellé',
        width: '200px'
    }
  ];
  
  function createData(id, section, libelle) {
    return { id, section, libelle };
  }
  
  const rows = [
    createData(1, 'SEC001', 'libellé section 001'),
    createData(2, 'SEC002', 'libellé section 002'),
  ];

export default function ParamAnalytiqueComponent() {
  return (
    <Paper sx={{elevation: "3", margin:"5px", padding:"10px", width:"98%", height:"110%"}}>
        <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"} justifyContent={"stretch"}>
            <Typography variant='h4' sx={{color: "black"}} align='left'>Paramétrages : Analytique</Typography>
            
            <Stack width={"100%"} height={"30px"} spacing={0} alignItems={"center"} alignContent={"center"} 
                direction={"row"} style={{marginLeft:"0px", marginTop:"20px", justifyContent:"right"}}>
                <Typography variant='h5' sx={{color: "black", fontWeight:"bold", width:"800px"}} align='left'>Liste des axes analytiques</Typography>
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

            <TableParamAnalytiqueT1Model headCells={headCellsT1} rows={rowsT1}/>

            <Stack width={"100%"} height={"30px"} spacing={0} alignItems={"center"} alignContent={"center"} 
                direction={"row"} style={{marginLeft:"0px", marginTop:"20px", justifyContent:"right"}}>
                <Typography variant='h5' sx={{color: "black", fontWeight:"bold", width:"800px"}} align='left'>Liste de sections associés à l'axe</Typography>

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

            <TableParamAnalytiqueT2Model headCells={headCells} rows={rows}/>
        </Stack>
    </Paper>
  )
}
