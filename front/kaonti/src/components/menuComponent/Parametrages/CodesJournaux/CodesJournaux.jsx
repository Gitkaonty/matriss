import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Stack, Paper, IconButton, FormControl, InputLabel, Select, MenuItem, Input, FormHelperText, Chip } from '@mui/material';
import Button from '@mui/material/Button';
import { IoAddSharp } from "react-icons/io5";
import { GoX } from "react-icons/go";
import { HiPencilSquare } from "react-icons/hi2";
import Tooltip from '@mui/material/Tooltip';
import TableParamCodeJournalModel from '../../../../model/TableParamCodeJournalModel';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { VscClose } from "react-icons/vsc";
import { TfiSave } from "react-icons/tfi";
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { init } from '../../../../../init';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { AiFillBank } from "react-icons/ai";
import { SiCashapp } from "react-icons/si";
import { BsArrow90DegUp } from "react-icons/bs";
import { BsArrow90DegDown } from "react-icons/bs";
import { BsRecord } from "react-icons/bs";
import { MdOutlineSyncLock } from "react-icons/md";

export default function ParamCodeJournalComponent() {
    const initial = init[0];
    //récupération information du dossier sélectionné
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [listeCodeJournaux, setListeCodeJournaux] = useState([]);

    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [editableRow, setEditableRow] = useState(true);
    const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);
    const [listeCptAssocie, setListeCptAssocie] = useState([]);
    const [pc, setPc] = useState([]);
    const [codeValidationColor, setCodeValidationColor] = useState('transparent');
    const [libelleValidationColor, setLibelleValidationColor] = useState('transparent');
    const [typeValidationColor, setTypeValidationColor] = useState('transparent');
    const [compteAssocieValidationColor, setCompteAssocieValidationColor] = useState('transparent');

    //récupération infos de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;
    const navigate = useNavigate();

    //sauvegarde de la nouvelle ligne ajoutée
    const formikNewCodeJournal = useFormik({
        initialValues: {
            idCompte: compteId,
            idDossier: fileId,
            idCode: 0,
            code: '',
            libelle: '',
            type: '',
            compteassocie: ''
        },
        validationSchema: Yup.object({
            code: Yup.string().required("Veuillez ajouter un code journal"),
            libelle: Yup.string().required("Veuillez ajouter un libellé"),
            type: Yup.string().required("Veuillez choisir un type de code journal"),
            compteassocie: Yup.string()
                .when('type', {
                    is: (value) => value === 'BANQUE' || value === 'CAISSE',
                    then: () => Yup.string().required("Veuillez choisir un compte à associer au code journal"),
                    otherwise: () => Yup.string().notRequired(),
                }),
        }),
        // validate: (values) => {
        //     const errors = {};
        //     const testIfCodeExist = listeCodeJournaux.filter((item) => item.code === values.code);
        //     if (testIfCodeExist.length > 0) {
        //         errors.code = 'Ce code journal existe déjà';
        //     }
        //     return errors;
        // },

        validateOnChange: false,
        validateOnBlur: true,
    });

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

    //récupération données liste code journaux
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
    const showPc = () => {
        axios.post(`/paramPlanComptable/pc`, { fileId }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setPc(resData.liste);
            } else {
                toast.error(resData.msg);
            }
        })
    }

    useEffect(() => {
        showPc();
        GetListeCodeJournaux(fileId);
    }, [fileId]);

    //Entete du tableau
    const type = [
        { value: 'ACHAT', label: 'ACHAT' },
        { value: 'BANQUE', label: 'BANQUE' },
        { value: 'CAISSE', label: 'CAISSE' },
        { value: 'OD', label: 'OD' },
        { value: 'RAN', label: 'RAN' },
        { value: 'VENTE', label: 'VENTE' },
    ];

    //liste compte banque et caisse
    const recupListeCptBanqueCaisse = (typeTreso) => {
        const listBank = pc?.filter((row) => row.compte.startsWith('512'));
        const listCash = pc?.filter((row) => row.compte.startsWith('53'));

        formikNewCodeJournal.setFieldValue("type", typeTreso);

        if (typeTreso === 'BANQUE') {
            setListeCptAssocie(listBank);
            setCompteAssocieValidationColor('#F6D6D6');
        } else if (typeTreso === 'CAISSE') {
            setListeCptAssocie(listCash);
            setCompteAssocieValidationColor('#F6D6D6');
        } else {
            setListeCptAssocie([]);
            setCompteAssocieValidationColor('transparent');
            formikNewCodeJournal.setFieldValue("compteassocie", '');
        }
    }

    const CodeJournauxColumnHeader = [
        {
            field: 'code',
            headerName: 'Code',
            type: 'string',
            sortable: true,
            width: 100,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            renderEditCell: (params) => {

                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: codeValidationColor,
                            }}
                            type="text"
                            value={formikNewCodeJournal.values.code}
                            onChange={(e) => { formikNewCodeJournal.setFieldValue('code', e.target.value) }}
                            label="code"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {formikNewCodeJournal.errors.code && formikNewCodeJournal.touched.code && formikNewCodeJournal.errors.code}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            width: 400,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: libelleValidationColor
                            }}
                            type="text"
                            value={formikNewCodeJournal.values.libelle}
                            onChange={(e) => formikNewCodeJournal.setFieldValue('libelle', e.target.value)}
                            label="libelle"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {formikNewCodeJournal.errors.libelle && formikNewCodeJournal.touched.libelle && formikNewCodeJournal.errors.libelle}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'type',
            headerName: 'Type',
            type: 'singleSelect',
            valueOptions: type.map((code) => code.value),
            sortable: true,
            width: 150,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            valueFormatter: (params) => {
                const selectedType = type.find((option) => option.value === params.value);
                return selectedType ? selectedType.label : params.value;
            },

            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth>
                        <InputLabel><em>Choisir...</em></InputLabel>
                        <Select
                            style={{ backgroundColor: typeValidationColor }}
                            value={formikNewCodeJournal.values.type}
                            onChange={(e) => recupListeCptBanqueCaisse(e.target.value)}
                            label="Type"
                        >
                            {type?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.value}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText style={{ color: 'red' }}>
                            {formikNewCodeJournal.errors.type && formikNewCodeJournal.touched.type && formikNewCodeJournal.errors.type}
                        </FormHelperText>
                    </FormControl>
                );
            },
            renderCell: (params) => {
                if (params.value === 'BANQUE') {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <div style={{
                                width: 90,             
                                height: 25,            
                                backgroundColor: '#3D5300', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',  
                                color: 'white'     
                            }}>
                                {params.value}
                            </div> */}

                            <Chip
                                icon={<AiFillBank style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label={params.value}

                                style={{
                                    width: "100%",
                                    display: 'flex', // ou block, selon le rendu souhaité
                                    justifyContent: 'space-between',
                                    backgroundColor: '#3D5300',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                }

                if (params.value === 'CAISSE') {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <div style={{
                                width: 90,             
                                height: 25,            
                                backgroundColor: '#798645', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',
                                color: 'white'       
                            }}>
                                {params.value}
                            </div> */}

                            <Chip
                                icon={<SiCashapp style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label={params.value}

                                style={{
                                    width: "100%",
                                    display: 'flex', // ou block, selon le rendu souhaité
                                    justifyContent: 'space-between',
                                    backgroundColor: '#798645',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                }

                if (params.value === 'ACHAT') {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <div style={{
                                width: 90,             
                                height: 25,            
                                backgroundColor: '#074799', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',
                                color: 'white'       
                            }}>
                                {params.value}
                            </div> */}

                            <Chip
                                icon={<BsArrow90DegUp style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label={params.value}

                                style={{
                                    width: "100%",
                                    display: 'flex', // ou block, selon le rendu souhaité
                                    justifyContent: 'space-between',
                                    backgroundColor: '#074799',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                }
                if (params.value === 'VENTE') {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <div style={{
                                width: 90,             
                                height: 25,            
                                backgroundColor: '#FFA62F', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',
                                color: 'white'       
                            }}>
                                {params.value}
                            </div> */}

                            <Chip
                                icon={<BsArrow90DegDown style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label={params.value}

                                style={{
                                    width: "100%",
                                    display: 'flex', // ou block, selon le rendu souhaité
                                    justifyContent: 'space-between',
                                    backgroundColor: '#67AE6E',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                }
                if (params.value === 'OD') {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <div style={{
                                width: 90,             
                                height: 25,            
                                backgroundColor: '#0B8494', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',
                                color: 'white'       
                            }}>
                                {params.value}
                            </div> */}

                            <Chip
                                icon={<BsRecord style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label={params.value}

                                style={{
                                    width: "100%",
                                    display: 'flex', // ou block, selon le rendu souhaité
                                    justifyContent: 'space-between',
                                    backgroundColor: '#0B8494',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                }
                if (params.value === 'RAN') {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                            <Chip
                                icon={<MdOutlineSyncLock style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label={params.value}

                                style={{
                                    width: "100%",
                                    display: 'flex', // ou block, selon le rendu souhaité
                                    justifyContent: 'space-between',
                                    backgroundColor: '#FFA62F',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                }
            }
        },
        {
            field: 'compteassocie',
            headerName: 'Compte associé',
            type: 'singleSelect',
            valueOptions: listeCptAssocie.map((cpt) => cpt.compte),
            sortable: true,
            width: 400,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            valueFormatter: (params) => {
                const selectedType = listeCptAssocie.find((option) => option.value === params.value);
                return selectedType ? selectedType.compte + " " + selectedType.libelle : params.value;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth>
                        <InputLabel><em>Choisir...</em></InputLabel>
                        <Select
                            style={{ backgroundColor: compteAssocieValidationColor }}
                            value={formikNewCodeJournal.values.compteassocie}
                            onChange={(e) => formikNewCodeJournal.setFieldValue('compteassocie', e.target.value)}
                            label="Type"
                        >
                            {listeCptAssocie?.map((option) => (
                                <MenuItem key={option.compte} value={option.compte}>
                                    {option.compte} {option.libelle}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText style={{ color: 'red' }}>
                            {formikNewCodeJournal.errors.compteassocie && formikNewCodeJournal.touched.compteassocie && formikNewCodeJournal.errors.compteassocie}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
    ];

    //gestion ajout + modification + suppression ligne dans le tableau liste code journaux
    const saveSelectedRow = (ids) => {
        if (ids.length === 1) {
            setSelectedRowId(ids);
            setDisableModifyBouton(false);
            setDisableSaveBouton(false);
            setDisableCancelBouton(false);
            setDisableDeleteBouton(false);
        } else {
            setSelectedRowId([]);
            setDisableModifyBouton(true);
            setDisableSaveBouton(true);
            setDisableCancelBouton(true);
            setDisableDeleteBouton(true);
        }
    }

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        //réinitialiser les couleurs des champs
        setCodeValidationColor('transparent');
        setLibelleValidationColor('transparent');
        setTypeValidationColor('transparent');
        setCompteAssocieValidationColor('transparent');

        //charger dans le formik les données de la ligne
        const selectedRowInfos = listeCodeJournaux?.filter((item) => item.id === id[0]);

        const listBank = pc?.filter((row) => row.compte.startsWith('512'));
        const listCash = pc?.filter((row) => row.compte.startsWith('53'));

        if (selectedRowInfos[0].type === 'BANQUE') {
            setListeCptAssocie(listBank);
        } else if (selectedRowInfos[0].type === 'CAISSE') {
            setListeCptAssocie(listCash);
        } else {
            setListeCptAssocie([]);
        }

        formikNewCodeJournal.setFieldValue("idCode", id);
        formikNewCodeJournal.setFieldValue("idDossier", fileId);
        formikNewCodeJournal.setFieldValue("idCompte", compteId);
        formikNewCodeJournal.setFieldValue("code", selectedRowInfos[0].code);
        formikNewCodeJournal.setFieldValue("libelle", selectedRowInfos[0].libelle);
        formikNewCodeJournal.setFieldValue("type", selectedRowInfos[0].type);
        formikNewCodeJournal.setFieldValue("compteassocie", selectedRowInfos[0].compteassocie);

        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
        //toast.error(formikNewCodeJournal.isValid);
    };

    const handleSaveClick = (id) => () => {
        let saveBoolCode = false;
        let saveBoolLibelle = false;
        let saveBoolType = false;
        let saveBoolCompteAssocie = false;

        setLibelleValidationColor('transparent');
        setTypeValidationColor('transparent');
        setCompteAssocieValidationColor('transparent');

        if (formikNewCodeJournal.values.code === '') {
            setCodeValidationColor('#F6D6D6');
            saveBoolCode = false;
        } else {
            setCodeValidationColor('transparent');
            saveBoolCode = true;
        }

        if (formikNewCodeJournal.values.libelle === '') {
            setLibelleValidationColor('#F6D6D6');
            saveBoolLibelle = false;
        } else {
            setLibelleValidationColor('transparent');
            saveBoolLibelle = true;
        }

        if (formikNewCodeJournal.values.type === '') {
            setTypeValidationColor('#F6D6D6');
            saveBoolType = false;
        } else {
            setTypeValidationColor('transparent');
            saveBoolType = true;
        }

        if (formikNewCodeJournal.values.type === 'BANQUE' || formikNewCodeJournal.values.type === 'CAISSE') {
            if (formikNewCodeJournal.values.compteassocie === '') {
                setCompteAssocieValidationColor('#F6D6D6');
                saveBoolCompteAssocie = false;
            } else {
                setCompteAssocieValidationColor('transparent');
                saveBoolCompteAssocie = true;
            }
        } else {
            setCompteAssocieValidationColor('transparent');
            saveBoolCompteAssocie = true;
        }

        if (saveBoolCode && saveBoolLibelle && saveBoolType && saveBoolCompteAssocie) {
            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
            axios.post(`/paramCodeJournaux/codeJournauxAdd`, formikNewCodeJournal.values).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    setDisableSaveBouton(true);

                    formikNewCodeJournal.resetForm();
                    GetListeCodeJournaux(fileId);
                    toast.success(resData.msg);
                } else {
                    toast.error(resData.msg);
                }
            });
        } else {
            toast.error('Les champs en surbrillances sont obligatoires');
        }
    };

    const handleOpenDialogConfirmDeleteAssocieRow = () => {
        setOpenDialogDeleteRow(true);
    }

    const deleteRow = (value) => {
        if (value === true) {
            if (selectedRowId.length === 1) {
                const idToDelete = selectedRowId[0];
                axios.post(`/paramCodeJournaux/codeJournauxDelete`, { fileId, compteId, idToDelete }).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setOpenDialogDeleteRow(false);
                        setListeCodeJournaux(listeCodeJournaux.filter((row) => row.id !== selectedRowId[0]));
                        toast.success(resData.msg);
                    } else {
                        setOpenDialogDeleteRow(false);
                        toast.error(resData.msg);
                    }
                });
            }
            setOpenDialogDeleteRow(false);
        } else {
            setOpenDialogDeleteRow(false);
        }
    }

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setListeCodeJournaux(listeCodeJournaux.map((row) => (row.id === newRow.id ? updatedRow : row)));
        //setFieldValue('listeAssocies', listAssocie.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleCellEditCommit = (params) => {
        if (selectedRowId.length > 1 || selectedRowId.length === 0) {
            setEditableRow(false);
            setDisableModifyBouton(true);
            setDisableSaveBouton(true);
            setDisableCancelBouton(true);
            toast.error("sélectionnez une seule ligne pour pouvoir la modifier");
        } else {
            setDisableModifyBouton(false);
            setDisableSaveBouton(false);
            setDisableCancelBouton(false);
            if (!selectedRowId.includes(params.id)) {
                setEditableRow(false);
                toast.error("sélectionnez une ligne pour pouvoir la modifier");
            } else {
                setEditableRow(true);
            }
        }

    };

    //Ajouter une ligne dans le tableau liste associé
    const handleOpenDialogAddNewAssocie = () => {
        const newId = -1 * (getMaxID(listeCodeJournaux) + 1);

        formikNewCodeJournal.setFieldValue("idDossier", fileId);
        const newRow = {
            id: newId,
            code: '',
            libelle: '',
            type: '',
            compteassocie: '',
        };
        setListeCodeJournaux([...listeCodeJournaux, newRow]);
    }

    //récupérer le numéro id le plus grand dans le tableau
    const getMaxID = (data) => {
        const Ids = data.map(item => item.id);
        return Math.max(...Ids);
    };

    return (
        <Box>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
            {openDialogDeleteRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer le code journal sélectionné ?"} confirmationState={deleteRow} /> : null}

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
                <TabPanel value="1">
                    <Typography variant='h6' sx={{ color: "black" }} align='left'>Paramétrages : codes journaux</Typography>

                    <Stack width={"100%"} height={"30px"} spacing={1} alignItems={"center"} alignContent={"center"}
                        direction={"column"} style={{ marginLeft: "0px", marginTop: "20px", justifyContent: "right" }}>

                        <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                            direction={"row"} justifyContent={"right"}>
                            <Tooltip title="Ajouter une ligne">
                                <IconButton
                                    variant="contained"
                                    onClick={handleOpenDialogAddNewAssocie}
                                    style={{
                                        width: "35px", height: '35px',
                                        borderRadius: "2px", borderColor: "transparent",
                                        backgroundColor: initial.theme,
                                        textTransform: 'none', outline: 'none'
                                    }}
                                >
                                    <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Modifier la ligne sélectionnée">
                                <IconButton
                                    disabled={disableModifyBouton}
                                    variant="contained"
                                    onClick={handleEditClick(selectedRowId)}
                                    style={{
                                        width: "35px", height: '35px',
                                        borderRadius: "2px", borderColor: "transparent",
                                        backgroundColor: initial.theme,
                                        textTransform: 'none', outline: 'none'
                                    }}
                                >
                                    <FaRegPenToSquare style={{ width: '25px', height: '25px', color: 'white' }} />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Sauvegarder les modifications">
                                <span>
                                    <IconButton
                                        disabled={!formikNewCodeJournal.isValid}
                                        variant="contained"
                                        onClick={handleSaveClick(selectedRowId)}
                                        style={{
                                            width: "35px", height: '35px',
                                            borderRadius: "2px", borderColor: "transparent",
                                            backgroundColor: initial.theme,
                                            textTransform: 'none', outline: 'none'
                                        }}
                                    >
                                        <TfiSave style={{ width: '50px', height: '50px', color: 'white' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Annuler les modifications">
                                <span>
                                    <IconButton
                                        disabled={disableCancelBouton}
                                        variant="contained"
                                        onClick={handleCancelClick(selectedRowId)}
                                        style={{
                                            width: "35px", height: '35px',
                                            borderRadius: "2px", borderColor: "transparent",
                                            backgroundColor: initial.button_delete_color,
                                            textTransform: 'none', outline: 'none'
                                        }}
                                    >
                                        <VscClose style={{ width: '50px', height: '50px', color: 'white' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Supprimer la ligne sélectionné">
                                <span>
                                    <IconButton
                                        disabled={disableDeleteBouton}
                                        onClick={handleOpenDialogConfirmDeleteAssocieRow}
                                        variant="contained"
                                        style={{
                                            width: "35px", height: '35px',
                                            borderRadius: "2px", borderColor: "transparent",
                                            backgroundColor: initial.button_delete_color,
                                            textTransform: 'none', outline: 'none'
                                        }}
                                    >
                                        <IoMdTrash style={{ width: '50px', height: '50px', color: 'white' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>

                        <Stack width={"100%"} height={'100%'} minHeight={'600px'}>
                            <DataGrid
                                disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                disableColumnSelector={DataGridStyle.disableColumnSelector}
                                disableDensitySelector={DataGridStyle.disableDensitySelector}
                                disableRowSelectionOnClick
                                disableSelectionOnClick={true}
                                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                slots={{ toolbar: QuickFilter }}
                                sx={DataGridStyle.sx}
                                rowHeight={DataGridStyle.rowHeight}
                                columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                editMode='row'
                                columns={CodeJournauxColumnHeader}
                                rows={listeCodeJournaux}
                                onRowClick={(e) => handleCellEditCommit(e.row)}
                                // onCellClick={(e) => test(e.row)}
                                onRowSelectionModelChange={ids => {
                                    saveSelectedRow(ids);
                                }}
                                rowModesModel={rowModesModel}
                                onRowModesModelChange={handleRowModesModelChange}
                                onRowEditStop={handleRowEditStop}
                                processRowUpdate={processRowUpdate}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 100 },
                                    },
                                }}
                                experimentalFeatures={{ newEditingApi: true }}
                                pageSizeOptions={[50, 100]}
                                pagination={DataGridStyle.pagination}
                                checkboxSelection={DataGridStyle.checkboxSelection}
                                columnVisibilityModel={{
                                    id: false,
                                }}
                            />
                        </Stack>
                    </Stack>
                </TabPanel>
            </TabContext>
        </Box>
    )
}
