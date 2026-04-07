import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Stack, FormControl, InputLabel, Select, MenuItem, Input, FormHelperText, Chip, ButtonGroup, Button, Box, AppBar, Toolbar, GlobalStyles, IconButton, Breadcrumbs, InputAdornment, TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import { useParams } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import PopupImportCodeJournaux from '../../administration/import/PopupImportCodeJournaux';
import { init } from '../../../../../init';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes, useGridApiRef } from '@mui/x-data-grid';
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
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../../config/axiosPrivate';

// Icônes MUI
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/HighlightOff';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';

export default function ParamCodeJournalComponent({ hideDossier = false }) {
    const apiRef = useGridApiRef();
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const axiosPrivate = useAxiosPrivate();
    const initial = init[0];

    // Constantes de style du design moderne
    const NEON_MINT = '#00FF94';
    const NAV_DARK = '#0B1120';
    const BG_SOFT = '#F8FAFC';

    //récupération information du dossier sélectionné
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [listeCodeJournaux, setListeCodeJournaux] = useState([]);
    const [filteredCodeJournaux, setFilteredCodeJournaux] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [selectedRow, setSelectedRow] = useState([]);

    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(false);

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

    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        textTransform: 'none',
        fontSize: '0.85rem',
        borderRadius: '6px',
        boxShadow: 'none',
        '& .MuiTouchRipple-root': {
            display: 'none',
        },
        '&:focus': {
            outline: 'none',
        },
        '&.Mui-focusVisible': {
            outline: 'none',
            boxShadow: 'none',
        },
        '&:hover': {
            boxShadow: 'none',
            backgroundColor: 'action.hover',
            border: 'none',
        },
        '&.Mui-disabled': {
            opacity: 0.4
        },
    };

    // Fonction de filtrage pour la recherche multi-colonnes
    const handleSearch = (searchValue) => {
        setSearchText(searchValue);

        if (!searchValue.trim()) {
            setFilteredCodeJournaux(listeCodeJournaux);
            return;
        }

        const filtered = listeCodeJournaux.filter(row => {
            const searchLower = searchValue.toLowerCase();
            return (
                (row.code && row.code.toLowerCase().includes(searchLower)) ||
                (row.libelle && row.libelle.toLowerCase().includes(searchLower)) ||
                (row.type && row.type.toLowerCase().includes(searchLower)) ||
                (row.compteassocie && row.compteassocie.toLowerCase().includes(searchLower))
            );
        });

        setFilteredCodeJournaux(filtered);
    };

    // Mettre à jour filteredCodeJournaux quand listeCodeJournaux change
    useEffect(() => {
        setFilteredCodeJournaux(listeCodeJournaux);
    }, [listeCodeJournaux]);

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
        // console.log('[showPc] Chargement du plan comptable pour fileId:', fileId, 'compteId:', compteId);
        axiosPrivate.post(`/paramPlanComptable/pc`, { fileId, compteId }).then((response) => {
            const resData = response.data;
            // console.log('[showPc] Réponse reçue:', resData);
            if (resData.state) {
                // console.log('[showPc] Plan comptable chargé, nombre de comptes:', resData.liste?.length);
                setPc(resData.liste);
            } else {
                console.error('[showPc] Erreur lors du chargement:', resData.msg);
                toast.error(resData.msg);
            }
        }).catch((error) => {
            console.error('[showPc] Erreur réseau:', error);
            toast.error('Erreur lors du chargement du plan comptable');
        });
    }

    useEffect(() => {
        // console.log('[useEffect] canView:', canView, 'fileId:', fileId);
        if (canView && fileId) {
            showPc();
            GetListeCodeJournaux(fileId);
        }
    }, [fileId]);

    // Mettre à jour listeCptAssocie quand pc est chargé et qu'un type BANQUE/CAISSE est sélectionné
    useEffect(() => {
        if (pc && pc.length > 0 && formikNewCodeJournal.values.type) {
            // console.log('[useEffect pc] Plan comptable chargé, mise à jour de listeCptAssocie pour type:', formikNewCodeJournal.values.type);
            const listBank = pc.filter((row) => row.compte.startsWith('512') || row.compte.startsWith('52'));
            const listCash = pc.filter((row) => row.compte.startsWith('53'));

            if (formikNewCodeJournal.values.type === 'BANQUE') {
                // console.log('[useEffect pc] Mise à jour liste BANQUE:', listBank.length, 'comptes');
                setListeCptAssocie(listBank);
            } else if (formikNewCodeJournal.values.type === 'CAISSE') {
                // console.log('[useEffect pc] Mise à jour liste CAISSE:', listCash.length, 'comptes');
                setListeCptAssocie(listCash);
            }
        }
    }, [pc, formikNewCodeJournal.values.type]);

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
        // console.log('[recupListeCptBanqueCaisse] Type sélectionné:', typeTreso);
        // console.log('[recupListeCptBanqueCaisse] Plan comptable (pc) length:', pc?.length);

        const listBank = pc?.filter((row) => row.compte.startsWith('512') || row.compte.startsWith('52'));
        const listCash = pc?.filter((row) => row.compte.startsWith('53'));

        // console.log('[recupListeCptBanqueCaisse] Comptes BANQUE (512 ou 52) trouvés:', listBank?.length);
        // console.log('[recupListeCptBanqueCaisse] Comptes CAISSE (53) trouvés:', listCash?.length);

        formikNewCodeJournal.setFieldValue("type", typeTreso);

        if (typeTreso === 'BANQUE') {
            setListeCptAssocie(listBank);
            // console.log('[recupListeCptBanqueCaisse] Liste BANQUE définie:', listBank);
            setCompteAssocieValidationColor('#F6D6D6');
        } else if (typeTreso === 'CAISSE') {
            setListeCptAssocie(listCash);
            // console.log('[recupListeCptBanqueCaisse] Liste CAISSE définie:', listCash);
            setCompteAssocieValidationColor('#F6D6D6');
        } else {
            // Pour les autres types
            setListeCptAssocie([]);
            setCompteAssocieValidationColor('transparent');
            formikNewCodeJournal.setFieldValue("compteassocie", '');
        }
    };


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
                                fontSize: '13px',
                                paddingLeft: '8px'
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
            renderCell: (params) => (
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            width: 170,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            renderCell: (params) => (
                <Typography sx={{ fontSize: '13px', color: '#475569' }}>
                    {params.value}
                </Typography>
            ),
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: libelleValidationColor,
                                fontSize: '13px',
                                paddingLeft: '8px'
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
            width: 120,
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
                            style={{
                                backgroundColor: typeValidationColor, fontSize: '13px'
                            }}
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
                const typeColors = {
                    'BANQUE': '#0369A1',
                    'CAISSE': '#10B981',
                    'ACHAT': '#3B82F6',
                    'VENTE': '#10B981',
                    'OD': '#64748B',
                    'RAN': '#FFA62F'
                };
                const color = typeColors[params.value] || '#64748B';
                return (
                    <Chip
                        label={params.value}
                        size="small"
                        sx={{
                            bgcolor: color,
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '10px',
                            borderRadius: '6px',
                            height: '20px',
                            minWidth: '60px'
                        }}
                    />
                );
            },
        },
        {
            field: 'compteassocie',
            headerName: 'Compte associé',
            type: 'singleSelect',
            valueOptions: listeCptAssocie.map((cpt) => cpt.compte),
            sortable: true,
            width: 160,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: true,
            valueFormatter: (params) => {
                const selectedType = listeCptAssocie.find((option) => option.compte === params.value);
                return selectedType ? `${selectedType.compte} ${selectedType.libelle}` : params.value;
            },
            renderCell: (params) => (
                <Typography sx={{ fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>
                    {params.value}
                </Typography>
            ),
            renderEditCell: (params) => {
                const isEditable = formikNewCodeJournal.values.type === 'BANQUE' || formikNewCodeJournal.values.type === 'CAISSE';
                return (
                    <FormControl fullWidth>
                        <InputLabel><em>Choisir...</em></InputLabel>
                        <Select
                            style={{
                                backgroundColor: isEditable ? '#fff' : '#f0f0f0', fontSize: '13px',
                            }}
                            value={formikNewCodeJournal.values.compteassocie}
                            onChange={(e) => formikNewCodeJournal.setFieldValue('compteassocie', e.target.value)}
                            disabled={!isEditable} // désactive si non éditable
                        >
                            {listeCptAssocie?.map((option) => (
                                <MenuItem key={option.compte} value={option.compte}>
                                    {option.compte} {option.libelle}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText style={{ color: 'red' }}>
                            {formikNewCodeJournal.errors.compteassocie &&
                                formikNewCodeJournal.touched.compteassocie &&
                                formikNewCodeJournal.errors.compteassocie}
                        </FormHelperText>
                    </FormControl>
                );
            },
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
                const isEditing = rowModesModel[params.id]?.mode === GridRowModes.Edit;
                const isSelected = selectedRowId.includes(params.id);

                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ pr: 1 }}>
                        {isEditing ? (
                            <>
                                <IconButton
                                    disabled={(!canAdd && !canModify) || !formikNewCodeJournal.isValid}
                                    onClick={handleSaveClick(selectedRowId)}
                                    size="small"
                                    sx={{ color: '#10B981' }}
                                    title="Sauvegarder"
                                >
                                    <SaveIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                                <IconButton
                                    disabled={disableCancelBouton}
                                    onClick={handleCancelClick(selectedRowId)}
                                    size="small"
                                    sx={{ color: '#F43F5E' }}
                                    title="Annuler"
                                >
                                    <CancelIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <IconButton
                                    disabled={(!canModify && selectedRowId > 0) || disableModifyBouton}
                                    onClick={handleEditClick(selectedRowId)}
                                    size="small"
                                    sx={{ color: '#CBD5E1', '&:hover': { color: NAV_DARK } }}
                                    title="Modifier"
                                >
                                    <EditIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                                <IconButton
                                    disabled={!canDelete || disableDeleteBouton}
                                    onClick={handleOpenDialogConfirmDeleteAssocieRow}
                                    size="small"
                                    sx={{ color: '#CBD5E1', '&:hover': { color: '#EF4444' } }}
                                    title="Supprimer"
                                >
                                    <DeleteIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </>
                        )
                        }
                    </Stack>
                );
            },
        },
    ];

    //gestion ajout + modification + suppression ligne dans le tableau liste code journaux
    const saveSelectedRow = (ids) => {
        if (ids.length === 1) {
            setSelectedRowId(ids);
            setDisableModifyBouton(false);
            setDisableSaveBouton(true);
            setDisableCancelBouton(false);
            setDisableDeleteBouton(false);
        } else {
            setSelectedRowId([]);
            setDisableModifyBouton(true);
            setDisableSaveBouton(false);
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
        let saveBoolCompteAssocie = true;

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
            // Vérification locale de doublon de code (hors ligne courante)
            const currentId = Array.isArray(id) ? id[0] : id;
            const newCode = String(formikNewCodeJournal.values.code || '').trim();
            const hasDuplicate = listeCodeJournaux.some(row => String(row.code).trim() === newCode && row.id !== currentId);
            if (hasDuplicate) {
                toast.error('Ce code journal existe déjà.');
                return;
            }

            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
            axiosPrivate.post(`/paramCodeJournaux/codeJournauxAdd`, formikNewCodeJournal.values).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    setDisableAddRowBouton(false);
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
        setDisableAddRowBouton(false);
    }

    const deleteRow = (value) => {
        if (value === true) {
            if (selectedRowId.length === 1) {
                const idToDelete = selectedRowId[0];
                if (idToDelete < 0) {
                    setOpenDialogDeleteRow(false);
                    setListeCodeJournaux(listeCodeJournaux.filter((row) => row.id !== idToDelete));
                    toast.success('Ligne supprimé avec succès')
                    return;
                }
                axiosPrivate.post(`/paramCodeJournaux/codeJournauxDelete`, { fileId, compteId, idToDelete }).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setDisableAddRowBouton(false);
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
        setDisableAddRowBouton(false);
        setDisableSaveBouton(true);
        setDisableDeleteBouton(true);
        setDisableModifyBouton(true);
        setSelectedRow([]);
        setSelectedRowId([]);
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

    //Ajouter une ligne dans le tableau liste associé
    const handleOpenDialogAddNewAssocie = () => {
        setDisableModifyBouton(false);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(false);

        const newId = -Date.now();

        formikNewCodeJournal.setFieldValue("idDossier", fileId);
        const newRow = {
            id: newId,
            code: '',
            libelle: '',
            type: '',
            compteassocie: '',
        };
        setListeCodeJournaux([...listeCodeJournaux, newRow]);
        setSelectedRowId([newRow.id]);
        setSelectedRow([newRow.id]);
        setDisableAddRowBouton(true);
    }

    //récupérer le numéro id le plus grand dans le tableau
    const getMaxID = (data) => {
        const Ids = data.map(item => item.id);
        return Math.max(...Ids);
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

    return (
        <>
            <GlobalStyles styles={{
                body: { margin: 0, padding: 0, overflowX: 'hidden', backgroundColor: BG_SOFT, fontFamily: '"Inter", sans-serif' }
            }} />
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
                (openDialogDeleteRow && canDelete)
                    ?
                    <PopupConfirmDelete
                        msg={"Voulez-vous vraiment supprimer le code journal sélectionné ?"}
                        confirmationState={deleteRow}
                    />
                    :
                    null
            }
            <PopupImportCodeJournaux
                open={openImportDialog}
                onClose={() => setOpenImportDialog(false)}
                fileId={fileId}
                compteId={compteId}
                onImportSuccess={() => GetListeCodeJournaux(fileId)}
            />
            <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
                {/* <TabContext>
                    {!hideDossier && (
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
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
                    )}
                </TabContext> */}

                <Box sx={{ width: '100%' }}>
                    {/* ENTÊTE AVEC BOUTON SOMBRE */}
                    <TabContext value={"1"}>

                        <TabPanel value="1" >
                            <Typography variant='h6' sx={{ fontWeight: 700, color: NAV_DARK }}>
                                Code journaux
                            </Typography>
                            <Stack width={"100%"} spacing={2}>
                                <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 0, mt: 1, px: 3, py: 1 }} >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            placeholder="Rechercher ..."
                                            size="small"
                                            value={searchText}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                width: 250,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    bgcolor: '#fff',
                                                    height: '32px',
                                                    fontSize: '12px'
                                                }
                                            }}
                                        />

                                        <Button
                                            disabled={!canAdd || disableAddRowBouton}
                                            onClick={handleOpenDialogAddNewAssocie}
                                            variant="contained"
                                            size="small"
                                            startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                                            sx={{
                                                bgcolor: NEON_MINT,
                                                textTransform: 'none',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                mr: 2,
                                                color: '#000',
                                                borderRadius: '6px',
                                                px: 2,
                                                '&:hover': {
                                                    bgcolor: '#00E685',
                                                    transform: 'translateY(-1px)'
                                                },
                                            }}
                                        >
                                            Ajouter journal
                                        </Button>
                                    </Stack>

                                </Stack>
                                <Box sx={{ px: 0, pr: 1 }}>
                                    <Stack
                                        maxWidth="98%" // 32px = 16px de chaque côté
                                        height="500px"
                                        minHeight="400px"
                                        sx={{
                                            borderRadius: '16px',
                                            border: '1px solid #E2E8F0',
                                            overflow: 'hidden',
                                            bgcolor: '#fff',
                                            mx: 'auto', // centre le stack horizontalement
                                        }}
                                    >
                                        <DataGrid
                                            apiRef={apiRef}
                                            disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                            disableColumnSelector={DataGridStyle.disableColumnSelector}
                                            disableDensitySelector={DataGridStyle.disableDensitySelector}
                                            disableRowSelectionOnClick
                                            disableSelectionOnClick={true}
                                            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                            // slots={{ toolbar: QuickFilter }}
                                            sx={{
                                                ...DataGridStyle.sx,
                                                border: 'none',
                                                borderRadius: '16px',
                                                height: '100%',

                                                '& .MuiDataGrid-main': {
                                                    height: '100%',
                                                },
                                                '& .MuiDataGrid-columnHeaders': {
                                                    bgcolor: '#F8FAFC',
                                                    color: '#64748B',
                                                    fontWeight: 800,
                                                    fontSize: '10px',
                                                    textTransform: 'uppercase',
                                                    borderBottom: '1px solid #E2E8F0',
                                                    minHeight: '45px !important',
                                                    maxHeight: '45px !important',
                                                },
                                                '& .MuiDataGrid-columnHeader': {
                                                    height: '45px !important',
                                                },
                                                '& .MuiDataGrid-columnHeaderTitle': {
                                                    color: '#64748B',
                                                    fontWeight: 800,
                                                    fontSize: '10px',
                                                    letterSpacing: '0.5px',
                                                },
                                                '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                                    color: '#64748B',
                                                },
                                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                                    outline: 'none',
                                                    border: 'none',
                                                },
                                                '& .highlight-separator': {
                                                    borderBottom: '1px solid red'
                                                },
                                                '& .MuiDataGrid-row.highlight-separator': {
                                                    borderBottom: '1px solid red',
                                                },
                                                '& .MuiDataGrid-virtualScroller': {
                                                    height: '100%',
                                                },
                                                '& .MuiDataGrid-row': {
                                                    '&:hover': { bgcolor: '#F1F5F9' },
                                                    transition: '0.2s',
                                                    minHeight: '34px !important',
                                                    maxHeight: '34px !important',
                                                },
                                                '& .MuiDataGrid-cell': {
                                                    fontSize: '13px',
                                                    color: '#475569',
                                                    borderBottom: '1px solid #F1F5F9',
                                                    py: 1,
                                                },
                                            }}
                                            rowHeight={34}
                                            columnHeaderHeight={45}
                                            editMode='row'
                                            columns={CodeJournauxColumnHeader}
                                            rows={filteredCodeJournaux}
                                            onRowClick={(e) => handleCellEditCommit(e.row)}
                                            onRowSelectionModelChange={ids => {
                                                const single = Array.isArray(ids) && ids.length ? [ids[ids.length - 1]] : [];
                                                setSelectedRow(single);
                                                saveSelectedRow(single);
                                                deselectRow(single);
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
                                            rowSelectionModel={selectedRow}
                                            onCellDoubleClick={(params, event) => {
                                                const rowId = params.id;
                                                const rowData = params.row;

                                                const isNewRow = rowId < 0;

                                                if (!canModify && !isNewRow) {
                                                    event.defaultMuiPrevented = true;
                                                    return;
                                                }

                                                event.stopPropagation();
                                                setDisableAddRowBouton(true);

                                                setLibelleValidationColor('transparent');
                                                setTypeValidationColor('transparent');
                                                setCompteAssocieValidationColor('transparent');

                                                formikNewCodeJournal.setFieldValue("idCode", rowId);
                                                formikNewCodeJournal.setFieldValue("idDossier", fileId);
                                                formikNewCodeJournal.setFieldValue("idCompte", compteId);
                                                formikNewCodeJournal.setFieldValue("code", rowData.code);
                                                formikNewCodeJournal.setFieldValue("libelle", rowData.libelle);
                                                formikNewCodeJournal.setFieldValue("type", rowData.type);
                                                formikNewCodeJournal.setFieldValue("compteassocie", rowData.compteassocie);

                                                setRowModesModel((oldModel) => ({
                                                    ...oldModel,
                                                    [rowId]: { mode: GridRowModes.Edit },
                                                }));

                                                setDisableSaveBouton(false);
                                            }}
                                            onCellKeyDown={handleCellKeyDown}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>
                        </TabPanel>
                    </TabContext>
                </Box>

            </Box >
        </>
    )
}
