import { React, useState, useEffect, useRef } from 'react';
import { Typography, Stack, Paper, Select, MenuItem, Tooltip, Button, IconButton, FormControl, Input } from '@mui/material';
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
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import { TbPlaylistAdd } from 'react-icons/tb';
import { IoMdTrash } from 'react-icons/io';
import MontantCapitalField from './Field/MontantCapitalField';

export default function AddNewFile({ confirmationState }) {
    const closed = () => {
        confirmationState(false);
    }

    const [value, setValue] = useState("1");
    const [listModel, setListModel] = useState([]);
    const [listAssocie, setListAssocie] = useState([]);
    const [listAssocieFormik, setListAssocieFormik] = useState([]);
    const [listFiliales, setListFiliales] = useState([]);
    const [listFilialesFormik, setListFilialesFormik] = useState([]);
    const initial = init[0];
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);

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

    const [selectedRowAssocie, setSelectedRowAssocie] = useState([]);
    const [selectedRowFiliales, setSelectedRowFiliales] = useState([]);

    //récupération infos compte
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

    // État pour le type de centre fiscal (DGE ou centre fiscale)
    // Synchronisé avec Formik : plus besoin de ce state séparé
    // const [typeCentre, setTypeCentre] = useState('DGE');

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
        plancomptable: 0,
        longueurcptstd: 6,
        longueurcptaux: 6,
        autocompletion: true,
        avecanalytique: false,
        tauxir: '',
        assujettitva: false,
        montantcapital: null,
        nbrpart: 0,
        valeurpart: 0,
        listeAssocies: [],
        listeFiliales: [],
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

    const handleRowEditStopFiliale = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClickFiliale = (id) => () => {
        setRowModesModelFiliale({ ...rowModesModelFiliale, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBoutonFiliale(false);
    };

    const handleSaveClickFiliale = (setFieldValue) => () => {
        setRowModesModelFiliale({ ...rowModesModelFiliale, [selectedRowIdFiliale]: { mode: GridRowModes.View } });
        setDisableSaveBoutonFiliale(true);
        setDisableAddRowBoutonFiliale(false);
        toast.success("Informations sauvegardées");
    };

    const handleOpenDialogConfirmDeleteAssocieRowFiliale = () => {
        setOpenDialogDeleteFilialeRow(true);
        setDisableAddRowBoutonFiliale(false);
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
    const handlSubmitNewFile = (values) => {
        const montantcapitalRaw = values.montantcapital || "0";
        const montantcapitalNumber = parseFloat(
            montantcapitalRaw.replace(/\s/g, "").replace(",", ".") || montantcapitalRaw
        ).toFixed(2);
        // return console.log(values);
        const montantCapitalFormatted = Number(montantcapitalNumber);
        values.montantcapital = montantCapitalFormatted;
        axios.post(`/home/newFile`, values).then((response) => {
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

    return (
        <Box
            sx={{
                paddingX: 3,
                paddingY: 2
            }}
        >
            {/* MODAL POUR LA SUPPRESSION D'UNE LIGNE DU TABLEAU ASSOCIE */}
            {openDialogDeleteAssocieRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"} confirmationState={deleteAssocieRow} /> : null}

            {/* MODAL POUR LA SUPPRESSION D'UNE LIGNE DU TABLEAU FILIALE */}
            {openDialogDeleteFilialeRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"} confirmationState={deleteFilialeRow} /> : null}
            <Formik
                initialValues={InfosNewFileInitialValues}
                validationSchema={formInfosNewFileValidationSchema}
                onSubmit={(values) => {
                    handlSubmitNewFile(values);
                }}
            >
                {({ handleChange, handleSubmit, setFieldValue, resetForm, values }) => {
                    const calculateValeurPart = (capital, nbrPart) => {
                        const numCapital = parseFloat(capital?.toString().replace(/\s/g, '').replace(',', '.')) || 0;
                        const numParts = parseFloat(nbrPart) || 0;
                        if (numParts === 0) return 0;
                        const valPart = numCapital / numParts;
                        const valPartFormatted = Number((valPart).toFixed(2));
                        return valPartFormatted;
                    };
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
                                            height: '43px',
                                            width: '120px',
                                            textTransform: 'none',
                                            outline: 'none',
                                            border: 'none',
                                            backgroundColor: initial.theme,
                                            borderRadius: '5px'
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
                                                        as={Select}
                                                        required
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
                                                        <MontantCapitalField setFieldValue={setFieldValue} calculateValeurPart={calculateValeurPart} values={values} />
                                                        <ErrorMessage name='montantcapital' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                    </Stack>

                                                    <Stack spacing={1}>
                                                        <label htmlFor="nbrpart" style={{ fontSize: 12, color: '#3FA2F6' }}>Nombre parts</label>
                                                        <Field
                                                            required
                                                            name='nbrpart'
                                                            onChange={(e) => {
                                                                // handleChange(e);
                                                                const nbrPartValue = e.target.value;
                                                                const nbrPartFormatted = Number(nbrPartValue);
                                                                setFieldValue('nbrpart', nbrPartFormatted);
                                                                const newValeurPart = calculateValeurPart(values.montantcapital, nbrPartFormatted);
                                                                setFieldValue('valeurpart', newValeurPart);
                                                            }}
                                                            type='text'
                                                            placeholder=""
                                                            style={{
                                                                height: 22,
                                                                borderTop: 'none',
                                                                borderLeft: 'none',
                                                                borderRight: 'none',
                                                                outline: 'none',
                                                                fontSize: 14,
                                                                borderWidth: '0.5px',
                                                                width: '100px',
                                                                textAlign: "right",
                                                            }}
                                                        />
                                                        <ErrorMessage name='nbrpart' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                    </Stack>

                                                    <Stack spacing={1}>
                                                        <label htmlFor="valeurpart" style={{ fontSize: 12, color: '#3FA2F6' }}>Valeur d'une part</label>
                                                        <Field name="valeurpart">
                                                            {({ field }) => {
                                                                const numericValue = parseFloat(field.value?.toString().replace(/\s/g, '').replace(',', '.')) || 0;
                                                                const formattedValue = numericValue.toLocaleString("fr-FR", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                });

                                                                return (
                                                                    <input
                                                                        {...field}
                                                                        type="text"
                                                                        disabled
                                                                        value={formattedValue}
                                                                        style={{
                                                                            height: 22,
                                                                            borderTop: 'none',
                                                                            borderLeft: 'none',
                                                                            borderRight: 'none',
                                                                            outline: 'none',
                                                                            fontSize: 14,
                                                                            borderWidth: '0.5px',
                                                                            width: '120px',
                                                                            textAlign: 'right',
                                                                            color: 'black'
                                                                        }}
                                                                    />
                                                                );
                                                            }}
                                                        </Field>
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
                                                            disabled={disableAddRowBouton}
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

                                                <Stack
                                                    width={"100%"}
                                                    height={"500px"}
                                                >
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
                                                            setSelectedRowAssocie(ids)
                                                            saveSelectedRow(ids);
                                                            deselectRowAssocie(ids);
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
                                                        rowSelectionModel={selectedRowAssocie}
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
                                                            disabled={disableAddRowBoutonFiliale}
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
                                                                onClick={handleSaveClickFiliale(setFieldValue)}
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

                                                <Stack
                                                    width={"100%"}
                                                    height={"500px"}
                                                >
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
                                                            setSelectedRowFiliales(ids);
                                                            saveSelectedRowFiliale(ids);
                                                            deselectRowFiliale(ids);
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
                                                        rowSelectionModel={selectedRowFiliales}
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
        </Box>
    )
}
