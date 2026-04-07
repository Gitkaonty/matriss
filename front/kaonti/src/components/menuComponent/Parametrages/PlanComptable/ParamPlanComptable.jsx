import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Stack, Box, Tab, Chip, ButtonGroup, Button, Select, MenuItem, TextField, Breadcrumbs, InputAdornment } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { DataGrid, frFR, useGridApiContext, GridRowModes } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import { format } from 'date-fns';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { TbCircleLetterCFilled, TbCircleLetterGFilled, TbCircleLetterAFilled } from "react-icons/tb";
import { DetailsInformation } from '../../../componentsTools/DetailsInformation';
import { BsCheckCircleFill } from "react-icons/bs";
import { PiIdentificationCardFill } from "react-icons/pi";
import { BsPersonFillSlash } from "react-icons/bs";
import { FaGlobeAmericas } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
// import PopupAddNewAccount from '../../../componentsTools/PlanComptable/PopupAddNewAccount';
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { TbRefresh } from "react-icons/tb";

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/CheckCircleOutline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/HighlightOff';


const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';

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
    const [rowModesModel, setRowModesModel] = useState({});

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

    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        borderRadius: 1,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
    };

    const [openDialogAddNewAccount, setOpenDialogAddNewAccount] = useState(false);
    const [typeAction, setTypeAction] = useState('');
    const [isRefresh, setisRefresh] = useState(false);

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

    // Composant d'édition personnalisé pour la colonne baseCompte
    const BaseCompteEditCell = (props) => {
        const { id, field, value, row } = props;
        const [localValue, setLocalValue] = useState('');
        const [openSelect, setOpenSelect] = useState(false);
        const apiRef = useGridApiContext();
        const currentRow = apiRef.current.getRowWithUpdatedValues(id);
        const currentNature = currentRow?.nature ?? row.nature;
        const currentCompte = currentRow?.compte ?? row.compte;

        // console.log('[DEBUG] BaseCompteEditCell: render', { id, value, nature: currentNature, listeCptCollectifLength: listeCptCollectif.length });

        // Synchroniser la valeur avec le state externe
        useEffect(() => {
            // console.log('[DEBUG] BaseCompteEditCell: useEffect value/liste', { value, nature: currentNature });

            if (currentNature === 'General' || currentNature === 'Collectif') {
                const compteValue = currentCompte || '';
                setLocalValue(compteValue);
                apiRef.current.setEditCellValue({ id, field, value: compteValue });
            } else {
                // Pour Auxiliaire: on stocke l'ID (bigint) du collectif dans baseCompte
                if (value != null && value !== '' && listeCptCollectif.length > 0) {
                    const found = listeCptCollectif.find(item => String(item.id) === String(value) || String(item.compte) === String(value));
                    if (found) {
                        // console.log('[DEBUG] BaseCompteEditCell: valeur trouvée', found.compte);
                        setLocalValue(String(found.id));
                        apiRef.current.setEditCellValue({ id, field, value: String(found.id) });
                    } else {
                        // console.log('[DEBUG] BaseCompteEditCell: valeur non trouvée dans liste', value);
                        setLocalValue('');
                        apiRef.current.setEditCellValue({ id, field, value: '' });
                    }
                } else {
                    setLocalValue('');
                }
            }
        }, [value, currentNature, currentCompte, listeCptCollectif]);

        useEffect(() => {
            if (currentNature !== 'Aux' && currentNature !== 'Auxiliaire') {
                setOpenSelect(false);
                return;
            }

            if (listeCptCollectif.length === 0 && !isLoadingCollectif && !loadingCollectifRef.current) {
                recupererListeCptCollectif();
            }

            // Ouvrir automatiquement la liste quand on passe en Aux et qu'il y a des options
            if (listeCptCollectif.length > 0) {
                setOpenSelect(true);
            }
        }, [currentNature, listeCptCollectif.length, isLoadingCollectif]);

        const handleChange = (event) => {
            const newValue = event.target.value;
            // console.log('[DEBUG] BaseCompteEditCell: handleChange', newValue);
            setLocalValue(newValue);
            apiRef.current.setEditCellValue({ id, field, value: newValue });
        };

        // Si nature = General ou Collectif: champ grisé avec le compte
        if (currentNature === 'General' || currentNature === 'Collectif') {
            return (
                <TextField
                    size="small"
                    value={currentCompte || ''}
                    disabled
                    sx={{
                        width: '100%',
                        '& .MuiInputBase-root.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
                        }
                    }}
                />
            );
        }

        // Si nature = Auxiliaire: dropdown des comptes collectifs
        return (
            <Select
                size="small"
                value={localValue || ''}
                onChange={handleChange}
                disabled={isLoadingCollectif}
                open={openSelect}
                onOpen={() => setOpenSelect(true)}
                onClose={() => setOpenSelect(false)}
                displayEmpty
                sx={{ width: '100%' }}
            >
                <MenuItem value="">
                    <em>{isLoadingCollectif ? 'Chargement...' : 'Sélectionner un compte'}</em>
                </MenuItem>
                {listeCptCollectif?.map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                        {item.compte} - {item.libelle}
                    </MenuItem>
                ))}
            </Select>
        );
    };

    // Composant d'affichage pour baseCompte
    const BaseCompteRenderCell = (params) => {
        let displayValue = params.row.baseCompte;
        if (params.row.nature === 'Aux' || params.row.nature === 'Auxiliaire') {
            const found = listeCptCollectif.find((c) => String(c.id) === String(params.row.baseCompte));
            if (found) displayValue = found.compte;
        }
        return (
            <span
                style={{ cursor: 'pointer', width: '100%' }}
                onClick={() => handleShowCptInfos(params.row)}
            >
                {displayValue}
            </span>
        );
    };

    // Gestion du mode édition
    const handleRowModesModelChange = (newRowModesModel) => {
        // console.log('[DEBUG] handleRowModesModelChange:', newRowModesModel);
        if (newRowModesModel && Object.prototype.hasOwnProperty.call(newRowModesModel, 'undefined')) {
            const { undefined: _discard, ...rest } = newRowModesModel;
            setRowModesModel(rest);
            return;
        }
        setRowModesModel(newRowModesModel);
    };

    // Sauvegarder les modifications
    const processRowUpdate = (newRow, oldRow) => {
        console.log('[DEBUG] processRowUpdate: START', {
            newRowId: newRow.id,
            newRowIdType: typeof newRow.id,
            oldRowId: oldRow.id,
            isNew: newRow.isNew,
            hasIsNewProperty: 'isNew' in newRow
        });

        return new Promise((resolve, reject) => {
            try {
                const isNewRow = newRow.isNew === true;

                // Vérifier les données requises
                if (!newRow.compte || !newRow.libelle) {
                    console.error('[DEBUG] processRowUpdate: données manquantes', { compte: newRow.compte, libelle: newRow.libelle });
                    toast.error('Le compte et le libellé sont requis');
                    reject(oldRow);
                    return;
                }

                // Vérifier l'ID pour modification
                if (!isNewRow && !newRow.id) {
                    console.error('[DEBUG] processRowUpdate: ID manquant pour modification', newRow);
                    toast.error('Erreur: ID du compte manquant');
                    reject(oldRow);
                    return;
                }

                // Pour Auxiliaire: baseCompte (ID collectif) obligatoire
                if ((newRow.nature === 'Aux' || newRow.nature === 'Auxiliaire') && (!newRow.baseCompte || String(newRow.baseCompte).trim() === '')) {
                    console.error('[DEBUG] processRowUpdate: baseCompte manquant pour Auxiliaire', { baseCompte: newRow.baseCompte });
                    toast.error('Veuillez sélectionner un compte collectif');
                    reject(oldRow);
                    return;
                }

                const itemId = isNewRow ? 0 : newRow.id;
                // console.log('[DEBUG] processRowUpdate: itemId =', itemId);

                // Quand nature = General ou Collectif: baseCompte doit être le numéro de compte
                // Quand nature = Auxiliaire: baseCompte est l'ID du compte collectif sélectionné
                let baseCptValue = null;
                if (newRow.nature === 'General' || newRow.nature === 'Collectif') {
                    baseCptValue = newRow.compte ? Number(newRow.compte) : null;
                } else if (newRow.baseCompte && String(newRow.baseCompte).trim() !== '') {
                    baseCptValue = Number(newRow.baseCompte);
                }

                const payload = {
                    action: isNewRow ? 'new' : 'modify',
                    itemId: itemId,
                    idCompte: Number(compteId),
                    idDossier: Number(fileId),
                    compte: newRow.compte,
                    libelle: newRow.libelle,
                    nature: newRow.nature,
                    baseCptCollectif: baseCptValue,
                    typeTier: (newRow.nature === 'General' || newRow.nature === 'Collectif') ? 'general' : (newRow.typeTier || 'sans-nif'),
                    nif: newRow.nif || '',
                    stat: newRow.statistique || '',
                    adresse: newRow.adresse || '',
                    motcle: newRow.motcle || '',
                    cin: newRow.cin || '',
                    dateCin: newRow.datecin && newRow.datecin !== 'Invalid date' ? newRow.datecin : null,
                    autrePieceID: newRow.autrepieceid || '',
                    refPieceID: newRow.refpieceid || '',
                    adresseSansNIF: newRow.adressesansnif || '',
                    nifRepresentant: newRow.nifrepresentant || '',
                    adresseEtranger: newRow.adresseetranger || '',
                    pays: newRow.pays || '',
                    province: newRow.province || '',
                    region: newRow.region || '',
                    district: newRow.district || '',
                    commune: newRow.commune || '',
                    listeCptChg: [],
                    listeCptTva: [],
                    typecomptabilite: newRow.typecomptabilite || 'Français',
                    compteautre: newRow.compteautre || '',
                    libelleautre: newRow.libelleautre || ''
                };

                // console.log('[DEBUG] processRowUpdate: envoi API avec payload', { action: payload.action, itemId: payload.itemId });

                axiosPrivate.post(`/paramPlanComptable/AddCpt`, payload)
                    .then((response) => {
                        const resData = response.data;
                        // console.log('[DEBUG] processRowUpdate: réponse API', resData);

                        if (resData.state === true) {
                            toast.success(resData.msg || 'Compte enregistré avec succès');
                            // Mettre à jour avec les nouvelles données d'abord
                            if (!isNewRow && resData?.dataModified) {
                                // Mapper baseaux vers baseCompte pour l'affichage correct
                                const updatedRow = {
                                    ...newRow,
                                    ...resData.dataModified,
                                    baseCompte: resData.dataModified.baseaux || resData.dataModified.baseCompte || newRow.baseCompte
                                };
                                // Mettre à jour le state local immédiatement
                                setPc((prev) => prev.map((row) => row.id === newRow.id ? updatedRow : row));
                                resolve(updatedRow);
                            } else {
                                resolve(newRow);
                            }
                            // Puis rafraîchir la liste complète
                            showPc();
                        } else {
                            console.error('[DEBUG] processRowUpdate: erreur API', resData.msg);
                            toast.error(resData.msg || 'Erreur lors de l\'enregistrement');
                            reject(oldRow);
                        }
                    })
                    .catch((error) => {
                        // Ne pas afficher d'erreur si c'est une annulation (Request aborted)
                        if (error.code === 'ERR_CANCELED' || error.message?.includes('aborted')) {
                            // console.log('[DEBUG] processRowUpdate: requête annulée (normal si changement rapide)');
                            reject(oldRow);
                            return;
                        }
                        console.error('[DEBUG] processRowUpdate: erreur réseau', error);
                        const errMsg = error.response?.data?.message || error.message || "Erreur inconnue";
                        toast.error(errMsg);
                        reject(oldRow);
                    });
            } catch (err) {
                console.error('[DEBUG] processRowUpdate: exception', err);
                toast.error('Erreur inattendue: ' + err.message);
                reject(oldRow);
            }
        });
    };

    // Ajouter une nouvelle ligne
    const handleAddNewRow = () => {
        // Charger les comptes collectifs si ce n'est pas déjà fait
        if (listeCptCollectif.length === 0 && !loadingCollectifRef.current) {
            // console.log('[DEBUG] handleAddNewRow: chargement comptes collectifs avant ajout');
            recupererListeCptCollectif();
        }

        const newId = Date.now(); // ID temporaire
        const newRow = {
            id: newId,
            compte: '',
            libelle: '',
            nature: 'General',
            baseCompte: '',
            isNew: true
        };
        setPc((prev) => [newRow, ...prev]);
        setRowModesModel((prev) => ({
            ...prev,
            [newId]: { mode: 'edit', fieldToFocus: 'compte' }
        }));
    };

    // Modifier une ligne sélectionnée
    const handleEditRow = () => {
        if (selectedRowId != null && selectedRow) {
            // Charger les comptes collectifs si ce n'est pas déjà fait
            if (listeCptCollectif.length === 0 && !loadingCollectifRef.current) {
                // console.log('[DEBUG] handleEditRow: chargement comptes collectifs avant édition');
                recupererListeCptCollectif();
            }
            setRowModesModel((prev) => ({
                ...prev,
                [selectedRowId]: { mode: 'edit', fieldToFocus: 'compte' }
            }));
        } else {
            toast.error('Veuillez sélectionner un compte à modifier');
        }
    };

    // Supprimer une ligne
    const handleDeleteRow = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
            axiosPrivate.post(`/paramPlanComptable/deleteItemPc`, { listId: [id], compteId, fileId })
                .then((response) => {
                    const resData = response.data;
                    if (resData.state) {
                        setPc((prev) => prev.filter((row) => row.id !== id));
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

    const handleOpenDialogAddNewAccount = (type) => {
        setTypeAction(type);
        setOpenDialogAddNewAccount(true);
    }

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
            toast.error(errMsg);
            setSelectedRow(null);
            setSelectedRowId(null);
            setPcAllselectedRow([]);
        }
    }

    const columnHeaderDetail = [
        // {
        //     field: 'id',
        //     headerName: 'ID',
        //     width: 70,
        //     headerAlign: 'left',
        //     align: 'left',
        //     headerClassName: 'grid-header',
        // },
        {
            field: 'compte',
            headerName: 'Compte',
            width: 150,
            editable: true,
            headerAlign: 'left',
            headerClassName: 'grid-header',
            cellClassName: 'cell-compte',
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            width: 300,
            editable: true,
            headerAlign: 'left',
            headerClassName: 'grid-header',
        },
        {
            field: 'nature',
            headerName: 'Nature',
            width: 130,
            editable: true,
            type: 'singleSelect',
            headerAlign: 'center',
            headerClassName: 'grid-header',

            valueOptions: [
                { value: 'General', label: 'Général' },
                { value: 'Collectif', label: 'Collectif' },
                { value: 'Aux', label: 'Auxiliaire' }
            ],
            renderCell: (params) => {
                const value = params.value;

                if (value === 'General') {
                    return (
                        <Chip
                            size="small"
                            label="Général"
                            sx={{
                                width: '100%',
                                fontSize: '12px',
                                height: '24px',
                                backgroundColor: '#48A6A7',
                                color: 'white',
                                fontWeight: 600
                            }}
                        />
                    );
                }

                if (value === 'Collectif') {
                    return (
                        <Chip
                            size="small"
                            label="Collectif"
                            sx={{
                                width: '100%',
                                fontSize: '12px',
                                height: '24px',
                                backgroundColor: '#A6D6D6',
                                color: 'white',
                                fontWeight: 600
                            }}
                        />
                    );
                }

                return (
                    <Chip
                        size="small"
                        label="Auxiliaire"
                        sx={{
                            width: '100%',
                            fontSize: '12px',
                            height: '24px',
                            backgroundColor: '#123458',
                            color: 'white',
                            fontWeight: 600
                        }}
                    />
                );
            }
        },
        {
            field: 'baseCompte',
            headerName: 'Centr. / base aux.',
            width: 175,
            editable: true,
            headerAlign: 'left',
            headerClassName: 'grid-header',
            renderCell: (params) => <BaseCompteRenderCell {...params} />,
            renderEditCell: (params) => <BaseCompteEditCell {...params} />
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 80,
            sortable: false,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            editable: false,
            renderCell: (params) => {
                const isEditing = rowModesModel[params.id]?.mode === GridRowModes.Edit;
                // const isSelected = selectedRowId.includes(params.id);

                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ pr: 1 }}>
                        {isEditing ? (
                            <>
                                <IconButton
                                    onClick={() => {
                                        if (selectedRowId == null) return;
                                        setRowModesModel((prev) => ({
                                            ...prev,
                                            [selectedRowId]: { mode: 'view' }
                                        }));
                                    }}
                                    size="small"
                                    sx={{ color: '#10B981' }}
                                    title="Sauvegarder"
                                >
                                    <SaveIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                                <IconButton
                                    onClick={() => {
                                        if (selectedRowId == null) return;
                                        setRowModesModel((prev) => ({
                                            ...prev,
                                            [selectedRowId]: { mode: 'view', ignoreModifications: true }
                                        }));
                                        if (selectedRow?.isNew) {
                                            setPc((prev) => prev.filter((r) => r.id !== selectedRowId));
                                        }
                                    }}
                                    size="small"
                                    sx={{ color: '#F43F5E' }}
                                    title="Annuler"
                                >
                                    <CancelIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <IconButton
                                    disabled={!canModify || selectedRowId == null}
                                    onClick={handleEditRow}
                                    size="small"
                                    sx={{ color: '#CBD5E1', '&:hover': { color: NAV_DARK } }}
                                    title="Modifier"
                                >
                                    <EditIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                                <IconButton
                                    onClick={handleOpenDialogCptDelete}
                                    size="small"
                                    sx={{ color: '#CBD5E1', '&:hover': { color: '#EF4444' } }}
                                    title="Supprimer"
                                >
                                    <DeleteIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </>
                        )
                        }
                    </Stack>
                );
            },
        },
    ];

    const typeIndex = columnHeaderDetail.findIndex(c => c.field === 'libelle');

    const typeComptabiliteAutre = [
        {
            field: 'compteautre',
            headerName: 'Compte (Autre)',
            type: 'number',
            sortable: true,
            width: 175,
            headerAlign: 'right',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'libelleautre',
            headerName: 'Libelle (Autre)',
            type: 'string',
            sortable: true,
            width: 300,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
    ]

    if (isTypeComptaAutre && typeIndex !== -1) {
        columnHeaderDetail.splice(typeIndex + 1, 0, ...typeComptabiliteAutre)
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


                            <Stack height={"70vh"} width={'100%'} sx={{ mt: 4 }}>
                                <DataGrid
                                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                    disableRowSelectionOnClick
                                    disableSelectionOnClick={true}
                                    // slots={{ toolbar: QuickFilter }}
                                    editMode="row"
                                    rowModesModel={rowModesModel}
                                    onRowModesModelChange={handleRowModesModelChange}
                                    processRowUpdate={processRowUpdate}
                                    onProcessRowUpdateError={(error) => {
                                        console.error('Erreur lors de la sauvegarde:', error);
                                        toast.error('Erreur lors de la sauvegarde');
                                    }}
                                    getRowId={(row) => row.id || row.compte || Math.random().toString()}
                                    rows={filteredPc}
                                    columns={columnHeaderDetail}
                                    checkboxSelection={DataGridStyle.checkboxSelection}
                                    rowSelectionModel={pcAllselectedRow}
                                    onRowSelectionModelChange={(ids) => {
                                        const lastId = ids && ids.length ? ids[ids.length - 1] : null;
                                        listPCSelectedRow(lastId != null ? [lastId] : []);
                                    }}
                                    pageSizeOptions={[50, 100]}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 100 },
                                        },
                                        sorting: {
                                            sortModel: [{ field: 'baseCompte', sort: 'asc' }],
                                        },
                                    }}

                                    /* hauteur identique au Table */
                                    rowHeight={40}
                                    columnHeaderHeight={35}

                                    sx={{
                                        border: '1px solid #F1F5F9',
                                        fontSize: '13px',

                                        /* HEADER */
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#F8FAFC',
                                            borderBottom: '1px solid #E2E8F0',
                                            minHeight: '35px !important',
                                            maxHeight: '35px !important'
                                        },

                                        '& .MuiDataGrid-columnHeaderTitle': {
                                            fontWeight: 800,
                                            fontSize: '10px',
                                            textTransform: 'uppercase',
                                            color: '#94A3B8'
                                        },

                                        '& .MuiDataGrid-columnHeader': {
                                            paddingLeft: '8px',
                                            paddingRight: '8px'
                                        },

                                        /* LIGNES */
                                        '& .MuiDataGrid-row': {
                                            height: '40px !important',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #F1F5F9',
                                            backgroundColor: '#fff'
                                        },

                                        '& .MuiDataGrid-row:hover': {
                                            backgroundColor: '#F1F5F9'
                                        },

                                        /* CELLULES */
                                        '& .MuiDataGrid-cell': {
                                            fontSize: '13px',
                                            color: '#475569',
                                            borderBottom: 'none',
                                            paddingLeft: '8px',
                                            paddingRight: '8px'
                                        },
                                        /* supprimer le focus bleu */
                                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                            outline: 'none'
                                        },

                                        /* checkbox compacte */
                                        '& .MuiCheckbox-root': {
                                            padding: '4px'
                                        },

                                        /* style édition inline */
                                        '& .MuiInputBase-root': {
                                            height: '26px',
                                            fontSize: '12px',
                                            borderRadius: '4px',
                                            backgroundColor: '#fff'
                                        },

                                        '& .MuiDataGrid-virtualScroller': {
                                            maxHeight: '700px'
                                        },
                                        '& .grid-header': {
                                            fontWeight: 800,
                                            fontSize: '10px',
                                            textTransform: 'uppercase',
                                            color: '#94A3B8'
                                        },

                                        '& .cell-compte': {
                                            fontWeight: 700,
                                            color: '#0F172A'
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