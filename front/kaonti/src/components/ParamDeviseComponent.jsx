import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Input, Typography, AppBar, Toolbar, Stack, Button,
    GlobalStyles, TextField, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Checkbox, IconButton, InputAdornment, Breadcrumbs, Link, ButtonGroup, FormControl
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { InfoFileStyle } from './componentsTools/InfosFileStyle';
import { useParams } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PopupConfirmDelete from './componentsTools/popupConfirmDelete';
import PopupTestSelectedFile from './componentsTools/popupTestSelectedFile';
import { init } from '../../init';
import { DataGridStyle } from './componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes, useGridApiRef } from '@mui/x-data-grid';
import QuickFilter from './componentsTools/DatagridToolsStyle';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import usePermission from '../hooks/usePermission';
import useAxiosPrivate from '../../config/axiosPrivate';

// Icônes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';
const BORDER_COLOR = '#E2E8F0';

export default function ParamDeviseComponent() {
    const apiRef = useGridApiRef();
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const initial = init[0];
    const axiosPrivate = useAxiosPrivate();

    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [searchText, setSearchText] = useState('');
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded?.UserInfo?.compteId || null;
    const userId = decoded?.UserInfo?.userId || null;
    const navigate = useNavigate();
    const [editableRow, setEditableRow] = useState(true);

    const [rowModesModel, setRowModesModel] = useState({});
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);

    const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);

    const [selectedRow, setSelectedRow] = useState([]);

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

    // Fonction de filtrage pour la recherche multi-colonnes
    const handleSearch = (searchValue) => {
        setSearchText(searchValue);

        if (!searchValue.trim()) {
            setFilteredRows(rows);
            return;
        }

        const filtered = rows.filter(row => {
            const searchLower = searchValue.toLowerCase();
            return (
                (row.code && row.code.toLowerCase().includes(searchLower)) ||
                (row.libelle && row.libelle.toLowerCase().includes(searchLower))
            );
        });

        setFilteredRows(filtered);
    };

    // Mettre à jour filteredRows quand rows change
    useEffect(() => {
        setFilteredRows(rows);
    }, [rows]);

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

    const formNewParam = useFormik({
        initialValues: {
            idDevise: 0,
            compteId: compteId,
            fileId: fileId,
            code: '',
            libelle: '',
        },
        onSubmit: (values) => {

        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        formNewParam.setFieldValue(name, value);
    };

    const deviseColumns = [
        {
            field: 'code',
            headerName: 'Code',
            width: 100,
            editable: editableRow,
            headerAlign: 'left',
            align: 'left',
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none'
                            }}
                            name='code'
                            type="text"
                            value={formNewParam.values.code}
                            onChange={handleChange}
                            label="code"
                            disableUnderline={true}
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
            field: 'libelle',
            headerName: 'Libellé',
            width: 300,
            editable: editableRow,
            headerAlign: 'left',
            align: 'left',
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='libelle'
                            type="text"
                            value={formNewParam.values.libelle}
                            onChange={handleChange}
                            label="libelle"
                            disableUnderline={true}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'par_defaut',
            headerName: 'Par défaut',
            type: 'boolean',
            sortable: false,
            width: 100,
            headerAlign: 'center',
            align: 'center',
            editable: false
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 80,
            sortable: false,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            editable: false,
            renderCell: (params) => {
                const isEditing = rowModesModel[params.id]?.mode === GridRowModes.Edit;
                const isSelected = selectedRowId.includes(params.id);

                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ pr: 1 }}>
                        {isEditing ? (
                            <>
                                <IconButton
                                    disabled={(!canAdd && !canModify) || disableSaveBouton}
                                    onClick={handleSaveClick(selectedRowId)}
                                    size="small"
                                    sx={{ color: '#10B981' }}
                                    title="Sauvegarder"
                                >
                                    <CheckIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                                <IconButton
                                    disabled={disableCancelBouton}
                                    onClick={handleCancelClick(selectedRowId)}
                                    size="small"
                                    sx={{ color: '#F43F5E' }}
                                    title="Annuler"
                                >
                                    <CloseIcon sx={{ fontSize: 20 }} />
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
                                    onClick={handleOpenDialogConfirmDeleteAssocieRow}
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
        },
    ];

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    }

    // Charger la liste des devises
    const fetchDevises = () => {
        axios.get(`/devises/devise/compte/${compteId}/${id}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data.map((item, idx) => ({
                    id: item.id || idx + 1,
                    code: item.code,
                    libelle: item.libelle,
                    id_compte: item.id_compte,
                    par_defaut: item.par_defaut
                })) : [];
                setRows(data);
            })
            .catch(() => setRows([]));
    };

    useEffect(() => {
        if (canView) {
            fetchDevises();
        }
    }, []);

    // Sélection d'une ligne
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

    // Edition
    const handleEditClick = (id) => () => {
        const selectedRowInfos = rows.find(r => r.id === id[0]);
        // setEditRow(row);
        // setNewRow(null);
        formNewParam.setFieldValue('idDevise', selectedRowInfos.id ?? null);
        formNewParam.setFieldValue('compteId', compteId);
        formNewParam.setFieldValue('fileId', fileId);
        formNewParam.setFieldValue('code', selectedRowInfos.code ?? '');
        formNewParam.setFieldValue('libelle', selectedRowInfos.libelle ?? '');

        setRowModesModel({ ...rowModesModel, [id[0]]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
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

    // Ajout
    const handleOpenDialogAddNewAssocie = () => {
        // if (newRow) return;

        setDisableModifyBouton(false);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(false);
        setDisableSaveBouton(false);

        const newId = -Date.now();
        formNewParam.setFieldValue("idDevise", newId);
        const newDevise = {
            id_compte: Number(compteId),
            id_dossier: Number(id),
            id: newId,
            code: '',
            libelle: '',
        };

        setRows([...rows, newDevise]);
        setSelectedRowId([newId]);
        setSelectedRow([newId]);
        setDisableAddRowBouton(true);
    }

    // Sauvegarde
    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
        const dataToSend = { ...formNewParam.values, fileId, compteId };
        axiosPrivate.post(`/devises/devise`, dataToSend).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setDisableAddRowBouton(false);
                setDisableSaveBouton(true);
                formNewParam.resetForm();
                toast.success(resData.msg);
                fetchDevises();
            } else {
                toast.error(resData.msg);
            }
        })
    };

    // Annulation
    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
        setDisableAddRowBouton(false);
        setDisableSaveBouton(true);
        setDisableDeleteBouton(true);
        setDisableModifyBouton(true);
        setSelectedRow([]);
        setSelectedRowId([]);
    };

    // Suppression
    const handleOpenDialogConfirmDeleteAssocieRow = () => {
        setOpenDialogDeleteRow(true);
        setDisableAddRowBouton(false);
    }

    const deleteRow = (value) => {
        if (value === true && selectedRowId.length === 1) {
            const idToDelete = selectedRowId[0];
            if (idToDelete < 0) {
                setOpenDialogDeleteRow(false);
                setRows(rows.filter((row) => row.id !== idToDelete));
                return;
            }
            axiosPrivate.delete(`/devises/devise/${idToDelete}`)
                .then(res => {
                    if (res.data && res.data.state) {
                        setRows(rows.filter((row) => row.id !== idToDelete));
                        setOpenDialogDeleteRow(false);
                        setDisableAddRowBouton(false);
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
    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

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

    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        borderRadius: 1,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
    };

    return (
        <>
            {
                noFile
                    ?
                    <PopupTestSelectedFile
                        confirmationState={sendToHome}
                    />
                    :
                    null
            }
            {
                (openDialogDeleteRow && canDelete)
                    ?
                    <PopupConfirmDelete
                        msg={"Voulez-vous vraiment supprimer la devise sélectionnée ?"}
                        confirmationState={deleteRow}
                    />
                    :
                    null
            }
            <Box>

                <TabContext value={"1"}>
                    {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                    </Box> */}
                    <TabPanel value="1" sx={{ p: 4 }}>
                        {/* FIL D'ARIANE DANS LA PAGE */}
                        {/* <Breadcrumbs
                            separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />}
                            sx={{ mb: 1 }}
                        >
                            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>
                                Paramétrages
                            </Typography>
                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: NAV_DARK }}>
                                Devises
                            </Typography>
                        </Breadcrumbs> */}
                        <Typography variant='h6' sx={{ fontWeight: 800, color: NAV_DARK }}>Devises</Typography>


                        {/* TITRE ET ACTIONS MODERNES */}
                        <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" sx={{ mb: 3 }}>

                            <Stack direction="row" spacing={1}>
                                <TextField
                                    placeholder="Rechercher ..."
                                    size="small"
                                    value={searchText}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        width: 250,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            bgcolor: '#fff',
                                            height: '32px',
                                            fontSize: '12px'
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    disabled={!canAdd || disableAddRowBouton}
                                    onClick={handleOpenDialogAddNewAssocie}
                                    startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                                    sx={{
                                        bgcolor: NEON_MINT,
                                        textTransform: 'none',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        mr: 2,
                                        color: '#000',
                                        borderRadius: '6px',
                                        px: 2,
                                        '&:hover': {
                                            bgcolor: '#00E685',
                                            transform: 'translateY(-1px)'
                                        },
                                    }}
                                >
                                    Ajouter
                                </Button>
                            </Stack>
                        </Stack>

                        {/* DATAGRID MODERNE */}
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: '12px',
                                border: `1px solid ${BORDER_COLOR}`,
                                width: '100%',
                                overflow: 'hidden',
                                bgcolor: '#fff'
                            }}
                        >
                            <DataGrid
                                apiRef={apiRef}
                                rows={filteredRows}
                                columns={deviseColumns}
                                disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                disableColumnSelector={DataGridStyle.disableColumnSelector}
                                disableDensitySelector={DataGridStyle.disableDensitySelector}
                                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                disableRowSelectionOnClick
                                disableSelectionOnClick={true}
                                sx={{
                                    ...DataGridStyle.sx,
                                    border: 'none',
                                    borderRadius: '16px',
                                    height: '100%',

                                    '& .MuiDataGrid-main': {
                                        height: '100%',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        bgcolor: '#F8FAFC',
                                        color: '#64748B',
                                        fontWeight: 800,
                                        fontSize: '10px',
                                        textTransform: 'uppercase',
                                        borderBottom: '1px solid #E2E8F0',
                                        minHeight: '45px !important',
                                        maxHeight: '45px !important',
                                    },
                                    '& .MuiDataGrid-columnHeader': {
                                        height: '45px !important',
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        color: '#64748B',
                                        fontWeight: 800,
                                        fontSize: '10px',
                                        letterSpacing: '0.5px',
                                    },
                                    '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                        color: '#64748B',
                                    },
                                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                        outline: 'none',
                                        border: 'none',
                                    },
                                    '& .highlight-separator': {
                                        borderBottom: '1px solid red'
                                    },
                                    '& .MuiDataGrid-row.highlight-separator': {
                                        borderBottom: '1px solid red',
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        height: '100%',
                                    },
                                    '& .MuiDataGrid-row': {
                                        '&:hover': { bgcolor: '#F1F5F9' },
                                        transition: '0.2s',
                                        minHeight: '34px !important',
                                        maxHeight: '34px !important',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        fontSize: '13px',
                                        color: '#475569',
                                        borderBottom: '1px solid #F1F5F9',
                                        py: 1,
                                    },
                                }}
                                rowHeight={34}
                                columnHeaderHeight={45}
                                editMode='row'
                                onRowClick={(e) => handleCellEditCommit(e.row)}
                                onRowSelectionModelChange={ids => {
                                    const single = Array.isArray(ids) && ids.length ? [ids[ids.length - 1]] : [];
                                    setSelectedRow(single);
                                    saveSelectedRow(single);
                                    deselectRow(single);
                                }}
                                rowModesModel={rowModesModel}
                                onRowModesModelChange={handleRowModesModelChange}
                                onRowEditStop={handleRowEditStop}
                                processRowUpdate={processRowUpdate}
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
                                rowSelectionModel={selectedRow}
                                onRowEditStart={(params, event) => {
                                    const rowId = params.id;
                                    const rowData = params.row;

                                    const isNewRow = rowId < 0;

                                    if (!canModify && !isNewRow) {
                                        event.defaultMuiPrevented = true;
                                        return;
                                    }

                                    event.stopPropagation();

                                    setRowModesModel((oldModel) => ({
                                        ...oldModel,
                                        [rowId]: { mode: GridRowModes.Edit },
                                    }));

                                    formNewParam.setFieldValue("idDevise", rowId);
                                    formNewParam.setFieldValue("code", rowData.code ?? '');
                                    formNewParam.setFieldValue("libelle", rowData.libelle ?? '');

                                    setDisableAddRowBouton(true);
                                    setDisableSaveBouton(false);
                                }}
                                onCellKeyDown={handleCellKeyDown}
                            />
                        </Paper>
                    </TabPanel>
                </TabContext>
            </Box>
        </>
    )
}
