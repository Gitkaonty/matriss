import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Stack, Paper, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { TfiSave } from "react-icons/tfi";
import { VscClose } from "react-icons/vsc";
import { IoMdTrash } from "react-icons/io";
import Tooltip from '@mui/material/Tooltip';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { init } from '../../../../../init';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';

export default function ParamDeviseComponent() {
    const initial = init[0];

    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [rows, setRows] = useState([]);
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded?.UserInfo?.compteId || null;
    const userId = decoded?.UserInfo?.userId || null;
    const navigate = useNavigate();
    // --- États pour la gestion d'édition et des boutons (UNE SEULE FOIS) ---
    const [rowModesModel, setRowModesModel] = useState({});
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [newRow, setNewRow] = useState(null);

    // récupération infos de dossier sélectionné
    useEffect(() => {
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

    const deviseColumns = [
        {
            field: 'code',
            headerName: 'Code',
            width: 120,
            editable: true,
            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            width: 200,
            editable: true,
            headerAlign: 'left',
            align: 'left',
        },
    ];

    // Charger la liste des devises
    const fetchDevises = () => {
        axios.get(`/devises/devise/compte/${compteId}/${id}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data.map((item, idx) => ({
                    id: item.id || idx + 1,
                    code: item.code,
                    libelle: item.libelle,
                    id_compte: item.id_compte
                })) : [];
                console.log("data : ", data);
                setRows(data);
            })
            .catch(() => setRows([]));
    };

    useEffect(() => {
        fetchDevises();
    }, []);

    // Sélection d'une ligne
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

    // Edition
    const handleEditClick = (ids) => () => {
        if (ids.length === 1) {
            const row = rows.find(r => r.id === ids[0]);
            setEditRow(row);
            setNewRow(null);
            setRowModesModel({ ...rowModesModel, [ids[0]]: { mode: GridRowModes.Edit } });
            setDisableSaveBouton(false);
        }
    };

    // Ajout
    const handleOpenDialogAddNewAssocie = () => {

        if (newRow) return;
        const newId = -(Math.max(0, ...rows.map(r => r.id || 0)) + 1);
        const newDevise = { id: newId, code: '', libelle: '', id_compte: Number(compteId), id_dossier: Number(fileId) };
        setRows([...rows, newDevise]);
        setNewRow(newDevise);
        setEditRow(null);
        setSelectedRowId([newId]);
        setRowModesModel({ ...rowModesModel, [newId]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
        setDisableModifyBouton(true);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(true);
    }

    // Sauvegarde
    const handleSaveClick = (ids) => () => {
        if (editRow) {
            axios.put(`/devises/devise/${editRow.id}`, editRow)
                .then(res => {
                    if (res.data && res.data.state) {
                        fetchDevises();
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Devise modifiée');
                    } else {
                        toast.error(res.data.msg || 'Erreur lors de la modification');
                    }
                })
                .catch(() => toast.error('Erreur lors de la modification'));
        } else if (newRow) {
            axios.post(`/devises/devise`, newRow)
                .then(res => {
                    if (res.data && res.data.state) {
                        fetchDevises();
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Devise ajoutée');
                    } else {
                        toast.error(res.data.msg || 'Erreur lors de l\'ajout');
                    }
                })
                .catch(() => toast.error('Erreur lors de l\'ajout'));
        }
    };

    // Annulation
    const handleCancelClick = (ids) => () => {
        setEditRow(null);
        setNewRow(null);
        setRowModesModel({});
        setSelectedRowId([]);
        setDisableSaveBouton(true);
        setDisableModifyBouton(true);
        setDisableCancelBouton(true);
        setDisableDeleteBouton(true);

        if (newRow) {
            setRows(rows.filter(r => r.id !== newRow.id));
        }
    };

    // Suppression
    const handleOpenDialogConfirmDeleteAssocieRow = () => {
        setOpenDialogDeleteRow(true);
    }
    const deleteRow = (value) => {
        if (value === true && selectedRowId.length === 1) {
            const idToDelete = selectedRowId[0];
            axios.delete(`/devises/devise/${idToDelete}`)
                .then(res => {
                    console.log('Réponse suppression:', res.data);
                    if (res.data && res.data.state) {
                        setRows(rows.filter((row) => row.id !== idToDelete));
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Devise supprimée');
                        setOpenDialogDeleteRow(false);
                    } else {
                        toast.error(res.data.msg || 'Erreur lors de la suppression');
                        setOpenDialogDeleteRow(false);
                    }
                })
                .catch(() => {
                    toast.error('Erreur lors de la suppression');
                    setOpenDialogDeleteRow(false);
                });
        } else {
            setOpenDialogDeleteRow(false);
        }
    }

    // Edition cellule
    const processRowUpdate = (updatedRow) => {
        if (editRow) {
            setEditRow(updatedRow);
        } else if (newRow) {
            setNewRow(updatedRow);
        }
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    return (
        <>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
            {openDialogDeleteRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la devise sélectionnée ?"} confirmationState={deleteRow} /> : null}
            <Paper sx={{ elevation: "3", margin: "5px", padding: "10px", width: "98%", height: "110%" }}>

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
                    <TabPanel value="1">
                        <Typography variant='h6' sx={{ color: "black" }} align='left'>Paramétrages : Devises</Typography>
                        <Stack width={"100%"} height={"30px"} spacing={1} alignItems={"center"} alignContent={"center"}
                            direction={"column"} style={{ marginLeft: "0px", marginTop: "20px", justifyContent: "right" }}>
                            <Stack width={"100%"} height={"30px"} spacing={1} alignItems={"center"} alignContent={"center"}
                                direction={"row"} justifyContent={"right"}>
                                <Tooltip title="Ajouter une ligne">
                                    <span>
                                        <IconButton
                                            variant="contained"
                                            onClick={handleOpenDialogAddNewAssocie}
                                            style={{
                                                width: "35px", height: '35px',
                                                borderRadius: "2px", borderColor: "transparent",
                                                backgroundColor: initial.theme,
                                                textTransform: 'none', outline: 'none'
                                            }}
                                        >
                                            <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Modifier la ligne sélectionnée">
                                    <span>
                                        <IconButton
                                            disabled={(!canModify && selectedRowId > 0) || disableModifyBouton}
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
                                    </span>
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
                                <Tooltip title="Supprimer la ligne sélectionnée">
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
                            <Stack width={"100%"} height={'100%'} minHeight={'600px'}>
                                <DataGrid
                                    rows={rows}
                                    columns={deviseColumns}
                                    autoHeight
                                    pageSizeOptions={[5, 10, 20, 50, 100]}
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
                                    editMode='row'
                                    onRowSelectionModelChange={ids => {
                                        saveSelectedRow(ids);
                                    }}
                                    rowModesModel={rowModesModel}
                                    onRowModesModelChange={handleRowModesModelChange}
                                    processRowUpdate={processRowUpdate}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 100 },
                                        },
                                    }}
                                    experimentalFeatures={{ newEditingApi: true }}
                                    pagination={DataGridStyle.pagination}
                                    checkboxSelection={DataGridStyle.checkboxSelection}
                                    columnVisibilityModel={{
                                        id: false,
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </TabPanel>
                </TabContext>
            </Paper>
        </>
    )
}
