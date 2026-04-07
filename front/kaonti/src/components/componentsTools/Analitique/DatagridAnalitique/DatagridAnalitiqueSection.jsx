import { useState, useEffect } from 'react';
import { Stack, Box, FormControl, Input, TextField, Dialog, DialogContent, DialogActions, Button, Typography, Paper } from '@mui/material';
import { IconButton, Tooltip, Checkbox } from '@mui/material';

import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/CheckCircleOutline';

const NAV_DARK = '#0B1120';
const NEON_MINT = '#00FF94';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes, useGridApiRef, GridToolbarQuickFilter } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { TfiSave } from 'react-icons/tfi';

import { useFormik } from 'formik';
import * as Yup from "yup";

import PopupConfirmDelete from '../../popupConfirmDelete';
import FormatedInput from '../../FormatedInput';
import useAxiosPrivate from '../../../../../config/axiosPrivate';
import PopupImportAnalitique from '../../../menuComponent/Parametrages/analytiques/PopupImportAnalitique';

const DatagridAnalitiqueSection = ({ selectedRowAxeId, id_compte, id_dossier, isCaActive, canModify, canAdd, canDelete, canView }) => {
    const apiRef = useGridApiRef();

    const axiosPrivate = useAxiosPrivate();
    let initial = init[0];
    const [sectionsData, setSectionsData] = useState([]);

    const [editableRow, setEditableRow] = useState(true);
    const [selectedRowSectionId, setSelectedRowSectionId] = useState([]);

    const [sectionValidationColor, setSectionValidationColor] = useState('transparent');
    const [intituleValidationColor, setIntituleValidationColor] = useState('transparent');
    const [compteValidationColor, setCompteValidationColor] = useState('transparent');
    const [pourcentageValidationColor, setPourcentageValidationColor] = useState('transparent');

    const [isRefreshed, setIsRefreshed] = useState(false);

    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);

    const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);
    const [openImportPopup, setOpenImportPopup] = useState(false);
    const [disableDefaultFieldModif, setDisableDefaultFieldModif] = useState(false);

    const [openRecalcPopup, setOpenRecalcPopup] = useState(false);
    const [pendingSavePayload, setPendingSavePayload] = useState(null);
    const [pendingAction, setPendingAction] = useState(null); // 'add'
    const [recalcChoiceForNewRow, setRecalcChoiceForNewRow] = useState(null); // 'oui' | 'non'
    const [pourcentageError, setPourcentageError] = useState(''); // Message d'erreur pour le total des pourcentages

    //formulaire pour la sauvegarde
    const formNewParam = useFormik({
        initialValues: {
            id: 0,
            compteId: id_compte,
            fileId: id_dossier,
            section: '',
            intitule: '',
            compte: '',
            pourcentage: '',
            par_defaut: '',
            fermer: ''
        },
        validationSchema: Yup.object({
            section: Yup.string().required("Ce champ est obligatoire"),
            intitule: Yup.string().required("Ce champ est obligatoire"),
            pourcentage: Yup.number().required("Ce champ est obligatoire"),
        }),
        onSubmit: (values) => {

        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    const handleChangeSection = (value) => {
        formNewParam.setFieldValue('section', value);
    }

    const handleChangeIntitule = (value) => {
        formNewParam.setFieldValue('intitule', value);
    }

    const handleChangeCompte = (value) => {
        formNewParam.setFieldValue('compte', value);
    }

    const handleChangePourcentage = (value) => {
        let val = Number(value);
        if (isNaN(val)) val = 0;

        if (val < 0) val = 0;
        if (val > 100) val = 100;

        formNewParam.setFieldValue('pourcentage', val);
    };

    const handleChangeParDefaut = (value) => {
        formNewParam.setFieldValue('par_defaut', value);
    }

    const handleChangeFermer = (value) => {
        formNewParam.setFieldValue('fermer', value);
    }

    const columnHeader = [
        {
            field: 'section',
            headerName: 'SECTION',
            flex: 0.5,
            sortable: true,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'analytics-header',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: sectionValidationColor
                            }}
                            type="text"
                            value={formNewParam.values.section}
                            onChange={(e) => handleChangeSection(e.target.value)}
                            label="intitule"
                            disableUnderline={true}
                            disabled={disableDefaultFieldModif}
                        />
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
            field: 'intitule',
            headerName: 'INTITULÉ',
            flex: 1,
            sortable: true,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'analytics-header',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                                backgroundColor: intituleValidationColor
                            }}
                            type="text"
                            value={formNewParam.values.intitule}
                            onChange={(e) => handleChangeIntitule(e.target.value)}
                            label="intitule"
                            disableUnderline={true}
                            disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
            renderCell: (params) => (
                <Typography sx={{ fontSize: '13px', color: '#475569' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'compte',
            headerName: 'COMPTE',
            flex: 1,
            sortable: true,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'analytics-header',
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
                            label="compte"
                            disableUnderline={true}
                            disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
            renderCell: (params) => (
                <Typography sx={{ fontSize: '13px', color: '#475569' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'pourcentage',
            headerName: '%',
            type: 'string',
            flex: 0.4,
            sortable: true,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'analytics-header',
            editable: editableRow,
            renderEditCell: (params) => {
                let localValue = params.formattedValue ?? '';
                const handleChange = (event) => {
                    const rawValue = event.target.value ?? '';
                    localValue = rawValue;

                    const cleaned = rawValue.toString().replace(/\s/g, '').replace(',', '.');
                    const numericValue = Number(cleaned);
                    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
                        formNewParam.setFieldValue('pourcentage', numericValue);
                    }
                };
                return (
                    <TextField
                        size="small"
                        fullWidth
                        value={params.value ?? ''}
                        onChange={handleChange}
                        InputProps={{
                            inputComponent: FormatedInput,
                        }}
                        onFocus={(e) => {
                            e.target.setSelectionRange(0, 0);
                        }}
                    />
                );
            },
            renderCell: (params) => {
                const raw = params.value;
                const value = raw === undefined || raw === '' ? 0 : Number(raw);

                const formatted = value.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                return (
                    <Typography sx={{ fontSize: '13px', color: '#475569' }}>
                        {`${formatted.replace(/\u202f/g, ' ')}%`}
                    </Typography>
                );
            },
        },
        {
            field: 'par_defaut',
            headerName: 'PAR DÉFAUT',
            type: 'boolean',
            flex: 0.3,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'analytics-header',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <Checkbox
                        checked={formNewParam.values.par_defaut}
                        type="checkbox"
                        onChange={(e) => handleChangeParDefaut(e.target.checked)}
                    />
                );
            },
            renderCell: (params) => (
                <Checkbox
                    checked={params.value}
                    disabled
                    sx={{ '&.Mui-disabled': { color: '#64748B' } }}
                />
            ),
        },
        {
            field: 'fermer',
            headerName: 'FERMER',
            type: 'boolean',
            flex: 0.3,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'analytics-header',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <Checkbox
                        checked={formNewParam.values.fermer}
                        type="checkbox"
                        onChange={(e) => handleChangeFermer(e.target.checked)}
                    />
                );
            },
            renderCell: (params) => (
                <Checkbox
                    checked={params.value}
                    disabled
                    sx={{ '&.Mui-disabled': { color: '#64748B' } }}
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            flex: 0.5,
            sortable: false,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'analytics-header',
            editable: false,
            renderCell: (params) => {
                const isEditing = rowModesModel[params.id]?.mode === GridRowModes.Edit;
                const isSelected = selectedRowId.includes(params.id);

                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ pr: 1 }}>
                        {isEditing ? (
                            <>
                                <IconButton
                                    disabled={(!canAdd && !canModify) || !formNewParam.isValid}
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
                                    onClick={handleOpenDialogConfirmDeleteRow}
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
        }
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
        setSectionValidationColor('transparent');
        setIntituleValidationColor('transparent');
        setCompteValidationColor('transparent');
        setPourcentageValidationColor('transparent');
        //charger dans le formik les données de la ligne
        const selectedRowInfos = sectionsData?.filter((item) => item.id === id[0]);

        //rendre inaccessible les champs si des champs de paramétrages par défaut       
        if (selectedRowInfos[0]?.par_default) {
            setDisableDefaultFieldModif(true);
        } else {
            setDisableDefaultFieldModif(false);
        }

        formNewParam.setFieldValue("id", selectedRowInfos[0]?.id ? selectedRowInfos[0]?.id : 0);
        formNewParam.setFieldValue("section", selectedRowInfos[0]?.section ? selectedRowInfos[0]?.section : '');
        formNewParam.setFieldValue("intitule", selectedRowInfos[0]?.intitule ? selectedRowInfos[0]?.intitule : '');
        formNewParam.setFieldValue("compte", selectedRowInfos[0]?.compte ? selectedRowInfos[0]?.compte : '');
        formNewParam.setFieldValue("pourcentage", selectedRowInfos[0]?.pourcentage ? selectedRowInfos[0]?.pourcentage : '');
        formNewParam.setFieldValue("par_defaut", selectedRowInfos[0]?.par_defaut ? selectedRowInfos[0]?.par_defaut : false);
        formNewParam.setFieldValue("fermer", selectedRowInfos[0]?.fermer ? selectedRowInfos[0]?.fermer : false);

        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
    };

    const handleSaveClick = (id) => async () => {

        let saveBoolSection = false;
        let saveBoolIntitule = false;
        let saveBoolCompte = true;
        let saveBoolPourcentage = false;

        setSectionValidationColor('transparent');
        setIntituleValidationColor('transparent');
        setCompteValidationColor('transparent');
        setPourcentageValidationColor('transparent');

        if (formNewParam.values.section === '') {
            setSectionValidationColor('#F6D6D6');
            saveBoolSection = false;
        } else {
            setSectionValidationColor('transparent');
            saveBoolSection = true;
        }

        if (formNewParam.values.intitule === '') {
            setIntituleValidationColor('#F6D6D6');
            saveBoolIntitule = false;
        } else {
            setIntituleValidationColor('transparent');
            saveBoolIntitule = true;
        }

        // if (formNewParam.values.compte === '') {
        //     setCompteValidationColor('#F6D6D6');
        //     saveBoolCompte = false;
        // } else {
        //     setCompteValidationColor('transparent');
        //     saveBoolCompte = true;
        // }

        if (formNewParam.values.pourcentage === '') {
            setPourcentageValidationColor('#F6D6D6');
            saveBoolPourcentage = false;
        } else {
            setPourcentageValidationColor('transparent');
            saveBoolPourcentage = true;
        }

        if (saveBoolSection && saveBoolIntitule && saveBoolCompte && saveBoolPourcentage) {
            setRowModesModel({
                ...rowModesModel,
                [id]: { mode: GridRowModes.View, ignoreModifications: true },
            });

            const isNewRow = Array.isArray(id) && id.length === 1 && Number(id[0]) < 0;

            const dataToSend = {
                ...formNewParam.values,
                compteId: id_compte,
                fileId: id_dossier,
                axeId: selectedRowAxeId[0],
                ...(isNewRow && recalcChoiceForNewRow ? { recalcPourcentages: recalcChoiceForNewRow } : {})
            };

            axiosPrivate.post(`/paramCa/addOrUpdateSections`, dataToSend).then((response) => {
                const resData = response.data;

                if (resData.state) {
                    setDisableAddRowBouton(false);
                    setDisableSaveBouton(true);
                    formNewParam.resetForm();
                    setIsRefreshed(prev => !prev);
                    toast.success(resData.msg);
                } else {
                    toast.error(resData.msg);
                }
            });
        } else {
            toast.error('Les champs en surbrillances sont obligatoires');
        }
    };

    const confirmRecalcPourcentages = (choice) => {
        const payload = pendingSavePayload;
        setOpenRecalcPopup(false);
        setPendingSavePayload(null);
        const action = pendingAction;
        setPendingAction(null);

        if (action === 'add') {
            setRecalcChoiceForNewRow(choice);
            const newId = -Date.now();

            // Si on choisit Oui => on recalcul immédiatement les % dans la grille
            if (choice === 'oui') {
                const existingCount = Array.isArray(sectionsData) ? sectionsData.length : 0;
                const nextCount = existingCount + 1;
                const pct = nextCount > 0 ? Number((100 / nextCount).toFixed(2)) : 100;

                const updatedExisting = (sectionsData || []).map((row) => ({
                    ...row,
                    pourcentage: pct
                }));

                const newRow = {
                    id: newId,
                    section: '',
                    intitule: '',
                    compte: '',
                    pourcentage: pct,
                    par_defaut: false,
                    fermer: false
                };

                setSectionsData([...updatedExisting, newRow]);
                formNewParam.setFieldValue("id", newId);
                formNewParam.setFieldValue("pourcentage", pct);
                setSelectedRowId([newId]);
                setSelectedRowSectionId([newId]);
                setDisableAddRowBouton(true);
                return;
            }

            // Si Non => on ajoute la ligne, l'utilisateur saisit les % à la main
            const newRow = {
                id: newId,
                section: '',
                intitule: '',
                compte: '',
                pourcentage: '',
                par_defaut: false,
                fermer: false
            };

            setSectionsData([...(sectionsData || []), newRow]);
            formNewParam.setFieldValue("id", newId);
            formNewParam.setFieldValue("pourcentage", '');
            setSelectedRowId([newId]);
            setSelectedRowSectionId([newId]);
            setDisableAddRowBouton(true);
            return;
        }

        if (!payload) return;

        const dataToSend = {
            ...payload,
            recalcPourcentages: choice
        };

        axiosPrivate.post(`/paramCa/addOrUpdateSections`, dataToSend).then((response) => {
            const resData = response.data;

            if (resData.state) {
                setDisableAddRowBouton(false);
                setDisableSaveBouton(true);
                formNewParam.resetForm();
                setIsRefreshed(prev => !prev);
                toast.success(resData.msg);
            } else {
                toast.error(resData.msg);
            }
        });
    };

    const handleOpenDialogConfirmDeleteRow = () => {
        setOpenDialogDeleteRow(true);
        setDisableAddRowBouton(false);
    }

    const deleteRow = (value) => {
        if (value === true) {
            if (selectedRowId.length === 1) {
                const idToDelete = selectedRowId[0];
                if (idToDelete < 0) {
                    setOpenDialogDeleteRow(false);
                    setSectionsData(sectionsData.filter((row) => row.id !== idToDelete));
                    toast.success('Section supprimé avec succès');
                    return;
                }

                const dataToSend = { idToDelete };

                axiosPrivate.post(`/paramCa/deleteSections`, dataToSend).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setOpenDialogDeleteRow(false);
                        setDisableAddRowBouton(false);
                        setSelectedRowSectionId([]);
                        const updatedRows = sectionsData.filter((row) => row.id !== selectedRowId[0]);
                        const nb = updatedRows.length;
                        const pct = nb > 0 ? Number((100 / nb).toFixed(2)) : 100;
                        setSectionsData(updatedRows.map(r => ({ ...r, pourcentage: nb > 0 ? pct : r.pourcentage })));
                        toast.success(resData.msg);
                    } else {
                        setOpenDialogDeleteRow(false);
                        setSelectedRowSectionId([]);
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
        setDisableCancelBouton(true);
        setSelectedRowSectionId([]);
        setSelectedRowId([]);
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setSectionsData((prevRows) =>
            prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
        );
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleCellEditCommit = (params) => {
        const idClicked = params.id;
        const isSelected = selectedRowId.includes(idClicked);

        if (!isSelected) {
            toast.error("Sélectionnez la ligne avant de la modifier");
            return;
        }

        setEditableRow(true);
        setDisableModifyBouton(false);
        setDisableSaveBouton(false);
        setDisableCancelBouton(false);
    };

    //Ajouter une ligne dans le tableau
    const handleOpenDialogAddNewRow = () => {
        setDisableModifyBouton(false);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(false);

        // Ouvrir le popup au moment du clic sur Ajouter
        setPendingAction('add');
        setPendingSavePayload(null);
        setOpenRecalcPopup(true);
    }

    const handleGetSections = () => {
        axios.post(`/paramCa/getSectionsByAxeIds/${id_compte}/${id_dossier}`, {
            selectedRowAxeId
        })
            .then((response) => {
                if (response?.data?.state) {
                    setSectionsData(response?.data?.data);
                    checkTotalPourcentage(response?.data?.data);
                } else {
                    toast.error(response?.data?.message);
                }
            })
    }

    const checkTotalPourcentage = (data) => {
        if (!data || data.length === 0) {
            setPourcentageError('');
            return;
        }

        const total = data.reduce((sum, item) => {
            const value = parseFloat(item.pourcentage) || 0;
            return sum + value;
        }, 0);

        if (Math.abs(total - 100) >= 1) {
            setPourcentageError(`Le total des pourcentages doit etre egale a 100%`);
        } else {
            setPourcentageError('');
        }
    }

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

    useEffect(() => {
        if (canView) {
            handleGetSections();
        }
    }, [id_compte, id_dossier, isRefreshed, selectedRowAxeId])

    useEffect(() => {
        checkTotalPourcentage(sectionsData);
    }, [sectionsData])

    return (
        <>
            {openRecalcPopup ? (
                <Dialog
                    open={true}
                    onClose={() => {
                        setOpenRecalcPopup(false);
                        setPendingSavePayload(null);
                    }}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogContent>
                        <Typography fontWeight={550} color="text.primary" sx={{ mt: 1, fontSize: '17px' }}>
                            Voulez-vous recalculer les pourcentages de toutes les sections ?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            style={{ backgroundColor: initial.button_delete_color, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                            onClick={() => confirmRecalcPourcentages('non')}
                        >
                            Non
                        </Button>
                        <Button
                            style={{ backgroundColor: initial.add_new_line_bouton_color, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                            onClick={() => confirmRecalcPourcentages('oui')}
                        >
                            Oui
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
            {openImportPopup && (
                <PopupImportAnalitique
                    open={openImportPopup}
                    onClose={() => setOpenImportPopup(false)}
                    fileId={id_dossier}
                    compteId={id_compte}
                    axeId={selectedRowAxeId[0]}
                    onImportSuccess={() => {
                        setIsRefreshed(prev => !prev);
                        setOpenImportPopup(false);
                    }}
                />
            )}
            {
                (openDialogDeleteRow && canDelete)
                    ?
                    <PopupConfirmDelete
                        msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"}
                        confirmationState={deleteRow}
                        presonalisedMessage={true}
                    />
                    :
                    null
            }
            <Box
                sx={{ width: '100%' }}
            >

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>

                    <Typography sx={{ fontWeight: 900, color: '#1E293B', fontSize: '18px' }}>
                        Sections
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1}>

                        {pourcentageError && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#d32f2f',
                                    backgroundColor: '#ffebee',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ffcdd2',
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}
                            >
                                ⚠️ {pourcentageError}
                            </Typography>
                        )}

                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => setOpenImportPopup(true)}
                            sx={{
                                bgcolor: '#e79754ff',
                                textTransform: 'none',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#000',
                                borderRadius: '6px',
                                px: 2,
                                '&:hover': {
                                    bgcolor: '#e79754ff',
                                    transform: 'translateY(-1px)'
                                },
                            }}
                        >
                            Importer
                        </Button>

                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleOpenDialogAddNewRow}
                            startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                            sx={{
                                bgcolor: NEON_MINT,
                                textTransform: 'none',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#000',
                                borderRadius: '6px',
                                px: 2,
                                '&:hover': {
                                    bgcolor: '#00E685',
                                    transform: 'translateY(-1px)'
                                },
                            }}
                        >
                            Ajouter section
                        </Button>

                    </Stack>
                </Stack>

                <Stack spacing={1}>
                    {/* <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <GridToolbarQuickFilter
                            size="small"
                            sx={{
                                '& .MuiInputBase-root': {
                                    bgcolor: '#F8FAFC',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    height: '36px',
                                }
                            }}
                        />
                    </Stack> */}



                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid #E2E8F0',
                            overflow: 'hidden',
                            height: 450
                        }}
                    >
                        <DataGrid
                            apiRef={apiRef}
                            disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                            disableColumnSelector={DataGridStyle.disableColumnSelector}
                            disableDensitySelector={DataGridStyle.disableDensitySelector}
                            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                            disableRowSelectionOnClick
                            disableSelectionOnClick={true}
                            sx={{
                                ...DataGridStyle.sx,
                                '& .analytics-header': {
                                    backgroundColor: '#F8FAFC',
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 800,
                                        color: '#64748B',
                                        fontSize: '10px',
                                        textTransform: 'uppercase'
                                    },
                                    '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                        color: '#64748B',
                                    },
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#F8FAFC',
                                    borderBottom: '1px solid #E2E8F0',
                                },
                                '& .MuiDataGrid-row': {
                                    '&:hover': {
                                        backgroundColor: '#F1F5F9',
                                    },
                                    borderBottom: '1px solid #E2E8F0',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: 'none',
                                    '&:focus, &:focus-within': {
                                        outline: 'none',
                                        border: 'none',
                                    },
                                },
                                '& .MuiDataGrid-virtualScroller': {
                                    maxHeight: '700px',
                                },
                                '& .highlight-separator': {
                                    borderBottom: '1px solid red'
                                },
                                '& .MuiDataGrid-row.highlight-separator': {
                                    borderBottom: '1px solid red',
                                },
                            }}
                            rowHeight={DataGridStyle.rowHeight}
                            columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                            editMode='row'
                            onRowClick={(e) => handleCellEditCommit(e.row)}
                            onRowSelectionModelChange={ids => {
                                setSelectedRowSectionId(ids);
                                saveSelectedRow(ids);
                                deselectRow(ids);
                            }}
                            rowModesModel={rowModesModel}
                            onRowModesModelChange={handleRowModesModelChange}
                            onRowEditStop={handleRowEditStop}
                            processRowUpdate={processRowUpdate}
                            rows={sectionsData}
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
                            rowSelectionModel={selectedRowSectionId}
                            onRowEditStart={(params, event) => {
                                const rowId = params.id;
                                const rowData = params.row;

                                const isNewRow = rowId < 0;

                                if (!canModify && !isNewRow) {
                                    event.defaultMuiPrevented = true;
                                    return;
                                }

                                event.stopPropagation();

                                setSectionValidationColor('transparent');
                                setIntituleValidationColor('transparent');
                                setCompteValidationColor('transparent');
                                setPourcentageValidationColor('transparent');

                                if (rowData.par_default) {
                                    setDisableDefaultFieldModif(true);
                                } else {
                                    setDisableDefaultFieldModif(false);
                                }

                                formNewParam.setFieldValue("id", rowData.id ?? 0);
                                formNewParam.setFieldValue("section", rowData.section ?? '');
                                formNewParam.setFieldValue("intitule", rowData.intitule ?? '');
                                formNewParam.setFieldValue("compte", rowData.compte ?? 0);
                                formNewParam.setFieldValue("pourcentage", rowData.pourcentage ?? '');
                                formNewParam.setFieldValue("par_defaut", rowData.par_defaut ?? false);
                                formNewParam.setFieldValue("fermer", rowData.fermer ?? false);

                                setRowModesModel((oldModel) => ({
                                    ...oldModel,
                                    [rowId]: { mode: GridRowModes.Edit },
                                }));

                                setDisableAddRowBouton(true);
                                setDisableSaveBouton(false);
                            }}
                            onCellKeyDown={handleCellKeyDown}
                        />
                    </Paper>
                </Stack>
            </Box>
        </>
    );

}

export default DatagridAnalitiqueSection