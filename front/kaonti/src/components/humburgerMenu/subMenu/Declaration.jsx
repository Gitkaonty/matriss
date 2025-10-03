import * as React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SubMenuList from '../subMenuComponents/SubMenuList';
import SubMenuHeader from '../subMenuComponents/SubMenuHeader';
import { init } from '../../../../init';
import { Stack } from '@mui/material';

const declFiscalesList = [
    {
        text: 'BGE-VCA - Balance générale-ventilation du CA',
        name: "bgevca",
        path: "#",
        urldynamic: false
    },
    {
        text: 'DCom - droit de communication',
        name: "dcom",
        path: "/tab/declarationDroitComm",
        urldynamic: true
    },
    {
        text: 'E-bilan',
        name: "ebilan",
        path: "/tab/declarationEbilan",
        urldynamic: true
    },
    {
        text: 'IR Acompte - impôt sur les revenus',
        name: "iracompte",
        path: "#",
        urldynamic: false
    },
    {
        text: 'IR Liquidation - impôt sur les revenus',
        name: "irliquidation",
        path: "#",
        urldynamic: false
    },
    {
        text: 'IRI - impôt sur les revenus intermittent',
        name: "iri",
        path: "#",
        urldynamic: false
    },
    {
        text: 'IRSA - Impôts sur les revenus salariaux et assimilés',
        name: "irsa",
        path: "/tab/declarationIRSA",
        urldynamic: true
    },
    {
        text: 'IRCM - impôt sur le Revenu des Capitaux Mobiliers',
        name: "ircm",
        path: "#",
        urldynamic: false
    },
    {
        text: 'ISI - impôt synthétique intermittent',
        name: "isi",
        path: "#",
        urldynamic: false
    },
    {
        text: 'TVA - taxes sur la valeur ajoutée',
        name: "tva",
        path: "/tab/declarationTVA",
        urldynamic: true
    },
];

const declSocialesList = [
    {
        text: 'Organismes de santé',
        name: "organismesante",
        path: "#"
    },
    {
        text: 'Prévoyances sociales',
        name: "prevoyancesociales",
        path: "#"
    },
    {
        text: 'Indemnités',
        name: "indemnites",
        path: "/tab/indemnites"
    },
    {
        text: 'Avantages en nature',
        name: "avantagesnature",
        path: "/tab/avantagesnature"
    },
];

export default function Declaration({ onWindowState, pathToNavigate, humburgerMenuState }) {
    let initial = init[0];

    const SendStateToParent = () => {
        onWindowState(false);
    }

    const HandlePath = (newPath) => {
        pathToNavigate(newPath);
    }

    return (
        <Stack backgroundColor={initial.theme}
            width={humburgerMenuState ? '85.5vw' : '95vw'}
            height={'100vh'}
            zIndex={"10"}
            position={"absolute"}
            visibility={'visible'}
            sx={{ opacity: "0.95" }}
            marginTop={"-27px"}
            marginLeft={"-8px"}
        >
            <SubMenuHeader caption={"Déclarations"} openWindow={SendStateToParent} />

            <Stack marginTop={"50px"} width={"100%"} height={"75%"} spacing={2} alignItems={"flex-start"} direction={"row"} marginLeft={"20px"}>
                <Stack marginTop={"50px"} width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                    <Typography variant='h6' marginLeft={"50px"} color={"white"}>Liasses fiscales</Typography>
                    <SubMenuList list={declFiscalesList} navigatePath={HandlePath} />
                </Stack>

                <Divider orientation='vertical' color={"white"} style={{ height: "100%", opacity: "0.2" }} />

                <Stack marginTop={"50px"} width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                    <Typography variant='h6' marginLeft={"50px"} color={"white"}>Organismes</Typography>
                    <SubMenuList list={declSocialesList} navigatePath={HandlePath} />
                </Stack>
                <Divider orientation='vertical' color={"white"} style={{ height: "100%", opacity: "0.2" }} />

            </Stack>
        </Stack>
    )
}