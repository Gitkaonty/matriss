import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Stack, Box, Tab, Chip, ButtonGroup, Button, Select, MenuItem, TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { DataGrid, frFR, GridToolbarContainer, useGridApiContext } from '@mui/x-data-grid';
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
        {
            field: 'id',
            headerName: 'ID',
            type: 'number',
            sortable: true,
            width: 70,
            headerAlign: 'right',
            headerClassName: 'HeaderbackColor',
        },
        // {
        //     field: 'dossier',
        //     headerName: 'Dossier',
        //     type: 'string',
        //     sortable: true,
        //     width: 100,
        //     headerAlign: 'left',
        //     align: 'left',
        //     headerClassName: 'HeaderbackColor',
        // },
        {
            field: 'compte',
            headerName: 'Compte',
            type: 'string',
            sortable: true,
            width: 100,
            editable: true,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            width: 300,
            editable: true,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
        },
        // {
        //     field: 'typecomptabilite',
        //     headerName: 'Type comptabilité',
        //     type: 'string',
        //     sortable: true,
        //     width: 150,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor',
        // },
        {
            field: 'nature',
            headerName: 'Nature',
            type: 'singleSelect',
            sortable: true,
            width: 130,
            editable: true,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            valueOptions: [
                { value: 'General', label: 'Général' },
                { value: 'Collectif', label: 'Collectif' },
                { value: 'Aux', label: 'Auxiliaire' }
            ],
            renderCell: (params) => {
                if (params.row.nature === 'General') {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                            <Chip
                                icon={<TbCircleLetterGFilled style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label="Général"

                                style={{
                                    width: "100%",
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#48A6A7',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                } else if (params.row.nature === 'Collectif') {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>

                            <Chip
                                icon={<TbCircleLetterCFilled style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label="Collectif"

                                style={{
                                    width: "100%",
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#A6D6D6',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                } else {
                    return (
                        <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>

                            <Chip
                                icon={<TbCircleLetterAFilled style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
                                label="Auxiliaire"

                                style={{
                                    width: "100%",
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#123458',
                                    color: 'white'
                                }}
                            />
                        </Stack>
                    )
                }
            }
        },
        {
            field: 'baseCompte',
            headerName: 'Centr. / base aux.',
            type: 'string',
            sortable: true,
            width: 175,
            editable: true,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => <BaseCompteRenderCell {...params} />,
            renderEditCell: (params) => <BaseCompteEditCell {...params} />
        },
        // {
        //     field: 'cptcharge',
        //     headerName: 'Cpt charge',
        //     type: 'string',
        //     sortable: true,
        //     width: 100,
        //     headerAlign: 'right',
        //     headerClassName: 'HeaderbackColor',
        //     renderCell: (params) => {
        //         if (params.row.cptcharge === 0) {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <div style={{
        //                         width: 25,
        //                         height: 25,
        //                         backgroundColor: '#DBDBDB',
        //                         borderRadius: 15,
        //                         display: 'flex',
        //                         justifyContent: 'center',
        //                         alignItems: 'center',
        //                     }}>
        //                         {params.row.cptcharge}
        //                     </div>
        //                 </Stack>
        //             )
        //         } else {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <div style={{
        //                         width: 25,
        //                         height: 25,
        //                         backgroundColor: '#FDA403',
        //                         borderRadius: 15,
        //                         display: 'flex',
        //                         justifyContent: 'center',
        //                         alignItems: 'center',
        //                     }}>
        //                         {params.row.cptcharge}
        //                     </div>
        //                 </Stack>

        //             )
        //         }
        //     }
        // },
        // {
        //     field: 'cpttva',
        //     headerName: 'Cpt TVA',
        //     type: 'string',
        //     sortable: true,
        //     width: 100,
        //     headerAlign: 'right',
        //     headerClassName: 'HeaderbackColor',
        //     renderCell: (params) => {
        //         if (params.row.cpttva === 0) {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <div style={{
        //                         width: 25,
        //                         height: 25,
        //                         backgroundColor: '#DBDBDB',
        //                         borderRadius: 15,
        //                         display: 'flex',
        //                         justifyContent: 'center',
        //                         alignItems: 'center',
        //                     }}>
        //                         {params.row.cpttva}
        //                     </div>
        //                 </Stack>
        //             )
        //         } else {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <div style={{
        //                         width: 25,
        //                         height: 25,
        //                         backgroundColor: '#FDA403',
        //                         borderRadius: 15,
        //                         display: 'flex',
        //                         justifyContent: 'center',
        //                         alignItems: 'center',
        //                     }}>
        //                         {params.row.cpttva}
        //                     </div>
        //                 </Stack>

        //             )
        //         }
        //     }
        // },
        // {
        //     field: 'typetier',
        //     headerName: 'Type de tier',
        //     type: 'string',
        //     sortable: true,
        //     width: 130,
        //     headerAlign: 'center',
        //     headerClassName: 'HeaderbackColor',
        //     renderCell: (params) => {
        //         if (params.row.typetier === 'sans-nif') {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <Chip
        //                         icon={<BsPersonFillSlash style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
        //                         label="Sans NIF"

        //                         style={{
        //                             width: "100%",
        //                             display: 'flex', // ou block, selon le rendu souhaité
        //                             justifyContent: 'space-between',
        //                             backgroundColor: '#FF9149',
        //                             color: 'white'
        //                         }}
        //                     />
        //                 </Stack>
        //             )
        //         } else if (params.row.typetier === 'avec-nif') {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <Chip
        //                         icon={<PiIdentificationCardFill style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
        //                         label="Avec NIF"

        //                         style={{
        //                             width: "100%",
        //                             display: 'flex', // ou block, selon le rendu souhaité
        //                             justifyContent: 'space-between',
        //                             backgroundColor: '#006A71',
        //                             color: 'white'
        //                         }}
        //                     />
        //                 </Stack>
        //             )
        //         } else if (params.row.typetier === 'general') {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <Chip
        //                         icon={<BsCheckCircleFill style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
        //                         label="Général"

        //                         style={{
        //                             width: "100%",
        //                             display: 'flex', // ou block, selon le rendu souhaité
        //                             justifyContent: 'space-between',
        //                             backgroundColor: '#67AE6E',
        //                             color: 'white'
        //                         }}
        //                     />
        //                 </Stack>
        //             )
        //         } else if (params.row.typetier === 'etranger') {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <Chip
        //                         icon={<FaGlobeAmericas style={{ color: 'white', width: 18, height: 18, marginLeft: 10 }} />}
        //                         label="Etranger"
        //                         style={{
        //                             width: "100%",
        //                             display: 'flex',
        //                             justifyContent: 'space-between',
        //                             backgroundColor: '#FBA518',
        //                             color: 'white'
        //                         }}
        //                     />
        //                 </Stack>
        //             )
        //         }
        //     }
        // },
        // {
        //     field: 'nif',
        //     headerName: 'Nif',
        //     type: 'string',
        //     sortable: true,
        //     width: 150,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'statistique',
        //     headerName: 'N° statistique',
        //     type: 'string',
        //     sortable: true,
        //     width: 200,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'adresse',
        //     headerName: 'Adresse',
        //     type: 'string',
        //     sortable: true,
        //     width: 250,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'cin',
        //     headerName: 'CIN',
        //     type: 'string',
        //     sortable: true,
        //     width: 150,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'datecin',
        //     headerName: 'Date CIN',
        //     type: 'text',
        //     sortable: true,
        //     width: 120,
        //     headerAlign: 'center',
        //     headerClassName: 'HeaderbackColor',
        //     renderCell: (params) => {
        //         if (params.row.datecin !== null) {
        //             return (
        //                 <Stack width={'100%'} style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        //                     <div>{format(params.row.datecin, "dd/MM/yyyy")}</div>
        //                 </Stack>
        //             )
        //         }
        //     }
        // },
        // {
        //     field: 'autrepieceid',
        //     headerName: 'Autre pièces Ident.',
        //     type: 'text',
        //     sortable: true,
        //     width: 200,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'refpieceid',
        //     headerName: 'Réf pièces Ident.',
        //     type: 'text',
        //     sortable: true,
        //     width: 200,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'adressesansnif',
        //     headerName: 'Adresse CIN',
        //     type: 'text',
        //     sortable: true,
        //     width: 250,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'nifrepresentant',
        //     headerName: 'NIF représentant',
        //     type: 'text',
        //     sortable: true,
        //     width: 175,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'addresseetranger',
        //     headerName: 'Adresse représentant',
        //     type: 'text',
        //     sortable: true,
        //     width: 250,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'pays',
        //     headerName: 'Pays',
        //     type: 'text',
        //     sortable: true,
        //     width: 150,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'province',
        //     headerName: 'Province',
        //     type: 'string',
        //     sortable: true,
        //     width: 150,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'region',
        //     headerName: 'Région',
        //     type: 'string',
        //     sortable: true,
        //     width: 150,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'district',
        //     headerName: 'District',
        //     type: 'string',
        //     sortable: true,
        //     width: 150,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'commune',
        //     headerName: 'Commune',
        //     type: 'string',
        //     sortable: true,
        //     width: 180,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // },
        // {
        //     field: 'motcle',
        //     headerName: 'Mot clé',
        //     type: 'string',
        //     sortable: true,
        //     width: 150,
        //     headerAlign: 'left',
        //     headerClassName: 'HeaderbackColor'
        // }
    ]

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
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList aria-label="lab API tabs example">
                            <Tab
                                style={{
                                    textTransform: 'none',
                                    outline: 'none',
                                    border: 'none',
                                    margin: -5
                                }}
                                label={InfoFileStyle(fileInfos?.dossier)} value="1"
                            />
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <Stack width={"100%"} height={"90%"} spacing={0.5} alignItems={"flex-start"} justifyContent={"stretch"}>
                            <Typography variant='h7' sx={{ color: "black" }} align='left'>Paramétrages : Plan comptable</Typography>
                            <Stack width={"100%"} height={"30px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                direction={"row"} style={{ marginLeft: "0px", marginTop: "30px", justifyContent: "right" }}>

                                <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                    direction={"row"} justifyContent={"right"}>
                                    {
                                        consolidation && (
                                            <Tooltip title="Actualiser les comptes">
                                                <span>
                                                    <IconButton
                                                        // disabled={statutDeleteButton}  
                                                        onClick={handleActualize}
                                                        variant="contained"
                                                        style={{
                                                            width: "35px", height: '35px',
                                                            borderRadius: "5px", borderColor: "transparent",
                                                            backgroundColor: initial.add_new_line_bouton_color,
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        )
                                    }
                                    <ButtonGroup
                                        variant="outlined"
                                        sx={{
                                            boxShadow: 'none',
                                            display: 'flex',
                                            gap: '2px',
                                            '& .MuiButton-root': {
                                                borderRadius: 0,
                                            },
                                            '& .MuiButtonGroup-grouped': {
                                                boxShadow: 'none',
                                                outline: 'none',
                                                borderColor: 'inherit',
                                                marginLeft: 0,
                                                borderRadius: 1,
                                                border: 'none',
                                            },
                                            '& .MuiButtonGroup-grouped:hover': {
                                                boxShadow: 'none',
                                                borderColor: 'inherit',
                                            },
                                            '& .MuiButtonGroup-grouped.Mui-focusVisible': {
                                                boxShadow: 'none',
                                                borderColor: 'inherit',
                                            },
                                        }}
                                    >
                                        <Tooltip title="Ajouter un nouveau compte">
                                            <span>
                                                <Button
                                                    disabled={!canAdd}
                                                    onClick={handleAddNewRow}
                                                    sx={{
                                                        ...buttonStyle,
                                                        backgroundColor: initial.auth_gradient_end,
                                                        color: 'white',
                                                        borderColor: initial.auth_gradient_end,
                                                        '&:hover': {
                                                            backgroundColor: initial.auth_gradient_end,
                                                            boxShadow: 'none',
                                                            border: 'none',
                                                        },
                                                        '&:focus': {
                                                            backgroundColor: initial.auth_gradient_end,
                                                            boxShadow: 'none',
                                                        },
                                                        '&.Mui-disabled': {
                                                            backgroundColor: initial.auth_gradient_end,
                                                            color: 'white',
                                                            cursor: 'not-allowed',
                                                            border: 'none',
                                                        },
                                                        '&::before': {
                                                            display: 'none',
                                                        },
                                                    }}
                                                >
                                                    Ajouter
                                                </Button>
                                            </span>
                                        </Tooltip>

                                        <Tooltip title="Modifier le compte sélectionné">
                                            <span>
                                                <Button
                                                    disabled={!canModify || selectedRowId == null}
                                                    onClick={handleEditRow}
                                                    sx={{
                                                        ...buttonStyle,
                                                        backgroundColor: initial.auth_gradient_end,
                                                        color: 'white',
                                                        borderColor: initial.auth_gradient_end,
                                                        '&:hover': {
                                                            backgroundColor: initial.auth_gradient_end,
                                                            boxShadow: 'none',
                                                            border: 'none',
                                                        },
                                                        '&.Mui-disabled': {
                                                            backgroundColor: initial.auth_gradient_end,
                                                            color: 'white',
                                                            cursor: 'not-allowed',
                                                            border: 'none',
                                                        },
                                                    }}
                                                >
                                                    Modifier
                                                </Button>
                                            </span>
                                        </Tooltip>

                                       
                                                <Tooltip title="Sauvegarder">
                                                    <span>
                                                        <Button
                                                            onClick={() => {
                                                                if (selectedRowId == null) return;
                                                                setRowModesModel((prev) => ({
                                                                    ...prev,
                                                                    [selectedRowId]: { mode: 'view' }
                                                                }));
                                                            }}
                                                            sx={{
                                                                ...buttonStyle,
                                                                backgroundColor: '#4caf50',
                                                                color: 'white',
                                                                borderColor: '#4caf50',
                                                                '&:hover': {
                                                                    backgroundColor: '#4caf50',
                                                                    boxShadow: 'none',
                                                                    border: 'none',
                                                                },
                                                            }}
                                                        >
                                                            Sauvegarder
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Annuler">
                                                    <span>
                                                        <Button
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
                                                            sx={{
                                                                ...buttonStyle,
                                                                backgroundColor: initial.annuler_bouton_color,
                                                                color: 'white',
                                                                borderColor: initial.annuler_bouton_color,
                                                                '&:hover': {
                                                                    backgroundColor: initial.annuler_bouton_color,
                                                                    boxShadow: 'none',
                                                                    border: 'none',
                                                                },
                                                            }}
                                                        >
                                                            Annuler
                                                        </Button>
                                                    </span>
                                                </Tooltip>                                       

                                        <Tooltip title="Supprimer le compte sélectionné">
                                            <span>
                                                <Button
                                                    disabled={!canDelete || selectedRowId == null}
                                                    onClick={handleOpenDialogCptDelete}
                                                    sx={{
                                                        ...buttonStyle,
                                                        backgroundColor: initial.annuler_bouton_color,
                                                        color: 'white',
                                                        borderColor: initial.annuler_bouton_color,
                                                        '&:hover': {
                                                            backgroundColor: initial.annuler_bouton_color,
                                                            border: 'none',
                                                        },
                                                        '&.Mui-disabled': {
                                                            backgroundColor: initial.annuler_bouton_color,
                                                            color: 'white',
                                                            cursor: 'not-allowed',
                                                            border: 'none',
                                                        },
                                                    }}
                                                >
                                                    Supprimer
                                                </Button>
                                            </span>
                                        </Tooltip>
                                    </ButtonGroup>
                                </Stack>
                            </Stack>
                            <Stack height={"70vh"} width={'100%'}>
                                <DataGrid
                                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                    disableRowSelectionOnClick
                                    disableSelectionOnClick={true}
                                    slots={{ toolbar: QuickFilter }}
                                    editMode="row"
                                    rowModesModel={rowModesModel}
                                    onRowModesModelChange={handleRowModesModelChange}
                                    processRowUpdate={processRowUpdate}
                                    onProcessRowUpdateError={(error) => {
                                        console.error('Erreur lors de la sauvegarde:', error);
                                        toast.error('Erreur lors de la sauvegarde');
                                    }}
                                    slotProps={{
                                        row: {
                                            onMouseEnter: (event) => {
                                                event.stopPropagation();
                                            },
                                        },
                                    }}
                                    sx={{
                                        ...DataGridStyle.sx,
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: initial.tableau_theme,
                                            color: initial.text_theme,
                                        },
                                        '& .MuiDataGrid-columnHeaderTitle': {
                                            color: initial.text_theme,
                                            fontWeight: 600,
                                        },
                                        '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                            color: initial.text_theme,
                                        },
                                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                            outline: 'none',
                                            border: 'none',
                                        },
                                        '& .highlight-separator': {
                                            borderBottom: '1px solid red'
                                        },
                                        '& .MuiDataGrid-row.highlight-separator': {
                                            borderBottom: '1px solid red',
                                        },
                                        '& .MuiDataGrid-virtualScroller': {
                                            maxHeight: '700px',
                                        },
                                    }}
                                    rowHeight={DataGridStyle.rowHeight}
                                    columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                    getRowId={(row) => row.id || row.compte || Math.random().toString()}
                                    onRowSelectionModelChange={ids => {
                                        const lastId = ids && ids.length ? ids[ids.length - 1] : null;
                                        listPCSelectedRow(lastId != null ? [lastId] : []);
                                    }}
                                    rowSelectionModel={pcAllselectedRow}
                                    rows={pc}
                                    columns={columnHeaderDetail}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 100 },
                                        },
                                    }}
                                    experimentalFeatures={{ columnPinning: true }}
                                    pageSizeOptions={[50, 100]}
                                    pagination={DataGridStyle.pagination}
                                    checkboxSelection={DataGridStyle.checkboxSelection}
                                    columnVisibilityModel={{
                                        id: false,
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
