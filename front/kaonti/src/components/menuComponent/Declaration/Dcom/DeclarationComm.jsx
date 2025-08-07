import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, Box, Tab, Badge, Button } from '@mui/material';
import { IconButton, Card, CardActionArea, CardContent, Divider, Tooltip } from '@mui/material';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { CiLock } from "react-icons/ci";
import { CiUnlock } from "react-icons/ci";
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { TbRefresh } from "react-icons/tb";

import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { CgImport } from "react-icons/cg";


import PopupSaisie from '../../../componentsTools/Saisie/popupSaisie';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import PopupImportComma from '../../../componentsTools/DeclarationDroitComm/Popup/Import/PopupImportComma';

import { Autocomplete, TextField } from '@mui/material';

import { IoMdAdd } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";

import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { useFormik } from 'formik';
import { MdFilePresent } from "react-icons/md";
import { GridPagination } from '@mui/x-data-grid';
import { MdFilterAlt } from "react-icons/md";
import { MdFilterAltOff } from "react-icons/md";
import { URL } from '../../../../../config/axios';

import VirtualTableDroitComm from '../../../componentsTools/DeclarationDroitComm/VirtualTableDroitComm';
import PopupDeclarationComm from '../../../componentsTools/DeclarationDroitComm/Popup/PopupDeclarationComm';
import PopupPlpEdit from '../../../componentsTools/DeclarationDroitComm/Popup/PopupPlpEdit';

//Colonne
import droitCommColumnsA from '../../../componentsTools/DeclarationDroitComm/TableColumn/DroitCommColumnsA';
import droitCommColumnsB from '../../../componentsTools/DeclarationDroitComm/TableColumn/DroitCommColumnsB';
import droitCommColumnPL from '../../../componentsTools/DeclarationDroitComm/TableColumn/DroitColumnPL';
import droitCommColumnPLP from '../../../componentsTools/DeclarationDroitComm/TableColumn/DroitColumnPLP';

export default function DeclarationComm() {
    let initial = init[0];
    const [fileInfos, setFileInfos] = useState('');
    const [fileId, setFileId] = useState(0);
    const { id } = useParams();
    const [noFile, setNoFile] = useState(false);
    let tabCom = ""
    if (typeof window !== undefined) {
        tabCom = localStorage.getItem('tabCom');
    }
    const [value, setValue] = useState(tabCom || "1");

    //récupération infos de connexion
    const navigate = useNavigate();

    const [selectedExerciceId, setSelectedExerciceId] = useState(0);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);
    const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
    const [listeExercice, setListeExercice] = useState([]);
    const [listeSituation, setListeSituation] = useState([]);

    const [rowToModify, setRowToModify] = useState(null);
    const [idToDelete, setIdToDelete] = useState(null);

    const [isRefreshed, setIsRefreshed] = useState(false);

    // State formulaire
    const [showFormSVT, setShowFormSVT] = useState(false);
    const [showFormEditPlp, setShowFormEditPlp] = useState(false);
    const [showPopupImport, setShowPopupImport] = useState(false);

    //Action formulaire
    const [typeActionSVT, setTypeActionSVT] = useState('');
    const [nature, setNature] = useState('');
    const [textTitle, setTextTitle] = useState('');

    //State des droit comm
    const [dataSvt, setDataSvt] = useState([]);
    const [dataAdr, setDataAdr] = useState([]);
    const [dataAc, setDataAc] = useState([]);
    const [dataAi, setDataAi] = useState([]);
    const [dataDeb, setDataDeb] = useState([]);
    const [dataMv, setDataMv] = useState([]);
    const [dataPsv, setDataPsv] = useState([]);
    const [dataPl, setDataPl] = useState([]);
    const [dataPlp, setDataPlp] = useState([]);

    //State des verrouillages des tableaux
    const [verrouillageSvt, setVerrouillageSvt] = useState(false);
    const [verrouillageAdr, setVerrouillageAdr] = useState(false);
    const [verrouillageAc, setVerrouillageAc] = useState(false);
    const [verrouillageAi, setVerrouillageAi] = useState(false);
    const [verrouillageDeb, setVerrouillageDeb] = useState(false);
    const [verrouillageMv, setVerrouillageMv] = useState(false);
    const [verrouillagePsv, setVerrouillagePsv] = useState(false);
    const [verrouillagePl, setVerrouillagePl] = useState(false);
    const [verrouillagePlp, setVerrouillagePlp] = useState(false);

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

    //Modal suppression
    const [openDialogDeleteAllComm, setOpenDialogDeleteAllComm] = useState(false);
    const [openDialogDeleteOneComm, setOpenDialogDeleteOneComm] = useState(false);

    const GetInfosIdDossier = (id) => {
        axios.get(`/home/FileInfos/${id}`).then((response) => {
            const resData = response.data;

            if (resData.state) {
                setFileInfos(resData.fileInfos[0]);
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

    //Choix exercice
    const handleChangeExercice = (exercice_id) => {
        setSelectedExerciceId(exercice_id);
        setSelectedPeriodeChoiceId("0");
        setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
        setSelectedPeriodeId(exercice_id);
    }

    //Récupérer la liste des exercices
    const GetListeExercice = (id) => {
        axios.get(`/paramExercice/listeExercice/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListeExercice(resData.list);

                const exerciceNId = resData.list?.filter((item) => item.libelle_rang === "N");
                setListeSituation(exerciceNId);

                setSelectedExerciceId(exerciceNId[0].id);
                setSelectedPeriodeChoiceId(0);
                setSelectedPeriodeId(exerciceNId[0].id);

            } else {
                setListeExercice([]);
                toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
            }
        })
    }

    //Récupérer la liste des exercices
    const GetListeSituation = (id) => {
        axios.get(`/paramExercice/listeSituation/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                const list = resData.list;
                setListeSituation(resData.list);
                if (list.length > 0) {
                    setSelectedPeriodeId(list[0].id);
                }
            } else {
                setListeSituation([]);
                toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
            }
        })
    }

    //Choix période
    const handleChangePeriode = (choix) => {
        setSelectedPeriodeChoiceId(choix);
        if (choix === 0) {
            setListeSituation(listeExercice?.filter((item) => item.id === selectedExerciceId));
            setSelectedPeriodeId(selectedExerciceId);
        } else if (choix === 1) {
            GetListeSituation(selectedExerciceId);
        }
    }

    const handleChangeTAB = (event, newValue) => {
        setValue(newValue);
        localStorage.setItem('tabCom', newValue);
    };

    //Fonction formulaire
    const handleOpenFormSVT = (type, nature) => {
        setNature(nature);
        setTypeActionSVT(type);
        setShowFormSVT(true);
        const textTitle = getTextTitle(nature);
        setTextTitle(textTitle);
    }

    // Obtenir le titre
    const getTextTitle = (text) => {
        if (text === 'SVT') {
            return 'Sommes versées à des tiers';
        } else if (text === 'ADR') {
            return 'Achats de marchandises destinées à la revente';
        } else if (text === 'AC') {
            return 'Achats non destinés à la vente';
        } else if (text === 'AI') {
            return 'Achats immobilisés';
        } else if (text === 'DEB') {
            return 'Debours';
        } else if (text === 'MV') {
            return 'Marchandises vendues';
        } else if (text === 'PSV') {
            return 'Prestations de services vendues';
        } else if (text === 'PL') {
            return 'Produits locaux';
        }
    }

    // Fonction popup import
    const handleOpenPopupImport = (nature) => {
        setNature(nature);
        const textTitle = getTextTitle(nature);
        setTextTitle(textTitle);
        setShowPopupImport(true);
    }

    const handleClosePopupImport = (value) => {
        setShowPopupImport(value);
    }

    const handleCloseFormSVT = (value) => {
        setShowFormSVT(value);
    }

    const handleCloseFormEditPlp = (value) => {
        setShowFormEditPlp(value);
    }

    //Ouvrir la dialogue de suppression
    const handleOpenDialogConfirmDeleteComm = (nature) => {
        setNature(nature);
        setOpenDialogDeleteAllComm(true);
    }

    //Suppression droit de communication par type
    const handleDeleteAllCommByType = (value) => {
        if (value) {
            console.log('nature : ', nature);
            axios.delete('/declaration/comm/deleteAllCommByType', { data: { type: nature } })
                .then((response) => {
                    if (response.data.state) {
                        setIsRefreshed(!isRefreshed);
                    } else {
                        toast.error(response.data.message);
                    }
                })
            setOpenDialogDeleteAllComm(false);
        } else {
            setOpenDialogDeleteAllComm(false);
        }
    }

    //Recupération des données de la table comm global
    const handleGetDroitCommGLobal = () => {
        axios.get(`/declaration/comm/getDroitCommGlobal/${compteId}/${fileId}/${selectedExerciceId}`).then((response) => {
            const data = response?.data?.data;
            if (response?.data?.state) {
                setDataSvt(data?.SVT);
                setDataAdr(data?.ADR);
                setDataAc(data?.AC);
                setDataAi(data?.AI);
                setDataDeb(data?.DEB);
                setDataMv(data?.MV);
                setDataPsv(data?.PSV);
                setDataPl(data?.PL);
                setDataPlp(data?.PLP);

            } else {
                toast.error(response?.data?.message);
            }
        })
    }

    //Récupération des vérouillages des tableaux
    const handleGetVerrouillage = () => {
        axios.get(`/declaration/comm/getVerrouillageComm/${compteId}/${fileId}/${selectedExerciceId}`).then((response) => {
            const data = response?.data?.data;
            if (response?.data?.state) {
                setVerrouillageSvt(data?.find((item) => item.code === 'SVT')?.valide);
                setVerrouillageAdr(data?.find((item) => item.code === 'ADR')?.valide);
                setVerrouillageAc(data?.find((item) => item.code === 'AC')?.valide);
                setVerrouillageAi(data?.find((item) => item.code === 'AI')?.valide);
                setVerrouillageDeb(data?.find((item) => item.code === 'DEB')?.valide);
                setVerrouillageMv(data?.find((item) => item.code === 'MV')?.valide);
                setVerrouillagePsv(data?.find((item) => item.code === 'PSV')?.valide);
                setVerrouillagePl(data?.find((item) => item.code === 'PL')?.valide);
                setVerrouillagePlp(data?.find((item) => item.code === 'PLP')?.valide);
            }
        })
    }

    //Suppression ligne ----------------------------------------------------------------------------------
    const deleteOneRowSvt = (row) => {
        setIdToDelete(Number(row.id));
        setOpenDialogDeleteOneComm(true);
        setNature('SVT');
    }

    const deleteOneRowAdr = (row) => {
        setIdToDelete(Number(row.id));
        setOpenDialogDeleteOneComm(true);
        setNature('ADR');
    }

    const deleteOneRowAc = (row) => {
        setIdToDelete(Number(row.id));
        setOpenDialogDeleteOneComm(true);
        setNature('AC');
    }

    const deleteOneRowAi = (row) => {
        setIdToDelete(Number(row.id));
        setOpenDialogDeleteOneComm(true);
        setNature('AI');
    }

    const deleteOneRowDeb = (row) => {
        setIdToDelete(Number(row.id));
        setOpenDialogDeleteOneComm(true);
        setNature('DEB');
    }

    const deleteOneRowMv = (row) => {
        setIdToDelete(Number(row.id));
        setOpenDialogDeleteOneComm(true);
        setNature('MV');
    }

    const deleteOneRowPsv = (row) => {
        setIdToDelete(Number(row.id));
        setOpenDialogDeleteOneComm(true);
        setNature('PSV');
    }

    const deleteOneRowPl = (row) => {
        setIdToDelete(Number(row.id));
        setOpenDialogDeleteOneComm(true);
        setNature('PL');
    }

    const handleDeleteOneCommByType = (value) => {
        if (value) {
            setOpenDialogDeleteOneComm(false);
            axios.delete('/declaration/comm/deleteOneCommByType',
                {
                    data: { id: idToDelete, type: nature }
                }).then((response) => {
                    if (response?.data?.state) {
                        setIsRefreshed(!isRefreshed);
                    } else {
                        toast.error(response?.data?.message);
                    }
                })
        } else {
            setOpenDialogDeleteOneComm(false);
        }
    }
    //Suppression ligne ----------------------------------------------------------------------------------

    //Modification ligne ---------------------------------------------------------------------------------
    const modifyOneRowSvt = (row) => {
        setRowToModify(row);
        setShowFormSVT(true);
        setTypeActionSVT('Modification');
        setNature('SVT');
    }

    const modifyOneRowAdr = (row) => {
        setRowToModify(row);
        setShowFormSVT(true);
        setTypeActionSVT('Modification');
        setNature('ADR');
    }

    const modifyOneRowAc = (row) => {
        setRowToModify(row);
        setShowFormSVT(true);
        setTypeActionSVT('Modification');
        setNature('AC');
    }

    const modifyOneRowAi = (row) => {
        setRowToModify(row);
        setShowFormSVT(true);
        setTypeActionSVT('Modification');
        setNature('AI');
    }

    const modifyOneRowDeb = (row) => {
        setRowToModify(row);
        setShowFormSVT(true);
        setTypeActionSVT('Modification');
        setNature('DEB');
    }

    const modifyOneRowMv = (row) => {
        setRowToModify(row);
        setShowFormSVT(true);
        setTypeActionSVT('Modification');
        setNature('MV');
    }

    const modifyOneRowPsv = (row) => {
        setRowToModify(row);
        setShowFormSVT(true);
        setTypeActionSVT('Modification');
        setNature('PSV');
    }

    const modifyOneRowPl = (row) => {
        setRowToModify(row);
        setShowFormSVT(true);
        setTypeActionSVT('Modification');
        setNature('PL');
    }

    //Modification ligne ---------------------------------------------------------------------------------

    //Modification Plp
    const modifyOneRowPlp = (row) => {
        setRowToModify(row);
        setShowFormEditPlp(true);
    }

    //Verrouillage d'un tableau ---------------------------------------------------------------------------
    const lockTableFunction = (tableau, verrouillage) => {
        const valide = !verrouillage;
        axios.post('/declaration/comm/verrouillerTableComm',
            {
                tableau,
                valide,
                id_dossier: Number(fileId),
                id_exercice: Number(selectedExerciceId),
                id_compte: Number(compteId)
            }
        )
            .then((response) => {
                if (response?.data?.state) {
                } else {
                    toast.error(response?.data?.message);
                }
            })
    }

    const lockTableSvt = () => {
        lockTableFunction('SVT', verrouillageSvt);
        setVerrouillageSvt(!verrouillageSvt);
    }

    const lockTableAdr = () => {
        lockTableFunction('ADR', verrouillageAdr);
        setVerrouillageAdr(!verrouillageAdr);
    }

    const lockTableAc = () => {
        lockTableFunction('AC', verrouillageAc);
        setVerrouillageAc(!verrouillageAc);
    }

    const lockTableAi = () => {
        lockTableFunction('AI', verrouillageAi);
        setVerrouillageAi(!verrouillageAi);
    }

    const lockTableDeb = () => {
        lockTableFunction('DEB', verrouillageDeb);
        setVerrouillageDeb(!verrouillageDeb);
    }

    const lockTableMv = () => {
        lockTableFunction('MV', verrouillageMv);
        setVerrouillageMv(!verrouillageMv);
    }

    const lockTablePsv = () => {
        lockTableFunction('PSV', verrouillagePsv);
        setVerrouillagePsv(!verrouillagePsv);
    }

    const lockTablePl = () => {
        lockTableFunction('PL', verrouillagePl);
        setVerrouillagePl(!verrouillagePl);
    }

    const lockTablePlp = () => {
        lockTableFunction('PLP', verrouillagePlp);
        setVerrouillagePlp(!verrouillagePlp);
    }

    //Verrouillage d'un tableau ---------------------------------------------------------------------------

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
        GetListeExercice(idFile);
    }, []);

    useEffect(() => {
        handleGetDroitCommGLobal();
        handleGetVerrouillage();
    }, [compteId, fileId, selectedExerciceId, isRefreshed])

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
            {
                openDialogDeleteAllComm
                    ?
                    <PopupConfirmDelete
                        msg={`Voulez-vous vraiment toutes les lignes du ${nature} ?`}
                        confirmationState={handleDeleteAllCommByType} />
                    :
                    null
            }
            {
                openDialogDeleteOneComm
                    ?
                    <PopupConfirmDelete
                        msg={`Voulez-vous vraiment la ligne selectionné`}
                        confirmationState={handleDeleteOneCommByType} />
                    :
                    null
            }
            {showFormSVT ?
                <PopupDeclarationComm
                    type={typeActionSVT}
                    confirmationState={handleCloseFormSVT}
                    selectedExerciceId={selectedExerciceId}
                    fileId={fileId}
                    compteId={compteId}
                    nature={nature}
                    rowToModify={rowToModify}
                    setIsRefreshed={() => setIsRefreshed(!isRefreshed)}
                    textTitle={textTitle}
                /> : null
            }
            {
                showFormEditPlp ?
                    <PopupPlpEdit
                        confirmationState={handleCloseFormEditPlp}
                        rowToModify={rowToModify}
                        setIsRefreshed={() => setIsRefreshed(!isRefreshed)}
                    />
                    : null
            }
            {
                showPopupImport ?
                    <PopupImportComma
                        nature={nature}
                        selectedExerciceId={selectedExerciceId}
                        fileId={fileId}
                        compteId={compteId}
                        confirmationState={handleClosePopupImport}
                        setIsRefreshed={() => setIsRefreshed(!isRefreshed)}
                        textTitle={textTitle}
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
                        <Typography variant='h6' sx={{ color: "black" }} align='left'>{"Déclarations - DCom (Droit de communication)"}</Typography>
                        <Stack width={"100%"} height={"80px"} spacing={4} alignItems={"left"} alignContent={"center"} direction={"row"} style={{ marginLeft: "0px", marginTop: "20px" }}>
                            <Stack
                                direction={"row"}
                            >
                                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Exercice:</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={selectedExerciceId}
                                        label={"valSelect"}
                                        onChange={(e) => handleChangeExercice(e.target.value)}
                                        sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                    >
                                        {listeExercice.map((option) => (
                                            <MenuItem
                                                key={option.id}
                                                value={option.id}
                                            >{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
                                        ))
                                        }
                                    </Select>
                                </FormControl>

                                <FormControl variant="standard" sx={{ m: 1, minWidth: 150 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Période</InputLabel>
                                    <Select
                                        disabled
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={selectedPeriodeChoiceId}
                                        label={"valSelect"}
                                        onChange={(e) => handleChangePeriode(e.target.value)}
                                        sx={{ width: "150px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                    >
                                        <MenuItem value={0}>Toutes</MenuItem>
                                        <MenuItem value={1}>Situations</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Du</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={selectedPeriodeId}
                                        label={"valSelect"}
                                        onChange={(e) => handleChangeDateIntervalle(e.target.value)}
                                        sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                    >
                                        {listeSituation?.map((option) => (
                                            <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
                                        ))
                                        }
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>
                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <TabContext value={value}>
                                <Box sx={{
                                    borderBottom: 1,
                                    borderColor: 'transparent',
                                    // width: 'fit-content',
                                    // mx: 'auto',
                                }}>
                                    <TabList onChange={handleChangeTAB} aria-label="lab API tabs example" variant='scrollable'>
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="SVT" value="1" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="ADR" value="2" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="AC" value="3" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="AI" value="4" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="DEB" value="5" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="MV" value="6" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="PSV" value="7" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="PL" value="8" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="PLP" value="9" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Sommes versées à des tiers"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>

                                                <Tooltip title="Importer des données">
                                                    <IconButton
                                                        onClick={() => handleOpenPopupImport('SVT')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: 'rgba(5,96,116,0.60)',
                                                            textTransform: 'none', outline: 'none',
                                                        }}
                                                    >
                                                        <CgImport style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={() => handleOpenFormSVT('Ajout', 'SVT')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageSvt ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={() => handleOpenDialogConfirmDeleteComm('SVT')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageSvt ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={verrouillageSvt ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        // onClick={lockTableBHIAPC}
                                                        onClick={lockTableSvt}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillageSvt ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillageSvt
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>
                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm columns={droitCommColumnsA} rows={dataSvt} verrouillage={verrouillageSvt} deleteState={deleteOneRowSvt} modifyState={modifyOneRowSvt} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="2">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Achats de marchandises destinées à la revente"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>

                                                <Tooltip title="Importer des données">
                                                    <IconButton
                                                        onClick={() => handleOpenPopupImport('ADR')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: 'rgba(5,96,116,0.60)',
                                                            textTransform: 'none', outline: 'none',
                                                        }}
                                                    >
                                                        <CgImport style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={() => handleOpenFormSVT('Ajout', 'ADR')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageAdr ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={() => handleOpenDialogConfirmDeleteComm('ADR')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageAdr ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={verrouillageAdr ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        // onClick={lockTableBHIAPC}
                                                        onClick={lockTableAdr}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillageAdr ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillageAdr
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>
                                        </Stack>

                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm columns={droitCommColumnsA} rows={dataAdr} verrouillage={verrouillageAdr} deleteState={deleteOneRowAdr} modifyState={modifyOneRowAdr} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="3">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Achats non destinés à la vente"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Importer des données">
                                                    <IconButton
                                                        onClick={() => handleOpenPopupImport('AC')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: 'rgba(5,96,116,0.60)',
                                                            textTransform: 'none', outline: 'none',
                                                        }}
                                                    >
                                                        <CgImport style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={() => handleOpenFormSVT('Ajout', 'AC')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageAc ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={() => handleOpenDialogConfirmDeleteComm('AC')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageAc ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={verrouillageAc ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        // onClick={lockTableBHIAPC}
                                                        onClick={lockTableAc}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillageAc ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillageAc
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>
                                        </Stack>

                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm columns={droitCommColumnsA} verrouillage={verrouillageAc} rows={dataAc} deleteState={deleteOneRowAc} modifyState={modifyOneRowAc} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="4">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Achats immobilisés"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>

                                                <Tooltip title="Importer des données">
                                                    <IconButton
                                                        onClick={() => handleOpenPopupImport('AI')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: 'rgba(5,96,116,0.60)',
                                                            textTransform: 'none', outline: 'none',
                                                        }}
                                                    >
                                                        <CgImport style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={() => handleOpenFormSVT('Ajout', 'AI')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageAi ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={() => handleOpenDialogConfirmDeleteComm('AI')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageAi ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={verrouillageAi ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        // onClick={lockTableBHIAPC}
                                                        onClick={lockTableAi}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillageAi ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillageAi
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>
                                        </Stack>
                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm columns={droitCommColumnsA} rows={dataAi} verrouillage={verrouillageAi} deleteState={deleteOneRowAi} modifyState={modifyOneRowAi} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="5">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Debours"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>

                                                <Tooltip title="Importer des données">
                                                    <IconButton
                                                        onClick={() => handleOpenPopupImport('DEB')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                        }}
                                                    >
                                                        <CgImport style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={() => handleOpenFormSVT('Ajout', 'DEB')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: 'rgba(5,96,116,0.60)',
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageDeb ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={verrouillageDeb ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        // onClick={lockTableBHIAPC}
                                                        onClick={lockTableDeb}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillageDeb ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillageDeb
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>
                                        </Stack>
                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm columns={droitCommColumnsA} verrouillage={verrouillageDeb} rows={dataDeb} deleteState={deleteOneRowDeb} modifyState={modifyOneRowDeb} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="6">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Marchandises vendues"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>

                                                <Tooltip title="Importer des données">
                                                    <IconButton
                                                        onClick={() => handleOpenPopupImport('MV')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                        }}
                                                    >
                                                        <CgImport style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={() => handleOpenFormSVT('Ajout', 'MV')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: 'rgba(5,96,116,0.60)',
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageMv ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={() => handleOpenDialogConfirmDeleteComm('MV')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillageMv ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={verrouillageMv ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        // onClick={lockTableBHIAPC}
                                                        onClick={lockTableMv}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillageMv ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillageMv
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>
                                        </Stack>
                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm columns={droitCommColumnsB} verrouillage={verrouillageMv} rows={dataMv} deleteState={deleteOneRowMv} modifyState={modifyOneRowMv} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="7">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Prestations de services vendues"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>

                                                <Tooltip title="Importer des données">
                                                    <IconButton
                                                        onClick={() => handleOpenPopupImport('PSV')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: 'rgba(5,96,116,0.60)',
                                                            textTransform: 'none', outline: 'none',
                                                        }}
                                                    >
                                                        <CgImport style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={() => handleOpenFormSVT('Ajout', 'PSV')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillagePsv ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={() => handleOpenDialogConfirmDeleteComm('PSV')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillagePsv ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={verrouillagePsv ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        // onClick={lockTableBHIAPC}
                                                        onClick={lockTablePsv}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillagePsv ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillagePsv
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>
                                        </Stack>
                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm columns={droitCommColumnsB} verrouillage={verrouillagePsv} rows={dataPsv} deleteState={deleteOneRowPsv} modifyState={modifyOneRowPsv} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="8">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Produis locaux"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>

                                                <Tooltip title="Importer des données">
                                                    <IconButton
                                                        onClick={() => handleOpenPopupImport('PL')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: 'rgba(5,96,116,0.60)',
                                                            textTransform: 'none', outline: 'none',
                                                        }}
                                                    >
                                                        <CgImport style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={() => handleOpenFormSVT('Ajout', 'PL')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillagePl ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={() => handleOpenDialogConfirmDeleteComm('PL')}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrouillagePl ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip
                                                    title={verrouillagePl ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        // onClick={lockTableBHIAPC}
                                                        onClick={lockTablePl}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillagePl ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillagePl
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>
                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm columns={droitCommColumnPL} verrouillage={verrouillagePl} rows={dataPl} deleteState={deleteOneRowPl} modifyState={modifyOneRowPl} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="9">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>{"Produis locaux par produits"}</Typography>
                                        </Stack>
                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>

                                                <Tooltip
                                                    title={verrouillagePlp ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}
                                                >
                                                    <IconButton
                                                        onClick={lockTablePlp}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrouillagePlp ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrouillagePlp
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>
                                        </Stack>
                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableDroitComm nature={'PLP'} columns={droitCommColumnPLP} verrouillage={verrouillagePlp} rows={dataPlp} modifyState={modifyOneRowPlp} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>
                            </TabContext>
                        </Box>
                    </Stack>
                </TabPanel>
            </TabContext>
        </Box>
    )
}