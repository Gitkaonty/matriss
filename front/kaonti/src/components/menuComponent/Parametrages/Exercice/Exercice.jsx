import { React, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography, Stack, Paper, IconButton, FormLabel, FormControl, Select, Input, FormHelperText, Button, ButtonGroup,
    Grid, Breadcrumbs, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import Tooltip from '@mui/material/Tooltip';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import * as Yup from "yup";
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PopupActionConfirm from '../../../componentsTools/popupActionConfirm';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../../config/axiosPrivate';
import Periode from './Periode';

import DeleteIcon from '@mui/icons-material/DeleteOutline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from "@mui/icons-material/Lock";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const BORDER_COLOR = '#E2E8F0';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';
const NEON_MINT = '#00FF94';

const tableContainerStyle = {
    borderRadius: '12px',
    border: `1px solid ${BORDER_COLOR}`,
    bgcolor: '#fff',
    overflow: 'hidden',
    height: 'calc(100vh - 280px)',
    minHeight: '500px'
};

const cellStyle = { fontSize: '13px', py: '6px', color: '#334155' };

const headerStyle = (width, last = false) => ({
    fontWeight: 800,
    color: '#94A3B8',
    fontSize: '10px',
    textTransform: 'uppercase',
    width: width,
    minWidth: width,
    paddingY: '4px',
    pr: last ? 2 : 1
});

const btnStyle = {
    bgcolor: '#10B981',
    color: '#fff',
    textTransform: 'none',
    fontWeight: 700,
    borderRadius: '6px',
    height: '28px',
    fontSize: '11px',
    '&:hover': { bgcolor: '#059669' }
};


export default function ParamExerciceComponent() {
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const axiosPrivate = useAxiosPrivate();

    const initial = init[0];
    const navigate = useNavigate();
    const [findText, setFindText] = useState('');
    //récupération information du dossier sélectionné
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [listeExercice, setListeExercice] = useState([]);
    const [openDialogCreateFirstExercice, setEpenDialogCreateFirstExercice] = useState(false);
    const [openActionConfirm, setOpenActionConfirm] = useState(false);
    const [openActionConfirmPrev, setOpenActionConfirmPrev] = useState(false);
    const [openActionConfirmVerrExercice, setOpenActionConfirmVerrExercice] = useState(false);
    const [msgVerrExercice, setMsgVerrExercice] = useState('');
    const [exerciceToLock, setExerciceToLock] = useState([]);
    const [openActionConfirmDeverrExercice, setOpenActionConfirmDeverrExercice] = useState(false);
    const [msgDeverrExercice, setMsgDeverrExercice] = useState('');
    const [exerciceToUnlock, setExerciceToUnlock] = useState([]);
    const [openActionConfirmDeleteExercice, setOpenActionConfirmDeleteExercice] = useState(false);
    const [msgDeleteExercice, setMsgDeleteExercice] = useState('');
    const [selectedExerciceRow, setSelectedExerciceRow] = useState([]);
    const [selectedExercice, setSelectedExercice] = useState(null);
    const [exerciceToDeleteId, setExerciceToDeleteId] = useState(0);
    const [exerciceToDeleteRang, setExerciceToDeleteRang] = useState(null);

    const [loadingCreateNextExercice, setLoadingCreateNextExercice] = useState(false);
    const [loadingCreatePreviousExercice, setLoadingPreviousExercice] = useState(false);

    const [rowModesModel, setRowModesModel] = useState({});


    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        borderRadius: 1,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
    };

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

    //Entete du tableau
    const ExerciceColumnHeader = [
        {
            field: 'date_debut',
            headerName: 'Date début',
            type: 'Date',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
            valueFormatter: (params) => {
                return format(params.value, "dd/MM/yyyy");
            }
        },
        {
            field: 'date_fin',
            headerName: 'Date fin',
            type: 'Date',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
            valueFormatter: (params) => {
                return format(params.value, "dd/MM/yyyy");
            }
        },
        {
            field: 'libelle_rang',
            headerName: 'Position',
            type: 'string',
            sortable: true,
            width: 100,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'cloture',
            headerName: 'Vérrouillé',
            type: 'boolean',
            sortable: true,
            width: 100,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 80,
            sortable: false,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            editable: false,
            renderCell: (params) => {

                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ pr: 1 }}>

                        <IconButton
                            disabled={!canDelete || selectedExerciceRow.length === 0}
                            onClick={handleDeleteExercice}
                            size="small"
                            sx={{ color: '#CBD5E1', '&:hover': { color: '#EF4444' } }}
                            title="Supprimer"
                        >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                        </IconButton>

                    </Stack>
                );
            },
        },
    ];

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

    //Chargement de la liste des exercices associés à l'id dossier sélectionné
    const GetListeExercice = (id) => {
        axios.get(`/paramExercice/listeExercice/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListeExercice(resData.list);
            } else {
                setListeExercice([]);
                toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
            }

        })
    }

    useEffect(() => {
        if (canView) {
            GetListeExercice(fileId);
        }
    }, [fileId]);

    //Création du premier exercice dans le tableau
    const handleCreateNextExercice = () => {
        if (listeExercice.length === 0) {
            firstExerciceForm.setFieldValue('id_compte', compteId);
            firstExerciceForm.setFieldValue('id_dossier', fileId);
            handleOpenDialogCreateFirstExercice();
        } else {
            setOpenActionConfirm(true);
        }
    }

    const handleCreateNextExercicePrev = () => {
        if (listeExercice.length === 0) {
            firstExerciceForm.setFieldValue('id_compte', compteId);
            firstExerciceForm.setFieldValue('id_dossier', fileId);
            handleOpenDialogCreateFirstExercice();
        } else {
            setOpenActionConfirmPrev(true);
        }
    }

    const handleOpenDialogCreateFirstExercice = () => {
        setEpenDialogCreateFirstExercice(true);
    }

    const handleCloseDialogCreateFirstExercice = () => {
        setEpenDialogCreateFirstExercice(false);
    }

    //formule pour la création du premier exercice
    const firstExerciceForm = useFormik({
        initialValues: {
            id_compte: 0,
            id_dossier: 0,
            date_debut: '',
            date_fin: ''
        },

        validationSchema: Yup.object({
            date_debut: Yup.string()
                .matches(
                    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, // = format du back pour la datapicker yyyy-MM-dd
                    'La date doit être au format jj/mm/aaaa'
                )
                .test('is-valid-date', 'La date doit être valide', (value) => {
                    if (!value) return false;

                    const [year, month, day] = value.split('-').map(Number);

                    // Vérifie les mois
                    if (month < 1 || month > 12) return false;

                    // Vérifie les jours en fonction du mois
                    const daysInMonth = new Date(year, month, 0).getDate();
                    return day >= 1 && day <= daysInMonth;
                }).required('La date est requise'),

            date_fin: Yup.string()
                .matches(
                    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, // = format du back pour la datapicker yyyy-MM-dd
                    'La date doit être au format jj/mm/aaaa'
                )
                .test('is-valid-date', 'La date doit être valide', (value) => {
                    if (!value) return false;

                    const [year, month, day] = value.split('-').map(Number);

                    // Vérifie les mois
                    if (month < 1 || month > 12) return false;

                    // Vérifie les jours en fonction du mois
                    const daysInMonth = new Date(year, month, 0).getDate();
                    return day >= 1 && day <= daysInMonth;
                }).required('La date est requise'),
        }),

        validate: (values) => {
            const errors = {};
            if (values.date_debut && values.date_fin) {
                const startDate = new Date(values.date_debut);
                const endDate = new Date(values.date_fin);

                // Vérifier si startDate est plus grande que endDate
                if (startDate > endDate) {
                    errors.date_fin = 'La date fin ne doit être antérieure à la date de début';
                }
            }
            return errors;
        },
    });

    const createFirstExercice = () => {
        axiosPrivate.post(`/paramExercice/createFirstExercice`, firstExerciceForm.values).then((response) => {
            const resData = response.data;
            if (resData.state) {
                GetListeExercice(fileId);
                toast.success("La création du premier exercice a été effectuée avec succès");
            } else {
                toast.error(resData.msg);
            }
            handleCloseDialogCreateFirstExercice();
        });
    }

    //création de l'exercie suivant
    const createNextExercice = async (value) => {
        if (value) {
            setLoadingCreateNextExercice(true);
            try {
                await axiosPrivate.post(`/paramExercice/createNextExercice`, { compteId, fileId }).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        GetListeExercice(fileId);
                        setOpenActionConfirm(false);
                        toast.success("La création de l'exercice suivant a été effectuée avec succès");
                    } else {
                        toast.error(resData.msg);
                    }
                });
            } catch (error) {
                const errMsg = error.response?.data?.message || error.message || "Erreur inconnue";
                toast.error(errMsg);
            } finally {
                setOpenActionConfirm(false);
            }
        } else {
            setOpenActionConfirm(false);
        }
        setLoadingCreateNextExercice(false);
    }

    //création de l'exercice précédent
    const createPreviewExercice = async (value) => {
        if (value) {
            setLoadingPreviousExercice(true);
            try {
                await axiosPrivate.post(`/paramExercice/createPreviewExercice`, { compteId, fileId }).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        GetListeExercice(fileId);
                        setOpenActionConfirmPrev(false);
                        toast.success("La création de l'exercice précédent a été effectuée avec succès");
                    } else {
                        toast.error(resData.msg);
                    }
                });
            } catch (error) {
                const errMsg = error.response?.data?.message || error.message || "Erreur inconnue";
                toast.error(errMsg);
            } finally {
                setOpenActionConfirmPrev(false);
            }
        } else {
            setOpenActionConfirmPrev(false);
        }
        setLoadingPreviousExercice(false);
    }

    //Vérrouiller un exercice
    const handleVerrouillerExercice = () => {
        const listeNonCloture = listeExercice.filter(item => item.cloture == false);

        let oldestExercice = listeNonCloture.reduce((oldest, current) => {
            return current.date_debut < oldest.date_debut ? current : oldest;
        });

        setExerciceToLock(oldestExercice);
        const msgs = `Voulez vous vraiement verrouiller l'exercice du ${format(oldestExercice.date_debut, 'dd/MM/yyyy')} au ${format(oldestExercice.date_fin, 'dd/MM/yyyy')}?`;
        setMsgVerrExercice(msgs);
        setOpenActionConfirmVerrExercice(true);
    }

    const verrouillerExercice = (value) => {
        if (value) {
            const id_exercice = exerciceToLock.id;
            axios.post(`/paramExercice/verrouillerExercice`, { id_exercice, fileId }).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    GetListeExercice(fileId);
                    toast.success("Exercice verrouillé");
                } else {
                    toast.error(resData.msg);
                }
            });
        }
        setOpenActionConfirmVerrExercice(false);
    }

    //Devérrouiller un exercice
    const handleDeverrouillerExercice = () => {
        const listeCloture = listeExercice.filter(item => item.cloture == true);

        let newestExercice = listeCloture.reduce((newest, current) => {
            return current.date_debut > newest.date_debut ? current : newest;
        });

        setExerciceToUnlock(newestExercice);
        const msgs = `Voulez vous vraiement déverrouiller l'exercice du ${format(newestExercice.date_debut, 'dd/MM/yyyy')} au ${format(newestExercice.date_fin, 'dd/MM/yyyy')}?`;
        setMsgDeverrExercice(msgs);
        setOpenActionConfirmDeverrExercice(true);
    }

    const deverrouillerExercice = (value) => {
        if (value) {
            const id_exercice = exerciceToUnlock.id;
            axios.post(`/paramExercice/deverrouillerExercice`, { id_exercice, fileId }).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    GetListeExercice(fileId);
                    toast.success("Exercice déverrouillé");
                } else {
                    toast.error(resData.msg);
                }
            });
        }
        setOpenActionConfirmDeverrExercice(false);
    }

    //supprimer un exercice
    const saveSelectedExercice = (ids) => {
        setSelectedExerciceRow(ids);

        if (ids.length > 0) {
            const selectedId = ids[0];
            const exo = listeExercice.find(e => e.id === selectedId);
            setSelectedExercice(exo || null);
        } else {
            setSelectedExercice(null);
        }
    }

    const handleDeleteExercice = () => {
        if (selectedExerciceRow.length > 1) {
            toast.error("Veuillez sélectionner un seul exercice avant de continuer.");
            return;
        }

        if (selectedExerciceRow.length === 0) {
            toast.error("Veuillez sélectionner un exercice avant de continuer.");
            return;
        }

        const selectedRow = listeExercice.filter(item => item.id === selectedExerciceRow[0]);

        if (selectedRow) {
            if (selectedRow[0].cloture) {
                toast.error("Vous ne pouvez pas supprimer un exercice clôturé.");
            } else {
                let newestExercice = listeExercice.reduce((newest, current) => {
                    return current.date_debut > newest.date_debut ? current : newest;
                });

                let oldestExercice = listeExercice.reduce((oldest, current) => {
                    return current.date_debut < oldest.date_debut ? current : oldest;
                });

                if (newestExercice.date_fin === selectedRow[0].date_fin) {
                    const msgs = `Voulez vous vraiement supprimer l'exercice du ${format(newestExercice.date_debut, 'dd/MM/yyyy')} au ${format(newestExercice.date_fin, 'dd/MM/yyyy')}?`;
                    setMsgDeleteExercice(msgs);
                    setExerciceToDeleteId(selectedRow[0].id);
                    setExerciceToDeleteRang(selectedRow[0].rang);
                    setOpenActionConfirmDeleteExercice(true);
                } else {
                    if (oldestExercice.date_fin === selectedRow[0].date_fin) {
                        const msgs = `Voulez vous vraiement supprimer l'exercice du ${format(oldestExercice.date_debut, 'dd/MM/yyyy')} au ${format(oldestExercice.date_fin, 'dd/MM/yyyy')}?`;
                        setMsgDeleteExercice(msgs);
                        setExerciceToDeleteId(selectedRow[0].id);
                        setExerciceToDeleteRang(selectedRow[0].rang);
                        setOpenActionConfirmDeleteExercice(true);
                    } else {
                        toast.error("Un exercice antérieur et/ou suivant existe encore pour cet exercice sélectionné.");
                    }
                }
            }
        }
    }

    const deleteExercice = (value) => {
        if (value) {
            const id_exerciceToDelete = exerciceToDeleteId;
            const rang = exerciceToDeleteRang;
            axiosPrivate.post(`/paramExercice/deleteExercice`, { id_exerciceToDelete, fileId, rang }).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    GetListeExercice(fileId);
                    toast.success("Exercice supprimé");
                } else {
                    toast.error(resData.msg);
                }
            });
        }
        setOpenActionConfirmDeleteExercice(false);
    }

    const btnStyle = {
        bgcolor: NEON_MINT,
        color: '#000',
        textTransform: 'none',
        fontWeight: 700,
        borderRadius: '6px',
        height: '28px',
        fontSize: '11px',
        '&:hover': {
            bgcolor: '#00E685',
            transform: 'translateY(-1px)'
        }
    };

        const handleChangeFindText = (e) => {
            setFindText(e.target.value);
            if (e.target.value === '') {
                setFinalListeDossier(listeDossier);  // Si vide : montre tout
            } else {
                const filterValue = e.target.value.toLowerCase();
                const filtered = listeDossier.filter(dossier =>
                    dossier.dossier.toLowerCase().includes(filterValue)  // Filtre automatique
                );
                setFinalListeDossier(filtered);
            }
        };

        return(
    <Box>
        { noFile?<PopupTestSelectedFile confirmationState = { sendToHome } /> : null
}

{ openActionConfirm ? <PopupActionConfirm msg={"Voulez-vous vraiment continuer la création de l'exercice suivant ?"} confirmationState={createNextExercice} isLoading={loadingCreateNextExercice} /> : null }
{ openActionConfirmPrev ? <PopupActionConfirm msg={"Voulez-vous vraiment continuer la création de l'exercice précédent ?"} confirmationState={createPreviewExercice} isLoading={loadingCreatePreviousExercice} /> : null }
{ openActionConfirmVerrExercice ? <PopupActionConfirm msg={msgVerrExercice} confirmationState={verrouillerExercice} /> : null }
{ openActionConfirmDeverrExercice ? <PopupActionConfirm msg={msgDeverrExercice} confirmationState={deverrouillerExercice} /> : null }
{ openActionConfirmDeleteExercice ? <PopupConfirmDelete msg={msgDeleteExercice} confirmationState={deleteExercice} /> : null }

        <form onSubmit={firstExerciceForm.handleSubmit}>
            <BootstrapDialog
                onClose={handleCloseDialogCreateFirstExercice}
                aria-labelledby="customized-dialog-title"
                open={openDialogCreateFirstExercice}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontWeight: 'bold', width: '600px', height: '50px', backgroundColor: 'transparent' }}>

                </DialogTitle>

                <IconButton
                    style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                    aria-label="close"
                    onClick={handleCloseDialogCreateFirstExercice}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent >
                    <Stack width={"95%"} height={"100%"} spacing={0} alignItems={'center'} alignContent={"center"}
                        direction={"column"} justifyContent={"center"} style={{ marginLeft: '10px' }}>
                        <Typography sx={{ ml: 0, flex: 1 }} variant="h7" component="div" >
                            Création du premier exercice
                        </Typography>


                        <Stack style={{ marginTop: 40, width: "450px" }} display={'flex'} direction={'row'} alignItems={'end'} alignContent={'center'} spacing={4}>
                            <FormControl
                                sx={{ width: "200px" }}
                                error={firstExerciceForm.errors.date_debut && firstExerciceForm.touched.date_debut}
                            >
                                <FormLabel id="datedebut-label" htmlFor="date_debut">
                                    <Typography level="title-date_debut">
                                        Date début :
                                    </Typography>

                                </FormLabel>
                                <Input
                                    type='date'
                                    name="date_debut"
                                    value={firstExerciceForm.values.date_debut}
                                    onChange={firstExerciceForm.handleChange}
                                    onBlur={firstExerciceForm.handleBlur}
                                    required
                                    slotProps={{
                                        button: {
                                            id: "niveau",
                                            "aria-labelledby": "niveau-label",
                                        },
                                    }}
                                />
                                <FormHelperText>
                                    {firstExerciceForm.errors.date_debut &&
                                        firstExerciceForm.touched.date_debut &&
                                        firstExerciceForm.errors.date_debut}
                                </FormHelperText>
                            </FormControl>

                            <Typography sx={{ ml: 0, pb: 1, flex: 1, }} variant="h7" component="div" >
                                au
                            </Typography>

                            <FormControl
                                sx={{ width: "200px" }}
                                error={firstExerciceForm.errors.date_fin && firstExerciceForm.touched.date_fin}
                            >
                                <FormLabel id="datefint-label" htmlFor="date_fin">
                                    <Typography level="title-date_fin">
                                        Date fin :
                                    </Typography>

                                </FormLabel>
                                <Input
                                    type='date'
                                    name="date_fin"
                                    value={firstExerciceForm.values.date_fin}
                                    onChange={firstExerciceForm.handleChange}
                                    onBlur={firstExerciceForm.handleBlur}
                                    required
                                    slotProps={{
                                        button: {
                                            id: "niveau",
                                            "aria-labelledby": "niveau-label",
                                        },
                                    }}
                                />
                                <FormHelperText>
                                    {firstExerciceForm.errors.date_fin &&
                                        firstExerciceForm.touched.date_fin &&
                                        firstExerciceForm.errors.date_fin}
                                </FormHelperText>
                            </FormControl>
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button autoFocus
                        sx={{
                            ...buttonStyle,
                            backgroundColor: initial.annuler_bouton_color,
                            color: 'white',
                            borderColor: initial.annuler_bouton_color,
                            '&:hover': {
                                backgroundColor: initial.annuler_bouton_color,
                                border: 'none',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: initial.annuler_bouton_color,
                                color: 'white',
                                cursor: 'not-allowed',
                            },
                        }} type='submit'
                        onClick={handleCloseDialogCreateFirstExercice}
                    >
                        Annuler
                    </Button>
                    <Button autoFocus
                        disabled={!firstExerciceForm.isValid}
                        onClick={createFirstExercice}
                        sx={{
                            ...buttonStyle,
                            backgroundColor: '#e79754ff',
                            color: 'white',
                            borderColor: '#e79754ff',
                            boxShadow: 'none',

                            '&:hover': {
                                backgroundColor: '#e79754ff',
                                border: 'none',
                                boxShadow: 'none',       // enlève l’effet bleu shadow
                            },
                            '&:focus': {
                                backgroundColor: '#e79754ff',
                                border: 'none',
                                boxShadow: 'none',       // enlève le focus bleu
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#e79754ff',
                                color: 'white',
                                cursor: 'not-allowed',
                            },
                            '&::before': {
                                display: 'none',         // supprime l’overlay bleu de ButtonGroup
                            },
                        }}                        >
                        Créer
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </form>


        <TabContext value={"1"}>
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
            <TabPanel value="1" sx={{ p: 0 }}>
                <Box sx={{ p: 3, width: '97%' }}>
                    {/* BREADCRUMBS */}
                    {/* <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />}
                        sx={{ mb: 1 }}
                    >
                        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>
                            Paramétrages
                        </Typography>
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: NAV_DARK }}>
                            Exercices & Périodes
                        </Typography>
                    </Breadcrumbs> */}

                    {/* TITRE */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: '#1E293B',
                            letterSpacing: '-0.5px',
                            mb: 3
                        }}
                    >
                        Gestion des Exercices
                    </Typography>

                    <Grid container spacing={3}>
                        {/* COLONNE GAUCHE - EXERCICE (5 colonnes) */}
                        <Grid item xs={12} lg={7}>
                            {/* BARRE D'OUTILS EXERCICE */}
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    mb: 2,
                                    // height: '40px',
                                    // bgcolor: '#fff',
                                    // borderRadius: '8px',
                                    // p: 1
                                    // border: `1px solid ${BORDER_COLOR}`
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: NAV_DARK, ml: 1 }}>
                                    Exercices
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    {/* <TextField
                                            placeholder="Recherche..."
                                            size="small"
                                            value={findText}
                                            onChange={handleChangeFindText}
                                            sx={{
                                                width: 140,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    height: '28px',
                                                    fontSize: '12px'
                                                }
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        /> */}
                                    <Tooltip title="Ajouter l'exercice précédent">
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={!canAdd}
                                                onClick={handleCreateNextExercicePrev}
                                                sx={btnStyle}
                                            >
                                                <ChevronLeftIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title="Ajouter l'exercice suivant">
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={!canAdd}
                                                onClick={handleCreateNextExercice}
                                                sx={btnStyle}
                                            >
                                                <ChevronRightIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Vérrouiller un exercice">
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={!canModify}
                                                onClick={handleVerrouillerExercice}
                                                sx={btnStyle}
                                            >
                                                <LockIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title="Déverrouiller un exercice">
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={!canModify}
                                                onClick={handleDeverrouillerExercice}
                                                sx={btnStyle}
                                            >
                                                <LockOpenIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                </Stack>
                            </Stack>

                            {/* DATAGRID EXERCICE */}
                            <Paper
                                elevation={0}
                                sx={tableContainerStyle}
                            >
                                <DataGrid
                                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                                    disableRowSelectionOnClick
                                    disableSelectionOnClick={true}
                                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-columnHeaders': {
                                            bgcolor: '#F8FAFC',
                                            borderBottom: `1px solid ${BORDER_COLOR}`,
                                        },
                                        '& .MuiDataGrid-columnHeaderTitle': headerStyle(),
                                        '& .MuiDataGrid-cell': cellStyle,
                                        '& .MuiDataGrid-row': {
                                            '&:hover': { bgcolor: '#F1F5F9' },
                                            '&:nth-of-type(even)': { bgcolor: '#FAFAFA' },
                                        },
                                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                            outline: 'none',
                                        },
                                    }}
                                    rowHeight={40}
                                    columnHeaderHeight={40}
                                    editMode='row'
                                    columns={ExerciceColumnHeader}
                                    rows={listeExercice}
                                    onRowSelectionModelChange={ids => {
                                        const single = Array.isArray(ids) && ids.length ? [ids[ids.length - 1]] : [];
                                        saveSelectedExercice(single);
                                    }}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 100 },
                                        },
                                    }}
                                    pageSizeOptions={[50, 100]}
                                    checkboxSelection={DataGridStyle.checkboxSelection}
                                    columnVisibilityModel={{
                                        id: false,
                                    }}
                                    rowSelectionModel={selectedExerciceRow}
                                />
                            </Paper>
                        </Grid>

                        {/* COLONNE DROITE - PERIODE (7 colonnes) */}
                        <Grid item xs={12} lg={5}>
                            <Periode
                                selectedExercice={selectedExercice}
                                idCompte={compteId}
                                idDossier={fileId}
                                axiosPrivate={axiosPrivate}
                                canAdd={canAdd}
                                canDelete={canDelete}
                                canModify={canModify}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </TabPanel>
        </TabContext>

    </Box >
)
}
