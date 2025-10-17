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
    color
}) => {

    const IconVariation = () => {
        if (evolution === 'augmentation') {
            return <FiTrendingUp size={30} color='green' />;
        }
        if (evolution === 'diminution') {
            return <FiTrendingDown size={30} color='red' />;
        }
        return <FiMinus size={30} color='gray' />;
    };

    const formatePourcentage = (value, varType) => {
        if (!value) return `0.00 %`;
        const formatted = parseFloat(value).toFixed(2);
        return (varType === 'augmentation' ? formatted : -1 * formatted) + ' %';
    };

    const formatMontant = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '-';
        return num.toLocaleString('fr-FR') + ' MGA';
    };

    return (
        <>
            {
                type === 'total' && (
                    <>
                        <Typography variant="h6" fontWeight={750}>
                            {text}
                        </Typography>
                        <Typography variant="h5" fontWeight={800}>
                            {formatMontant(montant)}
                        </Typography>
                        <Typography variant="h5" color={'#6d645dff'} fontWeight={800}>
                            {formatMontant(montantN1)}
                        </Typography>
                    </>
                )
            }

            {type !== 'total' && (
                <>
                    <Typography variant="h6" color={color} fontWeight={750}>
                        {text}
                    </Typography>
                    <Typography variant="h5" color={color} fontWeight={800}>
                        {formatMontant(montant)}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconVariation />
                        <Typography variant="h5" color={color} fontWeight={600}>
                            {formatePourcentage(variation, evolution)}
                        </Typography>
                    </Stack>
                    <Typography variant="subtitle1" color={color} fontWeight={600}>
                        {exercice}
                    </Typography>
                </>
            )}
        </>
    )
}

export default TextCard;