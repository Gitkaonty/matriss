import React, { useEffect, useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, Divider, Box, Grid, Card, CardContent } from '@mui/material';
import { format } from 'date-fns';
import { init } from '../../../init';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';

let initial = init[0];

// Composant utilitaire pour afficher une information
const InfoField = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
      {label} :
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 400, color: value ? 'text.primary' : 'text.disabled', flex: 1 }}>
      {value || '—'}
    </Typography>
  </Box>
);

export const DetailsInformation = ({ row, confirmOpen, listCptChg, listCptTva }) => {
  const scroll = 'paper';
  const open = true;

  const handleClose = () => {
    confirmOpen(false);
  };

  const descriptionElementRef = useRef(null);
  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) descriptionElement.focus();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll={scroll}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      PaperProps={{
        sx: {
          width: '90vw',
          maxWidth: '1200px',
          borderRadius: 3,
        }
      }}
      fullWidth
      maxWidth="xl"
    >
      <DialogTitle id="scroll-dialog-title" sx={{ 
        fontWeight: 600, 
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        color: 'primary.main',
        pb: 2
      }}>
        <AccountBalanceIcon sx={{ fontSize: 28 }} />
        Détails du compte comptable
      </DialogTitle>

      <DialogContent
       dividers={scroll === 'paper'} sx={{ maxHeight: '70vh', px: 4, py: 3 }}>
    
        <Box ref={descriptionElementRef} tabIndex={-1}>
          <Stack spacing={3}>
            {/* Première ligne : Informations comptables + Tier */}
            <Grid container spacing={1}>
              {/* Section : Informations comptables */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  boxShadow: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg,rgb(233, 250, 170) 0%,rgb(198, 169, 228) 100%)',
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Informations comptables
                    </Typography>
                    <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12}>
                          <InfoField label="Numéro de compte" value={row.compte} />
                        </Grid>
                        <Grid item xs={12}>
                          <InfoField label="Libellé" value={row.libelle} />
                        </Grid>
                        <Grid item xs={12}>
                          <InfoField label="Nature" value={row.nature} />
                        </Grid>
                        <Grid item xs={12}>
                          <InfoField label="Base auxiliaire" value={row.baseaux} />
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Type de tier */}
              {row.typetier && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    boxShadow: 2, 
                    borderRadius: 2, 
                    // bgcolor: '#edede4', 
                    // border: '1px solid #2196f3'
                    background: 'linear-gradient(135deg,rgb(223, 192, 161) 0%,rgb(198, 169, 228) 100%)',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column'
                     }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                        Informations du tier ({row.typetier})
                      </Typography>
                      <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
                        {row.typetier === 'sans-nif' && (
                          <Grid container spacing={1.5}>
                            {row.cin && <Grid item xs={12}><InfoField label="CIN" value={row.cin} /></Grid>}
                            {row.datecin && <Grid item xs={12}><InfoField label="Date CIN" value={format(row.datecin, "dd/MM/yyyy")} /></Grid>}
                            {row.autrepieceid && <Grid item xs={12}><InfoField label="Autres pièces" value={row.autrepieceid} /></Grid>}
                            {row.refpieceid && <Grid item xs={12}><InfoField label="Réf pièce" value={row.refpieceid} /></Grid>}
                            {row.adressesansnif && <Grid item xs={12}><InfoField label="Adresse" value={row.adressesansnif} /></Grid>}
                            {row.motcle && <Grid item xs={12}><InfoField label="Mot clé" value={row.motcle} /></Grid>}
                          </Grid>
                        )}

                        {row.typetier === 'avec-nif' && (
                          <Grid container spacing={1.5}>
                            {row.nif && <Grid item xs={12}><InfoField label="NIF" value={row.nif} /></Grid>}
                            {row.statistique && <Grid item xs={12}><InfoField label="N° Statistique" value={row.statistique} /></Grid>}
                            {row.adresse && <Grid item xs={12}><InfoField label="Adresse" value={row.adresse} /></Grid>}
                            {row.motcle && <Grid item xs={12}><InfoField label="Mot clé" value={row.motcle} /></Grid>}
                          </Grid>
                        )}

                        {row.typetier === 'etranger' && (
                          <Grid container spacing={1.5}>
                            {row.nifrepresentant && <Grid item xs={12}><InfoField label="NIF Représentant" value={row.nifrepresentant} /></Grid>}
                            {row.pays && <Grid item xs={12}><InfoField label="Pays" value={row.pays} /></Grid>}
                            {row.adresseetranger && <Grid item xs={12}><InfoField label="Adresse" value={row.adresseetranger} /></Grid>}
                            {row.motcle && <Grid item xs={12}><InfoField label="Mot clé" value={row.motcle} /></Grid>}
                          </Grid>
                        )}

                        {row.typetier === 'general' && (
                          <Grid container spacing={1.5}>
                            {row.pays && <Grid item xs={12}><InfoField label="Pays" value={row.pays} /></Grid>}
                            {row.motcle && <Grid item xs={12}><InfoField label="Mot clé" value={row.motcle} /></Grid>}
                          </Grid>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Deuxième ligne : Charges + TVA + Localisation */}
            <Grid container spacing={1.5}>
              {/* Comptes de charges */}
              {listCptChg?.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    boxShadow: 2, 
                    borderRadius: 2, 
                    bgcolor: '#edede4',
                    height: '250px',
                    display: 'flex',
                    flexDirection: 'column'
                    }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon sx={{ fontSize: 18 }} />
                        Comptes de charges associés
                      </Typography>
                      <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
                        <Stack spacing={0.5} sx={{ pl: 2 }}>
                          {listCptChg.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                                <strong>{item.compte}</strong> {item.libelle}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Comptes de TVA */}
              {listCptTva?.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    boxShadow: 2, 
                    borderRadius: 2,
                    bgcolor: '#edede4',
                    height: '250px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon sx={{ fontSize: 18 }} />
                        Comptes de TVA associés
                      </Typography>
                      <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
                        <Stack spacing={0.5} sx={{ pl: 2 }}>
                          {listCptTva.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                                <strong>{item.compte}</strong> {item.libelle}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Localisation */}
              {(row.province || row.region || row.district || row.commune) && (
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    boxShadow: 2, 
                    borderRadius: 2,
                    bgcolor: '#edede4',
                    height: '250px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18 }} />
                        Localisation
                      </Typography>
                      <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
                        <Grid container spacing={1}>
                          {row.province && <Grid item xs={12}><InfoField label="Province" value={row.province} /></Grid>}
                          {row.region && <Grid item xs={12}><InfoField label="Région" value={row.region} /></Grid>}
                          {row.district && <Grid item xs={12}><InfoField label="District" value={row.district} /></Grid>}
                          {row.commune && <Grid item xs={12}><InfoField label="Commune" value={row.commune} /></Grid>}
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          autoFocus
          variant='outlined'
          style={{
            backgroundColor: "transparent",
            color: initial.theme,
            width: "100px",
            textTransform: 'none',
            outline: 'none',
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
