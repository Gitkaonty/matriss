import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react'
import { CiExport } from 'react-icons/ci';
import { FaFilePdf } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";

const ExportDComButton = ({ exportToExcel, exportToPdf, value }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    return (
        <>
            <Tooltip title={`Exporter ${value}`}>
                <IconButton
                    onClick={handleOpen}
                    variant="contained"
                    style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "2px",
                        border: "2px solid #D32F2F",
                        backgroundColor: "transparent",
                        textTransform: "none",
                        outline: "none",
                    }}
                >
                    <CiExport style={{ width: 25, height: 25, color: "#D32F2F" }} />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableScrollLock={true}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    mt: 1,
                }}
            >
                <MenuItem
                    onClick={() => {
                        exportToPdf();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <FaFilePdf size={20} color="#D32F2F" />
                    </ListItemIcon>
                    <ListItemText primary={`Exporter en PDF`} />
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        exportToExcel();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <FaFileExcel size={20} color="#2E7D32" />
                    </ListItemIcon>
                    <ListItemText primary={`Exporter en Excel`} />
                </MenuItem>
            </Menu>
        </>
    )
}

export default ExportDComButton