import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack } from '@mui/material';
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
import DashboardCard from '../../componentsTools/Dashboard/DashboardCard';
import { format } from 'date-fns';
import LineChartComponent from '../../componentsTools/Dashboard/LineChartComponent';
import AreaChartComponent from '../../componentsTools/Dashboard/AreaChartComponent';
import BarChartComponent from '../../componentsTools/Dashboard/BarChartComponent';
import SparklineChartComponent from '../../componentsTools/Dashboard/SparklineChartComponent';
import useAuth from '../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import VirtualTableJournalAttente from '../../componentsTools/Dashboard/VirtualTableJournalAttente';
import usePermission from '../../../hooks/usePermission';
import { Line } from 'react-chartjs-2';
import RevuAnalytiqueNN1 from './RevuAnalytiqueNN1';
import RevuAnalytiqueMensuelle from './RevuAnalytiqueMensuelle';

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
const dashboardCardHeight = 80;
const dashboardCardMinWidth = 170;

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

  //récupération des informations de connexion
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const compteId = decoded.UserInfo.compteId || null;
  const userId = decoded.UserInfo.userId || null;

  const [selectedExerciceId, setSelectedExerciceId] = useState(0);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [selectedPeriodeDates, setSelectedPeriodeDates] = useState(null);
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

  //Choix exercice
  const handleChangeExercice = (exercice_id) => {
    setSelectedExerciceId(exercice_id);
    setSelectedPeriodeId('');
    setSelectedPeriodeDates(null);
    GetListePeriodes(exercice_id);
  }

  //Récupérer la liste des exercices
  const GetListeExercice = (id) => {
    axios.get(`/paramExercice/listeExercice/${id}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setListeExercice(resData.list);

        const exerciceNId = resData.list?.filter((item) => item.libelle_rang === "N");
        setListeSituation(exerciceNId);

        setSelectedExerciceId(exerciceNId[0]?.id);
        setSelectedPeriodeId('');
        setSelectedPeriodeDates(null);

        // Charger les periodes de l'exercice N
        if (exerciceNId[0]?.id) {
          GetListePeriodes(exerciceNId[0]?.id);
        }

      } else {
        setListeExercice([]);
        toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
      }
    })
  }

  //Choix periode (comme dans Revision)
  const handleChangePeriode = (periodeId) => {
    setSelectedPeriodeId(periodeId);
    if (periodeId) {
      const periode = listeSituation.find(p => p.id === periodeId);
      if (periode) {
        setSelectedPeriodeDates({
          date_debut: periode.date_debut,
          date_fin: periode.date_fin
        });
      }
    } else {
      setSelectedPeriodeDates(null);
    }
  }

  //Récupérer la liste des periodes liees a l'exercice
  const GetListePeriodes = (id_exercice) => {
    axios.get(`/paramExercice/listePeriodes/${id_exercice}`).then((response) => {
      const resData = response.data;
      if (resData.state) {
        setListeSituation(resData.list || []);
      } else {
        setListeSituation([]);
      }
    })
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
      setDeviseParDefaut(deviseParDefaut?.code || 'EUR');
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
    GetListeExercice(idFile);
  }, []);

  useEffect(() => {
    if (compteId && fileId && selectedExerciceId && canView) {
      getAllInfo();
      getParDefaut();
      getListeJournalEnAttente();
    }
  }, [compteId, fileId, selectedExerciceId, selectedPeriodeDates]);

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
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList aria-label="lab API tabs example">
              <Tab
                style={{
                  textTransform: 'none',
                  outline: 'none',
                  border: 'none',
                  margin: -5
                }}
                label={InfoFileStyle(fileInfos?.dossier)} value="1"
              />
            </TabList>
          </Box>
          <TabPanel value="1" style={{ height: '100%' }}>
            <Stack width={"100%"} height={"100%"} spacing={6} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
              <Typography variant='h6' sx={{ color: "black", }} align='left'>Dashboard</Typography>

              <Stack width={"100%"} spacing={4} alignItems={"left"} alignContent={"center"} direction={"column"} style={{ marginLeft: "0px", marginTop: "20px" }}>
                <Stack
                  direction={"row"}
                >
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                    <InputLabel id="demo-simple-select-standard-label">Exercice:</InputLabel>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={selectedExerciceId}
                      label={"valSelect"}
                      onChange={(e) => handleChangeExercice(e.target.value)}
                      sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                      MenuProps={{
                        disableScrollLock: true
                      }}
                    >
                      {listeExercice.map((option) => (
                        <MenuItem
                          key={option.id}
                          value={option.id}
                        >{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
                      ))
                      }
                    </Select>
                  </FormControl>

                  {/* always show the selector; disable/grey if no periods */}
                  {
                   <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                      <InputLabel id="periode-select-label"></InputLabel>
                      <Select
                        labelId="periode-select-label"
                        id="periode-select"
                        value={selectedPeriodeId}
                        onChange={(e) => handleChangePeriode(e.target.value)}
                        displayEmpty
                        disabled={listeSituation.length === 0}
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em>Sélectionner une période...</em>;
                          }
                          const periode = listeSituation.find(p => p.id === selected);
                          return periode ? `${periode.libelle || ''}${formatDate(periode.date_debut)} au ${formatDate(periode.date_fin)}` : '';
                        }}
                      sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                        MenuProps={{
                          disableScrollLock: true
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Sélectionner une période...</em>
                        </MenuItem>
                        {listeSituation?.map((periode) => (
                          <MenuItem key={periode.id} value={periode.id}>
                            {periode.libelle || ''}{formatDate(periode.date_debut)} au {formatDate(periode.date_fin)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  }
                </Stack>
              </Stack>

              <Stack width={'100%'} spacing={2}>
                <Stack
                  direction={'row'}
                  width={'100%'}
                  spacing={gridSpacing}
                  justifyContent={'space-between'}
                  alignItems={'stretch'}
                  sx={{
                    overflowX: 'auto',
                    pb: 0.5,
                  }}
                >
                  <DashboardCard
                    text={'Résultat'}
                    type={'total'}
                    montant={'$5000'}
                    backgroundColor={'#037934'}
                    resultatN={resultatN}
                    resultatN1={resultatN1}
                    variationN={variationResultatN}
                    variationN1={variationResultatN1}
                    evolutionN={evolutionResultatN}
                    evolutionN1={evolutionResultatN1}
                    trendLabels={moisN}
                    trendN={margeBruteNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{
                      minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0', borderRadius: 1, background: 'linear-gradient(135deg, #037934ff 0%, #85bea3ff 100%)'
                    }}
                  />
                  <DashboardCard
                    text={'Chiffre d\'affaires'}
                    type={'comparaison'}
                    pourcentage={'10'}
                    backgroundColor={'#037934'}
                    resultatN={resultatChiffreAffaireN}
                    resultatN1={resultatChiffreAffaireN1}
                    variationN={variationChiffreAffaireN}
                    variationN1={variationChiffreAffaireN1}
                    evolutionN={evolutionChiffreAffaireN}
                    evolutionN1={evolutionChiffreAffaireN1}
                    trendLabels={moisN}
                    trendN={chiffresAffairesNGraph}
                    trendN1={chiffresAffairesN1Graph}
                    devise={deviseParDefaut}
                    compact
                    sx={{
                      minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0', borderRadius: 1, background: 'linear-gradient(135deg, #037934ff 0%, #85bea3ff 100%)'
                    }}
                  />
                  <DashboardCard
                    text={'Dépenses (Achats)'}
                    type={'comparaison'}
                    backgroundColor={'#fb8c00'}
                    resultatN={resultatDepenseAchatN}
                    resultatN1={resultatDepenseAchatN1}
                    variationN={variationDepenseAchatN}
                    variationN1={variationDepenseAchatN1}
                    evolutionN={evolutionDepenseAchatN}
                    evolutionN1={evolutionDepenseAchatN1}
                    trendLabels={moisN}
                    trendN={chiffresAffairesNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{
                      minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0', borderRadius: 1, background: 'linear-gradient(135deg, #fb8c00 0%, #fbc02d 100%)'
                    }}
                  />
                  <DashboardCard
                    text={'Dépenses salariales'}
                    type={'comparaison'}
                    backgroundColor={'#fb8c00'}
                    resultatN={resultatDepenseSalarialeN}
                    resultatN1={resultatDepenseSalarialeN1}
                    variationN={variationDepenseSalarialeN}
                    variationN1={variationDepenseSalarialeN1}
                    evolutionN={evolutionDepenseSalarialeN}
                    evolutionN1={evolutionDepenseSalarialeN1}
                    trendLabels={moisN}
                    trendN={margeBruteNGraph}
                    devise={deviseParDefaut}
                    compact
                    sx={{
                      minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0', borderRadius: 1, background: 'linear-gradient(135deg, #fb8c00 0%, #fbc02d 100%)'
                    }}
                  />
                  <DashboardCard
                    text={'Trésoreries (Banques)'}
                    type={'comparaison'}
                    backgroundColor={'#095a9c'}
                    resultatN={resultatTresorerieBanqueN}
                    resultatN1={resultatTresorerieBanqueN1}
                    variationN={variationTresorerieBanqueN}
                    variationN1={variationTresorerieBanqueN1}
                    evolutionN={evolutionTresorerieBanqueN}
                    evolutionN1={evolutionTresorerieBanqueN1}
                    trendLabels={moisN}
                    trendN={tresorerieBanqueNGraph}
                    trendN1={tresorerieBanqueN1Graph}
                    devise={deviseParDefaut}
                    compact
                    sx={{
                      minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0', borderRadius: 1, background: 'linear-gradient(135deg, #095a9cff 0%, #6dc5eeff 100%)'
                    }}
                  />
                  <DashboardCard
                    text={'Trésoreries (Caisse)'}
                    type={'comparaison'}
                    backgroundColor={'#095a9c'}
                    resultatN={resultatTresorerieCaisseN}
                    resultatN1={resultatTresorerieCaisseN1}
                    variationN={variationTresorerieCaisseN}
                    variationN1={variationTresorerieCaisseN1}
                    evolutionN={evolutionTresorerieCaisseN}
                    evolutionN1={evolutionTresorerieCaisseN1}
                    trendLabels={moisN}
                    trendN={tresorerieCaisseNGraph}
                    trendN1={tresorerieCaisseN1Graph}
                    devise={deviseParDefaut}
                    compact
                    sx={{
                      minWidth: dashboardCardMinWidth, height: dashboardCardHeight, flex: '1 1 0', borderRadius: 1, background: 'linear-gradient(135deg, #095a9cff 0%, #6dc5eeff 100%)'
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  width={'100%'}
                  spacing={gridSpacing}
                  alignItems={'stretch'}
                  sx={{ backgroundColor: '#f8f8f8ff', p: 1, borderRadius: 1 }}
                >
                  <Stack direction="column" spacing={gridSpacing} sx={{ flex: { xs: '1 1 auto', md: '2 1 0' }, minWidth: 0 }}>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        borderRadius: 1,
                        p: 1,
                        minWidth: 0,
                        height: { xs: 'auto', md: 400 },
                      }}
                    >
                      <AreaChartComponent
                        xAxis={moisN}
                        xAxis1={moisN1}
                        dataN={chiffresAffairesNGraph}
                        dataN1={chiffresAffairesN1Graph}
                        label={'Chiffre d\'affaires'}
                      />
                    </Box>

                    <Box sx={{ backgroundColor: 'white', boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 1, p: 1, minWidth: 0, minHeight: 0, height: 389 }}>
                      <Typography variant='h7' sx={{ color: "black" }} align='left'>Comptes en attente</Typography>
                      <VirtualTableJournalAttente tableHeader={columns} tableRow={journalData} />
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      flex: { xs: '1 1 auto', md: '1 1 0' },
                      minWidth: 0,
                      height: { xs: 'auto', md: 800 },
                      display: 'grid',
                      gap: gridSpacing,
                      gridTemplateRows: { xs: 'auto', md: 'repeat(3, 1fr)' },
                    }}
                  >
                    <Box sx={{ backgroundColor: 'white', boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 1, p: 1, minWidth: 0, minHeight: 0 }}>
                      <AreaChartComponent
                        xAxis={moisN}
                        xAxis1={moisN1}
                        dataN={margeBruteNGraph}
                        dataN1={margeBruteN1Graph}
                        label={'Marges brutes'}
                      />
                    </Box>

                    <Box sx={{ backgroundColor: 'white', boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 0, p: 1, minWidth: 0, minHeight: 0 }}>
                      <BarChartComponent
                        xAxis={moisN}
                        xAxis1={moisN1}
                        dataN={tresorerieBanqueNGraph}
                        dataN1={tresorerieBanqueN1Graph}
                        label={'Trésoreries (Banques)'}
                      />
                    </Box>

                    <Box sx={{ backgroundColor: 'white', boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 0, p: 1, minWidth: 0, minHeight: 0 }}>
                      <BarChartComponent
                        xAxis={moisN}
                        xAxis1={moisN1}
                        dataN={tresorerieCaisseNGraph}
                        dataN1={tresorerieCaisseN1Graph}
                        label={'Trésoreries (Caisses)'}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Stack>

              <Box sx={{ width: '100%', mt: 2 }}>
                <TabContext value={valueRevuAnalytique}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChangeRevuAnalytiqueTab} aria-label="revue analytique tabs" variant="scrollable">
                      <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Revu Analytique N/N-1" value="1" />
                      <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Revu Analytique mensuelle" value="2" />
                    </TabList>
                  </Box>

                  <TabPanel value="1" sx={{ px: 0, pt: 2 }}>
                    <RevuAnalytiqueNN1
                      compteId={compteId}
                      dossierId={fileId}
                      exerciceId={selectedExerciceId}
                      dateDebut={selectedPeriodeDates?.date_debut}
                      dateFin={selectedPeriodeDates?.date_fin}
                    />
                  </TabPanel>

                  <TabPanel value="2" sx={{ px: 0, pt: 2 }}>
                    <RevuAnalytiqueMensuelle
                      compteId={compteId}
                      dossierId={fileId}
                      exerciceId={selectedExerciceId}
                      dateDebut={selectedPeriodeDates?.date_debut}
                      dateFin={selectedPeriodeDates?.date_fin}
                    />
                  </TabPanel>
                </TabContext>
              </Box>
            </Stack>
          </TabPanel>
        </TabContext>
      </Box>
    </>
  )
}
