import Typography from '@mui/material/Typography';
import { Stack, Button, IconButton } from '@mui/material';
import { Clear } from '@mui/icons-material';

export default function SubMenuHeader({ caption, openWindow, humburgerMenuState, closeDrawer }) {

    const openSubMenu = () => {
        openWindow(false);
        closeDrawer();
    }

    return (
        <Stack
            position={'relative'}
            marginTop={"50px"}
            marginBottom={"50px"}
            width={"100%"}
            height={"30px"}
            spacing={2}
            alignItems={"flex-start"}
            direction={"row"}
            alignContent={"center"}
            justifyContent={"space-between"}
        >
            <Stack  >
                <Typography variant='h5' marginLeft={"20px"} color={"white"}>{caption}</Typography>
            </Stack>

            <Stack
                style={{
                    marginRight: humburgerMenuState ? 248 : 75,
                }}
            >
                <IconButton
                    onClick={openSubMenu}
                    aria-label="close"
                    variant='text'
                    style={{
                        textTransform: 'none',
                        outline: 'none'
                    }}
                >
                    <Clear
                        style={{ color: "white", fontSize: 32 }}
                    />
                </IconButton>
            </Stack>
        </Stack>
    )
}

