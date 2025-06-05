import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Stack, Paper, RadioGroup, FormControlLabel, Radio, FormControl, 
        InputLabel, Select, MenuItem, TextField, Box, Tab, 
        FormHelperText} from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { init } from '../../../init';
import axios from '../../../config/axios';
import toast from 'react-hot-toast';
import { DataGrid, frFR } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
//import ParamPlanComptable_column from './ParamPlanComptable_column';
import { useFormik, Field, Formik, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import QuickFilter from './DatagridToolsStyle';
import { DataGridStyle } from './DatagridToolsStyle';
import { format } from 'date-fns';
import { InfoFileStyle } from './InfosFileStyle';

export const Datagridbase = ({row_id, tableRow}) => {
    const columnHeader = [
        
        {
            field: 'rubriquesmatrix.libelle', 
            headerName: 'Rubriques', 
            type: 'text', 
            sortable : true, 
            width: 720, 
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            // renderCell: (params) => {
                
            //     return (
            //       <span
            //       style={{cursor: 'pointer', width:'100%'}}
            //         onClick={() => sendId(params.row)}
            //       >
            //         {params.value}
            //       </span>
            //     );
            //   }
        },
    ];

    const sendId = (row) => {
        const rowSelectedInfo = tableRow?.filter((item) => item.id === row[0]);
        row_id(rowSelectedInfo[0]?.id_rubrique);
      }

    return (
        <Stack direction={'row'} alignContent={'center'} alignItems={"center"} spacing={1} width={"100%"} height={"95%"}>
            <DataGrid
                disableMultipleSelection = {DataGridStyle.disableMultipleSelection}
                disableColumnSelector = {DataGridStyle.disableColumnSelector}
                disableDensitySelector = {DataGridStyle.disableDensitySelector}
                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                disableRowSelectionOnClick
                disableSelectionOnClick={true}
                slots={{toolbar : QuickFilter}}
                sx={ DataGridStyle.sx}
                rowHeight= {DataGridStyle.rowHeight}
                columnHeaderHeight= {DataGridStyle.columnHeaderHeight}
                onRowSelectionModelChange={ids => {
                    if(ids.length === 1){
                        sendId(ids);
                    }else{
                        sendId([0]);
                    }
                }}
                rows={tableRow}
                columns={columnHeader}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 100 },
                    },
                }}
                pageSizeOptions={[50, 100]}
                pagination={DataGridStyle.pagination}
                checkboxSelection = {DataGridStyle.checkboxSelection}
                columnVisibilityModel={{
                    id: false,
                }}
                />  
        </Stack>
      );
}