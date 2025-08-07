import { useState, useEffect } from 'react';
import { Stack, Box } from '@mui/material';
import { IconButton, Tooltip } from '@mui/material';

import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";

import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, useGridApiRef } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { TfiSave } from 'react-icons/tfi';

import getSectionColumns from '../DatagridColumnsAnalitique/DatagridColumnSection.jsx';

import PopupConfirmDelete from '../../popupConfirmDelete';

const DatagridAnalitiqueSection = ({ selectedRowAxeIds, id_compte, id_dossier, isCaActive }) => {
    let initial = init[0];

    const [rows, setRows] = useState([]);
    const [selectedRowSectionIds, setSelectedRowSectionIds] = useState([]);
    const [openDialogDeleteSection, setOpenDialogDeleteSection] = useState(false);
    const [updatedRows, setUpdatedRows] = useState([]);

    const [isRefreshed, setIsRefreshed] = useState(false);

    const [nextId, setNextId] = useState(-1);

    const apiRef = useGridApiRef();

    // Ajout d'une ligne
    const handleAddRow = () => {
        setRows((prev) =>
            prev.map((row) => {
                const updated = updatedRows.find((u) => u.id === row.id);
                return updated ? updated : row;
            })
        );
        const newRow = { id: nextId, id_axe: selectedRowAxeIds[0], section: '', intitule: '', compte: '', poucentage: 0, par_defaut: false, fermer: false };
        setRows((prev) => [...prev, newRow]);
        setNextId((prevId) => prevId - 1);
    }

    // Fonction pour vérifier la validité des données
    const isRowValid = (row) => {
        if (!row.section || row.section.toString().trim() === '') return false;
        if (!row.intitule || row.intitule.toString().trim() === '') return false;
        if (!row.compte || row.compte.toString().trim() === '') return false;
        if (row.pourcentage === null || row.pourcentage === undefined || row.pourcentage.toString().trim() === '') return false;
        return true;
    };

    // Sauvegarde lignes
    const handleSaveRow = () => {
        const invalidRow = updatedRows.find(row => !isRowValid(row));

        if (invalidRow) {
            toast.error("Veuillez remplir tous les champs obligatoires (section, intitulé, compte, pourcentage) !");
            return;
        }

        axios.post(`/paramCa/addOrUpdateSections/${id_compte}/${id_dossier}`, {
            data: updatedRows
        }).then((response) => {
            if (response?.data?.state) {
                setIsRefreshed(true);
                toast.success(response?.data?.message);
            } else {
                toast.error(response?.data?.message);
            }
        });

        setRows((prev) =>
            prev.map((row) => {
                const updated = updatedRows.find((u) => u.id === row.id);
                return updated ? updated : row;
            })
        );
        setUpdatedRows([]);
    };

    // Suppression d'une ligne
    const handleDeleteRow = (value) => {
        if (value) {
            axios.post('/paramCa/deleteSections', {
                selectedRowSectionIds
            }).then((response) => {
                if (response?.data?.state) {
                    const updatedRowsList = rows.filter((row) => !selectedRowSectionIds.includes(row.id));
                    setRows(updatedRowsList);
                    setSelectedRowSectionIds([]);
                    setOpenDialogDeleteSection(false);
                } else {
                    toast.error(response?.data?.message);
                }
            })
        } else {
            setSelectedRowSectionIds([]);
            setOpenDialogDeleteSection(false);
        }
    };

    // Ouverture du dialogue de suppression
    const handleOpenDialogConfirmDeleteSection = () => {
        setOpenDialogDeleteSection(true);
    }

    // Récupération de la liste des sections
    const handleGetSections = () => {
        axios.post(`/paramCa/getSectionsByAxeIds/${id_compte}/${id_dossier}`, {
            selectedRowAxeIds
        })
            .then((response) => {
                if (response?.data?.state) {
                    setRows(response?.data?.data)
                } else {
                    toast.error(response?.data?.message);
                }
            })
    }

    // Fonction pour modifier la valeur du checkbox par_defaut
    const handleParDefautChange = (id, value) => {
        if (!apiRef.current) return;

        let updatedRow = null;

        const mode = apiRef.current.getRowMode(id);

        if (mode === 'edit') {
            updatedRow = apiRef.current.getRowWithUpdatedValues(id);
            updatedRow.par_defaut = value;

            apiRef.current.stopRowEditMode({ id });
        } else {
            const currentRow = apiRef.current.getRow(id);
            updatedRow = { ...currentRow, par_defaut: value };
        }

        if (!updatedRow) return;

        setRows((prev) =>
            prev.map((row) => (row.id === id ? updatedRow : row))
        );

        setUpdatedRows((prev) => {
            const exists = prev.find((r) => r.id === id);
            if (exists) {
                return prev.map((r) => (r.id === id ? updatedRow : r));
            }
            return [...prev, updatedRow];
        });
    };

    // Fonction pour modifier la valeur du checkbox fermer
    const handleFermerChange = (id, value) => {
        if (!apiRef.current) return;

        const mode = apiRef.current.getRowMode(id);

        let updatedRow = null;

        if (mode === 'edit') {
            updatedRow = apiRef.current.getRowWithUpdatedValues(id);
            updatedRow.fermer = value;

            apiRef.current.stopRowEditMode({ id });
        } else {
            const currentRow = apiRef.current.getRow(id);
            updatedRow = { ...currentRow, fermer: value };
        }

        if (!updatedRow) return;

        setRows((prev) =>
            prev.map((row) => (row.id === id ? updatedRow : row))
        );

        setUpdatedRows((prev) => {
            const exists = prev.find((r) => r.id === id);
            if (exists) {
                return prev.map((r) => (r.id === id ? updatedRow : r));
            }
            return [...prev, updatedRow];
        });
    };

    // useEffect des listes des sections
    useEffect(() => {
        handleGetSections();
    }, [id_compte, id_dossier, isRefreshed, selectedRowAxeIds])

    return (
        <>
            {
                openDialogDeleteSection
                    ?
                    <PopupConfirmDelete
                        msg={`Voulez-vous vraiment supprimer ${selectedRowSectionIds.length > 1 ? 'les lignes sélectionnées ?' : 'la ligne sélectionnée ?'}`}
                        confirmationState={handleDeleteRow}
                    />
                    :
                    null
            }
            <Box sx={{ width: '70%' }}>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-start',
                        padding: '10px'
                    }}
                >
                    <Tooltip title="Ajouter une ligne">
                        <Stack
                        >
                            <IconButton
                                onClick={handleAddRow}
                                disabled={!isCaActive || selectedRowAxeIds.length !== 1}
                                variant="contained"
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

                    <Tooltip title="Enregistrer tout">
                        <Stack
                            style={{
                                marginLeft: '3px'
                            }}
                        >
                            <IconButton
                                onClick={handleSaveRow}
                                disabled={!isCaActive || updatedRows.length === 0}
                                variant="contained"
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

                    <Tooltip title="Supprimer la ligne sélectionné">
                        <Stack
                            style={{
                                marginLeft: '3px',
                                marginRight: '3px'
                            }}
                        >
                            <IconButton
                                onClick={handleOpenDialogConfirmDeleteSection}
                                disabled={!isCaActive || selectedRowSectionIds.length === 0}
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
                </Box>

                <Stack sx={{ height: 450 }}>
                    <DataGrid
                        apiRef={apiRef}
                        disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                        disableColumnSelector={DataGridStyle.disableColumnSelector}
                        disableDensitySelector={DataGridStyle.disableDensitySelector}
                        localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                        rows={rows}
                        columns={
                            getSectionColumns({
                                onParDefautChange: handleParDefautChange,
                                onFermerChange: handleFermerChange
                            })}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableRowSelectionOnClick
                        sx={{
                            ...DataGridStyle.sx,
                            // paddingTop: '30px',
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
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 100 },
                            },
                        }}
                        experimentalFeatures={{ newEditingApi: true }}
                        pageSizeOptions={[5, 10, 20, 30, 50, 100]}
                        pagination={DataGridStyle.pagination}
                        checkboxSelection={DataGridStyle.checkboxSelection}
                        columnVisibilityModel={{ id: false }}
                        onRowSelectionModelChange={(newSelection) => {
                            setSelectedRowSectionIds(newSelection);
                        }}
                        slots={{
                            toolbar: QuickFilter
                        }}
                        processRowUpdate={(newRow, oldRow) => {
                            if (JSON.stringify(newRow) !== JSON.stringify(oldRow)) {
                                setUpdatedRows((prev) => {
                                    const alreadyUpdated = prev.find((r) => r.id === newRow.id);
                                    if (alreadyUpdated) {
                                        return prev.map((r) => (r.id === newRow.id ? newRow : r));
                                    } else {
                                        return [...prev, newRow];
                                    }
                                });
                            }
                            return newRow;
                        }}
                    />
                </Stack>
            </Box>
        </>
    )
}

export default DatagridAnalitiqueSection