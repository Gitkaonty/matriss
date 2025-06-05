import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { init } from '../../../init';
import { Stack, Typography } from '@mui/material';
import { format } from 'date-fns';


let initial = init[0];

export const DetailsInformation = ({ infos, row, confirmOpen, listCptChg, listCptTva }) => {
  //const [open, setOpen] = React.useState(false);
  //const [scroll, setScroll] = React.useState('paper');
  const scroll = 'paper';
  const open = true;

  //const handleClickOpen = (scrollType) => () => {
    //setOpen(true);
    //setScroll(scrollType);
  //};

  const handleClose = () => {
    confirmOpen(false);
    //setOpen(false);
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <React.Fragment>
      {/* <Button onClick={handleClickOpen('paper')}>scroll=paper</Button>
      <Button onClick={handleClickOpen('body')}>scroll=body</Button> */}
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">{row.compte} {row.libelle}</DialogTitle>
        <DialogContent dividers={scroll === 'paper'} style={{width: 600, height:600}}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <Typography variant='h7'><strong>Compte:</strong> {row.compte}<br /></Typography>
            <Typography variant='h7'><strong>Libellé:</strong> {row.libelle}<br /></Typography>
            <Typography variant='h7'><strong>Nature:</strong> {row.nature}<br /></Typography>
            <Typography variant='h7'><strong>Base auxiliaire:</strong> {row.baseaux}<br /></Typography>

            <Typography variant='h7'><strong>Comptes de charges associés :</strong><br /></Typography>
            {listCptChg?.map((item) => (
                <Typography variant='h7' style={{marginLeft:50}}><strong>- </strong> {item.compte} {item.libelle}<br /></Typography>
            ))
            }

            <Typography variant='h7'><br /><strong>Comptes de TVA associés :</strong><br /></Typography>
            {listCptTva?.map((item) => (
                <Typography variant='h7' style={{marginLeft:50}}><strong>- </strong> {item.compte} {item.libelle}<br /></Typography>
            ))
            }

            <Typography variant='h7'><br /><strong>Type de tier:</strong> {row.typetier}<br /></Typography>
            {row.typetier === 'sans-nif'
            ? 
            <Stack>
                <Typography variant='h7'><strong>Cin:</strong> {row.cin}<br /></Typography>
                <Typography variant='h7'><strong>Date cin:</strong> {format(row.datecin,"dd/MM/yyyy")}<br /></Typography>
                <Typography variant='h7'><strong>Autres pièces d'identité si pas de cin:</strong> {row.autrepieceid}<br /></Typography>
                <Typography variant='h7'><strong>Référence pièce d'identité:</strong> {row.refpieceid}<br /></Typography>
                <Typography variant='h7'><strong>Adresse:</strong> {row.adressesansnif}<br /></Typography>
                <Typography variant='h7'><strong>Mot clé:</strong> {row.motcle}<br /></Typography>
            </Stack>
            :
            <Stack>
                <Typography variant='h7'><strong>Type de tier:</strong> {row.typetier}<br /></Typography>
            </Stack>
            }

            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}
            variant='outlined'
            style={{backgroundColor:"transparent", 
                color:initial.theme, 
                width:"100px", 
                textTransform: 'none', 
                //outline: 'none',
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}