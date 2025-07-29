import * as React from 'react';
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
        path: "/tab/saisie",
        urldynamic: true
    },
    {
        text: 'Consultation',
        name: "consultation",
        path: "/tab/consultation",
        urldynamic: true
    },
];

const importList = [
    {
        text: 'Annexe déclarations fiscales',
        name: "annexeDeclarationsFiscales",
        path: "/tab/importAnnexeDeclarationFiscale",
        urldynamic: true
    },
    {
        text: 'Annexe liasses E-bilan',
        name: "annexeLiassesEbilan",
        path: "/tab/importAnnexe",
        urldynamic: true
    },
    {
        text: 'Balance',
        name: "balance",
        path: "/tab/importBalance",
        urldynamic: true
    },
    {
        text: 'Journal comptable',
        name: "journalComptable",
        path: "/tab/importJournal",
        urldynamic: true
    },
    {
        text: 'Modèle plan comptable',
        name: "modelePlanComptable",
        path: "/tab/importModelePlanComptable",
        urldynamic: false
    },
];

const exportList = [
    {
        text: 'Balance',
        name: "balance",
        path: "/tab/exportBalance",
        urldynamic: true
    },
    {
        text: 'DCom - droit de communication',
        name: "droitCommunication",
        path: "#"
    },
    {
        text: 'Grand livre',
        name: "grandLivre",
        path: "#"
    },
    {
        text: 'Journal comptable',
        name: "journalComptable",
        path: "#"
    },
    {
        text: 'Liasse E-bilan',
        name: "liasseEbilan",
        path: "#"
    },
];

export default function Administration({onWindowState, pathToNavigate, humburgerMenuState}){
    let initial = init[0];
   
    const SendStateToParent = () => {
        onWindowState(false);
    }

    const HandlePath = (newPath) => {
        pathToNavigate(newPath);
    }

    return (
    <Stack backgroundColor={initial.theme} 
    width={humburgerMenuState ? '85.5vw': '95vw'} 
    height={'100vh'} 
    zIndex={"10"} 
    position={"absolute"} 
    visibility={'visible'}
    sx={{opacity:"0.95"}}
    marginTop={"-27px"}
    marginLeft={"-8px"}
    >
        <SubMenuHeader caption={"Administration"} openWindow={SendStateToParent}/>

        <Stack marginTop={"50px"} width={"100%"} height={"75%"} spacing={2} alignItems={"flex-start"} direction={"row"} marginLeft={"20px"}>
            <Stack marginTop={"50px"} width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                <Typography variant='h6' marginLeft={"50px"} color={"white"}>Traitement</Typography>
                <SubMenuList list={traitementList} navigatePath={HandlePath}/>
            </Stack>
            
            <Divider orientation='vertical' color={"white"} style={{height:"100%", opacity:"0.2"}} />

            <Stack marginTop={"50px"} width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                <Typography variant='h6' marginLeft={"50px"} color={"white"}>Import</Typography>
                <SubMenuList list={importList} navigatePath={HandlePath}/>
            </Stack>
            <Divider orientation='vertical' color={"white"} style={{height:"100%", opacity:"0.2"}} />

            <Stack marginTop={"50px"} width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                <Typography variant='h6' marginLeft={"50px"} color={"white"}>Export</Typography>
                <SubMenuList list={exportList} navigatePath={HandlePath}/>
            </Stack>
        </Stack>
    </Stack>
    )
}