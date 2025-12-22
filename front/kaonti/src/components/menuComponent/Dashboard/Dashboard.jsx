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
import useAuth from '../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import VirtualTableJournalAttente from '../../componentsTools/Dashboard/VirtualTableJournalAttente';
import usePermission from '../../../hooks/usePermission';

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

export default function DashboardComponent() {
  const { canAdd, canModify, canDelete, canView } = usePermission();

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
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);
  const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);

  const [chiffresAffairesNGraph, setChiffresAffairesNGraph] = useState([]);
  const [chiffresAffairesN1Graph, setChiffresAffairesN1Graph] = useState([]);

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
    setSelectedPeriodeChoiceId("0");
    setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
    setSelectedPeriodeId(exercice_id);
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
        setSelectedPeriodeChoiceId(0);
        setSelectedPeriodeId(exerciceNId[0]?.id);

      } else {
        setListeExercice([]);
        toast.error("une erreur est survenue lors de la récupération de la liste des exercices");
      }
    })
  }

  //Récupérer la liste des exercices
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

  // Récupération de toutes les informations
  const getAllInfo = () => {
    axios.get(`/dashboard/getAllInfo/${Number(compteId)}/${Number(fileId)}/${Number(selectedExerciceId)}`)
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
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.message || err?.message || "Erreur inconnue");
      });
  }

  const getListeJournalEnAttente = () => {
    axios.get(`/dashboard/getListeJournalEnAttente/${Number(compteId)}/${Number(fileId)}/${Number(selectedExerciceId)}`)
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
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
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
      getListeJournalEnAttente();
    }
  }, [compteId, fileId, selectedExerciceId]);

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

                  <FormControl variant="standard" sx={{ m: 1, minWidth: 150 }}>
                    <InputLabel id="demo-simple-select-standard-label">Période</InputLabel>
                    <Select
                      disabled
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={selectedPeriodeChoiceId}
                      label={"valSelect"}
                      onChange={(e) => handleChangePeriode(e.target.value)}
                      sx={{ width: "150px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                      MenuProps={{
                        disableScrollLock: true
                      }}
                    >
                      <MenuItem value={0}>Toutes</MenuItem>
                      <MenuItem value={1}>Situations</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                    <InputLabel id="demo-simple-select-standard-label">Du</InputLabel>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={selectedPeriodeId}
                      label={"valSelect"}
                      onChange={(e) => handleChangeDateIntervalle(e.target.value)}
                      sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                      MenuProps={{
                        disableScrollLock: true
                      }}
                    >
                      {listeSituation?.map((option) => (
                        <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
                      ))
                      }
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              <Stack
                alignItems={'center'}
                direction={'row'}
                width={'100%'}
                spacing={gridSpacing}
              >
                <Stack
                  style={{
                    backgroundColor: '#f4f6f7ff',
                  }}
                  boxShadow={1}
                  borderRadius={0}
                  width={'65%'}
                  height={gridHeight}
                >
                  <Stack
                    width="100%"
                    height="100%"
                    direction={'column'}
                    spacing={1}
                  >
                    <Stack
                      width="100%"
                      height="100%"
                      direction={'row'}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <LineChartComponent
                        xAxis={xAxis}
                        dataN={chiffresAffairesNGraph}
                        dataN1={chiffresAffairesN1Graph}
                        label={'Chiffre d\'affaires'}
                      />

                      <LineChartComponent
                        xAxis={xAxis}
                        dataN={margeBruteNGraph}
                        dataN1={margeBruteN1Graph}
                        label={'Marges brutes'}
                      />

                    </Stack>
                    <Stack
                      width="100%"
                      height="100%"
                      direction={'row'}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <LineChartComponent
                        xAxis={xAxis}
                        dataN={tresorerieBanqueNGraph}
                        dataN1={tresorerieBanqueN1Graph}
                        label={'Trésoreries (Banques)'}
                      />

                      <LineChartComponent
                        xAxis={xAxis}
                        dataN={tresorerieCaisseNGraph}
                        dataN1={tresorerieCaisseN1Graph}
                        label={'Trésoreries (Caisses)'}
                      />
                    </Stack>
                  </Stack>
                </Stack>

                <Stack
                  alignItems={'center'}
                  direction={'column'}
                  justifyContent={'space-between'}
                  width={'35%'}
                  height={gridHeight}
                  spacing={gridSpacing}
                >
                  <Stack
                    alignItems={'center'}
                    direction={'row'}
                    width={'100%'}
                    height={'33.3%'}
                    spacing={gridSpacing}
                  >
                    <DashboardCard
                      text={'Résultat'}
                      type={'total'}
                      montant={'$5000'}
                      backgroundColor={'#289c70'}
                      resultatN={resultatN}
                      resultatN1={resultatN1}
                      variationN={variationResultatN}
                      variationN1={variationResultatN1}
                      evolutionN={evolutionResultatN}
                      evolutionN1={evolutionResultatN1}
                    />
                    <DashboardCard
                      text={'Chiffre d\'affaires'}
                      type={'comparaison'}
                      pourcentage={'10'}
                      backgroundColor={'#289c70'}
                      resultatN={resultatChiffreAffaireN}
                      resultatN1={resultatChiffreAffaireN1}
                      variationN={variationChiffreAffaireN}
                      variationN1={variationChiffreAffaireN1}
                      evolutionN={evolutionChiffreAffaireN}
                      evolutionN1={evolutionChiffreAffaireN1}
                    />
                  </Stack>
                  <Stack
                    alignItems={'center'}
                    direction={'row'}
                    width={'100%'}
                    height={'33.3%'}
                    spacing={gridSpacing}
                  >
                    <DashboardCard
                      text={'Dépenses (Achats)'}
                      type={'comparaison'}
                      backgroundColor={'#c95e42'}
                      resultatN={resultatDepenseAchatN}
                      resultatN1={resultatDepenseAchatN1}
                      variationN={variationDepenseAchatN}
                      variationN1={variationDepenseAchatN1}
                      evolutionN={evolutionDepenseAchatN}
                      evolutionN1={evolutionDepenseAchatN1}
                    />
                    <DashboardCard
                      text={'Dépenses salariales'}
                      type={'comparaison'}
                      backgroundColor={'#c95e42'}
                      resultatN={resultatDepenseSalarialeN}
                      resultatN1={resultatDepenseSalarialeN1}
                      variationN={variationDepenseSalarialeN}
                      variationN1={variationDepenseSalarialeN1}
                      evolutionN={evolutionDepenseSalarialeN}
                      evolutionN1={evolutionDepenseSalarialeN1}
                    />
                  </Stack>
                  <Stack
                    alignItems={'center'}
                    direction={'row'}
                    width={'100%'}
                    height={'33.3%'}
                    spacing={gridSpacing}
                  >
                    <DashboardCard
                      text={'Trésoreries (Banques)'}
                      type={'comparaison'}
                      backgroundColor={'#407dc9'}
                      resultatN={resultatTresorerieBanqueN}
                      resultatN1={resultatTresorerieBanqueN1}
                      variationN={variationTresorerieBanqueN}
                      variationN1={variationTresorerieBanqueN1}
                      evolutionN={evolutionTresorerieBanqueN}
                      evolutionN1={evolutionTresorerieBanqueN1}
                    />
                    <DashboardCard
                      text={'Trésoreries (Caisse)'}
                      type={'comparaison'}
                      backgroundColor={'#407dc9'}
                      resultatN={resultatTresorerieCaisseN}
                      resultatN1={resultatTresorerieCaisseN1}
                      variationN={variationTresorerieCaisseN}
                      variationN1={variationTresorerieCaisseN1}
                      evolutionN={evolutionTresorerieCaisseN}
                      evolutionN1={evolutionTresorerieCaisseN1}
                    />
                  </Stack>
                </Stack>
              </Stack>

              <Typography variant='h5' sx={{ color: "black" }} align='left'>Comptes en attente</Typography>
              <VirtualTableJournalAttente tableHeader={columns} tableRow={journalData} />
            </Stack>
          </TabPanel>
        </TabContext>
      </Box>
    </>
  )
}
