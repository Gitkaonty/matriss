import React from 'react';
import { Typography, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { init } from '../../../init';
import { CiWarning } from "react-icons/ci";
import { IoIosWarning } from "react-icons/io";
import toast from 'react-hot-toast';

let initial = init[0];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const PopupConfirmDelete = ({ msg, confirmationState, type, presonalisedMessage }) => {

    const confirmation = () => {
        confirmationState(true);
        type === 'Generer' || type === 'Reinialiser' ? null :
            presonalisedMessage ? null :
                toast.success('Ligne supprimés avec succès');
    }

    const handleCloseDeleteModel = () => {
        confirmationState(false);
    }

    return (
        <BootstrapDialog
            onClose={handleCloseDeleteModel}
            aria-labelledby="customized-dialog-title"
            open={true}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontWeight: 'bold', width: '600px', height: '50px', backgroundColor: 'transparent' }}>

            </DialogTitle>

            <IconButton
                style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                aria-label="close"
                onClick={handleCloseDeleteModel}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent >
                <Stack width={'100%'} alignContent={'center'} alignItems={'center'}>
                    <IoIosWarning style={{ width: '75px', height: '75px', color: '#FF8A8A' }} />
                </Stack>

                <Stack sx={{ marginTop: 3 }} width={"98%"} height={"100px"} spacing={2} alignItems={'center'} alignContent={"center"}
                    direction={"column"} justifyContent={"center"} style={{ marginLeft: '10px' }}>
                    <Typography sx={{ ml: 2, flex: 1, textAlign: "center" }} variant="h7" component="div" >
                        {msg}
                    </Typography>

                    <Typography sx={{ ml: 2, flex: 1 }} variant="h7" component="div" color={'red'}>
                        Attention, cette action est irréversible!
                    </Typography>
                </Stack>

            </DialogContent>
            <DialogActions>
                <Button autoFocus
                    variant='outlined'
                    style={{
                        backgroundColor: "transparent",
                        color: initial.theme,
                        width: "100px",
                        textTransform: 'none',
                        outline: 'none',
                    }}
                    type='submit'
                    onClick={handleCloseDeleteModel}
                >
                    Annuler
                </Button>
                <Button autoFocus onClick={confirmation}
                    style={{ backgroundColor: '#FF8A8A', color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                >
                    {type === "Generer" ? "Générer" : type === "Reinialiser" ? "Réinialiser" : "Supprimer"}
                </Button>
            </DialogActions>
        </BootstrapDialog>
    )
}

export default PopupConfirmDelete;
