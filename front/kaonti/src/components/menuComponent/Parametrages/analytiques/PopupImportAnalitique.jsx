import { React, useState } from 'react';
import { Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Badge, Box, CircularProgress } from '@mui/material';
import { init } from '../../../../../init';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import PopupInformation from '../../../componentsTools/popupInformation';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DownloadIcon from '@mui/icons-material/Download';
import useAxiosPrivate from '../../../../../config/axiosPrivate';

export default function PopupImportAnalitique({ open, onClose, fileId, compteId, axeId, onImportSuccess }) {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();
    const [nbrAnomalie, setNbrAnomalie] = useState(0);
    const [openDetailsAnomalie, setOpenDetailsAnomalie] = useState(false);
    const [couleurBoutonAnomalie, setCouleurBoutonAnomalie] = useState('white');
    const [sectionsData, setSectionsData] = useState([]);
    const [msgAnomalie, setMsgAnomalie] = useState([]);
    const [traitementWaiting, setTraitementWaiting] = useState(false);
    const [traitementMsg, setTraitementMsg] = useState('');

    const columns = [
        {
            field: 'section',
            headerName: 'Section',
            type: 'string',
            sortable: true,
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'intitule',
            headerName: 'Intitulé',
            type: 'string',
            sortable: true,
            flex: 2,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'compte',
            headerName: 'Compte',
            type: 'string',
            sortable: true,
            flex: 1.5,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'pourcentage',
            headerName: 'Pourcentage',
            type: 'string',
            sortable: true,
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            renderCell: (params) => {
                const value = params.value || 0;
                const formatted = Number(value).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                return `${formatted.replace(/\u202f/g, ' ')}%`;
            },
        },
    ];

    const validateHeaders = (headers) => {
        const expectedHeaders = ["section", "intitule", "compte"];

        const normalize = (s) => (s || "")
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const actual = new Set(headers.map(normalize));
        const missing = expectedHeaders.filter(h => !actual.has(normalize(h)));
        if (missing.length > 0) {
            toast.error(`Les en-têtes suivants sont manquants : ${missing.join(', ')}`);
            return false;
        }
        return true;
    }

    const validationData = (data) => {
        const couleurAnom = "#EB5B00";
        let nbrAnom = 0;
        let msg = [];

        const missingSection = data.filter(item => !item.section || item.section.trim() === '');
        if (missingSection.length > 0) {
            msg.push(`Certaines lignes ne contiennent pas de section.`);
            nbrAnom = nbrAnom + 1;
        }

        const missingIntitule = data.filter(item => {
            const intitule = item.intitule;
            return !intitule || (typeof intitule === 'string' && intitule.trim() === '');
        });
        if (missingIntitule.length > 0) {
            msg.push(`Certaines lignes ne contiennent pas d'intitulé.`);
            nbrAnom = nbrAnom + 1;
        }

        const missingCompte = data.filter(item => !item.compte || item.compte.trim() === '');
        if (missingCompte.length > 0) {
            msg.push(`Certaines lignes ne contiennent pas de compte.`);
            nbrAnom = nbrAnom + 1;
        }

        setNbrAnomalie(nbrAnom);
        setCouleurBoutonAnomalie(nbrAnom > 0 ? couleurAnom : 'white');
        setMsgAnomalie(msg);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];

        if (file) {
            Papa.parse(file, {
                complete: (result) => {
                    try {
                        setTraitementMsg('Traitement des données en cours...');
                        setTraitementWaiting(true);

                        const headers = result.meta.fields;

                        if (validateHeaders(headers)) {
                            setMsgAnomalie([]);
                            setCouleurBoutonAnomalie('white');
                            setNbrAnomalie(0);

                            const totalLines = result.data.length;
                            const percentagePerLine = totalLines > 0 ? 100 / totalLines : 0;

                            const DataWithId = result.data.map((row, index) => ({
                                id: index,
                                section: row.section || '',
                                intitule: row.intitule || '',
                                compte: row.compte || '',
                                pourcentage: Number(percentagePerLine.toFixed(2))
                            }));

                            validationData(DataWithId);
                            setSectionsData(DataWithId);

                            event.target.value = null;
                            setTraitementWaiting(false);
                        } else {
                            setTraitementWaiting(false);
                        }
                    } catch (error) {
                        console.error('Erreur lors de la lecture du fichier CSV:', error);
                        toast.error('Erreur lors de la lecture du fichier CSV');
                        setTraitementWaiting(false);
                    }
                },
                header: true,
                skipEmptyLines: true,
                encoding: "UTF-8",
                error: () => {
                    toast.error('Erreur lors de la lecture du fichier');
                    setTraitementWaiting(false);
                }
            });
        }
    }

    const handleDownloadModel = () => {
        const csvContent = "section,intitule,compte\n";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'modele_import_analytique.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Modèle téléchargé avec succès');
    }

    const handleOpenAnomalieDetails = () => {
        setOpenDetailsAnomalie(true);
    }

    const handleCloseAnomalieDetails = (value) => {
        setOpenDetailsAnomalie(value);
    }

    const handleImport = () => {
        if (nbrAnomalie > 0) {
            toast.error('Veuillez corriger les anomalies avant d\'importer les données.');
            return;
        }

        setTraitementMsg('Import des sections analytiques en cours...');
        setTraitementWaiting(true);

        const dataToSend = {
            compteId: compteId,
            fileId: fileId,
            axeId: axeId,
            sectionsData: sectionsData
        };

        axiosPrivate.post('/paramCa/importSections', dataToSend)
            .then((response) => {
                const resData = response.data;
                setTraitementWaiting(false);
                if (resData.state) {
                    toast.success(resData.msg);
                    handleClose();
                    if (onImportSuccess) {
                        onImportSuccess();
                    }
                } else {
                    toast.error(resData.msg);
                    if (resData.anomalies && resData.anomalies.length > 0) {
                        setMsgAnomalie(resData.anomalies);
                        setNbrAnomalie(resData.anomalies.length);
                        setCouleurBoutonAnomalie("#EB5B00");
                        handleOpenAnomalieDetails();
                    }
                }
            })
            .catch((error) => {
                setTraitementWaiting(false);
                toast.error("Une erreur est survenue lors de l'import");
                console.error(error);
            });
    }

    const handleClose = () => {
        setSectionsData([]);
        setMsgAnomalie([]);
        setNbrAnomalie(0);
        setCouleurBoutonAnomalie('white');
        setTraitementWaiting(false);
        onClose();
    }

    return (
        <>
            {openDetailsAnomalie && (
                <PopupInformation
                    msg={msgAnomalie}
                    confirmationState={handleCloseAnomalieDetails}
                />
            )}
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant='h6' sx={{ color: "black" }}>
                        Import : sections analytiques
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Box>
                            <Typography variant='body2' sx={{ mb: 2, color: 'gray' }}>
                                Format accepté : CSV avec les colonnes suivantes : section, intitule, compte
                            </Typography>
                            <Typography variant='body2' sx={{ mb: 2, color: 'gray', fontWeight: 'bold' }}>
                                Le pourcentage sera calculé automatiquement : 100% divisé par le nombre de lignes
                            </Typography>
                            
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownloadModel}
                                    style={{
                                        borderColor: initial.theme,
                                        color: initial.theme,
                                        textTransform: 'none'
                                    }}
                                >
                                    Télécharger le modèle
                                </Button>

                                <input
                                    accept=".csv"
                                    style={{ display: 'none' }}
                                    id="import-file-input"
                                    type="file"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="import-file-input">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        style={{
                                            backgroundColor: initial.theme,
                                            textTransform: 'none'
                                        }}
                                    >
                                        Choisir un fichier
                                    </Button>
                                </label>
                            </Stack>

                            {traitementWaiting && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                    <CircularProgress size={20} sx={{ mr: 2 }} />
                                    <Typography variant='body2'>{traitementMsg}</Typography>
                                </Box>
                            )}

                            {nbrAnomalie > 0 && (
                                <Badge
                                    badgeContent={nbrAnomalie}
                                    color="error"
                                    sx={{ mt: 2, ml: 2 }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={handleOpenAnomalieDetails}
                                        style={{
                                            borderColor: couleurBoutonAnomalie,
                                            color: couleurBoutonAnomalie,
                                            textTransform: 'none'
                                        }}
                                    >
                                        Voir les anomalies
                                    </Button>
                                </Badge>
                            )}
                        </Box>

                        {sectionsData.length > 0 && (
                            <Box>
                                <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Aperçu des données ({sectionsData.length} lignes - Pourcentage par ligne: {(100 / sectionsData.length).toFixed(2)}%)
                                </Typography>
                                <Box sx={{ height: 400, width: '100%' }}>
                                    <DataGrid
                                        localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                        slots={{ toolbar: QuickFilter }}
                                        sx={DataGridStyle.sx}
                                        rowHeight={DataGridStyle.rowHeight}
                                        columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                        columns={columns}
                                        rows={sectionsData}
                                        initialState={{
                                            pagination: {
                                                paginationModel: { page: 0, pageSize: 50 },
                                            },
                                        }}
                                        pageSizeOptions={[50, 100]}
                                        pagination
                                        checkboxSelection={false}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        style={{
                            color: initial.button_delete_color,
                            textTransform: 'none'
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveAltIcon />}
                        onClick={handleImport}
                        disabled={sectionsData.length === 0 || nbrAnomalie > 0 || traitementWaiting}
                        style={{
                            backgroundColor: initial.theme,
                            textTransform: 'none'
                        }}
                    >
                        Importer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
