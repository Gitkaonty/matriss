import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, Box, Tab, Badge, Button, FormControlLabel, RadioGroup, Radio } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';

import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

// Importation Datagrid
import DatagridAnalitiqueAxe from '../../../componentsTools/Analitique/DatagridAnalitique/DatagridAnalitiqueAxe';
import DatagridAnalitiqueSection from '../../../componentsTools/Analitique/DatagridAnalitique/DatagridAnalitiqueSection';

export default function DeclarationCommComponent() {
    let initial = init[0];
    const [fileInfos, setFileInfos] = useState('');
    const [fileId, setFileId] = useState(0);
    const { id } = useParams();
    const [noFile, setNoFile] = useState(false);
    const [selectedRowAxeIds, setSelectedRowAxeIds] = useState([]);

    const [isCaActive, setIsCaActive] = useState(false);

    //récupération infos de connexion
    const navigate = useNavigate();

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

    // Info du dossier
    const GetInfosIdDossier = (id) => {
        axios.get(`/home/FileInfos/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setFileInfos(resData.fileInfos[0]);
                setIsCaActive(resData?.fileInfos[0]?.avecanalytique);
                setNoFile(false);
            } else {
                setFileInfos([]);
                setNoFile(true);
            }
        })
    }

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

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
            } else {
                sessionStorage.setItem('fileId', id);
                setFileId(id);
                idFile = id;
            }
        }

        GetInfosIdDossier(idFile);
    }, []);

    return (
        <Box>
            {
                noFile
                    ?
                    <PopupTestSelectedFile
                        confirmationState={sendToHome}
                    />
                    :
                    null
            }
            <TabContext value={"1"} >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList aria-label="lab API tabs example">
                        <Tab
                            style={{
                                textTransform: 'none',
                                outline: 'none',
                                border: 'none',
                                margin: -5
                            }}
                            label={InfoFileStyle(fileInfos?.dossier)} value="1"
                        />
                    </TabList>
                </Box>
                <TabPanel value="1" style={{ height: '100%' }}>
                    <Stack width={"100%"} height={"100%"} spacing={1} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                        <Typography variant='h6' sx={{ color: "black", pb: '5px' }} align='left'>{"Paramétrages - Gestion Analitique"}</Typography>
                        <Typography sx={{ color: "black", pb: '5px' }} align='left'>
                            {`La comptabilité analytique de ce dossier est ${isCaActive ? 'activée' : 'désactivée'}`}
                        </Typography>
                        <Box sx={{ width: '100%' }}>
                            {/* Séparateur horizontal du haut */}
                            <Box sx={{ width: '100%', height: '15px', backgroundColor: '#F4F9F9' }} />

                            {/* Conteneur principal en ligne */}
                            <Stack direction="row" sx={{ width: '100%', minHeight: 450 }}>
                                <DatagridAnalitiqueAxe
                                    id_compte={compteId}
                                    id_dossier={fileId}
                                    selectedRowAxeIds={selectedRowAxeIds}
                                    setSelectedRowAxeIds={setSelectedRowAxeIds}
                                    isCaActive={isCaActive}
                                />
                                <DatagridAnalitiqueSection
                                    id_compte={compteId}
                                    id_dossier={fileId}
                                    selectedRowAxeIds={selectedRowAxeIds}
                                    isCaActive={isCaActive}
                                />
                            </Stack>

                            <Box sx={{ width: '100%', height: '15px', backgroundColor: '#F4F9F9' }} />
                        </Box>

                    </Stack>
                </TabPanel>
            </TabContext>
        </Box>
    )
}