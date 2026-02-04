import Typography from '@mui/material/Typography';
import { Stack, IconButton } from '@mui/material';
import { Clear } from '@mui/icons-material';
import { init } from '../../../../init';

export default function SubMenuHeader({ caption, openWindow, humburgerMenuState, closeDrawer }) {

    let initial = init[0];

    const openSubMenu = () => {
        openWindow(false);
        if (typeof closeDrawer === 'function') closeDrawer();
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
                <Typography variant='h5' marginLeft={"20px"} color={initial.text_theme}>{caption}</Typography>
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
                    disableRipple
                    disableFocusRipple
                    style={{
                        textTransform: 'none',
                        outline: 'none'
                    }}
                    sx={{
                        boxShadow: 'none',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                        '&:focus-visible': { outline: 'none', boxShadow: 'none' },
                        '&.Mui-focusVisible': { outline: 'none', boxShadow: 'none' },
                    }}
                >
                    <Clear
                        style={{ color: initial.text_theme, fontSize: 32 }}
                    />
                </IconButton>
            </Stack>
        </Stack>
    )
}

