import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Stack, Paper, RadioGroup, FormControlLabel, Radio, FormControl, 
        InputLabel, Select, MenuItem, TextField, Box, Tab, 
        FormHelperText,
        Chip} from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { DataGrid, frFR } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
//import ParamPlanComptable_column from './ParamPlanComptable_column';
import { useFormik, Field, Formik, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import { format } from 'date-fns';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { TbCircleLetterCFilled, TbCircleLetterGFilled, TbCircleLetterAFilled } from "react-icons/tb";
import { DetailsInformation } from '../../../componentsTools/DetailsInformation';
import { FaFolderOpen } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { PiIdentificationCardFill } from "react-icons/pi";
import { BsPersonFillSlash } from "react-icons/bs";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));

export default function ParamPlanComptable() {
    let initial = init[0];
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [modelId, setModelId] = useState(null);

    const [pc, setPc] = useState([]);
    const [selectedRow, setSelectedRow] = useState([]);
    const [detailModelSelectedRowListChgAssoc, setDetailModelSelectedRowListChgAssoc] = useState([]);
    const [detailModelSelectedRowListTvaAssoc, setDetailModelSelectedRowListTvaAssoc] = useState([]);
    const [openDialogAddCpt, setOpenDialogAddCpt] = useState(false);

    const [listCptChg, setListCptChg] = useState([]);
    const [listCptTva, setListCptTva] = useState([]);

    const [tabValueAjoutNewRow, setTabValueAjoutNewRow] = useState("1");

    const [openDialogAddNewCptAssoc,setOpenDialogAddNewCptAssoc] = useState(false);
    const [pcHorsCollectif,setPcHorsCollectif] = useState([]);
    const [selectedCptAssocChg,setSelectedCptAssocChg] = useState({idCpt: 0, compte:'', libelle:''});
    const [selectedCptChgOnList,setSelectedCptChgOnList] = useState(0);
    let [openDialogDeleteCptChgFromAddNewCpt, setOpenDialogDeleteCptChgFromAddNewCpt] = useState(false);

    const [openDialogAddNewCptTvaToCpt,setOpenDialogAddNewCptTvaToCpt] = useState(false);
    const [pcOnlyCptTva,setPcOnlyCptTva] = useState([]);
    const [selectedCptAssocTva,setSelectedCptAssocTva] = useState({idCpt: 0, compte:'', libelle:''});
    const [selectedCptTvaOnList,setSelectedCptTvaOnList] = useState(0);
    const [openDialogDeleteCptTvaFromAddNewCpt, setOpenDialogDeleteCptTvaFromAddNewCpt] = useState(false);
    const [formulaireTier, setFormulaireTier] = useState('sans-nif');
    const [typeCptGeneral,setTypeCptGeneral] = useState(true);
    const [pcAllselectedRow, setPcAllselectedRow] = useState([]);
    const [openDialogDeleteItemsPc, setOpenDialogDeleteItemsPc] = useState(false);
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [listeCptCollectif, setListeCptCollectif] = useState([]);
    const [cptInfos, setCptInfos] = useState('');
    const [rowCptInfos, setRowCptInfos] = useState([]);
    const [openInfos, setOpenInfos] = useState(false);

    //header pour le tableau détail
    //const columnHeaderDetail = ParamPlanComptable_column.columnHeaderDetail;
    //Header pour le tableau détail du modèle
    const columnHeaderDetail = [
        {
            field: 'id', 
            headerName: 'ID', 
            type: 'number', 
            sortable : true, 
            width: 70, 
            headerAlign: 'right',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'compte', 
            headerName: <strong>Compte</strong>, 
            type: 'string', 
            sortable : true, 
            width: 175, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                return (
                  <span
                  style={{cursor: 'pointer', width:'100%'}}
                    onClick={() => handleShowCptInfos(params.row)}
                  >
                    {params.row.compte}
                  </span>
                );
              }
        },
        {
            field: 'libelle', 
            headerName: <strong>Libellé</strong>, 
            type: 'string', 
            sortable : true, 
            width: 300, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'nature', 
            headerName: <strong>Nature</strong>, 
            type: 'string', 
            sortable : true, 
            width: 130, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                if(params.row.nature === 'General'){
                    return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>    
                        <Chip 
                        icon={<TbCircleLetterGFilled style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                        label="Général"
                        
                        style={{
                            width: "100%",
                            display: 'flex', // ou block, selon le rendu souhaité
                            justifyContent: 'space-between',
                            backgroundColor: '#48A6A7',
                            color:'white'
                        }}
                        />
                    </Stack>
                    )
                }else if(params.row.nature === 'Collectif'){
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                           
                            <Chip 
                            icon={<TbCircleLetterCFilled style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                            label="Collectif"
                            
                            style={{
                                width: "100%",
                                display: 'flex', // ou block, selon le rendu souhaité
                                justifyContent: 'space-between',
                                backgroundColor: '#A6D6D6',
                                color:'white'
                            }}
                            />
                        </Stack>
                    )
                }else{
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                          
                            <Chip 
                            icon={<TbCircleLetterAFilled style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                            label="Auxiliaire"
                            
                            style={{
                                width: "100%",
                                display: 'flex', // ou block, selon le rendu souhaité
                                justifyContent: 'space-between',
                                backgroundColor: '#123458',
                                color:'white'
                            }}
                            />
                        </Stack>
                    )
                }
            }
        },
        {
            field: 'BaseAux.comptecentr', 
            headerName: <strong>Centr. / base aux.</strong>, 
            type: 'string', 
            sortable : true, 
            width: 175, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'cptcharge', 
            headerName: <strong>Cpt charge</strong>, 
            type: 'string', 
            sortable : true, 
            width: 100, 
            headerAlign: 'right',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                if(params.row.cptcharge === 0){
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <div style={{
                                width: 25,             
                                height: 25,            
                                backgroundColor: '#DBDBDB', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',       
                            }}>
                                {params.row.cptcharge}
                            </div>
                        </Stack>
                    )
                }else{
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <div style={{
                                width: 25,             
                                height: 25,            
                                backgroundColor: '#FDA403', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',       
                            }}>
                            {params.row.cptcharge}
                        </div>
                        </Stack>
                        
                    )
                }
            }
        },
        {
            field: 'cpttva', 
            headerName: <strong>Cpt TVA</strong>, 
            type: 'string', 
            sortable : true, 
            width: 100, 
            headerAlign: 'right',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                if(params.row.cpttva === 0){
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <div style={{
                                width: 25,             
                                height: 25,            
                                backgroundColor: '#DBDBDB', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',       
                            }}>
                                {params.row.cpttva}
                            </div>
                        </Stack>
                    )
                }else{
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <div style={{
                                width: 25,             
                                height: 25,            
                                backgroundColor: '#FDA403', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',       
                            }}>
                                {params.row.cpttva}
                            </div>
                        </Stack>
                        
                    )
                }
            }
        },
        {
            field: 'typetier', 
            headerName: <strong>Type de tier</strong>, 
            type: 'string', 
            sortable : true, 
            width: 130, 
            headerAlign: 'center',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                if(params.row.typetier === 'sans-nif'){
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <Chip 
                            icon={<BsPersonFillSlash style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                            label="Sans NIF"
                            
                            style={{
                                width: "100%",
                                display: 'flex', // ou block, selon le rendu souhaité
                                justifyContent: 'space-between',
                                backgroundColor: '#FF9149',
                                color:'white'
                            }}
                            />
                        </Stack>
                    )
                }else if(params.row.typetier === 'avec-nif'){
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <Chip 
                            icon={<PiIdentificationCardFill style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                            label="Avec NIF"
                            
                            style={{
                                width: "100%",
                                display: 'flex', // ou block, selon le rendu souhaité
                                justifyContent: 'space-between',
                                backgroundColor: '#006A71',
                                color:'white'
                            }}
                            />
                        </Stack>
                    )
                }else if(params.row.typetier === 'general'){
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <Chip 
                            icon={<BsCheckCircleFill style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                            label="Général"
                            
                            style={{
                                width: "100%",
                                display: 'flex', // ou block, selon le rendu souhaité
                                justifyContent: 'space-between',
                                backgroundColor: '#67AE6E',
                                color:'white'
                            }}
                            />
                        </Stack>
                    )
                }else if(params.row.typetier === 'etranger'){
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <div style={{
                                width: 90,             
                                height: 25,            
                                backgroundColor: '#FBA518', 
                                borderRadius: 15,        
                                display: 'flex',            
                                justifyContent: 'center',   
                                alignItems: 'center',       
                            }}>
                                {/* {params.row.typetier} */}
                                Etranger
                            </div>
                        </Stack>
                    )
                }
            }
        },
        {
            field: 'nif', 
            headerName: <strong>Nif</strong>, 
            type: 'string', 
            sortable : true, 
            width: 150, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'statistique', 
            headerName: <strong>N° statistique</strong>, 
            type: 'string', 
            sortable : true, 
            width: 200, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'adresse', 
            headerName: <strong>Adresse</strong>, 
            type: 'string', 
            sortable : true, 
            width: 250, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'cin', 
            headerName: <strong>CIN</strong>, 
            type: 'string', 
            sortable : true, 
            width: 150, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'datecin', 
            headerName: <strong>date CIN</strong>, 
            type: 'text', 
            sortable : true, 
            width: 120, 
            headerAlign: 'center',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                if(params.row.datecin !== null){
                    return (
                        <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                            <div>{format(params.row.datecin, "dd/MM/yyyy")}</div>
                        </Stack>
                    )
                }
            }
        },
        {
            field: 'autrepieceid', 
            headerName: <strong>Autre pièces Ident.</strong>, 
            type: 'text', 
            sortable : true, 
            width: 200, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'refpieceid', 
            headerName: <strong>Réf pièces Ident.</strong>, 
            type: 'text', 
            sortable : true, 
            width: 200, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'adressesansnif', 
            headerName: <strong>Adresse CIN</strong>, 
            type: 'text', 
            sortable : true, 
            width: 250, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'nifrepresentant', 
            headerName: <strong>NIF représentant</strong>, 
            type: 'text', 
            sortable : true, 
            width: 175, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'addresseetranger', 
            headerName: <strong>adresse représentant</strong>, 
            type: 'text', 
            sortable : true, 
            width: 250, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'pays', 
            headerName: <strong>Pays</strong>, 
            type: 'text', 
            sortable : true, 
            width: 150, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        },
        {
            field: 'motcle', 
            headerName: <strong>Mot clé</strong>, 
            type: 'string', 
            sortable : true, 
            width: 150, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor'
        }
      ]

    //header pour le tableau ajouter compte de charge et/ou compte de TVA dans le popup
    //const columnHeaderAddNewRowModelDetail = ParamPlanComptable_column.columnHeaderAddNewRowModelDetail;
    const columnHeaderAddNewRowModelDetail = [
        {
          field: 'compte', 
          headerName: "Compte", 
          type: 'string', 
          sortable : true, 
          width: 200, 
          headerAlign: 'left',
          headerClassName: 'HeaderbackColor',
          editable: false,
        },
        {
            field: 'libelle', 
            headerName: "Libellé", 
            type: 'string', 
            sortable : true, 
            width: 850, 
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            editable: false
          },
      ]

    //paramètres de connexion------------------------------------
    const decoded = auth?.accessToken
        ? jwtDecode(auth.accessToken)
        : undefined
    const compteId = decoded.UserInfo.compteId || 0;
    const userId = decoded.UserInfo.userId || 0;

    //Récupération de l'ID du dossier
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
            }else{
                sessionStorage.setItem('fileId',id);
                setFileId(id);
                idFile = id;
            }
        }
        GetInfosIdDossier(idFile);
    }, []);

    const GetInfosIdDossier = (id) => {
        axios.get(`/home/FileInfos/${id}`).then((response) =>{
            const resData = response.data;

            if(resData.state){
                setFileInfos(resData.fileInfos[0]);
                setNoFile(false);
            }else{
                setFileInfos([]);
                setNoFile(true);
            }
        })
    }

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

    //Affichage du plan comptable
    const showPc = () => {
        axios.post(`/paramPlanComptable/pc`, {fileId}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                setPc(resData.liste);
            }else{
                toast.error(resData.msg);
            }
        })
    }

    useEffect(() => {
        showPc();
    },[fileId]);

    //Ajouter un compte dans la liste du plan comptable
    const handleCloseDialogAddCpt = () => {
        setOpenDialogAddCpt(false);
    }

    const handleOpenDialogAddCpt = (setFieldValue, resetForm) => () => {
        resetForm();
        setListCptChg([]);
        setListCptTva([]);

        setFieldValue("action", "new");
        setFieldValue("idCompte", Number(compteId));
        setFieldValue("idDossier", fileId);

        setFormulaireTier('sans-nif');
        recupererListeCptCollectif();
        setTypeCptGeneral(true);
        setOpenDialogAddCpt(true);
    }

    const handleOpenDialogCptModify = (setFieldValue) => () => {
        recupererListeCptCollectif();

        setFieldValue("action", "modify");
        setFieldValue("itemId", selectedRow.id);
        setFieldValue("idCompte", Number(compteId));
        setFieldValue("idDossier", fileId);
        setFieldValue("compte", selectedRow.compte);
        setFieldValue("libelle", selectedRow.libelle);
        setFieldValue("nature", selectedRow.nature);
        setFieldValue("baseCptCollectif", selectedRow.baseaux);
        setFieldValue("typeTier", selectedRow.typetier);

        setFormulaireTier(selectedRow.typetier);

        setFieldValue("nif", selectedRow.nif);
        setFieldValue("stat", selectedRow.stat);
        setFieldValue("adresse", selectedRow.adresse);
        setFieldValue("motcle", selectedRow.motcle);
        setFieldValue("cin", selectedRow.cin);
        setFieldValue("dateCin", selectedRow.datecin? format(selectedRow?.datecin,'yyyy-MM-dd'): null);
        setFieldValue("autrePieceID", selectedRow.autrepieceid);
        setFieldValue("refPieceID", selectedRow.refpieceid);
        setFieldValue("adresseSansNIF", selectedRow.adressesansnif);
        setFieldValue("nifRepresentant", selectedRow.nifrepresentant);
        setFieldValue("adresseEtranger", selectedRow.adresseetranger);
        setFieldValue("pays", selectedRow.pays);
        setFieldValue("listeCptChg", listCptChg);
        setFieldValue("listeCptTva", listCptTva);

        //Activer ou non la listbox base compte auxiliaire
        if(selectedRow.nature === 'General' || selectedRow.nature === 'Collectif'){
            setTypeCptGeneral(true);
        }else{
            setTypeCptGeneral(false);
        }
       
        setOpenDialogAddCpt(true);
    }

     //Choix TAB value pour dialog ajout de nouvelle ligne du tableau détail modèle plan comptable
     const handleChangeTabValueAjoutNewRow = (event, newValue) => {
        setTabValueAjoutNewRow(newValue);
     };

    const formAddCptInitialValues = {
        action:'new',
        itemId:0,
        idCompte: 0,
        idDossier: 0,
        compte:'',
        libelle:'',
        nature:'General',
        baseCptCollectif:'',
        typeTier:'sans-nif',
        nif:'',
        stat:'',
        adresse:'',
        motcle: '',
        cin:'',
        dateCin:'',
        autrePieceID:'',
        refPieceID:'',
        adresseSansNIF:'',
        nifRepresentant:'',
        adresseEtranger:'',
        pays:'',
        listeCptChg:[],
        listeCptTva:[],
    };

    const formAddCptValidationSchema = Yup.object({
        compte: Yup.string().required("Veuillez tapez un numéro de compte"),
        libelle: Yup.string().required("Veuillez insérer un libellé pour le numéro de compte"),
        nature: Yup.string().required("Veuillez séléctionner dans la liste la nature du compte"),
        baseCptCollectif: Yup.string()
            .when('nature', {
                is: (value) => value === 'Aux',
                then: () => Yup.string().required("Veuillez ajouter la base du compte auxiliaire"),
                otherwise: () => Yup.string().notRequired(),
            }),
        nif: Yup.string()
            .when('typeTier', {
                is: (value) => value === 'avec-nif',
                then: () => Yup.string().required("Veuillez ajouter le numéro NIF du tier").min(10,'Veuillez bien formater le numéro NIF'),
                otherwise: () => Yup.string().notRequired(),
            }),
        dateCin: Yup.string()
            .when('typeTier', {
                is: (value) => value === 'sans-nif',
                then: () => Yup.string()
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
            otherwise: () => Yup.string().notRequired(),
        })
    });

    const formAddCpthandleSubmit = (values) => {
        axios.post(`/paramPlanComptable/AddCpt`, values).then((response) =>{
            const resData = response.data;
            if(resData.state === true){
                showPc(modelId);
                toast.success(resData.msg);
            }else{
                toast.error(resData.msg);
            }
            setOpenDialogAddCpt(false);
        });
    }

    //Action pour disable ou enable base compte collectif dans le formulaire nouveau compte pour le modèle
    const handleChangeListBoxNature = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('nature', value)
        if(value === 'General' || value === 'Collectif'){
            setTypeCptGeneral(true);
        }else{
            setTypeCptGeneral(false);
        }
    }

    //Action pour sauvegarder le choix base compte auxiliaire
    const handleChangeListBoxBaseCompteAux = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('baseCptCollectif', value)
    }

    //gestion tableau ajout compte de charge associé au nouveau compte à créer
    const handleOpenDialogAddNewCptAss = () => {
        const result = pc?.filter((item) => item.nature === 'General');
        setPcHorsCollectif(result);
        setOpenDialogAddNewCptAssoc(true);
    }

    const handleCloseDialogAddNewCptAss = () => {
        setOpenDialogAddNewCptAssoc(false);
    }

    const saveCptChg = (cpt_id) => {
        const libelle = pc?.find((item) => item.id === cpt_id);
        setSelectedCptAssocChg({idCpt: cpt_id ,compte: libelle.compte , libelle : libelle.libelle});
    }

    const AddCptToTableCptChg = (setFieldValue) => () =>{
        let interm = [...listCptChg];
        interm.push({id: listCptChg.length + 1, idCpt: selectedCptAssocChg.idCpt, compte: selectedCptAssocChg.compte, libelle: selectedCptAssocChg.libelle});
        setListCptChg(interm);

        const newRow = {id: listCptChg.length+1, idCpt: selectedCptAssocChg.idCpt, compte: selectedCptAssocChg.compte, libelle: selectedCptAssocChg.libelle};
        
        setFieldValue('listeCptChg', interm);
        handleCloseDialogAddNewCptAss();
    }
    
    const deleteCptFromTableCptChg = (setFieldValue, index, confirmDeleteCptChg) =>{
        const rowId = index[0];

        if(rowId > 0){
            if(confirmDeleteCptChg){
            const newListChg = listCptChg.filter((i) => i.id !== rowId);
            setFieldValue('listeCptChg', newListChg);
            setListCptChg(newListChg);
            toast.success('Le compte a été supprimé avec succès.');
            }
        }else{
            toast.error('Veuillez sélectionner un compte.');
        }
    }

    const deleteCptChgPC = (setFieldValue) => (newState) => {
        deleteCptFromTableCptChg(setFieldValue,selectedCptChgOnList, newState);
        handleCloseDialogConfirmDeleteCptChgFromDialogAddNewCpte();
    }

    const handleOpenDialogConfirmDeleteCptChgFromDialogAddNewCpte = () => {
        setOpenDialogDeleteCptChgFromAddNewCpt(true);
    }

    const handleCloseDialogConfirmDeleteCptChgFromDialogAddNewCpte = () => {
        setOpenDialogDeleteCptChgFromAddNewCpt(false);
    }

    //gestion tableau ajout compte de TVA associé au nouveau compte à créer
    const handleOpenDialogAddNewCptTvaToCpt = () => {
        const prefixes = ['4456', '4457'];
        //const result = pc?.filter((item) => prefixes.some((prefix) => item.compte.startsWith(prefix)) && item.nature === 'General');
        const result = pc?.filter(item => item.compte.startsWith('4456') || item.compte.startsWith('4457'));
        setPcOnlyCptTva(result);
        setOpenDialogAddNewCptTvaToCpt(true);
    }

    //gestion tableau ajout compte de TVA associé au nouveau compte à créer
    const recupererListeCptCollectif = () => {
        const result = pc?.filter(item => item.nature === 'Collectif');
        setListeCptCollectif(result);
    }

    const handleCloseDialogAddNewCptTvaToCpt = () => {
        setOpenDialogAddNewCptTvaToCpt(false);
    }

    const saveCptTva = (cpt_id) => {
        const libelle = pc?.find((item) => item.id === cpt_id);
        setSelectedCptAssocTva({idCpt: cpt_id, compte: libelle.compte , libelle : libelle.libelle});
    }

    const AddCptToTableCptTva = (setFieldValue) => () =>{
        let interm = [...listCptTva];
        interm.push({id: listCptTva.length + 1, idCpt: selectedCptAssocTva.idCpt, compte: selectedCptAssocTva.compte, libelle: selectedCptAssocTva.libelle});
        setListCptTva(interm);

        //const newRow = {id: listCptTva.length+1, idCpt: selectedCptAssocTva.idCpt, compte: selectedCptAssocTva.compte, libelle: selectedCptAssocTva.libelle};
        setFieldValue('listeCptTva', interm);
        handleCloseDialogAddNewCptTvaToCpt();
    }
    
    const deleteCptFromTableCptTva = (setFieldValue, index, confirmDeleteCptTva) =>{
        const rowId = index[0];

        if(rowId > 0){
            if(confirmDeleteCptTva){
            const newListTva = listCptTva.filter((i) => i.id !== rowId);

            setFieldValue('listeCptTva', newListTva);
            setListCptTva(newListTva);
            toast.success('Le compte a été supprimé avec succès.');
            }
        }else{
            toast.error('Veuillez sélectionner un compte.');
        }
    }

    const deleteCptTvaPC = (setFieldValue) => (newState) => {
        deleteCptFromTableCptTva(setFieldValue, selectedCptTvaOnList, newState);
        handleCloseDialogConfirmDeleteCptTvaFromDialogAddNewCpte();
    }

    const handleOpenDialogConfirmDeleteCptTvaFromDialogAddNewCpte = () => {
        setOpenDialogDeleteCptTvaFromAddNewCpt(true);
    }

    const handleCloseDialogConfirmDeleteCptTvaFromDialogAddNewCpte = () => {
        setOpenDialogDeleteCptTvaFromAddNewCpt(false);
    }

    //Gestion formulaire de remplissage infos tiers dans la création d'un nouveau compte pour le modèle sélectionné
    const handleOnChangeListBoxTypeTier = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('typeTier', value);
        setFormulaireTier(value);
    }

    //Récupération de l'ID de la ligne sélectionner dans le tableau détail du modèle sélectionné
    const listPCSelectedRow = (selectedRow) => {
        const itemId = selectedRow[0];
        setPcAllselectedRow(selectedRow);

        const itemInfos = pc.find(row => row.id === itemId);
        if(itemInfos){
            setSelectedRow(itemInfos);

            //récupérer la liste des comptes de charges et compte de TVA associées à la ligne sélectionnée
            axios.get(`/paramPlanComptable/keepListCptChgTvaAssoc/${itemId}`).then((response) =>{
                const resData = response.data;
                if(resData.state){
                    setListCptChg(resData.detailChg);
                    setListCptTva(resData.detailTva);
                }else{
                    toast.error(resData.msg);
                }
            })
        }
    }

    //Suppression des comptes sélectionnés dans le tableau du plan comptable
    const handleOpenDialogCptDelete = () => {
        setOpenDialogDeleteItemsPc(true);
    }

    const deleteItemsPC = (value) =>{
        if(value === true){
            if(pcAllselectedRow.length >= 1){
                const listId = pcAllselectedRow;
                
                axios.post(`/paramPlanComptable/deleteItemPc`, {listId, compteId, fileId}).then((response) =>{
                    const resData = response.data;
                    showPc(modelId);
                    setOpenDialogDeleteItemsPc(false);
                    if(resData.state){
                        toast.success(resData.msg);
                    }else{
                        toast.error(resData.msg);
                    }

                    if(resData.stateUndeletableCpt){
                        toast.error(resData.msgUndeletableCpt);
                    }
                });
                
            }else{
                toast.error("Veuillez sélectionner au moins une ligne dans le tableau plan comptable.");
            }
        }else{
            setOpenDialogDeleteItemsPc(false);
        }
    }

    const handleShowCptInfos = (row) => {
        const itemId = row.id;
        //récupérer la liste des comptes de charges et compte de TVA associées à la ligne sélectionnée
        axios.get(`/paramPlanComptable/keepListCptChgTvaAssoc/${itemId}`).then((response) =>{
            const resData = response.data;
            if(resData.state){
                setListCptChg(resData.detailChg);
                setListCptTva(resData.detailTva);
                setRowCptInfos(row);
                // let rowDetailInfos = '';
                // rowDetailInfos = `Compte: ${row.compte}` ;
                // rowDetailInfos = `${rowDetailInfos} Libellé: ${row.libelle} \n`;
                

                // setCptInfos(rowDetailInfos);
                setOpenInfos(true);
            }else{
                toast.error(resData.msg);
            }
        })
    }

    const showCptInfos = (state) => {
        setOpenInfos(state);
    }

  return (
    <Paper sx={{elevation: "3", margin:"5px", padding:"10px", width:"100%", height:"110%"}}>
        {noFile? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
        {openInfos? <DetailsInformation infos={cptInfos} row={rowCptInfos} confirmOpen={showCptInfos} listCptChg={listCptChg} listCptTva={listCptTva}/> : null}

        <TabContext value={"1"}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList aria-label="lab API tabs example">
                <Tab 
                    style={{ 
                        textTransform: 'none', 
                        outline: 'none', 
                        border: 'none',
                        margin:-5
                    }}
                    label={InfoFileStyle(fileInfos?.dossier)} value="1" 
                />
            </TabList>
            </Box>
            <TabPanel value="1">
                <Stack width={"100%"} height={"90%"} spacing={0.5} alignItems={"flex-start"} justifyContent={"stretch"}>
                    <Typography variant='h6' sx={{color: "black"}} align='left'>Paramétrages : Plan comptable</Typography>
                    
                    {/* MODAL POUR L'AJOUT/MODIFICATION D'UN NOUVEAU COMPTE */}
                    {/* <form onSubmit={formAddCptModelDetail.handleSubmit}> */}
                        <Formik
                            initialValues={formAddCptInitialValues}
                            validationSchema={formAddCptValidationSchema}
                            onSubmit = {(values) =>{
                                formAddCpthandleSubmit(values);
                                //();
                            }}
                        >
                            {({handleChange, handleSubmit, setFieldValue, resetForm}) => {
                                // useEffect(() => {
                                //     if (openDialogAddNewCptAssoc) {
                                //         resetForm();
                                //     }
                                // }, [openDialogAddNewCptAssoc, resetForm]);
                                
                                return(
                                <Form style={{width:'100%'}}>
                                    <Stack width={"100%"} height={"30px"} spacing={0} alignItems={"center"} alignContent={"center"} 
                                    direction={"row"} style={{marginLeft:"0px", marginTop:"30px", justifyContent:"right"}}>
                                    
                                    <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"} 
                                    direction={"row"} justifyContent={"right"}>
                                        <Tooltip title="Ajouter un nouveau compte">
                                            <IconButton
                                            // disabled={statutDeleteButton}  
                                            onClick={handleOpenDialogAddCpt(setFieldValue, resetForm)} 
                                            variant="contained" 
                                            style={{width:"35px", height:'35px', 
                                                borderRadius:"5px", borderColor: "transparent", 
                                                backgroundColor: initial.theme,
                                                textTransform: 'none', outline: 'none'
                                            }}
                                            >
                                                <TbPlaylistAdd style={{width:'25px', height:'25px', color:'white'}}/>
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Modifier le compte sélectionné">
                                            <IconButton
                                            onClick={handleOpenDialogCptModify(setFieldValue)} 
                                            variant="contained" 
                                            style={{width:"35px", height:'35px', 
                                                borderRadius:"5px", borderColor: "transparent",
                                                backgroundColor: initial.theme,
                                                textTransform: 'none', outline: 'none'
                                                }}
                                            >
                                                <FaRegPenToSquare style={{width:'25px', height:'25px', color:'white'}}/>
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Supprimer le compte sélectionné">
                                            <span>
                                                <IconButton 
                                                onClick={handleOpenDialogCptDelete} 
                                                variant="contained" 
                                                style={{width:"35px", height:'35px', 
                                                    borderRadius:"5px", borderColor: "transparent",
                                                    backgroundColor: initial.button_delete_color,
                                                    textTransform: 'none', outline: 'none'
                                                }}
                                                >
                                                    <IoMdTrash style={{width:'40px', height:'40px',color: 'white'}}/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                                    <BootstrapDialog
                                        onClose={handleCloseDialogAddCpt}
                                        aria-labelledby="customized-dialog-title"
                                        open={openDialogAddCpt}
                                        fullWidth={true}
                                        maxWidth={"lg"}
                                    >
                                        {/* <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontWeight:'normal', width:'100%', height:'55px', backgroundColor : initial.normal_pupup_header_color}}>
                                            <Typography variant='h8'>Ajout d'un nouveau compte pour le modèle : {selectedModelName}</Typography>
                                        </DialogTitle> */}
                                        <IconButton
                                            style={{color:'red', textTransform: 'none', outline: 'none'}}
                                            aria-label="close"
                                            onClick={handleCloseDialogAddCpt}
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: 8,
                                                color: (theme) => theme.palette.grey[500],
                                            }}
                                            >
                                            <CloseIcon />
                                        </IconButton>

                                        <Typography style={{marginTop: 75, marginLeft: 30}} variant='h5'>Création d'un nouveau compte</Typography>

                                        <DialogContent style={{width:"100%"}}>
                                        
                                        <Stack width={"100%"} height={"650px"} spacing={0} alignItems={'start'} alignContent={"center"} 
                                        direction={"column"} justifyContent={"left"} style={{marginLeft:'0px'}}>
                                            <Box sx={{ width: '100%', typography: 'body1' }}>
                                                <TabContext value={tabValueAjoutNewRow} sx={{width:'100%'}}>
                                                    <Box sx={{ borderBottom: 1, borderColor: 'transparent' }}>
                                                        <TabList onChange={handleChangeTabValueAjoutNewRow} aria-label="lab API tabs example" variant='scrollable'>
                                                            <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="infos générales" value="1" />
                                                            <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Compte de charges" value="2" />
                                                            <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Compte de TVA" value="3" />
                                                        </TabList>
                                                    </Box>

                                                    <TabPanel value="1">
                                                        <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"} 
                                                            alignContent={"flex-start"} justifyContent={"stretch"} >
                                                            <Stack direction={'row'} alignContent={'end'} 
                                                            alignItems={'end'} justifyContent={'end'} spacing={5}
                                                            style={{backgroundColor: 'transparent'}}
                                                            >
                                                                <Stack spacing={-0.5}>
                                                                    <label htmlFor="nature" style={{fontSize:12, color: '#3FA2F6'}}>Nature</label>
                                                                    <Field
                                                                    as={Select}
                                                                    labelId="nature-label"
                                                                    name="nature"
                                                                    onChange={handleChangeListBoxNature(setFieldValue)}
                                                                    sx={{
                                                                        borderRadius:0,
                                                                        width:200,
                                                                        height:40,
                                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                                            borderTop: 'none', // Supprime le cadre
                                                                            borderLeft: 'none',
                                                                            borderRight: 'none',
                                                                            borderWidth:'0.5px'
                                                                        },
                                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                            borderTop: 'none', // Supprime le cadre
                                                                            borderLeft: 'none',
                                                                            borderRight: 'none',
                                                                            borderWidth:'0.5px'
                                                                        },
                                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                            borderTop: 'none', // Supprime le cadre
                                                                            borderLeft: 'none',
                                                                            borderRight: 'none',
                                                                            borderWidth:'0.5px'
                                                                        },
                                                                    }}
                                                                    >
                                                                        <MenuItem value={"General"}>Compte général</MenuItem>
                                                                        <MenuItem value={"Collectif"}>Compte collectif</MenuItem>
                                                                        <MenuItem value={"Aux"}>Compte auxiliaire</MenuItem>
                                                                    </Field>
                                                                    <ErrorMessage name='nature' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                </Stack>

                                                                <Stack spacing={-0.5}>
                                                                    <label htmlFor="baseCptCollectif" style={{fontSize:12, color: '#3FA2F6'}}>Centralisation/Base compte auxiliaire</label>
                                                                    <Field
                                                                    disabled={typeCptGeneral}
                                                                    as={Select}
                                                                    labelId="baseCptCollectif-label"
                                                                    name="baseCptCollectif"
                                                                    onChange={handleChangeListBoxBaseCompteAux(setFieldValue)}
                                                                    sx={{
                                                                        borderRadius:0,
                                                                        width:500,
                                                                        height:40,
                                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                                            borderTop: 'none', // Supprime le cadre
                                                                            borderLeft: 'none',
                                                                            borderRight: 'none',
                                                                            borderWidth:'0.5px'
                                                                        },
                                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                            borderTop: 'none', // Supprime le cadre
                                                                            borderLeft: 'none',
                                                                            borderRight: 'none',
                                                                            borderWidth:'0.5px'
                                                                        },
                                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                            borderTop: 'none', // Supprime le cadre
                                                                            borderLeft: 'none',
                                                                            borderRight: 'none',
                                                                            borderWidth:'0.5px'
                                                                        },
                                                                    }}
                                                                    >
                                                                        {listeCptCollectif?.map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>{item.compte} {item.libelle}</MenuItem>
                                                                            ))
                                                                        }
                                                                    </Field>
                                                                    <ErrorMessage name='baseCptCollectif' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                </Stack>

                                                                {/* <Stack spacing={1.5}>
                                                                    <label htmlFor="baseCptCollectif" style={{fontSize:12, color: '#3FA2F6'}}>base compte collectif</label>
                                                                    <Field
                                                                    disabled={typeCptGeneral}
                                                                    name='baseCptCollectif'
                                                                    onChange={handleChange}
                                                                    type='text'
                                                                    placeholder=""
                                                                    style={{height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                    />
                                                                    <ErrorMessage name='baseCptCollectif' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                </Stack> */}
                                                            </Stack>
                                                            
                                                            <Stack direction={'row'} alignContent={'stard'} 
                                                            alignItems={'start'} spacing={5}
                                                            style={{backgroundColor:'transparent', width:'800px'}}
                                                            >
                                                                <Stack spacing={1}>
                                                                    <label htmlFor="compte" style={{fontSize:12, color: '#3FA2F6'}}>compte</label>
                                                                    <Field
                                                                    name='compte'
                                                                    onChange={handleChange}
                                                                    type='text'
                                                                    placeholder=""
                                                                    style={{height:22, borderTop: 'none',
                                                                        borderLeft: 'none',borderRight: 'none', 
                                                                        outline: 'none', fontSize:14, borderWidth:'0.5px',
                                                                        width:200,
                                                                    }}
                                                                    />
                                                                    <ErrorMessage name='compte' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                </Stack>

                                                                <Stack spacing={1}>
                                                                    <label htmlFor="libelle" style={{fontSize:12, color: '#3FA2F6'}}>libellé / raison sociale</label>
                                                                    <Field
                                                                    name='libelle'
                                                                    onChange={handleChange}
                                                                    type='text'
                                                                    placeholder=""
                                                                    style={{width: 500, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                    />
                                                                    <ErrorMessage name='libelle' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                </Stack>
                                                            </Stack>

                                                            <Stack spacing={-0.5} style={{marginTop:50}}>
                                                                <label htmlFor="typeTier" style={{fontSize:12, color: '#3FA2F6'}}>Type du tier</label>
                                                                <Field
                                                                as={Select}
                                                                labelId="typeTier-label"
                                                                name="typeTier"
                                                                onChange={handleOnChangeListBoxTypeTier(setFieldValue)}
                                                                sx={{
                                                                    borderRadius:0,
                                                                    width:200,
                                                                    height:40,
                                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                                        borderTop: 'none', // Supprime le cadre
                                                                        borderLeft: 'none',
                                                                        borderRight: 'none',
                                                                        borderWidth:'0.5px'
                                                                    },
                                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                        borderTop: 'none', // Supprime le cadre
                                                                        borderLeft: 'none',
                                                                        borderRight: 'none',
                                                                        borderWidth:'0.5px'
                                                                    },
                                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                        borderTop: 'none', // Supprime le cadre
                                                                        borderLeft: 'none',
                                                                        borderRight: 'none',
                                                                        borderWidth:'0.5px'
                                                                    },
                                                                }}
                                                                >
                                                                    <MenuItem key={"sans-nif"} value={"sans-nif"}>Sans NIF</MenuItem>
                                                                    <MenuItem key={"avec-nif"} value={"avec-nif"}>Avec NIF</MenuItem>
                                                                    <MenuItem key={"etranger"} value={"etranger"}>Etranger</MenuItem>
                                                                    <MenuItem key={"general"} value={"general"}>Général</MenuItem>
                                                                </Field>
                                                                <ErrorMessage name='typeTier' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                            </Stack>
                                                            
                                                            <Stack >
                                                                {formulaireTier ==='sans-nif'
                                                                    ?   <Stack margin={"0px"} alignContent={"start"} alignItems={"start"}>
                                                                            <Stack direction={'row'} alignContent={'stard'} 
                                                                            alignItems={'start'} spacing={6.5}
                                                                            style={{backgroundColor:'transparent', width:'800px'}}
                                                                            >
                                                                                <Stack spacing={1.5}>
                                                                                    <label htmlFor="cin" style={{fontSize:12, color: '#3FA2F6'}}>cin</label>
                                                                                    <Field
                                                                                    name='cin'
                                                                                    onChange={handleChange}
                                                                                    type='text'
                                                                                    placeholder=""
                                                                                    style={{width: 200, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                    />
                                                                                    <ErrorMessage name='cin' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                </Stack>

                                                                                <Stack spacing={1.5}>
                                                                                    <label htmlFor="dateCin" style={{fontSize:12, color: '#3FA2F6'}}>date cin</label>
                                                                                    <Field
                                                                                    name='dateCin'
                                                                                    onChange={handleChange}
                                                                                    type='date'
                                                                                    placeholder=""
                                                                                    style={{width: 100, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                    />
                                                                                    <ErrorMessage name='dateCin' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                </Stack>
                                                                            </Stack>

                                                                            <Stack direction={'row'} alignContent={'stard'} 
                                                                            alignItems={'start'} spacing={6.5}
                                                                            style={{backgroundColor:'transparent', width:'800px', marginTop:'10px'}}
                                                                            >
                                                                                <Stack spacing={1.5}>
                                                                                    <label htmlFor="autrePieceID" style={{fontSize:12, color: '#3FA2F6'}}>Autres pièces d'identité si pas de CIN</label>
                                                                                    <Field
                                                                                    name='autrePieceID'
                                                                                    onChange={handleChange}
                                                                                    type='text'
                                                                                    placeholder=""
                                                                                    style={{width: 400, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                    />
                                                                                    <ErrorMessage name='autrePieceID' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                </Stack>

                                                                                <Stack spacing={1.5}>
                                                                                    <label htmlFor="refPieceID" style={{fontSize:12, color: '#3FA2F6'}}>Référence pièce d'identité</label>
                                                                                    <Field
                                                                                    name='refPieceID'
                                                                                    onChange={handleChange}
                                                                                    type='text'
                                                                                    placeholder=""
                                                                                    style={{width: 200, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                    />
                                                                                    <ErrorMessage name='refPieceID' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                </Stack>
                                                                            </Stack>

                                                                            <Stack spacing={1.5} style={{marginTop:15}}>
                                                                                <label htmlFor="adresseSansNIF" style={{fontSize:12, color: '#3FA2F6'}}>Adresse</label>
                                                                                <Field
                                                                                name='adresseSansNIF'
                                                                                onChange={handleChange}
                                                                                type='text'
                                                                                placeholder=""
                                                                                style={{width: 200, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                />
                                                                                <ErrorMessage name='adresseSansNIF' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                            </Stack>
                                                                        </Stack>
                                                                    : formulaireTier ==='avec-nif'
                                                                            ?   <Stack >
                                                                                    <Stack spacing={1.5} style={{marginTop:15}}>
                                                                                        <label htmlFor="nif" style={{fontSize:12, color: '#3FA2F6'}}>Nif</label>
                                                                                        <Field
                                                                                        name='nif'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        style={{width: 200, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                        />
                                                                                        <ErrorMessage name='nif' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                    </Stack>

                                                                                    <Stack spacing={1.5} style={{marginTop:15}}>
                                                                                        <label htmlFor="stat" style={{fontSize:12, color: '#3FA2F6'}}>N° statistique</label>
                                                                                        <Field
                                                                                        name='stat'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        style={{width: 200, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                        />
                                                                                        <ErrorMessage name='stat' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                    </Stack>

                                                                                    <Stack spacing={1.5} style={{marginTop:15}}>
                                                                                        <label htmlFor="adresse" style={{fontSize:12, color: '#3FA2F6'}}>Adresse</label>
                                                                                        <Field
                                                                                        name='adresse'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        style={{width: 200, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                        />
                                                                                        <ErrorMessage name='adresse' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                    </Stack>
                                                                                </Stack>
                                                                            : formulaireTier ==='etranger'
                                                                                ? <Stack margin={"0px"} alignContent={"start"} alignItems={"start"}>
                                                                                    <Stack spacing={1.5} style={{marginTop:15}}>
                                                                                        <label htmlFor="nifRepresentant" style={{fontSize:12, color: '#3FA2F6'}}>Nif du représentant</label>
                                                                                        <Field
                                                                                        name='nifRepresentant'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        style={{width: 300, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                        />
                                                                                        <ErrorMessage name='nifRepresentant' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                    </Stack>

                                                                                    <Stack spacing={1.5} style={{marginTop:15}}>
                                                                                        <label htmlFor="adresseEtranger" style={{fontSize:12, color: '#3FA2F6'}}>Adresse</label>
                                                                                        <Field
                                                                                        name='adresseEtranger'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        style={{width: 400, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                        />
                                                                                        <ErrorMessage name='adresseEtranger' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                    </Stack>

                                                                                    <Stack spacing={1.5} style={{marginTop:15}}>
                                                                                        <label htmlFor="pays" style={{fontSize:12, color: '#3FA2F6'}}>Pays</label>
                                                                                        <Field
                                                                                        name='pays'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        style={{width: 250, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                                        />
                                                                                        <ErrorMessage name='pays' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                                                    </Stack>
                                                                                </Stack>
                                                                                : null
                                                                }
                                                            </Stack>

                                                            <Stack spacing={1.5} style={{marginTop:15}}>
                                                                <label htmlFor="motcle" style={{fontSize:12, color: '#3FA2F6'}}>Mot clé</label>
                                                                <Field
                                                                name='motcle'
                                                                onChange={handleChange}
                                                                type='text'
                                                                placeholder=""
                                                                style={{width: 200, height:22, borderTop: 'none',borderLeft: 'none',borderRight: 'none', outline: 'none', fontSize:14, borderWidth:'0.5px' }}
                                                                />
                                                                <ErrorMessage name='motcle' component="div" style={{ color: 'red', fontSize:12, marginTop:-2 }}/>
                                                            </Stack>
                                                        </Stack>
                                                    </TabPanel>

                                                    <TabPanel value="2">
                                                        <Stack width={"100%"} height={"100%"} spacing={0}>
                                                            
                                                            <Stack width={"100%"} height={"20%"} spacing={1} alignItems={'end'} alignContent={'end'} 
                                                            direction={"row"} justifyContent={'end'}> 
                                                                
                                                                <Tooltip title="Ajouter un nouveau compte">
                                                                    <IconButton
                                                                    variant="contained" 
                                                                    style={{width:"35px", height:'35px', 
                                                                        borderRadius:"5px", borderColor: "transparent", 
                                                                        backgroundColor: initial.theme,
                                                                        textTransform: 'none', outline: 'none'
                                                                    }}
                                                                    onClick={handleOpenDialogAddNewCptAss }
                                                                    >
                                                                        <TbPlaylistAdd style={{width:'25px', height:'25px', color:'white'}}/>
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Supprimer le compte sélectionné">
                                                                    <span>
                                                                        <IconButton 
                                                                        onClick={handleOpenDialogConfirmDeleteCptChgFromDialogAddNewCpte}
                                                                        variant="contained" 
                                                                        style={{width:"35px", height:'35px', 
                                                                            borderRadius:"5px", borderColor: "transparent",
                                                                            backgroundColor: initial.button_delete_color,
                                                                            textTransform: 'none', outline: 'none'
                                                                        }}
                                                                        >
                                                                            <IoMdTrash style={{width:'40px', height:'40px',color: 'white'}}/>
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </Stack>

                                                            <Stack width={"100%"} height={"500px"}>
                                                                <DataGrid
                                                                disableMultipleSelection = {DataGridStyle.disableMultipleSelection}
                                                                disableColumnSelector = {DataGridStyle.disableColumnSelector}
                                                                disableDensitySelector = {DataGridStyle.disableDensitySelector}
                                                                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                                                disableRowSelectionOnClick
                                                                disableSelectionOnClick={true}
                                                                slots={{toolbar : QuickFilter}}
                                                                sx={ DataGridStyle.sx}
                                                                rowHeight= {DataGridStyle.rowHeight}
                                                                columnHeaderHeight= {DataGridStyle.columnHeaderHeight}
                                                                onRowSelectionModelChange={ids => {
                                                                    
                                                                    if(ids.length === 1){
                                                                        //setDisableButtonAddCompteCharge(false);
                                                                        setSelectedCptChgOnList(ids);
                                                                    }else{
                                                                        setSelectedCptChgOnList([0]);
                                                                    }
                                                                }}
                                                                rows={listCptChg}
                                                                columns={columnHeaderAddNewRowModelDetail}
                                                                initialState={{
                                                                    pagination: {
                                                                        paginationModel: { page: 0, pageSize: 100 },
                                                                    },
                                                                }}
                                                                pageSizeOptions={[50, 100]}
                                                                pagination={DataGridStyle.pagination}
                                                                checkboxSelection = {DataGridStyle.checkboxSelection}
                                                                columnVisibilityModel={{
                                                                    id: false,
                                                                }}
                                                                />     
                                                            </Stack>
                                                            
                                                        </Stack>
                                                    </TabPanel>

                                                    <TabPanel value="3">
                                                        <Stack width={"100%"} height={"100%"} spacing={0} alignItems={"flex-start"}>
                                                            <Stack width={"100%"} height={"40px"} spacing={1} alignItems={'end'} alignContent={'end'} 
                                                            direction={"row"} justifyContent={'end'}> 
                                                                <Tooltip title="Ajouter un nouveau compte">
                                                                    <IconButton
                                                                    onClick={handleOpenDialogAddNewCptTvaToCpt }
                                                                    variant="contained" 
                                                                    style={{width:"35px", height:'35px', 
                                                                        borderRadius:"5px", borderColor: "transparent", 
                                                                        backgroundColor: initial.theme,
                                                                        textTransform: 'none', outline: 'none'
                                                                    }}
                                                                    >
                                                                        <TbPlaylistAdd style={{width:'25px', height:'25px', color:'white'}}/>
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Supprimer le compte sélectionné">
                                                                    <span>
                                                                        <IconButton 
                                                                        onClick={handleOpenDialogConfirmDeleteCptTvaFromDialogAddNewCpte}
                                                                        variant="contained" 
                                                                        style={{width:"35px", height:'35px', 
                                                                            borderRadius:"5px", borderColor: "transparent",
                                                                            backgroundColor: initial.button_delete_color,
                                                                            textTransform: 'none', outline: 'none'
                                                                        }}
                                                                        >
                                                                            <IoMdTrash style={{width:'40px', height:'40px',color: 'white'}}/>
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </Stack>

                                                            <Stack width={"100%"} height={"500px"}>
                                                                <DataGrid
                                                                disableMultipleSelection = {DataGridStyle.disableMultipleSelection}
                                                                disableColumnSelector = {DataGridStyle.disableColumnSelector}
                                                                disableDensitySelector = {DataGridStyle.disableDensitySelector}
                                                                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                                                disableRowSelectionOnClick
                                                                disableSelectionOnClick={true}
                                                                slots={{toolbar : QuickFilter}}
                                                                sx={ DataGridStyle.sx}
                                                                rowHeight= {DataGridStyle.rowHeight}
                                                                columnHeaderHeight= {DataGridStyle.columnHeaderHeight}
                                                                onRowSelectionModelChange={ids => {
                                                                    
                                                                    if(ids.length === 1){
                                                                        //setDisableButtonAddCompteTva(false);
                                                                        setSelectedCptTvaOnList(ids);
                                                                    }else{
                                                                        setSelectedCptTvaOnList([0]);
                                                                    }
                                                                }}
                                                                rows={listCptTva}
                                                                columns={columnHeaderAddNewRowModelDetail}
                                                                initialState={{
                                                                    pagination: {
                                                                        paginationModel: { page: 0, pageSize: 100 },
                                                                    },
                                                                }}
                                                                pageSizeOptions={[50, 100]}
                                                                pagination={DataGridStyle.pagination}
                                                                checkboxSelection = {DataGridStyle.checkboxSelection}
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

                                        </DialogContent>
                                        <DialogActions>
                                            <Button autoFocus
                                            variant='outlined'
                                            style={{backgroundColor:'transparent', 
                                                color:initial.theme, 
                                                width:"100px", 
                                                textTransform: 'none', 
                                                // outline: 'none'
                                            }}
                                            type='submit'
                                            onClick={handleCloseDialogAddCpt}
                                            >
                                                Annuler
                                            </Button>
                                            <Button autoFocus
                                            style={{backgroundColor:initial.theme, color:'white', width:"100px", textTransform: 'none', outline: 'none'}}
                                            type='submit'
                                            onClick={handleSubmit}
                                            >
                                                Enregistrer
                                            </Button>
                                        </DialogActions>
                                    </BootstrapDialog>

                                    {/* MODAL POUR AJOUTER UN COMPTE DANS LA LISTE DES COMPTES DE CHARGES RATTACHES AU COMPTE A CREER*/}
                                    <BootstrapDialog
                                        onClose={handleCloseDialogAddNewCptAss }
                                        aria-labelledby="customized-dialog-title"
                                        open={openDialogAddNewCptAssoc}
                                    >
                                        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontWeight:'normal', width:'600px',height:'55px',backgroundColor : initial.normal_pupup_header_color}}>
                                            <Typography variant='h10'>Ajouter un nouveau compte</Typography>
                                        </DialogTitle>
                                        <IconButton
                                            style={{color:'red'}}
                                            aria-label="close"
                                            onClick={handleCloseDialogAddNewCptAss }
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: 8,
                                                color: (theme) => theme.palette.grey[500],
                                            }}
                                            >
                                        <CloseIcon />
                                        </IconButton>
                                        <DialogContent dividers>
                                        
                                        <Stack width={"90%"} height={"150px"} spacing={2} alignItems={'center'} alignContent={"center"} 
                                        direction={"column"} justifyContent={"center"} style={{marginLeft:'10px'}}>
                                            
                                            <FormControl variant="standard" required sx={{ m: 1, minWidth: 250 }}>
                                                <InputLabel id="demo-simple-select-standard-label">Compte</InputLabel>
                                                <Select
                                                labelId="demo-simple-select-standard-labelchg"
                                                id="demo-simple-select-standardchg"
                                                value={selectedCptAssocChg.idCpt}
                                                label={"cptchg"}
                                                onChange={(e) => saveCptChg(e.target.value)}
                                                sx={{width:"500px", display:"flex", justifyContent:"left", alignItems:"flex-start", alignContent:"flex-start", textAlign:"left"}}
                                                >
                                                    <MenuItem key={0} value={''}><em>Aucune sélection</em></MenuItem>
                                                    {pcHorsCollectif.map((cpt) =>(
                                                        <MenuItem key={cpt.id} value={cpt.id}>{cpt.compte}: {cpt.libelle}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Stack>

                                        </DialogContent>
                                        <DialogActions>
                                        <Button autoFocus
                                        style={{backgroundColor:initial.theme, color:'white', width:"100px", textTransform: 'none', outline: 'none'}}
                                        onClick={AddCptToTableCptChg(setFieldValue)}
                                        >
                                            Ajouter
                                        </Button>
                                        </DialogActions>
                                    </BootstrapDialog>

                                    {/* MODAL DE CONFIRMATION DE SUPPRIMER DE COMPTE DE CHARGE RATTACHE AU COMPTE A CREER */}
                                    {openDialogDeleteCptChgFromAddNewCpt ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer le compte sélectionné ?"} confirmationState={deleteCptChgPC(setFieldValue)}/>: null}
                                    
                                    
                                    {/* MODAL POUR AJOUTER UN COMPTE DANS LA LISTE DES COMPTES DE TVA RATTACHES AU COMPTE A CREER*/}
                                    <BootstrapDialog
                                        onClose={handleCloseDialogAddNewCptTvaToCpt }
                                        aria-labelledby="customized-dialog-title"
                                        open={openDialogAddNewCptTvaToCpt}
                                    >
                                        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontWeight:'normal', width:'600px',height:'55px',backgroundColor : initial.normal_pupup_header_color}}>
                                            <Typography variant='h10'>Ajouter un nouveau compte de TVA</Typography>
                                        </DialogTitle>
                                        <IconButton
                                            style={{color:'red'}}
                                            aria-label="close"
                                            onClick={handleCloseDialogAddNewCptTvaToCpt }
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: 8,
                                                color: (theme) => theme.palette.grey[500],
                                            }}
                                            >
                                        <CloseIcon />
                                        </IconButton>
                                        <DialogContent dividers>
                                        
                                        <Stack width={"90%"} height={"150px"} spacing={2} alignItems={'center'} alignContent={"center"} 
                                        direction={"column"} justifyContent={"center"} style={{marginLeft:'10px'}}>
                                            
                                            <FormControl variant="standard" required sx={{ m: 1, minWidth: 250 }}>
                                                <InputLabel id="demo-simple-select-standard-label">Compte</InputLabel>
                                                <Select
                                                labelId="demo-simple-select-standard-labelchg"
                                                id="demo-simple-select-standardchg"
                                                value={selectedCptAssocTva.idCpt}
                                                label={"cptchg"}
                                                onChange={(e) => saveCptTva(e.target.value)}
                                                sx={{width:"500px", display:"flex", justifyContent:"left", alignItems:"flex-start", alignContent:"flex-start", textAlign:"left"}}
                                                >
                                                    <MenuItem key={0} value={''}><em>Aucune sélection</em></MenuItem>
                                                    {pcOnlyCptTva.map((cpt) =>(
                                                        <MenuItem key={cpt.id} value={cpt.id}>{cpt.compte}: {cpt.libelle}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Stack>

                                        </DialogContent>
                                        <DialogActions>
                                        <Button autoFocus
                                        style={{backgroundColor:initial.theme, color:'white', width:"100px", textTransform: 'none', outline: 'none'}}
                                        onClick={AddCptToTableCptTva(setFieldValue)}
                                        >
                                            Ajouter
                                        </Button>
                                        </DialogActions>
                                    </BootstrapDialog>

                                    {/* MODAL DE CONFIRMATION DE SUPPRESSION DE COMPTE DE TVA RATTACHE AU COMPTE A CREER */}
                                    {openDialogDeleteCptTvaFromAddNewCpt ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer le compte sélectionné ?"} confirmationState={deleteCptTvaPC(setFieldValue)}/>: null}
                                </Form>
                            )
                        }}
                    </Formik>
                        
                    {/* MODAL DE CONFIRMATION DE SUPPRESSION D'UN COMPTE DANS LE TABLEAU DU PLAN COMPTABLE */}
                    {openDialogDeleteItemsPc ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer les comptes sélectionnés ?"} confirmationState={deleteItemsPC}/>: null}

                    <Stack height={"70vh"} width={'100%'}>
                        <DataGrid
                            disableMultipleSelection = {DataGridStyle.disableMultipleSelection}
                            disableColumnSelector = {DataGridStyle.disableColumnSelector}
                            disableDensitySelector = {DataGridStyle.disableDensitySelector}
                            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                            disableRowSelectionOnClick
                            disableSelectionOnClick={true}
                            slots={{toolbar : QuickFilter}}
                            sx={ DataGridStyle.sx}
                            rowHeight= {DataGridStyle.rowHeight}
                            columnHeaderHeight= {DataGridStyle.columnHeaderHeight}
                            onRowSelectionModelChange={listPCSelectedRow}
                            rows={pc}
                            columns={columnHeaderDetail}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 100 },
                                },
                            }}
                            experimentalFeatures={{columnPinning: true}}
                            pageSizeOptions={[50, 100]}
                            pagination={DataGridStyle.pagination}
                            checkboxSelection = {DataGridStyle.checkboxSelection}
                            columnVisibilityModel={{
                                id: false,
                            }}
                        />
                    </Stack>
                    
                </Stack>
            </TabPanel>
        </TabContext>
    </Paper>
  )
}
