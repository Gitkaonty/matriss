import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import StickyHeadTable from "../../../model/TableModel01";
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
//import useFileInfos from '../../../hooks/useFileInfos';
import { FaCircle } from "react-icons/fa";
import { init } from '../../../../init';
import PopupTestSelectedFile from '../../componentsTools/popupTestSelectedFile';
import toast from 'react-hot-toast';
import axios from '../../../../config/axios';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { InfoFileStyle } from '../../componentsTools/InfosFileStyle';

export default function DashboardComponent() {
  let initial = init[0];
  const [valSelect, setValSelect] = React.useState('');
  const [fileInfos, setFileInfos] = useState('');
  const [noFile, setNoFile] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [fileId, setFileId] = useState(0);
  const [isNavigated, setIsNavigated] = useState(false);

  //récupérer les informations du dossier sélectionné
  useEffect(() => {
    //tester si la page est renvoyer par useNavigate
    const navigationEntries = performance.getEntriesByType('navigation');
    let idFile = 0;
    if (navigationEntries.length > 0) {
      const navigationType = navigationEntries[0].type;

      if (navigationType === 'reload') {
        const idDossier = sessionStorage.getItem("fileId");
          setFileId(idDossier);
          idFile = idDossier;
      }else{
        sessionStorage.setItem('fileId',id);
        setFileId(id);
        idFile = id;
      }
    }

    GetListeDossier(idFile);
  }, []);

  const GetListeDossier = (id) => {
    axios.get(`/home/FileInfos/${id}`).then((response) =>{
        const resData = response.data;

        if(resData.state){
          setFileInfos(resData.fileInfos[0]);
          setNoFile(false);
        }else{
          setFileInfos([]);
          setNoFile(true);
        }
    })
  }

  const columns = [
    { id: 'date',
     label: 'date', 
     minWidth: 100,
     width: 100  
    },
    { id: 'journal', 
    label: 'journal', 
    minWidth: 50 
    },
    {
      id: 'compte',
      label: 'compte',
      minWidth: 120,
      align: 'left',
      format: (value) => value.toLocaleString('fr-FR'),
    },
    {
      id: 'piece',
      label: 'Pièce',
      minWidth: 120,
      align: 'left',
      format: (value) => value.toLocaleString('fr-FR'),
    },
    {
      id: 'libelle',
      label: 'Libellé',
      minWidth: 200,
      align: 'left'
    },
    {
      id: 'debit',
      label: 'débit',
      minWidth: 100,
      align: 'right',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'credit',
      label: 'crédit',
      minWidth: 100,
      align: 'right',
      format: (value) => value.toFixed(2),
    },
  ];
 
  const rows = [
    {date:'01/01/2023', journal:'BQ', compte:471000, piece:3287263,libelle:"PREL SANS LIBELLE", debit: 1500.41, credit: 0.00},
    {date:'14/01/2023', journal:'BQ', compte:471000, piece:3287263,libelle:"VIRT VERS AUTRES", debit: 780000.55, credit: 0.00},
    {date:'27/07/2023', journal:'BQ', compte:471000, piece:3287263,libelle:"VIRT ENCAISSEMENT", debit: 0.00, credit: 300000},
    {date:'17/12/2023', journal:'BQ', compte:471000, piece:3287263,libelle:"CHQ 04572147", debit: 1500.41, credit: 0.00}
  ];

  //Valeur du listbox choix exercice ou situation-----------------------------------------------------
  

  const handleChange = (event) => {
    setValSelect(event.target.value);
  };

  const sendToHome = (value) => {
    setNoFile(!value);
    navigate('/tab/home');
  }

  return (
    <Paper sx={{elevation: "3", margin:"5px", padding:"10px", width:"98%", height:"110%"}}>
      {noFile? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}

      <TabContext value={"1"}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList aria-label="lab API tabs example">
            <Tab 
            style={{ 
                textTransform: 'none', 
                outline: 'none', 
                border: 'none',
                margin:-5
            }}
            label={InfoFileStyle(fileInfos?.dossier)} value="1" 
            />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} justifyContent={"stretch"} style={{marginTop:0}}>
            <Typography variant='h6' sx={{color: "black",}} align='left'>Dashboard</Typography>

            <Stack width={"100%"} height={"100px"} spacing={2} alignItems={"center"} alignContent={"center"} direction={"row"} style={{marginLeft:"100px", marginTop:"20px"}}>
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

            <Stack width={"100%"} height={"400px"} spacing={2} alignItems={"flex-start"} direction={"row"}>

              <Stack width={"30%"} height={"300px"} spacing={2} alignItems={"center"} direction={"column"}>
                <Typography variant='h5' sx={{color: "black"}} align='left'>Chiffre d'affaires</Typography>
                <LineChart
                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                    series={[
                      {
                        data: [2, 5.5, 2, 8.5, 1.5, 5],
                      },
                    ]}
                    width={500}
                    height={300}
                />
              </Stack>

              <Stack width={"30%"} height={"300px"} spacing={2} alignItems={"center"} direction={"column"}>
                <Typography variant='h5' sx={{color: "black"}} align='left'>Trésoreries</Typography>
                <LineChart
                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                    series={[
                      {
                        data: [2, 5.5, 2, 8.5, 1.5, 5],
                      },
                    ]}
                    width={500}
                    height={300}
                  />
              </Stack>

              <Stack width={"30%"} height={"300px"} spacing={2} alignItems={"center"} direction={"column"}>
                <Typography variant='h5' sx={{color: "black"}} align='center'>Marges brutes</Typography>
                <LineChart
                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                    series={[
                      {
                        data: [2, 5.5, 2, 8.5, 1.5, 5],
                      },
                    ]}
                    width={500}
                    height={300}
                  />
              </Stack>
            </Stack>
            
            <Typography variant='h5' sx={{color: "black"}} align='left'>Comptes en attente</Typography>
            <StickyHeadTable tableHeader={columns} tableRow={rows}/>

          </Stack>


        </TabPanel>
      </TabContext>









      
    </Paper>
    
  )
}
