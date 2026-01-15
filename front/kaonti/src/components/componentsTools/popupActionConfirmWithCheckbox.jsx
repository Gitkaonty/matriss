import { Typography, Stack, Button, Dialog, DialogContent, DialogActions, IconButton, CircularProgress, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { IoIosWarning } from 'react-icons/io';
import { useState } from 'react';
import { init } from '../../../init';

const initial = init[0];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(3),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(2),
    },
    '& .MuiPaper-root': {
        minHeight: '25vh',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    },
}));

const PopupActionConfirmWithCheckbox = ({ msg, confirmationState, isLoading }) => {
    const [detailedByMonth, setDetailedByMonth] = useState('non');

    const handleConfirm = () => confirmationState(true, detailedByMonth);
    const handleClose = () => { isLoading ? null : confirmationState(false, detailedByMonth); };

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="confirmation-dialog-title"
            open={true}
            maxWidth="xs"
            fullWidth
        >
            <IconButton
                disabled={isLoading}
                style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                aria-label="close"
                onClick={handleClose}
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
                <Stack spacing={2}>
                    {/* Partie centrée */}
                    <Stack alignItems="center" textAlign="center" spacing={2}>
                        <IoIosWarning style={{ width: 70, height: 70, color: '#FF8A8A' }} />

                        <Typography
                            fontWeight={550}
                            color="text.primary"
                            sx={{ fontSize: '17px' }}
                        >
                            {msg}
                        </Typography>
                    </Stack>

                    {/* Partie alignée à gauche */}
                    <Stack
                        alignSelf="flex-start"
                        spacing={1}
                        sx={{ pl: 1 }}
                    >
                        <Typography variant="body2" sx={{ fontSize: '15px', fontWeight: 500 }}>
                            Détaillées par mois
                        </Typography>

                        <RadioGroup
                            row
                            value={detailedByMonth}
                            onChange={(e) => setDetailedByMonth(e.target.value)}
                            sx={{ pl: 1 }}
                        >
                            <FormControlLabel
                                value="oui"
                                control={
                                    <Radio
                                        disabled={isLoading}
                                        sx={{
                                            '&.Mui-checked': {
                                                color: initial.theme,
                                            },
                                        }}
                                    />
                                }
                                label="Oui"
                                sx={{ mr: 3 }}
                            />

                            <FormControlLabel
                                value="non"
                                control={
                                    <Radio
                                        disabled={isLoading}
                                        sx={{
                                            '&.Mui-checked': {
                                                color: initial.theme,
                                            },
                                        }}
                                    />
                                }
                                label="Non"
                            />
                        </RadioGroup>
                    </Stack>

                </Stack>
            </DialogContent>


            <DialogActions>
                <Button
                    disabled={isLoading}
                    autoFocus
                    style={{ backgroundColor: initial.theme, color: 'white', width: '100px', textTransform: 'none', outline: 'none' }}
                    type='submit'
                    onClick={handleClose}
                >
                    Annuler
                </Button>
                <Button
                    autoFocus
                    onClick={handleConfirm}
                    disabled={isLoading}
                    style={{
                        backgroundColor: initial.theme,
                        color: 'white',
                        width: isLoading ? '130px' : '100px',
                        textTransform: 'none',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                    }}
                >
                    <span>Générer</span>
                    {isLoading && <CircularProgress size={18} color="inherit" />}
                </Button>

            </DialogActions>
        </BootstrapDialog>
    );
};

export default PopupActionConfirmWithCheckbox;
