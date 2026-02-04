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
        path: "/tab/revision/revisionAnomalieEbilan",
        urldynamic: false
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
        path: "/tab/revision/revisionPrecontrolFiscal"
    },
];

export default function Revisions({ onWindowState, pathToNavigate, humburgerMenuState, closeDrawer }) {
    let initial = init[0];

    const SendStateToParent = () => {
        onWindowState(false);
    }

    const HandlePath = (newPath) => {
        pathToNavigate(newPath);
    }

    return (
        <Stack
            backgroundColor={initial.menu_theme}
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
                caption={"Révisions"}
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
                    <Typography variant='h6' marginLeft={"50px"} color={initial.text_theme}>Liasses</Typography>
                    <SubMenuList list={liassesList} navigatePath={HandlePath} />
                </Stack>

                <Divider orientation='vertical' color={initial.text_theme} style={{ height: "100%", opacity: "0.2" }} />

                <Stack width={"25%"} height={"30px"} spacing={0.1} alignItems={"flex-start"} direction={"column"}>
                    <Typography variant='h6' marginLeft={"50px"} color={initial.text_theme}>Fiscales</Typography>
                    <SubMenuList list={fiscalesList} navigatePath={HandlePath} />
                </Stack>
                <Divider orientation='vertical' color={initial.text_theme} style={{ height: "100%", opacity: "0.2" }} />

            </Stack>
        </Stack>
    )
}