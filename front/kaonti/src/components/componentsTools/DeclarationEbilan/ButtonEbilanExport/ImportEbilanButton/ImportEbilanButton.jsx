import { IconButton, Tooltip } from '@mui/material'
import React from 'react'
import { CiImport } from "react-icons/ci";

const ImportEbilanButton = ({ verouillage, handleShowPopupImport }) => {
    return (
        <Tooltip title="Importer des données">
            <IconButton
                onClick={handleShowPopupImport}
                variant="contained"
                style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "2px",
                    border: "2px solid rgba(5,96,116,0.60)",
                    backgroundColor: "transparent",
                    textTransform: "none",
                    outline: "none",
                    display: verouillage ? 'none' : 'inline-flex',
                }}
            >
                <CiImport style={{ width: '25px', height: '25px', color: 'rgba(5,96,116,0.60)' }} />
            </IconButton>
        </Tooltip>
    )
}

export default ImportEbilanButton