import { Stack, Typography } from '@mui/material';
import { init } from '../../../../../../init';

const initial = init[0];

const ImportCard = ({ icon: Icon, label, iconStyle = {}, children, sx = {}, sxTypo = {}, onClick }) => (
    <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={onClick}
        sx={{
            border: `2px dashed ${initial.theme}`,
            px: 3,
            py: 1,
            color: initial.theme,
            borderRadius: 1,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            width: 'fit-content',
            minWidth: 200,
            '&:hover': { opacity: 0.95 },
            ...sx,
        }}
    >
        <Typography sx={{ ...sxTypo, fontSize: '15px' }}>{label}</Typography>
        <Icon sx={{ fontSize: 25, ...iconStyle }} />
        {children}
    </Stack>
);

export default ImportCard