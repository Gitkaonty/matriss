import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SubMenuList from '../subMenuComponents/SubMenuList';
import SubMenuHeader from '../subMenuComponents/SubMenuHeader';
import { init } from '../../../../init';
import { Stack } from '@mui/material';

const traitementList = [
    {
        text: 'Saisie',
        name: "saisie",
        path: "/tab/administration/saisie",
        urldynamic: true
    },
    {
        text: 'Consultation',
        name: "consultation",
        path: "/tab/administration/consultation",
        urldynamic: true
    },
    {
        text: 'Personnel',
        name: "personnel",
        path: "/tab/administration/personnel",
        urldynamic: true
    },
    {
        text: 'Rapprochements bancaires',
        name: "rapprochements",
        path: "/tab/administration/rapprochements",
        urldynamic: true
    },
    {
        text: 'Immobilisations',
        name: "immobilisations",
        path: "/tab/administration/immobilisations",
        urldynamic: true
    },

];

const importList = [
    // {
    //     text: 'Annexe déclarations fiscales',
    //     name: "annexeDeclarationsFiscales",
    //     path: "/tab/administration/importAnnexeDeclarationFiscale",
    //     urldynamic: false
    // },
    // {
    //     text: 'Annexe liasses E-bilan',
    //     name: "annexeLiassesEbilan",
    //     path: "/tab/administration/importAnnexeDeclarationEbilan",
    //     urldynamic: true
    // },
    {
        text: 'Balance',
        name: "balance",
        path: "/tab/administration/importBalance",
        urldynamic: true
    },
    {
        text: 'Journal comptable',
        name: "journalComptable",
        path: "/tab/administration/importJournal",
        urldynamic: true
    },
    // {
    //     text: 'Modèle plan comptable',
    //     name: "modelePlanComptable",
    //     path: "/tab/administration/importModelePlanComptable",
    //     urldynamic: false
    // },
];

const exportList = [
    {
        text: 'Balance',
        name: "balance",
        path: "/tab/administration/exportBalance",
        urldynamic: true
    },
    // {
    //     text: 'DCom - droit de communication',
    //     name: "droitCommunication",
    //     path: "#"
    // },
    {
        text: 'Grand livre',
        name: "grandLivre",
        path: "/tab/administration/exportGrandLivre",
        urldynamic: true
    },
    {
        text: 'Journal comptable',
        name: "journalComptable",
        path: "/tab/administration/exportJournal",
        urldynamic: true
    },
    {
        text: 'Etats financiers',
        name: "etatfinancière",
        path: "/tab/administration/etatFinacier",
        urldynamic: true
    },
    {
        text: 'Etats financiers analytique',
        name: "etatfinancièreAnalytique",
        path: "/tab/administration/etatFinacierAnalytique",
        urldynamic: true
    },
    {
        text: 'SIG',
        name: "sig",
        path: "/tab/administration/sig",
        urldynamic: true
    },
    // {
    //     text: 'Liasse E-bilan',
    //     name: "liasseEbilan",
    //     path: "#"
    // },
];

export default function Administration({ onWindowState, pathToNavigate, humburgerMenuState, closeDrawer }) {
    let initial = init[0];

    const SendStateToParent = () => {
        onWindowState(false);
    }

    const HandlePath = (newPath) => {
        pathToNavigate(newPath);
    }

    return (
        <Stack
            backgroundColor={initial.theme}
            width={'100%'}
            height={'100vh'}
            zIndex={"10"}
            position={"fixed"}
            visibility={'visible'}
            sx={{
                opacity: "0.95",
            }}
            marginTop={"-40px"}
            marginLeft={"-8px"}
        >
            <SubMenuHeader
                caption={"Administration"}
                openWindow={SendStateToParent}
                humburgerMenuState={humburgerMenuState}
                closeDrawer={closeDrawer}
            />

            <Stack
                width={"100%"}
                height={"100%"}
                spacing={2}
                alignItems={"flex-start"}
                direction={"row"}
                marginLeft={"20px"}
                marginTop={"-25px"}
            >
                <Stack width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                    <Typography variant='h6' marginLeft={"50px"} color={"white"}>Traitement</Typography>
                    <SubMenuList list={traitementList} navigatePath={HandlePath} />
                </Stack>

                <Divider orientation='vertical' color={"white"} style={{ height: "100%", opacity: "0.2" }} />

                <Stack width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                    <Typography variant='h6' marginLeft={"50px"} color={"white"}>Import</Typography>
                    <SubMenuList list={importList} navigatePath={HandlePath} />
                </Stack>
                <Divider orientation='vertical' color={"white"} style={{ height: "100%", opacity: "0.2" }} />

                <Stack width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                    <Typography variant='h6' marginLeft={"50px"} color={"white"}>Export</Typography>
                    <SubMenuList list={exportList} navigatePath={HandlePath} />
                </Stack>
            </Stack>
        </Stack>
    )
}