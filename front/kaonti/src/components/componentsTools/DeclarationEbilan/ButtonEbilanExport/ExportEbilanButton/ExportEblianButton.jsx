import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react'
import { CiExport } from 'react-icons/ci';
import { FaFilePdf } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";

const ExportEbilanButton = ({ exportToExcel, exportToPdf, value }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    let libelle = "";
    if (value === "4") {
        libelle = "BILAN";
    } else if (value === "5") {
        libelle = "CRN";
    } else if (value === "6") {
        libelle = "CRF";
    } else if (value === "7") {
        libelle = "TFTD";
    } else if (value === "8") {
        libelle = "TFTI";
    } else if (value === "9") {
        libelle = "EVCP";
    } else if (value === "10") {
        libelle = "DRF";
    } else if (value === "11") {
        libelle = "BHIAPC";
    } else if (value === "12") {
        libelle = "MP";
    } else if (value === "13") {
        libelle = "DA";
    } else if (value === "14") {
        libelle = "DP";
    } else if (value === "15") {
        libelle = "EIAFNC";
    } else if (value === "16") {
        libelle = "SAD";
    } else if (value === "17") {
        libelle = "SDR";
    } else if (value === "18") {
        libelle = "SE";
    } else if (value === "19") {
        libelle = "NE";
    }
    return (
        <>
            <Tooltip title={`Exporter ${libelle}`}>
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

export default ExportEbilanButton