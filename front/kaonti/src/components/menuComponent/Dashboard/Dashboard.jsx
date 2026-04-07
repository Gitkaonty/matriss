import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import PopupTestSelectedFile from '../../componentsTools/popupTestSelectedFile';
import axios from '../../../../config/axios';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { InfoFileStyle } from '../../componentsTools/InfosFileStyle';
import KPICard from '../../componentsTools/Dashboard/DashboardCard';
import { format } from 'date-fns';
import LineChartComponent from '../../componentsTools/Dashboard/LineChartComponent';
import AreaChartComponent from '../../componentsTools/Dashboard/AreaChartComponent';
import BarChartComponent from '../../componentsTools/Dashboard/BarChartComponent';
import AreaComponent from '../../componentsTools/Dashboard/AreaComponent';
import SparklineChartComponent from '../../componentsTools/Dashboard/SparklineChartComponent';
import useAuth from '../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import VirtualTableJournalAttente from '../../componentsTools/Dashboard/VirtualTableJournalAttente';
import usePermission from '../../../hooks/usePermission';
import { Line } from 'react-chartjs-2';
import RevuAnalytiqueNN1 from './RevuAnalytiqueNN1';
import RevuAnalytiqueMensuelle from './RevuAnalytiqueMensuelle';
import { useExercicePeriode } from '../../../context/ExercicePeriodeContext';
import ExercicePeriodeSelector from '../../componentsTools/ExercicePeriodeSelector/ExercicePeriodeSelector';

// Format date as dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
};

const NAV_DARK = '#0B1120';

const columns = [
  {
    id: 'compte',
    label: 'Compte',
    minWidth: 120,
    align: 'left',
    format: (value) => value.toLocaleString('fr-FR'),
  },
  {
    id: 'dateecriture',
    label: 'Date',
    minWidth: 100,
    width: 100,
    isDate: true,
    format: (value) => value ? format(new Date(value), "dd/MM/yyyy") : "",
  },
  {
    id: 'codejournal',
    label: 'Jounal',
    minWidth: 50,
  },
  {
    id: 'piece',
    label: 'Pièce',
    minWidth: 120,
    align: 'left',
    format: (value) => value.toLocaleString('fr-FR'),
  },
  {
    id: 'libelle',
    label: 'Libellé',
    minWidth: 200,
    align: 'left'
  },
  {
    id: 'debit',
    label: 'Débit',
    minWidth: 100,
    align: 'right',
    format: (value) => value.toFixed(2),
    isNumber: true
  },
  {
    id: 'credit',
    label: 'Crédit',
    minWidth: 100,
    align: 'right',
    format: (value) => value.toFixed(2),
    isNumber: true
  },
];

const gridHeight = '70vh';
const gridSpacing = 1;
const dashboardCardHeight = 100;
const dashboardCardMinWidth = 80;

export default function DashboardComponent() {
  const { canAdd, canModify, canDelete, canView } = usePermission();

  const [valueRevuAnalytique, setValueRevuAnalytique] = useState('1');

  const [fileInfos, setFileInfos] = useState('');
  const [noFile, setNoFile] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [fileId, setFileId] = useState(0);
  const [listeExercice, setListeExercice] = useState([]);
  const [listeSituation, setListeSituation] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    selectedExerciceId,
    selectedPeriodeId,
    selectedPeriodeDates,
    handleChangeExercice,
    handleChangePeriode,
    loading: contextLoading,
    getApiParams
  } = useExercicePeriode();


  //récupération des informations de connexion
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const compteId = decoded.UserInfo.compteId || null;
  const userId = decoded.UserInfo.userId || null;

  const [deviseParDefaut, setDeviseParDefaut] = useState([]);

  const [chiffresAffairesNGraph, setChiffresAffairesNGraph] = useState([]);
  const [chiffresAffairesN1Graph, setChiffresAffairesN1Graph] = useState([]);

  const [moisN, setmoisN] = useState([]);
  const [moisN1, setmoisN1] = useState([]);

  const [margeBruteNGraph, setMargeBruteNGraph] = useState([]);
  const [margeBruteN1Graph, setMargeBruteN1Graph] = useState([]);

  const [tresorerieBanqueNGraph, setTresorerieBanqueNGraph] = useState([]);
  const [tresorerieBanqueN1Graph, setTresorerieBanqueN1Graph] = useState([]);

  const [tresorerieCaisseNGraph, setTresorerieCaisseNGraph] = useState([]);
  const [tresorerieCaisseN1Graph, setTresorerieCaisseN1Graph] = useState([]);

  const [resultatN, setResultatN] = useState(0);
  const [resultatN1, setResultatN1] = useState(0);
  const [variationResultatN, setVariationResultatN] = useState(0);
  const [variationResultatN1, setVariationResultatN1] = useState(0);
  const [evolutionResultatN, setEvolutionResultatN] = useState('');
  const [evolutionResultatN1, setEvolutionResultatN1] = useState('');

  const [resultatChiffreAffaireN, setResultatChiffreAffaireN] = useState(0);
  const [resultatChiffreAffaireN1, setResultatChiffreAffaireN1] = useState(0);
  const [variationChiffreAffaireN, setVariationChiffreAffaireN] = useState(0);
  const [variationChiffreAffaireN1, setVariationChiffreAffaireN1] = useState(0);
  const [evolutionChiffreAffaireN, setEvolutionChiffreAffaireN] = useState('');
  const [evolutionChiffreAffaireN1, setEvolutionChiffreAffaireN1] = useState('');

  const [resultatDepenseAchatN, setResultatDepenseAchatN] = useState(0);
  const [resultatDepenseAchatN1, setResultatDepenseAchatN1] = useState(0);
  const [variationDepenseAchatN, setVariationDepenseAchatN] = useState(0);
  const [variationDepenseAchatN1, setVariationDepenseAchatN1] = useState(0);
  const [evolutionDepenseAchatN, setEvolutionDepenseAchatN] = useState('');
  const [evolutionDepenseAchatN1, setEvolutionDepenseAchatN1] = useState('');

  const [resultatDepenseSalarialeN, setResultatDepenseSalarialeN] = useState(0);
  const [resultatDepenseSalarialeN1, setResultatDepenseSalarialeN1] = useState(0);
  const [variationDepenseSalarialeN, setVariationDepenseSalarialeN] = useState(0);
  const [variationDepenseSalarialeN1, setVariationDepenseSalarialeN1] = useState(0);
  const [evolutionDepenseSalarialeN, setEvolutionDepenseSalarialeN] = useState('');
  const [evolutionDepenseSalarialeN1, setEvolutionDepenseSalarialeN1] = useState('');

  const [resultatTresorerieBanqueN, setResultatTresorerieBanqueN] = useState(0);
  const [resultatTresorerieBanqueN1, setResultatTresorerieBanqueN1] = useState(0);
  const [variationTresorerieBanqueN, setVariationTresorerieBanqueN] = useState(0);
  const [variationTresorerieBanqueN1, setVariationDTresorerieBanqueN1] = useState(0);
  const [evolutionTresorerieBanqueN, setEvolutionTresorerieBanqueN] = useState('');
  const [evolutionTresorerieBanqueN1, setEvolutionTresorerieBanqueN1] = useState('');

  const [resultatTresorerieCaisseN, setResultatTresorerieCaisseN] = useState(0);
  const [resultatTresorerieCaisseN1, setResultatTresorerieCaisseN1] = useState(0);
  const [variationTresorerieCaisseN, setVariationTresorerieCaisseN] = useState(0);
  const [variationTresorerieCaisseN1, setVariationDTresorerieCaisseN1] = useState(0);
  const [evolutionTresorerieCaisseN, setEvolutionTresorerieCaisseN] = useState('');
  const [evolutionTresorerieCaisseN1, setEvolutionTresorerieCaisseN1] = useState('');

  const [journalData, setJournalData] = useState([]);

  const handleChangeRevuAnalytiqueTab = (event, newValue) => {
    setValueRevuAnalytique(newValue);
  };

  const GetListeDossier = (id) => {
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

  // Récupération de toutes les informations
  const getAllInfo = () => {
    // console.log('>>> getAllInfo APPELÉ <<<');
    // console.log('selectedExerciceId:', selectedExerciceId, '| selectedPeriodeDates:', selectedPeriodeDates);

    // Utiliser exerciceId pour l'API, avec dates de periode si selectionnee
    let url = `/dashboard/getAllInfo/${Number(compteId)}/${Number(fileId)}/${Number(selectedExerciceId)}`;
    if (selectedPeriodeDates && selectedPeriodeId) {
      url += `?date_debut=${selectedPeriodeDates.date_debut}&date_fin=${selectedPeriodeDates.date_fin}&id_periode=${selectedPeriodeId}`;
      // console.log('URL avec période:', url);
    } else {
      // console.log('URL sans période (exercice complet):', url);
    }

    axios.get(url)
      .then((response) => {
        if (response?.data?.state) {
          setChiffresAffairesNGraph(response?.data?.chiffreAffaireN);
          setChiffresAffairesN1Graph(response?.data?.chiffreAffaireN1);

          setMargeBruteNGraph(response?.data?.margeBruteTotalN);
          setMargeBruteN1Graph(response?.data?.margeBruteTotalN1);

          setTresorerieBanqueNGraph(response?.data?.tresorerieBanqueN);
          setTresorerieBanqueN1Graph(response?.data?.tresorerieBanqueN1);

          setTresorerieCaisseNGraph(response?.data?.tresorerieCaisseN);
          setTresorerieCaisseN1Graph(response?.data?.tresorerieCaisseN1);

          setResultatN(response?.data?.resultatN);
          setResultatN1(response?.data?.resultatN1);
          setVariationResultatN(response?.data?.variationResultatN);
          setVariationResultatN1(response?.data?.variationResultatN1);
          setEvolutionResultatN(response?.data?.evolutionResultatN);
          setEvolutionResultatN1(response?.data?.evolutionResultatN1);

          setResultatChiffreAffaireN(response?.data?.resultatChiffreAffaireN);
          setResultatChiffreAffaireN1(response?.data?.resultatChiffreAffaireN1);
          setVariationChiffreAffaireN(response?.data?.variationChiffreAffaireN);
          setVariationChiffreAffaireN1(response?.data?.variationChiffreAffaireN1);
          setEvolutionChiffreAffaireN(response?.data?.evolutionChiffreAffaireN);
          setEvolutionChiffreAffaireN1(response?.data?.evolutionChiffreAffaireN1);

          setResultatDepenseSalarialeN(response?.data?.resultatDepenseSalarialeN);
          setResultatDepenseSalarialeN1(response?.data?.resultatDepenseSalarialeN1);
          setVariationDepenseSalarialeN(response?.data?.variationDepenseSalarialeN);
          setVariationDepenseSalarialeN1(response?.data?.variationDepenseSalarialeN1);
          setEvolutionDepenseSalarialeN(response?.data?.evolutionDepenseSalarialeN);
          setEvolutionDepenseSalarialeN1(response?.data?.evolutionDepenseSalarialeN1);

          setResultatDepenseAchatN(response?.data?.resultatDepenseAchatN);
          setResultatDepenseAchatN1(response?.data?.resultatDepenseAchatN1);
          setVariationDepenseAchatN(response?.data?.variationDepenseAchatN);
          setVariationDepenseAchatN1(response?.data?.variationDepenseAchatN1);
          setEvolutionDepenseAchatN(response?.data?.evolutionDepenseAchatN);
          setEvolutionDepenseAchatN1(response?.data?.evolutionDepenseAchatN1);

          setResultatTresorerieBanqueN(response?.data?.resultatTresorerieBanqueN);
          setResultatTresorerieBanqueN1(response?.data?.resultatTresorerieBanqueN1);
          setVariationTresorerieBanqueN(response?.data?.variationTresorerieBanqueN);
          setVariationDTresorerieBanqueN1(response?.data?.variationTresorerieBanqueN1);
          setEvolutionTresorerieBanqueN(response?.data?.evolutionTresorerieBanqueN);
          setEvolutionTresorerieBanqueN1(response?.data?.evolutionTresorerieBanqueN1);

          setResultatTresorerieCaisseN(response?.data?.resultatTresorerieCaisseN);
          setResultatTresorerieCaisseN1(response?.data?.resultatTresorerieCaisseN1);
          setVariationTresorerieCaisseN(response?.data?.variationTresorerieCaisseN);
          setVariationDTresorerieCaisseN1(response?.data?.variationTresorerieCaisseN1);
          setEvolutionTresorerieCaisseN(response?.data?.evolutionTresorerieCaisseN);
          setEvolutionTresorerieCaisseN1(response?.data?.evolutionTresorerieCaisseN1);

          setmoisN(response?.data?.moisN);
          setmoisN1(response?.data?.moisN1);

          // Logs pour debug des variations
          // console.log('=== DEBUG VARIATIONS ===');
          // console.log('Période:', selectedPeriodeDates ? `${selectedPeriodeDates.date_debut} - ${selectedPeriodeDates.date_fin}` : 'Exercice complet');
          // console.log('--- RÉSULTAT ---');
          // console.log('N:', response?.data?.resultatN, '| N-1:', response?.data?.resultatN1, '| Variation:', response?.data?.variationResultatN?.toFixed(2) + '%');
          // console.log('--- CHIFFRE D\'AFFAIRES ---');
          // console.log('N:', response?.data?.resultatChiffreAffaireN, '| N-1:', response?.data?.resultatChiffreAffaireN1, '| Variation:', response?.data?.variationChiffreAffaireN?.toFixed(2) + '%');
          // console.log('--- DÉPENSES ACHATS ---');
          // console.log('N:', response?.data?.resultatDepenseAchatN, '| N-1:', response?.data?.resultatDepenseAchatN1, '| Variation:', response?.data?.variationDepenseAchatN?.toFixed(2) + '%');
          // console.log('--- DÉPENSES SALARIALES ---');
          // console.log('N:', response?.data?.resultatDepenseSalarialeN, '| N-1:', response?.data?.resultatDepenseSalarialeN1, '| Variation:', response?.data?.variationDepenseSalarialeN?.toFixed(2) + '%');
          // console.log('--- TRÉSORERIE BANQUE ---');
          // console.log('N:', response?.data?.resultatTresorerieBanqueN, '| N-1:', response?.data?.resultatTresorerieBanqueN1, '| Variation:', response?.data?.variationTresorerieBanqueN?.toFixed(2) + '%');
          // console.log('--- TRÉSORERIE CAISSE ---');
          // console.log('N:', response?.data?.resultatTresorerieCaisseN, '| N-1:', response?.data?.resultatTresorerieCaisseN1, '| Variation:', response?.data?.variationTresorerieCaisseN?.toFixed(2) + '%');
          // console.log('========================');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.message || err?.message || "Erreur inconnue");
      });
  }

  // Récupération de la liste des devises
  const getParDefaut = async () => {
    await axios.get(`/devises/devise/compte/${compteId}/${fileId}`).then((reponse => {
      const resData = reponse.data;
      const deviseParDefaut = resData.find(val => val.par_defaut === true);
      setDeviseParDefaut(deviseParDefaut?.code || '€');
    }))
  }

  const getListeJournalEnAttente = () => {
    // Utiliser les dates de periode si selectionnee, sinon exercice complet
    const url = selectedPeriodeDates
      ? `/dashboard/getListeJournalEnAttente/${Number(compteId)}/${Number(fileId)}/${Number(selectedExerciceId)}?date_debut=${selectedPeriodeDates.date_debut}&date_fin=${selectedPeriodeDates.date_fin}`
      : `/dashboard/getListeJournalEnAttente/${Number(compteId)}/${Number(fileId)}/${Number(selectedExerciceId)}`;

    axios.get(url)
      .then((response) => {
        if (response?.data) {
          setJournalData(response?.data);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.message || err?.message || "Erreur inconnue");
      });
  }

  const xAxis = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];

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

    GetListeDossier(idFile);
  }, []);

  useEffect(() => {
    if (compteId && fileId && selectedExerciceId && canView) {
      getAllInfo();
      getParDefaut();
      getListeJournalEnAttente();
    }
  }, [compteId, fileId, selectedExerciceId, selectedPeriodeDates]);

  const BORDER = '#E2E8F0';
  const tabStyle = { fontSize: '12px', fontWeight: 800, textTransform: 'none' };
  const sectionPaperStyle = {
    p: 2,
    borderRadius: '8px',
    // On définit une seule fois la bordure pour tout le contour
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    bgcolor: '#fff',
    width: '100%',
    // Important : empêche le contenu interne de déborder sur la bordure
    overflow: 'hidden',
    boxSizing: 'border-box',
    // Ajout d'une marge en bas pour décoller du bord de l'écran
    mt: -5
  };
  return (
    <>
      {
        noFile
          ?
          <PopupTestSelectedFile
            confirmationState={sendToHome}
          />
          :
          null
      }
      <Box>
        <TabContext value={"1"}>
          <TabPanel value="1" style={{ height: '100%' }}>
            <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
              <Typography variant='h6' sx={{ color: NAV_DARK, fontWeight: 800 }} align='left'>Dashboard</Typography>

              <Stack width={"100%"} spacing={4} alignItems={"left"} alignContent={"center"} direction={"column"} style={{ marginLeft: "0px", marginTop: "20px" }}>
                <Stack
                  direction={"row"}
                >
                  <ExercicePeriodeSelector
                    selectedExerciceId={selectedExerciceId}
                    selectedPeriodeId={selectedPeriodeId}
                    onExerciceChange={handleChangeExercice}
                    onPeriodeChange={handleChangePeriode}
                    disabled={loading}
                    size="small"
                  />
                </Stack>
              </Stack>

              <Stack
                width={'100%'}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    pb: 1,
                    mt: -5,
                    gap: 0.5,
                    justifyContent: 'flex-start',
                    alignItems: 'stretch',
                    width: '100%',
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                  }}
                >
                  <KPICard
                    title={'Résultat'}
                    color={'#037934'}
                    resultatN={resultatN}
                    resultatN1={resultatN1}
                    variationN={variationResultatN}
                    variationN1={variationResultatN1}
                    evolutionN={evolutionResultatN}
                    evolutionN1={evolutionResultatN1}
                    trendN={margeBruteNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{ minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0' }}
                  />

                  <KPICard
                    title={"Chiffre d'affaires"}
                    color={'#037934'}
                    resultatN={resultatChiffreAffaireN}
                    resultatN1={resultatChiffreAffaireN1}
                    variationN={variationChiffreAffaireN}
                    variationN1={variationChiffreAffaireN1}
                    evolutionN={evolutionChiffreAffaireN}
                    evolutionN1={evolutionChiffreAffaireN1}
                    trendN={chiffresAffairesNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{ minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0' }}
                  />
                  {/* <KPICard
                    title="Chiffre d'affaires"
                    color="#037934" // Vert pour la barre du haut
                    resultatN={resultatChiffreAffaireN}
                    resultatN1={resultatChiffreAffaireN1}
                    variationN={variationChiffreAffaireN}
                    variationN1={variationChiffreAffaireN1}
                    evolutionN1={evolutionChiffreAffaireN1}
                    trendN={chiffresAffairesNGraph} // Ton tableau de données
                    devise={deviseParDefaut}
                    compact
                    sx={{ flex: '1 1 0', minWidth: '180px' }}
                  /> */}

                  <KPICard
                    title={'Dépenses (Achats)'}
                    color={'#fb8c00'}
                    resultatN={resultatDepenseAchatN}
                    resultatN1={resultatDepenseAchatN1}
                    variationN={variationDepenseAchatN}
                    variationN1={variationDepenseAchatN1}
                    evolutionN={evolutionDepenseAchatN}
                    evolutionN1={evolutionDepenseAchatN1}
                    trendN={chiffresAffairesNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{ minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0' }}
                  />

                  <KPICard
                    title={'Dépenses salariales'}
                    color={'#fb8c00'}
                    resultatN={resultatDepenseSalarialeN}
                    resultatN1={resultatDepenseSalarialeN1}
                    variationN={variationDepenseSalarialeN}
                    variationN1={variationDepenseSalarialeN1}
                    evolutionN={evolutionDepenseSalarialeN}
                    evolutionN1={evolutionDepenseSalarialeN1}
                    trendN={margeBruteNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{ minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0' }}
                  />

                  <KPICard
                    title={'Trésoreries (Banques)'}
                    color={'#095a9c'}
                    resultatN={resultatTresorerieBanqueN}
                    resultatN1={resultatTresorerieBanqueN1}
                    variationN={variationTresorerieBanqueN}
                    variationN1={variationTresorerieBanqueN1}
                    evolutionN={evolutionTresorerieBanqueN}
                    evolutionN1={evolutionTresorerieBanqueN1}
                    trendN={tresorerieBanqueNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{ minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0' }}
                  />

                  <KPICard
                    title={'Trésoreries (Caisse)'}
                    color={'#095a9c'}
                    resultatN={resultatTresorerieCaisseN}
                    resultatN1={resultatTresorerieCaisseN1}
                    variationN={variationTresorerieCaisseN}
                    variationN1={variationTresorerieCaisseN1}
                    evolutionN={evolutionTresorerieCaisseN}
                    evolutionN1={evolutionTresorerieCaisseN1}
                    trendN={tresorerieCaisseNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{ minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0' }}
                  />
                </Stack>

                <Box
                  sx={{
                    display: 'flex',
                    gap: gridSpacing,
                    // Passage en colonne si l'écran est petit (xs), en ligne sur desktop (md)
                    flexDirection: { xs: 'column', md: 'row' },
                    // Hauteur fixe seulement sur desktop pour l'alignement, auto sur mobile
                    height: { xs: 'auto', md: 800 },
                    width: '100%',
                  }}
                >
                  {/* --- COLONNE GAUCHE : GRAPHIQUE PRINCIPAL + TABLEAU --- */}
                  <Stack
                    direction="column"
                    spacing={gridSpacing}
                    sx={{
                      flex: { xs: '1 1 auto', md: '2 1 0' }, // Ratio 2/3 de la largeur sur desktop
                      minWidth: 0,
                      height: { xs: 'auto', md: '100%' },
                    }}
                  >
                    {/* BLOC GRAPHIQUE CA (60% de la hauteur sur desktop) */}
                    <Box
                      sx={{
                        flex: { xs: '0 0 400px', md: 0.6 }, // 400px fixe sur mobile pour garder la lisibilité
                        backgroundColor: 'white',
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        position: 'relative',
                      }}
                    >
                      <AreaChartComponent
                        xAxis={moisN}
                        xAxis1={moisN1}
                        dataN={chiffresAffairesNGraph}
                        dataN1={chiffresAffairesN1Graph}
                        label={"Chiffre d'affaires"}
                      />
                    </Box>

                    {/* BLOC TABLEAU ATTENTE (40% de la hauteur sur desktop) */}
                    <Box
                      sx={{
                        flex: { xs: '0 0 350px', md: 0.4 },
                        backgroundColor: 'white',
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                      }}
                    >
                      <Box sx={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                        <VirtualTableJournalAttente
                          tableHeader={columns}
                          tableRow={journalData}
                        />
                      </Box>
                    </Box>
                  </Stack>

                  {/* --- COLONNE DROITE : LES 3 PETITS GRAPHIQUES --- */}
                  <Box
                    sx={{
                      flex: { xs: '1 1 auto', md: '1 1 0' }, // Ratio 1/3 de la largeur sur desktop
                      minWidth: 0,
                      display: 'grid',
                      gap: gridSpacing,
                      // 3 lignes égales sur desktop, 3 blocs de 300px sur mobile
                      gridTemplateRows: { xs: 'repeat(3, 300px)', md: 'repeat(3, 1fr)' },
                      height: { xs: 'auto', md: '100%' },
                    }}
                  >
                    {/* MARGE BRUTE */}
                    <Box sx={{ backgroundColor: 'white', boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 2, p: 1, minHeight: 0 }}>
                      <AreaChartComponent
                        xAxis={moisN}
                        xAxis1={moisN1}
                        dataN={margeBruteNGraph}
                        dataN1={margeBruteN1Graph}
                        label={'Marges brutes'}
                      />
                    </Box>

                    {/* TRESORERIE BANQUE */}
                    <Box sx={{ backgroundColor: 'white', boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 2, p: 1, minHeight: 0 }}>
                      <BarChartComponent
                        xAxis={moisN}
                        xAxis1={moisN1}
                        dataN={tresorerieBanqueNGraph}
                        dataN1={tresorerieBanqueN1Graph}
                        label={'Trésoreries (Banques)'}
                      />
                    </Box>

                    {/* TRESORERIE CAISSE */}
                    <Box sx={{ backgroundColor: 'white', boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 2, p: 1, minHeight: 0 }}>
                      <BarChartComponent
                        xAxis={moisN}
                        xAxis1={moisN1}
                        dataN={tresorerieCaisseNGraph}
                        dataN1={tresorerieCaisseN1Graph}
                        label={'Trésoreries (Caisses)'}
                      />
                    </Box>
                  </Box>
                </Box>
              </Stack>

              <Stack sx={{ width: '100%', mt: 5 }}>
                <Paper sx={sectionPaperStyle} elevation={0}>
                  <TabContext value={valueRevuAnalytique}>
                    {/* En-tête des onglets */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <TabList
                        onChange={handleChangeRevuAnalytiqueTab}
                        aria-label="revue analytique tabs"
                        variant="scrollable"
                        sx={{ minHeight: '40px' }}
                      >
                        <Tab label="Revue Analytique N/N-1" sx={tabStyle} value="1" />
                        <Tab label="Détail Mensuel" sx={tabStyle} value="2" />
                      </TabList>
                    </Box>

                    {/* Contenu de l'onglet 1 */}
                    <TabPanel value="1" sx={{ px: 0, pt: 2, pb: 1 }}>
                      <RevuAnalytiqueNN1
                        compteId={compteId}
                        dossierId={fileId}
                        exerciceId={selectedExerciceId}
                        dateDebut={selectedPeriodeDates?.date_debut}
                        dateFin={selectedPeriodeDates?.date_fin}
                      />
                    </TabPanel>

                    {/* Contenu de l'onglet 2 */}
                    <TabPanel value="2" sx={{ px: 0, pt: 2, pb: 1 }}>
                      <RevuAnalytiqueMensuelle
                        compteId={compteId}
                        dossierId={fileId}
                        exerciceId={selectedExerciceId}
                        dateDebut={selectedPeriodeDates?.date_debut}
                        dateFin={selectedPeriodeDates?.date_fin}
                      />
                    </TabPanel>
                  </TabContext>
                </Paper>
              </Stack>
            </Stack>
          </TabPanel>
        </TabContext>

      </Box >
    </>
  )
}
