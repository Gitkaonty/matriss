import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    Button,
    Box,
    Typography,
    IconButton,
    FormLabel,
    FormControlLabel,
    RadioGroup,
    Radio,
    Stack,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import { init } from "../../../../../init";

import DatagridHistoriqueISI from "../DatagridComponents/Datagrid/DatagridHistoriqueISI";
import DatagridColumnsHistoriqueISI from "../DatagridHeaders/DatagridColumnsHistoriqueISI";

import { TbFileTypePdf } from "react-icons/tb";
import { TbFileTypeXml } from "react-icons/tb";
import { TbFileTypeCsv } from "react-icons/tb";

import axios from "../../../../../config/axios";
import { URL } from "../../../../../config/axios";

const initial = init[0];
const DATAGRID_HEIGHT = "490px"

const PopupExportIsi = ({ open, onClose, compteId, fileId, selectedExerciceId, valSelectMois, valSelectAnnee, historiqueIsi, handleRefresheHistorique, setHistoriqueIsi }) => {
    const [selectedHisto, setSelectedHisto] = useState('XML');

    const Icon = selectedHisto === 'XML' ? <TbFileTypeXml size={20} />
        : selectedHisto === 'PDF' ? <TbFileTypePdf size={20} />
            : selectedHisto === 'EXCEL' ? <TbFileTypeCsv size={20} /> : null

    const handleExport = async () => {
        try {
            let endpoint = "";
            let fileName = "";

            if (selectedHisto === 'PDF') {
                window.open(
                    `${URL}/declaration/isi/exportISIToPDF/${compteId}/${fileId}/${selectedExerciceId}/${valSelectMois}/${valSelectAnnee}`,
                    "_blank"
                );
                return
            }

            if (selectedHisto === "XML") {
                endpoint = `${URL}/declaration/isi/exportISIToXml/${compteId}/${fileId}/${selectedExerciceId}/${valSelectMois}/${valSelectAnnee}`;
                fileName = `ISI_${valSelectAnnee}_${valSelectMois}.xml`;
            } else if (selectedHisto === "EXCEL") {
                endpoint = `${URL}/declaration/isi/exportISIToExcel/${compteId}/${fileId}/${selectedExerciceId}/${valSelectMois}/${valSelectAnnee}`;
                fileName = `ISI_${valSelectAnnee}_${valSelectMois}.xlsx`;
            }

            if (!endpoint) return;

            const response = await axios.get(endpoint, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            handleRefresheHistorique();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'export");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            // maxWidth={alignment === 'PDF' || alignment === 'EXCEL' ? 'sm' : 'md'}
            PaperProps={{
                sx: {
                    // width: selectedHisto === 'PDF' || selectedHisto === 'EXCEL' ? 400 : 1000,
                    width: 1000,
                    maxWidth: '95%',
                    // ...(selectedHisto !== 'PDF' && selectedHisto !== 'EXCEL' && { height: 650 }),
                    height: 685
                },
            }}
            height="550px"
            fullWidth
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #ccc',
                }}
            >
                <Typography variant="h6">Exporter ISI</Typography>
                <IconButton
                    onClick={onClose}
                    style={{
                        color: 'red',
                        textTransform: 'none',
                        outline: 'none'
                    }}
                    size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent>
                <FormLabel component="legend">Afficher l'historique</FormLabel>
                <Stack width="100%" direction="row" alignItems="start" justifyContent="space-between">
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <RadioGroup
                            row
                            aria-label="historique"
                            name="historique-radio-group"
                            sx={{ gap: 1, width: '100%', display: 'flex', alignItems: 'center' }}
                            value={selectedHisto}
                            onChange={e => setSelectedHisto(e.target.value)}
                        >
                            <FormControlLabel
                                value="XML"
                                control={<Radio size="small" />}
                                label="XML"
                                sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' }, mr: 1 }}
                            />
                            <FormControlLabel
                                value="PDF"
                                control={<Radio size="small" />}
                                label="PDF"
                                sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' }, mr: 1 }}
                            />
                            <FormControlLabel
                                value="EXCEL"
                                control={<Radio size="small" />}
                                label="EXCEL"
                                sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
                            />
                        </RadioGroup>
                    </Box>

                    <Box sx={{ ml: 2 }}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleExport}
                            style={{ textTransform: 'none', outline: 'none' }}
                            startIcon={Icon}
                        >
                            Exporter
                        </Button>
                    </Box>
                </Stack>
                {
                    selectedHisto === 'PDF' || selectedHisto === 'EXCEL'
                        ? null
                        : <DatagridHistoriqueISI
                            columns={DatagridColumnsHistoriqueISI}
                            rows={historiqueIsi}
                            DATAGRID_HEIGHT={DATAGRID_HEIGHT}
                            setHistoriqueIsi={setHistoriqueIsi}
                        />
                }
            </DialogContent>
        </Dialog >
    )
}

export default PopupExportIsi