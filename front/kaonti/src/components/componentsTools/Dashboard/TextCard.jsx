import { Stack, Typography } from "@mui/material";
import { FiTrendingDown, FiTrendingUp, FiMinus } from "react-icons/fi";

const TextCard = ({
    text,
    montant,
    montantN1,
    type,
    variation,
    exercice,
    evolution,
    color,
    devise
}) => {

    const IconVariation = () => {
        if (evolution === 'augmentation') {
            return <FiTrendingUp size={30} color='#0dba2a' />;
        }
        if (evolution === 'diminution') {
            return <FiTrendingDown size={30} color='#ba210d' />;
        }
        return <FiMinus size={30} color='#a3b8b7' />;
    };

    const formatePourcentage = (value, varType) => {
        if (!value) return `0.00 %`;
        const formatted = parseFloat(value).toFixed(2);
        return (varType === 'augmentation' ? formatted : -1 * formatted) + ' %';
    };

    const formatMontant = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '-';
        return num.toLocaleString('fr-FR') + ` ${devise}`;
    };

    return (
        <>
            <Typography variant="h6" color={color} fontWeight={750}>
                {text}
            </Typography>
            <Typography fontSize={'18px'} color={color} textAlign={'right'} sx={{ width: '100%' }} fontWeight={500}>
                {formatMontant(montant)}
            </Typography>
            <Stack
                direction="row"
                alignItems="end"
                justifyContent="flex-end"
                sx={{ width: '100%' }}
                spacing={1}
            >
                <IconVariation />
                <Typography variant="h5" color={color} fontWeight={500}>
                    {formatePourcentage(variation, evolution)}
                </Typography>
            </Stack>
            <Typography fontSize={'18px'} color={color} fontWeight={600}>
                {exercice}
            </Typography>
        </>
    )
}

export default TextCard;