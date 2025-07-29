import { React, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Tooltip, Button, IconButton, FormHelperText, Input } from '@mui/material';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { MdExpandCircleDown } from "react-icons/md";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TableParamCRMAssocieModel from '../../../../model/TableParamCRMAssocieModel';
import { IoAddSharp } from "react-icons/io5";
import { GoX } from "react-icons/go";
import { HiPencilSquare } from "react-icons/hi2";
import TableParamCRMFilialeModel from '../../../../model/TableParamCRMFilialeModel';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import axios from '../../../../../config/axios';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import toast from 'react-hot-toast';
import { useFormik, Field, Formik, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import { init } from '../../../../../init';
import { VscLinkExternal } from "react-icons/vsc";
import { FaTools } from "react-icons/fa";
import { FaHotel, FaRegPenToSquare } from "react-icons/fa6";
import { FaIndustry } from "react-icons/fa6";
import { GiMineWagon } from "react-icons/gi";
import { FaTruck } from "react-icons/fa6";
import { MdOutlineTravelExplore } from "react-icons/md";
import { VscClose } from "react-icons/vsc";
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import { TfiSave } from "react-icons/tfi";
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import { TbPlaylistAdd } from 'react-icons/tb';
import { IoMdTrash } from 'react-icons/io';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function ParamCRM() {
    //Choix TAB value-------------------------------------------------------------------------------------
    const [value, setValue] = useState(0);

    const navigate = useNavigate();
    //récupération information du dossier sélectionné
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);

    const [listModel, setListModel] = useState([]);
    const [listAssocie, setListAssocie] = useState([]);
    const [listAssocieFormik, setListAssocieFormik] = useState([]);
    const [listFiliales, setListFiliales] = useState([]);
    const [listFilialesFormik, setListFilialesFormik] = useState([]);
    const [listDomBank, setListDomBank] = useState([]);
    const [listDomBankFormik, setListDomBankFormik] = useState([]);
    const [listPays, setListPays] = useState([]);
    const initial = init[0];
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [editableRow, setEditableRow] = useState(true);
    const [openDialogDeleteAssocieRow, setOpenDialogDeleteAssocieRow] = useState(false);

    const [selectedRowIdFiliale, setSelectedRowIdFiliale] = useState([]);
    const [rowModesModelFiliale, setRowModesModelFiliale] = useState({});
    const [disableModifyBoutonFiliale, setDisableModifyBoutonFiliale] = useState(true);
    const [disableCancelBoutonFiliale, setDisableCancelBoutonFiliale] = useState(true);
    const [disableSaveBoutonFiliale, setDisableSaveBoutonFiliale] = useState(true);
    const [disableDeleteBoutonFiliale, setDisableDeleteBoutonFiliale] = useState(true);
    const [editableRowFiliale, setEditableRowFiliale] = useState(true);
    const [openDialogDeleteFilialeRow, setOpenDialogDeleteFilialeRow] = useState(false);

    const [selectedRowIdDomBank, setSelectedRowIdDomBank] = useState([]);
    const [rowModesModelDomBank, setRowModesModelDomBank] = useState({});
    const [disableModifyBoutonDomBank, setDisableModifyBoutonDomBank] = useState(true);
    const [disableCancelBoutonDomBank, setDisableCancelBoutonDomBank] = useState(true);
    const [disableSaveBoutonDomBank, setDisableSaveBoutonDomBank] = useState(true);
    const [disableDeleteBoutonDomBank, setDisableDeleteBoutonDomBank] = useState(true);
    const [editableRowDomBank, setEditableRowDomBank] = useState(true);
    const [openDialogDeleteDomBankRow, setOpenDialogDeleteDomBankRow] = useState(false);

    const [crm, setCrm] = useState([]);

    const [typeValidationColor, setTypeValidationColor] = useState('transparent');
    const [nomValidationColor, setNomValidationColor] = useState('transparent');
    const [adresseValidationColor, setAdresseValidationColor] = useState('transparent');
    const [dateentreeValidationColor, setDateentreeValidationColor] = useState('transparent');
    const [nombrepartValidationColor, setNombrepartValidationColor] = useState('transparent');
    const [enActiviteValidationColor, setEnActiviteValidationColor] = useState('transparent');

    const [nomFilialeValidationColor, setNomFilialeValidationColor] = useState('transparent');
    const [dateentreeFilialeValidationColor, setDateentreeFilialeValidationColor] = useState('transparent');
    const [nombrepartFilialeValidationColor, setNombrepartFilialeValidationColor] = useState('transparent');
    const [enActiviteFilialeValidationColor, setEnActiviteFilialeValidationColor] = useState('transparent');

    const [bankDomBankValidationColor, setBankDomBankValidationColor] = useState('transparent');
    const [numCompteDomBankValidationColor, setNumCompteDomBankValidationColor] = useState('transparent');
    const [deviseDomBankValidationColor, setDeviseDomBankValidationColor] = useState('transparent');
    const [paysDomBankValidationColor, setPaysDomBankValidationColor] = useState('transparent');

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

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
        getInfosAssocie(idFile);
        getInfosFiliale(idFile);
        getInfosDomBank(idFile);
        getListePays();
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

    const getInfosAssocie = (id) => {
        axios.get(`/paramCrm/listeAssocie/${id}`).then((response) => {
            const resData = response.data;

            if (resData.state) {
                setListAssocie(resData.liste);
            } else {
                setListAssocie([]);
            }
        });
    }

    const getInfosFiliale = (id) => {
        axios.get(`/paramCrm/listeFiliale/${id}`).then((response) => {
            const resData = response.data;

            if (resData.state) {
                setListFiliales(resData.liste);
            } else {
                setListFiliales([]);
            }
        });
    }

    const getInfosDomBank = (id) => {
        axios.get(`/paramCrm/listeDomBank/${id}`).then((response) => {
            const resData = response.data;

            if (resData.state) {
                setListDomBank(resData.liste);
            } else {
                setListDomBank([]);
            }
        });
    }

    //récupérer la liste des pays 
    const getListePays = async () => {
        await axios.get(`/paramCrm/getListePays/`).then((response) => {
            const resData = response.data;

            if (resData.state) {
                setListPays(resData.list);
            } else {
                setListPays([]);
            }
        });
    }

    //useFormik pour le tableau des associers
    const useFormikAssocie = useFormik({
        initialValues: {
            idCompte: compteId,
            idDossier: fileId,
            idAssocie: '',
            type: '',
            nom: '',
            adresse: '',
            dateentree: '',
            datesortie: '',
            nombreparts: '',
            enactivite: false
        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    //useFormik pour le tableau des filiales
    const useFormikFiliale = useFormik({
        initialValues: {
            idCompte: compteId,
            idDossier: fileId,
            idFiliale: '',
            nom: '',
            dateentree: '',
            datesortie: '',
            nombreparts: '',
            enactivite: false
        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    //useFormik pour le tableau des domiciliations bancaires
    const useFormikDomBank = useFormik({
        initialValues: {
            idCompte: compteId,
            idDossier: fileId,
            idDomBank: '',
            banque: '',
            numcompte: '',
            devise: '',
            pays: '',
            enactivite: false
        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    //Form pour l'enregistrement des données
    const InfosNewFileInitialValues = {
        action: 'new',
        itemId: 0,
        idCompte: 0,
        idDossier: 0,
        nomdossier: '',
        raisonsociale: '',
        denomination: '',
        nif: '',
        stat: '',
        rcs: '',
        responsable: '',
        expertcomptable: '',
        cac: '',
        forme: '',
        activite: '',
        detailsactivite: '',
        adresse: '',
        email: '',
        telephone: '',
        plancomptable: 0,
        longueurcptstd: 6,
        longueurcptaux: 6,
        autocompletion: true,
        avecanalytique: false,
        tauxir: '',
        assujettitva: false,
        montantcapital: 0,
        nbrpart: 0,
        valeurpart: 0,
        listeAssocies: [],
        listeFiliales: [],
        listeDomBank: []
    };

    const formInfosNewFileValidationSchema = Yup.object({
        nomdossier: Yup.string().required("Veuillez tapez un nom pour votre dossier"),
        raisonsociale: Yup.string().required("Veuillez insérer la raison sociale de votre société"),
        forme: Yup.string().required("Veuillez sélection la forme de votre société"),
        activite: Yup.string().required("Veuillez renseigner l'activité de votre société"),
        longueurcptstd: Yup.number().moreThan(1, 'Taper une longueur de compte supérieur à 1'),
        longueurcptaux: Yup.number().moreThan(1, 'Taper une longueur de compte supérieur à 1'),
        tauxir: Yup.number().moreThan(0, 'Taper votre taux IR'),
    });

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

    //get infos du CRM
    const infoscrm = (id) => {
        axios.get(`/paramCrm/infoscrm/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setCrm(resData.liste);
            } else {
                setCrm([]);
            }
        })
    }

    useEffect(() => {
        infoscrm(fileId);
    }, [fileId]);


    //GESTION DU TABLEAU ASSOCIE-------------------------------------------------------------------------------
    const TypesOptions = [
        { value: 'PP', label: 'Personne physique' },
        { value: 'PM', label: 'Personne morale' },
    ];

    //Entête tableau liste associé
    const AssocieColumnHeader = [
        {
            field: 'type',
            headerName: 'Type',
            type: 'singleSelect',
            valueOptions: TypesOptions.map((type) => type.value),
            sortable: true,
            width: 200,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            valueFormatter: (params) => {
                const selectedType = TypesOptions.find((option) => option.value === params.value);
                return selectedType ? selectedType.label : params.value;
            },

            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth>
                        <InputLabel><em>Choisir...</em></InputLabel>
                        <Select
                            style={{ backgroundColor: typeValidationColor }}
                            value={useFormikAssocie.values.type}
                            onChange={(e) => useFormikAssocie.setFieldValue('type', e.target.value)}
                            label="Type"
                        >
                            {TypesOptions?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikAssocie.errors.type && useFormikAssocie.touched.type && useFormikAssocie.errors.type}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'nom',
            headerName: 'Nom',
            type: 'text',
            sortable: true,
            width: 350,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            disableClickEventBubbling: true,
            editable: editableRow,
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: nomValidationColor
                            }}
                            type="text"
                            value={useFormikAssocie.values.nom}
                            onChange={(e) => useFormikAssocie.setFieldValue('nom', e.target.value)}
                            label="nom"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikAssocie.errors.nom && useFormikAssocie.touched.nom && useFormikAssocie.errors.nom}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'adresse',
            headerName: 'Adresse',
            type: 'text',
            sortable: true,
            width: 450,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: adresseValidationColor
                            }}
                            type="text"
                            value={useFormikAssocie.values.adresse}
                            onChange={(e) => useFormikAssocie.setFieldValue('adresse', e.target.value)}
                            label="adresse"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikAssocie.errors.adresse && useFormikAssocie.touched.adresse && useFormikAssocie.errors.adresse}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'dateentree',
            headerName: 'Date entrée',
            type: 'date',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            valueGetter: (params) => {
                // Vérifiez si la valeur est une chaîne et convertissez-la en un objet Date
                return params.row.dateentree ? new Date(params.row.dateentree) : null;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: dateentreeValidationColor
                            }}
                            type="date"
                            value={useFormikAssocie.values.dateentree || ''}
                            onChange={(e) => useFormikAssocie.setFieldValue('dateentree', e.target.value)}
                            label="dateentree"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikAssocie.errors.dateentree && useFormikAssocie.touched.dateentree && useFormikAssocie.errors.dateentree}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'datesortie',
            headerName: 'Date sortie',
            type: 'date',
            align: 'center',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            valueGetter: (params) => {
                // Vérifiez si la valeur est une chaîne et convertissez-la en un objet Date
                return params.row.datesortie ? new Date(params.row.datesortie) : null;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                //backgroundColor: libelleValidationColor
                            }}
                            type="date"
                            value={useFormikAssocie.values.datesortie || ''}
                            onChange={(e) => useFormikAssocie.setFieldValue('datesortie', e.target.value)}
                            label="datesortie"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikAssocie.errors.datesortie && useFormikAssocie.touched.datesortie && useFormikAssocie.errors.datesortie}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'nbrpart',
            headerName: 'Nombre parts',
            type: 'number',
            sortable: true,
            width: 150,
            headerAlign: 'right',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: nombrepartValidationColor
                            }}
                            type="number"
                            value={useFormikAssocie.values.nombreparts}
                            onChange={(e) => useFormikAssocie.setFieldValue('nombreparts', e.target.value)}
                            label="nombreparts"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikAssocie.errors.nombreparts && useFormikAssocie.touched.nombreparts && useFormikAssocie.errors.nombreparts}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'enactivite',
            headerName: 'En activité',
            type: 'boolean',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <input
                        checked={useFormikAssocie.values.enactivite}
                        type="checkbox"
                        onChange={(e) => useFormikAssocie.setFieldValue("enactivite", e.target.checked)}
                    />
                );
            },
            // renderEditCell: (params) => {
            //     return (
            //         <FormControl fullWidth style={{height:'120%'}}>
            //             <Input
            //                 style={{height:'100%', alignItems:'center', 
            //                     outline: 'none', 
            //                     backgroundColor: enActiviteValidationColor
            //                 }}
            //                 type="checkbox"
            //                 checked={useFormikAssocie.values.enactivite}
            //                 onChange = {(e) => useFormikAssocie.setFieldValue('enactivite', e.target.checked)}
            //                 label="enactivite"
            //                 disableUnderline={true}
            //             />

            //             <FormHelperText style={{color:'red'}}>
            //                 {useFormikAssocie.errors.enactivite && useFormikAssocie.touched.enactivite && useFormikAssocie.errors.enactivite}
            //             </FormHelperText>
            //         </FormControl>
            //     );
            // },
        },
    ];

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
        setTypeValidationColor('transparent');
        setNomValidationColor('transparent');
        setAdresseValidationColor('transparent');
        setDateentreeValidationColor('transparent');
        setNombrepartValidationColor('transparent');
        setEnActiviteValidationColor('transparent');

        //charger dans le formik les données de la ligne
        const selectedRowInfos = listAssocie?.filter((item) => item.id === id[0]);

        useFormikAssocie.setFieldValue("idCompte", compteId);
        useFormikAssocie.setFieldValue("idDossier", fileId);
        useFormikAssocie.setFieldValue("idAssocie", selectedRowInfos[0].id);
        useFormikAssocie.setFieldValue("type", selectedRowInfos[0].type);
        useFormikAssocie.setFieldValue("nom", selectedRowInfos[0].nom);
        useFormikAssocie.setFieldValue("adresse", selectedRowInfos[0].adresse);
        useFormikAssocie.setFieldValue("dateentree", selectedRowInfos[0].dateentree);
        useFormikAssocie.setFieldValue("datesortie", selectedRowInfos[0].datesortie);
        useFormikAssocie.setFieldValue("nombreparts", selectedRowInfos[0].nbrpart);
        useFormikAssocie.setFieldValue("enactivite", selectedRowInfos[0].enactivite);

        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
    };

    const handleSaveClick = (id) => () => {
        let saveBoolType = false;
        let saveBoolNom = false;
        let saveBoolAdresse = false;
        let saveBoolDateentree = false;
        let saveBoolNombreparts = false;

        if (useFormikAssocie.values.type === '') {
            setTypeValidationColor('#F6D6D6');
            saveBoolType = false;
        } else {
            setTypeValidationColor('transparent');
            saveBoolType = true;
        }

        if (useFormikAssocie.values.nom === '') {
            setNomValidationColor('#F6D6D6');
            saveBoolNom = false;
        } else {
            setNomValidationColor('transparent');
            saveBoolNom = true;
        }

        if (useFormikAssocie.values.adresse === '') {
            setAdresseValidationColor('#F6D6D6');
            saveBoolAdresse = false;
        } else {
            setAdresseValidationColor('transparent');
            saveBoolAdresse = true;
        }

        if (!useFormikAssocie.values.dateentree) {
            setDateentreeValidationColor('#F6D6D6');
            saveBoolDateentree = false;
        } else {
            setDateentreeValidationColor('transparent');
            saveBoolDateentree = true;
        }

        if (!useFormikAssocie.values.nombreparts) {
            setNombrepartValidationColor('#F6D6D6');
            saveBoolNombreparts = false;
        } else {
            setNombrepartValidationColor('transparent');
            saveBoolNombreparts = true;
        }

        if (saveBoolType && saveBoolNom && saveBoolAdresse && saveBoolDateentree && saveBoolNombreparts) {
            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
            axios.post(`/paramCrm/associe`, useFormikAssocie.values).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    setDisableSaveBouton(true);

                    useFormikAssocie.resetForm();
                    getInfosAssocie(fileId);
                    toast.success(resData.msg);
                } else {
                    toast.error(resData.msg);
                }
            });
        } else {
            toast.error('Les champs en surbrillances sont obligatoires');
            setDisableSaveBouton(false);
        }
    };

    const handleOpenDialogConfirmDeleteAssocieRow = () => {
        setOpenDialogDeleteAssocieRow(true);
    }

    const deleteAssocieRow = (value) => {
        if (value === true) {
            if (selectedRowId.length === 1) {
                const idToDelete = selectedRowId[0];
                axios.post(`/paramCrm/associeDelete`, { fileId, compteId, idToDelete }).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setOpenDialogDeleteAssocieRow(false);
                        setListAssocie(listAssocie.filter((row) => row.id !== selectedRowId[0]));
                        toast.success(resData.msg);
                    } else {
                        setOpenDialogDeleteAssocieRow(false);
                        toast.error(resData.msg);
                    }
                });
            }
            setOpenDialogDeleteAssocieRow(false);
        } else {
            setOpenDialogDeleteAssocieRow(false);
        }
    }

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    const processRowUpdate = (setFieldValue) => (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setListAssocie(listAssocie.map((row) => (row.id === newRow.id ? updatedRow : row)));
        setFieldValue('listeAssocies', listAssocie.map((row) => (row.id === newRow.id ? updatedRow : row)));
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

    //récupérer le numéro id le plus grand dans le tableau
    const getMaxID = (data) => {
        const Ids = data.map(item => item.id);
        return Math.max(...Ids);
    };

    //Ajouter une ligne dans le tableau liste associé
    const handleOpenDialogAddNewAssocie = () => {
        const newId = -1 * (getMaxID(listAssocie) + 1);

        useFormikAssocie.setFieldValue("idAssocie", newId);

        const newRow = {
            id: newId,
            type: '',
            nom: '',
            adresse: '',
            dateentree: null,
            datesortie: null,
            nbrpart: 0,
            enactivite: false,
        };
        setListAssocie([...listAssocie, newRow]);
    }


    //GESTION DU TABLEAU FILIALE-------------------------------------------------------------------------------

    //Entête tableau liste associé
    const FilialeColumnHeader = [
        {
            field: 'nom',
            headerName: 'Nom',
            type: 'text',
            sortable: true,
            width: 350,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            disableClickEventBubbling: true,
            editable: editableRowFiliale,
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: nomFilialeValidationColor
                            }}
                            type="text"
                            value={useFormikFiliale.values.nom}
                            onChange={(e) => useFormikFiliale.setFieldValue('nom', e.target.value)}
                            label="nom"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikFiliale.errors.nom && useFormikFiliale.touched.nom && useFormikFiliale.errors.nom}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'dateentree',
            headerName: 'Date entrée',
            type: 'date',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
            editable: editableRowFiliale,
            valueGetter: (params) => {
                // Vérifiez si la valeur est une chaîne et convertissez-la en un objet Date
                return params.row.dateentree ? new Date(params.row.dateentree) : null;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: dateentreeFilialeValidationColor
                            }}
                            type="date"
                            value={useFormikFiliale.values.dateentree || ''}
                            onChange={(e) => useFormikFiliale.setFieldValue('dateentree', e.target.value)}
                            label="dateentree"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikFiliale.errors.dateentree && useFormikFiliale.touched.dateentree && useFormikFiliale.errors.dateentree}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'datesortie',
            headerName: 'Date sortie',
            type: 'date',
            align: 'center',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            headerClassName: 'HeaderbackColor',
            editable: editableRowFiliale,
            valueGetter: (params) => {
                // Vérifiez si la valeur est une chaîne et convertissez-la en un objet Date
                return params.row.datesortie ? new Date(params.row.datesortie) : null;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                //backgroundColor: libelleValidationColor
                            }}
                            type="date"
                            value={useFormikFiliale.values.datesortie || ''}
                            onChange={(e) => useFormikFiliale.setFieldValue('datesortie', e.target.value)}
                            label="datesortie"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikFiliale.errors.datesortie && useFormikFiliale.touched.datesortie && useFormikFiliale.errors.datesortie}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'nbrpart',
            headerName: 'Nombre parts',
            type: 'number',
            sortable: true,
            width: 150,
            headerAlign: 'right',
            headerClassName: 'HeaderbackColor',
            editable: editableRowFiliale,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: nombrepartFilialeValidationColor
                            }}
                            type="number"
                            value={useFormikFiliale.values.nombreparts}
                            onChange={(e) => useFormikFiliale.setFieldValue('nombreparts', e.target.value)}
                            label="nombreparts"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikFiliale.errors.nombreparts && useFormikFiliale.touched.nombreparts && useFormikFiliale.errors.nombreparts}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'enactivite',
            headerName: 'En activité',
            type: 'boolean',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            headerClassName: 'HeaderbackColor',
            editable: editableRowFiliale,
            renderEditCell: (params) => {
                return (
                    <input
                        checked={useFormikFiliale.values.enactivite}
                        type="checkbox"
                        onChange={(e) => useFormikFiliale.setFieldValue("enactivite", e.target.checked)}
                    />
                );
            },

            // renderEditCell: (params) => {
            //     return (
            //         <FormControl fullWidth style={{height:'120%'}}>
            //             <Input
            //                 style={{height:'100%', alignItems:'center', 
            //                     outline: 'none', 
            //                     backgroundColor: enActiviteFilialeValidationColor
            //                 }}
            //                 type="checkbox"
            //                 checked={useFormikFiliale.values.enactivite}
            //                 onChange = {(e) => useFormikFiliale.setFieldValue('enactivite', e.target.checked)}
            //                 label="enactivite"
            //                 disableUnderline={true}
            //             />

            //             <FormHelperText style={{color:'red'}}>
            //                 {useFormikFiliale.errors.enactivite && useFormikFiliale.touched.enactivite && useFormikFiliale.errors.enactivite}
            //             </FormHelperText>
            //         </FormControl>
            //     );
            // },
        },
    ];

    const saveSelectedRowFiliale = (ids) => {
        if (ids.length === 1) {
            setSelectedRowIdFiliale(ids);
            setDisableModifyBoutonFiliale(false);
            setDisableSaveBoutonFiliale(false);
            setDisableCancelBoutonFiliale(false);
            setDisableDeleteBoutonFiliale(false);
        } else {
            setSelectedRowIdFiliale([]);
            setDisableModifyBoutonFiliale(true);
            setDisableSaveBoutonFiliale(true);
            setDisableCancelBoutonFiliale(true);
            setDisableDeleteBoutonFiliale(true);
        }
    }

    const handleRowEditStopFiliale = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClickFiliale = (id) => () => {
        //réinitialiser les couleurs des champs
        setNomFilialeValidationColor('transparent');
        setDateentreeFilialeValidationColor('transparent');
        setNombrepartFilialeValidationColor('transparent');

        //charger dans le formik les données de la ligne
        const selectedRowInfos = listFiliales?.filter((item) => item.id === id[0]);

        useFormikFiliale.setFieldValue("idCompte", compteId);
        useFormikFiliale.setFieldValue("idDossier", fileId);
        useFormikFiliale.setFieldValue("idFiliale", selectedRowInfos[0].id);
        useFormikFiliale.setFieldValue("nom", selectedRowInfos[0].nom);
        useFormikFiliale.setFieldValue("dateentree", selectedRowInfos[0].dateentree);
        useFormikFiliale.setFieldValue("datesortie", selectedRowInfos[0].datesortie);
        useFormikFiliale.setFieldValue("nombreparts", selectedRowInfos[0].nbrpart);
        useFormikFiliale.setFieldValue("enactivite", selectedRowInfos[0].enactivite);

        setRowModesModelFiliale({ ...rowModesModelFiliale, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBoutonFiliale(false);
    };

    const handleSaveClickFiliale = (id) => () => {
        let saveBoolNom = false;
        let saveBoolDateentree = false;
        let saveBoolNombreparts = false;

        if (useFormikFiliale.values.nom === '') {
            setNomFilialeValidationColor('#F6D6D6');
            saveBoolNom = false;
        } else {
            setNomFilialeValidationColor('transparent');
            saveBoolNom = true;
        }

        if (!useFormikFiliale.values.dateentree) {
            setDateentreeFilialeValidationColor('#F6D6D6');
            saveBoolDateentree = false;
        } else {
            setDateentreeFilialeValidationColor('transparent');
            saveBoolDateentree = true;
        }

        if (!useFormikFiliale.values.nombreparts) {
            setNombrepartFilialeValidationColor('#F6D6D6');
            saveBoolNombreparts = false;
        } else {
            setNombrepartFilialeValidationColor('transparent');
            saveBoolNombreparts = true;
        }

        if (saveBoolNom && saveBoolDateentree && saveBoolNombreparts) {
            setRowModesModelFiliale({ ...rowModesModelFiliale, [selectedRowIdFiliale]: { mode: GridRowModes.View } });
            axios.post(`/paramCrm/filiale`, useFormikFiliale.values).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    setDisableSaveBoutonFiliale(true);

                    useFormikFiliale.resetForm();
                    getInfosFiliale(fileId);
                    toast.success(resData.msg);
                } else {
                    toast.error(resData.msg);
                }
            });
        } else {
            toast.error('Les champs en surbrillances sont obligatoires');
            setDisableSaveBoutonFiliale(false);
        }
    };

    const handleOpenDialogConfirmDeleteAssocieRowFiliale = () => {
        setOpenDialogDeleteFilialeRow(true);
    }

    const deleteFilialeRow = (value) => {
        if (value === true) {
            if (selectedRowIdFiliale.length === 1) {
                const idToDelete = selectedRowIdFiliale[0];
                axios.post(`/paramCrm/filialeDelete`, { fileId, compteId, idToDelete }).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setOpenDialogDeleteFilialeRow(false);
                        setListFiliales(listFiliales.filter((row) => row.id !== selectedRowIdFiliale[0]));
                        toast.success(resData.msg);
                    } else {
                        setOpenDialogDeleteFilialeRow(false);
                        toast.error(resData.msg);
                    }
                });
            }
            setOpenDialogDeleteFilialeRow(false);
        } else {
            setOpenDialogDeleteFilialeRow(false);
        }
    }

    const handleCancelClickFiliale = (id) => () => {
        setRowModesModelFiliale({
            ...rowModesModelFiliale,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    const processRowUpdateFiliale = (setFieldValue) => (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setListFiliales(listFiliales.map((row) => (row.id === newRow.id ? updatedRow : row)));
        setFieldValue('listeFiliales', listFiliales.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChangeFiliale = (newRowModesModel) => {
        setRowModesModelFiliale(newRowModesModel);
    };

    const handleCellEditCommitFiliale = (params) => {
        if (selectedRowIdFiliale.length > 1 || selectedRowIdFiliale.length === 0) {
            setEditableRowFiliale(false);
            setDisableModifyBoutonFiliale(true);
            setDisableSaveBoutonFiliale(true);
            setDisableCancelBoutonFiliale(true);
            toast.error("sélectionnez une seule ligne pour pouvoir la modifier");
        } else {
            setDisableModifyBoutonFiliale(false);
            setDisableSaveBoutonFiliale(false);
            setDisableCancelBoutonFiliale(false);
            if (!selectedRowIdFiliale.includes(params.id)) {
                setEditableRowFiliale(false);
                toast.error("sélectionnez une ligne pour pouvoir la modifier");
            } else {
                setEditableRowFiliale(true);
            }
        }

    };

    //Ajouter une ligne dans le tableau liste associé
    const handleOpenDialogAddNewFiliale = () => {
        const newId = -1 * (getMaxID(listFiliales) + 1);

        useFormikFiliale.setFieldValue("idFiliale", newId);

        const newRow = {
            id: newId,
            nom: '',
            dateentree: null,
            datesortie: null,
            nbrpart: 0,
            enactivite: false,
        };
        setListFiliales([...listFiliales, newRow]);
    }


    //GESTION DU TABLEAU DOMICILIATION BANCAIRE-------------------------------------------------------------------------------

    // const listPays = [
    //     { codePays: 'MAD', nomPays: "Madagascar" },
    //     { codePays: 'REU', nomPays: "La Réunion" },
    //     { codePays: 'MAU', nomPays: "Maurice" },
    //     { codePays: 'FRA', nomPays: "France" },
    // ];

    //Entête tableau liste domiciliation bancaire
    const DomBankColumnHeader = [
        {
            field: 'banque',
            headerName: 'Banque',
            type: 'text',
            sortable: true,
            width: 350,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            disableClickEventBubbling: true,
            editable: editableRowDomBank,
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: bankDomBankValidationColor
                            }}
                            type="text"
                            value={useFormikDomBank.values.banque}
                            onChange={(e) => useFormikDomBank.setFieldValue('banque', e.target.value)}
                            label="banque"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikDomBank.errors.banque && useFormikDomBank.touched.banque && useFormikDomBank.errors.banque}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'numcompte',
            headerName: 'N° de compte',
            type: 'text',
            sortable: true,
            width: 300,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            disableClickEventBubbling: true,
            editable: editableRowDomBank,
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: numCompteDomBankValidationColor
                            }}
                            type="text"
                            value={useFormikDomBank.values.numcompte}
                            onChange={(e) => useFormikDomBank.setFieldValue('numcompte', e.target.value)}
                            label="numcompte"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikDomBank.errors.numcompte && useFormikDomBank.touched.numcompte && useFormikDomBank.errors.numcompte}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'devise',
            headerName: 'Devise',
            type: 'text',
            sortable: true,
            width: 120,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            disableClickEventBubbling: true,
            editable: editableRowDomBank,
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '120%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: deviseDomBankValidationColor
                            }}
                            type="text"
                            value={useFormikDomBank.values.devise}
                            onChange={(e) => useFormikDomBank.setFieldValue('devise', e.target.value)}
                            label="devise"
                            disableUnderline={true}
                        />

                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikDomBank.errors.devise && useFormikDomBank.touched.devise && useFormikDomBank.errors.devise}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'pays',
            headerName: 'Pays',
            type: 'singleSelect',
            valueOptions: listPays?.map((pays) => pays.code),
            sortable: true,
            width: 250,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRowDomBank,
            valueFormatter: (params) => {
                const selectedType = listPays.find((option) => option.code === params.value);
                return selectedType ? selectedType.nompays : params.value;
            },

            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth>
                        <InputLabel><em>Choisir...</em></InputLabel>
                        <Select
                            style={{ backgroundColor: paysDomBankValidationColor }}
                            value={useFormikDomBank.values.pays}
                            onChange={(e) => handleChangePays(e.target.value)}
                            label="Pays"
                        >
                            {listPays?.map((option) => (
                                <MenuItem key={option.code} value={option.code}>
                                    {option.nompays}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText style={{ color: 'red' }}>
                            {useFormikDomBank.errors.pays && useFormikDomBank.touched.pays && useFormikDomBank.errors.pays}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'enactivite',
            headerName: 'En activité',
            type: 'boolean',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            headerClassName: 'HeaderbackColor',
            editable: editableRowDomBank,
            renderEditCell: (params) => {
                return (
                    <input
                        // value={formNewParam.values.active}
                        checked={useFormikDomBank.values.enactivite}
                        type="checkbox"
                        onChange={(e) => handleCheckboxChangeDomBank(e.target.checked)}
                    />
                );
            },
        },
    ];

    const handleCheckboxChangeDomBank = (value) => {
        useFormikDomBank.setFieldValue("enactivite", value);
    }

    //Choix du nom de pays
    const handleChangePays = (value) => {
        //const infosPays = listPays?.filter((row) => row.codePays === value);
        useFormikDomBank.setFieldValue('pays', value);
    }

    const saveSelectedRowDomBank = (ids) => {
        if (ids.length === 1) {
            setSelectedRowIdDomBank(ids);
            setDisableModifyBoutonDomBank(false);
            setDisableSaveBoutonDomBank(false);
            setDisableCancelBoutonDomBank(false);
            setDisableDeleteBoutonDomBank(false);
        } else {
            setSelectedRowIdDomBank([]);
            setDisableModifyBoutonDomBank(true);
            setDisableSaveBoutonDomBank(true);
            setDisableCancelBoutonDomBank(true);
            setDisableDeleteBoutonDomBank(true);
        }
    }

    const handleRowEditStopDomBank = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClickDomBank = (id) => () => {
        //réinitialiser les couleurs des champs
        setBankDomBankValidationColor('transparent');
        setNumCompteDomBankValidationColor('transparent');
        setDeviseDomBankValidationColor('transparent');
        setPaysDomBankValidationColor('transparent');

        //charger dans le formik les données de la ligne
        const selectedRowInfos = listDomBank?.filter((item) => item.id === id[0]);

        useFormikDomBank.setFieldValue("idCompte", compteId);
        useFormikDomBank.setFieldValue("idDossier", fileId);
        useFormikDomBank.setFieldValue("idDomBank", selectedRowInfos[0].id);
        useFormikDomBank.setFieldValue("banque", selectedRowInfos[0].banque);
        useFormikDomBank.setFieldValue("numcompte", selectedRowInfos[0].numcompte);
        useFormikDomBank.setFieldValue("devise", selectedRowInfos[0].devise);
        useFormikDomBank.setFieldValue("pays", selectedRowInfos[0].pays);
        useFormikDomBank.setFieldValue("enactivite", selectedRowInfos[0].enactivite);

        setRowModesModelDomBank({ ...rowModesModelDomBank, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBoutonDomBank(false);
    };

    const handleSaveClickDomBank = (id) => () => {
        let saveBoolbanque = false;
        let saveBoolNumCompte = false;
        let saveBoolDevise = false;
        let saveBoolPays = false;

        if (useFormikDomBank.values.banque === '') {
            setBankDomBankValidationColor('#F6D6D6');
            saveBoolbanque = false;
        } else {
            setBankDomBankValidationColor('transparent');
            saveBoolbanque = true;
        }

        if (!useFormikDomBank.values.numcompte) {
            setNumCompteDomBankValidationColor('#F6D6D6');
            saveBoolNumCompte = false;
        } else {
            setNumCompteDomBankValidationColor('transparent');
            saveBoolNumCompte = true;
        }

        if (!useFormikDomBank.values.devise) {
            setDeviseDomBankValidationColor('#F6D6D6');
            saveBoolDevise = false;
        } else {
            setDeviseDomBankValidationColor('transparent');
            saveBoolDevise = true;
        }

        if (!useFormikDomBank.values.pays) {
            setPaysDomBankValidationColor('#F6D6D6');
            saveBoolPays = false;
        } else {
            setPaysDomBankValidationColor('transparent');
            saveBoolPays = true;
        }

        if (saveBoolbanque && saveBoolNumCompte && saveBoolDevise && saveBoolPays) {
            setRowModesModelDomBank({ ...rowModesModelDomBank, [selectedRowIdDomBank]: { mode: GridRowModes.View } });
            axios.post(`/paramCrm/DomBank`, useFormikDomBank.values).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    setDisableSaveBoutonDomBank(true);

                    useFormikDomBank.resetForm();
                    getInfosDomBank(fileId);
                    toast.success(resData.msg);
                } else {
                    toast.error(resData.msg);
                }
            });
        } else {
            toast.error('Les champs en surbrillances sont obligatoires');
            setDisableSaveBoutonDomBank(false);
        }
    };

    const handleOpenDialogConfirmDeleteAssocieRowDomBank = () => {
        setOpenDialogDeleteDomBankRow(true);
    }

    const deleteDomBankRow = (value) => {
        if (value === true) {
            if (selectedRowIdDomBank.length === 1) {
                const idToDelete = selectedRowIdDomBank[0];
                axios.post(`/paramCrm/DomBankDelete`, { fileId, compteId, idToDelete }).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setOpenDialogDeleteDomBankRow(false);
                        setListDomBank(listDomBank.filter((row) => row.id !== selectedRowIdDomBank[0]));
                        toast.success(resData.msg);
                    } else {
                        setOpenDialogDeleteDomBankRow(false);
                        toast.error(resData.msg);
                    }
                });
            }
            setOpenDialogDeleteDomBankRow(false);
        } else {
            setOpenDialogDeleteDomBankRow(false);
        }
    }

    const handleCancelClickDomBank = (id) => () => {
        setRowModesModelDomBank({
            ...rowModesModelDomBank,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    const processRowUpdateDomBank = (setFieldValue) => (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setListDomBank(listDomBank.map((row) => (row.id === newRow.id ? updatedRow : row)));
        setFieldValue('listeDomBank', listDomBank.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChangeDomBank = (newRowModesModel) => {
        setRowModesModelDomBank(newRowModesModel);
    };

    const handleCellEditCommitDomBank = (params) => {
        if (selectedRowIdDomBank.length > 1 || selectedRowIdDomBank.length === 0) {
            setEditableRowDomBank(false);
            setDisableModifyBoutonDomBank(true);
            setDisableSaveBoutonDomBank(true);
            setDisableCancelBoutonDomBank(true);
            toast.error("sélectionnez une seule ligne pour pouvoir la modifier");
        } else {
            setDisableModifyBoutonDomBank(false);
            setDisableSaveBoutonDomBank(false);
            setDisableCancelBoutonDomBank(false);
            if (!selectedRowIdDomBank.includes(params.id)) {
                setEditableRowDomBank(false);
                toast.error("sélectionnez une ligne pour pouvoir la modifier");
            } else {
                setEditableRowDomBank(true);
            }
        }

    };

    //Ajouter une ligne dans le tableau liste domiciliation bancaires
    const handleOpenDialogAddNewDomBank = () => {
        const newId = -1 * (getMaxID(listDomBank) + 1);
        let arrayId = [];
        arrayId = [...arrayId, newId];

        useFormikDomBank.setFieldValue("idDomBank", newId);

        const newRow = {
            id: newId,
            banque: '',
            numcompte: '',
            devise: '',
            pays: '',
        };
        setListDomBank([...listDomBank, newRow]);
        // setSelectedRowIdDomBank(arrayId);
        // setRowModesModelDomBank({ ...rowModesModelDomBank, [arrayId]: { mode: GridRowModes.Edit } });
        // setDisableSaveBoutonDomBank(false);
    }

    //Choix TAB value-------------------------------------------------------------------------------------
    const handleChangeTAB = (event, newValue) => {
        setValue(newValue);
    };

    //Récupération de la liste des modèles de plan comptable
    const GetListePlanComptableModele = () => {
        axios.post(`/paramPlanComptableModele/model`, { compteId, userId }).then((response) => {
            const resData = response.data;
            setListModel(resData.modelList);
        });
    }

    useEffect(() => {
        GetListePlanComptableModele();
    }, [compteId]);

    //Données pour les listbox
    const listeFormeJuridique = [
        { id: 'SAPP', libelle: 'SAPP - Société anonyme à participation publique' },
        { id: 'SA', libelle: 'SA - Société anonyme' },
        { id: 'SAS', libelle: 'SAS - Société par action simplifiée' },
        { id: 'SARL', libelle: 'SARL - Société à responsabilité limitée' },
        { id: 'SARLU', libelle: 'SARLU - Société à responsabilité limitée unipersonnel' },
        { id: 'SCS', libelle: 'SCS - Société en commandité simple' },
        { id: 'SNC', libelle: 'SNC - Société en nom collectif' },
        { id: 'SP', libelle: 'SP - Société en participation' },
    ];

    const listeActivite = [
        { id: 'ART', libelle: 'Artisanale', icon: <FaTools style={{ color: 'green' }} /> },
        { id: 'IND', libelle: 'Industrielle', icon: <FaIndustry style={{ color: 'green' }} /> },
        { id: 'MIN', libelle: 'Minière', icon: <GiMineWagon style={{ color: 'green' }} /> },
        { id: 'HOT', libelle: 'Hôtelière', icon: <FaHotel style={{ color: 'green' }} /> },
        { id: 'TOU', libelle: 'Touristique', icon: <MdOutlineTravelExplore style={{ color: 'green' }} /> },
        { id: 'TRA', libelle: 'Transport', icon: <FaTruck style={{ color: 'green' }} /> },
        { id: 'AUT', libelle: 'Autres', icon: <VscLinkExternal style={{ color: 'green' }} /> },
    ];

    const handleOnChangeFormeSelect = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('forme', value);
        setFieldValue('idCompte', compteId);
        setFieldValue('action', 'new');
    }

    const handleOnChangeActiviteSelect = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('activite', value);
    }

    const handleOnChangePlanComptableSelect = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('plancomptable', value);
    }

    //submit les informations du nouveau dossier
    const handlSubmitModification = (values) => {
        axios.post(`/paramCrm/modifying`, values).then((response) => {
            const resData = response.data;
            if (resData.state) {
                toast.success(resData.msg);
            } else {
                toast.error(resData.msg);
            }
            //closed();
        });
    }

    return (
        <Paper sx={{ elevation: "3", margin: "5px", padding: "10px", width: "98%", height: "100%" }}>
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
                <TabPanel value="1">
                    {/* MODAL POUR LA SUPPRESSION D'UNE LIGNE DU TABLEAU ASSOCIE */}
                    {openDialogDeleteAssocieRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"} confirmationState={deleteAssocieRow} /> : null}

                    {/* MODAL POUR LA SUPPRESSION D'UNE LIGNE DU TABLEAU FILIALE */}
                    {openDialogDeleteFilialeRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"} confirmationState={deleteFilialeRow} /> : null}

                    {/* MODAL POUR LA SUPPRESSION D'UNE LIGNE DU TABLEAU DOMICILIATION BANCAIRE */}
                    {openDialogDeleteDomBankRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"} confirmationState={deleteDomBankRow} /> : null}
                    <Formik
                        initialValues={InfosNewFileInitialValues}
                        validationSchema={formInfosNewFileValidationSchema}
                        onSubmit={(values) => {
                            handlSubmitModification(values);
                        }}
                    >
                        {({ handleChange, handleSubmit, setFieldValue, resetForm, values }) => {
                            useEffect(() => {
                                const id = fileId;
                                axios.get(`/paramCrm/infoscrm/${id}`).then((response) => {
                                    const resData = response.data;
                                    if (resData.state) {
                                        setCrm(resData.list);
                                        const crmData = resData.list;

                                        setFieldValue('action', 'modify');
                                        setFieldValue('itemId', crmData.id);
                                        setFieldValue('idDossier', crmData.id);
                                        setFieldValue('idCompte', crmData.id_compte);
                                        setFieldValue('nomdossier', crmData.dossier);
                                        setFieldValue('raisonsociale', crmData.raisonsociale);
                                        setFieldValue('denomination', crmData.denomination);
                                        setFieldValue('nif', crmData.nif);
                                        setFieldValue('stat', crmData.stat);
                                        setFieldValue('rcs', crmData.rcs);
                                        setFieldValue('responsable', crmData.responsable);
                                        setFieldValue('expertcomptable', crmData.expertcomptable);
                                        setFieldValue('cac', crmData.cac);
                                        setFieldValue('forme', crmData.formejuridique);
                                        setFieldValue('activite', crmData.activite);
                                        setFieldValue('detailsactivite', crmData.detailactivite);
                                        setFieldValue('adresse', crmData.adresse);
                                        setFieldValue('email', crmData.email);
                                        setFieldValue('telephone', crmData.telephone);
                                        setFieldValue('plancomptable', crmData.id_plancomptable);
                                        setFieldValue('longueurcptstd', crmData.longcomptestd);
                                        setFieldValue('longueurcptaux', crmData.longcompteaux);
                                        setFieldValue('autocompletion', crmData.autocompletion);
                                        setFieldValue('avecanalytique', crmData.avecanalytique);
                                        setFieldValue('tauxir', crmData.tauxir);
                                        setFieldValue('assujettitva', crmData.assujettitva);
                                        setFieldValue('montantcapital', crmData.capital);
                                        setFieldValue('nbrpart', crmData.nbrpart);
                                        setFieldValue('valeurpart', crmData.valeurpart);

                                    } else {
                                        setCrm([]);
                                    }
                                })

                            }, [fileId]);

                            return (
                                <Form style={{ width: '100%' }}>
                                    <Stack width={"100%"} height={"85%"} spacing={2} alignItems={"flex-start"} justifyContent={"stretch"}>
                                        <Stack width={"100%"} height={"30px"} spacing={2} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} justifyContent={"right"}
                                        >
                                            <Typography variant='h6' sx={{ color: "black", width: 'calc(100% - 120px)' }} align='left'>Paramétrages: CRM</Typography>
                                            <Button variant="contained"
                                                onClick={handleSubmit}
                                                style={{
                                                    borderRadius: "0",
                                                    height: '43px', marginLeft: "5px", width: '120px',
                                                    textTransform: 'none', outline: 'none', border: 'none', backgroundColor: initial.theme
                                                }}
                                            >
                                                Enregistrer
                                            </Button>
                                        </Stack>

                                        <Box sx={{ width: '100%', typography: 'body1' }}>
                                            <TabContext value={value}>
                                                <Box sx={{ borderBottom: 1, borderColor: 'transparent' }}>
                                                    <TabList onChange={handleChangeTAB} aria-label="lab API tabs example" variant='scrollable'>
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="infos société" value="1" />
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="comptabilité" value="2" />
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="fiscales" value="3" />
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Associés" value="4" />
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Filiales" value="5" />
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Domiciliations bancaires" value="6" />
                                                    </TabList>
                                                </Box>

                                                <TabPanel value="1">
                                                    <Stack width={"100%"} height={"100%"} spacing={1} alignItems={"flex-start"}
                                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                                        <Accordion elevation={0} style={{ width: "100%", borderBlockColor: "transparent" }}>
                                                            <AccordionSummary
                                                                expandIcon={<MdExpandCircleDown style={{ width: "25px", height: "25px", color: '#44D5F0' }} />}
                                                                aria-controls="panel1-content"
                                                                id="panel1-header"
                                                                style={{ flexDirection: "row-reverse" }}
                                                            >
                                                                <Typography style={{ fontWeight: 'normal', fontSize: "20px", marginLeft: "10px" }}>Coordonnées</Typography>
                                                            </AccordionSummary>

                                                            <AccordionDetails>
                                                                <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"}
                                                                    alignContent={"flex-start"} justifyContent={"stretch"} direction={"column"}
                                                                    marginLeft={"50px"}
                                                                >
                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="nomdossier" style={{ fontSize: 12, color: '#3FA2F6' }}>Nom du dossier</label>
                                                                        <Field
                                                                            required
                                                                            //value={values.nomdossier}
                                                                            name='nomdossier'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '400px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='nomdossier' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="raisonsociale" style={{ fontSize: 12, color: '#3FA2F6' }}>Raison sociale</label>
                                                                        <Field
                                                                            required
                                                                            name='raisonsociale'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '600px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='raisonsociale' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="denomination" style={{ fontSize: 12, color: '#3FA2F6' }}>Dénomination</label>
                                                                        <Field
                                                                            required
                                                                            name='denomination'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '600px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='denomination' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack width={"100%"} height={"30px"} spacing={20} alignItems={"center"}
                                                                        alignContent={"center"} justifyContent={"stretch"} direction={"row"}
                                                                    >
                                                                        <Stack spacing={1}>
                                                                            <label htmlFor="nif" style={{ fontSize: 12, color: '#3FA2F6' }}>Numéro NIF</label>
                                                                            <Field
                                                                                required
                                                                                name='nif'
                                                                                onChange={handleChange}
                                                                                type='text'
                                                                                placeholder=""
                                                                                style={{
                                                                                    height: 22, borderTop: 'none',
                                                                                    borderLeft: 'none', borderRight: 'none',
                                                                                    outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                    width: '200px'
                                                                                }}
                                                                            />
                                                                            <ErrorMessage name='nif' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                        </Stack>

                                                                        <Stack spacing={1}>
                                                                            <label htmlFor="stat" style={{ fontSize: 12, color: '#3FA2F6' }}>Numéro Statistique</label>
                                                                            <Field
                                                                                required
                                                                                name='stat'
                                                                                onChange={handleChange}
                                                                                type='text'
                                                                                placeholder=""
                                                                                style={{
                                                                                    height: 22, borderTop: 'none',
                                                                                    borderLeft: 'none', borderRight: 'none',
                                                                                    outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                    width: '200px'
                                                                                }}
                                                                            />
                                                                            <ErrorMessage name='stat' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                        </Stack>

                                                                        <Stack spacing={1}>
                                                                            <label htmlFor="rcs" style={{ fontSize: 12, color: '#3FA2F6' }}>Numéro Rcs</label>
                                                                            <Field
                                                                                required
                                                                                name='rcs'
                                                                                onChange={handleChange}
                                                                                type='text'
                                                                                placeholder=""
                                                                                style={{
                                                                                    height: 22, borderTop: 'none',
                                                                                    borderLeft: 'none', borderRight: 'none',
                                                                                    outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                    width: '200px'
                                                                                }}
                                                                            />
                                                                            <ErrorMessage name='rcs' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                        </Stack>

                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="responsable" style={{ fontSize: 12, color: '#3FA2F6' }}>Responsable</label>
                                                                        <Field
                                                                            required
                                                                            name='responsable'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '400px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='responsable' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="expertcomptable" style={{ fontSize: 12, color: '#3FA2F6' }}>Expert comptable</label>
                                                                        <Field
                                                                            required
                                                                            name='expertcomptable'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '400px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='expertcomptable' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="cac" style={{ fontSize: 12, color: '#3FA2F6' }}>Commissaire aux comptes</label>
                                                                        <Field
                                                                            required
                                                                            name='cac'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '400px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='cac' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                </Stack>

                                                            </AccordionDetails>
                                                        </Accordion>

                                                        <Accordion elevation={0} style={{ width: "100%", borderBlockColor: "transparent" }}>
                                                            <AccordionSummary
                                                                expandIcon={<MdExpandCircleDown style={{ width: "25px", height: "25px", color: '#44D5F0' }} />}
                                                                aria-controls="panel1-content"
                                                                id="panel1-header"
                                                                style={{ flexDirection: "row-reverse" }}
                                                            >
                                                                <Typography style={{ fontWeight: 'normal', fontSize: "20px", marginLeft: "10px" }}>Juridique</Typography>
                                                            </AccordionSummary>

                                                            <AccordionDetails>
                                                                <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"}
                                                                    alignContent={"flex-start"} justifyContent={"stretch"} direction={"column"}
                                                                    style={{ marginLeft: "50px" }}
                                                                >
                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="forme" style={{ fontSize: 12, color: '#3FA2F6' }}>Forme</label>
                                                                        <Field
                                                                            as={Select}
                                                                            required
                                                                            //value={values.forme}
                                                                            name='forme'
                                                                            type='text'
                                                                            placeholder=""
                                                                            onChange={handleOnChangeFormeSelect(setFieldValue)}
                                                                            sx={{
                                                                                borderRadius: 0,
                                                                                width: 500,
                                                                                height: 40,
                                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                                    borderTop: 'none', // Supprime le cadre
                                                                                    borderLeft: 'none',
                                                                                    borderRight: 'none',
                                                                                    borderWidth: '0.5px'
                                                                                },
                                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                                    borderTop: 'none', // Supprime le cadre
                                                                                    borderLeft: 'none',
                                                                                    borderRight: 'none',
                                                                                    borderWidth: '0.5px'
                                                                                },
                                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                                    borderTop: 'none', // Supprime le cadre
                                                                                    borderLeft: 'none',
                                                                                    borderRight: 'none',
                                                                                    borderWidth: '0.5px'
                                                                                },
                                                                            }}
                                                                        >
                                                                            {listeFormeJuridique.sort((a, b) => a.libelle.localeCompare(b.libelle)).map((item) => (
                                                                                <MenuItem key={item.id} value={item.id}>{item.libelle}</MenuItem>
                                                                            ))};
                                                                        </Field>
                                                                        <ErrorMessage name='forme' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="activite" style={{ fontSize: 12, color: '#3FA2F6' }}>Activité</label>
                                                                        <Field
                                                                            as={Select}
                                                                            required
                                                                            //value={values.activite}
                                                                            name='activite'
                                                                            type='text'
                                                                            placeholder=""
                                                                            onChange={handleOnChangeActiviteSelect(setFieldValue)}
                                                                            sx={{
                                                                                borderRadius: 0,
                                                                                width: 250,
                                                                                height: 40,
                                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                                    borderTop: 'none', // Supprime le cadre
                                                                                    borderLeft: 'none',
                                                                                    borderRight: 'none',
                                                                                    borderWidth: '0.5px'
                                                                                },
                                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                                    borderTop: 'none', // Supprime le cadre
                                                                                    borderLeft: 'none',
                                                                                    borderRight: 'none',
                                                                                    borderWidth: '0.5px'
                                                                                },
                                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                                    borderTop: 'none', // Supprime le cadre
                                                                                    borderLeft: 'none',
                                                                                    borderRight: 'none',
                                                                                    borderWidth: '0.5px'
                                                                                },
                                                                            }}
                                                                        >
                                                                            {listeActivite.sort((a, b) => a.libelle.localeCompare(b.libelle)).map((item) => (
                                                                                <MenuItem key={item.id} value={item.id}>
                                                                                    <Stack direction={'row'} spacing={2}
                                                                                        style={{ alignContent: 'center', alignItems: 'center' }}
                                                                                    >
                                                                                        <Stack direction={'row'}>
                                                                                            {item.icon}
                                                                                        </Stack>

                                                                                        <Stack direction={'row'}>
                                                                                            {item.libelle}
                                                                                        </Stack>
                                                                                    </Stack>

                                                                                </MenuItem>
                                                                            ))};
                                                                        </Field>
                                                                        <ErrorMessage name='activite' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="detailsactivite" style={{ fontSize: 12, color: '#3FA2F6' }}>Détails activités</label>
                                                                        <Field
                                                                            required
                                                                            name='detailsactivite'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '400px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='detailsactivite' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>
                                                                </Stack>
                                                            </AccordionDetails>
                                                        </Accordion>

                                                        <Accordion elevation={0} style={{ width: "100%", borderBlockColor: "transparent" }}>
                                                            <AccordionSummary
                                                                expandIcon={<MdExpandCircleDown style={{ width: "25px", height: "25px", color: '#44D5F0' }} />}
                                                                aria-controls="panel1-content"
                                                                id="panel1-header"
                                                                style={{ flexDirection: "row-reverse" }}
                                                            >
                                                                <Typography style={{ fontWeight: 'normal', fontSize: "20px", marginLeft: "10px" }}>Contact</Typography>
                                                            </AccordionSummary>

                                                            <AccordionDetails>
                                                                <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"}
                                                                    alignContent={"flex-start"} justifyContent={"stretch"} direction={"column"}
                                                                    style={{ marginLeft: "50px" }}
                                                                >
                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="adresse" style={{ fontSize: 12, color: '#3FA2F6' }}>Adresse</label>
                                                                        <Field
                                                                            required
                                                                            name='adresse'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '600px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='adresse' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="email" style={{ fontSize: 12, color: '#3FA2F6' }}>Email</label>
                                                                        <Field
                                                                            required
                                                                            name='email'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '400px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='email' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>

                                                                    <Stack spacing={1}>
                                                                        <label htmlFor="telephone" style={{ fontSize: 12, color: '#3FA2F6' }}>Téléphone</label>
                                                                        <Field
                                                                            required
                                                                            name='telephone'
                                                                            onChange={handleChange}
                                                                            type='text'
                                                                            placeholder=""
                                                                            style={{
                                                                                height: 22, borderTop: 'none',
                                                                                borderLeft: 'none', borderRight: 'none',
                                                                                outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                                width: '200px'
                                                                            }}
                                                                        />
                                                                        <ErrorMessage name='telephone' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                                    </Stack>
                                                                </Stack>

                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </Stack>
                                                </TabPanel>

                                                <TabPanel value="2">
                                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                                    >
                                                        <Stack spacing={1}>
                                                            <label htmlFor="plancomptable" style={{ fontSize: 12, color: '#3FA2F6' }}>Plan comptable</label>
                                                            <Field
                                                                disabled
                                                                as={Select}
                                                                required
                                                                //value = {values.plancomptable}
                                                                name='plancomptable'
                                                                type='text'
                                                                placeholder=""
                                                                onChange={handleOnChangePlanComptableSelect(setFieldValue)}
                                                                sx={{
                                                                    borderRadius: 0,
                                                                    width: 300,
                                                                    height: 40,
                                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                                        borderTop: 'none', // Supprime le cadre
                                                                        borderLeft: 'none',
                                                                        borderRight: 'none',
                                                                        borderWidth: '0.5px'
                                                                    },
                                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                        borderTop: 'none', // Supprime le cadre
                                                                        borderLeft: 'none',
                                                                        borderRight: 'none',
                                                                        borderWidth: '0.5px'
                                                                    },
                                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                        borderTop: 'none', // Supprime le cadre
                                                                        borderLeft: 'none',
                                                                        borderRight: 'none',
                                                                        borderWidth: '0.5px'
                                                                    },
                                                                }}
                                                            >
                                                                <MenuItem key={0} value={0}><em>Aucun</em></MenuItem>
                                                                {listModel?.map((item) => (
                                                                    <MenuItem key={item.id} value={item.id}>{item.nom}</MenuItem>
                                                                ))};
                                                            </Field>
                                                            <ErrorMessage name='plancomptable' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                        </Stack>

                                                        <Typography style={{ fontWeight: 'bold', fontSize: "18px", marginLeft: "0px", marginTop: "50px" }}>Paramétrages de longueur des comptes</Typography>

                                                        <Stack width={"100%"} height={"30px"} spacing={10} alignItems={"center"}
                                                            alignContent={"center"} justifyContent={"stretch"} direction={"row"}
                                                            style={{ marginLeft: "0px" }}
                                                        >
                                                            <Stack spacing={1}>
                                                                <label htmlFor="longueurcptstd" style={{ fontSize: 12, color: '#3FA2F6' }}>Compte standard</label>
                                                                <Field
                                                                    required
                                                                    name='longueurcptstd'
                                                                    onChange={handleChange}
                                                                    type='text'
                                                                    placeholder=""
                                                                    style={{
                                                                        height: 22, borderTop: 'none',
                                                                        borderLeft: 'none', borderRight: 'none',
                                                                        outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                        width: '200px'
                                                                    }}
                                                                />
                                                                <ErrorMessage name='longueurcptstd' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                            </Stack>

                                                            <Stack spacing={1}>
                                                                <label htmlFor="longueurcptaux" style={{ fontSize: 12, color: '#3FA2F6' }}>Compte auxiliaire</label>
                                                                <Field
                                                                    required
                                                                    name='longueurcptaux'
                                                                    onChange={handleChange}
                                                                    type='text'
                                                                    placeholder=""
                                                                    style={{
                                                                        height: 22, borderTop: 'none',
                                                                        borderLeft: 'none', borderRight: 'none',
                                                                        outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                        width: '200px',
                                                                    }}
                                                                />
                                                                <ErrorMessage name='longueurcptaux' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                            </Stack>

                                                            <Stack spacing={0} direction={'row'}
                                                                style={{ alignItems: 'center' }}
                                                            >
                                                                <Field
                                                                    required
                                                                    name='autocompletion'
                                                                    type='checkbox'
                                                                    placeholder=""
                                                                    style={{
                                                                        height: 20, borderTop: 'none',
                                                                        borderLeft: 'none', borderRight: 'none',
                                                                        outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                        width: 20, marginRight: 10
                                                                    }}
                                                                />
                                                                <label htmlFor="autocompletion" style={{ fontSize: 15, color: 'black' }}>Auto-complétion</label>
                                                                <ErrorMessage name='autocompletion' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                            </Stack>
                                                        </Stack>

                                                        <Stack spacing={0} direction={'row'}
                                                            style={{ alignItems: 'center', marginTop: 40 }}
                                                        >
                                                            <Field
                                                                required
                                                                name='avecanalytique'
                                                                type='checkbox'
                                                                placeholder=""
                                                                style={{
                                                                    height: 20, borderTop: 'none',
                                                                    borderLeft: 'none', borderRight: 'none',
                                                                    outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                    width: 20, marginRight: 10,
                                                                }}
                                                            />
                                                            <label htmlFor="avecanalytique" style={{ fontSize: 15, color: 'black' }}>Avec analytique</label>
                                                            <ErrorMessage name='avecanalytique' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                        </Stack>
                                                    </Stack>
                                                </TabPanel>

                                                <TabPanel value="3">
                                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                                        alignContent={"flex-start"} justifyContent={"stretch"} marginLeft={"20px"}
                                                    >
                                                        <Stack spacing={1}>
                                                            <label htmlFor="tauxir" style={{ fontSize: 12, color: '#3FA2F6' }}>Taux IR</label>
                                                            <Field
                                                                required
                                                                name='tauxir'
                                                                onChange={handleChange}
                                                                type='text'
                                                                placeholder=""
                                                                style={{
                                                                    height: 22, borderTop: 'none',
                                                                    borderLeft: 'none', borderRight: 'none',
                                                                    outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                    width: '100px',
                                                                }}
                                                            />
                                                            <ErrorMessage name='tauxir' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                        </Stack>

                                                        <Stack spacing={0} direction={'row'}
                                                            style={{ alignItems: 'center', marginTop: 40 }}
                                                        >
                                                            <Field
                                                                required
                                                                name='assujettitva'
                                                                type='checkbox'
                                                                placeholder=""
                                                                style={{
                                                                    height: 20, borderTop: 'none',
                                                                    borderLeft: 'none', borderRight: 'none',
                                                                    outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                    width: 20, marginRight: 10,
                                                                }}
                                                            />
                                                            <label htmlFor="assujettitva" style={{ fontSize: 15, color: 'black' }}>Assujettie à la TVA</label>
                                                            <ErrorMessage name='assujettitva' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                        </Stack>
                                                    </Stack>
                                                </TabPanel>

                                                <TabPanel value="4">
                                                    <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"}
                                                        alignContent={"flex-start"} justifyContent={"stretch"} marginLeft={"20px"}
                                                    >
                                                        <Stack width={"100%"} height={"30px"} spacing={10} alignItems={"center"}
                                                            alignContent={"center"} justifyContent={"stretch"} direction={"row"}
                                                        >
                                                            <Stack spacing={1}>
                                                                <label htmlFor="montantcapital" style={{ fontSize: 12, color: '#3FA2F6' }}>Capitale</label>
                                                                <Field
                                                                    required
                                                                    name='montantcapital'
                                                                    onChange={handleChange}
                                                                    type='text'
                                                                    placeholder=""
                                                                    style={{
                                                                        height: 22, borderTop: 'none',
                                                                        borderLeft: 'none', borderRight: 'none',
                                                                        outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                        width: '200px',
                                                                    }}
                                                                />
                                                                <ErrorMessage name='montantcapital' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                            </Stack>

                                                            <Stack spacing={1}>
                                                                <label htmlFor="nbrpart" style={{ fontSize: 12, color: '#3FA2F6' }}>Nombre parts</label>
                                                                <Field
                                                                    required
                                                                    name='nbrpart'
                                                                    onChange={handleChange}
                                                                    type='text'
                                                                    placeholder=""
                                                                    style={{
                                                                        height: 22, borderTop: 'none',
                                                                        borderLeft: 'none', borderRight: 'none',
                                                                        outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                        width: '100px',
                                                                    }}
                                                                />
                                                                <ErrorMessage name='nbrpart' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                            </Stack>

                                                            <Stack spacing={1}>
                                                                <label htmlFor="valeurpart" style={{ fontSize: 12, color: '#3FA2F6' }}>Valeur d'une part</label>
                                                                <Field
                                                                    disabled
                                                                    name='valeurpart'
                                                                    onChange={handleChange}
                                                                    type='text'
                                                                    placeholder=""
                                                                    style={{
                                                                        height: 22, borderTop: 'none',
                                                                        borderLeft: 'none', borderRight: 'none',
                                                                        outline: 'none', fontSize: 14, borderWidth: '0.5px',
                                                                        width: '150px',
                                                                    }}
                                                                />
                                                                <ErrorMessage name='valeurpart' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                            </Stack>

                                                        </Stack>

                                                        <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                            direction={"row"} justifyContent={"right"}
                                                        >
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
                                                                        disabled={disableSaveBouton}
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

                                                        <Stack width={"100%"} height={'50vh'}>
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
                                                                rows={listAssocie}
                                                                onRowClick={(e) => handleCellEditCommit(e.row)}
                                                                onRowSelectionModelChange={ids => {
                                                                    saveSelectedRow(ids);
                                                                }}
                                                                editMode='row'
                                                                rowModesModel={rowModesModel}
                                                                onRowModesModelChange={handleRowModesModelChange}
                                                                onRowEditStop={handleRowEditStop}
                                                                processRowUpdate={processRowUpdate(setFieldValue)}

                                                                columns={AssocieColumnHeader}
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

                                                <TabPanel value="5">
                                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                                    >
                                                        <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                            direction={"row"} justifyContent={"right"}
                                                        >
                                                            <Tooltip title="Ajouter une ligne">
                                                                <IconButton
                                                                    variant="contained"
                                                                    onClick={handleOpenDialogAddNewFiliale}
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
                                                                    disabled={disableModifyBoutonFiliale}
                                                                    variant="contained"
                                                                    onClick={handleEditClickFiliale(selectedRowIdFiliale)}
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
                                                                        disabled={disableSaveBoutonFiliale}
                                                                        variant="contained"
                                                                        onClick={handleSaveClickFiliale(selectedRowIdFiliale)}
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
                                                                        disabled={disableCancelBoutonFiliale}
                                                                        variant="contained"
                                                                        onClick={handleCancelClickFiliale(selectedRowIdFiliale)}
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
                                                                        disabled={disableDeleteBoutonFiliale}
                                                                        onClick={handleOpenDialogConfirmDeleteAssocieRowFiliale}
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

                                                        <Stack width={"100%"} height={'60vh'}>
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
                                                                rows={listFiliales}
                                                                onRowClick={(e) => handleCellEditCommitFiliale(e.row)}
                                                                onRowSelectionModelChange={ids => {
                                                                    saveSelectedRowFiliale(ids);
                                                                }}
                                                                editMode='row'
                                                                rowModesModel={rowModesModelFiliale}
                                                                onRowModesModelChange={handleRowModesModelChangeFiliale}
                                                                onRowEditStop={handleRowEditStopFiliale}
                                                                processRowUpdate={processRowUpdateFiliale(setFieldValue)}

                                                                columns={FilialeColumnHeader}
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

                                                <TabPanel value="6">
                                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                                    >
                                                        <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                            direction={"row"} justifyContent={"right"}
                                                        >
                                                            <Tooltip title="Ajouter une ligne">
                                                                <IconButton
                                                                    variant="contained"
                                                                    onClick={handleOpenDialogAddNewDomBank}
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
                                                                    disabled={disableModifyBoutonDomBank}
                                                                    variant="contained"
                                                                    onClick={handleEditClickDomBank(selectedRowIdDomBank)}
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
                                                                        disabled={disableSaveBoutonDomBank}
                                                                        variant="contained"
                                                                        onClick={handleSaveClickDomBank(selectedRowIdDomBank)}
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
                                                                        disabled={disableCancelBoutonDomBank}
                                                                        variant="contained"
                                                                        onClick={handleCancelClickDomBank(selectedRowIdDomBank)}
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
                                                                        disabled={disableDeleteBoutonDomBank}
                                                                        onClick={handleOpenDialogConfirmDeleteAssocieRowDomBank}
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

                                                        <Stack width={"100%"} height={'60vh'}>
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
                                                                rows={listDomBank}
                                                                onRowClick={(e) => handleCellEditCommitDomBank(e.row)}
                                                                onRowSelectionModelChange={ids => {
                                                                    saveSelectedRowDomBank(ids);
                                                                }}
                                                                editMode='row'
                                                                selectionModel={selectedRowIdDomBank}
                                                                rowModesModel={rowModesModelDomBank}
                                                                onRowModesModelChange={handleRowModesModelChangeDomBank}
                                                                onRowEditStop={handleRowEditStopDomBank}
                                                                processRowUpdate={processRowUpdateDomBank(setFieldValue)}

                                                                columns={DomBankColumnHeader}
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
                                    </Stack>

                                </Form>
                            );
                        }}
                    </Formik>
                </TabPanel>
            </TabContext>

        </Paper>
    )
}
