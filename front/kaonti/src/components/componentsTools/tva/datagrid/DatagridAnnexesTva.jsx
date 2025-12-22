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
  const formatNumberFrs = (n) => {
    if (n === null || n === undefined || n === '') return '';
    const num = Number(n);
    if (!isFinite(num)) return String(n);
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  };

  const formatSmartNumber = (v, id = '', label = '') => {
    if (v === null || v === undefined || v === '') return '';
    const num = Number(v);
    if (!isFinite(num)) return String(v);
    const lcId = String(id || '').toLowerCase();
    const lcLabel = String(label || '').toLowerCase();
    // month detection: explicit id/label or integer 1-12
    const isMonth = /(^|[^a-z0-9])(mois|month)([^a-z0-9]|$)/i.test(lcId) || /(^|[^a-z0-9])(mois|month)([^a-z0-9]|$)/i.test(lcLabel) || (Number.isInteger(num) && num >= 1 && num <= 12);
    if (isMonth) return String(num);
    // year detection: explicit id/label or integer 1900-2100
    const isYear = /(^|[^a-z0-9])(annee|année|year)([^a-z0-9]|$)/i.test(lcId) || /(^|[^a-z0-9])(annee|année|year)([^a-z0-9]|$)/i.test(lcLabel) || (Number.isInteger(num) && num >= 1900 && num <= 2100);
    if (isYear) return String(num);
    return formatNumberFrs(num);
  };

  const formatDateDMY = (val) => {
    if (!val) return '';
    const d = (val instanceof Date) ? val : new Date(String(val));
    if (!(d instanceof Date) || isNaN(d.getTime())) return String(val);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Inject default formatters for numeric and date-like columns when not provided
  const columnsWithFormat = (columns || []).map(col => {
    if (col.format) return col;
    const id = String(col.id || '').toLowerCase();
    const label = String(col.label || '').toLowerCase();
    // Do not format month/year columns (check id OR label, handle accents)
    const isMonthYear = /(^|[^a-z0-9])(mois|annee|année|year|month)([^a-z0-9]|$)/i.test(id) || /(^|[^a-z0-9])(mois|annee|année|year|month)([^a-z0-9]|$)/i.test(label);
    if (isMonthYear) return { ...col, format: (v) => (v === null || v === undefined ? '' : String(v)) };
    // numeric-like ids
    if (/^(debit|credit|montant|montant_ht|vnc|total|amount|prix|solde)/.test(id)) {
      return { ...col, format: (v) => formatSmartNumber(v, id, label) };
    }
    // date-like ids
    if (/^(date|dateecriture|piecedate|date_facture|date_mise_service)/.test(id)) {
      return { ...col, format: (v) => formatDateDMY(v) };
    }
    return col;
  });
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
          columns={columnsWithFormat}
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
