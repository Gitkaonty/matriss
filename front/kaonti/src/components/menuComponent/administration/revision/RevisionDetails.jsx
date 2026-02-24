import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    TextField,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { ArrowBack, ArrowForward, CalendarToday, AccountBalance, Description, PlayArrow, FilterList, PictureAsPdf, TableChart } from '@mui/icons-material';
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PopupActionConfirm from "../../../componentsTools/popupActionConfirm";

export default function RevisionDetails({ type, controles, onClose, onSaveComment, idCompte, idDossier, idExercice, dateDebut, dateFin, onValidationChange }) {
    const axiosPrivate = useAxiosPrivate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const isValidatingRef = useRef(false);
    const [comment, setComment] = useState('');
    const [originalComment, setOriginalComment] = useState('');
    const [ecritures, setEcritures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);

    const [anomalies, setAnomalies] = useState([]);
    const [anomaliesLoading, setAnomaliesLoading] = useState(false);

    // Popup de confirmation pour validation
    const [confirmPopup, setConfirmPopup] = useState({ open: false, anomalie: null, action: null });
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Dialog pour commentaire
    const [commentDialog, setCommentDialog] = useState({ open: false, anomalie: null });
    const [commentInput, setCommentInput] = useState('');

    // Filtres
    const [filterCompte, setFilterCompte] = useState('');
    const [filterIdControle, setFilterIdControle] = useState('');

    // Pagination pour les anomalies
    const [anomaliesPage, setAnomaliesPage] = useState(0);
    const ANOMALIES_PER_PAGE = 5;

    // Pagination spécifique ATYPIQUE (par compte)
    const [atypiqueCompteIndex, setAtypiqueCompteIndex] = useState(0);

    const items = useMemo(() => controles || [], [controles]);
    const total = items.length;
    
    // S'assurer que currentIndex est toujours valide
    const safeCurrentIndex = Math.min(Math.max(0, currentIndex), Math.max(0, total - 1));
    const currentItem = items[safeCurrentIndex] || null;

    // Réinitialiser la pagination quand les anomalies ou le contrôle changent
    useEffect(() => {
        setAnomaliesPage(0);
    }, [anomalies.length, currentItem?.id_controle]);

    // Réinitialiser l'index de compte ATYPIQUE quand les anomalies ou le contrôle changent
    useEffect(() => {
        setAtypiqueCompteIndex(0);
    }, [anomalies.length, currentItem?.id_controle]);

    const atypiqueGroupedByCompte = useMemo(() => {
        const groupedByCompte = {};
        anomalies.forEach((anomalie) => {
            const compte = anomalie.journalLines?.[0]?.comptegen || anomalie.compteNum || 'N/A';
            if (!groupedByCompte[compte]) {
                groupedByCompte[compte] = {
                    anomalies: []
                };
            }
            groupedByCompte[compte].anomalies.push(anomalie);
        });
        return groupedByCompte;
    }, [anomalies]);

    const atypiqueComptesList = useMemo(() => {
        return Object.keys(atypiqueGroupedByCompte).sort();
    }, [atypiqueGroupedByCompte]);

    const atypiqueSafeCompteIndex = useMemo(() => {
        if (atypiqueComptesList.length === 0) return 0;
        return Math.min(Math.max(0, atypiqueCompteIndex), atypiqueComptesList.length - 1);
    }, [atypiqueComptesList.length, atypiqueCompteIndex]);

    const atypiqueCurrentCompte = useMemo(() => {
        if (atypiqueComptesList.length === 0) return null;
        return atypiqueComptesList[atypiqueSafeCompteIndex];
    }, [atypiqueComptesList, atypiqueSafeCompteIndex]);

    const atypiqueCurrentData = useMemo(() => {
        if (!atypiqueCurrentCompte) return null;
        return atypiqueGroupedByCompte[atypiqueCurrentCompte] || null;
    }, [atypiqueGroupedByCompte, atypiqueCurrentCompte]);

    // Calculer les anomalies paginées
    const paginatedAnomalies = useMemo(() => {
        const start = anomaliesPage * ANOMALIES_PER_PAGE;
        const end = start + ANOMALIES_PER_PAGE;
        return anomalies.slice(start, end);
    }, [anomalies, anomaliesPage]);

    // Calculer le nombre total de pages
    const totalAnomaliesPages = useMemo(() => {
        return Math.ceil(anomalies.length / ANOMALIES_PER_PAGE);
    }, [anomalies.length]);

    // Fonctions de navigation pagination
    const handlePrevAnomaliesPage = () => {
        setAnomaliesPage(prev => Math.max(0, prev - 1));
    };

    const handleNextAnomaliesPage = () => {
        setAnomaliesPage(prev => Math.min(totalAnomaliesPages - 1, prev + 1));
    };

    // Réinitialiser l'index quand les contrôles changent significativement (changement de type ou nombre)
    useEffect(() => {
        // Ne pas reset si on est en train de valider une anomalie
        if (isValidatingRef.current) {
            console.log('DEBUG - Validation en cours, pas de reset de currentIndex');
            return;
        }

        console.log('DEBUG useEffect controles - items.length:', items.length);
        console.log('DEBUG useEffect controles - currentIndex:', currentIndex);

        // Toujours reset à 0 si les contrôles changent (nouveau type)
        // ou si l'index actuel est hors limites
        if (items.length > 0) {
            if (currentIndex >= items.length) {
                console.log('DEBUG - currentIndex hors limites, reset à 0');
                setCurrentIndex(0);
            } else if (currentIndex === 0) {
                // Déjà à 0, pas besoin de changer
                console.log('DEBUG - currentIndex déjà à 0');
            }
        }
    }, [controles, items.length]);

    // Affichage mode vient directement de l'API (première anomalie ou défaut 'ligne')
    const affichageMode = useMemo(() => {
        if (anomalies.length > 0 && anomalies[0]?.affichage) {
            return anomalies[0].affichage;
        }
        return currentItem?.Affichage || 'ligne';
    }, [anomalies, currentItem]);

    useEffect(() => {
        if (currentItem) {
            setComment(currentItem.Commentaire || '');
            setOriginalComment(currentItem.Commentaire || '');
        }
    }, [currentItem]);

    const updateAnomaly = async (id_anomalie, payload) => {
        if (!id_anomalie) return;
        try {
            const url = `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/anomalies/${encodeURIComponent(id_anomalie)}`;
            const response = await axiosPrivate.patch(url, payload);
            if (response.data?.state && response.data?.anomaly) {
                setAnomalies((prev) => prev.map((a) => {
                    if (String(a.id) === String(id_anomalie)) {
                        // Préserver journalLines si la réponse API ne les inclut pas
                        return {
                            ...response.data.anomaly,
                            journalLines: response.data.anomaly.journalLines || a.journalLines
                        };
                    }
                    return a;
                }));
            }
        } catch (error) {
            console.error('Error updating anomaly:', error);
            if (error.response?.status === 404) {
                alert(error.response.data?.message || 'Anomalie non trouvée. Elle a peut-être été supprimée lors d\'un re-contrôle.');
                // Rafraîchir la liste des anomalies
                fetchAnomalies();
            } else {
                alert('Erreur lors de la mise à jour de l\'anomalie');
            }
        }
    };

    const handleToggleValidateAnomaly = (anomalie) => {
        if (!anomalie) return;
        setConfirmPopup({ open: true, anomalie, action: anomalie.valide ? 'annuler' : 'valider' });
    };

    const handleConfirmValidation = async (confirmed) => {
        if (!confirmed || !confirmPopup.anomalie) {
            setConfirmPopup({ open: false, anomalie: null, action: null });
            return;
        }

        setConfirmLoading(true);
        isValidatingRef.current = true; // Marquer qu'on est en train de valider
        try {
            console.log('DEBUG - Validation avant:', confirmPopup.anomalie);
            await updateAnomaly(confirmPopup.anomalie.id, { valide: !confirmPopup.anomalie.valide });
            console.log('DEBUG - Validation après updateAnomaly');
            // Rafraîchir la liste des contrôles dans le parent
            if (onValidationChange) {
                console.log('DEBUG - Appel onValidationChange');
                await onValidationChange(); // Attendre que le parent finisse
            }
        } finally {
            setConfirmLoading(false);
            setConfirmPopup({ open: false, anomalie: null, action: null });
            isValidatingRef.current = false; // Reset le flag
        }
    };

    const handleCommentAnomaly = (anomalie) => {
        if (!anomalie) return;
        setCommentInput(anomalie.commentaire || '');
        setCommentDialog({ open: true, anomalie });
    };

    const handleSaveCommentDialog = async () => {
        if (!commentDialog.anomalie) return;
        await updateAnomaly(commentDialog.anomalie.id, { commentaire: commentInput });
        setCommentDialog({ open: false, anomalie: null });
        setCommentInput('');
    };

    const handleCloseCommentDialog = () => {
        setCommentDialog({ open: false, anomalie: null });
        setCommentInput('');
    };

    const getAnomalyForLine = (line) => {
        if (!line) return null;
        if (currentItem?.Type === 'SENS_SOLDE' || currentItem?.Type === 'SENS_ECRITURE') {
            return anomalies.find(a => String(a.id_jnl) === String(line.comptegen)) || null;
        }
        if (affichageMode === 'ecriture') {
            return anomalies.find(a => String(a.id_jnl) === String(line.id_ecriture)) || null;
        }
        return anomalies.find(a => String(a.id_jnl) === String(line.id)) || null;
    };

    // Fonctions d'export
    const handleExportPdf = async () => {
        if (!currentItem?.id_controle) return;
        try {
            let url = `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/export/pdf/${encodeURIComponent(currentItem.id_controle)}`;

            // Ajouter les dates de période si fournies
            if (dateDebut && dateFin) {
                const params = new URLSearchParams();
                params.append('date_debut', dateDebut);
                params.append('date_fin', dateFin);
                url += `?${params.toString()}`;
            }

            const response = await axiosPrivate.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Revision_${currentItem.id_controle}_${idDossier}_${idExercice}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting PDF:', error);
        }
    };

    const handleExportExcel = async () => {
        if (!currentItem?.id_controle) return;
        try {
            let url = `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/export/excel/${encodeURIComponent(currentItem.id_controle)}`;

            // Ajouter les dates de période si fournies
            if (dateDebut && dateFin) {
                const params = new URLSearchParams();
                params.append('date_debut', dateDebut);
                params.append('date_fin', dateFin);
                url += `?${params.toString()}`;
            }

            const response = await axiosPrivate.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Revision_${currentItem.id_controle}_${idDossier}_${idExercice}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting Excel:', error);
        }
    };

    // Charger les anomalies depuis table_controle_anomalies
    useEffect(() => {
        console.log('DEBUG useEffect - currentItem:', currentItem);
        console.log('DEBUG useEffect - id_controle:', currentItem?.id_controle);
        if (currentItem?.id_controle && idCompte && idDossier && idExercice) {
            fetchAnomalies();
        }
    }, [currentItem?.id_controle, idCompte, idDossier, idExercice, dateDebut, dateFin, type]);

    const fetchAnomalies = async () => {
        if (!currentItem?.id_controle) return;
        setAnomaliesLoading(true);
        try {
            let url = `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/anomalies/controle/${encodeURIComponent(currentItem.id_controle)}`;

            // Ajouter les dates de période si fournies
            if (dateDebut && dateFin) {
                const params = new URLSearchParams();
                params.append('date_debut', dateDebut);
                params.append('date_fin', dateFin);
                url += `?${params.toString()}`;
            }

            console.log('DEBUG fetchAnomalies - URL:', url);
            console.log('DEBUG fetchAnomalies - currentItem.Type:', currentItem?.Type);

            const response = await axiosPrivate.get(url);
            console.log('DEBUG fetchAnomalies - response:', response.data);

            if (response.data.state) {
                console.log('DEBUG fetchAnomalies - anomalies count:', response.data.anomalies?.length);
                console.log('DEBUG fetchAnomalies - anomalies:', response.data.anomalies);
                setAnomalies(response.data.anomalies);
            } else {
                console.log('DEBUG fetchAnomalies - no state in response');
            }
        } catch (error) {
            console.error('Error fetching anomalies:', error);
        } finally {
            setAnomaliesLoading(false);
        }
    };
    useEffect(() => {
        if (type && idCompte && idDossier && idExercice && !executed) {
            fetchEcritures();
        }
    }, [type, idCompte, idDossier, idExercice]);

    const fetchEcritures = async () => {
        try {
            const response = await axiosPrivate.get(
                `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/type/${encodeURIComponent(type)}`
            );
            if (response.data.state && response.data.controles) {
                // Vérifier si des écritures sont déjà liées
                const hasEcritures = response.data.controles.some(c => parseInt(c.anomalies) > 0);
                if (hasEcritures) {
                    // Récupérer les écritures liées
                    const ecrituresResponse = await axiosPrivate.get(
                        `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/journal/ecritures`,
                        { params: { prefixes: extractPrefixes(response.data.controles) } }
                    );
                    if (ecrituresResponse.data.state) {
                        setEcritures(ecrituresResponse.data.ecritures);
                        setExecuted(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching ecritures:', error);
        }
    };

    const extractPrefixes = (controlesList) => {
        const prefixes = controlesList
            .filter(c => c.compte && c.compte.length >= 2)
            .map(c => c.compte.substring(0, 2));
        return [...new Set(prefixes)];
    };

    const handleExecuteControle = async () => {
        if (!idCompte || !idDossier || !idExercice || !type) {
            alert('Paramètres manquants pour exécuter le contrôle');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosPrivate.post(
                `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/execute/${encodeURIComponent(type)}`
            );

            if (response.data.state) {
                setEcritures(response.data.ecritures);
                setExecuted(true);
                alert(`Contrôle exécuté avec succès! ${response.data.ecrituresLiees} écritures liées.`);
            } else {
                alert(response.data.message || 'Erreur lors de l\'exécution du contrôle');
            }
        } catch (error) {
            console.error('Error executing controle:', error);
            alert('Erreur lors de l\'exécution du contrôle');
        } finally {
            setLoading(false);
        }
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    };

    const handleSaveComment = () => {
        if (onSaveComment && currentItem) {
            onSaveComment(currentItem.id, comment);
            setOriginalComment(comment);
        }
    };

    const handleCancelComment = () => {
        setComment(originalComment);
    };

    const hasCommentChanged = comment !== originalComment;

    // Extraire les options uniques pour les filtres
    const compteOptions = useMemo(() => {
        if (!ecritures || ecritures.length === 0) return [];
        const comptes = [...new Set(ecritures.map(e => e.comptegen || e.compteaux).filter(Boolean))];
        return comptes.sort();
    }, [ecritures]);

    const idControleOptions = useMemo(() => {
        if (!ecritures || ecritures.length === 0) return [];
        const ids = [...new Set(ecritures.map(e => e.id_revision_controle).filter(Boolean))];
        return ids.sort((a, b) => a - b);
    }, [ecritures]);

    // Déterminer le mode d'affichage (ligne ou ecriture)
    // NOTE: maintenant géré plus haut avec les anomalies de l'API

    // Normaliser les lignes de journal depuis l'API anomalies
    const anomaliesJournalLines = useMemo(() => {
        const lines = [];
        anomalies.forEach(a => {
            if (Array.isArray(a.journalLines) && a.journalLines.length > 0) {
                lines.push(...a.journalLines);
            }
        });
        return lines;
    }, [anomalies]);

    // Grouper par anomalie (chaque anomalie avec ses journalLines)
    const anomaliesWithLines = useMemo(() => {
        const result = anomalies.filter(a => Array.isArray(a.journalLines) && a.journalLines.length > 0);
        console.log('DEBUG anomaliesWithLines:', result.length, 'anomalies avec lignes sur', anomalies.length, 'total');
        console.log('DEBUG anomalies:', anomalies.map(a => ({ id: a.id, valide: a.valide, linesCount: a.journalLines?.length })));
        return result;
    }, [anomalies]);

    // Grouper les lignes de journal par compte pour affichage 'ligne'
    const anomaliesByCompte = useMemo(() => {
        const grouped = {};
        anomaliesJournalLines.forEach(l => {
            const compte = l?.comptegen || l?.compteaux || 'N/A';
            if (!grouped[compte]) {
                grouped[compte] = [];
            }
            grouped[compte].push(l);
        });
        return grouped;
    }, [anomaliesJournalLines]);

    const tableData = useMemo(() => {
        // Si on a des écritures du journal, les utiliser
        let data = [];
        if (ecritures && ecritures.length > 0) {
            data = ecritures.map(e => ({
                id: e.id,
                date: e.dateecriture ? new Date(e.dateecriture).toLocaleDateString('fr-FR') : '-',
                journal: e.id_journal || '-',
                piece: e.piece || '-',
                libelle: e.libelle || '-',
                compte: e.comptegen || e.compteaux || '-',
                lettrage: e.lettrage || '-',
                analytique: e.analytique || '-',
                debit: e.debit || 0,
                credit: e.credit || 0,
                id_controle: e.id_revision_controle
            }));
        } else if (currentItem?.details) {
            try {
                const parsed = JSON.parse(currentItem.details);
                if (Array.isArray(parsed)) data = parsed;
            } catch (e) {            
            }
        }

        // Filtrer par le compte du contrôle actuel (ex: compte 63)
        if (currentItem?.compte && data.length > 0) {
            const comptePrefix = currentItem.compte.substring(0, 2);
            data = data.filter(row => row.compte && row.compte.startsWith(comptePrefix));
        }

        // Appliquer les filtres additionnels (sélecteurs)
        return data.filter(row => {
            const matchCompte = !filterCompte || row.compte === filterCompte;
            const matchIdControle = !filterIdControle || row.id_controle === filterIdControle;
            return matchCompte && matchIdControle;
        });
    }, [currentItem, ecritures, filterCompte, filterIdControle]);

    if (!currentItem) {
        return (
            <Paper sx={{ mt: 2, p: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                        Détail de l'Anomalie
                    </Typography>
                    <Button variant="outlined" size="small" onClick={onClose}>
                        Fermer
                    </Button>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                    Aucun détail disponible
                </Alert>
            </Paper>
        );
    }

    return (
        <Paper sx={{ mt: 2, p: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                    Détail
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PictureAsPdf />}
                        onClick={handleExportPdf}
                        sx={{ color: '#d32f2f', borderColor: '#d32f2f' }}
                    >
                        PDF
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<TableChart />}
                        onClick={handleExportExcel}
                        sx={{ color: '#2e7d32', borderColor: '#2e7d32' }}
                    >
                        Excel
                    </Button>
                    <Button variant="outlined" size="small" onClick={onClose}>
                        Fermer
                    </Button>
                </Box>
            </Box>

            {/* TITLE */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333" }}>
                    {currentItem.description} - compte : {currentItem.compte && currentItem.compte !== '0' && currentItem.compte !== 0 ? currentItem.compte : 'n/a'}
                </Typography>
                {/* <Chip 
                    size="small" 
                    label={affichageMode === 'ecriture' ? 'Par écriture' : 'Par ligne'} 
                    color={affichageMode === 'ecriture' ? 'secondary' : 'primary'}
                    variant="outlined"
                /> */}
            </Box>

            {/* MAIN CONTENT */}
            <Grid container spacing={3} alignItems="flex-start">
                {/* LEFT SIDE - INFOS + TABLE */}
                <Grid item xs={12} md={12}>
                    {/* INFO */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2" color="textSecondary">
                                Période:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <AccountBalance fontSize="small" color="action" />
                            <Typography variant="body2" color="textSecondary">
                                Anomalie:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {currentItem.matrix_anomalies || 'N/A'}
                            </Typography>
                        </Box>

                        {/* COMPTEUR D'ANOMALIES */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                               Total des Anomalies:
                            </Typography>
                            <Chip
                                size="small"
                                label={`${anomalies.filter(a => !a.valide).length} / ${anomalies.length}`}
                                color={anomalies.filter(a => !a.valide).length === 0 ? 'success' : 'warning'}
                            />
                        </Box>
                    </Box>

                    {/* TABLE - Affichage selon type: SENS_SOLDE, SENS_ECRITURE, EXISTENCE, ou autre */}
                    {(() => {
                        console.log('DEBUG RENDER - currentItem.Type:', currentItem?.Type);
                        console.log('DEBUG RENDER - anomalies.length:', anomalies.length);
                        console.log('DEBUG RENDER - anomaliesWithLines.length:', anomaliesWithLines.length);
                        return null;
                    })()}
                    {anomaliesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : currentItem?.Type === 'EXISTENCE' ? (
                        // Mode EXISTENCE - Afficher les anomalies avec boutons et pagination
                        anomalies.length > 0 ? (
                            <Box>
                                {/* Info pagination */}
                                {anomalies.length > ANOMALIES_PER_PAGE && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handlePrevAnomaliesPage}
                                            disabled={anomaliesPage === 0}
                                        >
                                            {"<"}
                                        </Button>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            Page {anomaliesPage + 1} / {totalAnomaliesPages} ({anomalies.length} anomalies)
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleNextAnomaliesPage}
                                            disabled={anomaliesPage >= totalAnomaliesPages - 1}
                                        >
                                            {">"}
                                        </Button>
                                    </Box>
                                )}

                                {paginatedAnomalies.map((anomalie, idx) => (
                                    <Box key={idx} sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                {anomalie.message || 'Anomalie d\'existence'}
                                            </Alert>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{ textTransform: 'none' }}
                                                onClick={() => handleToggleValidateAnomaly(anomalie)}
                                            >
                                                {anomalie.valide ? 'Annuler' : 'Valider'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ textTransform: 'none' }}
                                                onClick={() => handleCommentAnomaly(anomalie)}
                                            >
                                                Commenter
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            // Fallback: afficher depuis details si pas d'anomalies dans table_controle_anomalies
                            (() => {
                                let details = [];
                                if (currentItem?.details) {
                                    try {
                                        details = JSON.parse(currentItem.details);
                                    } catch (e) {
                                        // Not JSON
                                    }
                                }
                                const anomalie = details.find(d => d.anomalie || d.message?.includes('Absence'));
                                if (anomalie?.anomalie) {
                                    return <Alert severity="warning">{anomalie.anomalie}</Alert>;
                                } else if (anomalie?.message) {
                                    return <Alert severity="success">{anomalie.message}</Alert>;
                                }
                                return <Alert severity="info">Aucune information</Alert>;
                            })()
                        )) : currentItem?.Type === 'SENS_SOLDE' ? (
                            // Mode SENS_SOLDE avec pagination
                            anomalies.length > 0 ? (
                                <Box>
                                    {/* Info pagination */}
                                    {anomalies.length > ANOMALIES_PER_PAGE && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handlePrevAnomaliesPage}
                                                disabled={anomaliesPage === 0}
                                            >
                                                {"<"}
                                            </Button>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                Page {anomaliesPage + 1} / {totalAnomaliesPages} ({anomalies.length} anomalies)
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handleNextAnomaliesPage}
                                                disabled={anomaliesPage >= totalAnomaliesPages - 1}
                                            >
                                                {">"}
                                            </Button>
                                        </Box>
                                    )}

                                    {paginatedAnomalies.map((anomalie, idx) => {
                                        const compte = anomalie.id_jnl;
                                        const lines = anomalie.journalLines || [];
                                        const testType = currentItem?.test?.toUpperCase();

                                        const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
                                        const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
                                        const solde = totalDebit - totalCredit;
                                        const soldeNormalise = Math.abs(solde) < 0.01 ? 0 : solde;

                                        let detailMessage = anomalie.message || 'Anomalie de sens de solde';
                                        if (testType === 'DEBITEUR' && soldeNormalise < 0) {
                                            detailMessage = `Le compte "${compte}" doit avoir un solde débiteur (solde actuel: ${soldeNormalise.toFixed(2)})`;
                                        } else if (testType === 'CREDITEUR' && soldeNormalise > 0) {
                                            detailMessage = `Le compte "${compte}" doit avoir un solde créditeur (solde actuel: ${soldeNormalise.toFixed(2)})`;
                                        } else if (testType === 'NULL' && soldeNormalise !== 0) {
                                            detailMessage = `Le compte "${compte}" doit avoir un solde nul (solde actuel: ${soldeNormalise.toFixed(2)})`;
                                        }

                                        return (
                                            <Box key={idx} sx={{ mb: 3 }}>
                                                {/* Boutons et message */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                        {detailMessage}
                                                    </Alert>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleToggleValidateAnomaly(anomalie)}
                                                    >
                                                        {anomalie.valide ? 'Annuler' : 'Valider'}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleCommentAnomaly(anomalie)}
                                                    >
                                                        Commenter
                                                    </Button>
                                                </Box>

                                                {lines.length > 0 ? (
                                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                                                        <Table size="small" stickyHeader>
                                                            <TableHead>
                                                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Pièce</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Débit</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Crédit</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Lettrage</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Analytique</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Validé</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Commentaire</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {lines.map((line, lineIdx) => (
                                                                    <TableRow key={lineIdx} hover>
                                                                        <TableCell>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                        <TableCell>{line?.piece || '-'}</TableCell>
                                                                        <TableCell>{line?.libelle || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: "right" }}>
                                                                            {line?.debit ? parseFloat(line.debit).toLocaleString("fr-FR") : "-"}
                                                                        </TableCell>
                                                                        <TableCell sx={{ textAlign: "right" }}>
                                                                            {line?.credit ? parseFloat(line.credit).toLocaleString("fr-FR") : "-"}
                                                                        </TableCell>
                                                                        <TableCell>{line?.lettrage || '-'}</TableCell>
                                                                        <TableCell>{line?.analytique || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: 'center' }}>
                                                                            <Chip
                                                                                label={anomalie?.valide ? 'Oui' : 'Non'}
                                                                                color={anomalie?.valide ? 'success' : 'default'}
                                                                                size="small"
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            {anomalie?.commentaire || '-'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                                <TableRow sx={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}>
                                                                    <TableCell colSpan={5} sx={{ fontWeight: 600 }}>Total</TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                                                                        {totalDebit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                                                                        {totalCredit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                                                                    </TableCell>
                                                                    <TableCell colSpan={2} />
                                                                </TableRow>
                                                                <TableRow sx={{ backgroundColor: "#fff3e0" }}>
                                                                    <TableCell colSpan={5} sx={{ fontWeight: 600 }}>Solde</TableCell>
                                                                    <TableCell colSpan={2} sx={{ textAlign: "center", fontWeight: 600 }}>
                                                                        {soldeNormalise > 0 ? `Débiteur: ${soldeNormalise.toFixed(2)}` : soldeNormalise < 0 ? `Créditeur: ${Math.abs(soldeNormalise).toFixed(2)}` : 'Solde nul'}
                                                                    </TableCell>
                                                                    <TableCell colSpan={2} />
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Aucune ligne de journal pour ce compte
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucun compte avec anomalie de sens de solde</Alert>
                            )
                        ) : currentItem?.Type === 'SENS_ECRITURE' ? (
                            // Mode SENS_ECRITURE avec pagination
                            anomalies.length > 0 ? (
                                <Box>
                                    {/* Info pagination */}
                                    {anomalies.length > ANOMALIES_PER_PAGE && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handlePrevAnomaliesPage}
                                                disabled={anomaliesPage === 0}
                                            >
                                                {"<"}
                                            </Button>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                Page {anomaliesPage + 1} / {totalAnomaliesPages} ({anomalies.length} anomalies)
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handleNextAnomaliesPage}
                                                disabled={anomaliesPage >= totalAnomaliesPages - 1}
                                            >
                                                {">"}
                                            </Button>
                                        </Box>
                                    )}

                                    {paginatedAnomalies.map((anomalie, idx) => {
                                        const compte = anomalie.id_jnl;
                                        const lines = anomalie.journalLines || [];
                                        const testType = currentItem?.test?.toUpperCase();

                                        const filteredLines = lines.filter(line => {
                                            const debit = parseFloat(line.debit) || 0;
                                            const credit = parseFloat(line.credit) || 0;
                                            if (testType === 'CREDIT') {
                                                return credit > 0;
                                            } else if (testType === 'DEBIT') {
                                                return debit > 0;
                                            }
                                            return true;
                                        });

                                        return (
                                            <Box key={idx} sx={{ mb: 3 }}>
                                                {/* Boutons et message */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                        {anomalie.message || 'Anomalie de sens d\'écriture'}
                                                    </Alert>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleToggleValidateAnomaly(anomalie)}
                                                    >
                                                        {anomalie.valide ? 'Annuler' : 'Valider'}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleCommentAnomaly(anomalie)}
                                                    >
                                                        Commenter
                                                    </Button>
                                                </Box>

                                                {filteredLines.length > 0 ? (
                                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                                                        <Table size="small" stickyHeader>
                                                            <TableHead>
                                                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Pièce</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Débit</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Crédit</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Lettrage</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Analytique</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Validé</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Commentaire</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {filteredLines.map((line, lineIdx) => (
                                                                    <TableRow key={lineIdx} hover>
                                                                        <TableCell>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                        <TableCell>{line?.piece || '-'}</TableCell>
                                                                        <TableCell>{line?.libelle || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: "right" }}>
                                                                            {line?.debit ? parseFloat(line.debit).toLocaleString("fr-FR") : "-"}
                                                                        </TableCell>
                                                                        <TableCell sx={{ textAlign: "right" }}>
                                                                            {line?.credit ? parseFloat(line.credit).toLocaleString("fr-FR") : "-"}
                                                                        </TableCell>
                                                                        <TableCell>{line?.lettrage || '-'}</TableCell>
                                                                        <TableCell>{line?.analytique || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: 'center' }}>
                                                                            <Chip
                                                                                label={anomalie?.valide ? 'Oui' : 'Non'}
                                                                                color={anomalie?.valide ? 'success' : 'default'}
                                                                                size="small"
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            {anomalie?.commentaire || '-'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                                <TableRow sx={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}>
                                                                    <TableCell colSpan={5} sx={{ fontWeight: 600 }}>Total</TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                                                                        {filteredLines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                                                                        {filteredLines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                                                                    </TableCell>
                                                                    <TableCell colSpan={2} />
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Aucune ligne de journal pour ce compte
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucun compte avec anomalie de sens d\'écriture</Alert>
                            )
                        ) : currentItem?.Type === 'UTIL_CPT_TVA' ? (
                            // Mode UTIL_CPT_TVA - Affichage par écriture complète avec pagination
                            anomalies.length > 0 ? (
                                <Box>
                                    {/* Info pagination */}
                                    {anomalies.length > ANOMALIES_PER_PAGE && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handlePrevAnomaliesPage}
                                                disabled={anomaliesPage === 0}
                                            >
                                                {"<"}
                                            </Button>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                Page {anomaliesPage + 1} / {totalAnomaliesPages} ({anomalies.length} anomalies)
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handleNextAnomaliesPage}
                                                disabled={anomaliesPage >= totalAnomaliesPages - 1}
                                            >
                                                {">"}
                                            </Button>
                                        </Box>
                                    )}

                                    {paginatedAnomalies.map((anomalie, idx) => {
                                        const lines = anomalie.journalLines || [];
                                        return (
                                            <Box key={idx} sx={{ mb: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Alert severity="warning" sx={{ flex: 1 }}>
                                                        <strong>Écriture {anomalie.id_jnl}</strong> - {anomalie.message}
                                                    </Alert>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleToggleValidateAnomaly(anomalie)}
                                                    >
                                                        {anomalie.valide ? 'Annuler' : 'Valider'}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleCommentAnomaly(anomalie)}
                                                    >
                                                        Commenter
                                                    </Button>
                                                </Box>

                                                {lines.length > 0 ? (
                                                    <TableContainer component={Paper} variant="outlined">
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Pièce</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Débit</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Crédit</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Validé</TableCell>
                                                                    <TableCell sx={{ fontWeight: 600 }}>Commentaire</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {lines.map((line, lineIdx) => (
                                                                    <TableRow key={lineIdx} hover>
                                                                        <TableCell>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                        <TableCell>
                                                                            <Box sx={{
                                                                                fontWeight: (line?.comptegen?.startsWith('2') || line?.compteaux?.startsWith('2')) ? 700 : 400,
                                                                                color: (line?.comptegen?.startsWith('2') || line?.compteaux?.startsWith('2')) ? 'primary.main' : 'inherit'
                                                                            }}>
                                                                                {line?.comptegen || line?.compteaux || '-'}
                                                                                {((line?.comptegen?.startsWith('4456') || line?.compteaux?.startsWith('4456')) && (
                                                                                    <Chip label="TVA" size="small" color="info" sx={{ ml: 1, fontSize: '0.7rem' }} />
                                                                                ))}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>{line?.piece || '-'}</TableCell>
                                                                        <TableCell>{line?.libelle || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: "right" }}>{line?.debit ? parseFloat(line.debit).toLocaleString("fr-FR") : "-"}</TableCell>
                                                                        <TableCell sx={{ textAlign: "right" }}>{line?.credit ? parseFloat(line.credit).toLocaleString("fr-FR") : "-"}</TableCell>
                                                                        <TableCell sx={{ textAlign: "center" }}>
                                                                            {lineIdx === 0 && (
                                                                                <Chip
                                                                                    label={anomalie.valide ? "Oui" : "Non"}
                                                                                    color={anomalie.valide ? "success" : "error"}
                                                                                    size="small"
                                                                                />
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>{lineIdx === 0 ? (anomalie.commentaire || '-') : ''}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Aucune ligne pour cette écriture
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucune anomalie de TVA détectée</Alert>
                            )
                        ) : currentItem?.Type === 'ATYPIQUE' ? (
                            // Mode ATYPIQUE - Affichage paginé par compte
                            anomalies.length > 0 ? (
                                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                    {!atypiqueCurrentData ? null : (
                                        <Box>
                                            {/* Navigation entre comptes */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={atypiqueSafeCompteIndex === 0}
                                                    onClick={() => setAtypiqueCompteIndex((prev) => Math.max(0, prev - 1))}
                                                >
                                                    ← Compte précédent
                                                </Button>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                    Compte {atypiqueCurrentCompte} ({atypiqueSafeCompteIndex + 1} / {atypiqueComptesList.length})
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={atypiqueSafeCompteIndex === atypiqueComptesList.length - 1}
                                                    onClick={() => setAtypiqueCompteIndex((prev) => Math.min(atypiqueComptesList.length - 1, prev + 1))}
                                                >
                                                    Compte suivant →
                                                </Button>
                                            </Box>

                                            {/* Anomalies du compte: une anomalie = un bloc + son propre tableau */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {atypiqueCurrentData.anomalies.map((anomalie, idx) => (
                                                    <Box key={anomalie.id || idx} sx={{ p: 0 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                            <Alert severity="warning" sx={{ flex: 1, fontSize: '0.85rem', py: 0.5 }}>
                                                                {anomalie.message}
                                                            </Alert>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => handleToggleValidateAnomaly(anomalie)}
                                                            >
                                                                {anomalie.valide ? 'Annuler' : 'Valider'}
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => handleCommentAnomaly(anomalie)}
                                                            >
                                                                Commenter
                                                            </Button>
                                                        </Box>

                                                        {anomalie.journalLines?.length > 0 ? (
                                                            <TableContainer component={Paper}>
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                                            <TableCell sx={{ fontWeight: 600 }}>Pièce</TableCell>
                                                                            <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                                                                            <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Débit</TableCell>
                                                                            <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Crédit</TableCell>
                                                                            <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Validé</TableCell>
                                                                            <TableCell sx={{ fontWeight: 600 }}>Commentaire</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {anomalie.journalLines.map((line, lineIdx) => (
                                                                            <TableRow key={line?.id || lineIdx} hover>
                                                                                <TableCell>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                                <TableCell>{line?.piece || '-'}</TableCell>
                                                                                <TableCell>{line?.libelle || '-'}</TableCell>
                                                                                <TableCell sx={{ textAlign: "right" }}>{line?.debit ? parseFloat(line.debit).toLocaleString("fr-FR") : "-"}</TableCell>
                                                                                <TableCell sx={{ textAlign: "right" }}>{line?.credit ? parseFloat(line.credit).toLocaleString("fr-FR") : "-"}</TableCell>
                                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                                    <Chip
                                                                                        label={anomalie.valide ? "Oui" : "Non"}
                                                                                        color={anomalie.valide ? "success" : "error"}
                                                                                        size="small"
                                                                                        sx={{ fontWeight: 600 }}
                                                                                    />
                                                                                </TableCell>
                                                                                <TableCell>{anomalie.commentaire || '-'}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        ) : null}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucun montant atypique détecté</Alert>
                            )
                        ) : anomalies.length > 0 ? (
                            // Mode par défaut (autres types)
                            <Box sx={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {anomalies.map((anomalie) => (
                                    <Box key={anomalie.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                {anomalie.message || 'Anomalie'}
                                            </Alert>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleToggleValidateAnomaly(anomalie)}
                                            >
                                                {anomalie.valide ? 'Annuler' : 'Valider'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleCommentAnomaly(anomalie)}
                                            >
                                                Commenter
                                            </Button>
                                        </Box>

                                        {anomalie.journalLines?.length > 0 ? (
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Pièce</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Débit</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Crédit</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Lettrage</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Analytique</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Valider</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Commentaire</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {anomalie.journalLines.map((line, idx) => (
                                                            <TableRow key={idx} hover>
                                                                <TableCell>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                <TableCell>{line?.comptegen || line?.compteaux || '-'}</TableCell>
                                                                <TableCell>{line?.piece || '-'}</TableCell>
                                                                <TableCell>{line?.libelle || '-'}</TableCell>
                                                                <TableCell sx={{ textAlign: "right" }}>{line?.debit ? parseFloat(line.debit).toLocaleString("fr-FR") : "-"}</TableCell>
                                                                <TableCell sx={{ textAlign: "right" }}>{line?.credit ? parseFloat(line.credit).toLocaleString("fr-FR") : "-"}</TableCell>
                                                                <TableCell>{line?.lettrage || '-'}</TableCell>
                                                                <TableCell>{line?.analytique || '-'}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    <Chip
                                                                        label={anomalie.valide ? "Oui" : "Non"}
                                                                        color={anomalie.valide ? "success" : "error"}
                                                                        size="small"
                                                                        sx={{ fontWeight: 600 }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{anomalie.commentaire || '-'}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : null}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                        <Alert severity="success">Aucune anomalie détectée pour ce contrôle</Alert>
                    )}
                </Grid>
            </Grid>

            {/* NAVIGATION BUTTONS */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    mt: 3,
                    pt: 2,
                    borderTop: "1px solid #e0e0e0",
                }}
            >
                <Button variant="outlined" size="small" onClick={handlePrev} disabled={total <= 1}>
                    {"<"}
                </Button>
                <Typography variant="body2" sx={{ mx: 1, color: "#666" }}>
                    {currentIndex + 1} / {total}
                </Typography>
                <Button variant="outlined" size="small" onClick={handleNext} disabled={total <= 1}>
                    {">"}
                </Button>
            </Box>

            {/* POPUP DE CONFIRMATION POUR VALIDATION */}
            {confirmPopup.open && (
                <PopupActionConfirm
                    msg={confirmPopup.action === 'valider'
                        ? `Voulez-vous valider cette anomalie ?`
                        : `Voulez-vous annuler la validation de cette anomalie ?`}
                    confirmationState={handleConfirmValidation}
                    isLoading={confirmLoading}
                />
            )}

            {/* DIALOG POUR COMMENTAIRE */}
            <Dialog
                open={commentDialog.open}
                onClose={handleCloseCommentDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Ajouter un commentaire</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Commentaire"
                        fullWidth
                        multiline
                        rows={4}
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCommentDialog} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={handleSaveCommentDialog} color="primary" variant="contained">
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};
