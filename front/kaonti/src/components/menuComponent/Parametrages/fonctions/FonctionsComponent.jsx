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

export default function FonctionsComponent() {
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
        let idFile = id;
        if (!idFile) {
            // Si pas d'id dans l'URL, on prend le sessionStorage
            idFile = sessionStorage.getItem("fileId");
        } else {
            // Si id dans l'URL, on le stocke dans le sessionStorage
            sessionStorage.setItem('fileId', idFile);
        }
        setFileId(idFile);
        if (!idFile) {
            setNoFile(true);
            setFileInfos([]);
            return;
        }
        GetInfosIdDossier(idFile);
    }, [id]);

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

    // Colonnes pour la table fonctions
    const fonctionsColumns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 120,
            editable: false,
            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'nom',
            headerName: 'Nom de la fonction',
            width: 250,
            editable: true,
            headerAlign: 'left',
            align: 'left',
        },
    ];

    // Charger la liste des fonctions
    const fetchFonctions = () => {
        axios.get(`/parametres/fonction/${compteId}/${id}`)
            .then(res => {
                console.log('Réponse fonctions:', res.data);
                const data = Array.isArray(res.data.list) ? res.data.list.map((item, idx) => ({
                    id: item.id || idx + 1,
                    nom: item.nom
                })) : [];
                setRows(data);
            })
            .catch(() => setRows([]));
    };

    useEffect(() => {
        fetchFonctions();
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
        const newFonction = { id: newId, nom: '', id_compte: compteId, id_dossier: id };
        setRows([...rows, newFonction]);
        setNewRow(newFonction);
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
<<<<<<< HEAD:front/kaonti/src/components/FonctionsComponent.jsx
        if (editRow) {
            axios.put(`/sociales/fonctions/${editRow.id}`, editRow)
=======
        if(editRow){
            axios.put(`/parametres/fonction/${editRow.id}`, editRow)
>>>>>>> jaela/Jaela_tva:front/kaonti/src/components/menuComponent/Parametrages/fonctions/FonctionsComponent.jsx
                .then(res => {
                    if (res.data && res.data.state) {
                        fetchFonctions();
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Fonction modifiée');
                    } else {
                        toast.error(res.data.msg || 'Erreur lors de la modification');
                    }
                })
                .catch(() => toast.error('Erreur lors de la modification'));
<<<<<<< HEAD:front/kaonti/src/components/FonctionsComponent.jsx
        } else if (newRow) {
            axios.post(`/sociales/fonctions`, newRow)
=======
        } else if(newRow) {
            axios.post(`/parametres/fonction`, newRow)
>>>>>>> jaela/Jaela_tva:front/kaonti/src/components/menuComponent/Parametrages/fonctions/FonctionsComponent.jsx
                .then(res => {
                    if (res.data && res.data.state) {
                        fetchFonctions();
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Fonction ajoutée');
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
            axios.delete(`/parametres/fonction/${idToDelete}`)
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
                        toast.success(res.data.msg || 'Fonction supprimée');
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
        <Box>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
            {openDialogDeleteRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la fonction sélectionnée ?"} confirmationState={deleteRow} /> : null}

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
                    <Typography variant='h6' sx={{ color: "black" }} align='left'>Paramétrages : Fonctions</Typography>
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
                                columns={fonctionsColumns}
                                rows={rows}
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
                                pageSizeOptions={[50, 100]}
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
        </Box>
    )
}
