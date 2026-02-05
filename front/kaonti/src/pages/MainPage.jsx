import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Stack, Menu, MenuItem, Divider, Button } from '@mui/material';
import { init } from '../../init';
import { Outlet } from 'react-router-dom';
import useLogout from '../hooks/useLogout';
import { BsEscape } from "react-icons/bs";
import { TbPasswordUser } from "react-icons/tb";
import humburgerMenu from '../components/humburgerMenu/menuContent';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from "react-router-dom";
import { MdAccountBox } from "react-icons/md";
import { RiAccountBoxLine } from "react-icons/ri";
import axios from '../../config/axios';
import PopupDisconnectCompte from '../components/menuComponent/Compte/PopupDisconnectCompte';
import PopupPasswordChange from '../components/menuComponent/Compte/PopupPasswordChange';

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
        color: init[0].text_theme,
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

  const roles = decoded.UserInfo.roles;
  const compteId = decoded.UserInfo.compteId || null;
  const userId = decoded.UserInfo.userId || null;
  const comptename = decoded.UserInfo.compte || null;

  const [isButtonAddVisible, setIsButtonAddVisible] = useState(false);
  const [isButtonRolePermissionVisible, setIsButtonRolePermissionVisible] = useState(false);
  const [isOpenPopupDisconnect, setIsOpenPopupDisconnect] = useState(false);
  const [isOpenPopupChangePassword, setOpenPopupChangePassword] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [listePortefeuille, setListePortefeuille] = useState([]);
  const [listeDossier, setListeDossier] = useState([]);
  const [listeRoles, setListeRoles] = useState([]);
  const [consolidation, setConsolidation] = useState([]);
  let idDossier = null;
  if (typeof window !== 'undefined') {
    idDossier = sessionStorage.getItem("fileId");
  }

  const navigate = useNavigate();
  let initial = init[0];

  const [anchorEl, setAnchorEl] = useState();
  const [adminAnchorEl, setAdminAnchorEl] = useState(null);
  const [paramAnchorEl, setParamAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const closeHeaderSubMenus = () => {
    setAdminAnchorEl(null);
    setParamAnchorEl(null);
  };

  const adminTraitementList = useMemo(() => (
    [
      { text: 'Saisie', name: 'saisie', path: '/tab/administration/saisie', urldynamic: true },
      { text: 'Consultation', name: 'consultation', path: '/tab/administration/consultation', urldynamic: true },
    ]
  ), []);

  const adminImportList = useMemo(() => (
    [
      { text: 'Journal comptable', name: 'journalComptable', path: '/tab/administration/importJournal', urldynamic: true },
    ]
  ), []);

  const adminExportList = useMemo(() => (
    [
      { text: 'Balance', name: 'balance', path: '/tab/administration/exportBalance', urldynamic: true },
      { text: 'Grand livre', name: 'grandLivre', path: '/tab/administration/exportGrandLivre', urldynamic: true },
      { text: 'Journal comptable', name: 'journalComptable', path: '/tab/administration/exportJournal', urldynamic: true },
    ]
  ), []);

  const paramComptaList = useMemo(() => (
    [
      { text: 'Analytique', name: 'analytique', path: '/tab/parametrages/paramAnalytique', urldynamic: true },
      { text: 'Code journaux', name: 'codejournaux', path: '/tab/parametrages/paramCodeJournal', urldynamic: true },
      { text: 'CRM', name: 'crm', path: '/tab/parametrages/paramCrm', urldynamic: true },
      { text: 'Devises', name: 'devises', path: '/tab/parametrages/paramDevise', urldynamic: true },
      { text: 'Exercices', name: 'exercices', path: '/tab/parametrages/paramExercice', urldynamic: true },
      { text: 'Plan comptable', name: 'planComptable', path: '/tab/parametrages/paramPlanComptable', urldynamic: true },
      { text: 'Plan comptable - modèle', name: 'planComptableModele', path: '/tab/parametrages/paramPlanComptableModele', urldynamic: false },
    ]
  ), []);

  const openAdminMenu = (el) => {
    if (adminAnchorEl === el) return;
    setParamAnchorEl(null);
    setAdminAnchorEl(el);
  };

  const openParamMenu = (el) => {
    if (paramAnchorEl === el) return;
    setAdminAnchorEl(null);
    setParamAnchorEl(el);
  };

  const navigateToMenuItem = (item) => {
    closeHeaderSubMenus();
    if (item?.urldynamic) {
      navigate(`${item.path}/${idDossier}`);
    } else {
      navigate(item.path);
    }
    setActiveMenu(item.path);
  };

  const handleTopNavClick = (item) => {
    closeHeaderSubMenus();
    if (item?.subMenu) return;
    if (item?.urlDynamic) {
      navigate(`${item.path}/${idDossier}`);
    } else {
      navigate(item.path);
    }
    setActiveMenu(item.path);
  };

  const GetInfosIdDossier = (id) => {
    axios.get(`/home/FileInfos/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setConsolidation(resData.fileInfos[0].consolidation);
      } else {
        setConsolidation(false);
      }
    });
  };

  //Fonction de deconnexion--------------------------------------------
  const logout = useLogout();

  const disconnect = async () => {
    await logout();
    navigate("/");
  }

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
  // Déclarations désactivées: on ne les affiche plus dans le menu.
  const MenuSide = humburgerMenu.filter(item => item.name !== 'declaration');

  const setShowPopupDisconnect = (value) => {
    setIsOpenPopupDisconnect(value);
  }

  const setShowPopupChangePassword = (value) => {
    setOpenPopupChangePassword(value);
  }

  // Charger la liste des portefeuille
  const getAllPortefeuille = () => {
    axios.get(`/param/portefeuille/getAllPortefeuille/${compteId}`)
      .then(response => {
        const resData = response?.data;
        if (resData?.state) {
          setListePortefeuille(resData?.list)
        } else {
          toast.error(resData?.message);
        }
      })
  };

  // Charger la liste des dossier liés au compte
  const getAllDossierByCompte = () => {
    axios.get(`/home/getAllDossierByCompte/${compteId}`)
      .then(response => {
        const resData = response?.data;
        if (resData?.state) {
          setListeDossier(resData?.fileList);
        } else {
          toast.error(resData?.message);
        }
      })
  }

  // Récupérer la liste des roles
  const getAllRoles = () => {
    axios.get('sous-compte/getAllRoles')
      .then(response => {
        const resData = response?.data;
        setListeRoles(resData);
      })
  }

  const handleNavigateToRolePermission = () => {
    const currentPath = window.location.pathname;

    if (currentPath === '/tab/parametrages/role-permission') {
      return;
    }

    const url = window.location.origin + '/tab/parametrages/role-permission';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if ([5150, 3355].includes(roles)) {
      setIsButtonAddVisible(true);
      setIsButtonRolePermissionVisible(true);
    }
  }, [roles])

  useEffect(() => {
    getAllPortefeuille();
    getAllDossierByCompte();
    getAllRoles();
  }, [compteId]);

  useEffect(() => {
    GetInfosIdDossier(idDossier);
  }, [idDossier]);

  return (
    <>
      {
        isOpenPopupDisconnect && (
          <PopupDisconnectCompte open={isOpenPopupDisconnect} handleClose={() => setShowPopupDisconnect(false)} handleDisconnect={disconnect} />
        )
      }

      {
        isOpenPopupChangePassword && (
          <PopupPasswordChange open={isOpenPopupChangePassword} onClose={() => setShowPopupChangePassword(false)} id_compte={userId} />
        )
      }

      <Box
        sx={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          overflowX: "hidden",
          overflowY: "auto"
        }}
      >
        <CssBaseline />
        <MuiAppBar
          position="fixed"
          elevation={0}
          sx={{
            height: "80px",
            boxShadow: 'none',
            borderBottom: 'none',
            backgroundImage: 'linear-gradient(90deg, #064E3B 0%, #0F766E 45%, #0B1220 100%)',
            backgroundColor: 'transparent',
          }}
        >
          <Toolbar
            variant="dense"
            sx={{
              minHeight: '80px',
              alignItems: 'center',
              px: 2,
            }}
          >
            <Stack direction={'row'} alignItems={'center'} sx={{ width: "100%" }}>
              <Stack direction={'row'} alignItems={'center'} sx={{ minWidth: 140 }}>
                <img
                  src="/src/img/30.png"
                  alt="Logo Check Up Data"
                  style={{ width: '60px', height: '60px' }}
                />
              </Stack>

              <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} sx={{ flexGrow: 1 }}>
                <Stack direction={'row'} alignItems={'center'} spacing={4}>
                  {MenuSide.map((item) => (
                    <Button
                      key={item.name}
                      onClick={() => handleTopNavClick(item)}
                      onMouseEnter={(e) => {
                        if (item.name === 'administration') {
                          openAdminMenu(e.currentTarget);
                        } else if (item.name === 'parametrages') {
                          openParamMenu(e.currentTarget);
                        } else {
                          closeHeaderSubMenus();
                        }
                      }}
                      disableRipple
                      disableFocusRipple
                      sx={{
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: location.pathname.startsWith(item.path) ? 700 : 500,
                        opacity: location.pathname.startsWith(item.path) ? 1 : 0.9,
                        outline: 'none',
                        boxShadow: 'none',
                        '&:focus': { outline: 'none' },
                        '&.Mui-focusVisible': { outline: 'none' },
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.10)',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Stack>

                <Menu
                  anchorEl={adminAnchorEl}
                  open={Boolean(adminAnchorEl)}
                  onClose={() => setAdminAnchorEl(null)}
                  MenuListProps={{
                    onMouseLeave: () => setAdminAnchorEl(null)
                  }}
                  disableScrollLock
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  slotProps={{
                    paper: {
                      sx: { mt: 1, borderRadius: 2, minWidth: 260 }
                    }
                  }}
                >
                  <MenuItem disabled><Typography fontWeight={700}>Traitement</Typography></MenuItem>
                  {adminTraitementList.map((it) => (
                    <MenuItem key={`t-${it.name}`} onClick={() => navigateToMenuItem(it)}>{it.text}</MenuItem>
                  ))}
                  <Divider sx={{ my: 0 }} />
                  <MenuItem disabled><Typography fontWeight={700}>Import</Typography></MenuItem>
                  {adminImportList.map((it) => (
                    <MenuItem key={`i-${it.name}`} onClick={() => navigateToMenuItem(it)}>{it.text}</MenuItem>
                  ))}
                  <Divider sx={{ my: 0 }} />
                  <MenuItem disabled><Typography fontWeight={700}>Export</Typography></MenuItem>
                  {adminExportList.map((it) => (
                    <MenuItem key={`e-${it.name}`} onClick={() => navigateToMenuItem(it)}>{it.text}</MenuItem>
                  ))}
                </Menu>

                <Menu
                  anchorEl={paramAnchorEl}
                  open={Boolean(paramAnchorEl)}
                  onClose={() => setParamAnchorEl(null)}
                  MenuListProps={{
                    onMouseLeave: () => setParamAnchorEl(null)
                  }}
                  disableScrollLock
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  slotProps={{
                    paper: {
                      sx: { mt: 1, borderRadius: 2, minWidth: 260 }
                    }
                  }}
                >
                  {paramComptaList.map((it) => (
                    <MenuItem key={it.name} onClick={() => navigateToMenuItem(it)}>{it.text}</MenuItem>
                  ))}
                </Menu>
              </Stack>

              <Stack direction={'row'} alignItems={'center'} sx={{ minWidth: 140, justifyContent: 'flex-end' }}>
                <IconButton
                  size="40"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  disableRipple
                  disableFocusRipple
                  color="inherit"
                  style={{ textTransform: 'none', outline: 'none' }}
                  sx={{
                    p: 0,
                    boxShadow: 'none',
                    outline: 'none',
                    '&:focus': { outline: 'none' },
                    '&:focus-visible': { outline: 'none', boxShadow: 'none' },
                    '&.Mui-focusVisible': { outline: 'none', boxShadow: 'none' },
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
                      backgroundColor: initial.menu_theme,
                      border: "1px solid rgba(17, 24, 39, 0.2)",
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
                  <MenuItem disabled>
                    <Stack direction={"row"} alignItems={'center'} alignContent={'center'}>
                      <IconButton
                        style={{ color: initial.button_exit_color, borderRadius: "50px", borderColor: "transparent", backgroundColor: 'transparent' }}
                        aria-label="close"
                      >
                        <MdAccountBox style={{ width: "20px", height: "20px", color: "gray" }} />
                      </IconButton>
                      <Stack>
                        <Typography fontWeight={700}>{decoded?.UserInfo?.username || 'Kaonty'}</Typography>
                        <Typography variant="body2">{comptename || ''}</Typography>
                      </Stack>
                    </Stack>
                  </MenuItem>
                  <Divider sx={{ my: 0 }} />
                  <MenuItem onClick={() => { handleClose(); setOpenPopupChangePassword(true) }} >
                    <Stack direction={"row"} alignItems={'center'} alignContent={'left'}>
                      <IconButton
                        style={{ color: initial.button_exit_color, borderRadius: "50px", borderColor: "transparent", backgroundColor: 'transparent', marginLeft: "-5px" }}
                        aria-label="close"
                      >
                        <TbPasswordUser style={{ width: "25px", height: "25px", color: "gray" }} />
                      </IconButton>
                      <Typography>Nouveau mot de passe</Typography>
                    </Stack>
                  </MenuItem>
                  {
                    isButtonRolePermissionVisible && (
                      <MenuItem onClick={() => { handleClose(); handleNavigateToRolePermission() }}>
                        <Stack direction={"row"} alignItems={'center'} alignContent={'center'}>
                          <IconButton
                            style={{ color: initial.button_exit_color, borderRadius: "50px", borderColor: "transparent", backgroundColor: 'transparent' }}
                            aria-label="close"
                          >
                            <RiAccountBoxLine style={{ width: "20px", height: "20px", color: "gray" }} />
                          </IconButton>
                          <Typography>Gestion de compte</Typography>
                        </Stack>
                      </MenuItem>
                    )
                  }
                  <Divider sx={{ my: 0 }} />
                  <MenuItem onClick={() => { handleClose(); setShowPopupDisconnect(true) }}>
                    <Stack direction={"row"} alignItems={'center'} alignContent={'center'}>
                      <IconButton
                        style={{ color: initial.button_exit_color, borderRadius: "50px", borderColor: "transparent", backgroundColor: 'transparent' }}
                        aria-label="close"
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
        </MuiAppBar>

        {/* SOUS MENU */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            marginRight: 0,
            marginTop: 10
          }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              marginBottom: 0,
              marginLeft: 10,
              zIndex: 1,
            }}
          >
            <Box sx={{ position: 'relative' }}>
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
    </>
  );
}