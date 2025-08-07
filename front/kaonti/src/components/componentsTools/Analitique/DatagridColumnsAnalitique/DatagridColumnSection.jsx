import { Checkbox } from '@mui/material';

const getSectionColumns = ({ onParDefautChange, onFermerChange }) => ([
    {
        field: 'section',
        headerName: 'Section',
        flex: 0.5,
        editable: true,
        sortable: true,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'intitule',
        headerName: 'Intitulé',
        flex: 1,
        editable: true,
        sortable: true,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'compte',
        headerName: 'Comptes',
        flex: 1,
        editable: true,
        sortable: true,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'pourcentage',
        headerName: 'Pourcentage',
        type: 'number',
        flex: 0.4,
        editable: true,
        sortable: true,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'HeaderbackColor',

        valueFormatter: (params) => {
            const value = parseFloat(params.value);
            return isNaN(value) ? '' : `${value.toFixed(1)}%`;
        },

        preProcessEditCellProps: (params) => {
            const raw = params.props.value;
            const isValidFormat = /^(\d{1,3})(\.\d{0,1})?$/.test(raw);
            const parsed = parseFloat(raw);
            const isValidValue = !isNaN(parsed) && parsed >= 0 && parsed <= 100;

            return {
                ...params.props,
                error: !(isValidFormat && isValidValue),
            };
        },

        renderEditCell: (params) => (
            <input
                type="number"
                value={params.value ?? ''}
                step="0.1"
                min={0}
                max={100}
                onChange={(e) => {
                    const newValue = e.target.value;
                    params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue }, e);
                }}
                onBlur={() => params.api.stopCellEditMode({ id: params.id, field: params.field })}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    paddingLeft: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    color: '#000',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                }}
            />
        )
    },
    {
        field: 'par_defaut',
        headerName: 'Par défaut',
        flex: 0.3,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => (
            <Checkbox
                checked={params.value === true}
                onChange={(e) => {
                    onParDefautChange(params.id, e.target.checked);
                }}
            />
        ),
    },
    {
        field: 'fermer',
        headerName: 'Fermer',
        flex: 0.3,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => (
            <Checkbox
                checked={params.value === true}
                onChange={(e) => {
                    onFermerChange(params.id, e.target.checked);
                }}
            />
        ),
    },
]);

export default getSectionColumns;
