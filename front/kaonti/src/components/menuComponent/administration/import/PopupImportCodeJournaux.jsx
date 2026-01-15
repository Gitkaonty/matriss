import { React, useState } from 'react';
import { Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Badge, Box, CircularProgress } from '@mui/material';
import { init } from '../../../../../init';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { DataGrid, frFR } from '@mui/x-data-grid';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import PopupInformation from '../../../componentsTools/popupInformation';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import useAxiosPrivate from '../../../../../config/axiosPrivate';

export default function PopupImportCodeJournaux({ open, onClose, fileId, compteId, onImportSuccess }) {
    let initial = init[0];
    const axiosPrivate = useAxiosPrivate();
    const [nbrAnomalie, setNbrAnomalie] = useState(0);
    const [openDetailsAnomalie, setOpenDetailsAnomalie] = useState(false);
    const [couleurBoutonAnomalie, setCouleurBoutonAnomalie] = useState('white');
    const [codeJournauxData, setCodeJournauxData] = useState([]);
    const [msgAnomalie, setMsgAnomalie] = useState([]);
    const [traitementWaiting, setTraitementWaiting] = useState(false);
    const [traitementMsg, setTraitementMsg] = useState('');

    const columns = [
        {
            field: 'code',
            headerName: 'Code',
            type: 'string',
            sortable: true,
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            flex: 3,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'type',
            headerName: 'Type',
            type: 'string',
            sortable: true,
            flex: 1.5,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'compteassocie',
            headerName: 'Compte associé',
            type: 'string',
            sortable: true,
            flex: 2,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'nif',
            headerName: 'NIF',
            type: 'string',
            sortable: true,
            flex: 2,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'stat',
            headerName: 'STAT',
            type: 'string',
            sortable: true,
            flex: 2,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'adresse',
            headerName: 'Adresse',
            type: 'string',
            sortable: true,
            flex: 3,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
        },
    ];

    const validateHeaders = (headers) => {
        const expectedHeaders = ["code", "libelle", "type", "compteassocie", "nif", "stat", "adresse"];

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

        const missingCode = data.filter(item => !item.code || item.code.trim() === '');
        if (missingCode.length > 0) {
            msg.push(`Certaines lignes ne contiennent pas de code journal.`);
            nbrAnom = nbrAnom + 1;
        }

        const missingLibelle = data.filter(item => {
            const libelle = item.libelle;
            return !libelle || (typeof libelle === 'string' && libelle.trim() === '');
        });
        if (missingLibelle.length > 0) {
            msg.push(`Certaines lignes ne contiennent pas de libellé.`);
            nbrAnom = nbrAnom + 1;
        }

        const missingType = data.filter(item => !item.type || item.type.trim() === '');
        if (missingType.length > 0) {
            msg.push(`Certaines lignes ne contiennent pas de type.`);
            nbrAnom = nbrAnom + 1;
        }

        const expectedTypeValues = ["ACHAT", "BANQUE", "CAISSE", "OD", "RAN", "VENTE", "A_NOUVEAU"];
        const invalidTypes = data.filter(item => item.type && !expectedTypeValues.includes(item.type.toUpperCase()));
        if (invalidTypes.length > 0) {
            msg.push(`Certains types sont invalides. Types acceptés : ACHAT, BANQUE, CAISSE, OD, RAN, VENTE, A_NOUVEAU`);
            nbrAnom = nbrAnom + 1;
        }

        const banqueOrCaisse = data.filter(item => 
            item.type && (item.type.toUpperCase() === 'BANQUE' || item.type.toUpperCase() === 'CAISSE')
        );
        const missingCompteAssocie = banqueOrCaisse.filter(item => !item.compteassocie || item.compteassocie.trim() === '');
        if (missingCompteAssocie.length > 0) {
            msg.push(`Les codes journaux de type BANQUE ou CAISSE doivent avoir un compte associé.`);
            nbrAnom = nbrAnom + 1;
        }

        setNbrAnomalie(nbrAnom);
        setCouleurBoutonAnomalie(nbrAnom > 0 ? couleurAnom : 'white');
        setMsgAnomalie(msg);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    setTraitementMsg('Traitement des données en cours...');
                    setTraitementWaiting(true);

                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                    
                    if (jsonData.length === 0) {
                        toast.error('Le fichier Excel est vide');
                        setTraitementWaiting(false);
                        return;
                    }

                    // Normalize data: trim header names and create clean objects
                    const normalizedData = jsonData.map(row => {
                        const cleanRow = {};
                        Object.keys(row).forEach(key => {
                            const cleanKey = key.trim().toLowerCase();
                            cleanRow[cleanKey] = row[key];
                        });
                        return cleanRow;
                    });

                    const headers = Object.keys(normalizedData[0]);

                    if (validateHeaders(headers)) {
                        setMsgAnomalie([]);
                        setCouleurBoutonAnomalie('white');
                        setNbrAnomalie(0);

                        const DataWithId = normalizedData.map((row, index) => {
                            const getValue = (value) => {
                                if (value === null || value === undefined) return '';
                                return String(value).trim();
                            };
                            
                            const mappedRow = {
                                id: index,
                                code: getValue(row.code),
                                libelle: getValue(row.libelle),
                                type: getValue(row.type).toUpperCase(),
                                compteassocie: getValue(row.compteassocie),
                                nif: getValue(row.nif),
                                stat: getValue(row.stat),
                                adresse: getValue(row.adresse)
                            };
                            
                            // Debug: log first 3 rows to see what's being read
                            if (index < 3) {
                                console.log(`Row ${index}:`, {
                                    original: row,
                                    mapped: mappedRow
                                });
                            }
                            
                            return mappedRow;
                        });

                        console.log('Headers found:', headers);
                        console.log('Total rows:', DataWithId.length);

                        validationData(DataWithId);
                        setCodeJournauxData(DataWithId);

                        event.target.value = null;
                        setTraitementWaiting(false);
                    } else {
                        setTraitementWaiting(false);
                    }
                } catch (error) {
                    console.error('Erreur lors de la lecture du fichier Excel:', error);
                    toast.error('Erreur lors de la lecture du fichier Excel');
                    setTraitementWaiting(false);
                }
            };

            reader.onerror = () => {
                toast.error('Erreur lors de la lecture du fichier');
                setTraitementWaiting(false);
            };

            reader.readAsArrayBuffer(file);
        }
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

        setTraitementMsg('Import des codes journaux en cours...');
        setTraitementWaiting(true);

        const dataToSend = {
            idCompte: compteId,
            idDossier: fileId,
            codeJournauxData: codeJournauxData
        };

        axiosPrivate.post('/paramCodeJournaux/importCodeJournaux', dataToSend)
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
        setCodeJournauxData([]);
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
                        Import : codes journaux
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Box>
                            {/* <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 'bold' }}>
                                Sélectionner le fichier à importer
                            </Typography>
                            <Typography variant='body2' sx={{ mb: 1, color: 'gray' }}>
                                Format accepté : Excel (.xlsx, .xls) avec les colonnes suivantes : code, libelle, type, compteassocie, nif, stat, adresse
                            </Typography>
                            <Typography variant='body2' sx={{ mb: 2, color: 'gray' }}>
                                Types acceptés : ACHAT, BANQUE, CAISSE, OD, RAN, VENTE, A_NOUVEAU
                            </Typography> */}
                            <input
                                accept=".xlsx,.xls"
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

                        {codeJournauxData.length > 0 && (
                            <Box>
                                <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Aperçu des données ({codeJournauxData.length} lignes)
                                </Typography>
                                <Box sx={{ height: 400, width: '100%' }}>
                                    <DataGrid
                                        localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                        slots={{ toolbar: QuickFilter }}
                                        sx={DataGridStyle.sx}
                                        rowHeight={DataGridStyle.rowHeight}
                                        columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                        columns={columns}
                                        rows={codeJournauxData}
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
                        disabled={codeJournauxData.length === 0 || nbrAnomalie > 0 || traitementWaiting}
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
