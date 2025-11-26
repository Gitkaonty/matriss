import { useState, useEffect } from 'react';
import { Stack, Box, FormControl, Input, TextField } from '@mui/material';
import { IconButton, Tooltip, Checkbox } from '@mui/material';

import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { VscClose } from 'react-icons/vsc';

import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { TfiSave } from 'react-icons/tfi';

import { useFormik } from 'formik';
import * as Yup from "yup";

import PopupConfirmDelete from '../../popupConfirmDelete';
import FormatedInput from '../../FormatedInput';

const DatagridAnalitiqueSection = ({ selectedRowAxeId, id_compte, id_dossier, isCaActive }) => {
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
    const [disableDefaultFieldModif, setDisableDefaultFieldModif] = useState(false);

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
            compte: Yup.string().required("Ce champ est obligatoire"),
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
            headerName: 'Section',
            flex: 0.5,
            sortable: true,
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
        },
        {
            field: 'intitule',
            headerName: 'Intitulé',
            flex: 1,
            sortable: true,
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
        },
        {
            field: 'compte',
            headerName: 'Compte',
            flex: 1,
            sortable: true,
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
                            label="compte"
                            disableUnderline={true}
                            disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'pourcentage',
            headerName: 'Pourcentage',
            type: 'string',
            flex: 0.4,
            sortable: true,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
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

                return `${formatted.replace(/\u202f/g, ' ')}%`;
            },
        },
        {
            field: 'par_defaut',
            headerName: 'Par défaut',
            type: 'boolean',
            flex: 0.3,
            sortable: true,
            headerAlign: 'left',
            align: 'center',
            headerClassName: 'HeaderbackColor',
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
        },
        {
            field: 'fermer',
            headerName: 'Fermer',
            type: 'boolean',
            flex: 0.3,
            sortable: true,
            headerAlign: 'left',
            align: 'center',
            headerClassName: 'HeaderbackColor',
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
        let saveBoolCompte = false;
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

        if (formNewParam.values.compte === '') {
            setCompteValidationColor('#F6D6D6');
            saveBoolCompte = false;
        } else {
            setCompteValidationColor('transparent');
            saveBoolCompte = true;
        }

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

            const dataToSend = { ...formNewParam.values, compteId: id_compte, fileId: id_dossier, axeId: selectedRowAxeId[0] };

            axios.post(`/paramCa/addOrUpdateSections`, dataToSend).then((response) => {
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
                    return;
                }

                const dataToSend = { idToDelete };

                axios.post(`/paramCa/deleteSections`, dataToSend).then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setOpenDialogDeleteRow(false);
                        setDisableAddRowBouton(false);
                        setSelectedRowSectionId([]);
                        setSectionsData(sectionsData.filter((row) => row.id !== selectedRowId[0]));
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

        const newId = -Date.now();
        formNewParam.setFieldValue("id", newId);
        const newRow = {
            id: newId,
            section: '',
            intitule: '',
            compte: '',
            pourcentage: '',
            par_defaut: false,
            fermer: false
        };
        setSectionsData([...sectionsData, newRow]);
        setSelectedRowId([newRow.id]);
        setSelectedRowSectionId([newRow.id]);

        setDisableAddRowBouton(true);
    }

    const handleGetSections = () => {
        axios.post(`/paramCa/getSectionsByAxeIds/${id_compte}/${id_dossier}`, {
            selectedRowAxeId
        })
            .then((response) => {
                if (response?.data?.state) {
                    setSectionsData(response?.data?.data)
                } else {
                    toast.error(response?.data?.message);
                }
            })
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

    useEffect(() => {
        handleGetSections();
    }, [id_compte, id_dossier, isRefreshed, selectedRowAxeId])

    return (
        <>
            {
                openDialogDeleteRow
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
                sx={{ width: '70%' }}
            >

                <Stack
                    sx={{
                        width: '100%',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-start',
                        padding: '10px',
                    }}
                    direction={'row'}
                    spacing={0.5}
                >
                    <Tooltip title="Ajouter une ligne">
                        <Stack>
                            <IconButton
                                disabled={disableAddRowBouton || !isCaActive}
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
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Modifier la ligne sélectionnée">
                        <Stack>
                            <IconButton
                                disabled={disableModifyBouton || !isCaActive}
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
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Sauvegarder les modifications">
                        <Stack>
                            <IconButton
                                disabled={disableSaveBouton || !formNewParam.isValid || !isCaActive}
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
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Annuler les modifications">
                        <Stack>
                            <IconButton
                                disabled={disableCancelBouton || !isCaActive}
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
                        </Stack>
                    </Tooltip>

                    <Tooltip title="Supprimer la ligne sélectionné">
                        <Stack>
                            <IconButton
                                disabled={disableDeleteBouton || !isCaActive}
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
                        </Stack>
                    </Tooltip>
                </Stack>

                <Stack
                    sx={{ height: 450 }}
                    style={{
                        marginTop: '0px'
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
                            '& .MuiInputBase-root': {
                                boxShadow: 'none',
                                border: 'none',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
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
                            if (!selectedRowSectionId.length || selectedRowSectionId[0] !== params.id) {
                                event.defaultMuiPrevented = true;
                            }
                            if (selectedRowSectionId.includes(params.id)) {
                                setDisableAddRowBouton(true);
                                event.stopPropagation();

                                const rowId = params.id;
                                const rowData = params.row;

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

                                setDisableSaveBouton(false);
                            }
                        }}
                    />
                </Stack>
            </Box>
        </>
    );
}

export default DatagridAnalitiqueSection