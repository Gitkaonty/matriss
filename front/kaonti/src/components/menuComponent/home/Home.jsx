import React, { useEffect, useState } from 'react';
import { Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import { init } from '../../../../init';
import toast from 'react-hot-toast';
import { DataGrid, frFR } from '@mui/x-data-grid';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import AddNewFile from './Home_addNewFile';
import { IoMdTrash } from 'react-icons/io';
import { AiOutlineFileAdd } from "react-icons/ai";
import { DataGridStyle } from '../../componentsTools/DatagridToolsStyle';
import useAuth from '../../../hooks/useAuth';
import axios from '../../../../config/axios';
import { jwtDecode } from 'jwt-decode';
import PopupConfirmDelete from '../../componentsTools/popupConfirmDelete';
import { useNavigate } from 'react-router-dom';
import { FcFile } from "react-icons/fc";
import useFileInfos from '../../../hooks/useFileInfos';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

export default function Home() {
  const navigate = useNavigate();

  let initial = init[0];
  const serverUrl = `${initial.REACT_APP_API_URL}:${initial.REACT_APP_API_PORT}`;
  let [listeDossier, setListeDossier] = useState([]);
  let [finalListeDossier, setFinalListeDossier] = useState([]);
  let [findText, setFindText] = useState('');
  const [openDialogDeleteDossier, setOpenDialogDeleteDossier] = useState(false);
  const [selectedDossierRow, setSelectedDossierRow] = useState([]);
  const { setIdDossier, setNomDossier } = useFileInfos();

  //récupération des informations de connexion
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const compteId = decoded.UserInfo.compteId || null;
  const userId = decoded.UserInfo.userId || null;

  //entête tableau liste dossier
  //const tableheader = Home_column.columnHeader;

  const selectFile = (row) => {
    const id = row.id;
    setIdDossier(id);
    setNomDossier(row.dossier);
    navigate(`/tab/dashboard/${id}`);
    sessionStorage.setItem("fileId", id);
  }

  const tableheader = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'number',
      sortable: true,
      width: 70,
      headerAlign: 'right',
      headerClassName: 'HeaderbackColor'
    },
    {
      field: 'none',
      headerName: "",
      type: 'string',
      sortable: true,
      width: 40,
      headerAlign: 'center',
      headerClassName: 'HeaderbackColor',
      renderCell: (params) => {
        return (
          <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <FcFile style={{ color: '#FF9A00', width: 25, height: 25 }} />
          </Stack>
        )
      }
    },
    {
      field: 'dossier',
      headerName: "Dossier",
      type: 'string',
      sortable: true,
      width: 300,
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor',
      renderCell: (params) => {
        return (
          <span
            style={{ cursor: 'pointer', width: '100%' }}
            onClick={() => selectFile(params.row)}
          >
            {params.row.dossier}
          </span>
        );
      }
    },
    {
      field: 'nif',
      headerName: "Nif",
      type: 'string',
      sortable: true,
      width: 200,
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor'
    },
    {
      field: 'stat',
      headerName: "N° statistique",
      type: 'string',
      sortable: true,
      width: 200,
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor'
    },
    {
      field: 'responsable',
      headerName: "Résponsable",
      type: 'string',
      sortable: true,
      width: 200,
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor'
    },
    {
      field: 'expertcomptable',
      headerName: "Expert comptable",
      type: 'string',
      sortable: true,
      width: 200,
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor'
    },
    {
      field: 'cac',
      headerName: "Cac",
      type: 'string',
      sortable: true,
      width: 200,
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor'
    }
  ];

  //Chargement des données dans datagrid
  const GetListeDossier = () => {
    axios.get(`/home/file/${compteId}`).then((response) => {
      const resData = response.data;
      setListeDossier(resData.fileList);
      setFinalListeDossier(resData.fileList);
    })
  }

  useEffect(() => {
    GetListeDossier();
  }, [compteId]);

  //Filtrer la liste des dossiers
  const HandleFindClick = () => {
    if (findText === '') {
      setFinalListeDossier(listeDossier);
    } else {
      const filtered = listeDossier.filter(dossier => dossier.dossier.includes(findText));
      setFinalListeDossier(filtered);
    }
  }

  //Restaurer la liste des dossiers si le champ de filtre est vide
  const handleChangeFindText = (e) => {
    setFindText(e.target.value)
    if (e.target.value === '') {
      setFinalListeDossier(listeDossier);
    }
  }

  //Gestion fenetre modale de création d'un nouveau dossier
  const [open, setOpen] = React.useState(false);

  const handleDialogClickOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleCloseAfterNewFileCreation = (value) => {
    setOpen(value);
    GetListeDossier();
  }

  //supprimer un dossier
  const handleOpenDialogConfirmDeleteDossier = () => {
    setOpenDialogDeleteDossier(true);
  }

  const deleteDossier = (value) => {
    if (value) {
      if (selectedDossierRow.length > 1 || selectedDossierRow.length === 0) {
        toast.error("Veuillez sélectionner seulement un dossier.");
        setOpenDialogDeleteDossier(false);
      } else {
        const id_dossier = selectedDossierRow[0];
        axios.post(`/home/deleteFile`, { id_dossier }).then((response) => {
          const resData = response.data;
          if (resData.state) {
            toast.success(resData.msg);
            GetListeDossier();
          } else {
            toast.error(resData.msg);
          }
          setOpenDialogDeleteDossier(false);
        });
      }
    } else {
      setOpenDialogDeleteDossier(false);
    }
  }

  const saveSelectedRow = (ids) => {
    setSelectedDossierRow(ids);
  }

  return (
    <Paper sx={{ elevation: "3", margin: "5px", padding: "20px", width: "100%", height: "87%" }}>

      {open ?
        <Dialog
          fullScreen
          open={true}
          onClose={handleDialogClose}
          TransitionComponent={Transition}
        >
          <AppBar sx={{ position: 'relative' }} style={{ backgroundColor: initial.theme }}>
            <Toolbar style={{ backgroundColor: initial.theme }}>

              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Création d'un nouveau dossier
              </Typography>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleDialogClose}
                aria-label="close"
                style={{ backgroundColor: 'red' }}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <AddNewFile confirmationState={handleCloseAfterNewFileCreation} />
        </Dialog>

        : null
      }

      {/* MODAL POUR LA SUPPRESSION D'UN DOSSIER */}
      {openDialogDeleteDossier ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer le dossier sélectionné ?"} confirmationState={deleteDossier} /> : null}

      <Stack width={"100%"} height={"100%"} spacing={1} alignItems={"start"}
        justifyContent={"stretch"} alignContent={"flex-start"}>
        <Typography variant='h6' sx={{ color: "black" }} align='left'>Home</Typography>

        <Stack width={"100%"} height={"10%"} spacing={1} alignItems={"center"} direction={"row"}>
          <Stack alignItems={"center"} width={"100%"} spacing={1} direction={"row"}>
            <TextField style={{ width: "400px" }}
              onChange={handleChangeFindText}
              id="input-with-icon-textfield"
              label=""
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "black" }} />
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />
            <Button onClick={HandleFindClick} variant="contained" style={{ height: "35px" }}>Chercher</Button>
          </Stack>

          <Stack
            alignItems={"center"}
            alignContent={"center"}
            width={"300px"}
            justifyContent={"right"}
            paddingRight={"0px"}
            direction={"row"}
            spacing={0.5}
          >
            <Tooltip title="Ajouter un nouveau dossier">
              <IconButton
                onClick={handleDialogClickOpen}
                variant="contained"
                style={{
                  width: "35px", height: '35px', borderRadius: "5px",
                  borderColor: "transparent", backgroundColor: initial.theme,
                  textTransform: 'none', outline: 'none'
                }}
              >
                <AiOutlineFileAdd style={{ width: '25px', height: '25px', color: 'white' }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Supprimer le dossier">
              <span>
                <IconButton
                  onClick={handleOpenDialogConfirmDeleteDossier}
                  variant="contained"
                  style={{
                    width: "35px", height: '35px', borderRadius: "5px",
                    borderColor: "transparent", backgroundColor: initial.button_delete_color,
                    textTransform: 'none', outline: 'none'
                  }}
                >
                  <IoMdTrash style={{ width: '40px', height: '40px', color: 'white' }} />
                </IconButton>
              </span>
            </Tooltip>

          </Stack>
        </Stack>

        <Stack width={"100%"} height={"80%"} spacing={1} alignItems={"flex-start"} direction={"row"}>
          <DataGrid
            disableMultipleSelection={DataGridStyle.disableMultipleSelection}
            disableColumnSelector={DataGridStyle.disableColumnSelector}
            disableDensitySelector={DataGridStyle.disableDensitySelector}
            disableRowSelectionOnClick
            disableSelectionOnClick={true}
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
            //slots={{toolbar : QuickFilter}}
            sx={DataGridStyle.sx}
            rowHeight={DataGridStyle.rowHeight}
            columnHeaderHeight={DataGridStyle.columnHeaderHeight}
            rows={finalListeDossier}
            columns={tableheader}
            onRowSelectionModelChange={ids => {
              saveSelectedRow(ids);
            }}
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
          />
        </Stack>
      </Stack>
    </Paper>
  )
};