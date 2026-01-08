import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Stack, IconButton, FormControl, Input, Select, Autocomplete, TextField } from '@mui/material';
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { TfiSave } from "react-icons/tfi";
import { VscClose } from "react-icons/vsc";
import { IoMdTrash } from "react-icons/io";
import Tooltip from '@mui/material/Tooltip';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
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
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';

export default function Consolidation() {
    const apiRef = useGridApiRef();
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const axiosPrivate = useAxiosPrivate();
    const initial = init[0];

    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [rows, setRows] = useState([]);
    const [listCompteDossierPrincipal, setListCompteDossierPrincipal] = useState([]);
    const [comptesParDossier, setComptesParDossier] = useState({});
    const [consolidationDossier, setConsolidationDossier] = useState([]);

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
            idConsolidationCompte: 0,
            idNumCpt: '',
            idDossierAutre: '',
            idNumCptAutre: ''
        },
        onSubmit: (values) => {

        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    const isRequiredEmpty = (name) => {
        const v = formNewParam.values[name];
        return submitAttempt && (v === '' || v === null || v === undefined);
    };

    const consolidationCompteColumns = [
        {
            field: 'id_numcpt',
            headerName: 'Compte',
            flex: 1,
            editable: true,
            headerAlign: 'left',
            align: 'left',
            editableRow: editableRow,
            renderCell: (params) => {
                if (!listCompteDossierPrincipal || !Array.isArray(listCompteDossierPrincipal)) {
                    return '';
                }

                const id = Number(params.value);
                if (!id) return '';

                const data = listCompteDossierPrincipal.find(val => val.id === id);
                return data ? `${data.compte} - ${data.libelle}` : '';
            },
            renderEditCell: (params) => {
                const selectedCompte = listCompteDossierPrincipal.find(c => c.id === params.value) || null;

                return (
                    <Autocomplete
                        name='idNumCpt'
                        key={params.id} autoHighlight
                        autoComplete
                        openOnFocus
                        disableClearable={false}
                        popperprops={{ disablePortal: true }}
                        options={listCompteDossierPrincipal}
                        getOptionLabel={(option) => `${option.compte} - ${option.libelle} (${option.dossier})`}
                        value={selectedCompte}
                        onChange={(event, newValue) => {
                            formNewParam.setFieldValue('idNumCpt', newValue?.id);
                            params.api.setEditCellValue({
                                id: params.id,
                                field: params.field,
                                value: newValue?.id || null
                            });
                        }}
                        style={{ width: '100%', height: '100%' }}
                        noOptionsText="Aucune compte trouvé"
                        renderOption={(props, option) => (
                            <li {...props}>
                                <span>
                                    {option.compte} - {option.libelle}{' '}
                                    <span style={{ color: '#1976d2', fontWeight: 600, fontSize : 14 }}>
                                        ({option.dossier})
                                    </span>
                                </span>
                            </li>
                        )}
                        renderInput={(paramsInput) => (
                            <TextField
                                {...paramsInput}
                                variant="standard"
                                placeholder="Choisir un compte"
                                fullWidth
                                InputProps={{
                                    ...paramsInput.InputProps,
                                    disableUnderline: true,
                                }}
                                style={{
                                    width: 700,
                                    transition: 'width 0.2s ease-in-out',
                                    backgroundColor: isRequiredEmpty('idNumCpt') ? '#F8D7DA' : 'transparent',
                                    border: isRequiredEmpty('idNumCpt') ? '1px solid #F5C2C7' : '1px solid transparent',
                                }}
                            />
                        )}
                    />
                );
            },
        },
        {
            field: 'id_dossier_autre',
            headerName: 'Dossier consolidé',
            flex: 0.5,
            editable: true,
            headerAlign: 'left',
            align: 'left',
            editableRow: editableRow,

            renderCell: (params) => {
                if (!consolidationDossier || !Array.isArray(consolidationDossier)) return '';

                const id = params.value;
                const data = consolidationDossier.find(d => d.id_dossier_autre === id);
                return data ? data.dossier_autre : '';
            },

            renderEditCell: (params) => {
                const selectedDossier = consolidationDossier.find(d => d.id_dossier_autre === params.value) || null;

                return (
                    <Autocomplete
                        name='idDossierAutre'
                        key={params.id}
                        options={consolidationDossier}
                        getOptionLabel={(option) => option.dossier_autre || ''}
                        value={selectedDossier}
                        onChange={(event, newValue) => {
                            formNewParam.setFieldValue('idDossierAutre', newValue?.id_dossier_autre || '');
                            params.api.setEditCellValue({
                                id: params.id,
                                field: params.field,
                                value: newValue?.id_dossier_autre || null
                            });
                        }}
                        autoHighlight
                        openOnFocus
                        disableClearable={false}
                        noOptionsText="Aucun dossier trouvé"
                        style={{ width: '100%', height: '100%' }}
                        renderInput={(paramsInput) => (
                            <TextField
                                {...paramsInput}
                                variant="standard"
                                placeholder="Choisir un dossier"
                                fullWidth
                                InputProps={{
                                    ...paramsInput.InputProps,
                                    disableUnderline: true,
                                }}
                                style={{
                                    width: '100%',
                                    backgroundColor: isRequiredEmpty('idDossierAutre') ? '#F8D7DA' : 'transparent',
                                    border: isRequiredEmpty('idDossierAutre') ? '1px solid #F5C2C7' : '1px solid transparent',
                                    borderRadius: '4px'
                                }}
                            />
                        )}
                    />
                );
            },
        },
        {
            field: 'id_numcpt_autre',
            headerName: 'Compte associé',
            flex: 1,
            editable: true,
            headerAlign: 'left',
            align: 'left',
            editableRow: editableRow,

            renderCell: (params) => {
                const idDossier = params.row.id_dossier_autre;
                const idCompte = params.value;
                if (!idDossier || !idCompte) return '';
                const comptes = comptesParDossier[idDossier] || [];
                const compte = comptes.find(c => c.id === idCompte);
                return compte ? `${compte.compte} - ${compte.libelle}` : '';
            },

            renderEditCell: (params) => {
                const idDossier = params.row.id_dossier_autre;
                const comptes = comptesParDossier[idDossier] || [];

                const selectedCompte = comptes.find(c => c.id === params.value) || null;

                return (
                    <Autocomplete
                        name='idNumCptAutre'
                        key={params.id} autoHighlight
                        autoComplete
                        openOnFocus
                        disableClearable={false}
                        popperprops={{ disablePortal: true }}
                        options={comptes}
                        getOptionLabel={(option) => `${option.compte} - ${option.libelle}`}
                        value={selectedCompte}
                        onChange={(event, newValue) => {
                            formNewParam.setFieldValue('idNumCptAutre', newValue?.id);
                            params.api.setEditCellValue({
                                id: params.id,
                                field: params.field,
                                value: newValue?.id || null
                            });
                        }}
                        style={{ width: '100%', height: '100%' }}
                        noOptionsText="Aucune compte trouvé"
                        renderInput={(paramsInput) => (
                            <TextField
                                {...paramsInput}
                                variant="standard"
                                placeholder="Choisir un compte"
                                fullWidth
                                InputProps={{
                                    ...paramsInput.InputProps,
                                    disableUnderline: true,
                                }}
                                style={{
                                    width: 700,
                                    transition: 'width 0.2s ease-in-out',
                                    backgroundColor: isRequiredEmpty('idNumCptAutre') ? '#F8D7DA' : 'transparent',
                                    border: isRequiredEmpty('idNumCptAutre') ? '1px solid #F5C2C7' : '1px solid transparent',
                                }}
                            />
                        )}
                    />
                );
            },
        }
    ];

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    }

    // Liste des consolidation par compte
    const getAllConsolidationCompte = () => {
        axios.get(`/param/consolidation/getAllConsolidationCompte/${compteId}/${fileId}`)
            .then(res => {
                const data = res.data;
                setRows(data);
            })
            .catch(() => setRows([]));
    };

    // Liste des consolidations par dossier
    const getListeConsolidationDossier = () => {
        axios.get(`/param/consolidation/getListeConsolidationDossier/${compteId}/${fileId}`).then((response) => {
            const resData = response.data;
            setConsolidationDossier(resData.list);
        })
    }

    // Liste des compte associé sur le dossier
    const getListeCompteAssocieDossier = () => {
        axios.get(`/param/consolidation/getListeCompteAssocieDossier/${compteId}/${fileId}`).then((response) => {
            const resData = response.data;
            setListCompteDossierPrincipal(resData);
        })
    }

    const getListeCompteInConsolidationDossier = () => {
        axios.get(`/param/consolidation/getListeCompteInConsolidationDossier/${compteId}/${fileId}`)
            .then((response) => {
                const resData = response.data;

                const map = {};
                resData.forEach(c => {
                    if (!map[c.id_dossier]) map[c.id_dossier] = [];
                    map[c.id_dossier].push(c);
                });

                setComptesParDossier(map);
            })
            .catch(() => setComptesParDossier({}));
    }

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
        formNewParam.setFieldValue('idConsolidationCompte', selectedRowInfos.id ?? null);
        formNewParam.setFieldValue('idNumCpt', selectedRowInfos.id_numcpt ?? '');
        formNewParam.setFieldValue('idDossierAutre', selectedRowInfos.id_dossier_autre ?? '');
        formNewParam.setFieldValue('idNumCptAutre', selectedRowInfos.id_numcpt_autre ?? '');

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
        formNewParam.setFieldValue("idConsolidationCompte", newId);
        const newFonction = {
            id: newId,
            id_dossier: Number(id),
            id_compte: Number(compteId),
            id_dossier_autre: '',
            id_numcpt: '',
            id_numcpt_autre: ''
        };

        setRows([...rows, newFonction]);
        setSelectedRowId([newId]);
        setSelectedRow([newId]);
        setDisableAddRowBouton(true);
    }

    // Sauvegarde
    const handleSaveClick = (id) => () => {
        const dataToSend = {
            ...formNewParam.values,
            idCompte: Number(compteId),
            idDossier: Number(fileId)
        };

        if ((!formNewParam.values.idNumCpt || formNewParam.values.idNumCpt === '') || (!formNewParam.values.idDossierAutre || formNewParam.values.idDossierAutre === '') || (!formNewParam.values.idNumCptAutre || formNewParam.values.idNumCptAutre === '')) {
            setSubmitAttempt(true);
            toast.error('Les champs en surbrillances sont obligatoires');
            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
            setDisableSaveBouton(false);
            return;
        }

        axiosPrivate.post(`/param/consolidation/addOrUpdateConsolidationCompte`, dataToSend).then((response) => {
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
                toast.success('Consolidation supprimée avec succès');
                setOpenDialogDeleteRow(false);
                setRows(rows.filter((row) => row.id !== idToDelete));
                setSelectedRowId([]);
                setSelectedRow([]);
                setDataGridKey(prev => prev + 1);
                return;
            }
            axiosPrivate.delete(`/param/consolidation/deleteConsolidationCompte/${idToDelete}`)
                .then(res => {
                    if (res.data && res.data.state) {
                        setRows(rows.filter((row) => row.id !== idToDelete));
                        setOpenDialogDeleteRow(false);
                        setDisableAddRowBouton(false);
                        setSelectedRowId([]);
                        setSelectedRow([]);
                        setDataGridKey(prev => prev + 1);
                        toast.success('Consolidation supprimé avec succès');
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
            formNewParam.setFieldValue('idNumCpt', newRow.id_numcpt || '');
            formNewParam.setFieldValue('idDossierAutre', newRow.id_dossier_autre || '');
            formNewParam.setFieldValue('idNumCptAutre', newRow.id_numcpt_autre || '');
        }

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

    useEffect(() => {
        if (canView && compteId && fileId) {
            getAllConsolidationCompte();
            getListeConsolidationDossier();
            getListeCompteAssocieDossier();
            getListeCompteInConsolidationDossier();
        }
    }, [isRefreshed, compteId, fileId]);

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
                        msg={"Voulez-vous vraiment supprimer la fonction sélectionnée ?"}
                        confirmationState={deleteRow}
                    />
                    :
                    null
            }
            <Box>

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
                        <Typography variant='h6' sx={{ color: "black" }} align='left'>Paramétrages : Consolidation - Correpondance</Typography>
                        <Stack width={"100%"} height={"30px"} spacing={1} alignItems={"center"} alignContent={"center"}
                            direction={"column"} style={{ marginLeft: "0px", marginTop: "20px", justifyContent: "right" }}>
                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                direction={"row"} justifyContent={"right"}>
                                <Tooltip title="Ajouter une ligne">
                                    <span>
                                        <IconButton
                                            disabled={!canAdd || disableAddRowBouton}
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
                                            disabled={(!canAdd && !canModify) || disableSaveBouton}
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
                                            disabled={!canDelete || disableDeleteBouton}
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
                                    apiRef={apiRef}
                                    key={dataGridKey}
                                    columns={consolidationCompteColumns}
                                    rows={rows}
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
                                        '& .MuiDataGrid-virtualScroller': {
                                            maxHeight: '100%',
                                        },
                                    }}
                                    rowHeight={DataGridStyle.rowHeight}
                                    columnHeaderHeight={DataGridStyle.columnHeaderHeight}
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
                                        if (!selectedRow.length || selectedRow[0] !== params.id) {
                                            event.defaultMuiPrevented = true;
                                        }
                                        if (selectedRow.includes(params.id)) {
                                            setDisableAddRowBouton(true);
                                            event.stopPropagation();

                                            const rowId = params.id;
                                            const rowData = params.row;

                                            formNewParam.setFieldValue("idConsolidationCompte", rowId);
                                            formNewParam.setFieldValue("idNumCpt", rowData.id_numcpt ?? '');
                                            formNewParam.setFieldValue("idDossierAutre", rowData.id_dossier_autre ?? '');
                                            formNewParam.setFieldValue("idNumCptAutre", rowData.id_numcpt_autre ?? '');

                                            setRowModesModel((oldModel) => ({
                                                ...oldModel,
                                                [rowId]: { mode: GridRowModes.Edit },
                                            }));

                                            setDisableSaveBouton(false);
                                        }
                                    }}
                                    onCellKeyDown={handleCellKeyDown}
                                />
                            </Stack>
                        </Stack>
                    </TabPanel>
                </TabContext>
            </Box>
        </>
    )
}
