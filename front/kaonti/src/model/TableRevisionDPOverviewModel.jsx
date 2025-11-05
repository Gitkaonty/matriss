import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { init } from '../../init';
import IconButton from '@mui/material/IconButton';
import { ExpandMore, ExpandLess, Lock, LockOpen, CheckCircle, Cancel, Check, Edit } from '@mui/icons-material';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import toast from 'react-hot-toast';

let initial = init[0];

export default function TableRevisionDPOverviewModel({ rows, onToggleStatus, onToggleAnomalies, onExpand, onSaveComment }) {
  const [expanded, setExpanded] = React.useState({});
  const [localRows, setLocalRows] = React.useState(rows || []);
  const [editComments, setEditComments] = React.useState({}); // key: `${rowIndex}-${detailIndex}`
  const [editing, setEditing] = React.useState({}); // key => boolean: in inline edit mode
  React.useEffect(() => { setLocalRows(rows || []); }, [rows]);
  const toggle = (key) => {
    setExpanded(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (next[key] && typeof onExpand === 'function') {
        const row = (localRows || [])[key];
        onExpand(row, key);
      }
      return next;
    });
  };

  // Toggle all anomalies validated/unvalidated for a row and persist per anomaly
  const handleToggleAnomalies = (rowIndex) => {
    const row = localRows[rowIndex] || {};
    const details = Array.isArray(row.details) ? row.details : [];
    if (details.length === 0) return;
    const target = !details.every(x => !!x.valide); // if any false -> set all true, else set all false
    // Update UI
    setLocalRows(prev => {
      const cp = [...prev];
      const r = { ...(cp[rowIndex] || {}) };
      const nd = details.map(d => ({ ...d, valide: target }));
      r.details = nd;
      r.anomaliesValidee = nd.every(x => !!x.valide);
      cp[rowIndex] = r;
      return cp;
    });
    // Persist each detail
    if (typeof onSaveComment === 'function') {
      details.forEach((d, i) => {
        const key = `${rowIndex}-${i}`;
        const commentVal = (editComments?.[key] ?? d.comments ?? '');
        onSaveComment({
          tableau: row.tableau,
          rowIndex,
          detailIndex: i,
          id: d.id,
          comments: commentVal,
          valide: target,
        });
      });
      // Feedback global après la persistance en masse
      if (target) {
        toast.success('Toutes les anomalies ont été validées');
      } else {
        toast.success('Validation des anomalies annulée');
      }
    }
  };

  const handleToggleStatus = (idx) => {
    let nextValid = false;
    setLocalRows(prev => {
      const copy = [...prev];
      const cur = copy[idx] || {};
      nextValid = String(cur.status).toLowerCase() !== 'validée';
      copy[idx] = { ...cur, status: nextValid ? 'Validée' : 'Non validée' };
      return copy;
    });
    // Inform parent with target validity so it can persist etats.valide
    if (typeof onToggleStatus === 'function') onToggleStatus({ row: localRows[idx], index: idx, valide: nextValid });
  };
  return (
    <TableContainer component={Paper} sx={{ ml: 6 }}>
      <Table size="small" sx={{ minWidth: 650 }} aria-label="dp overview table">
        <TableHead style={{ backgroundColor: initial.theme }}>
          <TableRow>
            <TableCell align="left" sx={{ width: '300px', fontWeight: 'bold', color: '#fff', py: 1, fontSize: 12 }}>Tableau</TableCell>
            <TableCell align="center" sx={{ width: '120px', fontWeight: 'bold', color: '#fff', py: 1, fontSize: 12 }}>Statut</TableCell>
            <TableCell align="center" sx={{ width: '120px', fontWeight: 'bold', color: '#fff', py: 1, fontSize: 12 }}>Nbr anomalies</TableCell>
            <TableCell align="center" sx={{ width: '160px', fontWeight: 'bold', color: '#fff', py: 1, fontSize: 12 }}>Anomalies validée</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(localRows || []).map((row, idx) => {
            const computedAnomaliesValidee = Array.isArray(row?.details) && row.details.length > 0
              ? row.details.every(x => !!x.valide)
              : row.anomaliesValidee;
            return (
              <React.Fragment key={idx}>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: 30, '& td, & th': { py: 0 } }}>
                  <TableCell align="left" sx={{ py: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.50}>
                      <IconButton
                        size="small"
                        onClick={() => toggle(idx)}
                        sx={{
                          backgroundColor: '#67AE6E',
                          color: 'white',
                          '&:hover': { backgroundColor: '#4e9556' },
                          width: 16,
                          height: 16,
                          minWidth: 16,
                          p: 0
                        }}
                      >
                        {expanded[idx] ? <ExpandLess fontSize="inherit" /> : <ExpandMore fontSize="inherit" />}
                      </IconButton>
                      <span style={{ fontSize: 10 }}>
                        {row?.tableau}
                        {(row?.etat || row?.nom || row?.etatName)
                          ? ` : ${row.etat || row.nom || row.etatName}`
                          : ''}
                      </span>
                    </Stack>
                  </TableCell>

                  <TableCell align="center" sx={{ py: 0 }}>
                    <IconButton size="small" onClick={() => handleToggleStatus(idx)} sx={{ p: 0, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
                      {String(row.status).toLowerCase() === 'validée' ? <Lock sx={{ color: '#0a7a28' }} /> : <LockOpen sx={{ color: '#b71c1c' }} />}
                    </IconButton>
                  </TableCell>

                  <TableCell align="center" sx={{ py: 0 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        color: '#fff',
                        backgroundColor: Number(row.nbrAnomalies || 0) > 0 ? '#b71c1c' : '#0a7a28',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {Number(row.nbrAnomalies || 0)}
                    </Box>
                  </TableCell>

                  <TableCell align="center" sx={{ py: 0 }}>
                    <IconButton size="small" onClick={() => handleToggleAnomalies(idx)} sx={{ p: 0, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
                      {computedAnomaliesValidee ? <CheckCircle sx={{ color: '#0a7a28' }} /> : <Cancel sx={{ color: '#b71c1c' }} />}
                    </IconButton>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={4} sx={{ p: 0 }}>
                    <Collapse in={!!expanded[idx]} timeout="auto" unmountOnExit>
                      <Box sx={{ pl: 5 }}>
                        {Array.isArray(row.details) && row.details.length > 0 ? (
                          <Box>
                            {/* Header des détails */}
                            <Box sx={{ 
                              display: 'grid',
                              gridTemplateColumns: '700px 400px 200px',
                              alignItems: 'center',
                              gap: 1,
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#333',
                              mb: 0.25,
                              backgroundColor: '#faf0f0ff',
                              borderRadius: 1,
                              px: 2,
                              py: 0.25,
                              width: '100%',
                              boxSizing: 'border-box'
                            }}>
                              <div>Anomalies</div>
                              <div>Commentaire</div>
                              <div style={{ textAlign: 'center' }}>Valider</div>
                            </Box>
                            <Box sx={{ pb: 3 }}>
                            {/* Lignes de détails */}
                            {row.details.map((d, i) => {
                              const key = `${idx}-${i}`;
                              const value = editComments[key] ?? d.comments ?? '';
                              const checked = !!d.valide;
                              const isEditing = !!editing[key];
                              const handleToggleCheck = () => {
                                const newVal = !checked;
                                // update local visual immediately
                                setLocalRows(prev => {
                                  const cp = [...prev];
                                  const r = { ...(cp[idx] || {}) };
                                  const details = Array.isArray(r.details) ? [...r.details] : [];
                                  const det = { ...(details[i] || {}) };
                                  det.valide = newVal;
                                  details[i] = det;
                                  // update anomaliesValidee if all details now true
                                  const allOk = details.length > 0 && details.every(x => !!x.valide);
                                  r.details = details;
                                  r.anomaliesValidee = allOk;
                                  cp[idx] = r;
                                  
                                  // Afficher un toast lors de la validation/annulation
                                  if (newVal) {
                                    toast.success('Anomalie validée avec succès');
                                  } else {
                                    toast.info('Validation de l\'anomalie annulée');
                                  }
                                  
                                  return cp;
                                });
                                // persist immediately on single click
                                if (typeof onSaveComment === 'function') {
                                  onSaveComment({
                                    tableau: row.tableau,
                                    rowIndex: idx,
                                    detailIndex: i,
                                    id: d.id,
                                    comments: value,
                                    valide: newVal,
                                  });
                                }
                                // toast feedback
                                if (newVal) {
                                  toast.success('Anomalie validée');
                                } else {
                                  toast.success('Validation annulée');
                                }
                              };
                              return (
                                <Box
                                  key={i}
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '700px 400px 200px',
                                    alignItems: 'center',
                                    gap: 1,
                                    py: 0.5,
                                    mb: 0.15,
                                    lineHeight: 1,
                                    fontSize: 11,
                                    px: 2,
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                    }
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      lineHeight: 1.2,
                                      whiteSpace: 'normal',
                                      wordBreak: 'break-word',
                                      padding: '4px 0'
                                    }}
                                    title={d.anomalie}
                                  >
                                    {d.anomalie}
                                  </div>

                                  <Box sx={{ width: '100%' }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={value}
                                      onChange={(e) => setEditComments(prev => ({ ...prev, [key]: e.target.value }))}
                                      placeholder="Ajouter un commentaire"
                                      variant="standard"
                                      InputProps={{
                                        readOnly: (checked && !isEditing),
                                        sx: {
                                          fontSize: 12,
                                          py: 0,
                                          height: 20,
                                          color: (checked && !isEditing) ? '#9e9e9e' : 'inherit',
                                          cursor: (checked && !isEditing) ? 'default' : 'text',
                                          backgroundColor: (checked && !isEditing) ? '#f5f5f5' : 'transparent'
                                        }
                                      }}
                                      onDoubleClick={() => {
                                        setEditing(prev => ({ ...prev, [key]: true }));
                                        toast.info('Mode édition activé');
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    width: '100%',
                                    '& > *': { mx: 0.5 }
                                  }}>
                                    <Tooltip title={isEditing ? 'Valider les modifications' : 'Valider'}>
                                      <span>
                                        <IconButton
                                          size="small"
                                          aria-label="valider"
                                          disabled={checked && !isEditing}
                                          onClick={() => {
                                            if (isEditing) {
                                              // validate and save current comment
                                              if (typeof onSaveComment === 'function') {
                                                onSaveComment({
                                                  tableau: row.tableau,
                                                  rowIndex: idx,
                                                  detailIndex: i,
                                                  id: d.id,
                                                  comments: value,
                                                  valide: true
                                                });
                                              }
                                              // update local state: set valide true, persist comment, exit edit mode
                                              setLocalRows(prev => {
                                                const cp = [...prev];
                                                const r = { ...(cp[idx] || {}) };
                                                const details = Array.isArray(r.details) ? [...r.details] : [];
                                                const det = { ...(details[i] || {}) };
                                                det.valide = true;
                                                det.comments = value;
                                                details[i] = det;
                                                r.details = details;
                                                r.anomaliesValidee = details.length > 0 && details.every(x => !!x.valide);
                                                cp[idx] = r;
                                                return cp;
                                              });
                                              setEditComments(prev => {
                                                const next = { ...prev };
                                                delete next[key];
                                                return next;
                                              });
                                              setEditing(prev => ({ ...prev, [key]: false }));
                                              toast.success('Commentaire enregistré avec succès');
                                              toast.success('Anomalie validée avec succès');
                                            } else {
                                              if (!checked) handleToggleCheck();
                                            }
                                          }}
                                          sx={{ p: 0, color: '#0a7a28' }}
                                        >
                                          <Check sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title={isEditing ? 'Enregistrer le commentaire' : 'Modifier le commentaire'}>
                                      <IconButton
                                        size="small"
                                        aria-label="modifier"
                                        onClick={() => {
                                          if (!isEditing) {
                                            // enter edit mode
                                            setEditing(prev => ({ ...prev, [key]: true }));
                                            return;
                                          }
                                          // save comment
                                          if (typeof onSaveComment === 'function') {
                                            onSaveComment({
                                              tableau: row.tableau,
                                              rowIndex: idx,
                                              detailIndex: i,
                                              id: d.id,
                                              comments: value,
                                              valide: checked
                                            });
                                          }
                                          // update local stored comment and clear edit buffer + exit edit mode
                                          setLocalRows(prev => {
                                            const cp = [...prev];
                                            const r = { ...(cp[idx] || {}) };
                                            const details = Array.isArray(r.details) ? [...r.details] : [];
                                            const det = { ...(details[i] || {}) };
                                            det.comments = value;
                                            details[i] = det;
                                            r.details = details;
                                            cp[idx] = r;
                                            return cp;
                                          });
                                          setEditComments(prev => {
                                            const next = { ...prev };
                                            delete next[key];
                                            return next;
                                          });
                                          setEditing(prev => ({ ...prev, [key]: false }));
                                          toast.success('Commentaire enregistré');
                                        }}
                                        sx={{ p: 0, color: '#1976d2' }}
                                      >
                                        <Edit sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Annuler la modification ou annuler la validation">
                                      <span>
                                        <IconButton
                                          size="small"
                                          aria-label="annuler"
                                          onClick={() => {
                                            if (isEditing) {
                                              // cancel inline edit: revert input and exit edit mode
                                              setEditComments(prev => ({ ...prev, [key]: (d.comments ?? '') }));
                                              setEditing(prev => ({ ...prev, [key]: false }));
                                              toast.info('Modification annulée');
                                            } else if (checked) {
                                              // unvalidate and persist
                                              setLocalRows(prev => {
                                                const cp = [...prev];
                                                const r = { ...(cp[idx] || {}) };
                                                const details = Array.isArray(r.details) ? [...r.details] : [];
                                                const det = { ...(details[i] || {}) };
                                                det.valide = false;
                                                details[i] = det;
                                                r.details = details;
                                                r.anomaliesValidee = details.length > 0 && details.every(x => !!x.valide);
                                                cp[idx] = r;
                                                return cp;
                                              });
                                              if (typeof onSaveComment === 'function') {
                                                onSaveComment({
                                                  tableau: row.tableau,
                                                  rowIndex: idx,
                                                  detailIndex: i,
                                                  id: d.id,
                                                  comments: (editComments?.[key] ?? d.comments ?? ''),
                                                  valide: false
                                                });
                                              }
                                              toast.success('Validation annulée');
                                            }
                                          }}
                                          sx={{ p: 0, color: '#b71c1c' }}
                                        >
                                          <Cancel sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              );
                            })}
                            </Box>
                          </Box>
                        ) : (
                          <div style={{ fontSize: 13, padding: '2px 0', color: '#666' }}>Aucune anomalie à afficher.</div>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>

              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>

  );
}
