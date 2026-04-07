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
    DialogActions,
    IconButton,
    Stack
} from '@mui/material';
import { init } from '../../../../../init';
import { ArrowBack, ArrowForward, CalendarToday, AccountBalance, Description, PlayArrow, FilterList, PictureAsPdf, TableChart, ChevronLeft, ChevronRight } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll'
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PopupActionConfirm from "../../../componentsTools/popupActionConfirm";
import EditNoteIcon from '@mui/icons-material/EditNote';

// Helper pour formater les montants sans espace insécable
const formatMontant = (value, options = {}) => {
    const number = parseFloat(value) || 0;
    const formatted = number.toLocaleString('fr-FR', {
        minimumFractionDigits: options.fractions || 2,
        maximumFractionDigits: options.fractions || 2
    });
    // Remplacer l'espace insécable (U+00A0) par un espace normal
    return formatted.replace(/\u00A0/g, ' ');
};

export default function RevisionDetails({ type, controles, onClose, onSaveComment, idCompte, idDossier, idExercice, idPeriode, dateDebut, dateFin, isPeriodeSelected, onValidationChange }) {
    const initial = init[0];
    const axiosPrivate = useAxiosPrivate();

    const emitAnomaliesUpdated = () => {
        try {
            const payload = {
                id_compte: idCompte,
                id_dossier: idDossier,
                id_exercice: idExercice,
                id_periode: idPeriode,
                timestamp: Date.now()
            };
            console.log('[RevisionDetails] Émission event anomalies:updated', payload);
            
            // 1. Event local (même onglet)
            window.dispatchEvent(new CustomEvent('anomalies:updated', {
                detail: payload
            }));
            
            // 2. localStorage (communication entre onglets)
            localStorage.setItem('anomalies:updated', JSON.stringify(payload));
            
        } catch (e) {
            console.error('[RevisionDetails] Erreur émission event:', e);
        }
    };

    // === STYLES STANDARDISÉS POUR LES TABLEAUX ===
    const tableStyles = {
        headRow: { bgcolor: '#F8FAFC' },
        headCell: { fontWeight: 700, fontSize: '0.85rem', py: 1.5 },
        bodyCell: { fontSize: '0.85rem', py: 1 },
        cellRight: { textAlign: 'right' },
        cellCenter: { textAlign: 'center' },
        montant: { fontWeight: 800 }
    };

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
    const [commentDialog, setCommentDialog] = useState({ open: false, anomalie: null, line: null });
    const [commentInput, setCommentInput] = useState('');

    // Filtres
    const [filterCompte, setFilterCompte] = useState('');
    const [filterIdControle, setFilterIdControle] = useState('');

    // Pagination pour les anomalies
    const [anomaliesPage, setAnomaliesPage] = useState(0);
    const ANOMALIES_PER_PAGE = 5;

    // Pagination spécifique ATYPIQUE (par compte)
    const [atypiqueCompteIndex, setAtypiqueCompteIndex] = useState(0);

    // Pagination spécifique SENS_SOLDE (par compte)
    const [soldeCompteIndex, setSoldeCompteIndex] = useState(0);
    const pendingSoldeIdControleRef = useRef(null);

    // Pagination spécifique SENS_ECRITURE (par compte)
    const [ecritureCompteIndex, setEcritureCompteIndex] = useState(0);
    const pendingEcritureIdControleRef = useRef(null);

    // Pagination spécifique IMMOB (par compte) - indépendante
    const [immobCompteIndex, setImmobCompteIndex] = useState(0);

    // Navigation spécifique UTIL_CPT_TVA (par écriture)
    const [tvaEcritureIndex, setTvaEcritureIndex] = useState(0);

    const items = useMemo(() => controles || [], [controles]);
    const total = items.length;

    // S'assurer que currentIndex est toujours valide
    const safeCurrentIndex = Math.min(Math.max(0, currentIndex), Math.max(0, total - 1));
    const currentItem = items[safeCurrentIndex] || null;

    // Extraction des comptes uniques pour SENS_SOLDE (depuis journalLines)
    const soldeComptesList = useMemo(() => {
        const comptes = new Set();
        anomalies.forEach(a => {
            if (Array.isArray(a.journalLines)) {
                a.journalLines.forEach(l => {
                    const c = l?.comptegen || l?.compteaux;
                    if (c) comptes.add(c);
                });
            }
        });
        const result = Array.from(comptes).sort();
        // console.log('DEBUG SENS_SOLDE - soldeComptesList:', result);
        return result;
    }, [anomalies]);


    // Extraction des comptes uniques pour SENS_ECRITURE (depuis journalLines)
    const ecritureComptesList = useMemo(() => {
        const comptes = new Set();
        anomalies.forEach(a => {
            if (Array.isArray(a.journalLines)) {
                a.journalLines.forEach(l => {
                    const c = l?.comptegen || l?.compteaux;
                    if (c) comptes.add(c);
                });
            }
        });
        return Array.from(comptes).sort();
    }, [anomalies]);

    // Index calculé - clampé aux bornes valides
    const ecritureSafeCompteIndex = useMemo(() => {
        if (ecritureComptesList.length === 0) return 0;
        // Ne pas changer l'index, juste le clamp si hors bornes
        return Math.min(Math.max(0, ecritureCompteIndex), ecritureComptesList.length - 1);
    }, [ecritureComptesList.length, ecritureCompteIndex]);

    const ecritureCurrentCompte = useMemo(() => {
        if (ecritureComptesList.length === 0) return null;
        return ecritureComptesList[ecritureSafeCompteIndex];
    }, [ecritureComptesList, ecritureSafeCompteIndex]);

    // Réinitialiser la pagination quand les anomalies ou le contrôle changent
    useEffect(() => {
        setAnomaliesPage(0);
    }, [anomalies.length, currentItem?.id_controle]);

    // Réinitialiser l'index de compte ATYPIQUE quand les anomalies ou le contrôle changent
    useEffect(() => {
        setAtypiqueCompteIndex(0);
    }, [anomalies.length, currentItem?.id_controle]);

    // Réinitialiser l'index de compte SENS_SOLDE quand le contrôle change
    // mais restaurer vers le compte sauvegardé si on vient d'une action
    useEffect(() => {
        const pendingIdControle = pendingSoldeIdControleRef.current;
        if (pendingIdControle && currentItem?.id_controle !== pendingIdControle) {
            // On est en train de restaurer vers un autre contrôle, chercher son index
            const idx = items.findIndex(item => item.id_controle === pendingIdControle);
            if (idx >= 0 && idx !== safeCurrentIndex) {
                // Trouvé - restaurer vers ce contrôle
                setCurrentIndex(idx);
            }
        }
        pendingSoldeIdControleRef.current = null;
        setSoldeCompteIndex(0);
    }, [currentItem?.id_controle]);

    // Réinitialiser l'index de compte SENS_ECRITURE quand le contrôle change
    // mais restaurer vers le compte sauvegardé si on vient d'une action
    useEffect(() => {
        const pendingIdControle = pendingEcritureIdControleRef.current;
        if (pendingIdControle && currentItem?.id_controle !== pendingIdControle) {
            // On est en train de restaurer vers un autre contrôle, chercher son index
            const idx = items.findIndex(item => item.id_controle === pendingIdControle);
            if (idx >= 0 && idx !== safeCurrentIndex) {
                // Trouvé - restaurer vers ce contrôle
                setCurrentIndex(idx);
            }
        }
        pendingEcritureIdControleRef.current = null;
        setEcritureCompteIndex(0);
    }, [currentItem?.id_controle]);

    // Réinitialiser l'index de compte IMMOB quand les anomalies ou le contrôle changent
    useEffect(() => {
        setImmobCompteIndex(0);
    }, [anomalies.length, currentItem?.id_controle]);

    // Réinitialiser l'index d'écriture TVA quand les anomalies ou le contrôle changent
    useEffect(() => {
        setTvaEcritureIndex(0);
    }, [anomalies.length, currentItem?.id_controle]);

    const atypiqueGroupedByCompte = useMemo(() => {
        const groupedByCompte = {};
        anomalies.forEach((anomalie) => {
            // Pour chaque anomalie, regrouper ses lignes par compte individuel
            if (Array.isArray(anomalie.journalLines)) {
                anomalie.journalLines.forEach((line) => {
                    const compte = line?.comptegen || line?.compteaux || 'N/A';
                    if (!groupedByCompte[compte]) {
                        groupedByCompte[compte] = {
                            anomalies: [],
                            allLines: []
                        };
                    }
                    // Ajouter l'anomalie une seule fois par compte
                    if (!groupedByCompte[compte].anomalies.includes(anomalie)) {
                        groupedByCompte[compte].anomalies.push(anomalie);
                    }
                    // Ajouter cette ligne spécifique au compte
                    groupedByCompte[compte].allLines.push(line);
                });
            } else {
                // Fallback si pas de journalLines
                const compte = anomalie.compteNum || 'N/A';
                if (!groupedByCompte[compte]) {
                    groupedByCompte[compte] = {
                        anomalies: [],
                        allLines: []
                    };
                }
                if (!groupedByCompte[compte].anomalies.includes(anomalie)) {
                    groupedByCompte[compte].anomalies.push(anomalie);
                }
            }
        });
        return groupedByCompte;
    }, [anomalies]);

    const atypiqueComptesList = useMemo(() => {
        const comptes = new Set();
        anomalies.forEach(a => {
            if (Array.isArray(a.journalLines)) {
                a.journalLines.forEach(l => {
                    const c = l?.comptegen || l?.compteaux;
                    if (c) comptes.add(c);
                });
            }
        });
        return Array.from(comptes).sort();
    }, [anomalies]);

    // Index calculé - clampé aux bornes valides
    const soldeSafeCompteIndex = useMemo(() => {
        if (soldeComptesList.length === 0) return 0;
        // Ne pas changer l'index, juste le clamp si hors bornes
        const result = Math.min(Math.max(0, soldeCompteIndex), soldeComptesList.length - 1);
        // console.log('DEBUG SENS_SOLDE - soldeCompteIndex:', soldeCompteIndex, 'list.length:', soldeComptesList.length, 'result:', result);
        return result;
    }, [soldeComptesList.length, soldeCompteIndex]);

    const soldeCurrentCompte = useMemo(() => {
        if (soldeComptesList.length === 0) return null;
        return soldeComptesList[soldeSafeCompteIndex];
    }, [soldeComptesList, soldeSafeCompteIndex]);


    // Extraction des comptes uniques pour IMMOB (tous les comptes des anomalies, y compris ecritureComplete)
    const immobComptesList = useMemo(() => {
        const comptes = new Set();
        anomalies.forEach(a => {
            // Priorité 1: utiliser compteNum (pour SENS_SOLDE, SENS_ECRITURE, IMMO_CHARGE)
            if (a.compteNum) {
                comptes.add(a.compteNum);
            }
            // Priorité 2: utiliser compte (si disponible)
            if (a.compte) {
                comptes.add(a.compte);
            }
            // Priorité 3: chercher dans ecritureComplete
            if (Array.isArray(a.ecritureComplete)) {
                a.ecritureComplete.forEach(l => {
                    const c = l?.comptegen || l?.compteaux;
                    if (c) comptes.add(c);
                });
            }
            // Priorité 4: chercher dans journalLines
            if (Array.isArray(a.journalLines)) {
                a.journalLines.forEach(l => {
                    const c = l?.comptegen || l?.compteaux;
                    if (c) comptes.add(c);
                });
            }
        });
        return Array.from(comptes).sort();
    }, [anomalies]);

    const immobSafeCompteIndex = useMemo(() => {
        if (immobComptesList.length === 0) return 0;
        return Math.min(Math.max(0, immobCompteIndex), immobComptesList.length - 1);
    }, [immobComptesList.length, immobCompteIndex]);

    const immobCurrentCompte = useMemo(() => {
        if (immobComptesList.length === 0) return null;
        return immobComptesList[immobSafeCompteIndex];
    }, [immobComptesList, immobSafeCompteIndex]);

    // Navigation TVA par écriture
    const handlePrevTvaEcriture = () => {
        setTvaEcritureIndex(prev => Math.max(0, prev - 1));
    };
    const handleNextTvaEcriture = () => {
        setTvaEcritureIndex(prev => Math.min(tvaFilteredAnomalies.length - 1, prev + 1));
    };

    // Calculer les anomalies filtrées pour TVA (exclure compte 28)
    const tvaFilteredAnomalies = useMemo(() => {
        return anomalies.filter(a => {
            const lines = a.journalLines || [];
            return lines.some(l => {
                const cpt = l.comptegen || l.compteaux || '';
                return !cpt.startsWith('28');
            });
        }).map(a => ({
            ...a,
            journalLines: (a.journalLines || []).filter(l => {
                const cpt = l.comptegen || l.compteaux || '';
                return !cpt.startsWith('28');
            })
        })).filter(a => a.journalLines.length > 0);
    }, [anomalies]);

    // Index sécurisé pour TVA
    const tvaSafeEcritureIndex = useMemo(() => {
        if (tvaFilteredAnomalies.length === 0) return 0;
        return Math.min(Math.max(0, tvaEcritureIndex), tvaFilteredAnomalies.length - 1);
    }, [tvaFilteredAnomalies.length, tvaEcritureIndex]);

    // Écriture courante TVA
    const tvaCurrentEcriture = useMemo(() => {
        if (tvaFilteredAnomalies.length === 0) return null;
        return tvaFilteredAnomalies[tvaSafeEcritureIndex];
    }, [tvaFilteredAnomalies, tvaSafeEcritureIndex]);

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
        // console.log('DEBUG useEffect controles - items.length:', items.length);
        // console.log('DEBUG useEffect controles - currentIndex:', currentIndex);

        // Toujours reset à 0 si les contrôles changent (nouveau type)
        // ou si l'index actuel est hors limites
        if (items.length > 0) {
            if (currentIndex >= items.length) {
                // console.log('DEBUG - currentIndex hors limites, reset à 0');
                setCurrentIndex(0);
            } else if (currentIndex === 0) {
                // Déjà à 0, pas besoin de changer
                // console.log('DEBUG - currentIndex déjà à 0');
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
                emitAnomaliesUpdated();
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

    // Ouvrir popup de confirmation pour validation batch (Tout valider le compte / Tout annuler le compte)
    const handleOpenBatchConfirm = (anomaliesToValidate, valide) => {
        if (!anomaliesToValidate || anomaliesToValidate.length === 0) return;

        setConfirmPopup({
            open: true,
            anomalie: null,
            action: valide ? 'valider_tout' : 'annuler_tout',
            anomalies: anomaliesToValidate,
            count: anomaliesToValidate.length
        });
    };

    const handleToggleValidateAnomaly = (anomalie) => {
        if (!anomalie) return;
        setConfirmPopup({ open: true, anomalie, action: anomalie.valide ? 'annuler' : 'valider' });
    };

    // Validation batch pour Tout valider le comptees les anomalies en une seule requête
    const handleValidateAllBatch = async (anomaliesToValidate, valide = true) => {
        if (!anomaliesToValidate || anomaliesToValidate.length === 0) return;

        setConfirmLoading(true);
        try {
            // Utiliser Promise.all pour Tout valider le comptees les anomalies en parallèle
            await Promise.all(
                anomaliesToValidate.map(anomaly =>
                    updateAnomaly(anomaly.id, { valide: valide })
                )
            );
            // Rafraîchir la liste des anomalies
            await fetchAnomalies();
            if (onValidationChange) {
                await onValidationChange();
            }
            emitAnomaliesUpdated();
        } catch (error) {
            console.error('Error batch validating anomalies:', error);
            alert('Erreur lors de la validation de toutes les anomalies');
        } finally {
            setConfirmLoading(false);
        }
    };

    // Validation groupée pour ATYPIQUE - Tout valider le comptees les anomalies du compte courant
    const handleValidateAllAtypiqueForCompte = () => {
        if (!atypiqueCurrentData || !atypiqueCurrentData.anomalies || atypiqueCurrentData.anomalies.length === 0) return;

        // Ouvrir popup de confirmation pour validation groupée
        setConfirmPopup({
            open: true,
            anomalie: null,
            action: 'valider_tout_le_compte',
            compte: atypiqueCurrentCompte,
            anomalies: atypiqueCurrentData.anomalies
        });
    };

    // Annulation groupée pour ATYPIQUE - Tout annuler le comptees les validations du compte courant
    const handleCancelAllAtypiqueForCompte = () => {
        if (!atypiqueCurrentData || !atypiqueCurrentData.anomalies || atypiqueCurrentData.anomalies.length === 0) return;

        // Ouvrir popup de confirmation pour annulation groupée
        setConfirmPopup({
            open: true,
            anomalie: null,
            action: 'annuler_tout_le_compte',
            compte: atypiqueCurrentCompte,
            anomalies: atypiqueCurrentData.anomalies
        });
    };

    const handleConfirmValidation = async (confirmed) => {
        if (!confirmed) {
            setConfirmPopup({ open: false, anomalie: null, action: null, anomalies: null, line: null });
            return;
        }

        // Validation batch (Tout valider le compte / Tout annuler le compte)
        if (confirmPopup.action === 'valider_tout' || confirmPopup.action === 'annuler_tout') {
            setConfirmLoading(true);
            try {
                const valide = confirmPopup.action === 'valider_tout';
                await handleValidateAllBatch(confirmPopup.anomalies, valide);
            } finally {
                setConfirmLoading(false);
                setConfirmPopup({ open: false, anomalie: null, action: null, anomalies: null, line: null });
            }
            return;
        }

        // Validation de ligne (valider_ligne / annuler_ligne)
        if (confirmPopup.action === 'valider_ligne' || confirmPopup.action === 'annuler_ligne') {
            setConfirmLoading(true);
            try {
                const valide = confirmPopup.action === 'valider_ligne';
                await executeValidateLine(confirmPopup.line, confirmPopup.anomalie, valide);
            } finally {
                setConfirmLoading(false);
                setConfirmPopup({ open: false, anomalie: null, action: null, anomalies: null, line: null });
            }
            return;
        }

        // Validation simple (une seule anomalie)
        if (!confirmPopup.anomalie) {
            setConfirmPopup({ open: false, anomalie: null, action: null, line: null });
            return;
        }

        setConfirmLoading(true);
        try {
            await updateAnomaly(confirmPopup.anomalie.id, { valide: !confirmPopup.anomalie.valide });
            // Rafraîchir la liste des anomalies
            await fetchAnomalies();
            if (onValidationChange) {
                await onValidationChange();
            }
        } finally {
            setConfirmLoading(false);
            setConfirmPopup({ open: false, anomalie: null, action: null, line: null });
        }
    };

    const handleCommentAnomaly = (anomalie) => {
        if (!anomalie) return;
        setCommentInput(anomalie.commentaire || '');
        setCommentDialog({ open: true, anomalie });
    };

    // Valider une ligne spécifique - Ouvrir popup de confirmation
    const handleValidateLine = (line, anomalie) => {
        if (!line || !anomalie) return;

        // Ouvrir popup de confirmation pour validation de ligne
        setConfirmPopup({
            open: true,
            anomalie: anomalie,
            line: line,
            action: anomalie.valide ? 'annuler_ligne' : 'valider_ligne'
        });
    };

    // Exécuter la validation de ligne après confirmation
    const executeValidateLine = async (line, anomalie, valide) => {
        // console.log('DEBUG executeValidateLine - Type:', currentItem?.Type, 'current soldeCompteIndex:', soldeCompteIndex);
        try {
            // Sauvegarder l'id_controle actuel avant l'action pour pouvoir restaurer après le refresh
            if (currentItem?.Type === 'SENS_SOLDE') {
                pendingSoldeIdControleRef.current = currentItem?.id_controle;
            }
            if (currentItem?.Type === 'SENS_ECRITURE') {
                pendingEcritureIdControleRef.current = currentItem?.id_controle;
            }

            // Determiner quel id_jnl utiliser selon le type
            let idJnl;
            if (currentItem?.Type === 'SENS_SOLDE' || currentItem?.Type === 'SENS_ECRITURE' || currentItem?.Type === 'IMMO_CHARGE') {
                idJnl = line.id;
            } else if (currentItem?.Type === 'UTIL_CPT_TVA') {
                idJnl = line.id_ecriture;
            } else if (currentItem?.Type === 'ATYPIQUE') {
                idJnl = line.id;
            } else {
                idJnl = line.id;
            }

            const payload = {
                id_ligne_journal: String(line.id),
                id_jnl: String(idJnl),
                valide: valide,
                codeCtrl: currentItem.Type,
                message: `Validation ligne ${line.id}`
            };

            const response = await axiosPrivate.post(
                `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/controle/${encodeURIComponent(currentItem.id_controle)}/validateLine`,
                payload
            );

            if (response.data.state) {
                // console.log('DEBUG executeValidateLine - avant fetchAnomalies, soldeCompteIndex:', soldeCompteIndex);

                // Optimistic update: mettre à jour l'anomalie localement immédiatement
                if (anomalie && anomalie.id) {
                    setAnomalies(prev => prev.map(a =>
                        String(a.id) === String(anomalie.id)
                            ? { ...a, valide: valide }
                            : a
                    ));
                }

                // Pour SENS_SOLDE et SENS_ECRITURE, ne pas fetchAnomalies ici car onValidationChange
                // va rafraichir le parent et declencher un nouveau fetch automatiquement
                if (currentItem?.Type !== 'SENS_SOLDE' && currentItem?.Type !== 'SENS_ECRITURE') {
                    await fetchAnomalies();
                }
                // console.log('DEBUG executeValidateLine - après fetchAnomalies, soldeCompteIndex:', soldeCompteIndex);
                if (onValidationChange) {
                    await onValidationChange();
                }
                emitAnomaliesUpdated();
            }
        } catch (error) {
            console.error('Error validating line:', error);
            alert('Erreur lors de la validation de la ligne');
            pendingSoldeIdControleRef.current = null;
            pendingEcritureIdControleRef.current = null;
        }
    };

    // Commenter une ligne spécifique - Ouvrir dialog
    // Dans handleCommentLine (ligne ~566)
    const handleCommentLine = (line, anomalie) => {
        // console.log('=== handleCommentLine called ===');
        // console.log('line:', line);
        // console.log('anomalie:', anomalie);
        if (!line) {
            // console.log('ERROR: line is null/undefined');
            return;
        }

        setCommentInput(line.commentaire || anomalie?.commentaire || '');
        // console.log('Opening comment dialog with line:', line.id);
        setCommentDialog({ open: true, anomalie: anomalie, line: line });
    };

    // Sauvegarder le commentaire de ligne
    const handleSaveLineComment = async () => {
        if (!commentDialog.line) return;

        const line = commentDialog.line;
        const anomalie = commentDialog.anomalie;

        try {
            // Sauvegarder l'id_controle actuel avant l'action pour pouvoir restaurer après le refresh
            if (currentItem?.Type === 'SENS_SOLDE') {
                pendingSoldeIdControleRef.current = currentItem?.id_controle;
            }
            if (currentItem?.Type === 'SENS_ECRITURE') {
                pendingEcritureIdControleRef.current = currentItem?.id_controle;
            }

            // Determiner quel id_jnl utiliser selon le type
            let idJnl;
            if (currentItem?.Type === 'SENS_SOLDE' || currentItem?.Type === 'SENS_ECRITURE' || currentItem?.Type === 'IMMO_CHARGE') {
                idJnl = line.id;
            } else if (currentItem?.Type === 'UTIL_CPT_TVA') {
                idJnl = line.id_ecriture;
            } else if (currentItem?.Type === 'ATYPIQUE') {
                idJnl = line.id;
            } else {
                idJnl = line.id;
            }

            const payload = {
                id_ligne_journal: String(line.id),
                id_jnl: String(idJnl),
                codeCtrl: currentItem.Type,
                message: `Commentaire ligne ${line.id}`,
                commentaire: commentInput
            };

            const response = await axiosPrivate.post(
                `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/controle/${encodeURIComponent(currentItem.id_controle)}/validateLine`,
                payload
            );

            if (response.data.state) {
                await fetchAnomalies();
                if (onValidationChange) {
                    await onValidationChange();
                }
                emitAnomaliesUpdated();
            }
        } catch (error) {
            console.error('Error commenting line:', error);
            alert('Erreur lors de l\'ajout du commentaire');
            pendingSoldeIdControleRef.current = null;
            pendingEcritureIdControleRef.current = null;
        } finally {
            // Fermer le dialog dans tous les cas
            setCommentDialog({ open: false, anomalie: null, line: null });
            setCommentInput('');
        }
    };

    const handleSaveCommentDialog = async () => {
        if (!commentDialog.anomalie) return;
        await updateAnomaly(commentDialog.anomalie.id, { commentaire: commentInput });
        setCommentDialog({ open: false, anomalie: null });
        setCommentInput('');
    };

    const handleCloseCommentDialog = () => {
        setCommentDialog({ open: false, anomalie: null, line: null });
        setCommentInput('');
    };

    const getAnomalyForLine = (line) => {
        if (!line) return null;
        if (currentItem?.Type === 'SENS_SOLDE' || currentItem?.Type === 'SENS_ECRITURE') {
            return anomalies.find(a => String(a.id_jnl) === String(line.id)) || null;
        }
        if (currentItem?.Type === 'UTIL_CPT_TVA' || affichageMode === 'ecriture') {
            // Pour UTIL_CPT_TVA, rechercher par id_ecriture pour afficher le statut sur chaque ligne de l'écriture
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
                if (idPeriode) {
                    params.append('id_periode', idPeriode);
                }
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
                if (idPeriode) {
                    params.append('id_periode', idPeriode);
                }
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
        // console.log('DEBUG useEffect - currentItem:', currentItem);
        // console.log('DEBUG useEffect - id_controle:', currentItem?.id_controle);
        if (currentItem?.id_controle && idCompte && idDossier && idExercice) {
            fetchAnomalies();
        }
    }, [currentItem?.id_controle, idCompte, idDossier, idExercice, idPeriode, dateDebut, dateFin, type]);

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
                if (idPeriode) {
                    params.append('id_periode', idPeriode);
                }
                url += `?${params.toString()}`;
            }

            console.log('[RevisionDetails] fetchAnomalies:', {
                type,
                id_controle: currentItem?.id_controle,
                idCompte,
                idDossier,
                idExercice,
                idPeriode,
                dateDebut,
                dateFin,
                url
            });

            // console.log('DEBUG fetchAnomalies - URL:', url);
            // console.log('DEBUG fetchAnomalies - currentItem.Type:', currentItem?.Type);

            const response = await axiosPrivate.get(url);

            console.log('[RevisionDetails] fetchAnomalies response:', {
                id_controle: currentItem?.id_controle,
                state: response.data.state,
                anomaliesCount: response.data.anomalies?.length || 0
            });

            if (response.data.state) {
                // console.log('DEBUG fetchAnomalies - anomalies count:', response.data.anomalies?.length);
                // console.log('DEBUG fetchAnomalies - anomalies:', response.data.anomalies);
                setAnomalies(response.data.anomalies);
            } else {
                // console.log('DEBUG fetchAnomalies - no state in response');
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
    }, [type, idCompte, idDossier, idExercice, idPeriode]);

    const fetchEcritures = async () => {
        try {
            let url = `/administration/revisionControleAuto/${idCompte}/${idDossier}/${idExercice}/type/${encodeURIComponent(type)}`;

            // Ajouter les paramètres de période si disponibles
            if (dateDebut && dateFin) {
                const params = new URLSearchParams();
                params.append('date_debut', dateDebut);
                params.append('date_fin', dateFin);
                if (idPeriode) {
                    params.append('id_periode', idPeriode);
                }
                url += `?${params.toString()}`;
            }

            const response = await axiosPrivate.get(url);
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
        // console.log('DEBUG anomaliesWithLines:', result.length, 'anomalies avec lignes sur', anomalies.length, 'total');
        // console.log('DEBUG anomalies:', anomalies.map(a => ({ id: a.id, valide: a.valide, linesCount: a.journalLines?.length })));
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

    const journalLinesCount = useMemo(() => {
        return (anomalies || []).reduce((sum, a) => sum + (Array.isArray(a?.journalLines) ? a.journalLines.length : 0), 0);
    }, [anomalies]);

    if (!currentItem) {
        return (
            <Paper sx={{ mt: 2, p: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h7" sx={{ fontWeight: 700, color: '#333' }}>
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
    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        textTransform: 'none',
        fontSize: '0.85rem',
        borderRadius: '6px',
        boxShadow: 'none',
        '& .MuiTouchRipple-root': {
            display: 'none',
        },
        '&:focus': {
            outline: 'none',
        },
        '&.Mui-focusVisible': {
            outline: 'none',
            boxShadow: 'none',
        },
        '&:hover': {
            boxShadow: 'none',
            backgroundColor: 'action.hover',
            border: 'none',
        },
        '&.Mui-disabled': {
            opacity: 0.4
        },
    };

    return (
        <Paper sx={{ mt: 2, p: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h7" sx={{ fontWeight: 700, color: "#2c3e50" }}>
                        Détails - compte : {currentItem.compte && currentItem.compte !== '0' && currentItem.compte !== 0 ? currentItem.compte : 'n/a'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {/* <Chip
                            size="small"
                            label={`${anomalies.length} anomalies`}
                            sx={{ fontWeight: 800 }}
                        />
                        <Chip
                            size="small"
                            label={`${journalLinesCount} lignes`}
                            sx={{ fontWeight: 800 }}
                        /> */}
                    </Stack>
                    {/* Pagination de page déplacée ici */}
                    {total > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: 1 }}>
                            <Button variant="outlined" size="small" onClick={handlePrev} disabled={total <= 1} sx={{ minWidth: '30px', px: 0.5, fontSize: '0.75rem' }}>
                                {"<"}
                            </Button>
                            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                                {currentIndex + 1} / {total}
                            </Typography>
                            <Button variant="outlined" size="small" onClick={handleNext} disabled={total <= 1} sx={{ minWidth: '30px', px: 0.5, fontSize: '0.75rem' }}>
                                {">"}
                            </Button>
                        </Box>
                    )}
                </Box>
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
                </Box>
            </Box>


            {/* MAIN CONTENT */}
            <Grid container spacing={3} alignItems="flex-start">
                {/* LEFT SIDE - INFOS + TABLE */}
                <Grid item xs={12} md={12}>
                    {/* INFO */}
                    <Box sx={{ mb: 2 }}>

                        {/* Navigation TVA par écriture (dans la même ligne) */}
                        {currentItem?.Type === 'UTIL_CPT_TVA' && tvaFilteredAnomalies.length > 1 && (
                            <Stack
                                direction="row"
                                alignItems="left"
                                justifyContent="space-between"
                                sx={{
                                    mb: 3,
                                    bgcolor: '#F8FAFC',
                                    p: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography
                                        variant="caption"
                                        sx={{ color: '#64748B', fontWeight: 700 }}
                                    >
                                        ÉCRITURE :
                                    </Typography>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 800,
                                                color: '#1976d2',
                                                whiteSpace: 'nowrap',
                                                bgcolor: 'white',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: '8px',
                                                border: '1px solid #CBD5E1'
                                            }}
                                        >
                                            Écriture {tvaSafeEcritureIndex + 1}
                                        </Typography>

                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                disabled={tvaSafeEcritureIndex === 0}
                                                onClick={handlePrevTvaEcriture}
                                                sx={{
                                                    border: '1px solid #CBD5E1',
                                                    bgcolor: 'white',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <ChevronLeft fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                disabled={tvaSafeEcritureIndex >= tvaFilteredAnomalies.length - 1}
                                                onClick={handleNextTvaEcriture}
                                                sx={{
                                                    border: '1px solid #CBD5E1',
                                                    bgcolor: 'white',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <ChevronRight fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                        {(() => {
                                            const allValidated = anomalies.length > 0 && anomalies.every(a => a.valide);
                                            const hasAnomalies = anomalies.length > 0;
                                            return hasAnomalies && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={allValidated ? <CloseIcon /> : <DoneAllIcon />}

                                                    sx={{
                                                        bgcolor: allValidated ? '#d32f2f' : '#10B981',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        ml: 1,
                                                        height: 32
                                                    }}
                                                    onClick={() => handleOpenBatchConfirm([tvaCurrentEcriture], !tvaCurrentEcriture.valide)}                                                >
                                                    {allValidated ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                </Button>
                                            );
                                        })()}
                                    </Stack>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    sx={{ color: '#64748B', fontWeight: 800 }}
                                >
                                    {tvaSafeEcritureIndex + 1} / {tvaFilteredAnomalies.length} ÉCRITURES
                                </Typography>

                            </Stack>
                        )}
                        {/* Navigation compte SENS_SOLDE */}
                        {currentItem?.Type === 'SENS_SOLDE' && soldeComptesList.length > 0 && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                    mb: 3,
                                    bgcolor: '#F8FAFC',
                                    p: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography
                                        variant="caption"
                                        sx={{ color: '#64748B', fontWeight: 700 }}
                                    >
                                        COMPTE :
                                    </Typography>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 800,
                                                color: '#1976d2',
                                                whiteSpace: 'nowrap',
                                                bgcolor: 'white',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: '8px',
                                                border: '1px solid #CBD5E1'
                                            }}
                                        >
                                            {soldeCurrentCompte}
                                        </Typography>

                                        {soldeComptesList.length > 1 && (
                                            <Stack direction="row" spacing={0.5}>
                                                <IconButton
                                                    size="small"
                                                    disabled={soldeSafeCompteIndex === 0}
                                                    onClick={() =>
                                                        setSoldeCompteIndex(prev => Math.max(0, prev - 1))
                                                    }
                                                    sx={{
                                                        border: '1px solid #CBD5E1',
                                                        bgcolor: 'white',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    <ChevronLeft fontSize="small" />
                                                </IconButton>

                                                <IconButton
                                                    size="small"
                                                    disabled={soldeSafeCompteIndex === soldeComptesList.length - 1}
                                                    onClick={() =>
                                                        setSoldeCompteIndex(prev =>
                                                            Math.min(soldeComptesList.length - 1, prev + 1)
                                                        )
                                                    }
                                                    sx={{
                                                        border: '1px solid #CBD5E1',
                                                        bgcolor: 'white',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    <ChevronRight fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        )}
                                        {(() => {
                                            const compteAnomalies = anomalies.filter(a =>
                                                a.journalLines?.some(l => (l.comptegen || l.compteaux) === soldeCurrentCompte)
                                            );
                                            const allValidated = compteAnomalies.length > 0 && compteAnomalies.every(a => a.valide);
                                            const hasAnomalies = compteAnomalies.length > 0;
                                            return hasAnomalies && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={allValidated ? <CloseIcon /> : <DoneAllIcon />}
                                                    sx={{
                                                        bgcolor: allValidated ? '#d32f2f' : '#10B981',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        ml: 1,
                                                        height: 32
                                                    }}
                                                    onClick={() => handleOpenBatchConfirm(allValidated ? compteAnomalies : compteAnomalies.filter(a => !a.valide), !allValidated)}
                                                >
                                                    {allValidated ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                </Button>
                                            );
                                        })()}
                                    </Stack>
                                </Stack>

                                {soldeComptesList.length > 1 && (
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#64748B', fontWeight: 800 }}
                                    >
                                        {soldeSafeCompteIndex + 1} / {soldeComptesList.length} COMPTES
                                    </Typography>
                                )}

                            </Stack>
                        )}
                        {/* Navigation compte SENS_ECRITURE */}
                        {currentItem?.Type === 'SENS_ECRITURE' && ecritureComptesList.length > 1 && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                    mb: 3,
                                    bgcolor: '#F8FAFC',
                                    p: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography
                                        variant="caption"
                                        sx={{ color: '#64748B', fontWeight: 700 }}
                                    >
                                        COMPTE :
                                    </Typography>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 800,
                                                color: '#1976d2',
                                                whiteSpace: 'nowrap',
                                                bgcolor: 'white',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: '8px',
                                                border: '1px solid #CBD5E1'
                                            }}
                                        >
                                            {ecritureCurrentCompte}
                                        </Typography>

                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                disabled={ecritureSafeCompteIndex === 0}
                                                onClick={() =>
                                                    setEcritureCompteIndex(prev => Math.max(0, prev - 1))
                                                }
                                                sx={{
                                                    border: '1px solid #CBD5E1',
                                                    bgcolor: 'white',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <ChevronLeft fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                disabled={ecritureSafeCompteIndex === ecritureComptesList.length - 1}
                                                onClick={() =>
                                                    setEcritureCompteIndex(prev =>
                                                        Math.min(ecritureComptesList.length - 1, prev + 1)
                                                    )
                                                }
                                                sx={{
                                                    border: '1px solid #CBD5E1',
                                                    bgcolor: 'white',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <ChevronRight fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                        {(() => {
                                            const compteAnomalies = anomalies.filter(a =>
                                                a.journalLines?.some(l => (l.comptegen || l.compteaux) === ecritureCurrentCompte)
                                            );
                                            const allValidated = compteAnomalies.length > 0 && compteAnomalies.every(a => a.valide);
                                            const hasAnomalies = compteAnomalies.length > 0;
                                            return hasAnomalies && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={allValidated ? <CloseIcon /> : <DoneAllIcon />}

                                                    sx={{
                                                        bgcolor: allValidated ? '#d32f2f' : '#10B981',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        ml: 1,
                                                        height: 32
                                                    }}
                                                    onClick={() => handleOpenBatchConfirm(allValidated ? compteAnomalies : compteAnomalies.filter(a => !a.valide), !allValidated)}
                                                >
                                                    {allValidated ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                </Button>
                                            );
                                        })()}
                                    </Stack>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    sx={{ color: '#64748B', fontWeight: 800 }}
                                >
                                    {ecritureSafeCompteIndex + 1} / {ecritureComptesList.length} COMPTES
                                </Typography>

                            </Stack>
                        )}
                        {/* Navigation compte ATYPIQUE - centrée au milieu (cachée pour IMMO, SENS_SOLDE et UTIL_CPT_TVA) */}
                        {atypiqueComptesList.length > 1 &&
                            !(currentItem?.Type && String(currentItem.Type).toUpperCase().includes('IMMO')) &&
                            currentItem?.Type !== 'UTIL_CPT_TVA' &&
                            currentItem?.Type !== 'SENS_SOLDE' &&
                            currentItem?.Type !== 'SENS_ECRITURE' && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{
                                        mb: 3,
                                        bgcolor: '#F8FAFC',
                                        p: 1.5,
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0'
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#64748B', fontWeight: 700 }}
                                        >
                                            COMPTE :
                                        </Typography>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 800,
                                                    color: '#1976d2',
                                                    whiteSpace: 'nowrap',
                                                    bgcolor: 'white',
                                                    px: 2,
                                                    py: 0.5,
                                                    borderRadius: '8px',
                                                    border: '1px solid #CBD5E1'
                                                }}
                                            >
                                                {atypiqueCurrentCompte}
                                            </Typography>

                                            <Stack direction="row" spacing={0.5}>
                                                <IconButton
                                                    size="small"
                                                    disabled={atypiqueSafeCompteIndex === 0}
                                                    onClick={() =>
                                                        setAtypiqueCompteIndex(prev => Math.max(0, prev - 1))
                                                    }
                                                    sx={{
                                                        border: '1px solid #CBD5E1',
                                                        bgcolor: 'white',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    <ChevronLeft fontSize="small" />
                                                </IconButton>

                                                <IconButton
                                                    size="small"
                                                    disabled={atypiqueSafeCompteIndex === atypiqueComptesList.length - 1}
                                                    onClick={() =>
                                                        setAtypiqueCompteIndex(prev =>
                                                            Math.min(atypiqueComptesList.length - 1, prev + 1)
                                                        )
                                                    }
                                                    sx={{
                                                        border: '1px solid #CBD5E1',
                                                        bgcolor: 'white',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    <ChevronRight fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                            {(() => {
                                                const compteAnomalies = anomalies.filter(a =>
                                                    a.journalLines?.some(l => (l.comptegen || l.compteaux) === atypiqueCurrentCompte)
                                                );
                                                const allValidated = compteAnomalies.length > 0 && compteAnomalies.every(a => a.valide);
                                                const hasAnomalies = compteAnomalies.length > 0;
                                                return hasAnomalies && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={allValidated ? <CloseIcon /> : <DoneAllIcon />}
                                                        sx={{
                                                            bgcolor: allValidated ? '#d32f2f' : '#10B981',
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            ml: 1,
                                                            height: 32
                                                        }}
                                                        onClick={() => handleOpenBatchConfirm(allValidated ? compteAnomalies : compteAnomalies.filter(a => !a.valide), !allValidated)}
                                                    >
                                                        {allValidated ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                    </Button>
                                                );
                                            })()}
                                        </Stack>
                                    </Stack>

                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#64748B', fontWeight: 800 }}
                                    >
                                        {atypiqueSafeCompteIndex + 1} / {atypiqueComptesList.length} COMPTES
                                    </Typography>

                                </Stack>
                            )}
                        {/* Navigation compte IMMO */}
                        {currentItem?.Type && String(currentItem.Type).toUpperCase().includes('IMMO') && immobComptesList.length > 1 && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                    mb: 3,
                                    bgcolor: '#F8FAFC',
                                    p: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography
                                        variant="caption"
                                        sx={{ color: '#64748B', fontWeight: 700 }}
                                    >
                                        COMPTE :
                                    </Typography>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 800,
                                                color: '#1976d2',
                                                whiteSpace: 'nowrap',
                                                bgcolor: 'white',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: '8px',
                                                border: '1px solid #CBD5E1'
                                            }}
                                        >
                                            {immobCurrentCompte}
                                        </Typography>

                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                disabled={immobSafeCompteIndex === 0}
                                                onClick={() =>
                                                    setImmobCompteIndex(prev => Math.max(0, prev - 1))
                                                }
                                                sx={{
                                                    border: '1px solid #CBD5E1',
                                                    bgcolor: 'white',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <ChevronLeft fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                disabled={immobSafeCompteIndex === immobComptesList.length - 1}
                                                onClick={() =>
                                                    setImmobCompteIndex(prev =>
                                                        Math.min(immobComptesList.length - 1, prev + 1)
                                                    )
                                                }
                                                sx={{
                                                    border: '1px solid #CBD5E1',
                                                    bgcolor: 'white',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <ChevronRight fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                        {(() => {
                                            const compteAnomalies = anomalies.filter(a =>
                                                a.journalLines?.some(l => (l.comptegen || l.compteaux) === immobCurrentCompte)
                                            );
                                            const allValidated = compteAnomalies.length > 0 && compteAnomalies.every(a => a.valide);
                                            const hasAnomalies = compteAnomalies.length > 0;
                                            return hasAnomalies && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={allValidated ? <CloseIcon /> : <DoneAllIcon />}
                                                    sx={{
                                                        bgcolor: allValidated ? '#d32f2f' : '#10B981',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        ml: 1,
                                                        height: 32
                                                    }}
                                                    onClick={() => handleOpenBatchConfirm(allValidated ? compteAnomalies : compteAnomalies.filter(a => !a.valide), !allValidated)}
                                                >
                                                    {allValidated ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                </Button>
                                            );
                                        })()}
                                    </Stack>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    sx={{ color: '#64748B', fontWeight: 800 }}
                                >
                                    {immobSafeCompteIndex + 1} / {immobComptesList.length} COMPTES
                                </Typography>

                            </Stack>
                        )}
                        {/* </Box> */}
                    </Box>

                    {anomaliesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : currentItem?.Type === 'EXISTENCE' ? (
                        // Mode EXISTENCE - avec filtre par compte
                        anomalies.length > 0 ? (
                            <Box>
                                {paginatedAnomalies
                                    .filter(a => !atypiqueCurrentCompte ||
                                        (a.journalLines?.[0]?.comptegen === atypiqueCurrentCompte ||
                                            a.journalLines?.[0]?.compteaux === atypiqueCurrentCompte))
                                    .map((anomalie, idx) => (
                                        <Box key={idx} sx={{ mb: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                    {anomalie.message || 'Anomalie d\'existence'}
                                                </Alert>
                                            </Box>
                                            {anomalie.journalLines?.length > 0 ? (
                                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                                                    <Table size="small" stickyHeader>
                                                        <TableHead>
                                                            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                                <TableCell sx={tableStyles.headCell}>Date</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Compte</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Pièce</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Libellé</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Débit</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Crédit</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Lettrage</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Analytique</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Validé</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Commentaire</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {anomalie.journalLines.map((line, lineIdx) => (
                                                                <TableRow key={lineIdx} hover>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.comptegen || line?.compteaux || '-'}</TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.piece || '-'}</TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.libelle || '-'}</TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>
                                                                        {line?.debit ? formatMontant(line.debit) : "-"}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>
                                                                        {line?.credit ? formatMontant(line.credit) : "-"}
                                                                    </TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.lettrage || '-'}</TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.analytique || '-'}</TableCell>
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
                                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>

                                                                            <IconButton
                                                                                variant="outlined"
                                                                                size="small"
                                                                                onClick={() => handleCommentAnomaly(anomalie)}
                                                                                sx={{
                                                                                    borderColor: '#1203e0ff'
                                                                                }}
                                                                            >
                                                                                <EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} />
                                                                            </IconButton>
                                                                            <Button
                                                                                variant="contained"
                                                                                size="small"
                                                                                onClick={() => handleValidateLine(line, anomalie)}
                                                                                sx={{
                                                                                    ...buttonStyle,
                                                                                    backgroundColor: initial.auth_gradient_end,
                                                                                    color: 'white',
                                                                                    borderColor: initial.auth_gradient_end,
                                                                                    '&:hover': {
                                                                                        backgroundColor: initial.auth_gradient_end,
                                                                                        none: 'none',
                                                                                    },
                                                                                    '&.Mui-disabled': {
                                                                                        backgroundColor: initial.auth_gradient_end,
                                                                                        color: 'white',
                                                                                        cursor: 'not-allowed',
                                                                                    },
                                                                                }}
                                                                            >
                                                                                Valider
                                                                            </Button>
                                                                        </Box>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    Aucune ligne de journal pour ce compte
                                                </Typography>
                                            )}
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
                            // Mode SENS_SOLDE - Regroupé par compte avec navigation
                            anomalies.length > 0 && soldeCurrentCompte ? (
                                <Box>
                                    {(() => {
                                        // Regrouper les anomalies par compte (depuis journalLines)
                                        const groupedByCompte = {};
                                        anomalies.forEach(anomalie => {
                                            if (!Array.isArray(anomalie.journalLines)) return;

                                            anomalie.journalLines.forEach(line => {
                                                const compte = line?.comptegen || line?.compteaux;
                                                if (!compte) return;

                                                if (!groupedByCompte[compte]) {
                                                    groupedByCompte[compte] = {
                                                        anomalies: [],
                                                        allLines: [],
                                                        allValidated: true
                                                    };
                                                }
                                                // Ajouter l'anomalie une seule fois par compte
                                                if (!groupedByCompte[compte].anomalies.includes(anomalie)) {
                                                    groupedByCompte[compte].anomalies.push(anomalie);
                                                }
                                                // Ajouter cette ligne
                                                groupedByCompte[compte].allLines.push(line);
                                            });

                                            // Mettre à jour allValidated
                                            Object.keys(groupedByCompte).forEach(compte => {
                                                if (groupedByCompte[compte].anomalies.includes(anomalie) && !anomalie.valide) {
                                                    groupedByCompte[compte].allValidated = false;
                                                }
                                            });
                                        });

                                        const testType = currentItem?.test?.toUpperCase();
                                        const data = groupedByCompte[soldeCurrentCompte];

                                        if (!data) return <Alert severity="info">Aucune anomalie pour le compte {soldeCurrentCompte}</Alert>;

                                        const lines = data.allLines;
                                        const anomaliesForCompte = data.anomalies;
                                        const allValidated = data.allValidated;

                                        const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
                                        const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
                                        const solde = totalDebit - totalCredit;
                                        const soldeNormalise = Math.abs(solde) < 0.01 ? 0 : solde;

                                        let detailMessage = `Le compte "${soldeCurrentCompte}" doit avoir un solde `;
                                        if (testType === 'DEBITEUR') {
                                            detailMessage += 'débiteur';
                                        } else if (testType === 'CREDITEUR') {
                                            detailMessage += 'créditeur';
                                        } else if (testType === 'NULL') {
                                            detailMessage += 'nul';
                                        } else {
                                            detailMessage = `Anomalie de sens de solde pour le compte "${soldeCurrentCompte}"`;
                                        }

                                        const anomaliesToProcess = allValidated
                                            ? anomaliesForCompte
                                            : anomaliesForCompte.filter(a => !a.valide);

                                        return (
                                            <Box sx={{ mb: 3 }}>
                                                {/* Boutons et message */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                        {detailMessage}
                                                    </Alert>
                                                </Box>

                                                {lines.length > 0 ? (
                                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                                                        <Table size="small" stickyHeader>
                                                            <TableHead>
                                                                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                                    <TableCell sx={tableStyles.headCell}>Date</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Compte</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Pièce</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Libellé</TableCell>
                                                                    <TableCell sx={{ ...tableStyles.headCell, fontWeight: 700, textAlign: "right", fontSize: '0.85rem', py: 1.5 }}>Débit</TableCell>
                                                                    <TableCell sx={{ ...tableStyles.headCell, fontWeight: 700, textAlign: "right", fontSize: '0.85rem', py: 1.5 }}>Crédit</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Lettrage</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Analytique</TableCell>
                                                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.85rem', py: 1.5 }}>Validé</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Commentaire</TableCell>
                                                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.85rem', py: 1.5 }}>Action</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {lines.map((line, lineIdx) => (
                                                                    <TableRow key={lineIdx} hover>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }} >{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.comptegen || line?.compteaux || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.piece || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.libelle || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>
                                                                            {line?.debit ? formatMontant(line.debit) : "-"}
                                                                        </TableCell>
                                                                        <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>
                                                                            {line?.credit ? formatMontant(line.credit) : "-"}
                                                                        </TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.lettrage || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.analytique || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
                                                                            {(() => {
                                                                                const lineAnomaly = getAnomalyForLine(line);
                                                                                return (
                                                                                    <Chip
                                                                                        label={lineAnomaly?.valide ? 'Oui' : 'Non'}
                                                                                        color={lineAnomaly?.valide ? 'success' : 'default'}
                                                                                        size="small"
                                                                                    />
                                                                                );
                                                                            })()}
                                                                        </TableCell>
                                                                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
                                                                            {(() => {
                                                                                const lineAnomaly = getAnomalyForLine(line);
                                                                                return lineAnomaly?.commentaire || '-';
                                                                            })()}
                                                                        </TableCell>
                                                                        <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                                                {(() => {
                                                                                    const lineAnomaly = getAnomalyForLine(line);
                                                                                    return (
                                                                                        <>

                                                                                            <IconButton
                                                                                                variant="outlined"
                                                                                                size="small"
                                                                                                onClick={() => handleCommentLine(line, lineAnomaly || anomaliesForCompte[0])}
                                                                                                sx={{
                                                                                                    borderColor: '#1203e0ff'
                                                                                                }}
                                                                                            >
                                                                                                <EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} />
                                                                                            </IconButton>

                                                                                            <Button
                                                                                                variant="contained"
                                                                                                size="small"
                                                                                                onClick={() => handleValidateLine(line, lineAnomaly || anomaliesForCompte[0])}
                                                                                                sx={{
                                                                                                    ...buttonStyle,
                                                                                                    backgroundColor: lineAnomaly?.valide ? '#d32f2f' : initial.auth_gradient_end,
                                                                                                    color: 'white',
                                                                                                    borderColor: lineAnomaly?.valide ? '#d32f2f' : initial.auth_gradient_end,
                                                                                                    '&:hover': {
                                                                                                        backgroundColor: lineAnomaly?.valide ? '#b71c1c' : initial.auth_gradient_end,
                                                                                                    },
                                                                                                    '&.Mui-disabled': {
                                                                                                        backgroundColor: lineAnomaly?.valide ? '#d32f2f' : initial.auth_gradient_end,
                                                                                                        color: 'white',
                                                                                                        cursor: 'not-allowed',
                                                                                                    },
                                                                                                }}
                                                                                            >
                                                                                                {lineAnomaly?.valide ? 'Annuler' : 'Valider'}
                                                                                            </Button>
                                                                                        </>
                                                                                    );
                                                                                })()}
                                                                            </Box>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                                <TableRow sx={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}>
                                                                    <TableCell colSpan={4} sx={{ fontWeight: 600 }}>Total</TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                                                                        {totalDebit.toLocaleString("fr-FR", { minimumFractionDigits: 2 }).replace(/\u00A0/g, ' ')}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                                                                        {totalCredit.toLocaleString("fr-FR", { minimumFractionDigits: 2 }).replace(/\u00A0/g, ' ')}
                                                                    </TableCell>
                                                                    <TableCell colSpan={5} />
                                                                </TableRow>
                                                                <TableRow sx={{ backgroundColor: "#fff3e0" }}>
                                                                    <TableCell colSpan={4} sx={{ fontWeight: 600 }}>Solde</TableCell>
                                                                    <TableCell colSpan={2} sx={{ textAlign: "center", fontWeight: 600 }}>
                                                                        {soldeNormalise > 0 ? `Débiteur: ${soldeNormalise.toFixed(2)}` : soldeNormalise < 0 ? `Créditeur: ${Math.abs(soldeNormalise).toFixed(2)}` : 'Solde nul'}
                                                                    </TableCell>
                                                                    <TableCell colSpan={5} />
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
                                    })()}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucun compte avec anomalie de sens de solde</Alert>
                            )
                        ) : currentItem?.Type === 'SENS_ECRITURE' ? (
                            // Mode SENS_ECRITURE - Regroupé par compte avec navigation
                            anomalies.length > 0 && ecritureCurrentCompte ? (
                                <Box>
                                    {(() => {
                                        const groupedByCompte = {};
                                        anomalies.forEach(anomalie => {
                                            if (!Array.isArray(anomalie.journalLines)) return;
                                            anomalie.journalLines.forEach(line => {
                                                const compte = line?.comptegen || line?.compteaux;
                                                if (!compte) return;
                                                if (!groupedByCompte[compte]) {
                                                    groupedByCompte[compte] = { anomalies: [], allLines: [], allValidated: true };
                                                }
                                                if (!groupedByCompte[compte].anomalies.includes(anomalie)) {
                                                    groupedByCompte[compte].anomalies.push(anomalie);
                                                }
                                                groupedByCompte[compte].allLines.push(line);
                                            });
                                            Object.keys(groupedByCompte).forEach(compte => {
                                                if (groupedByCompte[compte].anomalies.includes(anomalie) && !anomalie.valide) {
                                                    groupedByCompte[compte].allValidated = false;
                                                }
                                            });
                                        });

                                        const testType = currentItem?.test?.toUpperCase();
                                        const data = groupedByCompte[ecritureCurrentCompte];
                                        if (!data) return <Alert severity="info">Aucune anomalie pour le compte {ecritureCurrentCompte}</Alert>;

                                        const lines = data.allLines.filter(line => {
                                            const debit = parseFloat(line.debit) || 0;
                                            const credit = parseFloat(line.credit) || 0;
                                            if (testType === 'CREDIT') return credit > 0;
                                            if (testType === 'DEBIT') return debit > 0;
                                            return true;
                                        });

                                        const anomaliesForCompte = data.anomalies;
                                        const allValidated = data.allValidated;
                                        const anomaliesToProcess = allValidated ? anomaliesForCompte : anomaliesForCompte.filter(a => !a.valide);

                                        return (
                                            <Box sx={{ mb: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                        Anomalie de sens d&apos;écriture pour le compte &quot;{ecritureCurrentCompte}&quot;
                                                    </Alert>
                                                    {/* <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleOpenBatchConfirm(anomaliesToProcess, !allValidated)}
                                                        sx={{
                                                            ...buttonStyle,
                                                            backgroundColor: allValidated ? '#d32f2f' : initial.auth_gradient_end,
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: allValidated ? '#b71c1c' : initial.auth_gradient_end }
                                                        }}
                                                    >
                                                        {allValidated ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                    </Button> */}
                                                </Box>

                                                {lines.length > 0 ? (
                                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                                                        <Table size="small" stickyHeader>
                                                            <TableHead>
                                                                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                                    <TableCell sx={tableStyles.headCell}>Date</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Compte</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Pièce</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Libellé</TableCell>
                                                                    <TableCell sx={{ ...tableStyles.headCell, textAlign: "right" }}>Débit</TableCell>
                                                                    <TableCell sx={{ ...tableStyles.headCell, textAlign: "right" }}>Crédit</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Lettrage</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Analytique</TableCell>
                                                                    <TableCell sx={{ ...tableStyles.headCell, textAlign: 'center' }}>Validé</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Commentaire</TableCell>
                                                                    <TableCell sx={{ ...tableStyles.headCell, textAlign: 'center' }}>Action</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {lines.map((line, lineIdx) => (
                                                                    <TableRow key={lineIdx} hover>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.comptegen || line?.compteaux || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.piece || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.libelle || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.debit ? formatMontant(line.debit) : "-"}</TableCell>
                                                                        <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.credit ? formatMontant(line.credit) : "-"}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.lettrage || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{line?.analytique || '-'}</TableCell>
                                                                        <TableCell sx={{ textAlign: 'center' }}>
                                                                            {(() => {
                                                                                const lineAnomaly = getAnomalyForLine(line);
                                                                                return <Chip label={lineAnomaly?.valide ? 'Oui' : 'Non'} color={lineAnomaly?.valide ? 'success' : 'default'} size="small" />;
                                                                            })()}
                                                                        </TableCell>
                                                                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            {(() => {
                                                                                const lineAnomaly = getAnomalyForLine(line);
                                                                                return lineAnomaly?.commentaire || '-';
                                                                            })()}
                                                                        </TableCell>
                                                                        <TableCell sx={{ textAlign: 'center' }}>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                                                {(() => {
                                                                                    const lineAnomaly = getAnomalyForLine(line);
                                                                                    return (
                                                                                        <>
                                                                                            <IconButton variant="outlined" size="small" onClick={() => handleCommentLine(line, lineAnomaly || anomaliesForCompte[0])} sx={{
                                                                                                borderColor: '#1203e0ff'
                                                                                            }} ><EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} /></IconButton>
                                                                                            <Button variant="contained" size="small" onClick={() => handleValidateLine(line, lineAnomaly || anomaliesForCompte[0])} sx={{ ...buttonStyle, backgroundColor: lineAnomaly?.valide ? '#d32f2f' : initial.auth_gradient_end, color: 'white', borderColor: lineAnomaly?.valide ? '#d32f2f' : initial.auth_gradient_end, '&:hover': { backgroundColor: lineAnomaly?.valide ? '#b71c1c' : initial.auth_gradient_end } }}>{lineAnomaly?.valide ? 'Annuler' : 'Valider'}</Button>

                                                                                        </>
                                                                                    );
                                                                                })()}
                                                                            </Box>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                                <TableRow sx={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}>
                                                                    <TableCell colSpan={4} sx={tableStyles.headCell}>Total</TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>{lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 }).replace(/\u00A0/g, ' ')}</TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>{lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 }).replace(/\u00A0/g, ' ')}</TableCell>
                                                                    <TableCell colSpan={5} />
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">Aucune ligne de journal pour ce compte</Typography>
                                                )}
                                            </Box>
                                        );
                                    })()}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucun compte avec anomalie de sens d&apos;écriture</Alert>
                            )
                        ) : currentItem?.Type === 'UTIL_CPT_TVA' ? (
                            // Mode UTIL_CPT_TVA - Affichage par écriture avec navigation, exclure compte 28
                            tvaFilteredAnomalies.length > 0 ? (
                                <Box>
                                    {/* Afficher uniquement l'écriture courante */}
                                    {(() => {
                                        const anomalie = tvaCurrentEcriture;
                                        if (!anomalie) return null;
                                        const lines = anomalie.journalLines || [];
                                        return (
                                            <Box sx={{ mb: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Alert severity="warning" sx={{ flex: 1 }}>
                                                        <strong>Écriture</strong> - {anomalie.message}
                                                    </Alert>
                                                    {/* <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleToggleValidateAnomaly(anomalie)}
                                                        sx={{
                                                            ...buttonStyle,
                                                            backgroundColor: initial.auth_gradient_end,
                                                            color: 'white',
                                                            borderColor: initial.auth_gradient_end,
                                                            '&:hover': {
                                                                backgroundColor: initial.auth_gradient_end,
                                                                none: 'none',
                                                            },
                                                            '&.Mui-disabled': {
                                                                backgroundColor: initial.auth_gradient_end,
                                                                color: 'white',
                                                                cursor: 'not-allowed',
                                                            },
                                                        }}
                                                    >
                                                        {anomalie.valide ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                    </Button> */}
                                                    {/* <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleCommentAnomaly(anomalie)}
                                                        sx={{
                                                            ...buttonStyle,
                                                            backgroundColor: initial.add_new_line_bouton_color,
                                                            color: 'white',
                                                            borderColor: initial.add_new_line_bouton_color,
                                                            '&:hover': {
                                                                backgroundColor: initial.add_new_line_bouton_color,
                                                                none: 'none',
                                                            },
                                                            '&.Mui-disabled': {
                                                                backgroundColor: initial.add_new_line_bouton_color,
                                                                color: 'white',
                                                                cursor: 'not-allowed',
                                                            },
                                                        }}
                                                    >
                                                        Commenter
                                                    </Button> */}
                                                </Box>

                                                <TableContainer component={Paper} variant="outlined">
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                                <TableCell sx={tableStyles.headCell}>Date</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Compte</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Pièce</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Libellé</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, textAlign: "right", fontSize: '0.85rem' }}>Débit</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, textAlign: "right", fontSize: '0.85rem' }}>Crédit</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Lettrage</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Analytique</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.85rem' }}>Validé</TableCell>
                                                                <TableCell sx={tableStyles.headCell}>Commentaire</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.85rem' }}>Action</TableCell>
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
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.piece || '-'}</TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.libelle || '-'}</TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.debit ? formatMontant(line.debit) : "-"}</TableCell>
                                                                    <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.credit ? formatMontant(line.credit) : "-"}</TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.lettrage || '-'}</TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.analytique || '-'}</TableCell>
                                                                    <TableCell sx={{ textAlign: "center", fontSize: '0.85rem' }}>
                                                                        <Chip
                                                                            label={anomalie.valide ? "Oui" : "Non"}
                                                                            color={anomalie.valide ? "success" : "error"}
                                                                            size="small"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{anomalie.commentaire || '-'}</TableCell>
                                                                    <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
                                                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                                                            <IconButton
                                                                                variant="outlined"
                                                                                size="small"
                                                                                onClick={() => handleCommentAnomaly(anomalie)}
                                                                                sx={{
                                                                                    borderColor: '#1203e0ff'
                                                                                }}
                                                                            >
                                                                                <EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} />
                                                                            </IconButton>
                                                                            <Button
                                                                                variant="contained"
                                                                                size="small"
                                                                                onClick={() => handleToggleValidateAnomaly(anomalie)}
                                                                                sx={{
                                                                                    ...buttonStyle,
                                                                                    minWidth: 100,
                                                                                    backgroundColor: initial.auth_gradient_end,
                                                                                    color: 'white',
                                                                                    borderColor: initial.auth_gradient_end,
                                                                                    '&:hover': {
                                                                                        backgroundColor: initial.auth_gradient_end,
                                                                                    },
                                                                                }}
                                                                            >
                                                                                {anomalie.valide ? 'Annuler' : 'Valider'}
                                                                            </Button>

                                                                        </Stack>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        );
                                    })()}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucune anomalie de TVA détectée</Alert>
                            )
                        ) : (currentItem?.Type && String(currentItem.Type).toUpperCase().includes('IMMO')) ? (
                            // Mode IMMO (IMMOB, IMMO_CHARGE, etc.) - Afficher une seule anomalie par compte avec navigation
                            anomalies.length > 0 ? (
                                <Box sx={{ maxHeight: 700, overflowY: 'auto' }}>
                                    {(() => {
                                        // Récupérer toutes les anomalies pour le compte courant
                                        const currentCompte = immobComptesList[immobSafeCompteIndex];
                                        const currentAnomalies = anomalies.filter(a =>
                                            a.compteNum === currentCompte ||
                                            a.journalLines?.[0]?.comptegen === currentCompte ||
                                            a.compte === currentCompte
                                        );

                                        if (currentAnomalies.length === 0) return <Alert severity="info">Aucune anomalie pour le compte {currentCompte}</Alert>;

                                        const isImmoCharge = String(currentItem?.Type).toUpperCase() === 'IMMO_CHARGE';
                                        const allValidatedForCompte = currentAnomalies.every(a => a.valide);

                                        return (
                                            <Box>
                                                {/* Navigation entre anomalies du même compte */}
                                                {/* {currentAnomalies.length > 1 && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1976d2' }}>
                                                            Anomalies pour le compte {currentCompte}:
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label={`${currentAnomalies.length} anomalies`}
                                                            color="primary"
                                                        />
                                                    </Box>
                                                )} */}

                                                {isImmoCharge && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                        <Alert severity="warning" sx={{ flex: 1, fontSize: '0.85rem', py: 0.5 }}>
                                                            Actions pour le compte {currentCompte}
                                                        </Alert>
                                                        {/* <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => {
                                                                const allValidated = currentAnomalies.every(a => a.valide);
                                                                const anomaliesToProcess = allValidated ? currentAnomalies : currentAnomalies.filter(a => !a.valide);
                                                                handleOpenBatchConfirm(anomaliesToProcess, !allValidated);
                                                            }}
                                                            sx={{
                                                                ...buttonStyle,
                                                                backgroundColor: currentAnomalies.every(a => a.valide) ? '#d32f2f' : initial.auth_gradient_end,
                                                                color: 'white',
                                                                borderColor: currentAnomalies.every(a => a.valide) ? '#d32f2f' : initial.auth_gradient_end,
                                                                '&:hover': {
                                                                    backgroundColor: currentAnomalies.every(a => a.valide) ? '#b71c1c' : initial.auth_gradient_end,
                                                                },
                                                            }}
                                                        >
                                                            {currentAnomalies.every(a => a.valide) ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                        </Button> */}
                                                    </Box>
                                                )}

                                                {isImmoCharge ? (
                                                    // Mode IMMO_CHARGE - Un seul tableau avec toutes les lignes comme ATYPIQUE
                                                    (() => {
                                                        // Construire la liste de toutes les lignes avec leur anomalie associée
                                                        const allLinesWithAnomaly = [];
                                                        currentAnomalies.forEach(anomaly => {
                                                            if (Array.isArray(anomaly.journalLines)) {
                                                                anomaly.journalLines.forEach(line => {
                                                                    allLinesWithAnomaly.push({
                                                                        ...line,
                                                                        _anomaly: anomaly
                                                                    });
                                                                });
                                                            }
                                                        });

                                                        if (allLinesWithAnomaly.length === 0) {
                                                            return <Alert severity="info">Aucune ligne pour ce compte</Alert>;
                                                        }

                                                        return (
                                                            <TableContainer component={Paper} variant="outlined">
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                                            <TableCell sx={tableStyles.headCell}>Date</TableCell>
                                                                            <TableCell sx={tableStyles.headCell}>Compte</TableCell>
                                                                            <TableCell sx={tableStyles.headCell}>Pièce</TableCell>
                                                                            <TableCell sx={tableStyles.headCell}>Libellé</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, textAlign: "right", fontSize: '0.85rem' }}>Débit</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, textAlign: "right", fontSize: '0.85rem' }}>Crédit</TableCell>
                                                                            <TableCell sx={tableStyles.headCell}>Lettrage</TableCell>
                                                                            <TableCell sx={tableStyles.headCell}>Analytique</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.85rem' }}>Validé</TableCell>
                                                                            <TableCell sx={tableStyles.headCell}>Commentaire</TableCell>
                                                                            <TableCell sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.85rem' }}>Action</TableCell>
                                                                        </TableRow>

                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {allLinesWithAnomaly.map((line, lineIdx) => {
                                                                            const relatedAnomaly = line._anomaly;
                                                                            return (
                                                                                <TableRow key={line?.id || lineIdx} hover>
                                                                                    <TableCell>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                                    <TableCell>{line?.comptegen || line?.compteaux || '-'}</TableCell>
                                                                                    <TableCell>{line?.piece || '-'}</TableCell>
                                                                                    <TableCell>{line?.libelle || '-'}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "right" }}>{line?.debit ? formatMontant(line.debit) : "-"}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "right" }}>{line?.credit ? formatMontant(line.credit) : "-"}</TableCell>
                                                                                    <TableCell>{line?.lettrage || '-'}</TableCell>
                                                                                    <TableCell>{line?.analytique || '-'}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                                        <Chip
                                                                                            label={relatedAnomaly?.valide ? "Oui" : "Non"}
                                                                                            color={relatedAnomaly?.valide ? "success" : "error"}
                                                                                            size="small"
                                                                                            sx={tableStyles.headCell}
                                                                                        />
                                                                                    </TableCell>

                                                                                    <TableCell>{relatedAnomaly?.commentaire || '-'}</TableCell>
                                                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                                                                            <IconButton
                                                                                                variant="outlined"
                                                                                                size="small"
                                                                                                onClick={() => relatedAnomaly && handleCommentAnomaly(relatedAnomaly)}
                                                                                                sx={{
                                                                                                    borderColor: '#1203e0ff'
                                                                                                }}
                                                                                            >
                                                                                                <EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} />
                                                                                            </IconButton>
                                                                                            <Button
                                                                                                variant="contained"
                                                                                                size="small"
                                                                                                onClick={() => relatedAnomaly && handleToggleValidateAnomaly(relatedAnomaly)}
                                                                                                sx={{
                                                                                                    ...buttonStyle,
                                                                                                    minWidth: 100,
                                                                                                    backgroundColor: initial.auth_gradient_end,
                                                                                                    color: 'white',
                                                                                                    borderColor: initial.auth_gradient_end,
                                                                                                    '&:hover': {
                                                                                                        backgroundColor: initial.auth_gradient_end,
                                                                                                    },
                                                                                                }}
                                                                                            >
                                                                                                {relatedAnomaly?.valide ? 'Annuler' : 'Valider'}
                                                                                            </Button>

                                                                                        </Stack>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        );
                                                    })()
                                                ) : (
                                                    // Mode IMMO standard - Affichage par anomalie
                                                    currentAnomalies.map((currentAnomaly, idx) => (
                                                        <Box key={currentAnomaly.id || idx} sx={{ mb: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                                <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                                    {currentAnomaly.message || 'Anomalie'}
                                                                </Alert>
                                                                <>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={() => handleToggleValidateAnomaly(currentAnomaly)}
                                                                        sx={{
                                                                            ...buttonStyle,
                                                                            backgroundColor: initial.auth_gradient_end,
                                                                            color: 'white',
                                                                            borderColor: initial.auth_gradient_end,
                                                                            '&:hover': {
                                                                                backgroundColor: initial.auth_gradient_end,
                                                                                none: 'none',
                                                                            },
                                                                            '&.Mui-disabled': {
                                                                                backgroundColor: initial.auth_gradient_end,
                                                                                color: 'white',
                                                                                cursor: 'not-allowed',
                                                                            },
                                                                        }}
                                                                    >
                                                                        {currentAnomaly.valide ? 'Annuler' : 'Valider'}
                                                                    </Button>
                                                                    <IconButton
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={() => handleCommentAnomaly(currentAnomaly)}
                                                                        sx={{
                                                                            borderColor: '#1203e0ff'
                                                                        }}
                                                                    >
                                                                        <EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} />
                                                                    </IconButton>
                                                                </>
                                                            </Box>

                                                            {/* Tableau des lignes de l'anomalie courante */}
                                                            {currentAnomaly.journalLines?.length > 0 ? (
                                                                <TableContainer component={Paper} variant="outlined">
                                                                    <Table size="small">
                                                                        <TableHead>
                                                                            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                                                <TableCell sx={tableStyles.headCell}>Date</TableCell>
                                                                                <TableCell sx={tableStyles.headCell}>Compte</TableCell>
                                                                                <TableCell sx={tableStyles.headCell}>Pièce</TableCell>
                                                                                <TableCell sx={tableStyles.headCell}>Libellé</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700, textAlign: "right", fontSize: '0.85rem' }}>Débit</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700, textAlign: "right", fontSize: '0.85rem' }}>Crédit</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.85rem' }}>Validé</TableCell>
                                                                                <TableCell sx={tableStyles.headCell}>Commentaire</TableCell>
                                                                                <TableCell sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.85rem' }}>Action</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>

                                                                        <TableBody>
                                                                            {currentAnomaly.journalLines.map((line, lineIdx) => (
                                                                                <TableRow key={line?.id || lineIdx} hover>
                                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.comptegen || line?.compteaux || '-'}</TableCell>
                                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.piece || '-'}</TableCell>
                                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{line?.libelle || '-'}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.debit ? formatMontant(line.debit) : "-"}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.credit ? formatMontant(line.credit) : "-"}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center", fontSize: '0.85rem' }}>
                                                                                        <Chip
                                                                                            label={currentAnomaly.valide ? "Oui" : "Non"}
                                                                                            color={currentAnomaly.valide ? "success" : "error"}
                                                                                            size="small"
                                                                                            sx={tableStyles.headCell}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{currentAnomaly.commentaire || '-'}</TableCell>
                                                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                                                            {(() => {
                                                                                                return (
                                                                                                    <Button
                                                                                                        variant="contained"
                                                                                                        size="small"
                                                                                                        onClick={() => handleValidateLine(line, currentAnomaly)}
                                                                                                        sx={{
                                                                                                            ...buttonStyle,
                                                                                                            backgroundColor: initial.auth_gradient_end,
                                                                                                            color: 'white',
                                                                                                            borderColor: initial.auth_gradient_end,
                                                                                                            '&:hover': {
                                                                                                                backgroundColor: initial.auth_gradient_end,
                                                                                                                none: 'none',
                                                                                                            },
                                                                                                            '&.Mui-disabled': {
                                                                                                                backgroundColor: initial.auth_gradient_end,
                                                                                                                color: 'white',
                                                                                                                cursor: 'not-allowed',
                                                                                                            },
                                                                                                        }}
                                                                                                    >
                                                                                                    </Button>
                                                                                                );
                                                                                            })()}
                                                                                            <IconButton
                                                                                                variant="outlined"
                                                                                                size="small"
                                                                                                onClick={() => handleCommentAnomaly(currentAnomaly)}
                                                                                                sx={{
                                                                                                    borderColor: '#1203e0ff'
                                                                                                }}
                                                                                            >
                                                                                                <EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} />
                                                                                            </IconButton>
                                                                                        </Box>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>
                                                            ) : (
                                                                <Alert severity="info">Aucune ligne pour cette anomalie</Alert>
                                                            )}
                                                        </Box>
                                                    ))
                                                )}
                                            </Box>
                                        );
                                    })()}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucune anomalie détectée pour ce contrôle</Alert>
                            )
                        ) : currentItem?.Type === 'ATYPIQUE' ? (
                            // Mode ATYPIQUE - Affichage paginé par compte avec tableau unique
                            anomalies.length > 0 ? (
                                <Box sx={{ maxHeight: 700, overflowY: 'auto' }}>
                                    {!atypiqueCurrentData ? null : (
                                        <Box>
                                            {(() => {
                                                const globalAnomaly = atypiqueCurrentData.anomalies?.[0];
                                                if (!globalAnomaly) return null;
                                                return (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                        <Alert severity="warning" sx={{ flex: 1, fontSize: '0.85rem', py: 0.5 }}>
                                                            {globalAnomaly.message || `Anomalie atypique (${atypiqueCurrentData.anomalies.length})`}
                                                        </Alert>
                                                        {/* <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => {
                                                                const allValidated = atypiqueCurrentData.anomalies.every(a => a.valide);
                                                                const anomaliesToProcess = allValidated ? atypiqueCurrentData.anomalies : atypiqueCurrentData.anomalies.filter(a => !a.valide);
                                                                handleOpenBatchConfirm(anomaliesToProcess, !allValidated);
                                                            }}
                                                            sx={{
                                                                ...buttonStyle,
                                                                backgroundColor: atypiqueCurrentData.anomalies.every(a => a.valide) ? '#d32f2f' : initial.auth_gradient_end,
                                                                color: 'white',
                                                                borderColor: atypiqueCurrentData.anomalies.every(a => a.valide) ? '#d32f2f' : initial.auth_gradient_end,
                                                                '&:hover': {
                                                                    backgroundColor: atypiqueCurrentData.anomalies.every(a => a.valide) ? '#b71c1c' : initial.auth_gradient_end,
                                                                },
                                                            }}
                                                        >
                                                            {atypiqueCurrentData.anomalies.every(a => a.valide) ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                                        </Button> */}
                                                    </Box>
                                                );
                                            })()}

                                            {/* Tableau unique avec toutes les lignes du compte courant */}
                                            {atypiqueCurrentData.allLines?.length > 0 ? (
                                                <Box>
                                                    <TableContainer component={Paper} variant="outlined">
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                                    <TableCell sx={tableStyles.headCell}>Date</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Compte</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Pièce</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Libellé</TableCell>
                                                                    <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Débit</TableCell>
                                                                    <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Crédit</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Lettrage</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Analytique</TableCell>
                                                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Validé</TableCell>
                                                                    <TableCell sx={tableStyles.headCell}>Commentaire</TableCell>
                                                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
                                                                </TableRow>

                                                            </TableHead>
                                                            <TableBody>
                                                                {atypiqueCurrentData.allLines.map((line, lineIdx) => {
                                                                    // Trouver l'anomalie associée à cette ligne
                                                                    const relatedAnomaly = atypiqueCurrentData.anomalies.find(a =>
                                                                        a.journalLines?.some(jl => jl.id === line.id)
                                                                    );
                                                                    return (
                                                                        <TableRow key={line?.id || lineIdx} hover>
                                                                            <TableCell sx={{ fontSize: '0.85rem' }}>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                            <TableCell sx={{ fontSize: '0.85rem' }}>{line?.comptegen || line?.compteaux || '-'}</TableCell>
                                                                            <TableCell sx={{ fontSize: '0.85rem' }}>{line?.piece || '-'}</TableCell>
                                                                            <TableCell sx={{ fontSize: '0.85rem' }}>{line?.libelle || '-'}</TableCell>
                                                                            <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.debit ? formatMontant(line.debit) : "-"}</TableCell>
                                                                            <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.credit ? formatMontant(line.credit) : "-"}</TableCell>
                                                                            <TableCell sx={{ fontSize: '0.85rem' }}>{line?.lettrage || '-'}</TableCell>
                                                                            <TableCell sx={{ fontSize: '0.85rem' }}>{line?.analytique || '-'}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center", fontSize: '0.85rem' }}>
                                                                                <Chip
                                                                                    label={relatedAnomaly?.valide ? "Oui" : "Non"}
                                                                                    color={relatedAnomaly?.valide ? "success" : "error"}
                                                                                    size="small"
                                                                                    sx={tableStyles.headCell}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>{relatedAnomaly?.commentaire || '-'}</TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>
                                                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                                                    <IconButton
                                                                                        variant="outlined"
                                                                                        size="small"
                                                                                        disabled={!relatedAnomaly}
                                                                                        onClick={() => relatedAnomaly && handleCommentAnomaly(relatedAnomaly)}
                                                                                        sx={{
                                                                                            borderColor: '#1203e0ff'
                                                                                        }}
                                                                                    >
                                                                                        <EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} />
                                                                                    </IconButton>

                                                                                    <Button
                                                                                        variant="contained"
                                                                                        size="small"
                                                                                        disabled={!relatedAnomaly}
                                                                                        onClick={() => relatedAnomaly && handleToggleValidateAnomaly(relatedAnomaly)}
                                                                                        sx={{
                                                                                            ...buttonStyle,
                                                                                            minWidth: 100,
                                                                                            backgroundColor: initial.auth_gradient_end,
                                                                                            color: 'white',
                                                                                            borderColor: initial.auth_gradient_end,
                                                                                            '&:hover': {
                                                                                                backgroundColor: initial.auth_gradient_end,
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        {relatedAnomaly?.valide ? 'Annuler' : 'Valider'}
                                                                                    </Button>
                                                                                </Stack>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Box>
                                            ) : (
                                                <Alert severity="info">Aucune ligne pour ce compte</Alert>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Alert severity="success">Aucun montant atypique détecté</Alert>
                            )
                        ) : anomalies.length > 0 ? (
                            // Mode par défaut (autres types)
                            <Box sx={{ maxHeight: 700, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {anomalies.map((anomalie) => (
                                    <Box key={anomalie.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Alert severity="warning" sx={{ flex: 1, fontSize: '0.9rem' }}>
                                                {anomalie.message || 'Anomalie'}
                                            </Alert>
                                            {/* <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleToggleValidateAnomaly(anomalie)}
                                                sx={{
                                                    ...buttonStyle,
                                                    backgroundColor: initial.auth_gradient_end,
                                                    color: 'white',
                                                    borderColor: initial.auth_gradient_end,
                                                    '&:hover': {
                                                        backgroundColor: initial.auth_gradient_end,
                                                        none: 'none',
                                                    },
                                                    '&.Mui-disabled': {
                                                        backgroundColor: initial.auth_gradient_end,
                                                        color: 'white',
                                                        cursor: 'not-allowed',
                                                    },
                                                }}
                                            >
                                                {anomalie.valide ? 'Tout annuler le compte' : 'Tout valider le compte'}
                                            </Button> */}
                                        </Box>

                                        {anomalie.journalLines?.length > 0 ? (
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                            <TableCell sx={tableStyles.headCell}>Date</TableCell>
                                                            <TableCell sx={tableStyles.headCell}>Compte</TableCell>
                                                            <TableCell sx={tableStyles.headCell}>Pièce</TableCell>
                                                            <TableCell sx={tableStyles.headCell}>Libellé</TableCell>
                                                            <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Débit</TableCell>
                                                            <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Crédit</TableCell>
                                                            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Validé</TableCell>
                                                            <TableCell sx={tableStyles.headCell}>Commentaire</TableCell>
                                                            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
                                                        </TableRow>
                                                    </TableHead>

                                                    <TableBody>
                                                        {anomalie.journalLines.map((line, idx) => (
                                                            <TableRow key={idx} hover>
                                                                <TableCell sx={{ fontSize: '0.85rem' }}>{line?.dateecriture ? new Date(line.dateecriture).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                                <TableCell sx={{ fontSize: '0.85rem' }}>{line?.comptegen || line?.compteaux || '-'}</TableCell>
                                                                <TableCell sx={{ fontSize: '0.85rem' }}>{line?.piece || '-'}</TableCell>
                                                                <TableCell sx={{ fontSize: '0.85rem' }}>{line?.libelle || '-'}</TableCell>
                                                                <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.debit ? formatMontant(line.debit) : "-"}</TableCell>
                                                                <TableCell sx={{ textAlign: "right", fontSize: '0.85rem' }}>{line?.credit ? formatMontant(line.credit) : "-"}</TableCell>
                                                                <TableCell sx={{ textAlign: "center", fontSize: '0.85rem' }}>
                                                                    <Chip
                                                                        label={anomalie.valide ? "Oui" : "Non"}
                                                                        color={anomalie.valide ? "success" : "error"}
                                                                        size="small"
                                                                        sx={tableStyles.headCell}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{anomalie.commentaire || '-'}</TableCell>
                                                                <TableCell sx={{ textAlign: 'center' }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                                        {(() => {
                                                                            return (
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    onClick={() => handleValidateLine(line, anomalie)}
                                                                                    sx={{
                                                                                        ...buttonStyle,
                                                                                        backgroundColor: initial.auth_gradient_end,
                                                                                        color: 'white',
                                                                                        borderColor: initial.auth_gradient_end,
                                                                                        '&:hover': {
                                                                                            backgroundColor: initial.auth_gradient_end,
                                                                                            none: 'none',
                                                                                        },
                                                                                        '&.Mui-disabled': {
                                                                                            backgroundColor: initial.auth_gradient_end,
                                                                                            color: 'white',
                                                                                            cursor: 'not-allowed',
                                                                                        },
                                                                                    }}
                                                                                >
                                                                                </Button>
                                                                            );
                                                                        })()}
                                                                        <IconButton
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => handleCommentAnomaly(anomalie)}
                                                                            sx={{
                                                                                borderColor: '#1203e0ff'
                                                                            }}
                                                                        >
                                                                            <EditNoteIcon fontSize="small" sx={{ color: '#1203e0ff' }} />
                                                                        </IconButton>
                                                                    </Box>
                                                                </TableCell>
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

            {/* POPUP DE CONFIRMATION POUR VALIDATION */}
            {
                (confirmPopup.open || confirmPopup.action) && (
                    <PopupActionConfirm
                        msg={
                            confirmPopup.action === 'valider_tout'
                                ? `Voulez-vous vraiment valider tous les anomalies ?`
                                : confirmPopup.action === 'annuler_tout'
                                    ? `Voulez-vous vraiment annuler la validation de tous les anomalies ?`
                                    : confirmPopup.action === 'valider_ligne'
                                        ? `Voulez-vous valider cette ligne ?`
                                        : confirmPopup.action === 'annuler_ligne'
                                            ? `Voulez-vous annuler la validation de cette ligne ?`
                                            : confirmPopup.action === 'valider'
                                                ? `Voulez-vous valider cette anomalie ?`
                                                : `Voulez-vous annuler la validation de cette anomalie ?`
                        }
                        confirmationState={handleConfirmValidation}
                        isLoading={confirmLoading}
                    />
                )
            }

            {/* DIALOG POUR COMMENTAIRE */}
            {/* {console.log('Dialog render - commentDialog.open:', commentDialog.open, 'line:', commentDialog.line)} */}
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
                <DialogActions sx={{ gap: 0, padding: '8px 24px' }}>
                    <Button
                        onClick={handleCloseCommentDialog}
                        color="primary"
                        sx={{
                            ...buttonStyle,
                            backgroundColor: initial.annuler_bouton_color,
                            color: 'white',
                            borderColor: initial.annuler_bouton_color,
                            '&:hover': {
                                backgroundColor: initial.annuler_bouton_color,
                                none: 'none',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: initial.annuler_bouton_color,
                                color: 'white',
                                cursor: 'not-allowed',
                            },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={commentDialog.line ? handleSaveLineComment : handleSaveCommentDialog}
                        color="primary"
                        variant="contained"
                        sx={{
                            ...buttonStyle,
                            backgroundColor: initial.auth_gradient_end,
                            color: 'white',
                            borderColor: initial.auth_gradient_end,
                            '&:hover': {
                                backgroundColor: initial.auth_gradient_end,
                                border: 'none',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: initial.auth_gradient_end,
                                color: 'white',
                                cursor: 'not-allowed',
                            },
                        }}
                    >
                        Sauvegarder
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper >
    );
};