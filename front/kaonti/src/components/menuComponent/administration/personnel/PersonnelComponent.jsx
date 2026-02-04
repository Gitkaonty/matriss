import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, IconButton, FormControl, Input, Checkbox, Select, MenuItem } from '@mui/material';
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { TfiSave } from "react-icons/tfi";
import { VscClose } from "react-icons/vsc";
import { IoMdTrash } from "react-icons/io";
import Tooltip from '@mui/material/Tooltip';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { init } from '../../../../../init';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes, useGridApiRef } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast'; import { useFormik } from 'formik';
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../../config/axiosPrivate';

export default function PersonnelComponent() {
    const apiRef = useGridApiRef();
    const { canAdd, canModify, canDelete, canView } = usePermission();

    const axiosPrivate = useAxiosPrivate();

    const initial = init[0];
    const { id } = useParams();
    const [fileId, setFileId] = useState(0);
    const [fileInfos, setFileInfos] = useState('');
    const [noFile, setNoFile] = useState(false);
    const [rows, setRows] = useState([]);
    const [fonctions, setFonctions] = useState([]);
    const [classifications, setClassifications] = useState([]);
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded?.UserInfo?.compteId || null;
    const userId = decoded?.UserInfo?.userId || null;
    const navigate = useNavigate();
    const [editableRow, setEditableRow] = useState(true);

    const [rowModesModel, setRowModesModel] = useState({});
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);

    const [submitAttempt, setSubmitAttempt] = useState(false);

    const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);

    const [selectedRow, setSelectedRow] = useState([]);

    // récupération infos de dossier sélectionné
    useEffect(() => {
        const navigationEntries = performance.getEntriesByType('navigation');
        let idFile = id;
        if (!idFile) {
            // Si pas d'id dans l'URL, on prend le sessionStorage
            idFile = sessionStorage.getItem("fileId");
        } else {
            // Si id dans l'URL, on le stocke dans le sessionStorage
            sessionStorage.setItem('fileId', idFile);
        }
        setFileId(idFile);
        if (!idFile) {
            setNoFile(true);
            setFileInfos([]);
            return;
        }
        GetInfosIdDossier(idFile);
    }, [id]);

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

    const sendToHome = (value) => {
        setNoFile(!value);
        navigate('/tab/home');
    }

    const isEditable = (row) => {
        if (!row) return false;
        return classifications.some(c => c.id === row.id_classe);
    };

    // Helper: format CIN as 12 digits grouped by 3 (e.g., 101 234 567 890)
    const formatCin = (value) => {
        const digits = String(value ?? '').replace(/\D/g, '');
        // Group digits every 3 with spaces
        return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
    };

    const formNewParam = useFormik({
        initialValues: {
            idParam: 0,
            compteId: compteId,
            fileId: fileId,
            matricule: '',
            nom: '',
            prenom: '',
            id_fonction: '',
            id_classe: '',
            numero_cnaps: '',
            cin_ou_carte_resident: '',
            nombre_enfants_charge: '',
            date_entree: '',
            date_sortie: '',
            actif: true
        },
        // validationSchema: Yup.object({
        //     nature: Yup.string().required("Ce champ est obligatoire"),
        //     senscalcul: Yup.string().required("Ce champ est obligatoire"),
        //     condition: Yup.string().required("Ce champ est obligatoire"),
        //     equation: Yup.string().required("Ce champ est obligatoire")
        // }),
        onSubmit: (values) => {

        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        formNewParam.setFieldValue(name, value);
    };

    const handleCheckboxChange = (value) => {
        formNewParam.setFieldValue("actif", value);
    }

    const isRequiredEmpty = (name) => {
        const v = formNewParam.values[name];
        return submitAttempt && (v === '' || v === null || v === undefined);
    };

    const personnelsColumns = [
        {
            field: 'id',
            headerName: 'ID',
            flex: 3,
            editable: false
        },
        {
            field: 'matricule',
            headerName: 'Matricule',
            flex: 3,
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%', backgroundColor: isRequiredEmpty('matricule') ? '#F8D7DA' : 'transparent', border: isRequiredEmpty('matricule') ? '1px solid #F5C2C7' : '1px solid transparent', borderRadius: '4px' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='matricule'
                            type="text"
                            value={formNewParam.values.matricule}
                            onChange={handleChange}
                            label="matricule"
                            disableUnderline={true}
                        // disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'nom',
            headerName: 'Nom',
            flex: 3,
            // editable:
            //     (params) => isEditable(params.row)
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%', backgroundColor: isRequiredEmpty('nom') ? '#F8D7DA' : 'transparent', border: isRequiredEmpty('nom') ? '1px solid #F5C2C7' : '1px solid transparent', borderRadius: '4px' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='nom'
                            type="text"
                            value={formNewParam.values.nom}
                            onChange={handleChange}
                            label="nom"
                            disableUnderline={true}
                        // disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'prenom',
            headerName: 'Prénom',
            flex: 3,
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%', backgroundColor: isRequiredEmpty('prenom') ? '#F8D7DA' : 'transparent', border: isRequiredEmpty('prenom') ? '1px solid #F5C2C7' : '1px solid transparent', borderRadius: '4px' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='prenom'
                            type="text"
                            value={formNewParam.values.prenom}
                            onChange={handleChange}
                            label="prenom"
                            disableUnderline={true}
                        // disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'id_fonction',
            headerName: 'Fonction',
            flex: 3,
            editable: editableRow,
            renderCell: (params) => {
                const found = fonctions.find(f => f.id === params.value);
                return found ? found.nom : '';
            },
            renderEditCell: (params) => {
                const handleSelectChange = (e) => {
                    const value = e.target.value;

                    formNewParam.setFieldValue('id_fonction', value);

                    params.api.setEditCellValue({ id: params.id, field: params.field, value });
                };

                return (
                    <FormControl fullWidth style={{ height: '100%', backgroundColor: isRequiredEmpty('id_fonction') ? '#F8D7DA' : 'transparent', border: isRequiredEmpty('id_fonction') ? '1px solid #F5C2C7' : '1px solid transparent', borderRadius: '4px' }}>
                        <Select
                            variant="standard"
                            disableUnderline
                            name="id_fonction"
                            value={formNewParam.values.id_fonction || ''}
                            onChange={handleSelectChange}
                            style={{ height: '100%' }}
                        >
                            {fonctions.map((f) => (
                                <MenuItem key={f.id} value={f.id}>
                                    {f.nom}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            },
        },
        {
            field: 'id_classe',
            headerName: 'Classification',
            flex: 3,
            editable: editableRow,
            renderCell: (params) => {
                const found = classifications.find(c => c.id === params.value);
                return found ? found.classe : '';
            },
            renderEditCell: (params) => {
                const handleSelectChange = (e) => {
                    const value = e.target.value;
                    formNewParam.setFieldValue('id_classe', value);
                    params.api.setEditCellValue({ id: params.id, field: params.field, value });
                };

                return (
                    <FormControl fullWidth sx={{ height: '100%' }} style={{ backgroundColor: isRequiredEmpty('id_classe') ? '#F8D7DA' : 'transparent', border: isRequiredEmpty('id_classe') ? '1px solid #F5C2C7' : '1px solid transparent', borderRadius: '4px' }}>
                        <Select
                            variant="standard"
                            disableUnderline
                            name="id_classe"
                            value={formNewParam.values.id_classe || ''}
                            onChange={handleSelectChange}
                            sx={{
                                height: '100%',
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%',
                                },
                            }}
                        >
                            {classifications.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.classe}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            },
        },
        {
            field: 'numero_cnaps',
            headerName: 'Numéro CNaPS',
            flex: 3,
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='numero_cnaps'
                            type="text"
                            value={formNewParam.values.numero_cnaps}
                            onChange={handleChange}
                            label="numero_cnaps"
                            disableUnderline={true}
                        // disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'cin_ou_carte_resident',
            headerName: 'CIN ou Carte de résident',
            flex: 3,
            valueFormatter: (params) => formatCin(params.value),
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='cin_ou_carte_resident'
                            type="text"
                            value={formNewParam.values.cin_ou_carte_resident}
                            onChange={handleChange}
                            label="cin_ou_carte_resident"
                            disableUnderline={true}
                        // disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'nombre_enfants_charge',
            headerName: 'Nb enfants',
            flex: 1.5,
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            style={{
                                height: '100%', alignItems: 'center',
                                outline: 'none',
                            }}
                            name='nombre_enfants_charge'
                            type="number"
                            value={formNewParam.values.nombre_enfants_charge}
                            onChange={handleChange}
                            label="nombre_enfants_charge"
                            disableUnderline={true}
                        // disabled={disableDefaultFieldModif}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'date_entree',
            headerName: 'Date entrée',
            flex: 3,
            renderCell: (params) => {
                if (!params.value) return '';
                const date = new Date(params.value);
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            },
            editable: editableRow,
            renderEditCell: (params) => {
                const { id, field, value, api } = params;

                const handleChange = (e) => {
                    api.setEditCellValue({ id, field, value: e.target.value });
                    formNewParam.setFieldValue(field, e.target.value);
                };

                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            type="date"
                            name="date_entree"
                            value={value ? value.substring(0, 10) : ''}
                            onChange={handleChange}
                            disableUnderline
                            style={{ height: '100%', outline: 'none' }}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'date_sortie',
            headerName: 'Date sortie',
            flex: 3,
            renderCell: (params) => {
                if (!params.value) return '';
                const date = new Date(params.value);
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            },
            editable: editableRow,
            renderEditCell: (params) => {
                const { id, field, value, api } = params;

                const handleChange = (e) => {
                    api.setEditCellValue({ id, field, value: e.target.value });
                    formNewParam.setFieldValue(field, e.target.value);
                };

                return (
                    <FormControl fullWidth style={{ height: '100%' }}>
                        <Input
                            type="date"
                            name="date_sortie"
                            value={value ? value.substring(0, 10) : ''}
                            onChange={handleChange}
                            disableUnderline
                            style={{ height: '100%', outline: 'none' }}
                        />
                    </FormControl>
                );
            },
        },
        {
            field: 'actif',
            headerName: 'Actif',
            flex: 1,
            type: 'boolean',
            editable: editableRow,
            renderEditCell: (params) => {
                return (
                    <Checkbox
                        checked={formNewParam.values.actif}
                        type="checkbox"
                        name='actif'
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                    />
                );
            },
        },
    ];

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    }

    const fetchPersonnels = () => {
  axios.get(`/administration/personnel/${Number(compteId)}/${Number(id)}`)
    .then(res => {
      const data = Array.isArray(res.data.list) ? res.data.list.map((item, idx) => ({
        id: item.id || idx + 1,
        matricule: item.matricule,
        nom: item.nom,
        prenom: item.prenom,
        id_fonction: item.id_fonction,
        id_classe: item.id_classe,
        date_entree: item.date_entree,
        date_sortie: item.date_sortie,
        actif: item.actif,
        numero_cnaps: item.numero_cnaps,
        cin_ou_carte_resident: item.cin_ou_carte_resident,
        nombre_enfants_charge: item.nombre_enfants_charge
      })) : [];
      console.log('PERSONNELS APRES FETCH', data);
      setRows(data);
    })
    .catch(() => setRows([]));
};

    useEffect(() => {
        if (canView) {
            fetchPersonnels();
        }
        axios.get(`/parametres/fonction/${compteId}/${id}`).then(res => setFonctions(res.data.list || []));
        let dossierId = id;
        if (!dossierId) {
            dossierId = sessionStorage.getItem("fileId");
        }
        if (!dossierId) return;
        console.log("Appel API classifications sur dossier", dossierId);
        axios.get(`/parametres/classification/dossier/${Number(compteId)}/${Number(dossierId)}`).then(res => {
            console.log("Réponse API classifications", res.data);
            setClassifications(res.data.list || []);
        });
    }, [id]);

    // Sélection d'une ligne
    const saveSelectedRow = (ids) => {
        if (ids.length === 1) {
            setSelectedRowId(ids);
            setDisableModifyBouton(false);
            setDisableSaveBouton(true);
            setDisableCancelBouton(false);
            setDisableDeleteBouton(false);
        } else {
            setSelectedRowId([]);
            setDisableModifyBouton(true);
            setDisableSaveBouton(false);
            setDisableCancelBouton(true);
            setDisableDeleteBouton(true);
        }
    }

    // Edition
    const handleEditClick = (ids) => () => {
        // ids est normalement selectedRowId (un tableau d'IDs)
        if (!Array.isArray(ids) || ids.length !== 1) {
            toast.error("Veuillez sélectionner une seule ligne à modifier.");
            return;
        }

        const rowId = ids[0];
        const selectedRowInfos = rows.find(r => r.id === rowId);

        if (!selectedRowInfos) {
            toast.error("Ligne sélectionnée introuvable.");
            return;
        }

        // setEditRow(row);
        // setNewRow(null);
        formNewParam.setFieldValue('idParam', selectedRowInfos.id ?? null);
        formNewParam.setFieldValue('compteId', compteId);
        formNewParam.setFieldValue('fileId', fileId);
        formNewParam.setFieldValue('matricule', selectedRowInfos.matricule ?? '');
        formNewParam.setFieldValue('nom', selectedRowInfos.nom ?? '');
        formNewParam.setFieldValue('prenom', selectedRowInfos.prenom ?? '');
        formNewParam.setFieldValue('id_fonction', selectedRowInfos.id_fonction ?? null);
        formNewParam.setFieldValue('id_classe', selectedRowInfos.id_classe ?? null);
        formNewParam.setFieldValue('numero_cnaps', selectedRowInfos.numero_cnaps ?? '');
        formNewParam.setFieldValue('cin_ou_carte_resident', selectedRowInfos.cin_ou_carte_resident ?? '');
        formNewParam.setFieldValue('nombre_enfants_charge', selectedRowInfos.nombre_enfants_charge ?? 0);
        formNewParam.setFieldValue('date_entree', selectedRowInfos.date_entree ?? '');
        formNewParam.setFieldValue('date_sortie', selectedRowInfos.date_sortie ?? '');
        formNewParam.setFieldValue('actif', selectedRowInfos.actif ?? false);

        setRowModesModel({ ...rowModesModel, [rowId]: { mode: GridRowModes.Edit } });
        setDisableSaveBouton(false);
    };

    const handleCellEditCommit = (params) => {
        if (selectedRowId.length > 1 || selectedRowId.length === 0) {
            setEditableRow(false);
            setDisableModifyBouton(true);
            setDisableSaveBouton(true);
            setDisableCancelBouton(true);
            toast.error("Sélectionnez une seule ligne pour pouvoir la modifier");
        } else {
            setDisableModifyBouton(false);
            setDisableSaveBouton(false);
            setDisableCancelBouton(false);
            if (!selectedRowId.includes(params.id)) {
                setEditableRow(false);
                toast.error("Sélectionnez une ligne pour pouvoir la modifier");
            } else {
                setEditableRow(true);
            }
        }
    };

    // Ajout
    const handleOpenDialogAddNewAssocie = () => {
        // if (newRow) return;

        setDisableModifyBouton(false);
        setDisableCancelBouton(false);
        setDisableDeleteBouton(false);
        setDisableSaveBouton(false);
        setSubmitAttempt(false);

        // id temporaire pour la grille (string), et id numérique séparé pour le backend
        const rowId = `new-${Date.now()}`;
        const backendId = -Date.now();
        formNewParam.setValues({
            idParam: backendId,
            compteId: compteId,
            fileId: fileId,
            matricule: '',
            nom: '',
            prenom: '',
            id_fonction: '',
            id_classe: '',
            numero_cnaps: '',
            cin_ou_carte_resident: '',
            nombre_enfants_charge: '',
            date_entree: '',
            date_sortie: '',
            actif: true,
        });

        const newPersonnel = {
            id: rowId,
            matricule: '',
            nom: '',
            prenom: '',
            id_fonction: '',
            id_classe: '',
            date_entree: '',
            date_sortie: '',
            actif: true,
            numero_cnaps: '',
            cin_ou_carte_resident: '',
            nombre_enfants_charge: '',
            id_compte: Number(compteId),
            id_dossier: Number(id),
        };

        setRows([...rows, newPersonnel]);
        setSelectedRowId([rowId]);
        setSelectedRow([rowId]);
        // mettre la nouvelle ligne directement en mode édition
        setRowModesModel((old) => ({
            ...old,
            [rowId]: { mode: GridRowModes.Edit }
        }));
        setDisableAddRowBouton(true);
    }

    // Sauvegarde
    const handleSaveClick = (id) => () => {
        const rowId = Array.isArray(id) ? id[0] : id;
        // Required fields validation
        const req = ['matricule', 'nom', 'prenom', 'id_fonction', 'id_classe'];
        const missing = req.filter(k => {
            const v = formNewParam.values[k];
            return v === '' || v === null || v === undefined;
        });
        if (missing.length > 0) {
            setSubmitAttempt(true);
            toast.error('Veuillez renseigner tous les champs obligatoires');
            // keep row in edit mode
            setRowModesModel({ ...rowModesModel, [rowId]: { mode: GridRowModes.Edit } });
            return;
        }

        // Validation minimale des identifiants dossier/compte attendus par le backend
        if (!compteId || !fileId) {
            toast.error("Compte ou dossier non défini (compteId/fileId manquant)");
            console.error('[PERSONNEL][SAVE] compteId ou fileId manquant', { compteId, fileId, formValues: formNewParam.values });
            setRowModesModel({ ...rowModesModel, [rowId]: { mode: GridRowModes.Edit } });
            return;
        }

        const dataToSend = { ...formNewParam.values, fileId, compteId };
        console.log('[PERSONNEL][SAVE] payload envoyé à /administration/personnel :', dataToSend);

        axiosPrivate.post(`/administration/personnel`, dataToSend)
            .then((response) => {
                const resData = response.data;
                if (resData.state) {
                    // Mise à jour optimiste de la ligne modifiée dans le DataGrid
                    setRows(prev => prev.map(r => (
                        r.id === rowId
                            ? {
                                ...r,
                                matricule: formNewParam.values.matricule,
                                nom: formNewParam.values.nom,
                                prenom: formNewParam.values.prenom,
                                id_fonction: formNewParam.values.id_fonction,
                                id_classe: formNewParam.values.id_classe,
                                date_entree: formNewParam.values.date_entree,
                                date_sortie: formNewParam.values.date_sortie,
                                actif: formNewParam.values.actif,
                                numero_cnaps: formNewParam.values.numero_cnaps,
                                cin_ou_carte_resident: formNewParam.values.cin_ou_carte_resident,
                                nombre_enfants_charge: formNewParam.values.nombre_enfants_charge,
                              }
                            : r
                    )));

                    setDisableAddRowBouton(false);
                    setDisableSaveBouton(true);
                    formNewParam.resetForm();
                    setSubmitAttempt(false);
                    toast.success(resData.msg);
                    // après sauvegarde, on nettoie les états locaux et on recharge depuis le backend
                    setSelectedRow([]);
                    setSelectedRowId([]);
                    setRowModesModel({});
                    fetchPersonnels();
                } else {
                    toast.error(resData.msg || 'Erreur lors de la sauvegarde du personnel');
                }
            })
            .catch((error) => {
                const backendMsg = error?.response?.data?.message || error?.response?.data?.msg;
                if (backendMsg) {
                    toast.error(backendMsg);
                } else {
                    toast.error('Erreur serveur lors de la sauvegarde du personnel');
                }
                console.error('[PERSONNEL][SAVE] Erreur Axios:', error?.response?.data || error);
                // garder la ligne en mode édition pour correction
                setRowModesModel({ ...rowModesModel, [rowId]: { mode: GridRowModes.Edit } });
            });
    };

    // Annulation
    const handleCancelClick = (id) => () => {
        const rowId = Array.isArray(id) ? id[0] : id;

        // si c'est une ligne temporaire (id string "new-...") on la retire complètement
        if (typeof rowId === 'string' && rowId.startsWith('new-')) {
            setRows(prev => prev.filter(r => r.id !== rowId));
            setSelectedRow([]);
            setSelectedRowId([]);
            setRowModesModel((old) => {
                const copy = { ...old };
                delete copy[rowId];
                return copy;
            });
        } else {
            setRowModesModel({
                ...rowModesModel,
                [rowId]: { mode: GridRowModes.View, ignoreModifications: true },
            });
        }
        setDisableAddRowBouton(false);
    };

    // Suppression
    const handleOpenDialogConfirmDeleteAssocieRow = () => {
        setOpenDialogDeleteRow(true);
        setDisableAddRowBouton(false);
    }

    const deleteRow = (value) => {
        if (value === true && selectedRowId.length === 1) {
            const idToDelete = selectedRowId[0];
            if (idToDelete < 0) {
                setRows(rows.filter((row) => row.id !== idToDelete));
                setOpenDialogDeleteRow(false);
                setDisableAddRowBouton(false);
                return;
            }
            axiosPrivate.delete(`/administration/personnel/${idToDelete}`)
                .then(res => {
                    if (res.data && res.data.state) {
                        setRows(rows.filter((row) => row.id !== idToDelete));
                        setOpenDialogDeleteRow(false);
                        setDisableAddRowBouton(false);
                        toast.success(res.data.msg);
                    } else {
                        toast.error(res.data.msg || 'Erreur lors de la suppression');
                        setOpenDialogDeleteRow(false);
                    }
                })
                .catch(() => {
                    toast.error('Erreur lors de la suppression');
                    setOpenDialogDeleteRow(false);
                });
        } else {
            setOpenDialogDeleteRow(false);
        }
    }

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const deselectRow = (ids) => {
        const deselected = selectedRowId.filter(id => !ids.includes(id));

        const updatedRowModes = { ...rowModesModel };
        deselected.forEach((id) => {
            updatedRowModes[id] = { mode: GridRowModes.View, ignoreModifications: true };
        });
        setRowModesModel(updatedRowModes);

        setDisableAddRowBouton(false);
        setSelectedRowId(ids);
    }

    const handleCellKeyDown = (params, event) => {
        const api = apiRef.current;

        const allCols = api.getAllColumns().filter(c => c.editable);
        const sortedRowIds = api.getSortedRowIds();
        const currentColIndex = allCols.findIndex(c => c.field === params.field);
        const currentRowIndex = sortedRowIds.indexOf(params.id);

        let nextColIndex = currentColIndex;
        let nextRowIndex = currentRowIndex;

        if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            nextColIndex = currentColIndex + 1;
            if (nextColIndex >= allCols.length) {
                nextColIndex = 0;
                nextRowIndex = currentRowIndex + 1;
            }
        } else if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault();
            nextColIndex = currentColIndex - 1;
            if (nextColIndex < 0) {
                nextColIndex = allCols.length - 1;
                nextRowIndex = currentRowIndex - 1;
            }
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            nextColIndex = currentColIndex + 1;
            if (nextColIndex >= allCols.length) nextColIndex = allCols.length - 1;
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            nextColIndex = currentColIndex - 1;
            if (nextColIndex < 0) nextColIndex = 0;
        }

        const nextRowId = sortedRowIds[nextRowIndex];
        const targetCol = allCols[nextColIndex];

        if (!nextRowId || !targetCol) return;

        try {
            api.stopCellEditMode({ id: params.id, field: params.field });
        } catch (err) {
            console.warn('Erreur stopCellEditMode ignorée:', err);
        }

        setTimeout(() => {
            const cellInput = document.querySelector(
                `[data-id="${nextRowId}"] [data-field="${targetCol.field}"] input, 
             [data-id="${nextRowId}"] [data-field="${targetCol.field}"] textarea`
            );
            if (cellInput) cellInput.focus();
        }, 50);
    };

    return (
        <Box>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
            {
                (openDialogDeleteRow && canDelete)
                    ?
                    <PopupConfirmDelete
                        msg={"Voulez-vous vraiment supprimer le personnel sélectionné ?"}
                        confirmationState={deleteRow}
                    />
                    :
                    null
            }

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
                    <Typography variant='h6' sx={{ color: "black" }} align='left'>Administration : Personnels</Typography>
                    <Stack width={"100%"} height={"30px"} spacing={1} alignItems={"center"} alignContent={"center"}
                        direction={"column"} style={{ marginLeft: "0px", marginTop: "20px", justifyContent: "right" }}>
                        <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                            direction={"row"} justifyContent={"right"}>
                            <Tooltip title="Ajouter une ligne">
                                <span>
                                    <IconButton
                                        disabled={!canAdd || disableAddRowBouton}
                                        variant="contained"
                                        onClick={handleOpenDialogAddNewAssocie}
                                        style={{
                                            width: "35px", height: '35px',
                                            borderRadius: "2px", borderColor: "transparent",
                                            backgroundColor: initial.add_new_line_bouton_color,
                                            textTransform: 'none', outline: 'none'
                                        }}
                                    >
                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Modifier la ligne sélectionnée">
                                <span>
                                    <IconButton
                                        disabled={(!canModify && selectedRowId > 0) || disableModifyBouton}
                                        variant="contained"
                                        onClick={handleEditClick(selectedRowId)}
                                        style={{
                                            width: "35px", height: '35px',
                                            borderRadius: "2px", borderColor: "transparent",
                                            backgroundColor: initial.add_new_line_bouton_color,
                                            textTransform: 'none', outline: 'none'
                                        }}
                                    >
                                        <FaRegPenToSquare style={{ width: '25px', height: '25px', color: 'white' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Sauvegarder les modifications">
                                <span>
                                    <IconButton
                                        disabled={(!canAdd && !canModify) || disableSaveBouton}
                                        variant="contained"
                                        onClick={handleSaveClick(selectedRowId)}
                                        style={{
                                            width: "35px", height: '35px',
                                            borderRadius: "2px", borderColor: "transparent",
                                            backgroundColor: initial.add_new_line_bouton_color,
                                            textTransform: 'none', outline: 'none'
                                        }}
                                    >
                                        <TfiSave style={{ width: '50px', height: '50px', color: 'white' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Annuler les modifications">
                                <span>
                                    <IconButton
                                        disabled={disableCancelBouton}
                                        variant="contained"
                                        onClick={handleCancelClick(selectedRowId)}
                                        style={{
                                            width: "35px", height: '35px',
                                            borderRadius: "2px", borderColor: "transparent",
                                            backgroundColor: initial.button_delete_color,
                                            textTransform: 'none', outline: 'none'
                                        }}
                                    >
                                        <VscClose style={{ width: '50px', height: '50px', color: 'white' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Supprimer la ligne sélectionnée">
                                <span>
                                    <IconButton
                                        disabled={!canDelete || disableDeleteBouton}
                                        onClick={handleOpenDialogConfirmDeleteAssocieRow}
                                        variant="contained"
                                        style={{
                                            width: "35px", height: '35px',
                                            borderRadius: "2px", borderColor: "transparent",
                                            backgroundColor: initial.button_delete_color,
                                            textTransform: 'none', outline: 'none'
                                        }}
                                    >
                                        <IoMdTrash style={{ width: '50px', height: '50px', color: 'white' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                        <Stack width={"100%"} height={'100%'} minHeight={'600px'}>
                            <DataGrid
                                apiRef={apiRef}
                                rows={rows}
                                columns={personnelsColumns}
                                disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                disableColumnSelector={DataGridStyle.disableColumnSelector}
                                disableDensitySelector={DataGridStyle.disableDensitySelector}
                                localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                disableRowSelectionOnClick
                                disableSelectionOnClick={true}
                                slots={{ toolbar: QuickFilter }}
                                sx={{
                                    ...DataGridStyle.sx,
                                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                        outline: 'none',
                                        border: 'none',
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        maxHeight: '100%',
                                    },
                                }}
                                rowHeight={DataGridStyle.rowHeight}
                                columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                editMode='row'
                                onRowClick={(e) => handleCellEditCommit(e.row)}
                                onRowSelectionModelChange={(ids) => {
                                    const single = Array.isArray(ids) && ids.length ? [ids[ids.length - 1]] : [];
                                    setSelectedRow(single);
                                    saveSelectedRow(single);
                                    deselectRow(single);
                                }}
                                rowModesModel={rowModesModel}
                                onRowModesModelChange={handleRowModesModelChange}
                                onRowEditStop={handleRowEditStop}
                                processRowUpdate={processRowUpdate}
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
                                rowSelectionModel={selectedRow}
                                onRowEditStart={(params, event) => {
                                    const rowId = params.id;
                                    const rowData = params.row;

                                    const isNewRow = rowId < 0;

                                    if (!canModify && !isNewRow) {
                                        event.defaultMuiPrevented = true;
                                        return;
                                    }

                                    event.stopPropagation();
                                    setDisableAddRowBouton(true);

                                    formNewParam.setFieldValue("idParam", rowId);
                                    formNewParam.setFieldValue("matricule", rowData.matricule ?? '');
                                    formNewParam.setFieldValue("nom", rowData.nom ?? '');
                                    formNewParam.setFieldValue("prenom", rowData.prenom ?? '');
                                    formNewParam.setFieldValue("id_fonction", rowData.id_fonction ?? null);
                                    formNewParam.setFieldValue("id_classe", rowData.id_classe ?? null);
                                    formNewParam.setFieldValue("numero_cnaps", rowData.numero_cnaps ?? '');
                                    formNewParam.setFieldValue("cin_ou_carte_resident", rowData.cin_ou_carte_resident ?? '');
                                    formNewParam.setFieldValue("nombre_enfants_charge", rowData.nombre_enfants_charge ?? 0);
                                    formNewParam.setFieldValue("date_entree", rowData.date_entree ?? '');
                                    formNewParam.setFieldValue("date_sortie", rowData.date_sortie ?? '');
                                    formNewParam.setFieldValue("actif", rowData.actif ?? false);

                                    setRowModesModel((oldModel) => ({
                                        ...oldModel,
                                        [rowId]: { mode: GridRowModes.Edit },
                                    }));

                                    setDisableSaveBouton(false);
                                }}
                                onCellKeyDown={handleCellKeyDown}
                            />
                        </Stack>
                    </Stack>
                </TabPanel>
            </TabContext>
        </Box>
    )
}
