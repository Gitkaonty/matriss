import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Stack, Menu, MenuItem, Button, Tooltip, DialogActions } from '@mui/material';
import { init } from '../../init';
import { Outlet } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import useLogout from '../hooks/useLogout';
import { BsEscape } from "react-icons/bs";
import { TbPasswordUser } from "react-icons/tb";
import humburgerMenu from '../components/humburgerMenu/menuContent';
import Administration from '../components/humburgerMenu/subMenu/Administration';
import Declaration from '../components/humburgerMenu/subMenu/Declaration';
import Parametrages from '../components/humburgerMenu/subMenu/Parametrages';
import Revisions from '../components/humburgerMenu/subMenu/Revisions';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from "react-router-dom";
import { MdAccountBox } from "react-icons/md";

const drawerWidth = 240;

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

//Création des composants pour le menu-------------------------------------------------------------------
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const ProfileImage = ({ name }) => {
  const nameParts = name.split(" ");
  const firstNameInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : "";
  const lastNameInitial = nameParts[1] ? nameParts[1][0].toUpperCase() : "";

  return (
    <span
      className="user-profile-image"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        fontSize: "16px",
        lineHeight: "1",
        backgroundColor: "transparent",
      }}
    >
      {firstNameInitial}{lastNameInitial}
    </span>
  );
};


export default function HomePage() {
  //Récupérer les données de l'utilisateur
  const { auth } = useAuth();
  const location = useLocation();

  //paramètres de connexion------------------------------------
  const decoded = auth?.accessToken
    ? jwtDecode(auth.accessToken)
    : undefined
  const compteId = decoded.UserInfo.compteId || 0;

  const [activeMenu, setActiveMenu] = useState("");

  const navigate = useNavigate();
  let initial = init[0];
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    // handleCloseSubMenu(false);
    setActiveMenu("");
  };

  //Choix d'affichage de sous menu----------------------------------------
  const [subMenuState, setSubMenuState] = useState({
    administration: false,
    revision: false,
    declaration: false,
    parametrages: false
  });

  function showSubMenu(name, subMenu, path, urlDynamic) {
    if (!subMenu) {
      setSubMenuState({
        administration: false,
        revision: false,
        declaration: false,
        parametrages: false,
      });

      if (urlDynamic) {
        const idDossier = sessionStorage.getItem('fileId');
        navigate(`${path}/${idDossier}`);
      } else {
        navigate(path);
      }
      setOpen(false);
      setActiveMenu(path);
      return;
    }

    setSubMenuState(prev => {
      const isOpen = !!prev[name];
      const reset = {
        administration: false,
        revision: false,
        declaration: false,
        parametrages: false,
      };

      setActiveMenu(prevActive => (isOpen && prevActive === path ? "" : path));

      return isOpen ? reset : { ...reset, [name]: true };
    });
  }

  const handleCloseSubMenu = (newState) => {
    setSubMenuState({
      administration: newState,
      revision: newState,
      declaration: newState,
      parametrages: newState
    });
  }

  const subMenuPathNavigation = (path) => {
    setSubMenuState({
      administration: false,
      revision: false,
      declaration: false,
      parametrages: false
    });
    navigate(path);
    setOpen(false);
  }

  //Fonction de deconnexion--------------------------------------------
  const logout = useLogout();

  const Disconnect = async () => {
    handleClickCloseDisconnectModal();
    await logout();
    navigate("/");
  }

  const [openDisconnectModal, setOpenDisconnectModal] = useState(false);
  const handleClickOpenDisconnectModal = () => {
    setOpenDisconnectModal(true);
    handleClose();
  };
  const handleClickCloseDisconnectModal = () => {
    setOpenDisconnectModal(false);
  };

  //Fonction de changement de mot de passe--------------------------------------------
  const [openPwdModificationModal, setOpenPwdModificationModal] = useState(false);
  const handleClickOpenPwdModificationModal = () => {
    setOpenPwdModificationModal(true);
    handleClose();
  };
  const handleClickClosePwdModificationModal = () => {
    setOpenPwdModificationModal(false);
  };

  //Creation de la liste du menu-------------------------------------------------
  const MenuSide = humburgerMenu;

  //gestion formulaire pour le change de mot de passe
  const mdpChangeFormikInitialValues = {
    oldPassword: '',
    newPassword: '',
    passwordConfirmation: ''
  };

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Veuillez taper ici votre ancien mot de passe"),
    newPassword: Yup.string().required("Veuillez taper ici votre nouveau mot de passe")
      .min(6, "Le mot de passe doit avoir au moin 6 caractères")
      .max(25, "Le mot de passe ne doit pas dépasser les 25 caractères"),
    passwordConfirmation: Yup.string().required("Veuillez confirmer ici votre nouveau mot de passe")
      .oneOf([Yup.ref("newPassword")], "Les mots de passes ne se correspondent pas"),
  })

  const mdpChangeFormik = useFormik({
    initialValues: mdpChangeFormikInitialValues,
    onSubmit: handleSubmitMdpChangeFormik,
    validationSchema,
  });

  function handleSubmitMdpChangeFormik(formValues, onSubmittingProps) {
    try {
      //console.log(formValues);
      onSubmittingProps.resetForm();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: open ? "100vw" : "97.8vw",
        height: "100vh",
        overflowX: open ? "hidden" : "",
        overflowY: open ? "hidden" : ""
      }}
    >
      <CssBaseline />
      <AppBar position="fixed" open={open} style={{ height: "30px" }}>
        <Toolbar style={{ backgroundColor: "#010122", alignContent: 'flex-start', alignItems: "center" }} variant="dense">

          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
            style={{ textTransform: 'none', outline: 'none' }}
          >
            <ChevronRightIcon style={{ textTransform: 'none', outline: 'none' }} />
          </IconButton>

          <Stack
            direction={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            sx={{ width: "100%" }}
          >
            <Stack direction={"row"} alignContent={"center"} alignItems={"center"} marginLeft={"10px"}>
              <MdAccountBox style={{ width: "40px", height: "40px" }} />
              <Typography
                variant="h4" noWrap component="div"
                style={{
                  height: "35px", width: "100%",
                  fontSize: "16px", textAlign: "center", alignContent: "center"
                }}
              >
                {"Espace client non paramétré"}
              </Typography>
            </Stack>

            <Stack
            >
              <IconButton
                size="40"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                style={{ textTransform: 'none', outline: 'none' }}
                sx={{
                  p: 0,
                }}
              >
                <div
                  className="main"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "lighter",
                    height: "35px",
                    width: "35px",
                    backgroundColor: "#427AA1",
                    borderRadius: "50%",
                    textTransform: 'none',
                    outline: 'none'
                  }}
                >
                  <ProfileImage name={decoded.UserInfo.username || 'Invité'} />
                </div>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableScrollLock={true}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 4
                    }
                  }
                }}
              >
                <MenuItem onClick={handleClickOpenPwdModificationModal} >
                  <Stack direction={"row"} alignItems={'center'} alignContent={'left'}>
                    <IconButton
                      style={{ color: initial.button_exit_color, borderRadius: "50px", borderColor: "transparent", backgroundColor: 'transparent', marginLeft: "-5px" }}
                      aria-label="close"
                      onClick={Disconnect}
                    >
                      <TbPasswordUser style={{ width: "25px", height: "25px", color: "gray" }} />
                    </IconButton>
                    <Typography>Nouveau mot de passe</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem onClick={handleClickOpenDisconnectModal}>
                  <Stack direction={"row"} alignItems={'center'} alignContent={'center'}>
                    <IconButton
                      style={{ color: initial.button_exit_color, borderRadius: "50px", borderColor: "transparent", backgroundColor: 'transparent' }}
                      aria-label="close"
                      onClick={Disconnect}
                    >
                      <BsEscape style={{ width: "20px", height: "20px", color: "gray" }} />
                    </IconButton>
                    <Typography>Déconnexion</Typography>
                  </Stack>
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>

        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        style={{
          marginRight: "-10px"
        }}
        PaperProps={{
          sx: {
            backgroundColor: initial.theme,
            color: "white",
          }
        }}
      >

        <Stack height={"47.5px"} width={"100%"} style={{ backgroundColor: "#010122", paddingLeft: 5 }}>
          <IconButton onClick={handleDrawerClose} style={{ width: "47px", height: "47px", color: "white", textTransform: 'none', outline: 'none' }}>
            {theme.direction === 'rtl' ? <ChevronRightIcon style={{ textTransform: 'none', outline: 'none' }} /> : <ChevronLeftIcon style={{ textTransform: 'none', outline: 'none' }} />}
          </IconButton>
        </Stack>

        <Stack
          sx={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <img
            src="/src/img/Logo Kaonty_2.png"
            alt="Logo Kaonty"
            style={{
              width: '40px',
              height: '40px',
              marginTop: '10px'
            }}
          />
        </Stack>

        <Stack style={{ marginBottom: "5px" }} />

        <List >
          {MenuSide.map(item => (
            <ListItem
              key={item.text}
              onClick={() => showSubMenu(item.name, item.subMenu, item.path, item.urlDynamic)}
            >
              <ListItemButton
                style={{
                  marginLeft: "-12px",
                  marginRight: "-12px",
                  borderRadius: '5px',
                  marginBottom: '-12px',
                  backgroundColor: activeMenu
                    ? activeMenu === item.path
                      ? "rgba(241, 218, 230, 0.3)"
                      : "transparent"
                    : location.pathname.startsWith(item.path)
                      ? "rgba(241, 218, 230, 0.3)"
                      : "transparent",
                }}
              >
                <ListItemIcon>{item.icons}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '15px' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* MODAL POUR LA DECONNEXION======================================================================= */}
      <BootstrapDialog
        onClose={handleClickOpenDisconnectModal}
        aria-labelledby="customized-dialog-title"
        open={openDisconnectModal}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontWeight: 'bold', width: '600px', backgroundColor: initial.normal_pupup_header_color }}>
          Déconnexion
        </DialogTitle>
        <IconButton
          style={{ color: 'red', textTransform: 'none', outline: 'none' }}
          aria-label="close"
          onClick={handleClickCloseDisconnectModal}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>

          <Stack width={"98%"} height={"120px"} spacing={1} alignItems={'center'} alignContent={"center"}
            direction={"column"} justifyContent={"center"} style={{ marginLeft: '10px' }}>
            <Tooltip title="Se déconnecter de l'application">
              <IconButton
                style={{
                  color: initial.button_exit_color, borderRadius: "50px",
                  borderColor: "transparent",
                  textTransform: 'none', outline: 'none'
                }}
                aria-label="close"
                onClick={Disconnect}
              >
                <BsEscape style={{ width: "30px", height: "30px", color: "white" }} />
              </IconButton>
            </Tooltip>
            <Typography>Se déconnecter</Typography>
          </Stack>

        </DialogContent>

      </BootstrapDialog>

      {/* MODAL DE CHANGEMENT DE MOT DE PASSE======================================================================= */}

      <BootstrapDialog
        onClose={handleClickOpenPwdModificationModal}
        aria-labelledby="customized-dialog-title"
        open={openPwdModificationModal}
      >

        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontWeight: 'bold', width: '400px', backgroundColor: initial.theme }}>
          Modification du mot de passe
        </DialogTitle>
        <IconButton
          style={{ color: 'red', textTransform: 'none', outline: 'none' }}
          aria-label="close"
          onClick={handleClickClosePwdModificationModal}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            textTransform: 'none', outline: 'none'
          }}
        >
          <CloseIcon />

        </IconButton>

        <DialogContent dividers>

          <Stack width={"90%"} height={"400px"} spacing={1} alignItems={'left'} alignContent={"left"}
            direction={"column"} justifyContent={"left"} style={{ marginLeft: '30px' }}
          >
            <TextField style={{ width: "300px" }} id="standard-basic1"
              label="Mot de passe actuel" variant="standard" name='oldPassword'
              {...mdpChangeFormik.getFieldProps('oldPassword')}
            />
            {
              mdpChangeFormik.errors.oldPassword && mdpChangeFormik.touched.oldPassword && <span style={{ color: 'red', fontSize: "12px" }}>{mdpChangeFormik.errors.oldPassword}</span>
            }

            <TextField style={{ width: "300px", marginTop: "30px" }}
              id="standard-basic2" label="Nouveau de passe" variant="standard" name='newPassword'
              {...mdpChangeFormik.getFieldProps('newPassword')}
            />
            {
              mdpChangeFormik.errors.newPassword && mdpChangeFormik.touched.newPassword && <span style={{ color: 'red', fontSize: "12px" }}>{mdpChangeFormik.errors.newPassword}</span>
            }

            <Typography variant='h10' style={{ fontSize: "13px", marginLeft: '20px' }}>Le mot de passe doit contenir:</Typography>
            <Typography variant='h10' style={{ fontSize: "13px", marginLeft: '30px', marginTop: "-1px" }}>- entre 8 et 25 caractères</Typography>
            <Typography variant='h10' style={{ fontSize: "13px", marginLeft: '30px', marginTop: "-1px" }}>- minimum 1 lettre majuscule</Typography>
            <Typography variant='h10' style={{ fontSize: "13px", marginLeft: '30px', marginTop: "-1px" }}>- minimum 1 lettre minuscule</Typography>
            <Typography variant='h10' style={{ fontSize: "13px", marginLeft: '30px', marginTop: "-1px" }}>- minimum 1 chiffre</Typography>
            <Typography variant='h10' style={{ fontSize: "13px", marginLeft: '30px', marginTop: "-1px" }}>- minimum 1 caractère spéciaux: _!@#%&"</Typography>

            <TextField style={{ width: "300px" }} id="standard-basic3"
              label="Confirmer mot de passe" variant="standard" name='passwordConfirmation'
              {...mdpChangeFormik.getFieldProps('passwordConfirmation')}
            />
            {
              mdpChangeFormik.errors.passwordConfirmation && mdpChangeFormik.touched.passwordConfirmation && <span style={{ color: 'red', fontSize: "12px" }}>{mdpChangeFormik.errors.passwordConfirmation}</span>
            }

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button autoFocus
            style={{
              backgroundColor: initial.theme, color: 'white', width: "100px",
              textTransform: 'none', outline: 'none'
            }}

            disabled={!mdpChangeFormik.isValid || mdpChangeFormik.isSubmitting}
          >
            Modifier
          </Button>
        </DialogActions>
      </BootstrapDialog>

      {/* SOUS MENU */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          marginRight: open ? 2 : 0
        }}>
        <div
          style={{
            position: "relative",
            width: "100.4%",
            height: "100%",
            marginBottom: 0,
            marginTop: 48,
            marginLeft: 10,
            zIndex: 1,
          }}
        >
          {subMenuState.administration && (
            <Administration
              humburgerMenuState={open}
              onWindowState={handleCloseSubMenu}
              pathToNavigate={subMenuPathNavigation}
              closeDrawer={() => { setOpen(false); setActiveMenu("") }}
            />
          )}
          {subMenuState.revision && (
            <Revisions
              humburgerMenuState={open}
              onWindowState={handleCloseSubMenu}
              pathToNavigate={subMenuPathNavigation}
              closeDrawer={() => { setOpen(false); setActiveMenu("") }}
            />
          )}
          {subMenuState.declaration && (
            <Declaration
              humburgerMenuState={open}
              onWindowState={handleCloseSubMenu}
              pathToNavigate={subMenuPathNavigation}
              closeDrawer={() => { setOpen(false); setActiveMenu("") }}
            />
          )}
          {subMenuState.parametrages && (
            <Parametrages
              humburgerMenuState={open}
              onWindowState={handleCloseSubMenu}
              pathToNavigate={subMenuPathNavigation}
              closeDrawer={() => { setOpen(false); setActiveMenu("") }}
            />
          )}
          <Box sx={{ position: 'relative' }}>
            {open && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '105vh',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  zIndex: 1,
                }}
                onClick={() => setOpen(false)}
              />
            )}
            <Box
              sx={{
                position: 'relative',
                zIndex: 0,
              }}>
              <Outlet />
            </Box>
          </Box>
        </div>
      </Box>
    </Box>
  );
}