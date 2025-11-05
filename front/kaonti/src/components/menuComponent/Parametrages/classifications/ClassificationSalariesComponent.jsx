import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Stack, Paper, IconButton, FormControl, Input } from "@mui/material";
import Button from "@mui/material/Button";
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { TfiSave } from "react-icons/tfi";
import { VscClose } from "react-icons/vsc";
import { IoMdTrash } from "react-icons/io";
import Tooltip from "@mui/material/Tooltip";
import { InfoFileStyle } from "../../../componentsTools/InfosFileStyle";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import PopupConfirmDelete from "../../../componentsTools/popupConfirmDelete";
import PopupTestSelectedFile from "../../../componentsTools/popupTestSelectedFile";
import { init } from "../../../../../init";
import { DataGridStyle } from "../../../componentsTools/DatagridToolsStyle";
import {
    DataGrid,
    frFR,
    GridRowEditStopReasons,
    GridRowModes,
} from "@mui/x-data-grid";

import QuickFilter from "../../../componentsTools/DatagridToolsStyle";
import useAuth from "../../../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import axios from "../../../../../config/axios";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
 
export default function ClassificationSalariesComponent() {
    const initial = init[0];

    const { id } = useParams(); // id du dossier
    const [fileId, setFileId] = useState(0);

    const [fileInfos, setFileInfos] = useState("");

    const [noFile, setNoFile] = useState(false);
    const [rows, setRows] = useState([]);
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
    const [editRow, setEditRow] = useState(null);
    const [newRow, setNewRow] = useState(null);
    const [selectedRow, setSelectedRow] = useState([]);

    const [submitAttempt, setSubmitAttempt] = useState(false);

    // récupération infos de dossier sélectionné

    useEffect(() => {
        const navigationEntries = performance.getEntriesByType("navigation");

        let idFile = 0;
        if (navigationEntries.length > 0) {
            const navigationType = navigationEntries[0].type;

            if (navigationType === "reload") {
                const idDossier = sessionStorage.getItem("fileId");
                setFileId(idDossier);
                idFile = idDossier;
            } else {
                sessionStorage.setItem("fileId", id);

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
        });
    };

    const sendToHome = (value) => {
        setNoFile(!value);

        navigate("/tab/home");
    };

    const formNewParam = useFormik({
        initialValues: {
            idClassification: 0,
            compteId: compteId,
            fileId: fileId,
            classe: "",
            remarque: "",
        },
        onSubmit: (values) => { },
        validateOnChange: false,
        validateOnBlur: true,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        formNewParam.setFieldValue(name, value);
    };

    const isRequiredEmpty = (name) => {
        const v = formNewParam.values[name];
        return submitAttempt && (v === '' || v === null || v === undefined);
    };

    const classificationColumns = [
        {
            field: "classe",
            headerName: "Catégorie",
            flex: 1,
            editable: editableRow,
            headerAlign: "left",
            align: "left",
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%', backgroundColor: isRequiredEmpty('classe') ? '#F8D7DA' : 'transparent', border: isRequiredEmpty('classe') ? '1px solid #F5C2C7' : '1px solid transparent', borderRadius: '4px' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='classe'
                            type="text"
                            value={formNewParam.values.classe}
                            onChange={handleChange}
                            label="classe"
                            disableUnderline={true}
                        // disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },

        {
            field: "remarque",
            headerName: "Remarque",
            flex: 5,
            editable: editableRow,
            headerAlign: "left",
            align: "left",
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='remarque'
                            type="text"
                            value={formNewParam.values.remarque}
                            onChange={handleChange}
                            label="remarque"
                            disableUnderline={true}
                        // disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
    ];

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    }

    // Charger la liste des classifications
    const fetchClassifications = () => {
        axios
            .get(
                `/parametres/classification/dossier/${Number(compteId)}/${Number(id)}`
            )
            .then((res) => {
                const data = Array.isArray(res.data.list)
                    ? res.data.list.map((item, idx) => ({
                        id: item.id || idx + 1,
                        classe: item.classe,
                        remarque: item.remarque,
                        id_dossier: item.id_dossier,
                    }))
                    : [];
                setRows(data);
            })
            .catch(() => setRows([]));
    };

    useEffect(() => {
        fetchClassifications();
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
        formNewParam.setFieldValue('idClassification', selectedRowInfos.id ?? null);
        formNewParam.setFieldValue('compteId', compteId);
        formNewParam.setFieldValue('fileId', fileId);
        formNewParam.setFieldValue('classe', selectedRowInfos.classe ?? '');
        formNewParam.setFieldValue('remarque', selectedRowInfos.remarque ?? '');

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

    const handleOpenDialogAddNewAssocie = () => {
        // if (newRow) return;
        setDisableModifyBouton(false);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(false);
        setDisableSaveBouton(false);
        setSubmitAttempt(false);

        const newId = -Date.now();
        formNewParam.setFieldValue("idClassification", newId);
        const newDevise = {
            id_compte: Number(compteId),
            id_dossier: Number(id),
            id: newId,
            classe: '',
            remarque: '',
        };

        setRows([...rows, newDevise]);
        setSelectedRowId([newId]);
        setSelectedRow([newId]);
        setDisableAddRowBouton(true);
    }

    // Sauvegarde
    const handleSaveClick = (id) => () => {
        // Validation champ obligatoire: classe
        if (!formNewParam.values.classe || formNewParam.values.classe.trim() === '') {
            setSubmitAttempt(true);
            toast.error('La catégorie est obligatoire');
            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
            setDisableSaveBouton(false);
            return;
        }
        const dataToSend = { ...formNewParam.values, fileId, compteId };
        axios.post(`/parametres/classification`, dataToSend).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setDisableAddRowBouton(false);
                setDisableSaveBouton(true);
                formNewParam.resetForm();
                setSubmitAttempt(false);
                toast.success(resData.msg);
                fetchClassifications();
                setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
            } else {
                setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
                setDisableSaveBouton(false);
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
        setDisableCancelBouton(true);
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
            axios.delete(`/parametres/classification/${idToDelete}`).then((res) => {
                if (res.data && res.data.state) {
                    setRows(rows.filter((row) => row.id !== idToDelete));
                    setOpenDialogDeleteRow(false);
                    setDisableAddRowBouton(false);
                } else {
                    toast.error(res.data.msg || "Erreur lors de la suppression");

                    setOpenDialogDeleteRow(false);
                }
            })
                .catch(() => {
                    toast.error("Erreur lors de la suppression");

                    setOpenDialogDeleteRow(false); // <-- ici aussi
                });
        } else {
            setOpenDialogDeleteRow(false);
        }
    };

    // Edition cellule
    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    return (
        <Box>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}

            {openDialogDeleteRow ? (
                <PopupConfirmDelete
                    msg={
                        "Voulez-vous vraiment supprimer la classification sélectionnée ?"
                    }
                    confirmationState={deleteRow}
                />
            ) : null}

            <TabContext value={"1"}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList aria-label="lab API tabs example">
                        <Tab
                            style={{
                                textTransform: "none",
                                outline: "none",
                                border: "none",
                                margin: -5,
                            }}
                            label={InfoFileStyle(fileInfos?.dossier)}
                            value="1"
                        />
                    </TabList>
                </Box>

                <TabPanel value="1">
                    <Typography variant="h6" sx={{ color: "black" }} align="left">
                        Paramétrages : Catégories
                    </Typography>

                    <Stack
                        width={"100%"}
                        height={"30px"}
                        spacing={0.5}
                        alignItems={"center"}
                        alignContent={"center"}
                        direction={"column"}
                        style={{
                            marginLeft: "0px",
                            marginTop: "20px",
                            justifyContent: "right",
                        }}
                    >
                        <Stack
                            width={"100%"}
                            height={"30px"}
                            spacing={0.5}
                            alignItems={"center"}
                            alignContent={"center"}
                            direction={"row"}
                            justifyContent={"right"}
                        >
                            <Tooltip title="Ajouter une ligne">
                                <span>
                                    <IconButton
                                        disabled={disableAddRowBouton}
                                        variant="contained"
                                        onClick={handleOpenDialogAddNewAssocie}
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                            borderRadius: "2px",
                                            borderColor: "transparent",
                                            backgroundColor: initial.theme,
                                            textTransform: "none",
                                            outline: "none",
                                        }}
                                    >
                                        <TbPlaylistAdd
                                            style={{ width: "25px", height: "25px", color: "white" }}
                                        />
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
                                            width: "35px",
                                            height: "35px",
                                            borderRadius: "2px",
                                            borderColor: "transparent",
                                            backgroundColor: initial.theme,
                                            textTransform: "none",
                                            outline: "none",
                                        }}
                                    >
                                        <FaRegPenToSquare
                                            style={{ width: "25px", height: "25px", color: "white" }}
                                        />
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
                                            width: "35px",
                                            height: "35px",
                                            borderRadius: "2px",
                                            borderColor: "transparent",
                                            backgroundColor: initial.theme,
                                            textTransform: "none",
                                            outline: "none",
                                        }}
                                    >
                                        <TfiSave
                                            style={{ width: "50px", height: "50px", color: "white" }}
                                        />
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
                                            width: "35px",
                                            height: "35px",
                                            borderRadius: "2px",
                                            borderColor: "transparent",
                                            backgroundColor: initial.button_delete_color,
                                            textTransform: "none",
                                            outline: "none",
                                        }}
                                    >
                                        <VscClose
                                            style={{ width: "50px", height: "50px", color: "white" }}
                                        />
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
                                            width: "35px",
                                            height: "35px",
                                            borderRadius: "2px",
                                            borderColor: "transparent",
                                            backgroundColor: initial.button_delete_color,
                                            textTransform: "none",
                                            outline: "none",
                                        }}
                                    >
                                        <IoMdTrash
                                            style={{ width: "50px", height: "50px", color: "white" }}
                                        />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>

                        <Stack width={"100%"} height={"100%"} minHeight={"600px"}>
                            <DataGrid
                                columns={classificationColumns}
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

                                        formNewParam.setFieldValue("idClassification", rowId);
                                        formNewParam.setFieldValue("classe", rowData.classe ?? '');
                                        formNewParam.setFieldValue("remarque", rowData.remarque ?? '');

                                        setRowModesModel((oldModel) => ({
                                            ...oldModel,
                                            [rowId]: { mode: GridRowModes.Edit },
                                        }));

                                        setDisableSaveBouton(false);
                                    }
                                }}
                            />
                        </Stack>
                    </Stack>
                </TabPanel>
            </TabContext>
        </Box>
    );
}
