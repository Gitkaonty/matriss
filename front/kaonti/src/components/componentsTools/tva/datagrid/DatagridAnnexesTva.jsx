import React from 'react';
import { Box, Stack, Button, Tooltip } from '@mui/material';
import { init } from '../../../../../init.js';
import VirtualTableTVA from '../../DeclarationEbilan/virtualTableTVA';
import { MdOutlineAutoMode } from 'react-icons/md';

const initial = init[0];

export default function DatagridAnnexesTva({
  rows = [],
  columns = [],
  selectedRowId = [],
  setSelectedRowId = () => {},
  setDisableModifyBouton = () => {},
  setDisableDeleteBouton = () => {},
  height = '55vh',
  onGenerate = () => {},
  onEditRow = null,
  onDeleteRow = null,
}) {
  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <Stack width="100%" height="100%">
      {/* Bouton Générer en haut */}
      <Stack
        width="100%"
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={0.5}
        sx={{ mb: 1, pr: 1 }}
      >
        <Tooltip title="Générer les annexes">
          <Button
            variant="contained"
            style={{
              textTransform: 'none',
              outline: 'none',
              backgroundColor: '#3bbc24ff',
              color: 'white',
              height: '39px',
            }}
            startIcon={<MdOutlineAutoMode size={20} />}
            onClick={handleGenerate}
          >
            Générer
          </Button>
        </Tooltip>
      </Stack>

      {/* VirtualTable */}
      <Box sx={{ height, width: '100%' }}>
        <VirtualTableTVA
          columns={columns}
          rows={rows.map(r => ({
            ...r,
            onEdit: onEditRow,
            onDelete: onDeleteRow,
          }))}
          onDeleteRow={onDeleteRow}
        />
      </Box>
    </Stack>
  );
}
