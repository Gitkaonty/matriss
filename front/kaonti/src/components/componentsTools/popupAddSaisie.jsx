import React, { useState, useEffect } from 'react';
import { Typography, Stack, Paper, Box, Tab, Badge, Button, Divider } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { init } from '../../../init';
import { CiWarning } from "react-icons/ci";
import { IoIosWarning } from "react-icons/io";

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
import { DataGridStyle } from './DatagridToolsStyle';
import { DataGrid, frFR, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import QuickFilter from './DatagridToolsStyle';

import { useFormik, Field, Formik, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";

import { Autocomplete, TextField } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';

import PopupConfirmDelete from './popupConfirmDelete';

import FormatedInput from './FormatedInput';
import InputAdornment from '@mui/material/InputAdornment';

import Tooltip from '@mui/material/Tooltip';
import { TbPlaylistAdd } from "react-icons/tb";
import { IoAddSharp } from "react-icons/io5";
import { GoX } from "react-icons/go";

import { GridPagination } from '@mui/x-data-grid';
import DropPDFUploader from './FileUploader/DropPdfUploader';

import toast from 'react-hot-toast';

let initial = init[0];

const headCells = [
    {
        id: 'dateMvt',
        numeric: false,
        disablePadding: true,
        label: 'Date',
        width: '20px'
    },
    // {
    //     id: 'journal',
    //     numeric: false,
    //     disablePadding: false,
    //     label: 'Journal',
    //     width: '20px'
    // },
    {
        id: 'compte',
        numeric: false,
        disablePadding: false,
        label: 'Compte',
        width: '100px'
    },
    {
        id: 'piece',
        numeric: false,
        disablePadding: false,
        label: 'Pièce',
        width: '100px'
    },
    {
        id: 'libelle',
        numeric: false,
        disablePadding: false,
        label: 'Libellé',
        width: '300px'
    },
    {
        id: 'debit',
        numeric: true,
        disablePadding: false,
        label: 'Débit',
        width: '100px'
    },
    {
        id: 'credit',
        numeric: true,
        disablePadding: false,
        label: 'Crédit',
        width: '100px'
    }
];

function createData(id, jour, compte, piece, libelle, debit, credit) {
    return {
        id,
        jour,
        compte,
        piece,
        libelle,
        debit,
        credit,
    };
}

const rows = [
    createData(-1, null, null, null, null, null, null),
    // createData(2, '10', '626000', 'scan 0004', 'FACT202301001', 35000.12, 0.00),
    // createData(3, '20', '445610', 'scan 0004', 'FACT202301001', 5000.00, 0.00),
    // createData(4, '15', '401ORA', 'scan 0004', 'FACT202301001', 0.00, 40000.12),
    // createData(5, '04', '626000', 'scan 0004', 'FACT202301001', 35000.12, 0.00),
    // createData(6, '08', '445610', 'scan 0004', 'FACT202301001', 5000.00, 0.00),
    // createData(7, '04', '401ORA', 'scan 0004', 'FACT202301001', 0.00, 40000.12),
    // createData(8, '09', '626000', 'scan 0004', 'FACT202301001', 35000.12, 0.00),
    // createData(9, '19', '445610', 'scan 0004', 'FACT202301001', 5000.00, 0.00),
    // createData(10, '28', '401ORA', 'scan 0004', 'FACT202301001', 0.00, 40000.12),
    // createData(11, '15', '626000', 'scan 0004', 'FACT202301001', 35000.12, 0.00),
    // createData(12, '21', '445610', 'scan 0004', 'FACT202301001', 5000.00, 0.00),
    // createData(13, '28', '401ORA', 'scan 0004', 'FACT202301001', 0.00, 40000.12),
    // createData(14, '31', '626000', 'scan 0004', 'FACT202301001', 35000.12, 0.00),
    // createData(15, '11', '445610', 'scan 0004', 'FACT202301001', 5000.00, 0.00),
];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const PopupAddSaisie = ({ confirmationState }) => {

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

    const [tableRows, setTableRows] = useState(rows);
    const [invalidRows, setInvalidRows] = useState([]);

    const [openDialogDeleteSaisie, setOpenDialogDeleteSaisie] = useState(false);

    //Fichier importé
    const [file, setFile] = useState(null)

    //Id du ligne du tableau selectionné
    const [selectedId, setSelectedId] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null)
    // console.log("selectedId : ", selectedId)

    //Id du ligne à supprimer
    const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);

    //Valeur du listbox choix code journal-----------------------------------------------------
    const [valSelectCodeJnl, setValSelectCodeJnl] = React.useState('');

    const handleChangeCodeJnl = (event) => {
        setValSelectCodeJnl(event.target.value);
    };

    //Valeur du listbox choix du mois-----------------------------------------------------
    const [valSelectMois, setValSelectMois] = React.useState('');

    const handleChangeMois = (event) => {
        setValSelectMois(event.target.value);
    };

    //Valeur du listbox choix de l'année-----------------------------------------------------
    const [valSelectAnnee, setValSelectAnnee] = React.useState('');

    const handleChangeAnnee = (event) => {
        setValSelectAnnee(event.target.value);
    };

    //Valeur du listbox choix de l'exercice-----------------------------------------------------
    const [choixExercice, setChoixExercice] = useState('');

    const handleChangeExercice = (event) => {
        setChoixExercice(event.target.value);
    }

    //Choix de devises-------------------------------------------------------------------
    const [currency, setCurrency] = useState('dollar');

    const handleClose = () => {
        confirmationState(false);
    }

    //Valeur du taux-------------------------------------------------------------------
    const [taux, setTaux] = useState('');

    const handleChangeTaux = (event) => {
        setTaux(event.target.value);
    }

    //Valeur du débit
    const [debit, setDebit] = useState(0)

    const handleChangeDebit = (event) => {
        setDebit(event.target.value);
    }

    //Supprimer la ligne
    const handleDeleteRow = (value) => {
        if (value) {
            setTableRows((prevRows) => prevRows.filter((row) => row.id !== selectedIdToDelete));
            setOpenDialogDeleteSaisie(false);
        } else {
            setOpenDialogDeleteSaisie(false);
        }
    };

    //Formik ajout saisie
    const formSaisie = useFormik({
        initialValues: {
            valSelectCodeJnl: '',
            valSelectMois: '',
            valSelectAnnee: '',
            choixDevise: 'MGA',
            taux: '',
            currency: ''
        },
        onSubmit: (values) => {
            console.log(values);
        }
    })

    //Header
    const SaisieColumnHeader = [
        {
            field: 'jour',
            headerName: 'Jour',
            type: 'number',
            editable: true,
            sortable: true,
            width: 60,
            headerAlign: 'center',
            align: 'center',
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

                            // Autoriser la suppression complète du champ
                            if (inputValue === '') {
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'jour',
                                    value: '',
                                });
                                return;
                            }

                            const intValue = parseInt(inputValue);

                            // Vérifie si la valeur est bien dans la plage valide
                            if (!isNaN(intValue) && intValue >= 1 && intValue <= maxDay) {
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'jour',
                                    value: intValue,
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
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                return rowInvalid?.fields.includes('jour') ? 'cell-error' : '';
            },
        },
        {
            field: 'compte',
            headerName: 'Compte',
            editable: true,
            width: 230,
            renderEditCell: (params) => {
                const comptes = [
                    '401ORA',
                    '626000',
                    '445610',
                    '512000',
                    '707000',
                    '706100',
                ];

                return (
                    <Autocomplete
                        autoHighlight
                        options={comptes}
                        value={params.value || ''}
                        onChange={(e, newValue) => {
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'compte',
                                value: newValue,
                            });
                        }}

                        renderInput={(paramsInput) => (
                            <TextField
                                {...paramsInput}
                                variant="standard"
                                placeholder="Choisir un compte"
                                fullWidth
                                style={{ width: 230 }}
                            />
                        )}
                    />
                );
            },
            cellClassName: (params) => {
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                return rowInvalid?.fields.includes('compte') ? 'cell-error' : '';
            },
        },
        {
            field: 'piece',
            headerName: 'Pièce',
            type: 'string',
            sortable: true,
            editable: true,
            width: 330,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            cellClassName: (params) => {
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                return rowInvalid?.fields.includes('piece') ? 'cell-error' : '';
            },
        }, {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            editable: true,
            width: 425,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            cellClassName: (params) => {
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                return rowInvalid?.fields.includes('libelle') ? 'cell-error' : '';
            },
        }, {
            field: 'debit',
            headerName: 'Débit',
            type: 'string',
            sortable: true,
            editable: true,
            width: 200,
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
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'debit',
                                value: event.target.value,
                            });
                        }}
                        style={{
                            marginBottom: '0px',
                            width: '200px',
                            textAlign: 'right',
                        }}
                        InputProps={{
                            inputComponent: FormatedInput,
                            sx: {
                                '& input': {
                                    textAlign: 'right', // Alignement du texte dans le champ à droite
                                },
                            },
                        }}
                    />
                );
            },
            renderCell: (params) => {
                const formatted = Number(params.value).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                // Remplace les espaces fines insécables par un espace classique
                return formatted.replace(/\u202f/g, ' ');
            },
            cellClassName: (params) => {
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                return rowInvalid?.fields.includes('debit') ? 'cell-error' : '';
            },
        }
        , {
            field: 'credit',
            headerName: 'Crédit',
            type: 'string',
            sortable: true,
            editable: true,
            width: 200,
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
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'credit',
                                value: event.target.value,
                            });
                        }}
                        style={{
                            marginBottom: '0px',
                            width: '200px',
                            textAlign: 'right',
                        }}
                        InputProps={{
                            inputComponent: FormatedInput,
                            sx: {
                                '& input': {
                                    textAlign: 'right', // Alignement du texte dans le champ à droite
                                },
                            },
                        }}
                    />
                );
            },
            renderCell: (params) => {
                const formatted = Number(params.value).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                // Remplace les espaces fines insécables par un espace classique
                return formatted.replace(/\u202f/g, ' ');
            },
            cellClassName: (params) => {
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                return rowInvalid?.fields.includes('credit') ? 'cell-error' : '';
            },
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
                        <Tooltip
                            title="Supprimer une ligne">
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
                                    ml: 0
                                }}
                            >
                                <GoX style={{ width: '30px', height: '30px' }} />
                            </Button>
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
    ]

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
        console.log("Ligne sélectionnée :", row);
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
        } else {
            const minId = Math.min(...tableRows.map(r => r.id), -1); // min ou 0 si aucun
            const newId = minId <= 0 ? minId - 1 : -1;

            const newRow = {
                id: newId,
                jour: '',
                compte: '',
                piece: '',
                libelle: '',
                debit: 0.00,
                credit: 0.00,
            };

            setTableRows([...tableRows, newRow]);
        }
    };

    //Afficher les contenus de tableRows
    const viewTableRows = () => {
        const rowsInvalides = [];

        tableRows.forEach((row) => {
            const champsVides = [];

            if (!row.jour) champsVides.push('jour');
            if (!row.compte) champsVides.push('compte');
            if (!row.piece) champsVides.push('piece');
            if (!row.libelle) champsVides.push('libelle');
            if (!row.debit) champsVides.push('debit');
            if (!row.credit) champsVides.push('credit');

            if (champsVides.length > 0) {
                rowsInvalides.push({ id: row.id, fields: champsVides });
            }
        });

        setInvalidRows(rowsInvalides);

        //Vérifie s’il y a des erreurs
        if (rowsInvalides.length === 0) {
            console.log("tableRows : ", { tableRows: tableRows, formSaisie: formSaisie.values, file: file });
        } else {
            toast.error('Les champs en surbrillance sont obligatoires');
            console.log("invalidRows :", invalidRows)
        }
    };

    ////////////////////////////////////////////////////////////////////// Calcul débit et crédit
    const totalDebit = tableRows.reduce((total, row) => {
        const debit = parseFloat(row.debit) || 0; // conversion sécurisée
        return total + debit;
    }, 0);

    const totalCredit = tableRows.reduce((total, row) => {
        const credit = parseFloat(row.credit) || 0;
        return total + credit;
    }, 0)

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
    //////////////////////////////////////////////////////////////////////

    //Algorithme MGA et Devises
    if (formSaisie.values.choixDevise === "MGA") {
        formSaisie.values.currency = ""
    }

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={true}
            // maxWidth="lg"
            fullWidth={true}
            fullScreen={true}
        >

            {/* <DialogTitle sx={{ m: 0 }} id="customized-dialog-title" style={{ fontWeight: 'bold', width: '600px', height: '50px', backgroundColor: 'transparent' }}>

            </DialogTitle> */}
            {openDialogDeleteSaisie ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer la saisie sélectionné ?"} confirmationState={handleDeleteRow} /> : null}

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
                        marginLeft={3}
                    >
                        {"Ajout d'une nouvelle saisie"}
                    </Typography>
                    <TabPanel value="1" style={{ height: '85%' }}>
                        <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                            <Stack
                                direction="row"
                                width="100%"
                                height="80px"
                                spacing={4}
                                alignItems="center"
                            // justifyContent="space-between"
                            >
                                <FormControl variant="standard" sx={{ m: 1, minWidth: 50 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Code journal</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={formSaisie.values.valSelectCodeJnl}
                                        onChange={formSaisie.handleChange}
                                        name="valSelectCodeJnl"
                                        sx={{ width: "130px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                    >
                                        <MenuItem value={"AC"}>AC</MenuItem>
                                        <MenuItem value={"VT"}>VT</MenuItem>
                                        <MenuItem value={"BQ"}>BQ</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl variant="standard" sx={{ m: 1, minWidth: 50 }}>
                                    <InputLabel id="demo-simple-select-standard-label" style={{ marginLeft: "20px" }}>Mois</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={formSaisie.values.valSelectMois}
                                        onChange={formSaisie.handleChange}
                                        name="valSelectMois"
                                        label={"valSelectMois"}
                                        sx={{ width: "130px", display: "flex", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left", marginLeft: "20px" }}
                                    >
                                        <MenuItem value={1}>Janvier</MenuItem>
                                        <MenuItem value={2}>Février</MenuItem>
                                        <MenuItem value={3}>Mars</MenuItem>
                                        <MenuItem value={4}>Avril</MenuItem>
                                        <MenuItem value={5}>Mai</MenuItem>
                                        <MenuItem value={6}>Juin</MenuItem>
                                        <MenuItem value={7}>Juillet</MenuItem>
                                        <MenuItem value={8}>Août</MenuItem>
                                        <MenuItem value={9}>Septembre</MenuItem>
                                        <MenuItem value={10}>Octobre</MenuItem>
                                        <MenuItem value={11}>Novembre</MenuItem>
                                        <MenuItem value={12}>Décembre</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl variant="standard" sx={{ m: 1, minWidth: 50 }}>
                                    <InputLabel id="select-annee-label" style={{ marginLeft: "20px" }}>Année</InputLabel>
                                    <Select
                                        labelId="select-annee-label"
                                        id="select-annee"
                                        value={formSaisie.values.valSelectAnnee}
                                        onChange={formSaisie.handleChange}
                                        name='valSelectAnnee'
                                        sx={{
                                            width: "130px",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            alignContent: "flex-start",
                                            textAlign: "left",
                                            marginLeft: "20px"
                                        }}
                                    >
                                        {years.map((year) => (
                                            <MenuItem key={year} value={year}>{year}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <RadioGroup
                                    row
                                    aria-labelledby="choixDevise"
                                    name="choixDevise"
                                    style={{ marginLeft: "50px", marginTop: "10px" }}
                                    value={formSaisie.values.choixDevise}
                                    onChange={formSaisie.handleChange}
                                >
                                    <FormControlLabel value="MGA" control={<Radio />} label="MGA" />
                                    <FormControlLabel value="Devises" control={<Radio />} label="Devises" />
                                </RadioGroup>

                                <Stack spacing={1.5} style={{ marginTop: "10px" }}>
                                    <InputJoy
                                        placeholder="Taux"
                                        type='number'
                                        name='taux'
                                        value={formSaisie.values.taux}
                                        onChange={formSaisie.handleChange}
                                        sx={{
                                            // Supprimer les flèches sur Chrome, Safari, Edge
                                            '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                            '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                            // Supprimer les flèches sur Firefox
                                            '& input[type=number]': {
                                                MozAppearance: 'textfield',
                                            },
                                            width: 300
                                        }}
                                        disabled={formSaisie.values.choixDevise === "MGA"}
                                        startDecorator={{ dollar: '$', baht: '฿', yen: '¥' }[formSaisie.values.currency]}
                                        endDecorator={
                                            <React.Fragment>
                                                <Divider orientation="vertical" />
                                                <SelectJoy
                                                    variant="plain"
                                                    value={formSaisie.values.currency}
                                                    onChange={(_, value) => formSaisie.setFieldValue('currency', value)}
                                                    name='currency'
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
                                                    <OptionJoy value="Dollar">US dollar</OptionJoy>
                                                    <OptionJoy value="Baht">Thai baht</OptionJoy>
                                                    <OptionJoy value="Yen">Japanese yen</OptionJoy>
                                                </SelectJoy>
                                            </React.Fragment>
                                        }
                                    />
                                </Stack>
                                <Button autoFocus
                                    variant="contained"
                                    style={{
                                        height: "50px",
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: initial.theme,
                                        color: "white",
                                        marginTop: '6px'
                                    }}
                                    onClick={viewTableRows}
                                    disabled={!formSaisie.values.valSelectCodeJnl || !formSaisie.values.valSelectMois || !formSaisie.values.valSelectAnnee}
                                >
                                    Enregistrer
                                </Button>
                            </Stack>
                            <Stack
                                width={"100%"}
                                height={'2000px'}
                            // maxHeight={'600px'}
                            // minHeight={'1000px'}
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
                                                    }}
                                                >
                                                    {/* Partie fixe à gauche */}
                                                    <Box
                                                        sx={{
                                                            width: 1036,
                                                            // backgroundColor : 'red',
                                                            px: 2,
                                                        }}
                                                    >
                                                        <Typography variant="body2" fontWeight="bold">Total :</Typography>
                                                    </Box>

                                                    {/* Valeur Débit alignée avec colonne Débit */}
                                                    <Box
                                                        sx={{
                                                            width: 200,
                                                            textAlign: 'right',
                                                            // backgroundColor : 'blue',
                                                            pr: '1px',
                                                        }}
                                                    >
                                                        <Typography variant="body2" fontWeight="bold">{totalDebitFormatted}</Typography>
                                                    </Box>

                                                    {/* Valeur Crédit alignée avec colonne Crédit */}
                                                    <Box
                                                        sx={{
                                                            width: 200,
                                                            textAlign: 'right',
                                                            // backgroundColor : 'yellow',
                                                            pr: '1px',
                                                        }}
                                                    >
                                                        <Typography variant="body2" fontWeight="bold">{totalCreditFormatted}</Typography>
                                                    </Box>
                                                </Box>

                                                <GridPagination
                                                    sx={{
                                                        overflow: 'hidden', // cache les débordements (comme la pagination qui dépasse parfois),
                                                    }} />
                                            </>
                                        ),
                                    }}
                                    sx={{
                                        ...DataGridStyle.sx, // tes styles existants
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
                                            // border: '1px solid #ff4d4f',
                                        }
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
                                    columns={SaisieColumnHeader}
                                    rows={tableRows}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 50 },
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
                                />
                                <Typography fontWeight="bold">
                                    {
                                        "Débit - Crédit : " + totalFormatted + " " +
                                        (formSaisie.values.choixDevise === "MGA" ? formSaisie.values.choixDevise : formSaisie.values.currency)
                                    }
                                </Typography>
                                <DropPDFUploader
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

export default PopupAddSaisie;
