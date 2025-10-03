import { React, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, Box, Tab, Tooltip, IconButton, FormHelperText, Button, Badge, Divider, Switch } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { init } from '../../../../../init';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import { TabContext, TabPanel } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from "yup";
import CircularProgress from '@mui/material/CircularProgress';
import VirtualTableModifiableExport from '../../../componentsTools/DeclarationEbilan/virtualTableModifiableExport';

export default function ExportBalance() {
    //Valeur du listbox choix exercice ou situation-----------------------------------------------------
    const [checked, setChecked] = useState(false);
    const [unsoldedCompte, setUnsoldedCompte] = useState(false);
    const [movmentedCpt, setMovmentedCpt] = useState(false);

    let initial = init[0];
    const [fileInfos, setFileInfos] = useState('');
    const [fileId, setFileId] = useState(0);
    const { id } = useParams();
    const [noFile, setNoFile] = useState(false);

    const [selectedExerciceId, setSelectedExerciceId] = useState(0);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);
    const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
    const [listeExercice, setListeExercice] = useState([]);
    const [listeSituation, setListeSituation] = useState([]);

    const [balance, setBalance] = useState([]);

    const [traitementJournalWaiting, setTraitementJournalWaiting] = useState(false);
    const [traitementJournalMsg, setTraitementJournalMsg] = useState('');

    //récupération infos de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;
    const navigate = useNavigate();

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

    const columns = [
        {
            id: 'compteLibelle.compte',
            label: 'compte',
            minWidth: 150,
            align: 'left',
            isnumber: false
        },
        {
            id: 'compteLibelle.libelle',
            label: 'Libellé',
            minWidth: 400,
            align: 'left',
            isnumber: false
        },
        {
            id: 'mvtdebit',
            label: 'Mouvement débit',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
        {
            id: 'mvtcredit',
            label: 'Mouvement crédit',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
        {
            id: 'soldedebit',
            label: 'Solde débit',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
        {
            id: 'soldecredit',
            label: 'Solde crédit',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
    ];

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
                recupBalance(checked, unsoldedCompte, compteId, fileId, exerciceNId[0].id);
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

    //Choix exercice
    const handleChangeExercice = (exercice_id) => {
        setSelectedExerciceId(exercice_id);
        setSelectedPeriodeChoiceId("0");
        setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
        setSelectedPeriodeId(exercice_id);
        recupBalance(checked, unsoldedCompte, compteId, fileId, exercice_id);
    }

    //Choix période
    const handleChangePeriode = (choix) => {
        setSelectedPeriodeChoiceId(choix);

        if (choix === 0) {
            setListeSituation(listeExercice?.filter((item) => item.id === selectedExerciceId));
            setSelectedPeriodeId(selectedExerciceId);
            recupBalance(checked, unsoldedCompte, compteId, fileId, selectedExerciceId);
        } else if (choix === 1) {
            GetListeSituation(selectedExerciceId);
        }
    }

    //Récupération de la balance
    const recupBalance = (centraliser, unSolded, movmentedCpt, compteId, fileId, exerciceId) => {
        axios.post(`/administration/exportBalance/recupBalance`, { centraliser, unSolded, movmentedCpt, compteId, fileId, exerciceId }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setBalance(resData.list);
            } else {
                toast.error(resData.msg);
            }
        });
    }

    useEffect(() => {
        recupBalance(checked, unsoldedCompte, movmentedCpt, compteId, fileId, selectedPeriodeId);
    }, [fileId, selectedPeriodeId, checked, unsoldedCompte, movmentedCpt]);

    //Formulaire pour l'import du journal
    const formikImport = useFormik({
        initialValues: {
            idCompte: compteId,
            idDossier: fileId,
            idExercice: selectedPeriodeId,
            type: 'CSV',
            choixImport: '',
            journalData: [],
        },
        validationSchema: Yup.object({
            type: Yup.string().required("Veuillez choisir le type de fichier à importer"),
            choixImport: Yup.string().required("Veuillez choisir l'action à faire"),
            compteassocie: Yup.string()
        }),
        onSubmit: (values) => {

        },
    });

    //Choix centralisation des comptes
    const handleChange = (event) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        recupBalance(isChecked, unsoldedCompte, movmentedCpt, compteId, fileId, selectedExerciceId);
    };

    //choix compte soldé ou non 
    const handleChangeUnsoldedCompte = (event) => {
        const isChecked = event.target.checked;
        // console.log("Nouvel état du switch:", isChecked);
        // toast.success(`État du switch : ${isChecked}`);
        setUnsoldedCompte(isChecked);
        // recupBalance(checked, isChecked, movmentedCpt, compteId, fileId, selectedExerciceId);
    };

    //choix compte mouvementés seulement
    const handleChangeMovmentedCpt = (event) => {
        const isChecked = event.target.checked;
        setMovmentedCpt(isChecked);
    };

    return (
        <Box>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}

            <TabContext value={"1"}>
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
                <TabPanel value="1" style={{ height: '85%' }}>
                    <form onSubmit={formikImport.handleSubmit}>
                        <Stack width={"100%"} height={"100%"} spacing={4} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                            <Typography variant='h6' sx={{ color: "black" }} align='left'>Administration - Export balance</Typography>

                            <Stack width={"100%"} height={"80px"} spacing={4} alignItems={"left"} alignContent={"center"} direction={"row"} style={{ marginLeft: "0px", marginTop: "20px" }}>
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
                                            <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
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

                            <Stack width={"100%"} height={"60px"} spacing={2} alignItems={"center"} alignContent={"center"} direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                <FormControlLabel
                                    control={<Switch checked={checked} onChange={handleChange} name="centralisation" />}
                                    label="Centraliser la balance"
                                    style={{ width: "15%" }}
                                />

                                <FormControlLabel
                                    control={<Switch checked={unsoldedCompte} onChange={handleChangeUnsoldedCompte} name="unSoldedCompte" />}
                                    label="Seulement les comptes non soldés"
                                    style={{ width: "22%" }}
                                />

                                <FormControlLabel
                                    control={<Switch checked={movmentedCpt} onChange={handleChangeMovmentedCpt} name="movmentedCpt" />}
                                    label="Seulement les comptes mouvementés"
                                    style={{ width: "56%" }}
                                />

                                <Button
                                    type='submit'
                                    variant="contained"
                                    style={{
                                        height: "50px",
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: initial.theme,
                                        width: "7%"
                                    }}
                                >
                                    Exporter
                                </Button>
                            </Stack>

                            {traitementJournalWaiting
                                ? <Stack spacing={2} direction={'row'} width={"100%"} alignItems={'center'} justifyContent={'center'}>
                                    <CircularProgress />
                                    <Typography variant='h6' style={{ color: '#2973B2' }}>{traitementJournalMsg}</Typography>
                                </Stack>
                                : null
                            }

                            <Stack width={"100%"} height={'50vh'} >
                                <VirtualTableModifiableExport columns={columns} rows={balance} state={true} />
                            </Stack>
                        </Stack>
                    </form>
                </TabPanel>
            </TabContext>
        </Box>
    )
}
