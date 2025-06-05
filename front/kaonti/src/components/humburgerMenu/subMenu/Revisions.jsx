import * as React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SubMenuList from '../subMenuComponents/SubMenuList';
import SubMenuHeader from '../subMenuComponents/SubMenuHeader';
import { init } from '../../../../init';
import { Stack } from '@mui/material';

const liassesList = [
    {
        text: 'Anomalies E-bilan',
        name: "anomalieEbilan",
        path: "/tab/revisionAnomalieEbilan",
        urldynamic: true
    },
    {
        text: 'Dossier de révisions',
        name: "dossierRevision",
        path: "#",
        urldynamic: true
    },
];

const fiscalesList = [
    {
        text: 'Pré-contrôle fiscal',
        name: "precontroleFiscal",
        path: "/tab/revisionPrecontrolFiscal"
    },
];

export default function Revisions ({onWindowState, pathToNavigate, humburgerMenuState}){
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
        <SubMenuHeader caption={"Révisions"} openWindow={SendStateToParent}/>

        <Stack marginTop={"50px"} width={"100%"} height={"75%"} spacing={2} alignItems={"flex-start"} direction={"row"} marginLeft={"20px"}>
            <Stack marginTop={"50px"} width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                <Typography variant='h6' marginLeft={"50px"} color={"white"}>Liasses</Typography>
                <SubMenuList list={liassesList} navigatePath={HandlePath}/>
            </Stack>
            
            <Divider orientation='vertical' color={"white"} style={{height:"100%", opacity:"0.2"}} />

            <Stack marginTop={"50px"} width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                <Typography variant='h6' marginLeft={"50px"} color={"white"}>Fiscales</Typography>
                <SubMenuList list={fiscalesList} navigatePath={HandlePath}/>
            </Stack>
            <Divider orientation='vertical' color={"white"} style={{height:"100%", opacity:"0.2"}} />
            
        </Stack>
    </Stack>
    )
}