import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Box,
    Typography
} from '@mui/material';
import { init } from '../../../../init';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';


const PopupCommentaireAnalytique = ({ open, onClose, compteData, onSave, apiBasePath = '/commentaireAnalytique' }) => {
    const axiosPrivate = useAxiosPrivate();
    const [commentaire, setCommentaire] = useState('');
    const [valideAnomalie, setValideAnomalie] = useState(false);
    const [loading, setLoading] = useState(false);
    const initial = init[0];

    useEffect(() => {
        const fetchExisting = async () => {
            if (!open || !compteData?.id_compte || !compteData?.id_exercice || !compteData?.id_dossier || !compteData?.compte) return;
            try {
                const resp = await axiosPrivate.get(
                    `${apiBasePath}/get/${compteData.id_compte}/${compteData.id_exercice}/${compteData.id_dossier}/${encodeURIComponent(compteData.compte)}`
                );
                const existing = resp?.data?.data;
                if (existing) {
                    setCommentaire(existing.commentaire || '');
                    setValideAnomalie(!!existing.valide_anomalie);
                } else {
                    setCommentaire(compteData.commentaire || '');
                    setValideAnomalie(!!compteData.valide_anomalie);
                }
            } catch (error) {
                setCommentaire(compteData.commentaire || '');
                setValideAnomalie(!!compteData.valide_anomalie);
            }
        };

        fetchExisting();
    }, [axiosPrivate, open, compteData, apiBasePath]);

    const handleSave = async () => {
        if (!compteData) return;

        setLoading(true);
        try {
            const response = await axiosPrivate.post(`${apiBasePath}/addOrUpdate`, {
                id_compte: compteData.id_compte,
                id_exercice: compteData.id_exercice,
                id_dossier: compteData.id_dossier,
                compte: compteData.compte,
                commentaire: commentaire,
                valide_anomalie: valideAnomalie
            });

            if (response?.data?.state) {
                onSave(response.data.data);
                onClose();
                return;
            }

            console.error('Sauvegarde commentaire refusée:', response?.data);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du commentaire:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCommentaire('');
        setValideAnomalie(false);
        onClose();
    };
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
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6">
                    Commentaire - Compte: {compteData?.compte}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                    {compteData?.libelle}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Commentaire"
                        multiline
                        rows={4}
                        fullWidth
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Ajoutez vos commentaires ici..."
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={valideAnomalie}
                                onChange={(e) => setValideAnomalie(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Valider l'anomalie"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary"
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
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={loading}
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
    );
};

export default PopupCommentaireAnalytique;

