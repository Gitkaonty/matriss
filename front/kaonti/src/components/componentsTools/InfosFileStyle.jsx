import { Stack } from "@mui/material";
import Chip from '@mui/material/Chip';
import { FaFolderOpen } from "react-icons/fa";

export const InfoFileStyle = (fileName) => {
  return (
    <Stack >
      <Chip
        icon={<FaFolderOpen style={{ color: 'white', width: 20, height: 20, marginLeft: 10 }} />}
        label={fileName}

        style={{
          width: "100%",
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#67AE6E',
          color: 'white'
        }}
      />
    </Stack>
  );
}
