import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Typography, Stack, Paper, RadioGroup, FormControlLabel, Radio, FormControl,
    InputLabel, Select, MenuItem, TextField, Box, Tab,
    FormHelperText, Autocomplete, ButtonGroup, IconButton, Chip,
    AppBar, Toolbar, GlobalStyles, InputAdornment, Breadcrumbs
} from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { init } from '../../../../../init';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import { DataGrid, frFR, useGridApiContext, useGridApiRef } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import { TbCircleLetterCFilled, TbCircleLetterGFilled, TbCircleLetterAFilled } from "react-icons/tb";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { IoAdd, IoClose } from "react-icons/io5";
import ParamPCModele_column from './ParamPCModele_column';
import { useFormik, Field, Formik, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import QuickFilter from '../../../componentsTools/DatagridToolsStyle';
import { DataGridStyle } from '../../../componentsTools/DatagridToolsStyle';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import PopupImportModelePlanComptable from '../../administration/import/PopupImportModelePlanComptable';
import { format } from 'date-fns';
import { DetailsInformation } from '../../../componentsTools/DetailsInformation';
import usePermission from '../../../../hooks/usePermission';
import useAxiosPrivate from '../../../../../config/axiosPrivate';

// Icônes modernes pour le design
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Constantes de style modernes
const NEON_MINT = '#00FF94';
const NAV_DARK = '#0B1120';
const BG_SOFT = '#F8FAFC';
const BORDER_COLOR = '#E2E8F0';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

//header pour le tableau liste de modèle
const columnHeaderModel = ParamPCModele_column.columnHeaderModel;

//header pour le tableau ajouter compte de charge et/ou compte de TVA dans le popup
const columnHeaderAddNewRowModelDetail = ParamPCModele_column.columnHeaderAddNewRowModelDetail;

export default function ParamPlanComptableModele() {
    const { canAdd, canModify, canDelete, canView } = usePermission();
    const axiosPrivate = useAxiosPrivate();

    let initial = init[0];
    const { auth } = useAuth();

    let [listeModele, setListeModele] = useState([]);
    const [openNewModel, setOpenNewModel] = useState(false);
    const [modeleLibre, setModeleLibre] = useState(true);
    const [listDossier, setListeDossier] = useState([]);
    const [openImportDialog, setOpenImportDialog] = useState(false);

    const [openDialogDeleteModel, setOpenDialogDeleteModel] = useState(false);
    const [modelSelectedRow, setModelSelectedRow] = useState(null);
    const [selectedModelName, setSelectedModelName] = useState(null);
    const [modelId, setModelId] = useState(null);

    const [detailModel, setDetailModel] = useState([]);
    const [detailModelSelectedRow, setDetailModelSelectedRow] = useState([]);
    const [detailModelSelectedRowListChgAssoc, setDetailModelSelectedRowListChgAssoc] = useState([]);
    const [detailModelSelectedRowListTvaAssoc, setDetailModelSelectedRowListTvaAssoc] = useState([]);
    const [openDialogAddModelDetail, setOpenDialogAddModelDetail] = useState(false);

    const [listCptChg, setListCptChg] = useState([]);
    const [listCptTva, setListCptTva] = useState([]);

    const [tabValueAjoutNewRowModelDetail, setTabValueAjoutNewRowModelDetail] = useState("1");

    const [openDialogAddNewCptModelDetail, setOpenDialogAddNewCptModelDetail] = useState(false);
    const [pcHorsCollectif, setPcHorsCollectif] = useState([]);
    const [selectedCptAssocChg, setSelectedCptAssocChg] = useState({ idCpt: 0, compte: '', libelle: '' });
    const [selectedCptChgOnList, setSelectedCptChgOnList] = useState(0);
    let [openDialogDeleteCptChgFromAddNewCpt, setOpenDialogDeleteCptChgFromAddNewCpt] = useState(false);

    const [openDialogAddNewCptTvaModelDetail, setOpenDialogAddNewCptTvaModelDetail] = useState(false);
    const [pcOnlyCptTva, setPcOnlyCptTva] = useState([]);
    const [selectedCptAssocTva, setSelectedCptAssocTva] = useState({ idCpt: 0, compte: '', libelle: '' });
    const [selectedCptTvaOnList, setSelectedCptTvaOnList] = useState(0);
    const [openDialogDeleteCptTvaFromAddNewCpt, setOpenDialogDeleteCptTvaFromAddNewCpt] = useState(false);
    const [formulaireTier, setFormulaireTier] = useState('sans-nif');
    const [typeCptGeneral, setTypeCptGeneral] = useState(true);
    const [pcAllselectedRow, setPcAllselectedRow] = useState([]);
    const [openDialogDeleteItemsPc, setOpenDialogDeleteItemsPc] = useState(false);
    const [listeCptCollectif, setListeCptCollectif] = useState([]);
    const [disableLocalites, setDisableLocalites] = useState(false);
    const [disableTypeTiers, setDisableTypeTiers] = useState(true);

    const buttonStyle = {
        minWidth: 120,
        height: 32,
        px: 2,
        borderRadius: 1,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
    };



    const [provinces, setProvinces] = useState([]);
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCommune, setSelectedCommune] = useState('');
    const [rowCptInfos, setRowCptInfos] = useState([]);
    const [openInfos, setOpenInfos] = useState(false);

    // ===== STATES POUR EDITION INLINE =====
    const apiRef = useGridApiRef();
    const [rowModesModel, setRowModesModel] = useState({});
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isLoadingCollectif, setIsLoadingCollectif] = useState(false);
    const loadingCollectifRef = useRef(false);

    //paramètres de connexion------------------------------------
    const decoded = auth?.accessToken
        ? jwtDecode(auth.accessToken)
        : undefined
    const compteId = decoded.UserInfo.compteId || 0;
    const userId = decoded.UserInfo.userId || 0;

    //Récupération de la liste des modèles de plan comptable
    const GetListePlanComptableModele = () => {
        axios.post(`/paramPlanComptableModele/model`, { compteId, userId }).then((response) => {
            const resData = response.data;
            setListeModele(resData.modelList);
        })
    }

    useEffect(() => {
        if (canView) {
            GetListePlanComptableModele();
        }
    }, [compteId]);

    //AJOUT D'UN NOUVEAU MODELE DE PLAN COMPTABLE
    const saveModelePcValue = (e) => {
        formNewModel.setFieldValue('model', e);

        if (e === 'modeleLibre') {
            setModeleLibre(true);
        } else {
            setModeleLibre(false);
        }
    }

    //Récupérer la liste des dossiers associés au comptes de l'utilisateur
    const GetListeDossier = () => {
        axios.post(`/paramPlanComptableModele/dossier`, { compteId, userId }).then((response) => {
            const resData = response.data;
            setListeDossier(resData.dossierList);
        })
    }

    const handleClickOpenNewModel = () => {
        GetListeDossier();
        setOpenNewModel(true);
    };
    const handleCloseNewModel = () => {
        setOpenNewModel(false);
    };

    const formNewModel = useFormik({
        initialValues: {
            compteId: compteId,
            model: '',
            id_dossier: 0,
            model_name: null,
        },
        validationSchema: Yup.object({
            model: Yup.string().required("Choisir un modèle"),
            id_dossier: Yup.mixed()
                .when('model', {
                    is: (value) => value !== 'modeleLibre',
                    then: () => Yup.number().moreThan(0, 'Sélectionner un dossier dans la liste'),
                    otherwise: () => Yup.number().notRequired(),
                }),

            model_name: Yup.string().required("Veuillez taper un nom pour le modèle")
                .min(1, 'Veuillez ajouter au moin un caractère pour le nom du modèle')
        }),
        onSubmit: (values) => {
            axiosPrivate.post(`/paramPlanComptableModele/createModel`, values).then((response) => {
                const resData = response.data;
                GetListePlanComptableModele();
                handleCloseNewModel();
                toast.success(resData);
            })
        }
    });

    //Suppression d'un modèle de plan comptable
    const deleteModelPC = (value) => {
        if (value === true) {

            if (modelId !== null) {
                const rowId = modelSelectedRow.id;
                if (modelSelectedRow.pardefault) {
                    toast.error("Vous ne pouvez pas supprimer un modèle plan comptable natif de kaonty.");
                } else {
                    axiosPrivate.post(`/paramPlanComptableModele/deleteModel`, { rowId }).then((response) => {
                        const resData = response.data;
                        GetListePlanComptableModele();
                        setOpenDialogDeleteModel(false);
                        toast.success(resData);
                    })
                }

            } else {
                toast.error("Veuillez sélectionner un seul modèle de plan comptable dans le tableau liste modèle.");
            }

        } else {
            setOpenDialogDeleteModel(false);
        }
    }

    const handleClickOpenDialogDeleteModel = () => {
        setOpenDialogDeleteModel(true);
    }

    //Récupération de l'ID de la ligne sélectionner dans le tableau de la liste de modèle
    const listModelPCSelectedRow = (selectedRow) => {
        if (selectedRow.length === 1) {
            const itemId = selectedRow[0];
            const itemInfos = listeModele.find(row => row.id === itemId);

            if (itemInfos) {
                setModelSelectedRow(itemInfos);
                setSelectedModelName(itemInfos.nom);
                setModelId(itemId);
            } else {
                setModelSelectedRow([]);
                setSelectedModelName('');
                setModelId(null);
            }

            if (itemId !== null) {
                showModelDetail(itemId);
            } else {
                showModelDetail([]);
            }
        } else {
            setModelSelectedRow([]);
            setSelectedModelName('');
            setModelId(null);
            showModelDetail([]);
        }
    }

    //Affichage détails du modèle
    const showModelDetail = (rowId) => {
        axios.post(`/paramPlanComptableModele/detailModel`, { rowId }).then((response) => {
            const resData = response.data;
            const mapped = (resData.modelDetail || []).map((r) => ({
                ...r,
                baseCompte: r.baseCompte ?? r.baseaux ?? '',
            }));
            setDetailModel(mapped);
        })
    }

    //Ajouter un compte dans la liste du plan comptable

    const handleCloseDialogDetailModelAdd = () => {
        setOpenDialogAddModelDetail(false);
    }

    const handleOpenDialogDetailModelAdd = (setFieldValue, resetForm) => async () => {
        if (modelId !== null) {
            // Charger d'abord la liste des comptes collectifs
            await recupererListeCptCollectifInline();

            resetForm();
            setListCptChg([]);
            setListCptTva([]);

            // Option A: reset local selections and dependent lists on open
            setSelectedProvince('');
            setSelectedRegion('');
            setSelectedDistrict('');
            setSelectedCommune('');
            setRegions([]);
            setDistricts([]);
            setCommunes([]);
            setFieldValue("action", "new");
            setFieldValue("idCompte", Number(compteId));


            setFieldValue("action", "new");
            setFieldValue("idCompte", Number(compteId));
            setFieldValue("idModele", modelId);

            setFormulaireTier('sans-nif');
            setTypeCptGeneral(true);
            setDisableTypeTiers(true); // Désactiver Type Tiers par défaut (nature = General)

            setFieldValue('typeTier', 'general');
            setFormulaireTier('general');
            setDisableLocalites(true);

            // Garder le champ 'Type du tier' actif
            setFieldValue('typeTier', 'general');
            setFormulaireTier('general');


            setOpenDialogAddModelDetail(true);
        } else {
            toast.error("Veuillez sélectionner un seul modèle de plan comptable.");
        }
    }

    const handleOpenDialogDetailModelModify = (setFieldValue) => async () => {
        // Charger d'abord la liste des comptes collectifs
        await recupererListeCptCollectifInline();

        setFieldValue("action", "modify");
        setFieldValue("itemId", detailModelSelectedRow.id);
        setFieldValue("idCompte", Number(compteId));
        setFieldValue("idModele", modelId);
        setFieldValue("compte", detailModelSelectedRow.compte);
        setFieldValue("libelle", detailModelSelectedRow.libelle);
        setFieldValue("nature", detailModelSelectedRow.nature);
        // En modification: si General/Collectif, la base = le compte lui-même (id);
        // sinon (Aux), on garde la base existante (baseaux_id)
        if (detailModelSelectedRow.nature === 'General' || detailModelSelectedRow.nature === 'Collectif') {
            setFieldValue("baseCptCollectif", detailModelSelectedRow.id);
        } else {
            // Use the base account ID so it matches the Select's MenuItem values (which use item.id)
            setFieldValue("baseCptCollectif", detailModelSelectedRow.baseaux_id);
        }
        const isGen = detailModelSelectedRow.nature === 'General' || detailModelSelectedRow.nature === 'Collectif';
        const isEtr = detailModelSelectedRow.typetier === 'etranger';

        if (isGen) {
            // En modification: General/Collectif => type du tier forcé à 'general' et localités grisées
            setFieldValue("typeTier", 'general');
            setFormulaireTier('general');
            setDisableLocalites(true);
        } else {
            // Sinon, on garde le type du tier de la ligne et on grise les localités si 'etranger'
            setFieldValue("typeTier", detailModelSelectedRow.typetier);
            setFormulaireTier(detailModelSelectedRow.typetier);
            setDisableLocalites(isEtr);
        }

        setFieldValue("nif", detailModelSelectedRow.nif);
        setFieldValue("stat", detailModelSelectedRow.statistique);
        setFieldValue("adresse", detailModelSelectedRow.adresse);
        setFieldValue("motcle", detailModelSelectedRow.motcle);
        setFieldValue("cin", detailModelSelectedRow.cin);
        setFieldValue("dateCin", detailModelSelectedRow.datecin ? format(detailModelSelectedRow?.datecin, 'yyyy-MM-dd') : null);
        setFieldValue("autrePieceID", detailModelSelectedRow.autrepieceid);
        setFieldValue("refPieceID", detailModelSelectedRow.refpieceid);
        setFieldValue("adresseSansNIF", detailModelSelectedRow.adressesansnif);
        setFieldValue("nifRepresentant", detailModelSelectedRow.nifrepresentant);
        setFieldValue("adresseEtranger", detailModelSelectedRow.adresseetranger);
        setFieldValue("pays", detailModelSelectedRow.pays);

        setFieldValue("listeCptChg", listCptChg);
        setFieldValue("listeCptTva", listCptTva);

        setFieldValue("province", detailModelSelectedRow.province);
        setFieldValue("region", detailModelSelectedRow.region);
        setFieldValue("district", detailModelSelectedRow.district);
        setFieldValue("commune", detailModelSelectedRow.commune);


        //Activer ou non la listbox base compte auxiliaire et Type Tiers
        if (detailModelSelectedRow.nature === 'General' || detailModelSelectedRow.nature === 'Collectif') {
            setTypeCptGeneral(true);
            setDisableTypeTiers(true); // Désactiver Type Tiers pour General/Collectif
        } else {
            setTypeCptGeneral(false);
            setDisableTypeTiers(false); // Activer Type Tiers pour Auxiliaire
        }

        setOpenDialogAddModelDetail(true);
    }

    //Choix TAB value pour dialog ajout de nouvelle ligne du tableau détail modèle plan comptable
    const handleChangeTabValueAjoutNewRowModelDetail = (event, newValue) => {
        setTabValueAjoutNewRowModelDetail(newValue);
    };
    // Normalise: supprime espaces/points/tirets, trim, majuscules
    const normalizeCompte = (v) =>
        (v || '')
            .toString()
            .toUpperCase()
            .replace(/[\s\.\-]/g, '')
            .trim();

    const formAddCptModelInitialValues = {
        action: 'new',
        itemId: 0,
        idCompte: 0,
        idModele: 0,
        compte: '',
        libelle: '',
        nature: 'General',
        baseCptCollectif: 0,
        typeTier: 'sans-nif',
        nif: '',
        stat: '',
        adresse: '',
        motcle: '',
        cin: '',
        dateCin: '',
        autrePieceID: '',
        refPieceID: '',
        adresseSansNIF: '',
        nifRepresentant: '',
        adresseEtranger: '',
        pays: '',
        province: '',
        region: '',
        district: '',
        commune: '',
        listeCptChg: [],
        listeCptTva: [],
    };

    const formAddCptModelValidationSchema = Yup.object({
        compte: Yup.string()
            .required("Veuillez tapez un numéro de compte")
            .test('unique-compte', 'Ce compte existe déjà', function (value) {
                const list = Array.isArray(detailModel) ? detailModel : [];
                const v = normalizeCompte(value);

                const action = this.parent?.action;   // 'new' | 'modify'
                const itemId = Number(this.parent?.itemId);

                if (!v) return false;

                // En modification: autoriser si la valeur n'a pas changé
                if (action === 'modify') {
                    const current = list.find(r => Number(r.id) === itemId)?.compte;
                    if (normalizeCompte(current) === v) return true;
                }

                // En création (ou compte modifié): bloquer si existe déjà
                const exists = list.some(r => Number(r.id) !== itemId && normalizeCompte(r.compte) === v);
                return !exists;
            }),
        libelle: Yup.string().required("Veuillez insérer un libellé pour le numéro de compte"),
        nature: Yup.string().required("Veuillez séléctionner dans la liste la nature du compte"),
        baseCptCollectif: Yup.number()
            .when('nature', {
                is: (value) => value === 'Aux',
                then: () => Yup.number().typeError("Veuillez entrer un nombre")
                    .moreThan(0, "Veuillez ajouter la base du compte collectif")
                    .required("Ce champ est requis"),
                otherwise: () => Yup.number().notRequired(),
            }),
        nif: Yup.string()
            .when('typeTier', {
                is: (value) => value === 'avec-nif',
                then: () => Yup.string().required("Veuillez ajouter le numéro NIF du tier").min(10, 'Veuillez bien formater le numéro NIF'),
                otherwise: () => Yup.string().notRequired(),
            }),
        dateCin: Yup.string()
            .when('typeTier', {
                is: (value) => value === 'sans-nif',
                then: () => Yup.string()
                    .matches(
                        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, // = format du back pour la datapicker yyyy-MM-dd
                        'La date doit être au format jj/mm/aaaa'
                    )
                    .test('is-valid-date', 'La date doit être valide', (value) => {
                        if (!value) return false;

                        const [year, month, day] = value.split('-').map(Number);

                        // Vérifie les mois
                        if (month < 1 || month > 12) return false;

                        // Vérifie les jours en fonction du mois
                        const daysInMonth = new Date(year, month, 0).getDate();
                        return day >= 1 && day <= daysInMonth;
                    }).required('La date est requise'),
                otherwise: () => Yup.string().notRequired(),
            }),
        nifRepresentant: Yup.string()
            .when('typeTier', {
                is: (value) => value === 'etranger',
                then: () => Yup.string().required("Veuillez ajouter le numéro NIF du tier").min(10, 'Veuillez bien formater le numéro NIF'),
                otherwise: () => Yup.string().notRequired(),
            }),
        province: Yup.string()
            .when(['nature', 'typeTier'], {
                is: (nature, typeTier) => nature === 'General' || nature === 'Collectif' || typeTier === 'etranger',
                then: () => Yup.string().notRequired(),
                otherwise: () => Yup.string().required("Veuillez sélectionner une province"),
            }),
        region: Yup.string()
            .when(['nature', 'typeTier'], {
                is: (nature, typeTier) => nature === 'General' || nature === 'Collectif' || typeTier === 'etranger',
                then: () => Yup.string().notRequired(),
                otherwise: () => Yup.string().required("Veuillez sélectionner une région"),
            }),
        district: Yup.string()
            .when(['nature', 'typeTier'], {
                is: (nature, typeTier) => nature === 'General' || nature === 'Collectif' || typeTier === 'etranger',
                then: () => Yup.string().notRequired(),
                otherwise: () => Yup.string().required("Veuillez sélectionner un district"),
            }),
        commune: Yup.string()
            .when(['nature', 'typeTier'], {
                is: (nature, typeTier) => nature === 'General' || nature === 'Collectif' || typeTier === 'etranger',
                then: () => Yup.string().notRequired(),
                otherwise: () => Yup.string().required("Veuillez sélectionner une commune"),
            }),
    });

    const formAddCptModelhandleSubmit = (values) => {
        if (modelSelectedRow.pardefault) {
            toast.error("Vous ne pouvez pas modifier les comptes associés au modèle de plan comptable natif de kaonty.");
        } else {
            axiosPrivate.post(`/paramPlanComptableModele/AddCptTodetailModel`, values).then((response) => {
                const resData = response.data;
                if (resData.state === true) {
                    showModelDetail(modelId);
                    toast.success(resData.msg);
                } else {
                    toast.error(resData.msg);
                }
                setOpenDialogAddModelDetail(false);
            })
        }
    }

    const getProvinces = async () => {
        try {
            const response = await axios.get('/paramPlanComptable/getProvinces');
            return response.data;
        } catch (error) {
            console.error('Erreur fetchProvinces:', error);
            return [];
        }
    }

    const getRegions = async (province) => {
        if (!province) return [];
        try {
            const response = await axios.get(`/paramPlanComptable/getRegions/${province}`);
            return response.data;
        } catch (error) {
            console.error('Erreur fetchRegions:', error);
            return [];
        }
    }

    const getDistricts = async (province, region) => {
        if (!province || !region) return [];
        try {
            const response = await axios.get(`/paramPlanComptable/getDistricts/${province}/${region}`);
            return response.data;
        } catch (error) {
            console.error('Erreur fetchDistricts:', error);
            return [];
        }
    }

    const getCommunes = async (province, region, district) => {
        if (!province || !region || !district) return [];
        try {
            const response = await axios.get(`/paramPlanComptable/getCommunes/${province}/${region}/${district}`);
            return response.data;
        } catch (error) {
            console.error('Erreur fetchCommunes:', error);
            return [];
        }
    }
    // Charger les provinces
    useEffect(() => {
        getProvinces().then(setProvinces);
    }, []);

    // Charger les régions quand la province change, mais ne pas réinitialiser si on a déjà une région sélectionnée
    useEffect(() => {
        if (selectedProvince) {
            getRegions(selectedProvince).then((data) => setRegions(data));

            // Ne réinitialise que si on est en création (pas de selectedRegion)
            if (!selectedRegion) setSelectedRegion('');
            if (!selectedDistrict) setDistricts([]);
            if (!selectedDistrict) setSelectedDistrict('');
            if (!selectedCommune) setCommunes([]);
            if (!selectedCommune) setSelectedCommune('');
        } else {
            setRegions([]);
            setSelectedRegion('');
            setDistricts([]);
            setSelectedDistrict('');
            setCommunes([]);
            setSelectedCommune('');
        }
    }, [selectedProvince]);

    // Charger les districts quand la région change, idem
    useEffect(() => {
        if (selectedProvince && selectedRegion) {
            getDistricts(selectedProvince, selectedRegion).then((data) => setDistricts(data));

            if (!selectedDistrict) setSelectedDistrict('');
            if (!selectedCommune) setCommunes([]);
            if (!selectedCommune) setSelectedCommune('');
        } else {
            setDistricts([]);
            setSelectedDistrict('');
            setCommunes([]);
            setSelectedCommune('');
        }
    }, [selectedProvince, selectedRegion]);

    // Charger les communes quand le district change
    useEffect(() => {
        if (selectedProvince && selectedRegion && selectedDistrict) {
            getCommunes(selectedProvince, selectedRegion, selectedDistrict).then((data) => setCommunes(data));
        } else {
            setCommunes([]);
            setSelectedCommune('');
        }
    }, [selectedProvince, selectedRegion, selectedDistrict]);

    // Remplissage automatique pour les localites
    useEffect(() => {
        if (detailModelSelectedRow) {
            setSelectedProvince(detailModelSelectedRow.province);
            setSelectedRegion(detailModelSelectedRow.region);
            setSelectedDistrict(detailModelSelectedRow.district);
            setSelectedCommune(detailModelSelectedRow.commune);
        }
    }, [detailModelSelectedRow])

    //Action pour disable ou enable base compte collectif dans le formulaire nouveau compte pour le modèle
    const handleChangeListBoxNature = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('nature', value)
        if (value === 'General' || value === 'Collectif') {
            setTypeCptGeneral(true);
            setDisableTypeTiers(true); // Désactiver le champ Type Tiers
            // En MODIFICATION, forcer la base à l'ID du compte
            if (detailModelSelectedRow && detailModelSelectedRow.id) {
                setFieldValue('baseCptCollectif', detailModelSelectedRow.id);
            }
            // Si Nature = General OU Collectif, mettre Type du Tier = general et griser les localités
            setFieldValue('typeTier', 'general');
            setFormulaireTier('general');
            setDisableLocalites(true);
            // Réinitialiser les localités
            setFieldValue('province', '');
            setFieldValue('region', '');
            setFieldValue('district', '');
            setFieldValue('commune', '');
            setSelectedProvince('');
            setSelectedRegion('');
            setSelectedDistrict('');
            setSelectedCommune('');
        } else {
            setTypeCptGeneral(false);
            setDisableTypeTiers(false); // Activer le champ Type Tiers
            setDisableLocalites(false);
            // En MODIFICATION, si retour à Aux, reprendre la base existante
            if (detailModelSelectedRow && detailModelSelectedRow.baseaux_id) {
                setFieldValue('baseCptCollectif', detailModelSelectedRow.baseaux_id);
            }
        }
    }

    //Action pour sauvegarder le choix base compte auxiliaire
    const handleChangeListBoxBaseCompteAux = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('baseCptCollectif', value)
    }

    //gestion tableau ajout compte de charge associé au nouveau compte à créer
    const handleOpenDialogAddNewCptModelDetail = () => {
        const result = detailModel?.filter((item) => item.nature === 'General');
        setPcHorsCollectif(result);
        setOpenDialogAddNewCptModelDetail(true);
    }

    const handleCloseDialogAddNewCptModelDetail = () => {
        setOpenDialogAddNewCptModelDetail(false);
    }

    const saveCptChg = (cpt_id) => {
        const libelle = detailModel?.find((item) => item.id === cpt_id);
        setSelectedCptAssocChg({ idCpt: cpt_id, compte: libelle.compte, libelle: libelle.libelle });
    }

    const AddCptToTableCptChg = (setFieldValue) => () => {
        let interm = [...listCptChg];
        interm.push({ id: listCptChg.length + 1, idCpt: selectedCptAssocChg.idCpt, compte: selectedCptAssocChg.compte, libelle: selectedCptAssocChg.libelle });
        setListCptChg(interm);

        const newRow = { id: listCptChg.length + 1, idCpt: selectedCptAssocChg.idCpt, compte: selectedCptAssocChg.compte, libelle: selectedCptAssocChg.libelle };

        setFieldValue('listeCptChg', interm);
        handleCloseDialogAddNewCptModelDetail();
    }

    const deleteCptFromTableCptChg = (setFieldValue, index, confirmDeleteCptChg) => {
        const rowId = index[0];

        if (rowId > 0) {
            if (confirmDeleteCptChg) {
                const newListChg = listCptChg.filter((i) => i.id !== rowId);
                setFieldValue('listeCptChg', newListChg);
                setListCptChg(newListChg);
                toast.success('Le compte a été supprimé avec succès.');
            }
        } else {
            toast.error('Veuillez sélectionner un compte.');
        }
    }

    const deleteCptChgPC = (setFieldValue) => (newState) => {
        deleteCptFromTableCptChg(setFieldValue, selectedCptChgOnList, newState);
        handleCloseDialogConfirmDeleteCptChgFromDialogAddNewCpte();
    }

    const handleOpenDialogConfirmDeleteCptChgFromDialogAddNewCpte = () => {
        setOpenDialogDeleteCptChgFromAddNewCpt(true);
    }

    const handleCloseDialogConfirmDeleteCptChgFromDialogAddNewCpte = () => {
        setOpenDialogDeleteCptChgFromAddNewCpt(false);
    }

    //gestion tableau ajout compte de TVA associé au nouveau compte à créer
    const handleOpenDialogAddNewCptTvaModelDetail = () => {
        //const prefixes = ['4456', '4457'];
        //const result = detailModel?.filter((item) => prefixes.some((prefix) => item.compte.startsWith(prefix)) && item.nature === 'General');
        const result = detailModel?.filter(item => item.compte.startsWith('4456') || item.compte.startsWith('4457'));
        setPcOnlyCptTva(result);
        setOpenDialogAddNewCptTvaModelDetail(true);
    }

    const handleCloseDialogAddNewCptTvaModelDetail = () => {
        setOpenDialogAddNewCptTvaModelDetail(false);
    }

    const saveCptTva = (cpt_id) => {
        const libelle = detailModel?.find((item) => item.id === cpt_id);
        setSelectedCptAssocTva({ idCpt: cpt_id, compte: libelle.compte, libelle: libelle.libelle });
    }

    const AddCptToTableCptTva = (setFieldValue) => () => {
        let interm = [...listCptTva];
        interm.push({ id: listCptTva.length + 1, idCpt: selectedCptAssocTva.idCpt, compte: selectedCptAssocTva.compte, libelle: selectedCptAssocTva.libelle });
        setListCptTva(interm);

        //const newRow = {id: listCptTva.length+1, idCpt: selectedCptAssocChg.idCpt, compte: selectedCptAssocTva.compte, libelle: selectedCptAssocTva.libelle};
        setFieldValue('listeCptTva', interm);
        handleCloseDialogAddNewCptTvaModelDetail();
    }

    const deleteCptFromTableCptTva = (setFieldValue, index, confirmDeleteCptTva) => {
        const rowId = index[0];

        if (rowId > 0) {
            if (confirmDeleteCptTva) {
                const newListTva = listCptTva.filter((i) => i.id !== rowId);

                setFieldValue('listeCptTva', newListTva);
                setListCptTva(newListTva);
                toast.success('Le compte a été supprimé avec succès.');
            }
        } else {
            toast.error('Veuillez sélectionner un compte.');
        }
    }

    const deleteCptTvaPC = (setFieldValue) => (newState) => {
        deleteCptFromTableCptTva(setFieldValue, selectedCptTvaOnList, newState);
        handleCloseDialogConfirmDeleteCptTvaFromDialogAddNewCpte();
    }

    const handleOpenDialogConfirmDeleteCptTvaFromDialogAddNewCpte = () => {
        setOpenDialogDeleteCptTvaFromAddNewCpt(true);
    }

    const handleCloseDialogConfirmDeleteCptTvaFromDialogAddNewCpte = () => {
        setOpenDialogDeleteCptTvaFromAddNewCpt(false);
    }

    //Gestion formulaire de remplissage infos tiers dans la création d'un nouveau compte pour le modèle sélectionné
    const handleOnChangeListBoxTypeTier = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('typeTier', value);
        setFormulaireTier(value);

        // Griser et vider les localités seulement pour 'etranger' ou 'general'
        if (value === 'etranger' || value === 'general') {
            setDisableLocalites(true);
            setFieldValue('province', '');
            setFieldValue('region', '');
            setFieldValue('district', '');
            setFieldValue('commune', '');
            setSelectedProvince('');
            setSelectedRegion('');
            setSelectedDistrict('');
            setSelectedCommune('');
        } else {
            setDisableLocalites(false);
        }
    }

    //Récupération de l'ID de la ligne sélectionner dans le tableau détail du modèle sélectionné
    const listDetailModelPCSelectedRow = (selectedRow) => {
        const itemId = selectedRow[0];
        setPcAllselectedRow(selectedRow);

        const itemInfos = detailModel.find(row => row.id === itemId);
        if (itemInfos) {
            setDetailModelSelectedRow(itemInfos);

            //récupérer la liste des comptes de charges et compte de TVA associées à la ligne sélectionnée
            axios.get(`/paramPlanComptableModele/keepListCptChgTvaAssoc/${itemId}`).then((response) => {
                const resData = response.data;
                if (resData.state) {
                    setListCptChg(resData.detailChg);
                    setListCptTva(resData.detailTva);
                } else {
                    toast.error(resData.msg);
                }
            })
        }
    }
    const showCptInfos = (state) => {
        setOpenInfos(state);
    }

    const handleShowCptInfos = (row) => {
        const itemId = row.id;
        axios.get(`/paramPlanComptableModele/keepListCptChgTvaAssoc/${itemId}`).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setListCptChg(resData.detailChg);
                setListCptTva(resData.detailTva);
                setRowCptInfos(row);
                setOpenInfos(true);
            } else {
                toast.error(resData.msg);
            }
        })
    }


    //Suppression des comptes sélectionnés dans le tableau du plan comptable
    const handleOpenDialogDetailModelDelete = () => {
        setOpenDialogDeleteItemsPc(true);
    }

    const deleteItemsPC = (value) => {
        if (value === true) {
            if (pcAllselectedRow.length >= 1) {
                const listId = pcAllselectedRow;
                if (modelSelectedRow.pardefault) {
                    toast.error("Vous ne pouvez pas supprimer des comptes associés au modèle de plan comptable natif de kaonty.");
                } else {
                    axiosPrivate.post(`/paramPlanComptableModele/deleteItemPc`, { listId, modelId, compteId }).then((response) => {
                        const resData = response.data;
                        showModelDetail(modelId);
                        setOpenDialogDeleteItemsPc(false);
                        if (resData.state) {
                            toast.success(resData.msg);
                        } else {
                            toast.error(resData.msg);
                        }

                        if (resData.stateUndeletableCpt) {
                            toast.error(resData.msgUndeletableCpt);
                        }
                    });
                }

            } else {
                toast.error("Veuillez sélectionner au moins une ligne dans le tableau plan comptable.");
            }
        } else {
            setOpenDialogDeleteItemsPc(false);
        }
    }

    // ===== FONCTIONS POUR EDITION INLINE =====

    // Récupérer la liste des comptes collectifs pour le dropdown baseCompte via API
    const recupererListeCptCollectifInline = useCallback(async () => {
        if (loadingCollectifRef.current || !modelId) return Promise.resolve([]);
        loadingCollectifRef.current = true;
        setIsLoadingCollectif(true);

        try {
            const response = await axios.post(`/paramPlanComptableModele/allCollectifAccounts`, { modelId });
            const resData = response.data;
            if (resData.state) {
                setListeCptCollectif(resData.list);
                setIsLoadingCollectif(false);
                loadingCollectifRef.current = false;
                return Promise.resolve(resData.list);
            } else {
                setListeCptCollectif([]);
                setIsLoadingCollectif(false);
                loadingCollectifRef.current = false;
                return Promise.resolve([]);
            }
        } catch (error) {
            console.error('Erreur récupération comptes collectifs:', error);
            setListeCptCollectif([]);
            setIsLoadingCollectif(false);
            loadingCollectifRef.current = false;
            return Promise.resolve([]);
        }
    }, [modelId]);

    // Cellule d'édition pour Nature
    const NatureEditCell = (props) => {
        const { id, field, value } = props;
        const apiRef = useGridApiContext();

        useEffect(() => {
            if (value === 'General' || value === 'Collectif') {
                const currentRow = apiRef.current.getRow(id);
                apiRef.current.setEditCellValue({ id, field: 'baseCompte', value: currentRow?.compte || '' });
            }
        }, [value, id, apiRef]);

        return (
            <Select
                size="small"
                value={value || ''}
                onChange={(e) => {
                    apiRef.current.setEditCellValue({ id, field, value: e.target.value });
                }}
                sx={{ width: '100%' }}
            >
                <MenuItem value="General">Compte général</MenuItem>
                <MenuItem value="Collectif">Compte collectif</MenuItem>
                <MenuItem value="Aux">Compte auxiliaire</MenuItem>
            </Select>
        );
    };

    // Cellule d'édition pour BaseCompte
    const BaseCompteEditCell = (props) => {
        const { id, field, value, row } = props;
        const [localValue, setLocalValue] = useState('');
        const apiRef = useGridApiContext();

        const currentRow = apiRef.current.getRowWithUpdatedValues(id);
        const currentNature = currentRow?.nature || row.nature;
        const currentCompte = currentRow?.compte || row.compte;

        useEffect(() => {
            if (currentNature === 'General' || currentNature === 'Collectif') {
                const compteValue = currentCompte || '';
                setLocalValue(compteValue);
                apiRef.current.setEditCellValue({ id, field, value: compteValue });
            } else {
                // Pour Auxiliaire, on doit trouver l'ID correspondant à la valeur
                if (value != null && value !== '' && listeCptCollectif.length > 0) {
                    // Essayer de trouver par ID d'abord, puis par numéro de compte
                    const foundById = listeCptCollectif.find(item => String(item.id) === String(value));
                    const foundByCompte = listeCptCollectif.find(item => String(item.compte) === String(value));
                    const found = foundById || foundByCompte;

                    if (found) {
                        setLocalValue(String(found.id));
                        // Mettre à jour la valeur dans la cellule avec l'ID
                        apiRef.current.setEditCellValue({ id, field, value: String(found.id) });
                    } else {
                        setLocalValue('');
                        apiRef.current.setEditCellValue({ id, field, value: '' });
                    }
                } else {
                    setLocalValue('');
                }
            }
        }, [value, currentNature, currentCompte, listeCptCollectif, id, field, apiRef]);

        useEffect(() => {
            if (currentNature === 'Aux' && listeCptCollectif.length === 0 && !isLoadingCollectif && !loadingCollectifRef.current) {
                recupererListeCptCollectifInline();
            }
        }, [currentNature, listeCptCollectif.length, isLoadingCollectif, recupererListeCptCollectifInline]);

        const handleChange = (event) => {
            const newValue = event.target.value;
            setLocalValue(newValue);
            apiRef.current.setEditCellValue({ id, field, value: newValue });
        };

        if (currentNature === 'General' || currentNature === 'Collectif') {
            return (
                <TextField
                    size="small"
                    value={currentCompte || ''}
                    disabled
                    sx={{
                        width: '100%',
                        '& .MuiInputBase-root.Mui-disabled': { backgroundColor: '#f5f5f5' }
                    }}
                />
            );
        }

        return (
            <Select
                size="small"
                value={localValue || ''}
                onChange={handleChange}
                disabled={isLoadingCollectif}
                displayEmpty
                sx={{ width: '100%' }}
            >
                <MenuItem value="">
                    <em>{isLoadingCollectif ? 'Chargement...' : 'Sélectionner un compte'}</em>
                </MenuItem>
                {listeCptCollectif?.map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                        {item.compte} - {item.libelle}
                    </MenuItem>
                ))}
            </Select>
        );
    };

    // Rendu de la cellule BaseCompte
    const BaseCompteRenderCell = (params) => {
        const { row } = params;
        const value = row.baseaux || row.baseCompte;

        if (row.nature === 'General' || row.nature === 'Collectif') {
            return <span>{row.compte}</span>;
        }

        if (value && listeCptCollectif.length > 0) {
            const found = listeCptCollectif.find(item => String(item.id) === String(value) || String(item.compte) === String(value));
            if (found) {
                return <span>{found.compte}</span>;
            }
        }

        return <span>{value}</span>;
    };

    // Vérifier si une ligne est en édition
    const isRowInEditMode = (id) => {
        return rowModesModel[id]?.mode === 'edit';
    };

    // Vérifier s'il y a une ligne en édition
    const hasRowInEditMode = () => {
        return Object.values(rowModesModel).some((mode) => mode.mode === 'edit');
    };

    // Gestion du clic sur Ajouter
    const handleAddClick = () => {
        if (!modelId) {
            toast.error("Veuillez sélectionner un modèle de plan comptable.");
            return;
        }
        if (hasRowInEditMode()) {
            toast.error("Veuillez terminer l'édition en cours avant d'ajouter une nouvelle ligne.");
            return;
        }
        if (modelSelectedRow?.pardefault) {
            toast.error("Vous ne pouvez pas modifier les comptes associés au modèle de plan comptable natif de kaonty.");
            return;
        }

        const newId = `new-${Date.now()}`;
        const newRow = {
            id: newId,
            compte: '',
            libelle: '',
            nature: 'General',
            baseCompte: '',
            isNew: true
        };

        setDetailModel((prev) => [newRow, ...prev]);
        setRowModesModel((prev) => ({
            ...prev,
            [newId]: { mode: 'edit', fieldToFocus: 'compte' }
        }));
        setSelectedRowId(newId);
        setPcAllselectedRow([newId]);
    };

    // Gestion du clic sur Modifier
    const handleEditClick = () => {
        if (!detailModelSelectedRow?.id) {
            toast.error("Veuillez sélectionner une ligne à modifier.");
            return;
        }
        if (hasRowInEditMode()) {
            toast.error("Veuillez terminer l'édition en cours.");
            return;
        }
        if (modelSelectedRow?.pardefault) {
            toast.error("Vous ne pouvez pas modifier les comptes associés au modèle de plan comptable natif de kaonty.");
            return;
        }

        const id = detailModelSelectedRow.id;
        setRowModesModel((prev) => ({
            ...prev,
            [id]: { mode: 'edit', fieldToFocus: 'compte' }
        }));
        setSelectedRowId(id);
    };

    // Gestion du clic sur Sauvegarder
    const handleSaveClick = async () => {
        if (!selectedRowId) {
            toast.error("Aucune ligne en cours d'édition.");
            return;
        }

        try {
            await apiRef.current.stopRowEditMode({ id: selectedRowId });
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    // Gestion du clic sur Annuler
    const handleCancelClick = () => {
        if (!selectedRowId) return;

        const isNewRow = String(selectedRowId).startsWith('new-');

        if (isNewRow) {
            setDetailModel((prev) => prev.filter((row) => row.id !== selectedRowId));
        }

        setRowModesModel((prev) => ({
            ...prev,
            [selectedRowId]: { mode: 'view' }
        }));
        setSelectedRowId(null);
        apiRef.current.stopRowEditMode({ id: selectedRowId, ignoreModifications: true });
    };

    // Mise à jour d'une ligne
    const processRowUpdate = async (newRow, oldRow) => {
        return new Promise((resolve, reject) => {
            const isNewRow = String(newRow.id).startsWith('new-');

            const normalizeCompte = (v) =>
                (v || '').toString().toUpperCase().replace(/[\s\.\-]/g, '').trim();

            const normalizedCompte = normalizeCompte(newRow.compte);

            if (!normalizedCompte) {
                toast.error('Veuillez taper un numéro de compte');
                reject(oldRow);
                return;
            }

            if (!newRow.libelle?.trim()) {
                toast.error('Veuillez insérer un libellé pour le numéro de compte');
                reject(oldRow);
                return;
            }

            const exists = detailModel.some(
                (r) => normalizeCompte(r.compte) === normalizedCompte && r.id !== newRow.id
            );

            if (exists) {
                toast.error('Ce compte existe déjà');
                reject(oldRow);
                return;
            }

            if (newRow.nature === 'Aux' && (!newRow.baseCompte || newRow.baseCompte === '')) {
                toast.error('Veuillez ajouter la base du compte collectif');
                reject(oldRow);
                return;
            }

            let baseCptValue = null;
            if (newRow.nature === 'General' || newRow.nature === 'Collectif') {
                baseCptValue = newRow.compte ? Number(newRow.compte) : null;
            } else if (newRow.baseCompte && String(newRow.baseCompte).trim() !== '') {
                baseCptValue = Number(newRow.baseCompte);
            }

            const payload = {
                action: isNewRow ? 'new' : 'modify',
                itemId: isNewRow ? 0 : newRow.id,
                idCompte: Number(compteId),
                idModele: Number(modelId),
                compte: newRow.compte,
                libelle: newRow.libelle,
                nature: newRow.nature,
                baseCptCollectif: baseCptValue,
                typeTier: (newRow.nature === 'General' || newRow.nature === 'Collectif') ? 'general' : 'sans-nif',
                nif: '',
                stat: '',
                adresse: '',
                motcle: '',
                cin: '',
                dateCin: null,
                autrePieceID: '',
                refPieceID: '',
                adresseSansNIF: '',
                nifRepresentant: '',
                adresseEtranger: '',
                pays: '',
                province: '',
                region: '',
                district: '',
                commune: '',
                listeCptChg: [],
                listeCptTva: []
            };

            axiosPrivate.post(`/paramPlanComptableModele/AddCptTodetailModel`, payload)
                .then((response) => {
                    const resData = response.data;

                    if (resData.state === true) {
                        toast.success(resData.msg || 'Compte enregistré avec succès');

                        if (!isNewRow && resData?.dataModified) {
                            const updatedRow = {
                                ...newRow,
                                ...resData.dataModified,
                                baseCompte: resData.dataModified.baseaux || resData.dataModified.baseCompte || newRow.baseCompte
                            };
                            setDetailModel((prev) => prev.map((row) => row.id === newRow.id ? updatedRow : row));
                            resolve(updatedRow);
                        } else {
                            showModelDetail(modelId);
                            resolve(newRow);
                        }

                        setRowModesModel((prev) => ({
                            ...prev,
                            [newRow.id]: { mode: 'view' }
                        }));
                        setSelectedRowId(null);
                    } else {
                        toast.error(resData.msg || 'Erreur lors de l\'enregistrement');
                        reject(oldRow);
                    }
                })
                .catch((error) => {
                    if (error.code === 'ERR_CANCELED' || error.message?.includes('aborted')) {
                        // console.log('[DEBUG] processRowUpdate: requête annulée');
                        reject(oldRow);
                        return;
                    }
                    console.error('[DEBUG] processRowUpdate: erreur', error);
                    toast.error(error?.response?.data?.msg || 'Erreur lors de l\'enregistrement');
                    reject(oldRow);
                });
        });
    };

    // Gestion des changements de mode d'édition
    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleRowEditStart = (params) => {
        setSelectedRowId(params.id);
    };

    const handleRowEditStop = (params, event) => {
        if (params.reason === 'escapeKeyDown') {
            const isNewRow = String(params.id).startsWith('new-');
            if (isNewRow) {
                setDetailModel((prev) => prev.filter((row) => row.id !== params.id));
            }
            setSelectedRowId(null);
        }
    };

    // Colonnes pour le DataGrid avec édition inline
    const columnHeaderDetailInline = (handleShowCptInfos) => [
        {
            field: 'id',
            headerName: 'ID',
            type: 'number',
            sortable: true,
            width: 70,
            headerAlign: 'right',
            headerClassName: 'HeaderbackColor',
        },
        {
            field: 'compte',
            headerName: 'Compte',
            type: 'string',
            sortable: true,
            width: 130,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            editable: true,
            renderCell: (params) => (
                <span style={{ cursor: 'pointer', width: '100%' }} onClick={() => handleShowCptInfos(params.row)}>
                    {params.row.compte}
                </span>
            ),
        },
        {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            width: 300,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            editable: true,
        },
        {
            field: 'nature',
            headerName: 'Nature',
            type: 'string',
            sortable: true,
            width: 130,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            editable: true,
            renderEditCell: (params) => <NatureEditCell {...params} />,
            renderCell: (params) => {
                const nature = params.row.nature;
                if (nature === 'General') {
                    return (
                        <Chip
                            icon={<TbCircleLetterGFilled style={{ color: 'white', width: 18, height: 18 }} />}
                            label="Général"
                            sx={{ width: '100%', justifyContent: 'space-between', backgroundColor: '#48A6A7', color: 'white' }}
                        />
                    );
                } else if (nature === 'Collectif') {
                    return (
                        <Chip
                            icon={<TbCircleLetterCFilled style={{ color: 'white', width: 18, height: 18 }} />}
                            label="Collectif"
                            sx={{ width: '100%', justifyContent: 'space-between', backgroundColor: '#A6D6D6', color: 'white' }}
                        />
                    );
                } else {
                    return (
                        <Chip
                            icon={<TbCircleLetterAFilled style={{ color: 'white', width: 18, height: 18 }} />}
                            label="Auxiliaire"
                            sx={{ width: '100%', justifyContent: 'space-between', backgroundColor: '#123458', color: 'white' }}
                        />
                    );
                }
            },
        },
        {
            field: 'baseCompte',
            headerName: 'Centr. / base Aux',
            type: 'string',
            sortable: true,
            width: 175,
            headerAlign: 'left',
            headerClassName: 'HeaderbackColor',
            editable: true,
            renderEditCell: (params) => <BaseCompteEditCell {...params} />,
            renderCell: (params) => <BaseCompteRenderCell {...params} />,
        },
    ];

    return (
        <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: BG_SOFT, display: 'flex', flexDirection: 'column' }}>
            <GlobalStyles styles={{ body: { margin: 0, padding: 0 }, '*': { boxSizing: 'border-box' } }} />

            <Box sx={{ p: 4, width: '100%' }}>
                {openInfos ? <DetailsInformation row={rowCptInfos} confirmOpen={showCptInfos} listCptChg={listCptChg} listCptTva={listCptTva} /> : null}

                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />} sx={{ mb: 1 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Paramétrages</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: NAV_DARK }}>Plan comptable - modèle</Typography>
                </Breadcrumbs>

                <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"} justifyContent={"stretch"}>

                    <Stack width={"100%"} height={"30px"} spacing={0} alignItems={"center"} alignContent={"center"}
                        direction={"row"} style={{ marginLeft: "0px", marginTop: "10px", justifyContent: "right" }}>
                        <Typography variant='h7' sx={{ fontWeight: 800, fontSize: '16px', color: NAV_DARK }}>Modèle</Typography>
                        <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                            direction={"row"} justifyContent={"right"}>
                            <ButtonGroup
                                variant="outlined"
                                sx={{
                                    boxShadow: 'none',
                                    display: 'flex',
                                    gap: '2px',
                                    '& .MuiButton-root': {
                                        borderRadius: 0,
                                    },
                                    '& .MuiButtonGroup-grouped': {
                                        boxShadow: 'none',
                                        outline: 'none',
                                        borderColor: 'inherit',
                                        marginLeft: 0,
                                        borderRadius: 1,
                                        border: 'none',
                                    },
                                    '& .MuiButtonGroup-grouped:hover': {
                                        boxShadow: 'none',
                                        borderColor: 'inherit',
                                        border: 'none',
                                    },
                                    '& .MuiButtonGroup-grouped.Mui-focusVisible': {
                                        boxShadow: 'none',
                                        borderColor: 'inherit',
                                    },
                                }}
                            >
                                <Tooltip title="Importer un modèle">
                                    <span>
                                        <Button
                                            onClick={() => setOpenImportDialog(true)}
                                            variant="contained"
                                            sx={{
                                                ...buttonStyle,
                                                backgroundColor: '#e79754ff',
                                                color: 'white',
                                                borderColor: '#e79754ff',
                                                boxShadow: 'none',

                                                '&:hover': {
                                                    backgroundColor: '#e79754ff',
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                },
                                                '&:focus': {
                                                    backgroundColor: '#e79754ff',
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: '#e79754ff',
                                                    color: 'white',
                                                    cursor: 'not-allowed',
                                                },
                                                '&::before': {
                                                    display: 'none',
                                                },
                                            }}
                                        >
                                            Importer
                                        </Button>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Ajouter un nouveau modèle">
                                    <span>
                                        <Button
                                            disabled={!canAdd}
                                            onClick={handleClickOpenNewModel}
                                            sx={{
                                                ...buttonStyle,
                                                backgroundColor: initial.auth_gradient_end,
                                                color: 'white',
                                                borderColor: initial.auth_gradient_end,
                                                '&:hover': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    boxShadow: 'none',
                                                    border: 'none',
                                                },
                                                '&:focus': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    boxShadow: 'none',
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    color: 'white',
                                                    cursor: 'not-allowed',
                                                    border: 'none',
                                                },
                                                '&::before': {
                                                    display: 'none',
                                                },
                                            }}
                                        >
                                            Ajouter
                                        </Button>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Supprimer le modèle sélectionné">
                                    <span>
                                        <Button
                                            disabled={!canDelete || !modelSelectedRow}
                                            onClick={handleClickOpenDialogDeleteModel}
                                            sx={{
                                                ...buttonStyle,
                                                backgroundColor: initial.annuler_bouton_color,
                                                color: 'white',
                                                borderColor: initial.annuler_bouton_color,
                                                '&:hover': {
                                                    backgroundColor: initial.annuler_bouton_color,
                                                    border: 'none',
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: initial.annuler_bouton_color,
                                                    color: 'white',
                                                    cursor: 'not-allowed',
                                                    border: 'none',
                                                },
                                            }}
                                        >
                                            Supprimer
                                        </Button>
                                    </span>
                                </Tooltip>
                            </ButtonGroup>
                        </Stack>
                    </Stack>

                    {/* POP-UP POUR LA CREATION D'UN NOUVEAU MODELE */}
                    <form onSubmit={formNewModel.handleSubmit}>
                        <BootstrapDialog
                            onClose={handleCloseNewModel}
                            aria-labelledby="customized-dialog-title"
                            open={openNewModel}
                        >
                            {/* <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontWeight:'semiBold', width:'600px',backgroundColor : initial.normal_pupup_header_color}}>
                    Nouveau modèle de plan comptable
                    </DialogTitle> */}
                            <IconButton
                                style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                                aria-label="close"
                                onClick={handleCloseNewModel}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <CloseIcon />
                            </IconButton>

                            <Typography style={{ marginTop: 75, marginLeft: 30 }} variant='h5'>Nouveau modèle de plan comptable</Typography>

                            <DialogContent >

                                <Stack width={"90%"} height={"300px"} spacing={0} alignItems={'start'} alignContent={"center"}
                                    direction={"column"} justifyContent={"left"} style={{ marginLeft: '10px' }}>
                                    <Stack width={"100%"} spacing={0} alignItems={"center"} alignContent={"center"}
                                        direction={"row"} justifyContent={"left"} style={{ marginLeft: '10px' }}>
                                        <FormControl
                                            sx={{ width: "100%" }}
                                            required
                                            error={formNewModel.errors.model && formNewModel.touched.model}
                                        >
                                            <RadioGroup
                                                row
                                                aria-labelledby="choixExercice"
                                                name="choixExercice"
                                                style={{ marginRight: "10px", marginTop: "0px" }}
                                                value={formNewModel.values.model}
                                            >
                                                <FormControlLabel onChange={(e) => saveModelePcValue(e.target.value)} value="modeleLibre" control={<Radio />} label="Modèle libre" />
                                                <FormControlLabel onChange={(e) => saveModelePcValue(e.target.value)} value="aPartirModelDossier" control={<Radio />} label="A partir d'un modèle de dossier existant" style={{ marginTop: '-15px' }} />
                                            </RadioGroup>
                                            <FormHelperText>
                                                {formNewModel.errors.model && formNewModel.touched.model && formNewModel.errors.model}
                                            </FormHelperText>
                                        </FormControl>
                                    </Stack>

                                    <FormControl variant="standard"
                                        sx={{ m: 1, minWidth: 250 }}
                                        disabled={modeleLibre}
                                        error={formNewModel.errors.id_dossier && formNewModel.touched.id_dossier}
                                    >
                                        <InputLabel id="demo-simple-select-standard-label">Dossier</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-standard-label"
                                            id="demo-simple-select-standard"
                                            value={formNewModel.values.id_dossier}
                                            label={"valSelectPC"}
                                            onChange={(e) => formNewModel.setFieldValue('id_dossier', e.target.value)}
                                            sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                        >
                                            <MenuItem key={0} value={0}><em>Aucun dossier</em></MenuItem>
                                            {listDossier?.map((dossier) => (
                                                <MenuItem key={dossier.id} value={dossier.id}>{dossier.dossier}</MenuItem>
                                            ))}
                                        </Select>

                                        <FormHelperText>
                                            {formNewModel.errors.id_dossier && formNewModel.touched.id_dossier && formNewModel.errors.id_dossier}
                                        </FormHelperText>
                                    </FormControl>

                                    <FormControl variant="standard"
                                        sx={{ m: 1, minWidth: 250 }}
                                        error={formNewModel.errors.model_name && formNewModel.touched.model_name}
                                    >
                                        <TextField
                                            onBlur={(e) => formNewModel.setFieldValue("model_name", e.target.value)}
                                            id="nom-modele" label="Nom du modèle"
                                            variant="standard"
                                            style={{ width: "400px", marginLeft: "10px" }}
                                        />

                                        <FormHelperText>
                                            {formNewModel.errors.model_name && formNewModel.touched.model_name && formNewModel.errors.model_name}
                                        </FormHelperText>
                                    </FormControl>

                                </Stack>

                            </DialogContent>
                            <DialogActions>
                                <Button
                                    autoFocus
                                    style={{ backgroundColor: initial.add_new_line_bouton_color, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                                    type='submit'
                                    onClick={formNewModel.handleSubmit}
                                >
                                    Créer
                                </Button>
                            </DialogActions>
                        </BootstrapDialog>

                        <BootstrapDialog
                            onClose={() => setOpenImportDialog(false)}
                            aria-labelledby="import-modele-dialog-title"
                            open={openImportDialog}
                            maxWidth={"xl"}
                            fullWidth
                        >
                            <IconButton
                                aria-label="close"
                                onClick={() => setOpenImportDialog(false)}
                                sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <DialogContent dividers>
                                <Box sx={{ width: '100%', height: '70vh' }}>
                                    <PopupImportModelePlanComptable onSuccess={() => { GetListePlanComptableModele(); setOpenImportDialog(false); }} />
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenImportDialog(false)} style={{ textTransform: 'none' }}>Fermer</Button>
                            </DialogActions>
                        </BootstrapDialog>
                    </form>

                    {/* MODAL POUR LA SUPPRESSION D'UN MODELE */}
                    {openDialogDeleteModel ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer le modèle sélectionné ?"} confirmationState={deleteModelPC} /> : null}

                    {/* TABLEAU LISTE DES MODELES DE PLAN COMPTABLES */}
                    <Stack width={"100%"} height={"500px"} spacing={1} alignItems={"flex-start"} direction={"row"} style={{ marginTop: '5px' }}>
                        <DataGrid
                            disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                            disableColumnSelector={DataGridStyle.disableColumnSelector}
                            disableDensitySelector={DataGridStyle.disableDensitySelector}
                            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                            disableRowSelectionOnClick
                            disableSelectionOnClick={true}
                            // slots={{ toolbar: QuickFilter }}
                            sx={{
                                ...DataGridStyle.sx,
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: '#F8FAFC',
                                    color: '#94A3B8',
                                    fontWeight: 800,
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    borderBottom: '1px solid #E2E8F0',
                                    minHeight: '35px !important',
                                    maxHeight: '35px !important',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                },
                                '& .MuiDataGrid-columnHeader': {
                                    height: '35px !important',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                    paddingY: '4px',
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    color: '#94A3B8',
                                    fontWeight: 800,
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                },
                                '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                    color: '#94A3B8',
                                },
                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                    outline: 'none',
                                    border: 'none',
                                },
                                '& .highlight-separator': {
                                    borderBottom: '1px solid red'
                                },
                                '& .MuiDataGrid-row.highlight-separator': {
                                    borderBottom: '1px solid red',
                                },
                                '& .MuiDataGrid-virtualScroller': {
                                    maxHeight: '700px',
                                },
                                '& .MuiDataGrid-row': {
                                    '&:hover': { bgcolor: '#F8FAFC' },
                                    transition: 'all 0.2s ease',
                                    minHeight: '32px !important',
                                    maxHeight: '32px !important',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                },
                                '& .MuiDataGrid-cell': {
                                    fontSize: '13px',
                                    color: '#334155',
                                    borderBottom: '1px solid #F1F5F9',
                                    py: '6px',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                    '&:focus': {
                                        outline: 'none',
                                        border: 'none',
                                    },
                                },
                            }}
                            rowHeight={36}
                            columnHeaderHeight={40}
                            onRowSelectionModelChange={(ids) => {
                                const single = Array.isArray(ids) && ids.length ? [ids[ids.length - 1]] : [];
                                listModelPCSelectedRow(single);
                            }}
                            rows={listeModele}
                            columns={columnHeaderModel}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 100 },
                                },
                            }}
                            pageSizeOptions={[50, 100]}
                            pagination={DataGridStyle.pagination}
                            checkboxSelection={DataGridStyle.checkboxSelection}
                            columnVisibilityModel={{
                                id: false,
                            }}
                            rowSelectionModel={modelId != null ? [modelId] : []}
                        />
                    </Stack>

                    {/* BOUTONS POUR EDITION INLINE */}
                    <Stack width={"100%"} height={"30px"} spacing={0} alignItems={"center"} alignContent={"center"}
                        direction={"row"} style={{ marginLeft: "0px", marginTop: "30px", justifyContent: "right" }}>
                        <Typography variant='h7' sx={{ fontWeight: 800, fontSize: '16px', color: NAV_DARK }} align='left'>Plan de compte</Typography>

                        <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                            direction={"row"} justifyContent={"right"}>
                            <ButtonGroup
                                variant="outlined"
                                sx={{
                                    boxShadow: 'none',
                                    display: 'flex',
                                    gap: '2px',
                                    '& .MuiButton-root': {
                                        borderRadius: 0,
                                    },
                                    '& .MuiButtonGroup-grouped': {
                                        boxShadow: 'none',
                                        outline: 'none',
                                        borderColor: 'inherit',
                                        marginLeft: 0,
                                        borderRadius: 1,
                                        border: 'none',
                                    },
                                    '& .MuiButtonGroup-grouped:hover': {
                                        boxShadow: 'none',
                                        borderColor: 'inherit',
                                        border: 'none',
                                    },
                                    '& .MuiButtonGroup-grouped.Mui-focusVisible': {
                                        boxShadow: 'none',
                                        borderColor: 'inherit',
                                    },
                                }}
                            >
                                <Tooltip title="Ajouter un nouveau compte">
                                    <span>
                                        <Button
                                            disabled={!canAdd || !modelId || hasRowInEditMode()}
                                            onClick={handleAddClick}
                                            sx={{
                                                ...buttonStyle,
                                                backgroundColor: initial.auth_gradient_end,
                                                color: 'white',
                                                borderColor: initial.auth_gradient_end,
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                },
                                                '&:focus': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    color: 'white',
                                                    cursor: 'not-allowed',
                                                },
                                                '&::before': {
                                                    display: 'none',
                                                },
                                            }}
                                        >
                                            Ajouter
                                        </Button>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Modifier le compte sélectionné">
                                    <span>
                                        <Button
                                            disabled={!canModify || !detailModelSelectedRow?.id || hasRowInEditMode()}
                                            onClick={handleEditClick}
                                            sx={{
                                                ...buttonStyle,
                                                backgroundColor: initial.auth_gradient_end,
                                                color: 'white',
                                                borderColor: initial.auth_gradient_end,
                                                '&:hover': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    boxShadow: 'none',
                                                    border: 'none',
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    color: 'white',
                                                    cursor: 'not-allowed',
                                                    border: 'none',
                                                },
                                            }}
                                        >
                                            Modifier
                                        </Button>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Sauvegarder">
                                    <span>
                                        <Button
                                            // disabled={!selectedRowId}
                                            onClick={handleSaveClick}
                                            sx={{
                                                ...buttonStyle,
                                                backgroundColor: '#4caf50',
                                                color: 'white',
                                                borderColor: '#4caf50',
                                                '&:hover': {
                                                    backgroundColor: '#4caf50',
                                                    boxShadow: 'none',
                                                    border: 'none',
                                                },
                                            }}
                                        >
                                            Sauvegarder
                                        </Button>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Annuler">
                                    <span>
                                        <Button
                                            //disabled={!selectedRowId}
                                            onClick={handleCancelClick}
                                            sx={{
                                                ...buttonStyle,
                                                backgroundColor: initial.annuler_bouton_color,
                                                color: 'white',
                                                borderColor: initial.annuler_bouton_color,
                                                '&:hover': {
                                                    backgroundColor: initial.annuler_bouton_color,
                                                    boxShadow: 'none',
                                                    border: 'none',
                                                },
                                            }}
                                        >
                                            Annuler
                                        </Button>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Supprimer le compte sélectionné">
                                    <span>
                                        <Button
                                            disabled={!canDelete || !detailModelSelectedRow?.id || hasRowInEditMode()}
                                            onClick={handleOpenDialogDetailModelDelete}
                                            sx={{
                                                ...buttonStyle,
                                                backgroundColor: initial.annuler_bouton_color,
                                                color: 'white',
                                                borderColor: initial.annuler_bouton_color,
                                                '&:hover': {
                                                    backgroundColor: initial.annuler_bouton_color,
                                                    border: 'none',
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: initial.annuler_bouton_color,
                                                    color: 'white',
                                                    cursor: 'not-allowed',
                                                    border: 'none',
                                                },
                                            }}
                                        >
                                            Supprimer
                                        </Button>
                                    </span>
                                </Tooltip>
                            </ButtonGroup>
                        </Stack>
                    </Stack>

                    {/* MODAL DE CONFIRMATION DE SUPPRESSION D'UN COMPTE DANS LE TABLEAU DU PLAN COMPTABLE */}
                    {openDialogDeleteItemsPc ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer les comptes sélectionnés ?"} confirmationState={deleteItemsPC} /> : null}

                    <Stack height={"750px"} width={'100%'}>
                        <DataGrid
                            disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                            disableColumnSelector={DataGridStyle.disableColumnSelector}
                            disableDensitySelector={DataGridStyle.disableDensitySelector}
                            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                            disableRowSelectionOnClick
                            disableSelectionOnClick={true}
                            // slots={{ toolbar: QuickFilter }}
                            sx={{
                                ...DataGridStyle.sx,
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: '#F8FAFC',
                                    color: '#94A3B8',
                                    fontWeight: 800,
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    borderBottom: '1px solid #E2E8F0',
                                    minHeight: '35px !important',
                                    maxHeight: '35px !important',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                },
                                '& .MuiDataGrid-columnHeader': {
                                    height: '35px !important',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                    paddingY: '4px',
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    color: '#94A3B8',
                                    fontWeight: 800,
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                },
                                '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                    color: '#94A3B8',
                                },
                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                    outline: 'none',
                                    border: 'none',
                                },
                                '& .highlight-separator': {
                                    borderBottom: '1px solid red'
                                },
                                '& .MuiDataGrid-row.highlight-separator': {
                                    borderBottom: '1px solid red',
                                },
                                '& .MuiDataGrid-virtualScroller': {
                                    maxHeight: '700px',
                                },
                                '& .MuiDataGrid-row': {
                                    '&:hover': { bgcolor: '#F8FAFC' },
                                    transition: 'all 0.2s ease',
                                    minHeight: '32px !important',
                                    maxHeight: '32px !important',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                },
                                '& .MuiDataGrid-cell': {
                                    fontSize: '13px',
                                    color: '#334155',
                                    borderBottom: '1px solid #F1F5F9',
                                    py: '6px',
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                    '&:focus': {
                                        outline: 'none',
                                        border: 'none',
                                    },
                                },
                            }}
                            apiRef={apiRef}
                            editMode="row"
                            rowModesModel={rowModesModel}
                            onRowModesModelChange={handleRowModesModelChange}
                            onRowEditStart={handleRowEditStart}
                            onRowEditStop={handleRowEditStop}
                            processRowUpdate={processRowUpdate}
                            onProcessRowUpdateError={(error) => {
                                console.error('Erreur lors de la mise à jour:', error);
                            }}
                            rowHeight={36}
                            columnHeaderHeight={40}
                            onRowSelectionModelChange={(ids) => {
                                const single = Array.isArray(ids) && ids.length ? [ids[ids.length - 1]] : [];
                                listDetailModelPCSelectedRow(single);
                            }}
                            rows={detailModel}
                            columns={columnHeaderDetailInline(handleShowCptInfos)}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 100 },
                                },
                            }}
                            experimentalFeatures={{ columnPinning: true }}
                            pageSizeOptions={[50, 100]}
                            pagination={DataGridStyle.pagination}
                            checkboxSelection={DataGridStyle.checkboxSelection}
                            columnVisibilityModel={{
                                id: false,
                            }}
                            rowSelectionModel={pcAllselectedRow}
                        />
                    </Stack>

                </Stack>
            </Box>
        </Box>
    );
}
