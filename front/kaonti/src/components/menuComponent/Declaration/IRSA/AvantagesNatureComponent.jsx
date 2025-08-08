import { React, useState, useEffect } from 'react';
import { Stack, Paper, IconButton } from '@mui/material';
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { TfiSave } from "react-icons/tfi";
import { VscClose } from "react-icons/vsc";
import { IoMdTrash } from "react-icons/io";
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, frFR, GridRowModes } from '@mui/x-data-grid';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';

export default function AvantagesNatureComponent() {
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [newRow, setNewRow] = useState(null);

    const avantageNatureColumns = [
        // { field: 'nom', headerName: 'Nom', width: 180, editable: true, type:'string' },
        { field: 'imposables', headerName: 'Imposables', width: 180, editable: true, type: 'number' },
        { field: 'exoneres', headerName: 'Exonérés', width: 180, editable: true, type: 'number' },
    ];

    const fetchAvantagesNature = () => {
        console.log('Fetching avantages nature...');
        axios.get(`/irsa/avantageNature`)
            .then(res => {
                console.log('Avantages nature response:', res.data);
                const data = res.data.state && Array.isArray(res.data.list) ? res.data.list.map((item, idx) => ({
                    id: item.id || idx + 1,
                    imposables: item.imposables,
                    exoneres: item.exoneres
                })) : [];
                console.log('Processed avantages nature data:', data);
                setRows(data);
            })
            .catch((error) => {
                console.error('Error fetching avantages nature:', error);
                setRows([]);
            });
    };

    useEffect(() => {
        fetchAvantagesNature();
    }, []);

    const saveSelectedRow = (ids) => {
        if(ids.length === 1){
            setSelectedRowId(ids);
            setDisableModifyBouton(false);
            setDisableSaveBouton(false);
            setDisableCancelBouton(false);
            setDisableDeleteBouton(false);
        }else{
            setSelectedRowId([]);
            setDisableModifyBouton(true);
            setDisableSaveBouton(true);
            setDisableCancelBouton(true);
            setDisableDeleteBouton(true);
        }
    }

    const handleEditClick = (ids) => () => {
        if(ids.length === 1){
            const row = rows.find(r => r.id === ids[0]);
            setEditRow(row);
            setNewRow(null);
            setRowModesModel({ ...rowModesModel, [ids[0]]: { mode: GridRowModes.Edit } });
            setDisableSaveBouton(false);
        }
    };

    const handleOpenDialogAddNew = () => {
        if (newRow) return;
        const newId = -(Math.max(0, ...rows.map(r => r.id || 0)) + 1);
        const newAvantage = { id: newId, imposables: '', exoneres: '' };
        setRows([...rows, newAvantage]);
        setNewRow(newAvantage);
        setEditRow(null);
        setSelectedRowId([newId]);
        setRowModesModel({ ...rowModesModel, [newId]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
        setDisableModifyBouton(true);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(true);
    }

    const handleSaveClick = (ids) => () => {
        if(editRow){
            axios.put(`/irsa/avantageNature/${editRow.id}`, editRow)
                .then(res => {
                    if(res.data && res.data.state){
                        fetchAvantagesNature();
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Avantage en nature modifié');
                    }else{
                        toast.error(res.data.msg || 'Erreur lors de la modification');
                    }
                })
                .catch(() => toast.error('Erreur lors de la modification'));
        } else if(newRow) {
            axios.post(`/irsa/avantageNature`, newRow)
                .then(res => {
                    if(res.data && res.data.state){
                        fetchAvantagesNature();
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Avantage en nature ajouté');
                    }else{
                        toast.error(res.data.msg || 'Erreur lors de l\'ajout');
                    }
                })
                .catch(() => toast.error('Erreur lors de l\'ajout'));
        }
    };

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

    const handleOpenDialogConfirmDeleteRow = () => {
        setOpenDialogDeleteRow(true);
    }
    const deleteRow = (value) => {
        if(value === true && selectedRowId.length === 1){
            const idToDelete = selectedRowId[0];
            axios.delete(`/irsa/avantageNature/${idToDelete}`)
                .then(res => {
                    if(res.data && res.data.state){
                        setRows(rows.filter((row) => row.id !== idToDelete));
                        setEditRow(null);
                        setNewRow(null);
                        setRowModesModel({});
                        setSelectedRowId([]);
                        setDisableSaveBouton(true);
                        setDisableModifyBouton(true);
                        setDisableCancelBouton(true);
                        setDisableDeleteBouton(true);
                        toast.success(res.data.msg || 'Avantage en nature supprimé');
                        setOpenDialogDeleteRow(false); 
                    }else{
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

    const processRowUpdate = (updatedRow) => {
        if(editRow){
            setEditRow(updatedRow);
        } else if(newRow){
            setNewRow(updatedRow);
        }
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    return (
        <Paper sx={{elevation: "3", margin:"5px", padding:"10px", width:"98%", height:"110%"}}>
            <Stack width={"100%"} height={"30px"} spacing={1} alignItems={"center"} alignContent={"center"} direction={"column"} style={{marginLeft:"0px", marginTop:"20px", justifyContent:"right"}}>
                <Stack width={"100%"} height={"30px"} spacing={1} alignItems={"center"} alignContent={"center"} direction={"row"} justifyContent={"right"}>
                    <Tooltip title="Ajouter une ligne">
                        <span>
                            <IconButton variant="contained" onClick={handleOpenDialogAddNew} style={{width:"35px", height:'35px', borderRadius:"2px", borderColor: "transparent", backgroundColor: '#1976d2', textTransform: 'none', outline: 'none'}}>
                                <TbPlaylistAdd style={{width:'25px', height:'25px', color:'white'}}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Modifier la ligne sélectionnée">
                        <span>
                            <IconButton disabled={disableModifyBouton} variant="contained" onClick={handleEditClick(selectedRowId)} style={{width:"35px", height:'35px', borderRadius:"2px", borderColor: "transparent", backgroundColor: '#1976d2', textTransform: 'none', outline: 'none'}}>
                                <FaRegPenToSquare style={{width:'25px', height:'25px', color:'white'}}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Sauvegarder les modifications">
                        <span>
                            <IconButton disabled={disableSaveBouton} variant="contained" onClick={handleSaveClick(selectedRowId)} style={{width:"35px", height:'35px', borderRadius:"2px", borderColor: "transparent", backgroundColor: '#1976d2', textTransform: 'none', outline: 'none'}}>
                                <TfiSave style={{width:'50px', height:'50px',color: 'white'}}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Annuler les modifications">
                        <span>
                            <IconButton disabled={disableCancelBouton} variant="contained" onClick={handleCancelClick(selectedRowId)} style={{width:"35px", height:'35px', borderRadius:"2px", borderColor: "transparent", backgroundColor: '#d32f2f', textTransform: 'none', outline: 'none'}}>
                                <VscClose style={{width:'50px', height:'50px', color: 'white'}}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Supprimer la ligne sélectionnée">
                        <span>
                            <IconButton disabled={disableDeleteBouton} onClick={handleOpenDialogConfirmDeleteRow} variant="contained" style={{width:"35px", height:'35px', borderRadius:"2px", borderColor: "transparent", backgroundColor: '#d32f2f', textTransform: 'none', outline: 'none'}}>
                                <IoMdTrash style={{width:'50px', height:'50px',color: 'white'}}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
                <Stack width={"100%"} height={'100%'} minHeight={'600px'}>
                    <DataGrid
                        rows={rows}
                        columns={avantageNatureColumns}
                        autoHeight
                        pageSizeOptions={[5, 10, 20, 50, 100]}
                        disableMultipleSelection = {DataGridStyle.disableMultipleSelection}
                        disableColumnSelector = {DataGridStyle.disableColumnSelector}
                        disableDensitySelector = {DataGridStyle.disableDensitySelector}
                        disableRowSelectionOnClick
                        disableSelectionOnClick={true}
                        localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                        slots={{toolbar : QuickFilter}}
                        sx={ DataGridStyle.sx}
                        rowHeight= {DataGridStyle.rowHeight}
                        columnHeaderHeight= {DataGridStyle.columnHeaderHeight}
                        editMode='row'
                        onRowSelectionModelChange={ids => { saveSelectedRow(ids); }}
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={handleRowModesModelChange}
                        processRowUpdate={processRowUpdate}
                        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 100 } } }}
                        experimentalFeatures={{ newEditingApi: true }}
                        pagination={DataGridStyle.pagination}
                        checkboxSelection = {DataGridStyle.checkboxSelection}
                        columnVisibilityModel={{ id: false }}
                    />
                </Stack>
            </Stack>
        </Paper>
    );
}