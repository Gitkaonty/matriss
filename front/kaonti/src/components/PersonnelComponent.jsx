import { React, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { TfiSave } from "react-icons/tfi";
import { VscClose } from "react-icons/vsc";
import { IoMdTrash } from "react-icons/io";
import Tooltip from '@mui/material/Tooltip';
import { InfoFileStyle } from './componentsTools/InfosFileStyle';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PopupConfirmDelete from './componentsTools/popupConfirmDelete';
import PopupTestSelectedFile from './componentsTools/popupTestSelectedFile';
import { init } from '../../init';
import { DataGridStyle } from './componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowModes } from '@mui/x-data-grid';
import QuickFilter from './componentsTools/DatagridToolsStyle';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../config/axios';
import toast from 'react-hot-toast';

export default function PersonnelComponent() {
    const initial = init[0];
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [rows, setRows] = useState([]);
    const [fonctions, setFonctions] = useState([]);
    const [classifications, setClassifications] = useState([]);
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded?.UserInfo?.compteId || null;
    const userId = decoded?.UserInfo?.userId || null;
    const navigate = useNavigate();
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

    const isEditable = (row) => {
        if (!row) return false;
        return classifications.some(c => c.id === row.id_classe);
    };

    const personnelsColumns = [
        { field: 'id', headerName: 'ID', width: 80, editable: false },
        { field: 'nom', headerName: 'Nom', width: 150, editable: (params) => isEditable(params.row) },
        { field: 'prenom', headerName: 'Prénom', width: 150, editable: true },
        {
            field: 'id_fonction',
            headerName: 'Fonction',
            width: 180,
            editable: true,
            type: 'singleSelect',
            valueOptions: fonctions.map(f => ({ value: f.id, label: f.nom })),
            renderCell: (params) => {
                const found = fonctions.find(f => f.id === params.value);
                return found ? found.nom : '';
            }
        },
        {
            field: 'id_classe',
            headerName: 'Classification',
            width: 180,
            editable: (params) => isEditable(params.row),
            type: 'singleSelect',
            valueOptions: classifications.map(c => ({ value: c.id, label: c.classe })),
            renderCell: (params) => {
                const found = classifications.find(c => c.id === params.value);
                return found ? found.classe : '';
            }
        },
        {
            field: 'numero_cnaps',
            headerName: 'Numéro CNaPS',
            width: 150,
            editable: true
        },
        {
            field: 'cin_ou_carte_resident',
            headerName: 'CIN ou Carte de résident',
            width: 180,
            editable: true
        },
        {
            field: 'nombre_enfants_charge',
            headerName: 'Nb enfants',
            width: 100,
            editable: true
        },
        {
            field: 'date_entree',
            headerName: 'Date entrée',
            width: 150,
            editable: true,
            renderCell: (params) => {
                if (!params.value) return '';
                const date = new Date(params.value);
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            },
            renderEditCell: (params) => (
                <input
                    type="date"
                    value={params.value ? params.value.slice(0, 10) : ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        params.api.setEditCellValue({ id: params.id, field: 'date_entree', value }, e);
                    }}
                    style={{ width: '100%', padding: '5px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            )
        },
        {
            field: 'date_sortie',
            headerName: 'Date sortie',
            width: 150,
            editable: true,
            renderCell: (params) => {
                if (!params.value) return '';
                const date = new Date(params.value);
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            },
            renderEditCell: (params) => (
                <input
                    type="date"
                    value={params.value ? params.value.slice(0, 10) : ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        params.api.setEditCellValue({ id: params.id, field: 'date_sortie', value }, e);
                    }}
                    style={{ width: '100%', padding: '5px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            )
        },
        { field: 'actif', headerName: 'Actif', width: 90, editable: true, type: 'boolean' },
    ];

    const fetchPersonnels = () => {
        axios.get(`/sociales/personnel/${Number(compteId)}/${Number(id)}`)
            .then(res => {
                const data = Array.isArray(res.data.list) ? res.data.list.map((item, idx) => ({
                    id: item.id || idx + 1,
                    nom: item.nom,
                    prenom: item.prenom,
                    id_fonction: item.id_fonction,
                    id_classe: item.id_classe,
                    date_entree: item.date_entree,
                    date_sortie: item.date_sortie,
                    actif: item.actif,
                    numero_cnaps: item.numero_cnaps,
                    cin_ou_carte_resident: item.cin_ou_carte_resident,
                    nombre_enfants_charge: item.nombre_enfants_charge
                })) : [];
                setRows(data);
            })
            .catch(() => setRows([]));
    };

    useEffect(() => {
        fetchPersonnels();
        axios.get(`/sociales/fonctions/${compteId}/${id}`).then(res => setFonctions(res.data.list || []));
        let dossierId = id;
        if (!dossierId) {
            dossierId = sessionStorage.getItem("fileId");
        }
        if (!dossierId) return; // Ne pas faire d'appel API si pas de dossier
        console.log("Appel API classifications sur dossier", dossierId);
        axios.get(`/sociales/classification/dossier/${Number(compteId)}/${Number(dossierId)}`).then(res => {
            console.log("Réponse API classifications", res.data);
            setClassifications(res.data.list || []);
        });
    }, [id]);

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
        const newPersonnel = {
            id: newId,
            nom: '',
            prenom: '',
            id_fonction: '',
            id_classe: '',
            date_entree: '',
            date_sortie: '',
            actif: true,
            numero_cnaps: '',
            cin_ou_carte_resident: '',
            nombre_enfants_charge: '',
            id_compte: Number(compteId),
            id_dossier: Number(id),
        };
        setRows([...rows, newPersonnel]);
        setNewRow(newPersonnel);
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
            const rowToSend = {
                ...editRow,
                nombre_enfants_charge: parseInt(editRow.nombre_enfants_charge || '0', 10),
            };
            axios.put(`/sociales/personnel/${editRow.id}`, rowToSend)
                .then(res => {
                    console.log('Response:', res.data);
                    if (res.data && res.data.state) {
                        fetchPersonnels();
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Personnel modifié');
                    } else {
                        toast.error(res.data.msg || 'Erreur lors de la modification');
                    }
                })
                .catch(() => toast.error('Erreur lors de la modification'));
        } else if (newRow) {
            const rowToSend = {
                ...newRow,
                nombre_enfants_charge: parseInt(newRow.nombre_enfants_charge || '0', 10),
            };
            console.log('rowToSend : ', rowToSend);
            axios.post(`/sociales/personnel`, rowToSend)
                .then(res => {
                    if (res.data && res.data.state) {
                        fetchPersonnels();
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Personnel ajouté');
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
            axios.delete(`/sociales/personnel/${idToDelete}`)
                .then(res => {
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
                        toast.success(res.data.msg || 'Personnel supprimé');
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
        console.log("Updated Row:", updatedRow);

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

    console.log("classifications", classifications);
    const filteredRows = rows.filter(row =>
        (classifications.some(c => c.id === row.id_classe) || (row.id < 0))
    );

    return (
        <Box>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
            {openDialogDeleteRow ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer le personnel sélectionné ?"} confirmationState={deleteRow} /> : null}

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
                    <Typography variant='h6' sx={{ color: "black" }} align='left'>Administration : Personnels</Typography>
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
                                        disabled={!selectedRowId.length || !isEditable(rows.find(r => r.id === selectedRowId[0]))}
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
                                        disabled={!selectedRowId.length || !isEditable(rows.find(r => r.id === selectedRowId[0]))}
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
                                columns={personnelsColumns}
                                autoHeight
                                pageSizeOptions={[5, 10, 20, 100]}
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
                                getRowClassName={(params) =>
                                    !isEditable(params.row) ? 'row-non-editable' : ''
                                }
                            />
                        </Stack>
                    </Stack>
                </TabPanel>
            </TabContext>
        </Box>
    )
}
