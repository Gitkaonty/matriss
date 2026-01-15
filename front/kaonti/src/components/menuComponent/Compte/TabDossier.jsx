import { useState } from "react";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Tooltip } from "@mui/material";
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';

import { TbPlaylistAdd } from 'react-icons/tb';
import { IoMdTrash } from 'react-icons/io';
import { FaRegPenToSquare } from "react-icons/fa6";
import { TfiSave } from "react-icons/tfi";
import { VscClose } from "react-icons/vsc";

import QuickFilter, { DataGridStyle } from "../../componentsTools/DatagridToolsStyle";
import PopupConfirmDelete from "../../componentsTools/popupConfirmDelete";
import { useFormik } from "formik";
import { init } from "../../../../init";
import toast from "react-hot-toast";

const initial = init[0];

const TabDossier = ({ listeCompteDossier, setListeCompteDossier, listeDossier }) => {

    const useFormikCompteDossier = useFormik({
        initialValues: {
            idCompteDossier: '',
            idDossier: ''
        },
        validateOnChange: false,
        validateOnBlur: true,
    })

    const [selectedRowIdCompteDossier, setSelectedRowIdCompteDossier] = useState([]);
    const [rowModesModelCompteDossier, setRowModesModelCompteDossier] = useState({});
    const [disableModifyBoutonCompteDossier, setDisableModifyBoutonCompteDossier] = useState(true);
    const [disableCancelBoutonCompteDossier, setDisableCancelBoutonCompteDossier] = useState(true);
    const [disableSaveBoutonCompteDossier, setDisableSaveBoutonCompteDossier] = useState(true);
    const [disableDeleteBoutonCompteDossier, setDisableDeleteBoutonCompteDossier] = useState(true);
    const [disableAddRowBoutonCompteDossier, setDisableAddRowBoutonCompteDossier] = useState(false);
    const [editableRowCompteDossier, setEditableRowCompteDossier] = useState(true);
    const [openDialogDeleteCompteDossierRow, setOpenDialogDeleteCompteDossierRow] = useState(false);
    const [selectedRowCompteDossiers, setSelectedRowCompteDossiers] = useState([]);

    const selectedDossierIds = listeCompteDossier
        .map(val => Number(val.id_dossier))
        .filter(Boolean);

    const availableDossier = listeDossier.filter(d =>
        !selectedDossierIds.includes(Number(d.id))
    );

    const handleCellEditCommitCompteDossier = (params) => {
        if (selectedRowIdCompteDossier.length > 1 || selectedRowIdCompteDossier.length === 0) {
            setEditableRowCompteDossier(false);
            setDisableModifyBoutonCompteDossier(true);
            setDisableSaveBoutonCompteDossier(true);
            setDisableCancelBoutonCompteDossier(true);
            toast.error("Sélectionnez une seule ligne pour pouvoir la modifier");
        } else {
            setDisableModifyBoutonCompteDossier(false);
            setDisableSaveBoutonCompteDossier(false);
            setDisableCancelBoutonCompteDossier(false);
            if (!selectedRowIdCompteDossier.includes(params.id)) {
                setEditableRowCompteDossier(false);
                toast.error("Sélectionnez une ligne pour pouvoir la modifier");
            } else {
                setEditableRowCompteDossier(true);
            }
        }
    };

    const saveSelectedRowCompteDossier = (ids) => {
        if (ids.length === 1) {
            setSelectedRowIdCompteDossier(ids);
            setDisableModifyBoutonCompteDossier(false);
            setDisableSaveBoutonCompteDossier(false);
            setDisableCancelBoutonCompteDossier(false);
            setDisableDeleteBoutonCompteDossier(false);
        } else {
            setSelectedRowIdCompteDossier([]);
            setDisableModifyBoutonCompteDossier(true);
            setDisableSaveBoutonCompteDossier(true);
            setDisableCancelBoutonCompteDossier(true);
            setDisableDeleteBoutonCompteDossier(true);
        }
    }

    const deselectRowCompteDossier = (ids) => {
        const deselected = selectedRowIdCompteDossier.filter(id => !ids.includes(id));

        const updatedRowModes = { ...rowModesModelCompteDossier };
        deselected.forEach((id) => {
            updatedRowModes[id] = { mode: GridRowModes.View, ignoreModifications: true };
        });
        setRowModesModelCompteDossier(updatedRowModes);

        setDisableAddRowBoutonCompteDossier(false);
        setSelectedRowIdCompteDossier(ids);
    }

    const handleRowModesModelChangeCompteDossier = (newRowModesModel) => {
        setRowModesModelCompteDossier(newRowModesModel);
    };

    const handleRowEditStopCompteDossier = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow };
        setListeCompteDossier(listeCompteDossier.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const columnCompteDossier = [
        {
            field: 'id_dossier',
            headerName: 'Dossier',
            type: 'text',
            sortable: true,
            flex: 1,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            disableClickEventBubbling: true,
            editable: editableRowCompteDossier,
            renderCell: (params) => {
                const dossier = listeDossier.find(
                    val => val.id === Number(params.value)
                );

                return <div>{dossier?.dossier || ''}</div>;
            },
            renderEditCell: (params) => {
                const { id, field, value, api } = params;

                const handleChange = (e) => {
                    useFormikCompteDossier.setFieldValue('idDossier', e.target.value);
                    api.setEditCellValue({
                        id,
                        field,
                        value: e.target.value,
                    });
                };

                const selectedIdsExceptCurrent = listeCompteDossier
                    .filter(row => row.id !== id)
                    .map(row => Number(row.id_dossier));

                const options = listeDossier.filter(
                    d =>
                        !selectedIdsExceptCurrent.includes(Number(d.id)) ||
                        Number(d.id) === Number(value)
                )

                return (
                    <FormControl fullWidth>
                        <InputLabel id="select-compte-label">Choisir...</InputLabel>
                        <Select
                            labelId="select-compte-label"
                            value={value ?? ''}
                            onChange={handleChange}
                        >
                            {options.map((option) => (
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

    const deleteCompteDossierRow = (value) => {
        if (value === true) {
            if (selectedRowCompteDossiers.length === 1) {
                setListeCompteDossier(listeCompteDossier.filter((row) => row.id !== selectedRowIdCompteDossier[0]));
                toast.success('Ligne supprimée avec succès');
                setOpenDialogDeleteCompteDossierRow(false);
                setDisableAddRowBoutonCompteDossier(false);
            }
        } else {
            setOpenDialogDeleteCompteDossierRow(false);
        }
    }

    // Ajouter une ligne dans le tableau liste compte dossier
    const handleOpenDialogAddNewCompteDossier = () => {
        setDisableModifyBoutonCompteDossier(false);
        setDisableCancelBoutonCompteDossier(false);
        setDisableDeleteBoutonCompteDossier(false);
        const newId = -Date.now();
        const newRow = {
            id: newId,
        };
        setListeCompteDossier([...listeCompteDossier, newRow]);
        setSelectedRowCompteDossiers([newRow.id]);
        setSelectedRowIdCompteDossier([newRow.id]);
        setDisableAddRowBoutonCompteDossier(true);
    }

    const handleEditClickCompteDossier = (id) => () => {
        const selectedRowInfos = listeCompteDossier?.filter((item) => item.id === id[0]);

        useFormikCompteDossier.setFieldValue("idDossier", selectedRowInfos[0].id_dossier);
        useFormikCompteDossier.setFieldValue("idCompteDossier", selectedRowInfos[0].id);

        setRowModesModelCompteDossier({ ...rowModesModelCompteDossier, [id]: { mode: GridRowModes.Edit } });
        setDisableSaveBoutonCompteDossier(false);
    };

    const handleCancelClickCompteDossier = (id) => () => {
        setRowModesModelCompteDossier({
            ...rowModesModelCompteDossier,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
        setDisableAddRowBoutonCompteDossier(false);
    };

    const handleOpenDialogConfirmDeleteCompteDossierRow = () => {
        setOpenDialogDeleteCompteDossierRow(true);
        setDisableAddRowBoutonCompteDossier(false);
    }

    const handleSaveClickCompteDossier = () => {
        let saveBoolIdDossierAutre = false;

        if (useFormikCompteDossier.values.idDossier === '') {
            saveBoolIdDossierAutre = false;
        } else {
            saveBoolIdDossierAutre = true;
        }

        if (saveBoolIdDossierAutre) {
            setRowModesModelCompteDossier({ ...rowModesModelCompteDossier, [selectedRowIdCompteDossier]: { mode: GridRowModes.View } });
            toast.success("Ligne sauvegardé avec succès");
            setDisableSaveBoutonCompteDossier(true);
            setDisableAddRowBoutonCompteDossier(false);
        }
    };

    return (
        <>
            {
                openDialogDeleteCompteDossierRow
                    ?
                    <PopupConfirmDelete
                        msg={"Voulez-vous vraiment supprimer la ligne sélectionnée ?"}
                        confirmationState={deleteCompteDossierRow}
                    />
                    :
                    null
            }
            <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                alignContent={"flex-start"} justifyContent={"stretch"}
            >
                <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                    direction={"row"} justifyContent={"right"}
                >
                    <Tooltip title="Ajouter une ligne">
                        <div>
                            <IconButton
                                disabled={disableAddRowBoutonCompteDossier || availableDossier.length === 0}
                                variant="contained"
                                onClick={handleOpenDialogAddNewCompteDossier}
                                style={{
                                    width: "35px", height: '35px',
                                    borderRadius: "2px", borderColor: "transparent",
                                    backgroundColor: initial.theme,
                                    textTransform: 'none', outline: 'none'
                                }}
                            >
                                <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                            </IconButton>
                        </div>
                    </Tooltip>

                    <Tooltip title="Modifier la ligne sélectionnée">
                        <div>
                            <IconButton
                                disabled={disableModifyBoutonCompteDossier}
                                variant="contained"
                                onClick={handleEditClickCompteDossier(selectedRowIdCompteDossier)}
                                style={{
                                    width: "35px", height: '35px',
                                    borderRadius: "2px", borderColor: "transparent",
                                    backgroundColor: initial.theme,
                                    textTransform: 'none', outline: 'none'
                                }}
                            >
                                <FaRegPenToSquare style={{ width: '25px', height: '25px', color: 'white' }} />
                            </IconButton>
                        </div>
                    </Tooltip>

                    <Tooltip title="Sauvegarder les modifications">
                        <div>
                            <IconButton
                                disabled={disableSaveBoutonCompteDossier}
                                variant="contained"
                                onClick={handleSaveClickCompteDossier}
                                style={{
                                    width: "35px", height: '35px',
                                    borderRadius: "2px", borderColor: "transparent",
                                    backgroundColor: initial.theme,
                                    textTransform: 'none', outline: 'none'
                                }}
                            >
                                <TfiSave style={{ width: '50px', height: '50px', color: 'white' }} />
                            </IconButton>
                        </div>
                    </Tooltip>

                    <Tooltip title="Annuler les modifications">
                        <div>
                            <IconButton
                                disabled={disableCancelBoutonCompteDossier}
                                variant="contained"
                                onClick={handleCancelClickCompteDossier(selectedRowIdCompteDossier)}
                                style={{
                                    width: "35px", height: '35px',
                                    borderRadius: "2px", borderColor: "transparent",
                                    backgroundColor: initial.button_delete_color,
                                    textTransform: 'none', outline: 'none'
                                }}
                            >
                                <VscClose style={{ width: '50px', height: '50px', color: 'white' }} />
                            </IconButton>
                        </div>
                    </Tooltip>

                    <Tooltip title="Supprimer la ligne sélectionné">
                        <div>
                            <IconButton
                                disabled={disableDeleteBoutonCompteDossier}
                                onClick={handleOpenDialogConfirmDeleteCompteDossierRow}
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
                        </div>
                    </Tooltip>
                </Stack>

                <Stack
                    width={"100%"}
                    height={"450px"}
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
                        rows={listeCompteDossier}
                        onRowClick={(e) => handleCellEditCommitCompteDossier(e.row)}
                        onRowSelectionModelChange={ids => {
                            setSelectedRowCompteDossiers(ids);
                            saveSelectedRowCompteDossier(ids);
                            deselectRowCompteDossier(ids);
                        }}
                        editMode='row'
                        rowModesModel={rowModesModelCompteDossier}
                        onRowModesModelChange={handleRowModesModelChangeCompteDossier}
                        onRowEditStop={handleRowEditStopCompteDossier}
                        processRowUpdate={processRowUpdate}

                        columns={columnCompteDossier}
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
                        rowSelectionModel={selectedRowCompteDossiers}
                        onRowEditStart={(params, event) => {
                            const rowId = params.id;
                            const rowData = params.row;

                            const isNewRow = rowId < 0;

                            if (!isNewRow) {
                                event.defaultMuiPrevented = true;
                                return;
                            }

                            event.stopPropagation();
                            setDisableAddRowBoutonCompteDossier(true);

                            useFormikCompteDossier.setFieldValue("idDossier", rowData.id_dossier);
                            useFormikCompteDossier.setFieldValue("idCompteDossier", rowData.id);

                            setRowModesModelCompteDossier((oldModel) => ({
                                ...oldModel,
                                [rowId]: { mode: GridRowModes.Edit },
                            }));

                            setDisableSaveBoutonCompteDossier(false);
                        }}
                    />
                </Stack>

            </Stack>
        </>
    )
}

export default TabDossier

