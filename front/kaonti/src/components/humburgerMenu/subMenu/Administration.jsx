import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { init } from '../../../../init';
import { Stack, Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { Clear } from '@mui/icons-material';

const traitementList = [
    {
        text: 'Saisie',
        name: "saisie",
        path: "/tab/administration/saisie",
        urldynamic: true
    },
    {
        text: 'Consultation',
        name: "consultation",
        path: "/tab/administration/consultation",
        urldynamic: true
    },
    // {
    //     text: 'Personnel',
    //     name: "personnel",
    //     path: "/tab/administration/personnel",
    //     urldynamic: true
    // },
    // {
    //     text: 'Rapprochements bancaires',
    //     name: "rapprochements",
    //     path: "/tab/administration/rapprochements",
    //     urldynamic: true
    // },
    // {
    //     text: 'Immobilisations',
    //     name: "immobilisations",
    //     path: "/tab/administration/immobilisations",
    //     urldynamic: true
    // },
];

const importList = [
    // {
    //     text: 'Annexe déclarations fiscales',
    //     name: "annexeDeclarationsFiscales",
    //     path: "/tab/administration/importAnnexeDeclarationFiscale",
    //     urldynamic: false
    // },
    // {
    //     text: 'Annexe liasses E-bilan',
    //     name: "annexeLiassesEbilan",
    //     path: "/tab/administration/importAnnexeDeclarationEbilan",
    //     urldynamic: true
    // },
    // {
    //     text: 'Balance',
    //     name: "balance",
    //     path: "/tab/administration/importBalance",
    //     urldynamic: true
    // },
    {
        text: 'Journal comptable',
        name: "journalComptable",
        path: "/tab/administration/importJournal",
        urldynamic: true
    },
    // {
    //     text: 'Modèle plan comptable',
    //     name: "modelePlanComptable",
    //     path: "/tab/administration/importModelePlanComptable",
    //     urldynamic: false
    // },
];

const exportList = [
    {
        text: 'Balance',
        name: "balance",
        path: "/tab/administration/exportBalance",
        urldynamic: true
    },
    // {
    //     text: 'DCom - droit de communication',
    //     name: "droitCommunication",
    //     path: "#"
    // },
    {
        text: 'Grand livre',
        name: "grandLivre",
        path: "/tab/administration/exportGrandLivre",
        urldynamic: true
    },
    {
        text: 'Journal comptable',
        name: "journalComptable",
        path: "/tab/administration/exportJournal",
        urldynamic: true
    },
    // {
    //     text: 'Etats financiers',
    //     name: "etatfinancière",
    //     path: "/tab/administration/etatFinacier",
    //     urldynamic: true
    // },
    // {
    //     text: 'Etats financiers analytique',
    //     name: "etatfinancièreAnalytique",
    //     path: "/tab/administration/etatFinacierAnalytique",
    //     urldynamic: true
    // },
    // {
    //     text: 'SIG',
    //     name: "sig",
    //     path: "/tab/administration/sig",
    //     urldynamic: true
    // },
    // {
    //     text: 'Liasse E-bilan',
    //     name: "liasseEbilan",
    //     path: "#"
    // },
];

export default function Administration({ onWindowState, pathToNavigate, closeDrawer }) {
    let initial = init[0];

    const [fileId, setFileId] = useState(0);

    const [anchorTraitement, setAnchorTraitement] = useState(null);
    const [anchorImport, setAnchorImport] = useState(null);
    const [anchorExport, setAnchorExport] = useState(null);

    useEffect(() => {
        const idDossier = sessionStorage.getItem("fileId");
        setFileId(idDossier);
    }, []);

    const navigateToPage = (item) => {
        if (item.urldynamic == true) {
            pathToNavigate(`${item.path}/${fileId}`);
        } else {
            pathToNavigate(item.path);
        }
    };

    const closeAllMenus = () => {
        setAnchorTraitement(null);
        setAnchorImport(null);
        setAnchorExport(null);
    };

    const handleClosePanel = () => {
        closeAllMenus();
        onWindowState(false);
        if (typeof closeDrawer === 'function') closeDrawer();
    };

    const menuButtonSx = {
        textTransform: 'none',
        color: initial.text_theme,
        fontWeight: 600,
        borderRadius: 2,
        px: 1.25,
        py: 0.75,
        minWidth: 'unset',
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.10)',
        }
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 56,
                left: 0,
                width: '100vw',
                height: 'calc(100vh - 56px)',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.20)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                pt: 3,
                boxSizing: 'border-box'
            }}
        >
            <Stack
                sx={{
                    width: 'min(980px, calc(100vw - 40px))',
                    backgroundColor: initial.menu_theme,
                    borderRadius: 2,
                    border: '1px solid rgba(17, 24, 39, 0.12)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    overflow: 'hidden'
                }}
            >
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} sx={{ px: 2.5, py: 2 }}>
                    <Typography variant='h6' color={initial.text_theme}>Administration</Typography>
                    <IconButton
                        onClick={handleClosePanel}
                        aria-label="close"
                        disableRipple
                        disableFocusRipple
                        sx={{
                            boxShadow: 'none',
                            outline: 'none',
                            '&:focus': { outline: 'none' },
                            '&:focus-visible': { outline: 'none', boxShadow: 'none' },
                            '&.Mui-focusVisible': { outline: 'none', boxShadow: 'none' },
                        }}
                    >
                        <Clear style={{ color: initial.text_theme, fontSize: 24 }} />
                    </IconButton>
                </Stack>

                <Divider sx={{ opacity: 0.15 }} />

                <Stack direction={'row'} alignItems={'center'} spacing={2} sx={{ px: 2.5, py: 1.5, flexWrap: 'wrap' }}>
                    <Button
                        onMouseEnter={(e) => { closeAllMenus(); setAnchorTraitement(e.currentTarget); }}
                        disableRipple
                        disableFocusRipple
                        sx={menuButtonSx}
                    >
                        Traitement
                    </Button>
                    <Button
                        onMouseEnter={(e) => { closeAllMenus(); setAnchorImport(e.currentTarget); }}
                        disableRipple
                        disableFocusRipple
                        sx={menuButtonSx}
                    >
                        Import
                    </Button>
                    <Button
                        onMouseEnter={(e) => { closeAllMenus(); setAnchorExport(e.currentTarget); }}
                        disableRipple
                        disableFocusRipple
                        sx={menuButtonSx}
                    >
                        Export
                    </Button>
                </Stack>

                <Menu
                    anchorEl={anchorTraitement}
                    open={Boolean(anchorTraitement)}
                    onClose={() => setAnchorTraitement(null)}
                    MenuListProps={{ onMouseLeave: () => setAnchorTraitement(null) }}
                    disableScrollLock
                    slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 240 } } }}
                >
                    {traitementList.map((item) => (
                        <MenuItem key={item.name} onClick={() => { handleClosePanel(); navigateToPage(item); }}>
                            {item.text}
                        </MenuItem>
                    ))}
                </Menu>

                <Menu
                    anchorEl={anchorImport}
                    open={Boolean(anchorImport)}
                    onClose={() => setAnchorImport(null)}
                    MenuListProps={{ onMouseLeave: () => setAnchorImport(null) }}
                    disableScrollLock
                    slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 240 } } }}
                >
                    {importList.map((item) => (
                        <MenuItem key={item.name} onClick={() => { handleClosePanel(); navigateToPage(item); }}>
                            {item.text}
                        </MenuItem>
                    ))}
                </Menu>

                <Menu
                    anchorEl={anchorExport}
                    open={Boolean(anchorExport)}
                    onClose={() => setAnchorExport(null)}
                    MenuListProps={{ onMouseLeave: () => setAnchorExport(null) }}
                    disableScrollLock
                    slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 240 } } }}
                >
                    {exportList.map((item) => (
                        <MenuItem key={item.name} onClick={() => { handleClosePanel(); navigateToPage(item); }}>
                            {item.text}
                        </MenuItem>
                    ))}
                </Menu>
            </Stack>
        </Box>
    )
}