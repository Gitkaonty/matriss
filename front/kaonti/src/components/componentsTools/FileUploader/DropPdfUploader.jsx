import React, { useState, useCallback, useEffect } from 'react';
import {
    Box, Typography, Paper, Link, Button, Stack,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { URL } from '../../../../config/axios';
import { init } from '../../../../init';

const DropPDFUploader = ({ file, setFile, mode }) => {
    const [dragActive, setDragActive] = useState(false);
    const [remoteFileSize, setRemoteFileSize] = useState(null);
    let initial = init[0];

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    }, [setFile]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        if (mode === 'modification' && typeof file === 'string') {
            fetch(`${URL}/${file}`, { method: 'HEAD' })
                .then(res => {
                    const size = res.headers.get("Content-Length");
                    if (size) setRemoteFileSize((size / 1024).toFixed(2));
                })
                .catch(() => setRemoteFileSize(null));
        }
    }, [file, mode]);

    const fileName = typeof file === 'string'
        ? file.split('/').pop()
        : file?.name;

    const fileSize = typeof file === 'string'
        ? remoteFileSize
        : file ? (file.size / 1024).toFixed(2) : null;

    return (
        <Box sx={{ maxWidth: 600, mt: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="start">
                <Paper
                    elevation={dragActive ? 6 : 2}
                    onDrop={handleDrop}
                    onDragOver={handleDrag}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onClick={() => document.getElementById('fileInput').click()}
                    sx={{
                        flex: 1.5,
                        border: '2px dashed',
                        borderColor: dragActive ? 'primary.main' : 'grey.400',
                        borderRadius: 2,
                        p: 3,
                        height: 150,
                        textAlign: 'center',
                        bgcolor: dragActive ? 'primary.light' : 'grey.100',
                        cursor: 'pointer',
                        transition: '0.2s',
                    }}
                >
                    <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Typography variant="body1" mt={2}>
                        {fileName || 'Glissez un fichier ici ou cliquez pour importer'}
                    </Typography>
                    <input
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        hidden
                    />
                </Paper>

                <Stack spacing={1} justifyContent="space-between" sx={{ flex: 1}}>
                    {(fileName || fileSize) && (
                        <Box>
                            {fileName && (
                                <Typography variant="body2">
                                    <strong>Nom :</strong> {fileName}
                                </Typography>
                            )}
                            {fileSize && (
                                <Typography variant="body2">
                                    <strong>Taille :</strong> {fileSize} KB
                                </Typography>
                            )}
                            {mode === 'modification' && typeof file === 'string' && (
                                <Button
                                    autoFocus
                                    variant="contained"
                                    style={{
                                        marginTop: 4,
                                        textTransform: 'none',
                                        outline: 'none',
                                        backgroundColor: initial.theme,
                                        color: "white",
                                    }}
                                    href={`${URL}/${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                // startIcon={<UploadFileIcon />}
                                >
                                    Voir le fichier
                                </Button>
                            )}
                        </Box>
                    )}

                    {file && (
                        <Button
                            autoFocus
                            variant="contained"
                            style={{
                                textTransform: 'none',
                                outline: 'none',
                                backgroundColor: initial.button_delete_color,
                                color: "white",
                            }}
                            onClick={() => setFile(null)}
                            sx={{ mt: 1, textTransform: 'none', alignSelf: 'start' }}
                        >
                            Supprimer le fichier
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

export default DropPDFUploader;
