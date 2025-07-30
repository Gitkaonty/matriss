import { useState, useEffect, useRef } from 'react';
import { Typography, Stack, Box, Button, Divider } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter from '../DatagridToolsStyle';

import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';

import { useFormik } from 'formik';
import { Autocomplete, TextField } from '@mui/material';
import PopupConfirmDelete from '../popupConfirmDelete';
import FormatedInput from '../FormatedInput';
import Tooltip from '@mui/material/Tooltip';
import { IoAddSharp } from "react-icons/io5";
import { GoX } from "react-icons/go";

import { GridPagination } from '@mui/x-data-grid';
import DropPDFUploader from '../FileUploader/DropPdfUploader';

import toast from 'react-hot-toast';
import axios from '../../../../config/axios';

import useAuth from '../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

let initial = init[0];

function createData(id, jour, compte, num_facture, piece, libelle, debit, credit) {
    return {
        id,
        jour,
        compte,
        piece,
        libelle,
        num_facture,
        debit,
        credit,
    };
}

const rows = [
    createData(-1, null, null, null, null, null, 0, 0),
];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const PopupSaisie = ({ confirmationState, fileId, selectedExerciceId, setRefresh, type, rowsEdit, setRowSelectionModel }) => {
    const [taux, setTaux] = useState(rowsEdit[0]?.taux || 0);
    const selectRef = useRef();
    const [listeAnnee, setListeAnnee] = useState([]);
    const [listeDevise, setListeDevise] = useState([]);
    const [listePlanComptable, setListePlanComptable] = useState([]);

    const [tableRows, setTableRows] = useState(type === 'ajout' ? rows : rowsEdit);
    const [invalidRows, setInvalidRows] = useState([]);

    const [deletedRowIds, setDeletedRowIds] = useState([]);

    const [listeCodeJournaux, setListeCodeJournaux] = useState([]);

    const [openDialogDeleteSaisie, setOpenDialogDeleteSaisie] = useState(false);

    const [selectedCell, setSelectedCell] = useState({ id: null, field: null });

    //récupération des informations de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;

    //Fichier importé
    const [file, setFile] = useState(type === 'ajout' ? null : rowsEdit[0]?.fichier);

    //Id du ligne à supprimer
    const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);

    const handleClose = () => {
        confirmationState(false);
    }

    //Supprimer la ligne pour ajout
    const handleDeleteRowAdd = (value) => {
        if (value) {
            setTableRows((prevRows) => prevRows.filter((row) => row.id !== selectedIdToDelete));
            setOpenDialogDeleteSaisie(false);
        } else {
            setOpenDialogDeleteSaisie(false);
        }
    };

    const handleDeleteRowEdit = (value) => {
        if (value) {
            setTableRows((prevRows) => prevRows.filter((row) => row.id !== selectedIdToDelete));
            setOpenDialogDeleteSaisie(false);
            if (selectedIdToDelete > 0) {
                setDeletedRowIds(prev => [...prev, selectedIdToDelete]);
            }
        } else {
            setOpenDialogDeleteSaisie(false);
        }
    };

    const handleDeleteRow = type === 'ajout' ? handleDeleteRowAdd : handleDeleteRowEdit;

    //Formik ajout saisie
    const formSaisieAjout = useFormik({
        initialValues: {
            valSelectCodeJnl: "",
            valSelectMois: "",
            valSelectAnnee: "",
            choixDevise: 'MGA',
            taux: taux,
            currency: "",
            tableRows: [],
            file: null,
            id_dossier: fileId,
            id_compte: compteId,
            id_exercice: selectedExerciceId,
            id_devise: '',
        }
    })

    const formSaisieModification = useFormik({
        initialValues: {
            valSelectCodeJnl: parseInt(rowsEdit[0]?.id_journal),
            valSelectMois: parseInt(rowsEdit[0]?.dateecriture?.split('-')[1]),
            valSelectAnnee: rowsEdit[0]?.dateecriture?.split('-')[0],
            choixDevise: (rowsEdit[0]?.devise === 'MGA' || rowsEdit[0]?.devise === "") ? 'MGA' : 'Devises',
            taux: rowsEdit[0]?.taux || taux,
            currency: rowsEdit[0]?.devise || "",
            tableRows: [],
            file: rowsEdit[0]?.fichier,
            id_dossier: fileId,
            id_compte: compteId,
            id_exercice: selectedExerciceId,
            id_devise: '',
        }
    })

    const formSaisie = type === 'ajout' ? formSaisieAjout : formSaisieModification;

    const getSaisieColumnHeader = () => {
        const columns = [
            // Colonnes de base : jour, compte, piece, libelle
            {
                field: 'jour',
                headerName: 'Jour',
                type: 'number',
                editable: true,
                sortable: true,
                // width: 60,
                flex: 0.4,
                headerAlign: 'left',
                align: 'left',
                headerClassName: 'HeaderbackColor',
                renderEditCell: (params) => {
                    const selectedMonth = parseInt(formSaisie.values.valSelectMois); // 1-12
                    const selectedYear = parseInt(formSaisie.values.valSelectAnnee) || new Date().getFullYear();
                    const maxDay = (selectedMonth >= 1 && selectedMonth <= 12)
                        ? new Date(selectedYear, selectedMonth, 0).getDate()
                        : 31;

                    return (
                        <TextField
                            size="small"
                            type="number"
                            name="jour"
                            fullWidth
                            value={params.value ?? ''}
                            onChange={(event) => {
                                const inputValue = event.target.value;

                                // 1. Suppression totale (champ vide)
                                if (inputValue === '') {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'jour',
                                        value: '',
                                    });

                                    // Garde ou ajoute "jour" dans les erreurs si champ vide
                                    setInvalidRows((prev) => {
                                        const exists = prev.find(r => r.id === params.id);
                                        if (exists) {
                                            if (!exists.fields.includes('jour')) {
                                                return prev.map(r =>
                                                    r.id === params.id ? { ...r, fields: [...r.fields, 'jour'] } : r
                                                );
                                            }
                                            return prev;
                                        } else {
                                            return [...prev, { id: params.id, fields: ['jour'] }];
                                        }
                                    });

                                    return;
                                }

                                // 2. Conversion en entier
                                const intValue = parseInt(inputValue);

                                // 3. Si valeur valide entre 1 et maxDay
                                if (!isNaN(intValue) && intValue >= 1 && intValue <= maxDay) {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'jour',
                                        value: intValue,
                                    });

                                    // Supprimer l'erreur "jour" s’il y en avait une
                                    setInvalidRows((prev) => {
                                        const row = prev.find(r => r.id === params.id);
                                        if (!row) return prev;

                                        const updatedFields = row.fields.filter(f => f !== 'jour');
                                        if (updatedFields.length === 0) {
                                            return prev.filter(r => r.id !== params.id);
                                        }
                                        return prev.map(r =>
                                            r.id === params.id ? { ...r, fields: updatedFields } : r
                                        );
                                    });
                                }
                            }}

                            inputProps={{
                                min: 1,
                                max: maxDay,
                                step: 1,
                            }}
                            sx={{
                                '& input[type=number]': {
                                    MozAppearance: 'textfield',
                                },
                                '& input[type=number]::-webkit-outer-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                },
                                '& input[type=number]::-webkit-inner-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                },
                                textAlign: 'center',
                            }}
                        />
                    );
                },
                cellClassName: (params) => {
                    const classes = [];

                    //Appliquer l'erreur uniquement sur le champ "jour"
                    const rowInvalid = invalidRows.find(row => row.id === params.id);
                    if (params.field === 'jour' && rowInvalid?.fields.includes('jour')) {
                        classes.push('cell-error');
                    }

                    //Appliquer la sélection uniquement sur la cellule "jour"
                    if (selectedCell.id === params.id && selectedCell.field === 'jour') {
                        classes.push('cell-selected');
                    }

                    return classes.join(' ');
                },
            }, {
                field: 'compte',
                headerName: 'Compte',
                editable: true,
                // width: 500,
                flex: 0.8,
                renderEditCell: (params) => {
                    const options = listePlanComptable.map((pc) => ({
                        label: `${pc.compte} - ${pc.libelle}`,
                        value: pc.id,
                        key: pc.id
                    }));

                    const currentValue = options.find(opt => opt.value === params.value) || null;

                    const handleClear = () => {
                        params.api.setEditCellValue({
                            id: params.id,
                            field: 'compte',
                            value: null,
                        });

                        if (type === 'ajout') {
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'libelle',
                                value: '',
                            });
                        }
                    };

                    return (
                        <Autocomplete
                            key={params.id}
                            autoHighlight
                            options={options}
                            getOptionLabel={(option) => option.label}
                            value={currentValue}
                            onChange={(e, newValue) => {
                                const newCompteId = newValue ? newValue.value : null;
                                const libelleAssocie1 = newValue ? newValue.label.split(' - ')[1] : '';

                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'compte',
                                    value: newCompteId,
                                }, e);

                                if (type === 'ajout') {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'libelle',
                                        value: libelleAssocie1,
                                    }, e);
                                }

                                if (newCompteId) {
                                    setInvalidRows((prevInvalidRows) => {
                                        const row = prevInvalidRows.find(r => r.id === params.id);
                                        if (!row) return prevInvalidRows;

                                        const newFields = row.fields.filter(f => f !== 'compte' && f !== 'libelle');
                                        if (newFields.length === 0) {
                                            return prevInvalidRows.filter(r => r.id !== params.id);
                                        }
                                        return prevInvalidRows.map(r =>
                                            r.id === params.id ? { ...r, fields: newFields } : r
                                        );
                                    });
                                }
                            }}
                            renderInput={(paramsInput) => (
                                <TextField
                                    {...paramsInput}
                                    variant="standard"
                                    placeholder="Choisir un compte"
                                    fullWidth
                                    InputProps={{
                                        ...paramsInput.InputProps,
                                        disableUnderline: true,
                                        endAdornment: (
                                            <>
                                                {paramsInput.InputProps.endAdornment}
                                                {currentValue && (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleClear} size="small">
                                                            <ClearIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                )}
                                            </>
                                        )
                                    }}
                                    style={{ width: 500 }}
                                />
                            )}
                        />
                    );
                },
                cellClassName: (params) => {
                    const classes = [];

                    //Gestion des erreurs
                    const rowInvalid = invalidRows.find(row => row.id === params.id);
                    const compte = Number(params.row.compte) || null;

                    if (rowInvalid && rowInvalid.fields.includes('compte')) {
                        classes.push('cell-error');
                    }

                    //Mise en surbrillance de la cellule sélectionnée
                    if (selectedCell.id === params.id && selectedCell.field === 'compte') {
                        classes.push('cell-selected');
                    }

                    return classes.join(' ');
                },
                renderCell: (params) => {
                    const pc = listePlanComptable.find((item) => item.id === params.value);

                    if (!pc) return params.value || ''; // si non trouvé affiche id ou rien

                    return `${pc.compte}`;
                },
            },
            {
                field: 'piece',
                headerName: 'Pièce',
                type: 'string',
                sortable: true,
                editable: true,
                flex: 1.3,
                headerAlign: 'left',
                align: 'left',
                headerClassName: 'HeaderbackColor',

                renderEditCell: (params) => {
                    return (
                        <TextField
                            variant="standard"
                            defaultValue={params.value}
                            fullWidth
                            InputProps={{
                                disableUnderline: true, //Supprimer le soulignement noir par défaut
                            }}
                            sx={{
                                backgroundColor: 'white',
                                border: 'none',
                                outline: 'none',
                                '& input': {
                                    padding: '4px 8px',
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '& input:focus': {
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '&.Mui-focused': {
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '& .MuiInput-root:before, & .MuiInput-root:after': {
                                    borderBottom: 'none !important',
                                },
                            }}
                            onChange={(e) => {
                                const value = e.target.value;

                                // Met à jour la valeur dans la table
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'piece',
                                    value: value,
                                }, e);

                                //Met à jour les erreurs
                                setInvalidRows((prev) => {
                                    const row = prev.find(r => r.id === params.id);

                                    if (value.trim() === '') {
                                        // Ajoute l’erreur si champ vide
                                        if (row) {
                                            if (!row.fields.includes('piece')) {
                                                return prev.map(r =>
                                                    r.id === params.id ? { ...r, fields: [...r.fields, 'piece'] } : r
                                                );
                                            }
                                            return prev;
                                        } else {
                                            return [...prev, { id: params.id, fields: ['piece'] }];
                                        }
                                    } else {
                                        // Supprime l’erreur si valeur valide
                                        if (!row) return prev;

                                        const updatedFields = row.fields.filter(f => f !== 'piece');
                                        if (updatedFields.length === 0) {
                                            return prev.filter(r => r.id !== params.id);
                                        }

                                        return prev.map(r =>
                                            r.id === params.id ? { ...r, fields: updatedFields } : r
                                        );
                                    }
                                });
                            }}
                        />
                    );
                },

                cellClassName: (params) => {
                    const classes = [];

                    // Appliquer l'erreur uniquement sur le champ "piece"
                    const rowInvalid = invalidRows.find(row => row.id === params.id);
                    if (params.field === 'piece' && rowInvalid?.fields.includes('piece')) {
                        classes.push('cell-error');
                    }

                    // Appliquer la sélection uniquement sur la cellule "piece"
                    if (selectedCell.id === params.id && selectedCell.field === 'piece') {
                        classes.push('cell-selected');
                    }

                    return classes.join(' ');
                },
            }, {
                field: 'libelle',
                headerName: 'Libellé',
                type: 'string',
                sortable: true,
                editable: true,
                flex: 1.35,
                headerAlign: 'left',
                align: 'left',
                headerClassName: 'HeaderbackColor',

                renderEditCell: (params) => {
                    return (
                        <TextField
                            variant="standard"
                            defaultValue={params.value}
                            fullWidth
                            InputProps={{
                                disableUnderline: true, //Supprimer le soulignement noir par défaut
                            }}
                            sx={{
                                backgroundColor: 'white',
                                border: 'none',
                                outline: 'none',
                                '& input': {
                                    padding: '4px 8px',
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '& input:focus': {
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '& input:focus-visible': {
                                    outline: 'none !important',
                                },
                                '&.Mui-focused': {
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '& .MuiInput-root:before, & .MuiInput-root:after': {
                                    borderBottom: 'none !important',
                                },
                            }}


                            onChange={(e) => {
                                const value = e.target.value;

                                //Met à jour la valeur dans la table
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'libelle',
                                    value: value,
                                }, e);

                                // Mise à jour dynamique des erreurs
                                setInvalidRows((prev) => {
                                    const row = prev.find(r => r.id === params.id);

                                    if (value.trim() === '') {
                                        // Ajoute l’erreur si vide
                                        if (row) {
                                            if (!row.fields.includes('libelle')) {
                                                return prev.map(r =>
                                                    r.id === params.id
                                                        ? { ...r, fields: [...r.fields, 'libelle'] }
                                                        : r
                                                );
                                            }
                                            return prev;
                                        } else {
                                            return [...prev, { id: params.id, fields: ['libelle'] }];
                                        }
                                    } else {
                                        // Supprime l’erreur si rempli
                                        if (!row) return prev;

                                        const updatedFields = row.fields.filter(f => f !== 'libelle');
                                        if (updatedFields.length === 0) {
                                            return prev.filter(r => r.id !== params.id);
                                        }

                                        return prev.map(r =>
                                            r.id === params.id
                                                ? { ...r, fields: updatedFields }
                                                : r
                                        );
                                    }
                                });
                            }}
                        />
                    );
                },
                cellClassName: (params) => {
                    const classes = [];

                    const rowInvalid = invalidRows.find(row => row.id === params.id);
                    if (params.field === 'libelle' && rowInvalid?.fields.includes('libelle')) {
                        classes.push('cell-error');
                    }

                    if (selectedCell.id === params.id && selectedCell.field === 'libelle') {
                        classes.push('cell-selected');
                    }

                    return classes.join(' ');
                }
            },
            {
                field: 'num_facture',
                headerName: 'N° Facture',
                type: 'string',
                sortable: true,
                editable: true,
                flex: 1.35,
                headerAlign: 'left',
                align: 'left',
                headerClassName: 'HeaderbackColor',

                renderEditCell: (params) => {
                    return (
                        <TextField
                            variant="standard"
                            defaultValue={params.value}
                            fullWidth
                            InputProps={{
                                disableUnderline: true, //Supprimer le soulignement noir par défaut
                            }}
                            sx={{
                                backgroundColor: 'white',
                                border: 'none',
                                outline: 'none',
                                '& input': {
                                    padding: '4px 8px',
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '& input:focus': {
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '& input:focus-visible': {
                                    outline: 'none !important',
                                },
                                '&.Mui-focused': {
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '& .MuiInput-root:before, & .MuiInput-root:after': {
                                    borderBottom: 'none !important',
                                },
                            }}


                            onChange={(e) => {
                                const value = e.target.value;

                                //Met à jour la valeur dans la table
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'num_facture',
                                    value: value,
                                }, e);

                                // Mise à jour dynamique des erreurs
                                setInvalidRows((prev) => {
                                    const row = prev.find(r => r.id === params.id);

                                    if (value.trim() === '') {
                                        // Ajoute l’erreur si vide
                                        if (row) {
                                            if (!row.fields.includes('num_facture')) {
                                                return prev.map(r =>
                                                    r.id === params.id
                                                        ? { ...r, fields: [...r.fields, 'num_facture'] }
                                                        : r
                                                );
                                            }
                                            return prev;
                                        } else {
                                            return [...prev, { id: params.id, fields: ['num_facture'] }];
                                        }
                                    } else {
                                        // Supprime l’erreur si rempli
                                        if (!row) return prev;

                                        const updatedFields = row.fields.filter(f => f !== 'num_facture');
                                        if (updatedFields.length === 0) {
                                            return prev.filter(r => r.id !== params.id);
                                        }

                                        return prev.map(r =>
                                            r.id === params.id
                                                ? { ...r, fields: updatedFields }
                                                : r
                                        );
                                    }
                                });
                            }}
                        />
                    );
                },
                cellClassName: (params) => {
                    const classes = [];

                    const rowInvalid = invalidRows.find(row => row.id === params.id);
                    if (params.field === 'num_facture' && rowInvalid?.fields.includes('num_facture')) {
                        classes.push('cell-error');
                    }

                    if (selectedCell.id === params.id && selectedCell.field === 'num_facture') {
                        classes.push('cell-selected');
                    }

                    return classes.join(' ');
                }
            }
        ];

        // Si l'utilisateur sélectionne "Devises", ajouter deux colonnes
        if (formSaisie.values.choixDevise === 'Devises') {
            columns.push({
                field: 'montant_devise',
                headerName: 'Montant en Devise',
                editable: true,
                headerAlign: 'right',
                align: 'right',
                flex: 1.3,
                renderEditCell: (params) => {
                    const debit = params.row.debit;
                    const credit = params.row.credit;
                    return (
                        <TextField
                            size="small"
                            name="montant_devise"
                            fullWidth
                            value={params.value ?? ''}
                            onChange={(event) => {
                                const rawValue = event.target.value ?? '';
                                const cleaned = rawValue.toString().replace(/\s/g, '').replace(',', '.');
                                const numeric = Number(cleaned);

                                if (!isNaN(numeric)) {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'montant_devise',
                                        value: numeric,
                                    }, event);
                                    const isDebitEmpty = debit === 0 || debit === '' || debit === null || debit === undefined;
                                    const isCreditEmpty = credit === 0 || credit === '' || credit === null || credit === undefined;
                                    if (isDebitEmpty && isCreditEmpty) {
                                        params.api.setEditCellValue({
                                            id: params.id,
                                            field: 'debit',
                                            value: numeric * taux
                                        })
                                    } else if (isDebitEmpty) {
                                        params.api.setEditCellValue({
                                            id: params.id,
                                            field: 'credit',
                                            value: numeric * taux
                                        })
                                    } else if (isCreditEmpty) {
                                        params.api.setEditCellValue({
                                            id: params.id,
                                            field: 'debit',
                                            value: numeric * taux
                                        })
                                    }
                                }
                            }}
                            style={{ marginBottom: '0px', width: '200px', textAlign: 'right' }}
                            InputProps={{
                                inputComponent: FormatedInput,
                                sx: {
                                    '& input': { textAlign: 'right' },
                                },
                            }}
                        />
                    );
                },
                renderCell: (params) => {
                    const raw = params.value;
                    // Si vide, affiche 0,00
                    const value = raw === undefined || raw === '' ? 0 : Number(raw);

                    const formatted = value.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });

                    return formatted.replace(/\u202f/g, ' ');
                },
                cellClassName: (params) => {
                    const classes = [];

                    const rowInvalid = invalidRows.find(row => row.id === params.id);
                    if (params.field === 'montant_devise' && rowInvalid?.fields.includes('montant_devise')) {
                        classes.push('cell-error');
                    }

                    if (selectedCell.id === params.id && selectedCell.field === 'montant_devise') {
                        classes.push('cell-selected');
                    }

                    return classes.join(' ');
                }
            });
        }

        // Colonnes constantes : débit, crédit, action
        columns.push(
            {
                field: 'debit',
                headerName: 'Débit',
                type: 'string',
                sortable: true,
                editable: true,
                // width: 200,
                flex: 1.3,
                headerAlign: 'right',
                align: 'right',
                headerClassName: 'HeaderbackColor',
                renderEditCell: (params) => {
                    return (
                        <TextField
                            size="small"
                            name="debit"
                            fullWidth
                            value={params.value || ''}
                            onChange={(event) => {
                                const inputValue = event.target.value;

                                if (Number(inputValue) >= 0 || isNaN(inputValue)) {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'debit',
                                        value: inputValue,
                                    }, event);

                                    // Réinitialiser le crédit si un débit > 0 est saisi
                                    const rawValue = inputValue ?? '';
                                    const cleaned = rawValue.toString().replace(/\s/g, '').replace(',', '.');
                                    const numeric = Number(cleaned);

                                    if (!isNaN(numeric) && numeric > 0) {
                                        params.api.setEditCellValue({
                                            id: params.id,
                                            field: 'credit',
                                            value: '',
                                        }, event);
                                    }
                                }
                            }}

                            style={{ marginBottom: '0px', width: '200px', textAlign: 'right' }}
                            InputProps={{
                                inputComponent: FormatedInput,
                                sx: {
                                    '& input': { textAlign: 'right' },
                                },
                            }}
                        />
                    );
                },
                renderCell: (params) => {
                    const raw = params.value;
                    // Si vide, affiche 0,00
                    const value = raw === undefined || raw === '' ? 0 : Number(raw);

                    const formatted = value.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });

                    return formatted.replace(/\u202f/g, ' ');
                },
                cellClassName: (params) => {
                    const classes = [];

                    //Gestion des erreurs
                    const rowInvalid = invalidRows.find(row => row.id === params.id);
                    const debit = Number(params.row.debit) || 0;
                    const credit = Number(params.row.credit) || 0;

                    if (rowInvalid && debit === 0 && credit === 0 && rowInvalid.fields.includes('debit')) {
                        classes.push('cell-error');
                    }

                    //Mise en surbrillance de la cellule sélectionnée
                    if (selectedCell.id === params.id && selectedCell.field === 'debit') {
                        classes.push('cell-selected');
                    }

                    return classes.join(' ');
                }

            }
            , {
                field: 'credit',
                headerName: 'Crédit',
                type: 'string',
                sortable: true,
                editable: true,
                // width: 200,
                flex: 1.3,
                headerAlign: 'right',
                align: 'right',
                headerClassName: 'HeaderbackColor',
                renderEditCell: (params) => {
                    return (
                        <TextField
                            size="small"
                            name="credit"
                            fullWidth
                            value={params.value || ''}
                            onChange={(event) => {
                                const inputValue = event.target.value;

                                if (Number(inputValue) >= 0 || isNaN(inputValue)) {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'credit',
                                        value: inputValue,
                                    }, event);

                                    // Réinitialiser le crédit si un débit > 0 est saisi
                                    const rawValue = inputValue ?? '';
                                    const cleaned = rawValue.toString().replace(/\s/g, '').replace(',', '.');
                                    const numeric = Number(cleaned);

                                    if (!isNaN(numeric) && numeric > 0) {
                                        params.api.setEditCellValue({
                                            id: params.id,
                                            field: 'debit',
                                            value: '',
                                        }, event);
                                    }
                                }
                            }}

                            style={{ marginBottom: '0px', width: '200px', textAlign: 'right' }}
                            InputProps={{
                                inputComponent: FormatedInput,
                                sx: {
                                    '& input': { textAlign: 'right' },
                                },
                            }}
                        />
                    );
                },
                renderCell: (params) => {
                    const raw = params.value;
                    // Si vide, affiche 0,00
                    const value = raw === undefined || raw === '' ? 0 : Number(raw);

                    const formatted = value.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });

                    return formatted.replace(/\u202f/g, ' ');
                },
                cellClassName: (params) => {
                    const classes = [];

                    //Gestion des erreurs
                    const rowInvalid = invalidRows.find(row => row.id === params.id);
                    const debit = Number(params.row.debit) || 0;
                    const credit = Number(params.row.credit) || 0;

                    if (rowInvalid && credit === 0 && debit === 0 && rowInvalid.fields.includes('credit')) {
                        classes.push('cell-error');
                    }

                    // Mise en surbrillance de la cellule sélectionnée
                    if (selectedCell.id === params.id && selectedCell.field === 'credit') {
                        classes.push('cell-selected');
                    }

                    return classes.join(' ');
                }
            },
            {
                field: 'actions',
                headerName: 'Action',
                width: 150,
                sortable: false,
                headerAlign: 'center',
                // align: 'center',
                renderCell: (params) => {
                    const isLastRow = params.id === tableRows[tableRows.length - 1]?.id;
                    return (
                        <>
                            <Tooltip title="Supprimer une ligne">
                                <span>
                                    <Button
                                        onClick={() => handleOpenDialogConfirmDeleteSaisie(params.id)}
                                        disabled={tableRows.length === 1}
                                        color="error"
                                        sx={{
                                            outline: 'none',
                                            boxShadow: 'none',
                                            '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none',
                                            },
                                            '&:focus-visible': {
                                                outline: 'none',
                                                boxShadow: 'none',
                                            },
                                            ml: 0,
                                            pointerEvents: tableRows.length === 1 ? 'none' : 'auto', // empêche le clic sur le span
                                        }}
                                    >
                                        <GoX style={{ width: '30px', height: '30px' }} />
                                    </Button>
                                </span>
                            </Tooltip>

                            {isLastRow && (
                                <Tooltip title="Ajouter une ligne">
                                    <Button
                                        onClick={ajouterNouvelleLigne}
                                        sx={{
                                            boxShadow: 'none',
                                            '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none',
                                            }
                                        }}
                                    >
                                        <IoAddSharp style={{ width: '30px', height: '30px' }} />
                                    </Button>
                                </Tooltip>
                            )}
                        </>
                    )
                },
            }
        );
        return columns;
    };

    // Lors d’un clic sur une cellule
    const handleCellClick = (params) => {
        if (
            ['debit', 'credit', 'libelle', 'piece', 'compte', 'jour', 'montant_devise', 'num_facture'].includes(params.field)
        ) {
            setSelectedCell({ id: params.id, field: params.field });
        }
    };

    //Afficher une erreur si aucune mois n'est selectionné
    const handleRowEditStart = (params, event) => {
        if (!formSaisie.values.valSelectMois) {
            event.defaultMuiPrevented = true; // empêche l'édition
            toast.error("Veuillez d'abord sélectionner un mois");
        }
    };

    //supprimer un saisie
    const handleOpenDialogConfirmDeleteSaisie = (id) => {
        setOpenDialogDeleteSaisie(true);
        setSelectedIdToDelete(id);
    }

    //Récupérer les données du ligne selectionné
    const handleSelectionChange = (newSelectionModel) => {
        const selectedId = newSelectionModel[0];
        const row = tableRows.find((row) => row.id === selectedId);
        setSelectedRow(row);
    };

    //Ajouter une ligne
    const ajouterNouvelleLigne = () => {
        // const newId = tableRows.length > 0 ? Math.max(...tableRows.map(r => r.id)) + 1 * -1 : 1 * -1;
        if (!formSaisie.values.valSelectCodeJnl && !formSaisie.values.valSelectMois && !formSaisie.values.valSelectAnnee) {
            toast.error("Veuillez remplir les formulaires s'il vous plaît !");
        } else if (!formSaisie.values.valSelectCodeJnl) {
            toast.error("Sélectionner le code journal s'il vous plaît !");
        } else if (!formSaisie.values.valSelectMois) {
            toast.error("Sélectionner le mois s'il vous plaît !");
        } else if (!formSaisie.values.valSelectAnnee) {
            toast.error("Sélectionner l'année s'il vous plaît !");
        } else if (formSaisie.values.choixDevise !== 'MGA' && !formSaisie.values.currency) {
            toast.error("Veuillez sélectionner une devise s'il vous plaît !");
        } else {
            const minId = Math.min(...tableRows.map(r => r.id), -1); // min ou 0 si aucun
            const newId = minId <= 0 ? minId - 1 : -1;

            let dernierJour = '';
            let dernierLibelle = '';
            let dernierPiece = '';
            let dernierCompte = '';
            let dernierNumfacture = '';

            // Parcourir le tableau à l'envers
            for (let i = tableRows.length - 1; i >= 0; i--) {
                const row = tableRows[i];

                // Si `jour` est défini et non vide
                if (row.jour !== null && row.jour !== '' && dernierJour === '') {
                    dernierJour = row.jour;
                }

                // Si `libelle` est défini et non vide
                if (row.libelle !== null && row.libelle !== '' && dernierLibelle === '') {
                    dernierLibelle = row.libelle;
                }

                // Si `pièce` est défini et non vide
                if (row.piece !== null && row.piece !== '' && dernierPiece === '') {
                    dernierPiece = row.piece;
                }

                // Si `compte` est défini et non vide
                if (row.compte !== null && row.compte !== '' && dernierCompte === '') {
                    dernierCompte = row.compte;
                }

                // Si `num_facture` est défini et non vide
                if (row.num_facture !== null && row.num_facture !== '' && dernierNumfacture === '') {
                    dernierNumfacture = row.num_facture;
                }

                // Si les deux sont trouvés, on arrête
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
        }
    };

    //Afficher les contenus de tableRows
    const addTableRows = () => {
        const rowsInvalides = [];

        tableRows.forEach((row) => {
            const champsVides = [];

            if (!row.jour) champsVides.push('jour');
            if (!row.compte) champsVides.push('compte');
            if (!row.piece) champsVides.push('piece');
            if (!row.libelle) champsVides.push('libelle');
            if (!row.num_facture) champsVides.push('num_facture');
            if (formSaisie.values.choixDevise !== 'MGA') {
                if (!row.montant_devise) champsVides.push('montant_devise');
            }

            // Pour debit et credit : les deux doivent être vides pour signaler erreur
            const debitVide = !row.debit || Number(row.debit) === 0;
            const creditVide = !row.credit || Number(row.credit) === 0;

            if (debitVide && creditVide) {
                champsVides.push('debit', 'credit');
            }

            if (champsVides.length > 0) {
                rowsInvalides.push({ id: row.id, fields: champsVides });
            }
        });

        let id_devise = '';
        if (formSaisie.values.choixDevise !== 'MGA') {
            const devise = listeDevise.find((val) => val.code === formSaisie.values.currency);
            id_devise = devise?.id;
        }

        setInvalidRows(rowsInvalides);

        //Vérifie s’il y a des erreurs
        if (rowsInvalides.length === 0) {
            if (total !== 0) {
                toast.error('Total débit doit être égal à total crédit');
            } else {
                try {
                    const formData = new FormData();
                    formSaisie.values.id_devise = id_devise;

                    const valeursSansFichier = {
                        ...formSaisie.values,
                        file: undefined, // Exclure le fichier
                        tableRows: tableRows
                    };

                    console.log('tableRows : ', tableRows);

                    formData.append("data", JSON.stringify(valeursSansFichier));

                    if (file) {
                        formData.append("file", file);
                    }

                    axios.post('/administration/traitementSaisie/ajoutJournal', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then((response) => {
                        toast.success("Informations sauvegardées");
                        setRefresh();
                        setInvalidRows([]);
                    }).catch((error) => {
                        console.error("Erreur API :", error);
                    });
                } catch (error) {
                    console.error("Erreur inattendue :", error);
                    toast.error("Erreur inattendue lors de l'envoi");
                }
            }
        } else {
            toast.error('Les champs en surbrillance sont obligatoires');
            console.log("invalidRows :", rowsInvalides); //Logger rowsInvalides et pas invalidRows (état async)
        }
    };

    const editTableRows = () => {
        const rowsInvalides = [];

        tableRows.forEach((row) => {
            const champsVides = [];

            if (!row.jour) champsVides.push('jour');
            if (!row.compte) champsVides.push('compte');
            if (!row.piece) champsVides.push('piece');
            if (!row.libelle) champsVides.push('libelle');
            if (!row.num_facture) champsVides.push('num_facture');
            if (formSaisie.values.choixDevise !== 'MGA') {
                if (!row.montant_devise) champsVides.push('montant_devise');
            }

            // Pour debit et credit : les deux doivent être vides pour signaler erreur
            const debitVide = !row.debit || Number(row.debit) === 0;
            const creditVide = !row.credit || Number(row.credit) === 0;

            if (debitVide && creditVide) {
                champsVides.push('debit', 'credit');
            }

            if (champsVides.length > 0) {
                rowsInvalides.push({ id: row.id, fields: champsVides });
            }
        });

        let id_devise = '';
        if (formSaisie.values.choixDevise !== 'MGA') {
            const devise = listeDevise.find((val) => val.code === formSaisie.values.currency);
            id_devise = devise?.id;
        }

        setInvalidRows(rowsInvalides);

        //Vérifie s’il y a des erreurs
        if (rowsInvalides.length === 0) {
            if (total !== 0) {
                toast.error('Total débit doit être égal à total crédit');
            } else {
                try {
                    const conserverFichier = !file && !!formSaisie.values.file;
                    const formData = new FormData();
                    formSaisie.values.id_devise = id_devise;

                    const valeursSansFichier = {
                        ...formSaisie.values,
                        file: undefined, // Exclure le fichier
                        tableRows: tableRows,
                        conserverFichier,
                        deletedIds: deletedRowIds
                    };

                    formData.append("data", JSON.stringify(valeursSansFichier));

                    if (file) {
                        formData.append("file", file);
                    }

                    axios.post('/administration/traitementSaisie/modificationJournal', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then((response) => {
                        if (response.data.state) {
                            toast.success("Informations modifiés");
                            setRowSelectionModel();
                            setRefresh();
                            setInvalidRows([]);
                        } else {
                            toast.error("Une erreur est survenus lors de la modification")
                        }
                    }).catch((error) => {
                        console.error("Erreur API :", error);
                    });
                } catch (error) {
                    console.error("Erreur inattendue :", error);
                    toast.error("Erreur inattendue lors de l'envoi");
                }
            }
        } else {
            toast.error('Les champs en surbrillance sont obligatoires');
            console.log("invalidRows :", rowsInvalides); //Logger rowsInvalides et pas invalidRows (état async)
        }
    };

    const viewTableRows = type === 'ajout' ? addTableRows : editTableRows;

    // Calcul débit et crédit
    const totalDebitNotParsed = tableRows.reduce((total, row) => {
        const debit = parseFloat(row.debit) || 0; // conversion sécurisée
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

    //Récupération données liste code journaux
    const GetListeCodeJournaux = (id) => {
        axios.get(`/paramCodeJournaux/listeCodeJournaux/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListeCodeJournaux(resData.list);
            } else {
                setListeCodeJournaux([]);
                toast.error(resData.msg);
            }
        })
    }

    //Récupération la liste des exercices BY ID EXERCICE
    const GetDateDebutFinExercice = (id) => {
        axios.get(`/paramExercice/listeExerciceById/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                const annee = getAnneesEntreDeuxDates(resData.list.date_debut, resData.list.date_fin)
                setListeAnnee(annee)
            } else {
                setListeAnnee([])
                toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
            }
        })
    }

    //Récupération données liste des devises
    const GetListeDevises = (id) => {
        axios.get(`administration/traitementsaisie/recupDevise/${id}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListeDevise(response.data.list);
            } else {
                setListeDevise([])
                toast.error("Une erreur est survenue lors de la récupération de la liste des devises");
            }
        })
    }

    //Récupération du plan comptable
    const getPc = () => {
        axios.get(`/paramPlanComptable/PcIdLibelle/${compteId}/${fileId}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListePlanComptable(resData.liste);
            } else {
                toast.error(resData.msg);
            }
        })
    }

    //Recupérer l'année min et max de l'éxercice
    const getAnneesEntreDeuxDates = (dateDebut, dateFin) => {
        const debut = new Date(dateDebut).getFullYear();
        const fin = new Date(dateFin).getFullYear();
        const annees = [];

        for (let annee = debut; annee <= fin; annee++) {
            annees.push(annee);
        }

        return annees;
    };

    //Equilibrer le debit et credit
    const EquilibrateDebitCredit = (id, type) => {
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
            toast.error("Ligne introuvable.");
            return;
        }

        const selectedRow = tableRows[rowIndex];
        const newRows = [...tableRows];

        const debit = parseNumber(selectedRow.debit);
        const credit = parseNumber(selectedRow.credit);

        if (type === "debit" && difference <= 0) {
            if (credit !== 0) {
                toast.error("Aucun ajustement car un seul montant est renseigné.");
                return;
            }

            const adjustedDebit = parseFloat((debit + Math.abs(difference)).toFixed(2));
            let adjustedMontantDevise = selectedRow.montant_devise;

            if (formSaisie.values.choixDevise !== 'MGA') {
                const taux = parseNumber(formSaisie.values.taux);

                if (!taux || taux <= 0) {
                    toast.error("Taux invalide pour la conversion.");
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
            toast.success("Débit ajusté pour équilibrer les montants.");
        }
        else if (type === "credit" && difference >= 0) {
            if (debit !== 0) {
                toast.error("Aucun ajustement car un seul montant est renseigné.");
                return;
            }

            const adjustedCredit = parseFloat((credit + difference).toFixed(2));
            let adjustedMontantDevise = selectedRow.montant_devise;

            if (formSaisie.values.choixDevise !== 'MGA') {
                const taux = parseNumber(formSaisie.values.taux);

                if (!taux || taux <= 0) {
                    toast.error("Taux invalide pour la conversion.");
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
            toast.success("Crédit ajusté pour équilibrer les montants.");
        }
        else {
            toast.error("Aucun ajustement nécessaire.");
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && (event.key === ' ' || event.key === 'Spacebar')) {
                if (selectedCell) {
                    const { id, field } = selectedCell;

                    // La fonction qui vas équilibrer les debits et les credits
                    if (field === 'debit') {
                        EquilibrateDebitCredit(id, 'debit');
                    } else if (field === 'credit') {
                        EquilibrateDebitCredit(id, 'credit');
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Si aucune cellule n'est sélectionnée, on ne fait rien
            if (!selectedCell.id && !selectedCell.field) return;

            // Chercher si le clic est sur une cellule ou un élément lié au DataGrid
            // Exemple simple : on vérifie si le clic est dans un élément avec classe 'MuiDataGrid-cell'
            let el = event.target;
            let clickedOnCell = false;
            while (el) {
                if (el.classList && el.classList.contains('MuiDataGrid-cell')) {
                    clickedOnCell = true;
                    break;
                }
                el = el.parentElement;
            }

            // Si le clic est **pas** sur une cellule, on annule la sélection
            if (!clickedOnCell) {
                setSelectedCell({ id: null, field: null });
                // setInvalidRows([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedCell]);

    useEffect(() => {
        GetListeDevises(compteId)
    }, [compteId]);

    useEffect(() => {
        GetListeCodeJournaux(fileId);
        getPc();
    }, [fileId, compteId]);

    useEffect(() => {
        GetDateDebutFinExercice(selectedExerciceId)
    }, [selectedExerciceId])

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
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={true}
            // maxWidth="lg"
            fullWidth={true}
            fullScreen={true}
        >
            {openDialogDeleteSaisie ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la ligne sélectionné ?"} confirmationState={handleDeleteRow} /> : null}

            <IconButton
                style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 15,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent >
                <TabContext value={"1"} >
                    <Typography
                        variant='h6'
                        sx={{ marginLeft: 3 }}
                    >
                        {"Ajout d'une nouvelle saisie"}
                    </Typography>
                    <TabPanel value="1" style={{ height: '85%' }}>
                        <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                            <Stack
                                direction="row"
                                flexWrap="wrap"
                                spacing={2}
                                alignItems="center"
                                justifyContent="flex-start"
                                sx={{ width: '100%' }}
                                style={{
                                    marginLeft: "0px",
                                    padding: 10,
                                    backgroundColor: '#F4F9F9',
                                    borderRadius: "5px"
                                }}
                            >
                                {/* Code Journal */}
                                <FormControl variant="standard" sx={{ minWidth: 200, flex: 0.5 }}>
                                    <InputLabel>Code journal</InputLabel>
                                    <Select
                                        value={formSaisie.values.valSelectCodeJnl}
                                        onChange={formSaisie.handleChange}
                                        name="valSelectCodeJnl"
                                    >
                                        {listeCodeJournaux.map((value, index) => (
                                            <MenuItem key={index} value={value.id}>
                                                {`${value.code} - ${value.libelle}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Mois */}
                                <FormControl variant="standard" sx={{ minWidth: 90, flex: 0.3 }}>
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
                                <FormControl variant="standard" sx={{ minWidth: 120, flex: 0.3, marginLeft: 10 }} >
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
                                    <FormControlLabel value="Devises" control={<Radio />} label="Devises" />
                                </RadioGroup>

                                {/* Taux de conversion */}
                                <Stack spacing={1.5} sx={{ minWidth: 200, flex: 0.3 }}>
                                    <InputJoy
                                        placeholder="Taux"
                                        type="text"
                                        name="taux"
                                        step="0.01"
                                        value={taux}
                                        // onChange={(e) => setTaux(e.target.value)}
                                        onChange={(e) => {
                                            let value = e.target.value;
                                            // Si value est un objet de react-number-format
                                            if (typeof value === 'object' && value !== null) {
                                                value = value.floatValue ?? 0;
                                            }
                                            // Si c'est un nombre simple
                                            if (typeof value === 'number') {
                                                setTaux(value);
                                                formSaisie.setFieldValue('taux', value);
                                                return;
                                            }
                                            // Sinon c'est une string → nettoyer
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

                                {/* Bouton Enregistrer */}
                                <Button
                                    autoFocus
                                    sx={{ minWidth: 100, flex: 0.1 }}
                                    variant="contained"
                                    style={{
                                        height: "39px",
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: initial.theme,
                                        color: "white",
                                        marginTop: '0px'
                                    }}
                                    onClick={viewTableRows}
                                    disabled={!formSaisie.values.valSelectCodeJnl || !formSaisie.values.valSelectMois || !formSaisie.values.valSelectAnnee}
                                >
                                    {type === 'ajout' ? 'Enregistrer' : 'Modifier'}
                                </Button>
                            </Stack>
                            <Stack
                                width={"100%"}
                                height={"800px"}
                                style={{
                                    marginLeft: "0px",
                                    marginTop: "20px",
                                }}
                            >
                                <DataGrid
                                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                                    disableRowSelectionOnClick
                                    disableSelectionOnClick={true}
                                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                    slots={{
                                        toolbar: QuickFilter,
                                        footer: () => (
                                            <>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        bgcolor: '#F4F9F9',
                                                        borderTop: '1px solid #ccc',
                                                        height: '45px',
                                                        width: '100%',
                                                    }}
                                                >
                                                    {/* Flex identique aux colonnes */}
                                                    <Box sx={{ flex: 0.4, px: 1 }} >
                                                        <Typography fontWeight="bold">Total</Typography>
                                                    </Box>
                                                    <Box sx={{ flex: 0.8, px: 1 }} />
                                                    <Box sx={{ flex: 1.3, px: 1 }} />
                                                    <Box sx={{ flex: 2.7, px: 1 }}>
                                                    </Box>
                                                    <Box sx={{ flex: 1.3, textAlign: 'right', pr: 1 }}>
                                                        <Typography fontWeight="bold">{totalDebitFormatted}</Typography>
                                                    </Box>
                                                    <Box sx={{ flex: 1.3, textAlign: 'right', pr: 1, ml: 0.9 }}>
                                                        <Typography fontWeight="bold">{totalCreditFormatted}</Typography>
                                                    </Box>
                                                    <Box sx={{ width: 150, pr: 1 }} />
                                                </Box>

                                                <GridPagination
                                                    sx={{
                                                        overflow: 'hidden',
                                                    }}
                                                />
                                            </>
                                        ),
                                    }}
                                    sx={{
                                        ...DataGridStyle.sx, // les styles existants
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
                                        '& .MuiDataGrid-virtualScroller': {
                                            maxHeight: '500px',
                                        },
                                    }}
                                    processRowUpdate={(newRow, oldRow) => {
                                        const updatedRows = tableRows.map((row) =>
                                            row.id === oldRow.id ? { ...row, ...newRow } : row
                                        );
                                        setTableRows(updatedRows);
                                        return newRow;
                                    }}
                                    rowHeight={DataGridStyle.rowHeight}
                                    columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                    editMode='row'
                                    // editMode="cell"
                                    // columns={SaisieColumnHeader}
                                    columns={getSaisieColumnHeader()}
                                    // columns={columns}
                                    rows={tableRows}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 100 },
                                        },
                                    }}
                                    experimentalFeatures={{ newEditingApi: true }}
                                    pageSizeOptions={[5, 10, 20, 30, 50, 100]}
                                    pagination={DataGridStyle.pagination}
                                    // checkboxSelection={DataGridStyle.checkboxSelection}
                                    columnVisibilityModel={{
                                        id: false,
                                    }}
                                    onRowSelectionModelChange={handleSelectionChange}
                                    onRowEditStart={handleRowEditStart}
                                    onCellClick={handleCellClick}
                                />
                                <Typography fontWeight="bold">
                                    {
                                        "Débit - Crédit : " + totalFormatted + " " +
                                        (formSaisie.values.choixDevise === "MGA" ? formSaisie.values.choixDevise : formSaisie.values.currency === null ? '' : formSaisie.values.currency)
                                    }
                                </Typography>
                                <DropPDFUploader
                                    mode={type}
                                    file={file}
                                    setFile={setFile}
                                />
                            </Stack>
                        </Stack>
                    </TabPanel>
                </TabContext>
            </DialogContent>
            <DialogActions>
                <Button autoFocus
                    style={{ backgroundColor: initial.theme, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                    type='submit'
                    onClick={handleClose}
                >
                    Fermer
                </Button>
            </DialogActions>
        </BootstrapDialog>
    )
}

export default PopupSaisie;
