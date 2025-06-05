
import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Stack, Button } from '@mui/material';
import { Clear } from '@mui/icons-material';

export default function SubMenuHeader({caption ,openWindow}){

    const openSubMenu = () => {
        openWindow(false);
    }
    
    return (
        <Stack marginTop={"50px"} marginBottom={"50px"} width={"100%"} height={"30px"} spacing={2} alignItems={"flex-start"} direction={"row"}>
            <Stack alignItems={"flex-start"} width={"100%"} >
            <Typography variant='h5' marginLeft={"20px"} color={"white"}>{caption}</Typography>
            </Stack>

            <Stack alignItems={"flex-end"} width={"500px"} paddingRight={"50px"}>
            <Button onClick={openSubMenu} variant='text' style={{borderCollapse:"collapse"}}>
                <Clear style={{color:"white", width:"30px", height: "30px"}}/>
            </Button>
        </Stack>
    </Stack>
    )
}

