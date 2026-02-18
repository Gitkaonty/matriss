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
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const PopupCommentaireAnalytique = ({ open, onClose, compteData, onSave, apiBasePath = '/commentaireAnalytique' }) => {
    const axiosPrivate = useAxiosPrivate();
    const [commentaire, setCommentaire] = useState('');
    const [valideAnomalie, setValideAnomalie] = useState(false);
    const [loading, setLoading] = useState(false);

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
                <Button onClick={handleClose} color="secondary">
                    Annuler
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PopupCommentaireAnalytique;
