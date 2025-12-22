import { React, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, Box, Tab, Tooltip, IconButton, FormHelperText, Button, Badge, Divider } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import TableImportJournalModel from '../../../../model/TableImportJournalModel';
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
import { TfiSave } from 'react-icons/tfi';
import { useFormik } from 'formik';
import * as Yup from "yup";
import Papa from 'papaparse';
import { DataGrid, frFR, GridFooter, GridFooterContainer, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import PopupViewDetailsImportJournal from '../../../componentsTools/popupViewDetailsImportJournal';
import PopupActionConfirm from '../../../componentsTools/popupActionConfirm';
import CircularProgressWithValueLabel from '../../../componentsTools/CircularProgressWithValueLabel';
import CircularProgress from '@mui/material/CircularProgress';
import VirtualTableModifiableImportJnl from '../../../componentsTools/DeclarationEbilan/virtualTableModifiableImportJnl';

export default function ImportJournal() {
    //Valeur du listbox choix exercice ou situation-----------------------------------------------------
    const [valSelect, setValSelect] = useState('');
    const [valSelectType, setValSelectType] = useState('CSV');
    const [valSelectCptDispatch, setValSelectCptDispatch] = useState('None');

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

    const [journalData, setJournalData] = useState([]);
    const [planComptable, setPlanComptable] = useState([]);
    const [codeJournal, setCodeJournal] = useState([]);
    const [devises, setDevises] = useState([]);
    const [msgAnomalie, setMsgAnomalie] = useState([]);
    const [couleurBoutonAnomalie, setCouleurBoutonAnomalie] = useState('white');
    const [nbrAnomalie, setNbrAnomalie] = useState(0);
    const [openDetailsAnomalie, setOpenDetailsAnomalie] = useState(false);
    const [fileTypeCSV, setFileTypeCSV] = useState(true);
    const [openDialogConfirmImport, setOpenDialogConfirmImport] = useState(false);
    const [codeJournalToCreate, setCodeJournalToCreate] = useState([]);
    const [compteToCreateGen, setCompteToCreateGen] = useState([]);
    const [compteToCreateAux, setCompteToCreateAux] = useState([]);

    const [traitementJournalWaiting, setTraitementJournalWaiting] = useState(false);
    const [traitementJournalMsg, setTraitementJournalMsg] = useState('');
    const [longeurCompteStd, setLongeurCompteStd] = useState(0);

    const [totalDebit, setTotalDebit] = useState("0,00");
    const [totalCredit, setTotalCredit] = useState("0,00");

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
                setLongeurCompteStd(resData.fileInfos[0]?.longcomptestd);
                setNoFile(false);
            } else {
                setFileInfos([]);
                setNoFile(true);
            }
        })
    }

    console.log('longeurCompteStd : ', longeurCompteStd);

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

    // const columnHeaderJournalData = [
    //     {
    //         field: 'EcritureNum', 
    //         headerName: 'ID', 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 120, 
    //         headerAlign: 'right',
    //         align: 'right',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'datesaisie', 
    //         headerName: "Date saisie", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'center',
    //         align: 'center',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'EcritureDate', 
    //         headerName: "Date écriture", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'center',
    //         align: 'center',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'JournalCode', 
    //         headerName: "Journal", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 80, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'CompteNum', 
    //         headerName: "Compte", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'CompAuxNum', 
    //         headerName: "Compte aux", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'PieceRef', 
    //         headerName: "Pièces", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'PieceDate', 
    //         headerName: "Pièces date", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'EcritureLib', 
    //         headerName: "Libellé", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 300, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'Debit', 
    //         headerName: "Débit", 
    //         type: 'number', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'right', 
    //         align: 'right',
    //         headerClassName: 'MuiDataGrid-ColumnHeader',
    //         renderCell: (params) => {
    //             const montant = new Intl.NumberFormat('fr-FR',
    //                 {
    //                     minimumFractionDigits: 2,
    //                     maximumFractionDigits: 2,
    //                 }
    //             ).format(params.row.Debit.replace(',','.')) ;
    //             return (
    //                 <div>
    //                     {montant}
    //                 </div>
    //             )
    //         }
    //     },
    //     {
    //         field: 'Credit', 
    //         headerName: "Crédit", 
    //         type: 'number', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'right',
    //         align: 'right',
    //         headerClassName: 'MuiDataGrid-ColumnHeader',
    //         renderCell: (params) => {
    //             const montant = new Intl.NumberFormat('fr-FR',
    //                 {
    //                     minimumFractionDigits: 2,
    //                     maximumFractionDigits: 2,
    //                 }
    //             ).format(params.row.Credit.replace(',','.')) ;
    //             return (
    //                 <div>
    //                     {montant}
    //                 </div>
    //             )
    //         }
    //     },
    //     {
    //         field: 'Idevise', 
    //         headerName: "Devise", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 70, 
    //         headerAlign: 'center',
    //         align: 'center',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'EcritureLet', 
    //         headerName: "Lettrage", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 90, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'DateLet', 
    //         headerName: "Date Let", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 100, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'ModeRglt', 
    //         headerName: "Mode règl.", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 150, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //     {
    //         field: 'DateRglt', 
    //         headerName: "Date règl.", 
    //         type: 'string', 
    //         sortable : true, 
    //         width: 100, 
    //         headerAlign: 'left',
    //         align: 'left',
    //         headerClassName: 'MuiDataGrid-ColumnHeader'
    //     },
    //   ];

    const columns = [
        {
            id: 'EcritureNum',
            label: 'ID',
            minWidth: 120,
            align: 'right',
            isnumber: false
        },
        {
            id: 'datesaisie',
            label: 'Date saisie',
            minWidth: 150,
            align: 'center',
            isnumber: false
        },
        {
            id: 'EcritureDate',
            label: 'Date écriture',
            minWidth: 150,
            align: 'center',
            isnumber: false
        },
        {
            id: 'JournalCode',
            label: 'Journal',
            minWidth: 80,
            align: 'left',
            isnumber: false
        },
        {
            id: 'CompteNum',
            label: 'Journal',
            minWidth: 150,
            align: 'left',
            isnumber: false
        },
        {
            id: 'CompAuxNum',
            label: 'Compte aux',
            minWidth: 150,
            align: 'left',
            isnumber: false
        },
        {
            id: 'PieceRef',
            label: 'Pièces',
            minWidth: 150,
            align: 'left',
            isnumber: false
        },
        {
            id: 'PieceDate',
            label: 'Pièce date',
            minWidth: 150,
            align: 'center',
            isnumber: false
        },
        {
            id: 'EcritureLib',
            label: 'Libellé',
            minWidth: 300,
            align: 'left',
            isnumber: false
        },
        {
            id: 'Debit',
            label: 'Débit',
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
        {
            id: 'Credit',
            label: 'Crédit',
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
        {
            id: 'Idevise',
            label: 'Devise',
            minWidth: 70,
            align: 'center',
            isnumber: false
        },
        {
            id: 'EcritureLet',
            label: 'Lettrage',
            minWidth: 90,
            align: 'left',
            isnumber: false
        },
        {
            id: 'DateLet',
            label: 'Date let.',
            minWidth: 100,
            align: 'center',
            isnumber: false
        },
        {
            id: 'ModeRglt',
            label: 'Mode règl.',
            minWidth: 150,
            align: 'left',
            isnumber: false
        },
        {
            id: 'DateRglt',
            label: 'Date règl.',
            minWidth: 120,
            align: 'center',
            isnumber: false
        },
    ];

    //   const footerRow = {
    //     id: 'footer', // ID unique pour la ligne footer
    //     EcritureNum: 'Total',
    //     datesaisie : '',
    //     EcritureDate : '',
    //     JournalCode : '',
    //     CompteNum : '',
    //     CompAuxNum : '',
    //     PieceRef : '',
    //     PieceDate : '',
    //     EcritureLib : '',
    //     Debit : '0,00',
    //     Credit : '0,00',
    //     Idevise : '',
    //     EcritureLet : '',
    //     DateLet : '',
    //     ModeRglt : '',
    //     DateRglt : '',
    //   };

    const footerRef = useRef(null);  // Référence pour le footer
    const dataGridRef = useRef(null); // Référence pour le DataGrid

    // Fonction pour synchroniser le défilement
    const syncScroll = () => {
        if (dataGridRef.current && footerRef.current) {
            footerRef.current.scrollLeft = dataGridRef.current.scrollLeft;
        }
    };

    // Fonction qui sera appelée lors du défilement dans le DataGrid
    // Fonction qui gère le défilement
    const handleDataGridScroll = (event) => {
        //toast.success("ok");
        // Détecter le défilement horizontal
        // if (event.target.scrollLeft) {
        // if (footerRef.current) {
        //     footerRef.current.scrollLeft = event.target.scrollLeft;
        // }
        // }

        // // Détecter le défilement vertical
        // if (event.target.scrollTop) {
        // if (footerRef.current) {
        //     footerRef.current.scrollTop = event.target.scrollTop;
        // }
        // }
    };

    useEffect(() => {
        const dataGridElement = dataGridRef.current?.querySelector('.MuiDataGrid-viewport');
        if (dataGridElement) {
            dataGridElement.addEventListener('scroll', handleDataGridScroll);
        }

        // Nettoyage du listener lorsque le composant est démonté
        return () => {
            const dataGridElement = dataGridRef.current?.querySelector('.MuiDataGrid-viewport');
            if (dataGridElement) {
                dataGridElement.removeEventListener('scroll', handleDataGridScroll);
            }
        };
    }, []);

    // const CustomFooter = () => {

    //     const styleTextLeft = (width) => ({
    //         marginLeft:5, 
    //         color:'white', 
    //         width: width, 
    //         fontWeight:'bold',
    //         marginRight:5,
    //         textAlign:'left',
    //         flexShrink: 0,
    //     });

    //     const style = (width) => ({
    //         marginLeft:5, 
    //         color:'white', 
    //         width: width, 
    //         fontWeight:'bold',
    //         marginRight:5,
    //         textAlign:'right',
    //         flexShrink: 0,
    //         fontSize: '15px'
    //     });

    //     const style2 = {
    //         height:"25px", 
    //         border: '1px solid white',
    //         flexShrink: 0,
    //     };

    //     return (
    //         <div>
    //             <div ref={footerRef} onScroll={handleDataGridScroll} style={{overflowX: 'auto',whiteSpace: 'nowrap', width: "100%"}}>
    //                 <Stack direction={'row'} 
    //                 backgroundColor={initial.theme} 
    //                 height={"35px"} 
    //                 alignItems={'center'}
    //                 alignContent={'center'}
    //                 justifyItems={'center'}
    //                 width={"100%"}
    //                 spacing={0}
    //                 >
    //                     <Typography style={styleTextLeft(40)}></Typography>
    //                     <Divider orientation="vertical" style={style2}/>
    //                     <Typography style={styleTextLeft(100)}>Total débit: </Typography>
    //                     <Typography style={style(150)}>{totalDebit}</Typography>
    //                     <Divider orientation="vertical" style={style2}/>
    //                     <Typography style={styleTextLeft(100)}>Total crédit:</Typography>
    //                     <Typography style={style(150)}>{totalCredit}</Typography>
    //                     <Divider orientation="vertical" style={style2}/>
    //                     {/* <Typography style={style(135)}>{totalDebit}</Typography>
    //                     <Divider orientation="vertical" style={style2}/>
    //                     <Typography style={style(135)}>{totalCredit}</Typography>
    //                     <Divider orientation="vertical" style={style2}/>
    //                     <Typography style={style(5)}></Typography> */}
    //                 </Stack>
    //                 </div>
    //                 <GridFooterContainer >
    //                     <GridFooter sx={{ border: 'none' }}>

    //                     </GridFooter>
    //                 </GridFooterContainer>

    //         </div>




    //     );
    // };                    

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

    //Choix exercice
    const handleChangeExercice = (exercice_id) => {
        setSelectedExerciceId(exercice_id);
        setSelectedPeriodeChoiceId("0");
        setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
        setSelectedPeriodeId(exercice_id);
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

    //Récupération du plan comptable
    const recupPlanComptable = () => {
        axios.post(`/paramPlanComptable/pc`, { fileId }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setPlanComptable(resData.liste);
            } else {
                toast.error(resData.msg);
            }
        });
    }

    // Récupérer la liste des devises existantes pour le dossier/compte
    const GetListeDevises = (id) => {
        if (!compteId || !id) { setDevises([]); return; }
        axios.get(`/devises/devise/compte/${compteId}/${id}`).then((res) => {
            const data = Array.isArray(res.data) ? res.data : [];
            setDevises(data);
        }).catch(() => setDevises([]));
    }

    //récupération données liste code journaux
    const GetListeCodeJournaux = (id) => {
        axios.get(`/paramCodeJournaux/listeCodeJournaux/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setCodeJournal(resData.list);
            } else {
                setCodeJournal([]);
                toast.error(resData.msg);
            }
        });
    }

    useEffect(() => {
        GetListeCodeJournaux(fileId);
        recupPlanComptable();
        GetListeDevises(fileId);
    }, [fileId]);

    //Valeur du listbox choix Type exercice-----------------------------------------------------
    const handleChangeType = (event) => {
        formikImport.setFieldValue('type', event.target.value);
        setValSelectType(event.target.value);

        if (event.target.value === 'CSV') {
            setFileTypeCSV(true);
        } else {
            setFileTypeCSV(false);
        }
    };

    //Valeur du listbox choix compte à dispatcher----------------------------------------------------
    const handleChangeCptDispatch = (event) => {
        formikImport.setFieldValue('choixImport', event.target.value);
        setValSelectCptDispatch(event.target.value);
    };

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
            handleOpenDialogConfirmImport();
        },
    });

    //download modele d'import
    const handleDownloadModel = () => {
        const fileUrl = '../../../../../public/modeleImport/modeleImportJournal.csv';
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'ModeleImportJournal';
        link.click();
    }

    //validation des entêtes si c'est bon ou pas
    const validateHeaders = (headers) => {

        let expectedHeaders = [];
        const expectedHeadersCSV = ["EcritureNum", "datesaisie", "EcritureDate", "JournalCode", "CompteNum", "CompAuxNum", "PieceRef", "PieceDate", "EcritureLib", "Debit", "Credit", "Idevise", "EcritureLet", "DateLet", "ModeRglt", "DateRglt"];
        const expectedHeadersFEC = ["EcritureNum", "EcritureDate", "JournalCode", "CompteNum", "CompAuxNum", "PieceRef", "PieceDate", "EcritureLib", "Debit", "Credit", "Idevise", "EcritureLet", "DateLet"];

        if (fileTypeCSV) {
            expectedHeaders = expectedHeadersCSV;
        } else {
            expectedHeaders = expectedHeadersFEC;
        }

        // Comparer les en-têtes du CSV aux en-têtes attendus
        const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
            toast.error(`Les en-têtes du modèle d'import suivants sont manquants : ${missingHeaders.join(', ')}`);
            return false;
        }
        return true;
    };

    //Calcul solde débit et solde crédit
    const calculTotal = (array) => {

        const totDebit0 = array.reduce((acc, item) => {
            const Value = parseFloat(item["Debit"].replace(',', '.')) || 0; // Convertir en nombre
            return acc + Value;
        }, 0);

        const totCredit0 = array.reduce((acc, item) => {
            const Value = parseFloat(item["Credit"].replace(',', '.')) || 0; // Convertir en nombre
            return acc + Value;
        }, 0);

        const totDebit = new Intl.NumberFormat('fr-FR',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        ).format(totDebit0);

        const totCredit = new Intl.NumberFormat('fr-FR',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        ).format(totCredit0);

        setTotalDebit(totDebit);
        setTotalCredit(totCredit);
    };

    //Test d'existance de code journal ou de compte par rapport aux données dans paramétrage
    const existance = (param, liste) => {
        const missingCode = liste.filter(item => !param.includes(item));
        return missingCode;
    };

    const padCompte = (val) => {
        if (val === null || val === undefined) return null;
        const s = String(val).trim();
        if (s === "" || s === "0") return null;
        return s.padEnd(longeurCompteStd, "0").slice(0, longeurCompteStd);
    };

    //charger le fichier à partir de FileDialog
    const handleFileSelect = (event) => {
        const file = event.target.files[0];

        if (file) {
            // Utilise PapaParse pour parser le fichier CSV
            Papa.parse(file, {
                complete: (result) => {
                    const headers = result.meta.fields;

                    if (validateHeaders(headers)) {
                        setTraitementJournalMsg('Traitement du journal en cours...');
                        setTraitementJournalWaiting(true);

                        //réinitialiser les compteurs d'anomalies
                        const couleurAnom = "#EB5B00";
                        let nbrAnom = 0;
                        let msg = [];
                        setMsgAnomalie('');
                        setCouleurBoutonAnomalie('white');
                        setNbrAnomalie(0);

                        const listeUniqueCodeJnlInitial = [...new Set(result.data.map(item => item.JournalCode))];
                        const listeUniqueCodeJnl = listeUniqueCodeJnlInitial.filter(item => item !== '');

                        const listeUniqueCompteInitial = [
                            ...new Set(
                                result.data.flatMap(item => [
                                    padCompte(item.CompteNum),
                                    padCompte(item.CompAuxNum)
                                ]).filter(Boolean)
                            )
                        ];

                        const listeUniqueCompte = listeUniqueCompteInitial.filter(item => item !== '');

                        const compteNonValideStd = result.data.some(item => {
                            return item.CompteNum && item.CompteNum.length !== longeurCompteStd;
                        });

                        if (compteNonValideStd) {
                            msg.push('Attention, la longueur des comptes dans le fichier csv est différente de celle des comptes dans le paramétrage CRM du dossier.');
                            nbrAnom = nbrAnom + 1;
                            setNbrAnomalie(nbrAnom);
                            setCouleurBoutonAnomalie(couleurAnom);
                        }

                        //stocker en 2 variables les comptes généraux et comptesaux pour la création
                        const listeUniqueCompteGenInitial = [...new Set(
                            result.data
                                .map(item => item.CompteNum)
                                .filter(val => val && val !== 0)
                                .map(val => val.toString().padEnd(longeurCompteStd, "0").slice(0, longeurCompteStd))
                        )
                        ];
                        const listeUniqueCompteGen = listeUniqueCompteGenInitial.filter(item => item !== '');

                        const listeUniqueCompteAuxInitial = [
                            ...new Set(
                                result.data
                                    .map(item => item.CompAuxNum)
                                    .filter(val => val && val !== 0)
                                    .map(val => val.toString().padEnd(longeurCompteStd, "0").slice(0, longeurCompteStd))
                            )
                        ];
                        const listeUniqueCompteAux = listeUniqueCompteAuxInitial.filter(item => item !== '');

                        const ListeCodeJnlParams = [...new Set(codeJournal.map(item => item.code))];
                        const ListeCompteParams = [...new Set(planComptable.map(item => item.compte))];

                        const codeJournalNotInParams = existance(ListeCodeJnlParams, listeUniqueCodeJnl);
                        const compteNotInParams = existance(ListeCompteParams, listeUniqueCompte);
                        const compteNotInParamsGen = existance(ListeCompteParams, listeUniqueCompteGen);
                        const compteNotInParamsAux = existance(ListeCompteParams, listeUniqueCompteAux);

                        // Devises: détecter les codes manquants et les vides
                        const listeUniqueDevisesInitial = [...new Set(result.data.map(item => (item.Idevise || '').trim()))];
                        const listeUniqueDevises = listeUniqueDevisesInitial.filter(item => item !== '');
                        const listeDevisesParams = [...new Set((devises || []).map(d => d.code))];
                        const devisesNotInParams = existance(listeDevisesParams, listeUniqueDevises);
                        const numberOfEmptyDevises = result.data.filter(row => !row.Idevise || row.Idevise.trim() === '').length;

                        if (codeJournalNotInParams.length > 0) {
                            msg.push(`Les codes journaux suivants n'existent pas encore dans votre dossier : ${codeJournalNotInParams.join(', ')}`);
                            nbrAnom = nbrAnom + 1;
                            setNbrAnomalie(nbrAnom);
                            setCouleurBoutonAnomalie(couleurAnom);

                            // Construire { code, libelle } à partir du fichier importé (JournalLib si présent)
                            const missingCodeWithLib = codeJournalNotInParams.map((code) => {
                                const row = result.data.find(r => r.JournalCode === code);
                                const libelle = row && (row.JournalLib || row.JournalLabel || row.Journal || '')
                                    ? (row.JournalLib || row.JournalLabel || row.Journal)
                                    : `Journal ${code}`;
                                return { code, libelle };
                            });
                            setCodeJournalToCreate(missingCodeWithLib);
                        }

                        if (compteNotInParams.length > 0) {
                            msg.push(`Les numéros de compte suivants n'existent pas encore dans votre dossier : ${compteNotInParams.join(', ')}`);

                            nbrAnom = nbrAnom + 1;
                            setNbrAnomalie(nbrAnom);
                            setCouleurBoutonAnomalie(couleurAnom);
                        }

                        // Anomalies devises manquantes (seront créées automatiquement)
                        if (devisesNotInParams.length > 0) {
                            msg.push(`Les devises suivantes n'existent pas encore dans votre dossier et seront créées automatiquement : ${devisesNotInParams.join(', ')}`);
                            nbrAnom = nbrAnom + 1;
                            setNbrAnomalie(nbrAnom);
                            setCouleurBoutonAnomalie(couleurAnom);
                        }

                        // Anomalies devises vides (par défaut MGA)
                        if (numberOfEmptyDevises > 0) {
                            const hasMGA = listeDevisesParams.includes('MGA') || devisesNotInParams.includes('MGA');
                            const suffix = hasMGA ? '' : " (MGA sera créé au besoin)";
                            msg.push(`Certaines lignes n'ont pas de devise : elles utiliseront la devise par défaut 'MGA'${suffix}.`);
                            nbrAnom = nbrAnom + 1;
                            setNbrAnomalie(nbrAnom);
                            setCouleurBoutonAnomalie(couleurAnom);
                        }

                        setMsgAnomalie(msg);
                        let DataWithId = [];
                        if (fileTypeCSV) {
                            DataWithId = result.data.map((row, index) => ({ ...row, id: index, CompteLib: '', CompAuxLib: '' }));
                        } else {
                            DataWithId = result.data;
                        }

                        // Déterminer la période de l'exercice sélectionné
                        const getExerciseRange = () => {
                            const ex = (listeExercice || []).find(e => e.id === selectedExerciceId) || {};
                            // Support de plusieurs clés possibles
                            const start = ex.datedebut || ex.date_debut || ex.debut || ex.startDate || null;
                            const end = ex.datefin || ex.date_fin || ex.fin || ex.endDate || null;
                            return { start, end };
                        };

                        const parseToDate = (str) => {
                            if (!str) return null;
                            if (typeof str === 'string') {
                                if (str.includes('/')) {
                                    const [day, month, year] = str.split('/');
                                    return new Date(`${year}-${month}-${day}`);
                                }
                                if (/^\d{8}$/.test(str)) {
                                    return new Date(`${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`);
                                }
                            }
                            const d = new Date(str);
                            return isNaN(d.getTime()) ? null : d;
                        };

                        // Filtrage des lignes hors exercice si dates disponibles
                        const { start, end } = getExerciseRange();
                        let finalData = DataWithId;
                        if (start && end) {
                            const dStart = parseToDate(start);
                            const dEnd = parseToDate(end);
                            if (dStart && dEnd) {
                                const outOfRange = DataWithId.filter(r => {
                                    const d = parseToDate(r.EcritureDate);
                                    return !d || d < dStart || d > dEnd;
                                });
                                if (outOfRange.length > 0) {
                                    msg.push("Certaines lignes ne seront pas importées car leurs date d'écriture est en déhors de l'exercice");
                                    nbrAnom = nbrAnom + 1;
                                    setNbrAnomalie(nbrAnom);
                                    setCouleurBoutonAnomalie(couleurAnom);
                                }
                                finalData = DataWithId.filter(r => {
                                    const d = parseToDate(r.EcritureDate);
                                    return d && d >= dStart && d <= dEnd;
                                });
                            }
                        }

                        //const dataWithFooter = [...finalData, footerRow];
                        setJournalData(finalData);
                        calculTotal(finalData);
                        formikImport.setFieldValue('journalData', finalData);

                        const mapGen = new Map();

                        DataWithId.forEach(item => {
                            const compte = item.CompteNum?.toString()
                                .padEnd(longeurCompteStd, "0")
                                .slice(0, longeurCompteStd);

                            if (compteNotInParamsGen.includes(compte) && !mapGen.has(compte)) {
                                mapGen.set(compte, {
                                    CompteNum: compte,
                                    CompteLib: item.CompteLib
                                });
                            }
                        });

                        const cptToCreateGen = [...mapGen.values()];

                        const mapAux = new Map();

                        DataWithId.forEach(item => {
                            const compte = item.CompAuxNum?.toString()
                                .padEnd(longeurCompteStd, "0")
                                .slice(0, longeurCompteStd);

                            if (compteNotInParamsAux.includes(compte) && !mapAux.has(compte)) {
                                mapAux.set(compte, {
                                    CompteNum: compte,
                                    CompteLib: item.CompAuxLib
                                });
                            }
                        });

                        const cptToCreateAux = [...mapAux.values()];

                        setCompteToCreateGen(cptToCreateGen);
                        setCompteToCreateAux(cptToCreateAux);

                        // Mettre à jour les messages d'anomalies agrégés
                        setMsgAnomalie(msg);

                        event.target.value = null;
                        setTraitementJournalWaiting(false);

                        handleOpenAnomalieDetails();
                    }
                },
                header: true, // Si tu veux que la première ligne soit utilisée comme clé d'objet (si le CSV a des en-têtes)
                skipEmptyLines: true, // Ignore les lignes vides
            });
        }
    }

    //afficher ou non les détails des anomalies de l'import
    const handleOpenAnomalieDetails = () => {
        setOpenDetailsAnomalie(true);
    }

    const handleCloseAnomalieDetails = (value) => {
        setOpenDetailsAnomalie(value);
    }

    //import du journal
    const handleOpenDialogConfirmImport = () => {
        formikImport.setFieldValue("idCompte", compteId);
        formikImport.setFieldValue("idDossier", fileId);
        formikImport.setFieldValue("idExercice", selectedPeriodeId);

        setOpenDialogConfirmImport(true);
    }

    const handleCloseDialogConfirmImport = () => {
        setOpenDialogConfirmImport(false);
    }

    //création des journaux qui n'existe pas encore avant import journal
    const createCodeJournalNotExisting = async () => {
        const response = await axios.post(`/administration/importJournal/createNotExistingCodeJournal`, { compteId, fileId, codeJournalToCreate });
        const resData = response.data;
        return resData.list;
    }

    //création des comptes qui n'existe pas encore avant import journal
    const createCompteNotExisting = async () => {
        console.log("compteToCreateGen : ", compteToCreateGen);
        console.log("compteToCreateAux : ", compteToCreateAux);
        const response = await axios.post(`/administration/importJournal/createNotExistingCompte`, { compteId, fileId, compteToCreateGen, compteToCreateAux });
        const resData = response.data;
        return resData.list;
    }

    const handleImportJournal = async (value) => {
        if (value) {
            const UpdatedCodeJournal = await createCodeJournalNotExisting();
            const UpdatedPlanComptable = await createCompteNotExisting();

            if (!Array.isArray(UpdatedCodeJournal)) {
                toast.error("Un problème est survenu lors de la création des codes journaux manquants.");
            }

            if (!Array.isArray(UpdatedPlanComptable)) {
                toast.error("Un problème est survenu lors de la création des comptes manquants.");
            }

            if (Array.isArray(UpdatedCodeJournal) && Array.isArray(UpdatedPlanComptable)) {
                setTraitementJournalMsg('Importation du journal en cours...');
                setTraitementJournalWaiting(true);
                axios.post(`/administration/importJournal/importJournal`, { compteId, userId, fileId, selectedPeriodeId, fileTypeCSV, valSelectCptDispatch, journalData, longeurCompteStd })
                    .then((response) => {
                        const resData = response.data;
                        if (resData.state) {
                            setTraitementJournalMsg('');
                            setTraitementJournalWaiting(false);
                            toast.success(resData.msg);
                            setJournalData([]);
                            setNbrAnomalie(0);
                            setMsgAnomalie([]);
                        } else {
                            setTraitementJournalMsg('');
                            setTraitementJournalWaiting(false);
                            console.log(resData.msg);
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        toast.error(err?.response?.data?.message || err?.message || "Erreur inconnue");
                    });
            }

            handleCloseDialogConfirmImport();
        } else {
            handleCloseDialogConfirmImport();
        }
    }

    return (
        <Box>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
            {openDialogConfirmImport ? <PopupActionConfirm msg={"Voulez-vous vraiment importer le journal en cours?"} confirmationState={handleImportJournal} /> : null}
            {openDetailsAnomalie ? <PopupViewDetailsImportJournal msg={msgAnomalie} confirmationState={handleCloseAnomalieDetails} /> : null}

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
                            <Typography variant='h6' sx={{ color: "black" }} align='left'>Administration - Import Journal</Typography>

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
                                <FormControl variant="standard" sx={{ m: 0, minWidth: 250 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Type de fichier</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={formikImport.values.type}
                                        label={"valSelectType"}
                                        onChange={handleChangeType}
                                        sx={{ width: "140px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                    >
                                        {/* <MenuItem key="None" value="">
                                        <em>None</em>
                                    </MenuItem> */}
                                        <MenuItem key={"CSV"} value={"CSV"}>CSV</MenuItem>
                                        <MenuItem key={"FEC"} value={"FEC"}>FEC</MenuItem>
                                    </Select>

                                    <FormHelperText style={{ color: 'red' }}>
                                        {formikImport.errors.type && formikImport.touched.type && formikImport.errors.type}
                                    </FormHelperText>
                                </FormControl>

                                <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Choix d'import</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={formikImport.values.choixImport}
                                        label={"valSelectCptDispatch"}
                                        onChange={handleChangeCptDispatch}
                                        sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                    >
                                        <MenuItem key={"None"} value={""}>
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem key={"ECRASER"} value={"ECRASER"}>Ecraser les données déjà existantes</MenuItem>
                                        <MenuItem key={"UPDATE"} value={"UPDATE"}>Importer sans écraser</MenuItem>
                                    </Select>

                                    <FormHelperText style={{ color: 'red' }}>
                                        {formikImport.errors.choixImport && formikImport.touched.choixImport && formikImport.errors.choixImport}
                                    </FormHelperText>
                                </FormControl>

                                <Stack spacing={1} width={"400px"} height={"50px"} direction={"row"}
                                    style={{ border: '2px dashed rgba(5,96,116,0.60)', marginLeft: "30px", paddingLeft: "20px" }}
                                    alignContent={"center"} justifyContent={"left"} alignItems={"center"}
                                >
                                    <Typography variant='h7' sx={{ color: "black", fontWeight: "bold" }} align='left'>
                                        Télécharger ici le modèle d'import
                                    </Typography>

                                    <List style={{ marginLeft: "10px" }}>
                                        <ListItem style={{ width: "100px", justifyContent: "center" }}>
                                            <ListItemButton
                                                disabled={!fileTypeCSV}
                                                onClick={fileTypeCSV ? handleDownloadModel : undefined}
                                            >
                                                <ListItemIcon >
                                                    <LogoutIcon
                                                        style={{
                                                            width: "40px",
                                                            height: "30px",
                                                            color: fileTypeCSV ? 'rgba(5,96,116,0.60)' : '#bdbdbd',
                                                            transform: "rotate(270deg)"
                                                        }}
                                                    />
                                                </ListItemIcon>
                                            </ListItemButton>
                                        </ListItem>
                                    </List>
                                </Stack>

                                <Stack spacing={1} width={"350px"} height={"50px"} direction={"row"}
                                    style={{ border: '2px dashed rgba(5,96,116,0.60)', marginLeft: "30px", paddingLeft: "20px" }}
                                    alignContent={"center"} justifyContent={"left"} alignItems={"center"}
                                    backgroundColor={'rgba(5,96,116,0.05)'}
                                >
                                    <input
                                        type="file"
                                        accept={fileTypeCSV ? ".csv" : ".txt"}
                                        // webkitdirectory="true"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        id="fileInput"
                                    />

                                    <Typography variant='h7' sx={{ color: "black", fontWeight: "bold" }} align='left'>
                                        Importer depuis le fichier
                                    </Typography>

                                    <List style={{ marginLeft: "10px" }}>
                                        <ListItem style={{ width: "100px", justifyContent: "center" }}>
                                            <ListItemButton onClick={() => document.getElementById('fileInput').click()}>
                                                <ListItemIcon >
                                                    <SaveAltIcon style={{ width: "40px", height: "30px", color: 'rgba(5,96,116,0.60)' }} />
                                                </ListItemIcon>
                                            </ListItemButton>
                                        </ListItem>
                                    </List>
                                </Stack>

                                <Tooltip title="Importer le fichier">
                                    <span>

                                        {/* <IconButton 
                                    variant="contained"
                                    style={{width:"130px", height:'50px', 
                                        borderRadius:"2px", borderColor: "transparent",
                                        backgroundColor: initial.theme,
                                        textTransform: 'none', outline: 'none',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    >
                                        <Box style={{marginLeft: '5px', marginRight: '15px' }}>
                                            <TfiSave style={{width:'25px', height:'25px',color: 'white'}}/>
                                        </Box>
                                        
                                        <Typography style={{color:'white', fontWeight:'bold'}}>Importer</Typography>
                                    </IconButton> */}


                                    </span>
                                </Tooltip>

                                <Badge badgeContent={nbrAnomalie} color="warning">
                                    <Button
                                        onClick={handleOpenAnomalieDetails}
                                        variant="contained"
                                        style={{
                                            height: "50px",
                                            textTransform: 'none',
                                            outline: 'none',
                                            backgroundColor: initial.theme,
                                            color: couleurBoutonAnomalie
                                        }}
                                    >
                                        Anomalies
                                    </Button>
                                </Badge>


                                <Button
                                    type='submit'
                                    variant="contained"
                                    style={{
                                        height: "50px",
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: initial.theme
                                    }}
                                >
                                    Importer
                                </Button>
                            </Stack>

                            {traitementJournalWaiting
                                ? <Stack spacing={2} direction={'row'} width={"100%"} alignItems={'center'} justifyContent={'center'}>
                                    <CircularProgress />
                                    <Typography variant='h6' style={{ color: '#2973B2' }}>{traitementJournalMsg}</Typography>
                                    {/* <CircularProgressWithValueLabel value={50} msg={"Traitement du journal en cours..."} /> */}
                                </Stack>
                                : null
                            }

                            <Stack width={"100%"} height={'70vh'} >
                                <VirtualTableModifiableImportJnl columns={columns} rows={journalData} state={true} />
                                {/* <DataGrid
                                ref={dataGridRef}
                                disableMultipleSelection = {DataGridStyle.disableMultipleSelection}
                                disableColumnSelector = {DataGridStyle.disableColumnSelector}
                                disableDensitySelector = {DataGridStyle.disableDensitySelector}
                                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                disableRowSelectionOnClick
                                disableSelectionOnClick={true}
                                slots={{toolbar : QuickFilter, footer: CustomFooter}}
                                sx={{ 
                                    m: 0,
                                    border:'0px',
                                    
                                    "& .MuiDataGrid-columnHeader.MuiDataGrid-ColumnHeader": {
                                        fontSize:'14px',
                                        fontFamily:'Arial Black',
                                        fontWeight:'bold',
                                        },
                                        "& .MuiDataGrid-columnSeparator": {
                                            display: 'flex',
                                            visibility: 'visible',
                                        },
                                        "& .MuiDataGrid-columnHeader" : {
                                            borderBottom: "2px solid #1A5276",
                                        },
                                    
                                        "& .MuiDataGrid-row:nth-of-type(even)" : {
                                        backgroundColor: "#F4F9F9",
                                        // borderBottom: "0px",
                                        // borderTop: "0px"
                                        },
                                        
                                        "& .MuiDataGrid-row:nth-of-type(odd)": {
                                        backgroundColor: "#ffffff",
                                        // borderBottom: "0px",
                                        // borderTop: "0px"
                                        },
                            
                                        "& .MuiDataGrid-cell": {
                                            borderBottom: "none",
                                            '&:focus': {
                                            outline: 'none',
                                            },
                                        },
                                        "& .MuiDataGrid-row": {
                                            borderBottom: "none",
                                        },
                                        "& .MuiDataGrid-footer": {
                                            display: 'none',
                                        },
                                        '& .MuiDataGrid-columnHeaderCheckbox': {
                                            justifyContent: 'left', // Centre le contenu de la checkbox
                                            marginLeft:'0px'
                                        },
                                        '& .highlight-separator': {
                                            borderTop: '1px solid red'
                                        },

                                        checkboxSelection: true,
                                        pagination: true
                                    }}

                                rowHeight= {DataGridStyle.rowHeight}
                                columnHeaderHeight= {DataGridStyle.columnHeaderHeight}
                                rows={journalData}
                                columns={columnHeaderJournalData}
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
                                getRowClassName={(params) => {
                                    const currentIndex = params.row.id - 1;
                                    const nextIndex = currentIndex + 1;
                                    
                                    if (nextIndex < journalData.length && journalData[currentIndex] && journalData[nextIndex]){
                                        // Vérifier si le `ids` de la ligne actuelle est différent de la ligne suivante
                                        if (nextIndex < journalData.length && journalData[currentIndex].EcritureNum !== journalData[nextIndex].EcritureNum) {
                                            return 'highlight-separator'; // Ajouter une classe si la valeur change
                                        }
                                            return ''; // Sinon, aucune classe
                                        }
                                    }
                                }
                                
                            /> */}
                            </Stack>
                        </Stack>
                    </form>
                </TabPanel>
            </TabContext>
        </Box>
    )
}
