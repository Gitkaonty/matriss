import { useState, useEffect } from 'react';
import { Typography, Stack, Paper, TextField, FormControl, Select, MenuItem, Tooltip, Button, IconButton, FormHelperText, Input, Autocomplete, Checkbox, RadioGroup, Radio, InputLabel, Grid } from '@mui/material';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { MdExpandCircleDown } from "react-icons/md";
import toast from 'react-hot-toast';
import { useFormik, Field, Formik, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import { init } from '../../../../init';
import useAuth from '../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../config/axios';
import { VscLinkExternal } from "react-icons/vsc";
import { FaTools } from "react-icons/fa";
import { FaHotel, FaRegPenToSquare } from "react-icons/fa6";
import { FaIndustry } from "react-icons/fa6";
import { GiMineWagon } from "react-icons/gi";
import { FaTruck } from "react-icons/fa6";
import { MdOutlineTravelExplore } from "react-icons/md";
import { VscClose } from "react-icons/vsc";
import PopupConfirmDelete from '../../componentsTools/popupConfirmDelete';
import { TfiSave } from "react-icons/tfi";
import { DataGridStyle } from '../../componentsTools/DatagridToolsStyle';
import QuickFilter from '../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes, useGridApiRef } from '@mui/x-data-grid';
import { TbPlaylistAdd } from 'react-icons/tb';
import { IoMdTrash } from 'react-icons/io';
import { FormControlLabel } from '@mui/material';
import MontantCapitalField from './Field/MontantCapitalField';
import useAxiosPrivate from '../../../../config/axiosPrivate';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PasswordField from './Field/PasswordField';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function AddNewFile({ confirmationState }) {
    const apiRef = useGridApiRef();
    const closed = () => {
        confirmationState(false);
    }

    const axiosPrivate = useAxiosPrivate();

    const [value, setValue] = useState("1");
    const [listModel, setListModel] = useState([]);
    const [listAssocie, setListAssocie] = useState([]);
    const [listFiliales, setListFiliales] = useState([]);
    const [listConsolidation, setListConsolidation] = useState([]);
    const [listDomBank, setListDomBank] = useState([]);
    const [listPays, setListPays] = useState([]);
    const [listProvinces, setListProvinces] = useState([]);
    const [listRegions, setListRegions] = useState([]);
    const [listDistricts, setListDistricts] = useState([]);
    const [listCommunes, setListCommunes] = useState([]);
    const [listeDossier, setListeDossier] = useState([]);

    const selectedDossierIds = listConsolidation
        .map(val => Number(val.idDossier))
        .filter(Boolean);

    const availableDossier = listeDossier.filter(d =>
        !selectedDossierIds.includes(d.id) || d.id === value
    );

    const initial = init[0];
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);
    const [disableAddRowBoutonDomBank, setDisableAddRowBoutonDomBank] = useState(false);

    const [editableRow, setEditableRow] = useState(true);
    const [openDialogDeleteAssocieRow, setOpenDialogDeleteAssocieRow] = useState(false);

    const [selectedRowIdFiliale, setSelectedRowIdFiliale] = useState([]);
    const [rowModesModelFiliale, setRowModesModelFiliale] = useState({});
    const [disableModifyBoutonFiliale, setDisableModifyBoutonFiliale] = useState(true);
    const [disableCancelBoutonFiliale, setDisableCancelBoutonFiliale] = useState(true);
    const [disableSaveBoutonFiliale, setDisableSaveBoutonFiliale] = useState(true);
    const [disableDeleteBoutonFiliale, setDisableDeleteBoutonFiliale] = useState(true);
    const [disableAddRowBoutonFiliale, setDisableAddRowBoutonFiliale] = useState(false);

    const [editableRowFiliale, setEditableRowFiliale] = useState(true);
    const [openDialogDeleteFilialeRow, setOpenDialogDeleteFilialeRow] = useState(false);

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

    const [selectedRowAssocie, setSelectedRowAssocie] = useState([]);
    const [selectedRowFiliales, setSelectedRowFiliales] = useState([]);

    const [selectedRowIdDomBank, setSelectedRowIdDomBank] = useState([]);
    const [rowModesModelDomBank, setRowModesModelDomBank] = useState({});
    const [disableModifyBoutonDomBank, setDisableModifyBoutonDomBank] = useState(true);
    const [disableCancelBoutonDomBank, setDisableCancelBoutonDomBank] = useState(true);
    const [disableSaveBoutonDomBank, setDisableSaveBoutonDomBank] = useState(true);
    const [disableDeleteBoutonDomBank, setDisableDeleteBoutonDomBank] = useState(true);
    const [editableRowDomBank, setEditableRowDomBank] = useState(true);
    const [openDialogDeleteDomBankRow, setOpenDialogDeleteDomBankRow] = useState(false);

    const [bankDomBankValidationColor, setBankDomBankValidationColor] = useState('transparent');
    const [numCompteDomBankValidationColor, setNumCompteDomBankValidationColor] = useState('transparent');
    const [deviseDomBankValidationColor, setDeviseDomBankValidationColor] = useState('transparent');

    const [selectedRowDomBank, setSelectedRowDomBank] = useState([]);
    const [listePortefeuille, setListePortefeuille] = useState([]);

    //récupération infos compte
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
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
            enactivite: false,
        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    //Form pour l'enregistrement des données
    const InfosNewFileInitialValues = {
        centrefisc: 'DGE', // Valeur par défaut, synchronisée avec le radio fiscal

        action: 'new',
        itemId: 0,
        idCompte: 0,
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
        province: '',
        region: '',
        district: '',
        commune: '',
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
        listeDomBank: [],
        // Immobilisation
        immo_amort_base_jours: '365',
        portefeuille: [],
        typecomptabilite: 'Français',
        devisepardefaut: 'MGA',
        consolidation: false,
        listeConsolidation: [],
        pays: '',
        avecMotDePasse: false,
        motDePasse: '',
        motDePasseConfirmation: ''
    };

    const formInfosNewFileValidationSchema = Yup.object({
        nomdossier: Yup.string().required("Veuillez tapez un nom pour votre dossier"),
    });

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
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
        setDisableSaveBouton(true);
        toast.success("Informations sauvegardées");
        setDisableAddRowBouton(false);
    };

    const handleOpenDialogConfirmDeleteAssocieRow = () => {
        setOpenDialogDeleteAssocieRow(true);
        setDisableAddRowBouton(false);
    }

    const deleteAssocieRow = (value) => {
        if (value === true) {
            setListAssocie(listAssocie.filter((row) => row.id !== selectedRowId[0]));
            setOpenDialogDeleteAssocieRow(false);
            setDisableAddRowBouton(false);
            toast.success('Ligne supprimée avec succès');
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

    //Ajouter une ligne dans le tableau liste associé
    const handleOpenDialogAddNewAssocie = () => {
        setDisableModifyBouton(false);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(false);

        const newId = -Date.now();

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

        const updatedList = [...listAssocie, newRow];
        setListAssocie(updatedList);

        setSelectedRowAssocie([newRow.id]);
        setSelectedRowId([newRow.id]);

        setDisableAddRowBouton(true);
    };

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
            }
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
            }
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

    const handleRowEditStopFiliale = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleRowEditStopConsolidation = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClickFiliale = (id) => () => {
        setRowModesModelFiliale({ ...rowModesModelFiliale, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBoutonFiliale(false);
    };

    const handleEditClickConsolidation = (id) => () => {
        setRowModesModelConsolidation({ ...rowModesModelConsolidation, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBoutonConsolidation(false);
    };

    const handleSaveClickFiliale = (setFieldValue) => () => {
        setRowModesModelFiliale({ ...rowModesModelFiliale, [selectedRowIdFiliale]: { mode: GridRowModes.View } });
        setDisableSaveBoutonFiliale(true);
        setDisableAddRowBoutonFiliale(false);
        toast.success("Informations sauvegardées");
    };

    const handleSaveClickConsolidation = (setFieldValue) => () => {
        setRowModesModelConsolidation({ ...rowModesModelConsolidation, [selectedRowIdConsolidation]: { mode: GridRowModes.View } });
        setDisableSaveBoutonConsolidation(true);
        setDisableAddRowBoutonConsolidation(false);
        toast.success("Informations sauvegardées");
    };

    const handleOpenDialogConfirmDeleteAssocieRowFiliale = () => {
        setOpenDialogDeleteFilialeRow(true);
        setDisableAddRowBoutonFiliale(false);
    }

    const handleOpenDialogConfirmDeleteConsolidationRow = () => {
        setOpenDialogDeleteConsolidationRow(true);
        setDisableAddRowBoutonConsolidation(false);
    }

    const deleteFilialeRow = (value) => {
        if (value === true) {
            setListFiliales(listFiliales.filter((row) => row.id !== selectedRowIdFiliale[0]));
            setOpenDialogDeleteFilialeRow(false);
            setDisableAddRowBoutonFiliale(false);
            toast.success('Ligne supprimée avec succès');
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

    const deleteConsolidationRow = (value) => {
        if (value === true) {
            setListConsolidation(listConsolidation.filter((row) => row.id !== selectedRowIdConsolidation[0]));
            setOpenDialogDeleteConsolidationRow(false);
            setDisableAddRowBoutonConsolidation(false);
            toast.success('Ligne supprimée avec succès');
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

    const processRowUpdateFiliale = (setFieldValue) => (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setListFiliales(listFiliales.map((row) => (row.id === newRow.id ? updatedRow : row)));
        setFieldValue('listeFiliales', listFiliales.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const processRowUpdateConsolidation = (setFieldValue) => (newRow) => {
        const updatedRow = { ...newRow };
        setListConsolidation(listConsolidation.map((row) => (row.id === newRow.id ? updatedRow : row)));
        setFieldValue('listeConsolidation', listConsolidation.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChangeFiliale = (newRowModesModel) => {
        setRowModesModelFiliale(newRowModesModel);
    };

    const handleRowModesModelChangeConsolidation = (newRowModesModel) => {
        setRowModesModelConsolidation(newRowModesModel);
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
        const newRow = {
            id: listFiliales.length + 1,
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

    //Ajouter une ligne dans le tableau liste consolidation
    const handleOpenDialogAddNewConsolidation = () => {
        setDisableModifyBoutonConsolidation(false);
        setDisableCancelBoutonConsolidation(false);
        setDisableDeleteBoutonConsolidation(false);
        const newRow = {
            id: listConsolidation.length + 1,
        };
        setListConsolidation([...listConsolidation, newRow]);
        setSelectedRowConsolidations([newRow.id]);
        setSelectedRowIdConsolidation([newRow.id]);
        setDisableAddRowBoutonConsolidation(true);
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

    //Récupération des données géographiques depuis l'API existante
    const getListeProvinces = () => {
        axios.get('/paramPlanComptable/getProvinces').then((response) => {
            const provinces = response.data.map(name => ({ id: name, name: name }));
            setListProvinces(provinces);
        }).catch((error) => {
            console.error('Erreur lors du chargement des provinces:', error);
        });
    }

    const getListeRegions = (province) => {
        if (!province) {
            setListRegions([]);
            return;
        }
        axios.get(`/paramPlanComptable/getRegions/${province}`).then((response) => {
            const regions = response.data.map(name => ({ id: name, name: name }));
            setListRegions(regions);
        }).catch((error) => {
            console.error('Erreur lors du chargement des régions:', error);
        });
    }

    const getListeDistricts = (province, region) => {
        if (!province || !region) {
            setListDistricts([]);
            return;
        }
        axios.get(`/paramPlanComptable/getDistricts/${province}/${region}`).then((response) => {
            const districts = response.data.map(name => ({ id: name, name: name }));
            setListDistricts(districts);
        }).catch((error) => {
            console.error('Erreur lors du chargement des districts:', error);
        });
    }

    const getListeCommunes = (province, region, district) => {
        if (!province || !region || !district) {
            setListCommunes([]);
            return;
        }
        axios.get(`/paramPlanComptable/getCommunes/${province}/${region}/${district}`).then((response) => {
            const communes = response.data.map(name => ({ id: name, name: name }));
            setListCommunes(communes);
        }).catch((error) => {
            console.error('Erreur lors du chargement des communes:', error);
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

    const getInfosDomBank = (id) => {
        axios.get(`/paramCrm/listeDomBank/${id}`).then((response) => {
            const resData = response.data;
            const safeList = Array.isArray(resData?.list) ? resData.list : [];
            setListDomBank(safeList);
        }).catch(() => setListDomBank([]));
    };

    const getMaxID = (data) => {
        const Ids = data.map(item => item.id);
        return Math.max(...Ids);
    };

    const getListeDossier = () => {
        axios.get(`/home/file/${compteId}`, { params: { userId: userId } }).then((response) => {
            const resData = response.data;
            setListeDossier(resData.fileList);
        })
    }

    useEffect(() => {
        GetListePlanComptableModele();
        getListeDossier();
    }, [compteId]);
    useEffect(() => {
        getListePays();
        getListeProvinces();
    }, []);
    useEffect(() => {
        getInfosDomBank(fileId);
    }, [fileId]);


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
    const handlSubmitNewFile = (values) => {
        const montantcapitalRaw = values.montantcapital || "0";
        const montantcapitalNumber = parseFloat(
            montantcapitalRaw.replace(/\s/g, "").replace(",", ".") || montantcapitalRaw
        ).toFixed(2);
        const montantCapitalFormatted = Number(montantcapitalNumber);
        values.montantcapital = montantCapitalFormatted;
        // Construit un payload incluant idCompte et la liste DomBank depuis le state

        const portefeuilleIds = values.portefeuille.map(val => Number(val.id));
        const payload = {
            ...values,
            idCompte: compteId,
            portefeuille: portefeuilleIds,
            listeDomBank: (Array.isArray(listDomBank) ? listDomBank : []).map(item => ({
                banque: item.banque || '',
                numcompte: item.numcompte || '',
                devise: item.devise || '',
                pays: item.pays || '',
                enactivite: Boolean(item.enactivite),
            })),
        };

        axiosPrivate.post(`/home/newFile`, payload).then((response) => {
            const resData = response.data;
            if (resData.state) {
                toast.success(resData.msg);
            } else {
                toast.error(resData.msg);
            }
            closed();
        })
    }

    const deselectRowAssocie = (ids) => {
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

        const updatedRowModes = { ...rowModesModelFiliale };
        deselected.forEach((id) => {
            updatedRowModes[id] = { mode: GridRowModes.View, ignoreModifications: true };
        });
        setRowModesModelFiliale(updatedRowModes);

        setDisableAddRowBoutonFiliale(false);
        setSelectedRowIdFiliale(ids);
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

    const handleOpenDialogAddNewDomBank = () => {

        setDisableModifyBoutonDomBank(false);
        setDisableCancelBoutonDomBank(false);
        setDisableDeleteBoutonDomBank(false);
        setDisableSaveBoutonDomBank(false);

        const newId = -Date.now();
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
        setSelectedRowDomBank([newId]);
        setDisableAddRowBoutonDomBank(true);
    }

    const handleEditClickDomBank = (id) => () => {
        //réinitialiser les couleurs des champs
        setBankDomBankValidationColor('transparent');
        setNumCompteDomBankValidationColor('transparent');
        setDeviseDomBankValidationColor('transparent');

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

        if (saveBoolbanque && saveBoolNumCompte && saveBoolDevise && saveBoolPays) {
            // Sauvegarde locale seulement (comme les associés)
            setRowModesModelDomBank({ ...rowModesModelDomBank, [selectedRowIdDomBank]: { mode: GridRowModes.View } });
            setDisableSaveBoutonDomBank(true);
            setDisableAddRowBoutonDomBank(false);
            toast.success("Informations sauvegardées");

            // Réinitialiser le formulaire
            useFormikDomBank.resetForm();
        } else {
            toast.error('Les champs en surbrillances sont obligatoires');
            setDisableAddRowBoutonDomBank(false);
        }
    };

    const handleOpenDialogConfirmDeleteAssocieRowDomBank = () => {
        setOpenDialogDeleteDomBankRow(true);
        setDisableAddRowBoutonDomBank(false);
    }

    const handleCancelClickDomBank = (id) => () => {
        setRowModesModelDomBank({
            ...rowModesModelDomBank,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
        setDisableAddRowBoutonDomBank(false);
    };

    const deleteDomBankRow = (value) => {
        if (value === true) {
            setListDomBank(listDomBank.filter((row) => row.id !== selectedRowIdDomBank[0]));
            setOpenDialogDeleteDomBankRow(false);
            setDisableAddRowBoutonDomBank(false);
            toast.success('Ligne supprimée avec succès');
        } else {
            setOpenDialogDeleteDomBankRow(false);
        }
    }

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

    const handleRowEditStopDomBank = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

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
                        checked={Boolean(params.value)}
                        type="checkbox"
                        onChange={(e) => {
                            const v = e.target.checked;
                            useFormikDomBank.setFieldValue('enactivite', v);
                            params.api.setEditCellValue({ id: params.id, field: params.field, value: v });
                            setListDomBank(prev => prev.map(row => row.id === params.id ? { ...row, enactivite: v } : row));
                        }}
                    />
                );
            }
        },
    ];

    // Entête tableau consolidation
    const ConsolidationColumnHeader = [
        {
            field: 'idDossier',
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


    useEffect(() => {
        getAllPortefeuille();
    }, [compteId]);

    const handleDialogClose = () => {
        closed();
    };
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

    return (
        <Paper
            sx={{
                paddingX: 3,
                paddingY: 2
            }}
        >

            <Formik
                initialValues={InfosNewFileInitialValues}
                validationSchema={formInfosNewFileValidationSchema}
                onSubmit={(values) => {

                    // S'assurer que la valeur centrefisc est bien DGE ou CFISC (pas 'centre fiscale')
                    const payload = {
                        ...values,
                        centrefisc: values.centrefisc === 'CFISC' || values.centrefisc === 'DGE' ? values.centrefisc : (values.centrefisc === 'centre fiscale' ? 'CFISC' : 'DGE')
                    };
                    handlSubmitNewFile(payload);
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

                    return (
                        <Form noValidate style={{ width: '100%' }}>
                            <Stack width={"100%"} height={"85%"} spacing={2} alignItems={"flex-start"} justifyContent={"stretch"}>
                                <Stack width={"100%"} height={"30px"} spacing={1} alignItems={"center"} alignContent={"center"}
                                    direction={"row"} justifyContent={"right"}
                                >
                                    <Typography variant='h6' sx={{ color: "black", width: 'calc(100% - 120px)' }} align='left'>Paramétrages: CRM</Typography>
                                    <Button variant="contained"
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
                                            borderRadius: "0",
                                            height: '32px', marginLeft: "5px", width: '120px', borderRadius: '4px',
                                            textTransform: 'none', outline: 'none', border: 'none', backgroundColor: initial.auth_gradient_end
                                        }}
                                    >
                                        Enregistrer
                                    </Button>

                                    <Button
                                        onClick={handleDialogClose}
                                        sx={{
                                            ...buttonStyle,
                                            backgroundColor: initial.annuler_bouton_color,
                                            color: 'white',
                                            borderColor: initial.annuler_bouton_color,

                                            '&:hover': {
                                                backgroundColor: initial.annuler_bouton_color,
                                                border: 'none',
                                            },

                                            // 👇 OVERRIDE DU DISABLED
                                            '&.Mui-disabled': {
                                                backgroundColor: initial.annuler_bouton_color,
                                                color: 'white',
                                                //opacity: 0.6,          // optionnel : juste un léger effet
                                                cursor: 'not-allowed',
                                            },
                                        }}
                                    >
                                        Fermer
                                    </Button>

                                </Stack>

                                <Box sx={{ width: '100%', typography: 'body1' }}>
                                    <TabContext value={value}>
                                        <Box sx={{ borderBottom: 1, borderColor: 'transparent' }}>
                                            <TabList onChange={handleChangeTAB} aria-label="lab API tabs example" variant='scrollable'>
                                                <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Infos société" value="1" />
                                                <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Comptabilité" value="2" />
                                                <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Fiscales" value="3" />
                                            </TabList>
                                        </Box>

                                        <TabPanel value="1">
                                            <Stack spacing={3}>
                                                {/* Ligne label + input */}
                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                    <InputLabel
                                                        htmlFor="nomdossier"
                                                        sx={{ fontSize: 12, color: '#c0c0c0ff' }}
                                                    >
                                                        Nom du dossier :
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
                                                </Stack>

                                                {/* Erreur en dessous de l’input */}
                                                <ErrorMessage
                                                    name="nomdossier"
                                                    component="div"
                                                    style={{ color: 'red', fontSize: 12 }}
                                                />
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
                                                        renderOption={(props, option, { selected }) => (
                                                            <li {...props} style={{ display: "flex", alignItems: "center", fontSize: 12 }}>
                                                                <Checkbox checked={selected} style={{ marginRight: 8 }} />
                                                                {option.nom}
                                                            </li>
                                                        )}
                                                        renderInput={(params) => (
                                                            <TextField {...params} size="small" />
                                                        )}
                                                    />
                                                    <ErrorMessage name='portefeuille' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                </Stack>
                                            </Stack>
                                        </TabPanel>

                                        <TabPanel value="2">
                                            <Stack width="100%" spacing={3}>
                                                <Grid container spacing={1} alignItems="flex-start">
                                                    <Grid item>
                                                        <Stack spacing={1} sx={{ width: '100%' }}>
                                                            <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                Plan comptable
                                                            </InputLabel>
                                                            <Field
                                                                as={Select}
                                                                name="plancomptable"
                                                                required
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
                                                            <ErrorMessage name="plancomptable" component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                        </Stack>
                                                    </Grid>

                                                    <Grid item>
                                                        <Stack spacing={1} sx={{ width: '100%' }}>
                                                            <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                Devise par défaut
                                                            </InputLabel>
                                                            <RadioGroup
                                                                row
                                                                value={values.devisepardefaut}
                                                                onChange={(e) => setFieldValue("devisepardefaut", e.target.value)}
                                                            >
                                                                <FormControlLabel value="MGA" control={<Radio />} label="MGA" />
                                                                <FormControlLabel value="Autres" control={<Radio />} label="Autres" />
                                                            </RadioGroup>
                                                            <ErrorMessage name='devisepardefaut' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                        </Stack>
                                                    </Grid>
                                                </Grid>

                                                {/* Titre */}
                                                <Typography fontWeight={600} fontSize={16} marginTop={1}>
                                                    Paramétrages de longueur des comptes
                                                </Typography>

                                                <Grid container spacing={1} alignItems="flex-start">
                                                    <Grid item>
                                                        <Stack spacing={1}>
                                                            <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                Compte standard
                                                            </InputLabel>
                                                            <Field
                                                                required
                                                                as={TextField}
                                                                name='longueurcptstd'
                                                                onChange={handleChange}
                                                                type='text'
                                                                size="small"
                                                                placeholder=""
                                                                sx={{
                                                                    width: 140, // réduit
                                                                    '& .MuiInputBase-root': { height: 32 },
                                                                    '& .MuiOutlinedInput-root': { height: 32 },
                                                                    '& .MuiOutlinedInput-input': { padding: '4px 8px' },
                                                                }}
                                                            />
                                                            <ErrorMessage name='longueurcptstd' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                        </Stack>
                                                    </Grid>
                                                    <Grid item>
                                                        <Stack spacing={1}>
                                                            <InputLabel sx={{ fontSize: 12, color: '#c0c0c0ff' }}>
                                                                Compte auxiliaire
                                                            </InputLabel>
                                                            <Field
                                                                required
                                                                as={TextField}
                                                                name='longueurcptaux'
                                                                onChange={handleChange}
                                                                type='text'
                                                                placeholder=""
                                                                size="small"
                                                                sx={{
                                                                    width: 140, // réduit
                                                                    '& .MuiInputBase-root': { height: 32 },
                                                                    '& .MuiOutlinedInput-root': { height: 32 },
                                                                    '& .MuiOutlinedInput-input': { padding: '4px 8px' },
                                                                }}
                                                            />
                                                            <ErrorMessage name='longueurcptaux' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
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

                                                {/* Avec analytique */}
                                                {/* <Stack direction="row" spacing={1} alignItems="center" marginTop={5}>
                                                    <Field
                                                        required
                                                        name='avecanalytique'
                                                        type='checkbox'
                                                        style={{ width: 20, height: 20, marginRight: 10 }}
                                                    />
                                                    <label htmlFor="avecanalytique" style={{ fontSize: 15, color: 'black' }}>Avec analytique</label>
                                                    <ErrorMessage name='avecanalytique' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                </Stack> */}

                                            </Stack>
                                        </TabPanel>


                                        <TabPanel value="3">
                                        </TabPanel>

                                    </TabContext>
                                </Box>
                            </Stack>

                        </Form>
                    );
                }}
            </Formik>
        </Paper >
    )
}
