import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Typography, Stack, Box, Tab, Chip, Button, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, IconButton, InputAdornment, Breadcrumbs } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
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
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { TbRefresh } from "react-icons/tb";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';
const BORDER_COLOR = '#E2E8F0';

export default function ParamPlanComptable() {
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const axiosPrivate = useAxiosPrivate();

    let initial = init[0];
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const compte = searchParams.get("compte");

    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded?.UserInfo?.compteId || 0;

    const [pc, setPc] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [openDialogDeleteItemsPc, setOpenDialogDeleteItemsPc] = useState(false);
    const { id } = useParams();

    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        borderRadius: 1,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
    };

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

    const handleOpenDialogCptDelete = () => {
        setOpenDialogDeleteItemsPc(true);
    }

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
        })
    }

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
                            acc[k] = r;
                        }
                        return acc;
                    }, {})
                );
                setPc(unique);
            } else {
                toast.error(resData.msg);
            }
        })
    }

    const handleAddNewRow = () => {
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
        setSelectedRowId(newId);
        setSelectedRow(newRow);
    };

    const handleEditRow = (id) => {
        const row = pc.find(r => r.id === id);
        setEditingId(id);
        setSelectedRowId(id);
        setSelectedRow(row);
    };

    const handleCancelEdit = () => {
        if (selectedRow?.isNew) {
            setPc((prev) => prev.filter((row) => row.id !== selectedRowId));
        }
        setEditingId(null);
    };

    const handleSaveRow = (row) => {
        const isNewRow = row.isNew === true;
        if (!row.compte || !row.libelle) {
            toast.error('Le compte et le libellé sont requis');
            return;
        }

        const payload = {
            action: isNewRow ? 'new' : 'modify',
            itemId: isNewRow ? 0 : row.id,
            idCompte: Number(compteId),
            idDossier: Number(fileId),
            compte: row.compte,
            libelle: row.libelle,
            nature: row.nature,
            baseCptCollectif: row.baseCompte ? Number(row.baseCompte) : null,
            typeTier: 'general',
            nif: row.nif || '',
            stat: row.statistique || '',
            adresse: row.adresse || '',
            motcle: row.motcle || '',
            cin: row.cin || '',
            dateCin: row.datecin || null,
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

        axiosPrivate.post(`/paramPlanComptable/AddCpt`, payload)
            .then((response) => {
                const resData = response.data;
                if (resData.state === true) {
                    toast.success(resData.msg || 'Compte enregistré avec succès');
                    setEditingId(null);
                    showPc();
                } else {
                    toast.error(resData.msg || 'Erreur lors de l\'enregistrement');
                }
            })
            .catch((error) => {
                const errMsg = error.response?.data?.message || error.message || "Erreur inconnue";
                toast.error(errMsg);
            });
    };

    const handleDeleteRow = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
            axiosPrivate.post(`/paramPlanComptable/deleteItemPc`, { listId: [id], compteId, fileId })
                .then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setPc((prev) => prev.filter((row) => row.id !== id));
                        setSelectedRowId(null);
                        setSelectedRow(null);
                        toast.success(resData.msg || 'Compte supprimé avec succès');
                    } else {
                        toast.error(resData.msg || 'Erreur lors de la suppression');
                    }
                })
                .catch((error) => {
                    const errMsg = error.response?.data?.message || error.message || "Erreur inconnue";
                    toast.error(errMsg);
                });
        }
    };

    const deleteItemsPC = (value) => {
        if (value === true) {
            if (selectedRowId) {
                handleDeleteRow(selectedRowId);
                setOpenDialogDeleteItemsPc(false);
            } else {
                toast.error("Veuillez sélectionner un compte à supprimer.");
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
        }
    }, [fileId, compteId, compte]);

    const filteredAccounts = pc.filter(row =>
        row.compte?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getNatureChip = (nature) => {
        if (nature === 'General') {
            return (
                <Chip
                    label="Général"
                    size="small"
                    sx={{ height: '20px', fontSize: '10px', fontWeight: 700, bgcolor: '#48A6A7', color: 'white' }}
                />
            );
        } else if (nature === 'Collectif') {
            return (
                <Chip
                    label="Collectif"
                    size="small"
                    sx={{ height: '20px', fontSize: '10px', fontWeight: 700, bgcolor: '#A6D6D6', color: NAV_DARK }}
                />
            );
        } else {
            return (
                <Chip
                    label="Auxiliaire"
                    size="small"
                    sx={{ height: '20px', fontSize: '10px', fontWeight: 700, bgcolor: '#123458', color: 'white' }}
                />
            );
        }
    };

    return (
        <>
            {noFile && <PopupTestSelectedFile confirmationState={sendToHome} />}
            {openDialogDeleteItemsPc && canDelete && (
                <PopupConfirmDelete
                    msg={"Voulez-vous vraiment supprimer ce compte ?"}
                    confirmationState={deleteItemsPC}
                />
            )}
            <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
                <TabContext value={"1"}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList>
                            <Tab
                                sx={{ textTransform: 'none', outline: 'none', border: 'none', m: -0.5 }}
                                label={InfoFileStyle(fileInfos?.dossier)}
                                value="1"
                            />
                        </TabList>
                    </Box>
                    <TabPanel value="1" sx={{ p: 3 }}>
                        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />} sx={{ mb: 1 }}>
                            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Paramétrages</Typography>
                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: NAV_DARK }}>Plan comptable</Typography>
                        </Breadcrumbs>

                        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B', letterSpacing: '-1px', fontSize: '28px' }}>
                                Plan Comptable
                            </Typography>

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    placeholder="Rechercher un compte..."
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment>),
                                    }}
                                    sx={{
                                        width: 250,
                                        '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#fff', height: '32px', fontSize: '12px' }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                                    onClick={handleAddNewRow}
                                    disabled={!canAdd}
                                    sx={{ bgcolor: '#10B981', color: '#fff', textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: '32px', fontSize: '12px', '&:hover': { bgcolor: '#059669' } }}
                                >
                                    Ajouter
                                </Button>
                            </Stack>
                        </Stack>

                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${BORDER_COLOR}`, width: '100%' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow sx={{ height: '35px' }}>
                                        <TableCell padding="checkbox" sx={{ width: '40px' }}>
                                            <Checkbox size="small" checked={false} />
                                        </TableCell>
                                        <TableCell sx={headerStyle(100)}>Compte</TableCell>
                                        <TableCell sx={headerStyle(400)}>Libellé</TableCell>
                                        <TableCell sx={headerStyle(120)}>Nature</TableCell>
                                        <TableCell sx={headerStyle(140)}>Centr. / Base</TableCell>
                                        <TableCell align="right" sx={headerStyle(120, true)}>Actions</TableCell>
                                        <TableCell sx={{ bgcolor: '#F8FAFC' }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAccounts.map((row) => {
                                        const isEditing = editingId === row.id;
                                        const isSelected = selectedRowId === row.id;
                                        return (
                                            <TableRow
                                                key={row.id}
                                                selected={isSelected}
                                                onClick={() => {
                                                    setSelectedRowId(row.id);
                                                    setSelectedRow(row);
                                                }}
                                                sx={{ '&:hover': { bgcolor: '#F1F5F9' }, height: '40px', cursor: 'pointer' }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox size="small" checked={isSelected} />
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            defaultValue={row.compte}
                                                            sx={inlineEditStyle}
                                                            onChange={(e) => row.compte = e.target.value}
                                                        />
                                                    ) : (
                                                        <Typography sx={{ fontWeight: 700, fontSize: '13px' }}>{row.compte}</Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            defaultValue={row.libelle}
                                                            sx={inlineEditStyle}
                                                            onChange={(e) => row.libelle = e.target.value}
                                                        />
                                                    ) : (
                                                        <Typography sx={{ fontSize: '13px', color: '#475569' }}>{row.libelle}</Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            defaultValue={row.nature}
                                                            sx={inlineEditStyle}
                                                            onChange={(e) => row.nature = e.target.value}
                                                        />
                                                    ) : (
                                                        getNatureChip(row.nature)
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            defaultValue={row.baseCompte || ''}
                                                            sx={inlineEditStyle}
                                                            onChange={(e) => row.baseCompte = e.target.value}
                                                        />
                                                    ) : (
                                                        <Typography sx={{ fontSize: '13px', color: '#64748B' }}>{row.baseCompte}</Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={0} justifyContent="flex-end">
                                                        {isEditing ? (
                                                            <>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleSaveRow(row)}
                                                                    disabled={!canModify && !canAdd}
                                                                    sx={{ color: '#10B981' }}
                                                                >
                                                                    <CheckIcon fontSize="inherit" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={handleCancelEdit}
                                                                    sx={{ color: '#EF4444' }}
                                                                >
                                                                    <CloseIcon fontSize="inherit" />
                                                                </IconButton>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditRow(row.id)}
                                                                    disabled={!isSelected || !canModify}
                                                                    sx={{ color: isSelected ? '#64748B' : '#CBD5E1' }}
                                                                >
                                                                    <EditIcon fontSize="inherit" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteRow(row.id)}
                                                                    disabled={!isSelected || !canDelete}
                                                                    sx={{ color: isSelected ? '#64748B' : '#CBD5E1' }}
                                                                >
                                                                    <DeleteIcon fontSize="inherit" />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell />
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                </TabContext>
            </Box>
        </>
    );
}

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
