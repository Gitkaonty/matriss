import { React, useEffect, useMemo, useState } from 'react';
import {
    Typography, Stack, Button, ButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, FormControl, FormLabel, Input, FormHelperText, Box, TextField, InputAdornment, Paper
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

import { styled } from '@mui/material/styles';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter, { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import PopupActionConfirm from '../../../componentsTools/popupActionConfirm';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { init } from '../../../../../init';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';



const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const BORDER_COLOR = '#E2E8F0';
const NAV_DARK = '#0B1120';
const NEON_MINT = '#00FF94';
const BG_SOFT = '#F8FAFC';

const tableContainerStyle = {
    borderRadius: '12px',
    border: `1px solid ${BORDER_COLOR}`,
    bgcolor: '#fff',
    overflow: 'hidden',
    height: 'calc(100vh - 280px)',
    minHeight: '500px'
};
const cellStyle = { fontSize: '13px', py: '6px', color: '#334155' };

const headerStyle = (width, last = false) => ({
    fontWeight: 800,
    color: '#94A3B8',
    fontSize: '10px',
    textTransform: 'uppercase',
    width: width,
    minWidth: width,
    paddingY: '4px',
    pr: last ? 2 : 1
});

const btnStyle = {
    bgcolor: '#10B981',
    color: '#fff',
    textTransform: 'none',
    fontWeight: 700,
    borderRadius: '6px',
    height: '28px',
    fontSize: '11px',
    '&:hover': { bgcolor: '#059669' }
};

export default function Periode({ selectedExercice, idCompte, idDossier, axiosPrivate, canAdd, canDelete, canModify }) {
    const initial = init[0];
    const [listePeriodes, setListePeriodes] = useState([]);
    const [openDialogCreatePeriode, setOpenDialogCreatePeriode] = useState(false);
    const [selectedPeriodeRow, setSelectedPeriodeRow] = useState([]);

    const [openConfirmDeletePeriode, setOpenConfirmDeletePeriode] = useState(false);
    const [periodeToDeleteId, setPeriodeToDeleteId] = useState(null);

    const periodeMin = useMemo(() => {
        if (!selectedExercice?.date_debut) return undefined;
        const d = new Date(selectedExercice.date_debut);
        return isNaN(d.getTime()) ? undefined : d;
    }, [selectedExercice]);

    const periodeMax = useMemo(() => {
        if (!selectedExercice?.date_fin) return undefined;
        const d = new Date(selectedExercice.date_fin);
        return isNaN(d.getTime()) ? undefined : d;
    }, [selectedExercice]);

    const GetListePeriodes = async (id_exercice) => {
        try {
            const response = await axiosPrivate.get(`/paramExercice/listePeriodes/${id_exercice}`);
            const resData = response.data;
            if (resData.state) {
                setListePeriodes(resData.list || []);
            } else {
                setListePeriodes([]);
                toast.error(resData.msg);
            }
        } catch (e) {
            setListePeriodes([]);
            toast.error(e.response?.data?.msg || e.message);
        }
    };

    useEffect(() => {
        if (selectedExercice?.id) {
            GetListePeriodes(selectedExercice.id);
        } else {
            setListePeriodes([]);
            setSelectedPeriodeRow([]);
        }
    }, [selectedExercice?.id]);

    const handleCloseDialogCreatePeriode = () => {
        setOpenDialogCreatePeriode(false);
        periodeForm.resetForm();
    };

    const createPeriode = async (values) => {
        if (!selectedExercice?.id) {
            toast.error("Veuillez sélectionner un exercice avant de continuer.");
            return;
        }

        try {
            const response = await axiosPrivate.post(`/paramExercice/createPeriode`, {
                id_exercice: selectedExercice.id,
                id_compte: idCompte,
                id_dossier: idDossier,
                libelle: values.libelle,
                date_debut: values.date_debut,
                date_fin: values.date_fin,
            });

            const resData = response.data;
            if (resData.state) {
                toast.success('Période créée');
                handleCloseDialogCreatePeriode();
                GetListePeriodes(selectedExercice.id);
            } else {
                toast.error(resData.msg);
            }
        } catch (e) {
            toast.error(e.response?.data?.msg || e.message);
        }
    };

    // const deletePeriode = async () => {
    //     if (!selectedExercice?.id) {
    //         toast.error("Veuillez sélectionner un exercice avant de continuer.");
    //         return;
    //     }
    //     if (selectedPeriodeRow.length !== 1) {
    //         toast.error('Veuillez sélectionner une seule période avant de continuer.');
    //         return;
    //     }

    //     try {
    //         const response = await axiosPrivate.post(`/paramExercice/deletePeriode`, {
    //             id_periode: selectedPeriodeRow[0]
    //         });
    //         const resData = response.data;
    //         if (resData.state) {
    //             toast.success('Période supprimée');
    //             setSelectedPeriodeRow([]);
    //             GetListePeriodes(selectedExercice.id);
    //         } else {
    //             toast.error(resData.msg);
    //         }
    //     } catch (e) {
    //         toast.error(e.response?.data?.msg || e.message);
    //     }
    // };

    // Étape 1 : déclencher la popup
    const handleDeletePeriode = () => {
        if (!selectedExercice?.id) {
            toast.error("Veuillez sélectionner un exercice avant de continuer.");
            return;
        }
        if (selectedPeriodeRow.length !== 1) {
            toast.error('Veuillez sélectionner une seule période avant de continuer.');
            return;
        }

        setPeriodeToDeleteId(selectedPeriodeRow[0]);
        setOpenConfirmDeletePeriode(true);
    };

    // Étape 2 : confirmation
    const confirmDeletePeriode = async () => {
        try {
            const response = await axiosPrivate.post(`/paramExercice/deletePeriode`, {
                id_periode: periodeToDeleteId
            });
            const resData = response.data;
            if (resData.state) {
                toast.success('Période supprimée');
                setSelectedPeriodeRow([]);
                GetListePeriodes(selectedExercice.id);
            } else {
                toast.error(resData.msg);
            }
        } catch (e) {
            toast.error(e.response?.data?.msg || e.message);
        } finally {
            setOpenConfirmDeletePeriode(false);
            setPeriodeToDeleteId(null);
        }
    };
    const periodeForm = useFormik({
        initialValues: {
            //libelle: '',
            date_debut: '',
            date_fin: '',
        },
        validationSchema: Yup.object({
            // libelle: Yup.string().required('Libellé requis'),
            date_debut: Yup.string().required('La date est requise'),
            date_fin: Yup.string().required('La date est requise'),
        }),
        validate: (values) => {
            const errors = {};

            if (values.date_debut && values.date_fin) {
                const startDate = new Date(values.date_debut);
                const endDate = new Date(values.date_fin);
                if (startDate > endDate) {
                    errors.date_fin = 'La date fin ne doit être antérieure à la date de début';
                }

                if (periodeMin && startDate < periodeMin) {
                    errors.date_debut = 'La date début doit être dans l\'exercice';
                }
                if (periodeMax && endDate > periodeMax) {
                    errors.date_fin = 'La date fin doit être dans l\'exercice';
                }
            }

            return errors;
        },
        onSubmit: createPeriode,
    });

    const PeriodeColumnHeader = useMemo(() => ([
        // {
        //     field: 'libelle',
        //     headerName: 'Libellé',
        //     type: 'string',
        //     sortable: true,
        //     width: 250,
        //     headerAlign: 'center',
        //     align: 'center',
        //     headerClassName: 'HeaderbackColor',
        // },
        {
            field: 'date_debut',
            headerName: 'Date début',
            type: 'Date',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
            valueFormatter: (params) => format(params.value, 'dd/MM/yyyy')
        },
        {
            field: 'date_fin',
            headerName: 'Date fin',
            type: 'Date',
            sortable: true,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'HeaderbackColor',
            valueFormatter: (params) => format(params.value, 'dd/MM/yyyy')
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

                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ pr: 1 }}>
                        <IconButton
                            disabled={!canDelete || !selectedExercice?.id || selectedPeriodeRow.length === 0}
                            onClick={handleDeletePeriode}
                            size="small"
                            sx={{ color: '#CBD5E1', '&:hover': { color: '#EF4444' } }}
                            title="Supprimer"
                        >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Stack>

                );
            },
        },
    ]), [selectedPeriodeRow, canDelete, selectedExercice, handleDeletePeriode]);
    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        borderRadius: 1,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
    };
    const btnStyle = {
        bgcolor: '#10B981',
        color: '#fff',
        textTransform: 'none',
        fontWeight: 700,
        borderRadius: '6px',
        height: '28px',
        fontSize: '11px',
        '&:hover': { bgcolor: '#059669' }
    };
    return (
        <Box sx={{ width: '100%' }}>
            {/* BARRE D'OUTILS PERIODE */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    mb: 2,
                    px: 2
                    // height: '40px',
                    // bgcolor: '#fff',
                    // borderRadius: '8px',
                    // p: 1,
                    // border: `1px solid ${BORDER_COLOR}`
                }}
            >
                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: NAV_DARK, ml: 1 }}>
                    Périodes détaillées
                </Typography>
                 <Box sx={{ ml: 'auto', mr: 3.5 }}>
                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        disabled={!canAdd || !selectedExercice?.id}
                        onClick={() => {
                            if (selectedExercice?.date_debut) {
                                periodeForm.setFieldValue('date_debut', selectedExercice.date_debut.split('T')[0]);
                            }
                            setOpenDialogCreatePeriode(true);
                        }}
                        sx={{
                            bgcolor: NEON_MINT,
                            textTransform: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#000',
                            borderRadius: '6px',
                            // px: 2,
                            '&:hover': {
                                bgcolor: '#00E685',
                                transform: 'translateY(-1px)'
                            },
                        }}
                    >
                        Ajouter
                    </Button>
                </Box>

                {/* <TextField
                        placeholder="Recherche..."
                        size="small"
                        sx={{
                            width: 140,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                height: '28px',
                                fontSize: '12px'
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                                </InputAdornment>
                            ),
                        }}
                    /> */}
                {/* <Button
                        size="small"
                        startIcon={<AddIcon />}
                        disabled={!canAdd || !selectedExercice?.id}
                        onClick={() => {
                            if (selectedExercice?.date_debut) {
                                periodeForm.setFieldValue('date_debut', selectedExercice.date_debut.split('T')[0]);
                            }
                            setOpenDialogCreatePeriode(true);
                        }}
                        sx={{
                            bgcolor: NEON_MINT,
                            textTransform: 'none',
                            fontSize: '12px',
                            fontWeight: 700,                        
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
                    </Button> */}
            </Stack>

            {/* DATAGRID PERIODE */}
            <Paper
                elevation={0}
                sx={tableContainerStyle}
            >
                <DataGrid
                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                    disableRowSelectionOnClick
                    disableSelectionOnClick={true}
                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#F8FAFC',
                            borderBottom: `1px solid ${BORDER_COLOR}`,
                        },
                        '& .MuiDataGrid-columnHeaderTitle': headerStyle(),
                        '& .MuiDataGrid-cell': cellStyle,
                        '& .MuiDataGrid-row': {
                            '&:hover': { bgcolor: '#F1F5F9' },
                            '&:nth-of-type(even)': { bgcolor: '#FAFAFA' },
                        },
                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                        },
                    }}
                    rowHeight={40}
                    columnHeaderHeight={40}
                    editMode='row'
                    columns={PeriodeColumnHeader}
                    rows={listePeriodes}
                    onRowSelectionModelChange={ids => {
                        const single = Array.isArray(ids) && ids.length ? [ids[ids.length - 1]] : [];
                        setSelectedPeriodeRow(single);
                    }}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 100 },
                        },
                    }}
                    pageSizeOptions={[50, 100]}
                    checkboxSelection={DataGridStyle.checkboxSelection}
                    columnVisibilityModel={{
                        id: false,
                    }}
                    rowSelectionModel={selectedPeriodeRow}
                />
            </Paper>

            {/* DIALOG CREATE PERIODE */}
            <form onSubmit={periodeForm.handleSubmit}>
                <BootstrapDialog
                    onClose={handleCloseDialogCreatePeriode}
                    aria-labelledby="customized-dialog-title"
                    open={openDialogCreatePeriode}
                >
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontWeight: 'bold', width: '600px', height: '50px', backgroundColor: 'transparent' }}>
                    </DialogTitle>

                    <IconButton
                        style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                        aria-label="close"
                        onClick={handleCloseDialogCreatePeriode}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <DialogContent>
                        <Stack width={'95%'} height={'100%'} spacing={2} alignItems={'center'} alignContent={'center'} direction={'column'} justifyContent={'center'} style={{ marginLeft: '10px' }}>
                            <Typography sx={{ ml: 0, flex: 1 }} variant="h7" component="div">
                                Création d'une période
                            </Typography>

                            <Stack width={'450px'} spacing={2} direction={'row'} alignItems={'end'}>
                                <FormControl sx={{ width: '200px' }} error={periodeForm.errors.date_debut && periodeForm.touched.date_debut}>
                                    <FormLabel id="datedebut-label" htmlFor="date_debut">
                                        <Typography level="title-date_debut">Date début :</Typography>
                                    </FormLabel>
                                    <Input
                                        type='date'
                                        name="date_debut"
                                        value={periodeForm.values.date_debut}
                                        onChange={periodeForm.handleChange}
                                        onBlur={periodeForm.handleBlur}
                                        disabled
                                        required
                                    />
                                    <FormHelperText>
                                        {periodeForm.errors.date_debut && periodeForm.touched.date_debut && periodeForm.errors.date_debut}
                                    </FormHelperText>
                                </FormControl>

                                <Typography sx={{ ml: 0, pb: 1, flex: 1 }} variant="h7" component="div">
                                    au
                                </Typography>

                                <FormControl sx={{ width: '200px' }} error={periodeForm.errors.date_fin && periodeForm.touched.date_fin}>
                                    <FormLabel id="datefin-label" htmlFor="date_fin">
                                        <Typography level="title-date_fin">Date fin :</Typography>
                                    </FormLabel>
                                    <Input
                                        type='date'
                                        name="date_fin"
                                        value={periodeForm.values.date_fin}
                                        onChange={periodeForm.handleChange}
                                        onBlur={periodeForm.handleBlur}
                                        required
                                    />
                                    <FormHelperText>
                                        {periodeForm.errors.date_fin && periodeForm.touched.date_fin && periodeForm.errors.date_fin}
                                    </FormHelperText>
                                </FormControl>
                            </Stack>
                        </Stack>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            autoFocus
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
                                },
                            }} onClick={handleCloseDialogCreatePeriode}
                        >
                            Annuler
                        </Button>
                        <Button
                            autoFocus
                            disabled={!periodeForm.isValid}
                            type='button'
                            onClick={periodeForm.handleSubmit}
                            sx={{
                                ...buttonStyle,
                                backgroundColor: '#e79754ff',
                                color: 'white',
                                borderColor: '#e79754ff',
                                boxShadow: 'none',

                                '&:hover': {
                                    backgroundColor: '#e79754ff',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '&:focus': {
                                    backgroundColor: '#e79754ff',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: '#e79754ff',
                                    color: 'white',
                                    cursor: 'not-allowed',
                                },
                                '&::before': {
                                    display: 'none',
                                },
                            }}>
                            Créer
                        </Button>
                    </DialogActions>
                </BootstrapDialog>
            </form>
            {openConfirmDeletePeriode ? <PopupConfirmDelete msg="Voulez-vous vraiment supprimer cette période ?" confirmationState={confirmDeletePeriode} /> : null}

        </Box>
    );
}
