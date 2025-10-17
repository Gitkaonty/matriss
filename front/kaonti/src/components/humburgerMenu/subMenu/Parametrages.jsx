import * as React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SubMenuList from '../subMenuComponents/SubMenuList';
import SubMenuHeader from '../subMenuComponents/SubMenuHeader';
import { init } from '../../../../init';
import { Stack } from '@mui/material';

const comptaList = [
    {
        text: 'Analytique',
        name: "analytique",
        path: "/tab/parametrages/paramAnalytique",
        urldynamic: true
    },
    {
        text: 'Code journaux',
        name: "codejournaux",
        path: "/tab/parametrages/paramCodeJournal",
        urldynamic: true
    },
    {
        text: 'CRM',
        name: "crm",
        path: "/tab/parametrages/paramCrm",
        urldynamic: true
    },
    {
        text: 'Devises',
        name: "devises",
        path: "/tab/parametrages/paramDevise",
        urldynamic: true
    },
    {
        text: 'Exercices',
        name: "exercices",
        path: "/tab/parametrages/paramExercice",
        urldynamic: true
    },
    {
        text: 'Plan comptable',
        name: "planComptable",
        path: "/tab/parametrages/paramPlanComptable",
        urldynamic: true
    },
    {
        text: 'Plan comptable - modèle',
        name: "planComptableModele",
        path: "/tab/parametrages/paramPlanComptableModele",
        urldynamic: false
    },
    {
        text: 'TVA',
        name: "tva",
        path: "/tab/parametrages/paramTVA",
        urldynamic: true
    },
    {
        text: 'Chiffre D\'affaires',
        name: "chiffreAffaires",
        path: "/tab/parametrages/chiffreDaffaires",
        urldynamic: true
    },
];

const liassesList = [
    {
        text: 'Mapping des comptes',
        name: "mappingComptes",
        path: "/tab/parametrages/paramMapping",
        urldynamic: true
    },
];

const socialesList = [
    {
        text: 'Organismes de santé',
        name: "organismessante",
        path: "#",
        urldynamic: true
    },
    {
        text: 'Prévoyance sociales',
        name: "prevoyancesociales",
        path: "#",
        urldynamic: true
    },
    {
        text: 'Catégories',
        name: "classification",
        path: "/tab/parametrages/paramClassification",
        urldynamic: true
    },
    {
        text: 'Fonctions',
        name: "fonctions",
        path: "/tab/parametrages/paramFonctions",
        urldynamic: true
    },
];

export default function Parametrages({ onWindowState, pathToNavigate, humburgerMenuState, closeDrawer }) {
    let initial = init[0];

    const SendStateToParent = () => {
        onWindowState(false);
    }

    const HandlePath = (newPath) => {
        pathToNavigate(newPath);
    }

    return (
        <Stack backgroundColor={initial.theme}
            width={'100%'}
            height={'100vh'}
            zIndex={"10"}
            position={"fixed"}
            visibility={'visible'}
            sx={{ opacity: "0.95" }}
            marginTop={"-40px"}
            marginLeft={"-8px"}
        >
            <SubMenuHeader
                caption={"Paramétrages"}
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
                    <Typography variant='h6' marginLeft={"50px"} color={"white"}>Comptabilité</Typography>
                    <SubMenuList list={comptaList} navigatePath={HandlePath} />
                </Stack>

                <Divider orientation='vertical' color={"white"} style={{ height: "100%", opacity: "0.2" }} />

                <Stack width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                    <Typography variant='h6' marginLeft={"50px"} color={"white"}>Liasses</Typography>
                    <SubMenuList list={liassesList} navigatePath={HandlePath} />
                </Stack>
                <Divider orientation='vertical' color={"white"} style={{ height: "100%", opacity: "0.2" }} />

                <Stack width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                    <Typography variant='h6' marginLeft={"50px"} color={"white"}>Sociales</Typography>
                    <SubMenuList list={socialesList} navigatePath={HandlePath} />
                </Stack>
            </Stack>
        </Stack>
    )
}