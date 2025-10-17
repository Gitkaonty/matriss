import { useState, useEffect, useRef } from 'react';
import { Typography, Stack, Box, Button, Divider, DialogTitle } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { init } from '../../../../init';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import OptionJoy from '@mui/joy/Option';
import SelectJoy from '@mui/joy/Select';
import InputJoy from '@mui/joy/Input';
import { DataGridStyle } from '../DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes, useGridApiRef } from '@mui/x-data-grid';
import QuickFilter from '../DatagridToolsStyle';
import { useFormik } from 'formik';
import PopupConfirmDelete from '../popupConfirmDelete';
import FormatedInput from '../FormatedInput';
import Tooltip from '@mui/material/Tooltip';
import DropPDFUploader from '../FileUploader/DropPdfUploader';

import toast from 'react-hot-toast';
import axios from '../../../../config/axios';

import useAuth from '../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { VscClose } from 'react-icons/vsc';
import { TfiSave } from 'react-icons/tfi';
import { PiKeyboardDuotone } from "react-icons/pi";
import { getSaisieColumnHeader } from './saisieColumns';

let initial = init[0];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const PopupSaisie = ({ confirmationState, fileId, selectedExerciceId, setRefresh, type, rowsEdit, setRowSelectionModel, listeCodeJournaux, listePlanComptable, listeAnnee, listeDevise, setSelectedRowsSaisie }) => {
    const [taux, setTaux] = useState(rowsEdit[0]?.taux || 0);
    const selectRef = useRef();

    const [tableRows, setTableRows] = useState(type === 'ajout' ? [] : rowsEdit);

    const [disableModifyBouton, setDisableModifyBouton] = useState(true);
    const [disableCancelBouton, setDisableCancelBouton] = useState(true);
    const [disableSaveBouton, setDisableSaveBouton] = useState(true);
    const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);
    const [disableAddRowBouton, setDisableAddRowBouton] = useState(false);

    const [selectedRow, setSelectedRow] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [editableRow, setEditableRow] = useState(true);

    const [invalidRows, setInvalidRows] = useState([]);

    const [deletedRowIds, setDeletedRowIds] = useState([]);

    const [openDialogDeleteSaisie, setOpenDialogDeleteSaisie] = useState(false);

    const [selectedCell, setSelectedCell] = useState({ id: null, field: null });

    const apiRef = useGridApiRef();

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

    //Fichier importé
    const [file, setFile] = useState(type === 'ajout' ? null : rowsEdit[0]?.fichier);

    const handleClose = () => {
        confirmationState(false);
        setSelectedRowsSaisie();
        setRowSelectionModel();
    }

    //Supprimer la ligne
    const handleDeleteRow = (value) => {
        if (value) {
            setDisableAddRowBouton(false);
            setDisableSaveBouton(true);

            setDeletedRowIds((prev) => [...prev, ...selectedRowId]);

            setTableRows((prevRows) =>
                prevRows.filter((row) => !selectedRowId.includes(row.id))
            );

            setOpenDialogDeleteSaisie(false);
        } else {
            setOpenDialogDeleteSaisie(false);
        }
    };

    //Formik ajout saisie
    const formSaisie = useFormik({
        initialValues: {
            valSelectCodeJnl: parseInt(rowsEdit[0]?.id_journal) || "",
            valSelectMois: parseInt(rowsEdit[0]?.dateecriture?.split('-')[1]) || "",
            valSelectAnnee: rowsEdit[0]?.dateecriture?.split('-')[0] || "",
            choixDevise: rowsEdit[0]?.devise || 'MGA',
            taux: rowsEdit[0]?.taux || taux,
            currency: rowsEdit[0]?.devise || "",
            tableRows: [],
            file: rowsEdit[0]?.fichier || null,
            id_dossier: fileId,
            id_compte: compteId,
            id_exercice: selectedExerciceId,
            id_devise: '',
        }
    })

    const formNewParam = useFormik({
        initialValues: {
            idSaisie: 0,
            jour: '',
            compte: '',
            piece: '',
            libelle: '',
            montant_devise: 0,
            debit: 0,
            credit: 0
        },
        validateOnChange: false,
        validateOnBlur: true,
    })

    //Equilibrer le debit et credit
    const equilibrateDebitCredit = (id, type) => {
        let totalDebit = 0.0;
        let totalCredit = 0.0;

        // Fonction de nettoyage de nombre
        const parseNumber = (val) => {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
        };

        // 1. Calcul des totaux
        tableRows.forEach((row) => {
            const debitNum = parseNumber(row.debit);
            const creditNum = parseNumber(row.credit);

            totalDebit += debitNum;
            totalCredit += creditNum;
        });

        const difference = parseFloat((totalDebit - totalCredit).toFixed(2));

        const rowIndex = tableRows.findIndex((row) => row.id === id);
        if (rowIndex === -1) {
            toast.error("Ligne introuvable.", {
                duration: 1000
            });
            return;
        }

        const selectedRow = tableRows[rowIndex];
        const newRows = [...tableRows];

        const debit = parseNumber(selectedRow.debit);
        const credit = parseNumber(selectedRow.credit);

        if (type === "debit" && difference <= 0) {
            if (credit !== 0) {
                toast.error("Aucun ajustement car un seul montant est renseigné.", {
                    duration: 1000
                });
                return;
            }

            const adjustedDebit = parseFloat((debit + Math.abs(difference)).toFixed(2));
            let adjustedMontantDevise = selectedRow.montant_devise;

            if (formSaisie.values.choixDevise !== 'MGA') {
                const taux = parseNumber(formSaisie.values.taux);

                if (!taux || taux <= 0) {
                    toast.error("Taux invalide pour la conversion.", {
                        duration: 1000
                    });
                    return;
                }

                adjustedMontantDevise = parseFloat((adjustedDebit / taux).toFixed(2));
            }

            newRows[rowIndex] = {
                ...selectedRow,
                debit: adjustedDebit,
                ...(formSaisie.values.choixDevise !== 'MGA' && {
                    montant_devise: adjustedMontantDevise,
                }),
            };

            setTableRows(newRows);
            toast.success("Débit ajusté pour équilibrer les montants.", {
                duration: 1000
            });
        }
        else if (type === "credit" && difference >= 0) {
            if (debit !== 0) {
                toast.error("Aucun ajustement car un seul montant est renseigné.", {
                    duration: 1000
                });
                return;
            }

            const adjustedCredit = parseFloat((credit + difference).toFixed(2));
            let adjustedMontantDevise = selectedRow.montant_devise;

            if (formSaisie.values.choixDevise !== 'MGA') {
                const taux = parseNumber(formSaisie.values.taux);

                if (!taux || taux <= 0) {
                    toast.error("Taux invalide pour la conversion.", {
                        duration: 1000
                    });
                    return;
                }

                adjustedMontantDevise = parseFloat((adjustedCredit / taux).toFixed(2));
            }

            newRows[rowIndex] = {
                ...selectedRow,
                credit: adjustedCredit,
                ...(formSaisie.values.choixDevise !== 'MGA' && {
                    montant_devise: adjustedMontantDevise,
                }),
            };

            setTableRows(newRows);
            toast.success("Crédit ajusté pour équilibrer les montants.", {
                duration: 1000
            });
        }
        else {
            toast.error("Aucun ajustement nécessaire.", {
                duration: 1000
            });
        }
    };

    const columns = getSaisieColumnHeader({
        editableRow,
        formSaisie,
        formNewParam,
        setInvalidRows,
        invalidRows,
        selectedCell,
        listePlanComptable,
        taux,
        equilibrateDebitCredit,
    });

    const handleCellClick = (params) => {
        if (params.field === '__check__') return;

        if (
            ['debit', 'credit', 'libelle', 'piece', 'compte', 'jour', 'montant_devise', 'num_facture'].includes(params.field)
        ) {
            setSelectedCell({ id: params.id, field: params.field });
        }

        const isRowInEdit =
            rowModesModel[params.id]?.mode === GridRowModes.Edit;

        if ((params.field === 'debit' || params.field === 'credit') && !isRowInEdit) {
            if (!window.lastDebitCreditToast || Date.now() - window.lastDebitCreditToast > 3000) {
                toast.custom((t) => (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            backgroundColor: '#2B2D42',
                            color: '#fff',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            borderLeft: `6px solid ${params.field === 'debit' ? '#00bfa5' : '#ffb703'}`,
                            minWidth: '320px',
                        }}
                    >
                        <PiKeyboardDuotone size={28} color="#90caf9" />
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Raccourci disponible !
                            </Typography>
                            <Typography variant="body2">
                                Appuyez sur <b>Ctrl + Entrée</b> pour équilibrer automatiquement le solde du
                                <b> {params.field === 'debit' ? 'débit' : 'crédit'}</b>.
                            </Typography>
                        </Box>
                    </Box>
                ), { duration: 1000 });
                window.lastDebitCreditToast = Date.now();
            }
            return;
        }

        if (isRowInEdit) return;

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
            if (!selectedRowId.includes(params.row.id)) {
                setEditableRow(false);
                toast.error("Sélectionnez une ligne pour pouvoir la modifier");
            } else {
                setEditableRow(true);
            }
        }
    };

    // Suppressino saisie
    const handleOpenDialogConfirmDeleteRow = () => {
        setOpenDialogDeleteSaisie(true);
    }

    const addOrUpdateJournal = async () => {
        const newRowModesModel = {};
        tableRows.forEach(row => {
            newRowModesModel[row.id] = { mode: GridRowModes.View };
        });

        setRowModesModel(newRowModesModel);

        const rowsInvalides = [];

        // Validation des lignes
        tableRows.forEach((row) => {
            const champsVides = [];

            if (!row.jour) champsVides.push('jour');
            if (!row.compte) champsVides.push('compte');
            if (!row.libelle) champsVides.push('libelle');
            if (formSaisie.values.choixDevise !== 'MGA' && !row.montant_devise)
                champsVides.push('montant_devise');

            const debitVide = !row.debit || isNaN(Number(row.debit)) || Number(row.debit) === 0;
            const creditVide = !row.credit || isNaN(Number(row.credit)) || Number(row.credit) === 0;
            if (debitVide && creditVide) champsVides.push('debit', 'credit');

            if (champsVides.length > 0) {
                rowsInvalides.push({ id: row.id, fields: champsVides });
            }
        });

        // Gestion devise
        let id_devise = '';
        if (formSaisie.values.choixDevise !== 'MGA') {
            const devise = listeDevise.find((val) => val.code === formSaisie.values.currency);
            id_devise = devise?.id;
        }

        setInvalidRows(rowsInvalides);

        // Vérification des erreurs
        if (rowsInvalides.length > 0) {
            toast.error('Les champs en surbrillance sont obligatoires');
            return;
        }

        if (total !== 0) {
            toast.error('Total débit doit être égal à total crédit');
            return;
        }

        try {
            const formData = new FormData();
            formSaisie.values.id_devise = id_devise;

            const conserverFichier = type === 'modification' ? (!file && !!formSaisie.values.file) : undefined;

            const valeursSansFichier = {
                ...formSaisie.values,
                file: undefined,
                tableRows,
                ...(type === 'modification' ? { conserverFichier, deletedIds: deletedRowIds } : {})
            };

            formData.append("data", JSON.stringify(valeursSansFichier));
            if (file) formData.append("file", file);

            const url =
                type === 'ajout'
                    ? '/administration/traitementSaisie/ajoutJournal'
                    : '/administration/traitementSaisie/modificationJournal';

            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response?.data?.state) {
                toast.success(response?.data?.message);
                setRowSelectionModel();
                setSelectedRowsSaisie();

                if (type === 'ajout') {
                    clearData();
                }

                setRefresh();
                setInvalidRows([]);
            } else {
                toast.error(response?.data?.message);
            }

        } catch (error) {
            toast.error(error);
        }
    };

    const totalDebitNotParsed = tableRows.reduce((total, row) => {
        const debit = parseFloat(row.debit) || 0;
        return total + debit;
    }, 0);

    const totalDebit = parseFloat(totalDebitNotParsed.toFixed(2));

    const totalCreditNotParsed = tableRows.reduce((total, row) => {
        const credit = parseFloat(row.credit) || 0;
        return total + credit;
    }, 0)

    const totalCredit = parseFloat(totalCreditNotParsed.toFixed(2));

    const total = totalDebit - totalCredit

    const totalFormatted = total.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/\u202f/g, ' ')

    const totalDebitFormatted = totalDebit.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/\u202f/g, ' ')

    const totalCreditFormatted = totalCredit.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/\u202f/g, ' ')

    const clearData = () => {
        formSaisie.resetForm();
        setTaux(0);
        setTableRows([]);
        setFile(null);
    }

    const handleAddNewLine = () => {
        if (!formSaisie.values.valSelectCodeJnl) {
            toast.error("Sélectionner le code journal s'il vous plaît !");
        } else if (!formSaisie.values.valSelectMois) {
            toast.error("Sélectionner le mois s'il vous plaît !");
        } else if (!formSaisie.values.valSelectAnnee) {
            toast.error("Sélectionner l'année s'il vous plaît !");
        } else if (formSaisie.values.choixDevise !== 'MGA' && !formSaisie.values.currency) {
            toast.error("Veuillez sélectionner une devise s'il vous plaît !");
        } else {
            setDisableModifyBouton(false);
            setDisableCancelBouton(false);
            setDisableDeleteBouton(false);
            setDisableSaveBouton(false);
            setDisableAddRowBouton(true);
            const newId = -Date.now();

            let dernierJour = '';
            let dernierLibelle = '';
            let dernierPiece = '';
            let dernierCompte = '';
            let dernierNumfacture = '';

            for (let i = tableRows.length - 1; i >= 0; i--) {
                const row = tableRows[i];

                if (row.jour !== null && row.jour !== '' && dernierJour === '') {
                    dernierJour = row.jour;
                }

                if (row.libelle !== null && row.libelle !== '' && dernierLibelle === '') {
                    dernierLibelle = row.libelle;
                }
                if (row.compte !== null && row.compte !== '' && dernierCompte === '') {
                    dernierCompte = row.compte;
                }
                if (dernierJour !== '' && dernierLibelle !== '' && dernierPiece !== '' && dernierCompte !== '') break;
            }

            const newRow = {
                id: newId,
                jour: dernierJour,
                compte: dernierCompte,
                piece: dernierPiece,
                libelle: dernierLibelle,
                num_facture: dernierNumfacture,
                debit: 0,
                credit: 0,
            };

            setTableRows([...tableRows, newRow]);
            setSelectedRowId([newRow.id]);
            setSelectedRow([newRow.id]);
        }
    }

    const saveSelectedRow = (ids) => {
        if (ids.length === 1) {
            setSelectedRowId(ids);
            setDisableModifyBouton(false);
            setDisableSaveBouton(false);
            setDisableCancelBouton(false);
            setDisableDeleteBouton(false);
        } else {
            setSelectedRowId([]);
            setDisableModifyBouton(true);
            setDisableSaveBouton(true);
            setDisableCancelBouton(true);
            // setDisableDeleteBouton(true);
        }
    }

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

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setTableRows(tableRows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
        setDisableAddRowBouton(false);
        setDisableSaveBouton(true);
        setDisableDeleteBouton(true);
        setDisableModifyBouton(true);
        setSelectedRow([]);
        setSelectedRowId([]);
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
        setDisableAddRowBouton(false);
        setDisableModifyBouton(true);
        setDisableSaveBouton(true);
        setDisableCancelBouton(true);
        setDisableDeleteBouton(true);
        setSelectedRow([]);
        setSelectedRowId([]);
        toast.success('Modification enregistré avec succès');
    };

    const handleEditClick = (id) => () => {
        const selectedRowInfos = tableRows?.filter((item) => item.id === id[0]);

        formNewParam.setFieldValue("idsaisie", selectedRowInfos[0]?.id ? selectedRowInfos[0]?.id : 0);
        formNewParam.setFieldValue("jour", selectedRowInfos[0]?.jour ? selectedRowInfos[0]?.jour : '');
        formNewParam.setFieldValue("compte", selectedRowInfos[0]?.compte ? selectedRowInfos[0].compte : '');
        formNewParam.setFieldValue("piece", selectedRowInfos[0]?.piece ? selectedRowInfos[0]?.piece : '');
        formNewParam.setFieldValue("libelle", selectedRowInfos[0]?.libelle ? selectedRowInfos[0]?.libelle : '');
        formNewParam.setFieldValue("montant_devise", selectedRowInfos[0]?.montant_devise ? selectedRowInfos[0].montant_devise : 0);
        formNewParam.setFieldValue("debit", selectedRowInfos[0]?.debit ? selectedRowInfos[0].debit : 0);
        formNewParam.setFieldValue("credit", selectedRowInfos[0]?.credit ? selectedRowInfos[0].credit : 0);

        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const paddingRightTotal = tableRows.length > 19 ? 6.5 : 4;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && (event.key === ' ' || event.key === 'Spacebar')) {
                if (selectedCell) {
                    const { id, field } = selectedCell;

                    if (field === 'debit') {
                        equilibrateDebitCredit(id, 'debit');
                    } else if (field === 'credit') {
                        equilibrateDebitCredit(id, 'credit');
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!selectedCell.id && !selectedCell.field) return;

            let el = event.target;
            let clickedOnCell = false;
            while (el) {
                if (el.classList && el.classList.contains('MuiDataGrid-cell')) {
                    clickedOnCell = true;
                    break;
                }
                el = el.parentElement;
            }

            if (!clickedOnCell) {
                setSelectedCell({ id: null, field: null });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedCell]);

    //Algorithme MGA et Devises
    useEffect(() => {
        if (formSaisie.values.choixDevise === "MGA") {
            formSaisie.setFieldValue('currency', '');
            setTaux(0);
        }
    }, [formSaisie.values.choixDevise]);

    useEffect(() => {
        if (formSaisie.values.choixDevise === 'MGA') {
            setTableRows(prevRows => prevRows.map(row => {
                const newRow = { ...row };
                delete newRow.montant_devise;
                return newRow;
            }));
        }
    }, [formSaisie.values.choixDevise]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            {
                openDialogDeleteSaisie
                    ?
                    <PopupConfirmDelete
                        msg={"Voulez-vous vraiment supprimer la ligne sélectionné ?"}
                        confirmationState={handleDeleteRow}
                    />
                    :
                    null
            }
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={true}
                // maxWidth="lg"
                fullWidth={true}
                fullScreen={true}
            >
                <DialogTitle
                    sx={{
                        m: 0,
                        py: 1.5,
                        px: 2,
                        bgcolor: "#f5f5f5",
                        borderBottom: "1px solid #ddd",
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Typography
                            variant="h6"
                            component="div"
                            fontWeight="bold"
                            color="text.primary"
                        >
                            {
                                type === "ajout"
                                    ? "Ajout d'une nouvelle saisie"
                                    : "Modification d'une saisie"
                            }
                        </Typography>

                        <IconButton
                            onClick={handleClose}
                            style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent >
                    <TabContext value={"1"} >
                        <TabPanel value="1" style={{ height: '85%' }}>
                            <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                                <Stack
                                    sx={{ width: '100%', p: 1 }}
                                    direction={'row'}
                                    justifyContent={'space-between'}
                                    alignItems={'center'}
                                    style={{
                                        marginLeft: "0px",
                                        // padding: 10,
                                        backgroundColor: '#F4F9F9',
                                        borderRadius: "5px"
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        flexWrap="wrap"
                                        spacing={3}
                                        alignItems="center"
                                        justifyContent="flex-start"
                                        sx={{ width: '100%' }}
                                    >
                                        {/* Code Journal */}
                                        <FormControl variant="standard" sx={{ width: 250 }}>
                                            <InputLabel>Code journal</InputLabel>
                                            <Select
                                                value={formSaisie.values.valSelectCodeJnl}
                                                onChange={formSaisie.handleChange}
                                                name="valSelectCodeJnl"
                                            >
                                                {listeCodeJournaux.map((value, index) => (
                                                    <MenuItem sx={{ flex: 0.18 }} key={index} value={value.id}>
                                                        {`${value.code} - ${value.libelle}`}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Mois */}
                                        <FormControl variant="standard" sx={{ width: 115 }}>
                                            <InputLabel>Mois</InputLabel>
                                            <Select
                                                value={formSaisie.values.valSelectMois}
                                                onChange={formSaisie.handleChange}
                                                name="valSelectMois"
                                            >
                                                {[...Array(12).keys()].map(m => (
                                                    <MenuItem key={m + 1} value={m + 1}>
                                                        {new Date(0, m).toLocaleString('fr-FR', { month: 'long' }).replace(/^./, c => c.toUpperCase())}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Année */}
                                        <FormControl variant="standard" sx={{ width: 90 }} style={{ marginRight: '50px' }} >
                                            <InputLabel>Année</InputLabel>
                                            <Select
                                                value={formSaisie.values.valSelectAnnee}
                                                onChange={formSaisie.handleChange}
                                                name="valSelectAnnee"
                                            >
                                                {listeAnnee.map((year) => (
                                                    <MenuItem key={year} value={year}>
                                                        {year}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Choix devise */}
                                        <RadioGroup
                                            row
                                            name="choixDevise"
                                            value={formSaisie.values.choixDevise}
                                            onChange={formSaisie.handleChange}
                                        >
                                            <FormControlLabel value="MGA" control={<Radio />} label="MGA" />
                                            <FormControlLabel value="Devises" control={<Radio />} label="Autres" />
                                        </RadioGroup>

                                        {/* Taux de conversion */}
                                        <Stack spacing={1.5} sx={{ width: 220 }}>
                                            <InputJoy
                                                placeholder="Taux"
                                                type="text"
                                                name="taux"
                                                step="0.01"
                                                value={taux}
                                                onChange={(e) => {
                                                    let value = e.target.value;
                                                    if (typeof value === 'object' && value !== null) {
                                                        value = value.floatValue ?? 0;
                                                    }
                                                    if (typeof value === 'number') {
                                                        setTaux(value);
                                                        formSaisie.setFieldValue('taux', value);
                                                        return;
                                                    }
                                                    const parsedValue = String(value)
                                                        .replace(/\s/g, '')
                                                        .replace(',', '.');

                                                    setTaux(parsedValue);
                                                    formSaisie.setFieldValue('taux', parsedValue);
                                                    selectRef.current?.blur();
                                                }}

                                                disabled={formSaisie.values.choixDevise === "MGA"}
                                                slotProps={{
                                                    input: {
                                                        component: FormatedInput,
                                                        sx: {
                                                            textAlign: 'right',
                                                        },
                                                    },
                                                }}
                                                endDecorator={
                                                    <>
                                                        <Divider orientation="vertical" />
                                                        <SelectJoy
                                                            ref={selectRef}
                                                            variant="plain"
                                                            value={formSaisie.values.currency}
                                                            onChange={(_, value) => formSaisie.setFieldValue('currency', value)}
                                                            name="currency"
                                                            slotProps={{
                                                                button: {
                                                                    sx: {
                                                                        boxShadow: 'none',
                                                                        outline: 'none',
                                                                        border: 'none',
                                                                        '&:focus': { outline: 'none' },
                                                                        '&:focus-visible': { outline: 'none' },
                                                                    },
                                                                },
                                                                listbox: {
                                                                    variant: 'plain',
                                                                    sx: {
                                                                        zIndex: 2000,
                                                                    },
                                                                },
                                                            }}
                                                            sx={{
                                                                mr: -1.5,
                                                                border: 'none',
                                                                outline: 'none',
                                                                boxShadow: 'none',
                                                                '--Select-focusedThickness': '0px',
                                                                '--Select-indicator-thickness': '0px',
                                                                '&:focus': { outline: 'none' },
                                                                '&:focus-visible': { outline: 'none' },
                                                            }}
                                                        >
                                                            {listeDevise.map((value, index) => (
                                                                <OptionJoy key={index} value={value.code}>
                                                                    {`${value.code}`}
                                                                </OptionJoy>
                                                            ))}
                                                        </SelectJoy>
                                                    </>
                                                }
                                                sx={{
                                                    width: '100%',
                                                    '& input[type=number]': { MozAppearance: 'textfield' },
                                                    '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                                    '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                                }}
                                            />
                                        </Stack>
                                    </Stack>

                                    <Stack>
                                        {/* Bouton Enregistrer */}
                                        <Button
                                            autoFocus
                                            sx={{ flex: 0.06 }}
                                            variant="contained"
                                            style={{
                                                height: "39px",
                                                textTransform: 'none',
                                                outline: 'none',
                                                backgroundColor: initial.theme,
                                                color: "white",
                                                marginTop: '0px',
                                            }}
                                            onClick={addOrUpdateJournal}
                                            disabled={!formSaisie.values.valSelectCodeJnl || !formSaisie.values.valSelectMois || !formSaisie.values.valSelectAnnee || tableRows.length === 0}
                                        >
                                            {type === 'ajout' ? 'Enregistrer' : 'Modifier'}
                                        </Button>
                                    </Stack>
                                </Stack>

                                <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"left"} alignContent={"left"}
                                    direction={"row"} justifyContent={"right"} style={{ marginRight: "0px", marginTop: '20px' }}>
                                    <Tooltip title="Ajouter une ligne">
                                        <IconButton
                                            disabled={disableAddRowBouton}
                                            variant="contained"
                                            onClick={handleAddNewLine}
                                            style={{
                                                width: "35px", height: '35px',
                                                borderRadius: "2px", borderColor: "transparent",
                                                backgroundColor: initial.theme,
                                                textTransform: 'none', outline: 'none'
                                            }}
                                        >
                                            <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Modifier la ligne sélectionnée">
                                        <IconButton
                                            disabled={disableModifyBouton}
                                            variant="contained"
                                            onClick={handleEditClick(selectedRowId)}
                                            style={{
                                                width: "35px", height: '35px',
                                                borderRadius: "2px", borderColor: "transparent",
                                                backgroundColor: initial.theme,
                                                textTransform: 'none', outline: 'none'
                                            }}
                                        >
                                            <FaRegPenToSquare style={{ width: '25px', height: '25px', color: 'white' }} />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Sauvegarder les modifications">
                                        <span>
                                            <IconButton
                                                disabled={disableSaveBouton}
                                                variant="contained"
                                                onClick={handleSaveClick(selectedRowId)}
                                                style={{
                                                    width: "35px", height: '35px',
                                                    borderRadius: "2px", borderColor: "transparent",
                                                    backgroundColor: initial.theme,
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

                                    <Tooltip title="Supprimer la ligne sélectionné">
                                        <span>
                                            <IconButton
                                                disabled={disableDeleteBouton}
                                                onClick={handleOpenDialogConfirmDeleteRow}
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
                                <Stack
                                    width={"100%"}
                                    style={{
                                        marginLeft: "0px",
                                        marginTop: "20px",
                                    }}
                                >
                                    <Stack
                                        width="100%"
                                        maxHeight="900px"
                                        minHeight="600px"
                                        style={{
                                            marginLeft: "0px",
                                        }}
                                    >
                                        <DataGrid
                                            autoHeight={false}
                                            apiRef={apiRef}
                                            disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                            disableColumnSelector={DataGridStyle.disableColumnSelector}
                                            disableDensitySelector={DataGridStyle.disableDensitySelector}
                                            disableRowSelectionOnClick
                                            disableSelectionOnClick={true}
                                            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                            slots={{
                                                toolbar: QuickFilter,
                                            }}
                                            sx={{
                                                ...DataGridStyle.sx,
                                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                                    outline: 'none',
                                                    border: 'none',
                                                },
                                                '& .MuiInputBase-root': {
                                                    boxShadow: 'none',
                                                    border: 'none',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    border: 'none',
                                                },
                                                '& .cell-error': {
                                                    backgroundColor: 'rgba(238, 109, 109, 0.3) ',
                                                },
                                                '& .cell-selected': {
                                                    backgroundColor: '#e0f7fa',
                                                },
                                            }}
                                            processRowUpdate={processRowUpdate}
                                            rowHeight={DataGridStyle.rowHeight}
                                            columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                            editMode='row'
                                            columns={columns}
                                            rows={tableRows}
                                            initialState={{
                                                pagination: {
                                                    paginationModel: { page: 0, pageSize: 100 },
                                                },
                                            }}
                                            experimentalFeatures={{ newEditingApi: true }}
                                            pageSizeOptions={[5, 10, 20, 30, 50, 100]}
                                            pagination={DataGridStyle.pagination}
                                            checkboxSelection={DataGridStyle.checkboxSelection}
                                            columnVisibilityModel={{
                                                id: false,
                                            }}

                                            onRowSelectionModelChange={ids => {
                                                setSelectedRow(ids);
                                                saveSelectedRow(ids);
                                                deselectRow(ids);
                                            }}
                                            rowModesModel={rowModesModel}
                                            rowSelectionModel={selectedRow}
                                            onRowModesModelChange={handleRowModesModelChange}
                                            onCellClick={handleCellClick}
                                            onRowEditStop={handleRowEditStop}
                                            onRowEditStart={(params, event) => {
                                                if (!selectedRow.length || selectedRow[0] !== params.id) {
                                                    event.defaultMuiPrevented = true;
                                                }
                                                if (selectedRow.includes(params.id)) {
                                                    setDisableAddRowBouton(true);
                                                    event.stopPropagation();

                                                    const rowId = params.id;
                                                    const rowData = params.row;

                                                    formNewParam.setFieldValue("idSaisie", rowId);
                                                    formNewParam.setFieldValue("jour", rowData.jour ?? '');
                                                    formNewParam.setFieldValue("compte", rowData.compte ?? '');
                                                    formNewParam.setFieldValue("piece", rowData.piece ?? '');
                                                    formNewParam.setFieldValue("libelle", rowData.libelle ?? '');
                                                    formNewParam.setFieldValue("montant_devise", rowData.montant_devise ?? 0);
                                                    formNewParam.setFieldValue("debit", rowData.debit ?? 0);
                                                    formNewParam.setFieldValue("credit", rowData.credit ?? 0);

                                                    setRowModesModel((oldModel) => ({
                                                        ...oldModel,
                                                        [rowId]: { mode: GridRowModes.Edit },
                                                    }));
                                                }
                                            }}
                                        />

                                    </Stack>
                                    <Typography fontWeight="bold">
                                        {
                                            "Débit - Crédit : " + totalFormatted + " " +
                                            (formSaisie.values.choixDevise === "MGA" ? formSaisie.values.choixDevise : formSaisie.values.currency === null ? '' : formSaisie.values.currency)
                                        }
                                    </Typography>
                                    <Stack
                                        style={{
                                            marginBottom: '25px'
                                        }}
                                    >
                                        <DropPDFUploader
                                            mode={type}
                                            file={file}
                                            setFile={setFile}
                                        />
                                    </Stack>
                                </Stack>
                            </Stack>
                        </TabPanel>
                    </TabContext>
                </DialogContent>

                <DialogTitle
                    sx={{
                        m: 0,
                        py: 1.5,
                        px: 2,
                        bgcolor: "#F9FAFB",
                        borderTop: "1px solid #ddd",
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            px: 2,
                        }}
                    >
                        <Box sx={{ flex: 0.4, display: 'flex', justifyContent: 'flex-start' }}>
                            <Typography fontWeight="bold" variant="h6" color="text.primary">
                                Total
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 0.8 }} />
                        <Box sx={{ flex: 1.3 }} />
                        <Box sx={{ flex: 2.7 }} />

                        {
                            (formSaisie.values.choixDevise === 'Devises' && (
                                <Box sx={{ flex: 1.3 }} />
                            ))
                        }

                        <Box sx={{ flex: 1.4, textAlign: 'right' }}>
                            <Typography fontWeight="bold" variant="subtitle1" >
                                {totalDebitFormatted}
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1.3, textAlign: 'right', pr: paddingRightTotal }}>
                            <Typography fontWeight="bold" variant="subtitle1" >
                                {totalCreditFormatted}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
            </BootstrapDialog>
        </>
    )
}

export default PopupSaisie;