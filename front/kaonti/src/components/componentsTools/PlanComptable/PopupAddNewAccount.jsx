import { useState, useEffect } from 'react';
import {
    Typography, Stack, FormControl, InputLabel, Select, MenuItem, TextField, Box, Tab, Autocomplete,
    FormControlLabel,
    Radio,
    RadioGroup
} from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import toast from 'react-hot-toast';
import { DataGrid, frFR } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";
import { Field, Formik, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import { init } from '../../../../init';
import axios from '../../../../config/axios';
import QuickFilter, { DataGridStyle } from '../DatagridToolsStyle';
import PopupConfirmDelete from '../popupConfirmDelete';
import useAxiosPrivate from '../../../../config/axiosPrivate';
import { format } from 'date-fns';

const initial = init[0];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const columnHeaderAddNewRowModelDetail = [
    {
        field: 'compte',
        headerName: "Compte",
        type: 'string',
        sortable: true,
        width: 200,
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor',
        editable: false,
    },
    {
        field: 'libelle',
        headerName: "Libellé",
        type: 'string',
        sortable: true,
        width: 850,
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor',
        editable: false
    },
]

const PopupAddNewAccount = ({
    id_dossier,
    id_compte,
    selectedRow,
    open,
    onClose,
    stateAction,
    isTypeComptaAutre,
    setSelectedRow
}) => {
    const isModifying = stateAction === 'modification';
    const axiosPrivate = useAxiosPrivate();
    const [typeCptGeneral, setTypeCptGeneral] = useState(true);
    const [formulaireTier, setFormulaireTier] = useState('general');
    const [disableLocalites, setDisableLocalites] = useState(false);

    const [tabValueAjoutNewRow, setTabValueAjoutNewRow] = useState("1");

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCommune, setSelectedCommune] = useState('');

    const [openDialogAddNewCptAssoc, setOpenDialogAddNewCptAssoc] = useState(false);
    const [openDialogDeleteCptChgFromAddNewCpt, setOpenDialogDeleteCptChgFromAddNewCpt] = useState(false);
    const [openDialogDeleteCptTvaFromAddNewCpt, setOpenDialogDeleteCptTvaFromAddNewCpt] = useState(false);

    const [selectedCptAssocTva, setSelectedCptAssocTva] = useState({ idCpt: 0, compte: '', libelle: '' });
    const [selectedCptAssocChg, setSelectedCptAssocChg] = useState({ idCpt: 0, compte: '', libelle: '' });

    const [listeCptCollectif, setListeCptCollectif] = useState([]);
    const [pc, setPc] = useState([]);
    const [pcHorsCollectif, setPcHorsCollectif] = useState([]);

    const [provinces, setProvinces] = useState([]);
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [isRestoringLocalites, setIsRestoringLocalites] = useState(false);

    const [listCptChg, setListCptChg] = useState([]);
    const [listCptTva, setListCptTva] = useState([]);

    const [selectedCptChgOnList, setSelectedCptChgOnList] = useState(0);
    const [openDialogAddNewCptTvaToCpt, setOpenDialogAddNewCptTvaToCpt] = useState(false);
    const [selectedCptTvaOnList, setSelectedCptTvaOnList] = useState(0);

    const [pcOnlyCptTva, setPcOnlyCptTva] = useState([]);

    const lastLocalites = { province: '', region: '', district: '', commune: '' };

    const formAddCptInitialValues = {
        action: 'new',
        itemId: 0,
        idCompte: Number(id_compte),
        idDossier: Number(id_dossier),
        compte: '',
        libelle: '',
        nature: 'General',
        baseCptCollectif: '',
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
        listeCptChg: [],
        listeCptTva: [],
        province: '',
        region: '',
        district: '',
        commune: '',
        typecomptabilite: 'Français',
        compteautre: '',
        libelleautre: ''
    };

    const normalizeCompte = (v) =>
        (v || '')
            .toString()
            .toUpperCase()
            .replace(/[\s\.\-]/g, '')
            .trim();


    const closePopup = () => {
        onClose();
    }

    const formAddCptValidationSchema = (typeComptaAutre) => Yup.object({
        compte: Yup.string()
            .required("Veuillez tapez un numéro de compte")
            .test('unique-compte', 'Ce compte existe déjà', function (value) {
                const list = Array.isArray(pc) ? pc : [];
                const v = normalizeCompte(value);

                const action = this.parent?.action;
                const itemId = Number(this.parent?.itemId);

                if (!v) return false;

                // En modification: autoriser si la valeur n’a pas changé
                if (action === 'modify') {
                    const current = list.find(r => Number(r.id) === itemId)?.compte;
                    if (normalizeCompte(current) === v) return true;
                }

                // En création (ou compte modifié): bloquer si existe déjà
                const exists = list.some(r => Number(r.id) !== itemId && normalizeCompte(r.compte) === v);
                return !exists;
            }),
        libelle: Yup.string().required("Veuillez insérer un libellé pour le numéro de compte"),
        compteautre: Yup.string().when([], {
            is: () => typeComptaAutre === true,
            then: schema =>
                schema
                    .required("Veuillez tapez un numéro de compte")
                    .test('unique-compte', 'Ce compte existe déjà', function (value) {
                        const list = Array.isArray(pc) ? pc : [];
                        const v = normalizeCompte(value);

                        const action = this.parent?.action;
                        const itemId = Number(this.parent?.itemId);

                        if (!v) return false;

                        // En modification: autoriser si la valeur n’a pas changé
                        if (action === 'modify') {
                            const current = list.find(r => Number(r.id) === itemId)?.compte;
                            if (normalizeCompte(current) === v) return true;
                        }

                        // En création (ou compte modifié): bloquer si existe déjà
                        const exists = list.some(r => Number(r.id) !== itemId && normalizeCompte(r.compte) === v);
                        return !exists;
                    }),
            otherwise: schema => schema.notRequired()
        }),
        libelleautre: Yup.string().when([], {
            is: () => typeComptaAutre === true,
            then: schema =>
                schema
                    .required("Veuillez insérer un libellé pour le numéro de compte"),
            otherwise: schema => schema.notRequired()
        }),
        nature: Yup.string().required("Veuillez séléctionner dans la liste la nature du compte"),
        baseCptCollectif: Yup.string()
            .when('nature', {
                is: (value) => value === 'Aux',
                then: () => Yup.string().required("Veuillez ajouter la base du compte auxiliaire"),
                otherwise: () => Yup.string().notRequired(),
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
                        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                        'La date doit être au format jj/mm/aaaa'
                    )
                    .test('is-valid-date', 'La date doit être valide', (value) => {
                        if (!value) return false;

                        const [year, month, day] = value.split('-').map(Number);

                        if (month < 1 || month > 12) return false;

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
                is: (nature, typeTier) => typeTier === 'etranger' || typeTier === 'general',
                then: () => Yup.string().notRequired(),
                otherwise: () => Yup.string().required("Veuillez sélectionner une province"),
            }),
        region: Yup.string()
            .when(['nature', 'typeTier'], {
                is: (nature, typeTier) => typeTier === 'etranger' || typeTier === 'general',
                then: () => Yup.string().notRequired(),
                otherwise: () => Yup.string().required("Veuillez sélectionner une région"),
            }),
        district: Yup.string()
            .when(['nature', 'typeTier'], {
                is: (nature, typeTier) => typeTier === 'etranger' || typeTier === 'general',
                then: () => Yup.string().notRequired(),
                otherwise: () => Yup.string().required("Veuillez sélectionner un district"),
            }),
        commune: Yup.string()
            .when(['nature', 'typeTier'], {
                is: (nature, typeTier) => typeTier === 'etranger' || typeTier === 'general',
                then: () => Yup.string().notRequired(),
                otherwise: () => Yup.string().required("Veuillez sélectionner une commune"),
            }),
    });

    //Choix TAB value pour dialog ajout de nouvelle ligne du tableau détail modèle plan comptable
    const handleChangeTabValueAjoutNewRow = (event, newValue) => {
        setTabValueAjoutNewRow(newValue);
    };

    const handleChangeListBoxNature = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('nature', value)
        if (value === 'General' || value === 'Collectif') {
            setTypeCptGeneral(true);
            // En MODIFICATION, forcer la base à l'ID du compte
            if (selectedRow && selectedRow.id) {
                setFieldValue('baseCptCollectif', selectedRow.id);
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
            setDisableLocalites(false);
            // En MODIFICATION, si retour à Aux, reprendre la base existante
            if (selectedRow && selectedRow.baseaux_id) {
                setFieldValue('baseCptCollectif', selectedRow.baseaux_id);
            }
            // Restaurer les localités mémorisées si disponibles
            setIsRestoringLocalites(true);
            const { province, region, district, commune } = lastLocalites;
            setSelectedProvince(province || '');
            setSelectedRegion(region || '');
            setSelectedDistrict(district || '');
            setSelectedCommune(commune || '');
            setFieldValue('province', province || '');
            setFieldValue('region', region || '');
            setFieldValue('district', district || '');
            setFieldValue('commune', commune || '');
        }
    }

    //Action pour sauvegarder le choix base compte auxiliaire
    const handleChangeListBoxBaseCompteAux = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('baseCptCollectif', value)
    }

    //Gestion formulaire de remplissage infos tiers dans la création d'un nouveau compte pour le modèle sélectionné
    const handleOnChangeListBoxTypeTier = (setFieldValue) => (e) => {
        const value = e.target.value;
        setFieldValue('typeTier', value);
        setFormulaireTier(value);
        // Réinitialiser les localités uniquement si le type de tier impose le grisement
        if (value === 'etranger' || value === 'general') {
            setFieldValue('province', '');
            setFieldValue('region', '');
            setFieldValue('district', '');
            setFieldValue('commune', '');
            setSelectedProvince('');
            setSelectedRegion('');
            setSelectedDistrict('');
            setSelectedCommune('');
        }
    }

    //gestion tableau ajout compte de charge associé au nouveau compte à créer
    const handleOpenDialogAddNewCptAss = () => {
        const result = pc?.filter((item) => item.nature === 'General');
        setPcHorsCollectif(result);
        setOpenDialogAddNewCptAssoc(true);
    }

    const handleCloseDialogAddNewCptAss = () => {
        setOpenDialogAddNewCptAssoc(false);
    }

    //Gestion tableau ajout compte de TVA associé au nouveau compte à créer
    const recupererListeCptCollectif = () => {
        // const result = pc?.filter(item => item.nature === 'Collectif');
        axios.post(`/paramPlanComptable/pc`, { fileId: Number(id_dossier), compteId: Number(id_compte) }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                let listePc = resData.liste;
                // Inclure Collectif et General pour que la base soit récupérée/affichée pour toutes les natures
                const result = listePc?.filter(item => item.nature === 'Collectif')
                setListeCptCollectif(result);
            } else {
                toast.error(resData.msg);
            }
        })
    }

    //Affichage du plan comptable
    const showPc = () => {
        axios.post(`/paramPlanComptable/pc`, { fileId: Number(id_dossier), compteId: Number(id_compte) }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                let listePc = resData.liste;
                setPc(listePc);
            } else {
                toast.error(resData.msg);
            }
        })
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

    //Ajouter ou modifier une dossier plan comptable
    const formAddCpthandleSubmit = (values) => {
        values.compte = normalizeCompte(values.compte);
        axiosPrivate.post(`/paramPlanComptable/AddCpt`, values).then((response) => {
            const resData = response.data;
            if (resData.state === true) {
                setSelectedProvince('');
                setSelectedRegion('');
                setSelectedDistrict('');
                setSelectedCommune('');
                setRegions([]);
                setDistricts([]);
                setCommunes([]);
                showPc();
                toast.success(resData.msg);
                if (stateAction === "modification") {
                    setSelectedRow(resData?.dataModified);
                }
            } else {
                toast.error(resData.msg);
            }
            closePopup();
        });
    }

    const handleCloseDialogAddNewCptTvaToCpt = () => {
        setOpenDialogAddNewCptTvaToCpt(false);
    }

    const saveCptTva = (cpt_id) => {
        const libelle = pc?.find((item) => item.id === cpt_id);
        setSelectedCptAssocTva({ idCpt: cpt_id, compte: libelle.compte, libelle: libelle.libelle });
    }

    const saveCptChg = (cpt_id) => {
        const libelle = pc?.find((item) => item.id === cpt_id);
        setSelectedCptAssocChg({ idCpt: cpt_id, compte: libelle.compte, libelle: libelle.libelle });
    }

    const AddCptToTableCptChg = (setFieldValue) => () => {
        let interm = [...listCptChg];
        interm.push({ id: listCptChg.length + 1, idCpt: selectedCptAssocChg.idCpt, compte: selectedCptAssocChg.compte, libelle: selectedCptAssocChg.libelle });
        setListCptChg(interm);

        setFieldValue('listeCptChg', interm);
        handleCloseDialogAddNewCptAss();
    }

    const AddCptToTableCptTva = (setFieldValue) => () => {
        let interm = [...listCptTva];
        interm.push({ id: listCptTva.length + 1, idCpt: selectedCptAssocTva.idCpt, compte: selectedCptAssocTva.compte, libelle: selectedCptAssocTva.libelle });
        setListCptTva(interm);

        setFieldValue('listeCptTva', interm);
        handleCloseDialogAddNewCptTvaToCpt();
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
    const handleOpenDialogAddNewCptTvaToCpt = () => {
        const result = pc?.filter(item => item.compte.startsWith('4456') || item.compte.startsWith('4457'));
        setPcOnlyCptTva(result);
        setOpenDialogAddNewCptTvaToCpt(true);
    }

    useEffect(() => {
        if (id_compte && id_dossier) {
            showPc();
            recupererListeCptCollectif();
        }
    }, [id_dossier, id_compte]);

    // Charger les provinces
    useEffect(() => {
        getProvinces().then(setProvinces);
    }, []);

    // Charger les régions quand la province change, en évitant d'effacer pendant une restauration
    useEffect(() => {
        if (selectedProvince) {
            getRegions(selectedProvince).then((data) => {
                setRegions(data);
                if (!isRestoringLocalites) {
                    if (!selectedRegion) setSelectedRegion('');
                    if (!selectedDistrict) setDistricts([]);
                    if (!selectedDistrict) setSelectedDistrict('');
                    if (!selectedCommune) setCommunes([]);
                    if (!selectedCommune) setSelectedCommune('');
                }
            });
        } else {
            if (!isRestoringLocalites) {
                setRegions([]);
                setSelectedRegion('');
                setDistricts([]);
                setSelectedDistrict('');
                setCommunes([]);
                setSelectedCommune('');
            }
        }
    }, [selectedProvince, isRestoringLocalites]);

    useEffect(() => {
        if (selectedProvince && selectedRegion) {
            getDistricts(selectedProvince, selectedRegion).then((data) => {
                setDistricts(data);
                if (!isRestoringLocalites) {
                    if (!selectedDistrict) setSelectedDistrict('');
                    if (!selectedCommune) setCommunes([]);
                    if (!selectedCommune) setSelectedCommune('');
                }
            });
        } else {
            if (!isRestoringLocalites) {
                setDistricts([]);
                setSelectedDistrict('');
                setCommunes([]);
                setSelectedCommune('');
            }
        }
    }, [selectedProvince, selectedRegion, isRestoringLocalites]);

    // Charger les communes quand le district change; terminer la restauration quand les données sont prêtes
    useEffect(() => {
        if (selectedProvince && selectedRegion && selectedDistrict) {
            getCommunes(selectedProvince, selectedRegion, selectedDistrict).then((data) => {
                setCommunes(data);
                if (isRestoringLocalites) {
                    setIsRestoringLocalites(false);
                }
            });
        } else {
            if (!isRestoringLocalites) {
                setCommunes([]);
                setSelectedCommune('');
            }
        }
    }, [selectedProvince, selectedRegion, selectedDistrict, isRestoringLocalites]);

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            height: 36,
            fontSize: 13,
            borderRadius: 1,
            backgroundColor: '#fff',
            '& fieldset': { borderColor: '#d0d5dd' },
            '&:hover fieldset': { borderColor: '#9aa0a6' },
            '&.Mui-focused fieldset': { borderColor: '#3FA2F6', borderWidth: 1.2 },
        },
    };


    return (
        <>
            {/* MODAL DE CONFIRMATION DE SUPPRESSION DE COMPTE DE TVA RATTACHE AU COMPTE A CREER */}
            {openDialogDeleteCptTvaFromAddNewCpt ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer le compte sélectionné ?"} confirmationState={deleteCptTvaPC(setFieldValue)} /> : null}

            {/* MODAL DE CONFIRMATION DE SUPPRIMER DE COMPTE DE CHARGE RATTACHE AU COMPTE A CREER */}
            {openDialogDeleteCptChgFromAddNewCpt ? <PopupConfirmDelete msg={"Voulez-vous vraiment supprimer le compte sélectionné ?"} confirmationState={deleteCptChgPC(setFieldValue)} /> : null}

            <Formik
                initialValues={formAddCptInitialValues}
                enableReinitialize
                validateOnBlur={false}
                validationSchema={() => formAddCptValidationSchema(isTypeComptaAutre)}
                onSubmit={(values) => {
                    formAddCpthandleSubmit(values);
                }}
            >
                {({ values, handleChange, handleSubmit, setFieldValue, setFieldTouched, resetForm }) => {
                    // Synchroniser typeTier + localités selon nature/typeTier
                    useEffect(() => {
                        const isGen = values.nature === 'General' || values.nature === 'Collectif';
                        const isEtr = values.typeTier === 'etranger';

                        if (isGen && values.typeTier !== 'general') {
                            setFieldValue('typeTier', 'general', false);
                            setFormulaireTier('general');
                        }

                        // Localités grisées si: nature Général/Collectif, ou type de tier Etranger ou Général (pour Aux)
                        const disable = isGen || values.typeTier === 'etranger' || values.typeTier === 'general';
                        setDisableLocalites(disable);

                        if (disable) {
                            setFieldTouched('province', false, false);
                            setFieldTouched('region', false, false);
                            setFieldTouched('district', false, false);
                            setFieldTouched('commune', false, false);
                        }
                    }, [values.nature, values.typeTier]);

                    useEffect(() => {
                        if (stateAction === 'ajout') {
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
                            setFieldValue("idCompte", Number(id_compte));
                            setFieldValue("idDossier", Number(id_dossier));

                            setFormulaireTier('sans-nif');
                            recupererListeCptCollectif();
                            setTypeCptGeneral(true);

                            setFieldValue('typeTier', 'general');
                            setFormulaireTier('general');
                            setDisableLocalites(true);
                        } else {
                            recupererListeCptCollectif();

                            setFieldValue("action", "modify");
                            setFieldValue("itemId", selectedRow.id);
                            setFieldValue("idCompte", Number(id_compte));
                            setFieldValue("idDossier", Number(id_dossier));
                            setFieldValue("compte", selectedRow.compte);
                            setFieldValue("libelle", selectedRow.libelle);
                            setFieldValue("nature", selectedRow.nature);
                            // En modification: si General/Collectif, la base = le compte lui-même (id);
                            // sinon (Aux), on garde la base existante (baseaux_id)
                            if (selectedRow.nature === 'General' || selectedRow.nature === 'Collectif') {
                                setFieldValue("baseCptCollectif", selectedRow.id);
                            } else {
                                // Use the base account ID so it matches the Select's MenuItem values (which use item.id)
                                setFieldValue("baseCptCollectif", selectedRow.baseaux_id);
                            }
                            const isGen = selectedRow.nature === 'General' || selectedRow.nature === 'Collectif';
                            const isEtr = selectedRow.typetier === 'etranger';

                            if (isGen) {
                                // En modification: General/Collectif => type du tier forcé à 'general' et localités grisées
                                setFieldValue("typeTier", 'general');
                                setFormulaireTier('general');
                                setDisableLocalites(true);
                            } else {
                                // Sinon, on garde le type du tier de la ligne et on grise les localités si 'etranger'
                                setFieldValue("typeTier", selectedRow.typetier);
                                setFormulaireTier(selectedRow.typetier);
                                setDisableLocalites(isEtr);
                            }

                            setFieldValue("nif", selectedRow.nif);
                            // Backend returns column 'statistique' while the form field is named 'stat'
                            setFieldValue("stat", selectedRow.statistique);
                            setFieldValue("adresse", selectedRow.adresse);
                            setFieldValue("motcle", selectedRow.motcle);
                            setFieldValue("cin", selectedRow.cin);
                            setFieldValue("dateCin", selectedRow.datecin ? format(selectedRow?.datecin, 'yyyy-MM-dd') : null);
                            setFieldValue("autrePieceID", selectedRow.autrepieceid);
                            setFieldValue("refPieceID", selectedRow.refpieceid);
                            setFieldValue("adresseSansNIF", selectedRow.adressesansnif);
                            setFieldValue("nifRepresentant", selectedRow.nifrepresentant);
                            setFieldValue("adresseEtranger", selectedRow.adresseetranger);
                            setFieldValue("pays", selectedRow.pays);
                            setFieldValue("listeCptChg", listCptChg);
                            setFieldValue("listeCptTva", listCptTva);

                            setFieldValue("province", selectedRow.province);
                            setFieldValue("region", selectedRow.region);
                            setFieldValue("district", selectedRow.district);
                            setFieldValue("commune", selectedRow.commune);

                            setSelectedProvince(selectedRow.province);
                            setSelectedRegion(selectedRow.region);
                            setSelectedDistrict(selectedRow.district);
                            setSelectedCommune(selectedRow.commune);

                            setFieldValue("typecomptabilite", selectedRow.typecomptabilite || 'Français');
                            setFieldValue("compteautre", selectedRow?.compteautre || "");
                            setFieldValue("libelleautre", selectedRow?.libelleautre);

                            //Activer ou non la listbox base compte auxiliaire
                            if (selectedRow.nature === 'General' || selectedRow.nature === 'Collectif') {
                                setTypeCptGeneral(true);
                            } else {
                                setTypeCptGeneral(false);
                            }
                        }
                    }, [stateAction, selectedRow])

                    return (
                        <>
                            {/* MODAL POUR AJOUTER UN COMPTE DANS LA LISTE DES COMPTES DE CHARGES RATTACHES AU COMPTE A CREER*/}
                            <BootstrapDialog
                                onClose={handleCloseDialogAddNewCptAss}
                                aria-labelledby="customized-dialog-title"
                                open={openDialogAddNewCptAssoc}
                                disableEnforceFocus
                                disableRestoreFocus
                            >
                                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontWeight: 'normal', width: '600px', height: '55px', backgroundColor: initial.normal_pupup_header_color }}>
                                    <Typography variant='h10'>Ajouter un nouveau compte</Typography>
                                </DialogTitle>
                                <IconButton
                                    style={{ color: 'red' }}
                                    aria-label="close"
                                    onClick={handleCloseDialogAddNewCptAss}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                        color: (theme) => theme.palette.grey[500],
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                                <DialogContent dividers>

                                    <Stack width={"90%"} height={"150px"} spacing={2} alignItems={'center'} alignContent={"center"}
                                        direction={"column"} justifyContent={"center"} style={{ marginLeft: '10px' }}>

                                        <FormControl variant="standard" required sx={{ m: 1, minWidth: 250 }}>
                                            <InputLabel id="demo-simple-select-standard-label">Compte</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-standard-labelchg"
                                                id="demo-simple-select-standardchg"
                                                value={selectedCptAssocChg.idCpt}
                                                label={"cptchg"}
                                                onChange={(e) => saveCptChg(e.target.value)}
                                                sx={{ width: "500px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                            >
                                                <MenuItem key={0} value={''}><em>Aucune sélection</em></MenuItem>
                                                {pcHorsCollectif.map((cpt) => (
                                                    <MenuItem key={cpt.id} value={cpt.id}>{cpt.compte}: {cpt.libelle}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>

                                </DialogContent>
                                <DialogActions>
                                    <Button autoFocus
                                        style={{ backgroundColor: initial.add_new_line_bouton_color, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                                        onClick={AddCptToTableCptChg(setFieldValue)}
                                    >
                                        Ajouter
                                    </Button>
                                </DialogActions>
                            </BootstrapDialog>

                            {/* MODAL POUR AJOUTER UN COMPTE DANS LA LISTE DES COMPTES DE TVA RATTACHES AU COMPTE A CREER*/}
                            <BootstrapDialog
                                onClose={handleCloseDialogAddNewCptTvaToCpt}
                                aria-labelledby="customized-dialog-title"
                                open={openDialogAddNewCptTvaToCpt}
                                disableEnforceFocus
                                disableRestoreFocus
                            >
                                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontWeight: 'normal', width: '600px', height: '55px', backgroundColor: initial.normal_pupup_header_color }}>
                                    <Typography variant='h10'>Ajouter un nouveau compte de TVA</Typography>
                                </DialogTitle>
                                <IconButton
                                    style={{ color: 'red' }}
                                    aria-label="close"
                                    onClick={handleCloseDialogAddNewCptTvaToCpt}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                        color: (theme) => theme.palette.grey[500],
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                                <DialogContent dividers>

                                    <Stack width={"90%"} height={"150px"} spacing={2} alignItems={'center'} alignContent={"center"}
                                        direction={"column"} justifyContent={"center"} style={{ marginLeft: '10px' }}>

                                        <FormControl variant="standard" required sx={{ m: 1, minWidth: 250 }}>
                                            <InputLabel id="demo-simple-select-standard-label">Compte</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-standard-labelchg"
                                                id="demo-simple-select-standardchg"
                                                value={selectedCptAssocTva.idCpt}
                                                label={"cptchg"}
                                                onChange={(e) => saveCptTva(e.target.value)}
                                                sx={{ width: "500px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                            >
                                                <MenuItem key={0} value={''}><em>Aucune sélection</em></MenuItem>
                                                {pcOnlyCptTva.map((cpt) => (
                                                    <MenuItem key={cpt.id} value={cpt.id}>{cpt.compte}: {cpt.libelle}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>

                                </DialogContent>
                                <DialogActions>
                                    <Button autoFocus
                                        style={{ backgroundColor: initial.add_new_line_bouton_color, color: 'white', width: "100px", textTransform: 'none', outline: 'none' }}
                                        onClick={AddCptToTableCptTva(setFieldValue)}
                                    >
                                        Ajouter
                                    </Button>
                                </DialogActions>
                            </BootstrapDialog>

                            <Form style={{ width: '100%' }}>

                                <BootstrapDialog
                                    open={open}
                                    onClose={() => {
                                        if (stateAction === "ajout") {
                                            resetForm();
                                        }
                                        closePopup();
                                    }}
                                    // disableEnforceFocus
                                    // disableRestoreFocus
                                    fullWidth
                                    maxWidth="lg"
                                >
                                    <DialogTitle
                                        id="customized-dialog-title"
                                        sx={{
                                            height: "50px",
                                            boxShadow: 'none',
                                            borderBottom: 'none',
                                            backgroundImage: 'linear-gradient(90deg, #064E3B 0%, #0F766E 45%, #0B1220 100%)',
                                            backgroundColor: 'transparent',
                                        }}>
                                        <Typography variant="h7" component="div" sx={{ fontSize: 18, color: 'white' }}>
                                            Création d'un nouveau compte
                                        </Typography>
                                    </DialogTitle>

                                    <IconButton
                                        style={{ color: 'red', textTransform: 'none', outline: 'none' }}
                                        aria-label="close"
                                        onClick={() => {
                                            if (stateAction === "ajout") {
                                                resetForm();
                                            }
                                            closePopup();
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: 8,
                                            color: (theme) => theme.palette.grey[500],
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>

                                    <DialogContent style={{ width: "100%" }}>

                                        <Stack width={"100%"} height={"600px"} spacing={0} alignItems={'start'} alignContent={"center"}
                                            direction={"column"} justifyContent={"left"} style={{ marginLeft: '0px' }}>
                                            <Box sx={{ width: '100%', typography: 'body1' }}>
                                                <TabContext value={tabValueAjoutNewRow} sx={{ width: '100%' }}>
                                                    <Box sx={{ borderBottom: 1, borderColor: 'transparent', position: 'sticky' }}>
                                                        <TabList onChange={handleChangeTabValueAjoutNewRow} aria-label="lab API tabs example" variant='scrollable'>
                                                            <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="infos générales" value="1" />
                                                            <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Compte de charges" value="2" />
                                                            <Tab style={{ textTransform: 'none', outline: 'none', border: 'none' }} label="Compte de TVA" value="3" />
                                                        </TabList>
                                                    </Box>

                                                    <TabPanel value="1">
                                                        <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"}
                                                            alignContent={"flex-start"} justifyContent={"stretch"} >
                                                            <Stack
                                                                direction="row"
                                                                spacing={2}
                                                                alignItems="flex-end"
                                                                sx={{ backgroundColor: 'transparent' }}
                                                            >
                                                                {/* ===== Nature ===== */}
                                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                                    {/* Label */}
                                                                    <InputLabel
                                                                        sx={{
                                                                            fontSize: 12,
                                                                            color: '#9aa0a6',
                                                                            minHeight: 16, // 🔑 réserve la place
                                                                        }}
                                                                    >
                                                                        Nature
                                                                    </InputLabel>

                                                                    {/* Select */}
                                                                    <Field
                                                                        as={Select}
                                                                        disabled={isModifying}
                                                                        name="nature"
                                                                        size="small"
                                                                        onChange={handleChangeListBoxNature(setFieldValue)}
                                                                        sx={{
                                                                            height: 32,
                                                                            borderRadius: 1.5,
                                                                            fontSize: 14,
                                                                            '& .MuiSelect-select': {
                                                                                padding: '4px 8px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                height: '100%',
                                                                            },
                                                                            '& fieldset': { borderColor: '#ccc' },
                                                                            '&:hover fieldset': { borderColor: '#888' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                        }}
                                                                    >
                                                                        <MenuItem value="General">Compte général</MenuItem>
                                                                        <MenuItem value="Collectif">Compte collectif</MenuItem>
                                                                        <MenuItem value="Aux">Compte auxiliaire</MenuItem>
                                                                    </Field>

                                                                    {/* Error */}
                                                                    <Box sx={{ minHeight: 14 }}>
                                                                        <ErrorMessage
                                                                            name="nature"
                                                                            component="div"
                                                                            style={{ color: 'red', fontSize: 12 }}
                                                                        />
                                                                    </Box>
                                                                </Stack>

                                                                {/* ===== Base compte collectif ===== */}
                                                                <Stack spacing={1} sx={{ width: 400 }}>
                                                                    {/* Label */}
                                                                    <InputLabel
                                                                        sx={{
                                                                            fontSize: 12,
                                                                            color: '#9aa0a6',
                                                                            minHeight: 16, // 🔑 identique
                                                                        }}
                                                                    >
                                                                        Centralisation / Base compte auxiliaire
                                                                    </InputLabel>

                                                                    {/* Select */}
                                                                    <Field
                                                                        as={Select}
                                                                        disabled={typeCptGeneral || isModifying}
                                                                        name="baseCptCollectif"
                                                                        size="small"
                                                                        onChange={handleChangeListBoxBaseCompteAux(setFieldValue)}
                                                                        renderValue={(selected) => {
                                                                            const opt = listeCptCollectif?.find((i) => i.id === selected);
                                                                            if (opt) return `${opt.compte} ${opt.libelle}`;
                                                                            return ' ';
                                                                        }}
                                                                        sx={{
                                                                            height: 32,
                                                                            borderRadius: 1.5,
                                                                            fontSize: 14,
                                                                            '& .MuiSelect-select': {
                                                                                padding: '4px 8px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                height: '100%',
                                                                            },
                                                                            '& fieldset': { borderColor: '#ccc' },
                                                                            '&:hover fieldset': { borderColor: '#888' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                        }}
                                                                    >
                                                                        {listeCptCollectif?.map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                {item.compte} {item.libelle}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Field>

                                                                    {/* Error */}
                                                                    <Box sx={{ minHeight: 14 }}>
                                                                        <ErrorMessage
                                                                            name="baseCptCollectif"
                                                                            component="div"
                                                                            style={{ color: 'red', fontSize: 12 }}
                                                                        />
                                                                    </Box>
                                                                </Stack>
                                                            </Stack>


                                                            <Stack direction={'row'} alignContent={'start'}
                                                                alignItems={'start'} spacing={2}
                                                                style={{ backgroundColor: 'transparent', width: '800px' }}
                                                            >
                                                                {/* Compte */}
                                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                                    <InputLabel
                                                                        htmlFor="compte"
                                                                        sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}
                                                                    >
                                                                        Compte
                                                                    </InputLabel>

                                                                    <Field
                                                                        name='compte'
                                                                        as={TextField}
                                                                        disabled={isModifying}
                                                                        placeholder=""
                                                                        size="small"
                                                                        sx={{
                                                                            width: '100%',
                                                                            height: 32,           // même hauteur uniforme
                                                                            borderRadius: 1.5,    // coins arrondis
                                                                            fontSize: 14,
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: 32,
                                                                                '& fieldset': {
                                                                                    borderColor: '#ccc',
                                                                                },
                                                                                '&:hover fieldset': {
                                                                                    borderColor: '#888',
                                                                                },
                                                                                '&.Mui-focused fieldset': {
                                                                                    borderColor: '#3FA2F6',
                                                                                },
                                                                            },
                                                                        }}
                                                                    />

                                                                    <ErrorMessage
                                                                        name='compte'
                                                                        component="div"
                                                                        style={{ color: 'red', fontSize: 12, marginTop: 2 }}
                                                                    />
                                                                </Stack>

                                                                {/* Libellé / raison sociale */}
                                                                <Stack spacing={1} sx={{ width: 400 }}>
                                                                    <InputLabel
                                                                        htmlFor="libelle"
                                                                        sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}
                                                                    >
                                                                        Libellé / raison sociale
                                                                    </InputLabel>

                                                                    <Field
                                                                        name='libelle'
                                                                        as={TextField}
                                                                        placeholder=""
                                                                        size="small"
                                                                        sx={{
                                                                            width: '100%',
                                                                            height: 32,
                                                                            borderRadius: 1.5,
                                                                            fontSize: 14,
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: 32,
                                                                                '& fieldset': {
                                                                                    borderColor: '#ccc',
                                                                                },
                                                                                '&:hover fieldset': {
                                                                                    borderColor: '#888',
                                                                                },
                                                                                '&.Mui-focused fieldset': {
                                                                                    borderColor: '#3FA2F6',
                                                                                },
                                                                            },
                                                                        }}
                                                                    />

                                                                    <ErrorMessage
                                                                        name='libelle'
                                                                        component="div"
                                                                        style={{ color: 'red', fontSize: 12, marginTop: 2 }}
                                                                    />
                                                                </Stack>

                                                            </Stack>

                                                            {isTypeComptaAutre && (
                                                                <Stack direction={'row'} alignContent={'start'}
                                                                    alignItems={'start'} spacing={5}
                                                                    style={{ backgroundColor: 'transparent', width: '800px' }}
                                                                >
                                                                    {/* Corréspondance ce compte */}
                                                                    <Stack spacing={0.5} sx={{ width: 200 }}>
                                                                        <InputLabel
                                                                            htmlFor="compteautre"
                                                                            sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}
                                                                        >
                                                                            Corréspondance ce compte
                                                                        </InputLabel>

                                                                        <Field
                                                                            name='compteautre'
                                                                            as={TextField}
                                                                            placeholder=""
                                                                            size="small"
                                                                            sx={{
                                                                                width: '100%',
                                                                                height: 32,
                                                                                borderRadius: 1.5,
                                                                                fontSize: 14,
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    height: 32,
                                                                                    '& fieldset': { borderColor: '#ccc' },
                                                                                    '&:hover fieldset': { borderColor: '#888' },
                                                                                    '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                },
                                                                            }}
                                                                        />

                                                                        <ErrorMessage
                                                                            name='compteautre'
                                                                            component="div"
                                                                            style={{ color: 'red', fontSize: 12, marginTop: 2 }}
                                                                        />
                                                                    </Stack>

                                                                    {/* Libellé / raison sociale (autre) */}
                                                                    <Stack spacing={0.5} sx={{ width: 500 }}>
                                                                        <InputLabel
                                                                            htmlFor="libelleautre"
                                                                            sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}
                                                                        >
                                                                            Libellé / raison sociale (autre)
                                                                        </InputLabel>

                                                                        <Field
                                                                            name='libelleautre'
                                                                            as={TextField}
                                                                            placeholder=""
                                                                            size="small"
                                                                            sx={{
                                                                                width: '100%',
                                                                                height: 32,
                                                                                borderRadius: 1.5,
                                                                                fontSize: 14,
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    height: 32,
                                                                                    '& fieldset': { borderColor: '#ccc' },
                                                                                    '&:hover fieldset': { borderColor: '#888' },
                                                                                    '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                },
                                                                            }}
                                                                        />

                                                                        <ErrorMessage
                                                                            name='libelleautre'
                                                                            component="div"
                                                                            style={{ color: 'red', fontSize: 12, marginTop: 2 }}
                                                                        />
                                                                    </Stack>

                                                                </Stack>
                                                            )}

                                                            <Stack spacing={1} style={{ marginTop: 25 }}>
                                                                <InputLabel htmlFor="typeTier" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                    Type du Tier
                                                                </InputLabel>
                                                                <Field
                                                                    as={Select}
                                                                    labelId="typeTier-label"
                                                                    name="typeTier"
                                                                    disabled={values.nature === 'General' || values.nature === 'Collectif' || isModifying}
                                                                    onBlur={(e) => { /* avoid Formik executeBlur with undefined event */ }}
                                                                    onChange={handleOnChangeListBoxTypeTier(setFieldValue)}
                                                                    sx={{
                                                                        width: "250px",
                                                                        height: 32,
                                                                        borderRadius: 1,
                                                                        fontSize: 14,
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: 32,
                                                                            '& fieldset': { borderColor: '#ccc' },
                                                                            '&:hover fieldset': { borderColor: '#888' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                        },
                                                                    }}
                                                                >
                                                                    <MenuItem key={"sans-nif"} value={"sans-nif"}>Sans NIF</MenuItem>
                                                                    <MenuItem key={"avec-nif"} value={"avec-nif"}>Avec NIF</MenuItem>
                                                                    <MenuItem key={"etranger"} value={"etranger"}>Etranger</MenuItem>
                                                                    <MenuItem key={"general"} value={"general"}>Général</MenuItem>
                                                                </Field>
                                                                <ErrorMessage name='typeTier' component="div" style={{ color: 'red', fontSize: 12, marginTop: -2 }} />
                                                            </Stack>

                                                            <Stack >
                                                                {formulaireTier === 'sans-nif'
                                                                    ? <Stack margin={"0px"} alignContent={"start"} alignItems={"start"}>
                                                                        <Stack direction={'row'} alignContent={'stard'}
                                                                            alignItems={'start'} spacing={6.5}
                                                                            style={{ backgroundColor: 'transparent', width: '800px' }}
                                                                        >
                                                                            <Stack spacing={1.5}>
                                                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                                                    <InputLabel htmlFor="cin" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                        cin
                                                                                    </InputLabel>
                                                                                    <Field
                                                                                        name='cin'
                                                                                        as={TextField}
                                                                                        onChange={(e) => {
                                                                                            let value = e.target.value.replace(/\s+/g, "");

                                                                                            value = value.replace(/[^a-zA-Z0-9]/g, "");

                                                                                            const formatted = value.replace(/(.{3})/g, "$1 ").trim();

                                                                                            e.target.value = formatted;
                                                                                            handleChange(e);
                                                                                        }}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        size="small"
                                                                                        sx={{
                                                                                            width: '100%',
                                                                                            height: 32,
                                                                                            borderRadius: 1.5,
                                                                                            fontSize: 14,
                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                height: 32,
                                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <ErrorMessage name='cin' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                </Stack>

                                                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                                                    <InputLabel htmlFor="dateCin" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                        date cin
                                                                                    </InputLabel>
                                                                                    <Field
                                                                                        as={TextField}
                                                                                        name='dateCin'
                                                                                        onChange={handleChange}
                                                                                        type='date'
                                                                                        placeholder=""
                                                                                        size="small"
                                                                                        sx={{
                                                                                            width: '100%',
                                                                                            height: 32,
                                                                                            borderRadius: 1.5,
                                                                                            fontSize: 14,
                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                height: 32,
                                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <ErrorMessage name='dateCin' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                </Stack>
                                                                            </Stack>

                                                                            <Stack spacing={1.5}>
                                                                                <Stack spacing={1} sx={{ width: 400 }}>
                                                                                    <InputLabel htmlFor="autrePieceID" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                        Autres pièces d'identité si pas de CIN
                                                                                    </InputLabel>
                                                                                    <Field
                                                                                        as={TextField}
                                                                                        name='autrePieceID'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        size="small"
                                                                                        sx={{
                                                                                            width: '100%',
                                                                                            height: 32,
                                                                                            borderRadius: 1.5,
                                                                                            fontSize: 14,
                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                height: 32,
                                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <ErrorMessage name='autrePieceID' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                </Stack>

                                                                                <Stack spacing={1} sx={{ width: 400 }}>
                                                                                    <InputLabel htmlFor="refPieceID" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                        Référence pièce d'identité
                                                                                    </InputLabel>
                                                                                    <Field
                                                                                        as={TextField}
                                                                                        name='refPieceID'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        size="small"
                                                                                        sx={{
                                                                                            width: '100%',
                                                                                            height: 32,
                                                                                            borderRadius: 1.5,
                                                                                            fontSize: 14,
                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                height: 32,
                                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <ErrorMessage name='refPieceID' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                </Stack>
                                                                            </Stack>

                                                                            <Stack spacing={1.5} >
                                                                                <Stack spacing={1} sx={{ width: 200 }}>
                                                                                    <InputLabel htmlFor="adresseSansNIF" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                        Adresse
                                                                                    </InputLabel>
                                                                                    <Field
                                                                                        as={TextField}
                                                                                        name='adresseSansNIF'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        size="small"
                                                                                        sx={{
                                                                                            width: '100%',
                                                                                            height: 32,
                                                                                            borderRadius: 1.5,
                                                                                            fontSize: 14,
                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                height: 32,
                                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <ErrorMessage name='adresseSansNIF' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                </Stack>
                                                                            </Stack>
                                                                        </Stack>
                                                                    </Stack>
                                                                    : formulaireTier === 'avec-nif'
                                                                        ? <Stack >
                                                                            <Stack spacing={1.5} style={{ marginTop: 15 }}>
                                                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                                                    <InputLabel htmlFor="nif" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                        Nif
                                                                                    </InputLabel>
                                                                                    <Field
                                                                                        as={TextField}
                                                                                        name='nif'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        size="small"
                                                                                        sx={{
                                                                                            width: '100%',
                                                                                            height: 32,
                                                                                            borderRadius: 1.5,
                                                                                            fontSize: 14,
                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                height: 32,
                                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <ErrorMessage name='nif' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                </Stack>

                                                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                                                    <InputLabel htmlFor="stat" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                        N° statistique
                                                                                    </InputLabel>
                                                                                    <Field
                                                                                        as={TextField}
                                                                                        name='stat'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        size="small"
                                                                                        sx={{
                                                                                            width: '100%',
                                                                                            height: 32,
                                                                                            borderRadius: 1.5,
                                                                                            fontSize: 14,
                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                height: 32,
                                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <ErrorMessage name='stat' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                </Stack>

                                                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                                                    <InputLabel htmlFor="adresse" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                        Adresse
                                                                                    </InputLabel>
                                                                                    <Field
                                                                                        as={TextField}
                                                                                        name='adresse'
                                                                                        onChange={handleChange}
                                                                                        type='text'
                                                                                        placeholder=""
                                                                                        size="small"
                                                                                        sx={{
                                                                                            width: '100%',
                                                                                            height: 32,
                                                                                            borderRadius: 1.5,
                                                                                            fontSize: 14,
                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                height: 32,
                                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <ErrorMessage name='adresse' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                </Stack>
                                                                            </Stack>
                                                                        </Stack>
                                                                        : formulaireTier === 'etranger'
                                                                            ? <Stack margin={"0px"} alignContent={"start"} alignItems={"start"}>
                                                                                <Stack spacing={1.5} style={{ marginTop: 15 }}>
                                                                                    <Stack spacing={1} sx={{ width: 250 }}>
                                                                                        <InputLabel htmlFor="nifRepresentant" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                            Nif du représentant
                                                                                        </InputLabel>
                                                                                        <Field
                                                                                            as={TextField}
                                                                                            name='nifRepresentant'
                                                                                            onChange={handleChange}
                                                                                            type='text'
                                                                                            placeholder=""
                                                                                            size="small"
                                                                                            sx={{
                                                                                                width: '100%',
                                                                                                height: 32,
                                                                                                borderRadius: 1.5,
                                                                                                fontSize: 14,
                                                                                                '& .MuiOutlinedInput-root': {
                                                                                                    height: 32,
                                                                                                    '& fieldset': { borderColor: '#ccc' },
                                                                                                    '&:hover fieldset': { borderColor: '#888' },
                                                                                                    '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                                },
                                                                                            }}
                                                                                        />
                                                                                        <ErrorMessage name='nifRepresentant' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                    </Stack>

                                                                                    <Stack spacing={1} sx={{ width: 250 }}>
                                                                                        <InputLabel htmlFor="adresseEtranger" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                            Adresse
                                                                                        </InputLabel>
                                                                                        <Field
                                                                                            as={TextField}
                                                                                            name='adresseEtranger'
                                                                                            onChange={handleChange}
                                                                                            type='text'
                                                                                            placeholder=""
                                                                                            size="small"
                                                                                            sx={{
                                                                                                width: '100%',
                                                                                                height: 32,
                                                                                                borderRadius: 1.5,
                                                                                                fontSize: 14,
                                                                                                '& .MuiOutlinedInput-root': {
                                                                                                    height: 32,
                                                                                                    '& fieldset': { borderColor: '#ccc' },
                                                                                                    '&:hover fieldset': { borderColor: '#888' },
                                                                                                    '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                                },
                                                                                            }}
                                                                                        />
                                                                                        <ErrorMessage name='adresseEtranger' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                    </Stack>

                                                                                    <Stack spacing={1} sx={{ width: 250 }}>
                                                                                        <InputLabel htmlFor="pays" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                                            Pays
                                                                                        </InputLabel>
                                                                                        <Field
                                                                                            as={TextField}
                                                                                            name='pays'
                                                                                            onChange={handleChange}
                                                                                            type='text'
                                                                                            placeholder=""
                                                                                            size="small"
                                                                                            sx={{
                                                                                                width: '100%',
                                                                                                height: 32,
                                                                                                borderRadius: 1.5,
                                                                                                fontSize: 14,
                                                                                                '& .MuiOutlinedInput-root': {
                                                                                                    height: 32,
                                                                                                    '& fieldset': { borderColor: '#ccc' },
                                                                                                    '&:hover fieldset': { borderColor: '#888' },
                                                                                                    '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                                                },
                                                                                            }}
                                                                                        />
                                                                                        <ErrorMessage name='pays' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                                    </Stack>
                                                                                </Stack>
                                                                            </Stack>
                                                                            : null
                                                                }
                                                            </Stack>

                                                            <Stack spacing={1.5} style={{ marginTop: 15 }}>
                                                                <Stack spacing={1} sx={{ width: 250 }}>
                                                                    <InputLabel htmlFor="motcle" sx={{ fontSize: 12, color: '#9aa0a6', mb: 0.5 }}>
                                                                        Mot clé
                                                                    </InputLabel>
                                                                    <Field
                                                                        as={TextField}
                                                                        name='motcle'
                                                                        onChange={handleChange}
                                                                        type='text'
                                                                        placeholder=""
                                                                        size="small"
                                                                        sx={{
                                                                            width: '100%',
                                                                            height: 32,
                                                                            borderRadius: 1.5,
                                                                            fontSize: 14,
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: 32,
                                                                                '& fieldset': { borderColor: '#ccc' },
                                                                                '&:hover fieldset': { borderColor: '#888' },
                                                                                '&.Mui-focused fieldset': { borderColor: '#3FA2F6' },
                                                                            },
                                                                        }}
                                                                    />
                                                                    <ErrorMessage name='motcle' component="div" style={{ color: 'red', fontSize: 12, marginTop: 2 }} />
                                                                </Stack>
                                                            </Stack>

                                                            <Stack
                                                                spacing={2}
                                                                mt={3}
                                                                width="100%"
                                                                maxWidth={520}   // 👈 augmente ici (1100 / 1200 / 1400)
                                                                mx="auto"
                                                            >
                                                                {/* Ligne 1 : Province / Région */}
                                                                <Stack direction="row" spacing={2}>
                                                                    <Stack flex={1}>
                                                                        <InputLabel sx={{ fontSize: 11, color: '#667085', mb: 0.5 }}>
                                                                            Province
                                                                        </InputLabel>
                                                                        <Autocomplete
                                                                            disabled={disableLocalites}
                                                                            options={provinces}
                                                                            value={selectedProvince || null}
                                                                            onChange={(e, v) => {
                                                                                setFieldValue('province', v || '');
                                                                                setSelectedProvince(v || '');
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField {...params} size="small" sx={inputSx} />
                                                                            )}
                                                                        />
                                                                        <ErrorMessage name="province" component="div" style={{ fontSize: 11, color: '#d32f2f' }} />
                                                                    </Stack>

                                                                    <Stack flex={1}>
                                                                        <InputLabel sx={{ fontSize: 11, color: '#667085', mb: 0.5 }}>
                                                                            Région
                                                                        </InputLabel>
                                                                        <Autocomplete
                                                                            disabled={disableLocalites}
                                                                            options={regions}
                                                                            value={selectedRegion || values.region}
                                                                            onChange={(e, v) => {
                                                                                setFieldValue('region', v);
                                                                                setSelectedRegion(v);
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField {...params} size="small" sx={inputSx} />
                                                                            )}
                                                                        />
                                                                        <ErrorMessage name="region" component="div" style={{ fontSize: 11, color: '#d32f2f' }} />
                                                                    </Stack>
                                                                </Stack>

                                                                {/* Ligne 2 : District / Commune */}
                                                                <Stack direction="row" spacing={2}>
                                                                    <Stack flex={1}>
                                                                        <InputLabel sx={{ fontSize: 11, color: '#667085', mb: 0.5 }}>
                                                                            District
                                                                        </InputLabel>
                                                                        <Autocomplete
                                                                            disabled={disableLocalites}
                                                                            options={districts}
                                                                            value={selectedDistrict || values.district}
                                                                            onChange={(e, v) => {
                                                                                setFieldValue('district', v);
                                                                                setSelectedDistrict(v);
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField {...params} size="small" sx={inputSx} />
                                                                            )}
                                                                        />
                                                                        <ErrorMessage name="district" component="div" style={{ fontSize: 11, color: '#d32f2f' }} />
                                                                    </Stack>

                                                                    <Stack flex={1}>
                                                                        <InputLabel sx={{ fontSize: 11, color: '#667085', mb: 0.5 }}>
                                                                            Commune
                                                                        </InputLabel>
                                                                        <Autocomplete
                                                                            disabled={disableLocalites}
                                                                            options={communes}
                                                                            value={selectedCommune || values.commune}
                                                                            onChange={(e, v) => {
                                                                                setFieldValue('commune', v);
                                                                                setSelectedCommune(v);
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField {...params} size="small" sx={inputSx} />
                                                                            )}
                                                                        />
                                                                        <ErrorMessage name="commune" component="div" style={{ fontSize: 11, color: '#d32f2f' }} />
                                                                    </Stack>
                                                                </Stack>

                                                            </Stack>

                                                        </Stack>
                                                    </TabPanel>

                                                    <TabPanel value="2">
                                                        <Stack width={"100%"} height={"100%"} spacing={0}>

                                                            <Stack width={"100%"} height={"20%"} spacing={1} alignItems={'end'} alignContent={'end'}
                                                                direction={"row"} justifyContent={'end'}>

                                                                <Tooltip title="Ajouter un nouveau compte">
                                                                    <Button
                                                                        variant="contained"
                                                                        sx={{
                                                                            width: 100,
                                                                            height: 32,
                                                                            borderRadius: 1,
                                                                            backgroundColor: '#4CAF50',
                                                                            color: 'white',
                                                                            textTransform: 'none',
                                                                            fontSize: 14,
                                                                            alignSelf: 'flex-start',
                                                                            // position: 'relative',
                                                                            // top: 25,
                                                                            '&:hover': {
                                                                                backgroundColor: '#45a049',
                                                                            },
                                                                        }}
                                                                        onClick={handleOpenDialogAddNewCptAss}
                                                                    >
                                                                        Ajouter
                                                                    </Button>
                                                                </Tooltip>

                                                                <Tooltip title="Supprimer le compte sélectionné">
                                                                    <span>
                                                                        <Button
                                                                            onClick={handleOpenDialogConfirmDeleteCptChgFromDialogAddNewCpte}
                                                                            variant="contained"
                                                                            sx={{
                                                                                width: 100,
                                                                                height: 32,
                                                                                borderRadius: 1,
                                                                                backgroundColor: initial.annuler_bouton_color,
                                                                                color: 'white',
                                                                                textTransform: 'none',
                                                                                fontSize: 14,
                                                                                alignSelf: 'flex-start',
                                                                                // position: 'relative',
                                                                                // top: 25,
                                                                                '&:hover': {
                                                                                    backgroundColor: initial.annuler_bouton_color,
                                                                                },
                                                                            }}
                                                                        >
                                                                            Supprimer
                                                                        </Button>
                                                                    </span>
                                                                </Tooltip>
                                                            </Stack>

                                                            <Stack width={"100%"} height={"500px"}>
                                                                <DataGrid
                                                                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                                                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                                                                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                                                                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                                                    disableRowSelectionOnClick
                                                                    disableSelectionOnClick={true}
                                                                    slots={{ toolbar: QuickFilter }}
                                                                    sx={{
                                                                        ...DataGridStyle.sx,
                                                                        '& .MuiDataGrid-columnHeaders': {
                                                                            backgroundColor: initial.tableau_theme,
                                                                            color: initial.text_theme,
                                                                        },
                                                                        '& .MuiDataGrid-columnHeaderTitle': {
                                                                            color: initial.text_theme,
                                                                            fontWeight: 600,
                                                                        },
                                                                        '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                                                            color: initial.text_theme,
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
                                                                    }}
                                                                    rowHeight={DataGridStyle.rowHeight}
                                                                    columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                                                    onRowSelectionModelChange={ids => {
                                                                        const lastId = ids && ids.length ? ids[ids.length - 1] : null;
                                                                        if (lastId != null) {
                                                                            setSelectedCptChgOnList([lastId]);
                                                                        } else {
                                                                            setSelectedCptChgOnList([0]);
                                                                        }
                                                                    }}
                                                                    rowSelectionModel={Array.isArray(selectedCptChgOnList) ? selectedCptChgOnList : (selectedCptChgOnList ? [selectedCptChgOnList] : [])}
                                                                    rows={listCptChg}
                                                                    columns={columnHeaderAddNewRowModelDetail}
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
                                                                />
                                                            </Stack>
                                                        </Stack>
                                                    </TabPanel>

                                                    <TabPanel value="3">
                                                        <Stack width={"100%"} height={"100%"} spacing={0} alignItems={"flex-start"}>
                                                            <Stack width={"100%"} height={"40px"} spacing={1} alignItems={'end'} alignContent={'end'}
                                                                direction={"row"} justifyContent={'end'}>
                                                                <Tooltip title="Ajouter un nouveau compte">
                                                                    <Button
                                                                        onClick={handleOpenDialogAddNewCptTvaToCpt}
                                                                        variant="contained"
                                                                        sx={{
                                                                            width: 100,
                                                                            height: 32,
                                                                            borderRadius: 1,
                                                                            backgroundColor: '#4CAF50',
                                                                            color: 'white',
                                                                            textTransform: 'none',
                                                                            fontSize: 14,
                                                                            alignSelf: 'flex-start',
                                                                            // position: 'relative',
                                                                            // top: 25,
                                                                            '&:hover': {
                                                                                backgroundColor: '#45a049',
                                                                            },
                                                                        }}
                                                                    >
                                                                        Ajouter
                                                                    </Button>
                                                                </Tooltip>

                                                                <Tooltip title="Supprimer le compte sélectionné">
                                                                    
                                                                        <Button
                                                                            onClick={handleOpenDialogConfirmDeleteCptTvaFromDialogAddNewCpte}
                                                                            variant="contained"
                                                                            sx={{
                                                                                width: 100,
                                                                                height: 32,
                                                                                borderRadius: 1,
                                                                                backgroundColor: initial.annuler_bouton_color,
                                                                                color: 'white',
                                                                                textTransform: 'none',
                                                                                fontSize: 14,
                                                                                alignSelf: 'flex-start',
                                                                              //  position: 'relative',
                                                                             //   top: 25,
                                                                                '&:hover': {
                                                                                    backgroundColor: initial.annuler_bouton_color,
                                                                                },
                                                                            }}
                                                                        >
                                                                            Supprimer
                                                                        </Button>
                                                                    
                                                                </Tooltip>
                                                            </Stack>

                                                            <Stack width={"100%"} height={"500px"}>
                                                                <DataGrid
                                                                    disableMultipleSelection={DataGridStyle.disableMultipleSelection}
                                                                    disableColumnSelector={DataGridStyle.disableColumnSelector}
                                                                    disableDensitySelector={DataGridStyle.disableDensitySelector}
                                                                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                                                                    disableRowSelectionOnClick
                                                                    disableSelectionOnClick={true}
                                                                    slots={{ toolbar: QuickFilter }}
                                                                    sx={{
                                                                        ...DataGridStyle.sx,
                                                                        '& .MuiDataGrid-columnHeaders': {
                                                                            backgroundColor: initial.tableau_theme,
                                                                            color: initial.text_theme,
                                                                        },
                                                                        '& .MuiDataGrid-columnHeaderTitle': {
                                                                            color: initial.text_theme,
                                                                            fontWeight: 600,
                                                                        },
                                                                        '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIcon': {
                                                                            color: initial.text_theme,
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
                                                                    }}
                                                                    rowHeight={DataGridStyle.rowHeight}
                                                                    columnHeaderHeight={DataGridStyle.columnHeaderHeight}
                                                                    onRowSelectionModelChange={ids => {
                                                                        const lastId = ids && ids.length ? ids[ids.length - 1] : null;
                                                                        if (lastId != null) {
                                                                            setSelectedCptTvaOnList([lastId]);
                                                                        } else {
                                                                            setSelectedCptTvaOnList([0]);
                                                                        }
                                                                    }}
                                                                    rowSelectionModel={Array.isArray(selectedCptTvaOnList) ? selectedCptTvaOnList : (selectedCptTvaOnList ? [selectedCptTvaOnList] : [])}
                                                                    rows={listCptTva}
                                                                    columns={columnHeaderAddNewRowModelDetail}
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
                                                                />
                                                            </Stack>
                                                        </Stack>
                                                    </TabPanel>

                                                </TabContext>
                                            </Box>
                                        </Stack>

                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                width: 100,
                                                height: 32,
                                                borderRadius: 1,
                                                border: '1px solid transparent',
                                                backgroundColor: initial.annuler_bouton_color,
                                                color: 'white',
                                                textTransform: 'none',
                                                fontSize: 14,
                                                '&:hover': {
                                                    backgroundColor: initial.annuler_bouton_color,
                                                    border: '1px solid transparent',
                                                },
                                                '&:focus': {
                                                    outline: 'none',
                                                    border: '1px solid transparent',
                                                },
                                            }}
                                            onClick={() => {
                                                if (stateAction === "ajout") {
                                                    resetForm();
                                                }
                                                closePopup();
                                            }}
                                        >
                                            Annuler
                                        </Button>

                                        <Button
                                            sx={{
                                                width: 100,
                                                height: 32,
                                                borderRadius: 1,
                                                border: '1px solid transparent',
                                                backgroundColor: initial.auth_gradient_end,
                                                color: 'white',
                                                textTransform: 'none',
                                                fontSize: 14,
                                                '&:hover': {
                                                    backgroundColor: initial.auth_gradient_end,
                                                    border: '1px solid transparent',
                                                },
                                                '&:focus': {
                                                    outline: 'none',
                                                    border: '1px solid transparent',
                                                },
                                            }}
                                            type="submit"
                                            onClick={handleSubmit}
                                        >
                                            Enregistrer
                                        </Button>
                                    </DialogActions>

                                </BootstrapDialog>
                            </Form>
                        </>
                    )
                }}
            </Formik>
        </>
    )
}

export default PopupAddNewAccount