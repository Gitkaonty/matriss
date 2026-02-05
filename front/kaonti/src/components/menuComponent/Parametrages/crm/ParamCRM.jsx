import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Tooltip, Button, IconButton, FormHelperText, Input, Autocomplete, Checkbox, RadioGroup, Radio, Grid } from '@mui/material';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { MdExpandCircleDown } from 'react-icons/md';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import FormControlLabel from '@mui/material/FormControlLabel';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../../config/axios';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import toast from 'react-hot-toast';
import { useFormik, Field, Formik, Form, ErrorMessage } from 'formik';
import { init } from '../../../../../init';
import { VscLinkExternal } from 'react-icons/vsc';
import { FaTools } from 'react-icons/fa';
import { FaHotel, FaRegPenToSquare } from 'react-icons/fa6';
import { FaIndustry } from 'react-icons/fa6';
import { GiMineWagon } from 'react-icons/gi';
import { FaTruck } from 'react-icons/fa6';
import { MdOutlineTravelExplore } from 'react-icons/md';
import { VscClose } from 'react-icons/vsc';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';

import { TfiSave } from 'react-icons/tfi';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes, useGridApiRef } from '@mui/x-data-grid';
import { TbPlaylistAdd } from 'react-icons/tb';
import { IoMdTrash } from 'react-icons/io';
import MontantCapitalField from '../../home/Field/MontantCapitalField';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../../config/axiosPrivate';
import PasswordField from '../../home/Field/PasswordField';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
export default function ParamCRM() {
    const apiRef = useGridApiRef();
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const axiosPrivate = useAxiosPrivate();
    // État pour le type de centre fiscal (DGE ou centre fiscale)
    const [typeCentre, setTypeCentre] = useState('DGE');
    //Choix TAB value-------------------------------------------------------------------------------------
    const [valueEbilan, setValueEbilan] = useState('1');
    const navigate = useNavigate();
    //récupération information du dossier sélectionné
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [password, setPassword] = useState('');
    const [listModel, setListModel] = useState([]);



    const [listAssocie, setListAssocie] = useState([]);
    const [listFiliales, setListFiliales] = useState([]);
    const [listDomBank, setListDomBank] = useState([]);
    const [listPays, setListPays] = useState([]);
    const initial = init[0];
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);
    const [listeDossier, setListeDossier] = useState([]);
    const [listConsolidation, setListConsolidation] = useState([]);
    const selectedDossierIds = listConsolidation
        .map(val => Number(val.id_dossier_autre))
        .filter(Boolean);
    const availableDossier = listeDossier.filter(d =>
        !selectedDossierIds.includes(Number(d.id)) && (Number(d.id) !== Number(id))
    );
    const [selectedRowIdConsolidation, setSelectedRowIdConsolidation] = useState([]);
    const [rowModesModelConsolidation, setRowModesModelConsolidation] = useState({});
    const [disableModifyBoutonConsolidation, setDisableModifyBoutonConsolidation] = useState(true);
    const [disableCancelBoutonConsolidation, setDisableCancelBoutonConsolidation] = useState(true);
    const [disableSaveBoutonConsolidation, setDisableSaveBoutonConsolidation] = useState(true);
    const [disableDeleteBoutonConsolidation, setDisableDeleteBoutonConsolidation] = useState(true);
    const [disableAddRowBoutonConsolidation, setDisableAddRowBoutonConsolidation] = useState(false);
    const [editableRowConsolidation, setEditableRowConsolidation] = useState(true);
    const [openDialogDeleteConsolidationRow, setOpenDialogDeleteConsolidationRow] = useState(false);
    const [selectedRowConsolidations, setSelectedRowConsolidations] = useState([]);
    const [editableRow, setEditableRow] = useState(true);
    const [disableModifyBoutonDomBank, setDisableModifyBoutonDomBank] = useState(true);
    const [disableCancelBoutonDomBank, setDisableCancelBoutonDomBank] = useState(true);
    const [disableSaveBoutonDomBank, setDisableSaveBoutonDomBank] = useState(true);
    const [disableDeleteBoutonDomBank, setDisableDeleteBoutonDomBank] = useState(true);
    const [openDialogDeleteAssocieRow, setOpenDialogDeleteAssocieRow] = useState(false);
    const [selectedRowIdFiliale, setSelectedRowIdFiliale] = useState([]);
    const [rowModesModelFiliale, setRowModesModelFiliale] = useState({});
    const [disableModifyBoutonFiliale, setDisableModifyBoutonFiliale] = useState(true);
    const [disableCancelBoutonFiliale, setDisableCancelBoutonFiliale] = useState(true);
    const [disableSaveBoutonFiliale, setDisableSaveBoutonFiliale] = useState(true);
    const [disableDeleteBoutonFiliale, setDisableDeleteBoutonFiliale] = useState(true);
    const [disableAddRowBoutonFiliale, setDisableAddRowBoutonFiliale] = useState(false);
    const [listePortefeuille, setListePortefeuille] = useState([]);
    const [listeDevise, setListeDevises] = useState([]);
    const [editableRowFiliale, setEditableRowFiliale] = useState(true);
    const [openDialogDeleteFilialeRow, setOpenDialogDeleteFilialeRow] = useState(false);
    const [selectedRowIdDomBank, setSelectedRowIdDomBank] = useState([]);
    const [rowModesModelDomBank, setRowModesModelDomBank] = useState({});
    const [editableRowDomBank, setEditableRowDomBank] = useState(true);
    const [openDialogDeleteDomBankRow, setOpenDialogDeleteDomBankRow] = useState(false);
    const [selectedRowAssocie, setSelectedRowAssocie] = useState([]);
    const [selectedRowFiliales, setSelectedRowFiliales] = useState([]);
    const [selectedRowDomBancaires, setSelectedRowDomBancaires] = useState([]);
    const [crm, setCrm] = useState([]);
    const [selectedRowDomBank, setSelectedRowDomBank] = useState([]);
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
    //récupérer la liste des pays 
    const getListePays = async () => {
        await axios.get(`/paramCrm/getListePays/`).then((response) => {
            const resData = response.data
            if (resData.state) {
                setListPays(resData.list);
            } else {
                setListPays([]);
            }
        });
    }
    // Récupération de la liste des devises
    const getDevises = async () => {
        await axios.get(`/devises/devise/compte/${compteId}/${id}`).then((reponse => {
            const resData = reponse.data;
            setListeDevises(resData);
        }))

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

    //useFormik pour le tableau consolidation
    const useFormikConsolidation = useFormik({
        initialValues: {

            idConsolidation: '',
            idCompte: compteId,

            idDossier: fileId,



            idDossierAutre: ''



        },



        validateOnChange: false,



        validateOnBlur: true,



    })
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



        pourcentageca: 0,



        montantmin: 0,



        assujettitva: false,



        montantcapital: null,



        nbrpart: 0,



        valeurpart: 0,



        listeAssocies: [],



        listeFiliales: [],



        listeDomBank: [],



        compteisi: '',



        immo_amort_base_jours: '365',



        portefeuille: [],



        typecomptabilite: 'Français',



        devisepardefaut: 0,



        consolidation: false,



        listeConsolidation: [],



        pays: '',



        avecMotDePasse: false,



        motDePasse: '',



        motDePasseConfirmation: ''



    };

    const fieldOrder = [



        'nomdossier',



        'raisonsociale',



        'forme',



        'activite',



        'longueurcptstd',



        'longueurcptaux',



        'tauxir',



        'portefeuille',



        'pays',



        'motDePasse',



        'motDePasseConfirmation'



    ]

    const getFirstErrorField = (errors, fieldOrder) => {



        return fieldOrder.find(field => errors[field]);



    };

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



            flex: 1,



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
            flex: 1,
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



            flex: 1,



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



            flex: 1,



            headerAlign: 'left',



            align: 'left',



            headerClassName: 'HeaderbackColor',



            editable: editableRow,



            valueGetter: (params) => {



                if (!params.value) return null;



                return new Date(params.value);



            },



            renderCell: (params) => {



                if (!params.value) return '';



                const date = new Date(params.value);



                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;



            },



            renderEditCell: (params) => {



                const { id, field, value, api } = params;







                const handleChange = (e) => {



                    api.setEditCellValue({ id, field, value: e.target.value });



                    useFormikAssocie.setFieldValue(field, e.target.value);



                };







                return (



                    <FormControl fullWidth style={{ height: '100%' }}>



                        <Input



                            type="date"



                            name="dateentree"



                            value={



                                value instanceof Date



                                    ? value.toISOString().substring(0, 10)



                                    : value



                                        ? value.substring(0, 10)



                                        : ''



                            }



                            onChange={handleChange}



                            disableUnderline



                            style={{ height: '100%', outline: 'none' }}



                        />



                    </FormControl>



                );



            },



        },



        {



            field: 'datesortie',



            headerName: 'Date sortie',



            type: 'date',



            align: 'left',



            sortable: true,



            flex: 1,



            headerAlign: 'left',



            headerClassName: 'HeaderbackColor',



            editable: editableRow,



            valueGetter: (params) => {



                if (!params.value) return null;



                return new Date(params.value);



            },



            renderCell: (params) => {



                if (!params.value) return '';



                const date = new Date(params.value);



                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;



            },



            renderEditCell: (params) => {



                const { id, field, value, api } = params;







                const handleChange = (e) => {



                    api.setEditCellValue({ id, field, value: e.target.value });



                    useFormikAssocie.setFieldValue(field, e.target.value);



                };







                return (



                    <FormControl fullWidth style={{ height: '100%' }}>



                        <Input



                            type="date"



                            name="datesortie"



                            value={



                                value instanceof Date



                                    ? value.toISOString().substring(0, 10)



                                    : value



                                        ? value.substring(0, 10)



                                        : ''



                            }



                            onChange={handleChange}



                            disableUnderline



                            style={{ height: '100%', outline: 'none' }}



                        />



                    </FormControl>



                );



            },



        },



        {



            field: 'nbrpart',



            headerName: 'Nombre parts',



            type: 'number',



            sortable: true,



            flex: 1,



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



            flex: 1,



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



            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });



            const associeId = Array.isArray(selectedRowId) ? selectedRowId[0] : selectedRowId;



            const payloadAssocie = {



                ...useFormikAssocie.values,   // contient 'nombreparts'



                idCompte: compteId,



                idDossier: fileId,



                idAssocie: associeId,



            };







            axiosPrivate.post(`/paramCrm/associe`, payloadAssocie).then((response) => {



                const resData = response.data;



                if (resData.state) {



                    setDisableSaveBouton(true);



                    setDisableAddRowBouton(false);







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



        setDisableAddRowBouton(false);



    }

    const deleteAssocieRow = (value) => {



        if (value === true) {



            if (selectedRowId.length === 1) {



                const idToDelete = selectedRowId[0];



                if (idToDelete < 0) {



                    setOpenDialogDeleteAssocieRow(false);



                    setDisableAddRowBouton(false);



                    setListAssocie(listAssocie.filter((row) => row.id !== idToDelete));



                    return;



                }



                axiosPrivate.post(`/paramCrm/associeDelete`, { fileId, compteId, idToDelete }).then((response) => {



                    const resData = response.data;



                    if (resData.state) {



                        setOpenDialogDeleteAssocieRow(false);



                        setDisableAddRowBouton(false);



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



        setDisableAddRowBouton(false);



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



            toast.error("Sélectionnez une seule ligne pour pouvoir la modifier");



        } else {



            setDisableModifyBouton(false);



            setDisableSaveBouton(false);



            setDisableCancelBouton(false);



            if (!selectedRowId.includes(params.id)) {



                setEditableRow(false);



                toast.error("Sélectionnez une ligne pour pouvoir la modifier");



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



        setDisableModifyBouton(false);



        setDisableCancelBouton(false);



        setDisableDeleteBouton(false);



        const newId = -Date.now();







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



        const updatedList = [...listAssocie, newRow];



        setListAssocie(updatedList);







        setSelectedRowAssocie([newRow.id]);



        setSelectedRowId([newRow.id]);



        setDisableAddRowBouton(true);



    }

    //GESTION DU TABLEAU FILIALE-------------------------------------------------------------------------------

    //Entête tableau liste associé

    const FilialeColumnHeader = [



        {



            field: 'nom',



            headerName: 'Nom',



            type: 'text',



            sortable: true,



            flex: 1,



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



            flex: 1,



            headerAlign: 'left',



            align: 'left',



            headerClassName: 'HeaderbackColor',



            editable: editableRowFiliale,



            valueGetter: (params) => {



                if (!params.value) return null;



                return new Date(params.value);



            },



            renderCell: (params) => {



                if (!params.value) return '';



                const date = new Date(params.value);



                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;



            },



            renderEditCell: (params) => {



                const { id, field, value, api } = params;







                const handleChange = (e) => {



                    api.setEditCellValue({ id, field, value: e.target.value });



                    useFormikFiliale.setFieldValue(field, e.target.value);



                };







                return (



                    <FormControl fullWidth style={{ height: '100%' }}>



                        <Input



                            type="date"



                            name="dateentree"



                            value={



                                value instanceof Date



                                    ? value.toISOString().substring(0, 10)



                                    : value



                                        ? value.substring(0, 10)



                                        : ''



                            }



                            onChange={handleChange}



                            disableUnderline



                            style={{ height: '100%', outline: 'none' }}



                        />



                    </FormControl>



                );



            },



        },



        {



            field: 'datesortie',



            headerName: 'Date sortie',



            type: 'date',



            align: 'left',



            sortable: true,



            flex: 1,



            headerAlign: 'left',



            headerClassName: 'HeaderbackColor',



            editable: editableRowFiliale,



            valueGetter: (params) => {



                if (!params.value) return null;



                return new Date(params.value);



            },



            renderCell: (params) => {



                if (!params.value) return '';



                const date = new Date(params.value);



                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;



            },



            renderEditCell: (params) => {



                const { id, field, value, api } = params;







                const handleChange = (e) => {



                    api.setEditCellValue({ id, field, value: e.target.value });



                    useFormikFiliale.setFieldValue(field, e.target.value);



                };







                return (



                    <FormControl fullWidth style={{ height: '100%' }}>



                        <Input



                            type="date"



                            name="datesortie"



                            value={



                                value instanceof Date



                                    ? value.toISOString().substring(0, 10)



                                    : value



                                        ? value.substring(0, 10)



                                        : ''



                            }



                            onChange={handleChange}



                            disableUnderline



                            style={{ height: '100%', outline: 'none' }}



                        />



                    </FormControl>



                );



            },



        },



        {



            field: 'nbrpart',



            headerName: 'Nombre parts',



            type: 'number',



            sortable: true,



            flex: 1,



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



            flex: 1,



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



            const filialeId = Array.isArray(selectedRowIdFiliale) ? selectedRowIdFiliale[0] : selectedRowIdFiliale;



            const payloadFiliale = {



                ...useFormikFiliale.values,  // contient 'nombreparts'



                idCompte: compteId,



                idDossier: fileId,



                idFiliale: filialeId,



            };







            axiosPrivate.post(`/paramCrm/filiale`, payloadFiliale).then((response) => {



                const resData = response.data;







                if (resData.state) {



                    setDisableSaveBoutonFiliale(true);



                    setDisableAddRowBoutonFiliale(false);







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



        setDisableAddRowBoutonFiliale(false);



    }


    const deleteFilialeRow = (value) => {



        if (value === true) {



            if (selectedRowIdFiliale.length === 1) {



                const idToDelete = selectedRowIdFiliale[0];



                if (idToDelete < 0) {



                    setOpenDialogDeleteFilialeRow(false);



                    setListFiliales(listFiliales.filter((row) => row.id !== idToDelete));



                    setDisableAddRowBoutonFiliale(false);



                    toast.success('Ligne supprimée avec succès');



                    return



                }



                axiosPrivate.post(`/paramCrm/filialeDelete`, { fileId, compteId, idToDelete }).then((response) => {



                    const resData = response.data;



                    if (resData.state) {



                        setOpenDialogDeleteFilialeRow(false);



                        setDisableAddRowBoutonFiliale(false);



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



        setDisableAddRowBoutonFiliale(false);



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



            toast.error("Sélectionnez une seule ligne pour pouvoir la modifier");



        } else {



            setDisableModifyBoutonFiliale(false);



            setDisableSaveBoutonFiliale(false);



            setDisableCancelBoutonFiliale(false);



            if (!selectedRowIdFiliale.includes(params.id)) {



                setEditableRowFiliale(false);



                toast.error("Sélectionnez une ligne pour pouvoir la modifier");



            } else {



                setEditableRowFiliale(true);



            }



        }







    };

    //Ajouter une ligne dans le tableau liste associé

    const handleOpenDialogAddNewFiliale = () => {



        setDisableModifyBoutonFiliale(false);



        setDisableCancelBoutonFiliale(false);



        setDisableDeleteBoutonFiliale(false);



        const newId = -Date.now();







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



        setSelectedRowFiliales([newRow.id]);



        setSelectedRowIdFiliale([newRow.id]);



        setDisableAddRowBoutonFiliale(true);



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



                            onChange={(e) => {



                                const v = e.target.value;



                                useFormikDomBank.setFieldValue('banque', v);



                                params.api.setEditCellValue({ id: params.id, field: params.field, value: v });



                            }}



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



                            onChange={(e) => {



                                const v = e.target.value;



                                useFormikDomBank.setFieldValue('numcompte', v);



                                params.api.setEditCellValue({ id: params.id, field: params.field, value: v });



                            }}



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



                            onChange={(e) => {



                                const v = e.target.value;



                                useFormikDomBank.setFieldValue('devise', v);



                                params.api.setEditCellValue({ id: params.id, field: params.field, value: v });



                            }}



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



            field: "pays",



            headerName: "Pays",



            sortable: true,



            width: 250,



            headerAlign: "left",



            align: "left",



            headerClassName: "HeaderbackColor",



            editable: editableRowDomBank,



            // valueFormatter: (params) => {



            //     const selectedType = listPays.find((option) => option.code === params.value);



            //     return selectedType ? selectedType.nompays : params.value;



            // },



            renderEditCell: (params) => {



                return (



                    <Autocomplete



                        fullWidth



                        options={listPays}



                        getOptionLabel={(option) => option.nompays}



                        value={



                            listPays.find((option) => option.nompays === params.value) || null



                        }



                        onChange={(event, newValue) => {



                            params.api.setEditCellValue({



                                id: params.id,



                                field: params.field,



                                value: newValue ? newValue.nompays : "",



                            });



                            useFormikDomBank.setFieldValue('pays', newValue ? newValue.nompays : "");



                        }}



                        noOptionsText="Aucun pays trouvé"



                        renderInput={(paramsInput) => (



                            <TextField



                                {...paramsInput}



                                variant="standard"



                                error={



                                    Boolean(



                                        useFormikDomBank.touched.pays && useFormikDomBank.errors.pays



                                    )



                                }



                                helperText={



                                    useFormikDomBank.touched.pays && useFormikDomBank.errors.pays



                                }



                                sx={{



                                    "& .MuiInputBase-root": {



                                        height: 50,



                                        fontSize: 14,



                                    },



                                }}



                            />



                        )}



                    />



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



                        onChange={(e) => {



                            const checked = e.target.checked;



                            handleCheckboxChangeDomBank(checked);



                            params.api.setEditCellValue({ id: params.id, field: params.field, value: checked });



                        }}



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
            axiosPrivate.post(`/paramCrm/DomBank`, useFormikDomBank.values).then((response) => {
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
            setDisableAddRowBouton(false);
        }
    };

    const handleOpenDialogConfirmDeleteAssocieRowDomBank = () => {
        setOpenDialogDeleteDomBankRow(true);
        setDisableAddRowBouton(false);
    }

    const deleteDomBankRow = (value) => {
        if (value === true) {
            if (selectedRowIdDomBank.length === 1) {
                const idToDelete = selectedRowIdDomBank[0];
                if (idToDelete < 0) {
                    setOpenDialogDeleteDomBankRow(false);
                    setListDomBank(listDomBank.filter((row) => row.id !== idToDelete));
                    return;
                }
                axiosPrivate.post(`/paramCrm/DomBankDelete`, { fileId, compteId, idToDelete }).then((response) => {
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
        setDisableAddRowBouton(false);
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
            toast.error("Sélectionnez une seule ligne pour pouvoir la modifier");
        } else {
            setDisableModifyBoutonDomBank(false);
            setDisableSaveBoutonDomBank(false);
            setDisableCancelBoutonDomBank(false);
            if (!selectedRowIdDomBank.includes(params.id)) {
                setEditableRowDomBank(false);
                toast.error("Sélectionnez une ligne pour pouvoir la modifier");
            } else {
                setEditableRowDomBank(true);
            }
        }
    };

    // Ajouter une ligne dans le tableau liste domiciliation bancaires
    const handleOpenDialogAddNewDomBank = () => {
        setDisableModifyBouton(false);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(false);
        setDisableSaveBouton(false);

        const newId = -1 * (getMaxID(listDomBank) + 1);
        let arrayId = [];
        arrayId = [...arrayId, newId];

        useFormikDomBank.setFieldValue("idDomBank", newId);
        useFormikDomBank.setFieldValue("idCompte", compteId);
        useFormikDomBank.setFieldValue("idDossier", fileId);
        useFormikDomBank.setFieldValue("banque", "");
        useFormikDomBank.setFieldValue("numcompte", "");
        useFormikDomBank.setFieldValue("devise", "");
        useFormikDomBank.setFieldValue("pays", "");
        useFormikDomBank.setFieldValue("enactivite", false);

        const newRow = {
            id: newId,
            banque: '',
            numcompte: '',
            devise: '',
            pays: '',
        };

        setListDomBank([...listDomBank, newRow]);
        setSelectedRowIdDomBank(arrayId);
        setRowModesModelDomBank({ ...rowModesModelDomBank, [arrayId]: { mode: GridRowModes.Edit } });
        setDisableSaveBoutonDomBank(false);
        setSelectedRowId([newId]);
        setSelectedRowDomBank([newId]);
        setDisableAddRowBouton(true);
    }

    //Choix TAB value
    const handleChangeTAB = (event, newValue) => {
        setValueEbilan(newValue);
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

    const handleOnChangeDeviseSelect = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('devisepardefaut', value);
    }

    //submit les informations du nouveau dossier
    const handlSubmitModification = async (values) => {
        try {
            const oldLongueurStd = crm?.longcomptestd || 6;
            const oldLongueurAux = crm?.longcompteaux || 6;
            const oldAutoCompletion = crm?.autocompletion;

            const newLongueurStd = parseInt(values.longueurcptstd);
            const newLongueurAux = parseInt(values.longueurcptaux);
            const newAutoCompletion = values.autocompletion;

            const portefeuilleIds = values.portefeuille.map(val => val.id);
            const payload = { ...values, portefeuille: portefeuilleIds }

            const response = await axiosPrivate.post(`/paramCrm/modifying`, payload);
            const resData = response.data;

            if (resData.state) {
                toast.success(resData.msg);

                if (oldLongueurStd !== newLongueurStd || oldLongueurAux !== newLongueurAux || oldAutoCompletion !== newAutoCompletion) {
                    await updateAccountsLengthInJournals(newLongueurStd, newLongueurAux, values.autocompletion);
                    await updateAccountsLengthInPlanComptable(newLongueurStd, newLongueurAux, values.autocompletion);
                }

            } else {
                toast.error(resData.msg);
            }

        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            toast.error("Erreur lors de la sauvegarde");
        }
    }

    const handleOnChangePortefeuilleSelect = (setFieldValue) => (e) => {



        const value = e.target.value;



        setFieldValue('portefeuille', value);



    }







    // Charger la liste des portefeuille



    const getAllPortefeuille = () => {



        axios.get(`/param/portefeuille/getAllPortefeuille/${compteId}`)



            .then(response => {



                const resData = response?.data;



                if (resData?.state) {



                    setListePortefeuille(resData?.list)



                } else {



                    toast.error(resData?.message);



                }



            })



    };







    // Fonction pour mettre à jour la longueur de tous les comptes existants



    const updateExistingAccountsLength = async (oldLongueurStd, newLongueurStd, oldLongueurAux, newLongueurAux, autocompletion) => {



        try {



            const updateData = {



                fileId: fileId,



                compteId: compteId,



                oldLongueurStd: oldLongueurStd,



                newLongueurStd: newLongueurStd,



                oldLongueurAux: oldLongueurAux,



                newLongueurAux: newLongueurAux,



                autocompletion: autocompletion // Utiliser la valeur passée en paramètre



            };







            const response = await axios.post(`/paramCrm/updateAccountsLength`, updateData);



            // const response = await axios.post('/paramCrm/updateAccountsLengthInPlanComptable', updateData);







            if (response.data.state) {



                toast.success(`Longueur des comptes mise à jour : ${response.data.updatedCount} comptes modifiés`);



            } else {



                toast.error("Paramètres sauvegardés mais erreur lors de la mise à jour des comptes existants");



            }



        } catch (error) {



            console.error("Erreur lors de la mise à jour des comptes:", error);



            toast.error("Paramètres sauvegardés mais erreur lors de la mise à jour des comptes existants");



        }



    }







    // Fonction pour mettre à jour la longueur de tous les comptes dans le journals



    const updateAccountsLengthInJournals = async (newLongueurStd, newLongueurAux, autoCompletion) => {



        const payload = {



            fileId: Number(fileId),



            compteId: Number(compteId),



            newLongueurStd: newLongueurStd,



            newLongueurAux: newLongueurAux,



            autoCompletion: autoCompletion



        }



        const response = await axios.post('/paramCrm/updateAccountsLengthInJournals', payload);



        if (response?.data?.state) {



        } else {



            toast.error("Erreur lors de la modification de longueur de compte dans le journal")



        }



    }







    const updateAccountsLengthInPlanComptable = async (newLongueurStd, newLongueurAux, autoCompletion) => {



        const payload = {



            fileId: Number(fileId),



            compteId: Number(compteId),



            newLongueurStd: newLongueurStd,



            newLongueurAux: newLongueurAux,



            autoCompletion: autoCompletion



        }



        const response = await axios.post('/paramCrm/updateAccountsLengthInPlanComptable', payload);



        if (response?.data?.state) {







        } else {



            toast.error('Erreur lors de la modification de la longueur de compte dans le journal');



        }



    }







    const handleChangeCentrefisc = async (newValue) => {



        try {



            await axios.put(`/home/FileCentrefisc/${fileId}`, { centrefisc: newValue });



            setTypeCentre(newValue);



            toast.success('CFISC mis à jour');







            // Recharger les infos dossier pour refléter la modif partout



            await GetInfosIdDossier(fileId);







            // Optionnel: si tu veux forcer un refresh ailleurs (ex: un contexte global), déclenche-le ici.



        } catch (e) {



            toast.error("Mise à jour du centre fiscal échouée");



        }



    };



    const deselectRow = (ids) => {



        const deselected = selectedRowId.filter(id => !ids.includes(id));







        const updatedRowModes = { ...rowModesModel };



        deselected.forEach((id) => {



            updatedRowModes[id] = { mode: GridRowModes.View, ignoreModifications: true };



        });



        setRowModesModel(updatedRowModes);







        setDisableAddRowBouton(false);



        setSelectedRowId(ids);



    }



    const deselectRowFiliale = (ids) => {



        const deselected = selectedRowIdFiliale.filter(id => !ids.includes(id));







        const updatedRowModes = { ...rowModesModel };



        deselected.forEach((id) => {



            updatedRowModes[id] = { mode: GridRowModes.View, ignoreModifications: true };



        });



        setRowModesModelFiliale(updatedRowModes);







        setDisableAddRowBoutonFiliale(false);



        setSelectedRowIdFiliale(ids);



    }







    const handleCellKeyDown = (params, event) => {



        const api = apiRef.current;







        const allCols = api.getAllColumns().filter(c => c.editable);



        const sortedRowIds = api.getSortedRowIds();



        const currentColIndex = allCols.findIndex(c => c.field === params.field);



        const currentRowIndex = sortedRowIds.indexOf(params.id);







        let nextColIndex = currentColIndex;



        let nextRowIndex = currentRowIndex;







        if (event.key === 'Tab' && !event.shiftKey) {



            event.preventDefault();



            nextColIndex = currentColIndex + 1;



            if (nextColIndex >= allCols.length) {



                nextColIndex = 0;



                nextRowIndex = currentRowIndex + 1;



            }



        } else if (event.key === 'Tab' && event.shiftKey) {



            event.preventDefault();



            nextColIndex = currentColIndex - 1;



            if (nextColIndex < 0) {



                nextColIndex = allCols.length - 1;



                nextRowIndex = currentRowIndex - 1;



            }



        } else if (event.key === 'ArrowRight') {



            event.preventDefault();



            nextColIndex = currentColIndex + 1;



            if (nextColIndex >= allCols.length) nextColIndex = allCols.length - 1;



        } else if (event.key === 'ArrowLeft') {



            event.preventDefault();



            nextColIndex = currentColIndex - 1;



            if (nextColIndex < 0) nextColIndex = 0;



        }







        const nextRowId = sortedRowIds[nextRowIndex];



        const targetCol = allCols[nextColIndex];







        if (!nextRowId || !targetCol) return;







        try {



            api.stopCellEditMode({ id: params.id, field: params.field });



        } catch (err) {



            console.warn('Erreur stopCellEditMode ignorée:', err);



        }







        setTimeout(() => {



            const cellInput = document.querySelector(



                `[data-id="${nextRowId}"] [data-field="${targetCol.field}"] input, 



             [data-id="${nextRowId}"] [data-field="${targetCol.field}"] textarea`



            );



            if (cellInput) cellInput.focus();



        }, 50);



    };







    const handleRowEditStopConsolidation = (params, event) => {



        if (params.reason === GridRowEditStopReasons.rowFocusOut) {



            event.defaultMuiPrevented = true;



        }



    };







    const handleEditClickConsolidation = (id) => () => {



        //charger dans le formik les données de la ligne



        const selectedRowInfos = listConsolidation?.filter((item) => item.id === id[0]);







        useFormikConsolidation.setFieldValue("idCompte", compteId);



        useFormikConsolidation.setFieldValue("idDossier", fileId);



        useFormikConsolidation.setFieldValue("idDossierAutre", selectedRowInfos[0].id_dossier_autre);



        useFormikConsolidation.setFieldValue("idConsolidation", selectedRowInfos[0].id);











        setRowModesModelConsolidation({ ...rowModesModelConsolidation, [id]: { mode: GridRowModes.Edit } });



        setDisableSaveBoutonConsolidation(false);



    };







    const saveSelectedRowConsolidation = (ids) => {



        if (ids.length === 1) {



            setSelectedRowIdConsolidation(ids);



            setDisableModifyBoutonConsolidation(false);



            setDisableSaveBoutonConsolidation(false);



            setDisableCancelBoutonConsolidation(false);



            setDisableDeleteBoutonConsolidation(false);



        } else {



            setSelectedRowIdConsolidation([]);



            setDisableModifyBoutonConsolidation(true);



            setDisableSaveBoutonConsolidation(true);



            setDisableCancelBoutonConsolidation(true);



            setDisableDeleteBoutonConsolidation(true);



        }



    }







    const handleSaveClickConsolidation = (setFieldValue) => () => {



        let saveBoolIdDossierAutre = false;







        if (useFormikConsolidation.values.idDossierAutre === '') {



            saveBoolIdDossierAutre = false;



        } else {



            saveBoolIdDossierAutre = true;



        }







        if (saveBoolIdDossierAutre) {



            const payloadConsolidation = {



                ...useFormikConsolidation.values



            }



            setRowModesModelConsolidation({ ...rowModesModelConsolidation, [selectedRowIdConsolidation]: { mode: GridRowModes.View } });



            axiosPrivate.post('/param/consolidation/addOrUpdateConsolidationDossier', payloadConsolidation)



                .then((response) => {



                    if (response?.data?.state) {



                        toast.success(response?.data?.msg);



                    } else {



                        toast.error(response?.data?.msg);



                    }



                })



            setDisableSaveBoutonConsolidation(true);



            setDisableAddRowBoutonConsolidation(false);



        }



    };







    const handleOpenDialogConfirmDeleteConsolidationRow = () => {



        setOpenDialogDeleteConsolidationRow(true);



        setDisableAddRowBoutonConsolidation(false);



    }







    const deleteConsolidationRow = (value) => {



        if (value === true) {



            if (selectedRowConsolidations.length === 1) {



                const idToDelete = selectedRowConsolidations[0];



                if (idToDelete < 0) {



                    setListConsolidation(listConsolidation.filter((row) => row.id !== selectedRowIdConsolidation[0]));



                    toast.success('Ligne supprimée avec succès');



                    return;



                }



                axiosPrivate.delete(`/param/consolidation/deleteConsolidation/${idToDelete}`)



                    .then((response) => {



                        const resData = response?.data;



                        if (resData?.state) {



                            setListConsolidation(listConsolidation.filter((row) => row.id !== selectedRowIdConsolidation[0]));



                            toast.success(resData?.message);



                        } else {



                            toast.error(resData.msg);



                        }



                    })



                setOpenDialogDeleteConsolidationRow(false);



                setDisableAddRowBoutonConsolidation(false);



            }



        } else {



            setOpenDialogDeleteConsolidationRow(false);



        }



    }







    const handleCancelClickConsolidation = (id) => () => {



        setRowModesModelConsolidation({



            ...rowModesModelConsolidation,



            [id]: { mode: GridRowModes.View, ignoreModifications: true },



        });



        setDisableAddRowBoutonConsolidation(false);



    };







    const processRowUpdateConsolidation = (setFieldValue) => (newRow) => {



        const updatedRow = { ...newRow };



        setListConsolidation(listConsolidation.map((row) => (row.id === newRow.id ? updatedRow : row)));



        setFieldValue('listeConsolidation', listConsolidation.map((row) => (row.id === newRow.id ? updatedRow : row)));



        return updatedRow;



    };







    const handleRowModesModelChangeConsolidation = (newRowModesModel) => {



        setRowModesModelConsolidation(newRowModesModel);



    };







    //Ajouter une ligne dans le tableau liste consolidation



    const handleOpenDialogAddNewConsolidation = () => {



        setDisableModifyBoutonConsolidation(false);



        setDisableCancelBoutonConsolidation(false);



        setDisableDeleteBoutonConsolidation(false);



        const newRow = {



            id: -Date.now(),



        };



        setListConsolidation([...listConsolidation, newRow]);



        setSelectedRowConsolidations([newRow.id]);



        setSelectedRowIdConsolidation([newRow.id]);



        setDisableAddRowBoutonConsolidation(true);



    }







    const deselectRowConsolidation = (ids) => {



        const deselected = selectedRowIdConsolidation.filter(id => !ids.includes(id));







        const updatedRowModes = { ...rowModesModelConsolidation };



        deselected.forEach((id) => {



            updatedRowModes[id] = { mode: GridRowModes.View, ignoreModifications: true };



        });



        setRowModesModelConsolidation(updatedRowModes);







        setDisableAddRowBoutonConsolidation(false);



        setSelectedRowIdConsolidation(ids);



    }







    const handleCellEditCommitConsolidation = (params) => {



        if (selectedRowIdConsolidation.length > 1 || selectedRowIdConsolidation.length === 0) {



            setEditableRowConsolidation(false);



            setDisableModifyBoutonConsolidation(true);



            setDisableSaveBoutonConsolidation(true);



            setDisableCancelBoutonConsolidation(true);



            toast.error("Sélectionnez une seule ligne pour pouvoir la modifier");



        } else {



            setDisableModifyBoutonConsolidation(false);



            setDisableSaveBoutonConsolidation(false);



            setDisableCancelBoutonConsolidation(false);



            if (!selectedRowIdConsolidation.includes(params.id)) {



                setEditableRowConsolidation(false);



                toast.error("Sélectionnez une ligne pour pouvoir la modifier");



            } else {



                setEditableRowConsolidation(true);



            }



        }



    };







    // Entête tableau consolidation



    const ConsolidationColumnHeader = [



        {



            field: 'id_dossier_autre',



            headerName: 'Dossier',



            type: 'text',



            sortable: true,



            flex: 1,



            headerAlign: 'left',



            headerClassName: 'HeaderbackColor',



            disableClickEventBubbling: true,



            editable: editableRowConsolidation,



            renderCell: (params) => {



                const dossier = listeDossier.find(



                    val => val.id === Number(params.value)



                );







                return <div>{dossier?.dossier || ''}</div>;



            },



            renderEditCell: (params) => {



                const { id, field, value, api } = params;







                const handleChange = (e) => {



                    useFormikConsolidation.setFieldValue('idDossierAutre', e.target.value);



                    api.setEditCellValue({



                        id,



                        field,



                        value: e.target.value,



                    });



                };







                const dossier = listeDossier.filter(



                    val => val.id === Number(value)



                );







                return (



                    <FormControl fullWidth>



                        <InputLabel id="select-compte-label">Choisir...</InputLabel>



                        <Select



                            labelId="select-compte-label"



                            value={value ?? ''}



                            onChange={handleChange}



                        >



                            {(availableDossier.length > 0 ? availableDossier : dossier)



                                .map((option) => (



                                    <MenuItem key={option.id} value={option.id}>



                                        {option.dossier}



                                    </MenuItem>



                                ))}



                        </Select>



                    </FormControl>



                );



            }



        },



    ];







    const getListeDossier = () => {



        axios.get(`/home/file/${compteId}`, { params: { userId: userId } }).then((response) => {



            const resData = response.data;



            setListeDossier(resData.fileList);



        })



    }







    const getListeConsolidationDossier = () => {



        axios.get(`/param/consolidation/getListeConsolidationDossier/${compteId}/${id}`).then((response) => {



            const resData = response.data;



            setListConsolidation(resData.list);



        })



    }







    useEffect(() => {



        getAllPortefeuille();



        getDevises();



        getListeDossier();



        getListeConsolidationDossier();



    }, [compteId]);







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



                <TabPanel value="1">



                    {/* MODAL POUR LA SUPPRESSION D'UNE LIGNE DU TABLEAU ASSOCIE */}



                    {openDialogDeleteAssocieRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"} confirmationState={deleteAssocieRow} /> : null}







                    {/* MODAL POUR LA SUPPRESSION D'UNE LIGNE DU TABLEAU FILIALE */}



                    {/* MODAL POUR LA SUPPRESSION D'UNE LIGNE DU TABLEAU FILIALE */}



                    {openDialogDeleteConsolidationRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"} confirmationState={deleteConsolidationRow} /> : null}







                    <Formik



                        initialValues={InfosNewFileInitialValues}



                        onSubmit={(values) => {



                            handlSubmitModification(values);



                        }}



                    >



                        {({ handleChange, handleSubmit, setFieldValue, resetForm, values, isValid, errors, setTouched }) => {







                            const calculateValeurPart = (capital, nbrPart) => {



                                const numCapital = parseFloat(capital?.toString().replace(/\s/g, '').replace(',', '.')) || 0;



                                const numParts = parseFloat(nbrPart) || 0;



                                if (numParts === 0) return 0;



                                const valPart = numCapital / numParts;



                                const valPartFormatted = Number((valPart).toFixed(2));



                                return valPartFormatted;



                            };







                            useEffect(() => {



                                if (!listePortefeuille || listePortefeuille.length === 0) return;



                                const id = fileId;



                                axios.get(`/paramCrm/infoscrm/${id}`).then((response) => {



                                    const resData = response.data;



                                    if (resData.state) {



                                        setCrm(resData.list);



                                        const crmData = resData.list;







                                        const mappedPortefeuille = crmData.id_portefeuille.map(id => {



                                            return listePortefeuille.find(p => p.id === Number(id));



                                        }).filter(Boolean);







                                        const deviseParDefaut = listeDevise.find(val => val.par_defaut === true);







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



                                        setFieldValue('pourcentageca', crmData.pourcentageca);



                                        setFieldValue('montantmin', crmData.montantmin);



                                        setFieldValue('assujettitva', crmData.assujettitva);



                                        setFieldValue('immo_amort_base_jours', String(crmData.immo_amort_base_jours ?? 365));



                                        const formattedCapital = Number(crmData.capital).toLocaleString('fr-FR', {



                                            minimumFractionDigits: 2,



                                            maximumFractionDigits: 2,



                                        });



                                        setFieldValue('montantcapital', formattedCapital);



                                        setFieldValue('nbrpart', crmData.nbrpart);



                                        setFieldValue('valeurpart', crmData.valeurpart);



                                        setFieldValue('compteisi', Number(crmData.compteisi));



                                        setFieldValue('typecomptabilite', crmData.typecomptabilite || 'Français');



                                        setFieldValue('portefeuille', mappedPortefeuille);







                                        setFieldValue('devisepardefaut', deviseParDefaut?.id || 0);



                                        setFieldValue('consolidation', crmData.consolidation || false);



                                        setFieldValue('pays', crmData.pays || '');



                                        setFieldValue('avecMotDePasse', crmData.avecmotdepasse);



                                        setFieldValue('motDePasse', crmData.motdepasse || '');



                                        setFieldValue('motDePasseConfirmation', crmData.motdepasse || '');



                                        setPassword(crmData.motdepasse || '');



                                    } else {



                                        setCrm([]);



                                    }



                                })







                            }, [fileId, listePortefeuille]);







                            return (

                                <Form noValidate style={{ width: '100%' }}>



                                    <Stack width={"100%"} height={"85%"} spacing={2} alignItems={"flex-start"} justifyContent={"stretch"}>



                                        <Stack width={"100%"} height={"30px"} spacing={2} alignItems={"center"} alignContent={"center"}



                                            direction={"row"} justifyContent={"right"}



                                        >



                                            <Typography variant='h7' sx={{ color: "black", width: 'calc(100% - 120px)' }} align='left'>Paramétrages: CRM</Typography>

                                            <Button variant="contained"
                                                disabled={!canModify}
                                                onClick={() => {
                                                    if (!isValid) {
                                                        const touchedFields = Object.keys(errors).reduce((acc, field) => {
                                                            acc[field] = true;
                                                            return acc;
                                                        }, {});
                                                        setTouched(touchedFields);
                                                        const firstErrorField = fieldOrder.find(
                                                            field => errors[field]
                                                        );
                                                        if (firstErrorField) {
                                                            toast.error(errors[firstErrorField]);
                                                        }
                                                        return;
                                                    }
                                                    handleSubmit();
                                                }}
                                                style={{

                                                    borderRadius: "1",



                                                    height: '32px', marginLeft: "5px", width: '120px',



                                                    textTransform: 'none', outline: 'none', border: 'none', backgroundColor: initial.auth_gradient_end,



                                                    color: 'white'



                                                }}



                                            >



                                                Sauvegarder



                                            </Button>
                                        </Stack>

                                        <Box sx={{ width: '100%', typography: 'body1' }}>
                                            <TabContext value={valueEbilan}>
                                                <Box sx={{ borderBottom: 1, borderColor: 'transparent' }}>
                                                    <TabList onChange={handleChangeTAB} aria-label="lab API tabs example" variant='scrollable'>
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="infos société" value="1" />
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="comptabilité" value="2" />
                                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="fiscales" value="3" />
                                                    </TabList>
                                                </Box>

                                                <TabPanel value="1">
                                                    <Stack spacing={3}> {/* 👈 ESPACE ENTRE LES DEUX BLOCS */}

                                                        {/* Nom du dossier */}
                                                        <Stack spacing={1} sx={{ width: 250 }}>
                                                            <InputLabel
                                                                htmlFor="nomdossier"
                                                                sx={{ fontSize: 12, color: '#c0c0c0ff' }}
                                                            >
                                                                Nom du dossier
                                                            </InputLabel>

                                                            <Field
                                                                name="nomdossier"
                                                                as={TextField}
                                                                size="small"
                                                                required
                                                                sx={{
                                                                    width: '100%',
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: 32,
                                                                        fontSize: 14,
                                                                        borderRadius: 1.5,
                                                                    },
                                                                }}
                                                            />

                                                            <ErrorMessage
                                                                name="nomdossier"
                                                                component="div"
                                                                style={{ color: 'red', fontSize: 12 }}
                                                            />
                                                        </Stack>

                                                        {/* Portefeuille */}
                                                        <Stack spacing={1} width={400}>
                                                            <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                Portefeuille
                                                            </InputLabel>

                                                            <Autocomplete
                                                                multiple
                                                                options={listePortefeuille}
                                                                getOptionLabel={(option) => option.nom}
                                                                value={values.portefeuille || []}
                                                                onChange={(_, newValue) => setFieldValue("portefeuille", newValue)}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        minHeight: 32,
                                                                    },
                                                                    '& .MuiChip-root': {
                                                                        height: 20,
                                                                    },
                                                                }}
                                                                renderInput={(params) => (
                                                                    <TextField {...params} size="small" />
                                                                )}
                                                            />

                                                            <ErrorMessage
                                                                name="portefeuille"
                                                                component="div"
                                                                style={{ color: 'red', fontSize: 12 }}
                                                            />
                                                        </Stack>

                                                    </Stack>
                                                </TabPanel>




                                                <TabPanel value="2">
                                                    <Stack width="100%" spacing={2}>
                                                        {/* Plan comptable et Devise */}
                                                        <Grid container spacing={1} alignItems="flex-start">
                                                            <Grid item>
                                                                <Stack spacing={1} sx={{ width: '100%' }}>
                                                                    <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                        Plan comptable
                                                                    </InputLabel>
                                                                    <Field
                                                                        as={Select}
                                                                        name="plancomptable"
                                                                        size="small"
                                                                        sx={{
                                                                            width: 200, // réduit
                                                                            '& .MuiInputBase-root': { height: 32 },
                                                                            '& .MuiOutlinedInput-root': { height: 32 },
                                                                            borderRadius: 1.5,
                                                                            fontSize: 14,
                                                                            '& .MuiSelect-select': {
                                                                                padding: '4px 8px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                height: '100%',
                                                                                minHeight: 'unset',
                                                                                lineHeight: '24px',
                                                                            },
                                                                            '& fieldset': { borderColor: '#ccc' },
                                                                            '&:hover fieldset': { borderColor: '#888' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#c0c0c0ff' },
                                                                        }}
                                                                        onChange={handleOnChangePlanComptableSelect(setFieldValue)}
                                                                    >
                                                                        <MenuItem value={0}><em>Aucun</em></MenuItem>
                                                                        {listModel?.map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>{item.nom}</MenuItem>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="plancomptable" component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                </Stack>
                                                            </Grid>

                                                            <Grid item>
                                                                <Stack spacing={1} sx={{ width: '100%' }}>
                                                                    <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                        Devise par défaut
                                                                    </InputLabel>
                                                                    <Field
                                                                        as={Select}
                                                                        name="devisepardefaut"
                                                                        size="small"
                                                                        sx={{
                                                                            width: 120, // réduit
                                                                            '& .MuiInputBase-root': { height: 32 },
                                                                            '& .MuiOutlinedInput-root': { height: 32 },
                                                                            borderRadius: 1.5,
                                                                            fontSize: 14,
                                                                            '& .MuiSelect-select': {
                                                                                padding: '4px 8px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                height: '100%',
                                                                                minHeight: 'unset',
                                                                                lineHeight: '24px',
                                                                            },
                                                                            '& fieldset': { borderColor: '#ccc' },
                                                                            '&:hover fieldset': { borderColor: '#888' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#c0c0c0ff' },
                                                                        }}
                                                                        onChange={handleOnChangeDeviseSelect(setFieldValue)}
                                                                    >
                                                                        {listeDevise.map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>{item.code}</MenuItem>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="devisepardefaut" component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                </Stack>
                                                            </Grid>
                                                        </Grid>

                                                        {/* Titre */}
                                                        <Typography fontWeight={600} fontSize={16} marginTop={1}>
                                                            Paramétrages de longueur des comptes
                                                        </Typography>

                                                        {/* Longueurs des comptes et auto-complétion */}
                                                        <Grid container spacing={1} alignItems="flex-start">
                                                            <Grid item>
                                                                <Stack spacing={1}>
                                                                    <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                        Compte standard
                                                                    </InputLabel>
                                                                    <Field
                                                                        as={TextField}
                                                                        name="longueurcptstd"
                                                                        size="small"
                                                                        sx={{
                                                                            width: 140, // réduit
                                                                            '& .MuiInputBase-root': { height: 32 },
                                                                            '& .MuiOutlinedInput-root': { height: 32 },
                                                                            '& .MuiOutlinedInput-input': { padding: '4px 8px' },
                                                                        }}
                                                                    />
                                                                    <ErrorMessage name="longueurcptstd" component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                </Stack>
                                                            </Grid>

                                                            <Grid item>
                                                                <Stack spacing={1}>
                                                                    <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                        Compte auxiliaire
                                                                    </InputLabel>
                                                                    <Field
                                                                        as={TextField}
                                                                        name="longueurcptaux"
                                                                        size="small"
                                                                        sx={{
                                                                            width: 140, // réduit
                                                                            '& .MuiInputBase-root': { height: 32 },
                                                                            '& .MuiOutlinedInput-root': { height: 32 },
                                                                            '& .MuiOutlinedInput-input': { padding: '4px 8px' },
                                                                        }}
                                                                    />
                                                                    <ErrorMessage name="longueurcptaux" component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                </Stack>
                                                            </Grid>

                                                            <Grid item>
                                                                <Stack spacing={1} alignItems="flex-start">
                                                                    <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                        Auto-complétion
                                                                    </InputLabel>
                                                                    <Field as={Checkbox} name="autocompletion" sx={{ padding: 0 }} />
                                                                </Stack>
                                                            </Grid>
                                                        </Grid>

                                                        <FormControlLabel
                                                            control={<Field as={Checkbox} name="avecanalytique" />}
                                                            label="Avec analytique"
                                                        />
                                                    </Stack>
                                                </TabPanel>

                                                <TabPanel value="3"></TabPanel>
                                            </TabContext>



                                        </Box>







                                    </Stack>







                                </Form>

                            );

                        }}

                    </Formik>

                </TabPanel>

            </TabContext>







        </Box >



    )



}



