import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, Box, Tab, Badge, Button, Divider } from '@mui/material';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { init } from '../../init';
import axios from '../../config/axios';
import PopupTestSelectedFile from './componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from './componentsTools/InfosFileStyle';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { DataGridStyle } from '../components/componentsTools/DatagridToolsStyle'
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter from '../components/componentsTools/DatagridToolsStyle';

import PopupSaisie from './componentsTools/Saisie/popupSaisie';
import PopupConfirmDelete from './componentsTools/popupConfirmDelete';

import { Autocomplete, TextField } from '@mui/material';

import { IoMdAdd } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";

import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { useFormik } from 'formik';
import { MdFilePresent } from "react-icons/md";
import { GridPagination } from '@mui/x-data-grid';
import { MdFilterAlt } from "react-icons/md";
import { MdFilterAltOff } from "react-icons/md";
import { URL } from '../../config/axios';

export default function SaisieComponent() {
    let initial = init[0];
    const [fileInfos, setFileInfos] = useState('');
    const [fileId, setFileId] = useState(0);
    const { id } = useParams();
    const [noFile, setNoFile] = useState(false);

    const [listSaisie, setListSaisie] = useState([]);
    const [filteredList, setFilteredList] = useState(null);

    const [selectedRows, setSelectedRows] = useState([]);
    const [rowSelectionModel, setRowSelectionModel] = useState([]);

    const gridRef = useRef(null)
    const [scrollbarVisible, setScrollbarVisible] = useState(false);

    const [refresh, setRefresh] = useState(false);

    const [openDialogDeleteSaisie, setOpenDialogDeleteSaisie] = useState(false);

    const [typeActionSaisie, setTypeActionSaisie] = useState('');

    //récupération infos de connexion
    const navigate = useNavigate();

    const [selectedExerciceId, setSelectedExerciceId] = useState(0);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);
    const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
    const [listeExercice, setListeExercice] = useState([]);
    const [listeSituation, setListeSituation] = useState([]);

    const [openSaisiePopup, setOpenSaisiePopup] = useState(false);

    const [listeCodeJournaux, setListeCodeJournaux] = useState([]);
    const [listePlanComptable, setListePlanComptable] = useState([]);

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

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

    //Récupération données liste code journaux
    const GetListeCodeJournaux = (id) => {
        axios.get(`/paramCodeJournaux/listeCodeJournaux/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListeCodeJournaux(resData.list);
            } else {
                setListeCodeJournaux([]);
                toast.error(resData.msg);
            }
        })
    }

    //Récupération du plan comptable
    const getPc = () => {
        axios.get(`/paramPlanComptable/PcIdLibelle/${compteId}/${fileId}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListePlanComptable(resData.liste);
            } else {
                toast.error(resData.msg);
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

    //Liste saisie
    const getListeSaisie = () => {
        axios.get(`/administration/traitementSaisie/getJournal/${compteId}/${id}/${selectedExerciceId}`).then((response) => {
            const resData = response.data;
            setListSaisie(resData);
        })
    }

    //Header
    const SaisieColumnHeader = [
        {
            field: 'dateecriture',
            headerName: 'Date',
            type: 'string',
            sortable: true,
            flex: 0.6,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                const rawDate = params.value;
                const dateObj = new Date(rawDate);

                if (isNaN(dateObj.getTime())) return ""; // sécurité si mauvaise date

                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();

                return `${day}/${month}/${year}`;
            },
        },
        {
            field: 'journal',
            headerName: 'Journal',
            type: 'string',
            sortable: true,
            flex: 0.5,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'compte',
            headerName: 'Compte',
            type: 'string',
            sortable: true,
            flex: 0.7,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'piece',
            headerName: 'Pièce',
            type: 'string',
            sortable: true,
            flex: 0.7,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'fichier',
            headerName: 'Voir',
            type: 'string',
            sortable: false,
            flex: 0.3,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                const file = params.row.fichier;
                return (
                    <>
                        <Button
                            onClick={() => file && viewFile(file)}
                            disabled={!file}
                            sx={{
                                boxShadow: 'none',
                                '&:focus': {
                                    outline: 'none',
                                    boxShadow: 'none',
                                }
                            }}
                        >
                            <MdFilePresent style={{ width: '30px', height: '30px' }} />
                        </Button>
                    </>
                )
            }
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            flex: 3,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'num_facture',
            headerName: 'N° Facture',
            type: 'string',
            sortable: true,
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        }, {
            field: 'debit',
            headerName: 'Débit',
            type: 'string',
            sortable: true,
            flex: 1,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                const formatted = Number(params.value).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                return formatted.replace(/\u202f/g, ' ');
            },
        }, {
            field: 'credit',
            headerName: 'Crédit',
            type: 'string',
            sortable: true,
            flex: 1,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                const formatted = Number(params.value).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                return formatted.replace(/\u202f/g, ' ');
            },
        },
    ]

    //afficher ou non le popup du saisie
    const handleOpenSaisiePopup = (type) => {
        setOpenSaisiePopup(true);
        setTypeActionSaisie(type);
    }

    const handleCloseSaisieAddPopup = (value) => {
        setOpenSaisiePopup(value);
    }

    //Formik recherche saisie
    const formSaisieRecherche = useFormik({
        initialValues: {
            journal: "",
            compte: null,
            piece: "",
            libelle: '',
            debut: '',
            fin: ''
        },
        validateOnChange: false,
        validateOnBlur: true,
    })

    // Filtrer les saisies
    const handleSearch = () => {
        const { journal, compte, piece, libelle, debut, fin } = formSaisieRecherche.values;

        const hasFilters =
            (journal && journal !== "") ||
            (compte && compte.compte) ||
            (piece && piece !== "") ||
            (libelle && libelle !== "") ||
            (debut && debut !== "") &&
            (fin && fin !== "");

        if (!hasFilters) {
            setFilteredList(null); // réinitialise, affiche toute la liste
            return toast.error('Veuillez sélectionner les filtres');
        }

        const filtered = listSaisie.filter((item) => {
            const matchJournal = journal
                ? item.journal?.toString().toLowerCase().includes(journal.toString().toLowerCase())
                : true;

            const matchCompte = compte && compte.compte
                ? item.compte?.toLowerCase().includes(compte.compte.toLowerCase())
                : true;

            const matchPiece = piece
                ? item.piece?.toLowerCase().includes(piece.toLowerCase())
                : true;

            const matchLibelle = libelle
                ? item.libelle?.toLowerCase().includes(libelle.toLowerCase())
                : true;

            const matchDate = (() => {
                if (!debut && !fin) return true;

                const itemDate = new Date(item.dateecriture);
                const startDate = debut ? new Date(debut) : null;
                const endDate = fin ? new Date(fin) : null;

                if (startDate && endDate) {
                    return itemDate >= startDate && itemDate <= endDate;
                } else if (startDate) {
                    return itemDate >= startDate;
                } else if (endDate) {
                    return itemDate <= endDate;
                }
                return true;
            })();

            return matchJournal && matchCompte && matchPiece && matchLibelle && matchDate;
        });

        const idsEcriture = [...new Set(filtered.map(item => item.id_ecriture))]; // dédoublonner

        const finalFilteredList = listSaisie.filter(item => idsEcriture.includes(item.id_ecriture));

        toast.success('Filtre appliqué');
        setFilteredList(finalFilteredList);
    };

    //Réinitialiser le filtre
    const handleReinitialize = () => {
        formSaisieRecherche.resetForm();
        toast.success('Filtre réinitialisé');
        setFilteredList(null);
    }

    const viewFile = (file) => {
        if (!file) return;

        const baseUrl = `${URL}/`;
        const fileUrl = baseUrl + file;

        window.open(fileUrl, "_blank");
    };

    // Calcul débit et crédit
    const tableRows = filteredList ?? listSaisie;
    const totalDebitNotParsed = tableRows.reduce((total, row) => {
        const debit = parseFloat(row.debit) || 0; // conversion sécurisée
        return total + debit;
    }, 0);

    const totalDebit = parseFloat(totalDebitNotParsed.toFixed(2));

    const totalCreditNotParsed = tableRows.reduce((total, row) => {
        const credit = parseFloat(row.credit) || 0;
        return total + credit;
    }, 0)

    const totalCredit = parseFloat(totalCreditNotParsed.toFixed(2));

    const total = totalDebit - totalCredit

    const totalFormatted = total.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/\u202f/g, ' ')

    const totalDebitFormatted = totalDebit.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/\u202f/g, ' ')

    const totalCreditFormatted = totalCredit.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/\u202f/g, ' ')

    //Supprimer des saisies
    const handleDeleteSelectedSaisies = (value) => {
        if (value) {
            setSelectedRows([]);
            setRowSelectionModel([]);
            const rowIds = selectedRows.map(row => row.id);
            axios.delete('/administration/traitementSaisie/deleteJournal', { data: { ids: rowIds } }).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    toast.success('Lignes supprimés avec success');
                    setRefresh(!refresh);
                } else {
                    toast.error(resData.msg)
                }
            })
            setOpenDialogDeleteSaisie(false);
        } else {
            setOpenDialogDeleteSaisie(false);
        }
    };

    //Afficher le modal de suppression de saisies
    const handleOpenDialogConfirmDeleteSaisie = () => {
        setOpenDialogDeleteSaisie(true);
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
        GetListeExercice(idFile);
    }, []);

    // Liste saisie
    useEffect(() => {
        getListeSaisie();
    }, [selectedPeriodeId, selectedExerciceId, refresh])

    // Liste code journaux
    useEffect(() => {
        GetListeCodeJournaux(fileId);
        getPc();
    }, [fileId, compteId]);

    useEffect(() => {
        const el = gridRef.current?.querySelector('.MuiDataGrid-virtualScroller');
        if (!el) return;

        const checkOverflow = () => {
            const isOverflowing = el.scrollHeight > el.clientHeight;
            setScrollbarVisible(isOverflowing);
        };

        checkOverflow(); // appel initial

        const resizeObserver = new ResizeObserver(checkOverflow);
        const mutationObserver = new MutationObserver(checkOverflow);

        resizeObserver.observe(el);
        mutationObserver.observe(el, { childList: true, subtree: true });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [filteredList?.length, listSaisie?.length]);

    return (
        <Box
        >
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}

            {openSaisiePopup ?
                <PopupSaisie
                    confirmationState={handleCloseSaisieAddPopup}
                    fileId={fileId}
                    selectedExerciceId={selectedExerciceId}
                    rowsEdit={selectedRows}
                    setRefresh={() => setRefresh(!refresh)}
                    setRowSelectionModel={() => setRowSelectionModel([])}
                    type={typeActionSaisie}
                /> : null}

            {openDialogDeleteSaisie ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer ces lignes sélectionnés ?"} confirmationState={handleDeleteSelectedSaisies} /> : null}
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
                    <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                        <Typography variant='h6' sx={{ color: "black" }} align='left'>Administration - Saisie</Typography>

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

                            <Stack
                                direction="row"
                                justifyContent="flex-end"
                                width="100%"
                                spacing={0.5}
                                style={{
                                    marginLeft: "0px",
                                    marginTop: "5px",
                                    borderRadius: "5px"
                                }}>
                                <Button
                                    onClick={() => handleOpenSaisiePopup('ajout')}
                                    variant="contained"
                                    style={{
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: initial.theme,
                                        color: "white",
                                        height: "39px",
                                        marginTop: '10px'
                                    }}
                                >
                                    <IoMdAdd size={20} /> Nouvelle sasie
                                </Button>
                                <Button
                                    onClick={() => handleOpenSaisiePopup('modification')}
                                    disabled={selectedRows.length === 0}
                                    variant="contained"
                                    style={{
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: '#4CC0E4',
                                        color: "white",
                                        height: "39px",
                                        marginTop: '10px'
                                    }}
                                >
                                    <AiFillEdit size={20} style={{ marginRight: 5 }} />Modifier
                                </Button>
                                <Button
                                    onClick={handleOpenDialogConfirmDeleteSaisie}
                                    disabled={selectedRows.length === 0}
                                    variant="contained"
                                    style={{
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: initial.button_delete_color,
                                        color: "white",
                                        height: "39px",
                                        marginTop: '10px'
                                    }}
                                >
                                    <MdDelete size={20} style={{ marginRight: 3 }} />Supprimer
                                </Button>
                            </Stack>
                        </Stack>

                        <Stack
                            width={"100%"}
                            paddingLeft={"5px"}
                            alignItems={"center"}
                            alignContent={"center"}
                            direction={"row"}
                            justifyContent={"space-between"}
                            style={{
                                marginLeft: "0px",
                                marginTop: "20px",
                                backgroundColor: '#F4F9F9',
                                borderRadius: "5px"
                            }}
                        >
                            <Stack
                                direction={"row"}
                                sx={{ flexGrow: 1, flexWrap: 'wrap' }}
                            >
                                <FormControl variant="standard" sx={{ width: '13%', marginRight: 5 }}>
                                    <InputLabel>Code journal</InputLabel>
                                    <Select
                                        value={formSaisieRecherche.values.journal}
                                        onChange={formSaisieRecherche.handleChange}
                                        name="journal"
                                    >
                                        {listeCodeJournaux.map((value, index) => (
                                            <MenuItem key={index} value={value.code}>
                                                {`${value.code} - ${value.libelle}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl variant="standard" sx={{ width: '13%', marginRight: 5 }}>
                                    <Autocomplete
                                        options={listePlanComptable}
                                        getOptionLabel={(option) => `${option.compte || ''} - ${option.libelle || ''}`}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        PaperComponent={(props) => (
                                            <div {...props} style={{ width: 500, backgroundColor: 'white' }} />
                                        )}
                                        value={formSaisieRecherche.values.compte}
                                        onChange={(e, value) => {
                                            formSaisieRecherche.setFieldValue('compte', value);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="standard"
                                                name="compte"
                                                label="Compte"
                                            />
                                        )}
                                    />
                                </FormControl>

                                <FormControl variant="standard" sx={{ width: "13%", marginRight: 5 }}>
                                    <TextField
                                        id="piece"
                                        label="Pièce"
                                        variant="standard"
                                        value={formSaisieRecherche.values.piece}
                                        onChange={formSaisieRecherche.handleChange}
                                        name="piece"
                                    />
                                </FormControl>

                                <FormControl variant="standard" sx={{ width: "18%", marginRight: 5 }}>
                                    <TextField
                                        id="libelle"
                                        label="Libellé"
                                        variant="standard"
                                        value={formSaisieRecherche.values.libelle}
                                        onChange={formSaisieRecherche.handleChange}
                                        name="libelle"
                                    />
                                </FormControl>

                                <FormControl variant="standard" sx={{ width: "10%", marginRight: 5 }}>
                                    <TextField
                                        id="debut"
                                        label="Début"
                                        variant="standard"
                                        type="date"
                                        value={formSaisieRecherche.values.debut}
                                        onChange={formSaisieRecherche.handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& input::-webkit-calendar-picker-indicator': {
                                                filter: 'brightness(0) saturate(100%) invert(21%) sepia(31%) saturate(684%) hue-rotate(165deg) brightness(93%) contrast(90%)',
                                                cursor: 'pointer',
                                            },
                                        }}
                                    />
                                </FormControl>

                                <FormControl variant="standard" sx={{ width: "10%", marginRight: 3 }}>
                                    <TextField
                                        id="fin"
                                        label="Fin"
                                        variant="standard"
                                        type='date'
                                        value={formSaisieRecherche.values.fin}
                                        onChange={formSaisieRecherche.handleChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        inputProps={{
                                            min: formSaisieRecherche.values.debut,
                                        }}
                                        sx={{
                                            '& input::-webkit-calendar-picker-indicator': {
                                                filter: 'brightness(0) saturate(100%) invert(21%) sepia(31%) saturate(684%) hue-rotate(165deg) brightness(93%) contrast(90%)',
                                                cursor: 'pointer',
                                            },
                                        }}
                                    />
                                </FormControl>
                            </Stack>

                            <Stack direction="row" spacing={0.5}>
                                <Button
                                    onClick={handleSearch}
                                    style={{
                                        textTransform: 'none',
                                        outline: 'none',
                                    }}
                                    variant="outlined"
                                >
                                    <MdFilterAlt size={20} />Appliquer le filtre
                                </Button>
                                <Button
                                    onClick={handleReinitialize}
                                    style={{
                                        textTransform: 'none',
                                        outline: 'none',
                                    }}
                                    variant="outlined"
                                >
                                    <MdFilterAltOff size={20} />Réinitialiser le filtre
                                </Button>
                            </Stack>
                        </Stack>

                        {/* <TableSaisieModel headCells={headCells} rows={rows} /> */}
                        <Stack
                            width="100%"
                            height="550px"
                            style={{
                                marginLeft: "0px",
                                marginTop: "20px",
                                overflow: "auto",
                            }}
                        >
                            <DataGrid
                                ref={gridRef}
                                disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                disableColumnSelector={DataGridStyle.disableColumnSelector}
                                disableDensitySelector={DataGridStyle.disableDensitySelector}
                                disableRowSelectionOnClick
                                disableSelectionOnClick={true}
                                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                slots={{
                                    toolbar: QuickFilter,
                                    footer: () => (
                                        <>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: '#F4F9F9',
                                                    borderTop: '1px solid #ccc',
                                                    height: '60px',
                                                    width: '100%',
                                                }}
                                            >
                                                <Box sx={{ flex: 0.6, px: 1 }}>
                                                    <Typography fontWeight="bold">Total</Typography>
                                                </Box>
                                                <Box sx={{ flex: 0.5, px: 1 }} />
                                                <Box sx={{ flex: 0.7, px: 1 }} />
                                                <Box sx={{ flex: 0.7, px: 1 }} />
                                                <Box sx={{ flex: 0.3, px: 1 }} />
                                                <Box sx={{ flex: 3, px: 1 }} />
                                                <Box sx={{ flex: 1, textAlign: 'right', pr: 1 }}>
                                                    <Typography fontWeight="bold">{totalDebitFormatted}</Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        flex: 1,
                                                        textAlign: 'right',
                                                        pr: 1,
                                                        ...(scrollbarVisible ? { mr: 2.5 } : {}) // décalage conditionnel
                                                    }}
                                                >
                                                    <Typography fontWeight="bold">{totalCreditFormatted}</Typography>
                                                </Box>
                                            </Box>

                                            <GridPagination
                                                sx={{
                                                    overflow: 'hidden',
                                                }}
                                            />
                                        </>
                                    ),
                                }}
                                sx={{
                                    ...DataGridStyle.sx, // les styles existants
                                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                        outline: 'none',
                                        border: 'none',
                                    },
                                    '& .highlight-separator': {
                                        borderBottom: '1px solid red'
                                    },
                                    '& .MuiDataGrid-row.highlight-separator': {
                                        borderBottom: '1px solid red', // Ou n'importe quel autre style visible
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        maxHeight: '550px',
                                    },
                                }}
                                rowHeight={DataGridStyle.rowHeight}
                                columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                editMode='row'
                                columns={SaisieColumnHeader}
                                rows={filteredList ?? listSaisie}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 100 },
                                    },
                                }}
                                experimentalFeatures={{ newEditingApi: true }}
                                pageSizeOptions={[5, 10, 20, 30, 50, 100]}
                                pagination={DataGridStyle.pagination}
                                checkboxSelection={DataGridStyle.checkboxSelection}
                                columnVisibilityModel={{
                                    id: false,
                                }}
                                getRowClassName={(params) => {
                                    const data = filteredList ?? listSaisie;
                                    const index = data.findIndex(row => row.id === params.id);

                                    if (index < data.length - 1) {
                                        const current = data[index];
                                        const next = data[index + 1];

                                        if (current?.id_ecriture !== next?.id_ecriture) {
                                            return 'highlight-separator';
                                        }
                                    }

                                    return '';
                                }}
                                rowSelectionModel={rowSelectionModel}
                                onRowSelectionModelChange={(ids) => {
                                    const data = filteredList ?? listSaisie;
                                    const selectedID = ids[0];

                                    if (!selectedID) {
                                        setSelectedRows([]);
                                        setRowSelectionModel([]);
                                        return;
                                    }

                                    const selectedData = data.find((row) => row.id === selectedID);
                                    const id_ecriture = selectedData?.id_ecriture;

                                    if (!id_ecriture) {
                                        setSelectedRows([]);
                                        setRowSelectionModel([]);
                                        return;
                                    }

                                    const rows = data
                                        .filter((row) => row.id_ecriture === id_ecriture)
                                        .map((row) => {
                                            const [annee, mois, jour] = row.dateecriture.split('-');
                                            const compteObj = listePlanComptable.find(pc => pc.compte === row.compte);

                                            return {
                                                ...row,
                                                jour: parseInt(jour),
                                                mois: parseInt(mois),
                                                compte: Number(compteObj?.id ?? row.id_numcpt),
                                                // libelle: compteObj?.libelle ?? row.libelle
                                            };
                                        });

                                    if (rows.length > 0) {
                                        setSelectedRows(rows);
                                    }
                                    const newRowIds = rows.map(row => row.id);

                                    setSelectedRows(rows);
                                    setRowSelectionModel(newRowIds);
                                }}
                            />
                        </Stack>
                    </Stack>
                </TabPanel>
            </TabContext>
        </Box>
    )
}
