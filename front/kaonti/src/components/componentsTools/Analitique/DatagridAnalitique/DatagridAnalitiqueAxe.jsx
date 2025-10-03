import { useState, useEffect } from 'react';
import { Stack, Box, Button } from '@mui/material';
import { IconButton, Tooltip, Step, StepLabel, Typography } from '@mui/material';

import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";

import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';

import { TfiSave } from 'react-icons/tfi';

import axeColumn from '../DatagridColumnsAnalitique/DatagridColumnAxe.jsx';
import PopupConfirmDelete from '../../popupConfirmDelete.jsx';

const DatagridAnalitiqueAxe = ({ id_compte, id_dossier, selectedRowAxeIds, setSelectedRowAxeIds, isCaActive }) => {
    let initial = init[0];

    const [rows, setRows] = useState([]);
    const [openDialogDeleteAxe, setOpenDialogDeleteAxe] = useState(false);
    const [updatedRows, setUpdatedRows] = useState([]);

    const [isRefreshed, setIsRefreshed] = useState(false);

    const [nextId, setNextId] = useState(-1);

    // Ajout d'une ligne
    const handleAddRow = () => {
        setRows((prev) =>
            prev.map((row) => {
                const updated = updatedRows.find((u) => u.id === row.id);
                return updated ? updated : row;
            })
        );
        const newRow = { id: nextId, code: '', libelle: '' };
        setRows((prev) => [...prev, newRow]);
        setNextId((prevId) => prevId - 1);
    };

    // Fonction pour vérifier la validité des données
    const isRowValid = (row) => {
        if (!row.code || row.code.toString().trim() === '') return false;
        if (!row.libelle || row.libelle.toString().trim() === '') return false;
        return true;
    };

    // Sauvegarde lignes
    const handleSaveRow = () => {
        const invalidRow = updatedRows.find(row => !isRowValid(row));

        if (invalidRow) {
            toast.error("Veuillez remplir tous les champs obligatoires (code axe, libellé) !");
            return;
        }

        axios.post(`/paramCa/addOrUpdateAxes/${id_compte}/${id_dossier}`, {
            data: updatedRows
        }).then((response) => {
            if (response?.data?.state) {
                setIsRefreshed(true);
                toast.success(response?.data?.message);
                setRows((prev) =>
                    prev.map((row) => {
                        const updated = updatedRows.find((u) => u.id === row.id);
                        return updated ? updated : row;
                    })
                );

                setUpdatedRows([]);
            } else {
                toast.error(response?.data?.message);
            }
        })
    };

    // Suppression d'une ligne
    const handleDeleteRow = (value) => {
        if (value) {
            axios.post('/paramCa/deleteAxes', {
                selectedRowAxeIds
            }).then((response) => {
                if (response?.data?.state) {
                    toast.success(response?.data?.message);
                    const updatedRowsList = rows.filter((row) => !selectedRowAxeIds.includes(row.id));
                    setRows(updatedRowsList);
                    setSelectedRowAxeIds([]);
                    setOpenDialogDeleteAxe(false);
                } else {
                    toast.error(response?.data?.message);
                }
            })
        } else {
            setSelectedRowAxeIds([]);
            setOpenDialogDeleteAxe(false);
        }
    };

    // Ouverture du dialogue de suppression
    const handleOpenDialogConfirmDeleteAxe = () => {
        setOpenDialogDeleteAxe(true);
    }

    // Récupération de la liste des axes
    const handleGetAxes = () => {
        axios.get(`/paramCa/getAxes/${id_compte}/${id_dossier}`)
            .then((response) => {
                if (response?.data?.state) {
                    setRows(response?.data?.data)
                } else {
                    toast.error(response?.data?.message);
                }
            })
    }

    // UseEffect des listes des axes
    useEffect(() => {
        handleGetAxes();
    }, [id_compte, id_dossier, isRefreshed])

    return (
        <>
            {
                openDialogDeleteAxe
                    ?
                    <PopupConfirmDelete
                        msg={`Voulez-vous vraiment supprimer ${selectedRowAxeIds.length > 1 ? 'les lignes sélectionnées ?' : 'la ligne sélectionnée ?'}`}
                        confirmationState={handleDeleteRow}
                        presonalisedMessage={true}
                    />
                    :
                    null
            }
            <Box
                sx={{ width: '30%' }}
                style={{
                    borderRight: '15px solid #F4F9F9'
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-start',
                        padding: '10px',
                    }}
                >
                    <Tooltip title="Ajouter une ligne">
                        <Stack
                        >
                            <IconButton
                                onClick={handleAddRow}
                                disabled={!isCaActive}
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
                                onClick={handleOpenDialogConfirmDeleteAxe}
                                disabled={!isCaActive || selectedRowAxeIds.length === 0}
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
                        rows={rows}
                        columns={axeColumn}
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
                        hideFooterSelectedRowCount
                        onRowSelectionModelChange={(newSelection) => {
                            setSelectedRowAxeIds(newSelection);
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

export default DatagridAnalitiqueAxe