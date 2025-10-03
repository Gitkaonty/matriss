import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, styled } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

// Styled Dialog similar to PopupAddIrsa
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const PopupAddDge = ({ open, title = 'Modifier la ligne', columns = [], editRowData = {}, onEditChange, onSave, onCancel, themeColor = '#1976d2' }) => {
  return (
    <BootstrapDialog open={!!open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
        {Array.isArray(columns) && columns.map((col) => {
        const isMontant = col.id === 'montant';
        const value = editRowData?.[col.id] ?? '';

      return (
        <Stack key={col.id} direction="row" spacing={1} alignItems="center">
        {/* Label sur la gauche */}
        <div style={{ minWidth: 120, fontWeight: 500, fontSize: 13, color: '#1976d2' }}>
            {col.label || col.id}
        </div>

        {/* Input avec unité */}
        <TextField
            value={value}
            type={isMontant ? 'number' : 'text'}
            onChange={(e) => {
            if (isMontant && onEditChange) {
                onEditChange('montant', e.target.value);
            }
            }}
            disabled={!isMontant}
            variant="standard"
            size="small"
            sx={{
            width: 150,
            '& .MuiInputBase-root': { fontSize: '13px' },
            }}
            InputProps={{
            endAdornment: isMontant ? (
                <InputAdornment position="end">
                <span style={{ fontSize: '13px' }}>Ar</span>
                </InputAdornment>
            ) : null,
            sx: {
                '& input': { textAlign: 'right', padding: '2px 0' },
            },
            }}
        />
        </Stack>

        );
        })}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>Annuler</Button>
        <Button variant="contained" onClick={onSave} sx={{ backgroundColor: themeColor }} disabled={!!editRowData?._computed}>Enregistrer</Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default PopupAddDge;
