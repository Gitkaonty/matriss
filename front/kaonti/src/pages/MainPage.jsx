import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Avatar, AppBar, Toolbar, Stack, Button,
    Grid, Card, LinearProgress, GlobalStyles, List, ListItem,
    ListItemIcon, ListItemText, Divider, IconButton, Chip,
    ListSubheader, FormControl, Select, MenuItem, Menu, Breadcrumbs
} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
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
import PopupTestSelectedFile from '../components/componentsTools/popupTestSelectedFile';
import toast from 'react-hot-toast';

// Icônes
import HomeIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/GridView';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { MdSearch, MdEdit, MdFileUpload, MdFileDownload, MdAnalytics, MdHistory, MdLoop, MdCategory, MdVpnKey, MdContacts, MdCheckCircle, MdMonetizationOn, MdEvent, MdListAlt, MdFolder, MdPercent } from 'react-icons/md';
import KeyIcon from '@mui/icons-material/Key';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';

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

const FinalUserDashboard = () => {
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

    const [isHoveredAdmin, setIsHoveredAdmin] = useState(false);
    const [isHoveredSettings, setIsHoveredSettings] = useState(false);
    const [isHoveredProfile, setIsHoveredProfile] = useState(false);

    const [isButtonAddVisible, setIsButtonAddVisible] = useState(false);
    const [isButtonRolePermissionVisible, setIsButtonRolePermissionVisible] = useState(false);
    const [isOpenPopupDisconnect, setIsOpenPopupDisconnect] = useState(false);
    const [isOpenPopupChangePassword, setOpenPopupChangePassword] = useState(false);
    const [activeMenu, setActiveMenu] = useState("");
    const [listePortefeuille, setListePortefeuille] = useState([]);
    const [listeDossier, setListeDossier] = useState([]);
    const [listeRoles, setListeRoles] = useState([]);
    const [consolidation, setConsolidation] = useState([]);
    const [fileInfos, setFileInfos] = useState(null);
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

    const adminTraitementList = useMemo(() => ([
        { text: 'Consultation', name: 'consultation', path: '/tab/administration/consultation', icon: <MdSearch />, urldynamic: true },
        { text: 'Saisie', name: 'saisie', path: '/tab/administration/saisie', icon: <MdEdit />, urldynamic: true },
        { text: 'Synthese', name: 'synthese', path: '/tab/administration/syntheseAnomalies', icon: <MdAnalytics />, urldynamic: true },

    ]), []);

    const adminImportList = useMemo(() => ([
        { text: 'Journal comptable', name: 'journalComptable', path: '/tab/administration/importJournal', icon: <MdFileUpload />, urldynamic: true },
    ]), []);

    const adminExportList = useMemo(() => ([
        { text: 'Balance', name: 'balance', path: '/tab/administration/exportBalance', icon: <MdFileDownload />, urldynamic: true },
        { text: 'Grand livre', name: 'grandLivre', path: '/tab/administration/exportGrandLivre', icon: <MdFileDownload />, urldynamic: true },
        { text: 'Journal comptable', name: 'journalComptable', path: '/tab/administration/exportJournal', icon: <MdFileDownload />, urldynamic: true },
    ]), []);

    const paramComptaList = useMemo(() => ([
        { text: 'Analytique', icon: <MdCategory />, name: 'analytique', path: '/tab/parametrages/paramAnalytique', urldynamic: true },
        { text: 'Code journaux', icon: <MdVpnKey />, name: 'codejournaux', path: '/tab/parametrages/paramCodeJournal', urldynamic: true },
        { text: 'CRM', icon: <MdContacts />, name: 'crm', path: '/tab/parametrages/paramCrm', urldynamic: true },
        { text: 'Controles', icon: <MdCheckCircle />, name: 'controles', path: '/tab/parametrages/controles', urldynamic: false },
        { text: 'Devises', icon: <MdMonetizationOn />, name: 'devises', path: '/tab/parametrages/paramDevise', urldynamic: true },
        { text: 'Exercices', icon: <MdEvent />, name: 'exercices', path: '/tab/parametrages/paramExercice', urldynamic: true },
        { text: 'Plan comptable', icon: <MdListAlt />, name: 'planComptable', path: '/tab/parametrages/paramPlanComptable', urldynamic: true },
        { text: 'Plan modèle', icon: <MdListAlt />, name: 'planComptableModele', path: '/tab/parametrages/paramPlanComptableModele', urldynamic: false },
        { text: 'Portefeuille', icon: <MdFolder />, name: 'portefeuille', path: '/tab/parametrages/paramPortefeuille', urldynamic: false },
        { text: 'TVA', icon: <MdPercent />, name: 'tva', path: '/tab/parametrages/paramTVA', urldynamic: true },
    ]), []);

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
                setFileInfos(resData.fileInfos[0]);
            } else {
                setConsolidation(false);
                setFileInfos(null);
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

    // Fonctions pour les breadcrumbs
    const getNavigationLevel1 = () => {
        const path = location.pathname.toLowerCase();
        console.log('🔍 Debug - Path:', path);

        if (path.includes('/administration')) return 'Administration';
        if (path.includes('/parametrages')) return 'Paramétrages';
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/tools')) return 'Outils';

        return 'Accueil';
    };

    const getNavigationLevel2 = () => {
        const path = location.pathname.toLowerCase();

        if (path.includes('revuanalytiquenn1')) return 'Revu Analytique NN1';
        if (path.includes('revuanalytiquemensuelle')) return 'Revu Analytique Mensuelle';
        if (path.includes('dashboard')) return 'Dashboard';


        // ADMINISTRATION - Pages spécifiques en premier
        if (path.includes('revisiondoublon')) return 'Recherche Doublon';
        if (path.includes('revisionanalytique')) return 'Révision Analytique';
        if (path.includes('revisionfournisseurclient')) return 'Révision Fournisseur Client';
        if (path.includes('consultation')) return 'Consultation';
        if (path.includes('saisie')) return 'Saisie';
        if (path.includes('syntheseanomalies')) return 'Synthèse Anomalies';
        if (path.includes('importjournal')) return 'Import Journal';
        if (path.includes('exportbalance')) return 'Export Balance';
        if (path.includes('exportgrandlivre')) return 'Export Grand Livre';
        if (path.includes('exportjournal')) return 'Export Journal';

        // Si c'est juste /revision/ sans sous-page
        if (path.includes('/revision')) return 'Révision';

        // PARAMÉTRAGES - Pages spécifiques en premier
        if (path.includes('paramplancomptablemodele')) return 'Plan Comptable Modèle';
        if (path.includes('paramanalytique')) return 'Analytique';
        if (path.includes('paramcodejournal')) return 'Code Journaux';
        if (path.includes('paramcrm')) return 'CRM';
        if (path.includes('controles')) return 'Contrôles';
        if (path.includes('paramdevise')) return 'Devises';
        if (path.includes('paramexercice')) return 'Exercices';
        if (path.includes('paramplancomptable')) return 'Plan Comptable';
        if (path.includes('paramportefeuille')) return 'Portefeuille';
        if (path.includes('paramtva')) return 'TVA';


        return 'Dossiers';
    };

    //Creation de la liste du menu-------------------------------------------------
    // Déclarations désactivées: on ne les affiche plus dans le menu.
    const MenuSide = humburgerMenu.filter(item => item.name !== 'declaration');

    // État pour le popup de dossier non sélectionné
    const [showNoFilePopup, setShowNoFilePopup] = useState(false);

    const setShowPopupChangePassword = (value) => {
        setOpenPopupChangePassword(value);
    }

    useEffect(() => {
        GetInfosIdDossier(idDossier);
    }, [idDossier]);

    useEffect(() => {
        if (isDossierRequired() && !idDossier) {
            // Afficher le popup si aucun dossier n'est sélectionné
            setShowNoFilePopup(true);
        } else {
            setShowNoFilePopup(false);
        }
    }, [location.pathname, idDossier]);

    const [isHovered, setIsHovered] = useState(false);
    const [exercice, setExercice] = useState(1);

    const sendToHome = (value) => {
        setShowNoFilePopup(!value);
        navigate('/tab/home');
    };

    const isDossierRequired = () => {
        const path = location.pathname.toLowerCase();
        // Pages qui ne nécessitent pas de dossier
        if (path.includes('controles')) return false;
        if (path.includes('paramplancomptablemodele')) return false;
        if (path === '/tab/home' || path === '/tab/home/') return false;
        return true;
    };

    // Fonction utilitaire pour générer les sections de menu avec icônes
    const renderMenuSection = (title, list, iconColor = NEON_MINT) => (
        <>
            <ListSubheader sx={{
                lineHeight: '34px', fontWeight: 800, fontSize: '10px',
                bgcolor: 'transparent', color: 'rgba(0,0,0,0.4)', letterSpacing: '0.8px', px: 2.5, mt: 0.5
            }}>
                {title}
            </ListSubheader>
            {list.map((it, idx) => (
                <ListItem
                    button
                    key={`${it.name}-${idx}`}
                    onClick={() => navigateToMenuItem(it)}
                    sx={{ py: 1, px: 2.5, '&:hover': { bgcolor: '#F1F5F9' }, transition: '0.2s' }}
                >
                    <ListItemIcon sx={{ minWidth: 35, color: iconColor, fontSize: '20px' }}>
                        {it.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={it.text}
                        primaryTypographyProps={{ fontSize: '13px', fontWeight: 600, color: NAV_DARK }}
                    />
                </ListItem>
            ))}
        </>
    );

    return (
        <>
            {
                isOpenPopupDisconnect && (
                    <PopupDisconnectCompte open={isOpenPopupDisconnect} handleClose={() => setShowPopupDisconnect(false)} handleDisconnect={disconnect} />
                )
            }

            {
                showNoFilePopup && (
                    <PopupTestSelectedFile confirmationState={sendToHome} />
                )
            }
            <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
                <GlobalStyles styles={{
                    body: { margin: 0, padding: 0, overflowX: 'hidden', backgroundColor: BG_SOFT },
                    '.MuiButtonBase-root': {
                        outline: 'none !important',
                        boxShadow: 'none !important',
                        WebkitTapHighlightColor: 'transparent !important'
                    }
                }} />

                {/* --- HEADER --- */}
                <AppBar
                    position="fixed" // Utilise fixed pour bloquer le header en haut
                    elevation={0}
                    sx={{
                        background: NAV_DARK,
                        height: 64,
                        zIndex: (theme) => theme.zIndex.drawer + 1, // S'assure qu'il est au-dessus de tout
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}
                >                    <Toolbar sx={{ justifyContent: 'space-between', px: 4, height: 64 }}>

                        {/* LOGO */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: 'auto', sm: '200px', md: '280px' } }}>
                            <Box sx={{ bgcolor: NEON_MINT, borderRadius: '8px', p: 0.5, display: 'flex', boxShadow: `0 0 15px ${NEON_MINT}44` }}>
                                <AutoAwesomeIcon sx={{ color: NAV_DARK, fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '1px' }}>CORE.OS</Typography>
                        </Box>

                        {/* NAVIGATION CENTRALE */}
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', height: '64px' }}>
                            <Stack direction="row" spacing={1}>
                                <Button disableRipple startIcon={<HomeIcon />} onClick={() => navigate('/tab/home')} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700, px: 2 }}>Home</Button>
                                <Button disableRipple startIcon={<DashboardIcon />} onClick={() => navigate(`/tab/dashboard/${idDossier}`)} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700, px: 2 }}>Dashboard</Button>

                                {/* ADMIN DROP-DOWN */}
                                <Box onMouseEnter={() => setIsHoveredAdmin(true)} onMouseLeave={() => setIsHoveredAdmin(false)} sx={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}>
                                    <Button disableRipple startIcon={<DashboardIcon />} endIcon={<KeyboardArrowDownIcon sx={{ transition: '0.3s', transform: isHoveredAdmin ? 'rotate(180deg)' : 'none' }} />} sx={{ color: isHoveredAdmin ? NEON_MINT : 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700, height: '100%', px: 2 }}>Administration</Button>
                                    <Box sx={{
                                        position: 'absolute', top: '64px', left: '50%', transform: 'translateX(-50%)',
                                        width: '320px', bgcolor: '#fff', borderRadius: '0 0 16px 16px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid #E2E8F0', borderTop: 'none',
                                        py: 1, display: isHoveredAdmin ? 'block' : 'none', zIndex: 2000, maxHeight: '85vh', overflowY: 'auto'
                                    }}>
                                        {renderMenuSection("TRAITEMENT", adminTraitementList)}
                                        <Divider sx={{ my: 1, mx: 2, opacity: 0.6 }} />
                                        {renderMenuSection("IMPORT", adminImportList)}
                                        <Divider sx={{ my: 1, mx: 2, opacity: 0.6 }} />
                                        {renderMenuSection("EXPORT", adminExportList)}
                                    </Box>
                                </Box>

                                {/* PARAMÈTRES DROP-DOWN */}
                                <Box onMouseEnter={() => setIsHoveredSettings(true)} onMouseLeave={() => setIsHoveredSettings(false)} sx={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}>
                                    <Button disableRipple startIcon={<SettingsIcon />} endIcon={<KeyboardArrowDownIcon sx={{ transition: '0.3s', transform: isHoveredSettings ? 'rotate(180deg)' : 'none' }} />} sx={{ color: isHoveredSettings ? NEON_MINT : 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700, height: '100%', px: 2 }}>Paramètres</Button>
                                    <Box sx={{
                                        position: 'absolute', top: '64px', left: '50%', transform: 'translateX(-50%)',
                                        width: '280px', bgcolor: '#fff', borderRadius: '0 0 16px 16px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid #E2E8F0', borderTop: 'none',
                                        py: 1, display: isHoveredSettings ? 'block' : 'none', zIndex: 2000
                                    }}>
                                        {renderMenuSection("CONFIGURATION COMPTA", paramComptaList)}
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>

                        {/* PROFIL (DROITE) */}
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ width: '280px' }}>
                            <IconButton sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: NEON_MINT } }}><NotificationsNoneIcon /></IconButton>
                            <Box onMouseEnter={() => setIsHoveredProfile(true)} onMouseLeave={() => setIsHoveredProfile(false)} sx={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', ml: 1 }}>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ cursor: 'pointer', py: 1 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <Typography sx={{ color: isHoveredProfile ? NEON_MINT : '#fff', fontSize: '13px', fontWeight: 800 }}>{decoded?.UserInfo?.username || 'User'}</Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 600 }}>{comptename || 'Admin'}</Typography>
                                    </Box>
                                    <Avatar sx={{ width: 38, height: 38, bgcolor: NEON_MINT, color: NAV_DARK, fontWeight: 900, border: isHoveredProfile ? `2px solid ${NEON_MINT}` : '2px solid rgba(255,255,255,0.1)' }}>
                                        {decoded?.UserInfo?.username?.substring(0, 2).toUpperCase()}
                                    </Avatar>
                                </Stack>
                                {/* DROP-DOWN PROFIL (Simplifié pour l'exemple) */}
                                <Box sx={{
                                    position: 'absolute', top: '64px', right: 0,
                                    width: '260px', bgcolor: '#fff', borderRadius: '0 0 16px 16px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                    border: '1px solid #E2E8F0', borderTop: 'none',
                                    display: isHoveredProfile ? 'block' : 'none', zIndex: 2000
                                }}>

                                    {/* 1. NOUVEAU MOT DE PASSE */}
                                    <MenuItem
                                        onClick={() => { handleClose(); setOpenPopupChangePassword(true); }}
                                        sx={{ py: 1, px: 2, '&:hover': { bgcolor: '#F1F5F9' } }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <IconButton
                                                sx={{
                                                    color: 'gray', bgcolor: 'transparent', p: 1, ml: -1,
                                                    '&:hover': { bgcolor: 'transparent' }
                                                }}
                                            >
                                                <KeyIcon sx={{ width: 22, height: 22 }} />
                                            </IconButton>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: NAV_DARK }}>
                                                Nouveau mot de passe
                                            </Typography>
                                        </Stack>
                                    </MenuItem>

                                    {/* 2. GESTION DE COMPTE (CONDITIONNEL) */}
                                    {isButtonRolePermissionVisible && (
                                        <MenuItem
                                            onClick={() => { handleClose(); handleNavigateToRolePermission(); }}
                                            sx={{ py: 1, px: 2, '&:hover': { bgcolor: '#F1F5F9' } }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <IconButton
                                                    sx={{
                                                        color: 'gray', bgcolor: 'transparent', p: 1, ml: -1,
                                                        '&:hover': { bgcolor: 'transparent' }
                                                    }}
                                                >
                                                    <ManageAccountsIcon sx={{ width: 22, height: 22 }} />
                                                </IconButton>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: NAV_DARK }}>
                                                    Gestion de compte
                                                </Typography>
                                            </Stack>
                                        </MenuItem>
                                    )}

                                    <Divider sx={{ my: 0.5, opacity: 0.6 }} />

                                    {/* 3. DÉCONNEXION */}
                                    <MenuItem
                                        onClick={() => { handleClose(); setShowPopupDisconnect(true); }}
                                        sx={{ py: 1, px: 2, '&:hover': { bgcolor: '#FFF1F2' } }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <IconButton
                                                sx={{
                                                    color: '#ef4444', bgcolor: 'transparent', p: 1, ml: -1,
                                                    '&:hover': { bgcolor: 'transparent' }
                                                }}
                                            >
                                                <LogoutIcon sx={{ width: 22, height: 22 }} />
                                            </IconButton>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#ef4444' }}>
                                                Déconnexion
                                            </Typography>
                                        </Stack>
                                    </MenuItem>
                                </Box>
                            </Box>
                        </Stack>
                    </Toolbar>
                </AppBar>

                {/* --- BREADCRUMBS --- */}
                <Box
                    sx={{
                        width: '100%',
                        px: 2,
                        py: 0.5,   // hauteur beaucoup plus petite
                        borderBottom: '1px solid #E2E8F0',
                        bgcolor: '#fff',
                        mt: '64px',
                        minHeight: '36px',   // hauteur fixe petite
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 1000 // Assurer qu'il est au-dessus
                    }}
                >              <Stack direction="row" spacing={2} alignItems="center">
                        {/* Affichage du dossier seulement si nécessaire */}
                        {isDossierRequired() && (
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5,
                                bgcolor: '#F1F5F9', borderRadius: '6px', border: '1px solid #E2E8F0'
                            }}>
                                <MdFolder sx={{ fontSize: 16, color: '#64748B' }} />
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0B1120' }}>
                                    {(() => {
                                        const dossierName = fileInfos?.dossier || `Dossier ${idDossier || '...'}`;
                                        console.log('🔍 Debug - Dossier name:', dossierName);
                                        return dossierName;
                                    })()}
                                </Typography>
                            </Box>
                        )}
                        {isDossierRequired() && <Divider orientation="vertical" flexItem sx={{ height: 30, my: 'auto' }} />}
                        <Breadcrumbs separator=">">
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                                {(() => {
                                    const level1 = getNavigationLevel1();
                                    console.log('🔍 Debug - Level1 rendered:', level1);
                                    return level1;
                                })()}
                            </Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#00FF94' }}>
                                {(() => {
                                    const level2 = getNavigationLevel2();
                                    console.log('🔍 Debug - Level2 rendered:', level2);
                                    return level2;
                                })()}
                            </Typography>
                        </Breadcrumbs>
                    </Stack>
                </Box>

                {/* --- CONTENU PRINCIPAL --- */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        minHeight: '100vh',
                        bgcolor: BG_SOFT,
                        pt: 0, // Plus de padding-top car le breadcrumbs est maintenant positionné avec mt: '64px'
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >                    <Box sx={{
                    p: 0, // Padding pour ne pas coller aux bords (ajuste à 1 ou 2 si tu veux moins d'espace)
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                        <Outlet />
                    </Box>

                </Box>
            </Box>
            );
        </>
    );
};

export default FinalUserDashboard;