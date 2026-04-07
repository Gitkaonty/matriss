import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, AppBar, Toolbar, Stack, Button,
  GlobalStyles, IconButton, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Checkbox, ListSubheader, ListItem, ListItemIcon, ListItemText, Divider, Tooltip
} from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import toast from 'react-hot-toast';

// Icônes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/GridView';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import FolderIcon from '@mui/icons-material/FolderOpenOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import CloseIcon from '@mui/icons-material/Close';

// Imports fonctionnels
import { init } from '../../../../init';
import { DataGridStyle } from '../../componentsTools/DatagridToolsStyle';
import useAuth from '../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import PopupConfirmDelete from '../../componentsTools/popupConfirmDelete';
import { useNavigate } from 'react-router-dom';
import { FcFile } from "react-icons/fc";
import useFileInfos from '../../../hooks/useFileInfos';
import usePermission from '../../../hooks/usePermission';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import PopupConfirmPasswordDossier from '../../componentsTools/Dossier/PopupConfirmPasswordDossier';
import AddNewFile from './Home_addNewFile';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';

const Home = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { canAdd, canModify, canDelete, canView } = usePermission();
  const { setIdDossier, setNomDossier } = useFileInfos();

  // États pour les données
  const [isHovered, setIsHovered] = useState(false);
  const [listeDossier, setListeDossier] = useState([]);
  const [finalListeDossier, setFinalListeDossier] = useState([]);
  const [findText, setFindText] = useState('');
  const [selectedIdDossier, setSelectedIdDossier] = useState(null);
  const [openDialogDeleteDossier, setOpenDialogDeleteDossier] = useState(false);
  const [selectedDossierRow, setSelectedDossierRow] = useState([]);
  const [showPopupConfirmPassword, setShowPopupConfirmPassword] = useState(false);
  const [open, setOpen] = useState(false);

  // Infos utilisateur
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const compteId = decoded.UserInfo.compteId || null;
  const userId = decoded.UserInfo.userId || null;
  let initial = init[0];

  // Timeout pour le menu
  const timeoutRef = React.useRef(null);

  // Gestionnaires du menu
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 350);
  };

  const handleMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMenuMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 350);
  };

  // Fonctions de Home
  const GetListeDossier = () => {
    axios.get(`/home/file/${compteId}`, { params: { userId: userId } }).then((response) => {
      const resData = response.data;
      setListeDossier(resData.fileList);
      canView ? setFinalListeDossier(resData.fileList) : setFinalListeDossier([]);
    });
  };

  const handleChangeFindText = (e) => {
    setFindText(e.target.value);
    if (e.target.value === '') {
      setFinalListeDossier(listeDossier);  // Si vide : montre tout
    } else {
      const filterValue = e.target.value.toLowerCase();
      const filtered = listeDossier.filter(dossier =>
        dossier.dossier.toLowerCase().includes(filterValue)  // Filtre automatique
      );
      setFinalListeDossier(filtered);
    }
  };
  const HandleFindClick = () => {
    if (findText.trim() === '') {
      setFinalListeDossier(listeDossier);
    } else {
      const filterValue = findText.toLowerCase();
      const filtered = listeDossier.filter(dossier =>
        dossier.dossier.toLowerCase().includes(filterValue)
      );
      setFinalListeDossier(filtered);
    }
  };

  const handleDeleteText = () => {
    setFindText("");
    setFinalListeDossier(listeDossier);
  };

  const handleDialogClickOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleCloseAfterNewFileCreation = (value) => {
    setOpen(value);
    GetListeDossier();
  };

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
  };

  const selectFile = (row) => {
    const id = row.id;
    const avecMotDePasse = row.avecmotdepasse;
    if (avecMotDePasse) {
      setSelectedIdDossier(id);
      setShowPopupConfirmPassword(true);
    } else {
      axios.post('/home/deleteDossierPasswordAccess', { user_id: userId });
      setIdDossier(id);
      setNomDossier(row.dossier);
      navigate(`/tab/dashboard/${id}`);
      sessionStorage.setItem("fileId", id);
    }
  };

  const handleClosePopupConfirmPassword = () => {
    setShowPopupConfirmPassword(false);
    setSelectedIdDossier(null);
  };

  // Colonnes du DataGrid
  const tableheader = [
    {
      field: 'none',
      headerName: "",
      type: 'string',
      width: 1,
      sortable: false,
      headerAlign: 'center',
      headerClassName: 'HeaderbackColor',
      renderCell: (params) => {
        return (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 0, bgcolor: '#F0FDF4', borderRadius: '10px', display: 'flex' }}>
              <FolderIcon sx={{ color: '#10B981', fontSize: 20 }} />
            </Box>
          </Stack>
        );
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
          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: '#1E293B',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onClick={() => selectFile(params.row)}
            >
              {params.row.dossier}
            </Typography>
          </Stack>
        );
      }
    },
    {
      field: 'portefeuille',
      headerName: "Portefeuille",
      type: 'string',
      sortable: true,
      width: 200,
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor',
      renderCell: (params) => {
        return (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
            <Typography
              sx={{
                fontWeight: 500,
                color: '#64748B',
                fontSize: '14px'
              }}
            >
              {params.row.portefeuille}
            </Typography>
          </Stack>
        );
      }
    },
    {
      field: 'responsable',
      headerName: "Responsable",
      type: 'string',
      sortable: true,
      width: 200,
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor',
      renderCell: (params) => {
        return (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
            <Typography
              sx={{
                fontWeight: 500,
                color: '#64748B',
                fontSize: '14px'
              }}
            >
              {params.row.responsable}
            </Typography>
          </Stack>
        );
      }
    },
    {
      field: 'supprimer',
      headerName: "Supprimer",
      type: 'string',
      sortable: false,
      width: 100,
      headerAlign: 'center',
      headerClassName: 'HeaderbackColor',
      renderCell: (params) => {
        return (
          <Tooltip title="Supprimer définitivement" arrow>
            <IconButton
              size="small"
              disabled={!canDelete || selectedDossierRow.length > 1 || selectedDossierRow.length === 0}
              onClick={handleOpenDialogConfirmDeleteDossier}
              sx={{
                color: '#CBD5E1',
                transition: '0.2s',
                '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2', transform: 'rotate(10deg)' },
                '&.Mui-disabled': { color: '#dadadaff', cursor: 'not-allowed' }
              }}
            >
              <DeleteIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
        );
      }
    },
  ];

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      if (compteId && userId) {
        try {
          const response = await axios.get(`/home/file/${compteId}`, { params: { userId } });
          const resData = response.data;
          setListeDossier(resData.fileList);
          canView ? setFinalListeDossier(resData.fileList) : setFinalListeDossier([]);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchData();
  }, [compteId, userId, canView]);

  return (
    <>
      {/* MODAL POUR LA SUPPRESSION D'UN DOSSIER */}
      {
        openDialogDeleteDossier && canDelete
          ?
          <PopupConfirmDelete
            msg={"Voulez-vous vraiment supprimer le dossier sélectionné ?"}
            confirmationState={deleteDossier}
          />
          :
          null
      }
      {
        showPopupConfirmPassword && (
          <PopupConfirmPasswordDossier
            onClose={handleClosePopupConfirmPassword}
            id_dossier={selectedIdDossier}
          />
        )
      }
      {open ?
        <Dialog
          fullScreen
          open={true}
          onClose={handleDialogClose}
          TransitionComponent={Transition}
        >
          <AppBar sx={{
            position: 'relative',
            height: "80px",
            boxShadow: 'none',
            borderBottom: 'none',
            backgroundImage: 'linear-gradient(90deg, #064E3B 0%, #0F766E 45%, #0B1220 100%)',
            backgroundColor: 'transparent',
          }}>
            <Toolbar sx={{
              height: "80px",
              boxShadow: 'none',
              borderBottom: 'none',
              backgroundImage: 'linear-gradient(90deg, #064E3B 0%, #0F766E 45%, #0B1220 100%)',
              backgroundColor: 'transparent',
            }}>
              <Stack
                sx={{ width: "100%" }}
                direction={'row'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Typography variant="h7" component="div">
                  Création d'un nouveau dossier
                </Typography>
              </Stack>
            </Toolbar>
          </AppBar>
          <AddNewFile confirmationState={handleCloseAfterNewFileCreation} />
        </Dialog>
        : null
      }

      <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
        <GlobalStyles styles={{
          body: { margin: 0, padding: 0, overflowX: 'hidden', backgroundColor: BG_SOFT, fontFamily: 'Arial, sans-serif' },
          '.MuiButtonBase-root': { outline: 'none !important' }
        }} />

        {/* CONTENU */}
        <Box sx={{ p: 3, flexGrow: 1 }}>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E293B', letterSpacing: '-1.5px' }}>
              Home
            </Typography>

            {/* BOUTON AJOUTER */}
            <Tooltip title="Ajouter un nouveau dossier">
              <span>
                <Button
                  disabled={!canAdd}
                  onClick={handleDialogClickOpen}
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    bgcolor: NEON_MINT,
                    color: NAV_DARK,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    mr: 2,
                    px: 3,
                    py: 1,
                    fontSize: '13px',
                    minHeight: '32px',
                    boxShadow: `0 6px 14px -6px ${NEON_MINT}`,
                    transition: '0.3s',

                    '&:hover': {
                      bgcolor: '#00E685',
                      transform: 'translateY(-1px)',
                      boxShadow: `0 8px 18px -6px ${NEON_MINT}`
                    },

                    '&.Mui-disabled': {
                      bgcolor: '#E5E7EB',
                      color: '#9CA3AF',
                    }
                  }}
                >
                  Nouveau Dossier
                </Button>
              </span>
            </Tooltip>
          </Stack>

          {/* FILTRE RAPIDE */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                placeholder="Rechercher par nom..."
                variant="outlined"
                size="small"
                value={findText}
                onChange={handleChangeFindText}
                sx={{
                  width: '320px',

                  // réduit hauteur globale
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    borderRadius: '10px',
                    height: '36px',
                  },

                  //  réduit padding interne
                  '& .MuiOutlinedInput-input': {
                    py: 0.5, // 👈 réduit hauteur texte
                    fontSize: '13px',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <IconButton size="small">
                      {/* optionnel */}
                    </IconButton>
                  )
                }}
              />
            </Stack>
          </Box>

          {/* DATAGRID */}
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              disableMultipleSelection={DataGridStyle.disableMultipleSelection}
              disableColumnSelector={DataGridStyle.disableColumnSelector}
              disableDensitySelector={DataGridStyle.disableDensitySelector}
              disableRowSelectionOnClick
              disableSelectionOnClick={true}
              localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#F8FAFC',
                  color: '#64748B',
                  fontWeight: 800,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  py: 2.5,
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: '#F8FAFC',
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:focus-within': {
                    outline: 'none',
                  },
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 800,
                  color: '#64748B',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                },
                '& .MuiDataGrid-virtualScrollerContent': {
                  width: 'fit-content !important',
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                  },
                  '&:focus': {
                    outline: 'none',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: '#F1F5F9',
                    },
                  },
                },
                '& .MuiDataGrid-cell': {
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:focus-within': {
                    outline: 'none',
                  },
                  borderBottom: '1px solid #F1F5F9',
                },
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                overflow: 'hidden',
                bgcolor: '#fff',
                boxShadow: 'none',
              }}
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
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Home;