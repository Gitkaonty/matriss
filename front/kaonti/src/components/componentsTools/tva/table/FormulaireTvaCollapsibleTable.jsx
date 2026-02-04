import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import TextField from '@mui/material/TextField';
import { CgDetailsMore } from 'react-icons/cg';
import { IoMdCreate } from 'react-icons/io';
import Tooltip from '@mui/material/Tooltip';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { init } from '../../../../../init';
import { FaPlus, FaMinus } from "react-icons/fa6";

const initial = init[0];

function toMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const DetailsRow = React.memo(function DetailsRow({ open, row, uniqueKey, context, cache, setCache }) {
  const { fileId, compteId, selectedExerciceId, mois, annee } = context;
  const cacheKey = uniqueKey;
  const data = cache.get(cacheKey);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (data || loading || !open) return;
    try {
      setLoading(true);
      const url = `/declaration/tva/formulaire/details/${fileId}/${compteId}/${selectedExerciceId}/${row.id}`;
      const { data: res } = await axios.get(url, { params: { mois, annee } });
      if (res?.state) {
        const cloned = new Map(cache);
        cloned.set(cacheKey, res);
        setCache(cloned);
      } else {
        toast.error(res?.msg || 'Erreur chargement détails');
      }
    } catch (e) {
      console.error('[FormTVA][Details] fetch failed', e);
      toast.error('Erreur serveur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  }, [data, loading, open, cache, cacheKey, setCache, fileId, compteId, selectedExerciceId, row?.id, mois, annee]);

  React.useEffect(() => { load(); }, [load]);

  const details = data?.details || [];
  const groupe = data?.groupe || row?.groupe || null;

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1 }}>
            <Box sx={{ mb: 1 }}>
              {loading ? <Typography variant="caption">Chargement...</Typography> : null}
            </Box>
            {groupe === '01' ? (
              <Box>
                <Chip
                  icon={<CgDetailsMore style={{ color: 'white', width: 20, height: 20, marginLeft: 10 }} />}
                  label={"Détails :"}
                  style={{
                    width: 175,
                    display: 'flex',
                    justifyContent: 'space-between',
                    backgroundColor: '#67AE6E',
                    color: 'white',
                    marginBottom: 8,
                  }}
                />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date écriture</TableCell>
                      <TableCell>N° Compte</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell align="right">Débit</TableCell>
                      <TableCell align="right">Crédit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.detailsEntries || []).map((e, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{e.dateecriture ? new Date(e.dateecriture).toLocaleDateString() : ''}</TableCell>
                        <TableCell>{e.compte}</TableCell>
                        <TableCell>{e.libelle}</TableCell>
                        <TableCell align="right">{toMoney(e.debit)}</TableCell>
                        <TableCell align="right">{toMoney(e.credit)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#eaf7ef' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{toMoney((data?.detailsEntries || []).reduce((s, r) => s + Number(r.debit || 0), 0))}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{toMoney((data?.detailsEntries || []).reduce((s, r) => s + Number(r.credit || 0), 0))}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box>
                <Chip
                  icon={<CgDetailsMore style={{ color: 'white', width: 20, height: 20, marginLeft: 10 }} />}
                  label={"Détails :"}
                  style={{
                    width: 175,
                    display: 'flex',
                    justifyContent: 'space-between',
                    backgroundColor: '#67AE6E',
                    color: 'white',
                    marginBottom: 8,
                  }}
                />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Référence</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell align="right">Montant HT</TableCell>
                      <TableCell align="right">Montant TVA</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell>{d.reference_facture}</TableCell>
                        <TableCell>{d.date_facture ? new Date(d.date_facture).toLocaleDateString() : ''}</TableCell>
                        <TableCell>{d.libelle_operation}</TableCell>
                        <TableCell align="right">{toMoney(d.montant_ht)}</TableCell>
                        <TableCell align="right">{toMoney(d.montant_tva)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#eaf7ef' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{toMoney(data?.total?.montant_ht)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{toMoney(data?.total?.montant_tva)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
});

export default function FormulaireTvaCollapsibleTable({
  rows,
  fileId,
  compteId,
  selectedExerciceId,
  mois,
  annee,
  // editing handlers from parent (optional)
  editRowId,
  editRowData,
  onModify,
  onEditChange,
  onEditSave,
  onEditCancel,
}) {
  const [openRowId, setOpenRowId] = useState(null);
  const [cache, setCache] = useState(() => new Map());

  const handleToggle = useCallback((compositeId) => {
    setOpenRowId(prev => (prev === compositeId ? null : compositeId));
  }, []);

  const cols = useMemo(() => ([
    { id: 'expand', label: '', width: 40, align: 'center' },
    { id: 'id', label: 'Code', width: 80, align: 'center' },
    { id: 'libelle', label: 'Désignation', width: 600, align: 'left' },
    { id: 'montant', label: 'Montant', width: 160, align: 'right' },
    // { id: 'actions', label: 'Actions', width: 120, align: 'center' },
  ]), []);

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {cols.map((c) => (
              <TableCell key={c.id} align={c.align} style={{ minWidth: c.width, fontWeight: 'bold', color: 'white', backgroundColor: initial.add_new_line_bouton_color }}>
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(rows || []).map((row, idx) => {
            const rowKey = `${row.id}-${mois}-${annee}-${idx}`;
            const isOpen = openRowId === rowKey;
            const canExpand = (row?.groupe === '01') ? (row?._computed !== true) : (row?.groupe === '02' || row?.groupe === '03');
            const formattedMontant = toMoney(row.montant);
            return (
              <React.Fragment key={rowKey}>
                <TableRow hover>
                  <TableCell align="center" sx={{ width: 40 }}>
                    {row?.groupe === '04' ? (
                      <Tooltip title="Modifier">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (!onModify) return;
                              if (editRowId === row.id) {
                                onEditSave && onEditSave();
                              } else {
                                onModify(row);
                              }
                            }}
                          >
                            <IoMdCreate
                              style={{
                                color: "#1976d2",
                                width: 22,
                                height: 22,
                              }}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : canExpand ? (
                      <IconButton size="small" onClick={() => handleToggle(rowKey)}>
                        {isOpen ? (
                          <FaMinus 
                            style={{ 
                              color: "white",        
                              backgroundColor: "#1976d2", 
                              borderRadius: "4px",         
                              padding: "4px"  ,
                              height: "20px",
                              width: "20px",             
                            }} 
                          />
                        ) : (
                          <FaPlus 
                          style={{ 
                            color: "white",        
                            backgroundColor: "#1976d2", 
                            borderRadius: "4px",         
                            padding: "4px" ,
                            height: "20px",
                            width: "20px",             
                          }} 
                          />
                        )}
                      </IconButton>
                    ) : (
                      <Box sx={{ width: 24, height: 24 }} />
                    )}
                  </TableCell>
                  <TableCell align="center">{row.id}</TableCell>
                  <TableCell align="left">{row.libelle}</TableCell>
                  <TableCell align="right">
                    {editRowId === row.id ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editRowData?.montant ?? row.montant}
                        onChange={(e) => onEditChange && onEditChange('montant', e.target.value)}
                        inputProps={{ style: { textAlign: 'right' } }}
                        sx={{ width: 140 }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            onEditSave && onEditSave();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            onEditCancel && onEditCancel();
                          }
                        }}
                        onBlur={() => {
                          // Sauvegarde automatique au blur pour éviter de perdre la saisie
                          onEditSave && onEditSave();
                        }}
                      />
                    ) : (
                      formattedMontant
                    )}
                  </TableCell>
                </TableRow>
                {canExpand && isOpen && (
                  <DetailsRow
                    open={isOpen}
                    row={row}
                    uniqueKey={rowKey}
                    context={{ fileId, compteId, selectedExerciceId, mois, annee }}
                    cache={cache}
                    setCache={setCache}
                  />
                )}
                {/* Colonne Actions
                <TableRow>
                  <TableCell colSpan={3} />
                  <TableCell align="center">
                    {editRowId === row.id ? (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Enregistrer">
                          <span>
                            <IconButton size="small" color="primary" onClick={() => onEditSave && onEditSave()}>
                              <SaveIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Annuler">
                          <span>
                            <IconButton size="small" color="error" onClick={() => onEditCancel && onEditCancel()}>
                              <CloseIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Box sx={{ height: 32 }} />
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow> */}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
