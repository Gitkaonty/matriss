import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { DataGrid, GridRowModes, GridToolbarContainer, GridActionsCellItem, frFR } from '@mui/x-data-grid';
import {
  Box, Button, IconButton, Stack, Tooltip, Menu, MenuItem, Modal,
  Typography, Divider, TextField, Select, Paper, Card, CardActionArea,
  CardContent, Tab, FormControl, InputLabel, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, styled
} from '@mui/material';
import QuickFilter, { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import axios from '../../../../../config/axios';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { TbPlaylistAdd } from "react-icons/tb";
import { FaRegPenToSquare } from "react-icons/fa6";
import { FaEdit, FaSave } from "react-icons/fa";
import { TfiSave } from "react-icons/tfi";
import { VscClose } from "react-icons/vsc";
import { IoMdTrash } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { toast } from 'react-hot-toast';
import { BsBox2Fill, BsCreditCard2FrontFill } from "react-icons/bs";
import { FaLocationDot } from "react-icons/fa6";
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import FormatedInput from '../../../componentsTools/FormatedInput';
import InputAdornment from '@mui/material/InputAdornment';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { useFormik } from 'formik';

import PopupAddIrsa from '../../../componentsTools/PopupAddIrsa';
import PopupAddPaie from '../../../componentsTools/PopupAddPaie';
import { useGridApiRef } from '@mui/x-data-grid';
import { GridPagination } from '@mui/x-data-grid';
import VirtualTableIrsa from '../../../componentsTools/DeclarationEbilan/virtualTableIrsa';
import VirtualTablePaie from '../../../componentsTools/DeclarationEbilan/virtualTablePaie';
import { init } from '../../../../../init';
import PaieImportExportDialog from "../../../componentsTools/DeclarationEbilan/PaieImportExportDialog";
import DownloadIcon from '@mui/icons-material/Download';
import { FaExchangeAlt } from 'react-icons/fa'; // Font Awesome
import ImportPaieCsvButton from '../../../componentsTools/DeclarationEbilan/ImportPaieCsvButton';
import { exportIrsaToXml } from '../../../componentsTools/DeclarationEbilan/exportIrsaXml.jsx'; import CodeIcon from '@mui/icons-material/Code';
import ExportIrsaDialog from './ExportIrsaDialog';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';


export default function DeclarationIRSAComponent() {
  // Etat pour la popup d'export IRSA et l'affichage de l'historique
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [showHistoriqueIrsa, setShowHistoriqueIrsa] = useState(false);
  const [refreshHistoriqueIrsaKey, setRefreshHistoriqueIrsaKey] = useState(Date.now());

  // --- Sélection mois/année et filtrage IRSA ---
  const [valSelectMois, setValSelectMois] = useState(1);
  const [valSelectAnnee, setValSelectAnnee] = useState('');
  const [selectedExerciceId, setSelectedExerciceId] = useState(1); // Ajout de la variable manquante
  const [allIrsaData, setAllIrsaData] = useState([]);
  const [irsaData, setIrsaData] = useState([]);

  let initial = init[0];

  // Récupération des informations de connexion pour l'export XML
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const compteId = decoded?.UserInfo?.compteId || null;

  const [openImportExportDialog, setOpenImportExportDialog] = useState(false);

  const handleDownloadPaieTemplate = async () => {
    try {
      const response = await axios.get('/paie/paie/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modele_import_paie.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erreur lors du téléchargement du modèle Paie");
    }
  };

  // Injection des données importées depuis le CSV
  const handlePaieImport = async (importedRows) => {
    // Filtre les lignes nulles ou vides
    const rowsClean = importedRows.filter(row => row && Object.keys(row).length > 0);

    // Ajout automatique du mois et de l'année sélectionnés
    const rowsWithMeta = rowsClean.map(row => {
      const personnelId = row.personnel_id || row.personnelId;
      return {
        ...row,
        personnelId,
        mois: valSelectMois,
        annee: valSelectAnnee,
      };
    });

    try {
      // Vérifier s'il y a des données à enregistrer
      if (rowsWithMeta.length === 0) {
        console.log('[DEBUG] Aucune donnée valide à enregistrer, pas de message de succès');
        return; // Pas de message de succès si rien à enregistrer
      }

      // Envoi chaque ligne à la base
      await Promise.all(
        rowsWithMeta.map(row => axios.post('/paie/paie', row))
      );
      toast.success(`Import et enregistrement en base réussis ! ${rowsWithMeta.length} ligne(s) enregistrée(s).`);
      // Rechargement depuis la base pour cohérence
      const res = await axios.get(`/paie/paie/${compteId}/${id}/${selectedExerciceId}`);
      if (res.data && Array.isArray(res.data.list)) {
        console.log('[DEBUG] Données brutes reçues de l\'API:', res.data.list);

        // Synchroniser immédiatement chaque ligne avec l'objet personnel correspondant
        const synchronizedData = res.data.list.map(row => {
          const personnelId = row.personnel_id ?? row.personnelId;
          const foundPersonnel = personnels.find(p => p.id === personnelId);

          console.log(`[DEBUG] Ligne ${row.id} - Champs calculés:`, {
            salaireBrutNumeraire: row.salaireBrutNumeraire,
            remunerationFixe25: row.remunerationFixe25,
            salaireBrut20: row.salaireBrut20,
            totalSalaireBrut: row.totalSalaireBrut,
            cnapsEmployeur: row.cnapsEmployeur,
            ostieEmployeur: row.ostieEmployeur,
            baseImposable: row.baseImposable,
            irsaBrut: row.irsaBrut,
            irsaNet: row.irsaNet
          });

          return {
            ...row,
            personnel: foundPersonnel || null
          };
        });
        setPaieData(synchronizedData);
        console.log('[DEBUG] Données paie synchronisées après import:', synchronizedData);
      }
      setNewRow(null);
      setEditRow(null);
      setSelectedRowId([]);
      setRowModesModel({});
    } catch (e) {
      let errMsg = 'Erreur lors de l’enregistrement en base';
      if (e.response && e.response.data && e.response.data.message) {
        errMsg += ` : ${e.response.data.message}`;
      } else if (e.response && e.response.data) {
        errMsg += ` : ${JSON.stringify(e.response.data)}`;
      } else if (e.message) {
        errMsg += ` : ${e.message}`;
      }
      toast.error(errMsg);
      console.error(e);
    }
  };

  const [openConfirmDeleteAllIrsa, setOpenConfirmDeleteAllIrsa] = useState(false);
  const [openConfirmDeleteAllPaie, setOpenConfirmDeleteAllPaie] = useState(false);

  // Ajout immédiat IRSA
  const handleAddIrsa = (row) => {
    setIrsaData(prev => [...prev, row]);
  };
  // Edition immédiate IRSA
  const handleEditIrsa = (row) => {
    setIrsaData(prev => prev.map(r => r.id === row.id ? row : r));
  };


  const [verrIrsa, setVerrIrsa] = useState(false);
  const [tabValue, setTabValue] = useState('1');
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const [isRefresh, setIsRefresh] = useState(false);

  // Handler suppression ligne IRSA
  const deleteOneRowIrsa = async (row) => {
    if (row.id > 0) {
      try {
        const response = await axios.delete(`/irsa/irsa/${row.id}`);
        if (response.data.state === true) {
          toast.success('Ligne supprimée avec succès');
          setIsRefresh(true);
        } else {
          toast.error('Erreur côté serveur : ' + response.data.msg);
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error(error);
      }
    } else {
      setIrsaData(prev => prev.filter(item => item.id !== row.id));
      toast.success('Ligne supprimée localement');
    }
  };

  // Handler suppression ligne PAIE
  const deleteOneRowPaie = async (row) => {
    if (row.id > 0) {
      try {
        const response = await axios.delete(`/paie/paie/${row.id}`);
        if (response.data.state === true) {
          setPaieData(prev => prev.filter(item => item.id !== row.id));
          toast.success('Ligne supprimée avec succès');
        } else {
          toast.error('Erreur côté serveur : ' + response.data.msg);
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error(error);
      }
    } else {
      setPaieData(prev => prev.filter(item => item.id !== row.id));
      toast.success('Ligne supprimée localement');
    }
  };

  const [editRowPaieModal, setEditRowPaieModal] = useState(null);
  const [openModalPaie, setOpenModalPaie] = useState(false);
  const modifyRowPaie = (row) => {
    setEditRowPaieModal(row);
    setOpenModalPaie(true);
  };

  // Handler modification ligne IRSA
  const modifyRowIrsa = (row) => {
    setEditRowModal(row);
    setOpenModalIrsa(true);
  };

  // --- Chargement initial des données IRSA ---
  useEffect(() => {
    const fetchIrsa = async () => {
      try {
        console.log(compteId, id, selectedExerciceId);
        const res = await axios.get(`/irsa/irsa/${Number(compteId)}/${Number(id)}/${Number(selectedExerciceId)}`);
        setAllIrsaData(res.data.list || []);
      } catch (e) {
        toast.error("Erreur lors du chargement des données IRSA");
      }
    };
    fetchIrsa();
  }, [selectedExerciceId]);

  // --- Filtrage selon mois/année sélectionnés ---
  useEffect(() => {
    const filtered = allIrsaData.filter(row =>
      row.mois === valSelectMois && String(row.annee) === String(valSelectAnnee)
    );
    setIrsaData(filtered);
  }, [allIrsaData, valSelectMois, valSelectAnnee]);

  // États pour les informations du dossier
  const [fileInfos, setFileInfos] = useState('');
  const [noFile, setNoFile] = useState(false);
  const [fileId, setFileId] = useState(0);
  const { id } = useParams();
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  useEffect(() => {
    setLoadingPaie(true);
    axios.get(`/paie/paie/${compteId}/${id}/${selectedExerciceId}`)
      .then(res => {
        if (res.data.state && Array.isArray(res.data.list)) {
          setPaieData(res.data.list);
          // Log pour debug : structure réelle des lignes paie
          console.log('[DEBUG] paieData après fetch:', res.data.list);
        } else {
          setPaieData([]);
        }
      })
      .catch(() => setPaieData([]))
      .finally(() => setLoadingPaie(false));
  }, []);

  // State for add menu and modal form
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  // State for indemnite and avantage options
  const [indemniteOptions, setIndemniteOptions] = useState([]);
  const [avantageOptions, setAvantageOptions] = useState([]);

  // State for modal add
  const handleOpenModal = () => setOpenModal2(true);
  const handleOpenModal2 = () => setOpenModal(true);
  // State for data grid
  const [loading, setLoading] = useState(true);

  // State for personnel
  const [personnels, setPersonnels] = useState([]);

  // Logs de debug pour afficher la structure des données IRSA et personnels
  useEffect(() => {
    if (irsaData.length > 0) {

    }
  }, [irsaData]);
  useEffect(() => {
    if (personnels.length > 0) {

    }
  }, [personnels]);

  // Synchronise l'objet personnel sur chaque ligne IRSA dès que irsaData ou personnels changent
  useEffect(() => {
    if (irsaData.length > 0 && personnels.length > 0) {
      setIrsaData(irsaData => irsaData.map(row => {
        if (row.personnel && row.personnel.id === row.personnelId) return row;
        return {
          ...row,
          personnel: personnels.find(p => p.id === row.personnelId) || null
        };
      }));
    }
  }, [personnels, irsaData]);

  // State for paie data
  const [paieData, setPaieData] = useState([]);

  // Synchronise l'objet personnel sur chaque ligne PAIE dès que paieData ou personnels changent
  useEffect(() => {
    if (paieData.length > 0 && personnels.length > 0) {
      setPaieData(paieData => paieData.map(row => {
        // Si l'objet personnel est déjà synchronisé correctement, on le garde
        const personnelId = row.personnel_id ?? row.personnelId;
        if (row.personnel && row.personnel.id === personnelId) return row;

        // Sinon, on trouve et attache l'objet personnel correspondant
        const foundPersonnel = personnels.find(p => p.id === personnelId);
        return {
          ...row,
          personnel: foundPersonnel || null
        };
      }));
    }
  }, [personnels, paieData]);

  // State for selection and edition
  const [selectedRowId, setSelectedRowId] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [newRow, setNewRow] = useState(null);
  const [disableModifyBouton, setDisableModifyBouton] = useState(true);
  const [disableCancelBouton, setDisableCancelBouton] = useState(true);
  const [disableSaveBouton, setDisableSaveBouton] = useState(true);
  const [disableDeleteBouton, setDisableDeleteBouton] = useState(true);

  //Valeur du listbox choix du mois-----------------------------------------------------
  const currentYear = new Date().getFullYear();

  // State for exercice and periode
  const [listeExercice, setListeExercice] = useState([]);
  const [listeSituation, setListeSituation] = useState([]);
  const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);

  // State for association and bank
  const [associeData, setAssocieData] = useState([]);
  const [domBankData, setDomBankData] = useState([]);

  // State for row modes
  const [rowModesModel, setRowModesModel] = useState({});

  // Tri IRSA : asc/desc sur Nom
  const [irsaSort, setIrsaSort] = useState({ direction: null, column: null });
  // Tri PAIE : asc/desc sur colonne
  const [paieSort, setPaieSort] = useState({ direction: null, column: null });

  // Handler de tri générique pour VirtualTableIrsa
  const handleSortIrsa = (direction, columnId) => {
    const colDef = irsaColumns.find(c => c.id === columnId);
    if (!colDef) return;

    // Pour "personnel_nom" ou toute colonne avec valueGetter, vérifier la présence de la donnée
    if (colDef.valueGetter && irsaData.some(row => colDef.valueGetter({ row }) === undefined)) {
      toast.error("Le tri n'est possible que lorsque toutes les données sont synchronisées.");
      return;
    }

    setIrsaSort({ direction, column: columnId });

    setIrsaData(prev => {
      const sorted = [...prev].sort((a, b) => {
        let valA, valB;
        if (colDef.valueGetter && typeof colDef.valueGetter === 'function') {
          valA = colDef.valueGetter({ row: a });
          valB = colDef.valueGetter({ row: b });
        } else {
          valA = a[columnId];
          valB = b[columnId];
        }
        // Gestion du tri numérique ou texte
        if (colDef.isnumber) {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else {
          valA = (valA ?? '').toString().toLowerCase();
          valB = (valB ?? '').toString().toLowerCase();
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  };

  // Handler de tri générique pour VirtualTablePaie
  const handleSortPaie = (direction, columnId) => {
    const colDef = paieColumns.find(c => c.id === columnId);
    if (!colDef) return;
    // Pour les colonnes avec valueGetter, vérifier la présence de la donnée synchronisée
    if (colDef.valueGetter && paieData.some(row => colDef.valueGetter({ row }) === undefined)) {
      toast.error("Le tri n'est possible que lorsque toutes les données sont synchronisées.");
      return;
    }
    setPaieSort({ direction, column: columnId });
    setPaieData(prev => {
      const sorted = [...prev].sort((a, b) => {
        let valA, valB;
        if (colDef.valueGetter && typeof colDef.valueGetter === 'function') {
          valA = colDef.valueGetter({ row: a });
          valB = colDef.valueGetter({ row: b });
        } else {
          valA = a[columnId];
          valB = b[columnId];
        }
        if (colDef.isnumber) {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else {
          valA = (valA ?? '').toString().toLowerCase();
          valB = (valB ?? '').toString().toLowerCase();
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  };

  const [nbrEnfant, setNbrEnfant] = useState(0);

  // 1. useState : état initial
  const [formData, setFormData] = useState({
    personnel_id: '',
    salaireBase: '',
    heuresSupp: '',
    primeGratification: '',
    autres: '',
    salaireBrut: '',
    cnapsRetenu: '',
    ostie: '',
    salaireNet: '',
    autreDeduction: '',
    montantImposable: '',
    impotCorrespondant: '',
    impotDu: '',
    indemniteImposable: '',
    indemniteNonImposable: '',
    avantageImposable: '',
    avantageExonere: '',
    nombre_enfants_charge: nbrEnfant,
    reductionChargeFamille: nbrEnfant * 2000,
  });

  // 2. useStete : etatt initial du paie
  const [paieFormData, setPaieFormData] = useState({
    personnel_id: '',
    salaireBase: '',
    prime: '',
    heuresSup: '',
    indemnites: '',
    remunerationFerieDimanche: '',
    salaireBrutNumeraire: '',
    assurance: '',
    carburant: '',
    entretienReparation: '',
    totalDepensesVehicule: '',
    totalAvantageNatureVehicule: '',
    loyerMensuel: '',
    remunerationFixe25: '',
    avantageNatureLoyer: '',
    depenseTelephone: '',
    avantageNatureTelephone: '',
    autresAvantagesNature: '',
    totalAvantageNature: '',
    salaireBrut20: '',
    cnapsEmployeur: '',
    baseImposable: '',
    // Nouveaux champs paie
    totalSalaireBrut: '',
    irsaBrut: '',
    nombre_enfants_charge: nbrEnfant,
    deductionEnfants: nbrEnfant * 2000,
    irsaNet: '',
    salaireNet: '',
    avanceQuinzaineAutres: '',
    avancesSpeciales: '',
    allocationFamiliale: '',
    netAPayerAriary: '',
    partPatronalCnaps: '',
    partPatronalOstie: '',
  });

  const prepareIrsaForSave = (row) => {
    return {
      personnelId: row.personnel?.id || row.personnel_id,
      indemniteImposable: row.indemniteImposable,
      indemniteNonImposable: row.indemniteNonImposable,
      avantageImposable: row.avantageImposable,
      avantageExonere: row.avantageExonere,
      salaireBase: row.salaireBase,
      heuresSupp: row.heuresSupp,
      primeGratification: row.primeGratification,
      autres: row.autres,
      salaireBrut: row.salaireBrut,
      cnapsRetenu: row.cnapsRetenu,
      ostie: row.ostie,
      salaireNet: row.salaireNet,
      autreDeduction: row.autreDeduction,
      montantImposable: row.montantImposable,
      impotCorrespondant: row.impotCorrespondant,
      reductionChargeFamille: row.reductionChargeFamille,
      impotDu: row.impotDu,
      mois: row.mois,
      annee: row.annee,
    };
  };

  const prepareForSavePaie = (row) => {
    return {
      // Données de base
      personnelId: row.personnel?.id || row.personnel_id,
      mois: Number(row.mois),
      annee: Number(row.annee),

      // Saisie directe (cast Number ou null)
      salaireBase: row.salaireBase !== '' ? Number(row.salaireBase) : null,
      prime: row.prime !== '' ? Number(row.prime) : null,
      heuresSup: row.heuresSup !== '' ? Number(row.heuresSup) : null,
      indemnites: row.indemnites !== '' ? Number(row.indemnites) : null,
      remunerationFerieDimanche: row.remunerationFerieDimanche !== '' ? Number(row.remunerationFerieDimanche) : null,
      assurance: row.assurance !== '' ? Number(row.assurance) : null,
      carburant: row.carburant !== '' ? Number(row.carburant) : null,
      entretienReparation: row.entretienReparation !== '' ? Number(row.entretienReparation) : null,
      loyerMensuel: row.loyerMensuel !== '' ? Number(row.loyerMensuel) : null,
      depenseTelephone: row.depenseTelephone !== '' ? Number(row.depenseTelephone) : null,
      autresAvantagesNature: row.autresAvantagesNature !== '' ? Number(row.autresAvantagesNature) : null,
      avanceQuinzaineAutres: row.avanceQuinzaineAutres !== '' ? Number(row.avanceQuinzaineAutres) : null,
      avancesSpeciales: row.avancesSpeciales !== '' ? Number(row.avancesSpeciales) : null,
      allocationFamiliale: row.allocationFamiliale !== '' ? Number(row.allocationFamiliale) : null,

      // Champs calculés (cast Number ou null)
      salaireBrutNumeraire: row.salaireBrutNumeraire !== '' ? Number(row.salaireBrutNumeraire) : null,
      totalDepensesVehicule: row.totalDepensesVehicule !== '' ? Number(row.totalDepensesVehicule) : null,
      totalAvantageNatureVehicule: row.totalAvantageNatureVehicule !== '' ? Number(row.totalAvantageNatureVehicule) : null,
      remunerationFixe25: row.remunerationFixe25 !== '' ? Number(row.remunerationFixe25) : null,
      avantageNatureLoyer: row.avantageNatureLoyer !== '' ? Number(row.avantageNatureLoyer) : null,
      avantageNatureTelephone: row.avantageNatureTelephone !== '' ? Number(row.avantageNatureTelephone) : null,
      totalAvantageNature: row.totalAvantageNature !== '' ? Number(row.totalAvantageNature) : null,
      salaireBrut20: row.salaireBrut20 !== '' ? Number(row.salaireBrut20) : null,
      cnapsEmployeur: row.cnapsEmployeur !== '' ? Number(row.cnapsEmployeur) : null,
      ostieEmployeur: row.ostieEmployeur !== '' ? Number(row.ostieEmployeur) : null,
      baseImposable: row.baseImposable !== '' ? Number(row.baseImposable) : null,
      totalSalaireBrut: row.totalSalaireBrut !== '' ? Number(row.totalSalaireBrut) : null,
      irsaBrut: row.irsaBrut !== '' ? Number(row.irsaBrut) : null,
      deductionEnfants: row.deductionEnfants !== '' ? Number(row.deductionEnfants) : null,
      irsaNet: row.irsaNet !== '' ? Number(row.irsaNet) : null,
      salaireNet: row.salaireNet !== '' ? Number(row.salaireNet) : null,
      netAPayerAriary: row.netAPayerAriary !== '' ? Number(row.netAPayerAriary) : null,
      partPatronalCnaps: row.partPatronalCnaps !== '' ? Number(row.partPatronalCnaps) : null,
      partPatronalOstie: row.partPatronalOstie !== '' ? Number(row.partPatronalOstie) : null,
    };
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Calcul IRSA 
  const processRowUpdateIrsa = (updatedRow) => {
    try {
      if (updatedRow.personnel_id) {
        const selectedPersonnel = updatedRow.personnel || personnels.find(p => p.id === updatedRow.personnel_id);
        if (selectedPersonnel) {
          const nbrEnfant = selectedPersonnel?.nombre_enfants_charge || 0;
          const reductionChargeFamille = nbrEnfant * 2000;
          updatedRow = { ...updatedRow, reductionChargeFamille: reductionChargeFamille.toFixed(2) };
        }
      }

      const salaireBase = Number(updatedRow.salaireBase) || 0;
      const heuresSupp = Number(updatedRow.heuresSupp) || 0;
      const primeGratification = Number(updatedRow.primeGratification) || 0;
      const autres = Number(updatedRow.autres) || 0;
      const indemniteImposable = Number(updatedRow.indemniteImposable) || 0;
      const avantageImposable = Number(updatedRow.avantageImposable) || 0;
      const salaireBrut = salaireBase + heuresSupp + primeGratification + autres + indemniteImposable + avantageImposable;
      const salaireBrutFixed = Number.isNaN(salaireBrut) ? '0.00' : salaireBrut.toFixed(2);
      const cnapsRetenuCalc = +(salaireBrut * 0.01).toFixed(2);
      const ostieCalc = +(salaireBrut * 0.01).toFixed(2);
      const salaireNetCalc = +(salaireBrut - cnapsRetenuCalc - ostieCalc).toFixed(2);

      // CALCUL IMPOT DU SELON BAREME
      let base = salaireBrut;
      let calcul = 0;
      if (base <= 400000) {
        calcul = (base - 350000) * 0.05;
      } else if (base <= 500000) {
        calcul = 2500 + (base - 400000) * 0.10;
      } else if (base <= 600000) {
        calcul = 12500 + (base - 500000) * 0.15;
      } else if (base > 600000) {
        calcul = 27500 + (base - 600000) * 0.20;
      }
      const impotDuCalc = calcul <= 3000 ? 3000 : calcul;

      setFormData((prev) => ({
        ...prev,
        salaireBrut: salaireBrutFixed,
        cnapsRetenu: cnapsRetenuCalc,
        ostie: ostieCalc,
        salaireNet: salaireNetCalc,
        impotDu: impotDuCalc,
      }));
      return {
        ...updatedRow,
        salaireBrut: salaireBrutFixed,
        cnapsRetenu: cnapsRetenuCalc,
        ostie: ostieCalc,
        salaireNet: salaireNetCalc,
        impotDu: impotDuCalc,
      };
    } catch (error) {
      console.error('Erreur dans processRowUpdateIrsa:', error);
      toast.error('Erreur lors de la mise à jour IRSA');
      throw error;
    }
  };

  // Fonction de calcul automatique réutilisable pour la DataGrid paie
  const createCalculationEditCellPaie = (fieldName) => {
    return (params) => {
      const handleChange = async (event) => {
        const newValue = event.target.value;
        // Met à jour la cellule dans la DataGrid
        await params.api.setEditCellValue({
          id: params.id,
          field: fieldName,
          value: newValue,
        });
        // Récupère la ligne courante, applique le calcul et met à jour le state
        const currentRow = params.api.getRow(params.id);
        if (currentRow) {
          const updatedRow = { ...currentRow, [fieldName]: newValue };
          const recalculatedRow = processRowUpdatePaie(updatedRow);
          setPaieData(prev => prev.map(row => row.id === recalculatedRow.id ? recalculatedRow : row));
        }
      };
      return (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={params.value || ''}
          onChange={handleChange}
          inputProps={{ style: { textAlign: 'right' }, step: '0.01' }}
          autoFocus
        />
      );
    };
  };

  // --- Calcul PAIE (grille paie complète)
  const processRowUpdatePaie = (updatedRow) => {
    console.log('[PAIE] processRowUpdatePaie - updatedRow avant calcul:', updatedRow);
    try {
      let selectedPersonnel = updatedRow.personnel || (personnels && personnels.find(p => p.id === updatedRow.personnel_id));
      let nbrEnfant = selectedPersonnel?.nombre_enfants_charge || 0;
      let deductionEnfants = nbrEnfant * 2000;
      updatedRow = { ...updatedRow, deductionEnfants: deductionEnfants.toFixed(2) };
      const salaireBase = Number(updatedRow.salaireBase) || 0;
      const prime = Number(updatedRow.prime) || 0;
      const heuresSupp = parseFloat(updatedRow.heuresSup) || 0;
      const indemnites = Number(updatedRow.indemnites) || 0;
      const remunerationFerieDimanche = Number(updatedRow.remunerationFerieDimanche) || 0;
      const assurance = Number(updatedRow.assurance) || 0;
      const carburant = Number(updatedRow.carburant) || 0;
      const entretienReparation = Number(updatedRow.entretienReparation) || 0;
      const loyerMensuel = Number(updatedRow.loyerMensuel) || 0;
      const depenseTelephone = Number(updatedRow.depenseTelephone) || 0;
      const autresAvantagesNature = Number(updatedRow.autresAvantagesNature) || 0;
      const avanceQuinzaineAutres = Number(updatedRow.avanceQuinzaineAutres) || 0;
      const avancesSpeciales = Number(updatedRow.avancesSpeciales) || 0;
      const allocationFamiliale = Number(updatedRow.allocationFamiliale) || 0;
      // Calculs principaux
      const salaireBrutNumeraire = salaireBase + prime + heuresSupp + indemnites + remunerationFerieDimanche;
      const remunerationFixe25 = salaireBrutNumeraire * 0.25;
      const salaireBrut20 = salaireBrutNumeraire * 0.20;
      const totalDepensesVehicule = assurance + carburant + entretienReparation;
      const totalAvantageNatureVehicule = totalDepensesVehicule * 0.15;
      const avantageNatureLoyer = (loyerMensuel * 0.5 > remunerationFixe25) ? remunerationFixe25 : loyerMensuel * 0.5;
      const avantageNatureTelephone = depenseTelephone * 0.15;
      const totalAvantageNature = totalAvantageNatureVehicule + avantageNatureLoyer + avantageNatureTelephone + autresAvantagesNature;
      const totalSalaireBrut = (totalAvantageNature > salaireBrut20) ? salaireBrutNumeraire + salaireBrut20 : salaireBrutNumeraire + totalAvantageNature;
      const montantPlafond = 2101440;
      const partPatronalCnaps = ((salaireBrutNumeraire + totalAvantageNature) < montantPlafond) ? (salaireBrutNumeraire + totalAvantageNature) * 0.13 : montantPlafond * 0.13;
      const partPatronalOstie = ((salaireBrutNumeraire + totalAvantageNature) < montantPlafond) ? totalSalaireBrut * 0.05 : montantPlafond * 0.05;
      const cnapsEmployeur = totalSalaireBrut * 0.01;
      const ostieEmployeur = totalSalaireBrut * 0.01;
      const baseImposable = totalSalaireBrut - cnapsEmployeur - ostieEmployeur;
      let calcul = 0;
      if (baseImposable <= 400000) {
        calcul = (baseImposable - 350000) * 0.05;
      } else if (baseImposable <= 500000) {
        calcul = 2500 + (baseImposable - 400000) * 0.10;
      } else if (baseImposable <= 600000) {
        calcul = 12500 + (baseImposable - 500000) * 0.15;
      } else if (baseImposable > 600000) {
        calcul = 27500 + (baseImposable - 600000) * 0.20;
      }
      let impotDuCalc = calcul <= 3000 ? 3000 : calcul;
      let irsaNetCalc = Math.max(impotDuCalc - deductionEnfants, 3000);
      // Calcul salaire net et net à payer
      const salaireNet = salaireBrutNumeraire - cnapsEmployeur - ostieEmployeur - irsaNetCalc;
      const netAPayerAriary = salaireNet - avanceQuinzaineAutres - avancesSpeciales - allocationFamiliale;
      return {
        ...updatedRow,
        deductionEnfants: deductionEnfants.toFixed(2),
        salaireBrutNumeraire: salaireBrutNumeraire.toFixed(2),
        remunerationFixe25: remunerationFixe25.toFixed(2),
        salaireBrut20: salaireBrut20.toFixed(2),
        totalDepensesVehicule: totalDepensesVehicule.toFixed(2),
        totalAvantageNatureVehicule: totalAvantageNatureVehicule.toFixed(2),
        avantageNatureLoyer: avantageNatureLoyer.toFixed(2),
        avantageNatureTelephone: avantageNatureTelephone.toFixed(2),
        totalAvantageNature: totalAvantageNature.toFixed(2),
        totalSalaireBrut: totalSalaireBrut.toFixed(2),
        partPatronalCnaps: partPatronalCnaps.toFixed(2),
        partPatronalOstie: partPatronalOstie.toFixed(2),
        cnapsEmployeur: cnapsEmployeur.toFixed(2),
        ostieEmployeur: ostieEmployeur.toFixed(2),
        baseImposable: baseImposable.toFixed(2),
        irsaBrut: impotDuCalc.toFixed(2),
        irsaNet: irsaNetCalc.toFixed(2),
        salaireNet: salaireNet.toFixed(2),
        netAPayerAriary: netAPayerAriary.toFixed(2),
      };
    } catch (error) {
      console.error('Erreur dans processRowUpdatePaie:', error);
      toast.error('Erreur lors de la mise à jour de la fiche de paie');
      throw error;
    }
  };

  const handleProcessRowUpdatePaie = (updatedRow) => {
    const calculatedRow = processRowUpdatePaie(updatedRow);
    setPaieData(prev => prev.map(row => (row.id === calculatedRow.id ? calculatedRow : row)));
    return calculatedRow;
  }

  const GetInfosIdDossier = (id) => {
    axios.get(`/home/FileInfos/${id}`).then((response) => {
      const resData = response.data;

      if (resData.state) {
        setFileInfos(resData.fileInfos[0]);
        setAssocieData(resData.associe);
        setDomBankData(resData.domBank);
        setNoFile(false);
      } else {
        setFileInfos([]);
        setAssocieData([]);
        setDomBankData([]);
        setNoFile(true);
      }
    })
  }

  const sendToHome = (value) => {
    setNoFile(!value);
    navigate('/tab/home');
  }

  const handleChangeMois = (event) => {
    setValSelectMois(event.target.value);
  };

  // Gestion de la sélection
  const saveSelectedRow = (ids) => {
    if (ids.length === 1) {
      setSelectedRowId(ids);
      setDisableModifyBouton(false);
      setDisableSaveBouton(false);
      setDisableCancelBouton(false);
      setDisableDeleteBouton(false);
    } else {
      setSelectedRowId([]);
      setDisableModifyBouton(true);
      setDisableSaveBouton(true);
      setDisableCancelBouton(true);
      setDisableDeleteBouton(true);
    }
  };

  const handleChangeExercice = (exercice_id) => {
    setSelectedExerciceId(exercice_id);
    setSelectedPeriodeChoiceId("0");
    setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
    setSelectedPeriodeId(exercice_id);
    // Charger les années pour l'exercice sélectionné
    GetDateDebutFinExercice(exercice_id);
  }

  //Récupérer la liste des exercices
  const GetListeExercice = (id) => {
    axios.get(`/paramExercice/listeExercice/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {

        setListeExercice(resData.list);

        const exerciceNId = resData.list?.filter((item) => item.libelle_rang === "N");
        setListeSituation(exerciceNId);

        // Vérifier que exerciceNId contient au moins un élément
        if (exerciceNId && exerciceNId.length > 0) {
          setSelectedExerciceId(exerciceNId[0].id);
          setSelectedPeriodeChoiceId(0);
          setSelectedPeriodeId(exerciceNId[0].id);
          // Charger les années pour l'exercice initial
          GetDateDebutFinExercice(exerciceNId[0].id);
        } else {
          // Si aucun exercice "N" trouvé, prendre le premier exercice disponible
          if (resData.list && resData.list.length > 0) {
            setSelectedExerciceId(resData.list[0].id);
            setSelectedPeriodeChoiceId(0);
            setSelectedPeriodeId(resData.list[0].id);
            setListeSituation([resData.list[0]]);
            // Charger les années pour l'exercice initial
            GetDateDebutFinExercice(resData.list[0].id);
          }
        }

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

  //Choix période
  const handleChangePeriode = (choix) => {
    setSelectedPeriodeChoiceId(choix);

    if (choix === 0) {
      setListeSituation(listeExercice?.filter((item) => item.id === selectedExerciceId));
      setSelectedPeriodeId(selectedExerciceId);
    } else if (choix === 1) {
      GetListeSituation(selectedExerciceId);
    }
  }

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // useEffect for salary calculation
  useEffect(() => {
    const base = parseFloat(formData.salaireBase) || 0;
    const supp = parseFloat(formData.heuresSupp) || 0;
    const prime = parseFloat(formData.primeGratification) || 0;
    const autres = parseFloat(formData.autres) || 0;
    const indemnite = parseFloat(formData.indemniteImposable) || 0;
    const avantage = parseFloat(formData.avantageImposable) || 0;

    const salaireBrut = base + supp + prime + autres + indemnite + avantage;

    // Vérifie que salaireBrut est bien un nombre avant d'utiliser toFixed
    const salaireBrutFixed = Number.isNaN(salaireBrut) ? '0.00' : salaireBrut.toFixed(2);
    const cnapsRetenuCalc = +(Number(salaireBrutFixed) * 0.01).toFixed(2);
    const ostieCalc = +(Number(salaireBrutFixed) * 0.01).toFixed(2);
    const salaireNetCalc = +(Number(salaireBrutFixed) - Number(cnapsRetenuCalc) - Number(ostieCalc)).toFixed(2);

    if (salaireBrutFixed !== formData.salaireBrut) {
      setFormData((prev) => ({
        ...prev,
        salaireBrut: salaireBrutFixed,
        cnapsRetenu: cnapsRetenuCalc,
        ostie: ostieCalc,
        salaireNet: salaireNetCalc,
      }));
    }
  }, [
    formData.salaireBase,
    formData.heuresSupp,
    formData.primeGratification,
    formData.autres,
    formData.indemniteImposable,
    formData.avantageImposable,
  ]);

  useEffect(() => {
    //tester si la page est renvoyer par useNavigate
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
    axios.get(`sociales/personnel/${compteId}/${id}`)
      .then(res => {
        if (res.data.state) setPersonnels(res.data.list);
        else setPersonnels([]);
      })
      .catch(() => setPersonnels([]));
  }, []);

  // Quand personnel_id change, on récupère les infos associées (par exemple via API)
  useEffect(() => {
    if (!formData.personnel_id) return; // si rien sélectionné, pas d’action

    axios.get(`/sociales/personnel/${formData.personnel_id}`).then(res => {
      if (res.data.state) {
        const nbEnfants = res.data.data.nombre_enfants_charge || 0;
        setFormData(prev => ({
          ...prev,
          nombre_enfants_charge: nbEnfants,
          reductionChargeFamille: nbEnfants * 2000
        }));
        // console.log('Nombre enfants:', nbEnfants);
      }
    });
  }, [formData.personnel_id]);

  useEffect(() => {
    setLoading(true);
    console.log(compteId, id, selectedExerciceId)
    axios.get(`/irsa/irsa/${Number(compteId)}/${Number(id)}/${Number(selectedExerciceId)}`)
      .then(res => {
        if (res.data.state) {
          // On mappe directement l'objet personnel si la liste des personnels est déjà chargée
          setIrsaData(res.data.list);
        } else {
          setIrsaData([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setIrsaData([]);
        setLoading(false);
      });
    // Charger la liste des personnels
    axios.get(`sociales/personnel/${compteId}/${id}`)
      .then(res => {
        if (res.data.state) {
          setPersonnels(res.data.list);
        } else {
          setPersonnels([]);
        }
      })
      .catch(() => {
        setPersonnels([]);
      });
  }, [isRefresh, compteId, id, selectedExerciceId]);

  useEffect(() => {
    if (isRefresh) {
      setLoading(true);
      axios.get(`/irsa/irsa/${compteId}/${id}/${selectedExerciceId}`)
        .then(res => {
          if (res.data.state && Array.isArray(res.data.list)) {
            setIrsaData(res.data.list);
          } else {
            setIrsaData([]);
          }
        })
        .catch(() => setIrsaData([]))
        .finally(() => {
          setLoading(false);
          setIsRefresh(false); // très important pour éviter la boucle infinie !
        });
    }
  }, [isRefresh]);

  // --- Ajout et édition inline IRSA ---
  const [editRowId, setEditRowId] = useState(null); // id de la ligne en édition/ajout
  const [editRowData, setEditRowData] = useState(null); // valeurs en cours de saisie
  // --- Modal édition IRSA ---
  const [editRowModal, setEditRowModal] = useState(null); // ligne à modifier via modal
  const [openModalIrsa, setOpenModalIrsa] = useState(false);

  const handleAddClick = () => {

    // Génère un id négatif pour éviter les collisions
    const minId = Math.min(0, ...irsaData.map(r => typeof r.id === 'number' ? r.id : 0));
    const newId = minId - 1;
    // Initialiser tous les champs calculés à 0
    const emptyRow = {
      id: newId,
      personnel_id: null,
      personnel: null,
      indemniteImposable: 0,
      indemniteNonImposable: 0,
      avantageImposable: 0,
      avantageExonere: 0,
      salaireBase: 0,
      heuresSupp: 0,
      primeGratification: 0,
      autres: 0,
      salaireBrut: 0,
      cnapsRetenu: 0,
      ostie: 0,
      salaireNet: 0,
      autreDeduction: 0,
      montantImposable: 0,
      impotCorrespondant: 0,
      nombre_enfants_charge: 0,
      reductionChargeFamille: 0,
      impotDu: 0,
      mois: valSelectMois,
      annee: valSelectAnnee,
    };
    setIrsaData(prev => [...prev, emptyRow]);
    setEditRowId(newId);
    setEditRowData(emptyRow);
  };

  // Quand on modifie une cellule inline
  const handleEditChange = (field, value) => {
    setEditRowData(prev => ({ ...prev, [field]: value }));
  };

  // Validation de la ligne (ajout ou édition)
  const handleEditSave = () => {
    setIrsaData(prev => prev.map(row => row.id === editRowId ? { ...editRowData } : row));
    setEditRowId(null);
    setEditRowData(null);
  };

  // Annulation de l'édition/ajout
  const handleEditCancel = () => {
    // Si c'est une nouvelle ligne (id négatif), on la retire
    if (editRowId < 0) {
      setIrsaData(prev => prev.filter(row => row.id !== editRowId));
    }
    setEditRowId(null);
    setEditRowData(null);
  };

  //     console.log('[PAIE] handleAddClickPaie - ajout nouvelle ligne paie');
  //     if (newRow) return;
  //     const minId = Math.min(0, ...paieData.map(r => typeof r.id === 'number' ? r.id : 0));
  //     const newId = minId - 1;

  // const emptyRow = {
  //       id: newId,
  //       personnelId: null,
  //       personnel: null,
  //       salaireBase: '',
  //       prime: '',
  //       heuresSup: '',
  //       indemnites: '',
  //       remunerationFerieDimanche: '',
  //       salaireBrutNumeraire: '',
  //       assurance: '',
  //       carburant: '',
  //       entretienReparation: '',
  //       totalDepensesVehicule: '',
  //       totalAvantageNatureVehicule: '',
  //       loyerMensuel: '',
  //       remunerationFixe25: '',
  //       avantageNatureLoyer: '',
  //       depenseTelephone: '',
  //       avantageNatureTelephone: '',
  //       autresAvantagesNature: '',
  //       totalAvantageNature: '',
  //       salaireBrut20: '',
  //       cnapsEmployeur: '',
  //       baseImposable: '',
  //       ostieEmployeur: '',
  //       totalSalaireBrut: '',
  //       irsaBrut: '',
  //       deductionEnfants: '',
  //       irsaNet: '',
  //       salaireNet: '',
  //       avanceQuinzaineAutres: '',
  //       avancesSpeciales: '',
  //       allocationFamiliale: '',
  //       netAPayerAriary: '',
  //       partPatronalCnaps: '',
  //       partPatronalOstie: '',
  //       mois: valSelectMois,
  //       annee: valSelectAnnee,
  //     };
  // setPaieData(prev => [...prev, emptyRow]);
  // setNewRow(emptyRow);
  // setEditRow(null);
  // setSelectedRowId([newId]);
  // setRowModesModel(prev => ({ ...prev, [newId]: { mode: GridRowModes.Edit } }));
  // setDisableSaveBouton(false);
  // setDisableModifyBouton(true);
  // setDisableCancelBouton(false);
  // setDisableDeleteBouton(true);
  // };

  // Edition
  const handleEditClick = (ids) => () => {
    if (ids.length === 1) {
      const row = irsaData.find(r => r.id === ids[0]);
      setEditRow(row);
      setNewRow(null);
      setRowModesModel(prev => ({ ...prev, [ids[0]]: { mode: GridRowModes.Edit } }));
      setDisableSaveBouton(false);
      setDisableModifyBouton(true);
      setDisableCancelBouton(false);
      setDisableDeleteBouton(true);
    }
  };

  //Sauvegarde
  const handleSaveClick = (ids) => async () => {
    const row = irsaData.find(r => ids.includes(r.id));
    if (!row) {
      console.warn("Aucune ligne trouvée pour l’ID :", ids);
      return;
    }

    if (!row.personnel?.id && !row.personnel_id) {
      toast.error("Veuillez choisir un personnel avant de sauvegarder !");
      return;
    }

    const dataToSend = prepareIrsaForSave(row);

    // Normalise les champs vides
    Object.keys(dataToSend).forEach(k => {
      if (dataToSend[k] === '') dataToSend[k] = null;
    });

    try {
      let res;
      if (row.id < 0) {
        // POST (nouvelle ligne)
        res = await axios.post('/irsa/irsa', dataToSend);
      } else {
        // PUT (mise à jour)
        res = await axios.put(`/irsa/irsa/${row.id}`, dataToSend);
      }

      // console.log("✅ Réponse API :", res.data);

      if (res.data.state) {
        const refreshed = await axios.get(`/irsa/irsa/${compteId}/${id}/${selectedExerciceId}`);
        setIrsaData(refreshed.data.list);
      } else {
        toast.error("Une erreur est survenue lors de la sauvegarde");
      }
    } catch (e) {
      console.error("❌ Erreur API :", e);
      if (e.response) console.error("💬 Erreur réponse serveur :", e.response.data);
      toast.error("Erreur lors de la sauvegarde");
    }
    // Réinitialiser l'état UI
    setEditRow(null);
    setNewRow(null);
    setRowModesModel({});
    setSelectedRowId([]);
    setDisableSaveBouton(true);
    setDisableModifyBouton(true);
    setDisableCancelBouton(true);
    setDisableDeleteBouton(true);
  };

  const handleSaveClickPaie = (ids) => async () => {
    console.log('[PAIE] handleSaveClickPaie - ids:', ids);

    const idToSave = ids[0]; // suppose une seule ligne à la fois
    if (idToSave == null) return;

    // 🔄 Récupère la ligne depuis la grille (données réellement affichées)
    const row = apiRef.current.getRow(idToSave);

    console.log("[PAIE] Ligne depuis la grille avant recalcul :", row);

    if (!row || (!row.personnel?.id && !row.personnel_id)) {
      toast.error("Veuillez choisir un personnel avant de sauvegarder !");
      return;
    }

    // 🧠 Appliquer le calcul avant la sauvegarde
    const updatedRow = processRowUpdatePaie(row); // ⚠️ Ajoute `return updatedRow;` à la fin de cette fonction
    console.log("[PAIE] processRowUpdatePaie - updatedRow:", updatedRow);

    // 🔁 Met à jour le state local avec les nouvelles valeurs
    setPaieData((prev) =>
      prev.map((r) => (r.id === idToSave ? updatedRow : r))
    );

    // 🧾 Préparation des données à envoyer
    const dataToSend = prepareForSavePaie(updatedRow);
    console.log("[PAIE] handleSaveClickPaie - dataToSend avant normalisation:", dataToSend);

    // 🧼 Nettoyage des champs vides
    Object.keys(dataToSend).forEach((k) => {
      if (dataToSend[k] === '') dataToSend[k] = null;
    });

    console.log("[PAIE] handleSaveClickPaie - dataToSend après normalisation:", dataToSend);

    try {
      let res;
      if (idToSave < 0) {
        // POST (nouvelle ligne)
        res = await axios.post('/paie/paie', dataToSend);
      } else {
        // PUT (mise à jour)
        res = await axios.put(`/paie/paie/${idToSave}`, dataToSend);
      }

      if (res.data.state) {
        const refreshed = await axios.get(`/paie/paie/${compteId}/${id}/${selectedExerciceId}`);
        setPaieData(refreshed.data.list);
        toast.success("Sauvegarde réussie !");
      } else {
        toast.error("Une erreur est survenue lors de la sauvegarde");
      }
    } catch (e) {
      console.error("❌ Erreur API :", e);
      toast.error("Erreur lors de la sauvegarde");
    }

    // 🔁 Réinitialisation UI
    setEditRow(null);
    setNewRow(null);
    setRowModesModel({});
    setSelectedRowId([]);
    setDisableSaveBouton(true);
    setDisableModifyBouton(true);
    setDisableCancelBouton(true);
    setDisableDeleteBouton(true);
  };
  // Annulation
  const handleCancelClick = (ids) => () => {
    setEditRow(null);
    setNewRow(null);
    setRowModesModel({});
    setSelectedRowId([]);
    setDisableSaveBouton(true);
    setDisableModifyBouton(true);
    setDisableCancelBouton(true);
    setDisableDeleteBouton(true);
    if (newRow) {
      setPaieData(paieData.filter(r => r.id !== newRow.id));
    }
  };
  //Suppression
  const handleDeleteClick = async () => {
    if (selectedRowId.length === 1) {
      const idToDelete = selectedRowId[0];

      const confirmDelete = window.confirm("Voulez-vous vraiment supprimer cet élément ?");
      if (!confirmDelete) return;

      try {
        const response = await axios.delete(`/irsa/irsa/${idToDelete}`);

        if (response.data.state === true) {
          setIrsaData(irsaData.filter((row) => row.id !== idToDelete));
          setEditRow(null);
          setNewRow(null);
          setRowModesModel({});
          setSelectedRowId([]);
          setDisableSaveBouton(true);
          setDisableModifyBouton(true);
          setDisableCancelBouton(true);
          setDisableDeleteBouton(true);
        } else {
          console.error('Erreur côté serveur :', response.data.msg);
          alert('Erreur : ' + response.data.msg);
        }
      } catch (error) {
        console.error('Erreur requête DELETE :', error);
        alert('Échec de la suppression');
      }
    }
  };

  const handleDeleteAllIrsa = async () => {
    setOpenConfirmDeleteAllIrsa(false);
    try {
      // On sépare les lignes persistées (id>0) et locales (id<0)
      const idsToDelete = irsaData.filter(row => row.id > 0).map(row => row.id);
      // Suppression backend en parallèle
      await Promise.all(idsToDelete.map(id => axios.delete(`/irsa/irsa/${id}`)));
      // Suppression locale des lignes non persistées
      setIrsaData([]);
      // Recharge la liste IRSA depuis l'API pour affichage à jour
      const res = await axios.get(`/irsa/irsa/${compteId}/${id}/${selectedExerciceId}`);
      if (res.data && Array.isArray(res.data.list)) {
        setIrsaData(res.data.list);
      }
      toast.success('Toutes les lignes IRSA ont été supprimées.');
    } catch (e) {
      toast.error('Erreur lors de la suppression totale IRSA');
      console.error(e);
    }
  };

  // Handler suppression TOUT PAIE
  const handleDeleteAllPaie = async () => {
    setOpenConfirmDeleteAllPaie(false);
    try {
      // On sépare les lignes persistées (id>0) et locales (id<0)
      const idsToDelete = paieData.filter(row => row.id > 0).map(row => row.id);
      await Promise.all(idsToDelete.map(id => axios.delete(`/paie/paie/${id}`)));
      setPaieData([]);
      // Recharge la liste paie depuis l'API pour affichage à jour
      const res = await axios.get(`/paie/paie/${compteId}/${id}/${selectedExerciceId}`);
      if (res.data && Array.isArray(res.data.list)) {
        setPaieData(res.data.list);
      }
      toast.success('Toutes les lignes PAIE ont été supprimées.');
    } catch (e) {
      toast.error('Erreur lors de la suppression totale PAIE');
      console.error(e);
    }
  };

  const handleDeleteClickPaie = async () => {
    if (selectedRowId.length === 1) {
      const idToDelete = selectedRowId[0];

      const confirmDelete = window.confirm("Voulez-vous vraiment supprimer cet élément ?");
      if (!confirmDelete) return;

      try {
        const response = await axios.delete(`/paie/paie/${idToDelete}`);

        if (response.data.state === true) {
          setPaieData(paieData.filter((row) => row.id !== idToDelete));
          setEditRow(null);
          setNewRow(null);
          setRowModesModel({});
          setSelectedRowId([]);
          setDisableSaveBouton(true);
          setDisableModifyBouton(true);
          setDisableCancelBouton(true);
          setDisableDeleteBouton(true);
        } else {
          console.error('Erreur côté serveur :', response.data.msg);
          alert('Erreur : ' + response.data.msg);
        }
      } catch (error) {
        console.error('Erreur requête DELETE :', error);
        alert('Échec de la suppression');
      }
    }
  };

  //Recupérer l'année min et max de l'éxercice
  const getAnneesEntreDeuxDates = (dateDebut, dateFin) => {
    const debut = new Date(dateDebut).getFullYear();
    const fin = new Date(dateFin).getFullYear();
    const annees = [];

    for (let annee = debut; annee <= fin; annee++) {
      annees.push(annee);
    }
    return annees;
  };

  const [listeAnnee, setListeAnnee] = useState([])

  //Récupération des années à partir de l'exercice sélectionné
  const GetDateDebutFinExercice = (id) => {
    axios.get(`/paramExercice/listeExerciceById/${id}`).then((response) => {
      const resData = response.data;
      console.log("resData : ", resData);
      console.log("response.data.state : ", response.data.state);
      if (resData.state) {
        const annee = getAnneesEntreDeuxDates(resData.list.date_debut, resData.list.date_fin);
        console.log("Date début :", resData.list.date_debut);
        console.log("Date fin :", resData.list.date_fin);
        console.log("Annee :", annee);
        setListeAnnee(annee);
      }
    }).catch((error) => {
      toast.error(error)
    })
  }

  // Fonction de calcul automatique réutilisable
  const createCalculationEditCell = (fieldName) => {
    return (params) => {
      const handleChange = (event) => {
        const newValue = Number(event.target.value) || 0;
        console.log(`Calcul pour ${fieldName}:`, newValue);
        // 
        // Met à jour le champ actuel
        params.api.setEditCellValue({
          id: params.id,
          field: fieldName,
          value: newValue,
        });

        // Récupère IMMÉDIATEMENT les valeurs actuelles depuis l'API DataGrid
        const currentRow = params.api.getRow(params.id);
        // console.log('CurrentRow:', currentRow);

        if (currentRow) {
          // Utilise la nouvelle valeur pour le champ en cours de modification
          const salaireBase = fieldName === 'salaireBase' ? newValue : (Number(currentRow.salaireBase) || 0);
          const heuresSupp = fieldName === 'heuresSupp' ? newValue : (Number(currentRow.heuresSupp) || 0);
          const primeGratification = fieldName === 'primeGratification' ? newValue : (Number(currentRow.primeGratification) || 0);
          const autres = fieldName === 'autres' ? newValue : (Number(currentRow.autres) || 0);
          const indemniteImposable = fieldName === 'indemniteImposable' ? newValue : (Number(currentRow.indemniteImposable) || 0);
          const avantageImposable = fieldName === 'avantageImposable' ? newValue : (Number(currentRow.avantageImposable) || 0);
          // Calcule INSTANTANÉMENT le salaire brut
          const salaireBrut = salaireBase + heuresSupp + primeGratification + autres + indemniteImposable + avantageImposable;
          const cnapsRetenu = salaireBrut * 0.01;
          const ostie = salaireBrut * 0.01;
          const salaireNet = salaireBrut - cnapsRetenu - ostie;

          // Met à jour IMMÉDIATEMENT les champs calculés
          params.api.setEditCellValue({ id: params.id, field: 'salaireBrut', value: salaireBrut.toFixed(2) });
          params.api.setEditCellValue({ id: params.id, field: 'cnapsRetenu', value: cnapsRetenu.toFixed(2) });
          params.api.setEditCellValue({ id: params.id, field: 'ostie', value: ostie.toFixed(2) });
          params.api.setEditCellValue({ id: params.id, field: 'salaireNet', value: salaireNet.toFixed(2) });

          // Met à jour aussi les données dans le state pour synchronisation
          const updatedData = irsaData.map(row => {
            if (row.id === params.id) {
              return {
                ...row,
                [fieldName]: newValue,
                salaireBrut: salaireBrut.toFixed(2),
                cnapsRetenu: cnapsRetenu.toFixed(2),
                ostie: ostie.toFixed(2),
                salaireNet: salaireNet.toFixed(2)
              };
            }
            return row;
          });
          setIrsaData(updatedData);
        }
      };

      return (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={params.value || ''}
          onChange={handleChange}
          inputProps={{
            style: { textAlign: 'right' },
            step: '0.01'
          }}
        />
      );
    };
  };
  // Nouvelle structure de colonnes IRSA pour compatibilité avec VirtualTableModifiableEbilan et style bhiapcColumn
  const irsaColumns = [
    { id: 'personnel_id', label: 'Matricule', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.id ?? '', editable: true },
    { id: 'personnel_nom', label: 'Nom', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.nom || row.personnel_nom || '', editable: false },
    { id: 'personnel_prenom', label: 'Prénom', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.prenom || row.personnel_prenom || '', editable: false },
    { id: 'personnel_numero_cnaps', label: 'CNAPS', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.numero_cnaps || '', editable: false },
    { id: 'personnel_cin', label: 'CIN', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.cin_ou_carte_resident || '', editable: false },
    { id: 'personnel_fonction', label: 'Fonction', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.fonction?.nom || row.personnel_fonction || '', editable: false },
    { id: 'personnel_date_entree', label: 'Date-entrée', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.date_entree || '', editable: false, format: value => value ? new Date(value).toLocaleDateString('fr-FR') : '' },
    { id: 'personnel_date_sortie', label: 'Date-sortie', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.date_sortie || '', editable: false, format: value => value ? new Date(value).toLocaleDateString('fr-FR') : '' },
    { id: 'salaireBase', label: 'Salaire Base', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'heuresSupp', label: 'Heures Sup.', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'primeGratification', label: 'Prime/Grat.', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'autres', label: 'Autres', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'indemniteImposable', label: 'Indemnité Imposable', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'indemniteNonImposable', label: 'Indem Non_Imposable', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'avantageImposable', label: 'Avantage Imposable', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'avantageExonere', label: 'Avantage Exonéré', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'salaireBrut', label: 'Salaire Brut', minWidth: 200, align: 'right', isnumber: true, editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'cnapsRetenu', label: 'CNAPS Retenu', minWidth: 200, align: 'right', isnumber: true, editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'ostie', label: 'OSTIE', minWidth: 200, align: 'right', isnumber: true, editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'salaireNet', label: 'Salaire Net', minWidth: 200, align: 'right', isnumber: true, editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'autreDeduction', label: 'Autre Déduction', minWidth: 200, align: 'right', isnumber: true, editable: true, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'montantImposable', label: 'Montant Imposable', minWidth: 200, align: 'right', isnumber: true, editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'impotCorrespondant', label: 'Impôt Correspondant', minWidth: 200, align: 'right', isnumber: true, editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'reductionChargeFamille', label: 'Réduction Famille', minWidth: 200, align: 'right', isnumber: true, editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'impotDu', label: 'Impôt Dû', minWidth: 200, align: 'right', isnumber: true, editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' }
  ];

  const [filters, setFilters] = useState([
    { column: 'personnel_nom', operator: 'contains', value: '' }
  ]);
  {/* Filtre avancé colonne/opérateur/valeur */ }

  const operators = [
    { value: 'contains', label: 'contient' },
    { value: 'equals', label: 'égal' }
  ];

  const filterableColumns = irsaColumns.map(col => ({ value: col.id, label: col.label }));

  const filteredRows = filters.reduce((rows, filter) => {
    const col = filter.column;
    let val = '';
    const colDef = irsaColumns.find(c => c.id === col);
    return rows.filter(row => {
      // Utilise valueGetter si présent
      if (colDef && typeof colDef.valueGetter === 'function') {
        val = (colDef.valueGetter({ row }) || '').toString().toLowerCase();
      } else {
        val = (row[col] || '').toString().toLowerCase();
      }
      const search = (filter.value || '').toString().toLowerCase();
      if (filter.operator === 'contains') return val.includes(search);
      if (filter.operator === 'equals') return val === search;
      return true;
    });
  }, irsaData);

  const columnGroupingModel = [
    {
      groupId: 'group_date',
      headerName: 'DATE',
      children: [
        { field: 'personnel_date_entree' },
        { field: 'personnel_date_sortie' }
      ]
    }
  ];

  useEffect(() => {
    const externalScroll = scrollRef2.current;
    const dataGridScroller = document.querySelector('.MuiDataGrid-virtualScroller');

    if (!externalScroll || !dataGridScroller) return;

    // Lors du scroll de l'enveloppe externe, fais défiler le DataGrid
    const syncScroll = () => {
      dataGridScroller.scrollLeft = externalScroll.scrollLeft;
    };

    // Et vice versa
    const reverseSyncScroll = () => {
      externalScroll.scrollLeft = dataGridScroller.scrollLeft;
    };

    externalScroll.addEventListener('scroll', syncScroll);
    dataGridScroller.addEventListener('scroll', reverseSyncScroll);

    return () => {
      externalScroll.removeEventListener('scroll', syncScroll);
      dataGridScroller.removeEventListener('scroll', reverseSyncScroll);
    };
  }, []);

  /* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  //--- Paie --------------------------------------------------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    setLoading(true);
    axios.get(`/paie/paie/${compteId}/${id}/${selectedExerciceId}`)
      .then(response => {
        console.log("Reponse GET :paie/paie :", response.data);
        if (response.data.state && Array.isArray(response.data.list)) {
          setPaieData(response.data.list);
        } else {
          setPaieData([]);
        }
        setLoading(false);
      })
      .catch(error => {
        setPaieData([]);
        setLoading(false);
      });
    axios.get(`sociales/personnel/${compteId}/${id}`)
      .then(res => {
        if (res.data.state) {
          setPersonnels(res.data.list);
        } else {
          setPersonnels([]);
        }
      })
      .catch(() => {
        setPersonnels([]);
      });

  }, [isRefresh, selectedExerciceId]);

  const [loadingPaie, setLoadingPaie] = useState(false);

  const paieColumns = [
    { id: 'personnel_id', label: 'Matricule', minWidth: 100, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.id ?? '', editable: true },
    { id: 'personnel_nom', label: 'Nom', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.nom || row.personnel_nom || '', editable: false },
    { id: 'personnel_prenom', label: 'Prénom', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.prenom || row.personnel_prenom || '', editable: false },
    { id: 'personnel_fonction', label: 'Fonction', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.fonction?.nom || row.personnel_fonction || '', editable: false },
    { id: 'personnel_classification', label: 'Classification', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.classification?.classe || row.personnel_classification || '', editable: false },
    { id: 'personnel_date_entree', label: 'Date-entrée', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.date_entree || '', editable: false, format: value => value ? new Date(value).toLocaleDateString('fr-FR') : '' },
    { id: 'personnel_date_sortie', label: 'Date-sortie', minWidth: 200, align: 'left', isnumber: false, valueGetter: ({ row }) => row.personnel?.date_sortie || '', editable: false, format: value => value ? new Date(value).toLocaleDateString('fr-FR') : '' },
    {
      id: 'salaireBase',
      label: 'Salaire Base',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.salaireBase !== undefined && row.salaireBase !== null && row.salaireBase !== ''
          ? row.salaireBase
          : (row.personnel?.salaire_base || row.personnel_salaire_base || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'prime',
      label: 'Prime',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.prime !== undefined && row.prime !== null && row.prime !== ''
          ? row.prime
          : (row.personnel?.prime || row.personnel_prime || ''),
      editable: true
    },
    {
      id: 'heuresSup',
      label: 'Heures Supp',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.heuresSup !== undefined && row.heuresSup !== null && row.heuresSup !== ''
          ? row.heuresSup
          : (row.personnel?.heures_sup || row.personnel_heures_sup || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'indemnites',
      label: 'Indemnite',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.indemnites !== undefined && row.indemnites !== null && row.indemnites !== ''
          ? row.indemnites
          : (row.personnel?.indemnites || row.personnel_indemnites || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'remunerationFerieDimanche',
      label: 'Remuneration Ferie',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.remunerationFerieDimanche !== undefined && row.remunerationFerieDimanche !== null && row.remunerationFerieDimanche !== ''
          ? row.remunerationFerieDimanche
          : (row.personnel?.remuneration_ferie_dimanche || row.personnel_remuneration_ferie_dimanche || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'salaireBrutNumeraire',
      label: 'Salaire Brut Numeraire',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.salaireBrutNumeraire !== undefined && row.salaireBrutNumeraire !== null && row.salaireBrutNumeraire !== ''
          ? row.salaireBrutNumeraire
          : (row.personnel?.salaire_brut_numeraire || row.personnel_salaire_brut_numeraire || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'assurance',
      label: 'Assurance',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.assurance !== undefined && row.assurance !== null && row.assurance !== ''
          ? row.assurance
          : (row.personnel?.assurance || row.personnel_assurance || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'carburant',
      label: 'Carburant',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.carburant !== undefined && row.carburant !== null && row.carburant !== ''
          ? row.carburant
          : (row.personnel?.carburant || row.personnel_carburant || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'entretienReparation',
      label: 'Entretien/Reparation',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.entretienReparation !== undefined && row.entretienReparation !== null && row.entretienReparation !== ''
          ? row.entretienReparation
          : (row.personnel?.entretien_reparation || row.personnel_entretien_reparation || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'totalDepensesVehicule',
      label: 'Total Depenses Vehicule',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.totalDepensesVehicule !== undefined && row.totalDepensesVehicule !== null && row.totalDepensesVehicule !== ''
          ? row.totalDepensesVehicule
          : (row.personnel?.total_depenses_vehicule || row.personnel_total_depenses_vehicule || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'totalAvantageNatureVehicule',
      label: 'Total Avantage en nature en véhicule',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.totalAvantageNatureVehicule !== undefined && row.totalAvantageNatureVehicule !== null && row.totalAvantageNatureVehicule !== ''
          ? row.totalAvantageNatureVehicule
          : (row.personnel?.total_avantage_nature_vehicule || row.personnel_total_avantage_nature_vehicule || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'loyerMensuel',
      label: 'Loyer mensuel',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.loyerMensuel !== undefined && row.loyerMensuel !== null && row.loyerMensuel !== ''
          ? row.loyerMensuel
          : (row.personnel?.loyer_mensuel || row.personnel_loyer_mensuel || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'remunerationFixe25',
      label: 'Remuneration fixe 25%',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.remunerationFixe25 !== undefined && row.remunerationFixe25 !== null && row.remunerationFixe25 !== ''
          ? row.remunerationFixe25
          : (row.personnel?.remuneration_fixe_25 || row.personnel_remuneration_fixe_25 || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'avantageNatureLoyer',
      label: 'Avantage nature loyer',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.avantageNatureLoyer !== undefined && row.avantageNatureLoyer !== null && row.avantageNatureLoyer !== ''
          ? row.avantageNatureLoyer
          : (row.personnel?.avantage_nature_loyer || row.personnel_avantage_nature_loyer || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'depenseTelephone',
      label: 'Depense telephone',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.depenseTelephone !== undefined && row.depenseTelephone !== null && row.depenseTelephone !== ''
          ? row.depenseTelephone
          : (row.personnel?.depense_telephone || row.personnel_depense_telephone || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'avantageNatureTelephone',
      label: 'Avantage nature telephone',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.avantageNatureTelephone !== undefined && row.avantageNatureTelephone !== null && row.avantageNatureTelephone !== ''
          ? row.avantageNatureTelephone
          : (row.personnel?.avantage_nature_telephone || row.personnel_avantage_nature_telephone || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'autresAvantagesNature',
      label: 'Autres avantages nature',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.autresAvantagesNature !== undefined && row.autresAvantagesNature !== null && row.autresAvantagesNature !== ''
          ? row.autresAvantagesNature
          : (row.personnel?.autres_avantages_nature || row.personnel_autres_avantages_nature || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'totalAvantageNature',
      label: 'Total avantages nature',
      minWidth: 200,
      align: 'right',
      isnumber: true,
      valueGetter: ({ row }) =>
        row.totalAvantageNature !== undefined && row.totalAvantageNature !== null && row.totalAvantageNature !== ''
          ? row.totalAvantageNature
          : (row.personnel?.total_avantage_nature || row.personnel_total_avantage_nature || ''),
      editable: true,
      format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''
    },
    {
      id: 'salaireBrut20', label: 'Salaire Brut 20%', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.salaireBrut20;
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal) && numVal !== 0) ? numVal : 0;
      }, editable: true, format: value => (value && value !== 0) ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'deductionEnfants', label: 'Deduction Enfants', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.deductionEnfants !== undefined && row.deductionEnfants !== null && row.deductionEnfants !== '' ? row.deductionEnfants : (row.personnel?.deduction_enfants || row.personnel_deduction_enfants || '');
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal)) ? numVal : 0;
      }, editable: false, format: value => (value !== undefined && value !== null && value !== '') ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'salaireNet', label: 'Salaire Net', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.salaireNet !== undefined && row.salaireNet !== null && row.salaireNet !== '' ? row.salaireNet : (row.personnel?.salaire_net || row.personnel_salaire_net || '');
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal)) ? numVal : 0;
      }, editable: false, format: value => (value !== undefined && value !== null && value !== '') ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'avanceQuinzaineAutres', label: 'Avance Quinzaine Autres', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.avanceQuinzaineAutres !== undefined && row.avanceQuinzaineAutres !== null && row.avanceQuinzaineAutres !== '' ? row.avanceQuinzaineAutres : (row.personnel?.avance_quinzaine_autres || row.personnel_avance_quinzaine_autres || '');
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal)) ? numVal : 0;
      }, editable: false, format: value => (value !== undefined && value !== null && value !== '') ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'avancesSpeciales', label: 'Avances Speciales', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.avancesSpeciales !== undefined && row.avancesSpeciales !== null && row.avancesSpeciales !== '' ? row.avancesSpeciales : (row.personnel?.avances_speciales || row.personnel_avances_speciales || '');
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal)) ? numVal : 0;
      }, editable: false, format: value => (value !== undefined && value !== null && value !== '') ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'allocationFamiliale', label: 'Allocation Familiale', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.allocationFamiliale !== undefined && row.allocationFamiliale !== null && row.allocationFamiliale !== '' ? row.allocationFamiliale : (row.personnel?.allocation_familiale || row.personnel_allocation_familiale || '');
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal)) ? numVal : 0;
      }, editable: false, format: value => (value !== undefined && value !== null && value !== '') ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'totalSalaireBrut', label: 'Total Salaire Brut', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.totalSalaireBrut;
        const numVal = Number(val);
        console.log(`[DEBUG] totalSalaireBrut valueGetter - row.id: ${row.id}, val:`, val, typeof val, 'numVal:', numVal);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal) && numVal !== 0) ? numVal : 0;
      }, editable: false, format: value => (value && value !== 0) ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'cnapsEmployeur', label: 'CNAPS Employeur', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.cnapsEmployeur;
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal) && numVal !== 0) ? numVal : 0;
      }, editable: false, format: value => (value && value !== 0) ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'ostieEmployeur', label: 'OSTIE Employeur', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.ostieEmployeur;
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal) && numVal !== 0) ? numVal : 0;
      }, editable: false, format: value => (value && value !== 0) ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'baseImposable', label: 'Base Imposable', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.baseImposable;
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal) && numVal !== 0) ? numVal : 0;
      }, editable: false, format: value => (value && value !== 0) ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'irsaBrut', label: 'IRSA Brut', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.irsaBrut;
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal) && numVal !== 0) ? numVal : 0;
      }, editable: false, format: value => (value && value !== 0) ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    {
      id: 'irsaNet', label: 'IRSA Net', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => {
        const val = row.irsaNet;
        const numVal = Number(val);
        return (val !== undefined && val !== null && val !== '' && !isNaN(numVal) && numVal !== 0) ? numVal : 0;
      }, editable: false, format: value => (value && value !== 0) ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'
    },
    { id: 'netAPayerAriary', label: 'Net à payer Ariary', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => row.netAPayerAriary !== undefined && row.netAPayerAriary !== null && row.netAPayerAriary !== '' ? row.netAPayerAriary : (row.personnel?.net_a_payer_ariary || row.personnel_net_a_payer_ariary || ''), editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'partPatronalCnaps', label: 'Part patronale Cnaps', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => row.partPatronalCnaps !== undefined && row.partPatronalCnaps !== null && row.partPatronalCnaps !== '' ? row.partPatronalCnaps : (row.personnel?.part_patronal_cnaps || row.personnel_part_patronal_cnaps || ''), editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },
    { id: 'partPatronalOstie', label: 'Part patronale Ostie', minWidth: 200, align: 'right', isnumber: true, valueGetter: ({ row }) => row.partPatronalOstie !== undefined && row.partPatronalOstie !== null && row.partPatronalOstie !== '' ? row.partPatronalOstie : (row.personnel?.part_patronal_ostie || row.personnel_part_patronal_ostie || ''), editable: false, format: value => value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '' },

  ];

  // --- Paie Table Filtering State and Helpers ---
  const [paieFilters, setPaieFilters] = useState([
    { column: paieColumns && paieColumns[0] ? paieColumns[0].id : 'personnel_nom', operator: 'contains', value: '' }
  ]);

  const paieOperators = [
    { value: 'contains', label: 'contient' },
    { value: 'equals', label: 'égal' }
  ];

  const paieFilterableColumns = paieColumns ? paieColumns.map(col => ({ value: col.id, label: col.label })) : [];

  useEffect(() => {
    GetDateDebutFinExercice(selectedExerciceId)
  }, [selectedExerciceId]);

  useEffect(() => {
    if (listeAnnee.length > 0 && !valSelectAnnee) {
      setValSelectAnnee(listeAnnee[0]);
    }
    // console.log("valSelectAnnee : ", valSelectAnnee);
  }, [listeAnnee, valSelectAnnee]);

  const apiRef = useGridApiRef();

  return (
    <>

      {openModalIrsa && (
        <PopupAddIrsa
          confirmationState={() => {
            setOpenModalIrsa(false);
            setEditRowModal(null);
          }}
          id_compte={compteId}
          id_dossier={id}
          id_exercice={selectedExerciceId}
          mois={valSelectMois}
          annee={valSelectAnnee}
          onAddIrsa={handleAddIrsa}
          onEditIrsa={handleEditIrsa}
          row={editRowModal}
        />
      )}

      {openModalPaie && (
        <PopupAddPaie
          confirmationState={() => {
            setOpenModalPaie(false);
            setEditRowPaieModal(null);
          }}
          id_compte={compteId}
          id_dossier={id}
          id_exercice={selectedExerciceId}
          mois={valSelectMois}
          annee={valSelectAnnee}
          setIsRefresh={setIsRefresh}
          row={editRowPaieModal || null}
        />
      )}

      <Paper sx={{ elevation: "3", margin: "1px", padding: "20px", width: "99%", height: "auto" }}>
        <Stack width="100%" spacing={2}>
          {/* --- Barre de navigation --- */}
          <TabContext value="1">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList aria-label="lab API tabs example" style={{ textTransform: 'none', outline: 'none', border: 'none', }}>
                <Tab
                  style={{
                    textTransform: 'none',
                    outline: 'none',
                    border: 'none',
                    margin: -10
                  }}
                  label={InfoFileStyle(fileInfos?.dossier)} value="1"
                />
              </TabList>
            </Box>
          </TabContext>

          <Typography variant='h6' sx={{ color: "black", mt: 2, mb: 1 }} align='left'>Déclaration - IRSA</Typography>

          {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
          {/* --- Barre de filtres --- */}
          <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
            <FormControl variant="standard" sx={{ minWidth: 250 }}>
              <InputLabel>Exercice:</InputLabel>
              <Select
                value={selectedExerciceId}
                onChange={(e) => handleChangeExercice(e.target.value)}
              >
                {listeExercice.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="standard" sx={{ minWidth: 150 }}>
              <InputLabel>Période</InputLabel>
              <Select
                disabled
                value={selectedPeriodeChoiceId}
                onChange={(e) => handleChangePeriode(e.target.value)}
              >
                <MenuItem value={0}>Toutes</MenuItem>
                <MenuItem value={1}>Situations</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="standard" sx={{ minWidth: 250 }}>
              <InputLabel>Du</InputLabel>
              <Select
                value={selectedPeriodeId}
                onChange={(e) => handleChangeDateIntervalle(e.target.value)}
              >
                {listeSituation?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* LIGNE MOIS / ANNÉE */}
          <Stack direction="row" spacing={4} mt={2}>
            <FormControl variant="standard" sx={{ minWidth: 130 }}>
              <InputLabel>Mois</InputLabel>
              <Select
                value={valSelectMois}
                onChange={handleChangeMois}
              >
                <MenuItem value={1}>Janvier</MenuItem>
                <MenuItem value={2}>Février</MenuItem>
                <MenuItem value={3}>Mars</MenuItem>
                <MenuItem value={4}>Avril</MenuItem>
                <MenuItem value={5}>Mai</MenuItem>
                <MenuItem value={6}>Juin</MenuItem>
                <MenuItem value={7}>Juillet</MenuItem>
                <MenuItem value={8}>Août</MenuItem>
                <MenuItem value={9}>Septembre</MenuItem>
                <MenuItem value={10}>Octobre</MenuItem>
                <MenuItem value={11}>Novembre</MenuItem>
                <MenuItem value={12}>Décembre</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="standard" sx={{ minWidth: 130 }} >
              <InputLabel>Année</InputLabel>
              <Select
                value={valSelectAnnee}
                onChange={(e) => setValSelectAnnee(e.target.value)}
                name="valSelectAnnee"
              >
                {listeAnnee.map((year, index) => (
                  <MenuItem key={index} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <TabList onChange={handleTabChange} aria-label="Tabs" variant="scrollable">
              <Tab label="IRSA" value="1" />
              <Tab label="Paie" value="2" />
            </TabList>
          </Box>

          <TabPanel value="1" sx={{ p: 0 }}>
            {/* ... contenu IRSA existant ... */}
            <Stack direction="row" spacing={0.5} mb={2} justifyContent="flex-end" alignItems="center">

              <Tooltip title="Générer Auto">
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ minWidth: '35px', height: '35px', borderRadius: '2px', paddingLeft: '20px' }}
                    disabled={
                      paieData.filter(
                        row =>
                          Number(row.mois) === Number(valSelectMois) &&
                          Number(row.annee) === Number(valSelectAnnee)
                      ).length === 0
                    }
                    onClick={async () => {
                      const paiesToSend = paieData.filter(
                        row =>
                          Number(row.mois) === Number(valSelectMois) &&
                          Number(row.annee) === Number(valSelectAnnee)
                      );
                      if (paiesToSend.length === 0) {
                        toast.error('Aucune fiche de paie pour la période sélectionnée.');
                        return;
                      }
                      try {
                        const res = await axios.post('/irsa/irsa/generate-batch-snapshot', {
                          paies: paiesToSend,
                        });
                        if (res.data && res.data.state) {
                          toast.success('Génération IRSA réussie !');
                          // Recharger la liste IRSA
                          const irsaRes = await axios.get(`/irsa/irsa/${compteId}/${id}/${selectedExerciceId}`);
                          if (irsaRes.data && Array.isArray(irsaRes.data.list)) {
                            setIrsaData(irsaRes.data.list);
                          }
                        } else {
                          toast.error(
                            res.data && res.data.msg
                              ? res.data.msg
                              : 'Erreur lors de la génération IRSA'
                          );
                        }
                      } catch (e) {
                        let errMsg = 'Erreur lors de la génération IRSA';
                        if (e.response?.data?.msg) {
                          errMsg += ` : ${e.response.data.msg}`;
                        } else if (e.message) {
                          errMsg += ` : ${e.message}`;
                        }
                        toast.error(errMsg);
                        console.error(e);
                      }
                    }}
                  >
                    Générer AUTO
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Exporter">
                <span>
                  <Button
                    variant="contained"
                    onClick={() => setOpenExportDialog(true)}
                    style={{
                      minWidth: "35px",
                      height: '35px',
                      borderRadius: "2px",
                      backgroundColor: '#4caf50',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Exporter
                  </Button>
                </span>
              </Tooltip>

              <ExportIrsaDialog
                open={openExportDialog}
                onClose={() => { setOpenExportDialog(false); setShowHistoriqueIrsa(false); }}
                refreshKey={refreshHistoriqueIrsaKey}
                setRefreshKey={setRefreshHistoriqueIrsaKey}
                onExport={async () => {
                  if (!filteredRows || filteredRows.length === 0) {
                    toast.error('Aucune donnée IRSA à exporter pour le mois et l\'année sélectionnés.');
                    return;
                  }
                  try {
                    let nifDossier = null;
                    if (!compteId) {
                      toast.error('Impossible de récupérer les informations de connexion.');
                      return;
                    }
                    let currentDossier = null;
                    try {
                      const dossierResponse = await axios.get(`/home/file/${compteId}`);
                      if (dossierResponse.data && dossierResponse.data.fileList && dossierResponse.data.fileList.length > 0) {
                        const dossiers = dossierResponse.data.fileList;
                        const fileId = sessionStorage.getItem('fileId');
                        if (fileId) {
                          currentDossier = dossiers.find(d => d.id.toString() === fileId.toString());
                        }
                        if (!currentDossier) {
                          const storedId = localStorage.getItem('selectedDossierId') || localStorage.getItem('dossierId');
                          if (storedId) {
                            currentDossier = dossiers.find(d => d.id.toString() === storedId.toString());
                          }
                        }
                        if (!currentDossier && dossiers.length === 1) {
                          currentDossier = dossiers[0];
                        }
                        if (!currentDossier && dossiers.length > 1) {
                          const dossierNames = dossiers.map((d, index) => `${index + 1}. ${d.dossier} (NIF: ${d.nif})`);
                          const choice = prompt(`Plusieurs dossiers disponibles. Choisissez le numéro du dossier pour l'export IRSA:\n\n${dossierNames.join('\n')}\n\nEntrez le numéro (1-${dossiers.length}):`);
                          const choiceIndex = parseInt(choice) - 1;
                          if (choiceIndex >= 0 && choiceIndex < dossiers.length) {
                            currentDossier = dossiers[choiceIndex];
                          }
                        }
                        if (currentDossier && currentDossier.nif) {
                          nifDossier = currentDossier.nif;
                        }
                      }
                    } catch (dossierError) {
                      toast.error("Erreur lors de la récupération des dossiers");
                      return;
                    }
                    const result = await exportIrsaToXml(
                      filteredRows,
                      valSelectMois,
                      valSelectAnnee,
                      nifDossier
                    );
                    if (result.success) {
                      toast.success(`Export XML réussi: ${result.fileName}`);
                      // Enregistrement dans l'historique des exports IRSA
                      try {
                        if (
                          currentDossier &&
                          typeof currentDossier === 'object' &&
                          currentDossier.id !== undefined &&
                          currentDossier.id !== null &&
                          currentDossier.id !== '' &&
                          Number(currentDossier.id) > 0
                        ) {
                          let designation = '';
                          try {
                            const exoResp = await axios.get(`/paramExercice/listeExerciceById/${selectedExerciceId}`);
                            if (exoResp.data && exoResp.data.state) {
                              const { date_debut, date_fin } = exoResp.data.list;
                              const formatDate = d => {
                                const date = new Date(d);
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();
                                return `${day}-${month}-${year}`;
                              };
                              designation = `IRSA - du ${formatDate(date_debut)} au ${formatDate(date_fin)} :declaration ${valSelectMois}/${valSelectAnnee}`;
                            } else {
                              designation = `IRSA - Exercice ${valSelectAnnee}, Mois ${valSelectMois}`;
                            }
                          } catch {
                            designation = `IRSA - Exercice ${valSelectAnnee}, Mois ${valSelectMois}`;
                          }
                          const date_export = new Date().toISOString();
                          await axios.post('/historique/irsa', {
                            idCompte: compteId,
                            idDossier: currentDossier.id,
                            declaration: 'IRSA',
                            designation,
                            date_export
                          });
                          toast.success('Export IRSA enregistré dans l\'historique.');
                          setShowHistoriqueIrsa(true); // Affiche le tableau historique dans la modale
                          setRefreshHistoriqueIrsaKey(Date.now());
                        } else {
                          toast.error('Impossible d\'enregistrer l\'historique : dossier non identifié.');
                        }
                      } catch (histErr) {
                        toast.error("Erreur lors de l'enregistrement de l'historique d'export IRSA");
                      }
                    } else {
                      toast.error(`Erreur lors de l'export XML: ${result.error}`);
                    }
                  } catch (error) {
                    toast.error('Erreur lors de l\'export XML');
                  }
                }}
                irsaData={irsaData}
                exerciceId={'Exercice ' + (valSelectAnnee || new Date().getFullYear())}
                valSelectMois={valSelectMois}
                valSelectAnnee={valSelectAnnee}
                compteId={compteId}
                showHistorique={showHistoriqueIrsa}
              />
              <Tooltip title="Ajouter">
                <span>
                  <IconButton
                    variant="contained"
                    onClick={e => setAddMenuAnchor(e.currentTarget)}
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#1A5276', textTransform: 'none', outline: 'none' }}
                  >
                    <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>

                  <Menu
                    anchorEl={addMenuAnchor}
                    open={Boolean(addMenuAnchor)}
                    onClose={() => setAddMenuAnchor(null)}
                  >
                    {/* <MenuItem onClick={() => { setAddMenuAnchor(null); handleAddClick(); }}>Ajouter dans le tableau</MenuItem> */}
                    <MenuItem onClick={() => {
                      setAddMenuAnchor(null);
                      setEditRowModal(null);
                      setOpenModalIrsa(true);
                    }}>Ajouter via un formulaire</MenuItem>
                  </Menu>
                </span>
              </Tooltip>

              <Tooltip title="Modifier la ligne sélectionnée">
                <span>
                  <IconButton
                    disabled={disableModifyBouton || selectedRowId.length !== 1}
                    variant="contained"
                    onClick={() => {
                      const rowToEdit = irsaData.find(row => row.id === selectedRowId[0]);
                      if (rowToEdit) {
                        modifyRowIrsa(rowToEdit);
                      }
                    }}
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#1A5276', textTransform: 'none', outline: 'none' }}
                  >
                    <FaRegPenToSquare style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Sauvegarder les modifications">
                <span>
                  <IconButton
                    disabled={disableSaveBouton}
                    variant="contained"
                    onClick={handleSaveClick(selectedRowId)}
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#1A5276', textTransform: 'none', outline: 'none' }}
                  >
                    <TfiSave style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Annuler les modifications">
                <span>
                  <IconButton
                    disabled={disableCancelBouton}
                    variant="contained"
                    onClick={handleCancelClick(selectedRowId)}
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#d32f2f', textTransform: 'none', outline: 'none' }}
                  >
                    <VscClose style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Supprimer toutes les lignes IRSA">
                <span>
                  <IconButton
                    variant="contained"
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#EE4E4E', textTransform: 'none', outline: 'none' }}
                    onClick={() => {
                      setMsgConfirmIrsa('Voulez-vous vraiment supprimer toutes les lignes IRSA ?');
                      setOpenConfirmDeleteAllIrsa(true);
                    }}
                  >
                    <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Stack>
              <VirtualTableIrsa
                columns={irsaColumns}
                onSort={handleSortIrsa}
                rows={filters.reduce((rows, filter) => {
                  const col = filter.column;
                  const colDef = irsaColumns.find(c => c.id === col);
                  return rows.filter(row => {
                    let val = '';
                    if (colDef && typeof colDef.valueGetter === 'function') {
                      val = (colDef.valueGetter({ row }) || '').toString().toLowerCase();
                    } else {
                      val = (row[col] || '').toString().toLowerCase();
                    }
                    const search = (filter.value || '').toString().toLowerCase();
                    if (filter.operator === 'contains') return val.includes(search);
                    if (filter.operator === 'equals') return val === search;
                    return true;
                  });
                }, irsaData)}
                deleteState={deleteOneRowIrsa}
                modifyState={modifyRowIrsa}
                setEditRowModal={setEditRowModal}
                state={verrIrsa}
                personnels={personnels}
                selectedRowId={selectedRowId}
                onRowSelectionModelChange={saveSelectedRow}
                onFilter={setFilters}
                filters={filters}
              />
            </Stack>
          </TabPanel>

          <PaieImportExportDialog
            open={openImportExportDialog}
            onClose={() => setOpenImportExportDialog(false)}
            paieColumns={paieColumns}
            onImport={handlePaieImport}
            onDownload={handleDownloadPaieTemplate}
            personnels={personnels}
            mois={valSelectMois}
            annee={valSelectAnnee}
          />
          <TabPanel value="2" sx={{ p: 0 }}>
            <Stack direction="row" spacing={0.5} mb={2} justifyContent="flex-end">
              <Box ml={2}>
                <Tooltip title="Importer / Exporter">
                  <span>
                    <IconButton
                      variant="contained"
                      onClick={() => setOpenImportExportDialog(true)}
                      style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: 'rgb(0, 6, 0)', textTransform: 'none', outline: 'none' }}
                    >
                      <FaExchangeAlt style={{ width: '25px', height: '25px', color: 'white' }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <Tooltip title="Ajouter">
                <span>
                  <IconButton
                    variant="contained"
                    onClick={e => setAddMenuAnchor(e.currentTarget)}
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#1A5276', textTransform: 'none', outline: 'none', marginLeft: 4 }}
                  >
                    <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                  <Menu
                    anchorEl={addMenuAnchor}
                    open={Boolean(addMenuAnchor)}
                    onClose={() => setAddMenuAnchor(null)}
                  >
                    <MenuItem onClick={() => {
                      setAddMenuAnchor(null);
                      setEditRowPaieModal(null);
                      setOpenModalPaie(true);
                    }}>Ajouter via un formulaire</MenuItem>
                  </Menu>
                </span>
              </Tooltip>

              <Tooltip title="Modifier via formulaire">
                <span>
                  <IconButton
                    disabled={disableModifyBouton || selectedRowId.length !== 1}
                    variant="contained"
                    onClick={() => {
                      const rowToEdit = paieData.find(row => row.id === selectedRowId[0]);
                      if (rowToEdit) {
                        modifyRowPaie(rowToEdit);
                      }
                    }}
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#1A5276', textTransform: 'none', outline: 'none' }}
                  >
                    <FaRegPenToSquare style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Sauvegarder">
                <span>
                  <IconButton
                    disabled={disableSaveBouton}
                    variant="contained"
                    onClick={handleSaveClickPaie(selectedRowId)}
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#1A5276', textTransform: 'none', outline: 'none' }}
                  >
                    <TfiSave style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Annuler">
                <span>
                  <IconButton
                    disabled={disableCancelBouton}
                    variant="contained"
                    onClick={handleCancelClick(selectedRowId)}
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#d32f2f', textTransform: 'none', outline: 'none' }}
                  >
                    <VscClose style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Supprimer toutes les lignes PAIE">
                <span>
                  <IconButton
                    variant="contained"
                    style={{ width: "35px", height: '35px', borderRadius: "2px", borderColor: "transparent", backgroundColor: '#EE4E4E', textTransform: 'none', outline: 'none' }}
                    onClick={() => {
                      setMsgConfirmPaie('Voulez-vous vraiment supprimer toutes les lignes PAIE ?');
                      setOpenConfirmDeleteAllPaie(true);
                    }}
                  >
                    <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <Stack>
              <VirtualTablePaie
                columns={paieColumns}
                rows={paieFilters.reduce((rows, filter) => {
                  const col = filter.column;
                  const colDef = paieColumns.find(c => c.id === col);
                  return rows.filter(row => {
                    let val = '';
                    if (colDef && typeof colDef.valueGetter === 'function') {
                      val = (colDef.valueGetter({ row }) || '').toString().toLowerCase();
                    } else {
                      val = (row[col] || '').toString().toLowerCase();
                    }
                    const search = (filter.value || '').toString().toLowerCase();
                    if (filter.operator === 'contains') return val.includes(search);
                    if (filter.operator === 'equals') return val === search;
                    return true;
                  });
                }, paieData)}
                deleteState={deleteOneRowPaie}
                modifyState={modifyRowPaie}
                setEditRowPaieModal={setEditRowPaieModal}
                personnels={personnels}
                selectedRowId={selectedRowId}
                onRowSelectionModelChange={saveSelectedRow}
                onSort={handleSortPaie}
                onFilter={setPaieFilters}
                filters={paieFilters}
              />
            </Stack>
          </TabPanel>

        </TabContext>
      </Paper>
    </>
  );
}
