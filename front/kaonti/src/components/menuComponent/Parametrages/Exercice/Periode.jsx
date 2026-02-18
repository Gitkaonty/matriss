import { React, useEffect, useMemo, useState } from 'react';
import { Typography, Stack, Button, ButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, FormControl, FormLabel, Input, FormHelperText, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter, { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function Periode({ selectedExercice, idCompte, idDossier, axiosPrivate, canAdd, canDelete }) {
    const [listePeriodes, setListePeriodes] = useState([]);
    const [openDialogCreatePeriode, setOpenDialogCreatePeriode] = useState(false);
    const [selectedPeriodeRow, setSelectedPeriodeRow] = useState([]);

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

    const deletePeriode = async () => {
        if (!selectedExercice?.id) {
            toast.error("Veuillez sélectionner un exercice avant de continuer.");
            return;
        }
        if (selectedPeriodeRow.length !== 1) {
            toast.error('Veuillez sélectionner une seule période avant de continuer.');
            return;
        }

        try {
            const response = await axiosPrivate.post(`/paramExercice/deletePeriode`, {
                id_periode: selectedPeriodeRow[0]
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
    ]), []);

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Stack width={'100%'} spacing={2} alignItems={'flex-start'}>
                <Typography variant='h7' sx={{ color: 'black' }} align='left'>Paramétrages : Périodes</Typography>

                <Stack width={'100%'} height={'30px'} spacing={0} alignItems={'center'} alignContent={'center'} direction={'row'} style={{ justifyContent: 'right' }}>
                    <ButtonGroup
                        variant="outlined"
                        sx={{
                            boxShadow: 'none',
                            display: 'flex',
                            gap: '2px',
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
                        <Button
                            disabled={!canAdd || !selectedExercice?.id}
                            onClick={() => setOpenDialogCreatePeriode(true)}
                            sx={{
                                minWidth: 120,
                                height: 32,
                                px: 2,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none',
                                backgroundColor: '#e79754ff',
                                color: 'white',
                                borderColor: '#e79754ff',
                                '&:hover': {
                                    backgroundColor: '#e79754ff',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: '#e79754ff',
                                    color: 'white',
                                    cursor: 'not-allowed',
                                },
                            }}
                        >
                            Ajouter
                        </Button>

                        <Button
                            disabled={!canDelete || !selectedExercice?.id || selectedPeriodeRow.length === 0}
                            onClick={deletePeriode}
                            sx={{
                                minWidth: 120,
                                height: 32,
                                px: 2,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none',
                                backgroundColor: '#cf4b4bff',
                                color: 'white',
                                borderColor: '#cf4b4bff',
                                '&:hover': {
                                    backgroundColor: '#cf4b4bff',
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: '#cf4b4bff',
                                    color: 'white',
                                    cursor: 'not-allowed',
                                },
                            }}
                        >
                            Supprimer
                        </Button>
                    </ButtonGroup>
                </Stack>

                <Stack width={'100%'} minHeight={'300px'}>
                    <DataGrid
                        disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                        disableColumnSelector={DataGridStyle.disableColumnSelector}
                        disableDensitySelector={DataGridStyle.disableDensitySelector}
                        disableRowSelectionOnClick
                        disableSelectionOnClick={true}
                        localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                        slots={{ toolbar: QuickFilter }}
                        sx={{
                            ...DataGridStyle.sx,
                            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                outline: 'none',
                                border: 'none',
                            },
                            '& .MuiDataGrid-virtualScroller': {
                                maxHeight: '350px',
                            },
                        }}
                        rowHeight={DataGridStyle.rowHeight}
                        columnHeaderHeight={DataGridStyle.columnHeaderHeight}
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
                        experimentalFeatures={{ newEditingApi: true }}
                        pageSizeOptions={[50, 100]}
                        pagination={DataGridStyle.pagination}
                        checkboxSelection={DataGridStyle.checkboxSelection}
                        columnVisibilityModel={{
                            id: false,
                        }}
                        rowSelectionModel={selectedPeriodeRow}
                    />
                </Stack>

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
{/* 
                                <FormControl sx={{ width: '450px' }} error={periodeForm.errors.libelle && periodeForm.touched.libelle}>
                                    <FormLabel id="libelle-label" htmlFor="libelle">
                                        <Typography level="title-libelle">Libellé :</Typography>
                                    </FormLabel>
                                    <Input
                                        type='text'
                                        name="libelle"
                                        value={periodeForm.values.libelle}
                                        onChange={periodeForm.handleChange}
                                        onBlur={periodeForm.handleBlur}
                                        required
                                    />
                                    <FormHelperText>
                                        {periodeForm.errors.libelle && periodeForm.touched.libelle && periodeForm.errors.libelle}
                                    </FormHelperText>
                                </FormControl> */}

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
                                style={{ backgroundColor: '#e79754ff', color: 'white', width: '100px', textTransform: 'none', outline: 'none' }}
                                onClick={handleCloseDialogCreatePeriode}
                            >
                                Annuler
                            </Button>
                            <Button
                                autoFocus
                                disabled={!periodeForm.isValid}
                                type='button'
                                onClick={periodeForm.handleSubmit}
                                style={{ backgroundColor: '#e79754ff', color: 'white', width: '100px', textTransform: 'none', outline: 'none' }}
                            >
                                Créer
                            </Button>
                        </DialogActions>
                    </BootstrapDialog>
                </form>
            </Stack>
        </Box>
    );
}
