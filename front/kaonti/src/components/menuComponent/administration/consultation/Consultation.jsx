import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Autocomplete, Typography, Stack, Paper, Box, Tab, Badge, Button, Divider, TextField } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { init } from '../../../../../init';

import axios from '../../../../../config/axios';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { TbPlugConnected } from "react-icons/tb";
import { TbPlugConnectedX } from "react-icons/tb";

import { TabContext, TabList, TabPanel } from '@mui/lab';

import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';

import { AiFillEdit } from "react-icons/ai";

import { DataGrid, frFR } from '@mui/x-data-grid';

import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

import { GrPrevious } from "react-icons/gr";
import { GrNext } from "react-icons/gr";

import PopupSaisie from '../../../componentsTools/Saisie/popupSaisie';

export default function ConsultationComponent() {
    let initial = init[0];

    const [fileInfos, setFileInfos] = useState('');
    const [fileId, setFileId] = useState(0);
    const [noFile, setNoFile] = useState(false);
    const [listeExercice, setListeExercice] = useState([]);
    const [listeSituation, setListeSituation] = useState([]);
    const [selectedExerciceId, setSelectedExerciceId] = useState(0);
    const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);

    const [openSaisiePopup, setOpenSaisiePopup] = useState(false);

    const [selectedRows, setSelectedRows] = useState([]);
    const [rowSelectionModel, setRowSelectionModel] = useState([]);

    const [isRefresehed, setIsRefreshed] = useState(false);

    const { id } = useParams();

    const [listSaisie, setListSaisie] = useState([]);
    const [filteredList, setFilteredList] = useState(null);
    const [listePlanComptable, setListePlanComptable] = useState([]);
    const [listePlanComptableInitiale, setListePlanComptableInitiale] = useState([]);
    const [listeCodeJournaux, setListeCodeJournaux] = useState([]);
    const [listeDevise, setListeDevise] = useState([]);
    const [listeAnnee, setListeAnnee] = useState([]);

    const [filtrageCompte, setFiltrageCompte] = useState("0")

    //Valeur du listbox choix compte
    const [valSelectedCompte, setValSelectedCompte] = useState(() => {
        // lecture initiale depuis localStorage
        if (typeof window !== "undefined") {
            return Number(localStorage.getItem("valSelectedCompteConsultation")) || "tout";
        }
        return "tout";
    })

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

    //récupération infos de connexion
    const navigate = useNavigate();

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

    const handleCloseSaisieAddPopup = (value) => {
        setOpenSaisiePopup(value);
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
                toast.error("Une erreur est survenue lors de la récupération de la liste des exercices");
            }
        })
    }

    //Récupérer la liste des situations
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
                toast.error("Une erreur est survenue lors de la récupération de la liste des situations");
            }
        })
    }

    //Liste saisie
    const getListeSaisie = () => {
        axios.get(`/administration/traitementSaisie/getJournal/${compteId}/${id}/${selectedExerciceId}`).then((response) => {
            const resData = response.data;
            setListSaisie(resData);
        })
    }

    //Liste saisie with return statement
    const getListeSaisieReturn = async () => {
        const response = await axios.get(`/administration/traitementSaisie/getJournal/${compteId}/${id}/${selectedExerciceId}`);
        const resData = response.data;
        setListSaisie(resData);
        return resData;
    };

    //Récupération du plan comptable
    const getPc = () => {
        axios.get(`/paramPlanComptable/PcIdLibelle/${compteId}/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListePlanComptable(resData.liste);
                setListePlanComptableInitiale(resData.liste);
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

    //Header
    const ConsultationColumnHeader = [
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

                if (isNaN(dateObj.getTime())) return "";

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
            flex: 0.43,
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
        }, {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            flex: 2.5,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        }, {
            field: 'debit',
            headerName: 'Débit',
            type: 'string',
            sortable: true,
            flex: 0.9,
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
            flex: 0.9,
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
        {
            field: 'solde',
            headerName: 'Solde',
            type: 'number',
            sortable: true,
            flex: 1,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            // valueGetter: (params) => {
            //     const debit = Number(params.row.debit) || 0;
            //     const credit = Number(params.row.credit) || 0;
            //     return debit - credit;
            // },
            renderCell: (params) => {
                const solde = Number(params.value) || 0;
                const formatted = solde.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                return formatted.replace(/\u202f/g, ' ');
            },
        }
        , {
            field: 'lettrage',
            headerName: 'Lettrage',
            type: 'string',
            sortable: true,
            flex: 0.45,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        // {
        //     field: 'analytique',
        //     headerName: 'Analytique',
        //     type: 'string',
        //     sortable: true,
        //     flex: 1,
        //     headerAlign: 'left',
        //     align: 'left',
        //     headerClassName: 'HeaderbackColor',
        // }, {
        //     field: 'comm',
        //     headerName: 'Commentaires',
        //     type: 'string',
        //     sortable: true,
        //     flex: 1,
        //     headerAlign: 'left',
        //     align: 'left',
        //     headerClassName: 'HeaderbackColor',
        // },
    ]

    const handleSearch = () => {
        if (!valSelectedCompte || valSelectedCompte === 'tout') {
            setFilteredList([]);
            return;
        }

        if (!listePlanComptable || listePlanComptable.length === 0) {
            toast.error("Liste plan comptable pas encore chargée");
            return;
        }

        const compteSelect = (listePlanComptableInitiale || listePlanComptable).find(
            (item) => item.id === Number(valSelectedCompte)
        );

        console.log("compteSelect : ", compteSelect);

        if (!compteSelect) {
            setFilteredList([]);
            return;
        }

        const filtered = listSaisie.filter((item) =>
            item.compte?.toString().includes(compteSelect.compte.toString())
        );

        setFilteredList(filtered);
    };

    const handlePrevious = () => {
        const currentIndex = listePlanComptable.findIndex(item => item.id === Number(valSelectedCompte));
        if (currentIndex > 0) {
            setValSelectedCompte(listePlanComptable[currentIndex - 1].id);
        } else if (currentIndex === 0) {
            setValSelectedCompte("tout");
        }
    };

    const handleNext = () => {
        const currentIndex = listePlanComptable.findIndex(item => item.id === Number(valSelectedCompte));
        if (currentIndex < listePlanComptable.length - 1) {
            setValSelectedCompte(listePlanComptable[currentIndex + 1].id);
        }
    };

    //Cacule solde
    const calculerSoldeCumule = (rows) => {
        const newRows = [];

        for (let i = 0; i < rows.length; i++) {
            const debit = Number(rows[i].debit) || 0;
            const credit = Number(rows[i].credit) || 0;

            const previousSolde = i > 0 ? newRows[i - 1].solde : 0;
            let solde = previousSolde + (debit - credit);

            // Corriger -0 en 0
            if (Math.abs(solde) < 0.005) {
                solde = 0;
            }

            newRows.push({ ...rows[i], solde });
        }

        return newRows;
    };

    const rowsAvecSolde = calculerSoldeCumule(filteredList ?? listSaisie);

    const ajoutLettrage = () => {
        if (selectedRows.length === 0) {
            toast.error("Aucune ligne sélectionnée");
            return;
        }
        const isHavingLettrage = selectedRows.some(row => row.lettrage && row.lettrage.trim() !== '');
        if (isHavingLettrage) {
            toast.error("Il y a déjà une lettrage pour certaines lignes");
        } else {
            const soldeStr = calculateDebitCredit(selectedRows).solde.replace(/\s/g, '').replace(',', '.');
            const solde = parseFloat(soldeStr);
            if (solde === 0) {
                const ids = selectedRows.map(row => row.id);
                axios.post('/administration/traitementSaisie/addLettrage',
                    {
                        data: ids,
                        id_compte: compteId,
                        id_dossier: id,
                        id_exercice: selectedExerciceId
                    }
                ).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        toast.success('Lignes lettrés avec success');
                        setIsRefreshed(!isRefresehed);
                        setSelectedRows(selectedRows);
                    } else {
                        toast.error(resData.message);
                    }
                })
            } else {
                toast.error("Le total crédit doit être égal au total débit");
            }
        }
    }

    const supprimerLettrage = () => {
        if (selectedRows.length === 0) {
            toast.error("Aucune ligne sélectionnée");
            return;
        }

        const firstLettrage = selectedRows[0].lettrage?.trim();

        const allHaveSameLettrage = firstLettrage &&
            selectedRows.every(row => row.lettrage?.trim() === firstLettrage);

        if (!allHaveSameLettrage) {
            toast.error("Les lettrages ne sont pas les mêmes ou sont vides");
            return;
        }

        const soldeStr = calculateDebitCredit(selectedRows).solde.replace(/\s/g, '').replace(',', '.');
        const solde = parseFloat(soldeStr);

        if (solde === 0) {
            const ids = selectedRows.map(row => row.id);
            axios.put('/administration/traitementSaisie/deleteLettrage', {
                data: ids,
                id_compte: compteId,
                id_dossier: id,
                id_exercice: selectedExerciceId
            }).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    toast.success('Ligne délettrés avec succès');
                    setIsRefreshed(!isRefresehed);
                    setSelectedRows(selectedRows);
                } else {
                    toast.error(resData.message);
                }
            }).catch(err => {
                toast.error("Erreur lors de la suppression du lettrage");
            });
        } else {
            toast.error("Le total crédit doit être égal au total débit");
        }
    };

    const handleOpenSaisiePopup = () => {
        let id_ecriture = '';
        if (selectedRows.length === 1) {
            id_ecriture = selectedRows[0].id_ecriture;
            const rows = listSaisie
                .filter((row) => row.id_ecriture === id_ecriture)
                .map((row) => {
                    const [annee, mois, jour] = row.dateecriture.split('-');
                    const compteObj = listePlanComptable.find(pc => pc.compte === row.compte);

                    return {
                        ...row,
                        jour: parseInt(jour),
                        mois: parseInt(mois),
                        compte: Number(compteObj?.id ?? row.id_numcpt),
                        libelle: compteObj?.libelle ?? row.libelle
                    };
                });
            setSelectedRows(rows);
            setOpenSaisiePopup(true);
        } else {
            toast.error('Sélectionner une ligne pour modifier')
        }
    }

    const calculateDebitCredit = (tableRows) => {
        const totalDebit = tableRows.reduce((total, row) => total + (parseFloat(row.debit) || 0), 0);
        const totalCredit = tableRows.reduce((total, row) => total + (parseFloat(row.credit) || 0), 0);

        const total = totalDebit - totalCredit;

        const totalDebitFormatted = totalDebit.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/\u202f/g, ' ');

        const totalCreditFormatted = totalCredit.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/\u202f/g, ' ');

        // Calcul du solde final à la main
        let solde = 0;

        for (let i = 0; i < tableRows.length; i++) {
            const debit = parseFloat(tableRows[i].debit) || 0;
            const credit = parseFloat(tableRows[i].credit) || 0;

            solde += debit - credit;
        }

        if (Math.abs(solde) < 0.005) {
            solde = 0;
        }

        return {
            debit: totalDebitFormatted,
            credit: totalCreditFormatted,
            solde: solde.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).replace(/\u202f/g, ' ')
        };
    };

    const soldeStr = calculateDebitCredit(selectedRows).solde.replace(/\s/g, '').replace(',', '.');
    const solde = parseFloat(soldeStr);

    //Récupération données liste code journaux
    const GetListeCodeJournaux = () => {
        axios.get(`/paramCodeJournaux/listeCodeJournaux/${fileId}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListeCodeJournaux(resData.list);
            } else {
                setListeCodeJournaux([]);
                toast.error(resData.msg);
            }
        })
    }

    //Récupération données liste des devises
    const getListeDevises = () => {
        axios.get(`/devises/devise/compte/${compteId}/${fileId}`).then((response) => {
            const resData = response.data;
            setListeDevise(response.data);
        })
    }

    //Recupérer l'année min et max de l'éxercice
    const getAnneesEntreDeuxDates = (dateDebut, dateFin) => {
        const debut = new Date(dateDebut).getFullYear();
        const fin = new Date(dateFin).getFullYear();
        const annees = [];

        for (let annee = debut; annee <= fin; annee++) {
            annees.push(annee);
        }

        return annees;
    };

    //Récupération la liste des exercices BY ID EXERCICE
    const getDateDebutFinExercice = () => {
        axios.get(`/paramExercice/listeExerciceById/${selectedExerciceId}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                const annee = getAnneesEntreDeuxDates(resData.list.date_debut, resData.list.date_fin)
                setListeAnnee(annee)
            } else {
                setListeAnnee([])
            }
        })
    }

    // Liste saisie
    useEffect(() => {
        getListeSaisie();
    }, [selectedPeriodeId, selectedExerciceId, selectedExerciceId, isRefresehed])

    //récupérer les informations du dossier sélectionné
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
        GetListeExercice(idFile);
    }, []);

    useEffect(() => {
        if (listePlanComptable.length > 0 && valSelectedCompte) {
            const existe = listePlanComptable.some(item => item.id === Number(valSelectedCompte));
            if (!existe && valSelectedCompte !== "tout") {
                setValSelectedCompte("tout");
                return;
            }

            handleSearch();
        }
    }, [listePlanComptable, valSelectedCompte, listSaisie]);

    useEffect(() => {
        getPc()
    }, [id, compteId])

    useEffect(() => {
        if (fileId && compteId) {
            GetListeCodeJournaux();
            getListeDevises();
        }
    }, [fileId, compteId]);

    useEffect(() => {
        const fetchData = async () => {
            // setValSelectedCompte("tout");

            if (filtrageCompte === "0") {
                setListePlanComptable(listePlanComptableInitiale);
                setValSelectedCompte("tout");
            } else {
                try {
                    const resData = await getListeSaisieReturn();
                    const comptesAvecSolde = resData.map(row => String(row.compte));

                    const listePlanComptableFiltree = listePlanComptableInitiale.filter(plan =>
                        comptesAvecSolde.includes(String(plan.compte))
                    );

                    if (filtrageCompte === "1") {
                        // Comptes mouvementés
                        setListePlanComptable(listePlanComptableFiltree);

                    } else if (filtrageCompte === "2") {
                        // Comptes soldés
                        const comptesEquilibres = listePlanComptableFiltree.filter(plan => {
                            const lignes = resData.filter(row => String(row.compte) === String(plan.compte));
                            const totalDebit = lignes.reduce((sum, row) => sum + (Number(row.debit) || 0), 0);
                            const totalCredit = lignes.reduce((sum, row) => sum + (Number(row.credit) || 0), 0);
                            return Math.abs(totalDebit - totalCredit) < 0.01;
                        });

                        setListePlanComptable(comptesEquilibres);

                    } else if (filtrageCompte === "3") {
                        // Comptes non soldés
                        const comptesDesequilibres = listePlanComptableFiltree.filter(plan => {
                            const lignes = resData.filter(row => String(row.compte) === String(plan.compte));
                            const totalDebit = lignes.reduce((sum, row) => sum + (Number(row.debit) || 0), 0);
                            const totalCredit = lignes.reduce((sum, row) => sum + (Number(row.credit) || 0), 0);
                            return Math.abs(totalDebit - totalCredit) >= 0.01;
                        });

                        setListePlanComptable(comptesDesequilibres);
                    }
                } catch (error) {
                    console.error("Erreur lors du chargement des écritures :", error);
                }
            }
        };

        fetchData();
    }, [filtrageCompte, fileId, listePlanComptableInitiale]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === "ArrowRight") {
                // Ctrl + →
                handleNext();
            } else if (e.ctrlKey && e.key === "ArrowLeft") {
                // Ctrl + ←
                handlePrevious();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [listePlanComptable, valSelectedCompte]);

    useEffect(() => {
        if (valSelectedCompte) {
            localStorage.setItem("valSelectedCompteConsultation", valSelectedCompte);
        }
    }, [valSelectedCompte]);

    // Liste des années
    useEffect(() => {
        if (selectedExerciceId) {
            getDateDebutFinExercice();
        }
    }, [selectedExerciceId])

    return (
        // <Paper elevation={3} sx={{ margin: "5px", padding: "0px", width: "99%", height: "98%" }}>
        <Box >
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
            {openSaisiePopup ?
                <PopupSaisie
                    confirmationState={handleCloseSaisieAddPopup}
                    fileId={fileId}
                    selectedExerciceId={selectedExerciceId}
                    rowsEdit={selectedRows}
                    setRefresh={() => setIsRefreshed(!isRefresehed)}
                    setRowSelectionModel={() => setRowSelectionModel([])}
                    type={'modification'}
                    listeCodeJournaux={listeCodeJournaux}
                    listePlanComptable={listePlanComptableInitiale}
                    listeAnnee={listeAnnee}
                    listeDevise={listeDevise}
                    setSelectedRowsSaisie={() => setSelectedRows([])}
                /> : null}
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
                <TabPanel value="1" style={{ height: '85%' }}>
                    <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                        <Typography variant='h6' sx={{ color: "black" }} align='left'>Administration - Consultation</Typography>
                        <Stack width={"100%"} height={"80px"} spacing={4} alignItems={"left"} alignContent={"center"} direction={"row"} style={{ marginLeft: "0px", marginTop: "20px" }}>
                            <Stack
                                direction={'row'}
                            >
                                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Exercice:</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={selectedExerciceId}
                                        label={"exercice"}
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
                                        // value={selectedPeriodeChoiceId}
                                        label={"periode"}
                                        // onChange={(e) => handleChangePeriode(e.target.value)}
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
                                        label={"du"}
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
                                width="70%"
                                spacing={0.5}
                                style={{
                                    marginLeft: "0px",
                                    marginTop: "5px",
                                    borderRadius: "5px"
                                }}>
                                <Button
                                    onClick={handleOpenSaisiePopup}
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
                                    startIcon={<AiFillEdit size={20} />}
                                >
                                    Modifier
                                </Button>
                            </Stack>
                        </Stack>

                        <Stack
                            width={"100%"}
                            paddingLeft={"5px"}
                            alignItems={"left"}
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
                            <FormControl
                                variant="standard"
                            >
                                <Stack direction={'row'} alignContent={'center'}>
                                    <Stack
                                        sx={{
                                            width: 500,
                                            mr: 2
                                        }}
                                    >
                                        <Autocomplete
                                            disabled={!selectedExerciceId || selectedExerciceId === 0}
                                            value={listePlanComptable.find(item => item.id === Number(valSelectedCompte)) || null}
                                            onChange={(event, newValue) => {
                                                setValSelectedCompte(newValue?.id || 'tout');
                                            }}
                                            options={listePlanComptable}
                                            getOptionLabel={(option) => `${option.compte || ''} - ${option.libelle || ''}`}
                                            renderInput={(params) => <TextField {...params} label="Compte" variant="standard" />}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            disableClearable={false}
                                            noOptionsText="Aucun compte disponible"
                                        />
                                    </Stack>
                                    <Stack direction={'row'} spacing={1}>
                                        <Button
                                            disabled={!selectedExerciceId || selectedExerciceId === 0 || valSelectedCompte === 'tout'}
                                            sx={{
                                                minWidth: 0,
                                                padding: 1,
                                                backgroundColor: 'transparent',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                },
                                                '&:focus': {
                                                    outline: 'none',
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                },
                                                '&:active': {
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                },
                                            }}
                                            onClick={handlePrevious}
                                        >
                                            <GrPrevious
                                                color="gray"
                                                size={20}
                                            />
                                        </Button>
                                        <Button
                                            disabled={
                                                !selectedExerciceId || selectedExerciceId === 0 || 
                                                listePlanComptable.findIndex(item => item.id === valSelectedCompte) >= listePlanComptable.length - 1
                                            }
                                            sx={{
                                                minWidth: 0,
                                                padding: 1,
                                                backgroundColor: 'transparent',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                },
                                                '&:focus': {
                                                    outline: 'none',
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                },
                                                '&:active': {
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                },
                                            }}
                                            onClick={handleNext}
                                        >
                                            <GrNext
                                                color="gray"
                                                size={20}
                                            />
                                        </Button>
                                    </Stack>
                                </Stack>
                            </FormControl>

                            <RadioGroup
                                row
                                aria-labelledby="filtrageCompte"
                                name="filtrageCompte"
                                onChange={(e) => {
                                    setFiltrageCompte(e.target.value);
                                    setFilteredList([]);
                                    setListSaisie([]);
                                    handleSearch();
                                }}
                                value={filtrageCompte}
                            >
                                <FormControlLabel value="0" control={<Radio />} label="Tous" style={{ marginLeft: "20px" }} />
                                <FormControlLabel value="1" control={<Radio />} label="Comptes mouvementés" style={{ marginLeft: "20px" }} />
                                <FormControlLabel value="2" control={<Radio />} label="Comptes soldés" style={{ marginLeft: "20px" }} />
                                <FormControlLabel value="3" control={<Radio />} label="Comptes non soldés" style={{ marginLeft: "20px" }} />
                            </RadioGroup>
                        </Stack>

                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            alignItems="center"
                            width="100%"
                            spacing={0.5}
                            sx={{ mt: 2, borderRadius: "5px" }}
                            style={{
                                marginLeft: "0px",
                                marginTop: "20px",
                                borderRadius: "5px"
                            }}>
                            <Button
                                disabled={selectedRows.length === 0 || solde !== 0}
                                variant="contained"
                                style={{
                                    textTransform: 'none',
                                    outline: 'none',
                                    backgroundColor: initial.theme,
                                    color: "white",
                                    height: "39px",
                                    marginTop: '10px'
                                }}
                                onClick={ajoutLettrage}
                                startIcon={<TbPlugConnected size={20} />}
                            >
                                Lettrer
                            </Button>
                            <Button
                                disabled={selectedRows.length === 0 || solde !== 0}
                                variant="contained"
                                style={{
                                    textTransform: 'none',
                                    outline: 'none',
                                    backgroundColor: '#FF8A8A',
                                    color: "white",
                                    height: "39px",
                                    marginTop: '10px'
                                }}
                                onClick={supprimerLettrage}
                                startIcon={<TbPlugConnectedX size={20} />}
                            >
                                Délettrer
                            </Button>

                        </Stack>

                        {/* <TableConsultationModel headCells={headCells} rows={rows} /> */}
                        <Stack
                            width={"100%"}
                            // height={'80%'}
                            style={{
                                marginLeft: "0px",
                                marginTop: "20px",
                            }}
                            height={"600px"}>
                            <DataGrid
                                disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                disableColumnSelector={DataGridStyle.disableColumnSelector}
                                disableDensitySelector={DataGridStyle.disableDensitySelector}
                                disableRowSelectionOnClick
                                disableSelectionOnClick={true}
                                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                slots={{ toolbar: QuickFilter }}
                                sx={{
                                    ...DataGridStyle.sx,
                                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                        outline: 'none',
                                        border: 'none',
                                    }
                                }}
                                rowHeight={DataGridStyle.rowHeight}
                                columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                editMode='row'
                                columns={ConsultationColumnHeader}
                                rows={rowsAvecSolde}
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
                                rowSelectionModel={rowSelectionModel}
                                onRowSelectionModelChange={(ids) => {
                                    const selectedData = rowsAvecSolde.filter((row) => ids.includes(row.id));
                                    setSelectedRows(selectedData);
                                    const newRowIds = selectedData.map(row => row.id);
                                    setRowSelectionModel(newRowIds);
                                }}
                            />
                        </Stack>
                    </Stack>
                    {
                        selectedRows.length > 0 && (
                            <>
                                <span>
                                    Débit : <strong
                                        style={{
                                            color: '#FF8A8A'
                                        }}
                                    >
                                        {calculateDebitCredit(selectedRows).debit}
                                    </strong>,{" "}
                                </span>
                                <span>
                                    Crédit : <strong
                                        style={{
                                            color: '#FF8A8A'
                                        }}
                                    >
                                        {calculateDebitCredit(selectedRows).credit}
                                    </strong>,{" "}
                                </span>
                                <span>
                                    Solde : <strong
                                        style={{
                                            color: '#FF8A8A'
                                        }}
                                    >
                                        {calculateDebitCredit(selectedRows).solde}
                                    </strong>
                                </span>
                            </>
                        )
                    }
                </TabPanel>
            </TabContext>
        </Box>
    )
}
