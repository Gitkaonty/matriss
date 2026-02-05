import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Box, Tab, Button, IconButton, Chip, Tooltip } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import { ListItemIcon, ListItemText } from '@mui/material';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { CiExport } from 'react-icons/ci';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

export default function ExportGrandLivre() {
  let initial = init[0];
  const [fileInfos, setFileInfos] = useState('');
  const [fileId, setFileId] = useState(0);
  const { id } = useParams();
  const [noFile, setNoFile] = useState(false);

  const [selectedExerciceId, setSelectedExerciceId] = useState(0);
  const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);
  const [listeExercice, setListeExercice] = useState([]);
  const [listeSituation, setListeSituation] = useState([]);

  const [listeCodeJournaux, setListeCodeJournaux] = useState([]);
  const [journalCodes, setJournalCodes] = useState([]); // multiple codes
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  // Helpers for select-all on journal codes
  const ALL_OPTION = '__ALL__';
  const allCodes = Array.isArray(listeCodeJournaux) ? listeCodeJournaux.map(v => v.code) : [];
  const isAllSelected = allCodes.length > 0 && journalCodes.length === allCodes.length && allCodes.every(c => journalCodes.includes(c));

  const handleChangeCodes = (e) => {
    let value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
    if (value.includes(ALL_OPTION)) {
      if (isAllSelected) {
        setJournalCodes([]);
      } else {
        setJournalCodes(allCodes);
      }
    } else {
      setJournalCodes(value);
    }
  };
  const [anchorElExport, setAnchorElExport] = useState(null);
  const openExportMenu = Boolean(anchorElExport);
  const handleOpenExportMenu = (event) => setAnchorElExport(event.currentTarget);
  const handleCloseExportMenu = () => setAnchorElExport(null);

  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const compteId = decoded?.UserInfo?.compteId || null;
  const navigate = useNavigate();

  const GetInfosIdDossier = (id) => {
    axios.get(`/home/FileInfos/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setFileInfos(resData.fileInfos[0]);
        setNoFile(false);
      } else {
        setFileInfos([]);
        setNoFile(true);
      }
    })
  }

  const sendToHome = (value) => {
    setNoFile(!value);
    navigate('/tab/home');
  }

  const handleChangeExercice = (exercice_id) => {
    setSelectedExerciceId(exercice_id);
    setSelectedPeriodeChoiceId("0");
    setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
    setSelectedPeriodeId(exercice_id);
    // Fixer les dates du filtre à l'année (intervalle) de l'exercice
    const ex = listeExercice.find((e) => e.id === exercice_id);
    if (ex) {
      const d1 = format(new Date(ex.date_debut), 'yyyy-MM-dd');
      const d2 = format(new Date(ex.date_fin), 'yyyy-MM-dd');
      setDateDebut(d1);
      setDateFin(d2);
    }
  }

  const GetListeExercice = (id) => {
    axios.get(`/paramExercice/listeExercice/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setListeExercice(resData.list);
        const exerciceNId = resData.list?.filter((item) => item.libelle_rang === "N");
        setListeSituation(exerciceNId);
        setSelectedExerciceId(exerciceNId[0].id);
        setSelectedPeriodeChoiceId(0);
        setSelectedPeriodeId(exerciceNId[0].id);
        // Initialiser les dates du filtre avec celles de l'exercice courant
        const d1 = format(new Date(exerciceNId[0].date_debut), 'yyyy-MM-dd');
        const d2 = format(new Date(exerciceNId[0].date_fin), 'yyyy-MM-dd');
        setDateDebut(d1);
        setDateFin(d2);
      } else {
        setListeExercice([]);
        toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
      }
    })
  }

  const GetListeSituation = (id) => {
    axios.get(`/paramExercice/listeSituation/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        const list = resData.list;
        setListeSituation(resData.list);
        if (list.length > 0) {
          setSelectedPeriodeId(list[0].id);
        }
      } else {
        setListeSituation([]);
        toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
      }
    })
  }

  const GetListeCodeJournaux = () => {
    axios.get(`/paramCodeJournaux/listeCodeJournaux/${fileId}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setListeCodeJournaux(resData.list);
      } else {
        setListeCodeJournaux([]);
        toast.error(resData.msg);
      }
    })
  }

  const handleChangePeriode = (choix) => {
    setSelectedPeriodeChoiceId(choix);
    if (choix === 0) {
      setListeSituation(listeExercice?.filter((item) => item.id === selectedExerciceId));
      setSelectedPeriodeId(selectedExerciceId);
    } else if (choix === 1) {
      GetListeSituation(selectedExerciceId);
    }
  }

  const handleChangeDateIntervalle = (id) => {
    setSelectedPeriodeId(id);
    // Adapter les dates si une situation est choisie (plage spécifique)
    const sit = listeSituation?.find((s) => s.id === id);
    if (sit) {
      const d1 = format(new Date(sit.date_debut), 'yyyy-MM-dd');
      const d2 = format(new Date(sit.date_fin), 'yyyy-MM-dd');
      setDateDebut(d1);
      setDateFin(d2);
    }
  }

  const handleApplyFilter = () => {
    const hasFilter = (Array.isArray(journalCodes) && journalCodes.length > 0) || (dateDebut && dateDebut !== '') || (dateFin && dateFin !== '');
    if (!hasFilter) {
      return toast.error('Veuillez sélectionner au moins un filtre (code journal ou dates).');
    }
    toast.success('Filtre appliqué');
  };

  const handleResetFilter = () => {
    setJournalCodes([]);
    setDateDebut('');
    setDateFin('');
    toast.success('Filtre réinitialisé');
  };

  const canExport = () => {
    const hasFilter = (Array.isArray(journalCodes) && journalCodes.length > 0) || (dateDebut && dateDebut !== '') || (dateFin && dateFin !== '');
    return hasFilter && !!compteId && !!fileId && !!selectedExerciceId;
  };

  const exportPdf = async () => {
    if (!canExport()) {
      return toast.error('Renseignez au moins un filtre et Sélectionnez un exercice.');
    }
    try {
      setExporting(true);
      setExportMsg('Génération du PDF...');
      const body = {
        compteId,
        fileId,
        exerciceId: selectedExerciceId,
        journalCodes,
        dateDebut,
        dateFin,
      };
      const response = await axios.post('/administration/exportGrandLivre/pdf', body, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `GrandLivre_${fileId}_${selectedExerciceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      toast.error('Erreur lors de l\'export du journal');
    } finally {
      setExporting(false);
      setExportMsg('');
    }
  };

  const exportExcel = async () => {
    if (!canExport()) {
      return toast.error('Renseignez au moins un filtre et Sélectionnez un exercice.');
    }
    try {
      setExporting(true);
      setExportMsg('Génération de l\'Excel...');
      const body = {
        compteId,
        fileId,
        exerciceId: selectedExerciceId,
        journalCodes,
        dateDebut,
        dateFin,
      };
      const response = await axios.post('/administration/exportGrandLivre/excel', body, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `GrandLivre_${fileId}_${selectedExerciceId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      toast.error('Erreur lors de l\'export du journal (Excel)');
    } finally {
      setExporting(false);
      setExportMsg('');
      handleCloseExportMenu();
    }
  };

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType('navigation');
    let idFile = 0;
    if (navigationEntries.length > 0) {
      const navigationType = navigationEntries[0].type;
      if (navigationType === 'reload') {
        const idDossier = sessionStorage.getItem("fileId");
        setFileId(idDossier);
        idFile = idDossier;
      } else {
        sessionStorage.setItem('fileId', id);
        setFileId(id);
        idFile = id;
      }
    }
    GetInfosIdDossier(idFile);
    GetListeExercice(idFile);
  }, []);

  useEffect(() => {
    if (fileId && compteId) {
      GetListeCodeJournaux();
    }
  }, [fileId, compteId]);

  return (
    <Box>
      {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
      <TabContext value={"1"}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList aria-label="lab API tabs example">
            <Tab
              style={{ textTransform: 'none', outline: 'none', border: 'none', margin: -5 }}
              label={InfoFileStyle(fileInfos?.dossier)} value="1"
            />
          </TabList>
        </Box>
        <TabPanel value="1" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={2} flexGrow={1}>

            {/* ================= TITRE ================= */}
            <Typography variant="h7" sx={{ color: "black" }}>
              Administration - Export Grand Livre
            </Typography>

            {/* ================= FILTRE HAUT ================= */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              sx={{
                p: 2,
                //  backgroundColor: "#f4f9f9",
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                flexWrap: "wrap",
              }}
            >
              {/* Exercice */}
              {/* Exercice */}
              <Stack direction="row" spacing={0} alignItems="center">
                <Typography sx={{ minWidth: 60, fontSize: 15, mr: 1 }}>
                  Exercice :
                </Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    value={selectedExerciceId}
                    onChange={(e) => handleChangeExercice(e.target.value)}
                    sx={{
                      fontSize: 15,
                      height: 32,
                      "& .MuiSelect-select": {
                        py: 0.5,
                      },
                    }}
                  >
                    {listeExercice.map((option) => (
                      <MenuItem key={option.id} value={option.id} sx={{ fontSize: 15 }}>
                        {option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

            </Stack>

            {/* ================= FILTRE BAS ================= */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              sx={{
                mt: 'auto',
                p: 2,
                //backgroundColor: "#f4f9f9",
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                flexWrap: "wrap",
                position: "relative", // 🔹 pour positionner les boutons en absolute
              }}
            >
              {/* Code journal */}
              <Stack direction="row" spacing={0} alignItems="center">
                <Typography sx={{ minWidth: 80, fontSize: 15, mr: 1 }}>Code journal :</Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    multiple
                    value={journalCodes}
                    onChange={handleChangeCodes}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!Array.isArray(selected) || selected.length === 0) return "--Sélectionner--";

                      const vals = selected.filter((val) => val !== ALL_OPTION);
                      const visible = vals.slice(0, 5);
                      const hiddenCount = vals.length - visible.length;
                      const allLabels = vals.join(', ');

                      return (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {visible.map((val) => (
                            <Chip
                              key={val}
                              label={val}
                              size="small"
                              onMouseDown={(e) => e.stopPropagation()}
                              onDelete={() => setJournalCodes(prev => prev.filter(c => c !== val))}
                            />
                          ))}
                          {hiddenCount > 0 && (
                            <Tooltip title={allLabels} placement="top" arrow>
                              <Chip
                                label={`+${hiddenCount}`}
                                size="small"
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      );
                    }}
                    sx={{
                      borderRadius: 2,
                      minWidth: 300,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        py: 0.5,
                        px: 1,
                        fontSize: 15,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                    MenuProps={{
                      disableScrollLock: true,
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' },
                      PaperProps: {
                        sx: {
                          "& .MuiMenuItem-root": {
                            fontSize: 14,
                            minHeight: 28,
                          },
                        },
                      },
                      MenuListProps: { dense: true, disablePadding: true },
                    }}
                  >
                    <MenuItem value={ALL_OPTION}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Checkbox
                          size="small"
                          checked={isAllSelected}
                          indeterminate={!isAllSelected && journalCodes.length > 0}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Sélectionner tout" primaryTypographyProps={{ fontWeight: 'bold' }} />
                    </MenuItem>
                    {listeCodeJournaux.map((value, index) => (
                      <MenuItem key={index} value={value.code}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Checkbox size="small" checked={journalCodes.includes(value.code)} />
                        </ListItemIcon>
                        <ListItemText primary={`${value.code} - ${value.libelle}`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Date début */}
              <Stack direction="row" spacing={0} alignItems="center">
                <Typography sx={{ minWidth: 80, fontSize: 15, mr: 1 }}>
                  Date début :
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  sx={{
                    width: 150,
                    "& input": {
                      fontSize: 15,
                      py: 0.5,
                    },
                  }}
                />
              </Stack>

              {/* Date fin */}
              <Stack direction="row" spacing={0} alignItems="center">
                <Typography sx={{ minWidth: 50, fontSize: 15, mr: 1 }}>
                  Date fin :
                </Typography>

                <TextField
                  type="date"
                  size="small"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  sx={{
                    width: 150,
                    "& input": {
                      fontSize: 15,
                      py: 0.5,
                    },
                  }}
                />
              </Stack>



              {/* Boutons fixes à droite */}
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  position: "absolute",
                  right: 16,     // distance depuis le bord droit
                  top: "50%",     // centre verticalement
                  transform: "translateY(-50%)", // ajuste pour centrer
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleResetFilter}
                  sx={{
                    textTransform: "none",
                    width: 120,
                    backgroundColor: initial.add_new_line_bouton_color,
                    borderColor: initial.add_new_line_bouton_color,
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: initial.add_new_line_bouton_color,
                      borderColor: initial.add_new_line_bouton_color,
                    },
                  }}
                >
                  Réinitialiser
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disabled={!canExport()}
                  onClick={handleOpenExportMenu}
                  sx={{
                    textTransform: "none",
                    width: 120,
                    backgroundColor: initial.theme,
                    "&:hover": {
                      backgroundColor: initial.theme,
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#ccc",
                      color: "#666",
                    },
                  }}
                >
                  Exporter
                </Button>

              </Stack>
            </Stack>



          </Stack>

          {/* ================= MENU EXPORT ================= */}
          <Menu
            id="export-menu"
            anchorEl={anchorElExport}
            open={openExportMenu}
            onClose={handleCloseExportMenu}
            keepMounted
            disableScrollLock
            disableAutoFocus
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            MenuListProps={{ dense: true }}
          >
            <MenuItem onClick={exportPdf} disabled={exporting}>
              <ListItemIcon>
                <FaFilePdf size={20} color="#D32F2F" />
              </ListItemIcon>
              <ListItemText primary={exporting ? 'Export...' : 'Exporter en PDF'} />
            </MenuItem>
            <MenuItem onClick={exportExcel} disabled={exporting}>
              <ListItemIcon>
                <FaFileExcel size={20} color="#2E7D32" />
              </ListItemIcon>
              <ListItemText primary={exporting ? 'Export...' : 'Exporter en Excel'} />
            </MenuItem>
          </Menu>
        </TabPanel>

      </TabContext>
    </Box>
  )
}

