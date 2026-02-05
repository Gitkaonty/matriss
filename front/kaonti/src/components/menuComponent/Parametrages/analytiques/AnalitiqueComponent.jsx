import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Box, Tab } from '@mui/material';
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
import usePermission from '../../../../hooks/usePermission';

export default function DeclarationCommComponent() {
    const { canAdd, canModify, canDelete, canView } = usePermission();

    let initial = init[0];
    const [fileInfos, setFileInfos] = useState('');
    const [fileId, setFileId] = useState(0);
    const { id } = useParams();
    const [noFile, setNoFile] = useState(false);
    const [selectedRowAxeId, setSelectedRowAxeId] = useState([]);

    const [isCaActive, setIsCaActive] = useState(false);

    //récupération infos de connexion
    const navigate = useNavigate();

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;

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
        <>
            {
                noFile
                    ?
                    <PopupTestSelectedFile
                        confirmationState={sendToHome}
                    />
                    :
                    null
            }
            <Box>
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
                        <Stack
                            direction="column"
                            width="100%"
                            alignItems="stretch"
                            justifyContent="flex-start"
                            spacing={2}
                        >
                            {/* Datagrid du haut */}
                            <Box sx={{ width: '100%', minHeight: 380 }}>
                                <DatagridAnalitiqueAxe
                                    id_compte={compteId}
                                    id_dossier={fileId}
                                    selectedRowAxeId={selectedRowAxeId}
                                    setSelectedRowAxeId={setSelectedRowAxeId}
                                    isCaActive={isCaActive}
                                    canView={canView}
                                    canAdd={canAdd}
                                    canDelete={canDelete}
                                    canModify={canModify}
                                />
                            </Box>

                            {/* Datagrid du bas */}
                            <Box sx={{ width: '100%', minHeight: 380 }}>
                                <DatagridAnalitiqueSection
                                    id_compte={compteId}
                                    id_dossier={fileId}
                                    selectedRowAxeId={selectedRowAxeId}
                                    isCaActive={isCaActive}
                                    canView={canView}
                                    canAdd={canAdd}
                                    canDelete={canDelete}
                                    canModify={canModify}
                                />
                            </Box>
                        </Stack>

                    </TabPanel>
                </TabContext>
            </Box>
        </>
    )
}