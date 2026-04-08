import {
    Box, Typography, Button,
    GlobalStyles, TextField, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Checkbox, IconButton, InputAdornment, Breadcrumbs, Stack, FormControl, FormHelperText, Input
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import { init } from '../../../../../init';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes, useGridApiRef } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../../config/axiosPrivate';

// Icônes
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/HighlightOff';

const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';
const BORDER_COLOR = '#E2E8F0';

const PortefeuillePage = () => {

    const apiRef = useGridApiRef();
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const axiosPrivate = useAxiosPrivate();
    const initial = init[0];

    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [rows, setRows] = useState([]);
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded?.UserInfo?.compteId || null;
    const navigate = useNavigate();
    const [editableRow, setEditableRow] = useState(true);

    const [rowModesModel, setRowModesModel] = useState({});
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);
    const [selectedRow, setSelectedRow] = useState([]);

    const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);
    const [dataGridKey, setDataGridKey] = useState(0);

    const [submitAttempt, setSubmitAttempt] = useState(false);
    const [isRefreshed, setIsRefreshed] = useState(false);

    useEffect(() => {
        let idFile = id;
        if (!idFile) {
            idFile = sessionStorage.getItem("fileId");
        } else {
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

    const formNewParam = useFormik({
        initialValues: {
            idPortefeuille: 0,
            nom: '',
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

    const isRequiredEmpty = (name) => {
        const v = formNewParam.values[name];
        return submitAttempt && (v === '' || v === null || v === undefined);
    };

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
            headerName: 'Nom de la portefeuille',
            flex: 1,    
            editable: true,
            headerAlign: 'left',
            align: 'left',
            editableRow: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%', backgroundColor: isRequiredEmpty('nom') ? '#F8D7DA' : 'transparent', border: isRequiredEmpty('nom') ? '1px solid #F5C2C7' : '1px solid transparent', borderRadius: '4px' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='nom'
                            type="text"
                            value={formNewParam.values.nom}
                            onChange={handleChange}
                            label="nom"
                            disableUnderline={true}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            filterable: false,
            align: 'right',
            headerAlign: 'right',

            renderCell: (params) => {
                const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;

                // MODE EDIT
                if (isInEditMode) {
                    return (
                        <Stack direction="row" spacing={0}>
                            <IconButton
                                size="small"
                                sx={{ color: '#10B981' }}
                                onClick={handleSaveClick(selectedRowId)}
                            >
                                <SaveIcon fontSize="inherit" />
                            </IconButton>

                            <IconButton
                                size="small"
                                sx={{ color: '#EF4444' }}
                                onClick={handleCancelClick(selectedRowId)}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        </Stack>
                    );
                }

                // MODE NORMAL
                return (
                    <Stack direction="row" spacing={0}>
                        <IconButton
                            size="small"
                            sx={{ color: '#64748B' }}
                            disabled={(!canModify && selectedRowId > 0) || disableModifyBouton}
                            onClick={handleEditClick(selectedRowId)}
                        >
                            <EditIcon fontSize="inherit" />
                        </IconButton>

                        <IconButton
                            size="small"
                            sx={{ color: '#CBD5E1' }}
                            disabled={!canDelete || disableDeleteBouton}
                            onClick={handleOpenDialogConfirmDeleteAssocieRow}
                        >
                            <DeleteIcon fontSize="inherit" />
                        </IconButton>
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

    // Charger la liste des portefeuille
    const getAllPortefeuille = () => {
        axios.get(`/param/portefeuille/getAllPortefeuille/${compteId}`)
            .then(res => {
                const data = Array.isArray(res.data.list) ? res.data.list.map((item, idx) => ({
                    id: item.id || idx + 1,
                    nom: item.nom
                })) : [];
                setRows(data);
            })
            .catch(() => setRows([]));
    };

    useEffect(() => {
        if (canView) {
            getAllPortefeuille();
        }
    }, [isRefreshed]);

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
        formNewParam.setFieldValue('idPortefeuille', selectedRowInfos.id ?? null);
        formNewParam.setFieldValue('nom', selectedRowInfos.nom ?? '');

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
        setDisableModifyBouton(false);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(false);
        setDisableSaveBouton(false);
        setSubmitAttempt(false);

        const newId = -Date.now();
        formNewParam.setFieldValue("idPortefeuille", newId);
        const newFonction = {
            id_dossier: Number(id),
            id: newId,
            nom: '',
        };

        setRows([...rows, newFonction]);
        setSelectedRowId([newId]);
        setSelectedRow([newId]);
        setDisableAddRowBouton(true);
    }

    // Sauvegarde
    const handleSaveClick = (id) => () => {
        if (!formNewParam.values.nom || formNewParam.values.nom.trim() === '') {
            setSubmitAttempt(true);
            toast.error('Le nom de la portefeuille est obligatoire');
            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
            setDisableSaveBouton(false);
            return;
        }

        const dataToSend = {
            ...formNewParam.values,
            id_compte: Number(compteId)
        };

        axiosPrivate.post(`/param/portefeuille/addOrUpdatePortefeuille`, dataToSend).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setDisableAddRowBouton(false);
                setDisableSaveBouton(true);
                setDisableModifyBouton(true);
                setDisableCancelBouton(true);
                setDisableDeleteBouton(true);
                setSelectedRowId([]);
                setSelectedRow([]);
                setRowModesModel({});
                setDataGridKey(prev => prev + 1);
                formNewParam.resetForm();
                setSubmitAttempt(false);
                toast.success(resData.msg);
                setIsRefreshed(prev => !prev);
                setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
            } else {
                setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
                setDisableSaveBouton(false);
                toast.error(resData.msg || 'Erreur lors de la sauvegarde');
            }
        }).catch((error) => {
            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
            setDisableSaveBouton(false);
            toast.error('Erreur de connexion lors de la sauvegarde');
            console.error('Erreur sauvegarde fonction:', error);
        });
    };

    // Annulation
    const handleCancelClick = (id) => () => {
        if (id < 0) {
            setRows(rows.filter((row) => row.id !== id));
            setSelectedRowId([]);
            setSelectedRow([]);
        } else {
            setRowModesModel({
                ...rowModesModel,
                [id]: { mode: GridRowModes.View, ignoreModifications: true },
            });
        }
        setDisableAddRowBouton(false);
        setDisableSaveBouton(true);
        setDisableCancelBouton(true);
        setDisableModifyBouton(true);
        formNewParam.resetForm();
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
                toast.success('Portefeuille supprimée avec succès');
                setOpenDialogDeleteRow(false);
                setRows(rows.filter((row) => row.id !== idToDelete));
                setSelectedRowId([]);
                setSelectedRow([]);
                setDataGridKey(prev => prev + 1);
                return;
            }
            axiosPrivate.delete(`/param/portefeuille/deletePortefeuille/${idToDelete}`)
                .then(res => {
                    if (res.data && res.data.state) {
                        setRows(rows.filter((row) => row.id !== idToDelete));
                        setOpenDialogDeleteRow(false);
                        setDisableAddRowBouton(false);
                        setSelectedRowId([]);
                        setSelectedRow([]);
                        setDataGridKey(prev => prev + 1);
                        toast.success('Portefeuille supprimée avec succès');
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

        if (selectedRowId.includes(newRow.id)) {
            formNewParam.setFieldValue('nom', newRow.nom || '');
        }

        return updatedRow;
    };

    const dataGridStyle = {
        borderRadius: '12px',
        border: `1px solid ${BORDER_COLOR}`,
        bgcolor: '#fff',
        overflow: 'hidden',

        // HEADER CONTAINER
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F8FAFC',
            minHeight: '35px !important',
            maxHeight: '35px !important',
            borderBottom: `1px solid ${BORDER_COLOR}`,
        },

        // HEADER CELL
        '& .MuiDataGrid-columnHeader': {
            bgcolor: '#F8FAFC',
            minHeight: '35px !important',
            maxHeight: '35px !important',
            paddingTop: 0,
            paddingBottom: 0,
        },

        // HEADER TEXT (équivalent headerStyle)
        '& .MuiDataGrid-columnHeaderTitle': {

            fontWeight: 800,
            color: '#94A3B8',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },

        // ROW
        '& .MuiDataGrid-row': {
            height: 32,
            '&:hover': { backgroundColor: '#F8FAFC' },
        },

        // CELL (équivalent cellStyle)
        '& .MuiDataGrid-cell': {
            fontSize: '13px',
            paddingTop: '6px',
            paddingBottom: '6px',
        },

        // enlève les bordures verticales
        '& .MuiDataGrid-columnSeparator': {
            display: 'none',
        },

        // enlève le focus bleu moche
        '& .MuiDataGrid-cell:focus': {
            outline: 'none',
        },
    };

    return (
        <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
            <GlobalStyles styles={{ body: { margin: 0, padding: 0 }, '*': { boxSizing: 'border-box' } }} />

            <Box sx={{ p: 4, width: '100%' }}>
                {/* <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />} sx={{ mb: 1 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Paramétrages</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: NAV_DARK }}>Portefeuille</Typography>
                </Breadcrumbs> */}

                {/* SECTION TABLEAU */}
                <Box sx={{ maxWidth: '800px' }}> {/* Limite la largeur pour éviter l'étirement */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, height: '32px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: NAV_DARK }}>Liste des portefeuilles</Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                placeholder="Recherche..."
                                size="small"
                                sx={searchStyle}
                                InputProps={{
                                    startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94A3B8' }} /></InputAdornment>),
                                }}
                            />
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                disabled={!canAdd || disableAddRowBouton}
                                onClick={handleOpenDialogAddNewAssocie}
                                sx={btnStyle}
                            >
                                Ajouter
                            </Button>
                        </Stack>
                    </Stack>

                    {/* <TableContainer component={Paper} elevation={0} sx={tableContainerStyle}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow sx={{ height: '35px' }}>
                                    <TableCell padding="checkbox" sx={{ width: '40px' }}><Checkbox size="small" /></TableCell>
                                    <TableCell sx={headerStyle(400)}>Nom du portefeuille</TableCell>
                                    <TableCell align="right" sx={headerStyle(120, true)}>Actions</TableCell>
                                    <TableCell sx={{ bgcolor: '#F8FAFC' }} /> {/* Absorbe l'espace restant */}
                    {/* </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow sx={{ height: '36px', '&:hover': { bgcolor: '#F1F5F9' } }}>
                                    <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                                    <TableCell sx={cellStyle}>Test</TableCell>
                                    <TableCell align="right" sx={{ py: 0 }}>
                                        <Stack direction="row" spacing={0} justifyContent="flex-end">
                                            <IconButton size="small" sx={{ color: '#64748B' }}><EditIcon fontSize="inherit" /></IconButton>
                                            <IconButton size="small" sx={{ color: '#CBD5E1' }}><DeleteIcon fontSize="inherit" /></IconButton>
                                        </Stack>
                                    </TableCell>
                                    <TableCell />
                                </TableRow> */}
                    {/* <TableRow sx={{ height: '36px', '&:hover': { bgcolor: '#F1F5F9' } }}>
                                    <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                                    <TableCell sx={cellStyle}>f</TableCell>
                                    <TableCell align="right" sx={{ py: 0 }}>
                                        <Stack direction="row" spacing={0} justifyContent="flex-end">
                                            <IconButton size="small" sx={{ color: '#64748B' }}><EditIcon fontSize="inherit" /></IconButton>
                                            <IconButton size="small" sx={{ color: '#CBD5E1' }}><DeleteIcon fontSize="inherit" /></IconButton>
                                        </Stack>
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableBody> */}
                    {/* </Table> */}
                    {/* </TableContainer> */}
                    <div style={{ width: '100%', height: '100%' }}>
                        <DataGrid
                            apiRef={apiRef}
                            key={dataGridKey}
                            columns={fonctionsColumns}
                            rows={rows}
                            disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                            disableColumnSelector={DataGridStyle.disableColumnSelector}
                            disableDensitySelector={DataGridStyle.disableDensitySelector}
                            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                            disableRowSelectionOnClick
                            disableSelectionOnClick={true}
                            // slots={{ toolbar: QuickFilter }}
                            rowHeight={36}
                            headerHeight={35}
                            sx={dataGridStyle}
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
                            hideFooter
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
                                if (!selectedRow.length || selectedRow[0] !== params.id) {
                                    event.defaultMuiPrevented = true;
                                }
                                if (selectedRow.includes(params.id)) {
                                    setDisableAddRowBouton(true);
                                    event.stopPropagation();

                                    const rowId = params.id;
                                    const rowData = params.row;

                                    formNewParam.setFieldValue("idPortefeuille", rowId);
                                    formNewParam.setFieldValue("nom", rowData.nom ?? '');

                                    setRowModesModel((oldModel) => ({
                                        ...oldModel,
                                        [rowId]: { mode: GridRowModes.Edit },
                                    }));

                                    setDisableSaveBouton(false);
                                }
                            }}
                            onCellKeyDown={handleCellKeyDown}
                        />
                    </div>
                </Box>
            </Box>
        </Box>
    );
};

// --- STYLES REUTILISABLES ---
const tableContainerStyle = {
    borderRadius: '12px',
    border: `1px solid ${BORDER_COLOR}`,
    bgcolor: '#fff',
    overflow: 'hidden'
};

const cellStyle = { fontSize: '13px', py: '6px' };

const headerStyle = (width, last = false) => ({
    fontWeight: 800,
    color: '#94A3B8',
    fontSize: '10px',
    textTransform: 'uppercase',
    width: width,
    minWidth: width,
    paddingY: '4px',
    pr: last ? 2 : 1
});

const btnStyle = {
    bgcolor: '#10B981',
    color: '#fff',
    textTransform: 'none',
    fontWeight: 700,
    borderRadius: '6px',
    height: '28px',
    fontSize: '11px',
    '&:hover': { bgcolor: '#059669' }
};

const searchStyle = {
    width: 160,
    '& .MuiOutlinedInput-root': {
        borderRadius: '6px',
        bgcolor: '#fff',
        height: '28px',
        fontSize: '11px'
    }
};

export default PortefeuillePage;