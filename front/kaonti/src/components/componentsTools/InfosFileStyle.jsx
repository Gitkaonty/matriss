import React from "react";
import { Stack, Typography } from "@mui/material";
import { FaCircle } from "react-icons/fa";
import Chip from '@mui/material/Chip';
import { FaFolderOpen } from "react-icons/fa";

export const InfoFileStyle = (fileName) => {
    return (
        <Stack direction={'row'} alignContent={'center'} alignItems={"center"} spacing={1}>
          <Chip 
            icon={<FaFolderOpen style={{color: 'white', width: 20, height:20, marginLeft:10}}/>} 
            label={fileName}
            
            style={{
              width: "100%",
              display: 'flex', // ou block, selon le rendu souhaité
              justifyContent: 'space-between',
              backgroundColor: '#67AE6E',
              color:'white'
            }}
          />
          
          {/* <Typography variant='h7'
            align='left'
          >
              {fileName}
          </Typography> */}
        </Stack>
      );
}
