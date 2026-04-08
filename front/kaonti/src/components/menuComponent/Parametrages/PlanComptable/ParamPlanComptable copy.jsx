import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography, Stack, Box, Tab, Chip, ButtonGroup, Button, Select, MenuItem, TextField,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Checkbox, Breadcrumbs, InputAdornment,
    TablePagination
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { TbCircleLetterCFilled, TbCircleLetterGFilled, TbCircleLetterAFilled } from "react-icons/tb";
import { DetailsInformation } from '../../../componentsTools/DetailsInformation';
import { useSearchParams } from "react-router-dom";
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { TbRefresh } from "react-icons/tb";

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';

// --- CONSTANTES DE STYLE ---
const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';
const BORDER_COLOR = '#E2E8F0';

// --- STYLES ---
const headerStyle = (width, last = false) => ({
    fontWeight: 800,
    color: '#94A3B8',
    fontSize: '10px',
    textTransform: 'uppercase',
    width: width,
    minWidth: width,
    paddingY: '6px',
    pr: last ? 2 : 1
});

const inlineEditStyle = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
        height: '26px',
        fontSize: '12px',
        borderRadius: '4px',
        bgcolor: '#fff'
    }
};

const inlineSelectStyle = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
        height: '28px',
        fontSize: '12px',
        borderRadius: '4px',
        bgcolor: 'transparent',
        '& fieldset': {
            borderColor: '#CBD5E1',
            borderWidth: '1px'
        },
        '&:hover fieldset': {
            borderColor: '#94A3B8'
        },
        '&.Mui-focused fieldset': {
            borderColor: '#00FF94',
            borderWidth: '1px'
        }
    },
    '& .MuiSelect-select': {
        padding: '4px 8px'
    }
};

const cellStyle = {
    padding: '4px',
    '&:first-of-type': {
        paddingLeft: '4px'
    }
};

const buttonStyle = {
    minWidth: 120,
    height: 32,
    px: 2,
    borderRadius: 1,
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
};

export default function ParamPlanComptable() {
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const axiosPrivate = useAxiosPrivate();

    let initial = init[0];
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const compte = searchParams.get("compte");

    //paramètres de connexion------------------------------------
    const decoded = auth?.accessToken
        ? jwtDecode(auth.accessToken)
        : undefined
    const compteId = decoded?.UserInfo?.compteId || 0;

    const [pc, setPc] = useState([]);
    const [filteredPc, setFilteredPc] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [listeCptCollectif, setListeCptCollectif] = useState([]);
    const [isLoadingCollectif, setIsLoadingCollectif] = useState(false);
    const loadingCollectifRef = useRef(false);

    // États pour l'édition inline dans le Table
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});

    const [listCptChg, setListCptChg] = useState([]);
    const [listCptTva, setListCptTva] = useState([]);

    const [pcAllselectedRow, setPcAllselectedRow] = useState([]);
    const [openDialogDeleteItemsPc, setOpenDialogDeleteItemsPc] = useState(false);
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [rowCptInfos, setRowCptInfos] = useState([]);
    const [openInfos, setOpenInfos] = useState(false);
    const [consolidation, setConsolidation] = useState(false);
    const [isTypeComptaAutre, setIsTypeComptaAutre] = useState(false);

    const [openDialogAddNewAccount, setOpenDialogAddNewAccount] = useState(false);
    const [typeAction, setTypeAction] = useState('');
    const [isRefresh, setisRefresh] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    // Fonction de filtrage pour la recherche multi-colonnes
    const handleSearch = (searchValue) => {
        setSearchText(searchValue);

        if (!searchValue.trim()) {
            setFilteredPc(pc);
            return;
        }

        const filtered = pc.filter(row => {
            const searchLower = searchValue.toLowerCase();
            return (
                (row.compte && row.compte.toLowerCase().includes(searchLower)) ||
                (row.libelle && row.libelle.toLowerCase().includes(searchLower)) ||
                (row.nature && row.nature.toLowerCase().includes(searchLower)) ||
                (row.baseCompte && row.baseCompte.toString().toLowerCase().includes(searchLower))
            );
        });

        setFilteredPc(filtered);
    };

    // Mettre à jour filteredPc quand pc change
    useEffect(() => {
        setFilteredPc(pc);
    }, [pc]);

    // Récupérer la liste des comptes collectifs pour le dropdown (avec logs)
    const recupererListeCptCollectif = useCallback(() => {
        if (!fileId || !compteId) {
            // console.log('[DEBUG] recupererListeCptCollectif: fileId ou compteId manquant', { fileId, compteId });
            return;
        }
        if (loadingCollectifRef.current) {
            // console.log('[DEBUG] recupererListeCptCollectif: déjà en chargement');
            return;
        }

        // console.log('[DEBUG] recupererListeCptCollectif: début chargement...', { fileId, compteId });
        loadingCollectifRef.current = true;
        setIsLoadingCollectif(true);
        const startTime = Date.now();

        axios.post(`/paramPlanComptable/pc`, { fileId: Number(fileId), compteId: Number(compteId) })
            .then((response) => {
                const elapsed = Date.now() - startTime;
                // console.log(`[DEBUG] recupererListeCptCollectif: reçu en ${elapsed}ms`);

                const resData = response.data;
                if (resData.state) {
                    const listePc = resData.liste || [];
                    const collectifs = listePc.filter(item => item.nature === 'Collectif');
                    // console.log(`[DEBUG] recupererListeCptCollectif: ${listePc.length} total, ${collectifs.length} collectifs`);
                    setListeCptCollectif(collectifs);
                } else {
                    console.error('[DEBUG] recupererListeCptCollectif: API error', resData.msg);
                }
            })
            .catch((error) => {
                console.error('[DEBUG] recupererListeCptCollectif: network error', error);
            })
            .finally(() => {
                loadingCollectifRef.current = false;
                setIsLoadingCollectif(false);
                // console.log('[DEBUG] recupererListeCptCollectif: terminé');
            });
    }, [fileId, compteId]);

    // Ajouter une nouvelle ligne
    const handleAddNewRow = () => {
        if (!canAdd) {
            toast.error('Vous n\'avez pas les droits d\'ajout');
            return;
        }
        // Charger les comptes collectifs si ce n'est pas déjà fait
        if (listeCptCollectif.length === 0 && !loadingCollectifRef.current) {
            recupererListeCptCollectif();
        }

        const newId = Date.now();
        const newRow = {
            id: newId,
            compte: '',
            libelle: '',
            nature: 'General',
            baseCompte: '',
            isNew: true
        };
        setPc((prev) => [newRow, ...prev]);
        setEditingId(newId);
        setEditValues(newRow);
        setSelectedRowId(newId);
        setSelectedRow(newRow);
    };

    // Démarrer l'édition d'une ligne
    const handleEditClick = (row) => {
        if (!canModify) {
            toast.error('Vous n\'avez pas les droits de modification');
            return;
        }
        // Charger les comptes collectifs si ce n'est pas déjà fait
        if (listeCptCollectif.length === 0 && !loadingCollectifRef.current) {
            recupererListeCptCollectif();
        }
        setEditingId(row.id);
        setEditValues({ ...row });
        setSelectedRowId(row.id);
        setSelectedRow(row);
    };

    // Modifier la valeur d'un champ en édition
    const handleEditValueChange = (field, value) => {
        setEditValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Sauvegarder les modifications
    const handleSaveClick = async () => {
        if (!editingId) return;

        const row = editValues;
        const isNewRow = row.isNew === true;

        // Validation
        if (!row.compte || !row.libelle) {
            toast.error('Le compte et le libellé sont requis');
            return;
        }

        // Pour Auxiliaire: baseCompte obligatoire
        if ((row.nature === 'Aux' || row.nature === 'Auxiliaire') && (!row.baseCompte || String(row.baseCompte).trim() === '')) {
            toast.error('Veuillez sélectionner un compte collectif');
            return;
        }

        const itemId = isNewRow ? 0 : row.id;

        // Quand nature = General ou Collectif: baseCompte doit être le numéro de compte
        // Quand nature = Auxiliaire: baseCompte est l'ID du compte collectif sélectionné
        let baseCptValue = null;
        if (row.nature === 'General' || row.nature === 'Collectif') {
            baseCptValue = row.compte ? Number(row.compte) : null;
        } else if (row.baseCompte && String(row.baseCompte).trim() !== '') {
            baseCptValue = Number(row.baseCompte);
        }

        const payload = {
            action: isNewRow ? 'new' : 'modify',
            itemId: itemId,
            idCompte: Number(compteId),
            idDossier: Number(fileId),
            compte: row.compte,
            libelle: row.libelle,
            nature: row.nature,
            baseCptCollectif: baseCptValue,
            typeTier: (row.nature === 'General' || row.nature === 'Collectif') ? 'general' : (row.typeTier || 'sans-nif'),
            nif: row.nif || '',
            stat: row.statistique || '',
            adresse: row.adresse || '',
            motcle: row.motcle || '',
            cin: row.cin || '',
            dateCin: row.datecin && row.datecin !== 'Invalid date' ? row.datecin : null,
            autrePieceID: row.autrepieceid || '',
            refPieceID: row.refpieceid || '',
            adresseSansNIF: row.adressesansnif || '',
            nifRepresentant: row.nifrepresentant || '',
            adresseEtranger: row.adresseetranger || '',
            pays: row.pays || '',
            province: row.province || '',
            region: row.region || '',
            district: row.district || '',
            commune: row.commune || '',
            listeCptChg: [],
            listeCptTva: [],
            typecomptabilite: row.typecomptabilite || 'Français',
            compteautre: row.compteautre || '',
            libelleautre: row.libelleautre || ''
        };

        try {
            const response = await axiosPrivate.post(`/paramPlanComptable/AddCpt`, payload);
            const resData = response.data;

            if (resData.state === true) {
                toast.success(resData.msg || 'Compte enregistré avec succès');
                setEditingId(null);
                setEditValues({});
                showPc();
            } else {
                toast.error(resData.msg || 'Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || "Erreur inconnue";
            toast.error(errMsg);
        }
    };

    // Annuler l'édition
    const handleCancelClick = () => {
        if (editValues?.isNew) {
            setPc((prev) => prev.filter((r) => r.id !== editingId));
        }
        setEditingId(null);
        setEditValues({});
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Supprimer une ligne
    const handleDeleteClick = (row) => {
        if (!canDelete) {
            toast.error('Vous n\'avez pas les droits de suppression');
            return;
        }
        setSelectedRowId(row.id);
        setSelectedRow(row);
        setOpenDialogDeleteItemsPc(true);
    };

    const handleCloseDialogAddNewAccount = () => {
        setOpenDialogAddNewAccount(false);
        setisRefresh(prev => !prev);
    }

    const handleActualize = () => {
        try {
            axios.post(`/paramPlanComptable/recupPcConsolidation`, { fileId, compteId })
                .then((response) => {
                    const listePc = response?.data?.liste;
                    const unique = Object.values(
                        (Array.isArray(listePc) ? listePc : []).reduce((acc, r) => {
                            const k = String(r.compte || '');
                            if (!acc[k]) acc[k] = r;
                            return acc;
                        }, {})
                    );

                    setPc(unique);
                    toast.success('Liste mis à jour avec succès')
                })
                .catch((error) => {
                    const errMsg = error.response?.data?.message || error.message || "Erreur inconnue";
                    toast.error(errMsg);
                })
                .finally(() => {
                    setSelectedRow(null);
                    setSelectedRowId(null);
                    setPcAllselectedRow([]);
                });
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || "Erreur inconnue";
            setSelectedRow(null);
            setSelectedRowId(null);
            setPcAllselectedRow([]);
        }
    }

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

    //Suppression des comptes sélectionnés dans le tableau du plan comptable
    const handleOpenDialogCptDelete = () => {
        setOpenDialogDeleteItemsPc(true);
    }

    const showCptInfos = (state) => {
        setOpenInfos(state);
    }

    const handleShowCptInfos = (row) => {
        const itemId = row.id;
        axios.get(`/paramPlanComptable/keepListCptChgTvaAssoc/${itemId}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListCptChg(resData.detailChg);
                setListCptTva(resData.detailTva);
                setRowCptInfos(row);
                setOpenInfos(true);
            } else {
                toast.error(resData.msg);
            }
        })
    }

    const GetInfosIdDossier = (id) => {
        axios.get(`/home/FileInfos/${id}`).then((response) => {
            const resData = response.data;

            if (resData.state) {
                const isTypeComptaAutre = resData.fileInfos[0].typecomptabilite === 'Autres';
                setFileInfos(resData.fileInfos[0]);
                setConsolidation(resData.fileInfos[0].consolidation);
                setIsTypeComptaAutre(isTypeComptaAutre)
                setNoFile(false);
            } else {
                setFileInfos([]);
                setNoFile(true);
            }
        })
    }

    //Affichage du plan comptable
    const showPc = () => {
        axios.post(`/paramPlanComptable/pc`, { fileId, compteId }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                let listePc = resData.liste;

                if (compte) {
                    listePc = listePc.filter((row) => row.compte === compte);
                }

                const unique = Object.values(
                    (Array.isArray(listePc) ? listePc : []).reduce((acc, r) => {
                        const k = String(r.compte || '');
                        if (!acc[k]) {
                            const baseValue = r.baseaux || r.baseCptCollectif || r.baseCompte || '';
                            acc[k] = {
                                ...r,
                                baseCompte: baseValue
                            };
                        }
                        return acc;
                    }, {})
                );

                // console.log('[DEBUG] showPc: first item', unique[0]);
                setPc(unique);
            } else {
                toast.error(resData.msg);
            }
        })
    }

    //Récupération de l'ID de la ligne sélectionner dans le tableau détail du modèle sélectionné
    const listPCSelectedRow = (selectedIds) => {
        const itemId = selectedIds[0];
        setPcAllselectedRow(selectedIds);
        setSelectedRowId(itemId ?? null);

        const itemInfos = pc.find(row => row.id === itemId);
        if (itemInfos) {
            setSelectedRow(itemInfos);

            //récupérer la liste des comptes de charges et compte de TVA associées à la ligne sélectionnée
            axios.get(`/paramPlanComptable/keepListCptChgTvaAssoc/${itemId}`).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    setListCptChg(resData.detailChg);
                    setListCptTva(resData.detailTva);
                } else {
                    toast.error(resData.msg);
                }
            })
        }
    }

    const deleteItemsPC = (value) => {
        if (value === true) {
            if (pcAllselectedRow.length >= 1) {
                const listId = pcAllselectedRow;

                axiosPrivate.post(`/paramPlanComptable/deleteItemPc`, { listId, compteId, fileId }).then((response) => {
                    const resData = response.data;
                    showPc();
                    setOpenDialogDeleteItemsPc(false);

                    // Si certains comptes n'ont pas pu être supprimés, on n'affiche PAS le toast de succès.
                    if (resData.stateUndeletableCpt) {
                        toast.error(resData.msgUndeletableCpt || resData.msg);
                        return;
                    }

                    if (resData.state) {
                        toast.success(resData.msg);
                    } else {
                        toast.error(resData.msg);
                    }
                });

            } else {
                toast.error("Veuillez sélectionner au moins une ligne dans le tableau plan comptable.");
            }
        } else {
            setOpenDialogDeleteItemsPc(false);
        }
    }

    useEffect(() => {
        const navigationEntries = performance.getEntriesByType('navigation');
        let idFile = 0;

        if (navigationEntries.length > 0) {
            const navigationType = navigationEntries[0].type;
            if (navigationType === 'reload') {
                const idDossier = sessionStorage.getItem("fileId");
                setFileId(idDossier);
                idFile = idDossier;
            } else {
                sessionStorage.setItem('fileId', id);
                setFileId(id);
                idFile = id;
            }
        }
        GetInfosIdDossier(idFile);
    }, []);

    useEffect(() => {
        if (canView && fileId && compteId) {
            showPc();
            // Précharger les comptes collectifs pour l'édition
            // console.log('[DEBUG] useEffect: chargement comptes collectifs...');
            recupererListeCptCollectif();
        }
    }, [fileId, compteId, compte, isRefresh]);

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
                (openInfos && canView) ?
                    <DetailsInformation
                        row={rowCptInfos}
                        confirmOpen={showCptInfos}
                        listCptChg={listCptChg}
                        listCptTva={listCptTva}
                    />
                    :
                    null}
            {
                (openDialogDeleteItemsPc && canDelete)
                    ?
                    <PopupConfirmDelete
                        msg={"Voulez-vous vraiment supprimer les comptes sélectionnés ?"}
                        confirmationState={deleteItemsPC}
                    />
                    :
                    null
            }
            <Box>
                <TabContext value={"1"}>

                    <TabPanel value="1">
                        <Stack width={"100%"} height={"90%"} spacing={1} alignItems={"flex-start"} justifyContent={"stretch"}>
                            <Typography variant='h6' sx={{ fontWeight: 800, color: NAV_DARK }}>Plan comptable </Typography>
                            <Stack
                                width="100%"
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"   // tout passe à droite
                                sx={{ mt: -4 }}
                            >

                                {/* DROITE : recherche + bouton */}
                                <Stack direction="row" spacing={1} alignItems="center">

                                    <TextField
                                        placeholder="Rechercher ..."
                                        size="small"
                                        value={searchText}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            width: 250,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                bgcolor: '#fff',
                                                height: '32px',
                                                fontSize: '12px'
                                            }
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                                        onClick={handleAddNewRow}
                                        disabled={!canAdd}
                                        sx={{
                                            bgcolor: NEON_MINT,
                                            textTransform: 'none',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            mr: 2,
                                            color: '#000',
                                            borderRadius: '6px',
                                            px: 2,
                                            '&:hover': {
                                                bgcolor: '#00E685',
                                                transform: 'translateY(-1px)'
                                            },
                                        }}
                                    >
                                        Ajouter
                                    </Button>

                                </Stack>

                            </Stack>

                            <Stack height={"100vh"} width={'100%'} sx={{ mt: 4 }}>
                                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${BORDER_COLOR}`, width: '100%' }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                            <TableRow sx={{ height: '35px' }}>
                                                <TableCell padding="checkbox" sx={{ width: '30px', p: '2px' }}>
                                                    <Checkbox size="small" sx={{ p: '1px' }} />
                                                </TableCell>
                                                <TableCell sx={headerStyle(100)}>Compte</TableCell>
                                                <TableCell sx={headerStyle(350)}>Libellé</TableCell>
                                                <TableCell sx={headerStyle(150)}>Nature</TableCell>
                                                <TableCell sx={headerStyle(120)}>Centr. / base aux.</TableCell>
                                                <TableCell align="right" sx={headerStyle(120, true)}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredPc
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((row) => {
                                                    const isEditing = editingId === row.id;
                                                    const isSelected = selectedRowId === row.id;

                                                    return (
                                                        <TableRow
                                                            key={row.id}
                                                            sx={{
                                                                '&:hover': { bgcolor: '#F1F5F9' },
                                                                height: '40px',
                                                                bgcolor: isSelected ? '#E0F2FE' : 'inherit'
                                                            }}
                                                            onClick={() => {
                                                                if (!editingId) {
                                                                    listPCSelectedRow([row.id]);
                                                                }
                                                            }}
                                                        >
                                                            <TableCell padding="checkbox" sx={{ p: '2px' }}>
                                                                <Checkbox
                                                                    size="small"
                                                                    checked={isSelected}
                                                                    onChange={() => listPCSelectedRow([row.id])}
                                                                    sx={{ p: '1px' }}
                                                                />
                                                            </TableCell>

                                                            {/* Compte */}
                                                            <TableCell sx={cellStyle}>
                                                                {isEditing ? (
                                                                    <TextField
                                                                        size="small"
                                                                        value={editValues.compte || ''}
                                                                        onChange={(e) => handleEditValueChange('compte', e.target.value)}
                                                                        sx={inlineEditStyle}
                                                                    />
                                                                ) : (
                                                                    <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                                                                        {row.compte}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>

                                                            {/* Libellé */}
                                                            <TableCell sx={cellStyle}>
                                                                {isEditing ? (
                                                                    <TextField
                                                                        size="small"
                                                                        value={editValues.libelle || ''}
                                                                        onChange={(e) => handleEditValueChange('libelle', e.target.value)}
                                                                        sx={inlineEditStyle}
                                                                    />
                                                                ) : (
                                                                    <Typography sx={{ fontSize: '13px', color: '#475569' }}>
                                                                        {row.libelle}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>

                                                            {/* Nature */}
                                                            <TableCell sx={cellStyle}>
                                                                {isEditing ? (
                                                                    <Select
                                                                        size="small"
                                                                        value={editValues.nature || 'General'}
                                                                        onChange={(e) => handleEditValueChange('nature', e.target.value)}
                                                                        sx={inlineSelectStyle}
                                                                    >
                                                                        <MenuItem value="General">Général</MenuItem>
                                                                        <MenuItem value="Collectif">Collectif</MenuItem>
                                                                        <MenuItem value="Aux">Auxiliaire</MenuItem>
                                                                    </Select>
                                                                ) : (
                                                                    row.nature === 'General' ? (
                                                                        <Chip
                                                                            icon={<TbCircleLetterGFilled style={{ color: 'white', width: 16, height: 16 }} />}
                                                                            label="Général"
                                                                            size="small"
                                                                            sx={{
                                                                                height: '24px',
                                                                                fontSize: '11px',
                                                                                fontWeight: 700,
                                                                                backgroundColor: '#48A6A7',
                                                                                color: 'white',
                                                                                width: '100%',
                                                                                justifyContent: 'flex-start'
                                                                            }}
                                                                        />
                                                                    ) : row.nature === 'Collectif' ? (
                                                                        <Chip
                                                                            icon={<TbCircleLetterCFilled style={{ color: 'white', width: 16, height: 16 }} />}
                                                                            label="Collectif"
                                                                            size="small"
                                                                            sx={{
                                                                                height: '24px',
                                                                                fontSize: '11px',
                                                                                fontWeight: 700,
                                                                                backgroundColor: '#A6D6D6',
                                                                                color: 'white',
                                                                                width: '100%',
                                                                                justifyContent: 'flex-start'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <Chip
                                                                            icon={<TbCircleLetterAFilled style={{ color: 'white', width: 16, height: 16 }} />}
                                                                            label="Auxiliaire"
                                                                            size="small"
                                                                            sx={{
                                                                                height: '24px',
                                                                                fontSize: '11px',
                                                                                fontWeight: 700,
                                                                                backgroundColor: '#123458',
                                                                                color: 'white',
                                                                                width: '100%',
                                                                                justifyContent: 'flex-start'
                                                                            }}
                                                                        />
                                                                    )
                                                                )}
                                                            </TableCell>

                                                            {/* Centr. / base aux. */}
                                                            <TableCell sx={cellStyle}>
                                                                {isEditing ? (
                                                                    (editValues.nature === 'General' || editValues.nature === 'Collectif') ? (
                                                                        <TextField
                                                                            size="small"
                                                                            value={editValues.compte || ''}
                                                                            disabled
                                                                            sx={{
                                                                                width: '100%',
                                                                                '& .MuiInputBase-root.Mui-disabled': {
                                                                                    backgroundColor: '#f5f5f5',
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <Select
                                                                            size="small"
                                                                            value={editValues.baseCompte || ''}
                                                                            onChange={(e) => handleEditValueChange('baseCompte', e.target.value)}
                                                                            disabled={isLoadingCollectif}
                                                                            displayEmpty
                                                                            sx={inlineSelectStyle}
                                                                        >
                                                                            <MenuItem value="">
                                                                                <em>{isLoadingCollectif ? 'Chargement...' : 'Sélectionner'}</em>
                                                                            </MenuItem>
                                                                            {listeCptCollectif?.map((item) => (
                                                                                <MenuItem key={item.id} value={String(item.id)}>
                                                                                    {item.compte} - {item.libelle}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                    )
                                                                ) : (
                                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                                        {row.nature === 'Aux' || row.nature === 'Auxiliaire'
                                                                            ? listeCptCollectif.find((c) => String(c.id) === String(row.baseCompte))?.compte || row.baseCompte
                                                                            : row.baseCompte
                                                                        }
                                                                    </Typography>
                                                                )}
                                                            </TableCell>

                                                            {/* Actions */}
                                                            <TableCell align="right" sx={cellStyle}>
                                                                <Stack direction="row" spacing={0} justifyContent="flex-end">
                                                                    {isEditing ? (
                                                                        <>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={handleSaveClick}
                                                                                sx={{ color: '#10B981' }}
                                                                            >
                                                                                <CheckIcon fontSize="inherit" />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={handleCancelClick}
                                                                                sx={{ color: '#EF4444' }}
                                                                            >
                                                                                <CloseIcon fontSize="inherit" />
                                                                            </IconButton>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditClick(row);
                                                                                }}
                                                                                disabled={!canModify}
                                                                                sx={{ color: canModify ? '#64748B' : '#CBD5E1' }}
                                                                            >
                                                                                <EditIcon fontSize="inherit" />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteClick(row);
                                                                                }}
                                                                                disabled={!canDelete}
                                                                                sx={{ color: canDelete ? '#64748B' : '#CBD5E1' }}
                                                                            >
                                                                                <DeleteIcon fontSize="inherit" />
                                                                            </IconButton>
                                                                        </>
                                                                    )}
                                                                </Stack>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    component="div"
                                    count={filteredPc.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[25, 50, 100]}
                                    labelRowsPerPage="Lignes par page:"
                                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                                    sx={{
                                        '.MuiTablePagination-toolbar': {
                                            minHeight: '10vh',
                                            fontSize: '12px',
                                            height: '20vh'
                                        },
                                        '.MuiTablePagination-select': {
                                            fontSize: '12px'
                                        },
                                        '.MuiTablePagination-displayedRows': {
                                            fontSize: '12px'
                                        }
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </TabPanel>
                </TabContext>
            </Box>
        </>
    )
}