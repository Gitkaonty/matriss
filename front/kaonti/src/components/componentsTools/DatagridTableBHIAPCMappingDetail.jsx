import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography, Stack, Paper, RadioGroup, FormControlLabel, Radio, FormControl,
    InputLabel, Select, MenuItem, TextField, Box, Tab,
    FormHelperText,
    Input
} from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { init } from '../../../init';
import axios from '../../../config/axios';
import toast from 'react-hot-toast';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useFormik, Field, Formik, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import QuickFilter from './DatagridToolsStyle';
import { DataGridStyle } from './DatagridToolsStyle';
import { format } from 'date-fns';
import { InfoFileStyle } from './InfosFileStyle';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { RxReset } from "react-icons/rx";
import { VscClose } from 'react-icons/vsc';
import { TfiSave } from 'react-icons/tfi';
import PopupConfirmDelete from './popupConfirmDelete';

export const DatagridBHIAPCdetail = ({ compteId, fileId, exerciceId, etatId, rubriqueId, nature, bilanRubriqueData }) => {
    let initial = init[0];
    const DataDetail = bilanRubriqueData;
    const [compteRubriqueData, setCompteRubriqueData] = useState([]);

    const [editableRow, setEditableRow] = useState(true);
    const [compteValidationColor, setCompteValidationColor] = useState('transparent');
    const [sensCalculValidationColor, setSensCalculValidationColor] = useState('transparent');
    const [conditionValidationColor, setConditionValidationColor] = useState('transparent');
    const [equationValidationColor, setEquationValidationColor] = useState('transparent');

    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(true);

    const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);
    const [disableDefaultFieldModif, setDisableDefaultFieldModif] = useState(false);

    useEffect(() => {
        if (rubriqueId === 0 || !rubriqueId) {
            setDisableAddRowBouton(true);
        } else {
            setDisableAddRowBouton(false);
        }
    }, [rubriqueId]);

    useEffect(() => {
        setCompteRubriqueData(DataDetail);
    }, [bilanRubriqueData]);

    const sensCalcul = [
        { value: 'D-C', label: 'Débit - Crédit' },
        { value: 'C-D', label: 'Crédit - Débit' },
    ];

    const condition = [
        { value: 'SOLDE', label: 'Solde' },
        { value: 'SiD', label: 'Si débiteur' },
        { value: 'SiC', label: 'Si créditeur' },
    ];

    const equation = [
        { value: 'ADDITIF', label: 'Additif' },
        { value: 'SOUSTRACTIF', label: 'Soustractif' },
    ];

    //formulaire pour la sauvegarde
    const formNewParam = useFormik({
        initialValues: {
            idParam: 0,
            compteId: compteId,
            fileId: fileId,
            exerciceId: exerciceId,
            etatId: etatId,
            rubriqueId: rubriqueId,
            nature: nature,
            compte: '',
            senscalcul: '',
            condition: '',
            equation: '',
            par_default: true,
            active: true
        },
        validationSchema: Yup.object({
            nature: Yup.string().required("Ce champ est obligatoire"),
            senscalcul: Yup.string().required("Ce champ est obligatoire"),
            condition: Yup.string().required("Ce champ est obligatoire"),
            equation: Yup.string().required("Ce champ est obligatoire")
        }),
        onSubmit: (values) => {

        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    const handleChangeCompte = (value) => {
        formNewParam.setFieldValue('compte', value);
    }

    const handleChangeSensCalcul = (value) => {
        formNewParam.setFieldValue('senscalcul', value);
    }

    const handleChangeCondition = (value) => {
        formNewParam.setFieldValue('condition', value);
    }

    const handleChangeEquation = (value) => {
        formNewParam.setFieldValue('equation', value);
    }

    const columnHeader = [
        {
            field: 'compte',
            headerName: 'Compte',
            type: 'string',
            sortable: true,
            flex: 5,
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
                                backgroundColor: compteValidationColor
                            }}
                            type="text"
                            value={formNewParam.values.compte}
                            onChange={(e) => handleChangeCompte(e.target.value)}
                            label="libelle"
                            disableUnderline={true}
                            disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'senscalcul',
            headerName: 'Sens calcul',
            type: 'singleSelect',
            sortable: true,
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            valueFormatter: (params) => {
                const selectedType = sensCalcul?.find((option) => option.value === params.value);
                return selectedType ? selectedType.label : params.label;
            },

            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth>
                        <InputLabel><em>Choisir...</em></InputLabel>
                        <Select
                            disabled={disableDefaultFieldModif}
                            style={{ backgroundColor: sensCalculValidationColor }}
                            value={formNewParam.values.senscalcul}
                            onChange={(e) => handleChangeSensCalcul(e.target.value)}
                            label="sensCalucl"
                        >
                            {sensCalcul?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText style={{ color: 'red' }}>
                            {formNewParam.errors.compte && formNewParam.touched.compte && formNewParam.errors.compte}
                        </FormHelperText>
                    </FormControl>
                );
            },
        },
        {
            field: 'active',
            headerName: 'Activé',
            type: 'boolean',
            sortable: true,
            flex: 0.5,
            headerAlign: 'left',
            align: 'center',
            headerClassName: 'HeaderbackColor',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <input
                        // value={formNewParam.values.active}
                        checked={formNewParam.values.active}
                        type="checkbox"
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                    />
                );
            },
        },
        // {
        //     field: 'par_default',
        //     headerName: 'Par défaut',
        //     type: 'boolean',
        //     sortable: true,
        //     flex: 0.5,
        //     headerAlign: 'left',
        //     align: 'center',
        //     headerClassName: 'HeaderbackColor',
        //     editable: false
        // },
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
        setCompteValidationColor('transparent');
        setSensCalculValidationColor('transparent');
        setConditionValidationColor('transparent');
        setEquationValidationColor('transparent');
        //charger dans le formik les données de la ligne
        const selectedRowInfos = compteRubriqueData?.filter((item) => item.id === id[0]);

        //rendre inaccessible les champs si des champs de paramétrages par défaut       
        if (selectedRowInfos[0]?.par_default) {
            setDisableDefaultFieldModif(true);
        } else {
            setDisableDefaultFieldModif(false);
        }

        formNewParam.setFieldValue("idParam", selectedRowInfos[0]?.id ? selectedRowInfos[0]?.id : 0);
        formNewParam.setFieldValue("compteId", compteId);
        formNewParam.setFieldValue("fileId", fileId);
        formNewParam.setFieldValue("exerciceId", exerciceId);
        formNewParam.setFieldValue("etatId", etatId);
        formNewParam.setFieldValue("rubriqueId", 1);
        formNewParam.setFieldValue("compte", selectedRowInfos[0]?.compte ? selectedRowInfos[0]?.compte : '');
        formNewParam.setFieldValue("nature", "BRUT");
        formNewParam.setFieldValue("senscalcul", selectedRowInfos[0]?.senscalcul ? selectedRowInfos[0]?.senscalcul : '');
        formNewParam.setFieldValue("condition", "SOLDE");
        formNewParam.setFieldValue("equation", "ADDITIF");
        formNewParam.setFieldValue("par_default", selectedRowInfos[0]?.par_default ? selectedRowInfos[0]?.par_default : false);
        formNewParam.setFieldValue("active", selectedRowInfos[0]?.active ? selectedRowInfos[0]?.active : false);

        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
    };

    const handleSaveClick = (id) => () => {
        let saveBoolCompte = false;
        let saveBoolSensCalcul = false;
        let saveBoolCondition = false;
        let saveBoolEquation = false;

        setCompteValidationColor('transparent');
        setSensCalculValidationColor('transparent');
        setConditionValidationColor('transparent');
        setEquationValidationColor('transparent');

        if (formNewParam.values.compte === '') {
            setCompteValidationColor('#F6D6D6');
            saveBoolCompte = false;
        } else {
            setCompteValidationColor('transparent');
            saveBoolCompte = true;
        }

        if (formNewParam.values.senscalcul === '') {
            setSensCalculValidationColor('#F6D6D6');
            saveBoolSensCalcul = false;
        } else {
            setSensCalculValidationColor('transparent');
            saveBoolSensCalcul = true;
        }

        if (formNewParam.values.condition === '') {
            setConditionValidationColor('#F6D6D6');
            saveBoolCondition = false;
        } else {
            setConditionValidationColor('transparent');
            saveBoolCondition = true;
        }

        if (formNewParam.values.equation === '') {
            setEquationValidationColor('#F6D6D6');
            saveBoolEquation = false;
        } else {
            setEquationValidationColor('transparent');
            saveBoolEquation = true;
        }

        if (saveBoolCompte && saveBoolSensCalcul) {
            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

            axios.post(`/paramMappingCompte/MappingCompteAdd`, formNewParam.values).then((response) => {
                const resData = response.data;

                if (resData.state) {
                    setDisableSaveBouton(true);
                    formNewParam.resetForm();
                    getListeCompteRubriqueAfterUpdating();
                    toast.success(resData.msg);
                } else {
                    toast.error(resData.msg);
                }
            });
        } else {
            toast.error('Les champs en surbrillances sont obligatoires');
        }
    };

    const handleOpenDialogConfirmDeleteRow = () => {
        setOpenDialogDeleteRow(true);
    }

    const deleteRow = (value) => {
        if (value === true) {
            if (selectedRowId.length === 1) {
                const idToDelete = selectedRowId[0];

                let DefaultRow = true;
                const RowInfos = compteRubriqueData.filter((row) => row.id === idToDelete)

                if (RowInfos) {
                    DefaultRow = RowInfos[0].par_default;
                }

                if (DefaultRow) {
                    toast.error("Vous ne pouvez pas supprimer les paramétrages par défault. désactivez-les en cas de nécessité.");
                } else {
                    axios.post(`/paramMappingCompte/mappingCompteDelete`, { fileId, compteId, exerciceId, idToDelete }).then((response) => {
                        const resData = response.data;
                        if (resData.state) {
                            setOpenDialogDeleteRow(false);
                            setCompteRubriqueData(compteRubriqueData.filter((row) => row.id !== selectedRowId[0]));
                            toast.success(resData.msg);
                        } else {
                            setOpenDialogDeleteRow(false);
                            toast.error(resData.msg);
                        }
                    });
                }

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
        setCompteRubriqueData(compteRubriqueData.map((row) => (row.id === newRow.id ? updatedRow : row)));
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

    //Ajouter une ligne dans le tableau
    const handleOpenDialogAddNewRow = () => {
        const newId = -1 * (getMaxID(compteRubriqueData) + 1);
        formNewParam.setFieldValue("idParam", newId);
        formNewParam.setFieldValue("par_default", false);
        const newRow = {
            id: newId,
            compte: '',
            sensCalcul: '',
            condtion: '',
            equation: '',
            par_default: false,
            active: true,
        };
        setCompteRubriqueData([...compteRubriqueData, newRow]);
    }

    //récupérer le numéro id le plus grand dans le tableau
    const getMaxID = (data) => {
        const Ids = data.map(item => item.id);
        return Math.max(...Ids);
    };

    const getListeCompteRubriqueAfterUpdating = () => {
        const choixPoste = nature;
        const tableau = etatId;
        axios.post(`/paramMappingCompte/listeCompteRubrique`, { compteId, fileId, exerciceId, tableau, choixPoste, rubriqueId }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setCompteRubriqueData(resData.liste);
            } else {
                toast.error(resData.msg);
            }
        });
    }

    //enregistrer le choix activer ou non d'une nouvelle ligne ou de la modification en cours
    const handleCheckboxChange = (value) => {
        formNewParam.setFieldValue("active", value);
    }

    return (
        <Stack direction={'column'} alignContent={'left'} alignItems={"left"} spacing={1} width={"100%"} height={"100%"}>
            {openDialogDeleteRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"} confirmationState={deleteRow} /> : null}

            <Stack direction={'row'} alignContent={'center'} alignItems={"center"} spacing={1} width={"100%"} height={"30px"}>
                <Stack width={"100%"} height={"10px"} spacing={0} alignItems={"center"} alignContent={"center"}
                    direction={"row"} style={{ marginTop: "20px" }}>

                    <Stack width={"50%"} height={"30px"} spacing={2} alignItems={"left"} alignContent={"left"}
                        direction={"row"} justifyContent={"left"}>
                        <Typography variant='h7' sx={{ color: "rgba(5,96,116,0.60)" }} align='left'>Détails des calculs</Typography>
                    </Stack>
                </Stack>

                <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"left"} alignContent={"left"}
                    direction={"row"} justifyContent={"right"} style={{ marginRight: "0px" }}>
                    <Tooltip title="Ajouter une ligne">
                        <IconButton
                            disabled={disableAddRowBouton}
                            variant="contained"
                            onClick={handleOpenDialogAddNewRow}
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
                                disabled={!formNewParam.isValid}
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
                                onClick={handleOpenDialogConfirmDeleteRow}
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
            </Stack>
            <Stack
                width="100%"
                height="500px"
                style={{
                    marginLeft: "0px",
                    marginTop: "20px",
                }}
            >
                <DataGrid
                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                    disableRowSelectionOnClick
                    disableSelectionOnClick={true}
                    slots={{ toolbar: QuickFilter }}
                    sx={{
                        ...DataGridStyle.sx,
                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                            border: 'none',
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            maxHeight: '100%',
                        },
                    }}
                    rowHeight={DataGridStyle.rowHeight}
                    columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                    editMode='row'
                    onRowClick={(e) => handleCellEditCommit(e.row)}
                    onRowSelectionModelChange={ids => {
                        saveSelectedRow(ids);
                    }}
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    rows={compteRubriqueData}
                    columns={columnHeader}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 100 },
                        },
                    }}
                    pageSizeOptions={[50, 100]}
                    pagination={DataGridStyle.pagination}
                    checkboxSelection={DataGridStyle.checkboxSelection}
                    columnVisibilityModel={{
                        id: false,
                    }}
                />
            </Stack>
        </Stack>
    );
}