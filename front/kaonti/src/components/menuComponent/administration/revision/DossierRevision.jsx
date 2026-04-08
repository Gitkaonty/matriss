import React, { useEffect, useMemo, useState } from 'react';

import {
    Box, Typography, Stack, Paper, TextField,
    List, ListItemButton, ListItemText, ListItemIcon,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    ToggleButtonGroup, ToggleButton, alpha, Tabs, Tab, Divider, Drawer, IconButton, Button,
    LinearProgress,
    FormControl, Select, MenuItem, Checkbox
} from '@mui/material';

import {
    CalendarMonth, Verified, Edit, Delete,
    Comment, Close, Save, PieChart, FiberManualRecord
} from '@mui/icons-material';

import ExercicePeriodeSelector from '../../../componentsTools/ExercicePeriodeSelector/ExercicePeriodeSelector';

import {
    RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis
} from 'recharts';

import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';

const DossierTravailPage = () => {
    const axiosPrivate = useAxiosPrivate();

    const [activeCycle, setActiveCycle] = useState("etat d'avancement");
    const [activeTab, setActiveTab] = useState(0);
    const [answers, setAnswers] = useState({});
    const [validatedRows, setValidatedRows] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);

    const [selectedExerciceId, setSelectedExerciceId] = useState('');
    const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
    const [loading, setLoading] = useState(false);

    const [revisionCycles, setRevisionCycles] = useState([]);
    const [cyclesLoading, setCyclesLoading] = useState(false);
    const [cycleItems, setCycleItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [revisions, setRevisions] = useState({}); // Stocke les révisions par code
    const [commentText, setCommentText] = useState('');
    const [savingComment, setSavingComment] = useState(false);
    const [commentairesSynthese, setCommentairesSynthese] = useState([]);
    const [loadingCommentaires, setLoadingCommentaires] = useState(false);
    const [nouveauCommentaire, setNouveauCommentaire] = useState('');
    const [savingNouveauCommentaire, setSavingNouveauCommentaire] = useState(false);
    const [editingCommentaire, setEditingCommentaire] = useState(null);
    const [editCommentaireText, setEditCommentaireText] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [synthese, setSynthese] = useState({ progression: 0, points: 0 });
    const [loadingSynthese, setLoadingSynthese] = useState(false);

    const [planComptable, setPlanComptable] = useState([]);
    const [loadingPlanComptable, setLoadingPlanComptable] = useState(false);
    const [compteAssocieSelection, setCompteAssocieSelection] = useState([]);
    const [compteAssocieSaved, setCompteAssocieSaved] = useState([]);
    const [savingCompteAssocie, setSavingCompteAssocie] = useState(false);

    const K_THEME = {
        navy: '#0f172a',
        cyan: '#06b6d4',
        slate: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#f43f5e',
        bg: '#f8fafc',
        radius: '4px'
    };

    const handleValidation = (id) => {
        setValidatedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Sauvegarder le statut (OUI/NON/NA)
    const handleStatutChange = async (code, statut) => {
        const id_compte = parseInt(sessionStorage.getItem('compteId')) || 1;
        const id_dossier = parseInt(sessionStorage.getItem('fileId')) || 1;
        const id_exercice = parseInt(selectedExerciceId) || 0;
        const id_periode = parseInt(selectedPeriodeId) || 0;

        if (!id_exercice || !id_periode) {
            console.warn('Exercice ou période non sélectionné');
            return;
        }

        // Mettre à jour l'UI immédiatement
        setRevisions(prev => ({
            ...prev,
            [code]: { ...prev[code], statut }
        }));

        try {
            await axiosPrivate.post('/administration/dossierRevision/statut', {
                id_compte,
                id_dossier,
                id_exercice,
                id_periode,
                id_code: code,
                statut
            });
        } catch (e) {
            console.error('Erreur sauvegarde statut:', e);
        }
    };

    // Sauvegarder le commentaire
    const handleSaveComment = async () => {
        if (!selectedPoint || !commentText.trim()) return;

        const id_compte = parseInt(sessionStorage.getItem('compteId')) || 1;
        const id_dossier = parseInt(sessionStorage.getItem('fileId')) || 1;
        const id_exercice = parseInt(selectedExerciceId) || 0;
        const id_periode = parseInt(selectedPeriodeId) || 0;

        if (!id_exercice || !id_periode) {
            console.warn('Exercice ou période non sélectionné');
            return;
        }

        // Trouver le code correspondant au questionnaire
        const item = cycleItems.find(i => i.questionnaire === selectedPoint);
        if (!item) return;

        setSavingComment(true);
        try {
            await axiosPrivate.post('/administration/dossierRevision/commentaire', {
                id_compte,
                id_dossier,
                id_exercice,
                id_periode,
                id_code: item.code,
                commentaire: commentText
            });

            // Mettre à jour l'état local
            setRevisions(prev => ({
                ...prev,
                [item.code]: { ...prev[item.code], commentaire: commentText }
            }));

            setDrawerOpen(false);
            setCommentText('');
        } catch (e) {
            console.error('Erreur sauvegarde commentaire:', e);
        } finally {
            setSavingComment(false);
        }
    };

    const openCommentDrawer = (questionnaire) => {
        const item = cycleItems.find(i => i.questionnaire === questionnaire);
        if (item) {
            setSelectedPoint(questionnaire);
            setCommentText(revisions[item.code]?.commentaire || '');
            setDrawerOpen(true);
        }
    };

    // Sauvegarder un nouveau commentaire de synthèse
    const handleSaveNouveauCommentaire = async () => {
        if (!nouveauCommentaire.trim()) return;

        const id_compte = parseInt(sessionStorage.getItem('compteId')) || 1;
        const id_dossier = parseInt(sessionStorage.getItem('fileId')) || 1;
        const id_exercice = parseInt(selectedExerciceId) || 0;
        const id_periode = parseInt(selectedPeriodeId) || 0;

        if (!id_exercice || !id_periode || activeCycle === "etat d'avancement") {
            console.warn('Exercice, période ou cycle non sélectionné');
            return;
        }

        setSavingNouveauCommentaire(true);
        try {
            const res = await axiosPrivate.post('/administration/dossierRevision/commentaires', {
                id_compte,
                id_dossier,
                id_exercice,
                id_periode,
                cycle: activeCycle.toUpperCase(),
                commentaire: nouveauCommentaire
            });

            if (res.data.state) {
                // Ajouter le nouveau commentaire à la liste
                setCommentairesSynthese(prev => [res.data.commentaire, ...prev]);
                setNouveauCommentaire('');
            }
        } catch (e) {
            console.error('Erreur sauvegarde commentaire synthèse:', e);
        } finally {
            setSavingNouveauCommentaire(false);
        }
    };

    // Démarrer l'édition d'un commentaire
    const handleStartEdit = (comm) => {
        setEditingCommentaire(comm.id);
        setEditCommentaireText(comm.commentaire);
    };

    // Sauvegarder la modification d'un commentaire
    const handleSaveEdit = async () => {
        if (!editCommentaireText.trim() || !editingCommentaire) return;

        setSavingEdit(true);
        try {
            const res = await axiosPrivate.put(`/administration/dossierRevision/commentaires/${editingCommentaire}`, {
                commentaire: editCommentaireText
            });

            if (res.data.state) {
                // Mettre à jour le commentaire dans la liste
                setCommentairesSynthese(prev => prev.map(c =>
                    c.id === editingCommentaire
                        ? { ...c, commentaire: editCommentaireText, updatedAt: new Date().toISOString() }
                        : c
                ));
                setEditingCommentaire(null);
                setEditCommentaireText('');
            }
        } catch (e) {
            console.error('Erreur modification commentaire:', e);
        } finally {
            setSavingEdit(false);
        }
    };

    // Annuler l'édition
    const handleCancelEdit = () => {
        setEditingCommentaire(null);
        setEditCommentaireText('');
    };

    // Supprimer un commentaire
    const handleDeleteCommentaire = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

        setDeletingId(id);
        try {
            const res = await axiosPrivate.delete(`/administration/dossierRevision/commentaires/${id}`);

            if (res.data.state) {
                // Retirer le commentaire de la liste
                setCommentairesSynthese(prev => prev.filter(c => c.id !== id));
            }
        } catch (e) {
            console.error('Erreur suppression commentaire:', e);
        } finally {
            setDeletingId(null);
        }
    };

    const handleChangeExercice = (exerciceId) => {
        setSelectedExerciceId(exerciceId);
    };

    const handleChangePeriode = (periodeId) => {
        setSelectedPeriodeId(periodeId);
    };

    useEffect(() => {
        let mounted = true;

        const fetchCycles = async () => {
            try {
                setCyclesLoading(true);
                const res = await axiosPrivate.get('/administration/revision/cycles');
                const cycles = res?.data?.cycles;
                if (mounted) {
                    setRevisionCycles(Array.isArray(cycles) ? cycles : []);
                }
            } catch (e) {
                if (mounted) {
                    setRevisionCycles([]);
                }
            } finally {
                if (mounted) {
                    setCyclesLoading(false);
                }
            }
        };

        fetchCycles();
        return () => {
            mounted = false;
        };
    }, [axiosPrivate]);

    useEffect(() => {
        let mounted = true;

        const fetchItems = async () => {
            if (activeCycle === "etat d'avancement" || !activeCycle) {
                setCycleItems([]);
                return;
            }
            try {
                setItemsLoading(true);
                const cycleUpper = activeCycle.toUpperCase();
                const res = await axiosPrivate.get(`/administration/revision/cycles/${encodeURIComponent(cycleUpper)}/items`);
                const items = res?.data?.items;
                if (mounted) {
                    setCycleItems(Array.isArray(items) ? items : []);
                }
            } catch (e) {
                if (mounted) {
                    setCycleItems([]);
                }
            } finally {
                if (mounted) {
                    setItemsLoading(false);
                }
            }
        };

        fetchItems();
        return () => {
            mounted = false;
        };
    }, [activeCycle, axiosPrivate]);

    // Charger les révisions existantes quand le contexte change
    useEffect(() => {
        let mounted = true;

        const fetchRevisions = async () => {
            if (!selectedExerciceId || !selectedPeriodeId) {
                setRevisions({});
                return;
            }

            const id_compte = parseInt(sessionStorage.getItem('compteId')) || 1;
            const id_dossier = parseInt(sessionStorage.getItem('fileId')) || 1;

            try {
                const res = await axiosPrivate.get(
                    `/administration/dossierRevision/${id_compte}/${id_dossier}/${selectedExerciceId}/${selectedPeriodeId}`
                );
                const revs = res?.data?.revisions || [];

                // Transformer en objet indexé par id_code
                const revsByCode = {};
                revs.forEach(r => {
                    revsByCode[r.id_code] = r;
                });

                if (mounted) {
                    setRevisions(revsByCode);
                }
            } catch (e) {
                if (mounted) {
                    setRevisions({});
                }
            }
        };

        fetchRevisions();
        return () => {
            mounted = false;
        };
    }, [selectedExerciceId, selectedPeriodeId, axiosPrivate]);

    // Charger les commentaires de synthèse quand le cycle ou le contexte change
    useEffect(() => {
        let mounted = true;

        const fetchCommentairesSynthese = async () => {
            if (!selectedExerciceId || !selectedPeriodeId || activeCycle === "etat d'avancement" || !activeCycle) {
                setCommentairesSynthese([]);
                return;
            }

            const id_compte = parseInt(sessionStorage.getItem('compteId')) || 1;
            const id_dossier = parseInt(sessionStorage.getItem('fileId')) || 1;
            const cycle = activeCycle.toUpperCase();

            try {
                setLoadingCommentaires(true);
                const res = await axiosPrivate.get(
                    `/administration/dossierRevision/commentaires/${id_compte}/${id_dossier}/${selectedExerciceId}/${selectedPeriodeId}/${cycle}`
                );
                const commentaires = res?.data?.commentaires || [];

                if (mounted) {
                    setCommentairesSynthese(commentaires);
                }
            } catch (e) {
                if (mounted) {
                    setCommentairesSynthese([]);
                }
            } finally {
                if (mounted) {
                    setLoadingCommentaires(false);
                }
            }
        };

        fetchCommentairesSynthese();
        return () => {
            mounted = false;
        };
    }, [activeCycle, selectedExerciceId, selectedPeriodeId, axiosPrivate]);

    // Charger la synthèse (progression et points de vigilance) quand le cycle change
    useEffect(() => {
        let mounted = true;

        const fetchSynthese = async () => {
            if (!selectedExerciceId || !selectedPeriodeId || activeCycle === "etat d'avancement" || !activeCycle) {
                setSynthese({ progression: 0, points: 0 });
                return;
            }

            const id_compte = parseInt(sessionStorage.getItem('compteId')) || 1;
            const id_dossier = parseInt(sessionStorage.getItem('fileId')) || 1;
            const cycle = activeCycle.toUpperCase();

            try {
                setLoadingSynthese(true);
                const res = await axiosPrivate.get(
                    `/administration/dossierRevision/synthese/${id_compte}/${id_dossier}/${selectedExerciceId}/${selectedPeriodeId}/${cycle}`
                );
                const data = res?.data?.synthese;

                if (mounted && data) {
                    setSynthese({
                        progression: data.progression || 0,
                        points: data.points || 0
                    });
                }
            } catch (e) {
                if (mounted) {
                    setSynthese({ progression: 0, points: 0 });
                }
            } finally {
                if (mounted) {
                    setLoadingSynthese(false);
                }
            }
        };
        fetchSynthese();
        return () => {
            mounted = false;
        };
    }, [activeCycle, selectedExerciceId, selectedPeriodeId, axiosPrivate, revisions]);

    useEffect(() => {
        let mounted = true;

        const fetchPlanComptable = async () => {
            const compteId = parseInt(sessionStorage.getItem('compteId')) || 0;
            const fileId = parseInt(sessionStorage.getItem('fileId')) || 0;

            if (!compteId || !fileId) {
                if (mounted) {
                    setPlanComptable([]);
                }
                return;
            }

            try {
                setLoadingPlanComptable(true);
                const res = await axiosPrivate.get(`/paramPlanComptable/PcIdLibelle/${compteId}/${fileId}`);
                const liste = res?.data?.state ? res?.data?.liste : [];

                if (mounted) {
                    setPlanComptable(Array.isArray(liste) ? liste : []);
                }
            } catch (e) {
                if (mounted) {
                    setPlanComptable([]);
                }
            } finally {
                if (mounted) {
                    setLoadingPlanComptable(false);
                }
            }
        };

        fetchPlanComptable();
        return () => {
            mounted = false;
        };
    }, [axiosPrivate]);

    useEffect(() => {
        let mounted = true;

        const fetchCompteAssocie = async () => {
            if (!selectedExerciceId || !selectedPeriodeId || activeCycle === "etat d'avancement" || !activeCycle) {
                setCompteAssocieSelection([]);
                setCompteAssocieSaved([]);
                return;
            }

            const id_compte = parseInt(sessionStorage.getItem('compteId')) || 1;
            const id_dossier = parseInt(sessionStorage.getItem('fileId')) || 1;
            const cycle = activeCycle.toUpperCase();

            try {
                const res = await axiosPrivate.get(
                    `/administration/dossierRevision/compte-associe/${id_compte}/${id_dossier}/${selectedExerciceId}/${selectedPeriodeId}/${cycle}`
                );
                const raw = res?.data?.compte_associe;
                const parsed = raw
                    ? String(raw)
                        .split(';')
                        .map(s => s.trim())
                        .filter(Boolean)
                    : [];

                if (mounted) {
                    setCompteAssocieSelection(parsed);
                    setCompteAssocieSaved(parsed);
                }
            } catch (e) {
                if (mounted) {
                    setCompteAssocieSelection([]);
                    setCompteAssocieSaved([]);
                }
            }
        };

        fetchCompteAssocie();
        return () => {
            mounted = false;
        };
    }, [activeCycle, selectedExerciceId, selectedPeriodeId, axiosPrivate]);

    const handleSaveCompteAssocie = async () => {
        const id_compte = parseInt(sessionStorage.getItem('compteId')) || 1;
        const id_dossier = parseInt(sessionStorage.getItem('fileId')) || 1;
        const id_exercice = parseInt(selectedExerciceId) || 0;
        const id_periode = parseInt(selectedPeriodeId) || 0;

        if (!id_exercice || !id_periode || activeCycle === "etat d'avancement") {
            console.warn('Exercice, période ou cycle non sélectionné');
            return;
        }

        const payloadValue = compteAssocieSelection.length ? compteAssocieSelection.join(';') : null;
        if (payloadValue !== null && String(payloadValue).length > 255) {
            console.warn('compte_associe trop long (max 255 caractères)');
            return;
        }

        setSavingCompteAssocie(true);
        try {
            const res = await axiosPrivate.post('/administration/dossierRevision/compte-associe', {
                id_compte,
                id_dossier,
                id_exercice,
                id_periode,
                cycle: activeCycle.toUpperCase(),
                compte_associe: payloadValue
            });

            const raw = res?.data?.compte_associe;
            const parsed = raw
                ? String(raw)
                    .split(';')
                    .map(s => s.trim())
                    .filter(Boolean)
                : [];

            setCompteAssocieSaved(parsed);
        } catch (e) {
            console.error('Erreur sauvegarde compte_associe:', e);
        } finally {
            setSavingCompteAssocie(false);
        }
    };

    const normalizedCycles = useMemo(() => {
        return (revisionCycles || [])
            .filter(Boolean)
            .map((c) => String(c).trim())
            .filter((c) => c.length > 0);
    }, [revisionCycles]);

    const menuCycles = useMemo(() => {
        return ["ETAT D'AVANCEMENT", ...normalizedCycles];
    }, [normalizedCycles]);

    const renderGeneralDashboard = () => {
        const allCycles = normalizedCycles.map((label) => ({
            label,
            progress: 0,
            color: K_THEME.slate,
        }));

        return (
            <Stack spacing={4}>
                <Typography sx={{ color: K_THEME.navy, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
                    KPI - ÉTAT D'AVANCEMENT GLOBAL DES CYCLES
                </Typography>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2
                }}>
                    {allCycles.map((item) => (
                        <Paper
                            key={item.label}
                            elevation={0}
                            sx={{
                                p: 2,
                                border: `1px solid ${K_THEME.border}`,
                                borderRadius: K_THEME.radius,
                                bgcolor: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: K_THEME.cyan,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    color: K_THEME.navy,
                                    textAlign: 'center',
                                    lineHeight: 1.2,
                                    height: '1.4rem',
                                    mb: 1
                                }}
                            >
                                {item.label}
                            </Typography>

                            <Box sx={{ width: 100, height: 100, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        innerRadius="80%"
                                        outerRadius="100%"
                                        data={[{ value: item.progress }]}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <PolarAngleAxis
                                            type="number"
                                            domain={[0, 100]}
                                            angleAxisId={0}
                                            tick={false}
                                        />

                                        <RadialBar
                                            background={{ fill: alpha(K_THEME.slate, 0.05) }}
                                            dataKey="value"
                                            cornerRadius={5}
                                            fill={item.color}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>

                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: K_THEME.navy }}>
                                        {item.progress}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Stack>
        );
    };

    const renderContent = () => {
        if (activeCycle === "etat d'avancement") return renderGeneralDashboard();

        switch (activeTab) {
            case 0:
                return (
                    <Stack spacing={4}>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{
                                flex: 1, p: 2, border: `1px solid ${K_THEME.navy}`,
                                background: 'radial-gradient(circle at 20% 30%, #2f4566 0%, #010810 100%)',
                                borderRadius: K_THEME.radius
                            }}>
                                <Typography sx={{ color: alpha('#fff', 0.6), fontSize: '0.7rem', fontWeight: 900, mb: 1 }}>PROGRESSION DU CYCLE</Typography>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography sx={{ color: '#fff', fontSize: '1.2rem', fontWeight: 900 }}>
                                        {loadingSynthese ? '...' : `${synthese.progression}%`}
                                    </Typography>
                                    <Verified sx={{ color: K_THEME.cyan }} />
                                </Stack>
                            </Box>
                            <Box sx={{ flex: 1, p: 2, border: `1px solid ${K_THEME.border}`, borderTop: `4px solid ${K_THEME.warning}`, borderRadius: K_THEME.radius, bgcolor: '#fff' }}>
                                <Typography sx={{ color: K_THEME.slate, fontSize: '0.7rem', fontWeight: 900, mb: 1 }}>POINTS DE VIGILANCE</Typography>
                                <Typography sx={{ color: K_THEME.navy, fontSize: '1.2rem', fontWeight: 900 }}>
                                    {loadingSynthese ? '...' : String(synthese.points).padStart(2, '0')}
                                </Typography>
                            </Box>
                        </Stack>

                        <Box sx={{ position: 'relative' }}>
                            <TextField
                                multiline
                                rows={4}
                                fullWidth
                                value={nouveauCommentaire}
                                onChange={(e) => setNouveauCommentaire(e.target.value)}
                                placeholder="Ajouter un nouveau commentaire technique..."
                                sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', borderRadius: K_THEME.radius, bgcolor: '#fff', pb: 6 } }}
                            />
                            <Button
                                startIcon={<Save />}
                                variant="contained"
                                onClick={handleSaveNouveauCommentaire}
                                disabled={savingNouveauCommentaire || !nouveauCommentaire.trim()}
                                sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: K_THEME.navy, color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}
                            >
                                {savingNouveauCommentaire ? 'ENREGISTREMENT...' : 'SAUVEGARDER'}
                            </Button>
                        </Box>
                        <Box>
                            <Typography sx={{ color: K_THEME.navy, fontWeight: 900, fontSize: '0.75rem', mb: 2 }}>HISTORIQUE DES NOTES</Typography>
                            <Stack spacing={2} sx={{ mb: 3 }}>
                                {loadingCommentaires ? (
                                    <Typography sx={{ fontSize: '0.75rem', color: K_THEME.slate, textAlign: 'center', py: 2 }}>Chargement...</Typography>
                                ) : commentairesSynthese.length === 0 ? (
                                    <Typography sx={{ fontSize: '0.75rem', color: K_THEME.slate, textAlign: 'center', py: 2 }}>Aucun commentaire pour ce cycle</Typography>
                                ) : (
                                    commentairesSynthese.map((comm, idx) => (
                                        <Box key={comm.id || idx} sx={{ p: 2, bgcolor: '#fff', border: `1px solid ${K_THEME.border}`, borderRadius: K_THEME.radius, position: 'relative' }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: K_THEME.cyan }}>RÉVISEUR</Typography>
                                                <Typography sx={{ fontSize: '0.7rem', color: K_THEME.slate }}>{new Date(comm.createdAt).toLocaleDateString('fr-FR')}</Typography>
                                            </Stack>
                                            {editingCommentaire === comm.id ? (
                                                <Box sx={{ pr: 8 }}>
                                                    <TextField
                                                        multiline
                                                        rows={2}
                                                        fullWidth
                                                        value={editCommentaireText}
                                                        onChange={(e) => setEditCommentaireText(e.target.value)}
                                                        sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.75rem' } }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Typography sx={{ fontSize: '0.75rem', color: K_THEME.navy, pr: 8 }}>{comm.commentaire}</Typography>
                                            )}
                                            <Stack direction="row" sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                                                {editingCommentaire === comm.id ? (
                                                    <>
                                                        <IconButton
                                                            size="small"
                                                            onClick={handleCancelEdit}
                                                            disabled={savingEdit}
                                                        >
                                                            <Close sx={{ fontSize: '0.9rem' }} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={handleSaveEdit}
                                                            disabled={savingEdit || !editCommentaireText.trim()}
                                                        >
                                                            <Save sx={{ fontSize: '0.9rem' }} />
                                                        </IconButton>
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleStartEdit(comm)}
                                                            disabled={deletingId === comm.id}
                                                        >
                                                            <Edit sx={{ fontSize: '0.9rem' }} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteCommentaire(comm.id)}
                                                            disabled={deletingId === comm.id}
                                                        >
                                                            <Delete sx={{ fontSize: '0.9rem' }} />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </Stack>
                                        </Box>
                                    ))
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                );
            case 1:
                return (
                    <TableContainer sx={{ borderRadius: K_THEME.radius, border: `1px solid ${K_THEME.border}` }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: K_THEME.navy, color: '#fff', fontWeight: 900, fontSize: '0.65rem', py: 2 }}>TRAVAUX À RÉALISER</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: K_THEME.navy, color: '#fff', fontWeight: 900, fontSize: '0.65rem', width: 220 }}>STATUT</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: K_THEME.navy, color: '#fff', fontWeight: 900, fontSize: '0.65rem', width: 120 }}>NOTE</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cycleItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                            <Typography sx={{ color: K_THEME.slate, fontSize: '0.75rem' }}>
                                                {itemsLoading ? 'Chargement...' : 'Aucune diligence pour ce cycle'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cycleItems.map((item, i) => (
                                        <TableRow key={item.code || i}>
                                            <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: K_THEME.navy, py: 2 }}>
                                                {item.questionnaire}
                                            </TableCell>
                                            <TableCell align="center">
                                                <ToggleButtonGroup
                                                    value={revisions[item.code]?.statut || ''}
                                                    exclusive
                                                    onChange={(e, v) => {
                                                        if (v !== null) {
                                                            handleStatutChange(item.code, v);
                                                        }
                                                    }}
                                                    sx={{ height: 24, '& .MuiToggleButton-root': { borderRadius: K_THEME.radius, px: 1.5, fontSize: '0.55rem', fontWeight: 900, mx: 0.2, border: '1px solid transparent' } }}
                                                >
                                                    <ToggleButton value="OUI" sx={{ '&.Mui-selected': { bgcolor: alpha(K_THEME.success, 0.1), color: K_THEME.success, borderColor: K_THEME.success, '&:hover': { bgcolor: alpha(K_THEME.success, 0.2) } } }}>OUI</ToggleButton>
                                                    <ToggleButton value="NON" sx={{ '&.Mui-selected': { bgcolor: alpha(K_THEME.error, 0.1), color: K_THEME.error, borderColor: K_THEME.error, '&:hover': { bgcolor: alpha(K_THEME.error, 0.2) } } }}>NON</ToggleButton>
                                                    <ToggleButton value="NA" sx={{ '&.Mui-selected': { bgcolor: alpha(K_THEME.slate, 0.1), color: K_THEME.slate, borderColor: K_THEME.slate, '&:hover': { bgcolor: alpha(K_THEME.slate, 0.2) } } }}>NA</ToggleButton>
                                                </ToggleButtonGroup>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openCommentDrawer(item.questionnaire)}
                                                    sx={{
                                                        color: revisions[item.code]?.commentaire ? K_THEME.cyan : K_THEME.slate,
                                                        bgcolor: revisions[item.code]?.commentaire ? alpha(K_THEME.cyan, 0.1) : 'transparent'
                                                    }}
                                                >
                                                    <Comment sx={{ fontSize: '1.1rem' }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                );
            case 2:
                return (
                    <TableContainer sx={{ borderRadius: K_THEME.radius, border: `1px solid ${K_THEME.border}` }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {['DATE', 'COMPTE', 'LIBELLÉ', 'DÉBIT', 'CRÉDIT', 'VALIDÉ'].map((h) => (
                                        <TableCell key={h} align={h === 'VALIDÉ' ? 'center' : 'left'} sx={{ bgcolor: K_THEME.navy, color: '#fff', fontWeight: 900, fontSize: '0.65rem', py: 2 }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[101, 102, 103].map((id) => (
                                    <TableRow key={id} hover>
                                        <TableCell sx={{ fontSize: '0.7rem' }}>28/12/2022</TableCell>
                                        <TableCell sx={{ fontSize: '0.7rem', color: K_THEME.cyan, fontWeight: 900 }}>401000</TableCell>
                                        <TableCell sx={{ fontSize: '0.7rem' }}>LIBELLÉ OPÉRATION {id}</TableCell>
                                        <TableCell sx={{ fontSize: '0.7rem' }}>0.00</TableCell>
                                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 900 }}>1 000.00</TableCell>
                                        <TableCell align="center">
                                            <Box onClick={() => handleValidation(id)} sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: '20px', border: `1px solid ${validatedRows[id] ? K_THEME.cyan : K_THEME.border}`, bgcolor: validatedRows[id] ? alpha(K_THEME.cyan, 0.1) : 'transparent' }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: validatedRows[id] ? K_THEME.cyan : K_THEME.border }} />
                                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: validatedRows[id] ? K_THEME.navy : K_THEME.slate }}>{validatedRows[id] ? 'VÉRIFIÉ' : 'À CONTRÔLER'}</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                );
            default: return null;
        }
    };

    return (
        <Box sx={{ width: '97%', height: '100vh', bgcolor: '#fff', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 450, p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography sx={{ color: K_THEME.navy, fontWeight: 900, fontSize: '0.8rem' }}>NOTES DE RÉVISION</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
                    </Stack>
                    <TextField
                        multiline
                        rows={20}
                        fullWidth
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Saisissez votre commentaire..."
                    />
                    <Button
                        fullWidth
                        sx={{ mt: 2, bgcolor: K_THEME.navy, color: '#fff' }}
                        onClick={handleSaveComment}
                        disabled={savingComment}
                    >
                        {savingComment ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
                    </Button>
                </Box>
            </Drawer>

            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                        sx={{
                            p: 0.5,
                            border: `2px solid ${K_THEME.navy}`,
                            borderRadius: K_THEME.radius,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20
                        }}
                    >
                        <CalendarMonth sx={{ color: K_THEME.navy, fontSize: 16 }} />
                    </Box>
                    <Box>
                        <ExercicePeriodeSelector
                            selectedExerciceId={selectedExerciceId}
                            selectedPeriodeId={selectedPeriodeId}
                            onExerciceChange={handleChangeExercice}
                            onPeriodeChange={handleChangePeriode}
                            disabled={loading}
                            size="small"
                        />
                    </Box>
                </Stack>
                <Typography sx={{ color: K_THEME.cyan, fontWeight: 900, fontSize: '0.7rem' }}>KAONTI / REVISION / {activeCycle.toUpperCase()}</Typography>
            </Stack>

            <Divider sx={{ my: 1, bgcolor: K_THEME.navy, height: 2 }} />

            <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, overflow: 'hidden' }}>
                <Box sx={{ width: 260, overflowY: 'auto' }}>
                    <List sx={{ p: 0 }}>
                        {menuCycles.map((cycleName) => {
                            const isAvancement = cycleName === "ETAT D'AVANCEMENT";
                            const isActive = activeCycle === cycleName.toLowerCase();
                            return (
                                <ListItemButton
                                    key={cycleName}
                                    selected={isActive}
                                    onClick={() => { setActiveCycle(cycleName.toLowerCase()); setActiveTab(0); }}
                                    sx={{
                                        borderRadius: K_THEME.radius, mb: 0.1,
                                        ...(isAvancement ? {
                                            background: 'radial-gradient(circle at 10% 20%, #2f4566 0%, #010810 100%)',
                                            '& .MuiTypography-root': { color: '#fff' },
                                            '& .MuiListItemIcon-root': { color: K_THEME.cyan },
                                            '&:hover': { background: 'radial-gradient(circle at 10% 20%, #3d5a85 0%, #010810 100%)' }
                                        } : {
                                            '&.Mui-selected': { bgcolor: alpha(K_THEME.cyan, 0.05), borderLeft: `4px solid ${K_THEME.navy}` }
                                        })
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32, color: isActive ? K_THEME.cyan : K_THEME.slate }}>
                                        {React.cloneElement(isAvancement ? <PieChart /> : <FiberManualRecord />, { sx: { fontSize: '1.2rem' } })}
                                    </ListItemIcon>
                                    <ListItemText primary={cycleName} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 600 }} />
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Box>

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2.5, display: 'flex' }} >
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 2.5,
                                py: 1,
                                bgcolor: K_THEME.cyan,
                                borderRadius: K_THEME.radius,
                                boxShadow: `0 4px 12px ${alpha(K_THEME.cyan, 0.3)}`,
                                border: `1px solid ${alpha(K_THEME.navy, 0.1)}`
                            }}
                        >
                            <Typography
                                sx={{
                                    color: K_THEME.navy,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    mr: 1.5,
                                    letterSpacing: '1px',
                                    opacity: 0.8
                                }}
                            >
                                CYCLE :
                            </Typography>

                            <Typography
                                sx={{
                                    color: K_THEME.navy,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {activeCycle.toUpperCase()}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 2.5,
                                py: 1,
                                bgcolor: K_THEME.cyan,
                                borderRadius: K_THEME.radius,
                                boxShadow: `0 4px 12px ${alpha(K_THEME.cyan, 0.3)}`,
                                border: `1px solid ${alpha(K_THEME.navy, 0.1)}`,
                                ml: 2
                            }}
                        >
                            <Typography
                                sx={{
                                    color: K_THEME.navy,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    mr: 1.5,
                                    letterSpacing: '1px',
                                    opacity: 0.8
                                }}
                            >
                                COMPTE ASSOCIÉ :
                            </Typography>

                            <TextField
                                size="small"
                                placeholder="Ex: 401;407;53..."
                                value={compteAssocieSelection.join(';')}
                                onChange={(e) => {
                                    const text = e.target.value;
                                    // Remplacer les virgules par des points-virgules et nettoyer
                                    const cleaned = text
                                        .replace(/,/g, ';')
                                        .split(';')
                                        .map(s => s.trim())
                                        .filter(s => s !== '');
                                    setCompteAssocieSelection(cleaned);
                                }}
                                disabled={activeCycle === "etat d'avancement" || !selectedExerciceId || !selectedPeriodeId}
                                sx={{
                                    minWidth: 260,
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#fff',
                                        fontSize: '0.75rem',
                                        height: 34
                                    }
                                }}
                            />

                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleSaveCompteAssocie}
                                disabled={savingCompteAssocie || activeCycle === "etat d'avancement" || !selectedExerciceId || !selectedPeriodeId || compteAssocieSelection.join(';') === compteAssocieSaved.join(';')}
                                sx={{
                                    ml: 1.5,
                                    bgcolor: K_THEME.navy,
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    height: 34,
                                    minWidth: 90
                                }}
                            >
                                {savingCompteAssocie ? '...' : 'VALIDER'}
                            </Button>
                        </Box>
                    </Box>

                    {activeCycle !== "etat d'avancement" && (
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 900 } }}>
                            <Tab label="01. SYNTHÈSE" />
                            <Tab label="02. DILIGENCES" />
                            <Tab label="03. REVUE ANALYTIQUE" />
                        </Tabs>
                    )}
                    <Box sx={{ flexGrow: 1, border: `1px solid ${K_THEME.border}`, p: 4, bgcolor: K_THEME.bg, overflow: 'auto' }}>
                        {renderContent()}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default DossierTravailPage;