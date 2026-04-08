import React, { useState, useEffect } from 'react';
import {
    Box, Typography, AppBar, Toolbar, Stack, Button,
    GlobalStyles, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Paper, Grid, Tooltip, Breadcrumbs
} from '@mui/material';

// Icônes
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Importations fonctionnelles
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import usePermission from '../../../../hooks/usePermission';
import { useNavigate, useParams } from 'react-router-dom';
import TabList from '@mui/lab/TabList';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';

// Importation Datagrid
import DatagridAnalitiqueAxe from '../../../componentsTools/Analitique/DatagridAnalitique/DatagridAnalitiqueAxe';
import DatagridAnalitiqueSection from '../../../componentsTools/Analitique/DatagridAnalitique/DatagridAnalitiqueSection';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';

export default function DeclarationCommComponent() {
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;

    let initial = init[0];
    const [fileInfos, setFileInfos] = useState('');
    const [fileId, setFileId] = useState(0);
    const [noFile, setNoFile] = useState(false);
    const [selectedRowAxeId, setSelectedRowAxeId] = useState([]);
    const [isCaActive, setIsCaActive] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

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

    useEffect(() => {
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
            <TabContext value="1">
                {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                </Box> */}
                <TabPanel value="1" sx={{ p: 2 }}>

                        <Typography variant='h6' sx={{ fontWeight: 700, color: NAV_DARK }}>
                            Analytiques
                        </Typography>
                        <br />
                   
                    <Grid container spacing={4}>
                        {/* SECTION AXES */}
                        <Grid item xs={12} lg={5}>
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
                        </Grid>

                        {/* SECTION SECTIONS */}
                        <Grid item xs={12} lg={7}>
                            {/* <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography sx={{ fontWeight: 900, color: '#1E293B', fontSize: '18px' }}>Sections</Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                                    sx={{
                                        textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                        bgcolor: NAV_DARK, color: '#fff', borderRadius: '6px', px: 2,
                                        '&:hover': { bgcolor: '#1E293B' }
                                    }}
                                >
                                    Ajouter section
                                </Button>
                            </Stack> */}
                            <Box sx={{ width: '99%', minHeight: 380 }}>
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
                        </Grid>
                    </Grid>
                </TabPanel>
            </TabContext>
        </>
    )
}