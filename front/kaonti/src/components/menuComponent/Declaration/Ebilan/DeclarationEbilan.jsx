import { React, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Paper, TextField, IconButton, Card, CardActionArea, CardContent, Divider } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState } from 'react';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TableListeActionnaireModel from '../../../../model/TableListeActionnaireModel';
import TableListeDomBancaireModel from '../../../../model/TableListeDomBancaireModel';
import TableBilanActifModel from '../../../../model/TableBilanActifModel';
import TableBilanPassifModel from '../../../../model/TableBilanPassifModel';
import TableCRNModel from '../../../../model/TableCRNModel';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import { GoAlert } from "react-icons/go";
import { PiArticleThin } from "react-icons/pi";
import Badge from '@mui/material-next/Badge';
import { TbRefresh } from "react-icons/tb";
import { IoAddSharp } from "react-icons/io5";
import { GoX } from "react-icons/go";
import Tooltip from '@mui/material/Tooltip';
import TableCRFModel from '../../../../model/TableCRFModel';
import TableTFTDModel from '../../../../model/TableTFTDModel';
import TableTFTIModel from '../../../../model/TableTFTIModel';
import TableEVCPModel from '../../../../model/TableEVCPModel';
import TableDRFModel from '../../../../model/TableDRFModel';
import TableBHIAPCModel from '../../../../model/TableBHIAPCModel';
import TableMPModel from '../../../../model/TableMPModel';
import TableDAModel from '../../../../model/TableDAModel';
import TableDPModel from '../../../../model/TableDPModel';
import TableEIAFNCModel from '../../../../model/TableEIAFNCModel';
import TableSADModel from '../../../../model/TableSADModel';
import TableSDRModel from '../../../../model/TableSDRModel';
import TableSEModel from '../../../../model/TableSEModel';
import TableNoteExplicativeModel from '../../../../model/TableNoteExplicativeModel';
import { IoMdTrash } from "react-icons/io";
import { TbPlaylistAdd } from "react-icons/tb";

import { init } from '../../../../../init';
import useAuth from '../../../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import axios from '../../../../../config/axios';
import toast from 'react-hot-toast';
import PopupTestSelectedFile from '../../../componentsTools/popupTestSelectedFile';
import { InfoFileStyle } from '../../../componentsTools/InfosFileStyle';
import { format } from 'date-fns';
import VirtualTableEbilan from '../../../componentsTools/DeclarationEbilan/virtualTableEbilan';
import VirtualTableDRFEbilan from '../../../componentsTools/DeclarationEbilan/virtualTableDRFEbilan';
import VirtualTableEVCPEbilan from '../../../componentsTools/DeclarationEbilan/virtualTableEVCPEbilan';
import VirtualTableSADEbilan from '../../../componentsTools/DeclarationEbilan/virtualTableSADEbilan';
import VirtualTableSDREbilan from '../../../componentsTools/DeclarationEbilan/virtualTableSDREbilan';
import VirtualTableModifiableEbilan from '../../../componentsTools/DeclarationEbilan/virtualTableModifiableEbilan';
import VirtualTableModifiableGroupableEbilan from '../../../componentsTools/DeclarationEbilan/virtualTableModifiableGroupableEbilan';
import VirtualTableModifiableGroupableEbilanDP from '../../../componentsTools/DeclarationEbilan/virtualTableModifiableGroupableEbilanDP';
import VirtualTableModifiableGroupableEbilanEIAFNC from '../../../componentsTools/DeclarationEbilan/virtualTableModifiableGroupableEbilanEIAFNC';
import { FaLock } from "react-icons/fa6";
import { FaLockOpen } from "react-icons/fa6";
import { CiLock } from "react-icons/ci";
import { CiUnlock } from "react-icons/ci";
import PopupActionConfirm from '../../../componentsTools/popupActionConfirm';
import PopupConfirmDelete from '../../../componentsTools/popupConfirmDelete';
import PopupModifBHIAPC from '../../../componentsTools/FormulaireModifTableauEbilan/popupModifBHIAPC';
import PopupModifMP from '../../../componentsTools/FormulaireModifTableauEbilan/popupModifMP';
import PopupModifDA from '../../../componentsTools/FormulaireModifTableauEbilan/popupModifDA';
import PopupModifDP from '../../../componentsTools/FormulaireModifTableauEbilan/popupModifDP';
import PopupModifEIAFNC from '../../../componentsTools/FormulaireModifTableauEbilan/popupModifEIAFNC';
import PopupModifSE from '../../../componentsTools/FormulaireModifTableauEbilan/popupModifSE';
import PopupModifNE from '../../../componentsTools/FormulaireModifTableauEbilan/popupModifNE';
import { BsCreditCard2FrontFill } from "react-icons/bs";
import { useTheme } from '@mui/material/styles';
import { FaLocationDot } from "react-icons/fa6";

export default function DeclarationEbilan() {

    //Valeur du listbox choix exercice ou situation-----------------------------------------------------
    const [valSelect, setValSelect] = useState('');
    const [value, setValue] = useState("1");

    let initial = init[0];
    const [fileInfos, setFileInfos] = useState('');
    const [associeData, setAssocieData] = useState([]);
    const [domBankData, setDomBankData] = useState([]);
    const [fileId, setFileId] = useState(0);
    const { id } = useParams();
    const [noFile, setNoFile] = useState(false);

    const [selectedExerciceId, setSelectedExerciceId] = useState(0);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState(0);
    const [selectedPeriodeChoiceId, setSelectedPeriodeChoiceId] = useState(0);
    const [listeExercice, setListeExercice] = useState([]);
    const [listeSituation, setListeSituation] = useState([]);

    const [showBilan, setShowBilan] = useState('actif');
    const [buttonActifVariant, setButtonActifVariant] = useState('contained');
    const [buttonPassifVariant, setButtonPassifVariant] = useState('outlined');

    const [verrBilan, setVerrBilan] = useState(false);
    const [verrCrn, setVerrCrn] = useState(false);
    const [verrCrf, setVerrCrf] = useState(false);
    const [verrTftd, setVerrTftd] = useState(false);
    const [verrTfti, setVerrTfti] = useState(false);
    const [verrEvcp, setVerrEvcp] = useState(false);
    const [verrDrf, setVerrDrf] = useState(false);
    const [verrBhiapc, setVerrBhiapc] = useState(false);
    const [verrMp, setVerrMp] = useState(false);
    const [verrDa, setVerrDa] = useState(false);
    const [verrDp, setVerrDp] = useState(false);
    const [verrEiafnc, setVerrEiafnc] = useState(false);
    const [verrSad, setVerrSad] = useState(false);
    const [verrSdr, setVerrSdr] = useState(false);
    const [verrSe, setVerrSe] = useState(false);
    const [verrNote, setVerrNote] = useState(false);

    const [bilanActifData, setBilanActifData] = useState([]);
    const [bilanPassifData, setBilanPassifData] = useState([]);
    const [crnData, setCrnData] = useState([]);
    const [crfData, setCrfData] = useState([]);
    const [tftdData, setTftdData] = useState([]);
    const [tftiData, setTftiData] = useState([]);
    const [evcpData, setEvcpData] = useState([]);
    const [drfData, setDrfData] = useState([]);
    const [bhiapcData, setBhiapcData] = useState([]);
    const [mpData, setMpData] = useState([]);
    const [daData, setDaData] = useState([]);
    const [dpData, setDpData] = useState([]);
    const [eiafncData, setEiafncData] = useState([]);
    const [sadData, setSadData] = useState([]);
    const [sdrData, setSdrData] = useState([]);
    const [seData, setSeData] = useState([]);
    const [neData, setNeData] = useState([]);

    const [showTableRefresh, setShowTableRefresh] = useState(false);
    const [tableToRefresh, setTableToRefresh] = useState('');
    const [msgRefresh, setMsgRefresh] = useState('');

    const [showFormBHIAPC, setShowFormBHIAPC] = useState(false);
    const [rowToModifyBHIAPC, setRowToModifyBHIAPC] = useState(false);
    const [choixActionBHIAPC, setChoixActionBHIAPC] = useState('');

    const [showFormMP, setShowFormMP] = useState(false);
    const [rowToModifyMP, setRowToModifyMP] = useState(false);
    const [choixActionMP, setChoixActionMP] = useState('');

    const [showFormDA, setShowFormDA] = useState(false);
    const [rowToModifyDA, setRowToModifyDA] = useState(false);
    const [choixActionDA, setChoixActionDA] = useState('');

    const [showFormDP, setShowFormDP] = useState(false);
    const [rowToModifyDP, setRowToModifyDP] = useState(false);
    const [choixActionDP, setChoixActionDP] = useState('');

    const [showFormEIAFNC, setShowFormEIAFNC] = useState(false);
    const [rowToModifyEIAFNC, setRowToModifyEIAFNC] = useState(false);
    const [choixActionEIAFNC, setChoixActionEIAFNC] = useState('');

    const [showFormSAD, setShowFormSAD] = useState(false);
    const [rowToModifySAD, setRowToModifySAD] = useState(false);
    const [choixActionSAD, setChoixActionSAD] = useState('');

    const [showFormSDR, setShowFormSDR] = useState(false);
    const [rowToModifySDR, setRowToModifySDR] = useState(false);
    const [choixActionSDR, setChoixActionSDR] = useState('');

    const [showFormSE, setShowFormSE] = useState(false);
    const [rowToModifySE, setRowToModifySE] = useState(false);
    const [choixActionSE, setChoixActionSE] = useState('');

    const [showFormNE, setShowFormNE] = useState(false);
    const [rowToModifyNE, setRowToModifyNE] = useState(false);
    const [choixActionNE, setChoixActionNE] = useState('');

    const [confirmDeleteOneRow, setConfirmDeleteOneRow] = useState(false);
    const [infoRowToDelete, setInfoRowToDelete] = useState({ id: 0, tableau: '' });
    const [tableauToDeleteAllRow, setTableauToDeleteAllRow] = useState('');
    const [confirmDeleteAllRow, setConfirmDeleteAllRow] = useState(false);

    const [updateCalculEtatfinancier, setUpdateCalculEtatfinancier] = useState(false);

    const theme = useTheme();

    //données actionnaires
    const associeColumn = [
        {
            id: 'nom',
            label: 'Associés / actionnaires',
            minWidth: 500,
            align: 'left',
            //format: (value) => value.toLocaleString('en-US'),
        },
        {
            id: 'nbrpart',
            label: 'Nbr part.',
            minWidth: 150,
            align: 'right',
        },
        {
            id: 'adresse',
            label: 'Adresse',
            minWidth: 800,
            align: 'left',
        },
    ];

    //données domiciliations bancaires
    const domBankColumn = [
        {
            id: 'banque',
            label: 'Nom de la banque',
            minWidth: 400,
            align: 'left',
        },
        {
            id: 'numcompte',
            label: 'N° de compte',
            minWidth: 350,
            align: 'left',
        },
        {
            id: 'devise',
            label: 'Devise',
            minWidth: 100,
            align: 'left',
        },
        {
            id: 'tablepays.nompays',
            label: 'Pays',
            minWidth: 350,
            align: 'left',
        },
    ];

    //colonne bilan
    const BilanActifColumn = [
        {
            id: 'rubriquesmatrix.libelle',
            label: 'Actif',
            minWidth: 500,
            align: 'left',
            //format: (value) => value.toLocaleString('en-US'),
            isNumber: false
        },
        {
            id: 'note',
            label: 'Note',
            minWidth: 100,
            align: 'left',
            isNumber: false
        },
        {
            id: 'montantbrut',
            label: 'Montant brut',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'montantamort',
            label: 'Amort. / perte val.',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'montantnet',
            label: 'Montant net N',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'montantnetn1',
            label: 'Montant net N-1',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
    ];

    const BilanPassifColumn = [
        {
            id: 'rubriquesmatrix.libelle',
            label: 'Capitaux propres et passifs',
            minWidth: 700,
            align: 'left',
            //format: (value) => value.toLocaleString('en-US'),
            isNumber: false
        },
        {
            id: 'note',
            label: 'Note',
            minWidth: 100,
            align: 'left',
            isNumber: false
        },
        {
            id: 'montantnet',
            label: 'Montant net N',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'montantnetn1',
            label: 'Montant net N-1',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
    ];

    const crnColumn = [
        {
            id: 'rubriquesmatrix.libelle',
            label: 'Rubriques',
            minWidth: 700,
            align: 'left',
            //format: (value) => value.toLocaleString('en-US'),
            isNumber: false
        },
        {
            id: 'note',
            label: 'Note',
            minWidth: 100,
            align: 'left',
            isNumber: false
        },
        {
            id: 'montantnet',
            label: 'Montant net N',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'montantnetn1',
            label: 'Montant net N-1',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
    ];

    const tftdColumn = [
        {
            id: 'rubriquesmatrix.libelle',
            label: 'Rubriques',
            minWidth: 700,
            align: 'left',
            //format: (value) => value.toLocaleString('en-US'),
            isNumber: false
        },
        {
            id: 'note',
            label: 'Note',
            minWidth: 100,
            align: 'left',
            isNumber: false
        },
        {
            id: 'senscalcul',
            label: 'Sens',
            minWidth: 80,
            align: 'center',
            isNumber: false
        },
        {
            id: 'montantnet',
            label: 'Montant net N',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'montantnetn1',
            label: 'Montant net N-1',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
    ];

    const evcpColumn = [
        {
            id: 'rubriquesmatrix.libelle',
            label: 'Rubriques',
            minWidth: 300,
            align: 'left',
            //format: (value) => value.toLocaleString('en-US'),
            isNumber: false
        },
        {
            id: 'note',
            label: 'Note',
            minWidth: 100,
            align: 'left',
            isNumber: false
        },
        {
            id: 'capitalsocial',
            label: 'Capital social A6',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'primereserve',
            label: 'Capital prime & res. B6',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'ecartdevaluation',
            label: "Ecart d'évaluation C6",
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'resultat',
            label: "Résultat D6",
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'report_anouveau',
            label: "Report à nouveau E6",
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
        {
            id: 'total_varcap',
            label: "Total A6+B6+C6+D6+E6",
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
    ];

    const drfColumn = [
        {
            id: 'rubriquesmatrix.libelle',
            label: 'Rubriques',
            minWidth: 700,
            align: 'left',
            //format: (value) => value.toLocaleString('en-US'),
            isNumber: false
        },
        {
            id: 'note',
            label: 'Note',
            minWidth: 100,
            align: 'left',
            isNumber: false
        },
        {
            id: 'signe',
            label: 'Signe',
            minWidth: 75,
            align: 'center',
            isNumber: false
        },
        {
            id: 'montant_brut',
            label: 'Montant',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isNumber: true
        },
    ];

    const bhiapcColumn = [
        {
            id: 'nif',
            label: 'Nif',
            minWidth: 200,
            align: 'left',
            isnumber: false
        },
        {
            id: 'raison_sociale',
            label: 'Raison sociale',
            minWidth: 450,
            align: 'left',
            isnumber: false
        },
        {
            id: 'adresse',
            label: 'Adresse',
            minWidth: 450,
            align: 'left',
            isnumber: false
        },
        {
            id: 'montant_charge',
            label: 'Montant charge',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
        {
            id: 'montant_beneficiaire',
            label: 'Montant bénéf.',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
    ];

    const mpColumn = [
        {
            id: 'marche',
            label: 'Marché',
            minWidth: 100,
            align: 'left',
            isnumber: false
        },
        {
            id: 'ref_marche',
            label: 'Référence du marché',
            minWidth: 500,
            align: 'left',
            isnumber: false
        },
        {
            id: 'date',
            label: 'Date du marché',
            minWidth: 150,
            align: 'center',
            format: (value) => {
                if (value) {
                    const date = new Date(value);
                    return date.toLocaleDateString('fr-FR');  // Format date en dd/mm/yyyy
                }
                return '';
            },
            isnumber: false
        },
        {
            id: 'date_paiement',
            label: 'Date paiement',
            minWidth: 150,
            align: 'center',
            format: (value) => {

                return new Date(value).toLocaleDateString('fr-FR');  // Format date en dd/mm/yyyy

            },
            isnumber: false
        },
        {
            id: 'montant_marche_ht',
            label: 'Montant marché HT',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
        {
            id: 'montant_paye',
            label: 'Montant payé',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
        {
            id: 'tmp',
            label: 'TMP',
            minWidth: 200,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isnumber: true
        },
    ];

    const daColumn = [
        {
            id: 'rubriques_poste',
            label: 'Groupe',
            minWidth: 250,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: false,
            isnumber: false
        },
        {
            id: 'libelle',
            label: 'Designation',
            minWidth: 400,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'num_compte',
            label: 'N° compte',
            minWidth: 120,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'date_acquisition',
            label: 'Date acquis.',
            minWidth: 120,
            align: 'center',
            format: (value) => {
                if (value) {
                    const date = new Date(value);
                    return date.toLocaleDateString('fr-FR');  // Format date en dd/mm/yyyy
                }
                return '';
            },
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'taux',
            label: 'Taux',
            minWidth: 60,
            align: 'right',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'valeur_acquisition',
            label: 'Valeur acquis. (A)',
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'augmentation',
            label: 'Augmentation (B)',
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'diminution',
            label: 'Diminution (C)',
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'amort_anterieur',
            label: "Amort. cumulés en début d'exercice (D)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'dotation_exercice',
            label: "Dot. exercice (E)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'amort_cumule',
            label: "Amort. cumulés en fin d'exercice (F) = (D)+(E)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'valeur_nette',
            label: "valeur nette comptable (G) = (A)+(B)-(C)-(F)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
    ];

    const dpColumn = [
        {
            id: 'nature_prov',
            label: 'Nature',
            minWidth: 300,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: false,
            isnumber: false
        },
        {
            id: 'libelle',
            label: 'Provisions',
            minWidth: 500,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'montant_debut_ex',
            label: 'Montant début exercice (A)',
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'augm_dot_ex',
            label: "Augmentation dot. de l'exercice (B)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'dim_repr_ex',
            label: "Diminution reprise de l'exercice (C)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'montant_fin',
            label: "Montant fin exercice (D) = (A)+(B)-(C)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
    ];

    const eiafncColumn = [
        {
            id: 'rubriques_poste',
            label: 'Nature',
            minWidth: 300,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: false,
            isnumber: false
        },
        {
            id: 'num_compte',
            label: 'N° compte',
            minWidth: 150,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'libelle',
            label: 'Libellé',
            minWidth: 450,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'valeur_acquisition',
            label: "valeur brut début de l'exercice (A)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'augmentation',
            label: "Augmentation de l'exercice (B)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'diminution',
            label: "Diminution de l'exercice (C)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'valeur_brute',
            label: "val. brut clôture (D) = (A)+(B)-(C)",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
    ];

    const sadColumn = [
        {
            id: 'libelle',
            label: 'Constitution / Imputation',
            minWidth: 200,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel:true,
            isNumber: false
        },
        {
            id: 'n6',
            label: "N-6",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n5',
            label: "N-5",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n4',
            label: "N-4",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n3',
            label: "N-3",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n2',
            label: "N-2",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n1',
            label: "N-1",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n',
            label: "N",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'total_imputation',
            label: "Total imputation",
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
    ];

    const sdrColumn = [
        {
            id: 'libelle',
            label: 'Constitution / Imputation',
            minWidth: 350,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel:true,
            isNumber: false
        },
        {
            id: 'n6',
            label: "N-6",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n5',
            label: "N-5",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n4',
            label: "N-4",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n3',
            label: "N-3",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n2',
            label: "N-2",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'n1',
            label: "N-1",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'exercice',
            label: "Exercice",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'total',
            label: "Total",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'solde_imputable',
            label: "Solde imp. sur ex. ultérieur",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
        {
            id: 'solde_non_imputable',
            label: "Solde non imp. sur ex. ultérieur",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel:true,
            isNumber: true
        },
    ];

    const seColumn = [
        {
            id: 'liste_emprunteur',
            label: 'Emprunteurs',
            minWidth: 150,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'date_contrat',
            label: 'Date contrat',
            minWidth: 120,
            align: 'center',
            format: (value) => {
                if (value) {
                    const date = new Date(value);
                    return date.toLocaleDateString('fr-FR');  // Format date en dd/mm/yyyy
                }
                return '';
            },
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'duree_contrat',
            label: 'Durée contrat',
            minWidth: 100,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'montant_emprunt',
            label: "Montant emprunts (capital)",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'montant_interet',
            label: "Montant intérêts",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'montant_total',
            label: "Montant total",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'date_disposition',
            label: 'Date mise à disp.',
            minWidth: 120,
            align: 'center',
            format: (value) => {
                if (value) {
                    const date = new Date(value);
                    return date.toLocaleDateString('fr-FR');  // Format date en dd/mm/yyyy
                }
                return '';
            },
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'date_remboursement',
            label: 'Date de remboursement',
            minWidth: 120,
            align: 'center',
            format: (value) => {
                if (value) {
                    const date = new Date(value);
                    return date.toLocaleDateString('fr-FR');  // Format date en dd/mm/yyyy
                }
                return '';
            },
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'montant_rembourse_capital',
            label: "Montant remb. de la période (capital)",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'montant_rembourse_interet',
            label: "Montant remb. de la période (intérêts)",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
        {
            id: 'solde_non_rembourse',
            label: "Solde non remb. fin d'exercice",
            minWidth: 150,
            align: 'right',
            format: (value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            withSubTotal: true,
            sousgroupLabel: true,
            isnumber: true
        },
    ];

    const neColumn = [
        {
            id: 'tableau',
            label: 'Tableau',
            minWidth: 150,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'ref_note',
            label: 'Note',
            minWidth: 150,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
        {
            id: 'commentaires',
            label: 'Commentaires',
            minWidth: 1250,
            align: 'left',
            withSubTotal: false,
            sousgroupLabel: true,
            isnumber: false
        },
    ];

    //récupération infos de connexion
    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const compteId = decoded.UserInfo.compteId || null;
    const userId = decoded.UserInfo.userId || null;
    const navigate = useNavigate();

    //récupérer les informations du dossier sélectionné
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

    //Récupérer la liste des exercices
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

                recupRubriqueGlobal(compteId, id, exerciceNId[0].id);
                infosVerrouillage(compteId, id, exerciceNId[0].id);
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

    //Choix exercice
    const handleChangeExercice = (exercice_id) => {
        setSelectedExerciceId(exercice_id);
        setSelectedPeriodeChoiceId("0");
        setListeSituation(listeExercice?.filter((item) => item.id === exercice_id));
        setSelectedPeriodeId(exercice_id);

        recupRubriqueGlobal(compteId, fileId, exercice_id);
        infosVerrouillage(compteId, fileId, exercice_id);
    }

    //Choix période
    const handleChangePeriode = (choix) => {
        setSelectedPeriodeChoiceId(choix);

        if (choix === 0) {
            setListeSituation(listeExercice?.filter((item) => item.id === selectedExerciceId));
            setSelectedPeriodeId(selectedExerciceId);

            recupRubriqueGlobal(compteId, fileId, selectedExerciceId);
            infosVerrouillage(compteId, fileId, selectedExerciceId);
        } else if (choix === 1) {
            GetListeSituation(selectedExerciceId);
        }
    }

    //get information de vérouillage ou non des tableaus
    const infosVerrouillage = (compteId, fileId, exerciceId) => {
        axios.post(`/declaration/ebilan/infosVerrouillage`, { compteId, fileId, exerciceId }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setVerrBilan(resData.liste.find((item) => item.code === 'BILAN')?.valide);
                setVerrCrn(resData.liste.find((item) => item.code === 'CRN')?.valide);
                setVerrCrf(resData.liste.find((item) => item.code === 'CRF')?.valide);
                setVerrTftd(resData.liste.find((item) => item.code === 'TFTD')?.valide);
                setVerrTfti(resData.liste.find((item) => item.code === 'TFTI')?.valide);
                setVerrEvcp(resData.liste.find((item) => item.code === 'EVCP')?.valide);
                setVerrDrf(resData.liste.find((item) => item.code === 'DRF')?.valide);
                setVerrBhiapc(resData.liste.find((item) => item.code === 'BHIAPC')?.valide);
                setVerrMp(resData.liste.find((item) => item.code === 'MP')?.valide);
                setVerrDa(resData.liste.find((item) => item.code === 'DA')?.valide);
                setVerrDp(resData.liste.find((item) => item.code === 'DP')?.valide);
                setVerrEiafnc(resData.liste.find((item) => item.code === 'EIAFNC')?.valide);
                setVerrSad(resData.liste.find((item) => item.code === 'SAD')?.valide);
                setVerrSdr(resData.liste.find((item) => item.code === 'SDR')?.valide);
                setVerrSe(resData.liste.find((item) => item.code === 'SE')?.valide);
                setVerrNote(resData.liste.find((item) => item.code === 'NE')?.valide);

                //console.log(resData.liste.find((item) => item.code === 'NE'));
            } else {
                toast.error(resData.msg);
            }
        });
    }

    //get information de vérouillage ou non des tableaus
    const verrouillerTableau = (compteId, fileId, exerciceId, tableau, stateVerr) => {
        const verr = !stateVerr;
        axios.post(`/declaration/ebilan/verrouillerTableau`, { compteId, fileId, exerciceId, tableau, verr }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                infosVerrouillage(compteId, fileId, selectedPeriodeId);
            } else {
                toast.error(resData.msg);
            }
        });
    }

    const handleChange = (event) => {
        setValSelect(event.target.value);
    };

    const handleChangeTAB = (event, newValue) => {
        setValue(newValue);
    };

    //récupération data individual
    const recupRubriqueGlobal = (compteId, fileId, exerciceId) => {
        axios.post(`/declaration/ebilan/listeRubriqueGlobal`, { compteId, fileId, exerciceId }).then((response) => {
            const resData = response.data;
            if (resData.state) {
                setBilanActifData(resData.bilanActif);
                setBilanPassifData(resData.bilanPassif);
                setCrnData(resData.crn);
                setCrfData(resData.crf);
                setTftdData(resData.tftd);
                setTftiData(resData.tfti);
                setEvcpData(resData.evcp);
                setDrfData(resData.drf);
                setBhiapcData(resData.bhiapc);
                setMpData(resData.mp);
                setSadData(resData.sad);
                setSdrData(resData.sdr);
                setSeData(resData.se);
                setNeData(resData.ne);
                setDrfData(resData.drf);
                setBhiapcData(resData.bhiapc);
                setMpData(resData.mp);
                setSadData(resData.sad);
                setSdrData(resData.sdr);
                setSeData(resData.se);
                setNeData(resData.ne);

                const data = resData.da;
                const groupedData = data.reduce((acc, item) => {
                if (!acc[item.rubriques_poste]) {
                    acc[item.rubriques_poste] = [];
                }
                acc[item.rubriques_poste].push(item);
                return acc;
                }, {});
            
                // Transforme les données groupées en un tableau
                const groupedArray = Object.keys(groupedData).map(key => ({
                rubriques_poste: key,
                items: groupedData[key]
                }));

                const rows = groupedArray.sort((a, b) => {
                    if (a.rubriques_poste < b.rubriques_poste) {
                    return -1;  // a vient avant b
                    }
                    if (a.rubriques_poste > b.rubriques_poste) {
                    return 1;   // b vient avant a
                    }
                    return 0;  // a et b sont égaux
                });

                setDaData(rows);
                setDaData(rows);

                // //données pour DP
                const data2 = resData.dp;
                const groupedData2 = data2.reduce((acc, item) => {
                    if (!acc[item.nature_prov]) {
                    acc[item.nature_prov] = [];
                    }
                    acc[item.nature_prov].push(item);
                    return acc;
                }, {});
                
                // Transforme les données groupées en un tableau
                const groupedArray2 = Object.keys(groupedData2).map(key => ({
                    nature_prov: key,
                    items: groupedData2[key]
                }));

                const rows2 = groupedArray2.sort((a, b) => {
                    if (a.ordre < b.ordre) {
                    return -1;  // a vient avant b
                    }
                    if (a.ordre > b.ordre) {
                    return 1;   // b vient avant a
                    }
                    return 0;  // a et b sont égaux
                });

                setDpData(rows2);
                setDpData(rows2);

                // //données pour EIAFNC
                const data3 = resData.eiafnc;
                const groupedData3 = data3.reduce((acc, item) => {
                    if (!acc[item.rubriques_poste]) {
                    acc[item.rubriques_poste] = [];
                    }
                    acc[item.rubriques_poste].push(item);
                    return acc;
                }, {});
                
                // Transforme les données groupées en un tableau
                const groupedArray3 = Object.keys(groupedData3).map(key => ({
                    rubriques_poste: key,
                    items: groupedData3[key]
                }));

                const rows3 = groupedArray3.sort((a, b) => {
                    if (a.rubriques_poste < b.rubriques_poste) {
                    return -1;  // a vient avant b
                    }
                    if (a.rubriques_poste > b.rubriques_poste) {
                    return 1;   // b vient avant a
                    }
                    return 0;  // a et b sont égaux
                });

                setEiafncData(rows3);
            }else{
                toast.error(resData.msg);
            }
        });
    }

    //récupération data individual
    const recupRubriqueIndividual = (compteId, fileId, exerciceId, tableau) => {
        axios.post(`/declaration/ebilan/listeOneTable`, { compteId, fileId, exerciceId, tableau }).then((response) => {

            //console.log('Réponse complète:', response);
            const resData = response.data;
            if (resData.state) {
                switch (tableau) {
                    case 'BILAN':
                        setBilanActifData(resData.list1 ? resData.list1 : []);
                        setBilanPassifData(resData.list2 ? resData.list2 : []);
                        break;
                    case 'CRN':
                        setCrnData(resData.list1);
                        break;
                    case 'CRF':
                        setCrfData(resData.list1);
                        break;
                    case 'TFTD':
                        setTftdData(resData.list1);
                        break;
                    case 'TFTI':
                        setTftiData(resData.list1);
                        break;
                    case 'EVCP':
                        setEvcpData(resData.list1);
                        break;
                    case 'BHIAPC':
                        setBhiapcData(resData.list1);
                        break;
                    case 'DRF':
                        setDrfData(resData.list1);
                        break;
                    case 'MP':
                        setMpData(resData.list1);
                        break;
                    case 'DA': {
                        const data = resData.list1;
                        const groupedData = data.reduce((acc, item) => {
                            acc[item.rubriques_poste] = acc[item.rubriques_poste] || [];
                            acc[item.rubriques_poste].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(groupedData).map(([key, items]) => ({ rubriques_poste: key, items }))
                            .sort((a, b) => a.rubriques_poste.localeCompare(b.rubriques_poste));
                        setDaData(rows);
                        break;
                    }
                    case 'DP': {
                        const data = resData.list1;
                        const grouped = data.reduce((acc, item) => {
                            acc[item.nature_prov] = acc[item.nature_prov] || [];
                            acc[item.nature_prov].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(grouped).map(([key, items]) => ({ nature_prov: key, items }))
                            .sort((a, b) => a.nature_prov.localeCompare(b.nature_prov));
                        setDpData(rows);
                        break;
                    }
                    case 'EIAFNC': {
                        const data = resData.list1;
                        const grouped = data.reduce((acc, item) => {
                            acc[item.rubriques_poste] = acc[item.rubriques_poste] || [];
                            acc[item.rubriques_poste].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(grouped).map(([key, items]) => ({ rubriques_poste: key, items }))
                            .sort((a, b) => a.rubriques_poste.localeCompare(b.rubriques_poste));
                        setEiafncData(rows);
                        break;
                    }
                    case 'SAD':
                        setSadData(resData.list1);
                        break;
                    case 'SDR':
                        setSdrData(resData.list1);
                        break;
                    case 'SE':
                        setSeData(resData.list1);
                        break;
                    case 'NE':
                        setNeData(resData.list1);
                        break;
                    default:
                        console.warn("Tableau non reconnu :", tableau);
                }
            };

        }).catch((error) => {
            toast.error("Erreur lors de l'envoi des données");
            console.error(error);
        });
    };

    //Actualisation d'un tableau
    const ActivateTableCalcul = async (compteId, fileId, exerciceId, tableau, refreshTotal) => {
        try {
            const response = await axios.post(`/declaration/ebilan/activateCalcul`, { compteId, fileId, exerciceId, tableau, refreshTotal });
            const resData = response.data;

            if (resData.state) {
                switch (tableau) {
                    case 'BILAN':
                        setBilanActifData(resData.list1 ? resData.list1 : []);
                        setBilanPassifData(resData.list2 ? resData.list2 : []);
                        break;
                    case 'CRN':
                        setCrnData(resData.list1);
                        break;
                    case 'CRF':
                        setCrfData(resData.list1);
                        break;
                    case 'TFTD':
                        setTftdData(resData.list1);
                        break;
                    case 'TFTI':
                        setTftiData(resData.list1);
                        break;
                    case 'EVCP':
                        setEvcpData(resData.list1);
                        break;
                    case 'BHIAPC':
                        setBhiapcData(resData.list1);
                        break;
                    case 'DRF':
                        setDrfData(resData.list1);
                        break;
                    case 'MP':
                        setMpData(resData.list1);
                        break;
                    case 'DA': {
                        const data = resData.list1;
                        const groupedData = data.reduce((acc, item) => {
                            acc[item.rubriques_poste] = acc[item.rubriques_poste] || [];
                            acc[item.rubriques_poste].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(groupedData).map(([key, items]) => ({ rubriques_poste: key, items }))
                            .sort((a, b) => a.rubriques_poste.localeCompare(b.rubriques_poste));
                        setDaData(rows);
                        break;
                    }
                    case 'DP': {
                        const data = resData.list1;
                        const grouped = data.reduce((acc, item) => {
                            acc[item.nature_prov] = acc[item.nature_prov] || [];
                            acc[item.nature_prov].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(grouped).map(([key, items]) => ({ nature_prov: key, items }))
                            .sort((a, b) => a.nature_prov.localeCompare(b.nature_prov));
                        setDpData(rows);
                        break;
                    }
                    case 'EIAFNC': {
                        const data = resData.list1;
                        const grouped = data.reduce((acc, item) => {
                            acc[item.rubriques_poste] = acc[item.rubriques_poste] || [];
                            acc[item.rubriques_poste].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(grouped).map(([key, items]) => ({ rubriques_poste: key, items }))
                            .sort((a, b) => a.rubriques_poste.localeCompare(b.rubriques_poste));
                        setEiafncData(rows);
                        break;
                    }
                    case 'SAD':
                        setSadData(resData.list1);
                        break;
                    case 'SDR':
                        setSdrData(resData.list1);
                        break;
                    case 'SE':
                        setSeData(resData.list1);
                        break;
                    case 'NE':
                        setNeData(resData.list1);
                        break;
                    default:
                        console.warn("Tableau non reconnu :", tableau);
                }
                toast.success(resData.msg);
            } else {
                toast.error(resData.msg);
            }

            return resData; // optionnel
        } catch (error) {
            toast.error("Erreur lors de l’activation du calcul");
            console.error(error);
            throw error;
        }
    }

    const handleOpenDialogConfirmRefresh = () => {
        setShowTableRefresh(true);
    }

    const handleCloseDialogConfirmRefresh = () => {
        setShowTableRefresh(false);
    }

    //Refresh tableau
    const handleRefreshTable = async (value) => {
        if (value) {
            try {
                await ActivateTableCalcul(compteId, fileId, selectedPeriodeId, tableToRefresh, true);
            } catch (error) {
                console.error("Erreur lors du rafraîchissement :", error);
            } finally {
                handleCloseDialogConfirmRefresh();
            }
        } else {
            handleCloseDialogConfirmRefresh();
        }
    }

    //Mettre à jours les tableaux des états financiers après ajustement de montant
    useEffect(() => {
        if (updateCalculEtatfinancier.state) {
            setTableToRefresh(updateCalculEtatfinancier.tableName);
            ActivateTableCalcul(compteId, fileId, selectedPeriodeId, updateCalculEtatfinancier.tableName, false);
            setUpdateCalculEtatfinancier((prev) => ({
                ...prev,
                state: false
            })
            );
        }
    }, [updateCalculEtatfinancier.state]);

    //fonction standard suppresion d'une ligne d'un tableau
 const deleteOneRow = (value) => {
    if(value){
        const exerciceId = selectedPeriodeId;
        axios.post(`/declaration/ebilan/deleteTableOneRow`, {compteId, fileId, exerciceId, infoRowToDelete}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                const tableau = infoRowToDelete.tableau;

                switch (tableau) {
                    case 'BHIAPC':
                        setBhiapcData(resData.liste);
                        break;
                    case 'MP':
                        setMpData(resData.liste);
                        break;
                    case 'DA': {
                        const data = resData.liste;
                        const groupedData = data.reduce((acc, item) => {
                            acc[item.rubriques_poste] = acc[item.rubriques_poste] || [];
                            acc[item.rubriques_poste].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(groupedData).map(([key, items]) => ({ rubriques_poste: key, items }))
                            .sort((a, b) => a.rubriques_poste.localeCompare(b.rubriques_poste));
                        setDaData(rows);
                        break;
                    }
                    case 'DP': {
                        const data = resData.liste;
                        const grouped = data.reduce((acc, item) => {
                            acc[item.nature_prov] = acc[item.nature_prov] || [];
                            acc[item.nature_prov].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(grouped).map(([key, items]) => ({ nature_prov: key, items }))
                            .sort((a, b) => a.nature_prov.localeCompare(b.nature_prov));
                        setDpData(rows);
                        break;
                    }
                    case 'EIAFNC': {
                        const data = resData.liste;
                        const grouped = data.reduce((acc, item) => {
                            acc[item.rubriques_poste] = acc[item.rubriques_poste] || [];
                            acc[item.rubriques_poste].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(grouped).map(([key, items]) => ({ rubriques_poste: key, items }))
                            .sort((a, b) => a.rubriques_poste.localeCompare(b.rubriques_poste));
                        setEiafncData(rows);
                        break;
                    }
                    case 'SE':
                        setSeData(resData.liste);
                        break;
                    case 'NE':
                        setNeData(resData.liste);
                        break;
                    default:
                        console.warn("Tableau non reconnu :", tableau);
                }

                toast.success(resData.msg);
                setConfirmDeleteOneRow(false);
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        setConfirmDeleteOneRow(false);
    }
 }

 //fonction standard suppresion d'une ligne d'un tableau
 const deleteAllRow = (value) => {
    if(value){
        const exerciceId = selectedPeriodeId;
        axios.post(`/declaration/ebilan/deleteTableAllRow`, {compteId, fileId, exerciceId, tableauToDeleteAllRow}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                switch (tableauToDeleteAllRow) {
                    case 'BHIAPC':
                        setBhiapcData(resData.liste);
                        break;
                    case 'MP':
                        setMpData(resData.liste);
                        break;
                    case 'DA': {
                        const data = resData.liste;
                        const groupedData = data.reduce((acc, item) => {
                            acc[item.rubriques_poste] = acc[item.rubriques_poste] || [];
                            acc[item.rubriques_poste].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(groupedData).map(([key, items]) => ({ rubriques_poste: key, items }))
                            .sort((a, b) => a.rubriques_poste.localeCompare(b.rubriques_poste));
                        setDaData(rows);
                        break;
                    }
                    case 'DP': {
                        const data = resData.liste;
                        const grouped = data.reduce((acc, item) => {
                            acc[item.nature_prov] = acc[item.nature_prov] || [];
                            acc[item.nature_prov].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(grouped).map(([key, items]) => ({ nature_prov: key, items }))
                            .sort((a, b) => a.nature_prov.localeCompare(b.nature_prov));
                        setDpData(rows);
                        break;
                    }
                    case 'EIAFNC': {
                        const data = resData.liste;
                        const grouped = data.reduce((acc, item) => {
                            acc[item.rubriques_poste] = acc[item.rubriques_poste] || [];
                            acc[item.rubriques_poste].push(item);
                            return acc;
                        }, {});
                        const rows = Object.entries(grouped).map(([key, items]) => ({ rubriques_poste: key, items }))
                            .sort((a, b) => a.rubriques_poste.localeCompare(b.rubriques_poste));
                        setEiafncData(rows);
                        break;
                    }
                    case 'SE':
                        setSeData(resData.liste);
                        break;
                    case 'NE':
                        setNeData(resData.liste);
                        break;
                    default:
                        console.warn("Tableau non reconnu :", tableau);
                }
                toast.success(resData.msg);
                setConfirmDeleteAllRow(false);
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        setConfirmDeleteAllRow(false);
    }
 }

//===========================================================================================
//TABLEAU BILAN
//===========================================================================================

//choix affichage tableau bilan (Actif ou passif = actif à l'ouverture)
const choixAffichageBilan = (choix) =>{
    setShowBilan(choix);

    if(choix === 'actif'){
            setButtonActifVariant('contained');
            setButtonPassifVariant('outlined');
    }else{
            setButtonActifVariant('outlined');
            setButtonPassifVariant('contained');
    }
}

//refresh table BILAN
const refreshBILAN = () => {
    setTableToRefresh('BILAN');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau du Bilan?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau de BILAN
const lockTableBILAN = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'BILAN', verrBilan);
    setVerrBilan(!verrBilan);
}

//===========================================================================================
//TABLEAU CRN
//===========================================================================================
//===========================================================================================
//TABLEAU CRN
//===========================================================================================

//refresh table CRN
const refreshCRN = () => {
    setTableToRefresh('CRN');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau CRN?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau de CRN
const lockTableCRN = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'CRN', verrCrn);
    setVerrCrn(!verrCrn);
}

//===========================================================================================
//TABLEAU CRF
//===========================================================================================
//===========================================================================================
//TABLEAU CRF
//===========================================================================================

//refresh table CRF
const refreshCRF = () => {
    setTableToRefresh('CRF');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau CRF?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau de CRF
const lockTableCRF = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'CRF', verrCrf);
    setVerrCrf(!verrCrf);
}

//===========================================================================================
//TABLEAU TFTD
//===========================================================================================
//===========================================================================================
//TABLEAU TFTD
//===========================================================================================

//refresh table TFTD
const refreshTFTD = () => {
    setTableToRefresh('TFTD');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau TFTD?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau de TFTD
const lockTableTFTD = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'TFTD', verrTftd);
    setVerrTftd(!verrTftd);
}

//===========================================================================================
//TABLEAU TFTI
//===========================================================================================
//===========================================================================================
//TABLEAU TFTI
//===========================================================================================

//refresh table TFTI
const refreshTFTI = () => {
    setTableToRefresh('TFTI');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau TFTI?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau de TFTI
const lockTableTFTI = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'TFTI', verrTfti);
    setVerrTfti(!verrTfti);
}

//===========================================================================================
//TABLEAU EVCP
//===========================================================================================
//===========================================================================================
//TABLEAU EVCP
//===========================================================================================

//refresh table EVCP
const refreshEVCP = () => {
    setTableToRefresh('EVCP');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau EVCP?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau EVCP
const lockTableEVCP = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'EVCP', verrEvcp);
    setVerrEvcp(!verrEvcp);
}

//===========================================================================================
//TABLEAU DRF
//===========================================================================================

//refresh table DRF
const refreshDRF = () => {
    setTableToRefresh('DRF');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau DRF?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau de DRF
const lockTableDRF = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'DRF', verrDrf);
    setVerrDrf(!verrDrf);
}

//===========================================================================================
//TABLEAU BHIAPC
//===========================================================================================

//refresh table BHIAPC
const refreshBHIAPC = () => {
    setTableToRefresh('BHIAPC');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau BHIAPC?`);
    handleOpenDialogConfirmRefresh();
}

const AddOrModifyRowBHIAPC = (formData) => {
    if(formData.state){
        const exerciceId = selectedPeriodeId;
        const tableau = 'BHIAPC';
        axios.post(`/declaration/ebilan/addmodifyTableau`, {compteId, fileId, exerciceId, tableau, formData}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                setBhiapcData(resData.liste);
                toast.success(resData.msg);
                handleCloseFormBHIAPC();
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        handleCloseFormBHIAPC();
    }
 }

    const handleOpenFormBHIAPC = () => {
        setShowFormBHIAPC(true);
    }

 const handleCloseFormBHIAPC = () => {
    setShowFormBHIAPC(false);
 }

    //supprimer une ligne de BHIAPC
    const deleteOneRowBHIAPC = (row) => {
        if (row.id > 0) {
            setInfoRowToDelete({ id: row.id, tableau: 'BHIAPC' });
            setConfirmDeleteOneRow(true);
        } else {
            setConfirmDeleteOneRow(false);
        }
    }

    //supprimer toutes les lignes BHIAPC
    const deleteAllRowBHIAPC = () => {
        setTableauToDeleteAllRow('BHIAPC');
        setConfirmDeleteAllRow(true);
    }

    //ajouter une nouvelle ligne dans la table BHIAPC
    const handleAddNewRowBHIAPC = () => {
        setChoixActionBHIAPC('Ajout');
        setRowToModifyBHIAPC(
            {
                state: false,
                id: -1,
                nif: '',
                raisonsociale: '',
                adresse: '',
                montantcharge: '',
                montantbeneficiaire: ''
            }
        );
        handleOpenFormBHIAPC();
    }

    //modification d'une ligne de BHIAPC
    const modifyRowBHIAPC = (row) => {
        setRowToModifyBHIAPC(row);
        setChoixActionBHIAPC('Modification');
        handleOpenFormBHIAPC();
    }

    //verouiller ou non le tableau de BHIAPC
    const lockTableBHIAPC = () => {
        verrouillerTableau(compteId, fileId, selectedPeriodeId, 'BHIAPC', verrBhiapc);
        setVerrBhiapc(!verrBhiapc);
    }

//===========================================================================================
//TABLEAU MP
//===========================================================================================

//refresh table MP
const refreshMP = () => {
    setTableToRefresh('MP');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau MP?`);
    handleOpenDialogConfirmRefresh();
}

//ajouter une nouvelle ligne dans la table MP
 const handleOpenFormMP = () => {
    setShowFormMP(true);
 }

    const handleCloseFormMP = () => {
        setShowFormMP(false);
    }

    const handleAddNewRowMP = () => {
        setChoixActionMP('Ajout');
        setRowToModifyMP(
            {
                state: false,
                id: -1,
                marche: '',
                refmarche: '',
                date: '',
                datepaiement: '',
                montantht: 0,
                montantpaye: 0,
                montanttmp: 0,
            }
        );
        handleOpenFormMP();
    }

    //supprimer toutes les lignes MP
    const deleteAllRowMP = () => {
        setTableauToDeleteAllRow('MP');
        setConfirmDeleteAllRow(true);
    }

 const AddOrModifyRowMP = (formData) => {
    if(formData.state){
        const exerciceId = selectedPeriodeId;
        const tableau = 'MP';
        axios.post(`/declaration/ebilan/addmodifyTableau`, {compteId, fileId, exerciceId, tableau, formData}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                setMpData(resData.liste);
                handleCloseFormMP();
                toast.success(resData.msg);
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        handleCloseFormMP();
    }
 }

    //modification d'une ligne de MP
    const modifyRowMP = (row) => {
        setRowToModifyMP(row);
        setChoixActionMP('Modification');
        handleOpenFormMP();
    }

    //supprimer une ligne de MP
    const deleteOneRowMP = (row) => {
        if (row.id > 0) {
            setInfoRowToDelete({ id: row.id, tableau: 'MP' });
            setConfirmDeleteOneRow(true);
        } else {
            setConfirmDeleteOneRow(false);
        }
    }

    //verouiller ou non le tableau de MP
    const lockTableMP = () => {
        verrouillerTableau(compteId, fileId, selectedPeriodeId, 'MP', verrMp);
        setVerrMp(!verrMp);
    }

//===========================================================================================
//TABLEAU DA
//===========================================================================================

//ajouter une nouvelle ligne dans la table DA
 const handleOpenFormDA = () => {
    setShowFormDA(true);
 }

    const handleCloseFormDA = () => {
        setShowFormDA(false);
    }

 const handleAddNewRowDA = () => {
    setChoixActionDA('Ajout');
    setRowToModifyDA(
        {
            state: false,
            id: -1,
            rubriques_poste: '',
            libelle: '',
            num_compte: '',
            date_acquisition: '',
            taux: 0,
            valeur_acquisition: 0,
            augmentation: 0,
            diminution: 0,
            amort_anterieur: 0,
            dotation_exercice: 0,
            amort_cumule: 0,
            valeur_nette: 0
        }
    );
    handleOpenFormDA();
 }

 const AddOrModifyRowDA = (formData) => {
    if(formData.state){
        const exerciceId = selectedPeriodeId;
        const tableau = 'DA';
        axios.post(`/declaration/ebilan/addmodifyTableau`, {compteId, fileId, exerciceId, tableau, formData}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                const data = resData.liste;
                const groupedData = data.reduce((acc, item) => {
                if (!acc[item.rubriques_poste]) {
                    acc[item.rubriques_poste] = [];
                }
                acc[item.rubriques_poste].push(item);
                return acc;
                }, {});
            
                // Transforme les données groupées en un tableau
                const groupedArray = Object.keys(groupedData).map(key => ({
                rubriques_poste: key,
                items: groupedData[key]
                }));

                const rows = groupedArray.sort((a, b) => {
                    if (a.rubriques_poste < b.rubriques_poste) {
                    return -1;  // a vient avant b
                    }
                    if (a.rubriques_poste > b.rubriques_poste) {
                    return 1;   // b vient avant a
                    }
                    return 0;  // a et b sont égaux
                });

                setDaData(rows);
                handleCloseFormDA();
                toast.success(resData.msg);
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        handleCloseFormDA();
    }
 }

    //modification d'une ligne de DA
    const modifyRowDA = (row) => {
        setRowToModifyDA(row);
        setChoixActionDA('Modification');
        handleOpenFormDA();
    }

 //supprimer une ligne de DA
 const deleteOneRowDA = (row) => {
    if(row.id > 0){
        setInfoRowToDelete({id: row.id, tableau:'DA'});
        setConfirmDeleteOneRow(true);
    }else{
        setConfirmDeleteOneRow(false);
    }
 }

 //supprimer toutes les lignes DA
 const deleteAllRowDA = () => {
    setTableauToDeleteAllRow('DA');
    setConfirmDeleteAllRow(true);
 }

    //verouiller ou non le tableau de DA
    const lockTableDA = () => {
        verrouillerTableau(compteId, fileId, selectedPeriodeId, 'DA', verrDa);
        setVerrDa(!verrDa);
    }

//===========================================================================================
//TABLEAU DP
//===========================================================================================

//refresh table DP
const refreshDP = () => {
    setTableToRefresh('DP');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau DP?`);
    handleOpenDialogConfirmRefresh();
}

//ajouter une nouvelle ligne dans la table DP (pour les natures autres provisions seulement)
 const handleOpenFormDP = () => {
    setShowFormDP(true);
 }

    const handleCloseFormDP = () => {
        setShowFormDP(false);
    }

    const handleAddNewRowDP = () => {
        setChoixActionDP('Ajout');
        setRowToModifyDP(
            {
                state: false,
                id: -1,
                nature_prov: 'AUTRE',
                libelle: '',
                type_calcul: '',
                montant_debut_ex: 0,
                augm_dot_ex: 0,
                dim_repr_ex: 0,
                montant_fin: 0,
            }
        );
        handleOpenFormDP();
    }

    //supprimer toutes les lignes autres provisions du tableau DP
    const deleteAllRowDP = () => {
        setTableauToDeleteAllRow('DP');
        setConfirmDeleteAllRow(true);
    }

 const AddOrModifyRowDP = (formData) => {
    if(formData.state){
        const exerciceId = selectedPeriodeId;
        const tableau = 'DP';
        axios.post(`/declaration/ebilan/addmodifyTableau`, {compteId, fileId, exerciceId, tableau, formData}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                const data2 = resData.liste;
                const groupedData2 = data2.reduce((acc, item) => {
                    if (!acc[item.nature_prov]) {
                    acc[item.nature_prov] = [];
                    }
                    acc[item.nature_prov].push(item);
                    return acc;
                }, {});
                
                // Transforme les données groupées en un tableau
                const groupedArray2 = Object.keys(groupedData2).map(key => ({
                    nature_prov: key,
                    items: groupedData2[key]
                }));

                const rows2 = groupedArray2.sort((a, b) => {
                    if (a.ordre < b.ordre) {
                    return 1;  // a vient avant b
                    }
                    if (a.ordre > b.ordre) {
                    return -1;   // b vient avant a
                    }
                    return 0;  // a et b sont égaux
                });

                setDpData(rows2);
                handleCloseFormDP();
                toast.success(resData.msg);
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        handleCloseFormDP();
    }
 }

    //modification d'une ligne de DP
    const modifyRowDP = (row) => {
        setRowToModifyDP(row);
        setChoixActionDP('Modification');
        handleOpenFormDP();
    }

    //supprimer une ligne de DP
    const deleteOneRowDP = (row) => {
        if (row.id > 0) {
            setInfoRowToDelete({ id: row.id, tableau: 'DP' });
            setConfirmDeleteOneRow(true);
        } else {
            setConfirmDeleteOneRow(false);
        }
    }

    //verouiller ou non le tableau de DP
    const lockTableDP = () => {
        verrouillerTableau(compteId, fileId, selectedPeriodeId, 'DP', verrDp);
        setVerrDp(!verrDp);
    }

//===========================================================================================
//TABLEAU EIAFNC
//===========================================================================================

//refresh table EIAFNC
const refreshEIAFNC = () => {
    // setTableToRefresh('EIAFNC');
    // setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau EIAFNC?`);
    // handleOpenDialogConfirmRefresh();
}

//ajouter une nouvelle ligne dans la table EIAFNC
 const handleOpenFormEIAFNC = () => {
    setShowFormEIAFNC(true);
 }

    const handleCloseFormEIAFNC = () => {
        setShowFormEIAFNC(false);
    }

    const handleAddNewRowEIAFNC = () => {
        setChoixActionEIAFNC('Ajout');
        setRowToModifyEIAFNC(
            {
                state: false,
                id: -1,
                rubriques_poste: '',
                num_compte: '',
                libelle: '',
                valeur_acquisition: 0,
                augmentation: 0,
                diminution: 0,
                valeur_brute: 0,
            }
        );
        handleOpenFormEIAFNC();
    }

    //supprimer toutes les lignes autres provisions du tableau EIAFNC
    const deleteAllRowEIAFNC = () => {
        setTableauToDeleteAllRow('EIAFNC');
        setConfirmDeleteAllRow(true);
    }

 const AddOrModifyRowEIAFNC = (formData) => {
    if(formData.state){
        const exerciceId = selectedPeriodeId;
        const tableau = 'EIAFNC';
        axios.post(`/declaration/ebilan/addmodifyTableau`, {compteId, fileId, exerciceId, tableau, formData}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                const data3 = resData.liste;
                const groupedData3 = data3.reduce((acc, item) => {
                    if (!acc[item.rubriques_poste]) {
                    acc[item.rubriques_poste] = [];
                    }
                    acc[item.rubriques_poste].push(item);
                    return acc;
                }, {});
                
                // Transforme les données groupées en un tableau
                const groupedArray3 = Object.keys(groupedData3).map(key => ({
                    rubriques_poste: key,
                    items: groupedData3[key]
                }));

                const rows3 = groupedArray3.sort((a, b) => {
                    if (a.rubriques_poste < b.rubriques_poste) {
                    return -1;  // a vient avant b
                    }
                    if (a.rubriques_poste > b.rubriques_poste) {
                    return 1;   // b vient avant a
                    }
                    return 0;  // a et b sont égaux
                });

                setEiafncData(rows3);
                handleCloseFormEIAFNC();
                toast.success(resData.msg);
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        handleCloseFormEIAFNC();
    }
 }

    //modification d'une ligne de EIAFNC
    const modifyRowEIAFNC = (row) => {
        setRowToModifyEIAFNC(row);
        setChoixActionEIAFNC('Modification');
        handleOpenFormEIAFNC();
    }

    //supprimer une ligne de EIAFNC
    const deleteOneRowEIAFNC = (row) => {
        if (row.id > 0) {
            setInfoRowToDelete({ id: row.id, tableau: 'EIAFNC' });
            setConfirmDeleteOneRow(true);
        } else {
            setConfirmDeleteOneRow(false);
        }
    }

    //verouiller ou non le tableau de EIAFNC
    const lockTableEIAFNC = () => {
        verrouillerTableau(compteId, fileId, selectedPeriodeId, 'EIAFNC', verrEiafnc);
        setVerrEiafnc(!verrEiafnc);
    }

//===========================================================================================
//TABLEAU SAD
//===========================================================================================

//refresh table SAD
const refreshSAD = () => {
    setTableToRefresh('SAD');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau SAD?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau de SAD
 const lockTableSAD = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'SAD', verrSad);
    setVerrSad(!verrSad);
 }

//===========================================================================================
//TABLEAU SDR
//===========================================================================================

//refresh table SDR
const refreshSDR = () => {
    setTableToRefresh('SDR');
    setMsgRefresh(`Voulez-vous vraiment actualiser les calculs pour le tableau SDR?`);
    handleOpenDialogConfirmRefresh();
}

//verouiller ou non le tableau de SDR
 const lockTableSDR = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'SDR', verrSdr);
    setVerrSdr(!verrSdr);
 }

//===========================================================================================
//TABLEAU SE
//===========================================================================================

//ajouter une nouvelle ligne dans la table SE
 const handleOpenFormSE = () => {
    setShowFormSE(true);
 }

    const handleCloseFormSE = () => {
        setShowFormSE(false);
    }

    const handleAddNewRowSE = () => {
        setChoixActionSE('Ajout');
        setRowToModifySE(
            {
                state: false,
                id: -1,
                liste_emprunteur: '',
                date_contrat: '',
                duree_contrat: '',
                montant_emprunt: 0,
                montant_interet: 0,
                montant_total: 0,
                date_disposition: '',
                montant_rembourse_capital: 0,
                montant_rembourse_interet: 0,
                solde_non_rembourse: 0,
                date_remboursement: '',
            }
        );
        handleOpenFormSE();
    }

    //supprimer toutes les lignes autres provisions du tableau SE
    const deleteAllRowSE = () => {
        setTableauToDeleteAllRow('SE');
        setConfirmDeleteAllRow(true);
    }

 const AddOrModifyRowSE = (formData) => {
    if(formData.state){
        const exerciceId = selectedPeriodeId;
        const tableau = 'SE';
        axios.post(`/declaration/ebilan/addmodifyTableau`, {compteId, fileId, exerciceId, tableau, formData}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                setSeData(resData.liste);
                handleCloseFormSE();
                toast.success(resData.msg);
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        handleCloseFormSE();
    }
 }

    //modification d'une ligne de SE
    const modifyRowSE = (row) => {
        setRowToModifySE(row);
        setChoixActionSE('Modification');
        handleOpenFormSE();
    }

    //supprimer une ligne de SE
    const deleteOneRowSE = (row) => {
        if (row.id > 0) {
            setInfoRowToDelete({ id: row.id, tableau: 'SE' });
            setConfirmDeleteOneRow(true);
        } else {
            setConfirmDeleteOneRow(false);
        }
    }

    //verouiller ou non le tableau de SE
    const lockTableSE = () => {
        verrouillerTableau(compteId, fileId, selectedPeriodeId, 'SE', verrSe);
        setVerrSe(!verrSe);
    }

//===========================================================================================
//TABLEAU NE
//===========================================================================================

//ajouter une nouvelle ligne dans la table NE
 const handleOpenFormNE = () => {
    setShowFormNE(true);
 }

    const handleCloseFormNE = () => {
        setShowFormNE(false);
    }

    const handleAddNewRowNE = () => {
        setChoixActionNE('Ajout');
        setRowToModifyNE(
            {
                state: false,
                id: -1,
                tableau: '',
                ref_note: '',
                commentaires: '',
            }
        );
        handleOpenFormNE();
    }

    //supprimer toutes les lignes autres provisions du tableau NE
    const deleteAllRowNE = () => {
        setTableauToDeleteAllRow('NE');
        setConfirmDeleteAllRow(true);
    }

 const AddOrModifyRowNE = (formData) => {
    if(formData.state){
        const exerciceId = selectedPeriodeId;
        const tableau = 'NE';
        axios.post(`/declaration/ebilan/addmodifyTableau`, {compteId, fileId, exerciceId, tableau, formData}).then((response) =>{
            const resData = response.data;
            if(resData.state){
                setNeData(resData.liste);
                handleCloseFormNE();
                toast.success(resData.msg);
            }else{
                toast.error(resData.msg);
            }
        });
    }else{
        handleCloseFormNE();
    }
 }

    //modification d'une ligne de NE
    const modifyRowNE = (row) => {
        setRowToModifyNE(row);
        setChoixActionNE('Modification');
        handleOpenFormNE();
    }

    //supprimer une ligne de NE
    const deleteOneRowNE = (row) => {
        if (row.id > 0) {
            setInfoRowToDelete({ id: row.id, tableau: 'NE' });
            setConfirmDeleteOneRow(true);
        } else {
            setConfirmDeleteOneRow(false);
        }
    }

 //verouiller ou non le tableau de NE
 const lockTableNE = () => {
    verrouillerTableau(compteId, fileId, selectedPeriodeId, 'NE', verrNote);
    setVerrNote(!verrNote);
 }

    return (
        <Paper sx={{ elevation: "3", margin: "5px", padding: "10px", width: "99%", height: "auto" }}>
            {noFile ? <PopupTestSelectedFile confirmationState={sendToHome} /> : null}
            {showTableRefresh ? <PopupActionConfirm msg={msgRefresh} confirmationState={handleRefreshTable} /> : null}
            {confirmDeleteOneRow ? <PopupConfirmDelete msg={'Voulez-vous vraiement supprimer la ligne sélectionnée?'} confirmationState={deleteOneRow} /> : null}
            {confirmDeleteAllRow ? <PopupConfirmDelete msg={'Voulez-vous vraiement supprimer toutes les lignes du tableau?'} confirmationState={deleteAllRow} /> : null}

            {showFormBHIAPC ? <PopupModifBHIAPC choix={choixActionBHIAPC} confirmationState={AddOrModifyRowBHIAPC} data={rowToModifyBHIAPC} /> : null}
            {showFormMP ? <PopupModifMP choix={choixActionMP} confirmationState={AddOrModifyRowMP} data={rowToModifyMP} /> : null}
            {showFormDA ? <PopupModifDA choix={choixActionDA} confirmationState={AddOrModifyRowDA} data={rowToModifyDA} /> : null}
            {showFormDP ? <PopupModifDP choix={choixActionDP} confirmationState={AddOrModifyRowDP} data={rowToModifyDP} /> : null}
            {showFormEIAFNC ? <PopupModifEIAFNC choix={choixActionEIAFNC} confirmationState={AddOrModifyRowEIAFNC} data={rowToModifyEIAFNC} /> : null}
            {showFormSE ? <PopupModifSE choix={choixActionSE} confirmationState={AddOrModifyRowSE} data={rowToModifySE} /> : null}
            {showFormNE ? <PopupModifNE compteId={compteId} fileId={fileId} exerciceId={selectedPeriodeId} choix={choixActionNE} confirmationState={AddOrModifyRowNE} data={rowToModifyNE} /> : null}

            <TabContext value={"1"} style={{ width: "75vw" }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList aria-label="lab API tabs example" style={{ textTransform: 'none', outline: 'none', border: 'none', }}>
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
                <TabPanel value="1" >
                    <Stack width={"100%"} height={"100%"} spacing={1} alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"stretch"}>
                        <Typography variant='h6' sx={{ color: "black" }} align='left'>Déclaration - Ebilan</Typography>

                        <Stack width={"100%"} height={"80px"} spacing={4} alignItems={"left"} alignContent={"center"} direction={"row"} style={{ marginLeft: "0px", marginTop: "20px" }}>
                            <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
                                <InputLabel id="demo-simple-select-standard-label">Exercice:</InputLabel>
                                <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={selectedExerciceId}
                                    label={"valSelect"}
                                    onChange={(e) => handleChangeExercice(e.target.value)}
                                    sx={{ width: "300px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
                                >
                                    {listeExercice.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
                                    ))
                                    }
                                </Select>
                            </FormControl>

                            <FormControl variant="standard" sx={{ m: 1, minWidth: 150 }}>
                                <InputLabel id="demo-simple-select-standard-label">Période</InputLabel>
                                <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={selectedPeriodeChoiceId}
                                    label={"valSelect"}
                                    onChange={(e) => handleChangePeriode(e.target.value)}
                                    sx={{ width: "150px", display: "flex", justifyContent: "left", alignItems: "flex-start", alignContent: "flex-start", textAlign: "left" }}
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
                                >
                                    {listeSituation?.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>{option.libelle_rang}: {format(option.date_debut, "dd/MM/yyyy")} - {format(option.date_fin, "dd/MM/yyyy")}</MenuItem>
                                    ))
                                    }
                                </Select>
                            </FormControl>
                        </Stack>

                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <TabContext value={value}>
                                <Box sx={{ borderBottom: 1, borderColor: 'transparent' }}>
                                    <TabList onChange={handleChangeTAB} aria-label="lab API tabs example" variant='scrollable'>
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="infos société" value="1" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="actionnaires" value="2" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="dom. bancaire" value="3" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="bilan" value="4" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="crn" value="5" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="crf" value="6" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="tftd" value="7" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="tfti" value="8" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="evcp" value="9" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="drf" value="10" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="bhiapc" value="11" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="mp" value="12" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="da" value="13" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="dp" value="14" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="eiafnc" value="15" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="sad" value="16" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="sdr" value="17" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="se" value="18" />
                                        <Tab style={{ textTransform: 'none', outline: 'none', border: 'none', }} label="note" value="19" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Infos société</Typography>
                                        </Stack>

                                        <Card>
                                            <CardActionArea
                                                sx={{
                                                    width: '80vw',
                                                    height: '400px',
                                                    '&[data-active]': {
                                                        backgroundColor: 'action.selected',
                                                        '&:hover': {
                                                            backgroundColor: 'action.selectedHover',
                                                        },
                                                    },
                                                    border: 'none',
                                                    '&:focus': {
                                                        outline: 'none',
                                                    },
                                                    '&:focus-visible': {
                                                        outline: 'none',
                                                    },
                                                    '&:active': {
                                                        outline: 'none',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                    },
                                                }}
                                            >
                                                <CardContent sx={{ height: '100%' }}>
                                                    <Typography variant="h5" fontWeight="normal" gutterBottom>
                                                        {fileInfos.raisonsociale}
                                                    </Typography>

                                                    <Divider sx={{ mb: 2 }} />

                                                    <Stack spacing={1}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <BsCreditCard2FrontFill color={theme.palette.primary.main} />
                                                            <Typography variant="body1">
                                                                nif : {fileInfos.nif}
                                                            </Typography>
                                                        </Box>

                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <BsCreditCard2FrontFill color={theme.palette.primary.main} />
                                                            <Typography variant="body1">
                                                                N° Statistique : {fileInfos.stat}
                                                            </Typography>
                                                        </Box>

                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <FaLocationDot color={theme.palette.primary.main} />
                                                            <Typography variant="body1">
                                                                Adresse : {fileInfos.adresse}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="2">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Liste des actionnaires</Typography>
                                        </Stack>

                                        {/* <TableListeActionnaireModel rows={rows} key={"ListeActionnaire"} /> */}
                                        <VirtualTableEbilan refreshTable={setUpdateCalculEtatfinancier} columns={associeColumn} rows={associeData} noCollapsible={true} />
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="3">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"} >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Renseignement sur les domiciliations bancaires</Typography>
                                        </Stack>

                                        <VirtualTableEbilan refreshTable={setUpdateCalculEtatfinancier} columns={domBankColumn} rows={domBankData} noCollapsible={true} />
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="4">
                                    <Stack width={"100%"} height={"100%"} spacing={2} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Bilan</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"100%"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "00px" }}>

                                            <Stack width={"30%"} height={"30px"} spacing={2} alignItems={"left"} alignContent={"left"}
                                                direction={"row"} justifyContent={"left"}
                                            >
                                                <ButtonGroup
                                                    disableElevation
                                                    variant="contained"
                                                    aria-label="Disabled button group"
                                                >
                                                    <Button
                                                        onClick={() => choixAffichageBilan('actif')}
                                                        variant={buttonActifVariant}
                                                        style={{ borderRadius: "0", textTransform: 'none', outline: 'none', width: 75 }}
                                                    >
                                                        Actif
                                                    </Button>
                                                    <Button
                                                        onClick={() => choixAffichageBilan('passif')}
                                                        variant={buttonPassifVariant}
                                                        style={{ borderRadius: "0", textTransform: 'none', outline: 'none', width: 75 }}
                                                    >
                                                        Passif
                                                    </Button>
                                                </ButtonGroup>
                                            </Stack>

                                            <Stack width={"70%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton
                                                        style={{
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton
                                                        style={{
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                {/* <Tooltip title="Actualiser les calculs">
                                            <Button variant="outlined" style={{borderRadius:"0"}}>
                                                <TbRefresh style={{width:'30px', height:'30px'}}/>
                                            </Button>
                                        </Tooltip> */}

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshBILAN}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrBilan ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrBilan ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableBILAN}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrBilan ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrBilan
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        {showBilan === 'actif'
                                            ? <Stack width={"100%"} alignItems={'start'}>
                                                <VirtualTableEbilan
                                                    refreshTable={setUpdateCalculEtatfinancier}
                                                    columns={BilanActifColumn}
                                                    rows={bilanActifData}
                                                    noCollapsible={false}
                                                    state={verrBilan}
                                                />
                                            </Stack>
                                            : null
                                        }
                                        {showBilan === 'passif'
                                            ? <Stack width={"100%"} alignItems={'start'}>
                                                <VirtualTableEbilan
                                                    refreshTable={setUpdateCalculEtatfinancier}
                                                    columns={BilanPassifColumn}
                                                    rows={bilanPassifData}
                                                    noCollapsible={false}
                                                    state={verrBilan}
                                                />
                                            </Stack>
                                            : null
                                        }
                                    </Stack>

                                </TabPanel>

                                <TabPanel value="5">

                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Compte de résultat par nature</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshCRN}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrCrn ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrCrn ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableCRN}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrCrn ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrCrn
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} alignItems={'start'}>
                                            <VirtualTableEbilan refreshTable={setUpdateCalculEtatfinancier} columns={crnColumn} rows={crnData} state={verrCrn} />
                                        </Stack>

                                    </Stack>
                                </TabPanel>

                                <TabPanel value="6">

                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Compte de résultat par fonction</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "00px", marginTop: "00px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshCRF}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrCrf ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrCrf ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableCRF}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrCrf ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrCrf
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} alignItems={'start'}>
                                            <VirtualTableEbilan refreshTable={setUpdateCalculEtatfinancier} columns={crnColumn} rows={crfData} state={verrCrf} />
                                        </Stack>

                                    </Stack>
                                </TabPanel>

                                <TabPanel value="7">

                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Tableau de flux de trésoreries méthode directe</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshTFTD}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrTftd ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrTftd ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableTFTD}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrTftd ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrTftd
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} alignItems={'start'}>
                                            <VirtualTableEbilan
                                                refreshTable={setUpdateCalculEtatfinancier}
                                                columns={tftdColumn}
                                                rows={tftdData}
                                                state={verrTftd}
                                            />
                                        </Stack>

                                    </Stack>
                                </TabPanel>

                                <TabPanel value="8">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Tableau de flux de trésoreries méthode indirecte</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshTFTI}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrTfti ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrTfti ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableTFTI}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrTfti ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrTfti
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} alignItems={'start'}>
                                            <VirtualTableEbilan
                                                refreshTable={setUpdateCalculEtatfinancier}
                                                columns={crnColumn} rows={tftiData}
                                                state={verrTfti}
                                            />
                                        </Stack>

                                    </Stack>

                                </TabPanel>

                        <TabPanel value="9">
                            <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"} 
                                alignContent={"flex-start"} justifyContent={"stretch"}
                                style={{marginLeft:30}} 
                            >
                                <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"} 
                                    alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                    <Typography variant='h6' sx={{color: "black" }} align='center'>Etat de variation des capitaux propres</Typography>
                                </Stack>
                                
                                <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"} 
                                    direction={"row"} style={{marginLeft:"0px", marginTop:"0px"}}>
                                    <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"} 
                                    direction={"row"} justifyContent={"right"}>
                                        <Tooltip title="Liste des anomalies">
                                            <IconButton style={{textTransform: 'none', outline: 'none'}}>
                                                <Badge badgeContent={4} >
                                                    <GoAlert color='#FF8A8A' style={{width:'30px', height:'30px'}}/>
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Liste des articles associés au formulaire">
                                            <IconButton style={{textTransform: 'none', outline: 'none'}}>
                                                <Badge badgeContent={12} color="success">
                                                    <PiArticleThin style={{width:'30px', height:'30px'}}/>
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Actualiser les calculs">
                                            <IconButton
                                            onClick={refreshEVCP}
                                            variant="contained" 
                                            style={{width:"45px", height:'45px', 
                                                borderRadius:"1px", borderColor: "transparent", 
                                                backgroundColor: initial.theme,
                                                textTransform: 'none', outline: 'none',
                                                display: verrEvcp ? 'none' : 'inline-flex',
                                            }}
                                            >
                                               <TbRefresh style={{width:'25px', height:'25px', color:'white'}}/>
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title={verrEvcp? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                            <IconButton
                                            onClick={lockTableEVCP}
                                            variant="contained" 
                                            style={{width:"45px", height:'45px', 
                                                borderRadius:"2px", borderColor: "transparent", 
                                                backgroundColor: verrEvcp ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                textTransform: 'none', outline: 'none'
                                            }}
                                            >
                                                {verrEvcp
                                                    ? <CiLock style={{width:'25px', height:'25px', color:'white'}}/>
                                                    : <CiUnlock style={{width:'25px', height:'25px', color:'white'}}/>
                                                }
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>

                                        <Stack width={"100%"} alignItems={'start'}>
                                            <VirtualTableEVCPEbilan
                                                refreshTable={setUpdateCalculEtatfinancier}
                                                columns={evcpColumn}
                                                rows={evcpData}
                                                state={verrEvcp}
                                            />
                                        </Stack>

                                    </Stack>
                                </TabPanel>

                        <TabPanel value="10">
                            <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"} 
                                alignContent={"flex-start"} justifyContent={"stretch"} 
                                style={{marginLeft:30}} 
                            >
                                <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"} 
                                    alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                    <Typography variant='h6' sx={{color: "black" }} align='center'>Détermination du résultat fiscal</Typography>
                                </Stack>
                                
                                <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"} 
                                    direction={"row"} style={{marginLeft:"0px", marginTop:"0px"}}>
                                    <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"} 
                                    direction={"row"} justifyContent={"right"}>
                                        <Tooltip title="Liste des anomalies">
                                            <IconButton style={{textTransform: 'none', outline: 'none'}}>
                                                <Badge badgeContent={4} >
                                                    <GoAlert color='#FF8A8A' style={{width:'30px', height:'30px'}}/>
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Liste des articles associés au formulaire">
                                            <IconButton style={{textTransform: 'none', outline: 'none'}}>
                                                <Badge badgeContent={12} >
                                                    <PiArticleThin style={{width:'30px', height:'30px'}}/>
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Actualiser les calculs">
                                            <IconButton
                                            onClick={refreshDRF}
                                            variant="contained" 
                                            style={{width:"45px", height:'45px', 
                                                borderRadius:"1px", borderColor: "transparent", 
                                                backgroundColor: initial.theme,
                                                textTransform: 'none', outline: 'none',
                                                display: verrDrf ? 'none' : 'inline-flex',
                                            }}
                                            >
                                               <TbRefresh style={{width:'25px', height:'25px', color:'white'}}/>
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title={verrDrf? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                            <IconButton
                                            onClick={lockTableDRF}
                                            variant="contained" 
                                            style={{width:"45px", height:'45px', 
                                                borderRadius:"2px", borderColor: "transparent", 
                                                backgroundColor: verrDrf ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                textTransform: 'none', outline: 'none'
                                            }}
                                            >
                                                {verrDrf
                                                    ? <CiLock style={{width:'25px', height:'25px', color:'white'}}/>
                                                    : <CiUnlock style={{width:'25px', height:'25px', color:'white'}}/>
                                                }
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>

                                <Stack width={"100%"} height={"900px"} alignItems={'start'}>
                                    <VirtualTableDRFEbilan refreshTable={setUpdateCalculEtatfinancier} columns={drfColumn} rows={drfData} state={verrDrf}/> 
                                </Stack>
                                
                            </Stack>
                        </TabPanel>

                                <TabPanel value="11">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Etat des bénéficiaires d'honoraires,d'intérêts ou d'arrérages portés en charge</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={handleAddNewRowBHIAPC}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrBhiapc ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={deleteAllRowBHIAPC}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrBhiapc ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshBHIAPC}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrBhiapc ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrBhiapc ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableBHIAPC}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrBhiapc ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrBhiapc
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} height={"50vh"} alignItems={'start'}>
                                            <VirtualTableModifiableEbilan columns={bhiapcColumn} rows={bhiapcData} deleteState={deleteOneRowBHIAPC} modifyState={modifyRowBHIAPC} state={verrBhiapc} />
                                        </Stack>

                                    </Stack>
                                </TabPanel>

                                <TabPanel value="12">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Marché public</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={handleAddNewRowMP}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrMp ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={deleteAllRowMP}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrMp ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* <Tooltip title="Actualiser les calculs">
                                            <IconButton
                                            onClick={refreshMP}
                                            variant="contained" 
                                            style={{width:"45px", height:'45px', 
                                                borderRadius:"1px", borderColor: "transparent", 
                                                backgroundColor: initial.theme,
                                                textTransform: 'none', outline: 'none',
                                                display: verrMp ? 'none' : 'inline-flex',
                                            }}
                                            >
                                               <TbRefresh style={{width:'25px', height:'25px', color:'white'}}/>
                                            </IconButton>
                                        </Tooltip> */}

                                                <Tooltip title={verrMp ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableMP}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrMp ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrMp
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} height={"50vh"} alignItems={'start'}>
                                            <VirtualTableModifiableEbilan columns={mpColumn} rows={mpData} deleteState={deleteOneRowMP} modifyState={modifyRowMP} state={verrMp} />
                                        </Stack>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value="13">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 10 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Détails amortissements</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={handleAddNewRowDA}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrDa ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={deleteAllRowDA}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrDa ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshMP}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrDa ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrDa ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableDA}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrDa ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrDa
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack
                                            width={"100%"}
                                            height={"50vh"}
                                            alignItems={'start'}
                                            style={{ overflow: 'auto' }}
                                        >
                                            <VirtualTableModifiableGroupableEbilan columns={daColumn} rows={daData} deleteState={deleteOneRowDA} modifyState={modifyRowDA} state={verrDa} />
                                        </Stack>

                                    </Stack>
                                </TabPanel>

                                <TabPanel value="14">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Détails provisions</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none' }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={handleAddNewRowDP}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrDp ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={deleteAllRowDP}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrDp ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshDP}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrDp ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrDp ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableDP}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrDp ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrDp
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack
                                            width={"100%"}
                                            height={"100vh"}
                                            alignItems={'start'}
                                        >
                                            <VirtualTableModifiableGroupableEbilanDP columns={dpColumn} rows={dpData} deleteState={deleteOneRowDP} modifyState={modifyRowDP} state={verrDp} />
                                        </Stack>

                                    </Stack>
                                </TabPanel>

                                <TabPanel value="15">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 30 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Evolution des immobilisations et actifs financiers non courants</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none', }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none', }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={handleAddNewRowEIAFNC}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrEiafnc ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={deleteAllRowEIAFNC}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrEiafnc ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrEiafnc ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableEIAFNC}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrEiafnc ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrEiafnc
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack
                                            width={"90%"}
                                            height={"100vh"}
                                            alignItems={'start'}
                                        >
                                            <VirtualTableModifiableGroupableEbilanEIAFNC columns={eiafncColumn} rows={eiafncData} deleteState={deleteOneRowEIAFNC} modifyState={modifyRowEIAFNC} state={verrEiafnc} />
                                        </Stack>

                                    </Stack>
                                </TabPanel>


                                <TabPanel value="16">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 10 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Suivi des amortissements différés</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none', }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none', }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshSAD}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrSad ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrSad ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableSAD}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrSad ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrSad
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                <Stack width={"100%"} alignItems={'start'}>
                                    <VirtualTableSADEbilan refreshTable={setUpdateCalculEtatfinancier} columns={sadColumn} rows={sadData} state={verrSad}/> 
                                </Stack>
                                
                            </Stack>
                        </TabPanel>

                                <TabPanel value="17">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 10 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Suivi des déficits reportables</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none', }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none', }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Actualiser les calculs">
                                                    <IconButton
                                                        onClick={refreshSDR}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrSdr ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbRefresh style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrSdr ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableSDR}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrSdr ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrSdr
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                <Stack width={"100%"} alignItems={'start'} style={{overflow:'auto'}}>
                                    <VirtualTableSDREbilan refreshTable={setUpdateCalculEtatfinancier} columns={sdrColumn} rows={sdrData} state={verrSdr}/> 
                                </Stack>
                                
                            </Stack>
                        </TabPanel>

                                <TabPanel value="18">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 10 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Suivi des emprunts</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Liste des anomalies">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none', }}>
                                                        <Badge badgeContent={4} >
                                                            <GoAlert color='#FF8A8A' style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Liste des articles associés au formulaire">
                                                    <IconButton style={{ textTransform: 'none', outline: 'none', }}>
                                                        <Badge badgeContent={12} color="success">
                                                            <PiArticleThin style={{ width: '30px', height: '30px' }} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={handleAddNewRowSE}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrSe ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={deleteAllRowSE}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrSe ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrSe ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableSE}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrSe ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrSe
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} height={"50vh"} alignItems={'start'}>
                                            <VirtualTableModifiableEbilan columns={seColumn} rows={seData} deleteState={deleteOneRowSE} modifyState={modifyRowSE} state={verrSe} />
                                        </Stack>

                                    </Stack>
                                </TabPanel>


                                <TabPanel value="19">
                                    <Stack width={"100%"} height={"100%"} spacing={3} alignItems={"flex-start"}
                                        alignContent={"flex-start"} justifyContent={"stretch"}
                                        style={{ marginLeft: 10 }}
                                    >
                                        <Stack width={"100%"} height={"20px"} spacing={1} alignItems={"center"}
                                            alignContent={"center"} direction={"row"} justifyContent={"center"}>
                                            <Typography variant='h6' sx={{ color: "black" }} align='center'>Notes explicatives</Typography>
                                        </Stack>

                                        <Stack width={"100%"} height={"50px"} spacing={0} alignItems={"center"} alignContent={"center"}
                                            direction={"row"} style={{ marginLeft: "0px", marginTop: "0px" }}>
                                            <Stack width={"100%"} height={"30px"} spacing={0.5} alignItems={"center"} alignContent={"center"}
                                                direction={"row"} justifyContent={"right"}>
                                                <Tooltip title="Ajouter une ligne">
                                                    <IconButton
                                                        onClick={handleAddNewRowNE}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.theme,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrNote ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <TbPlaylistAdd style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer toutes les lignes du tableau">
                                                    <IconButton
                                                        onClick={deleteAllRowNE}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "1px", borderColor: "transparent",
                                                            backgroundColor: initial.button_delete_color,
                                                            textTransform: 'none', outline: 'none',
                                                            display: verrNote ? 'none' : 'inline-flex',
                                                        }}
                                                    >
                                                        <IoMdTrash style={{ width: '25px', height: '25px', color: 'white' }} />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={verrNote ? 'Déverrouiller le tableau' : 'Vérrouiller le tableau'}>
                                                    <IconButton
                                                        onClick={lockTableNE}
                                                        variant="contained"
                                                        style={{
                                                            width: "45px", height: '45px',
                                                            borderRadius: "2px", borderColor: "transparent",
                                                            backgroundColor: verrNote ? "rgba(240, 43, 33, 1)" : "rgba(9, 77, 31, 0.8)",
                                                            textTransform: 'none', outline: 'none'
                                                        }}
                                                    >
                                                        {verrNote
                                                            ? <CiLock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                            : <CiUnlock style={{ width: '25px', height: '25px', color: 'white' }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        <Stack maxWidth={"100vw"} width={"100vw"} height={"50vh"} alignItems={'start'}>
                                            <VirtualTableModifiableEbilan columns={neColumn} rows={neData} deleteState={deleteOneRowNE} modifyState={modifyRowNE} state={verrNote} />
                                        </Stack>

                                    </Stack>
                                </TabPanel>
                            </TabContext>
                        </Box>
                    </Stack>
                </TabPanel>
            </TabContext>


        </Paper>
    )
}
