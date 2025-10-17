import { TextField, Autocomplete } from '@mui/material';
import FormatedInput from '../FormatedInput';

export const getSaisieColumnHeader = ({
    editableRow,
    formSaisie,
    formNewParam,
    setInvalidRows,
    invalidRows,
    selectedCell,
    listePlanComptable,
    taux,
    equilibrateDebitCredit,
}) => {
    const columns = [
        {
            field: 'jour',
            headerName: 'Jour',
            type: 'number',
            editable: editableRow,
            sortable: true,
            // width: 60,
            flex: 0.4,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',
            renderEditCell: (params) => {
                const selectedMonth = parseInt(formSaisie.values.valSelectMois);
                const selectedYear = parseInt(formSaisie.values.valSelectAnnee) || new Date().getFullYear();
                const maxDay = (selectedMonth >= 1 && selectedMonth <= 12)
                    ? new Date(selectedYear, selectedMonth, 0).getDate()
                    : 31;

                return (
                    <TextField
                        size="small"
                        type="number"
                        name="jour"
                        fullWidth
                        value={params.value ?? ''}
                        onChange={(event) => {
                            const inputValue = event.target.value;

                            // 1. Suppression totale (champ vide)
                            if (inputValue === '') {
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'jour',
                                    value: '',
                                });

                                formNewParam.setFieldValue('jour', '');

                                // Garde ou ajoute "jour" dans les erreurs si champ vide
                                setInvalidRows((prev) => {
                                    const exists = prev.find(r => r.id === params.id);
                                    if (exists) {
                                        if (!exists.fields.includes('jour')) {
                                            return prev.map(r =>
                                                r.id === params.id ? { ...r, fields: [...r.fields, 'jour'] } : r
                                            );
                                        }
                                        return prev;
                                    } else {
                                        return [...prev, { id: params.id, fields: ['jour'] }];
                                    }
                                });

                                return;
                            }

                            // 2. Conversion en entier
                            const intValue = parseInt(inputValue);

                            // 3. Si valeur valide entre 1 et maxDay
                            if (!isNaN(intValue) && intValue >= 1 && intValue <= maxDay) {
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'jour',
                                    value: intValue,
                                });

                                formNewParam.setFieldValue('jour', intValue);

                                // Supprimer l'erreur "jour" s’il y en avait une
                                setInvalidRows((prev) => {
                                    const row = prev.find(r => r.id === params.id);
                                    if (!row) return prev;

                                    const updatedFields = row.fields.filter(f => f !== 'jour');
                                    if (updatedFields.length === 0) {
                                        return prev.filter(r => r.id !== params.id);
                                    }
                                    return prev.map(r =>
                                        r.id === params.id ? { ...r, fields: updatedFields } : r
                                    );
                                });
                            }
                        }}

                        inputProps={{
                            min: 1,
                            max: maxDay,
                            step: 1,
                        }}
                        sx={{
                            '& input[type=number]': {
                                MozAppearance: 'textfield',
                            },
                            '& input[type=number]::-webkit-outer-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                            '& input[type=number]::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                            textAlign: 'center',
                        }}
                    />
                );
            },
            cellClassName: (params) => {
                const classes = [];

                //Appliquer l'erreur uniquement sur le champ "jour"
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                if (params.field === 'jour' && rowInvalid?.fields.includes('jour')) {
                    classes.push('cell-error');
                }

                //Appliquer la sélection uniquement sur la cellule "jour"
                if (selectedCell.id === params.id && selectedCell.field === 'jour') {
                    classes.push('cell-selected');
                }

                return classes.join(' ');
            },
        }, {
            field: 'compte',
            headerName: 'Compte',
            editable: true,
            // width: 500,
            flex: 0.8,
            renderEditCell: (params) => {
                const options = listePlanComptable.map((pc) => ({
                    label: `${pc.compte} - ${pc.libelle}`,
                    value: pc.id,
                    key: pc.id
                }));

                const currentValue = options.find(opt => opt.value === params.value) || null;
                return (
                    <Autocomplete
                        key={params.id}
                        autoHighlight
                        options={options}
                        getOptionLabel={(option) => option.label}
                        value={currentValue}
                        onChange={(e, newValue) => {
                            const newCompteId = newValue ? newValue.value : null;
                            const libelleAssocie1 = newValue ? newValue.label.split(' - ')[1] : '';

                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'compte',
                                value: newCompteId,
                            }, e);

                            params.api.setEditCellValue(
                                { id: params.id, field: 'libelle', value: libelleAssocie1 },
                                e
                            );

                            formNewParam.setFieldValue('compte', newCompteId);

                            formNewParam.setFieldValue('libelle', libelleAssocie1);

                            if (newCompteId) {
                                setInvalidRows((prevInvalidRows) => {
                                    const row = prevInvalidRows.find(r => r.id === params.id);
                                    if (!row) return prevInvalidRows;

                                    const newFields = row.fields.filter(f => f !== 'compte' && f !== 'libelle');
                                    if (newFields.length === 0) {
                                        return prevInvalidRows.filter(r => r.id !== params.id);
                                    }
                                    return prevInvalidRows.map(r =>
                                        r.id === params.id ? { ...r, fields: newFields } : r
                                    );
                                });
                            }
                        }}
                        noOptionsText="Aucun compte trouvé"
                        renderInput={(paramsInput) => (
                            <TextField
                                {...paramsInput}
                                variant="standard"
                                placeholder="Choisir un compte"
                                fullWidth
                                InputProps={{
                                    ...paramsInput.InputProps,
                                    disableUnderline: true,
                                }}
                                style={{ width: 500 }}
                            />
                        )}
                    />
                );
            },
            cellClassName: (params) => {
                const classes = [];

                const rowInvalid = invalidRows.find(row => row.id === params.id);
                const compte = Number(params.row.compte) || null;

                if (rowInvalid && rowInvalid.fields.includes('compte')) {
                    classes.push('cell-error');
                }

                if (selectedCell.id === params.id && selectedCell.field === 'compte') {
                    classes.push('cell-selected');
                }

                return classes.join(' ');
            },
            renderCell: (params) => {
                const pc = listePlanComptable.find((item) => item.id === params.value);

                if (!pc) return params.value || '';

                return `${pc.compte}`;
            },
        },
        {
            field: 'piece',
            headerName: 'Pièce',
            type: 'string',
            sortable: true,
            editable: true,
            flex: 1.3,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',

            renderEditCell: (params) => {
                return (
                    <TextField
                        variant="standard"
                        defaultValue={params.value}
                        fullWidth
                        InputProps={{
                            disableUnderline: true,
                        }}
                        sx={{
                            backgroundColor: 'white',
                            border: 'none',
                            outline: 'none',
                            '& input': {
                                padding: '4px 8px',
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '& input:focus': {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '&.Mui-focused': {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '& .MuiInput-root:before, & .MuiInput-root:after': {
                                borderBottom: 'none !important',
                            },
                        }}
                        onChange={(e) => {
                            const value = e.target.value;

                            // Met à jour la valeur dans la table
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'piece',
                                value: value,
                            }, e);

                            formNewParam.setFieldValue('piece', value);

                            //Met à jour les erreurs
                            setInvalidRows((prev) => {
                                const row = prev.find(r => r.id === params.id);

                                if (value.trim() === '') {
                                    // Ajoute l’erreur si champ vide
                                    if (row) {
                                        if (!row.fields.includes('piece')) {
                                            return prev.map(r =>
                                                r.id === params.id ? { ...r, fields: [...r.fields, 'piece'] } : r
                                            );
                                        }
                                        return prev;
                                    } else {
                                        return [...prev, { id: params.id, fields: ['piece'] }];
                                    }
                                } else {
                                    // Supprime l’erreur si valeur valide
                                    if (!row) return prev;

                                    const updatedFields = row.fields.filter(f => f !== 'piece');
                                    if (updatedFields.length === 0) {
                                        return prev.filter(r => r.id !== params.id);
                                    }

                                    return prev.map(r =>
                                        r.id === params.id ? { ...r, fields: updatedFields } : r
                                    );
                                }
                            });
                        }}
                    />
                );
            },

            cellClassName: (params) => {
                const classes = [];

                // const rowInvalid = invalidRows.find(row => row.id === params.id);
                // if (params.field === 'piece' && rowInvalid?.fields.includes('piece')) {
                //     classes.push('cell-error');
                // }

                if (selectedCell.id === params.id && selectedCell.field === 'piece') {
                    classes.push('cell-selected');
                }

                return classes.join(' ');
            },
        }, {
            field: 'libelle',
            headerName: 'Libellé',
            type: 'string',
            sortable: true,
            editable: true,
            flex: 1.35,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',

            renderEditCell: (params) => {
                return (
                    <TextField
                        variant="standard"
                        defaultValue={params.value}
                        fullWidth
                        InputProps={{
                            disableUnderline: true, //Supprimer le soulignement noir par défaut
                        }}
                        sx={{
                            backgroundColor: 'white',
                            border: 'none',
                            outline: 'none',
                            '& input': {
                                padding: '4px 8px',
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '& input:focus': {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '& input:focus-visible': {
                                outline: 'none !important',
                            },
                            '&.Mui-focused': {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '& .MuiInput-root:before, & .MuiInput-root:after': {
                                borderBottom: 'none !important',
                            },
                        }}


                        onChange={(e) => {
                            const value = e.target.value;

                            //Met à jour la valeur dans la table
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'libelle',
                                value: value,
                            }, e);

                            formNewParam.setFieldValue('libelle', value);

                            // Mise à jour dynamique des erreurs
                            setInvalidRows((prev) => {
                                const row = prev.find(r => r.id === params.id);

                                if (value.trim() === '') {
                                    // Ajoute l’erreur si vide
                                    if (row) {
                                        if (!row.fields.includes('libelle')) {
                                            return prev.map(r =>
                                                r.id === params.id
                                                    ? { ...r, fields: [...r.fields, 'libelle'] }
                                                    : r
                                            );
                                        }
                                        return prev;
                                    } else {
                                        return [...prev, { id: params.id, fields: ['libelle'] }];
                                    }
                                } else {
                                    // Supprime l’erreur si rempli
                                    if (!row) return prev;

                                    const updatedFields = row.fields.filter(f => f !== 'libelle');
                                    if (updatedFields.length === 0) {
                                        return prev.filter(r => r.id !== params.id);
                                    }

                                    return prev.map(r =>
                                        r.id === params.id
                                            ? { ...r, fields: updatedFields }
                                            : r
                                    );
                                }
                            });
                        }}
                    />
                );
            },
            cellClassName: (params) => {
                const classes = [];

                const rowInvalid = invalidRows.find(row => row.id === params.id);
                if (params.field === 'libelle' && rowInvalid?.fields.includes('libelle')) {
                    classes.push('cell-error');
                }

                if (selectedCell.id === params.id && selectedCell.field === 'libelle') {
                    classes.push('cell-selected');
                }

                return classes.join(' ');
            }
        },
        {
            field: 'num_facture',
            headerName: 'N° Facture',
            type: 'string',
            sortable: true,
            editable: true,
            flex: 1.3,
            headerAlign: 'left',
            align: 'left',
            headerClassName: 'HeaderbackColor',

            renderEditCell: (params) => {
                return (
                    <TextField
                        variant="standard"
                        defaultValue={params.value}
                        fullWidth
                        InputProps={{
                            disableUnderline: true,
                        }}
                        sx={{
                            backgroundColor: 'white',
                            border: 'none',
                            outline: 'none',
                            '& input': {
                                padding: '4px 8px',
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '& input:focus': {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '&.Mui-focused': {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '& .MuiInput-root:before, & .MuiInput-root:after': {
                                borderBottom: 'none !important',
                            },
                        }}
                        onChange={(e) => {
                            const value = e.target.value;

                            // Met à jour la valeur dans la table
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'num_facture',
                                value: value,
                            }, e);

                            formNewParam.setFieldValue('num_facture', value);

                            //Met à jour les erreurs
                            setInvalidRows((prev) => {
                                const row = prev.find(r => r.id === params.id);

                                if (value.trim() === '') {
                                    // Ajoute l’erreur si champ vide
                                    if (row) {
                                        if (!row.fields.includes('num_facture')) {
                                            return prev.map(r =>
                                                r.id === params.id ? { ...r, fields: [...r.fields, 'num_facture'] } : r
                                            );
                                        }
                                        return prev;
                                    } else {
                                        return [...prev, { id: params.id, fields: ['num_facture'] }];
                                    }
                                } else {
                                    // Supprime l’erreur si valeur valide
                                    if (!row) return prev;

                                    const updatedFields = row.fields.filter(f => f !== 'num_facture');
                                    if (updatedFields.length === 0) {
                                        return prev.filter(r => r.id !== params.id);
                                    }

                                    return prev.map(r =>
                                        r.id === params.id ? { ...r, fields: updatedFields } : r
                                    );
                                }
                            });
                        }}
                    />
                );
            },

            cellClassName: (params) => {
                const classes = [];
                if (selectedCell.id === params.id && selectedCell.field === 'num_facture') {
                    classes.push('cell-selected');
                }

                return classes.join(' ');
            },
        }
    ];

    if (formSaisie.values.choixDevise === 'Devises') {
        columns.push({
            field: 'montant_devise',
            headerName: 'Montant en Devise',
            editable: true,
            headerAlign: 'right',
            align: 'right',
            flex: 1.3,
            renderEditCell: (params) => {
                const debit = params.row.debit;
                const credit = params.row.credit;
                return (
                    <TextField
                        size="small"
                        name="montant_devise"
                        fullWidth
                        value={params.value ?? ''}
                        onChange={(event) => {
                            const rawValue = event.target.value ?? '';
                            const cleaned = rawValue.toString().replace(/\s/g, '').replace(',', '.');
                            const numeric = Number(cleaned);

                            if (!isNaN(numeric)) {
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'montant_devise',
                                    value: numeric,
                                }, event);

                                formNewParam.setFieldValue('montant_devise', numeric);

                                const isDebitEmpty = debit === 0 || debit === '' || debit === null || debit === undefined;
                                const isCreditEmpty = credit === 0 || credit === '' || credit === null || credit === undefined;
                                if (isDebitEmpty && isCreditEmpty) {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'debit',
                                        value: numeric * taux
                                    })

                                    formNewParam.setFieldValue('debit', numeric * taux);

                                } else if (isDebitEmpty) {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'credit',
                                        value: numeric * taux
                                    })

                                    formNewParam.setFieldValue('credit', numeric * taux);

                                } else if (isCreditEmpty) {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'debit',
                                        value: numeric * taux
                                    })

                                    formNewParam.setFieldValue('debit', numeric * taux);

                                }
                            }
                        }}
                        style={{ marginBottom: '0px', width: '200px', textAlign: 'right' }}
                        InputProps={{
                            inputComponent: FormatedInput,
                            sx: {
                                '& input': { textAlign: 'right' },
                            },
                        }}
                    />
                );
            },
            renderCell: (params) => {
                const raw = params.value;
                // Si vide, affiche 0,00
                const value = raw === undefined || raw === '' ? 0 : Number(raw);

                const formatted = value.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                return formatted.replace(/\u202f/g, ' ');
            },
            cellClassName: (params) => {
                const classes = [];

                const rowInvalid = invalidRows.find(row => row.id === params.id);
                if (params.field === 'montant_devise' && rowInvalid?.fields.includes('montant_devise')) {
                    classes.push('cell-error');
                }

                if (selectedCell.id === params.id && selectedCell.field === 'montant_devise') {
                    classes.push('cell-selected');
                }

                return classes.join(' ');
            }
        });
    }

    columns.push(
        {
            field: 'debit',
            headerName: 'Débit',
            type: 'string',
            sortable: true,
            editable: true,
            // width: 200,
            flex: 1.3,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            renderEditCell: (params) => {
                let localValue = params.formattedValue ?? '';

                return (
                    <TextField
                        size="small"
                        name="debit"
                        fullWidth
                        value={localValue}
                        onChange={(event) => {
                            const inputValue = event.target.value;
                            localValue = inputValue;

                            const cleaned = inputValue.toString().replace(/\s/g, '').replace(',', '.');
                            const numeric = Number(cleaned);

                            if (!isNaN(numeric) && numeric >= 0) {
                                params.api.setEditCellValue(
                                    {
                                        id: params.id,
                                        field: 'debit',
                                        value: numeric,
                                    },
                                    event
                                );

                                formNewParam.setFieldValue('debit', numeric);

                                if (numeric > 0) {
                                    params.api.setEditCellValue(
                                        {
                                            id: params.id,
                                            field: 'credit',
                                            value: '',
                                        },
                                        event
                                    );
                                    formNewParam.setFieldValue('credit', '');
                                }
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.ctrlKey && event.key === 'Enter') {
                                event.preventDefault();
                                equilibrateDebitCredit(params.id, 'debit');
                                formNewParam.setFieldValue('debit', inputValue);
                            }
                        }}
                        style={{ marginBottom: '0px', textAlign: 'right' }}
                        InputProps={{
                            inputComponent: FormatedInput,
                            sx: {
                                '& input': { textAlign: 'right' },
                            },
                        }}
                    />
                );
            },
            renderCell: (params) => {
                const raw = params.value;
                // Si vide, affiche 0,00
                const value = raw === undefined || raw === '' ? 0 : Number(raw);

                const formatted = value.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                return formatted.replace(/\u202f/g, ' ');
            },
            cellClassName: (params) => {
                const classes = [];

                //Gestion des erreurs
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                const debit = Number(params.row.debit) || 0;
                const credit = Number(params.row.credit) || 0;

                if (rowInvalid && debit === 0 && credit === 0 && rowInvalid.fields.includes('debit')) {
                    classes.push('cell-error');
                }

                //Mise en surbrillance de la cellule sélectionnée
                if (selectedCell.id === params.id && selectedCell.field === 'debit') {
                    classes.push('cell-selected');
                }

                return classes.join(' ');
            }

        }
        , {
            field: 'credit',
            headerName: 'Crédit',
            type: 'string',
            sortable: true,
            editable: true,
            // width: 200,
            flex: 1.3,
            headerAlign: 'right',
            align: 'right',
            headerClassName: 'HeaderbackColor',
            renderEditCell: (params) => {
                let localValue = params.formattedValue ?? '';
                return (
                    <TextField
                        size="small"
                        name="credit"
                        fullWidth
                        value={localValue}
                        onChange={(event) => {
                            const inputValue = event.target.value;
                            localValue = inputValue;

                            if (Number(inputValue) >= 0 || isNaN(inputValue)) {
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: 'credit',
                                    value: inputValue,
                                }, event);
                                formNewParam.setFieldValue('credit', inputValue);

                                const rawValue = inputValue ?? '';
                                const cleaned = rawValue.toString().replace(/\s/g, '').replace(',', '.');
                                const numeric = Number(cleaned);

                                if (!isNaN(numeric) && numeric > 0) {
                                    params.api.setEditCellValue({
                                        id: params.id,
                                        field: 'debit',
                                        value: '',
                                    }, event);
                                    formNewParam.setFieldValue('debit', '');
                                }
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.ctrlKey && event.key === 'Enter') {
                                event.preventDefault();
                                equilibrateDebitCredit(params.id, 'credit');
                                // params.api.setEditCellValue({
                                //     id: params.id,
                                //     field: 'credit',
                                //     value: 6666,
                                // }, event);
                                formNewParam.setFieldValue('credit', inputValue);
                            }
                        }}
                        style={{ marginBottom: '0px', textAlign: 'right' }}
                        InputProps={{
                            inputComponent: FormatedInput,
                            sx: {
                                '& input': { textAlign: 'right' },
                            },
                        }}
                    />
                );
            },
            renderCell: (params) => {
                const raw = params.value;
                // Si vide, affiche 0,00
                const value = raw === undefined || raw === '' ? 0 : Number(raw);

                const formatted = value.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                return formatted.replace(/\u202f/g, ' ');
            },
            cellClassName: (params) => {
                const classes = [];

                //Gestion des erreurs
                const rowInvalid = invalidRows.find(row => row.id === params.id);
                const debit = Number(params.row.debit) || 0;
                const credit = Number(params.row.credit) || 0;

                if (rowInvalid && credit === 0 && debit === 0 && rowInvalid.fields.includes('credit')) {
                    classes.push('cell-error');
                }

                // Mise en surbrillance de la cellule sélectionnée
                if (selectedCell.id === params.id && selectedCell.field === 'credit') {
                    classes.push('cell-selected');
                }

                return classes.join(' ');
            }
        },
    );
    return columns;
}